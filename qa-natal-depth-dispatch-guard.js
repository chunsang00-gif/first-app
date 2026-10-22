'use strict';
// GitHub Actions operator QA only. Fail closed before any billable request if
// this workflow was ever dispatched already (including a failed/aborted run).
// A fresh ephemeral checkout must NOT erase the one-shot budget.
const PATH='.github/workflows/paid-natal-depth-qa.yml';
const BRANCH='fix-paid-qa-fact-bindings-20261014';
// The first registered manual run was mistakenly launched from the
// workflow-registration branch, so GitHub skipped its ONLY job (0 steps).
// Exception is tied to this verified exact run, never to all skipped runs.
const VERIFIED_ZERO_COST_SKIP=Object.freeze({
 id:39753002399,head_branch:'register-natal-depth-qa-workflow-20261022'
});
async function isVerifiedSkippedRun(run,request,headers,repository){
 if(run.id!==VERIFIED_ZERO_COST_SKIP.id||
    run.head_branch!==VERIFIED_ZERO_COST_SKIP.head_branch||
    run.event!=='workflow_dispatch'||run.status!=='completed'||
    run.conclusion!=='skipped'||run.run_attempt!==1)return false;
 let reply,payload;
 try{
  reply=await request('https://api.github.com/repos/'+repository+
   '/actions/runs/'+run.id+'/jobs?per_page=100',{headers});
  if(!reply?.ok)return false;
  payload=await reply.json();
 }catch{return false;}
 return payload?.total_count===1&&payload.jobs?.length===1&&
  payload.jobs[0].name==='natal-depth-qa'&&
  payload.jobs[0].status==='completed'&&
  payload.jobs[0].conclusion==='skipped'&&
  payload.jobs[0].run_attempt===1&&
  Array.isArray(payload.jobs[0].steps)&&payload.jobs[0].steps.length===0;
}
async function check(env=process.env,request=global.fetch){
 const reject=reason=>{throw Error('QA_NATAL_DEPTH_DISPATCH_BLOCKED:'+reason);};
 if(env.GITHUB_ACTIONS!=='true'||!env.GITHUB_TOKEN||
    env.GITHUB_REF_NAME!==BRANCH||
    env.GITHUB_REPOSITORY!=='chunsang00-gif/first-app'||
    env.GITHUB_RUN_ATTEMPT!=='1'||
    !/^\d+$/.test(env.GITHUB_RUN_ID||'')||
    env.GITHUB_WORKFLOW_REF!==
      env.GITHUB_REPOSITORY+'/'+PATH+'@refs/heads/'+BRANCH)
  reject('workflow-identity-or-authorization');
 if(typeof request!=='function')reject('github-api-unavailable');
 const current=Number(env.GITHUB_RUN_ID);
 if(!Number.isSafeInteger(current)||current<=0)reject('invalid-run-id');
 const headers={
  authorization:'Bearer '+env.GITHUB_TOKEN,
  accept:'application/vnd.github+json',
  'X-GitHub-Api-Version':'2022-11-28'
 };
 let foundCurrent=false,seen=0,total=null;
 for(let page=1;page<=10;page++){
  const url='https://api.github.com/repos/'+env.GITHUB_REPOSITORY+
   '/actions/runs?event=workflow_dispatch&per_page=100&page='+page;
  let response;
  try{response=await request(url,{headers});}
  catch{reject('history-unavailable');}
  if(!response?.ok)reject('history-http-error');
  let payload;
  try{payload=await response.json();}
  catch{reject('history-invalid-json');}
  if(!Array.isArray(payload?.workflow_runs)||
     !Number.isInteger(payload.total_count)||
     payload.total_count<1||payload.total_count>1000)
   reject('history-incomplete-or-too-large');
  if(total!==null&&payload.total_count!==total)reject('history-changed');
  total=payload.total_count;
  if(payload.workflow_runs.length===0)reject('missing-history-page');
  seen+=payload.workflow_runs.length;
  for(const run of payload.workflow_runs){
   if(run.path!==PATH)continue;
   if(run.id===current){
    if(run.event!=='workflow_dispatch'||run.head_branch!==BRANCH||
       run.run_attempt!==1)reject('current-run-mismatch');
    foundCurrent=true;
   }else{
    // Reject all older dispatches except the independently checked, exact
    // wrong-branch job that GitHub skipped BEFORE running any code.
    if(await isVerifiedSkippedRun(run,request,headers,env.GITHUB_REPOSITORY))
     continue;
    reject('previous-natal-depth-dispatch-exists');
   }
  }
  if(seen>=total)break;
  if(page===10)reject('history-not-exhaustive');
 }
 if(!foundCurrent)reject('current-run-not-in-history');
 return {allowed:true,checkedRuns:seen,previousDispatches:0};
}
if(require.main===module)check().then(x=>
 console.log('PASS exact approved natal-depth workflow: no previous dispatch; checked '+x.checkedRuns+
 ' GitHub runs; no model provider called')
).catch(e=>{console.error(String(e.message||e));process.exitCode=1;});
module.exports={check,PATH,BRANCH};
