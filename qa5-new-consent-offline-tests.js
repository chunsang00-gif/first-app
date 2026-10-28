'use strict';
// Regression for the PRE-BILLING failure of real QA4 run 40704124862.
// QA5 has a NEW dispatch identity, but the EXACT same frozen model payload.
// No action dispatch, no OpenAI requests, and no approval granted by test.
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const qa4=require('./run-paid-core-v2-qa4-claimlinked');
const qa5=require('./run-paid-core-v2-qa5-claimlinked');
const old=require('./qa-core-v2-claimlinked-dispatch-guard');
const guard=require('./qa5-claimlinked-dispatch-guard');
const workflow=fs.readFileSync(path.join(__dirname,guard.WORKFLOW),'utf8');
const requiredFlags=['NODE_ENV','PAID_CORE_DEPTH_V2',
 'PAID_CORE_V2_CLASSICAL_WRITER','PAID_CORE_V2_CLAIM_LINKS'];
const job=workflow.split('    steps:')[0];
const globalEnv=job.split('    env:')[1]||'';
assert(workflow.includes('    if: ${{ false }}'),
 'QA5 must not become billable until NEW independent consent is collected');
assert(workflow.includes(guard.REQUEST_HASH));
assert(workflow.includes('run: node run-paid-core-v2-qa5-claimlinked.js'));
assert(workflow.includes('node report-qa-secure-archive.js encrypt'));
for(const flag of requiredFlags)
 assert(!new RegExp('^\\s*'+flag+':','m').test(globalEnv),
  'QA4 precharge regression: never put paid QA flags at job scope');
const free=workflow.split('      - name: Test existing code and new claim-linked request without API calls')[1]
 .split('      - name: Verify NEW QA5 consent')[0];
assert(free.includes('run: npm test && npm run smoke'));
for(const flag of requiredFlags)
 assert(!new RegExp('^\\s*'+flag+':','m').test(free),
  'QA4 baseline test contamination must not recur');
for(const name of ['Verify NEW QA5 consent and unchanged provider hash before API',
 'ONE QA5 model attempt ONLY if separately approved, NEVER RETRY']){
 const block=workflow.split('      - name: '+name)[1]
  .split('      - name:')[0];
 for(const flag of requiredFlags)
  assert(new RegExp('^\\s*'+flag+':','m').test(block),
   'new model call must have scoped flag: '+flag);
}
assert.equal(qa5.REQUEST_HASH,qa4.REQUEST_HASH);
assert.equal(guard.REQUEST_HASH,old.REQUEST_HASH);
assert.notEqual(guard.APPROVAL,old.APPROVAL);
assert.notEqual(guard.WORKFLOW,old.WORKFLOW);
assert.equal(guard.PREVIOUS_CONSUMED_RUN,40704124862);
assert.throws(()=>qa5.requireApproval({}),
 /QA4_FRESH_EXACT_HASH_CONSENT_REQUIRED/);
const root=fs.mkdtempSync(path.join(os.tmpdir(),'qa5-approval-'));
const env={
 GITHUB_ACTIONS:'true',GITHUB_REPOSITORY:guard.REPO,
 GITHUB_REF_NAME:guard.BRANCH,GITHUB_RUN_ATTEMPT:'1',
 GITHUB_RUN_ID:'90007770001',
 GITHUB_WORKFLOW_REF:guard.REPO+'/'+guard.WORKFLOW+'@refs/heads/'+guard.BRANCH,
 GITHUB_TOKEN:'fake-token-protected-123456789',
 REPORT_QA_CONFIRM:guard.APPROVAL,
 REPORT_QA_REQUEST_SHA256:guard.REQUEST_HASH,
 NODE_ENV:'test',PAID_CORE_DEPTH_V2:'offline-preview',
 PAID_CORE_V2_CLASSICAL_WRITER:'offline-preview',
 PAID_CORE_V2_CLAIM_LINKS:'offline-preview',
 REPORT_MODEL:'gpt-4.1',OPENAI_API_KEY:'fake-'+'k'.repeat(40),
 REPORT_QA_OUTPUT:path.join(root,qa5.OUTPUT)
};
const current={id:90007770001,path:guard.WORKFLOW,
 event:'workflow_dispatch',head_branch:guard.BRANCH,run_attempt:1,
 created_at:'2026-10-28T21:59:50Z'};
const prior={id:40704124862,path:old.WORKFLOW,
 event:'workflow_dispatch',head_branch:old.BRANCH,run_attempt:1,
 created_at:'2026-10-28T14:15:19Z'};
const response=runs=>async()=>({ok:true,json:async()=>({
 total_count:runs.length,workflow_runs:runs})});
(async()=>{
 const previous=Object.fromEntries([...requiredFlags,'RENDER'].map(k=>[k,process.env[k]]));
 const original=qa4.run;
 try{
  const checked=qa5.requireApproval(env);
  assert.equal(checked,env.REPORT_QA_OUTPUT);
  assert.throws(()=>qa5.requireApproval({...env,REPORT_QA_CONFIRM:old.APPROVAL}),
   /QA4_FRESH_EXACT_HASH_CONSENT_REQUIRED/);
  assert.throws(()=>qa5.requireApproval({...env,GITHUB_WORKFLOW_REF:
   env.GITHUB_WORKFLOW_REF.replace('qa5','qa4')}),
   /QA4_PROTECTED_NEW_WORKFLOW_ONLY/);
  assert.throws(()=>qa5.requireApproval({...env,PAID_CORE_V2_CLAIM_LINKS:''}),
   /QA4_VERIFIED_PROVIDER_AND_EXACT_RESEARCH_FLAGS_REQUIRED/);
  assert.equal((await guard.check(env,response([current,prior]))).canRelease,false);
  await assert.rejects(guard.check({...env,GITHUB_RUN_ATTEMPT:'2'},response([current,prior])),
   /QA5_CLAIMLINKED_DISPATCH_REJECTED/);
  await assert.rejects(guard.check(env,response([prior])),
   /QA5_CLAIMLINKED_DISPATCH_REJECTED/);
  await assert.rejects(guard.check(env,response([current,prior,
   {...current,id:90007770003}])),
   /QA5_CLAIMLINKED_DISPATCH_REJECTED/);
  await assert.rejects(guard.check({...env,REPORT_QA_CONFIRM:old.APPROVAL},
   response([current,prior])),/QA5_CLAIMLINKED_DISPATCH_REJECTED/);
  assert.equal(qa5.MODEL,'gpt-4.1');
  assert.equal(qa5.OUTPUT,qa4.OUTPUT);
  // Spy confirms NEW guard reaches the existing archived one-shot code,
  // without actually starting any provider request.
  let forwarded=null;
  qa4.run=async g=>{forwarded=g;return 'safe-no-call'};
  assert.equal(await qa5.run(),'safe-no-call');
  assert.equal(forwarded,guard);
  Object.assign(process.env,{
   NODE_ENV:'test',PAID_CORE_DEPTH_V2:'offline-preview',
   PAID_CORE_V2_CLASSICAL_WRITER:'offline-preview',
   PAID_CORE_V2_CLAIM_LINKS:'offline-preview'
  });
  delete process.env.RENDER;
  const prepared=await qa5.preflight();
  assert.equal(prepared.requestHash,guard.REQUEST_HASH);
  assert.equal(prepared.providerCalls,0);
  assert.equal(prepared.firstChapterOnly,true);
  assert.equal(prepared.model,'gpt-4.1');
  console.log('QA5_PRECHARGE_FAILURE_RECOVERY='+JSON.stringify({
   priorQA4Dispatch:40704124862,
   priorProviderStepWasSkipped:true,
   freshQA5WorkflowExistsButHardDisabled:true,
   exactOriginalProviderRequestHashPreserved:true,
   freshDispatchGuardIndependent:true,
   oldApprovalAndRerunsRejected:true,
   ordinaryFreeTestsEnvironmentIsolated:true,
   newGuardForwardedIntoOriginalOneShotRunner:true,
   exactFirstChapterPreflightPassed:true,
   actualOpenAICalls:0,customerRelease:false
  }));
 }finally{
  qa4.run=original;
  for(const [k,v] of Object.entries(previous))
   if(v===undefined)delete process.env[k];else process.env[k]=v;
  fs.rmSync(root,{recursive:true,force:true});
 }
})().catch(e=>{console.error(e);process.exitCode=1});
