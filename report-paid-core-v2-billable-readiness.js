'use strict';
// BILLING PRECHECK ONLY. Rebuild the exact FIRST real paid provider request
// for the 1994 V2 specimen, before any network call. Never reads secrets,
// never authorizes a charge and does not imply human editorial approval.
const crypto=require('node:crypto');
const capture=require('./report-core-paid-full-prompt-capture').capture;
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const audit=require('./report-instruction-audit');
const preflight=require('./report-provider-preflight');
const schema=require('./report-schema.json');
const plan=require('./report-paid-batch-plan');
const FIXTURE=Object.freeze({calendar:'solar',birthDate:'1994-07-15',
 birthTime:'14:20',gender:'male',mbti:'ISFP'});
const MODEL='gpt-4.1';
const clean=value=>{
 if(Array.isArray(value))return value.map(clean);
 if(!value||typeof value!=='object')return value;
 return Object.fromEntries(Object.entries(value)
  .filter(([k,v])=>!['$schema','minLength','maxLength','minItems',
   'maxItems','minimum','maximum','pattern','format'].includes(k)&&
   !(k==='title'&&typeof v==='string'))
  .map(([k,v])=>[k,clean(v)]));
};
const sha=value=>crypto.createHash('sha256')
 .update(JSON.stringify(value)).digest('hex');
async function prepare(){
 const old={flag:process.env.PAID_CORE_DEPTH_V2,node:process.env.NODE_ENV,
  render:process.env.RENDER};
 try{
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  process.env.NODE_ENV='test';
  delete process.env.RENDER;
  const captured=await capture(FIXTURE);
  if(captured.status!=='captured-full-paid-composition'||
     captured.providerCalls!==0)
   throw Error('PAID_CORE_V2_BILLING_PREFLIGHT_NO_FIRST_BATCH');
  const prompt=captured.prompt;
  if(prompt?.paidCoreDepthV2!==true||
     JSON.stringify(prompt.requestedSections)!=='["saju_core"]'||
     prompt.qaNatalDepthPreview===true||
     prompt.facts?.chart?.year!=='甲戌'||
     prompt.facts?.chart?.month!=='辛未'||
     prompt.facts?.chart?.day!=='壬寅'||
     prompt.facts?.chart?.hour!=='丁未')
   throw Error('PAID_CORE_V2_BILLING_PREFLIGHT_INCORRECT_SPECIMEN');
  const payload=writer.compile(prompt);
  const topics=payload?.task?.chapters?.saju_core?.topics;
  const extra=topics?.temperament?.paidCoreDepthV2;
  const required=['natal.year.stem','natal.day.stem',
   'natal.hour.stem','facts.stemConnections'];
  if(JSON.stringify(Object.keys(topics||{}))!=='["temperament","strength"]'||
     !extra||extra.approvedAsPremiumValue!==false||
     !extra.visiblePairCandidates.some(x=>x.combination==='丁壬'&&
      x.adjacent&&x.from==='natal.day.stem'&&x.to==='natal.hour.stem')||
     !required.every(id=>Object.hasOwn(payload.source,id)&&
      topics.temperament.citableFacts.some(r=>r.id===id))||
     required.some(id=>topics.strength.citableFacts.some(r=>r.id===id))||
     payload.source['person.mbti'])
   throw Error('PAID_CORE_V2_BILLING_PREFLIGHT_WRONG_EVIDENCE_SCOPE');
  const providerSchema=writer.schema(prompt,
   wire.schemaFor(prompt,clean(schema)));
  const invalid=[...audit.inspect(prompt),
   ...audit.inspectTransport(prompt,payload),
   ...preflight.inspect(prompt,payload,providerSchema)];
  if(invalid.length)throw Error('PAID_CORE_V2_BILLING_PREFLIGHT_TRANSPORT_INVALID:'+invalid.join('|'));
  const envelope={model:MODEL,store:false,
   max_output_tokens:plan.outputLimit(MODEL,prompt),
   input:[
    {role:'system',content:'Return only the requested premium report JSON. '+
      writer.policyFor(prompt)+' '+wire.instruction},
    {role:'user',content:JSON.stringify(payload)}
   ],
   text:{format:{type:'json_schema',
    name:'saju_mbti_premium_report',strict:true,schema:providerSchema}}};
  if(envelope.max_output_tokens!==18000)throw Error('PAID_CORE_V2_BILLING_PREFLIGHT_TOKEN_LIMIT_DRIFT');
  return {kind:'offline-actual-provider-first-chapter-v2-envelope-v1',
   chart:Object.values(prompt.facts.chart).join('/'),
   model:MODEL,firstChapterOnly:true,allowedSourceRefs:required.slice(),
   requestHash:sha(envelope),taskHash:sha(payload),
   schemaHash:sha(providerSchema),systemHash:sha(envelope.input[0].content),
   tokenLimit:envelope.max_output_tokens,
   originalMonthAnchorPreserved:true,realOutputTextVerified:false,
   editorialMethodApproved:false,
   providerCalls:0,approvalToCharge:false,
   customerReady:false,releaseVerdict:'not-approved'};
 }finally{
  for(const [k,v] of [['PAID_CORE_DEPTH_V2',old.flag],
   ['NODE_ENV',old.node],['RENDER',old.render]])
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
}
module.exports={prepare,FIXTURE,MODEL};