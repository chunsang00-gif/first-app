'use strict';
// No actual GitHub calls: exercise fail-closed one-dispatch guard with fake
// history and fake credentials. This test never opens a provider connection.
const assert=require('node:assert/strict');
const g=require('./qa-core-v2-qa3-dispatch-guard');
const oldHash=require('./run-paid-core-v2-qa2').REQUEST_HASH;
const valid={GITHUB_ACTIONS:'true',GITHUB_REPOSITORY:g.REPO,
 GITHUB_REF_NAME:g.BRANCH,GITHUB_RUN_ATTEMPT:'1',GITHUB_RUN_ID:'90001001001',
 GITHUB_WORKFLOW_REF:g.REPO+'/'+g.WORKFLOW+'@refs/heads/'+g.BRANCH,
 GITHUB_TOKEN:'mockgithubtoken',REPORT_QA_CONFIRM:g.APPROVAL};
const previous={id:g.LAST_PREVIOUS_DISPATCH_ID,path:g.WORKFLOW,
 event:'workflow_dispatch',head_branch:g.BRANCH,run_attempt:1,
 created_at:'2026-10-27T23:30:10Z'};
const unrelated={id:90001001000,path:'.github/workflows/some-other-tool.yml',
 event:'workflow_dispatch',head_branch:g.BRANCH,run_attempt:1,
 created_at:'2026-10-28T10:00:00Z'};
const first={id:90001001001,path:g.WORKFLOW,event:'workflow_dispatch',
 head_branch:g.BRANCH,run_attempt:1,created_at:'2026-10-28T10:00:00Z'};
const second={...first,id:90001001002,created_at:'2026-10-28T10:00:30Z'};
function response(items,total=items.length){
 return async(url,options)=>{
  assert(url.includes('/actions/runs?event=workflow_dispatch'));
  assert(url.endsWith('page=1'));
  assert.equal(options.headers.authorization,'Bearer mockgithubtoken');
  return {ok:true,json:async()=>({total_count:total,workflow_runs:items})};
 };
}
async function test(){
 assert.match(g.REQUEST_HASH,/^[0-9a-f]{64}$/);
 assert.notEqual(g.REQUEST_HASH,oldHash);
 assert.notEqual(g.APPROVAL,'QA2');
 assert.notEqual(g.APPROVAL,'RUN_ONE_CORE_V2_APPROVED_ONCE');
 assert.notEqual(g.APPROVAL,'RUN_ONE_UPDATED_CORE_V2_APPROVED_ONCE');
 const passed=await g.check(valid,response([first,previous,unrelated]));
 assert.equal(passed.approved,true);
 assert.equal(passed.providerCalls,0);
 assert.equal(g.LAST_PREVIOUS_DISPATCH_ID,40602551757);
 assert(g.LAST_PREVIOUS_DISPATCH_ID<Number(valid.GITHUB_RUN_ID));
 assert.equal(passed.atMostOneNewQa3Run,true);
 assert.equal(passed.requestHash,g.REQUEST_HASH);
 for(const [label,wrong] of [
  ['old approval',{REPORT_QA_CONFIRM:'QA2'}],
  ['missing approval',{REPORT_QA_CONFIRM:''}],
  ['wrong branch',{GITHUB_REF_NAME:'saju-mbti-app'}],
  ['wrong workflow',{GITHUB_WORKFLOW_REF:valid.GITHUB_WORKFLOW_REF.replace('qa3','qa2')}],
  ['rerun',{GITHUB_RUN_ATTEMPT:'2'}],
  ['changed repo',{GITHUB_REPOSITORY:'other/repo'}],
  ['missing token',{GITHUB_TOKEN:''}],
  ['not Actions',{GITHUB_ACTIONS:'false'}],
  ['invalid run',{GITHUB_RUN_ID:'abc'}]
 ]){
  await assert.rejects(()=>g.check({...valid,...wrong},response([first,previous])),
   /QA3_BILLABLE_DISPATCH_REJECTED/,label);
 }
 for(const [label,runs,total,opts] of [
  ['prior dispatched first',[first,second,previous],3,{...valid,GITHUB_RUN_ID:'90001001002'}],
  ['someone else ran it',[second,previous],2,valid],
  ['restarted job',[{...first,run_attempt:2},previous],2,valid],
  ['wrong branch in history',[{...first,head_branch:'main'},previous],2,valid],
  ['wrong event in history',[{...first,event:'push'},previous],2,valid],
  ['empty history',[],0,valid],
  ['missing history page',[first,previous],3,valid]
 ]){
  await assert.rejects(()=>g.check(opts,response(runs,total)),
   /QA3_BILLABLE_DISPATCH_REJECTED/,label);
 }
 await assert.rejects(()=>g.check(valid,async()=>{throw Error('bad network')}),
  /history-fetch-failed/);
 await assert.rejects(()=>g.check(valid,async()=>({ok:false})),
  /history-fetch-failed/);
 console.log('PASS QA3 fresh request hash, one dispatch only, previous approvals blocked, rerun blocked, missing history blocked; provider calls 0');
}
test().catch(e=>{console.error(e);process.exitCode=1});
