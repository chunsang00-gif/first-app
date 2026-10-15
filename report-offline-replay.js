'use strict';
// Re-run the EXISTING report generator using archived, decoded QA responses.
// This is a strictly offline diagnostic path: never consults a provider,
// authorizes a purchase, resumes a billable call, or publishes any report.
const fs=require('node:fs');
const {generate}=require('./report-server-contract');

function archive(input){
 if(!input||!input.sample||!Array.isArray(input.calls))
  throw Error('OFFLINE_ARCHIVE_INVALID');
 if(input.calls.some((x,i)=>x?.number!==i+1||
  x.stage!=='body'&&x.stage!=='synthesis'||
  !Array.isArray(x.requestedSections)||!x.response||
  typeof x.response!=='object'||!Array.isArray(x.response.sections)))
  throw Error('OFFLINE_ARCHIVE_NOT_DECODED_RAW_CALLS');
 return input;
}
function reason(message){
 if(message==='OFFLINE_REPLAY_EXHAUSTED')return 'ARCHIVE_EXHAUSTED';
 if(message==='OFFLINE_REPLAY_REQUEST_DRIFT')return 'REQUEST_PLAN_CHANGED';
 if(message==='OFFLINE_REPLAY_NETWORK_BLOCKED')return 'NETWORK_BLOCKED';
 if(/non-specific interpretation/.test(message))return 'NON_SPECIFIC_CONTENT';
 if(/reader-facing editorial defects/.test(message))return 'READER_COPY_REJECTED';
 if(/factually inconsistent|factual mismatch/.test(message))return 'FACTUAL_CHECK_REJECTED';
 if(/repeated|duplicated/.test(message))return 'DUPLICATE_CONTENT';
 if(/root provenance|root position|paragraph basis|unrelated paragraph basis/.test(message))return 'EVIDENCE_CONTRACT_REJECTED';
 if(/structure|anchor|topic|paragraph/.test(message))return 'OUTPUT_CONTRACT_REJECTED';
 return 'OTHER_GENERATION_STOP';
}
async function replay(payload){
 const source=archive(payload);
 let consumed=0,attempts=0;
 const previousFetch=global.fetch;
 global.fetch=async()=>{throw Error('OFFLINE_REPLAY_NETWORK_BLOCKED')};
 try{
  const result=await generate(source.sample,async prompt=>{
   attempts++;
   const row=source.calls[consumed];
   if(!row)throw Error('OFFLINE_REPLAY_EXHAUSTED');
   if(row.stage!==prompt.stage||
    JSON.stringify(row.requestedSections)!==JSON.stringify(prompt.requestedSections||[]))
    throw Error('OFFLINE_REPLAY_REQUEST_DRIFT');
   consumed++;
   return structuredClone(row.response);
  });
  return {mode:'offline-archived-replay',providerRequests:0,archivedCallsAvailable:source.calls.length,
   archivedCallsConsumed:consumed,attemptedStages:attempts,status:result.status,
   releaseVerdict:'not-assessed',issues:result.status==='blocked'?(result.issues||[]).length:0};
 }catch(err){
  return {mode:'offline-archived-replay',providerRequests:0,archivedCallsAvailable:source.calls.length,
   archivedCallsConsumed:consumed,attemptedStages:attempts,status:'stopped',
   firstFailure:reason(String(err?.message||err)),releaseVerdict:'not-assessed'};
 }finally{global.fetch=previousFetch}
}
if(require.main===module){
 const path=process.argv[2];
 if(!path){console.error('Usage: node report-offline-replay.js <private-qa-report-raw-calls.json>');process.exitCode=2}
 else (async()=>{
  try{
   const result=await replay(JSON.parse(fs.readFileSync(path,'utf8')));
   console.log(JSON.stringify(result,null,2));
   if(result.status==='stopped'||result.status==='blocked')process.exitCode=2;
  }catch(err){console.error('Offline QA archive invalid:',String(err.message||err));process.exitCode=1}
 })();
}
module.exports={archive,replay,reason};
