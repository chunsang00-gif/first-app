'use strict';
// NON-MODEL EDITORIAL EXAMPLE, for the synthetic 1982 lunar first chapter.
// This is NOT the encrypted real Terra output and NOT a customer report.
// Editorial goal: connect a verified, separately citable hour-hidden role
// to two substantively different decisions, without inventing life facts.
const input=Object.freeze({
 calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,
 birthTime:'14:20',gender:'male',mbti:'ISFP',
 readerDecision:'기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.'
});
const strength='태어난 달의 겉글자는 새로운 정보를 이해하는 질문, 달 안쪽 중심 글자는 필요한 자원을 마련하고 활용하는 질문으로 계산됩니다. 달 안쪽 흙이 겉의 물을 제약하는 전통적 관계까지는 확인되지만, 이 계산만으로 어떤 직업이 더 잘 맞거나 어떤 선택이 성공할지는 정할 수 없습니다. 이 구분은 다음 출생시간의 추가 질문을 읽는 출발점입니다.';
const temperament=[
 '태어난 시간의 안쪽에는 丁(식신)이 계산됩니다. 이것은 배우거나 익힌 내용을 눈에 보이는 결과물로 완성하는 전통적 질문을 하나 더합니다. 무료 풀이에서 소개한 시간의 겉글자와 다른 출처이지만, 실제 업무 능력이나 기술 습득 속도를 측정한 사실은 아닙니다.',
 '기존 일을 유지할 경우에는 현재 만들거나 처리하는 결과물 하나를 가정하고, 무엇을 개선할지부터 나누어 점검합니다. 기존 방식의 오류 수·처리 시간·납기 가운데 비교 가능한 기준 하나를 고르고, 바꾸기 전후에 같은 조건으로 기록을 남길 수 있는지를 확인해 보는 질문입니다. 실제로 어떤 일을 하고 있는지는 아직 알 수 없습니다.',
 '새로운 기술을 배울 경우에는 지금 일의 개선율과 다른 기준을 적용합니다. 작은 연습 결과물을 어떤 수준까지 완성할지, 필요한 학습 기간과 도구·비용을 어느 범위로 제한할지, 완성한 결과를 어떻게 확인할지를 먼저 정하는 가정입니다. 배웠다는 느낌이 아니라 끝까지 만든 산출물을 확인하는 질문입니다.',
 '두 선택의 차이는 같은 일을 반복해 만든 결과의 개선 폭을 확인할 것인가, 새로 익힌 기술의 첫 결과물을 완성할 것인가에 있습니다. 시간의 식신이라는 계산은 이 비교에 “결과를 어떻게 확인할까”라는 질문만 더할 뿐 어느 선택이 유리한지를 판정하지 않습니다. 실제 현재 업무와 배우려는 기술, 사용 가능한 시간·비용이 입력되지 않았으므로 개인별 최종 권고는 할 수 없습니다.'
].join(' ');
function build(){
 const facts=require('./report-facts-node').build(input,2027);
 if(facts.status!=='ready')throw Error('EDITORIAL_SAMPLE_CHART_UNVERIFIED');
 const bindings=Object.fromEntries(require('./report-fact-bindings')
  .build(facts).map(x=>[x.id,x]));
 const extension=require('./report-paid-core-hour-extension')
  .build(facts,bindings);
 if(!extension||extension.hiddenRef!=='natal.hour.hidden.丁'||
    extension.hourHiddenRole!=='식신'||extension.readerDomain!=='skill')
  throw Error('EDITORIAL_HOUR_SOURCE_NOT_1982_SAMPLE');
 const main=facts.facts.structuralEvidence.monthCommand.mainHiddenStem;
 if(main!=='己')throw Error('EDITORIAL_MONTH_MAIN_NOT_FIXED_SAMPLE');
 const section={
  id:'saju_core',
  bodyTopics:['temperament','strength'],
  bodyLabels:['현재 일과 새 기술 — 무엇을 각각 확인할까','출생월의 기초 질문'],
  body:[temperament,strength],
  evidence:[
   'natal.hour.stem / natal.hour.hidden.丁',
   'natal.month.stem / natal.month.hidden.己'
  ]
 };
 const sourceRefs={
  temperament:extension.sourceRefs,
  strength:['natal.month.stem','natal.month.hidden.己']
 };
 const inspections={
  hour:require('./report-paid-core-hour-reader-application').inspect(
   {text:temperament,basis:{refs:sourceRefs.temperament}},
   strength,extension),
  twoChoice:require('./report-paid-core-two-choice-value').inspect(
   temperament,input.readerDecision),
  chapterChoice:require('./report-paid-core-choice-application').inspect(
   [section],input.readerDecision),
  freeCopy:require('./report-paid-free-copy-gate').inspect([section],facts)
 };
 return {
  kind:'offline-human-editorial-first-chapter-prototype-v1',
  origin:'manually-written-offline-benchmark-not-provider-generated',
  sections:[section],sourceRefs,
  newNatalInterpretation:'natal.hour.hidden.丁',
  userQuestionSource:'customer-supplied-question-not-observed-behavior',
  originalTerraResultReused:false,
  boughtProviderCalls:0,
  generatedWordsInKorean:temperament.length+strength.length,
  readerOptions:[
   '기존 일 유지: 기존 결과물 개선의 검증 기준',
   '새 기술 학습: 첫 연습 결과물 완성의 검증 기준'
  ],
  knownMissingCustomerFacts:[
   '현재 업무·반복 작업의 실제 내용',
   '새로 배우려는 기술과 실제 사용 가능 시간·비용'
  ],
  notes:[
   '두 선택의 조건은 보편적 가상 점검 질문이며 출생정보가 증명한 실제 습관이 아님',
   '출생월의 무료 풀이 반복은 줄였지만 상품가치 검증은 별도로 필요',
   '유료 AI가 이 원고대로 작성한다는 보장은 없음'
  ],
  inspections,
  automatedChecksPassed:Object.values(inspections).every(x=>x.length===0),
  actualProviderManuscriptValidated:false,
  expertReviewed:false,premiumValueApproved:false,releaseVerdict:'not-approved'
 };
}
module.exports={build,input,strength,temperament};
if(require.main===module){
 const r=build();
 console.log('OFFLINE_EDITORIAL_FIRST_CHAPTER_BENCHMARK='+JSON.stringify({
  kind:r.kind,characters:r.generatedWordsInKorean,
  reviewCodes:r.inspections,automatedChecksPassed:r.automatedChecksPassed,
  providerCalls:0,releaseVerdict:r.releaseVerdict
 }));
 if(!r.automatedChecksPassed)process.exitCode=1;
}
