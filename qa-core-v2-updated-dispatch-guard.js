'use strict';
// Separate one-shot authorization for NEW V2 guidance. Never borrow the
// previous 2026-10-27 paid V2 workflow approval. Fail closed on incomplete
// GitHub history; any prior dispatch of THIS workflow consumes its slot.
const WORKFLOW='.github/workflows/paid-report-qa.yml';
const BRANCH='fix-paid-qa-fact-bindings-20261014';
const APPROVAL='RUN_ONE_UPDATED_CORE_V2_APPROVED_ONCE';
// Existing registered workflow previously ran paid V2 on 2026-10-27 05:21 UTC.
// This new independent opt-in starts afterwards; never reuses old consent.
const ACTIVATED='2026-10-27T05:23:00Z';
async function check(env=process.env,request=global.fetch){
 const reject=x=>{throw Error('UPDATED_CORE_V2_PAID_DISPATCH_REJECTED:'+x)};
 if(env.GITHUB_ACTIONS!=='true'||!env.GITHUB_TOKEN||
    env.GITHUB_REPOSITORY!=='chunsang00-gif/first-app'||
    env.GITHUB_REF_NAME!==BRANCH||env.GITHUB_RUN_ATTEMPT!=='1'||
    env.REPORT_QA_CONFIRM!==APPROVAL||
    !/^\d+$/.test(env.GITHUB_RUN_ID||'')||
    env.GITHUB_WORKFLOW_REF!==env.GITHUB_REPOSITORY+'/'+WORKFLOW+
      '@refs/heads/'+BRANCH)
  reject('unauthorized-workflow-or-repeat');
 if(typeof request!=='function')reject('history-unavailable');
 const currentId=Number(env.GITHUB_RUN_ID);
 if(!Number.isSafeInteger(currentId))reject('invalid-run-id');
 const headers={authorization:'Bearer '+env.GITHUB_TOKEN,
  accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
 let seen=0,total=null,matches=0;
 for(let page=1;page<=10;page++){
  let r,d;
  try{
   r=await request('https://api.github.com/repos/'+
    env.GITHUB_REPOSITORY+
    '/actions/runs?event=workflow_dispatch&per_page=100&page='+page,
    {headers});
   if(!r?.ok)reject('history-http');
   d=await r.json();
  }catch(e){reject('history-unreadable');}
  if(!Number.isInteger(d?.total_count)||d.total_count<1||
     d.total_count>1000||!Array.isArray(d.workflow_runs)||
     (total!==null&&total!==d.total_count)||
     !d.workflow_runs.length)
   reject('history-incomplete');
  total=d.total_count;
  for(const item of d.workflow_runs){
   if(item.path!==WORKFLOW)continue;
   if(!Number.isFinite(Date.parse(item.created_at)))reject('invalid-run-date');
   if(Date.parse(item.created_at)<Date.parse(ACTIVATED))continue;
   if(item.id!==currentId)reject('previous-or-concurrent-dispatch-exists');
   if(item.head_branch!==BRANCH||item.event!=='workflow_dispatch'||
      item.run_attempt!==1)
    reject('wrong-current-run');
   matches++;
  }
  seen+=d.workflow_runs.length;
  if(seen>=total)break;
  if(page===10)reject('history-not-exhaustive');
 }
 if(matches!==1||seen<total)reject('current-run-not-unique-or-history-incomplete');
 return {allowed:true,checkedRuns:seen,workflowDispatchCount:1,
  authorization:'new-separate-approval',providerCalls:0};
}
if(require.main===module)check().then(()=>
 console.log('PASS new V2 updated-guidance one-shot dispatch, no prior run'))
 .catch(e=>{console.error(String(e?.message||e));process.exitCode=1;});
module.exports={check,WORKFLOW,BRANCH,APPROVAL};
