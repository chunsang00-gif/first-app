'use strict';
// Launch G1: EXACTLY ONE future separately approved money-case model response.
// Executable ONLY from the unique user-approved marker-only GitHub push.
// This file being committed is NOT consent and does NOT call a paid provider.
const fs=require('node:fs'),path=require('node:path'),
 crypto=require('node:crypto'),child=require('node:child_process');
const pre=require('./qa-launch-g1-money-preflight');
const cost=require('./report-adaptive-v1-offline-cost-plan');
const contract=require('./report-server-contract');
const archive=require('./report-qa-secure-archive');
const REPO='chunsang00-gif/first-app',BRANCH='fix-paid-qa-fact-bindings-20261014';
const WORKFLOW='.github/workflows/launch-g1-money-one-approved-push.yml';
const MARKER='qa-approvals/launch-g1-money-first-chapter-once.json';
const MODEL='gpt-6-luna';
const REQUEST_SHA='aa28e503eb9bacb76ed609424605e54f06b3a886da5b2dc33fa8180879370647';
const STOP='LAUNCH_G1_FIRST_CHAPTER_ONLY_STOP';
const deny=s=>{throw Error('LAUNCH_G1_ONE_CALL_DENIED:'+s)};
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x),'utf8').digest('hex');
function validateMarker(q){
 if(q?.kind!=='launch-g1-exact-money-first-chapter-user-consent-v1'||
  q.operatorApprovedOneBillableCall!==true||
  q.model!==MODEL||q.requestSha256!==REQUEST_SHA||
  q.noRetries!==true||q.noPayment!==true||q.noDeployment!==true||
  JSON.stringify(q.allowedChapters)!=='["saju_core"]'||
  q.consentSource!=='explicit-chat-approval-for-this-g1-call'||
  !/^[0-9a-f]{40}$/.test(q.parentCommit||'')||
  Object.keys(q).sort().join(',')!==[
   'kind','operatorApprovedOneBillableCall','model','requestSha256',
   'noRetries','noPayment','noDeployment','allowedChapters',
   'consentSource','parentCommit'].sort().join(','))
  deny('approval-marker-not-exact');
 return q;
}
function readMarker(dir=__dirname){
 const loc=path.join(dir,MARKER);
 if(!fs.existsSync(loc))deny('explicit-user-approval-marker-absent');
 return validateMarker(JSON.parse(fs.readFileSync(loc,'utf8')));
}
function approval(env=process.env,options={}){
 const q=validateMarker(options.marker||readMarker(options.dir));
 if(env.GITHUB_EVENT_NAME!=='push'||env.GITHUB_ACTIONS!=='true'||
  env.GITHUB_REPOSITORY!==REPO||env.GITHUB_REF_NAME!==BRANCH||
  env.GITHUB_REF!=='refs/heads/'+BRANCH||
  env.GITHUB_WORKFLOW_REF!==REPO+'/'+WORKFLOW+'@refs/heads/'+BRANCH||
  env.GITHUB_RUN_ATTEMPT!=='1'||
  !/^[1-9][0-9]*$/.test(env.GITHUB_RUN_ID||'')||
  !/^[0-9a-f]{40}$/.test(env.GITHUB_SHA||''))
  deny('not-one-exact-approved-marker-push');
 if(env.REPORT_MODEL!==MODEL||!env.OPENAI_API_KEY||
  env.OPENAI_API_KEY.length<32||env.REPORT_MODEL_URL||
  env.RENDER==='true'||env.NODE_ENV!=='test'||
  env.PAID_CORE_DEPTH_V2||env.QA_NATAL_DEPTH_PREVIEW||
  env.PAID_CORE_V2_CLASSICAL_WRITER||env.PAID_CORE_V2_CLAIM_LINKS)
  deny('unsafe-paid-provider-environment');
 if(!env.GITHUB_TOKEN||env.GITHUB_TOKEN.length<8||
  !path.isAbsolute(env.REPORT_QA_OUTPUT||'')||
  path.basename(env.REPORT_QA_OUTPUT)!=='private-qa-first-chapter.json'||
  !fs.existsSync(path.dirname(env.REPORT_QA_OUTPUT)))
  deny('private-evidence-or-history-unavailable');
 const git=options.git||(args=>child.execFileSync('git',args,
  {encoding:'utf8'}).trim());
 let parent,diff,head;
 try{
  parent=git(['rev-parse','HEAD^']);
  diff=git(['diff','--name-only','HEAD^','HEAD']);
  head=git(['rev-parse','HEAD']);
 }catch{deny('marker-only-parent-diff-unavailable')}
 if(parent!==q.parentCommit||diff!==MARKER||head!==env.GITHUB_SHA)
  deny('not-a-single-newly-approved-marker-commit');
 return true;
}
async function history(env=process.env,fetcher=global.fetch){
 if(typeof fetcher!=='function')deny('workflow-history-client-unavailable');
 const url='https://api.github.com/repos/'+REPO+
  '/actions/workflows/launch-g1-money-one-approved-push.yml/runs'+
  '?event=push&branch='+BRANCH+'&per_page=100';
 let body;
 try{
  const response=await fetcher(url,{headers:{
   authorization:'Bearer '+env.GITHUB_TOKEN,
   accept:'application/vnd.github+json',
   'X-GitHub-Api-Version':'2022-11-28'}});
  if(!response?.ok)deny('workflow-history-query-failed');
  body=await response.json();
 }catch{deny('workflow-history-unverifiable')}
 if(body?.total_count!==1||body.workflow_runs?.length!==1)
  deny('first-billable-attempt-already-consumed-or-ambiguous');
 const run=body.workflow_runs[0];
 if(run.id!==Number(env.GITHUB_RUN_ID)||run.run_attempt!==1||
  run.path!==WORKFLOW||run.event!=='push'||
  run.head_branch!==BRANCH||run.head_sha!==env.GITHUB_SHA)
  deny('workflow-run-identity-drift');
 return true;
}
async function preflight(){
 const q=await pre.inspect();
 if(q.paidModelCalls!==0||q.billableFirstChapterApproval!==false||
    q.requestSha256!==REQUEST_SHA||q.model!==MODEL||
    q.outputTokenCeiling!==18000)
  deny('launch-g1-exact-model-or-request-drift');
 const c=await require('./report-core-paid-full-prompt-capture')
  .capture(pre.INPUT);
 if(c.providerCalls!==0||c.status!=='captured-full-paid-composition'||
    JSON.stringify(c.requestedSections)!=='["saju_core"]')
  deny('first-chapter-server-prompt-unavailable');
 const env=cost.envelope(c.prompt,MODEL);
 if(hash(env)!==REQUEST_SHA||env.store!==false||
   env.text?.format?.strict!==true||env.reasoning?.effort!=='none')
  deny('first-chapter-billable-envelope-changed');
 return {prompt:c.prompt,hash:REQUEST_SHA};
}
function saveOnce(filename,data){
 if(!archive.NAMES.includes(path.basename(filename)))
  deny('unapproved-private-evidence-file');
 const fd=fs.openSync(filename,'wx',0o600);
 try{
  fs.writeFileSync(fd,JSON.stringify(data,null,2));
  fs.fsyncSync(fd);
 }finally{fs.closeSync(fd)}
}
async function run(){
 approval();
 await history();
 await preflight();
 // Import the live provider ONLY AFTER all authorization gates pass.
 const {callOpenAI}=require('./server');
 const dir=path.dirname(process.env.REPORT_QA_OUTPUT);
 const attempt=path.join(dir,'private-qa-first-chapter-attempt.json');
 const raw=path.join(dir,'private-qa-first-chapter-provider-calls.json');
 const valid=path.join(dir,'private-qa-first-chapter-validated-first-chapter.json');
 const summary=process.env.REPORT_QA_OUTPUT;
 for(const file of [attempt,raw,valid,summary])
  if(fs.existsSync(file))deny('old-attempt-evidence-present');
 // This marker is durable on disk BEFORE the first charge-possible call.
 saveOnce(attempt,{
  kind:'launch-g1-money-first-chapter-one-attempt',
  status:'charge-possible-no-retry',
  model:MODEL,requestHash:REQUEST_SHA,commit:process.env.GITHUB_SHA,
  runId:Number(process.env.GITHUB_RUN_ID),
  providerCallsAllowed:1,customerSaleApproved:false,releaseVerdict:'not-approved'
 });
 let calls=0,saved=false,validated=false;
 try{
  await contract.generate(pre.INPUT,async prompt=>{
   ++calls;
   if(calls!==1||prompt.stage!=='body'||
    JSON.stringify(prompt.requestedSections)!=='["saju_core"]'||
    hash(cost.envelope(prompt,MODEL))!==REQUEST_SHA)
    deny('unexpected-first-chapter-or-extra-paid-call');
   return callOpenAI(prompt,async(response,receipt)=>{
    if(saved)deny('provider-callback-cannot-run-twice');
    saveOnce(raw,{
     kind:'launch-g1-money-first-chapter-private-provider-response',
     model:MODEL,requestHash:REQUEST_SHA,
     request:cost.envelope(prompt,MODEL),response,
     usage:receipt?.usage||response?.usage||null,
     providerCalls:1,releaseVerdict:'not-approved'
    });
    saved=true;
   });
  },()=>{},async batch=>{
   if(!saved||validated||calls!==1||
    JSON.stringify(batch?.ids)!=='["saju_core"]'||
    batch.completedSections!==1||batch.sections?.length!==1)
    deny('first-chapter-validation-incomplete');
   saveOnce(valid,{
    kind:'launch-g1-money-automated-first-chapter-check',
    model:MODEL,batches:[batch],
    machineValidation:'passed-not-human-reviewed',
    releaseVerdict:'not-approved'
   });
   validated=true;
   throw Error(STOP); // Deliberately prevent any other paid chapter/synthesis.
  });
  deny('generation-continued-past-first-chapter');
 }catch(err){
  if(err.message!==STOP){
   saveOnce(summary,{
    kind:'launch-g1-money-one-call-qa',status:'stopped-no-retry',
    providerCallsAttempted:calls,originalResponseSaved:saved,
    automatedValidated:validated,
    humanEditorialReviewRequired:true,releaseVerdict:'not-approved'
   });
   throw Error('LAUNCH_G1_ONE_ATTEMPT_STOPPED_NO_RETRY');
  }
 }
 if(calls!==1||!saved||!validated)deny('first-chapter-not-validated');
 saveOnce(summary,{
  kind:'launch-g1-money-one-call-qa',status:'first-chapter-machine-validated',
  providerCallsAttempted:1,originalResponseSaved:true,automatedValidated:true,
  humanEditorialReviewRequired:true,customerSaleApproved:false,
  releaseVerdict:'not-approved'
 });
 console.log('LAUNCH_G1_PRIVATE_FIRST_CHAPTER_SAVED; human editorial review still required');
}
if(require.main===module)run().catch(err=>{
 console.error('LAUNCH_G1_EXECUTION_NOT_APPROVED_OR_STOPPED:'+err.message);
 process.exitCode=1;
});
module.exports={readMarker,approval,history,preflight,run,
 MARKER,WORKFLOW,MODEL,REQUEST_SHA};
