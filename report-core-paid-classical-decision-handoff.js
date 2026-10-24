'use strict';
// OFFLINE expert method-decision worksheet; NEVER a paid Saju interpretation.
// Exact classical conditions do not determine a chart's full traditional
// pattern, personal traits, life events, or willingness to pay.
const classical=require('./report-core-paid-natal-classical-method-applicability');
const month=require('./report-core-paid-natal-month-method-review');
const conflict=require('./report-core-paid-natal-conflict-abstention');
const boundaries=require('./report-core-paid-natal-interpretation-boundary');
const earthCommentary=require('./report-core-paid-natal-three-punishment-commentary');
const {LunarUtil}=require('lunar-javascript');
const names={'比肩':'비견','劫财':'겁재','食神':'식신','伤官':'상관',
 '偏财':'편재','正财':'정재','七杀':'편관','正官':'정관',
 '偏印':'편인','正印':'정인'};
function checkCalculatedRoles(packet){
 const day=packet.chart.day?.[0];
 for(const position of ['year','month','hour']){
  const stem=packet.chart[position]?.[0];
  const expected=names[LunarUtil.SHI_SHEN[day+stem]];
  const actual=packet.facts?.tenGods?.[position];
  if(!expected||actual?.stem!==stem||actual.stemTenGod!==expected)
   throw Error('QA_METHOD_HANDOFF_FALSE_CALCULATED_ROLE:'+position);
 }
}

// Map WHAT was observed to the relevant unanswered expert METHOD question.
// Multiple labels on one branch pair are not multiple independent effects.
// None of these conditions proves that one traditional method should prevail.
const REVIEW_THEMES=Object.freeze({
 'resolve-month':new Set([
  'month-main-and-other-hidden-both-visible',
  'other-month-hidden-exposed-without-main',
  'multiple-competing-non-main-visible-stems',
  'approximate-governing-day-outside-canonical-hidden-stems',
  'approximate-governing-day-differs-from-month-main',
  'day-master-only-match-is-not-non-day-exposure'
 ]),
 'resolve-other-positions':new Set([
  'multiple-relation-labels-for-one-month-pair',
  'more-than-one-independent-month-branch-pair',
  'month-included-in-branch-group',
  'visible-generating-and-controlling-pairs-coexist',
  'chapter11-symbol-relation-requires-full-chart-method-review',
  'chapter9-officer-output-rescue-condition-must-be-considered',
  'visible-rescue-and-unresolved-month-branch-relations-coexist'
 ]),
 'review-counterexample':new Set([
  'source-specific-classical-example-needs-whole-chart-review',
  'multiple-competing-non-main-visible-stems',
  'month-main-and-other-hidden-both-visible',
  'other-month-hidden-exposed-without-main'
 ])
});
const QUESTIONS=[
 ['choose-school','어느 전통 해석 체계를 선택하고 그 근거 문헌은 무엇인가?'],
 ['resolve-month','태어난 달의 기본 글자·겉에 드러난 글자·사령 자료 사이에서 무엇을 우선할 것인가?'],
 ['resolve-other-positions','해·날·시간의 다른 관계가 해당 우선순위를 바꿀 수 있는가?'],
 ['review-counterexample','기본 글자가 드러나지 않거나 세 번째 숨은 글자가 드러나면 이 결론은 유지되는가?'],
 ['review-reader-value','고전 분류 순서에서 독자의 구체적인 생활 해석으로 넘어가는 추가 근거는 무엇인가?']
];
function build(packet){
 if(packet?.status!=='ready'||!packet.chart?.hour)
  throw Error('QA_METHOD_HANDOFF_FULL_CHART_REQUIRED');
 checkCalculatedRoles(packet);
 const x=classical.evaluate(packet),m=month.assess(packet);
 const competing=conflict.inspect(packet);
 const general=x.generalMonthRule;
 if(general?.kind!=='qa-general-month-hidden-exposure-structural-analogy-v1'||
    general.methodPriority!=='not-selected'||
    general.authorizedForPaidWriter!==false||
    general.exactWorkedClassicalExampleMatched!==Boolean(x.textuallyMatchedExample)||
    JSON.stringify(general.otherExposedHiddenSourceIds)!==
     JSON.stringify(m.observed.exactExposureScopeComparison
      .nonDayExposedHiddenStemIds.filter(id=>
       id!==m.observed.mainHiddenStemSourceId))||
    general.monthMainSourceId!==m.observed.mainHiddenStemSourceId)
  throw Error('QA_METHOD_HANDOFF_GENERAL_RULE_FACTS_DIVERGED');
 const earth=earthCommentary.inspect(packet);
 if(competing.conclusion!=='abstain-from-full-chart-interpretation'||
    competing.downstreamPaidApproval!==false||competing.providerCalls!==0||
    competing.finalTraditionalPattern!==null||
    competing.adoptedMonthMethod!==null||
    competing.noDetectedTensionsProvesDominantPattern!==false||
    competing.calculatedFacts.monthMainSourceId!==
     m.observed.mainHiddenStemSourceId||
    JSON.stringify(competing.calculatedFacts.nonDayVisibleMonthHiddenSourceIds)!==
     JSON.stringify(m.observed.exactExposureScopeComparison.nonDayExposedHiddenStemIds)||
    competing.documentedClassicalFirstRole!==x.textualCaseFirstRole)
  throw Error('QA_METHOD_HANDOFF_CONFLICT_EVIDENCE_MISMATCH');
 if(x.providerCalls!==0||x.finalPatternSelected!==false||
    x.chosenCommercialTraditionalSchool!==null||
    x.professionReviewed!==false||m.adoptedMethodId!==null||
    m.canApproveDeepSajuInterpretation!==false)
  throw Error('QA_METHOD_HANDOFF_UNAPPROVED_SCOPE_REQUIRED');
 const one='xin-yin-bing-only-month-command-change';
 const two='xin-yin-jia-and-bing-coexposed-month-main-plus-authority';
 const caseId=x.textuallyMatchedExample;
 if(caseId!==null&&caseId!==one&&caseId!==two)
  throw Error('QA_METHOD_HANDOFF_UNRECOGNIZED_TEXTUAL_CASE');
 const src=x.observedConditions;
 const single=caseId===one,dual=caseId===two;
 if(caseId&&(src.dayStem!=='辛'||src.monthBranch!=='寅'||
   !src.exposedSecondaryPositionRefs.includes('natal.month.stem')||
   src.thirdMonthHiddenStemExposedRefs.length!==0||
   (single?src.exposedMainPositionRefs.length!==0:
    src.exposedMainPositionRefs.length===0)))
  throw Error('QA_METHOD_HANDOFF_FALSE_TEXTUAL_MATCH');
 const referenceIds=new Set([
  ...require('./report-fact-bindings').build(packet).map(x=>x.id),
  'facts.stemConnections','facts.seasonalEvidence',
  'facts.governingDayDiagnostic','facts.natalBranchRelations'
 ]);
 const unresolvedConditions=competing.findings.map(f=>{
  if(f.relativePriority!=='not-assessed'||
     f.impactOnActualLife!=='not-established'||
     !Array.isArray(f.sourceRefs)||!f.sourceRefs.length||
     f.sourceRefs.some(id=>!referenceIds.has(id)))
   throw Error('QA_METHOD_HANDOFF_UNVERIFIED_CONFLICT:'+f.id);
  return {id:f.id,sourceRefs:f.sourceRefs.slice(),
   structuralEvidence:structuredClone(f.observed),
   priority:'not-assessed',actualLifeEffect:'not-established'};
 });
 if(unresolvedConditions.length!==competing.distinctObservedTensions)
  throw Error('QA_METHOD_HANDOFF_FINDING_COUNT_DRIFT');
 const decision=caseId?{
  caseId,work:x.sourceDocuments[0].work,
  chapter:x.sourceDocuments[0].chapter,url:x.sourceDocuments[0].url,
  firstTraditionalCategory:x.textualCaseFirstRole,
  supplementaryCategory:x.textualCaseSecondaryRole,
  evidenceRefs:[src.computedMainHiddenSourceId,'natal.day.stem',
   ...src.exposedMainPositionRefs,...src.exposedSecondaryPositionRefs],
  pointOfDeparture:single?
   '달의 기본 글자가 겉으로 드러나지 않고 다른 숨은 글자가 드러난 해당 고전 사례에서는 해석 출발점이 바뀐다.':
   '달의 기본 글자와 다른 숨은 글자가 함께 겉에 드러난 해당 고전 사례에서는 기본 분류를 먼저 검토한다.',
  fullChartConclusionEstablished:false,observedPersonality:false
 }:null;
 const result={
  kind:'qa-source-specific-traditional-method-handoff-v1',
  status:single?'single-secondary-exposure-textual-case-only':
   dual?'main-plus-secondary-exposure-textual-case-only':
   'no-published-textual-case-matches-this-chart',
  calculatedScope:{dayStem:src.dayStem,monthBranch:src.monthBranch,
   mainHiddenSourceId:src.computedMainHiddenSourceId,
   mainVisiblePositions:src.exposedMainPositionRefs.slice(),
   secondaryVisiblePositions:src.exposedSecondaryPositionRefs.slice(),
   competingThirdVisiblePositions:src.thirdMonthHiddenStemExposedRefs.slice(),
   dayStemIsClassificationAnchor:true},
  exactTextualDecision:decision,
  generalMonthRule:structuredClone(general),
  // The generic principle is relevant to a wider class of charts. Matching
  // its structural QUESTION is not matching either explicit Xin/Yin example.
  principleLevelCandidateStatus:general.scopeStatus,
  candidates:m.methodCandidates.map(row=>({id:row.id,status:row.status,
   sourceRefs:row.rowIds.slice(),priority:row.interpretivePriority})),
  // The editor now receives chart-SPECIFIC unresolved observations, not
  // just identical checkboxes. A table count is not a life-event count.
  unresolvedConditions,
  unresolvedConditionCount:unresolvedConditions.length,
  methodEvidenceProvenance:'deterministic-qa-conflict-review',
  noDetectedConflictsCannotApproveMethod:true,
  monthBranchContactCount:competing.calculatedFacts.independentMonthContacts,
  monthBranchTableLabelCount:competing.calculatedFacts.monthBranchTableEntries,
  // An explicitly named Earth-triad category appears in XU's commentary,
  // not explicitly in Shen's quoted original sentence; do not conflate.
  earthThreePunishmentSourceReview:earth,
  expertDecisions:QUESTIONS.map(([id,question])=>({
   id,question,status:'pending',decision:null,sourceCitation:null,
   relevantConditions:unresolvedConditions
    .filter(f=>REVIEW_THEMES[id]?.has(f.id))
    .map(f=>({id:f.id,sourceRefs:f.sourceRefs.slice()})),
   generalTextualPrincipleCandidates:id==='resolve-month'&&
    general.conditionObserved?[{
     id:'general-month-nonmain-exposure',
     sourceUrl:general.sourceUrl,
     monthMainSourceId:general.monthMainSourceId,
     competingSourceIds:general.otherExposedHiddenSourceIds.slice(),
     visibleCandidateRoles:structuredClone(general.otherCandidateRoles),
     exactClassicalCaseMatched:general.exactWorkedClassicalExampleMatched,
     traditionalPriority:'not-selected',
     customerConclusionApproved:false
    }]:[],
   commentaryOnlyConditions:id==='resolve-other-positions'&&
    earth.chartHasAllThreeEarthBranches?[{
     id:'xu-commentary-earth-three-punishment',
     sourceRefs:['facts.natalBranchRelations'],
     commentator:earth.attribution.laterCommentary.commentator,
     commentaryUrl:earth.attribution.laterCommentary.url,
     originalDoesNotExplicitlyNameTriad:true,
     interpretivePriority:'not-assessed',
     anyLifeEffectVerified:false
    }]:[],
   chartSpecificEvidenceSupplied:true
  })),
  nextAction:'human-specialist-choose-method-then-review-reader-manuscript',
  transferToOtherBirthChartsForbidden:true,
  personSpecificPredictionVerified:false,methodApproved:false,
  humanReviewComplete:false,releaseVerdict:'not-approved',
  customerReady:false,readyForPaidModelProbe:false,providerCalls:0
 };
 result.readerInterpretationBoundary=boundaries.build(result);
 return result;
}
module.exports={build};
