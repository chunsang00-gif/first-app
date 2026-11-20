'use strict';
// Adaptive-v1: OFFLINE cost planning for the normal report workflow.
// This never calls a paid model, uses no API keys, does not certify manuscript
// quality, and cannot authorize billing or sales. Counts request-envelope
// BYTES, not actual OpenAI input tokens.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const captured=require('./report-core-paid-full-prompt-capture');
const guidance=require('./report-analysis-guidance');
const selection=require('./report-chapter-selection');
const batches=require('./report-paid-batch-plan');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const preflight=require('./report-provider-preflight');
const projection=require('./report-paid-core-v2-provider-projection');
const outlined=require('./report-prompt');
const sample=Object.freeze({calendar:'lunar',birthDate:'1982-11-24',
 leapMonth:false,birthTime:'14:20',gender:'male',mbti:'ISFP'});
const GROUPS=Object.freeze([
 ['saju_core','mbti_contradiction'],['decision','stress'],
 ['money','career'],['relationship','integrated_judgment'],
 ['year_2027','year_2027_money'],['year_2027_career','year_2027_relationship']
]);
const MODEL='gpt-4.1';
const RATE=Object.freeze({input:2,output:8,unit:1000000});
const LUNA_RATE=Object.freeze({input:0.1,output:0.5,unit:1000000});
// Source: https://developers.openai.com/api/docs/models/gpt-6-luna
// 2026-11-20 publicly listed Standard text price. Scenario only, not a bill.
// Scenarios, NOT usage estimates or guaranteed provider/billing caps:
// UTF-8 bytes + 2048 per call deliberately overcounts many textual tokens;
// however tokenization, service-side overhead, and actual completed
// previous chapters are unknown. Add explicit prior-chapter reserves.
const INCREMENTAL_CARRYOVER_TOKENS=12000;
const SYNTHESIS_INPUT_RESERVE_TOKENS=50000;
const dollars=(input,output,rate=RATE)=>
 Number(((input*rate.input+output*rate.output)/rate.unit).toFixed(6));
function strict(value){
 if(Array.isArray(value))return value.map(strict);
 if(!value||typeof value!=='object')return value;
 return Object.fromEntries(Object.entries(value)
  .filter(([k,v])=>!['$schema','minLength','maxLength','minItems',
   'maxItems','minimum','maximum','pattern','format'].includes(k)&&
   !(k==='title'&&typeof v==='string'))
  .map(([k,v])=>[k,strict(v)]));
}
function bodyPrompt(first,ids,blueprint){
 // Derived from the REAL intercepted server prompt. No model callback can
 // run here. Later batches are PROJECTIONS with no generated prior prose.
 return {...first,requestedSections:ids,priorSections:[],
  priorChapterConclusions:[],
  analysisGuidance:{...guidance.forRequest(ids,first.facts.person?.mbti),
   editorialBlueprint:Object.fromEntries(ids.map(id=>[id,blueprint[id]]))},
  rules:{...first.rules,sections:ids,
   sectionGoals:Object.fromEntries(ids.map(id=>[id,outlined.sectionGoals[id]])),
   reusedEvidenceWithPriorConclusions:[],
   alreadyRepeatedNarrativeMotifs:[],
   returnOnlyRequestedSections:true}};
}
function envelope(prompt,model=MODEL){
 const compiled=writer.compile(prompt);
 const schema=writer.schema(prompt,
  wire.schemaFor(prompt,strict(JSON.parse(fs.readFileSync(
   path.join(__dirname,'report-schema.json'),'utf8')))));
 const invalid=preflight.inspect(prompt,compiled,schema);
 if(invalid.length)throw Error('ADAPTIVE_OFFLINE_COST_PREFLIGHT:'+invalid.join('|'));
 return {model,store:false,
  max_output_tokens:batches.outputLimit(model,prompt),
  ...require('./report-provider-model-options').requestFields(model),
  input:[{role:'system',content:'Return only the requested premium report JSON. '+
   writer.policyFor(prompt)+' '+wire.instruction},
   {role:'user',content:JSON.stringify(projection.project(prompt,compiled))}],
  text:{format:{type:'json_schema',name:'saju_mbti_premium_report',
   strict:true,schema}}};
}
async function inspect(options={}){
 const model=options.model||MODEL;
 if(!['gpt-4.1','gpt-6-luna'].includes(model))
  throw Error('ADAPTIVE_COST_UNREVIEWED_MODEL_NOT_SUPPORTED');
 const rate=model==='gpt-6-luna'?LUNA_RATE:RATE;
 const deprecated=model==='gpt-4.1';
 // This function aborts server generation at the FIRST provider boundary.
 const c=await captured.capture(sample);
 if(c.providerCalls!==0||c.status!=='captured-full-paid-composition')
  throw Error('ADAPTIVE_OFFLINE_COST_REAL_FIRST_PROMPT_UNAVAILABLE');
 const first=c.prompt,plan=guidance.preflight(first.facts);
 const selected=selection.select(GROUPS,plan,{mode:'adaptive-v1',
  readerQuestion:first.facts.person?.readerDecision});
 if(!selected.canGenerate)throw Error('ADAPTIVE_OFFLINE_COST_REPORT_SCOPE_BLOCKED');
 const groups=batches.plan(selected.groups);
 if(JSON.stringify(groups[0])!==JSON.stringify(first.requestedSections))
  throw Error('ADAPTIVE_OFFLINE_COST_FIRST_BATCH_SCOPE_MISMATCH');
 const bodies=groups.map((ids,index)=>{
  const p=index===0?first:bodyPrompt(first,ids,plan);
  const env=envelope(p,model);
  const bytes=Buffer.byteLength(JSON.stringify(env),'utf8');
  const scenarioInput=bytes+2048+index*INCREMENTAL_CARRYOVER_TOKENS;
  return {number:index+1,chapters:ids,kind:index===0?'actual-first-envelope':'later-batch-no-prior-prose-projection',
   // ONLY the real first request may carry a hash offered for future
   // consent. Later batches lack previous model prose and are projections.
   ...(index===0?{requestSha256:crypto.createHash('sha256')
    .update(JSON.stringify(env)).digest('hex')}:{}),
   requestUtf8Bytes:bytes,outputTokenCeiling:env.max_output_tokens,
   illustrativeInputPlanningTokens:scenarioInput,
   illustrativeCostIfFullOutputUSD:dollars(scenarioInput,env.max_output_tokens,rate)};
 });
 const synthesisTokens=batches.outputLimit(model,{stage:'synthesis'});
 const outputCeiling=bodies.reduce((n,x)=>n+x.outputTokenCeiling,0)+synthesisTokens;
 const firstCost=bodies[0].illustrativeCostIfFullOutputUSD;
 const approximateInput=bodies.reduce((n,x)=>n+x.illustrativeInputPlanningTokens,0)+
  SYNTHESIS_INPUT_RESERVE_TOKENS;
 if(groups.length+1>batches.MAX_PAID_CALLS)
  throw Error('ADAPTIVE_OFFLINE_COST_CALL_CAP_EXCEEDED');
 return {kind:'adaptive-v1-offline-cost-plan-v1',
  model,modelDeprecated:deprecated,
  sample:'synthetic-lunar-1982-11-24-1420-ISFP',
  chosenChapters:selected.plannedIds,omittedChapters:selected.omitted.map(x=>x.id),
  bodyCalls:groups.length,finalCalls:1,totalCalls:groups.length+1,
  firstBodyIsExactPrebillingComposition:true,allLaterBodiesAreUnbilledProjections:true,
  firstBodyRequestSha256:bodies[0].requestSha256,
  modelShutdownDate:deprecated?'2027-01-14':null,
  modelMigrationBeforeLaunchRequired:deprecated,
  replacementModelTransportVerifiedOnlyByMock:!deprecated,
  replacementModelRealKoreanQualityVerified:false,
  nextPaidProviderCallAuthorized:false,
  rows:bodies,
  synthesis:{kind:'uncreated-full-manuscript-variable-input',
   inputReservePlanningTokens:SYNTHESIS_INPUT_RESERVE_TOKENS,
   outputTokenCeiling:synthesisTokens},
  totalOutputTokenCeiling:outputCeiling,
  illustrativeInputPlanningTokens:approximateInput,
  outputIfAllLimitsReachedUSD:dollars(0,outputCeiling,rate),
  firstBodyIllustrativeFullOutputUSD:firstCost,
  illustrativeFullRunUSD:dollars(approximateInput,outputCeiling,rate),
  // Not a hard bound because the real tokenization + dynamic history are
  // not measured or enforced by OpenAI or the app.
  guaranteedBillingCapUSD:null,realMeasuredTokenCount:null,realPriceChargedUSD:null,
  rateUSDPerMillion:rate,
  providerCalls:0,modelOutputInspected:false,salesApproved:false,
  operatorApprovalGranted:false,releaseVerdict:'not-approved'};
}
if(require.main===module)inspect().then(x=>{
 // Only non-sensitive counts; never print the request/prompt or source chart.
 process.stdout.write('ADAPTIVE_V1_OFFLINE_COST_PLAN='+JSON.stringify(x)+'\n');
}).catch(e=>{console.error('ADAPTIVE_V1_OFFLINE_COST_FAILED:'+e.message);process.exitCode=1});
module.exports={inspect,sample,MODEL,RATE,LUNA_RATE,dollars,envelope};
