'use strict';
// Deterministic offline replay of one already-paid response. Provider and
// decoded archives travel through the SAME report generator. No billing.
const fs=require('node:fs');
const {generate}=require('./report-server-contract');
const decoder=require('./report-response-decoder');
const generation=require('./report-generation-request');
function archive(input){
 if(!input||!input.sample||!Array.isArray(input.calls))throw Error('OFFLINE_ARCHIVE_INVALID');
 const kind=input.calls.some(row=>row?.request)?'provider':'decoded';
 for(let i=0;i<input.calls.length;i++){
  const r=input.calls[i];
  if(r?.number!==i+1||!r.response||typeof r.response!=='object')
   throw Error('OFFLINE_ARCHIVE_INVALID_CALL');
  if(kind==='decoded'){
   if(!['body','synthesis'].includes(r.stage)||!Array.isArray(r.requestedSections)||
    !Array.isArray(r.response.sections))
    throw Error('OFFLINE_ARCHIVE_NOT_DECODED_RAW_CALLS');
  }else{
   if(!['body','synthesis'].includes(r.request?.stage)||
    (r.request.stage==='body'&&(!r.request.task?.chapters||
      !Array.isArray(Object.keys(r.request.task.chapters))))||
    (!r.response.chapters&&!['incomplete'].includes(r.response.status)))
    throw Error('OFFLINE_ARCHIVE_NOT_PROVIDER_CALLS');
  }
 }
 return {...input,archiveKind:kind};
}
function reason(message){
 if(message==='OFFLINE_REPLAY_EXHAUSTED')return 'ARCHIVE_EXHAUSTED';
 if(message==='OFFLINE_REPLAY_REQUEST_DRIFT')return 'REQUEST_PLAN_CHANGED';
 if(message==='OFFLINE_REPLAY_NETWORK_BLOCKED')return 'NETWORK_BLOCKED';
 if(/output token limit/.test(message))return 'PROVIDER_TOKEN_LIMIT';
 if(/content filter/.test(message))return 'PROVIDER_CONTENT_FILTER';
 if(/non-specific interpretation/.test(message))return 'NON_SPECIFIC_CONTENT';
 if(/reader-facing editorial defects/.test(message))return 'READER_COPY_REJECTED';
 if(/factually inconsistent|factual mismatch/.test(message))return 'FACTUAL_CHECK_REJECTED';
 if(/repeated|duplicated/.test(message))return 'DUPLICATE_CONTENT';
 if(/root provenance|root position|paragraph basis|unrelated paragraph basis/.test(message))return 'EVIDENCE_CONTRACT_REJECTED';
 if(/structure|anchor|topic|paragraph/.test(message))return 'OUTPUT_CONTRACT_REJECTED';
 return 'OTHER_GENERATION_STOP';
}
const contentFailures=new Set(['NON_SPECIFIC_CONTENT','READER_COPY_REJECTED','DUPLICATE_CONTENT']);
const providerFailures=new Set(['PROVIDER_TOKEN_LIMIT','PROVIDER_CONTENT_FILTER']);
function layer(code){
 if(contentFailures.has(code))return 'editorial-content';
 if(providerFailures.has(code))return 'provider-transport';
 if(code==='ARCHIVE_EXHAUSTED'||code==='REQUEST_PLAN_CHANGED'||code==='NETWORK_BLOCKED')return 'offline-replay';
 if(['FACTUAL_CHECK_REJECTED','EVIDENCE_CONTRACT_REJECTED'].includes(code))return 'evidence-validation';
 if(code==='OUTPUT_CONTRACT_REJECTED')return 'response-structure';
 return 'unclassified';
}
async function replay(payload){
 const source=archive(payload);
 let consumed=0,attempts=0;
 let lastPhase='preflight',contractChecks=0,contractDifferences=0;
 const previousFetch=global.fetch;
 global.fetch=async()=>{throw Error('OFFLINE_REPLAY_NETWORK_BLOCKED')};
 try{
  const result=await generate(source.sample,async prompt=>{
   attempts++;
   lastPhase='archived-response-lookup';
   const row=source.calls[consumed];
   if(!row)throw Error('OFFLINE_REPLAY_EXHAUSTED');
   const actualStage=source.archiveKind==='provider'?row.request.stage:row.stage;
   const actualIds=source.archiveKind==='provider'?
    Object.keys(row.request.task?.chapters||{}):row.requestedSections;
   if(actualStage!==prompt.stage||
    JSON.stringify(actualIds)!==JSON.stringify(prompt.requestedSections||[]))
    throw Error('OFFLINE_REPLAY_REQUEST_DRIFT');
   // Old paid output was generated under an old request/schema.
   // Compare old vs current provider contract, without treating drift as
   // proof that a new provider call would fail.
   const archivedRequest=source.archiveKind==='provider'?row.request:row.generationRequest;
   const currentRequest=generation.compile(prompt);
   if(archivedRequest&&currentRequest){
    contractChecks++;
    if(JSON.stringify(archivedRequest)!==JSON.stringify(currentRequest))contractDifferences++;
   }
   consumed++;
   if(source.archiveKind==='provider'){
    lastPhase='provider-response-decoding';
    const decoded=decoder.decode(structuredClone(row.response),prompt);
    lastPhase='report-batch-validation';
    return decoded;
   }
   lastPhase='report-batch-validation';
   return structuredClone(row.response);
  });
  return {mode:'offline-archived-replay',archiveKind:source.archiveKind,
   providerRequests:0,archivedContractChanged:contractChecks?contractDifferences>0:null,
   archivedCallsAvailable:source.calls.length,
   archivedCallsConsumed:consumed,attemptedStages:attempts,status:result.status,
   releaseVerdict:'not-assessed',issues:result.status==='blocked'?(result.issues||[]).length:0};
 }catch(err){
  const firstFailure=reason(String(err?.message||err));
  return {mode:'offline-archived-replay',archiveKind:source.archiveKind,
   providerRequests:0,archivedContractChanged:contractChecks?contractDifferences>0:null,
   archivedCallsAvailable:source.calls.length,
   archivedCallsConsumed:consumed,attemptedStages:attempts,status:'stopped',
   firstFailure,failureLayer:
    firstFailure==='EVIDENCE_CONTRACT_REJECTED'&&contractDifferences>0?
    'archived-request-contract-drift':layer(firstFailure),
   stoppedAt:lastPhase,releaseVerdict:'not-assessed'};
 }finally{global.fetch=previousFetch}
}
if(require.main===module){
 const path=process.argv[2];
 if(!path){console.error('Usage: node report-offline-replay.js <private-qa-report-[raw|provider]-calls.json>');process.exitCode=2}
 else (async()=>{
  try{
   const result=await replay(JSON.parse(fs.readFileSync(path,'utf8')));
   console.log(JSON.stringify(result,null,2));
   if(result.status==='stopped'||result.status==='blocked')process.exitCode=2;
  }catch(err){console.error('Offline QA archive invalid:',String(err.message||err));process.exitCode=1}
 })();
}
module.exports={archive,replay,reason,layer};
