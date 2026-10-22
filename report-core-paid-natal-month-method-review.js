'use strict';
// QA only: compare rival month-method observations without selecting one.
// Never infer qi strength, personality, a favorable pattern or life events.
const season=require('./report-seasonal-evidence');
const qi=require('./report-qi-evidence');
const governing=require('./report-governing-day-method');
const links=require('./report-stem-connections');
const relations=require('./report-branch-relations');
function same(found,computed,kind){
 if(JSON.stringify(found)!==JSON.stringify(computed))
  throw Error('QA_MONTH_METHOD_CALCULATION_DIVERGED:'+kind);
}
function assess(packet){
 if(packet?.status!=='ready'||!packet.chart?.hour||!packet.facts)
  throw Error('QA_MONTH_METHOD_INCOMPLETE_CHART');
 const chart=packet.chart,f=packet.facts,branch=chart.month[1];
 const seasonal=season.evaluate(chart);
 const qiData=qi.build(chart,f.solarTermTiming);
 const graph=links.build(chart);
 const natal=relations.natal(chart);
 const exploratory=governing.inspect({
  chart,timing:f.solarTermTiming,hiddenStems:season.HIDDEN[branch]
 });
 same(f.seasonalEvidence,seasonal,'season');
 same(f.qiEvidence,qiData,'qi');
 same(f.stemConnections,graph,'stem-connections');
 same(f.natalBranchRelations,natal,'branch-relations');
 same(f.governingDayDiagnostic,exploratory,'diagnostic-day-table');
 if(qiData.governance.activeHiddenStemId!==null||
    qiData.governance.activeHiddenStemStatus!=='unresolved'||
    qiData.governance.hiddenStemGoverningDaysRule!=='not-selected'||
    seasonal.strengthVerdict!=='not-assessed'||
    exploratory.canUseForPremiumInterpretation!==false||
    exploratory.activeHiddenStemId!==null)
  throw Error('QA_MONTH_METHOD_UNAPPROVED_HIDDEN_QI_OR_STRENGTH');
 const monthMain='natal.month.hidden.'+seasonal.monthMainQiStem;
 const monthHidden=season.HIDDEN[branch].map(stem=>'natal.month.hidden.'+stem);
 const exposed=graph.exposure.filter(x=>x.position==='month'&&x.exactExposure)
  .map(x=>({sourceId:x.hiddenId,visibleSourceIds:x.exactVisibleMatches.map(v=>v.id)}));
 // The day stem is the day master used as the reference for ten-god
 // classification. Do not silently count that self-reference as identical
 // to exposure through a DIFFERENT visible position when comparing texts
 // about month-hidden-to-visible selection. Both observations remain visible;
 // neither is an approved 格局/priority decision.
 const exposureScope=exposed.map(row=>{
  const nonDayVisibleSourceIds=row.visibleSourceIds.filter(id=>
   id!=='natal.day.stem');
  return {
   sourceId:row.sourceId,
   allVisibleSourceIds:row.visibleSourceIds.slice(),
   nonDayVisibleSourceIds,
   dayMasterVisibleMatch:row.visibleSourceIds.includes('natal.day.stem'),
   matchOnlyDayMaster:row.visibleSourceIds.length>0&&
    nonDayVisibleSourceIds.length===0
  };
 });
 const dayMasterOnlyExposureIds=exposureScope.filter(x=>x.matchOnlyDayMaster)
  .map(x=>x.sourceId);
 const nonDayExactExposureIds=exposureScope.filter(x=>x.nonDayVisibleSourceIds.length)
  .map(x=>x.sourceId);
 const pairs=natal.pairs.filter(x=>x.positions.includes('month'))
  .map(x=>({type:x.type,positions:x.positions.slice(),branches:x.branches}));
 const groups=natal.groups.filter(x=>x.positions.includes('month'))
  .map(x=>({type:x.type,positions:x.positions.slice(),branches:x.branches}));
 const candidate=exploratory.approximateStageCandidate;
 const candidateId=candidate?.natalSourceId||null;
 const different=Boolean(candidate&&candidateId!==monthMain);
 const observed={
  monthBranch:branch,monthPhase:seasonal.monthPhase,
  mainHiddenStemSourceId:monthMain,hiddenStemSourceIds:monthHidden,
  exactExposuresOfMonthHidden:exposed,
  // A methodological sensitivity analysis, not a chosen school rule:
  // the all-positions graph includes natal.day.stem while a proposed
  // non-day exposure screen considers only year/month/hour stems.
  exactExposureScopeComparison:{
   allPositionsExposedHiddenStemIds:exposureScope.map(x=>x.sourceId),
   nonDayExposedHiddenStemIds:nonDayExactExposureIds,
   dayMasterOnlyExposedHiddenStemIds:dayMasterOnlyExposureIds,
   rows:exposureScope,
   selectionRuleAdopted:false,
   traditionalMeaningAndPriorityVerified:false
  },
  approximateGoverningCandidate:candidate?{
   stem:candidate.stem,natalSourceId:candidateId,
   status:exploratory.status,
   nearApproximateBoundary:exploratory.withinOneDayOfPublishedBoundary,
   outsideCanonicalHiddenStems:!candidate.natalHiddenStemPresent
  }:null,
  natalRelationsTouchingMonth:{pairs,groups,
   overlappingCandidates:pairs.length+groups.length>1},
  comparedMethodCandidateDiffersFromMain:different,
  determinedActiveQi:false,determinedSymbolPriority:false
 };
 const methodCandidates=[
  {id:'canonical-month-main-hidden-stem',rowIds:[monthMain],
   status:'structural-label-only',interpretivePriority:'not-assessed'},
  {id:'approximate-thirty-day-governing-table',
   rowIds:candidateId?[candidateId]:[],
   status:'exploratory-not-adopted',interpretivePriority:'not-assessed'},
  {id:'exact-month-hidden-to-visible-stem',
   rowIds:exposed.map(x=>x.sourceId),
   status:'exact-character-match-only',interpretivePriority:'not-assessed'}
 ];
 const counterexamples=[
  {id:'main-stem-is-not-active-qi',
   observed:'본기 '+monthMain+'가 계산되어도 실제 사령은 아직 확정되지 않았다.',
   invalidClaim:'월지 본기가 곧 현재 사령이며 더 강하다.'},
  {id:'exploratory-table-is-not-authority',
   observed:different?
    '참고 날짜표의 후보가 본기와 다르거나 정규 숨은 글자가 아닐 수 있다.':
    '참고 날짜표의 후보가 본기와 같아도 사령이 확정되는 것은 아니다.',
   invalidClaim:'참고 30일 날짜표가 실제 사령을 확정한다.'},
  {id:'exposure-is-not-pattern-priority',
   observed:exposed.length?
    '월의 숨은 글자 중 겉글자와 정확히 대응하는 후보가 있다.':
    '월의 숨은 글자와 정확히 일치하는 겉글자가 확인되지 않았다.',
   invalidClaim:'글자 일치만으로 격국의 우위 또는 용신을 확정한다.'},
  {id:'day-master-is-not-an-automatically-ranked-exposure',
   observed:dayMasterOnlyExposureIds.length?
    '월의 숨은 글자 중 태어난 날의 기준 글자에만 대응하는 경우가 있다.':
    '이번 명식의 월 숨은 글자에서 날의 기준 글자에만 대응하는 사례는 확인되지 않았다.',
   invalidClaim:'태어난 날의 기준 글자와 대응하면 곧바로 취격·우위가 확정된다.'},
  {id:'branch-overlap-is-not-transformation',
   observed:pairs.length+groups.length>1?
    '월을 포함한 지지 관계가 서로 겹치는 것이 관찰된다.':
    '월을 포함한 지지 관계의 존재 여부만 계산됐다.',
   invalidClaim:'관계표의 합·충이 다른 관계를 삭제하거나 사건을 확정한다.'}
 ];
 return {
  kind:'qa-natal-month-method-comparison-v1',
  status:'method-priority-not-selected',observed,methodCandidates,counterexamples,
  adoptedMethodId:null,activeHiddenStemId:null,
  governingDayVerified:false,interpretivePriorityVerified:false,
  canApproveDeepSajuInterpretation:false,
  providerCalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={assess};
