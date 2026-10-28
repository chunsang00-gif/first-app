'use strict';
// DORMANT UNTIL A NEW EXPLICIT USER BILLING APPROVAL IS GIVEN.
// Precisely one FIRST-CHAPTER GPT-4.1 attempt. Never retry, merge or deploy.
// Historic QA1/QA2 approvals do NOT authorize this. The exact byte-equivalent
// request's SHA-256 must match a fresh, frozen value before any OpenAI call.
const fs=require('node:fs'),path=require('node:path');
const guard=require('./qa-core-v2-qa3-dispatch-guard');
const readiness=require('./report-paid-core-v2-billable-readiness');
const archive=require('./report-qa-secure-archive');
const REQUEST_HASH=guard.REQUEST_HASH;
const MODEL='gpt-4.1';
const OUTPUT='private-qa-first-chapter.json';
function requireApproval(env=process.env){
 if(env.REPORT_QA_CONFIRM!==guard.APPROVAL||
    env.REPORT_QA_REQUEST_SHA256!==REQUEST_HASH)
  throw Error('QA3_NEW_EXPLICIT_APPROVAL_OF_EXACT_HASH_REQUIRED');
 if(env.GITHUB_ACTIONS!=='true'||env.GITHUB_REPOSITORY!==guard.REPO||
    env.GITHUB_REF_NAME!==guard.BRANCH||env.GITHUB_RUN_ATTEMPT!=='1'||
    !/^[1-9][0-9]*$/.test(env.GITHUB_RUN_ID||'')||
    env.GITHUB_WORKFLOW_REF!==
      guard.REPO+'/'+guard.WORKFLOW+'@refs/heads/'+guard.BRANCH)
  throw Error('QA3_DEDICATED_FIRST_ATTEMPT_WORKFLOW_REQUIRED');
 if(env.NODE_ENV!=='test'||env.PAID_CORE_DEPTH_V2!=='offline-preview'||
    env.RENDER==='true'||env.REPORT_MODEL!==MODEL||
    !!env.REPORT_MODEL_URL||!env.OPENAI_API_KEY||
    env.OPENAI_API_KEY.length<32||
    !env.GITHUB_TOKEN)
  throw Error('QA3_PROVIDER_OR_ARCHIVE_CONFIG_REJECTED');
 const output=env.REPORT_QA_OUTPUT||'';
 if(!path.isAbsolute(output)||path.basename(output)!==OUTPUT||
    !fs.existsSync(path.dirname(output)))
  throw Error('QA3_PRIVATE_OUTPUT_PATH_REQUIRED');
 return output;
}
function savePrivate(file,object){
 if(!archive.NAMES.includes(path.basename(file)))
  throw Error('QA3_ARCHIVE_WILL_NOT_INCLUDE_FILE');
 const fd=fs.openSync(file,'wx',0o600);
 try{fs.writeFileSync(fd,JSON.stringify(object,null,2));fs.fsyncSync(fd)}
 finally{fs.closeSync(fd)}
}
async function preflight(){
 const ready=await readiness.prepare({includePrompt:true});
 if(ready.requestHash!==REQUEST_HASH||
    ready.model!==MODEL||ready.providerCalls!==0||
    ready.approvalToCharge!==false||
    ready.firstChapterOnly!==true||
    ready.prompt?.paidCoreDepthV2!==true||
    JSON.stringify(ready.prompt.requestedSections)!=='["saju_core"]'||
    ready.prompt?.stage!=='body'||
    ready.editorialMethodApproved!==false||
    ready.releaseVerdict!=='not-approved')
  throw Error('QA3_REQUEST_HASH_OR_SOURCE_CONTRACT_DRIFT_NO_BILLING');
 const task=require('./report-generation-request')
  .compile(ready.prompt).task.chapters.saju_core.topics.temperament;
 const owned=task.serverOwnedWritingContract;
 if(owned?.kind!=='server-owned-first-chapter-evidence-and-claim-contract-v1'||
    owned.humanEditorialApproval!==false||
    owned.modelRole!=='Korean-prose-rendering-only'||
    task.sourceQualifiedWritingDecision.approvedForSale!==false||
    task.paidCoreDepthV2.approvedAsPremiumValue!==false||
    !task.citableFacts.every(x=>typeof x.id==='string')||
    !owned.evidenceRefs.every(id=>task.citableFacts.some(x=>x.id===id)))
  throw Error('QA3_UNTRUSTED_FIRST_CHAPTER_SOURCE_CONTRACT');
 return ready;
}
async function run(){
 const env=process.env;
 const output=requireApproval(env);
 // No files or OpenAI requests until all existing QA3 run history is checked.
 await guard.check(env);
 const ready=await preflight();
 const root=path.dirname(output),stem=path.basename(output,'.json');
 const names=[output,root+'/'+stem+'-attempt.json',
  root+'/'+stem+'-provider-calls.json',
  root+'/'+stem+'-validated-first-chapter.json'];
 if(names.some(file=>fs.existsSync(file)))
  throw Error('QA3_EXISTING_ATTEMPT_NO_RETRY_OR_OVERWRITE');
 const [resultFile,attemptFile,providerFile,reviewFile]=names;
 savePrivate(attemptFile,{
  kind:'qa3-first-chapter-one-attempt',status:'may-have-billed-at-most-once',
  requestHash:REQUEST_HASH,model:MODEL,providerCallsMaximum:1,
  fixture:'synthetic-1994-07-15-1420',humanApproval:false,
  releaseVerdict:'not-approved'
 });
 let calls=0,raw=null,stored=false,decoded=null;
 try{
  ++calls;
  if(calls!==1)throw Error('QA3_SECOND_PROVIDER_CALL_FORBIDDEN');
  decoded=await require('./server').callOpenAI(ready.prompt,async response=>{
   if(stored)throw Error('QA3_DUPLICATE_MODEL_RESPONSE_FORBIDDEN');
   raw=response;
   // A provider error, incomplete response or rejected JSON may still have
   // charged. Preserve its original data before the decoder can reject it.
   savePrivate(providerFile,{
    kind:'qa3-raw-model-response',requestHash:REQUEST_HASH,
    providerCalls:1,model:MODEL,response,
    releaseVerdict:'not-approved'});
   stored=true;
  });
 }catch(e){
  savePrivate(resultFile,{
   kind:'qa3-first-chapter-one-attempt-result',
   status:'failed-after-possible-charge-no-retry',
   errorCode:'QA3_PROVIDER_OR_DECODER_REJECTED',
   originalResponseArchived:stored,providerCalls:calls,
   requestHash:REQUEST_HASH,releaseVerdict:'not-approved'});
  throw Error('QA3_ONE_ATTEMPT_FAILED_NO_RETRY');
 }
 const section=decoded?.sections?.[0]||null;
 if(!Array.isArray(decoded?.sections)||decoded.sections.length!==1||
    section?.id!=='saju_core'||!Array.isArray(section?.bodyTopics)){
  // A provider request MAY ALREADY HAVE BEEN CHARGED. A successful HTTP
  // call with an unusable decoded chapter must leave an explicit private
  // one-attempt result, never just a thrown exception with no checkpoint.
  // The raw response has already been stored by onProviderResponse and
  // the workflow's always() encrypted archive still runs on this failure.
  savePrivate(resultFile,{
   kind:'qa3-first-chapter-one-attempt-result',
   status:'invalid-decoded-first-chapter-no-retry',
   errorCode:'QA3_WRONG_OUTPUT_CHAPTER_AFTER_ARCHIVING_NO_RETRY',
   originalResponseArchived:stored,providerCalls:calls,
   requestHash:REQUEST_HASH,humanEditorialReviewRequired:true,
   releaseVerdict:'not-approved'
  });
  throw Error('QA3_WRONG_OUTPUT_CHAPTER_AFTER_ARCHIVING_NO_RETRY');
 }
 const para=raw?.chapters?.saju_core?.paragraphs?.temperament;
 const month=raw?.chapters?.saju_core?.paragraphs?.strength?.text;
 const scope=require('./report-generation-request').compile(ready.prompt)
  .task.chapters.saju_core.topics.temperament.paidCoreDepthV2;
 const triage=require('./report-paid-core-v2-editorial-triage')
  .inspect(para,month,scope);
 const hasCore=section.bodyTopics.includes('strength');
 const hasExtra=section.bodyTopics.includes('temperament');
 const pass=hasCore&&hasExtra&&triage.findings.length===0;
 savePrivate(reviewFile,{
  kind:'qa3-first-chapter-editorial-review',
  requestHash:REQUEST_HASH,providerCalls:1,
  originalModelWasPreserved:stored,sections:decoded.sections,
  hasCore,hasExtra,machineTriage:triage,
  humanEditorialReviewRequired:true,releaseVerdict:'not-approved'});
 savePrivate(resultFile,{
  kind:'qa3-first-chapter-one-attempt-result',
  status:pass?'machine-triage-clear-human-review-pending':
   'quality-hold-no-retry',
  requestHash:REQUEST_HASH,providerCalls:1,
  originalModelWasPreserved:stored,
  hasCore,hasExtra,
  machineFindings:triage.findings,
  humanEditorialReviewRequired:true,releaseVerdict:'not-approved'});
 console.log('QA3_ONE_ATTEMPT_EDITORIAL_STATUS='+JSON.stringify({
  requestHash:REQUEST_HASH,providerCalls:1,hasCore,hasExtra,
  machineFindings:triage.findings,
  humanReviewRequired:true,approvedForSale:false,
  followupProviderCallsAllowed:false
 }));
 if(!pass)throw Error('QA3_QUALITY_HOLD_NO_RETRY');
}
if(require.main===module)run().catch(e=>{
 console.error('QA3_ONE_ATTEMPT_STOPPED:'+String(e.message||e));
 process.exitCode=1;
});
module.exports={requireApproval,preflight,run,REQUEST_HASH,MODEL,OUTPUT};
