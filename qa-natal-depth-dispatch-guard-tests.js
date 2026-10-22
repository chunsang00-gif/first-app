'use strict';
const assert=require('node:assert/strict');
const {check,PATH,BRANCH}=require('./qa-natal-depth-dispatch-guard');
const base={
 GITHUB_ACTIONS:'true',GITHUB_TOKEN:'OFFLINE_GITHUB_TEST_TOKEN',
 GITHUB_REF_NAME:BRANCH,GITHUB_REPOSITORY:'chunsang00-gif/first-app',
 GITHUB_RUN_ATTEMPT:'1',GITHUB_RUN_ID:'12345',
 GITHUB_WORKFLOW_REF:'chunsang00-gif/first-app/'+PATH+'@refs/heads/'+BRANCH
};
const thisRun={id:12345,path:PATH,event:'workflow_dispatch',
 head_branch:BRANCH,run_attempt:1,status:'in_progress'};
const history=items=>async(url,options)=>{
 assert(url.startsWith('https://api.github.com/repos/chunsang00-gif/first-app/actions/runs?'));
 assert(url.includes('event=workflow_dispatch'));
 assert.equal(options.headers.authorization,'Bearer OFFLINE_GITHUB_TEST_TOKEN');
 return {ok:true,json:async()=>({total_count:items.length,workflow_runs:items})};
};
(async()=>{
 const result=await check(base,history([thisRun]));
 assert.equal(result.allowed,true);
 assert.equal(result.checkedRuns,1);
 const another={id:12344,path:PATH,event:'workflow_dispatch',
  head_branch:BRANCH,run_attempt:1,status:'completed',conclusion:'failure'};
 for(const pastState of ['completed','cancelled','in_progress']){
  await assert.rejects(
   check(base,history([thisRun,{...another,status:pastState}])),
   /previous-natal-depth-dispatch-exists/);
 }
 // Existing dispatches of OTHER workflows do not consume the natal QA quota.
 const other={...another,path:'.github/workflows/paid-report-qa.yml'};
 assert.equal((await check(base,history([thisRun,other]))).allowed,true);
 for(const mutate of [
  {GITHUB_RUN_ATTEMPT:'2'},
  {GITHUB_REF_NAME:'main'},
  {GITHUB_WORKFLOW_REF:'chunsang00-gif/first-app/.github/workflows/paid-report-qa.yml@refs/heads/'+BRANCH},
  {GITHUB_TOKEN:''},
  {GITHUB_RUN_ID:'not-a-number'}
 ]){
  await assert.rejects(check({...base,...mutate},history([thisRun])),
   /QA_NATAL_DEPTH_DISPATCH_BLOCKED/);
 }
 await assert.rejects(check(base,history([other])),/current-run-not-in-history/);
 await assert.rejects(check(base,async()=>{throw Error('offline unavailable');}),
  /history-unavailable/);
 await assert.rejects(check(base,async()=>({ok:false})),/history-http-error/);
 await assert.rejects(check(base,async()=>({ok:true,
  json:async()=>({total_count:1200,workflow_runs:[thisRun]})})),
  /history-incomplete-or-too-large/);
 let pages=0;
 const large=[
  thisRun,...Array.from({length:100},(_,n)=>({
   id:100000+n,path:'.github/workflows/test.yml',event:'workflow_dispatch',
   head_branch:'main',run_attempt:1
  }))
 ];
 assert.equal((await check(base,async(url)=>{
  pages++;
  const page=Number(new URL(url).searchParams.get('page'));
  return {ok:true,json:async()=>({
   total_count:101,workflow_runs:page===1?large.slice(0,100):large.slice(100)
  })};
 })).allowed,true);
 assert.equal(pages,2,'all pages must be checked before permitting a paid call');
 console.log('PASS one-shot GitHub Actions dispatch guard: past failed/cancelled attempts, reruns, spoofed branch and incomplete API history all fail closed; no network');
})().catch(e=>{console.error(e);process.exitCode=1});
