'use strict';
// NON-MODEL EDITORIAL EXAMPLE, for the synthetic 1982 lunar first chapter.
// This is NOT the encrypted real Terra output and NOT a customer report.
// Editorial goal: connect a verified, separately citable hour-hidden role
// to two substantively different decisions, without inventing life facts.
const input=Object.freeze({
 calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,
 birthTime:'14:20',gender:'male',mbti:'ISFP',
 readerDecision:'기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.',
 decisionContext:{currentWork:'출하 전 품질 검수 및 준비',
  targetSkill:'지게차 실습과 자격 취득'}
});
const strength='태어난 달의 겉글자는 새로운 정보를 이해하는 질문, 달 안쪽 중심 글자는 필요한 자원을 마련하고 활용하는 질문으로 계산됩니다. 달 안쪽 흙이 겉의 물을 제약하는 전통적 관계까지는 확인되지만, 이 계산만으로 어떤 직업이 더 잘 맞거나 어떤 선택이 성공할지는 정할 수 없습니다. 이 구분은 다음 출생시간의 추가 질문을 읽는 출발점입니다.';
const temperament=[
 '태어난 시간의 안쪽 글자 丁(식신)은 익힌 것을 실제 결과물로 마무리하는 전통적 질문을 더합니다. 무료 풀이에 나온 시간의 겉글자와는 별도 계산 출처입니다. 하지만 이 글자가 실제 업무 실력이나 학습 속도를 입증하지는 않습니다.',
 '기존 일을 유지할 경우 출하 전 품질 검수 및 준비 업무에서 누락 건수와 처리 시간을 바꾸기 전과 후에 같은 기준으로 기록해 비교합니다. 이 업무는 고객이 직접 입력한 설명이며, 어떤 실수를 했거나 얼마나 일을 잘했는지를 관찰한 사실은 아닙니다.',
 '새로운 기술을 배울 경우 지게차 실습과 자격 취득을 준비하면서 정해진 안전 동작을 연습 과제로 완료했는지 확인할 기간과 필요한 실습 비용을 따로 적어 봅니다. 자격시험 합격이나 빠른 숙달이 사주로 정해진다는 뜻은 아닙니다.',
 '한쪽 선택에서는 기존 검수 작업의 누락 건수와 소요 시간 변화를 확인하고, 다른 선택에서는 아직 배우지 않은 지게차 동작의 연습 완료 기준과 기간을 확인합니다. 태어난 시간의 별도 상징은 “무엇을 끝낸 것으로 볼까”라는 질문을 추가할 뿐, 일을 유지하거나 새 기술을 배우라는 결론을 내리지 않습니다.'
].join(' ');

function build(){
 const facts=require('./report-facts-node').build(input,2027);
 const reported=require('./report-buyer-decision-context').readerTask(input.decisionContext);
 if(!reported||reported.calculatedNatalFact!==false||
   reported.observedWorkPerformance!==false||
   reported.observedLearningSpeed!==false)
  throw Error('EDITORIAL_SAMPLE_USER_CONTEXT_NOT_VERIFIED');
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
  customerContext:require('./report-buyer-decision-context-application').inspect(
   {text:temperament,basis:{refs:sourceRefs.temperament}},reported,input.readerDecision),
  freeCopy:require('./report-paid-free-copy-gate').inspect([section],facts)
 };
 return {
  kind:'offline-human-editorial-first-chapter-prototype-v1',
  origin:'manually-written-offline-benchmark-not-provider-generated',
  sections:[section],sourceRefs,
  newNatalInterpretation:'natal.hour.hidden.丁',
  userQuestionSource:'customer-supplied-question-not-observed-behavior',
  customerContextSource:'voluntarily-entered-current-work-and-target-skill-not-natal-proof',
  originalTerraResultReused:false,
  boughtProviderCalls:0,
  generatedWordsInKorean:temperament.length+strength.length,
  readerOptions:[
   '기존 일 유지: 기존 결과물 개선의 검증 기준',
   '새 기술 학습: 첫 연습 결과물 완성의 검증 기준'
  ],
  knownMissingCustomerFacts:[
   '고객이 입력한 현재 업무의 실제 성과·검수 기록',
   '배우려는 기술의 수강 여부와 실제 연습 수준·사용 가능 시간·비용'
  ],
  notes:[
   '현재 일과 배우려는 기술은 고객의 자가 입력이며 계산된 출생정보가 증명한 사실이 아님',
   '연습·검수 조건은 구체적으로 다르지만 여전히 실제 관찰 기록은 없음',
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
