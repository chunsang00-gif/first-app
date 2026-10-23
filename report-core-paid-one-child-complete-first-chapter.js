'use strict';
// ONE complete, age-appropriate, source-locked first-chapter editorial
// benchmark. This is not an approved premium report, an automatic generator,
// or an inference about an observed child. Not imported by the paid writer.
const branch=require('./report-core-paid-natal-rescue-branch-relation-review');
const conflict=require('./report-core-paid-natal-conflict-abstention');
const binding=require('./report-fact-bindings');
const readerPolicy=require('./report-reader-policy');
const CHART={year:'辛丑',month:'乙未',day:'壬戌',hour:'己酉'};
const REFS=['natal.year.stem','natal.month.stem','natal.day.stem',
 'natal.hour.stem','natal.month.hidden.己',
 'facts.stemConnections','facts.natalBranchRelations'];
const PARAGRAPHS=[
 {
  kind:'basis',
  text:'태어난 달에는 새로운 방식으로 표현하는 뜻과 정해진 약속을 살피는 뜻이 함께 놓입니다. 달의 윗글자는 기존 기준에 새로운 생각을 더하는 쪽으로, 시간의 윗글자는 규칙과 책임을 살피는 쪽으로 읽으며, 두 글자는 서로 제약하는 관계입니다. 그런데 태어난 해의 윗글자는 달의 표현을 나타내는 글자를 다시 제약합니다. 고전에서는 이런 구성을 앞선 제약을 완화할 수 있는 조건으로 설명합니다.'
 },
 {
  kind:'counterevidence',
  text:'그렇다고 완화가 실제로 이루어졌다고 볼 수는 없습니다. 해와 달을 잇는 한 자리 쌍에는 관계표 이름이 두 개 붙고, 날과 달을 잇는 다른 자리 쌍에도 이름이 두 개 붙습니다. 이름이 네 개라고 서로 다른 사건 네 개가 일어난다는 뜻은 아닙니다. 이 관계들이 어느 쪽을 더 강하게 만드는지는 현재 계산과 고전의 이 사례만으로 결정할 수 없습니다.'
 },
 {
  kind:'child-example',
  text:'아이와 보호자의 일상에 빗대면 놀이 규칙을 바꿔 보자는 제안이 나온 상황을 떠올릴 수 있습니다. 보호자가 새로운 방법을 먼저 들어 보고, 장난감을 안전하게 쓰거나 차례를 지키는 약속은 그대로 확인하는 방식입니다. 이런 접근의 장점은 새 생각을 무조건 막지 않으면서도 꼭 지켜야 할 기준을 분리해 볼 수 있다는 점입니다. 반면 놀이 규칙을 한꺼번에 바꾸면 아이가 어떤 약속을 따라야 할지 헷갈릴 수 있습니다.'
 },
 {
  kind:'bounded-reading',
  text:'실제로는 한 가지 규칙만 바꿔 보고 아이가 그 약속을 이해했는지 확인해 볼 수 있습니다. 다만 이는 전통적인 글자 관계를 쉽게 설명하려고 만든 가상의 장면입니다. 아이의 실제 성격이나 또래 관계, 미래 행동을 확인한 결과가 아니며, 해석의 우선순위도 아직 전문가 검증을 거치지 않았습니다.'
 }
];
const LABEL='새로운 생각과 지켜야 할 약속을 함께 읽을 때';
function build(packet){
 if(packet?.status!=='ready'||!packet.chart?.hour)
  throw Error('QA_CHILD_FIRST_CHAPTER_VALID_CALCULATION_REQUIRED');
 const birth=packet.calculationInput?.birthDate;
 const year=packet.targetYear?.year;
 const age=year-Number(String(birth).slice(0,4));
 if(birth!=='2021-07-13'||packet.calculationInput?.calendar!=='solar'||
    packet.calculationInput?.birthTime!=='18:20'||
    !Object.entries(CHART).every(([key,value])=>packet.chart[key]===value)||
    !Number.isInteger(year)||!Number.isInteger(age)||age<0||age>=13)
  return null;
 const evidence=branch.audit(packet);
 const disagreements=conflict.inspect(packet);
 const ledger=Object.fromEntries(binding.build(packet).map(x=>[x.id,x]));
 const expectedGods={'natal.year.stem':'정인',
  'natal.month.stem':'상관','natal.hour.stem':'정관',
  'natal.month.hidden.己':'정관','natal.day.stem':'일간'};
 if(!Object.entries(expectedGods).every(([id,god])=>
    ledger[id]?.tenGod===god&&ledger[id]?.observedBehavior===false&&
    ledger[id]?.interpretationScope==='traditional-symbol-only'))
  throw Error('QA_CHILD_FIRST_CHAPTER_SOURCE_CLASSIFICATION_DRIFT');
 if(!evidence.rescueVisible||
    evidence.rescueEvidence.assessment!=='candidate-rescue-condition-visible'||
    evidence.uniqueMonthContactPairs!==2||
    evidence.monthBranchPairs.length!==4||
    JSON.stringify(evidence.monthRelationLabelCounts)!==
      JSON.stringify({year:2,day:2,hour:0})||
    evidence.conditionalDecisionPath.checks[3].result!==
      'unverified-requires-independent-method-review'||
    evidence.rescueEffectVerified!==false||
    disagreements.finalTraditionalPattern!==null||
    disagreements.downstreamPaidApproval!==false)
  throw Error('QA_CHILD_FIRST_CHAPTER_GROUNDED_SCENARIO_REQUIRED');
 const text=PARAGRAPHS.map(x=>x.text).join('\n\n');
 if(readerPolicy.errors([LABEL,text]).length||
    /[?？]\s*$/.test(text)||
    PARAGRAPHS.some(p=>p.text.includes('회사')||p.text.includes('직장')||
      p.text.includes('급여')||p.text.includes('승진')))
  throw Error('QA_CHILD_FIRST_CHAPTER_READER_COPY_UNSAFE');
 return {
  kind:'qa-single-child-first-chapter-manuscript-v1',
  releaseVerdict:'not-approved',status:'draft-for-human-review',
  ageAtTargetYear:age,audience:'child-and-caregiver',
  sourceChart:{...CHART},sourceRefs:REFS.slice(),
  label:LABEL,paragraphs:PARAGRAPHS.map(x=>({...x})),text,
  editorialReasoning:{
   supported:'visible symbolic roles and two distinct month-contact pairs',
   first:'month-command/output-versus-rules',
   second:'visible candidate counteracting role',
   third:'four branch-table labels belong to only two positional pairs',
   unresolved:'whether a traditional rescue works or dominates',
   exampleStatus:'conditional-child-play-analogy-not-observed-behavior'
  },
  reviewChecklist:{
   chartAndSymbolicSourceRecomputed:true,
   samePairLabelsNotDoubleCounted:true,
   ageGroupChecked:true,
   concreteSituationPresent:true,
   competingEvidencePreserved:true,
   professionalTraditionalPriorityApproved:false,
   actualPersonalityObserved:false,
   customerPaidValueProven:false
  },
  paidModelCalls:0,eligibleForRelease:false
 };
}
module.exports={build};
