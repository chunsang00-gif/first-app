'use strict';
// Pure local contract tests. No OpenAI key, no paid model, no GitHub writes,
// and no real workflow dispatch. Mock run-history responses only.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const q=require('./qa-terra-reader-decision-one-shot');
const old=require('./qa-terra-first-chapter-one-shot');
const script=fs.readFileSync(path.join(__dirname,
 '.github/workflows/terra-reader-decision-once.yml'),'utf8');
assert(script.includes('workflow_dispatch:'));
assert(!/^\s*(?:push|schedule|pull_request|workflow_run):/m.test(script),
 'paid QA may NEVER have automatic trigger');
assert(script.includes('if: always()')&&
 script.includes('npm test && npm run smoke')&&
 script.includes('terra-reader-decision-first-chapter-encrypted'));
assert(!script.includes('qa-terra-first-chapter-one-shot.js'));
assert.notEqual(q.APPROVAL_PREFIX,old.APPROVAL_PREFIX);
assert.notEqual(q.FROZEN_REQUEST_SHA256,old.FROZEN_REQUEST_SHA256);
assert.equal(q.MODEL,'gpt-6.1-terra');
assert.match(q.FROZEN_REQUEST_SHA256,/^[a-f0-9]{64}$/);
const sha='a'.repeat(40);
const env={
 REPORT_QA_CONFIRM:q.APPROVAL_PREFIX+sha,
 GITHUB_SHA:sha,
 GITHUB_ACTIONS:'true',
 GITHUB_EVENT_NAME:'workflow_dispatch',
 GITHUB_REPOSITORY:'chunsang00-gif/first-app',
 GITHUB_REF_NAME:'fix-paid-qa-fact-bindings-20261014',
 GITHUB_WORKFLOW_REF:
  'chunsang00-gif/first-app/.github/workflows/terra-reader-decision-once.yml'+
  '@refs/heads/fix-paid-qa-fact-bindings-20261014',
 GITHUB_RUN_ATTEMPT:'1',GITHUB_RUN_ID:'987654',
 REPORT_MODEL:'gpt-6.1-terra',NODE_ENV:'test',
 OPENAI_API_KEY:'FAKE_TEST_KEY_THAT_CANNOT_BUY_ANYTHING_123456789',
 GITHUB_TOKEN:'FAKE_ONLY_NOT_A_REAL_GITHUB_TOKEN',
 REPORT_QA_OUTPUT:'/tmp/private-qa-first-chapter.json',
 REPORT_MODEL_URL:''
};
assert.equal(q.approval(env),sha);
assert.throws(()=>q.approval({...env,REPORT_QA_CONFIRM:
 old.APPROVAL_PREFIX+sha}),/new-explicit-exact-commit-consent-required/);
assert.throws(()=>q.approval({...env,REPORT_QA_CONFIRM:
 q.APPROVAL_PREFIX+'b'.repeat(40)}),/new-explicit-exact-commit-consent-required/);
assert.throws(()=>q.approval({...env,GITHUB_RUN_ATTEMPT:'2'}),
 /new-explicit-exact-commit-consent-required/);
assert.throws(()=>q.approval({...env,GITHUB_EVENT_NAME:'push'}),
 /new-explicit-exact-commit-consent-required/);
assert.throws(()=>q.approval({...env,RENDER:'true'}),/unsafe-provider-environment/);
const one={total_count:1,workflow_runs:[{
 id:987654,event:'workflow_dispatch',
 path:'.github/workflows/terra-reader-decision-once.yml',
 head_branch:env.GITHUB_REF_NAME,head_sha:sha,run_attempt:1
}]};
function answer(body){
 return async(_url,opts)=>({
  ok:opts?.headers?.authorization==='Bearer '+env.GITHUB_TOKEN,
  json:async()=>body
 });
}
(async()=>{
 assert.equal(await q.guardFirstDispatch(env,answer(one)),true);
 await assert.rejects(()=>q.guardFirstDispatch(env,answer({
  ...one,total_count:2,workflow_runs:[one.workflow_runs[0],
   {...one.workflow_runs[0],id:987653}]
 })),/manual-dispatch-already-consumed/);
 await assert.rejects(()=>q.guardFirstDispatch(env,answer({
  ...one,workflow_runs:[{...one.workflow_runs[0],run_attempt:2}]
 })),/manual-dispatch-identity-mismatch/);
 await assert.rejects(()=>q.guardFirstDispatch(env,async()=>({ok:false})),
  /workflow-history-request-failed/);
 const checked=await q.preflight();
 assert.equal(checked.requestHash,q.FROZEN_REQUEST_SHA256);
 assert.equal(typeof checked.prompt,'object');
 assert.equal(checked.prompt.stage,'body');
 assert.deepEqual(checked.prompt.requestedSections,['saju_core']);
 console.log('PASS second Terra single-use workflow: consent SHA, old approval rejected, duplicate dispatch rejected, exact new request hash preflight; providerCalls=0');
})().catch(err=>{console.error(err);process.exitCode=1});
