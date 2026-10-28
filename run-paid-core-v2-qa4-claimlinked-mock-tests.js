'use strict';
// Exercise the REAL future QA4 runner while replacing both GitHub history
// and the provider with in-memory fakes. NO web/OpenAI billing ever occurs.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const guard=require('./qa-core-v2-claimlinked-dispatch-guard');
const qa4=require('./run-paid-core-v2-qa4-claimlinked');
const server=require('./server');
const {capture}=require('./report-core-paid-full-prompt-capture');
const authored=require('./report-core-v2-authored-first-chapter');
const revised=require('./report-core-1994-dingren-reader-revision');
const writer=require('./report-generation-request');
const classical=require('./report-paid-core-v2-classical-provider-bridge');
const thesis=require('./report-core-thesis');
const audit=require('./report-qa3-classical-open-prose-audit');
const archive=require('./report-qa-secure-archive');
const keys=['REPORT_QA_CONFIRM','REPORT_QA_REQUEST_SHA256',
 'GITHUB_ACTIONS','GITHUB_REPOSITORY','GITHUB_REF_NAME',
 'GITHUB_RUN_ATTEMPT','GITHUB_RUN_ID','GITHUB_WORKFLOW_REF',
 'GITHUB_TOKEN','NODE_ENV','RENDER','PAID_CORE_DEPTH_V2',
 'PAID_CORE_V2_CLASSICAL_WRITER','PAID_CORE_V2_CLAIM_LINKS',
 'PAID_CORE_V2_LOCK_REFS','PAID_CORE_V2_CLOSED_CLAIMS',
 'REPORT_MODEL','REPORT_MODEL_URL','OPENAI_API_KEY',
 'REPORT_QA_OUTPUT','REPORT_QA_ARCHIVE_KEY'];
async function fakeReport(){
 const data=await capture(authored.INPUT);
 assert.equal(data.providerCalls,0);
 const prompt=data.prompt;
 const plan=writer.compile(prompt);
 const brief=classical.inspect(prompt,plan);
 const annotated=structuredClone(revised.make(prompt.facts).candidate);
 const checked=audit.screen(prompt,annotated);
 assert.equal(checked.mechanicallyEligible,true,
  JSON.stringify(checked.findings));
 const sentences=audit.sentences(annotated.text);
 annotated.basis.claimLinks=brief.permittedClaims.map(item=>{
  const claim=checked.claimTrace.claimRows.find(x=>x.claimId===item.id);
  const index=claim.candidateNonContradictoryCueIndices[0];
  if(!Number.isInteger(index))throw Error('missing synthetic claim '+item.id);
  return {claimId:item.id,sentenceIndex:index,
   sentenceQuote:sentences[index],refs:item.refs.slice()};
 });
 const text='태어난 달에는 배우는 문제와 역할을 맡는 문제가 함께 드러납니다. 이 분류를 실제 행동이나 결과로 단정할 수는 없습니다.';
 const allowed=writer.allowedRefs(plan,
  plan.task.chapters.saju_core.topics.strength,'saju_core','strength');
 const refs=['natal.month.stem','natal.month.hidden.己',
  'facts.seasonalEvidence','facts.qiEvidence'].filter(id=>allowed.has(id));
 const t=thesis.forPrompt(prompt);
 return {chapters:{saju_core:{title:t.title,keyJudgment:t.keyJudgment,
  mood:'reflective',paragraphs:{
   temperament:annotated,
   strength:{label:'태어난 달의 두 기준',text,
    basis:{refs,interpretation:'달 겉글자와 달의 대표 속글자는 서로 다릅니다.',
     condition:'배움과 규칙을 비교하는 가정입니다.',
     limit:'실제 기질과 능력은 증명되지 않았습니다.'}}
  }}},cover:null,finalJudgment:null};
}
async function test(behavior,modelOutput){
 const old=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 const oldGuard=guard.check;
 const oldCall=server.callOpenAI;
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'qa4-mock-'));
 let calls=0,guards=0;
 try{
  Object.assign(process.env,{
   REPORT_QA_CONFIRM:guard.APPROVAL,
   REPORT_QA_REQUEST_SHA256:guard.REQUEST_HASH,
   GITHUB_ACTIONS:'true',GITHUB_REPOSITORY:guard.REPO,
   GITHUB_REF_NAME:guard.BRANCH,GITHUB_RUN_ATTEMPT:'1',
   GITHUB_RUN_ID:'90009991111',
   GITHUB_WORKFLOW_REF:guard.REPO+'/'+guard.WORKFLOW+
    '@refs/heads/'+guard.BRANCH,
   GITHUB_TOKEN:'fake-token-1234567890',
   NODE_ENV:'test',PAID_CORE_DEPTH_V2:'offline-preview',
   PAID_CORE_V2_CLASSICAL_WRITER:'offline-preview',
   PAID_CORE_V2_CLAIM_LINKS:'offline-preview',
   REPORT_MODEL:'gpt-4.1',OPENAI_API_KEY:'fake-'+'Z'.repeat(60),
   REPORT_QA_ARCHIVE_KEY:'synthetic-archive-key-'+'A'.repeat(50),
   REPORT_QA_OUTPUT:path.join(root,qa4.OUTPUT)
  });
  for(const key of ['RENDER','PAID_CORE_V2_LOCK_REFS',
   'PAID_CORE_V2_CLOSED_CLAIMS','REPORT_MODEL_URL'])
   delete process.env[key];
  guard.check=async()=>{guards++;return {providerCalls:0,noRetries:true}};
  server.callOpenAI=async(prompt,onResponse)=>{
   calls++;
   assert.equal(prompt.paidCoreDepthV2,true);
   assert.deepEqual(prompt.requestedSections,['saju_core']);
   if(behavior==='absent')throw Error('fake provider failure');
   if(behavior==='incomplete'){
    await onResponse({status:'incomplete',output:[]});
    throw Error('fake incomplete provider response');
   }
   let raw=structuredClone(modelOutput);
   if(behavior==='forgery')
    raw.chapters.saju_core.paragraphs.temperament.basis.claimLinks[0]
     .refs=['natal.month.stem'];
   await onResponse(raw);
   if(behavior==='duplicate')await onResponse(raw);
   if(behavior==='post-callback-error')
    throw Error('mock legacy decoder does not know claimLinks');
   return {sections:[{id:'not-used',bodyTopics:[]}]};
  };
  const passes=behavior==='good'||behavior==='post-callback-error';
  if(passes)await qa4.run();
  else await assert.rejects(qa4.run(),
   /QA4_ONE_ATTEMPT_HOLD_NO_RETRY/);
  assert.equal(guards,1);
  assert.equal(calls,1,'one and only one provider attempt');
  const output=JSON.parse(fs.readFileSync(
   path.join(root,qa4.OUTPUT),'utf8'));
  const hasRaw=behavior!=='absent';
  assert.equal(output.providerCalls,1);
  assert.equal(output.releaseVerdict,'not-approved');
  assert.equal(output.originalResponseArchived,hasRaw);
  assert.equal(output.status,
   passes?'machine-structure-clear-human-review-pending-no-retry':
    'quality-hold-no-retry');
  assert.equal(fs.existsSync(path.join(root,
   'private-qa-first-chapter-provider-calls.json')),hasRaw);
  assert(fs.existsSync(path.join(root,
   'private-qa-first-chapter-attempt.json')));
  assert.equal(fs.existsSync(path.join(root,
   'private-qa-first-chapter-validated-first-chapter.json')),passes);
  if(passes){
   const content=JSON.parse(fs.readFileSync(path.join(root,
    'private-qa-first-chapter-validated-first-chapter.json'),'utf8'));
   assert.equal(content.linkedClaimReview.linkedClaims,5);
   assert.equal(content.customerRelease,false);
   assert.equal(content.providerPostCallbackErrorOccurred,
    behavior==='post-callback-error');
  }
  assert.equal(archive.encrypt(root),true);
  const decryptDir=path.join(root,'decrypted');
  const restored=archive.decrypt(
   path.join(root,archive.ARCHIVE),decryptDir);
  assert(restored.includes(qa4.OUTPUT));
  assert.equal(restored.includes('private-qa-first-chapter-provider-calls.json'),
   hasRaw);
 }finally{
  guard.check=oldGuard;
  server.callOpenAI=oldCall;
  for(const [k,v] of Object.entries(old))
   if(v===undefined)delete process.env[k];else process.env[k]=v;
  fs.rmSync(root,{recursive:true,force:true});
 }
}
(async()=>{
 // Never let the "next" chat turn trigger a billable action.
 assert.throws(()=>qa4.requireApproval({}),
  /QA4_FRESH_EXACT_HASH_CONSENT_REQUIRED/);
 const src=fs.readFileSync(
  path.join(__dirname,'.github/workflows/qa4-claimlinked-paid.yml'),'utf8');
 assert(src.includes('    if: ${{ false }}'),
  'consumed QA4 workflow must remain permanently retired');
 assert(src.includes(guard.REQUEST_HASH));
 assert(src.includes('node run-paid-core-v2-qa4-claimlinked.js'));
 assert(src.includes('node report-qa-secure-archive.js encrypt'));
 assert(!src.includes('if: ${{ inputs.paid_qa_confirmation =='));
 const oldWorkflow=fs.readFileSync(path.join(__dirname,
  '.github/workflows/paid-report-qa.yml'),'utf8');
 assert(oldWorkflow.includes('    if: ${{ false }}'));
 const before={
  NODE_ENV:process.env.NODE_ENV,
  PAID_CORE_DEPTH_V2:process.env.PAID_CORE_DEPTH_V2,
  PAID_CORE_V2_CLASSICAL_WRITER:process.env.PAID_CORE_V2_CLASSICAL_WRITER,
  PAID_CORE_V2_CLAIM_LINKS:process.env.PAID_CORE_V2_CLAIM_LINKS
 };
 try{
  process.env.NODE_ENV='test';
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  process.env.PAID_CORE_V2_CLASSICAL_WRITER='offline-preview';
  process.env.PAID_CORE_V2_CLAIM_LINKS='offline-preview';
  const synthetic=await fakeReport();
  for(const scenario of ['good','post-callback-error',
   'absent','incomplete','forgery','duplicate'])
   await test(scenario,synthetic);
 }finally{
  for(const [k,v] of Object.entries(before))
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
 console.log('QA4_CLAIM_LINKED_ONE_ATTEMPT_MOCK='+JSON.stringify({
  scenarios:['good','post-callback-error','absent','incomplete',
   'forgery','duplicate'],
  everyScenarioExactlyOneFakeProviderCall:true,
  decodedOnlyAfterClaimValidation:true,
  rawArchivedBeforeFailure:true,
  encryptedArchiveRestored:true,
  storedOriginalNeverPublic:true,
  historicalApprovalCannotRunNewWorkflow:true,
  consumedQA4WorkflowHardDisabled:true,
  allScenariosApprovedForCustomer:false,
  actualProviderCalls:0,releaseVerdict:'not-approved'
 }));
})().catch(e=>{console.error(e);process.exitCode=1});
