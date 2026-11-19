'use strict';
// EXACTLY ONE approved cost-bearing push, never an auto-recurrence.
// This path is invoked only by a newly CREATED fixed marker file after the
// operator has given explicit approval in ChatGPT; the normal manual
// workflow remains disabled until a distinct explicit manual authorization.
const fs=require('node:fs'),path=require('node:path'),
 child=require('node:child_process');
const runner=require('./qa-terra-reader-decision-one-shot');
const REPO='chunsang00-gif/first-app';
const BRANCH='fix-paid-qa-fact-bindings-20261014';
const WORKFLOW='.github/workflows/terra-reader-approved-single-push.yml';
const MARKER='qa-approvals/terra-reader-first-chapter-once-20261119.json';
const REQUEST_SHA='690766cd036705f2ab55caabe8a985e28ad7eb803dbe7b6c84a63df4d6b527c7';
const deny=reason=>{throw Error('APPROVED_TERRA_ONE_SHOT_DENIED:'+reason)};
function readMarker(){
 const disk=path.join(__dirname,MARKER);
 if(!fs.existsSync(disk))deny('approval-marker-absent');
 const q=JSON.parse(fs.readFileSync(disk,'utf8'));
 if(q?.kind!=='saju-terra-first-chapter-explicit-approved-single-push-v1'||
    q?.operatorApprovedOneBillableCall!==true||
    q?.reportModel!=='gpt-6.1-terra'||
    q?.requestSha256!==REQUEST_SHA||
    q?.noRetries!==true||q?.noDeployment!==true||
    q?.allowedChapters!==1||q?.consentSource!=='chat-explicit-approval-2026-11-19'||
    !/^[0-9a-f]{40}$/.test(q?.parentCommit||'')||
    Object.keys(q).sort().join(',')!==
     ['kind','operatorApprovedOneBillableCall','reportModel','requestSha256',
      'noRetries','noDeployment','allowedChapters','consentSource',
      'parentCommit'].sort().join(','))
  deny('approval-marker-not-exact');
 return q;
}
function approval(env=process.env){
 const q=readMarker();
 if(env.GITHUB_EVENT_NAME!=='push'||env.GITHUB_ACTIONS!=='true'||
    env.GITHUB_REPOSITORY!==REPO||env.GITHUB_REF_NAME!==BRANCH||
    env.GITHUB_WORKFLOW_REF!==REPO+'/'+WORKFLOW+'@refs/heads/'+BRANCH||
    env.GITHUB_REF!=='refs/heads/'+BRANCH||
    env.GITHUB_RUN_ATTEMPT!=='1'||
    !/^[1-9][0-9]*$/.test(env.GITHUB_RUN_ID||'')||
    !/^[a-f0-9]{40}$/.test(env.GITHUB_SHA||''))
  deny('not-exact-approved-push-workflow-run');
 if(env.REPORT_MODEL!=='gpt-6.1-terra'||!env.OPENAI_API_KEY||
    env.OPENAI_API_KEY.length<32||env.REPORT_MODEL_URL||
    env.RENDER==='true'||env.NODE_ENV!=='test'||
    env.PAID_CORE_DEPTH_V2||env.QA_NATAL_DEPTH_PREVIEW||
    env.PAID_CORE_V2_CLASSICAL_WRITER||env.PAID_CORE_V2_CLAIM_LINKS)
  deny('unsafe-environment');
 if(!env.GITHUB_TOKEN||env.GITHUB_TOKEN.length<8||
    !path.isAbsolute(env.REPORT_QA_OUTPUT||'')||
    path.basename(env.REPORT_QA_OUTPUT)!=='private-qa-first-chapter.json'||
    !fs.existsSync(path.dirname(env.REPORT_QA_OUTPUT)))
  deny('missing-workflow-history-or-private-archive');
 let parent,changed;
 try{
  parent=child.execFileSync('git',['rev-parse','HEAD^'],{encoding:'utf8'}).trim();
  changed=child.execFileSync('git',['diff','--name-only','HEAD^','HEAD'],{encoding:'utf8'}).trim();
 }catch{deny('parent-commit-diff-unavailable')}
 if(parent!==q.parentCommit||changed!==MARKER||
    env.GITHUB_SHA!==child.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim())
  deny('not-a-single-approved-marker-commit');
 return true;
}
async function history(env=process.env,fetcher=global.fetch){
 if(typeof fetcher!=='function')deny('missing-github-history-client');
 const url='https://api.github.com/repos/'+REPO+
  '/actions/workflows/terra-reader-approved-single-push.yml/runs'+
  '?event=push&branch='+BRANCH+'&per_page=100';
 let body;
 try{
  const response=await fetcher(url,{headers:{
   authorization:'Bearer '+env.GITHUB_TOKEN,
   accept:'application/vnd.github+json',
   'X-GitHub-Api-Version':'2022-11-28'}});
  if(!response.ok)deny('history-access-rejected');
  body=await response.json();
 }catch{deny('history-access-failed')}
 if(body?.total_count!==1||!Array.isArray(body.workflow_runs)||
    body.workflow_runs.length!==1)
  deny('one-shot-history-already-consumed');
 const run=body.workflow_runs[0];
 if(run.id!==Number(env.GITHUB_RUN_ID)||run.run_attempt!==1||
    run.event!=='push'||run.path!==WORKFLOW||
    run.head_branch!==BRANCH||run.head_sha!==env.GITHUB_SHA)
  deny('wrong-one-shot-history-identity');
 return true;
}
async function preflight(){
 const result=await runner.preflight();
 if(result.requestHash!==REQUEST_SHA)
  deny('provider-request-sha-changed');
 return true;
}
async function execute(){
 approval(process.env);
 await history(process.env);
 await preflight();
 await runner.run({approve:approval,history});
}
if(require.main===module)execute().catch(e=>{
 console.error('APPROVED_TERRA_ONE_SHOT_FAILED:'+e.message);
 process.exitCode=1;
});
module.exports={readMarker,approval,history,preflight,execute,WORKFLOW,MARKER,REQUEST_SHA};
