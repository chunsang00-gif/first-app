'use strict';
// The three candidate month methods are not equivalent. Review the actual
// canonically computed packet, never adopt the exploratory date division.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const audit=require('./report-core-paid-natal-month-method-review');
const input=[
 {calendar:'solar',birthDate:'1982-06-15',birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'1982-03-15',birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'1988-12-15',birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'1994-04-15',birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,birthTime:'14:20',gender:'male',mbti:'ISFP'}
];
const rows=[];
for(const item of input){
 const packet=facts.build(item,2027);
 assert.equal(packet.status,'ready');
 const result=audit.assess(packet);
 assert.equal(result.status,'method-priority-not-selected');
 assert.equal(result.methodCandidates.length,3);
 assert.equal(result.counterexamples.length,5);
 const exposure=result.observed.exactExposureScopeComparison;
 assert.equal(exposure.selectionRuleAdopted,false);
 assert.equal(exposure.traditionalMeaningAndPriorityVerified,false);
 const visible=packet.facts.stemConnections.exposure
  .filter(x=>x.position==='month'&&x.exactExposure);
 assert.deepEqual(exposure.allPositionsExposedHiddenStemIds,
  visible.map(x=>x.hiddenId));
 const nonDay=visible.filter(x=>x.exactVisibleMatches.some(v=>v.id!=='natal.day.stem'))
  .map(x=>x.hiddenId);
 const dayOnly=visible.filter(x=>x.exactVisibleMatches.every(v=>v.id==='natal.day.stem'))
  .map(x=>x.hiddenId);
 assert.deepEqual(exposure.nonDayExposedHiddenStemIds,nonDay);
 assert.deepEqual(exposure.dayMasterOnlyExposedHiddenStemIds,dayOnly);
 assert.equal(result.methodCandidates[2].id,
  'exact-month-hidden-to-non-day-visible-stem-screen');
 assert.deepEqual(result.methodCandidates[2].rowIds,nonDay,
  'a match to day master only cannot silently become a non-day exposure candidate');
 assert.equal(result.methodCandidates[2].interpretivePriority,'not-assessed');
 assert.equal(result.methodCandidates[2].status,
  'exploratory-non-day-exposure-screen-not-adopted');
 assert(exposure.rows.every(x=>
  x.matchOnlyDayMaster===(x.dayMasterVisibleMatch&&
   x.nonDayVisibleSourceIds.length===0)));
 assert(result.counterexamples.some(x=>
  x.id==='day-master-is-not-an-automatically-ranked-exposure'));
 assert.equal(result.adoptedMethodId,null);
 assert.equal(result.activeHiddenStemId,null);
 assert.equal(result.governingDayVerified,false);
 assert.equal(result.interpretivePriorityVerified,false);
 assert.equal(result.canApproveDeepSajuInterpretation,false);
 assert.equal(result.releaseVerdict,'not-approved');
 assert.equal(result.providerCalls,0);
 assert.equal(result.observed.mainHiddenStemSourceId,
  'natal.month.hidden.'+packet.facts.seasonalEvidence.monthMainQiStem);
 assert.deepEqual(result.observed.hiddenStemSourceIds,
  packet.facts.seasonalEvidence.monthHiddenStems.map(x=>
   'natal.month.hidden.'+x.stem));
 assert.equal(result.methodCandidates[1].status,'exploratory-not-adopted');
 assert(result.methodCandidates.every(x=>x.interpretivePriority==='not-assessed'));
 const observed=result.observed;
 const proposed=observed.approximateGoverningCandidate;
 if(proposed?.outsideCanonicalHiddenStems)assert.equal(proposed.natalSourceId,null);
 const monthRelations=packet.facts.natalBranchRelations;
 assert.equal(observed.natalRelationsTouchingMonth.pairs.length,
  monthRelations.pairs.filter(x=>x.positions.includes('month')).length);
 assert.equal(observed.natalRelationsTouchingMonth.groups.length,
  monthRelations.groups.filter(x=>x.positions.includes('month')).length);
 rows.push({date:item.birthDate,branch:observed.monthBranch,phase:observed.monthPhase,
  main:observed.mainHiddenStemSourceId,
  approximate:proposed?.stem||null,
  candidateDiffersFromMain:observed.comparedMethodCandidateDiffersFromMain,
  monthExposures:observed.exactExposuresOfMonthHidden.length,
  nonDayExposures:exposure.nonDayExposedHiddenStemIds.length,
  dayMasterOnlyExposures:exposure.dayMasterOnlyExposedHiddenStemIds.length,
  natalMonthRelationCount:observed.natalRelationsTouchingMonth.pairs.length+
   observed.natalRelationsTouchingMonth.groups.length,
  approved:false});
 // Intentional, independent payload tamper: no interpretation from
 // an altered seasonal or governing-day record.
 const altered=structuredClone(packet);
 altered.facts.qiEvidence.governance.activeHiddenStemId='natal.month.hidden.甲';
 assert.throws(()=>audit.assess(altered),/QA_MONTH_METHOD_CALCULATION_DIVERGED:qi/);
 const copied=structuredClone(packet);
 copied.facts.governingDayDiagnostic.approximateStageCandidate={
  stem:'壬',natalHiddenStemPresent:true,natalSourceId:'natal.month.hidden.壬'
 };
 assert.throws(()=>audit.assess(copied),/QA_MONTH_METHOD_CALCULATION_DIVERGED:diagnostic-day-table/);
 const relation=structuredClone(packet);
 relation.facts.natalBranchRelations.pairs.push({
  type:'육합',positions:['month','hour'],branches:'甲乙'});
 assert.throws(()=>audit.assess(relation),/QA_MONTH_METHOD_CALCULATION_DIVERGED:branch-relations/);
}
const unknown=facts.build({calendar:'solar',birthDate:'2001-11-03',
 unknownBirthTime:true,gender:'male',mbti:'모름'},2027);
assert.throws(()=>audit.assess(unknown),/QA_MONTH_METHOD_INCOMPLETE_CHART/);
assert.equal(rows.length,5);
console.log('QA_MONTH_METHOD_COMPARISON='+JSON.stringify({
 kind:'five-fixed-synthetic-or-diagnostic-cases',providerCalls:0,
 interpretationApproved:false,rows}));
console.log('PASS month methods remain unadopted, conflicting source candidates and tampering never create a premium interpretation; no API calls');
