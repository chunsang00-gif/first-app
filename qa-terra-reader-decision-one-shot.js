'use strict';
// A NEW synthetic buyer-choice first chapter. This is NEVER run automatically.
// The old 2026-11-18 Terra dispatch has consumed its one-time authorization.
// Future paid execution requires an independent exact-SHA manual confirmation.
// A failed/incomplete invocation permanently consumes this attempt; NO retry.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const plan=require('./qa-next-first-chapter-offline-preflight');
const cost=require('./report-adaptive-v1-offline-cost-plan');
const contract=require('./report-server-contract');
const archive=require('./report-qa-secure-archive');
const {callOpenAI}=require('./server');
const REPO='chunsang00-gif/first-app';
const BRANCH='fix-paid-qa-fact-bindings-20261014';
const WORKFLOW='.github/workflows/terra-reader-decision-once.yml';
const MODEL='gpt-6.1-terra';
const APPROVAL_PREFIX='QA_TERRA_20261119_READER_DECISION_ONCE_';
const FROZEN_REQUEST_SHA256='690766cd036705f2ab55caabe8a985e28ad7eb803dbe7b6c84a63df4d6b527c7';
const STOP='TERRA_READER_DECISION_SINGLE_BODY_COMPLETED_STOP';
const deny=x=>{throw Error('TERRA_READER_DECISION_DENIED:'+x)};
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function approval(env=process.env){
 const code=env.REPORT_QA_CONFIRM||'';
 const sha=code.startsWith(APPROVAL_PREFIX)?code.slice(APPROVAL_PREFIX.length):'';
 if(!/^[0-9a-f]{40}$/.test(sha)||sha!==env.GITHUB_SHA||
    env.GITHUB_ACTIONS!=='true'||env.GITHUB_EVENT_NAME!=='workflow_dispatch'||
    env.GITHUB_REPOSITORY!==REPO||env.GITHUB_REF_NAME!==BRANCH||
    env.GITHUB_WORKFLOW_REF!==REPO+'/'+WORKFLOW+'@refs/heads/'+BRANCH||
    env.GITHUB_RUN_ATTEMPT!=='1'||
    !/^[1-9][0-9]*$/.test(env.GITHUB_RUN_ID||''))
  deny('new-explicit-exact-commit-consent-required');
 if(env.REPORT_MODEL!==MODEL||!env.OPENAI_API_KEY||
    env.OPENAI_API_KEY.length<32||env.REPORT_MODEL_URL||
    env.RENDER==='true'||env.NODE_ENV!=='test'||
    env.PAID_CORE_DEPTH_V2||env.QA_NATAL_DEPTH_PREVIEW||
    env.PAID_CORE_V2_CLASSICAL_WRITER||env.PAID_CORE_V2_CLAIM_LINKS)
  deny('unsafe-provider-environment');
 if(!env.GITHUB_TOKEN||env.GITHUB_TOKEN.length<8||
    !path.isAbsolute(env.REPORT_QA_OUTPUT||'')||
    path.basename(env.REPORT_QA_OUTPUT)!=='private-qa-first-chapter.json'||
    !fs.existsSync(path.dirname(env.REPORT_QA_OUTPUT)))
  deny('history-token-or-private-archive-unavailable');
 return sha;
}
async function guardFirstDispatch(env=process.env,request=global.fetch){
 const id=Number(env.GITHUB_RUN_ID);
 if(!Number.isSafeInteger(id)||typeof request!=='function')
  deny('invalid-workflow-run');
 // A wrong-code manual dispatch also consumes the only slot, fail CLOSED.
 const url='https://api.github.com/repos/'+REPO+
  '/actions/workflows/terra-reader-decision-once.yml/runs'+
  '?event=workflow_dispatch&branch='+BRANCH+'&per_page=100';
 let body;
 try{
  const response=await request(url,{headers:{
   authorization:'Bearer '+env.GITHUB_TOKEN,
   accept:'application/vnd.github+json',
   'X-GitHub-Api-Version':'2022-11-28'}});
  if(!response?.ok)deny('workflow-history-unavailable');
  body=await response.json();
 }catch{deny('workflow-history-request-failed')}
 if(body?.total_count!==1||!Array.isArray(body.workflow_runs)||
    body.workflow_runs.length!==1)deny('manual-dispatch-already-consumed');
 const only=body.workflow_runs[0];
 if(only.id!==id||only.event!=='workflow_dispatch'||
    only.path!==WORKFLOW||only.head_branch!==BRANCH||
    only.head_sha!==env.GITHUB_SHA||only.run_attempt!==1)
  deny('manual-dispatch-identity-mismatch');
 return true;
}
async function preflight(){
 const found=await plan.inspect();
 const capture=require('./report-core-paid-full-prompt-capture');
 const cap=await capture.capture(plan.SAMPLE);
 if(cap.status!=='captured-full-paid-composition'||cap.providerCalls!==0)
  deny('normal-paid-prompt-not-captured-offline');
 const prompt=cap.prompt;
 const envelope=cost.envelope(prompt,MODEL);
 if(found.exactProviderRequestSha256!==FROZEN_REQUEST_SHA256||
    hash(envelope)!==FROZEN_REQUEST_SHA256||
    found.outputTokenCeiling!==18000||
    envelope.store!==false||envelope.model!==MODEL||
    envelope.reasoning?.effort!=='none'||
    envelope.text?.format?.strict!==true||
    found.additionalModelCalls!==undefined||
    found.realPaidProviderCalls!==0||
    found.separateNewExactCommitApprovalRequired!==true||
    found.previousApprovedCodeValid!==false)
  deny('frozen-new-first-request-drift');
 return {prompt,requestHash:hash(envelope)};
}
function saveOnce(file,data){
 if(!archive.NAMES.includes(path.basename(file)))deny('unsupported-private-archive-name');
 const fd=fs.openSync(file,'wx',0o600);
 try{fs.writeFileSync(fd,JSON.stringify(data,null,2));fs.fsyncSync(fd)}
 finally{fs.closeSync(fd)}
}
async function run(guards={approve:approval,history:guardFirstDispatch}){
 const env=process.env;
 guards.approve(env);
 await guards.history(env);
 const {requestHash}=await preflight();
 const dir=path.dirname(env.REPORT_QA_OUTPUT);
 const attempt=path.join(dir,'private-qa-first-chapter-attempt.json');
 const raw=path.join(dir,'private-qa-first-chapter-provider-calls.json');
 const validated=path.join(dir,'private-qa-first-chapter-validated-first-chapter.json');
 const output=env.REPORT_QA_OUTPUT;
 for(const p of [attempt,raw,validated,output])
  if(fs.existsSync(p))deny('old-attempt-files-exist');
 // Written before any potentially billable HTTP request.
 saveOnce(attempt,{
  kind:'terra-reader-decision-one-attempt',status:'charge-possible-no-retry',
  runId:Number(env.GITHUB_RUN_ID),commit:env.GITHUB_SHA,
  model:MODEL,requestHash,providerCallsAllowed:1,releaseVerdict:'not-approved'
 });
 let calls=0,saved=false,passed=false;
 try{
  await contract.generate(plan.SAMPLE,async freshPrompt=>{
   ++calls;
   if(calls!==1||freshPrompt.stage!=='body'||
      JSON.stringify(freshPrompt.requestedSections)!=='["saju_core"]'||
      hash(cost.envelope(freshPrompt,MODEL))!==FROZEN_REQUEST_SHA256)
    deny('unexpected-new-first-call-or-continued-generation');
   return callOpenAI(freshPrompt,async(response,receipt)=>{
    if(saved)deny('duplicate-provider-callback');
    saveOnce(raw,{kind:'terra-first-chapter-private-provider-response',
     model:MODEL,requestHash,request:cost.envelope(freshPrompt,MODEL),
     response,usage:receipt?.usage||response?.usage||null,
     providerCalls:1,releaseVerdict:'not-approved'});
    saved=true;
   });
  },()=>{},async batch=>{
   if(!saved||passed||calls!==1||
      JSON.stringify(batch?.ids)!=='["saju_core"]'||
      batch.completedSections!==1||batch.sections?.length!==1)
    deny('new-first-chapter-validated-scope-failed');
   saveOnce(validated,{kind:'terra-reader-decision-automated-check',
    batches:[batch],machineValidation:'passed-needs-human-review',
    releaseVerdict:'not-approved'});
   passed=true;
   throw Error(STOP); // MUST NEVER continue to more paid chapters.
  });
  deny('generation-continued-beyond-one-paid-chapter');
 }catch(err){
  if(err.message!==STOP){
   saveOnce(output,{kind:'terra-reader-decision-one-call-qa',
    status:'stopped-no-retry',providerCallsAttempted:calls,
    originalResponseSaved:saved,automatedValidated:passed,
    releaseVerdict:'not-approved'});
   throw Error('TERRA_READER_DECISION_STOPPED_NO_RETRY');
  }
 }
 if(calls!==1||!saved||!passed)
  deny('new-first-chapter-not-machine-validated');
 saveOnce(output,{kind:'terra-reader-decision-one-call-qa',
  status:'first-chapter-machine-validated',providerCallsAttempted:1,
  originalResponseSaved:true,automatedValidated:true,
  humanEditorialReviewRequired:true,releaseVerdict:'not-approved'});
 console.log('TERRA_READER_DECISION_FIRST_CHAPTER_PRIVATE_SAVED_NO_RETRY');
}
if(require.main===module)run().catch(e=>{
 console.error('TERRA_READER_DECISION_EXECUTION_BLOCKED:'+e.message);
 process.exitCode=1;
});
module.exports={approval,guardFirstDispatch,preflight,run,APPROVAL_PREFIX,
 FROZEN_REQUEST_SHA256,MODEL,WORKFLOW};
