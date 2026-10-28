'use strict';
// Offline-only structural/pre-billable audit of the EXACT existing
// GPT-4.1 first-chapter envelope. No API/network, no secrets, no charge.
// Official strict-output constraints and public GPT-4.1 rates checked
// 2026-10-28; live provider acceptance remains UNKNOWN.
const crypto=require('node:crypto');
const capture=require('./report-core-paid-full-prompt-capture').capture;
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const preflight=require('./report-provider-preflight');
const audit=require('./report-instruction-audit');
const projection=require('./report-paid-core-v2-provider-projection');
const plan=require('./report-paid-batch-plan');
const schemaSource=require('./report-schema.json');
const readiness=require('./report-paid-core-v2-billable-readiness');
const CLAIM_FLAG='offline-preview';
const MODEL='gpt-4.1';
const PUBLIC_RATES=Object.freeze({inputUSDPerMillion:2,outputUSDPerMillion:8,
 source:'https://developers.openai.com/api/docs/models/gpt-4.1',
 checkedOn:'2026-10-28'});
const SCHEMA_POLICY='https://developers.openai.com/api/docs/guides/structured-outputs';
const banned=new Set(['allOf','not','if','then','else','dependentRequired',
 'dependentSchemas','patternProperties','unevaluatedProperties','additionalItems',
 'contains','uniqueItems']);
function clean(value){
 if(Array.isArray(value))return value.map(clean);
 if(!value||typeof value!=='object')return value;
 return Object.fromEntries(Object.entries(value)
  .filter(([k,v])=>!['$schema','minLength','maxLength','minItems',
   'maxItems','minimum','maximum','pattern','format'].includes(k)&&
   !(k==='title'&&typeof v==='string'))
  .map(([k,v])=>[k,clean(v)]));
}
function hash(value){return crypto.createHash('sha256')
 .update(JSON.stringify(value)).digest('hex')}
function checkStrictSchema(schema){
 const findings=[],stats={objects:0,properties:0,maxDepth:0,enumValues:0,
  schemaNameAndEnumCharacters:0,arrays:0};
 function record(text){if(!findings.includes(text))findings.push(text)}
 function inspect(node,path,depth){
  if(!node||typeof node!=='object'||Array.isArray(node)){
   record('invalid-schema-node:'+path);return;
  }
  if(depth>10)record('schema-nesting-exceeds-ten:'+path);
  stats.maxDepth=Math.max(stats.maxDepth,depth);
  for(const key of Object.keys(node))if(banned.has(key))
   record('unsupported-keyword:'+path+'/'+key);
  const kinds=Array.isArray(node.type)?node.type:[node.type];
  const allowed=new Set(['object','array','string','integer','number',
   'boolean','null']);
  if(node.type!==undefined&&kinds.some(k=>!allowed.has(k)))
   record('unsupported-type:'+path);
  if(node.enum){
   if(!Array.isArray(node.enum)||!node.enum.length)
    record('bad-enum:'+path);
   else{
    stats.enumValues+=node.enum.length;
    stats.schemaNameAndEnumCharacters+=node.enum.reduce((n,s)=>n+
     (typeof s==='string'?s.length:0),0);
    if(node.enum.length>250&&node.enum.filter(x=>typeof x==='string')
      .reduce((n,x)=>n+x.length,0)>15000)
     record('enum-string-budget-exceeded:'+path);
   }
  }
  if(node.const!==undefined&&typeof node.const==='string')
   stats.schemaNameAndEnumCharacters+=node.const.length;
  if(kinds.includes('object')||node.properties){
   stats.objects++;
   if(node.additionalProperties!==false)
    record('object-missing-additionalProperties-false:'+path);
   if(!node.properties||typeof node.properties!=='object'||
      Array.isArray(node.properties))
    record('object-missing-properties:'+path);
   const props=node.properties||{};
   const names=Object.keys(props);
   stats.properties+=names.length;
   stats.schemaNameAndEnumCharacters+=names.reduce((n,x)=>n+x.length,0);
   if(!Array.isArray(node.required)||
      new Set(node.required).size!==node.required.length||
      names.length!==node.required.length||
      names.some(x=>!node.required.includes(x)))
    record('required-properties-not-exact:'+path);
   for(const [name,sub] of Object.entries(props))
    inspect(sub,path+'/properties/'+name,depth+1);
  }
  if(kinds.includes('array')||node.items){
   stats.arrays++;
   if(!node.items)record('array-missing-items:'+path);
   else inspect(node.items,path+'/items',depth+1);
  }
  if(node.anyOf){
   if(!Array.isArray(node.anyOf)||node.anyOf.length<2)
    record('anyOf-not-valid:'+path);
   // anyOf is a union wrapper for one output position, not an added
   // object/array nesting level. Count the branch at the same depth.
   else node.anyOf.forEach((sub,i)=>inspect(sub,path+'/anyOf/'+i,depth));
  }
  for(const key of ['$defs','definitions']){
   const defs=node[key];
   if(defs&&typeof defs==='object'&&!Array.isArray(defs))
    for(const [name,sub] of Object.entries(defs)){
     stats.schemaNameAndEnumCharacters+=name.length;
     inspect(sub,path+'/'+key+'/'+name,depth+1);
    }
  }
  if(node.$ref&&typeof node.$ref!=='string')record('invalid-ref:'+path);
  if(!node.type&&!node.anyOf&&!node.$ref)
   record('missing-schema-type:'+path);
 }
 if(schema?.type!=='object'||schema.anyOf)
  record('root-must-be-object-not-anyOf');
 inspect(schema,'$',1);
 if(stats.objects>5000||stats.properties>5000)
  record('schema-property-limit-exceeded');
 if(stats.enumValues>1000)record('total-enum-values-exceeded');
 if(stats.schemaNameAndEnumCharacters>120000)
  record('schema-name-enum-string-limit-exceeded');
 return {findings,stats,eligibleForRemoteTrial:findings.length===0,
  remoteProviderAccepted:'not-tested',source:SCHEMA_POLICY};
}
async function inspectOne(){
 // Mandatory exact offline opt-ins; guard before capturing or rebuilding.
 if(process.env.NODE_ENV!=='test'||process.env.RENDER==='true'||
   process.env.PAID_CORE_DEPTH_V2!==CLAIM_FLAG||
   process.env.PAID_CORE_V2_CLASSICAL_WRITER!==CLAIM_FLAG||
   process.env.PAID_CORE_V2_CLAIM_LINKS!==CLAIM_FLAG||
   process.env.PAID_CORE_V2_LOCK_REFS===CLAIM_FLAG||
   process.env.PAID_CORE_V2_CLOSED_CLAIMS===CLAIM_FLAG)
  throw Error('QA3_REMOTE_READINESS_REQUIRES_EXACT_OFFLINE_RESEARCH_FLAGS');
 const data=await capture(readiness.FIXTURE);
 if(data.providerCalls!==0||data.prompt.requestedSections?.join(',')!=='saju_core')
  throw Error('QA3_REMOTE_READINESS_NOT_ONE_SYNTHETIC_FIRST_CHAPTER');
 const prompt=data.prompt,requestTask=writer.compile(prompt);
 const schema=writer.schema(prompt,wire.schemaFor(prompt,clean(schemaSource)));
 const problems=[...audit.inspect(prompt),...audit.inspectTransport(prompt,requestTask),
  ...preflight.inspect(prompt,requestTask,schema)];
 const structure=checkStrictSchema(schema);
 const projected=projection.project(prompt,requestTask);
 const outputCap=plan.outputLimit(MODEL,prompt);
 const envelope={model:MODEL,store:false,max_output_tokens:outputCap,
  input:[{role:'system',content:'Return only the requested premium report JSON. '+
   writer.policyFor(prompt)+' '+wire.instruction},
   {role:'user',content:JSON.stringify(projected)}],
  text:{format:{type:'json_schema',name:'saju_mbti_premium_report',
   strict:true,schema}}};
 // Conservative byte-based bound for text, plus reserved framing overhead.
 // This is NOT an exact tokenizer count or actual billed usage.
 const rawBytes=Buffer.byteLength(JSON.stringify(envelope),'utf8');
 const inputUpperBound=rawBytes+2048;
 const upperUSD=Number(((inputUpperBound*PUBLIC_RATES.inputUSDPerMillion+
  outputCap*PUBLIC_RATES.outputUSDPerMillion)/1000000).toFixed(6));
 const verification=await readiness.prepare();
 if(verification.requestHash!==hash(envelope)||
   verification.tokenLimit!==outputCap||
   outputCap!==18000||
   verification.providerCalls!==0||verification.approvalToCharge!==false)
  throw Error('QA3_REMOTE_READINESS_EXISTING_ENVELOPE_HASH_DRIFT');
 if(problems.length||structure.findings.length)
  throw Error('QA3_REMOTE_READINESS_BLOCKED:'+
   [...problems,...structure.findings].join('|'));
 return {
  kind:'qa3-actual-envelope-dry-run-and-budget-v1',
  model:MODEL,modelPricingStatus:'published-model-rate-not-access-guarantee',
  chart:verification.chart,outputTokenCap:outputCap,
  envelopeSha256:hash(envelope),schemaSha256:hash(schema),
  schemaStatistics:structure.stats,
  strictSchemaStructuralCheck:'passed-local-only',
  providerEndpointValidation:'not-tested',
  actualModelCompletion:'not-generated',
  tokenEstimateMethod:'UTF8-envelope-byte-count-plus-2048-as-conservative-input-bound',
  envelopeUTF8Bytes:rawBytes,inputTokenConservativeBound:inputUpperBound,
  publishedInputUSDPerMillion:PUBLIC_RATES.inputUSDPerMillion,
  publishedOutputUSDPerMillion:PUBLIC_RATES.outputUSDPerMillion,
  estimatedCostUSDAtOutputCapAndInputBound:upperUSD,
  publishedPriceSource:PUBLIC_RATES.source,priceCheckedOn:PUBLIC_RATES.checkedOn,
  networkCalls:0,providerCalls:0,approvalToCharge:false,
  manualEditorialAndClassicalApproval:false,
  customerRelease:false,releaseVerdict:'not-approved'
 };
}
module.exports={checkStrictSchema,inspectOne,PUBLIC_RATES};
