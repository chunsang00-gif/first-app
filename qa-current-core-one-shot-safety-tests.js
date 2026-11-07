'use strict';
// Offline safety test of the NEW dormant one-call job. No provider keys used.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const qa=require('./qa-current-core-one-shot');
const preflight=require('./qa-current-core-preflight');
const current='f'.repeat(40),runId=42360000000;
const environment={
 GITHUB_ACTIONS:'true',GITHUB_REPOSITORY:'chunsang00-gif/first-app',
 GITHUB_REF_NAME:'fix-paid-qa-fact-bindings-20261014',
 GITHUB_WORKFLOW_REF:'chunsang00-gif/first-app/.github/workflows/paid-report-qa.yml@refs/heads/fix-paid-qa-fact-bindings-20261014',
 GITHUB_SHA:current,GITHUB_RUN_ID:String(runId),GITHUB_RUN_ATTEMPT:'1',
 REPORT_QA_CONFIRM:qa.APPROVAL_PREFIX+current,
 REPORT_MODEL:preflight.MODEL,OPENAI_API_KEY:'placeholder-not-real-secret'.repeat(2),
 GITHUB_TOKEN:'dummy-test-token-only',
 REPORT_QA_OUTPUT:path.join(__dirname,'private-qa-first-chapter.json'),
 NODE_ENV:'test'
};
assert.deepEqual(qa.approval(environment),current);
for(const changed of [
 {...environment,REPORT_QA_CONFIRM:'RUN_ONE_PAID_SAMPLE'},
 {...environment,REPORT_QA_CONFIRM:'QA5'},
 {...environment,REPORT_QA_CONFIRM:qa.APPROVAL_PREFIX+'a'.repeat(40)},
 {...environment,GITHUB_SHA:'b'.repeat(40)},
 {...environment,GITHUB_RUN_ATTEMPT:'2'},
 {...environment,GITHUB_REF_NAME:'main'},
 {...environment,GITHUB_WORKFLOW_REF:'wrong'},
 {...environment,REPORT_MODEL:'gpt-6-luna'},
 {...environment,REPORT_MODEL_URL:'https://example.com'},
 {...environment,PAID_CORE_DEPTH_V2:'offline-preview'},
 {...environment,OPENAI_API_KEY:''},
 {...environment,GITHUB_TOKEN:''}
])assert.throws(()=>qa.approval(changed),/CURRENT_CORE_ONE_CALL_DENIED/,
 'old consent, changed commit, changed model or test flags must block billing');
const matching={id:runId,path:'.github/workflows/paid-report-qa.yml',
 event:'workflow_dispatch',head_branch:environment.GITHUB_REF_NAME,
 run_attempt:1};
const reply=runs=>async()=>({ok:true,json:async()=>({
 total_count:runs.length,workflow_runs:runs})});
(async()=>{
 assert.equal(await qa.guardFirstDispatch(environment,reply([matching])),true);
 for(const bad of [
  [{...matching,run_attempt:2}],
  [{...matching},{...matching,id:runId+1}],
  [{...matching,id:runId+1}],
  [{...matching,head_branch:'main'}]
 ])await assert.rejects(qa.guardFirstDispatch(environment,reply(bad)),
  /CURRENT_CORE_ONE_CALL_DENIED/);
 await assert.rejects(qa.guardFirstDispatch(environment,async()=>({ok:false})),
  /CURRENT_CORE_ONE_CALL_DENIED/);
 const frozen=await preflight.prepare();
 assert.equal(frozen.sha256,qa.FROZEN_REQUEST_SHA256,
  'paid runner must reject any modified real request envelope');
 assert.equal(frozen.providerCalls,0);
 assert.equal(frozen.approvalToCharge,false);
 assert.deepEqual(frozen.sections,['saju_core']);
 const wf=fs.readFileSync(path.join(__dirname,'.github/workflows/paid-report-qa.yml'),'utf8');
 const j=wf.split('  current-normal-core-one-call:')[1];
 assert(j&&j.includes('startsWith(inputs.paid_qa_confirmation')&&
   j.includes(qa.APPROVAL_PREFIX)&&
   j.includes('node qa-current-core-one-shot.js')&&
   j.includes('node report-qa-secure-archive.js encrypt')&&
   j.includes('premium-first-chapter-qa.enc')&&
   j.includes('OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}'),
  'new workflow must remain manual-only and encrypted');
 assert(!j.includes('run-paid-report-qa.js'),
  'old full-report/7-call runner must never be reachable from new job');
 console.log('PASS new normal one-call paid QA dormant without exact fresh consent, frozen envelope, no reruns, no plaintext artifacts and zero provider calls');
})().catch(e=>{console.error(e);process.exitCode=1});
