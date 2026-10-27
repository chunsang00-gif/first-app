'use strict';
// A chart-bound WRITING DECISION for the guarded first paid Saju chapter.
// The exact symbolic direction is calculated elsewhere, never guessed here.
// This is a prompt/editorial plan, not evidence of observed personality,
// fated outcomes, dominant elements, or a validated commercial reading.
const STRATEGIES=Object.freeze({
 'left-generates-right':Object.freeze({
  decisionQuestion:'확장의 앞단에 어떤 기초가 빠졌는지',
  contrastOrder:'기존 기준을 먼저 마련한 뒤 새 선택을 넓히는 순서',
  ifOnlyOld:'기초를 마련했지만 추가 선택을 실행할 자원이 누락된 경우',
  ifOnlyNew:'새로운 선택부터 추진해 이를 떠받칠 기존 기준이 빈 경우',
  comparisonLogic:'시작과 확장을 같은 단계로 취급하지 않는다'
 }),
 'right-generates-left':Object.freeze({
  decisionQuestion:'기존 기준을 움직이게 할 지원 조건이 무엇인지',
  contrastOrder:'새 조건을 확보한 뒤 기존 판단을 실현할 수 있는지 살피는 순서',
  ifOnlyOld:'기존 결정을 확정했지만 뒷받침할 새 조건이 빠진 경우',
  ifOnlyNew:'지원을 확보했어도 그것을 적용할 기존 목표가 불분명한 경우',
  comparisonLogic:'기준의 성립과 이를 지탱하는 지원을 반대로 배열하지 않는다'
 }),
 'left-controls-right':Object.freeze({
  decisionQuestion:'새 선택의 범위를 어디까지 허용할지',
  contrastOrder:'기존 기준이 정하는 경계 안에서 추가 선택의 범위를 결정하는 순서',
  ifOnlyOld:'경계는 만들었지만 실제로 실행할 추가 선택이 없는 경우',
  ifOnlyNew:'추가 선택을 넓히다가 기존 경계와 부딪히는 경우',
  comparisonLogic:'도움을 주는 관계가 아니라 제한 범위를 묻는 전통적 관계다'
 }),
 'right-controls-left':Object.freeze({
  decisionQuestion:'기존 계획에서 무엇을 바꿔야 할지',
  contrastOrder:'새로 드러난 조건이 기존 계획에 요구하는 조정부터 확인하는 순서',
  ifOnlyOld:'기존 방식을 유지하다 새로 생긴 제약을 놓친 경우',
  ifOnlyNew:'기존 계획을 무조건 포기해 원래 목표 자체가 흐려진 경우',
  comparisonLogic:'기존 기준이 새 조건을 통제한다고 방향을 뒤집지 않는다'
 }),
 'same-element':Object.freeze({
  decisionQuestion:'비슷한 출발점에서 맡는 역할이 어떻게 갈라지는지',
  contrastOrder:'유사한 성질에서 시작한 두 역할을 서로 다른 질문으로 분리하는 순서',
  ifOnlyOld:'첫 번째 역할로 두 번째 역할까지 설명하려는 경우',
  ifOnlyNew:'두 번째 역할만 강조해 첫 번째 역할이 비어 있는 경우',
  comparisonLogic:'같은 성질을 실제 성격의 중복이나 배가된 효과로 읽지 않는다'
 })
});
function forContrast(c){
 if(!c)return null;
 const guide=STRATEGIES[c.monthMainToExposedElementDirection];
 if(!guide||c.visiblePositionRelationVerified!==true||
    c.realizedDirectionEffectVerified!==false||
    c.approvedForSale!==false||
    !Array.isArray(c.sourceRefs)||c.sourceRefs.length<4)
  throw Error('CORE_V2_WRITER_UNVERIFIED_DIRECTION');
 return {kind:'symbolic-directional-first-chapter-writing-plan-v1',
  relation:c.monthMainToExposedElementDirection,
  visiblePosition:c.visiblePosition,
  mainRole:c.mainRole,additionalRole:c.otherRole,
  decisionQuestion:guide.decisionQuestion,
  situationSequence:guide.contrastOrder,
  onlyOriginalCondition:guide.ifOnlyOld,
  onlyAdditionalCondition:guide.ifOnlyNew,
  distinctInterpretationRule:guide.comparisonLogic,
  sourceRefs:c.sourceRefs.slice(),
  requiresActualLifeProof:false,priorityAndStrengthUnverified:true,
  approvedForSale:false};
}
module.exports={forContrast,STRATEGIES};