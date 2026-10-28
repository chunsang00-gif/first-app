'use strict';
// Offline execution of the ACTUAL QA3 runner with a patched provider.
// This test NEVER sends a network request and NEVER uses a real API key.
// A failed/empty paid result must be archived and MUST NOT retry.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const qa3=require('./run-paid-core-v2-qa3');
const guard=require('./qa-core-v2-qa3-dispatch-guard');
const archive=require('./report-qa-secure-archive');
const server=require('./server');
async function exercise(behavior){
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'qa3-offline-mocked-'));
 const former=Object.fromEntries(
  ['REPORT_QA_CONFIRM','REPORT_QA_REQUEST_SHA256','GITHUB_ACTIONS',
   'GITHUB_REPOSITORY','GITHUB_REF_NAME','GITHUB_RUN_ATTEMPT','GITHUB_RUN_ID',
   'GITHUB_WORKFLOW_REF','GITHUB_TOKEN','NODE_ENV','RENDER',
   'PAID_CORE_DEPTH_V2','REPORT_MODEL','REPORT_MODEL_URL',
   'OPENAI_API_KEY','REPORT_QA_OUTPUT','REPORT_QA_ARCHIVE_KEY']
   .map(key=>[key,process.env[key]]));
 const originalCall=server.callOpenAI;
 const originalGuard=guard.check;
 let providerCalls=0,historyChecks=0;
 try{
  Object.assign(process.env,{
   REPORT_QA_CONFIRM:guard.APPROVAL,
   REPORT_QA_REQUEST_SHA256:qa3.REQUEST_HASH,
   GITHUB_ACTIONS:'true',GITHUB_REPOSITORY:guard.REPO,
   GITHUB_REF_NAME:guard.BRANCH,
   GITHUB_RUN_ATTEMPT:'1',GITHUB_RUN_ID:'90001001001',
   GITHUB_WORKFLOW_REF:guard.REPO+'/'+guard.WORKFLOW+
    '@refs/heads/'+guard.BRANCH,
   GITHUB_TOKEN:'mock-action-token-unique',
   NODE_ENV:'test',PAID_CORE_DEPTH_V2:'offline-preview',
   REPORT_MODEL:'gpt-4.1',OPENAI_API_KEY:'mock-key-'+
    'Z'.repeat(50),
   REPORT_QA_ARCHIVE_KEY:'mock-archive-pass-'+
    'A'.repeat(48),
   REPORT_QA_OUTPUT:path.join(temp,qa3.OUTPUT)
  });
  delete process.env.RENDER;
  delete process.env.REPORT_MODEL_URL;
  guard.check=async()=>{
   historyChecks++;
   return {approved:true,providerCalls:0};
  };
  server.callOpenAI=async(prompt,afterResponse)=>{
   providerCalls++;
   assert.equal(prompt.paidCoreDepthV2,true);
   assert.deepEqual(prompt.requestedSections,['saju_core']);
   // The original provider result is archived before the decoder fails.
   const raw=behavior==='incomplete'?
    {status:'incomplete',usage:{total_tokens:14},output:[]}:
    {chapters:{saju_core:{paragraphs:{
     strength:{text:'달을 먼저 읽습니다.'},temperament:null
    }}}};
   await afterResponse(raw);
   if(behavior==='incomplete')throw Error('fake-provider-incomplete');
   return {sections:[{id:'saju_core',bodyTopics:['strength'],
    body:['달을 먼저 읽습니다.']}]};
  };
  await assert.rejects(()=>qa3.run(),
   behavior==='incomplete'?
    /QA3_ONE_ATTEMPT_FAILED_NO_RETRY/:
    /QA3_QUALITY_HOLD_NO_RETRY/);
  assert.equal(providerCalls,1,'there can be NO retry after a paid failure');
  assert.equal(historyChecks,1);
  const names=archive.NAMES.filter(n=>fs.existsSync(path.join(temp,n)));
  assert(names.includes(qa3.OUTPUT));
  assert(names.includes('private-qa-first-chapter-attempt.json'));
  assert(names.includes('private-qa-first-chapter-provider-calls.json'));
  const attempted=JSON.parse(fs.readFileSync(
   path.join(temp,'private-qa-first-chapter-attempt.json'),'utf8'));
  const raw=JSON.parse(fs.readFileSync(
   path.join(temp,'private-qa-first-chapter-provider-calls.json'),'utf8'));
  const result=JSON.parse(fs.readFileSync(
   path.join(temp,qa3.OUTPUT),'utf8'));
  assert.equal(attempted.providerCallsMaximum,1);
  assert.equal(raw.providerCalls,1);
  assert.equal(raw.requestHash,guard.REQUEST_HASH);
  assert.equal(result.providerCalls,1);
  assert.equal(result.releaseVerdict,'not-approved');
  assert.equal(result.requestHash,guard.REQUEST_HASH);
  assert(behavior==='incomplete'?
   result.status==='failed-after-possible-charge-no-retry':
   result.status==='quality-hold-no-retry');
  if(behavior==='incomplete')assert.equal(raw.response.status,'incomplete');
  else{
   assert(names.includes('private-qa-first-chapter-validated-first-chapter.json'));
   assert.equal(raw.response.chapters.saju_core.paragraphs.temperament,null);
  }
  assert.equal(archive.encrypt(temp),true);
  const enc=path.join(temp,archive.ARCHIVE);
  assert(fs.existsSync(enc));
  const out=path.join(temp,'readback');
  const restored=archive.decrypt(enc,out);
  assert.deepEqual(new Set(restored),new Set(names));
  assert.deepEqual(JSON.parse(fs.readFileSync(
   path.join(out,'private-qa-first-chapter-provider-calls.json'),'utf8')),raw);
  console.log('QA3_MOCK_ONE_ATTEMPT='+JSON.stringify({
   behavior,providerCalls,historyChecks,rawArchived:true,
   encryptedRoundTrip:true,manualQualityApproval:false,
   autoRetry:false,realProviderCalls:0
  }));
 }finally{
  guard.check=originalGuard;
  server.callOpenAI=originalCall;
  for(const [key,value] of Object.entries(former))
   if(value===undefined)delete process.env[key];
   else process.env[key]=value;
  fs.rmSync(temp,{recursive:true,force:true});
 }
}
(async()=>{
 await exercise('quality-hold');
 await exercise('incomplete');
})().catch(e=>{console.error(e);process.exitCode=1});
