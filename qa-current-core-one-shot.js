'use strict';
// DORMANT until a human separately authorizes one request at one commit.
// The first workflow_dispatch attempt consumes consent even if API fails.
// Only normal production first chapter; NO historical QA flags or retries.
const fs=require('node:fs'),path=require('node:path');
const readiness=require('./qa-current-core-preflight');
const archive=require('./report-qa-secure-archive');
const contract=require('./report-server-contract');
const generation=require('./report-generation-request');
const {callOpenAI}=require('./server');
const REPO='chunsang00-gif/first-app';
const BRANCH='fix-paid-qa-fact-bindings-20261014';
const WORKFLOW='.github/workflows/paid-report-qa.yml';
const APPROVAL_PREFIX='QA_CURRENT_CORE_20261107_ONE_PAID_CALL_';
const BEFORE_LATEST_DISPATCH=40633333735;
const FROZEN_REQUEST_SHA256='dd5c1a38775aaab052363a41c2ddab7ea7336d8db456140442bc0bb78eda6170';
const SUCCESS='CURRENT_CORE_FIRST_CHAPTER_VALIDATED_STOP_NOW';
const deny=code=>{throw Error('CURRENT_CORE_ONE_CALL_DENIED:'+code)};
function approval(env=process.env){
 const code=env.REPORT_QA_CONFIRM||'';
 const approvedCommit=code.startsWith(APPROVAL_PREFIX)?
  code.slice(APPROVAL_PREFIX.length):'';
 if(!/^[0-9a-f]{40}$/.test(approvedCommit)||!env.GITHUB_SHA||
    approvedCommit!==env.GITHUB_SHA||
    env.GITHUB_REPOSITORY!==REPO||env.GITHUB_REF_NAME!==BRANCH||
    env.GITHUB_WORKFLOW_REF!==REPO+'/'+WORKFLOW+'@refs/heads/'+BRANCH||
    env.GITHUB_ACTIONS!=='true'||env.GITHUB_RUN_ATTEMPT!=='1'||
    !/^[1-9][0-9]*$/.test(env.GITHUB_RUN_ID||''))
  deny('explicit-consent-for-the-exact-feature-branch-commit-is-required');
 if(!/^[a-f0-9]{64}$/.test(FROZEN_REQUEST_SHA256))
  deny('request-hash-not-frozen');
 if(env.REPORT_MODEL!==readiness.MODEL||
    !env.OPENAI_API_KEY||env.OPENAI_API_KEY.length<32||
    env.REPORT_MODEL_URL||env.RENDER==='true'||
    env.PAID_CORE_DEPTH_V2||env.QA_NATAL_DEPTH_PREVIEW||
    env.PAID_CORE_V2_CLASSICAL_WRITER||
    env.PAID_CORE_V2_CLAIM_LINKS)
  deny('wrong-provider-or-unsafe-qa-environment');
 if(!env.GITHUB_TOKEN||env.GITHUB_TOKEN.length<8)
  deny('workflow-history-token-required');
 if(!path.isAbsolute(env.REPORT_QA_OUTPUT||'')||
    path.basename(env.REPORT_QA_OUTPUT)!=='private-qa-first-chapter.json'||
    !fs.existsSync(path.dirname(env.REPORT_QA_OUTPUT)))
  deny('private-artifact-location-required');
 return approvedCommit;
}
async function guardFirstDispatch(env=process.env,request=global.fetch){
 const runId=Number(env.GITHUB_RUN_ID);
 if(!Number.isSafeInteger(runId)||runId<=BEFORE_LATEST_DISPATCH||
    typeof request!=='function')deny('invalid-run-id');
 // List every dispatch run, not just successful ones. Any other dispatch
 // of the shared workflow AFTER the prepared cutoff consumes this slot.
 const base='https://api.github.com/repos/'+REPO+
  '/actions/runs?event=workflow_dispatch&per_page=100&page=';
 const headers={authorization:'Bearer '+env.GITHUB_TOKEN,
  accept:'application/vnd.github+json',
  'X-GitHub-Api-Version':'2022-11-28'};
 let total=null,count=0,found=0;
 for(let page=1;page<=10;page++){
  let response,body;
  try{response=await request(base+page,{headers});
   if(!response?.ok)deny('workflow-history-unavailable');
   body=await response.json();
  }catch{deny('workflow-history-request-failed')}
  if(!Number.isInteger(body?.total_count)||body.total_count<1||
    body.total_count>1000||!Array.isArray(body.workflow_runs)||
    !body.workflow_runs.length||
    (total!==null&&total!==body.total_count))
   deny('incomplete-dispatch-history');
  total=body.total_count;
  for(const x of body.workflow_runs){
   if(x.path!==WORKFLOW||x.id<=BEFORE_LATEST_DISPATCH)continue;
   if(x.id!==runId||x.event!=='workflow_dispatch'||
       x.head_branch!==BRANCH||x.run_attempt!==1)
    deny('another-attempt-already-consumed-this-approval-slot');
   found++;
  }
  count+=body.workflow_runs.length;
  if(count>=total)break;
 }
 if(count!==total||found!==1)deny('not-one-and-only-dispatch');
 return true;
}
function writeOnce(file,data){
 if(!archive.NAMES.includes(path.basename(file)))
  deny('archive-manifest-will-not-save-this-file');
 const fd=fs.openSync(file,'wx',0o600);
 try{fs.writeFileSync(fd,JSON.stringify(data,null,2));fs.fsyncSync(fd)}
 finally{fs.closeSync(fd)}
}
async function run(){
 const env=process.env;
 approval(env);
 await guardFirstDispatch(env);
 const ready=await readiness.prepare({includePrompt:true});
 if(ready.sha256!==FROZEN_REQUEST_SHA256||ready.providerCalls!==0||
    !ready.technicalTransportVerified||ready.model!==readiness.MODEL||
    JSON.stringify(ready.sections)!=='["saju_core"]')
  deny('pinned-normal-provider-request-changed');
 const output=env.REPORT_QA_OUTPUT,dir=path.dirname(output);
 const attempt=path.join(dir,'private-qa-first-chapter-attempt.json');
 const raw=path.join(dir,'private-qa-first-chapter-provider-calls.json');
 const validated=path.join(dir,'private-qa-first-chapter-validated-first-chapter.json');
 for(const target of [output,attempt,raw,validated])
  if(fs.existsSync(target))deny('previous-attempt-files-must-not-be-reused');
 writeOnce(attempt,{kind:'current-one-paid-core-attempt',status:'charge-possible-no-retry',
  requestHash:FROZEN_REQUEST_SHA256,commit:env.GITHUB_SHA,model:ready.model,
  providerCallsAllowed:1,releaseVerdict:'not-approved'});
 let calls=0,saved=false,passed=false;
 try{
  await contract.generate(readiness.SAMPLE,async prompt=>{
   calls++;
   if(calls!==1||prompt.stage!=='body'||
      JSON.stringify(prompt.requestedSections)!=='["saju_core"]')
    deny('second-chapter-or-provider-call-forbidden');
   // Reconstruct the exact provider payload using the real server before
   // the first charge. No flag switching or prompt rewriting.
   const expected=generation.compile(ready.prompt);
   const actual=generation.compile(prompt);
   if(JSON.stringify(actual)!==JSON.stringify(expected))
    deny('fresh-server-prompt-mismatch');
   return callOpenAI(prompt,async response=>{
    if(saved)deny('duplicate-provider-callback');
    writeOnce(raw,{kind:'private-first-chapter-original-provider-response',
     sample:readiness.SAMPLE,requestHash:FROZEN_REQUEST_SHA256,
     model:ready.model,providerCalls:1,
     request:actual,response,releaseVerdict:'not-approved'});
    saved=true;
   });
  },()=>{},async batch=>{
   if(!saved||passed||calls!==1||
      JSON.stringify(batch?.ids)!=='["saju_core"]'||
      batch.completedSections!==1||batch.sections?.length!==1)
    deny('first-chapter-validator-scope-not-confirmed');
   writeOnce(validated,{kind:'current-first-chapter-automated-check',
    source:'actual paid server contract',batches:[batch],
    machineValidation:'passed-not-human-reviewed',
    releaseVerdict:'not-approved'});
   passed=true;
   throw Error(SUCCESS); // No second body batch or final synthesis.
  });
  deny('unexpected-generation-continued');
 }catch(e){
  if(e.message!==SUCCESS){
   writeOnce(output,{kind:'current-first-chapter-one-call-QA',
    status:'stopped-before-second-batch',providerCallsAttempted:calls,
    originalResponseSaved:saved,automatedValidated:passed,
    releaseVerdict:'not-approved'});
   throw Error('CURRENT_CORE_ONE_CALL_STOPPED_NO_RETRY');
  }
 }
 if(!saved||!passed||calls!==1)
  deny('paid-first-chapter-not-validated');
 writeOnce(output,{kind:'current-first-chapter-one-call-QA',
  status:'first-chapter-machine-validated',providerCallsAttempted:1,
  originalResponseSaved:true,automatedValidated:true,
  humanEditorialReviewRequired:true,releaseVerdict:'not-approved'});
 console.log('CURRENT_CORE_ONE_CALL_SAVED_PRIVATE:1 provider call, no retry, 0 other chapters');
}
if(require.main===module)run().catch(e=>{
 console.error('CURRENT_CORE_ONE_CALL_EXECUTION_BLOCKED:'+e.message);
 process.exitCode=1;
});
module.exports={run,approval,guardFirstDispatch,APPROVAL_PREFIX,
 FROZEN_REQUEST_SHA256,BEFORE_LATEST_DISPATCH};
