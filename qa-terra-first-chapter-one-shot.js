'use strict';
// Terra first-chapter ONE-CALL candidate. No automation or deployment may run
// this without a new explicit exact-commit approval and a separate enabled job.
// A failed or incomplete attempt consumes the slot: NEVER retry automatically.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const readiness=require('./qa-current-core-preflight');
const terra=require('./report-terra-offline-compat');
const cost=require('./report-adaptive-v1-offline-cost-plan');
const contract=require('./report-server-contract');
const archive=require('./report-qa-secure-archive');
const {callOpenAI}=require('./server');
const REPO='chunsang00-gif/first-app';
const BRANCH='fix-paid-qa-fact-bindings-20261014';
const WORKFLOW='.github/workflows/terra-first-chapter-qa.yml';
const MODEL='gpt-6.1-terra';
const APPROVAL_PREFIX='QA_TERRA_20261118_FIRST_CHAPTER_ONCE_';
const FROZEN_REQUEST_SHA256='65b8acbbc40b44ba5d5e48ab5812ec122e0a7a49ba9a472ed791fe9377f7b560';
const STOP='TERRA_FIRST_CHAPTER_MACHINE_VALIDATED_STOP';
const deny=reason=>{throw Error('TERRA_ONE_CALL_DENIED:'+reason)};
const sha=body=>crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
function approval(env=process.env){
 const code=env.REPORT_QA_CONFIRM||'';
 const approvedCommit=code.startsWith(APPROVAL_PREFIX)?
  code.slice(APPROVAL_PREFIX.length):'';
 if(!/^[a-f0-9]{40}$/.test(approvedCommit)||
    approvedCommit!==env.GITHUB_SHA||
    env.GITHUB_ACTIONS!=='true'||env.GITHUB_REPOSITORY!==REPO||
    env.GITHUB_REF_NAME!==BRANCH||
    env.GITHUB_WORKFLOW_REF!==REPO+'/'+WORKFLOW+'@refs/heads/'+BRANCH||
    env.GITHUB_RUN_ATTEMPT!=='1'||
    !/^[1-9][0-9]*$/.test(env.GITHUB_RUN_ID||''))
  deny('fresh-exact-commit-manual-consent-required');
 if(env.REPORT_MODEL!==MODEL||!env.OPENAI_API_KEY||
    env.OPENAI_API_KEY.length<32||env.REPORT_MODEL_URL||
    env.RENDER==='true'||env.NODE_ENV!=='test'||
    env.PAID_CORE_DEPTH_V2||env.QA_NATAL_DEPTH_PREVIEW||
    env.PAID_CORE_V2_CLASSICAL_WRITER||env.PAID_CORE_V2_CLAIM_LINKS)
  deny('unsafe-provider-or-environment');
 if(!env.GITHUB_TOKEN||env.GITHUB_TOKEN.length<8)
  deny('workflow-history-authentication-required');
 if(!path.isAbsolute(env.REPORT_QA_OUTPUT||'')||
    path.basename(env.REPORT_QA_OUTPUT)!=='private-qa-first-chapter.json'||
    !fs.existsSync(path.dirname(env.REPORT_QA_OUTPUT)))
  deny('private-archive-location-required');
 return approvedCommit;
}
async function guardFirstDispatch(env=process.env,request=global.fetch){
 const id=Number(env.GITHUB_RUN_ID);
 if(!Number.isSafeInteger(id)||typeof request!=='function')
  deny('invalid-workflow-run');
 // This is a NEW workflow. Any previous manual dispatch, including one that
 // failed before billing, permanently consumes this workflow's one slot.
 const url='https://api.github.com/repos/'+REPO+
  '/actions/workflows/terra-first-chapter-qa.yml/runs?event=workflow_dispatch&per_page=100';
 let response,body;
 try{
  response=await request(url,{headers:{
   authorization:'Bearer '+env.GITHUB_TOKEN,
   accept:'application/vnd.github+json',
   'X-GitHub-Api-Version':'2022-11-28'}});
  if(!response?.ok)deny('workflow-history-unavailable');
  body=await response.json();
 }catch{deny('workflow-history-request-failed')}
 if(body?.total_count!==1||!Array.isArray(body.workflow_runs)||
    body.workflow_runs.length!==1)
  deny('already-dispatched-or-incomplete-history');
 const run=body.workflow_runs[0];
 if(run.id!==id||run.event!=='workflow_dispatch'||
    run.path!==WORKFLOW||run.head_branch!==BRANCH||
    run.head_sha!==env.GITHUB_SHA||run.run_attempt!==1)
  deny('wrong-or-repeated-workflow-dispatch');
 return true;
}
async function preflight(){
 const checked=await terra.inspect();
 const base=await readiness.prepare({includePrompt:true});
 const request=cost.envelope(base.prompt,MODEL);
 if(checked.providerCalls!==0||checked.approvalToCharge!==false||
    checked.model!==MODEL||checked.firstRequestSha256!==FROZEN_REQUEST_SHA256||
    checked.outputTokenCeiling!==18000||checked.reasoningEffort!=='none'||
    base.providerCalls!==0||base.sections.join(',')!=='saju_core'||
    sha(request)!==FROZEN_REQUEST_SHA256)
  deny('frozen-terra-first-request-drift');
 return {checked,prompt:base.prompt};
}
function writeOnce(file,data){
 if(!archive.NAMES.includes(path.basename(file)))
  deny('unarchived-private-evidence-file');
 const fd=fs.openSync(file,'wx',0o600);
 try{fs.writeFileSync(fd,JSON.stringify(data,null,2));fs.fsyncSync(fd)}
 finally{fs.closeSync(fd)}
}
async function run(){
 const env=process.env;
 approval(env);
 await guardFirstDispatch(env);
 const {prompt}=await preflight();
 const output=env.REPORT_QA_OUTPUT,dir=path.dirname(output);
 const attempt=path.join(dir,'private-qa-first-chapter-attempt.json');
 const raw=path.join(dir,'private-qa-first-chapter-provider-calls.json');
 const validated=path.join(dir,'private-qa-first-chapter-validated-first-chapter.json');
 for(const file of [output,attempt,raw,validated])
  if(fs.existsSync(file))deny('old-attempt-must-not-be-reused');
 // Persist this BEFORE a possibly billable HTTP request.
 writeOnce(attempt,{kind:'terra-first-chapter-one-attempt',
  status:'charge-possible-no-retry',commit:env.GITHUB_SHA,
  runId:Number(env.GITHUB_RUN_ID),model:MODEL,requestHash:FROZEN_REQUEST_SHA256,
  providerCallsAllowed:1,releaseVerdict:'not-approved'});
 let calls=0,saved=false,passed=false;
 try{
  await contract.generate(readiness.SAMPLE,async freshPrompt=>{
   calls++;
   if(calls!==1||freshPrompt.stage!=='body'||
      JSON.stringify(freshPrompt.requestedSections)!=='["saju_core"]'||
      sha(cost.envelope(freshPrompt,MODEL))!==FROZEN_REQUEST_SHA256)
    deny('unexpected-server-prompt-or-second-call');
   return callOpenAI(freshPrompt,async(response,receipt)=>{
    if(saved)deny('duplicate-provider-callback');
    writeOnce(raw,{kind:'terra-first-chapter-private-provider-response',
     model:MODEL,requestHash:FROZEN_REQUEST_SHA256,
     request:cost.envelope(freshPrompt,MODEL),response,
     usage:receipt?.usage||response?.usage||null,
     providerCalls:1,releaseVerdict:'not-approved'});
    saved=true;
   });
  },()=>{},async batch=>{
   if(!saved||passed||calls!==1||
      JSON.stringify(batch?.ids)!=='["saju_core"]'||
      batch.completedSections!==1||batch.sections?.length!==1)
    deny('first-chapter-validation-scope-not-met');
   writeOnce(validated,{kind:'terra-first-chapter-automated-check',
    batches:[batch],machineValidation:'passed-not-human-reviewed',
    releaseVerdict:'not-approved'});
   passed=true;
   throw Error(STOP); // Never generate another body batch or synthesis.
  });
  deny('generation-continued-beyond-first-chapter');
 }catch(e){
  if(e.message!==STOP){
   writeOnce(output,{kind:'terra-first-chapter-one-call-qa',
    status:'stopped-no-retry',providerCallsAttempted:calls,
    originalResponseSaved:saved,automatedValidated:passed,
    releaseVerdict:'not-approved'});
   throw Error('TERRA_ONE_CALL_STOPPED_NO_RETRY');
  }
 }
 if(!saved||!passed||calls!==1)
  deny('first-chapter-not-machine-validated');
 writeOnce(output,{kind:'terra-first-chapter-one-call-qa',
  status:'first-chapter-machine-validated',
  providerCallsAttempted:1,originalResponseSaved:true,
  automatedValidated:true,humanEditorialReviewRequired:true,
  releaseVerdict:'not-approved'});
 console.log('TERRA_ONE_CALL_PRIVATE_RESULT_SAVED; human review pending; no retry');
}
if(require.main===module)run().catch(e=>{
 console.error('TERRA_ONE_CALL_EXECUTION_BLOCKED:'+e.message);
 process.exitCode=1;
});
module.exports={approval,guardFirstDispatch,preflight,run,
 APPROVAL_PREFIX,FROZEN_REQUEST_SHA256,MODEL,WORKFLOW};
