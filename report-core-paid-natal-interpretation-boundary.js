'use strict';
// QA-ONLY: state the exact limits of source-backed explanation.
// Classical text matching IS NOT commercial method selection, evidence
// of personality, a forecast, or an approved full-chart interpretation.
const BLOCKS=Object.freeze({
 'month-main-and-other-hidden-both-visible':
  '여러 분류가 겉에 나타났다는 사실만으로 달의 기본 분류가 언제나 우선한다고 확정할 수 없다.',
 'other-month-hidden-exposed-without-main':
  '달의 기본 글자가 겉에 없고 다른 글자가 나타났다는 계산만으로 모든 사주의 해석 출발점을 바꿀 수 없다.',
 'multiple-competing-non-main-visible-stems':
  '달의 여러 글자가 동시에 드러난 경우 하나만 정답처럼 골라서는 안 된다.',
 'approximate-governing-day-outside-canonical-hidden-stems':
  '참고용 날짜 계산이 실제 작용하는 글자를 확인해 주는 것은 아니다.',
 'approximate-governing-day-differs-from-month-main':
  '참고용 날짜표가 달의 기본 글자와 다르다고 자동으로 한쪽을 우선할 수 없다.',
 'day-master-only-match-is-not-non-day-exposure':
  '태어난 날의 기준 글자와 같다는 이유로 다른 출생 자리에도 드러났다고 말할 수 없다.',
 'multiple-relation-labels-for-one-month-pair':
  '같은 두 자리의 관계표 이름이 여러 개라도 별개의 사건이나 갈등 횟수가 아니다.',
 'more-than-one-independent-month-branch-pair':
  '달과 연결된 자리 쌍이 여러 개라도 실제 갈등이나 특정 결과가 늘어난다는 뜻은 아니다.',
 'month-included-in-branch-group':
  '여러 자리 조합이 성립해도 실제 성질의 변화나 어느 분류가 우선하는지는 아직 판단하지 않았다.',
 'visible-generating-and-controlling-pairs-coexist':
  '돕는 관계와 제약하는 관계가 동시에 보여도 어느 관계가 더 강한지 또는 서로 상쇄되는지 정할 수 없다.',
 'chapter11-symbol-relation-requires-full-chart-method-review':
  '문헌에 언급된 글자 간 관계를 전체 사주의 유불리나 직업·재물 결과로 확장할 수 없다.',
 'chapter9-officer-output-rescue-condition-must-be-considered':
  '완화 조건이 겉에 보인다고 실제로 효과가 있었거나 좋은 결과가 확정되는 것은 아니다.',
 'visible-rescue-and-unresolved-month-branch-relations-coexist':
  '완화 조건과 다른 출생 자리의 관계가 함께 확인되면 어느 쪽이 우선할지 추가 검토가 필요하다.',
 'source-specific-classical-example-needs-whole-chart-review':
  '고전의 정확한 예시 조건과 같아도 모든 출생 자리까지 고려한 최종 해석은 아니다.'
});
function build(handoff){
 if(handoff?.kind!=='qa-source-specific-traditional-method-handoff-v1'||
    handoff.releaseVerdict!=='not-approved'||
    handoff.methodApproved!==false||
    handoff.readyForPaidModelProbe!==false||
    handoff.customerReady!==false||
    handoff.humanReviewComplete!==false||
    !Array.isArray(handoff.unresolvedConditions)||
    !handoff.calculatedScope?.mainHiddenSourceId)
  throw Error('QA_BOUNDARY_UNAPPROVED_HANDOFF_REQUIRED');
 const s=handoff.calculatedScope,decision=handoff.exactTextualDecision;
 if(Boolean(decision)!==(handoff.status!=='no-published-textual-case-matches-this-chart')||
    (decision&&(decision.fullChartConclusionEstablished!==false||
     decision.observedPersonality!==false||!decision.url)))
  throw Error('QA_BOUNDARY_UNVERIFIED_TEXTUAL_DECISION');
 const refs=[s.mainHiddenSourceId,
  ...s.mainVisiblePositions,...s.secondaryVisiblePositions,
  ...s.competingThirdVisiblePositions];
 if(refs.length!==new Set(refs).size)
  throw Error('QA_BOUNDARY_DUPLICATE_CALCULATED_REFS');
 const scope={
  kind:'calculated-month-symbol-visibility-only',
  sourceRefs:refs,
  observation:'태어난 달의 기본 글자와 달에 숨은 다른 글자가 해·달·시간의 겉에서 보이는지 구별할 수 있습니다.',
  mainStemExposedOutsideDay:s.mainVisiblePositions.length>0,
  secondaryStemExposedOutsideDay:s.secondaryVisiblePositions.length>0,
  thirdMonthStemCompetes:s.competingThirdVisiblePositions.length>0,
  approvedPersonalConclusion:false
 };
 const classical=decision?{
  kind:'source-conditional-example-only',
  source:decision.url,chapter:decision.chapter,caseId:decision.caseId,
  sourceRefs:decision.evidenceRefs.slice(),
  admissibleExplanation:decision.pointOfDeparture,
  firstCategoryInThatSource:decision.firstTraditionalCategory,
  additionalCategoryInThatSource:decision.supplementaryCategory,
  cannotTransferToAnotherChart:true,
  doesNotApproveWholeChartPriority:true,
  individualTraitOrCareerInferred:false
 }:null;
 const cautions=handoff.unresolvedConditions.map(c=>{
  if(!Object.hasOwn(BLOCKS,c.id)||
     !Array.isArray(c.sourceRefs)||!c.sourceRefs.length||
     c.priority!=='not-assessed'||c.actualLifeEffect!=='not-established')
   throw Error('QA_BOUNDARY_UNKNOWN_OR_INFERRED_CONFLICT:'+c.id);
  return {id:c.id,sourceRefs:c.sourceRefs.slice(),
   unsupportedInference:BLOCKS[c.id],
   observedIsNotCausalEffect:true,needsHumanMethodReview:true};
 });
 return {
  kind:'qa-reader-interpretation-boundary-v1',
  supported:[scope,...(classical?[classical]:[])],
  blocked:cautions,
  conditionCount:cautions.length,
  hasOnlyNarrowClassicalPrecedent:Boolean(classical),
  allowedHighestScope:classical?'specific-published-example-only':
   'calculated-facts-and-symbol-classifications-only',
  unsupportedEverywhere:[
   '출생 계산만으로 실제 성격과 행동을 관찰했다고 말할 수 없다.',
   '달의 숨은 글자와 겉의 글자가 확인돼도 실제 강약이나 전체 우선순위는 확정되지 않는다.',
   '돈·건강·관계·직장 등 개인의 실제 결과나 특정 시기를 보장할 수 없다.'
  ],
  commerciallyChosenMethod:null,
  realWorldEventsPredicted:false,
  authorizedForPaidWriter:false,
  validatedReaderValue:false,
  professionalReviewComplete:false,
  releaseVerdict:'not-approved',providerCalls:0
 };
}
module.exports={build,BLOCKS};
