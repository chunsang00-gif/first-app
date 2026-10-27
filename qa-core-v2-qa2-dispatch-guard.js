'use strict';
// QA2 uses NEW consent. Previous approved V2 requests are historical and
// cannot authorize QA2. Fail CLOSED for duplicate, missing or partial history.
const WORKFLOW='.github/workflows/paid-report-qa.yml';
const BRANCH='fix-paid-qa-fact-bindings-20261014';
const APPROVAL='QA2';
// The previous paid workflow was dispatched at 2026-10-27T11:04:20Z;
// protect it; only the first subsequent dispatch can be QA2.
const ACTIVATED='2026-10-27T11:06:00Z';
const LAST_PREVIOUS_DISPATCH_ID=40493356373;
async function check(env=process.env,request=global.fetch){
 const reject=message=>{throw Error('QA2_DISPATCH_REJECTED:'+message)};
 if(env.GITHUB_ACTIONS!=='true'||!env.GITHUB_TOKEN||
    env.GITHUB_REPOSITORY!=='chunsang00-gif/first-app'||
    env.GITHUB_REF_NAME!==BRANCH||env.GITHUB_RUN_ATTEMPT!=='1'||
    env.REPORT_QA_CONFIRM!==APPROVAL||
    env.GITHUB_WORKFLOW_REF!==env.GITHUB_REPOSITORY+'/'+WORKFLOW+
      '@refs/heads/'+BRANCH||
    !/^\d+$/.test(env.GITHUB_RUN_ID||''))reject('wrong-workflow-or-approval');
 const current=Number(env.GITHUB_RUN_ID);
 if(!Number.isSafeInteger(current)||current<=LAST_PREVIOUS_DISPATCH_ID)
  reject('not-newer-than-consumed-approval');
 if(typeof request!=='function')reject('unavailable-history');
 const headers={authorization:'Bearer '+env.GITHUB_TOKEN,
  accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
 let count=0,total=null,matched=0;
 for(let page=1;page<=10;page++){
  let response,data;
  try{
   response=await request('https://api.github.com/repos/'+
    env.GITHUB_REPOSITORY+
    '/actions/runs?event=workflow_dispatch&per_page=100&page='+page,
    {headers});
   if(!response?.ok)reject('history-http');
   data=await response.json();
  }catch(e){reject('history-fetch-failed')}
  if(!Number.isInteger(data?.total_count)||data.total_count<1||
     data.total_count>1000||!Array.isArray(data.workflow_runs)||
     !data.workflow_runs.length||
     total!==null&&total!==data.total_count)reject('history-incomplete');
  total=data.total_count;
  for(const item of data.workflow_runs){
   if(item.path!==WORKFLOW)continue;
   if(!Number.isInteger(item.id)||!Number.isFinite(Date.parse(item.created_at)))
    reject('incomplete-run');
   if(item.id<=LAST_PREVIOUS_DISPATCH_ID)continue;
   if(Date.parse(item.created_at)<Date.parse(ACTIVATED))
    reject('post-consumption-history-corrupt');
   if(item.id!==current)reject('another-qa2-era-dispatch-exists');
   if(item.run_attempt!==1||item.event!=='workflow_dispatch'||
      item.head_branch!==BRANCH)
    reject('current-not-exact-dispatch');
   matched++;
  }
  count+=data.workflow_runs.length;
  if(count>=total)break;
  if(page===10)reject('history-too-long');
 }
 if(count!==total||matched!==1)reject('not-unique-or-incomplete');
 return {approved:true,providerCalls:0,qa2Dispatches:1,checkedRuns:count};
}
if(require.main===module)check().then(()=>
 console.log('PASS QA2 separate consent, only first-new dispatch, zero provider requests'))
 .catch(e=>{console.error(String(e.message||e));process.exitCode=1});
module.exports={check,WORKFLOW,BRANCH,APPROVAL,ACTIVATED};
