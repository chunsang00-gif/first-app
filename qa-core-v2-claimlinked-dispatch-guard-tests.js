'use strict';
// All synthetic GitHub results; ZERO external requests, ZERO billing.
const assert=require('node:assert/strict');
const guard=require('./qa-core-v2-claimlinked-dispatch-guard');
const old=require('./qa-core-v2-qa3-dispatch-guard');
const valid={GITHUB_ACTIONS:'true',GITHUB_REPOSITORY:guard.REPO,
 GITHUB_REF_NAME:guard.BRANCH,GITHUB_RUN_ATTEMPT:'1',
 GITHUB_RUN_ID:'90006661001',
 GITHUB_WORKFLOW_REF:guard.REPO+'/'+guard.WORKFLOW+
  '@refs/heads/'+guard.BRANCH,
 GITHUB_TOKEN:'mock-github-token-1234567890',
 REPORT_QA_CONFIRM:guard.APPROVAL,
 REPORT_QA_REQUEST_SHA256:guard.REQUEST_HASH};
const current={id:90006661001,path:guard.WORKFLOW,
 event:'workflow_dispatch',head_branch:guard.BRANCH,run_attempt:1,
 created_at:'2026-10-28T09:15:00Z'};
const earlier={id:40633333735,path:old.WORKFLOW,
 event:'workflow_dispatch',head_branch:old.BRANCH,run_attempt:1,
 created_at:'2026-10-28T04:37:06Z'};
const duplicate={...current,id:90006661002,created_at:'2026-10-28T09:15:10Z'};
function response(rows,total=rows.length){
 return async(url,options)=>{
  assert(url.includes('/actions/runs?event=workflow_dispatch'));
  assert(url.endsWith('page=1'));
  assert.equal(options.headers.authorization,'Bearer '+valid.GITHUB_TOKEN);
  return {ok:true,json:async()=>({workflow_runs:rows,total_count:total})};
 };
}
(async()=>{
 assert.match(guard.REQUEST_HASH,/^[a-f0-9]{64}$/);
 assert.notEqual(guard.REQUEST_HASH,old.REQUEST_HASH);
 assert.notEqual(guard.APPROVAL,old.APPROVAL);
 assert(guard.PREVIOUS_CONSUMED_RUN<Number(valid.GITHUB_RUN_ID));
 const checked=await guard.check(valid,response([current,earlier]));
 assert.equal(checked.providerCalls,0);
 assert.equal(checked.noRetries,true);
 assert.equal(checked.canRelease,false);
 for(const [label,patch] of [
  ['consumed old approval',{REPORT_QA_CONFIRM:old.APPROVAL}],
  ['no explicit consent',{REPORT_QA_CONFIRM:''}],
  ['old SHA',{REPORT_QA_REQUEST_SHA256:old.REQUEST_HASH}],
  ['different branch',{GITHUB_REF_NAME:'saju-mbti-app'}],
  ['wrong workflow',{GITHUB_WORKFLOW_REF:'someone/else'}],
  ['rerun',{GITHUB_RUN_ATTEMPT:'2'}],
  ['missing token',{GITHUB_TOKEN:''}],
  ['missing actions',{GITHUB_ACTIONS:'false'}],
  ['different user repo',{GITHUB_REPOSITORY:'other/repo'}]
 ]){
  await assert.rejects(guard.check({...valid,...patch},response([current,earlier])),
   /QA4_CLAIMLINKED_DISPATCH_REJECTED/,label);
 }
 for(const [label,rows,total,v] of [
  ['second request',[duplicate,current,earlier],3,
   {...valid,GITHUB_RUN_ID:String(duplicate.id)}],
  ['someone else already ran it',[duplicate,earlier],2,valid],
  ['new run restarted',[{...current,run_attempt:2},earlier],2,valid],
  ['empty history',[],0,valid],
  ['incomplete history',[current,earlier],3,valid],
  ['untrusted branch',[{...current,head_branch:'main'},earlier],2,valid]
 ]){
  await assert.rejects(guard.check(v,response(rows,total)),
   /QA4_CLAIMLINKED_DISPATCH_REJECTED/,label);
 }
 await assert.rejects(guard.check(valid,async()=>{throw Error('network')}),
  /QA4_CLAIMLINKED_DISPATCH_REJECTED/);
 console.log('QA4_NEW_EXACT_HASH_CONSENT_GUARD='+JSON.stringify({
  uniqueNewHash:true,oldApprovalSpent:true,retryAndOtherDispatchBlocked:true,
  historyFailureClosed:true,noProviderCalls:true,
  customerReady:false
 }));
})().catch(e=>{console.error(e);process.exitCode=1});
