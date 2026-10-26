'use strict';
// QA research only, general across birth charts: applies the narrow candidate
// screen in Zi Ping Zhen Quan chapter 16 for 辰戌丑未 month branches.
// Exposed stems and three-branch group MEMBERSHIP are observations, never
// a proven pattern, actual transformation, personality, or future outcome.
const month=require('./report-core-paid-natal-month-method-review');
const bindings=require('./report-fact-bindings');
const STORAGE=new Set(['辰','戌','丑','未']);
const PAGE='https://www.donglishuzhai.net/chapter/3729.html';
const exact=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function inspect(packet){
 if(packet?.status!=='ready'||!packet.chart?.hour||!packet.facts)
  throw Error('QA_GENERAL_MONTH_CLASSICAL_INVALID_FACTS');
 const branch=packet.chart.month?.[1];
 if(!branch)throw Error('QA_GENERAL_MONTH_CLASSICAL_UNKNOWN_MONTH');
 if(!STORAGE.has(branch))return {
  kind:'qa-classical-month-candidate-screen-v1',
  applicable:false,reason:'chapter16-storage-month-only',
  chartFingerprint:['year','month','day','hour'].map(k=>packet.chart[k]).join('/'),
  candidates:[],sourceRefs:[],provisionalMethodCandidate:null,
  anyFinalPatternChosen:false,observedLifeOutcome:false,
  approvedForPaidRequest:false,providerCalls:0,releaseVerdict:'not-approved'
 };
 const calc=month.assess(packet),o=calc.observed;
 const index=Object.fromEntries(bindings.build(packet).map(row=>[row.id,row]));
 const listed=o.exactExposureScopeComparison.nonDayExposedHiddenStemIds;
 const fields=o.exactExposureScopeComparison.rows;
 const canonical=o.hiddenStemSourceIds;
 if(canonical.length!==3||new Set(canonical).size!==3||
    new Set(listed).size!==listed.length||
    listed.some(id=>!canonical.includes(id))||
    calc.activeHiddenStemId!==null||
    calc.canApproveDeepSajuInterpretation!==false)
  throw Error('QA_GENERAL_MONTH_CLASSICAL_UNVERIFIED_PREMISE');
 const candidates=listed.map(id=>{
  const row=index[id],ex=fields.find(x=>x.sourceId===id);
  if(!row?.tenGod||row.observedBehavior!==false||
     row.interpretationScope!=='traditional-symbol-only'||
     !ex||!ex.nonDayVisibleSourceIds.length||
     ex.nonDayVisibleSourceIds.some(ref=>
      !['natal.year.stem','natal.month.stem','natal.hour.stem'].includes(ref)||
      index[ref]?.stem!==row.stem))
   throw Error('QA_GENERAL_MONTH_CLASSICAL_BAD_VISIBLE_SOURCE');
  return {sourceId:id,traditionalRole:row.tenGod,
   exposedAt:ex.nonDayVisibleSourceIds.slice(),
   repeatedPositionsAreStillOneKind:true};
 });
 const groups=o.natalRelationsTouchingMonth.groups;
 const triads=groups.filter(x=>x.type==='삼합').map(x=>({
  type:x.type,branches:x.branches,positions:x.positions.slice(),
  calculatedMembershipOnly:true,transformationConfirmed:false
 }));
 const otherGroups=groups.filter(x=>x.type!=='삼합').map(x=>({
  type:x.type,branches:x.branches,positions:x.positions.slice(),
  canTreatAsClassicalChapter16SanHe:false
 }));
 const status=triads.length?
  (candidates.length?'exposure-and-complete-triad-need-joint-review':
   'complete-triad-without-visible-stem-needs-review'):
  candidates.length===0?'no-visible-candidate-or-triad':
  candidates.length===1?'one-visible-candidate-needs-review':
   'multiple-visible-candidates-need-reconciliation';
 const primaryCandidate=candidates.length===1&&!triads.length?
  candidates[0].sourceId:null;
 const sourceRefs=[...new Set([
  ...canonical,...candidates.flatMap(c=>[c.sourceId,...c.exposedAt]),
  'facts.stemConnections','facts.natalBranchRelations'
 ])];
 // Chapter 16 itself requires comparing exposed stems AND completed groups;
 // a chart with 1 source kind repeated at 2 stem positions is not 2 kinds.
 return {
  kind:'qa-classical-month-candidate-screen-v1',
  applicable:true,chartFingerprint:['year','month','day','hour']
   .map(k=>packet.chart[k]).join('/'),
  chapter:'十六、論雜氣如何取用',originalRule:'一透則一用',
  originalUrl:PAGE,monthBranch:branch,
  monthHiddenStemSourceIds:canonical.slice(),monthMainSourceId:o.mainHiddenStemSourceId,
  candidates,distinctVisibleCandidateCount:candidates.length,
  completeSanHeGroupMembership:triads,otherGroupsNotEquatedWithSanHe:otherGroups,
  provisionalMethodCandidate:primaryCandidate,
  status,sourceRefs,
  categoryIsOnlyAClassicalMethodCandidate:true,
  noMonthQiPriorityDetermined:true,
  pairTableLabelsDoNotSelectMethod:true,
  noTransformationProved:true,
  anyFinalPatternChosen:false,observedLifeOutcome:false,
  approvedForPaidRequest:false,providerCalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={inspect};