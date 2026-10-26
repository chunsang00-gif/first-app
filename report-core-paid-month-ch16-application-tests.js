'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const screen=require('./report-core-paid-month-ch16-application');
const base={calendar:'lunar',birthDate:'1982-11-24',
 leapMonth:false,gender:'male',mbti:'ISFP'};
const first=facts.build({...base,birthTime:'14:20'},2027);
const second=facts.build({...base,birthTime:'20:20'},2027);
const a=screen.inspect(first),b=screen.inspect(second);
assert(a&&b);
assert.equal(a.source.originalRule,'一透則一用');
assert.equal(a.source.originalWorkedExampleIsThisChart,false);
assert.equal(a.verified.soleDistinctExposedMonthHiddenCandidate,
 b.verified.soleDistinctExposedMonthHiddenCandidate);
assert.deepEqual(a.verified.candidateExposedAt,
 ['natal.month.stem','natal.hour.stem']);
assert.deepEqual(b.verified.candidateExposedAt,['natal.month.stem']);
assert.deepEqual(a.verified.otherHourExposedAt,b.verified.candidateExposedAt);
assert.deepEqual(b.verified.otherHourExposedAt,a.verified.candidateExposedAt);
assert.equal(a.verified.completeMonthBranchGroups,0);
assert.equal(b.verified.completeMonthBranchGroups,0);
assert.deepEqual(a.verified.branchTable.monthYear,b.verified.branchTable.monthYear);
assert.deepEqual(a.verified.branchTable.monthDay,b.verified.branchTable.monthDay);
assert.deepEqual(a.verified.branchTable.monthHour,b.verified.branchTable.alternateMonthHour);
assert.deepEqual(b.verified.branchTable.monthHour,a.verified.branchTable.alternateMonthHour);
assert(a.verified.branchTable.monthDay.tableLabels.includes('충'));
assert(a.verified.branchTable.monthHour.tableLabels.includes('충'));
assert(b.verified.branchTable.monthHour.tableLabels.includes('형'));
assert(!b.verified.branchTable.monthHour.tableLabels.includes('충'));
assert.notDeepEqual(a.verified.branchTable.monthHour,b.verified.branchTable.monthHour);
for(const v of [a,b]){
 assert.equal(v.verified.monthHiddenStemCount,3);
 assert.equal(v.verified.singleCandidateSurvivesHourChange,true);
 assert.equal(v.verified.duplicatePositionDoesNotCreateSecondKind,true);
 assert.equal(v.verified.monthDayAndMonthYearUnchangedByBirthHour,true);
 assert.equal(v.verified.monthHourBranchContactChangesByBirthHour,true);
 assert.equal(v.verified.twoLabelsOnSamePositionNotTwoIndependentEvents,true);
 assert.equal(v.verified.pairTableCannotSetPatternPriority,true);
 assert.equal(v.overallPatternSelected,false);
 assert.equal(v.individualLifeConclusionEstablished,false);
 assert.equal(v.approvedForCustomer,false);
 assert.equal(v.providerCalls,0);
}
const tampered=structuredClone(first);
tampered.facts.stemConnections.exposure=[];
assert.throws(()=>screen.inspect(tampered),/CALCULATION_DIVERGED/);
assert.equal(screen.inspect(facts.build({...base,birthTime:'09:20'},2027)),null);
console.log('QA_MONTH_CH16_APPLICATION='+JSON.stringify({
 sameCandidate:true,earlyAdditionalHourExposure:true,
 laterHourDifferentSymbol:true,patternChosen:false,providerCalls:0
}));
console.log('PASS verified narrow classical method rule and true birth-hour counterexample');