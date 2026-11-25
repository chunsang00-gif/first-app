'use strict';
// G1 deployment SAFETY test. Every run here is offline, with fake GitHub
// history and a fake secret. No provider network, charge, payment or deploy.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const q=require('./qa-launch-g1-money-single-call');
const pre=require('./qa-launch-g1-money-preflight');
const old=require('./qa-terra-reader-decision-one-shot');
const workflow=fs.readFileSync(path.join(__dirname,q.WORKFLOW),'utf8');
assert(workflow.includes('on:\n  push:\n'));
assert(workflow.includes('paths:\n      - '+q.MARKER));
assert(!/^\s+(?:schedule|workflow_dispatch|pull_request|workflow_run):/m.test(workflow));
assert(!/uses:\s*[^\n]*(?:deploy|render)/i.test(workflow));
assert(workflow.includes('node qa-launch-g1-money-single-call.js'));
assert(workflow.includes('node report-qa-secure-archive.js encrypt'));
assert(workflow.includes('if: always()'));
assert(workflow.includes('premium-first-chapter-qa.enc'));
assert(!fs.existsSync(path.join(__dirname,q.MARKER)),
 'An explicit user-approval marker MUST NOT exist before consent');
assert.throws(()=>q.readMarker(),/explicit-user-approval-marker-absent/);
assert.equal(q.MODEL,'gpt-6-luna');
assert.match(q.REQUEST_SHA,/^[0-9a-f]{64}$/);
assert.notEqual(q.REQUEST_SHA,old.FROZEN_REQUEST_SHA256);
const parent='a'.repeat(40),head='b'.repeat(40);
const marker={kind:'launch-g1-exact-money-first-chapter-user-consent-v1',
 operatorApprovedOneBillableCall:true,model:q.MODEL,requestSha256:q.REQUEST_SHA,
 noRetries:true,noPayment:true,noDeployment:true,
 allowedChapters:['saju_core'],consentSource:'explicit-chat-approval-for-this-g1-call',
 parentCommit:parent};
const env={
 GITHUB_EVENT_NAME:'push',GITHUB_ACTIONS:'true',
 GITHUB_REPOSITORY:'chunsang00-gif/first-app',
 GITHUB_REF_NAME:'fix-paid-qa-fact-bindings-20261014',
 GITHUB_REF:'refs/heads/fix-paid-qa-fact-bindings-20261014',
 GITHUB_WORKFLOW_REF:'chunsang00-gif/first-app/'+q.WORKFLOW+
  '@refs/heads/fix-paid-qa-fact-bindings-20261014',
 GITHUB_RUN_ATTEMPT:'1',GITHUB_RUN_ID:'987654',GITHUB_SHA:head,
 REPORT_MODEL:q.MODEL,NODE_ENV:'test',REPORT_MODEL_URL:'',
 REPORT_QA_OUTPUT:'/tmp/private-qa-first-chapter.json',
 OPENAI_API_KEY:'OFFLINE_FAKE_CANNOT_PAY_FOR_ANY_PROVIDER_REQUEST_1234',
 GITHUB_TOKEN:'OFFLINE_FAKE_TOKEN'
};
const git=args=>({
 'rev-parse HEAD^':parent,
 'diff --name-only HEAD^ HEAD':q.MARKER,
 'rev-parse HEAD':head
})[args.join(' ')];
assert.equal(q.approval(env,{marker,git}),true);
assert.throws(()=>q.approval({...env,GITHUB_RUN_ATTEMPT:'2'},{marker,git}),
 /not-one-exact-approved-marker-push/);
assert.throws(()=>q.approval({...env,GITHUB_EVENT_NAME:'workflow_dispatch'},{marker,git}),
 /not-one-exact-approved-marker-push/);
assert.throws(()=>q.approval({...env,RENDER:'true'},{marker,git}),
 /unsafe-paid-provider-environment/);
assert.throws(()=>q.approval(env,{marker:{...marker,noPayment:false},git}),
 /not-a-single-newly-approved-marker-commit|approval-marker-not-exact/);
// Injected marker above bypasses readMarker format checks: the real
// marker-reader must remain the final exact-schema validator.
assert.throws(()=>q.approval(env,{marker,git:args=>
 args[0]==='diff'?'server.js':git(args)}),
 /not-a-single-newly-approved-marker-commit/);
const one={total_count:1,workflow_runs:[{
 id:987654,event:'push',path:q.WORKFLOW,
 head_branch:env.GITHUB_REF_NAME,head_sha:head,run_attempt:1
}]};
const fake=body=>async(_,opts)=>({
 ok:opts.headers.authorization==='Bearer '+env.GITHUB_TOKEN,
 json:async()=>body
});
(async()=>{
 assert.equal(await q.history(env,fake(one)),true);
 await assert.rejects(()=>q.history(env,fake({...one,total_count:2,
  workflow_runs:[one.workflow_runs[0],{...one.workflow_runs[0],id:987653}]})),
  /first-billable-attempt-already-consumed-or-ambiguous/);
 await assert.rejects(()=>q.history(env,fake({...one,workflow_runs:[
  {...one.workflow_runs[0],run_attempt:2}]})),/workflow-run-identity-drift/);
 await assert.rejects(()=>q.history(env,async()=>({ok:false})),
  /workflow-history-unverifiable/);
 const before={key:process.env.OPENAI_API_KEY,url:process.env.REPORT_MODEL_URL};
 const zero=await pre.inspect();
 const checked=await q.preflight();
 assert.equal(zero.requestSha256,q.REQUEST_SHA);
 assert.equal(checked.hash,q.REQUEST_SHA);
 assert.equal(zero.paidModelCalls,0);
 assert.equal(zero.merchantCalls,0);
 assert.equal(zero.customerSaleApproved,false);
 assert.equal(process.env.OPENAI_API_KEY,before.key);
 assert.equal(process.env.REPORT_MODEL_URL,before.url);
 console.log('PASS LAUNCH G1 dormant approval-only money first chapter runner: exact 1-call hash, archived evidence, no second run, no model/merchant calls');
})().catch(err=>{console.error(err);process.exitCode=1});
