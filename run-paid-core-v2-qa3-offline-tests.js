'use strict';
// NO MODEL, NO NETWORK, NO SECRET READING. Prove that a "next", QA2 and
// even an otherwise valid Actions job cannot bill unless separately approved
// for the exact frozen request. Verify first-chapter preflight stays hash-pinned.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const guard=require('./qa-core-v2-qa3-dispatch-guard');
const qa3=require('./run-paid-core-v2-qa3');
const previous=require('./run-paid-core-v2-qa2');
async function main(){
 const remembered={node:process.env.NODE_ENV,preview:process.env.PAID_CORE_DEPTH_V2,
  render:process.env.RENDER,confirm:process.env.REPORT_QA_CONFIRM,
  request:process.env.REPORT_QA_REQUEST_SHA256};
 try{
  delete process.env.REPORT_QA_CONFIRM;
  delete process.env.REPORT_QA_REQUEST_SHA256;
  assert.throws(()=>qa3.requireApproval({}),
   /QA3_NEW_EXPLICIT_APPROVAL_OF_EXACT_HASH_REQUIRED/);
  await assert.rejects(()=>qa3.run(),
   /QA3_NEW_EXPLICIT_APPROVAL_OF_EXACT_HASH_REQUIRED/);
  assert.equal(qa3.REQUEST_HASH,guard.REQUEST_HASH);
  assert.equal(qa3.MODEL,'gpt-4.1');
  assert.notEqual(qa3.REQUEST_HASH,previous.REQUEST_HASH);
  assert.equal(guard.LAST_PREVIOUS_DISPATCH_ID,40602551757);
  const valid={
   REPORT_QA_CONFIRM:guard.APPROVAL,
   REPORT_QA_REQUEST_SHA256:qa3.REQUEST_HASH,
   GITHUB_ACTIONS:'true',GITHUB_REPOSITORY:guard.REPO,
   GITHUB_REF_NAME:guard.BRANCH,
   GITHUB_WORKFLOW_REF:guard.REPO+'/'+guard.WORKFLOW+
    '@refs/heads/'+guard.BRANCH,
   GITHUB_RUN_ATTEMPT:'1',GITHUB_RUN_ID:'99999999999',
   NODE_ENV:'test',PAID_CORE_DEPTH_V2:'offline-preview',
   OPENAI_API_KEY:'A'.repeat(40),GITHUB_TOKEN:'token-long-enough',
   REPORT_QA_OUTPUT:'/tmp/private-qa-first-chapter.json',
   REPORT_MODEL:'gpt-4.1'
  };
  assert.equal(qa3.requireApproval(valid),valid.REPORT_QA_OUTPUT);
  for(const [title,m] of [
   ['old consent',{REPORT_QA_CONFIRM:'QA2'}],
   ['old version',{REPORT_QA_CONFIRM:'RUN_ONE_CORE_V2_APPROVED_ONCE'}],
   ['wrong hash',{REPORT_QA_REQUEST_SHA256:'0'.repeat(64)}],
   ['no hash',{REPORT_QA_REQUEST_SHA256:''}],
   ['restarted',{GITHUB_RUN_ATTEMPT:'2'}],
   ['wrong workflow',{GITHUB_WORKFLOW_REF:'other/file'}],
   ['wrong branch',{GITHUB_REF_NAME:'saju-mbti-app'}],
   ['wrong endpoint',{REPORT_MODEL_URL:'https://untrusted.example'}],
   ['wrong model',{REPORT_MODEL:'gpt-4o-mini'}],
   ['no provider secret',{OPENAI_API_KEY:''}],
   ['prod',{NODE_ENV:'production'}],
   ['Render',{RENDER:'true'}],
   ['missing token',{GITHUB_TOKEN:''}]
  ]){
   assert.throws(()=>qa3.requireApproval({...valid,...m}),
    /QA3_(?:NEW_EXPLICIT_APPROVAL_OF_EXACT_HASH_REQUIRED|DEDICATED_FIRST_ATTEMPT_WORKFLOW_REQUIRED|PROVIDER_OR_ARCHIVE_CONFIG_REJECTED)/,title);
  }
  process.env.NODE_ENV='test';
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  delete process.env.RENDER;
  const ready=await qa3.preflight();
  assert.equal(ready.requestHash,guard.REQUEST_HASH);
  assert.equal(ready.approvalToCharge,false);
  assert.equal(ready.firstChapterOnly,true);
  assert.equal(ready.providerCalls,0);
  assert.equal(ready.releaseVerdict,'not-approved');
  const workflow=fs.readFileSync('.github/workflows/paid-report-qa.yml','utf8');
  assert(workflow.includes('  qa3-first-chapter:'));
  assert(workflow.includes("inputs.paid_qa_confirmation == '"+guard.APPROVAL+"'"));
  assert(workflow.includes('REPORT_QA_REQUEST_SHA256: '+
   "'"+guard.REQUEST_HASH+"'"));
  assert(workflow.includes('node qa-core-v2-qa3-dispatch-guard.js'));
  assert(workflow.includes('node run-paid-core-v2-qa3.js'));
  assert(workflow.includes('node report-qa-secure-archive.js encrypt'));
  assert(workflow.includes('npm test && npm run smoke'));
  assert(!workflow.includes('QA3_BYPASS_AUTHORIZATION'));
  assert.deepEqual(
   require('./report-qa-secure-archive').NAMES.includes(qa3.OUTPUT),true);
  console.log('QA3_DORMANT_APPROVAL_AND_HASH='+JSON.stringify({
   exactRequestHash:qa3.REQUEST_HASH,oldApprovalsBlocked:true,
   unexpectedModelBlocked:true,oneWorkflowAttemptRequired:true,
   scriptHasNoAutomaticProviderCalls:true,
   preflightSourceValid:true,sourceProofBeforeBilling:true,
   encryptedArchive:true,noPaidCalls:0,releaseVerdict:'not-approved'
  }));
 }finally{
  for(const [key,value] of [
   ['NODE_ENV',remembered.node],['PAID_CORE_DEPTH_V2',remembered.preview],
   ['RENDER',remembered.render],['REPORT_QA_CONFIRM',remembered.confirm],
   ['REPORT_QA_REQUEST_SHA256',remembered.request]])
   if(value===undefined)delete process.env[key];
   else process.env[key]=value;
 }
}
main().catch(e=>{console.error(e);process.exitCode=1});
