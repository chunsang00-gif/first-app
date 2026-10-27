'use strict';
// No GitHub dispatch, no secrets, no charged API. Check only the new-approval
// boundary and the CURRENT immutable outgoing-model-request hash.
const assert=require('node:assert/strict');
const guard=require('./qa-core-v2-updated-dispatch-guard');
const runner=require('./run-paid-core-v2-updated-guidance-qa');
const prev=require('./run-paid-core-v2-first-chapter-qa');
const readiness=require('./report-paid-core-v2-billable-readiness');
const sha='0c5a7add6a4802b1cccf9e43f376a57f9248ba91b1a2b9c04b291e962813c920';
const env={
 GITHUB_ACTIONS:'true',GITHUB_TOKEN:'mock-token',GITHUB_REPOSITORY:'chunsang00-gif/first-app',
 GITHUB_REF_NAME:guard.BRANCH,GITHUB_RUN_ATTEMPT:'1',GITHUB_RUN_ID:'90001',
 GITHUB_WORKFLOW_REF:'chunsang00-gif/first-app/'+guard.WORKFLOW+
  '@refs/heads/'+guard.BRANCH,
 REPORT_QA_CONFIRM:guard.APPROVAL
};
const current={
 id:90001,path:guard.WORKFLOW,head_branch:guard.BRANCH,
 event:'workflow_dispatch',run_attempt:1};
const old={id:40454885372,path:prev.WORKFLOW,head_branch:guard.BRANCH,
 event:'workflow_dispatch',run_attempt:1};
const other={...current,id:90000};
const fake=runs=>async()=>({ok:true,json:async()=>({
 total_count:runs.length,workflow_runs:runs})});
async function run(){
 assert.equal(runner.APPROVAL,guard.APPROVAL);
 assert.notEqual(runner.APPROVAL,prev.APPROVAL);
 assert.notEqual(runner.WORKFLOW,prev.WORKFLOW);
 assert.equal(runner.WORKFLOW,guard.WORKFLOW);
 assert.equal(runner.REQUEST_HASH,sha);
 assert.notEqual(runner.REQUEST_HASH,prev.REQUEST_HASH);
 const rd=await readiness.prepare();
 assert.equal(rd.requestHash,sha,'updated writer request must remain frozen');
 assert.equal(rd.providerCalls,0);
 assert.equal(rd.approvalToCharge,false);
 assert.equal(rd.customerReady,false);
 assert.equal((await guard.check(env,fake([current,old]))).allowed,true);
 await assert.rejects(guard.check(env,fake([current,other,old])),
  /previous-or-concurrent-dispatch-exists/);
 await assert.rejects(guard.check(env,fake([other,old])),
  /previous-or-concurrent-dispatch-exists/);
 await assert.rejects(guard.check(env,fake([old])),
  /current-run-not-unique-or-history-incomplete/);
 await assert.rejects(guard.check(env,fake([{...current,run_attempt:2},old])),
  /wrong-current-run/);
 await assert.rejects(guard.check({...env,REPORT_QA_CONFIRM:prev.APPROVAL},
  fake([current,old])),/unauthorized-workflow-or-repeat/);
 await assert.rejects(guard.check({...env,GITHUB_RUN_ATTEMPT:'2'},
  fake([current,old])),/unauthorized-workflow-or-repeat/);
 await assert.rejects(guard.check({...env,GITHUB_TOKEN:''},
  fake([current,old])),/unauthorized-workflow-or-repeat/);
 await assert.rejects(guard.check(env,async()=>({ok:false})),
  /history-unreadable/);
 assert.throws(()=>runner.requireApproval({}),
  /UPDATED_CORE_V2_NEW_EXPLICIT_BILLABLE_APPROVAL_REQUIRED/);
 assert.throws(()=>runner.assertDepthForPaidQa({bodyTopics:['strength']}),
  /UPDATED_CORE_V2_PAID_DEPTH_NOT_GENERATED_QUALITY_HOLD_NO_RETRY/);
 assert.equal(runner.assertDepthForPaidQa({
  bodyTopics:['temperament','strength']}),true);
 console.log('PASS revised V2 new approval only, prior consent rejected, original completed sample preserved, unique workflow dispatch, exact new request hash, null depth cannot be success, zero paid model calls');
}
run().catch(e=>{console.error(e);process.exitCode=1;});
