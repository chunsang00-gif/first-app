'use strict';
// Rebuild the EXACT normal paid first-chapter provider envelope offline.
// A preflight does NOT authorize a paid model call or release a report.
const crypto=require('node:crypto');
const capture=require('./report-core-paid-full-prompt-capture').capture;
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const audit=require('./report-instruction-audit');
const preflight=require('./report-provider-preflight');
const originalSchema=require('./report-schema.json');
const projection=require('./report-paid-core-v2-provider-projection');
const batch=require('./report-paid-batch-plan');
const MODEL='gpt-4.1';
const SAMPLE=Object.freeze({calendar:'lunar',leapMonth:false,
 birthDate:'1982-11-24',birthTime:'14:20',gender:'male',
 mbti:'ISFP',name:'검증용'});
const CHART=Object.freeze({year:'壬戌',month:'癸丑',day:'乙未',hour:'癸未'});
const sha=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function strict(value){
 if(Array.isArray(value))return value.map(strict);
 if(!value||typeof value!=='object')return value;
 return Object.fromEntries(Object.entries(value)
  .filter(([k,v])=>!['$schema','minLength','maxLength','minItems',
   'maxItems','minimum','maximum','pattern','format'].includes(k)&&
   !(k==='title'&&typeof v==='string'))
  .map(([k,v])=>[k,strict(v)]));
}
async function prepare({includePrompt=false}={}){
 const captured=await capture(SAMPLE);
 if(captured.status!=='captured-full-paid-composition'||captured.providerCalls!==0||
    captured.requestedSections?.join(',')!=='saju_core')
  throw Error('CURRENT_CORE_OFFLINE_CAPTURE_FAILED_NO_BILLING');
 const prompt=captured.prompt;
 if(prompt.stage!=='body'||prompt.paidCoreDepthV2===true||
    prompt.qaNatalDepthPreview===true||prompt.qaAdditiveDepthPreview===true||
    prompt.qaOfflineEditorialResearchPreview===true||
    Object.entries(CHART).some(([k,v])=>prompt.facts.chart[k]!==v))
  throw Error('CURRENT_CORE_NOT_NORMAL_1982_FIRST_CHAPTER');
 const payload=writer.compile(prompt);
 if(payload?.stage!=='body'||
    JSON.stringify(Object.keys(payload.task.chapters))!=='["saju_core"]'||
    !payload.task.chapters.saju_core.topics.strength?.sourceOwnedCoreReaderValue)
  throw Error('CURRENT_CORE_WRONG_PAID_FIRST_CHAPTER');
 const formatted=writer.schema(prompt,wire.schemaFor(prompt,strict(originalSchema)));
 const problems=[...audit.inspect(prompt),...audit.inspectTransport(prompt,payload),
  ...preflight.inspect(prompt,payload,formatted)];
 const structure=require('./report-qa3-offline-provider-readiness-audit')
  .checkStrictSchema(formatted);
 if(problems.length||!structure.eligibleForRemoteTrial)
  throw Error('CURRENT_CORE_PROVIDER_SCHEMA_NOT_READY:'+[
   ...problems,...structure.findings].join('|'));
 const maxOutputTokens=batch.outputLimit(MODEL,prompt);
 if(maxOutputTokens!==18000)throw Error('CURRENT_CORE_OUTPUT_CAP_DRIFT');
 const projected=projection.project(prompt,payload);
 const envelope={model:MODEL,store:false,max_output_tokens:maxOutputTokens,
  input:[
   {role:'system',content:'Return only the requested premium report JSON. '+
     writer.policyFor(prompt)+' '+wire.instruction},
   {role:'user',content:JSON.stringify(projected)}
  ],
  text:{format:{type:'json_schema',name:'saju_mbti_premium_report',
   strict:true,schema:formatted}}};
 const result={kind:'normal-paid-current-core-one-call-preflight-v1',
  sha256:sha(envelope),model:MODEL,stage:'body',sections:['saju_core'],
  maxOutputTokens,requestBytes:Buffer.byteLength(JSON.stringify(envelope),'utf8'),
  sourceCount:Object.keys(payload.source).length,
  strictSchemaChecked:true,legacyQAFlagsEnabled:false,
  providerCalls:0,approvalToCharge:false,
  technicalTransportVerified:true,editorialApproved:false,
  releaseVerdict:'not-approved'};
 return includePrompt?{...result,prompt}:result;
}
if(require.main===module)prepare().then(v=>{
 console.log('CURRENT_CORE_ONE_CALL_OFFLINE='+JSON.stringify(v));
}).catch(e=>{console.error('CURRENT_CORE_OFFLINE_FAILURE:'+e.message);process.exitCode=1;});
module.exports={prepare,MODEL,SAMPLE,CHART};
