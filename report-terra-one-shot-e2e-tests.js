'use strict';
// The historical 2026-11-18 Terra authorization was USED. Once the
// normal writer changes, that frozen one-call request is intentionally no
// longer reproducible on HEAD. Do NOT mock around its SHA guard to create
// a fake successful run. Test that even valid-looking old approvals stop
// BEFORE every paid call, and keep private archive roundtrip tested offline.
const assert=require('node:assert/strict'),fs=require('node:fs');
const os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const qa=require('./qa-terra-first-chapter-one-shot');
const archive=require('./report-qa-secure-archive');
const repo='chunsang00-gif/first-app';
const branch='fix-paid-qa-fact-bindings-20261014';
const keys=['GITHUB_ACTIONS','GITHUB_REPOSITORY','GITHUB_REF_NAME',
 'GITHUB_WORKFLOW_REF','GITHUB_SHA','GITHUB_RUN_ID','GITHUB_RUN_ATTEMPT',
 'GITHUB_TOKEN','REPORT_MODEL','OPENAI_API_KEY','REPORT_MODEL_URL',
 'REPORT_QA_CONFIRM','REPORT_QA_OUTPUT','NODE_ENV','REPORT_QA_ARCHIVE_KEY',
 'PAID_CORE_DEPTH_V2','QA_NATAL_DEPTH_PREVIEW','PAID_CORE_V2_CLASSICAL_WRITER',
 'PAID_CORE_V2_CLAIM_LINKS','RENDER'];
const prior=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
const fetchBefore=global.fetch;
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'terra-spent-guard-'));
 try{
  const sha=crypto.createHash('sha1').update('spent-provider-qa-mock').digest('hex');
  const runId=44990000088;
  const vars={GITHUB_ACTIONS:'true',GITHUB_REPOSITORY:repo,
   GITHUB_REF_NAME:branch,
   GITHUB_WORKFLOW_REF:repo+'/'+qa.WORKFLOW+'@refs/heads/'+branch,
   GITHUB_SHA:sha,GITHUB_RUN_ID:String(runId),GITHUB_RUN_ATTEMPT:'1',
   GITHUB_TOKEN:'fake-gh-token-123456',REPORT_MODEL:qa.MODEL,
   OPENAI_API_KEY:'FAKE_LOCAL_NO_CREDENTIAL_123456789012345',
   REPORT_QA_CONFIRM:qa.APPROVAL_PREFIX+sha,
   REPORT_QA_OUTPUT:path.join(dir,'private-qa-first-chapter.json'),
   NODE_ENV:'test'};
  for(const key of keys)delete process.env[key];
  Object.assign(process.env,vars);
  let historyReads=0,modelCalls=0;
  global.fetch=async url=>{
   if(String(url)!=='https://api.github.com/repos/'+repo+
      '/actions/workflows/terra-first-chapter-qa.yml/runs'+
      '?event=workflow_dispatch&branch='+branch+'&per_page=100'){
    modelCalls++;
    throw Error('OLD_PROVIDER_MUST_NEVER_BE_INVOKED');
   }
   historyReads++;
   return {ok:true,json:async()=>({total_count:1,workflow_runs:[{
    id:runId,path:qa.WORKFLOW,event:'workflow_dispatch',
    head_branch:branch,head_sha:sha,run_attempt:1}]})};
  };
  await assert.rejects(qa.run(),/TERRA_ONE_CALL_DENIED:frozen-terra-first-request-drift/,
   'the consumed exact request cannot authorize revised customer content');
  assert.equal(historyReads,1);
  assert.equal(modelCalls,0);
  assert.equal(fs.readdirSync(dir).length,0,
   'invalid approval MUST NOT create a billable-attempt file');
  for(const bad of [
   {...vars,GITHUB_RUN_ATTEMPT:'2'},
   {...vars,REPORT_QA_CONFIRM:'wrong'},
   {...vars,GITHUB_EVENT_NAME:'push'}
  ]){
   for(const key of keys)delete process.env[key];
   Object.assign(process.env,bad);
   await assert.rejects(qa.run(),/TERRA_ONE_CALL_DENIED/);
   assert.equal(modelCalls,0);
  }
  // Archive preservation has its own independent OFFLINE fixture: no
  // historical authorized paid run needs replaying to verify encryption.
  for(const key of keys)delete process.env[key];
  Object.assign(process.env,vars);
  const files=[
   ['private-qa-first-chapter.json',{status:'stopped-no-retry',
    releaseVerdict:'not-approved',providerCallsAttempted:1}],
   ['private-qa-first-chapter-attempt.json',{kind:'synthetic-no-provider',
    status:'charge-possible-no-retry'}],
   ['private-qa-first-chapter-provider-calls.json',{kind:'local-mock-only',
    usage:{input_tokens:123,output_tokens:456},
    response:{chapters:{saju_core:{paragraphs:{strength:{
     text:'이것은 실제 AI 응답이 아닌 암호화 동작 검증용입니다.'}}}}}}]
  ];
  for(const [name,data] of files)
   fs.writeFileSync(path.join(dir,name),JSON.stringify(data));
  assert.equal(archive.encrypt(dir),true);
  const cipher=fs.readFileSync(path.join(dir,archive.ARCHIVE));
  assert(!cipher.includes(Buffer.from('input_tokens')),
   'raw usage must not appear in private encrypted artifact');
  const restored=path.join(dir,'restored');
  assert.deepEqual(archive.decrypt(path.join(dir,archive.ARCHIVE),restored),
   files.map(([name])=>name));
  for(const [name] of files)
   assert.deepEqual(fs.readFileSync(path.join(restored,name)),
    fs.readFileSync(path.join(dir,name)));
  console.log('PASS spent Terra one-use E2E: old hash rejects before provider, reruns rejected, mock AES archive decrypts, providerCalls=0');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{
 global.fetch=fetchBefore;
 for(const key of keys){if(prior[key]===undefined)delete process.env[key];
  else process.env[key]=prior[key];}
});
