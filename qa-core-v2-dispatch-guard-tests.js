'use strict';
const assert=require('node:assert/strict');
const guard=require('./qa-core-v2-dispatch-guard');
const runner=require('./run-paid-core-v2-first-chapter-qa');
const readiness=require('./report-paid-core-v2-billable-readiness');
const env={
 GITHUB_ACTIONS:'true',GITHUB_TOKEN:'offline-fake-token',
 GITHUB_REPOSITORY:'chunsang00-gif/first-app',
 GITHUB_REF_NAME:guard.BRANCH,GITHUB_RUN_ATTEMPT:'1',
 GITHUB_RUN_ID:'8000',REPORT_QA_CONFIRM:runner.APPROVAL,
 GITHUB_WORKFLOW_REF:'chunsang00-gif/first-app/'+guard.WORKFLOW+
 '@refs/heads/'+guard.BRANCH
};
const current={id:8000,path:guard.WORKFLOW,created_at:'2026-10-28T00:00:00Z',
 event:'workflow_dispatch',head_branch:guard.BRANCH,run_attempt:1};
const old={id:5000,path:guard.WORKFLOW,created_at:'2026-10-20T00:00:00Z',
 event:'workflow_dispatch',head_branch:guard.BRANCH,run_attempt:1};
const other={id:7000,path:'.github/workflows/paid-natal-depth-qa.yml',
 created_at:'2026-10-28T00:01:00Z',event:'workflow_dispatch'};
const failedWithoutBilling={
 id:40452823174,path:guard.WORKFLOW,
 head_sha:'8da6d9d74b7f4bbc81fda2bf3b94e194d710a83a',
 created_at:'2026-10-27T05:00:11Z',
 head_branch:guard.BRANCH,event:'workflow_dispatch',run_attempt:1,
 status:'completed',conclusion:'failure'
};
const verifiedJobs={total_count:1,jobs:[{
 name:'report-qa',conclusion:'failure',run_attempt:1,
 steps:[
  {name:'Run every offline and smoke test before potential billing',conclusion:'failure'},
  {name:'Verify one-call model, credentials and new consent',conclusion:'skipped'},
  {name:'Reject repeat V2 approval or another V2 dispatch',conclusion:'skipped'},
  {name:'Exactly one pinned V2 first-chapter provider request',conclusion:'skipped'}
 ]}]};
const fake=(runs,jobs=verifiedJobs)=>async(url)=>{
 const isJobs=url.includes('/actions/runs/40452823174/jobs?per_page=100');
 return {ok:true,json:async()=>isJobs?jobs:
  {total_count:runs.length,workflow_runs:runs}};
};
(async()=>{
 assert.equal(runner.APPROVAL,guard.APPROVAL);
 assert.equal(runner.REQUEST_HASH,'32d17dbc7377d751f91adfe2de2a85d502d450e32897e9728b43a3b1e0ce442e');
 // The previous V2 call already happened; its approval and hash cannot be
 // re-used after changing the writer's production input.
 assert.notEqual((await readiness.prepare()).requestHash,runner.REQUEST_HASH);
 assert.equal((await guard.check(env,fake([current,old,other]))).allowed,true);
 assert.equal((await guard.check(env,
  fake([current,failedWithoutBilling,old,other]))).allowed,true);
 const paid=structuredClone(verifiedJobs);
 paid.jobs[0].steps[3].conclusion='success';
 await assert.rejects(guard.check(env,
  fake([current,failedWithoutBilling,old],paid)),
  /another-post-v2-paid-dispatch-exists/);
 await assert.rejects(guard.check(env,
  fake([current,{...failedWithoutBilling,run_attempt:2},old])),
  /another-post-v2-paid-dispatch-exists/);
 await assert.rejects(guard.check(env,
  fake([current,{...failedWithoutBilling,
   head_sha:'some-other-commit'},old])),
  /another-post-v2-paid-dispatch-exists/);

 await assert.rejects(guard.check(env,fake([current,old,{
  ...current,id:8100,created_at:'2026-10-28T00:02:00Z'
 }])),/another-post-v2-paid-dispatch-exists/);
 await assert.rejects(guard.check(env,fake([old,other])),
  /current-run-not-uniquely-present/);
 await assert.rejects(guard.check({...env,GITHUB_RUN_ATTEMPT:'2'},
  fake([current])),/unauthorized-workflow-or-repeat/);
 await assert.rejects(guard.check({...env,GITHUB_TOKEN:''},
  fake([current])),/unauthorized-workflow-or-repeat/);
 await assert.rejects(guard.check({...env,REPORT_QA_CONFIRM:'RUN_ONE_PAID_SAMPLE'},
  fake([current])),/unauthorized-workflow-or-repeat/);
 assert.throws(()=>runner.requireApproval({}),
  /CORE_V2_NEW_EXPLICIT_BILLABLE_APPROVAL_REQUIRED/);
 assert.throws(()=>runner.requireApproval({...env,OPENAI_API_KEY:'fake'}),
  /CORE_V2_PROVIDER_CONFIG_OR_OFFLINE_PREVIEW_INCORRECT/);
 console.log('CORE_V2_ONE_SHOT_GUARD={"newApprovalRequired":true,"historicV1IsNotV2":true,"verifiedZeroCostPreflightException":true,"postBillableRepeatBlocked":true,"newSecondDispatchBlocked":true,"rerunsBlocked":true,"frozenHashMatched":true,"providerCalls":0}');
})().catch(e=>{console.error(e);process.exitCode=1});
