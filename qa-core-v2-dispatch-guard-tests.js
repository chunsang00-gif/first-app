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
const fake=runs=>async()=>({ok:true,json:async()=>({total_count:runs.length,workflow_runs:runs})});
(async()=>{
 assert.equal(runner.APPROVAL,guard.APPROVAL);
 assert.equal(runner.REQUEST_HASH,'32d17dbc7377d751f91adfe2de2a85d502d450e32897e9728b43a3b1e0ce442e');
 assert.equal((await readiness.prepare()).requestHash,runner.REQUEST_HASH);
 assert.equal((await guard.check(env,fake([current,old,other]))).allowed,true);
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
 console.log('CORE_V2_ONE_SHOT_GUARD={"newApprovalRequired":true,"historicV1IsNotV2":true,"newSecondDispatchBlocked":true,"rerunsBlocked":true,"frozenHashMatched":true,"providerCalls":0}');
})().catch(e=>{console.error(e);process.exitCode=1});
