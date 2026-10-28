'use strict';
// QA4 CLAIM-LINKED one-attempt runner. NOT DISPATCHABLE: its dedicated job
// remains 'if: false' unless a NEW exact-hash approval is explicitly given.
// Never retry a provider failure; archive raw before any validation/decoding.
const fs=require('node:fs'),path=require('node:path');
const guard=require('./qa-core-v2-claimlinked-dispatch-guard');
const readiness=require('./report-paid-core-v2-billable-readiness');
const archive=require('./report-qa-secure-archive');
const model='gpt-4.1',outputName='private-qa-first-chapter.json';
const FLAG='offline-preview';
function requireApproval(env=process.env){
 if(env.REPORT_QA_CONFIRM!==guard.APPROVAL||
   env.REPORT_QA_REQUEST_SHA256!==guard.REQUEST_HASH)
  throw Error('QA4_FRESH_EXACT_HASH_CONSENT_REQUIRED');
 if(env.GITHUB_ACTIONS!=='true'||env.GITHUB_REPOSITORY!==guard.REPO||
   env.GITHUB_REF_NAME!==guard.BRANCH||env.GITHUB_RUN_ATTEMPT!=='1'||
   env.GITHUB_WORKFLOW_REF!==
    guard.REPO+'/'+guard.WORKFLOW+'@refs/heads/'+guard.BRANCH||
   !/^[1-9][0-9]*$/.test(env.GITHUB_RUN_ID||'')||
   !env.GITHUB_TOKEN||env.GITHUB_TOKEN.length<8)
  throw Error('QA4_PROTECTED_NEW_WORKFLOW_ONLY');
 // Publicly announced GPT-4.1 retirement is an independent stop gate.
 // It never claims that the current organization can access the model.
 require('./qa4-model-lifecycle-gate').assertBeforeShutdown(model);
 if(env.NODE_ENV!=='test'||env.RENDER==='true'||
   env.PAID_CORE_DEPTH_V2!==FLAG||
   env.PAID_CORE_V2_CLASSICAL_WRITER!==FLAG||
   env.PAID_CORE_V2_CLAIM_LINKS!==FLAG||
   env.PAID_CORE_V2_LOCK_REFS===FLAG||
   env.PAID_CORE_V2_CLOSED_CLAIMS===FLAG||
   env.REPORT_MODEL!==model||
   !!env.REPORT_MODEL_URL||typeof env.OPENAI_API_KEY!=='string'||
   env.OPENAI_API_KEY.length<32)
  throw Error('QA4_VERIFIED_PROVIDER_AND_EXACT_RESEARCH_FLAGS_REQUIRED');
 const file=env.REPORT_QA_OUTPUT;
 if(!path.isAbsolute(file||'')||path.basename(file)!==outputName||
   !fs.existsSync(path.dirname(file)))
  throw Error('QA4_PRIVATE_CHECKPOINT_DIR_REQUIRED');
 return file;
}
function privateSave(file,object){
 if(!archive.NAMES.includes(path.basename(file)))
  throw Error('QA4_UNRECOGNIZED_PRIVATE_ARCHIVE_FILE');
 const fd=fs.openSync(file,'wx',0o600);
 try{fs.writeFileSync(fd,JSON.stringify(object,null,2));fs.fsyncSync(fd)}
 finally{fs.closeSync(fd)}
}
async function preflight(){
 const result=await readiness.prepare({includePrompt:true});
 if(result.requestHash!==guard.REQUEST_HASH||result.model!==model||
    result.prompt?.stage!=='body'||
    JSON.stringify(result.prompt.requestedSections)!=='["saju_core"]'||
    result.prompt.paidCoreDepthV2!==true||
    result.providerCalls!==0||result.approvalToCharge!==false||
    result.firstChapterOnly!==true||result.tokenLimit!==18000||
    result.releaseVerdict!=='not-approved')
  throw Error('QA4_FROZEN_WRITER_OR_SCHEMA_DRIFT');
 const audit=await require('./report-qa3-offline-provider-readiness-audit')
  .inspectOne();
 const lifecycle=require('./qa4-model-lifecycle-gate')
  .assertBeforeShutdown(model);
 if(audit.schemaStatistics.maxDepth>10||
    audit.outputTokenCap>lifecycle.maxOutputTokens||
    audit.inputTokenConservativeBound>lifecycle.contextTokens)
  throw Error('QA4_GPT41_PUBLISHED_CAPACITY_OR_SCHEMA_LIMIT_EXCEEDED');
 if(audit.envelopeSha256!==guard.REQUEST_HASH||
    audit.strictSchemaStructuralCheck!=='passed-local-only'||
    audit.providerCalls!==0||audit.estimatedCostUSDAtOutputCapAndInputBound>=1)
  throw Error('QA4_STRICT_SCHEMA_OR_BUDGET_PREFLIGHT_FAILED');
 return result;
}
async function run(){
 const output=requireApproval();
 // The old QA3 paid job already ran: a new EXACT dispatch must be unique.
 await guard.check();
 const ready=await preflight();
 const dir=path.dirname(output),stem=path.basename(output,'.json');
 const attemptFile=path.join(dir,stem+'-attempt.json');
 const providerFile=path.join(dir,stem+'-provider-calls.json');
 const reviewFile=path.join(dir,stem+'-validated-first-chapter.json');
 const files=[output,attemptFile,providerFile,reviewFile];
 if(files.some(f=>fs.existsSync(f)))
  throw Error('QA4_EXISTING_ATTEMPT_ARCHIVE_NO_RETRY');
 privateSave(attemptFile,{kind:'qa4-claim-linked-one-attempt',
  status:'one-potential-charge-at-most',model,requestHash:guard.REQUEST_HASH,
  originalAlreadyConsumedQA3:guard.PREVIOUS_CONSUMED_RUN,
  providerCallMaximum:1,approvalForSale:false,
  releaseVerdict:'not-approved'});
 let calls=0,raw=null,stored=false,providerError=null,duplicateCallback=false;
 const fail=(code,detail)=>{
  privateSave(output,{
   kind:'qa4-claim-linked-one-attempt-result',status:'quality-hold-no-retry',
   errorCode:code,providerCalls:calls,
   originalResponseArchived:stored,
   requestHash:guard.REQUEST_HASH,
   ...(detail?{manualReason:detail}:{}),
   humanEditorialReviewRequired:true,
   releaseVerdict:'not-approved'
  });
  throw Error('QA4_ONE_ATTEMPT_HOLD_NO_RETRY:'+code);
 };
 try{
  calls++;
  if(calls!==1)throw Error('QA4_SECOND_PROVIDER_CALL_FORBIDDEN');
  // server.callOpenAI does NOT know about the extra research claimLinks
  // output. Its existing decoder may reject after this callback. Capture
  // it FIRST, then independently validate and strip on a new copy.
  await require('./server').callOpenAI(ready.prompt,async response=>{
   if(stored){
    duplicateCallback=true;
    throw Error('QA4_DUPLICATE_MODEL_RESPONSE_FORBIDDEN');
   }
   privateSave(providerFile,{
    kind:'qa4-original-provider-response',response,model,
    providerCalls:1,requestHash:guard.REQUEST_HASH,
    releaseVerdict:'not-approved'});
   raw=response;stored=true;
  });
 }catch(e){providerError=String(e?.message||'provider-error').slice(0,200)}
 if(duplicateCallback)fail('QA4_DUPLICATE_PROVIDER_CALLBACK_NO_RETRY');
 if(!stored)fail('QA4_NO_ORIGINAL_MODEL_CALLBACK_NO_RETRY',
  'Provider may have been billed; no raw report captured');
 if(!raw?.chapters?.saju_core?.paragraphs?.temperament?.basis?.claimLinks)
  fail('QA4_MISSING_REQUIRED_RESEARCH_OUTPUT');
 let review,decoded,method,verificationStage='claim-links';
 try{
  const verified=require('./report-qa3-classical-claim-linked-schema')
   .validateAndStrip(ready.prompt,raw);
  verificationStage='existing-app-decoder';
  decoded=require('./report-response-decoder')
   .decode(verified.value,ready.prompt);
  const section=decoded?.sections?.[0];
  if(decoded.sections?.length!==1||section?.id!=='saju_core'||
     !section.bodyTopics.includes('temperament')||
     !section.bodyTopics.includes('strength'))
   throw Error('QA4_WRONG_FIRST_CHAPTER');
  verificationStage='human-review-method-router';
  const route=require('./report-paid-core-v2-editorial-method-router');
  method=route.inspect({
   route:route.ROUTES.CLASSICAL_CANDIDATE,prompt:ready.prompt,
   paragraph:verified.value.chapters.saju_core.paragraphs.temperament,
   monthText:verified.value.chapters.saju_core.paragraphs.strength.text
  });
  if(method.status!=='requires-human-review'||
     method.mechanicallyEligible!==true||method.canSell!==false)
   throw Error('QA4_EDITORIAL_REVIEW_REQUIRED_OR_QUALITY_HOLD');
  review=verified.review;
 }catch{
  // Never expose model prose, personal fields or internal prompt content.
  const stage={
   'claim-links':'QA4_CLAIM_LINK_VALIDATION_REJECTED',
   'existing-app-decoder':'QA4_EXISTING_APP_DECODER_REJECTED',
   'human-review-method-router':'QA4_EDITORIAL_METHOD_REJECTED'
  }[verificationStage]||'QA4_UNCLASSIFIED_VALIDATION_REJECTED';
  fail(stage);
 }
 privateSave(reviewFile,{
  kind:'qa4-claimlinked-human-editorial-review',
  originalResponseArchived:true,providerCalls:1,
  providerPostCallbackErrorOccurred:providerError!==null,
  linkedClaimReview:review,
  exactChartOnly:true,humanClassicalMethodReviewRequired:true,
  newNaturalProseSemanticsNotApproved:true,
  customerRelease:false,releaseVerdict:'not-approved'});
 privateSave(output,{
  kind:'qa4-claim-linked-one-attempt-result',
  status:'machine-structure-clear-human-review-pending-no-retry',
  providerCalls:1,requestHash:guard.REQUEST_HASH,
  originalResponseArchived:true,
  providerPostCallbackErrorOccurred:providerError!==null,
  humanEditorialReviewRequired:true,canSell:false,
  releaseVerdict:'not-approved'});
 console.log('QA4_CLAIM_LINKED_ONE_ATTEMPT='+JSON.stringify({
  providerCalls:1,sourceProofAndDecoderPass:true,
  providerOriginalArchived:true,model,
  humanReviewRequired:true,approvedForSale:false,
  noRetry:true,releaseVerdict:'not-approved'}));
}
if(require.main===module)run().catch(e=>{
 console.error('QA4_RESEARCH_ONE_ATTEMPT_STOPPED:'+
  String(e.message||e).replace(/[\r\n]+/g,' ').slice(0,180));
 process.exitCode=1;
});
module.exports={run,requireApproval,preflight,REQUEST_HASH:guard.REQUEST_HASH,
 MODEL:model,OUTPUT:outputName};
