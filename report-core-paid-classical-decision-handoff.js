'use strict';
// OFFLINE expert method-decision worksheet; NEVER a paid Saju interpretation.
// Exact classical conditions do not determine a chart's full traditional
// pattern, personal traits, life events, or willingness to pay.
const classical=require('./report-core-paid-natal-classical-method-applicability');
const month=require('./report-core-paid-natal-month-method-review');
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
 const x=classical.evaluate(packet),m=month.assess(packet);
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
 return {
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
  candidates:m.methodCandidates.map(row=>({id:row.id,status:row.status,
   sourceRefs:row.rowIds.slice(),priority:row.interpretivePriority})),
  expertDecisions:QUESTIONS.map(([id,question])=>({
   id,question,status:'pending',decision:null,sourceCitation:null
  })),
  nextAction:'human-specialist-choose-method-then-review-reader-manuscript',
  transferToOtherBirthChartsForbidden:true,
  personSpecificPredictionVerified:false,methodApproved:false,
  humanReviewComplete:false,releaseVerdict:'not-approved',
  customerReady:false,readyForPaidModelProbe:false,providerCalls:0
 };
}
module.exports={build};
