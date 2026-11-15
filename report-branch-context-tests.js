'use strict';
const assert=require('node:assert/strict');
const context=require('./report-branch-context');
const source={year:'甲子',month:'乙寅',day:'丙丑',hour:'丁午'};
const result=context.evaluate(source,'丁未');
assert.deepEqual(result.annualContext.day.directTypes,['충','형'],
 'year-to-day clash and punishment must both exist, not cancel one another');
assert.deepEqual(result.annualContext.day.primaryEvidence.map(x=>x.type),['충']);
assert.deepEqual(result.annualContext.day.secondaryCandidates.map(x=>x.type),['형']);
assert(result.annualContext.day.hasCompetingClaims);
assert.equal(result.annualContext.day.eligibleForLimitedDescription,true);
assert.equal(result.annualContext.day.favorableOrUnfavorable,'not-assessed');
assert.equal(result.annualContext.day.meaningStrength,'not-assessed');
assert.equal(result.interpretationPriority,'unresolved');
assert.equal(result.transformation,'not-assessed');
assert.equal(result.monthlyContext.monthBranch,'寅');
assert.equal(result.monthlyContext.seasonalStrength,'not-assessed');
assert(result.reviewStages.some(x=>x.stage==='transformation-strength-and-final-priority'&&
 x.reviewed===false),'no unsupported total ordering of relations');
assert(result.annualContext.positions.day.contenders.some(x=>x.type==='육합'&&x.origin==='natal'),
 'the natal day-month pair still competes with annual day relations');
const harmonized=context.evaluate({year:'甲辰',month:'乙子',day:'丙午',hour:null},'丁未');
assert(harmonized.annualContext.day.directTypes.includes('육합'));
assert(harmonized.annualContext.day.eligibleForLimitedDescription);
assert(harmonized.annualContext.day.otherRelationsTouchingDay.some(x=>x.type==='충'),
 'a natal clash cannot disappear merely because a yearly harmony appears');
assert.equal(harmonized.annualContext.positions.hour,undefined);
const weak=context.evaluate({year:'甲亥',month:'乙卯',day:'丙子',hour:null},'丁未');
assert.deepEqual(weak.annualContext.day.directTypes,['해']);
assert.equal(weak.annualContext.day.eligibleForLimitedDescription,false,
 'a lone secondary school-dependent pair cannot prove an annual relationship insight');
assert(weak.annualContext.day.rule.includes('없거나 인간관계가 좋거나 나쁘다는 뜻은 아니다'));
const empty=context.evaluate({year:'甲亥',month:'乙卯',day:'丙寅',hour:null},'丁未');
assert.equal(empty.annualContext.day.eligibleForLimitedDescription,false);
assert(empty.annualContext.positions.year.contenders.length>=1);
const existing=context.evaluate({year:'甲亥',month:'乙卯',day:'丙未',hour:null},'丁未');
assert(existing.targetYearBranchRelations.groups.some(x=>x.type==='삼합'&&x.positions.includes('annual')),
 'an annual branch may join an existing triad without rewriting the day branch');
assert(existing.annualContext.positions.day.contenders.some(x=>x.type==='삼합'&&x.origin==='natal'));
assert.equal(existing.annualContext.day.hasCompetingClaims,false,
 'the exact annual source cannot be falsely reassigned to an identical natal day branch');
assert.equal(existing.reviewStages.find(x=>x.stage==='natal-and-annual-group-completion')
 .newlyCompletedByAnnual.length,0,'pre-existing trio is not a new annual event');
assert.throws(()=>context.evaluate({year:'甲子',month:null,day:'丙午'},'丁未'),/required/);
console.log('PASS competing annual/natal branch relations, conditional evidence and unresolved transformation; no API calls');
