'use strict';
// Fully offline: neither workflow dispatch nor OpenAI provider access.
const assert=require('node:assert/strict');
const guard=require('./qa-core-v2-qa2-dispatch-guard');
const runner=require('./run-paid-core-v2-qa2');
const previous=require('./run-paid-core-v2-updated-guidance-qa');
const readiness=require('./report-paid-core-v2-billable-readiness');
const MODEL_HASH='5101200ae2e45fe3c9a331d2528c2f0b6d79287b2cb635d5a47fae07f2f1b302';
const old={id:40493356373,path:guard.WORKFLOW,created_at:'2026-10-27T11:04:20Z',
 head_branch:guard.BRANCH,run_attempt:1,event:'workflow_dispatch'};
const current={id:50000000000,path:guard.WORKFLOW,created_at:'2026-10-28T00:10:00Z',
 head_branch:guard.BRANCH,run_attempt:1,event:'workflow_dispatch'};
const second={...current,id:50000000001};
const env={GITHUB_ACTIONS:'true',GITHUB_TOKEN:'not-real',
 GITHUB_REF_NAME:guard.BRANCH,GITHUB_RUN_ATTEMPT:'1',
 GITHUB_REPOSITORY:'chunsang00-gif/first-app',
 GITHUB_RUN_ID:String(current.id),
 GITHUB_WORKFLOW_REF:'chunsang00-gif/first-app/'+guard.WORKFLOW+
 '@refs/heads/'+guard.BRANCH,
 REPORT_QA_CONFIRM:'QA2'};
const mock=runs=>async(url,options)=>{
 assert(url.includes('event=workflow_dispatch'));
 assert(url.includes('page=1'));
 assert.equal(options.headers.authorization,'Bearer not-real');
 return {ok:true,json:async()=>({total_count:runs.length,workflow_runs:runs})};
};
async function main(){
 assert.equal(guard.APPROVAL,'QA2');
 assert.equal(runner.APPROVAL,guard.APPROVAL);
 assert.equal(runner.WORKFLOW,guard.WORKFLOW);
 assert.notEqual(runner.APPROVAL,previous.APPROVAL);
 assert.notEqual(runner.REQUEST_HASH,previous.REQUEST_HASH);
 assert.equal(runner.REQUEST_HASH,MODEL_HASH);
 const fresh=await readiness.prepare();
 assert.notEqual(fresh.requestHash,MODEL_HASH,
 'the old QA2 approval has been consumed and MUST NOT approve the redesigned outgoing prompt');
 assert.equal(fresh.providerCalls,0);
 assert.equal(fresh.customerReady,false);
 assert.equal(fresh.approvalToCharge,false);
 assert.equal((await guard.check(env,mock([current,old]))).approved,true);
 const blocked=async(runs,opts=env,reason)=>
  assert.rejects(()=>guard.check(opts,mock(runs)),reason);
 await blocked([current,second,old],env,/another-qa2-era-dispatch-exists/);
 await blocked([second,old],env,/another-qa2-era-dispatch-exists/);
 await blocked([old],env,/not-unique-or-incomplete/);
 await blocked([{...current,run_attempt:2},old],env,
  /current-not-exact-dispatch/);
 await blocked([{...current,head_branch:'saju-mbti-app'},old],env,
  /current-not-exact-dispatch/);
 await blocked([current,old],{...env,REPORT_QA_CONFIRM:previous.APPROVAL},
  /wrong-workflow-or-approval/);
 await blocked([current,old],{...env,GITHUB_RUN_ATTEMPT:'2'},
  /wrong-workflow-or-approval/);
 await blocked([current,old],{...env,GITHUB_TOKEN:''},
  /wrong-workflow-or-approval/);
 await blocked([current,old],{...env,GITHUB_RUN_ID:'40493356373'},
  /not-newer-than-consumed-approval/);
 await assert.rejects(()=>guard.check(env,async()=>({ok:false})),
  /history-fetch-failed/);
 assert.throws(()=>runner.requireApproval({}),
  /QA2_CORE_V2_NEW_EXPLICIT_BILLABLE_APPROVAL_REQUIRED/);
 assert.throws(()=>runner.assertDepthForPaidQa({bodyTopics:['strength']}),
  /QA2_CORE_V2_PAID_DEPTH_NOT_GENERATED_QUALITY_HOLD_NO_RETRY/);
 assert.equal(runner.assertDepthForPaidQa(
  {bodyTopics:['temperament','strength']}),true);
 console.log('PASS QA2 only: newly short 1-shot consent, hash pin, consumed V2 approvals, duplicate/rerun/branch guard, separate encrypted sample, one-call cap; charged provider calls 0');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
