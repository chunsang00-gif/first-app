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
 '태어난 시간에 숨겨진 글자 丁은 익힌 일을 눈에 보이는 결과로 마무리하는 뜻(식신)으로 읽습니다. 무료에서 보여 준 시간의 겉글자와는 다른 계산 근거입니다. 두 선택 모두에서 무엇을 끝낸 상태로 볼지 기준을 잡아보는 질문이 됩니다.',
 '기존 일을 유지할 경우 출하 전 품질 검수 및 준비 업무에서 어떤 단계까지 마쳐야 검수가 완료된 것으로 볼지 정해 봅니다. 예를 들어 확인이 끝난 물량, 다시 확인한 건수, 처리 시간을 일정 기간 기록하면 작업 방식 변경 전후의 결과를 구분할 수 있습니다. 비교할 때는 작업 종류와 기록 기간을 맞춰야 합니다.',
 '새로운 기술을 배울 경우 지게차 실습과 자격 취득에서 어떤 기본 동작을 익혀야 연습 과제 하나를 완성했다고 볼 수 있는지 기준을 정해 봅니다. 안전 확인과 기본 조작을 연습할 일정, 교육비, 자격시험 응시 조건을 별도로 확인할 수 있습니다.',
 '현재 일을 이어갈 때는 이미 하는 일의 검수 완료 기준이, 새 기술을 배울 때는 처음 익힐 동작의 연습 완료 기준이 중요합니다. 계산된 출생시간의 분류는 이처럼 서로 다른 완료 조건을 질문할 뿐, 두 선택 중 정답이나 실제 업무 능력을 판정하지 않습니다.'
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
