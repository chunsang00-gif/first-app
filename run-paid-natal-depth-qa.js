'use strict';
// Operator-only ONE-CALL QA of the optional natal_depth chapter. NEVER used
// by purchase/report endpoints. Never retries, rewrites or invokes synthesis.
// The user must explicitly approve the billable call before workflow_dispatch.
const fs=require('node:fs');
const path=require('node:path');
const {assemble}=require('./report-core-paid-full-qa-compose');
const {callOpenAI}=require('./server');
const crypto=require('node:crypto');
const readiness=require('./report-core-paid-one-shot-readiness');
const generation=require('./report-generation-request');
const wire=require('./report-wire');
const {outputLimit}=require('./report-paid-batch-plan');
// Freeze exactly the synthetic prompt/model envelope. A matching hash
// is NOT consent to spend; explicit NEW approval and workflow redesign are
// still required. The former V1 approval was already consumed. Recompute
// from the REAL prepared QA request before any attempt marker or paid fetch.
const APPROVED_MODEL='gpt-4.1';
const APPROVED_ENVELOPE_SHA256='6cd72fbbae108f52b404f2994d477778c01d539c7f7cd1bb961c96f7385fed8f';
const fingerprint=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
async function assertFrozenRequest(qa){
 const built=await readiness.build();
 const actual=fingerprint({
  model:APPROVED_MODEL,
  tokenLimit:outputLimit(APPROVED_MODEL,qa.prompt),
  systemPolicy:generation.policyFor(qa.prompt)+' '+wire.instruction,
  providerPayload:qa.payload,strictSchema:qa.schema
 });
 if(process.env.REPORT_MODEL!==APPROVED_MODEL||
    actual!==APPROVED_ENVELOPE_SHA256||
    built.operatorEnvelopeHash!==APPROVED_ENVELOPE_SHA256)
  throw Error('QA_NATAL_DEPTH_APPROVED_ENVELOPE_DRIFT_NO_BILLING');
 return actual;
}
// The old V1 consent was consumed by run #39753663547. The existing
// GitHub Actions workflow still uses V1, so no new charged run is possible
// without a NEW explicit decision and deliberately revised workflow.
const APPROVAL='RUN_ONE_NATAL_DEPTH_SAMPLE_V2_NEW_APPROVAL_REQUIRED';
function savePrivate(file,data){
 const fd=fs.openSync(file,'wx',0o600);
 try{fs.writeFileSync(fd,JSON.stringify(data,null,2));fs.fsyncSync(fd)}
 finally{fs.closeSync(fd)}
}
async function run(){
 if(process.env.REPORT_QA_CONFIRM!==APPROVAL)
  throw Error('QA_NATAL_DEPTH_EXPLICIT_APPROVAL_REQUIRED');
 const output=process.env.REPORT_QA_OUTPUT;
 if(!path.isAbsolute(output||'')||!fs.existsSync(path.dirname(output))||
    !process.env.OPENAI_API_KEY||!process.env.REPORT_MODEL||
    process.env.REPORT_MODEL_URL)
  throw Error('QA_NATAL_DEPTH_MODEL_OR_PRIVATE_STORAGE_INVALID');
 // The existing private archive encrypts these EXACT four local filenames.
 // We only select them for a separate, explicitly approved Actions job.
 if(path.basename(output)!=='private-qa-first-chapter.json')
  throw Error('QA_NATAL_DEPTH_ARCHIVE_FILENAME_INVALID');
 const dir=path.dirname(output);
 const attempt=path.join(dir,'private-qa-first-chapter-attempt.json');
 const provider=path.join(dir,'private-qa-first-chapter-provider-calls.json');
 const checkpoint=path.join(dir,'private-qa-first-chapter-validated-first-chapter.json');
 const rejectedReview=path.join(dir,'private-qa-first-chapter-rejected-review.json');
 if([output,attempt,provider,checkpoint,rejectedReview].some(file=>fs.existsSync(file)))
  throw Error('QA_NATAL_DEPTH_EXISTING_EVIDENCE_NO_OVERWRITE');
 const qa=await assemble(); // Intercepts REAL server rules BEFORE model transport.
 const chapters=qa.payload?.task?.chapters;
 const topics=chapters?.saju_core?.topics;
 if(qa.providerCalls!==0||qa.prompt?.qaNatalDepthPreview!==true||
    JSON.stringify(qa.prompt.requestedSections)!=='["saju_core"]'||
    JSON.stringify(Object.keys(topics||{}))!==
      '["temperament","strength","natal_depth"]'||
    Object.keys(chapters||{}).length!==1||
    qa.releaseVerdict!=='not-approved')
  throw Error('QA_NATAL_DEPTH_WRONG_PAID_SCOPE');
 await assertFrozenRequest(qa);
 // Durable marker written BEFORE the sole potentially billable call.
 // If the process ends ambiguously, do not generate again automatically.
 savePrivate(attempt,{kind:'natal-depth-qa',status:'provider-attempt-started',
  requestedSections:['saju_core'],model:process.env.REPORT_MODEL,
  releaseVerdict:'not-approved'});
 let count=0,rawArchived=false;
 const invoke=async()=>{
  count++;
  if(count!==1)throw Error('QA_NATAL_DEPTH_SECOND_PROVIDER_CALL_BLOCKED');
  return callOpenAI(qa.prompt,async raw=>{
   if(rawArchived)throw Error('QA_NATAL_DEPTH_DUPLICATE_PROVIDER_RESPONSE');
   savePrivate(provider,{kind:'natal-depth-qa',providerCalls:1,
    releaseVerdict:'not-approved',request:qa.payload,response:raw});
   rawArchived=true;
  });
 };
 // Single direct call. No generate() multi-chapter loop or retry.
 // Preserve a review worksheet for charged-but-rejected results as well.
 // The first provider record is always written BEFORE downstream decoding.
 function preserveRejectedReview(reason){
  if(!rawArchived)return; // No stored response: uncertain remote outcome.
  const archive=JSON.parse(fs.readFileSync(provider,'utf8'));
  const review=require('./report-core-paid-natal-editorial-packet')
   .buildRejected({providerResponse:archive.response,qa,reason});
  savePrivate(rejectedReview,review);
 }
 let decoded;
 try{decoded=await invoke();}
 catch(err){
  // Do not let a diagnostic failure hide the ORIGINAL provider error.
  // The raw private provider file remains the primary archived evidence.
  try{preserveRejectedReview(String(err?.message||'provider-rejected'));}
  catch(reviewError){console.error('QA private review archive unavailable:',reviewError?.code||'write-error');}
  throw err;
 }
 if(!rawArchived)throw Error('QA_NATAL_DEPTH_PROVIDER_ARCHIVE_MISSING');
 const first=decoded?.sections;
 if(first?.length!==1||first[0]?.id!=='saju_core'||
    !first[0]?.bodyTopics?.includes('natal_depth')){
  preserveRejectedReview('QA_NATAL_DEPTH_MODEL_RETURNED_NO_ADDITIONAL_READING');
  throw Error('QA_NATAL_DEPTH_MODEL_RETURNED_NO_ADDITIONAL_READING');
 }
 // The original model response is already preserved in the private
 // provider archive. Prepare the editor's source-to-prose comparison without
 // another model call, and encrypt it inside the SAME private checkpoint.
 const archived=JSON.parse(fs.readFileSync(provider,'utf8'));
 const editorialReview=require('./report-core-paid-natal-editorial-packet')
  .build({providerResponse:archived.response,decoded,qa});
 if(editorialReview.humanReview.status!=='pending'||
    editorialReview.releaseVerdict!=='not-approved')
  throw Error('QA_NATAL_DEPTH_REVIEW_NOT_PENDING');
 savePrivate(checkpoint,{kind:'natal-depth-review-candidate',
  model:process.env.REPORT_MODEL,providerCalls:count,
  qaTopic:'natal_depth',technicalResponsePassed:true,
  humanReviewRequired:true,releaseVerdict:'not-approved',
  // Private decoded manuscript AND evidence-bound editorial worksheet.
  sections:first,editorialReview});
 savePrivate(output,{status:'qa-natal-depth-technical-pass',
  providerCalls:count,qaTopic:'natal_depth',
  humanReviewRequired:true,releaseVerdict:'not-approved',
  firstChapterSavedPrivately:true});
 console.log('QA natal-depth: ONE provider response archived; technical gate passed');
 console.log('NOT APPROVED FOR SALE: editorial reading of private manuscript required');
 return {status:'qa-natal-depth-technical-pass',providerCalls:count,
  releaseVerdict:'not-approved'};
}
if(require.main===module)run().catch(e=>{
 console.error('QA natal-depth stopped:',String(e?.message||e));
 process.exitCode=1;
});
module.exports={run,APPROVAL};
