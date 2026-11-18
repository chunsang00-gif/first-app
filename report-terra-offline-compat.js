'use strict';
// An OFFLINE migration preflight for the existing synthetic paid-first-chapter
// prompt. Never calls OpenAI or reads an API credential. A successful local
// schema check is NOT a remote model response or sale approval.
const crypto=require('node:crypto');
const old=require('./qa-current-core-preflight');
const cost=require('./report-adaptive-v1-offline-cost-plan');
const MODEL='gpt-6.1-terra';
const RATE=Object.freeze({input:1,output:5,unit:1000000,tier:'Standard'});
const hash=body=>crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
async function inspect(){
 const previous=await old.prepare({includePrompt:true});
 if(previous.providerCalls!==0||previous.approvalToCharge!==false)
  throw Error('TERRA_OFFLINE_BASELINE_NOT_SAFE');
 const original=cost.envelope(previous.prompt);
 if(original.model!==old.MODEL||hash(original)!==previous.sha256||
    Buffer.byteLength(JSON.stringify(original),'utf8')!==previous.requestBytes)
  throw Error('TERRA_OFFLINE_BASELINE_REQUEST_DRIFT');
 const request=cost.envelope(previous.prompt,MODEL);
 if(request.model!==MODEL||request.store!==false||
    request.reasoning?.effort!=='none'||request.max_output_tokens!==18000||
    request.text?.format?.strict!==true||
    request.text?.format?.type!=='json_schema')
  throw Error('TERRA_OFFLINE_REQUEST_OPTIONS_DRIFT');
 // Only model and model-specific options may change in this narrow trial.
 const comparable=structuredClone(request);
 comparable.model=original.model;
 delete comparable.reasoning;
 if(JSON.stringify(comparable)!==JSON.stringify(original))
  throw Error('TERRA_OFFLINE_PROMPT_OR_SCHEMA_CHANGED');
 const requestBytes=Buffer.byteLength(JSON.stringify(request),'utf8');
 const scenarioInput=requestBytes+2048;
 const illustrativePrice=Number(((scenarioInput*RATE.input+
  request.max_output_tokens*RATE.output)/RATE.unit).toFixed(6));
 const baselinePrice=Number((((previous.requestBytes+2048)*2+
  previous.maxOutputTokens*8)/1000000).toFixed(6));
 return {kind:'terra-offline-first-chapter-compat-v1',
  model:MODEL,modelOfficiallyDocumented:true,
  responseApiEnvelopeBuilt:true,strictSchemaLocallyChecked:true,
  oldModelSha256:previous.sha256,
  firstRequestSha256:hash(request),requestBytes,
  outputTokenCeiling:request.max_output_tokens,
  reasoningEffort:request.reasoning.effort,
  sameSourceSchemaAndWritingInstructions:true,
  pricingTier:RATE.tier,rateUSDPerMillion:RATE,
  firstCallIllustrativeUSD:illustrativePrice,
  legacyIllustrativeUSD:baselinePrice,
  inputPlanningTokens:scenarioInput,
  // Request bytes are not a tokenizer count; model output/reasoning usage,
  // prompt caching, remote schema support and account access remain unknown.
  actualTokenUsage:null,guaranteedBillingCapUSD:null,
  remoteModelAccessVerified:false,remoteSchemaAccepted:false,
  KoreanPremiumProseApproved:false,providerCalls:0,
  approvalToCharge:false,salesApproved:false,productionDeployed:false,
  releaseVerdict:'not-approved'};
}
if(require.main===module)inspect().then(report=>{
 console.log('TERRA_OFFLINE_COMPAT='+JSON.stringify(report));
}).catch(error=>{console.error('TERRA_OFFLINE_COMPAT_FAILED:'+error.message);
 process.exitCode=1;});
module.exports={inspect,MODEL,RATE};
