'use strict';
// New billing consent is per REQUEST HASH, never implied by "next" or by
// the now-consumed QA1/QA2 approvals. This checks one unique run of the
// dedicated workflow, including a rerun/failed-run attempt. No provider call.
const REPO='chunsang00-gif/first-app';
const BRANCH='fix-paid-qa-fact-bindings-20261014';
const WORKFLOW='.github/workflows/paid-report-qa.yml';
// Last already-consumed QA2 payment attempt; QA3 must be newer.
const LAST_PREVIOUS_DISPATCH_ID=40602551757;
const APPROVAL='QA3_20261028_ONE_CHARGE_CONFIRMED';
const REQUEST_HASH='03f2b0c195706e5366466a6ea7781d1742b5f2651f201de8a0a1faf6148ad7f2';
function reject(s){throw Error('QA3_BILLABLE_DISPATCH_REJECTED:'+s)}
async function check(env=process.env,request=global.fetch){
 if(env.GITHUB_ACTIONS!=='true'||env.GITHUB_REPOSITORY!==REPO||
    env.GITHUB_REF_NAME!==BRANCH||
    env.GITHUB_RUN_ATTEMPT!=='1'||
    env.GITHUB_WORKFLOW_REF!==REPO+'/'+WORKFLOW+'@refs/heads/'+BRANCH||
    env.REPORT_QA_CONFIRM!==APPROVAL||
    !/^[1-9][0-9]*$/.test(env.GITHUB_RUN_ID||'')||
    !env.GITHUB_TOKEN||env.GITHUB_TOKEN.length<8)
  reject('missing-new-explicit-approval-or-workflow');
 const current=Number(env.GITHUB_RUN_ID);
 if(!Number.isSafeInteger(current)||current<=LAST_PREVIOUS_DISPATCH_ID||
    typeof request!=='function')
  reject('invalid-run-or-previous-approval');
 // Filter by workflow PATH in the complete authorized dispatch history.
 // Avoid a separate workflow that is not on GitHub's default branch and
 // therefore might not be manually dispatchable.
 const url='https://api.github.com/repos/'+REPO+
  '/actions/runs?event=workflow_dispatch&per_page=100&page=';
 const headers={authorization:'Bearer '+env.GITHUB_TOKEN,
  accept:'application/vnd.github+json',
  'X-GitHub-Api-Version':'2022-11-28'};
 // The first dispatch consumes this approval WHETHER IT BILLS OR FAILS.
 // Never query only successful runs or accept missing/incomplete history.
 let total=null,seen=0,matching=0;
 for(let page=1;page<=10;page++){
  let response,data;
  try{
   response=await request(url+page,{headers});
   if(!response?.ok)reject('history-http-unavailable');
   data=await response.json();
  }catch{reject('history-fetch-failed')}
  if(!Number.isInteger(data?.total_count)||data.total_count<1||
     data.total_count>1000||!Array.isArray(data.workflow_runs)||
     data.workflow_runs.length===0||
     (total!==null&&total!==data.total_count))
   reject('incomplete-or-changed-run-history');
  total=data.total_count;
  for(const run of data.workflow_runs){
   if(run.path!==WORKFLOW)continue;
   if(!Number.isInteger(run.id)||
      !Number.isFinite(Date.parse(run.created_at)))
    reject('invalid-paid-workflow-history');
   if(run.id<=LAST_PREVIOUS_DISPATCH_ID)continue;
   if(run.event!=='workflow_dispatch'||run.head_branch!==BRANCH||
      run.id!==current||run.run_attempt!==1)
    reject('prior-or-other-qa3-attempt-present');
   matching++;
  }
  seen+=data.workflow_runs.length;
  if(seen>=total)break;
  if(page===10)reject('history-exceeded-fail-closed-limit');
 }
 if(seen!==total||matching!==1)
  reject('qa3-not-exactly-one-unique-first-attempt');
 return {approved:true,providerCalls:0,atMostOneNewQa3Run:true,
  requestHash:REQUEST_HASH,oldApprovalsConsumed:true};
}
if(require.main===module)check().then(x=>
 console.log('QA3_BILLABLE_PRE_DISPATCH_GUARD='+JSON.stringify(x)))
 .catch(e=>{console.error(e.message);process.exitCode=1});
module.exports={check,REPO,BRANCH,WORKFLOW,APPROVAL,REQUEST_HASH,LAST_PREVIOUS_DISPATCH_ID};
