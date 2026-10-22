'use strict';
// GitHub Actions operator QA only. Fail closed before any billable request if
// this workflow was ever dispatched already (including a failed/aborted run).
// A fresh ephemeral checkout must NOT erase the one-shot budget.
const PATH='.github/workflows/paid-natal-depth-qa.yml';
const BRANCH='fix-paid-qa-fact-bindings-20261014';
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
    // Any other run, including failed or canceled, may already have consumed
    // tokens. Never infer safety from a previous run's conclusion.
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
