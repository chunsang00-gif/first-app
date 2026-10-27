'use strict';
// Separate user-authorized, one-time NEW billable trial of the new source-grounded V2 writer.
// This runner never touches customer purchase endpoints or production.
// This second diagnostic is NOT authorized by the previous V2 approval. Requires NEW explicit opt-in, exact frozen outgoing request, and
// a unique, first-attempt workflow. No retry/synthesis/subsequent chapters.
const fs=require('node:fs'),path=require('node:path');
const readiness=require('./report-paid-core-v2-billable-readiness');
const {callOpenAI}=require('./server');
const APPROVAL='QA2';
const REQUEST_HASH='5101200ae2e45fe3c9a331d2528c2f0b6d79287b2cb635d5a47fae07f2f1b302';
const BRANCH='fix-paid-qa-fact-bindings-20261014';
const WORKFLOW='.github/workflows/paid-report-qa.yml';
const OUTPUT='private-qa-first-chapter.json';
function savePrivate(file,value){
 const fd=fs.openSync(file,'wx',0o600);
 try{fs.writeFileSync(fd,JSON.stringify(value,null,2));fs.fsyncSync(fd)}
 finally{fs.closeSync(fd)}
}
function requireApproval(env=process.env){
 if(env.REPORT_QA_CONFIRM!==APPROVAL)throw Error('QA2_CORE_V2_NEW_EXPLICIT_BILLABLE_APPROVAL_REQUIRED');
 if(env.GITHUB_ACTIONS!=='true'||env.GITHUB_REF_NAME!==BRANCH||
    env.GITHUB_REPOSITORY!=='chunsang00-gif/first-app'||
    env.GITHUB_RUN_ATTEMPT!=='1'||!env.GITHUB_RUN_ID||
    env.GITHUB_WORKFLOW_REF!==
     env.GITHUB_REPOSITORY+'/'+WORKFLOW+'@refs/heads/'+BRANCH)
  throw Error('QA2_CORE_V2_ONE_SHOT_GITHUB_WORKFLOW_REQUIRED');
 if(env.NODE_ENV!=='test'||env.RENDER==='true'||
    env.PAID_CORE_DEPTH_V2!=='offline-preview'||
    env.REPORT_MODEL!==readiness.MODEL||
    !!env.REPORT_MODEL_URL)
  throw Error('QA2_CORE_V2_PROVIDER_CONFIG_OR_OFFLINE_PREVIEW_INCORRECT');
 if(!env.OPENAI_API_KEY||env.OPENAI_API_KEY.length<32)
  throw Error('QA2_CORE_V2_API_KEY_AND_PRIVATE_ARCHIVE_REQUIRED');
 const outfile=env.REPORT_QA_OUTPUT;
 if(!outfile||!path.isAbsolute(outfile)||path.basename(outfile)!==OUTPUT||
    !fs.existsSync(path.dirname(outfile)))
  throw Error('QA2_CORE_V2_PRIVATE_OUTPUT_LOCATION_INVALID');
 return outfile;
}
// A valid JSON response is not automatically a valid *paid depth* QA result.
// The optional depth slot may legally be null for the customer writer,
// but this one-shot diagnostic was paid specifically to test that extra
// value. Preserve private artifacts and fail the QA after archiving.
function assertDepthForPaidQa(section){
 if(!Array.isArray(section?.bodyTopics)||
    !section.bodyTopics.includes('strength'))
  throw Error('QA2_CORE_V2_MISSING_FIRST_CHAPTER_ANCHOR');
 if(!section.bodyTopics.includes('temperament'))
  throw Error('QA2_CORE_V2_PAID_DEPTH_NOT_GENERATED_QUALITY_HOLD_NO_RETRY');
 return true;
}
async function run(){
 const output=requireApproval(),parent=path.dirname(output),stem=path.basename(output,'.json');
 const attempt=path.join(parent,stem+'-attempt.json');
 const provider=path.join(parent,stem+'-provider-calls.json');
 const checkpoint=path.join(parent,stem+'-validated-first-chapter.json');
 if([output,attempt,provider,checkpoint].some(fs.existsSync))
  throw Error('QA2_CORE_V2_EXISTING_RECORD_NO_RETRY_OR_OVERWRITE');
 // Builds FIRST paid provider prompt via the genuine server contract, then
 // hashes the exact request body. No API request in this operation.
 const ready=await readiness.prepare({includePrompt:true});
 if(ready.requestHash!==REQUEST_HASH||ready.model!==readiness.MODEL||
    ready.providerCalls!==0||ready.approvalToCharge!==false||
    ready.firstChapterOnly!==true||ready.prompt?.paidCoreDepthV2!==true||
    JSON.stringify(ready.prompt.requestedSections)!=='["saju_core"]')
  throw Error('QA2_CORE_V2_FROZEN_PROVIDER_REQUEST_DRIFT_NO_BILLING');
 const prompt=ready.prompt;
 savePrivate(attempt,{kind:'core-v2-qa2-first-chapter-one-shot',status:'one-provider-request-started',
  model:ready.model,requestHash:ready.requestHash,
  inputSample:'synthetic-1994-07-15-1420',releaseVerdict:'not-approved'});
 let providerCalls=0,archived=false;
 let originalProviderValue=null;
 let decoded;
 try{
  providerCalls++;
  if(providerCalls!==1)throw Error('QA2_CORE_V2_SECOND_PROVIDER_CALL_BLOCKED');
  decoded=await callOpenAI(prompt,async response=>{
   if(archived)throw Error('QA2_CORE_V2_PROVIDER_RESPONSE_ALREADY_ARCHIVED');
   originalProviderValue=response;
   savePrivate(provider,{kind:'core-v2-qa2-first-chapter-one-shot',providerCalls:1,
    requestHash:ready.requestHash,requestedSections:['saju_core'],
    response,releaseVerdict:'not-approved'});
   archived=true;
  });
 }catch(err){
  // Charge might have happened even if the transport or quality gate failed.
  // Keep original attempt and raw result; never auto-retry.
  console.error('QA2_CORE_V2_ONE_SHOT_STOPPED:'+String(err?.message||err));
  throw Error('QA2_CORE_V2_ONE_SHOT_REJECTED_NO_RETRY');
 }
 if(!archived||providerCalls!==1||decoded?.sections?.length!==1||
    decoded.sections[0]?.id!=='saju_core')
  throw Error('QA2_CORE_V2_ONE_SHOT_INCOMPLETE_OR_UNEXPECTED_OUTPUT_NO_RETRY');
 const section=decoded.sections[0],hasDepth=section.bodyTopics.includes('temperament');
 const editorial=originalProviderValue?.chapters?.saju_core?.paragraphs?.temperament;
 const anchorText=originalProviderValue?.chapters?.saju_core?.paragraphs?.strength?.text;
 const scoped=require('./report-generation-request').compile(prompt)
  .task.chapters.saju_core.topics.temperament.paidCoreDepthV2;
 const editorialAudit=require('./report-paid-core-v2-editorial-triage')
  .inspect(editorial,anchorText,scoped);
 // A machine-readable response is NOT automatically a quality pass.
 // Add only categorical QA flags to the private checkpoint and logs.
 const depthWritingIssues=editorialAudit.findings;
 const machineTriageClear=depthWritingIssues.length===0;

 savePrivate(checkpoint,{kind:'core-v2-first-chapter-reader-review',providerCalls:1,
  requestHash:ready.requestHash,sections:decoded.sections,
  hasAdditionalReaderParagraph:hasDepth,
  editorialAuditKind:editorialAudit.kind,
  editorialAuditFindings:depthWritingIssues,
  machineTriageClear,
  humanEditorialReviewRequired:true,
  releaseVerdict:'not-approved'});
 savePrivate(output,{kind:'core-v2-qa2-first-chapter-one-shot-result',
  status:hasDepth?'technical-first-chapter-readable':'no-additional-depth-generated',
  providerCalls:1,requestHash:ready.requestHash,
  extraReaderParagraph:hasDepth,editorialMachineTriageClear:machineTriageClear,
  editorialAuditFindings:depthWritingIssues,humanEditorialReviewRequired:true,
  releaseVerdict:'not-approved'});
 // Only validate the billable purpose AFTER writing the original model
 // response and the decoded checkpoint; an unsuccessful trial is evidence
 // and must not result in a second model request.
 assertDepthForPaidQa(section);
 console.log('QA2_EDITORIAL_MACHINE_AUDIT='+JSON.stringify({
  hasDepth,machineTriageClear,flagCodes:depthWritingIssues,
  humanReviewRequired:true,approvedForSale:false,providerCalls:1
 }));
 if(!machineTriageClear)throw Error('QA2_CORE_V2_EDITORIAL_QUALITY_HOLD_NO_RETRY');
 console.log('QA2_CORE_V2_ONE_SHOT_FINISHED: 1 charged API call maximum; private report archived; editorial approval still required');
}
if(require.main===module)run().catch(e=>{
 console.error('QA2_CORE_V2_ONE_SHOT_ERROR:'+String(e.message||e));
 process.exitCode=1;
});
module.exports={run,requireApproval,assertDepthForPaidQa,APPROVAL,REQUEST_HASH,BRANCH,WORKFLOW};
