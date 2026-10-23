'use strict';
// QA-only method applicability screen. A literal element cycle between visible
// stems is not equivalent to a month-command-centred traditional interpretation.
// This screen NEVER chooses a pattern, useful god, personality or career.
const monthReview=require('./report-core-paid-natal-month-method-review');
const classical=require('./report-core-paid-natal-classical-yin-example');
function build(packet){
 const monthly=monthReview.assess(packet);
 const o=monthly.observed,scope=o.exactExposureScopeComparison;
 const exemplar=classical.inspect(packet);
 const n=scope.nonDayExposedHiddenStemIds.length;
 const relationCounts=o.natalRelationsTouchingMonth.relationshipCardinality;
 const relationCount=relationCounts.pairTableEntryCount+
  relationCounts.completeGroupEntryCount;
 const candidate=n===0?'no-independent-visible-month-exposure':
  n===1?'one-visible-month-candidate-needs-method-review':
  'competing-visible-month-candidates';
 const conditions=[
  {id:'month-ledger',status:'calculated',value:o.monthBranch,
   meaning:'month branch anchors this one candidate method'},
  {id:'hidden-month-main-vs-non-day-exposure',status:'calculated',
   monthMainSourceId:o.mainHiddenStemSourceId,
   nonDayExactCandidateCount:n,
   dayMasterOnlyMatches:scope.dayMasterOnlyExposedHiddenStemIds.length,
   candidate,
   meaning:'a literal match is not a selected traditional pattern'},
  {id:'transition-month',status:o.monthPhase==='transition'?'unresolved':'known-core-season',
   meaning:'core-season category is not proof of operative hidden qi'},
  {id:'overlapping-month-branch-relations',
   status:relationCounts.hasDuplicateLabelsForSameTwoPositions?
    'same-position-pair-has-different-traditional-labels':
    relationCounts.independentPairContactCount>1?
     'multiple-distinct-month-contacts':relationCounts.completeGroupEntryCount?
     'full-group-membership-requires-review':'single-or-no-month-contact',
   // Retain the old diagnostic's count, explicitly name the unit.
   observedCount:relationCount,
   labelCount:relationCounts.pairTableEntryCount,
   independentPairContactCount:relationCounts.independentPairContactCount,
   otherPositions:relationCounts.distinctOtherPositions,
   samePairMultipleLabels:relationCounts.multipleLabelsOnSamePair,
   completeGroupCount:relationCounts.completeGroupEntryCount,
   interpretationPriority:'not-assessed',
   meaning:'multiple names on one pair are NOT independent contacts or measured strength'},
  {id:'operative-hidden-qi',status:'not-determined',
   meaning:'the approximate day-split table is not a validated authority'},
  {id:'full-traditional-pattern-and-life-inference',
   status:'not-adopted-needs-human-specialist-review',
   meaning:'visible element arrows alone cannot select the month pattern or infer behavior'}
 ];
 if(monthly.activeHiddenStemId!==null||monthly.adoptedMethodId!==null||
    monthly.governingDayVerified||monthly.interpretivePriorityVerified||
    monthly.canApproveDeepSajuInterpretation)
  throw Error('QA_MONTH_FIRST_SCREEN_PREMATURE_INTERPRETIVE_APPROVAL');
 return {
  kind:'qa-month-first-symbolic-applicability-screen-v1',
  // This does not claim the classical school is universally correct:
  // it tests one candidate interpretive order and explicitly does not adopt it.
  referenceTradition:'zi-ping-zhen-quan-month-command-candidate-not-adopted',
  visibleArrowOnlyIsNotAReading:true,
  // This is the first textually specified case checked, not a general
  // interpretation algorithm and never a personality inference.
  classicalTextualExample:{
   id:'zi-ping-zhen-quan-yin-jia-not-exposed-bing-exposed',
   chapter:'論用神變化',monthBranch:exemplar.natalMonthBranch,
   condition:exemplar.candidate,
   matched:exemplar.observed.exactTextualExampleConditionsMet,
   mainExposurePositions:exemplar.observed.exposedMainStemPositions,
   secondaryExposurePositions:exemplar.observed.exposedSecondaryStemPositions,
   competingHiddenExposureNeedsReview:exemplar.alternativeExposuresNeedReview,
   // Printed only as a conditional citation to ONE named classical example.
   // It does not rank the full chart or the person's likely behavior.
   singleExposureTextualChange:exemplar.singleExposureTextualChange,
   dualExposureTextualPriority:exemplar.dualExposureTextualPriority,
   methodAdopted:false,finalPatternApproved:false
  },
  monthMethodCandidate: candidate,
  conditions,
  allowedAutomatedConclusions:[
   'verified-stem-and-position-relations',
   'month-main-vs-exact-visible-match-observations',
   'five-element-direction-as-abstract-symbolic-relationship'
  ],
  disallowedWithoutIndependentReview:[
   'month-pattern-or-useful-god-selected',
   'day-master-strength-or-priority',
   'real-personality-career-relationships-or-events',
   'specific-personal-condition-inferred-from-stem-arrows'
  ],
  validPremiumInterpretationEstablished:false,
  methodAdopted:false,
  humanTraditionalReviewRequired:true,
  providerCalls:0,releaseVerdict:'not-approved'
 };
}

function writingQuestion(review){
 if(review?.kind!=='qa-month-first-symbolic-applicability-screen-v1'||
    review.methodAdopted!==false||
    review.validPremiumInterpretationEstablished!==false||
    review.classicalTextualExample?.methodAdopted!==false||
    review.classicalTextualExample?.finalPatternApproved!==false)
  throw Error('QA_MONTH_WRITING_UNVERIFIED_METHOD_SCOPE');
 const example=review.classicalTextualExample;
 const parts=[
  '기본 출생월 풀이와 다른 근거 하나를 골라, 그 명식에서만 확인되는 위치와 연결의 차이를 독자에게 자연스럽게 설명한다. 분류 이름만 나열하거나 일반적인 선택 조언으로 심화를 대신하지 않는다.',
  'positions와 verifiedLinks는 실제 계산 위치와 글자의 대응을 뜻한다. verifiedElementDirections는 오행 간 방향만 계산하며, 그 관계만으로 기질·작용력·직업·금전·시기·우선순위를 확정하지 않는다.'
 ];
 const single=example.singleExposureTextualChange;
 const dual=example.dualExposureTextualPriority;
 if(single?.scopeMatched===true&&dual?.scopeMatched===true)
  throw Error('QA_MONTH_WRITING_CONFLICTING_CLASSICAL_CASES');
 if(single?.scopeMatched===true&&(
     example.matched!==true||single.firstRole!=='정관'||
     dual?.scopeMatched!==false))
  throw Error('QA_MONTH_WRITING_CLASSICAL_SINGLE_ROLE_TAMPERED');
 if(dual?.scopeMatched===true){
  const role=example.dualExposureTextualPriority;
  if(role.firstRole!=='정재'||role.additionalRole!=='정관')
   throw Error('QA_MONTH_WRITING_CLASSICAL_ROLE_TAMPERED');
  parts.push('이 명식에 한해 고전의 寅월·辛일간·甲과 丙 동시 겉노출 사례를 참고한다. 고전에서 정재를 중심에, 정관을 곁에 두는 이유는 월의 대표 숨은 글자 甲과 다른 글자 丙의 겉노출 조건이며, 단순한 목생화 방향이 아니다. 이는 개인의 재물 능력이나 실제 직업 성향의 검증이 아니다.');
 }else if(single?.scopeMatched===true){
  parts.push('이 명식에 한해 고전의 辛일간·寅월·甲 비노출·丙 노출 사례를 참고한다. 이 고전은 월의 기본 자원 분류가 아니라 책임·규칙 분류로 해석의 출발점이 바뀌는 경우를 설명한다. 丙과 甲이 동시에 드러난 경우의 정재 우선·정관 보조라는 별도 문장을 이 명식에 옮기지 않는다. 이것만으로 개인의 실제 직업 성향이나 재물 결과를 확정하지 않는다.');
 }else if(example.matched===true){
  parts.push('이 명식은 寅월 대표 글자 甲이 겉에 없고 다른 숨은 글자 丙이 드러난 고전의 일반적인 좁은 예시와 맞는다. 다만 辛일간에 한정된 정관 우선 결론은 일간까지 맞을 때만 인용한다. 다른 후보가 동시에 드러나거나 다른 출생 관계가 있으면 어느 뜻이 중심인지 단정하지 않는다.');
 }
 const contacts=review.conditions.find(x=>x.id==='overlapping-month-branch-relations');
 if(!contacts)throw Error('QA_MONTH_WRITING_MISSING_CONTACT_SCOPE');
 if(contacts.samePairMultipleLabels?.length)
  parts.push('같은 출생 두 자리 사이에 관계표의 명칭이 둘 이상 있어도 서로 다른 두 작용이나 강도라고 읽지 않는다. 어느 명칭이 실제로 우선하는지 판정하지 않는다.');
 else if(contacts.independentPairContactCount>1||contacts.completeGroupCount)
  parts.push('출생월과 맞닿은 다른 자리의 관계가 복수이거나 완성된 그룹이 있는 경우, 별도 종합 검수 없이 한 관계가 다른 관계보다 우선한다고 쓰지 않는다.');
 parts.push('개인에 대한 새로운 결론을 명리 규칙으로 입증할 수 없으면 꾸며 내지 않고 사람 편집 검수 대상으로 남긴다.');
 return parts.join(' ');
}

module.exports={build,writingQuestion};
