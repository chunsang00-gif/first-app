'use strict';
// Free integration test of the REAL one-call natal-depth QA runner.
// All calls are intercepted in-process; NO real credentials or HTTP traffic.
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const runner=require('./run-paid-natal-depth-qa');
const {assemble}=require('./report-core-paid-full-qa-compose');
const {forPrompt}=require('./report-core-thesis');
const {fromPayload}=require('./report-core-paid-natal-depth-fact-lock');
const old={
 fetch:global.fetch,
 key:process.env.OPENAI_API_KEY,model:process.env.REPORT_MODEL,
 url:process.env.REPORT_MODEL_URL,approval:process.env.REPORT_QA_CONFIRM,
 output:process.env.REPORT_QA_OUTPUT
};
const dirs=[];
const outputDir=()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'saju-depth-onecall-'));
 dirs.push(dir);return dir;
};
const output=dir=>path.join(dir,'private-qa-first-chapter.json');
const read=(dir,name)=>JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'));
(async()=>{
 let network=0;
 global.fetch=()=>{network++;throw Error('NO_HTTP_IN_FREE_QA');};
 process.env.OPENAI_API_KEY='OFFLINE_TEST_KEY_NEVER_SENT_TO_NETWORK_123456';
 process.env.REPORT_MODEL='gpt-4.1';
 delete process.env.REPORT_MODEL_URL;
 try{
  const dryDir=outputDir();
  process.env.REPORT_QA_OUTPUT=output(dryDir);
  delete process.env.REPORT_QA_CONFIRM;
  await assert.rejects(runner.run(),/QA_NATAL_DEPTH_EXPLICIT_APPROVAL_REQUIRED/);
  assert.equal(network,0);
  assert.equal(fs.readdirSync(dryDir).length,0,'unapproved call must create no evidence');
  // V1 confirmation was already consumed by the 2026-10-22 real call.
  // The UI is intentionally still V1, while the non-billable mock uses V2.
  process.env.REPORT_QA_CONFIRM='RUN_ONE_NATAL_DEPTH_SAMPLE';
  await assert.rejects(runner.run(),/QA_NATAL_DEPTH_EXPLICIT_APPROVAL_REQUIRED/);
  assert.equal(network,0);
  assert.equal(fs.readdirSync(dryDir).length,0);
  process.env.REPORT_QA_CONFIRM=runner.APPROVAL;
  // A changed model price/tokens or a changed approved prompt must fail
  // BEFORE the attempt marker, before fetch, and without charging again.
  const mismatchDir=outputDir();
  process.env.REPORT_QA_OUTPUT=output(mismatchDir);
  process.env.REPORT_MODEL='gpt-4.1-mini';
  await assert.rejects(runner.run(),/QA_NATAL_DEPTH_APPROVED_ENVELOPE_DRIFT_NO_BILLING/);
  assert.equal(fs.readdirSync(mismatchDir).length,0);
  assert.equal(network,0);
  process.env.REPORT_MODEL='gpt-4.1';
  const readiness=require('./report-core-paid-one-shot-readiness');
  const oldBuild=readiness.build;
  try{
   readiness.build=async()=>({...await oldBuild(),
    operatorEnvelopeHash:'0'.repeat(64)});
   await assert.rejects(runner.run(),/QA_NATAL_DEPTH_APPROVED_ENVELOPE_DRIFT_NO_BILLING/);
   assert.equal(fs.readdirSync(mismatchDir).length,0);
   assert.equal(network,0);
  }finally{readiness.build=oldBuild;}
  // Capture the actual single QA request offline and produce a minimally valid
  // test response. These words are a structural fixture, NOT human-approved prose.
  const qa=await assemble();
  const fixed=forPrompt(qa.prompt);
  const month='natal.month.hidden.'+
   qa.prompt.facts.facts.structuralEvidence.monthCommand.mainHiddenStem;
  const sourceRefs=['natal.year.stem','natal.day.stem','natal.hour.stem',
   'facts.stemConnections'];
  const good={
   chapters:{saju_core:{title:fixed.title,keyJudgment:fixed.keyJudgment,
    mood:'reflective',paragraphs:{
     temperament:null,
     strength:{label:'서로 다른 뜻을 함께 살피는 선택',
      text:'태어난 달의 두 가지 전통 분류는 같은 선택을 서로 다르게 설명할 수 있습니다. 예를 들어 새로운 과정을 시작하는 상황이라면 알려진 설명을 이해하는 선택과 다른 자원을 고르는 선택을 별도로 살펴볼 수 있습니다.',
      basis:{refs:['natal.month.stem',month],
       interpretation:'월의 실제 두 계산 위치를 구별',
       condition:'새로운 일을 시작하는 가상 상황',
       limit:'실제 관찰된 성격을 알 수 없음'}},
     natal_depth:{label:'해와 시간의 다른 기준을 구별하는 풀이',
      text:'태어난 해에서는 반복되는 비용과 맡은 일을 꾸준히 관리하는 뜻이 확인됩니다. 반면 태어난 시간에는 생각을 차근차근 결과물로 만들어 남기는 뜻이 계산됩니다. 새로운 일을 함께 준비해야 하는 상황이라면 비용을 꾸준히 관리하는 선택과 어떤 결과물로 남길지 정하는 선택을 구별해 볼 수 있습니다. 이는 실제로 일을 잘한다는 평가가 아니라 출생 위치마다 비교할 질문이 다르다는 뜻입니다.',
      basis:{refs:sourceRefs,
       interpretation:fromPayload(qa.payload).literal,
       condition:'새로운 일을 준비하는 가상 조건',
       limit:'실제 행동이나 성공을 판단하지 않음'}}
    }}},
   finalJudgment:null,cover:null
  };
  const fakeResponse=outputValue=>({
   ok:true,json:async()=>({
    status:'completed',output_text:outputValue,usage:{output_tokens:1500}
   })
  });
  let actualHTTPEnvelopeHash=null;
  function intercept(value){
   let calls=0;
   global.fetch=async(url,opts)=>{
    calls++; assert.equal(calls,1,'no second paid-model call');
    assert.equal(url,'https://api.openai.com/v1/responses');
    const sent=JSON.parse(opts.body);
    // Hash the ACTUAL intercepted OpenAI request, not only the QA builder.
    // This catches server-side provider schema rewriting or instruction drift.
    const prefix='Return only the requested premium report JSON. ';
    assert(sent.input[0].content.startsWith(prefix));
    actualHTTPEnvelopeHash=crypto.createHash('sha256').update(JSON.stringify({
     model:sent.model,tokenLimit:sent.max_output_tokens,
     systemPolicy:sent.input[0].content.slice(prefix.length),
     providerPayload:JSON.parse(sent.input[1].content),
     strictSchema:sent.text.format.schema
    })).digest('hex');
    assert.equal(sent.store,false);
    assert.equal(sent.text.format.strict,true);
    const payload=JSON.parse(sent.input[1].content);
    assert.deepEqual(Object.keys(payload.task.chapters),['saju_core']);
    assert.deepEqual(Object.keys(payload.task.chapters.saju_core.topics),
     ['temperament','strength','natal_depth']);
    assert.equal(payload.task.mbti,null);
    assert.equal(payload.task.editorialGoal,qa.payload.task.editorialGoal);
    return fakeResponse(value);
   };
   return ()=>calls;
  }
  // Valid synthetic response: one mock request, private raw and decoded copies.
  const successDir=outputDir();
  process.env.REPORT_QA_OUTPUT=output(successDir);
  let count=intercept(JSON.stringify(good));
  const result=await runner.run();
  assert.equal(actualHTTPEnvelopeHash,
   'cba4f2be01d1f1dbaa21494946a4858d455d19c47efb57a6c14093d55303bc13',
   'actual outgoing OpenAI schema/brief drifted from the frozen QA fingerprint');
  assert.equal(count(),1);
  assert.equal(result.providerCalls,1);
  assert.equal(result.releaseVerdict,'not-approved');
  assert.equal(read(successDir,'private-qa-first-chapter-provider-calls.json').providerCalls,1);
  assert.equal(read(successDir,'private-qa-first-chapter-validated-first-chapter.json').releaseVerdict,'not-approved');
  assert(read(successDir,'private-qa-first-chapter-validated-first-chapter.json')
   .sections[0].bodyTopics.includes('natal_depth'));
  // The only paid sample must yield a PRIVATE editorial worksheet with
  // the unchanged model paragraphs and their cited source rows. Passing the
  // technical gate must NEVER imply human/premium release approval.
  const approvedArchive=read(successDir,'private-qa-first-chapter-validated-first-chapter.json');
  const review=approvedArchive.editorialReview;
  assert.equal(review.kind,'qa-natal-depth-private-editorial-review-v1');
  assert.equal(review.automatedStatus,'technically-passed-not-editorially-reviewed');
  assert.equal(review.releaseVerdict,'not-approved');
  assert.equal(review.apiCallsForThisReview,0);
  assert.equal(review.humanReview.status,'pending');
  assert.equal(review.humanReview.decision,'not-assessed');
  assert.equal(review.humanReview.items.length,7);
  assert(review.humanReview.items.every(x=>x.result==='pending'&&x.reason===''));
  assert.deepEqual(review.diagnostics.modelResponseGuardErrors,[]);
  assert.deepEqual(review.diagnostics.referenceMismatch,[]);
  assert.equal(review.paragraphs.natal_depth.body,good.chapters.saju_core.paragraphs.natal_depth.text);
  assert.equal(review.paragraphs.strength.body,good.chapters.saju_core.paragraphs.strength.text);
  assert.equal(review.paragraphs.temperament,null);
  assert(review.sourceContext['natal.year.stem']);
  assert(review.sourceContext['natal.hour.stem']);
  assert(!JSON.stringify(read(successDir,'private-qa-first-chapter.json'))
    .includes(good.chapters.saju_core.paragraphs.natal_depth.text),
    'public-style success marker must not include manuscript');
  const editorialModule=require('./report-core-paid-natal-editorial-packet');
  assert.throws(()=>editorialModule.build({
   providerResponse:{chapters:{saju_core:{paragraphs:{strength:null}}}},
   decoded:{sections:[]},qa
  }),/QA_PRIVATE_REVIEW_DEPTH_MISSING/);
  assert.throws(()=>editorialModule.build({
   providerResponse:good,decoded:{sections:[{bodyTopics:['natal_depth']}]},
   qa:{...qa,releaseVerdict:'approved'}
  }),/QA_PRIVATE_REVIEW_INVALID_SCOPE/);

  for(const name of fs.readdirSync(successDir))
   assert.equal(fs.statSync(path.join(successDir,name)).mode&0o777,0o600,
    'QA raw/decoded manuscripts must be private');
  // The unchanged encrypted archive utility must accept this new runner's
  // exact private filenames; never upload raw reports to GitHub artifacts.
  const archive=require('./report-qa-secure-archive');
  assert.equal(archive.encrypt(successDir),true);
  assert(fs.existsSync(path.join(successDir,archive.ARCHIVE)));
  const decodedDir=path.join(successDir,'archive-unpacked');
  const restored=archive.decrypt(path.join(successDir,archive.ARCHIVE),decodedDir);
  assert(restored.includes('private-qa-first-chapter-provider-calls.json'));
  assert(restored.includes('private-qa-first-chapter-validated-first-chapter.json'));
  assert.equal(read(decodedDir,'private-qa-first-chapter.json').releaseVerdict,'not-approved');
  // Repeated operator execution with existing attempt files must fail CLOSED.
  await assert.rejects(runner.run(),/QA_NATAL_DEPTH_EXISTING_EVIDENCE_NO_OVERWRITE/);
  assert.equal(count(),1,'existing paid artifact must not trigger another call');
  // Charged but invalid JSON is archived, and no successful output is created.
  const brokenDir=outputDir();
  process.env.REPORT_QA_OUTPUT=output(brokenDir);
  count=intercept('{"chapters":');
  await assert.rejects(runner.run(),/invalid report data/);
  assert.equal(count(),1);
  assert.equal(read(brokenDir,'private-qa-first-chapter-provider-calls.json')
   .response.status,'invalid_json');
  assert(!fs.existsSync(output(brokenDir)));
  const rejectedName='private-qa-first-chapter-rejected-review.json';
  const brokenReview=read(brokenDir,rejectedName);
  assert.equal(brokenReview.automatedStatus,'rejected');
  assert.equal(brokenReview.releaseVerdict,'not-approved');
  assert.equal(brokenReview.providerResponseStatus,'invalid_json');
  assert.equal(brokenReview.paragraphs.natal_depth,null,
   'malformed raw text must not be invented into a chapter');
  assert.equal(brokenReview.humanReview.status,'pending');
  assert.equal(brokenReview.apiCallsForThisReview,0);
  assert.equal(fs.statSync(path.join(brokenDir,rejectedName)).mode&0o777,0o600);
  assert.equal(archive.encrypt(brokenDir),true);
  const brokenRecovered=path.join(brokenDir,'recovered');
  assert(archive.decrypt(path.join(brokenDir,archive.ARCHIVE),brokenRecovered)
   .includes(rejectedName));
  assert.equal(read(brokenRecovered,rejectedName).releaseVerdict,'not-approved');
  // Exact 2026-10-22 failure: paid natal_depth:null must fail the decoder before
  // any success artifact, and the original provider response remains archived.
  const emptyDir=outputDir();
  process.env.REPORT_QA_OUTPUT=output(emptyDir);
  const withoutDepth=structuredClone(good);
  withoutDepth.chapters.saju_core.paragraphs.natal_depth=null;
  count=intercept(JSON.stringify(withoutDepth));
  await assert.rejects(runner.run(),/QA_NATAL_DEPTH_RESPONSE_REJECTED:QA_DEPTH_REQUIRED_READING_MISSING/);
  assert.equal(count(),1);
  assert(fs.existsSync(path.join(emptyDir,'private-qa-first-chapter-provider-calls.json')));
  assert(!fs.existsSync(output(emptyDir)));
  const emptyReview=read(emptyDir,rejectedName);
  assert.equal(emptyReview.automatedStatus,'rejected');
  assert.equal(emptyReview.diagnostics.depthPresent,false);
  assert.equal(emptyReview.paragraphs.natal_depth,null);
  assert.equal(emptyReview.paragraphs.strength.body,good.chapters.saju_core.paragraphs.strength.text,
   'a paid but rejected sample retains its useful ORIGINAL core prose');
  assert.equal(emptyReview.humanReview.items.length,7);
  assert(emptyReview.humanReview.items.every(x=>x.result==='pending'));
  assert.equal(emptyReview.releaseVerdict,'not-approved');
  assert.equal(emptyReview.apiCallsForThisReview,0);
  assert.equal(archive.encrypt(emptyDir),true);
  const emptyRecovered=path.join(emptyDir,'recovered');
  const emptyFiles=archive.decrypt(path.join(emptyDir,archive.ARCHIVE),emptyRecovered);
  assert(emptyFiles.includes(rejectedName));
  assert.equal(read(emptyRecovered,rejectedName).paragraphs.strength.body,
   good.chapters.saju_core.paragraphs.strength.text);
  // Even when a paid response has a valid JSON shape, the semantic decoder
  // can reject invented traits or misattributed source explanations.
  const rejectedDir=outputDir();
  process.env.REPORT_QA_OUTPUT=output(rejectedDir);
  const semanticallyBad=structuredClone(good);
  semanticallyBad.chapters.saju_core.paragraphs.natal_depth.text+=
   ' 당신은 원래 반드시 성공하고 타고난 능력이 매우 뛰어납니다.';
  count=intercept(JSON.stringify(semanticallyBad));
  await assert.rejects(runner.run(),/QA_NATAL_DEPTH_RESPONSE_REJECTED/);
  assert.equal(count(),1,'semantic rejection must NOT cause a second paid call');
  assert(!fs.existsSync(output(rejectedDir)));
  const semanticReview=read(rejectedDir,rejectedName);
  assert.equal(semanticReview.paragraphs.natal_depth.body,
   semanticallyBad.chapters.saju_core.paragraphs.natal_depth.text);
  assert(semanticReview.diagnostics.modelResponseGuardErrors.length>0);
  assert.equal(semanticReview.humanReview.status,'pending');
  assert.equal(semanticReview.releaseVerdict,'not-approved');
  assert.equal(archive.encrypt(rejectedDir),true);
  const semanticRecovered=path.join(rejectedDir,'recovered');
  assert(archive.decrypt(path.join(rejectedDir,archive.ARCHIVE),semanticRecovered)
   .includes(rejectedName));
  console.log('PASS isolated natal-depth one-call runner: scope, explicit approval, no retry, private raw capture, null-depth rejection; 0 real provider calls');
 }finally{
  global.fetch=old.fetch;
  for(const [key,value] of [['OPENAI_API_KEY',old.key],['REPORT_MODEL',old.model],
   ['REPORT_MODEL_URL',old.url],['REPORT_QA_CONFIRM',old.approval],
   ['REPORT_QA_OUTPUT',old.output]]){
   if(value===undefined)delete process.env[key];else process.env[key]=value;
  }
  for(const dir of dirs)fs.rmSync(dir,{recursive:true,force:true});
 }
})().catch(e=>{console.error(e);process.exitCode=1});
