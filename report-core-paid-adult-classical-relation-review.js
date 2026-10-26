'use strict';
// QA ONLY: do not promote elemental arrows to life, strength or method
// priority. Check all four stems AND a hidden month-main intermediary for
// one exact adult calendar case; compare the alternate birth hour.
const facts=require('./report-facts-node');
const method=require('./report-core-paid-general-month-classical-screen');
const month=require('./report-core-paid-natal-month-method-review');
const roles=require('./report-fact-bindings');
const arrows=require('./report-core-paid-natal-visible-relation-bridge');
const INPUT={calendar:'solar',birthDate:'1994-07-15',birthTime:'14:20',
 gender:'male',mbti:'ISFP'};
const EXPECTED={year:'甲戌',month:'辛未',day:'壬寅',hour:'丁未'};
const SOURCE='https://changxianyi.com/guji/ziping/wz-20260914/chapter-017/';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function inspect(packet){
 if(packet?.status!=='ready'||packet.targetYear?.year!==2027||
    Object.entries(INPUT).some(([key,value])=>
     packet.calculationInput?.[key]!==value)||
    Object.entries(EXPECTED).some(([key,value])=>packet.chart?.[key]!==value))
  return null;
 const shown=method.inspect(packet),review=month.assess(packet);
 const index=Object.fromEntries(roles.build(packet).map(v=>[v.id,v]));
 const ids={
  year:'natal.year.stem',month:'natal.month.stem',
  day:'natal.day.stem',hour:'natal.hour.stem',
  hiddenMain:'natal.month.hidden.己',
  hiddenExposed:'natal.month.hidden.丁'};
 const known={
  year:['甲','식신'],month:['辛','정인'],
  day:['壬','일간'],hour:['丁','정재'],
  hiddenMain:['己','정관'],hiddenExposed:['丁','정재']};
 for(const [name,id] of Object.entries(ids)){
  const entry=index[id],expected=known[name];
  if(!entry||entry.stem!==expected[0]||entry.tenGod!==expected[1]||
     entry.observedBehavior!==false||
     entry.interpretationScope!=='traditional-symbol-only')
   throw Error('QA_ADULT_DIRECTION_ROLE_SOURCE_MISMATCH:'+name);
 }
 if(shown.provisionalMethodCandidate!==ids.hiddenExposed||
    shown.distinctVisibleCandidateCount!==1||
    !same(shown.candidates[0].exposedAt,[ids.hour])||
    shown.completeSanHeGroupMembership.length!==0||
    review.observed.mainHiddenStemSourceId!==ids.hiddenMain||
    review.observed.exactExposureScopeComparison
      .nonDayExposedHiddenStemIds.includes(ids.hiddenMain)||
    review.interpretivePriorityVerified!==false)
  throw Error('QA_ADULT_DIRECTION_CLASSICAL_METHOD_DRIFT');
 const direct=[
  {from:ids.hour,to:ids.month,expected:'left-controls-right',
   question:'hour-wealth-versus-month-resource'},
  {from:ids.year,to:ids.hour,expected:'left-generates-right',
   question:'year-output-feeds-hour-wealth'},
  {from:ids.day,to:ids.hour,expected:'left-controls-right',
   question:'day-reference-controls-hour-wealth'}
 ];
 const checks=direct.map(row=>{
  const from=index[row.from],to=index[row.to];
  const actual=arrows.direction(from.stem,to.stem);
  if(actual!==row.expected)
   throw Error('QA_ADULT_DIRECTION_CALCULATION_MISMATCH:'+row.question);
  return {from:row.from,to:row.to,direction:actual,
   question:row.question,actualInfluence:'not-assessed',
   relativePriority:'not-assessed'};
 });
 const hypotheticalChain=[
  {from:ids.hour,to:ids.hiddenMain,expected:'left-generates-right'},
  {from:ids.hiddenMain,to:ids.month,expected:'left-generates-right'}
 ].map(step=>{
  const actual=arrows.direction(index[step.from].stem,index[step.to].stem);
  if(actual!==step.expected)
   throw Error('QA_ADULT_DIRECTION_INTERMEDIARY_MISMATCH');
  return {from:step.from,to:step.to,direction:actual,
   realizedMediation:false};
 });
 const other=facts.build({...packet.calculationInput,birthTime:'20:20'},2027);
 const alternate=method.inspect(other);
 if(other.status!=='ready'||other.chart.year!==packet.chart.year||
    other.chart.month!==packet.chart.month||
    other.chart.day!==packet.chart.day||
    other.chart.hour==='丁未'||!alternate?.applicable||
    alternate.candidates.some(x=>x.sourceId===ids.hiddenExposed))
  throw Error('QA_ADULT_DIRECTION_HOUR_COUNTERFACTUAL_UNVERIFIED');
 return {
  kind:'qa-classical-visible-relation-and-hidden-intermediary-review-v1',
  chartFingerprint:Object.values(EXPECTED).join('/'),
  source:{title:'子平真詮',chapter:'論雜氣如何取用',
   url:SOURCE,workedExampleMatchesThisChart:false,
   textualScope:'coexisting-relationships-must-be-reviewed'},
  verified:{monthMain:ids.hiddenMain,oneExposedCandidate:ids.hiddenExposed,
   exposedAt:[ids.hour],monthMainNotExposed:true,
   yearMonthDayRemainSameUnderChangedHour:true,
   changedHourLosesExposedWealthCandidate:true,
   directRelations:checks,
   hiddenMainAsPossibleIntermediary:hypotheticalChain},
  unresolved:{hiddenMonthIntermediaryNotProvenActive:true,
   directOppositionDoesNotProveNegativeLifeOutcome:true,
   chainDoesNotProveBeneficialLifeOutcome:true,
   branchRelationsDoNotResolvePriority:true,
   dayMasterStrengthNotCalculated:true,
   traditionalMethodPriority:'not-established',
   overallPatternSelected:false},
  readerUse:'editorial-conditional-explanation-only',
  authorizesPersonalTrait:false,
  authorizesCareerOrFinanceForecast:false,
  authorizesPaidWriter:false,
  paidQualityValidated:false,providerCalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={inspect};