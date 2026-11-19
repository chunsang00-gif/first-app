'use strict';
// Public SYNTHETIC editorial comparison ONLY. Never reads stored Terra output.
// This is not a semantic model, professional astrology review or sales gate.
const facts=require('./report-facts-node');
const free=require('./report-reading-sample');
const specimen=require('./qa-first-chapter-reader-editorial-prototype');
const review=require('./qa-first-chapter-human-value-review');
function build(){
 const packet=facts.build(specimen.input,2027);
 if(packet.status!=='ready')throw Error('VALUE_AUDIT_CALCULATION_NOT_VERIFIED');
 const preview=free.build(packet),paid=specimen.build();
 const section=paid.sections.find(x=>x.id==='saju_core');
 if(preview.modelCalls!==0||preview.completedPremiumParagraphs!==0||
    paid.boughtProviderCalls!==0||paid.actualProviderManuscriptValidated!==false||
    !paid.automatedChecksPassed||!section)
  throw Error('VALUE_AUDIT_SAMPLE_ORIGIN_DRIFT');
 const idx=id=>section.bodyTopics.indexOf(id);
 const sourceRefs=paid.sourceRefs;
 if(idx('temperament')<0||idx('strength')<0||
    !sourceRefs.temperament.includes('natal.hour.hidden.丁')||
    !sourceRefs.strength.includes('natal.month.stem'))
  throw Error('VALUE_AUDIT_SOURCE_OWNERSHIP_DRIFT');
 const freeCards=preview.cards.filter(x=>
  ['birth-month','month-visible-link','year-hour'].includes(x.id));
 if(!freeCards.some(c=>c.id==='birth-month')||
    !freeCards.some(c=>c.id==='year-hour'))
  throw Error('VALUE_AUDIT_FREE_SCOPE_MISSING');
 const checks={
  sameVerifiedChart:true,
  freeAlreadyExplainsMonth:true,
  paidMonthStillOverlapsFreeMeaning:true,
  paidAddsSeparatelyCitedHourHiddenSource:true,
  customerWorkAndSkillAreSelfReported:true,
  differentChoiceChecksPresent:paid.inspections.twoChoice.length===0&&
   paid.inspections.customerContext.length===0,
  actuallyDeliveredProviderProseCompared:false,
  substantiveReaderValueIndependentlyConfirmed:false
 };
 return {
  kind:'offline-public-first-chapter-value-gap-v1',
  comparison:'actual-calculated-free-preview-vs-manually-written-public-benchmark',
  freeCards,paidParagraphs:section.bodyTopics.map((topic,i)=>
   ({topic,label:section.bodyLabels[i],text:section.body[i]})),
  addedSourceRefs:sourceRefs.temperament.slice(),
  checks,
  findings:[
   '무료에서 이미 출생월의 두 계산 분류와 출생시간 겉글자의 뜻을 설명한다.',
   '유료의 출생월 문단은 기존 무료 의미를 다시 풀어 쓴 부분이 많아 새 상품 가치로 계산하지 않는다.',
   '유료 예시에서는 별도 출생시간 속글자 丁의 전통 분류를 추가했다. 이 계산 근거의 추가는 사실이지만 직업 선택의 우열을 증명하지 않는다.',
   '고객이 자발적으로 적은 출하 검수 업무와 지게차 실습 목표를 서로 다른 실무 확인 항목에 연결했다. 이 조언의 개인 맞춤 정도는 고객이 제공한 상황에서 생기며 사주 계산 자체의 검증된 효과가 아니다.',
   '이 사례는 실제 AI 유료 원고가 아니므로 실제 상품 가격을 받을 가치가 입증됐다고 볼 수 없다.'
  ],
  editorialPriority:[
   '실제 유료 AI 원고를 기존 비공개 비교 화면에서 무료 원고와 직접 대조하고, 새로운 내용을 구체적으로 적어 판정한다.',
   '판매 문구에서 월 풀이 반복을 새 발견인 것처럼 포장하지 않는다.',
   '검증된 추가 근거와 고객 입력에서 얻은 비교 질문을 구분해 표시하고 성격·성공·미래 사건을 단정하지 않는다.'
  ],
  providerCalls:0,merchantCalls:0,
  humanExpertApproved:false,actualPaidManuscriptReviewed:false,
  saleApproved:false,releaseVerdict:'not-approved'
 };
}
function markdown(v=build()){
 const clean=x=>String(x||'').replace(/\r/g,' ').trim();
 const sections=[
  '# 같은 출생정보의 무료·유료 첫 장 비교 — 공개 합성 예시',
  '',
  '> 이 문서는 **실제 무료 계산 예시**와 **사람이 작성한 공개 유료 원고 예시**의 비교입니다. 비공개 Terra AI 원고를 열람하거나 검증한 결과가 아닙니다. 유료 호출·결제·배포 0회. 출시 승인 아님.',
  '',
  '## 무료에서 이미 제공하는 내용',
  ...v.freeCards.map(c=>'### '+clean(c.title)+'\n'+clean(c.text)+'\n'),
  '## 유료 작성 예시 — 신규 출생시간 근거와 고객이 입력한 두 선택',
  ...v.paidParagraphs.map(c=>'### '+clean(c.label)+'\n'+clean(c.text)+'\n'),
  '## 무료 대비 가치 판단',
  ...v.findings.map((s,i)=>(i+1)+'. '+s),
  '',
  '## 반드시 확인할 출시 전 작업',
  ...v.editorialPriority.map((s,i)=>(i+1)+'. '+s),
  '',
  '**검수 상태: 미승인** — 기계적 출처·중복 검사 통과는 원고의 실제 유료 상품성이나 전통 해석의 전문 검증과 다릅니다.'
 ];
 return sections.join('\n');
}
if(require.main===module){
 const v=build();
 process.stdout.write(markdown(v)+'\n');
}
module.exports={build,markdown};
