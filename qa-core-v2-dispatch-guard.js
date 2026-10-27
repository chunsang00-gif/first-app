'use strict';
// Dedicated one-shot V2 QA guard for the EXISTING, already registered
// paid-report workflow. Historical V1 dispatches are never treated as a
// fresh V2 approval. Every newer dispatch, failed or aborted, burns the
// V2 one-shot slot. A repeat never makes a provider request.
const WORKFLOW='.github/workflows/paid-report-qa.yml';
const BRANCH='fix-paid-qa-fact-bindings-20261014';
const ACTIVATED='2026-10-27T03:26:00Z';
const APPROVAL='RUN_ONE_CORE_V2_APPROVED_ONCE';
async function check(env=process.env,request=global.fetch){
 const reject=x=>{throw Error('CORE_V2_PAID_DISPATCH_REJECTED:'+x)};
 if(env.GITHUB_ACTIONS!=='true'||!env.GITHUB_TOKEN||
    env.GITHUB_REPOSITORY!=='chunsang00-gif/first-app'||
    env.GITHUB_REF_NAME!==BRANCH||env.GITHUB_RUN_ATTEMPT!=='1'||
    env.REPORT_QA_CONFIRM!==APPROVAL||
    !/^\d+$/.test(env.GITHUB_RUN_ID||'')||
    env.GITHUB_WORKFLOW_REF!==env.GITHUB_REPOSITORY+'/'+WORKFLOW+
      '@refs/heads/'+BRANCH)
  reject('unauthorized-workflow-or-repeat');
 if(typeof request!=='function')reject('history-unavailable');
 const id=Number(env.GITHUB_RUN_ID);
 if(!Number.isSafeInteger(id))reject('invalid-run-id');
 const headers={authorization:'Bearer '+env.GITHUB_TOKEN,
  accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
 let seen=0,total=null,current=0;
 for(let page=1;page<=10;page++){
  let response,history;
  try{response=await request('https://api.github.com/repos/'+
    env.GITHUB_REPOSITORY+'/actions/runs?event=workflow_dispatch&per_page=100&page='+page,
    {headers});
   if(!response?.ok)reject('history-http');
   history=await response.json();
  }catch(e){reject('history-unreadable');}
  if(!Number.isInteger(history?.total_count)||history.total_count<1||
     history.total_count>1000||!Array.isArray(history.workflow_runs)||
     (total!==null&&total!==history.total_count))
   reject('history-incomplete');
  total=history.total_count;
  if(!history.workflow_runs.length)reject('history-empty-page');
  for(const item of history.workflow_runs){
   if(item.path!==WORKFLOW)continue;
   if(item.id===id){
    if(item.head_branch!==BRANCH||
       item.event!=='workflow_dispatch'||
       item.run_attempt!==1||
       Date.parse(item.created_at)<Date.parse(ACTIVATED))
     reject('wrong-current-run');
    current++;
   }else if(Date.parse(item.created_at)>=Date.parse(ACTIVATED)||
            !Number.isFinite(Date.parse(item.created_at))){
    reject('another-post-v2-paid-dispatch-exists');
   }
  }
  seen+=history.workflow_runs.length;
  if(seen>=total)break;
  if(page===10)reject('history-not-exhaustive');
 }
 if(current!==1||seen<total)reject('current-run-not-uniquely-present');
 return {allowed:true,checkedRuns:seen,existingV2Dispatches:0};
}
if(require.main===module)check().then(v=>
 console.log('PASS one-shot V2 first-chapter workflow history, no previous V2 dispatch')
).catch(e=>{console.error(String(e.message||e));process.exitCode=1});
module.exports={check,WORKFLOW,BRANCH,APPROVAL,ACTIVATED};
