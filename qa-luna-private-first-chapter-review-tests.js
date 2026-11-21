'use strict';
// Synthetic local records only. Not a real Luna response, endorsement or
// model call. Paid text never reaches a public workflow log or artifact.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const crypto=require('node:crypto');
const reviewer=require('./qa-luna-private-first-chapter-review');
const cost=require('./report-adaptive-v1-offline-cost-plan');
const capture=require('./report-core-paid-full-prompt-capture');
const facts=require('./report-facts-node');
const sha=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const goodHour='태어난 시간의 숨은 글자는 익힌 내용을 결과물로 마무리하는 전통적인 질문입니다. '+
 '현재 일을 유지할 경우 기존 결과물의 납기와 검수 기준이 유지되는지 확인합니다. '+
 '새 기술을 배울 경우 연습 결과물의 완성 기준과 연습 기간을 확인합니다.';
const month='태어난 달에서 나타난 두 글자는 새 정보를 이해하는 전통적 질문과 필요한 자원을 마련하는 질문을 구분합니다.';
async function run(){
 let network=0;
 const previous=global.fetch;
 global.fetch=async()=>{network++;throw Error('LUNA_REVIEW_TEST_NO_NETWORK')};
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'luna-private-review-test-'));
 try{
  const captured=await capture.capture(cost.qualifiedSample);
  assert.equal(captured.status,'captured-full-paid-composition');
  const envelope=cost.envelope(captured.prompt,'gpt-6-luna');
  assert.equal(sha(envelope),reviewer.FROZEN_REQUEST_SHA256,
   'Work46 buyer-first-chapter request must not drift after user-facing approval packet');
  const packet=facts.build(cost.qualifiedSample,2027);
  const mStem=packet.facts.structuralEvidence.monthCommand.mainHiddenStem;
  const strengthRefs=['natal.month.stem','natal.month.hidden.'+mStem];
  const hourRefs=['natal.hour.stem','natal.hour.hidden.丁'];
  const chapter={
   title:'출생월과 출생시간의 질문을 구별하기',
   keyJudgment:'출생시간에서 별도 질문을 구분합니다.',
   paragraphs:{
    temperament:{label:'두 선택을 구분하는 추가 질문',
     text:goodHour,basis:{refs:hourRefs}},
    strength:{label:'이미 공개한 출생월의 기본 뜻',
     text:month,basis:{refs:strengthRefs}}
   }
  };
  const raw={kind:'luna-first-chapter-private-provider-response',
   model:'gpt-6-luna',requestHash:sha(envelope),
   request:envelope,response:{chapters:{saju_core:chapter}},
   providerCalls:1,releaseVerdict:'not-approved',
   usage:{input_tokens:7000,output_tokens:400}};
  const attempt={kind:'luna-first-chapter-one-attempt',
   status:'charge-possible-no-retry',
   commit:'0123456789abcdef0123456789abcdef01234567',runId:774411,
   model:'gpt-6-luna',requestHash:sha(envelope),
   providerCallsAllowed:1,releaseVerdict:'not-approved'};
  const batch={ids:['saju_core'],completedSections:1,
   sections:[{id:'saju_core',title:chapter.title,keyJudgment:chapter.keyJudgment,
    bodyTopics:['temperament','strength'],
    bodyLabels:[chapter.paragraphs.temperament.label,chapter.paragraphs.strength.label],
    body:[goodHour,month],evidence:[...hourRefs,...strengthRefs]}]};
  const validated={kind:'luna-first-chapter-automated-check',
   machineValidation:'passed-not-human-reviewed',batches:[batch],
   releaseVerdict:'not-approved'};
  const summary={kind:'luna-first-chapter-one-call-qa',
   status:'first-chapter-machine-validated',
   providerCallsAttempted:1,originalResponseSaved:true,
   automatedValidated:true,releaseVerdict:'not-approved'};
  const original={attempt,raw,validated,summary};
  const good=reviewer.build(original);
  assert.equal(good.status,'machine-passed-human-review-needed');
  assert.deepEqual(good.independentMechanicalIssues,[]);
  assert.equal(good.machineReportedPass,true);
  assert.equal(good.comparison.freeCards.some(x=>x.id==='birth-month'),true);
  assert.equal(good.comparison.paid.paragraphs.length,2);
  assert.equal(good.comparison.questions.length,5);
  assert.equal(good.comparison.realProviderCallsDeclaredInArchive,1);
  assert.equal(good.comparison.provenance,
   'declared-private-archive-not-independent-provider-authentication');
  assert.equal(good.comparison.humanReviewRequired,true);
  assert.equal(good.comparison.reviewStatus,'not-assessed');
  assert.equal(good.customerSaleApproved,false);
  assert.equal(good.noAutomatedRetry,true);
  assert.equal(good.additionalModelCalls,0);
  assert(!JSON.stringify(good).includes('operatorApprovedOneBillableCall'));
  let html=reviewer.renderHtml(good);
  assert(html.includes(goodHour)&&html.includes('무료 계산 예시'));
  assert(html.includes('검수 상태: 출시 불가 / 사람 확인 필수'));
  assert(html.includes('고객 판매 승인을 자동으로 바꾸지 않습니다'));
  const changed=structuredClone(original);
  changed.raw.response.chapters.saju_core.paragraphs.temperament.basis.refs=['natal.month.stem'];
  const wrongRefs=reviewer.build(changed);
  assert.equal(wrongRefs.status,'machine-or-editorial-defects-found');
  assert(wrongRefs.independentMechanicalIssues.includes('missing-hour-pair-citations'));
  const generic=structuredClone(original);
  generic.raw.response.chapters.saju_core.paragraphs.temperament.text=
   '태어난 시간은 결과물을 완성하는 뜻을 살핍니다. '+
   '현재 일을 유지할 경우 충분한 정보를 확인합니다. '+
   '새 기술을 배울 경우에도 충분한 정보를 확인합니다.';
  const weak=reviewer.build(generic);
  assert.equal(weak.status,'machine-or-editorial-defects-found');
  assert(weak.independentMechanicalIssues.length>0,
   'an introductory hour gloss followed by generic two-option advice must fail');
  const missing=structuredClone(original);
  missing.raw.response.chapters.saju_core.paragraphs.temperament=null;
  const noHour=reviewer.build(missing);
  assert(noHour.independentMechanicalIssues.includes(
   'missing-mandatory-independent-hour-paragraph'));
  assert.equal(noHour.comparison.paid.paragraphs.length,1);
  const failed=structuredClone(original);
  failed.summary.status='stopped-no-retry';
  failed.summary.automatedValidated=false;
  failed.validated=null;
  const rejected=reviewer.build(failed);
  assert.equal(rejected.status,'machine-rejected-human-review-needed');
  assert.equal(rejected.comparison.machineReportedPass,false);
  assert.equal(rejected.noAutomatedRetry,true);
  for(const status of ['incomplete','invalid_json','empty_output']){
   const unusable=structuredClone(failed);
   unusable.raw.response={status,usage:{input_tokens:10}};
   const rejected=reviewer.build(unusable);
   assert.equal(rejected.status,'provider-output-unusable-no-retry');
   assert.equal(rejected.providerStatus,status);
   assert.equal(rejected.comparison,null);
   assert.throws(()=>reviewer.renderHtml(rejected),
    /unreviewable-provider-output/);
  }
  const bad=structuredClone(original);
  bad.raw.model='gpt-6.1-terra';
  assert.throws(()=>reviewer.build(bad),/raw-model-or-original-request-identity/);
  bad.raw.model='gpt-6-luna';bad.raw.providerCalls=2;
  assert.throws(()=>reviewer.build(bad),/raw-model-or-original-request-identity/);
  const extra=structuredClone(original);
  extra.raw.response.chapters.money={};
  assert.throws(()=>reviewer.build(extra),/response-is-not-the-exact-first-body-only/);
  const mismatch=structuredClone(original);
  mismatch.validated.batches[0].sections[0].body[0]='고객에게 보이지 않았던 다른 말';
  assert.throws(()=>reviewer.build(mismatch),
   /raw-paid-prose-and-validated-section-disagree/);
  const injected=structuredClone(failed);
  injected.raw.response.chapters.saju_core.paragraphs.temperament.text=
   goodHour+' <img src=x onerror=alert(1)>';
  const protectedHtml=reviewer.renderHtml(reviewer.build(injected));
  assert(protectedHtml.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert(!protectedHtml.includes('<img src=x onerror=alert(1)>'));
  // Private file I/O can render one comparison. No raw writing to CI.
  for(const [key,file] of Object.entries(reviewer.NAMES)){
   const value=original[key];
   fs.writeFileSync(path.join(dir,file),JSON.stringify(value),{mode:0o600});
  }
  assert.equal(reviewer.readPrivate(dir).raw.model,'gpt-6-luna');
  const out=path.join(dir,'review.html');
  const rendered=reviewer.main([dir,out]);
  assert.equal(rendered.customerSaleApproved,false);
  assert.equal(fs.existsSync(out),true);
  assert.equal(fs.readFileSync(out,'utf8').includes(goodHour),true);
  assert.equal(fs.statSync(out).mode&0o777,0o600);
  assert.throws(()=>reviewer.main([dir,out]),/private-review-output-must-be-new/);
  assert.equal(network,0);
  console.log('PASS LUNA OFFLINE PRIVATE POSTMORTEM: '+JSON.stringify({
   syntheticCases:['valid-structured','wrong-citations',
    'generic-two-choices','missing-hour','machine-rejected',
    'incomplete','invalid-json','empty','wrong-model','double-call',
    'extra-paid-chapter','archive-tampering','html-escaping','private-0600'],
   freshModelCalls:0,merchantCalls:0,networkCalls:network,
   realLunaProseEvaluated:false,releaseVerdict:'not-approved'}));
 }finally{
  global.fetch=previous;
  fs.rmSync(dir,{recursive:true,force:true});
 }
}
if(require.main===module)run().catch(e=>{
 console.error('LUNA_PRIVATE_POSTMORTEM_TEST_FAILED:'+e.stack);
 process.exitCode=1;
});
module.exports={run};
