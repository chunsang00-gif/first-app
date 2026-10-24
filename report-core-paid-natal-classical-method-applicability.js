'use strict';
// Offline-only source applicability: checking an EXACT documented classical
// counterfactual is not selecting a commercial school, determining 用神,
// assessing strength, or predicting a real person's traits or events.
const month=require('./report-core-paid-natal-month-method-review');
const classical=require('./report-core-paid-natal-classical-yin-example');
const {LunarUtil}=require('lunar-javascript');
const directions=require('./report-core-paid-natal-visible-relation-bridge');
const ledger=require('./report-fact-bindings');
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
 const dualExact=intended==='xin-yin-jia-and-bing-coexposed-month-main-plus-authority';
 const relation=dualExact?directions.direction('甲','丙'):null;
 if(dualExact&&(
    relation!=='left-generates-right'||
    !mainPositions.length||!secondaryPositions.length||
    mainPositions.some(id=>!['natal.year.stem','natal.month.stem','natal.hour.stem'].includes(id))||
    secondaryPositions.some(id=>!['natal.year.stem','natal.month.stem','natal.hour.stem'].includes(id))))
  throw Error('QA_CLASSICAL_DUAL_CHAPTER11_RELATION_DIVERGED');
 // Chapter 11 explicitly names the SAME dual-exposure Xin/Yin situation,
 // describing the *traditional categories' cooperation* (財官相生).
 // It does NOT warrant judging the entire chart 'pure', auspicious or
 // predicting income, career or anything about the person's conduct.
 const crossChapterReading=dualExact?{
  kind:'exact-chapter11-mutual-category-example-only',
  chapter:'十一、論用神純雜',
  sourceUrl:'https://www.diancangwang.cn/xuanxuewushu/03cf53eede8a/46649fec6649.html',
  monthHiddenMainStemSourceId:'natal.month.hidden.甲',
  exposedMainPositionRefs:mainPositions.slice(),
  exposedSecondPositionRefs:secondaryPositions.slice(),
  verifiedElementalDirection:relation,
  traditionalFirstCategory:'정재',
  traditionalSecondCategory:'정관',
  restrictedTextualRelation:'resource-symbol-generates-authority-symbol',
  supportedScope:'these-two-classical-symbols-connect-in-the-cited-example',
  chartClassifiedAsFavorable:false,
  actualCareerOutcomeInferred:false,
  overallPatternConfirmed:false,
  observedBehavior:false
 }:null;
 // IMPORTANT: the chapter states a GENERAL structural principle ("month
 // hidden stems are multiple; other visible ones may change the starting
 // point"). Its explicitly worked Xin/Yin/Jia/Bing example is MUCH narrower.
 // A different chart can match the structural question but must not inherit
 // that example's fixed first role, pattern, day strength or outcome.
 const hiddenIds=review.observed.hiddenStemSourceIds;
 const mainId=review.observed.mainHiddenStemSourceId;
 const visibleIds=exposure.nonDayExposedHiddenStemIds;
 const nonMainIds=visibleIds.filter(id=>id!==mainId);
 const onlyNonMain=hiddenIds.length>1&&!visibleIds.includes(mainId)&&
  nonMainIds.length===1;
 const recorded=Object.fromEntries(ledger.build(packet).map(x=>[x.id,x]));
 const candidates=nonMainIds.map(id=>{
  if(!hiddenIds.includes(id)||!recorded[id]?.tenGod||
     recorded[id].observedBehavior!==false||
     recorded[id].interpretationScope!=='traditional-symbol-only')
   throw Error('QA_CLASSICAL_GENERAL_HIDDEN_SOURCE_INVALID');
  const row=exposure.rows.find(x=>x.sourceId===id);
  if(!row||row.nonDayVisibleSourceIds.length===0||
     row.nonDayVisibleSourceIds.some(x=>!['natal.year.stem',
      'natal.month.stem','natal.hour.stem'].includes(x)||
      recorded[x]?.stem!==recorded[id].stem))
   throw Error('QA_CLASSICAL_GENERAL_VISIBILITY_INVALID');
  return {sourceId:id,hiddenStem:recorded[id].stem,
   symbolicTenGodCategory:recorded[id].tenGod,
   exposedAt:row.nonDayVisibleSourceIds.slice()};
 });
 const generalMonthRule={
  kind:'qa-general-month-hidden-exposure-structural-analogy-v1',
  sourceWork:'子平真詮',chapter:'十、論用神變化',sourceUrl:ZI_PING,
  sourceScope:'general-hidden-stem-principle-not-an-exact-worked-chart',
  // This is the *question* the text permits us to ask, not a conclusion:
  principle:'달의 숨은 글자가 여럿이면 어떤 글자가 겉에 드러났는지를 따져 해석 출발점의 변화를 검토한다.',
  scopeStatus:onlyNonMain?'candidate-general-principle-analogy-only':
   'single-nonmain-no-main-condition-not-met',
  conditionObserved:onlyNonMain,
  monthBranch:chart.month[1],
  monthMainSourceId:mainId,
  monthMainExposedOutsideDay:visibleIds.includes(mainId),
  otherExposedHiddenSourceIds:nonMainIds.slice(),
  otherCandidateRoles:candidates,
  dayStem:chart.day[0],
  // The original's explicit Xin/Yin examples cannot be copied to the
  // user 1982 Yi/Chou example or any unrelated chart.
  exactWorkedClassicalExampleMatched:Boolean(intended),
  noOtherVisibleMonthCandidate:nonMainIds.length===1,
  cannotInferPriorityFromRepeatedPositions:true,
  methodPriority:'not-selected',
  monthCommandRoleConfirmed:false,
  operativeQiOrStrengthConfirmed:false,
  otherBranchInteractionsResolved:false,
  personalityAndLifeResultsSupported:false,
  authorizedForPaidWriter:false,
  providerCalls:0,releaseVerdict:'not-approved'
 };
 if(onlyNonMain&&(candidates.length!==1||
    !recorded[mainId]||
    candidates[0].sourceId===mainId))
  throw Error('QA_CLASSICAL_GENERAL_FALSE_PRIORITY_CANDIDATE');
 const branchCounts=review.observed.natalRelationsTouchingMonth.relationshipCardinality;
 const doc={
  kind:'qa-source-bound-month-method-applicability-v1',
  status:intended?'exact-textual-conditions-only':'no-applicable-textual-precedent',
  textuallyMatchedExample:intended,
  sourceDocuments:[
   {work:'子平真詮',chapter:'論用神變化',url:ZI_PING,
    use:'general month hidden-stem exposure principle, plus narrow Xin/Yin Jia+Bing examples; not a universal role rank',
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
  crossChapterReading,
  generalMonthRule,
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
