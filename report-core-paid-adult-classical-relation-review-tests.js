'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const audit=require('./report-core-paid-adult-classical-relation-review');
const core={calendar:'solar',birthDate:'1994-07-15',birthTime:'14:20',
 gender:'male',mbti:'ISFP'};
const packet=facts.build(core,2027);
const v=audit.inspect(packet);
assert(v);
assert.equal(v.chartFingerprint,'甲戌/辛未/壬寅/丁未');
assert.equal(v.source.workedExampleMatchesThisChart,false);
assert.equal(v.source.chapter,'論雜氣如何取用');
assert.equal(v.verified.monthMain,'natal.month.hidden.己');
assert.equal(v.verified.oneExposedCandidate,'natal.month.hidden.丁');
assert.equal(v.verified.monthMainNotExposed,true);
assert.deepEqual(v.verified.exposedAt,['natal.hour.stem']);
assert.deepEqual(v.verified.directRelations.map(x=>[
 x.from,x.to,x.direction]),[
 ['natal.hour.stem','natal.month.stem','left-controls-right'],
 ['natal.year.stem','natal.hour.stem','left-generates-right'],
 ['natal.day.stem','natal.hour.stem','left-controls-right']
]);
assert.deepEqual(v.verified.hiddenMainAsPossibleIntermediary.map(x=>[
 x.from,x.to,x.direction]),[
 ['natal.hour.stem','natal.month.hidden.己','left-generates-right'],
 ['natal.month.hidden.己','natal.month.stem','left-generates-right']
]);
assert(v.verified.hiddenMainAsPossibleIntermediary.every(x=>
 x.realizedMediation===false));
assert(v.verified.directRelations.every(x=>
 x.actualInfluence==='not-assessed'&&x.relativePriority==='not-assessed'));
assert.equal(v.unresolved.hiddenMonthIntermediaryNotProvenActive,true);
assert.equal(v.unresolved.directOppositionDoesNotProveNegativeLifeOutcome,true);
assert.equal(v.unresolved.chainDoesNotProveBeneficialLifeOutcome,true);
assert.equal(v.unresolved.dayMasterStrengthNotCalculated,true);
assert.equal(v.verified.hourMonthElementDirectionIsNonAdjacent,true);
assert.equal(v.verified.interveningVisiblePositionBetweenMonthAndHour,'day');
assert.equal(v.verified.dayHourCombinationCandidate.combination,'丁壬');
assert.deepEqual(v.verified.dayHourCombinationCandidate.sourceRefs,
 ['natal.day.stem','natal.hour.stem']);
assert.equal(v.verified.dayHourCombinationCandidate.adjacent,true);
assert.equal(v.verified.dayHourCombinationCandidate.transformedToElement,'not-assessed');
assert.equal(v.unresolved.dayHourCombinationDoesNotRemoveEitherStem,true);
assert.equal(v.unresolved.pairingDoesNotProveTransformationOrPriority,true);
assert.equal(v.unresolved.traditionalMethodPriority,'not-established');
assert.equal(v.unresolved.overallPatternSelected,false);
assert.equal(v.verified.changedHourLosesExposedWealthCandidate,true);
assert.equal(v.authorizesPersonalTrait,false);
assert.equal(v.authorizesCareerOrFinanceForecast,false);
assert.equal(v.authorizesPaidWriter,false);
assert.equal(v.paidQualityValidated,false);
assert.equal(v.providerCalls,0);
assert.equal(v.releaseVerdict,'not-approved');
assert.equal(audit.inspect(facts.build({...core,birthTime:'20:20'},2027)),null);
assert.equal(audit.inspect(facts.build({...core,birthDate:'1994-07-16'},2027)),null);
assert.equal(audit.inspect(facts.build({...core,mbti:'ENTP'},2027)),null);
assert.equal(audit.inspect(facts.build(core,2028)),null);
const bad=structuredClone(packet);
bad.facts.stemConnections.exposure=[];
assert.throws(()=>audit.inspect(bad),/CALCULATION_DIVERGED/);
const tampered=structuredClone(packet);
tampered.facts.tenGods.hour.stemTenGod='편재';
assert.throws(()=>audit.inspect(tampered),/QA_ADULT_DIRECTION_ROLE_SOURCE_MISMATCH/);
console.log('QA_ADULT_CLASSICAL_DIRECTION_REVIEW='+JSON.stringify({
 hourMonthOpposition:'wealth-controls-resource',
 yearSupportsHour:true,dayControlsHour:true,
 hiddenMonthMainCanBeMathematicalIntermediary:true,
 provenMediation:false,finalPriorityChosen:false,paidApiCalls:0
}));
console.log('PASS exact chart competing elemental directions and unrealized intermediary; no personal claims');