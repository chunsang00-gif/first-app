'use strict';
// Offline-only source applicability: checking an EXACT documented classical
// counterfactual is not selecting a commercial school, determining 用神,
// assessing strength, or predicting a real person's traits or events.
const month=require('./report-core-paid-natal-month-method-review');
const classical=require('./report-core-paid-natal-classical-yin-example');
const {LunarUtil}=require('lunar-javascript');
const GOD={'比肩':'비견','劫财':'겁재','食神':'식신','伤官':'상관',
 '偏财':'편재','正财':'정财','七杀':'편관','正官':'정관',
 '偏印':'편인','正印':'정인'};
const names={...GOD,'正财':'정재'};
const ZI_PING='https://caipu.donglishuzhai.net/chapter/3723.html';
const DI_TIAN='https://zh.wikisource.org/zh-hant/%E6%BB%B4%E5%A4%A9%E9%AB%93/17';
function evaluate(packet){
 const review=month.assess(packet),caseResult=classical.inspect(packet);
 const chart=packet.chart;
 const exposure=review.observed.exactExposureScopeComparison;
 const intended=caseResult.singleExposureTextualChange.scopeMatched?
  'xin-yin-bing-only-month-command-change':
  caseResult.dualExposureTextualPriority.scopeMatched?
   'xin-yin-jia-and-bing-coexposed-month-main-plus-authority':null;
 const yearMonthHour=['year','month','hour'].map(pos=>({
  position:pos,id:'natal.'+pos+'.stem',stem:chart[pos][0]
 }));
 const mainPositions=yearMonthHour.filter(x=>x.stem==='甲').map(x=>x.id);
 const secondaryPositions=yearMonthHour.filter(x=>x.stem==='丙').map(x=>x.id);
 const competingPositions=yearMonthHour.filter(x=>x.stem==='戊').map(x=>x.id);
 const exactYinXin=chart.month[1]==='寅'&&chart.day[0]==='辛';
 const mainRole=names[LunarUtil.SHI_SHEN[chart.day[0]+'甲']];
 const secondaryRole=names[LunarUtil.SHI_SHEN[chart.day[0]+'丙']];
 if(exactYinXin&&(mainRole!=='정재'||secondaryRole!=='정관'||
    review.observed.mainHiddenStemSourceId!=='natal.month.hidden.甲'))
  throw Error('QA_CLASSICAL_METHOD_ROLE_OR_MONTH_DIVERGED');
 if(Boolean(intended)!==Boolean(exactYinXin&&secondaryPositions.length&&
     !competingPositions.length))
  throw Error('QA_CLASSICAL_METHOD_APPLICABILITY_DIVERGED');
 if(intended&&!exposure.nonDayExposedHiddenStemIds.includes(
    'natal.month.hidden.丙'))
  throw Error('QA_CLASSICAL_METHOD_EXPOSURE_DIVERGED');
 if(intended?.endsWith('month-command-change')&&
    (mainPositions.length!==0||
     exposure.nonDayExposedHiddenStemIds.includes('natal.month.hidden.甲')))
  throw Error('QA_CLASSICAL_METHOD_SINGLE_EXPOSURE_DIVERGED');
 if(intended?.includes('coexposed')&&
    (mainPositions.length===0||
     !exposure.nonDayExposedHiddenStemIds.includes('natal.month.hidden.甲')))
  throw Error('QA_CLASSICAL_METHOD_DUAL_EXPOSURE_DIVERGED');
 const branchCounts=review.observed.natalRelationsTouchingMonth.relationshipCardinality;
 const doc={
  kind:'qa-source-bound-month-method-applicability-v1',
  status:intended?'exact-textual-conditions-only':'no-applicable-textual-precedent',
  textuallyMatchedExample:intended,
  sourceDocuments:[
   {work:'子平真詮',chapter:'論用神變化',url:ZI_PING,
    use:'explicit Xin/Yin Jia+Bing month-exposure examples only',
    doesNotEstablishFinalPattern:true},
   {work:'滴天髓',chapter:'月令論',url:DI_TIAN,
    use:'alternative governing-day/stem framework; method not chosen',
    doesNotEstablishActiveStem:true}
  ],
  observedConditions:{
   dayStem:chart.day[0],monthBranch:chart.month[1],
   exposedMainPositionRefs:mainPositions,
   exposedSecondaryPositionRefs:secondaryPositions,
   thirdMonthHiddenStemExposedRefs:competingPositions,
   dayMasterExcludedFromVisibility:true,
   computedMainHiddenSourceId:review.observed.mainHiddenStemSourceId
  },
  // Only the Xin/Yin source text's explicitly described point of
  // departure can be reproduced; not the final pattern or a life outcome.
  textualCaseFirstRole:intended?(
   intended==='xin-yin-bing-only-month-command-change'?'정관':'정재'):null,
  textualCaseSecondaryRole:intended?.includes('coexposed')?'정관':null,
  methodConflict:{
   governingDayStatus:'unresolved',
   approximateDayRuleStatus:review.methodCandidates[1].status,
   approximateDayRuleCandidateSourceIds:review.methodCandidates[1].rowIds.slice(),
   exactStemVisibilityStatus:review.methodCandidates[2].status,
   monthRelationsDistinctContacts:branchCounts.independentPairContactCount,
   monthRelationsTableEntries:branchCounts.pairTableEntryCount,
   realizedBranchTransformation:'not-assessed'
  },
  blockers:[
   'independent-classical-method-selection-not-performed',
   'exact-governing-day-stem-not-verified',
   'other-branch-interactions-not-prioritized',
   'final-chart-pattern-not-reviewed',
   'real-world-personal-outcomes-not-observed'
  ],
  chosenCommercialTraditionalSchool:null,
  governingDayDetermined:false,finalPatternSelected:false,
  professionReviewed:false,readyForCustomer:false,
  inferredPersonality:false,providerCalls:0,releaseVerdict:'not-approved'
 };
 if(review.status!=='method-priority-not-selected'||
    review.interpretivePriorityVerified!==false||
    review.adoptedMethodId!==null||
    review.canApproveDeepSajuInterpretation!==false||
    caseResult.canAutomateFinalTraditionalPattern!==false||
    caseResult.classicalReference.traditionChosenForCommercialInterpretation!==false)
  throw Error('QA_CLASSICAL_METHOD_INTEGRITY_UNAPPROVED');
 return doc;
}
module.exports={evaluate};
