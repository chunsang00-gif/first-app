'use strict';
// New research request only. Historic QA3 consent is irrevocably consumed.
// The new feature-branch job now requires owner workflow_dispatch with an
// exact new approval. The default-branch registration stub cannot bill.
// This guard independently enforces one dispatch, never a retry.
const REPO='chunsang00-gif/first-app';
const BRANCH='fix-paid-qa-fact-bindings-20261014';
const WORKFLOW='.github/workflows/qa4-claimlinked-paid.yml';
const APPROVAL='QA4_CLAIM_LINKED_ONE_NEW_REQUEST_ONLY';
const REQUEST_HASH='9e5c729912c3ff8de023c170a8513c06485466e6e6ae7bba82aed56920e49808';
const PREVIOUS_CONSUMED_RUN=40633333735;
function refuse(reason){throw Error('QA4_CLAIMLINKED_DISPATCH_REJECTED:'+reason)}
async function check(env=process.env,request=global.fetch){
 if(env.GITHUB_ACTIONS!=='true'||env.GITHUB_REPOSITORY!==REPO||
    env.GITHUB_REF_NAME!==BRANCH||env.GITHUB_RUN_ATTEMPT!=='1'||
    env.GITHUB_WORKFLOW_REF!==REPO+'/'+WORKFLOW+'@refs/heads/'+BRANCH||
    env.REPORT_QA_CONFIRM!==APPROVAL||
    env.REPORT_QA_REQUEST_SHA256!==REQUEST_HASH||
    !/^[1-9][0-9]*$/.test(env.GITHUB_RUN_ID||'')||
    !env.GITHUB_TOKEN||env.GITHUB_TOKEN.length<8)
  refuse('no-fresh-exact-consent-or-protected-workflow');
 const current=Number(env.GITHUB_RUN_ID);
 if(!Number.isSafeInteger(current)||current<=PREVIOUS_CONSUMED_RUN||
   typeof request!=='function')refuse('invalid-new-run');
 const url='https://api.github.com/repos/'+REPO+
   '/actions/runs?event=workflow_dispatch&per_page=100&page=';
 const headers={authorization:'Bearer '+env.GITHUB_TOKEN,
  accept:'application/vnd.github+json',
  'X-GitHub-Api-Version':'2022-11-28'};
 let total=null,seen=0,found=0;
 for(let page=1;page<=10;page++){
  let response,data;
  try{
   response=await request(url+page,{headers});
   if(!response?.ok)refuse('history-http-failed');
   data=await response.json();
  }catch{refuse('history-query-failed')}
  if(!Number.isInteger(data?.total_count)||data.total_count<1||
     data.total_count>1000||!Array.isArray(data.workflow_runs)||
     data.workflow_runs.length<1||
     (total!==null&&total!==data.total_count))
   refuse('history-incomplete-or-changed');
  total=data.total_count;
  for(const run of data.workflow_runs){
   if(run.path!==WORKFLOW)continue;
   if(!Number.isSafeInteger(run.id)||
      !Number.isFinite(Date.parse(run.created_at)))
    refuse('bad-qa4-history');
   // A failed or canceled QA4 dispatch consumes the attempt as well.
   if(run.id!==current||run.event!=='workflow_dispatch'||
      run.head_branch!==BRANCH||run.run_attempt!==1)
    refuse('previous-or-concurrent-qa4-attempt');
   found++;
  }
  seen+=data.workflow_runs.length;
  if(seen>=total)break;
  if(page===10)refuse('history-page-limit');
 }
 if(seen!==total||found!==1)refuse('not-exactly-one-new-dispatch');
 return {researchRequestHash:REQUEST_HASH,providerCalls:0,
  approvalIsPerExactNewHash:true,previousApprovalConsumed:true,
  noRetries:true,canRelease:false};
}
module.exports={check,REPO,BRANCH,WORKFLOW,APPROVAL,REQUEST_HASH,PREVIOUS_CONSUMED_RUN};
