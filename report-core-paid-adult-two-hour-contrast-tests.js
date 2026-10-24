'use strict';
const assert=require('node:assert/strict');
const comparison=require('./report-core-paid-adult-two-hour-contrast');
const facts=require('./report-facts-node');
const branch=require('./report-branch-relations');
const earthCommentary=require('./report-core-paid-natal-three-punishment-commentary');
const output=comparison.build();
assert.deepEqual(output,comparison.build(),'offline result must be deterministic');
assert.deepEqual(output.charts.before,{year:'壬戌',month:'癸丑',
 day:'乙未',hour:'癸未'});
assert.deepEqual(output.charts.after,{year:'壬戌',month:'癸丑',
 day:'乙未',hour:'丙戌'});
assert.equal(output.unchangedFreeMonthCore.actualTextEqual,true);
assert.deepEqual(output.unchangedFreeMonthCore.sourceRefs,
 ['natal.month.stem','natal.month.hidden.己']);
assert.equal(output.changed.priorHourCategory,'편인');
const scope=output.changed.sourceMethodScope;
assert.equal(scope.bothRejectForeignWorkedExample,true);
assert.equal(scope.neitherHasCompletedMonthGroup,true);
assert.equal(scope.changedBirthHourDoesNotApproveMethod,true);
assert.equal(scope.before.allowedInPaidWriter,false);
assert.equal(scope.after.allowedInPaidWriter,false);
assert.deepEqual(scope.before.applicable.generalMonthVisibility
 .alternativeMonthSourceIds,['natal.month.hidden.癸']);
assert.deepEqual(scope.after.applicable.generalMonthVisibility
 .alternativeMonthSourceIds,['natal.month.hidden.癸']);
const arrows=output.changed.observedVisibleStemRelations;
assert.deepEqual(arrows.before.pairCounts,
 {generating:0,restricting:0,sameElement:3});
assert.deepEqual(arrows.after.pairCounts,
 {generating:0,restricting:2,sameElement:1});
assert.equal(arrows.threeSameElementPairsBefore,true);
assert.equal(arrows.twoWaterControlsFireArrowsAfter,true);
assert.equal(arrows.yearAndMonthStillDifferentTraditionalCategories,true);
assert.equal(arrows.cannotConcludeHourIsStrongerOrWeaker,true);
assert.equal(arrows.lifeEffectNotEstablished,true);
assert.equal(arrows.before.changedHourCannotSelectDominantDirection,true);
assert.equal(arrows.after.changedHourCannotSelectDominantDirection,true);
const principle=output.changed.classicalMonthGeneralPrinciple;
assert.equal(principle.underlyingMonthHiddenCandidateSame,true);
assert.deepEqual(principle.beforeExposedAt,
 ['natal.month.stem','natal.hour.stem']);
assert.deepEqual(principle.afterExposedAt,['natal.month.stem']);
assert.equal(principle.category,'편인');
assert.equal(principle.methodPriority,'not-selected');
assert.equal(principle.commercialWriterAllowed,false);
assert.equal(output.changed.changedHourCategory,'상관');
assert.equal(output.changed.sameMonthAndHourSymbolBefore,true);
assert.equal(output.changed.sameMonthAndHourSymbolAfter,false);
assert(output.changed.hourRootsBefore.includes('乙'));
assert.deepEqual(output.changed.hourRootsAfter,[]);
assert.deepEqual(output.changed.monthDayTableBefore,output.changed.monthDayTableAfter);
assert(output.changed.monthHourTableBefore.includes('충'));
assert(!output.changed.monthHourTableAfter.includes('충'));
assert(output.changed.monthHourTableAfter.includes('형'));
const stable=output.changed.unchangedThreeBranchContext;
assert.equal(stable.kind,'qa-cited-three-branch-same-structure-contrast-v1');
assert.deepEqual(stable.unalteredPositions,['year','month','day']);
assert.deepEqual(stable.unalteredBranchCharacters,['戌','丑','未']);
assert.equal(stable.unalteredPairRelations.length,5);
assert.equal(stable.commentarySourceDistinction.originalExplicitlyNamesEarthTriad,false);
assert.equal(stable.commentarySourceDistinction.xuCommentary.commentator,'徐樂吾');
assert.equal(stable.commentarySourceDistinction.xuCommentary.explicitlyListsEarthTriad,true);
assert.equal(stable.commentarySourceDistinction.threeDistinctPositionsAlreadyInBoth,true);
assert.equal(stable.commentarySourceDistinction.traditionalEffectNotReviewed,true);
assert.equal(stable.commentarySourceDistinction.cannotInterpretAsFiveLifeEvents,true);
assert(stable.unalteredPairRelations.some(x=>x.type==='파'&&
 x.positions.includes('year')&&x.positions.includes('day')));
assert.equal(new Set(stable.unalteredPairRelations.map(x=>
 x.positions.join('/'))).size,3,
 'multiple table labels are still just three underlying position contacts');
assert.equal(stable.source.url,'https://m.donglishuzhai.net/chapter/3720.html');
assert.equal(stable.distinctBranchTypesBefore,3);
assert.equal(stable.distinctBranchTypesAfter,3);
assert.equal(stable.newBranchTypeIntroducedByHour,false);
assert.deepEqual(stable.hourDuplicatesPosition,{before:'day',after:'year'});
assert.equal(stable.disputedTraditionalEffect,'not-assessed');
assert.equal(stable.branchTableEffectOnActualLife,'not-established');
assert.equal(stable.methodProfessionallyReviewed,false);
assert.equal(stable.releaseVerdict,'not-approved');
assert(output.editorialAlternative.before.sharedBranchContext.includes('날과 같은 글자'));
assert(output.editorialAlternative.after.sharedBranchContext.includes('해와 같은 글자'));
assert(output.changed.calculatedSourceDiff.some(x=>x.key==='hour-stem-and-role'));
assert(output.changed.calculatedSourceDiff.some(x=>x.key==='hour-branch'));
assert(!output.changed.calculatedSourceDiff.some(x=>x.key==='month-stem-and-role'));
const after=output.editorialAlternative.after;
assert(after.text.includes('달과 시간이 같은 뜻으로 반복되는 구성이 아니라'));
assert(after.text.includes('새로운 표현이나 결과물로 밖에 내놓는 뜻'));
assert(after.text.includes('달과 시간에는 이전과 달리 마주보는 관계가 표시되지 않습니다'));
assert(after.text.includes('태어난 시간을 바꿔도 이 세 글자는 그대로입니다'));
assert(after.text.includes('실제 인계 능력을 평가한 결과는 아닙니다'));
assert.equal(after.paragraphs.length,4);
assert(after.sourceRefs.includes('natal.hour.stem'));
assert(after.sourceRefs.includes('facts.natalBranchRelations'));
assert.notEqual(after.text,output.editorialAlternative.before.text);
assert.equal(after.manuscriptProfessionallyValidated,false);
assert.equal(after.readerPaidValueTested,false);
assert.equal(after.releaseVerdict,'not-approved');
assert.equal(output.interpretation.sourceValidAsSymbolicDifferentiation,true);
assert.equal(output.interpretation.meaningfulPersonalConsequenceDerived,false);
assert.equal(output.interpretation.methodApproved,false);
assert.equal(output.interpretation.contrastStatus,'different-symbolic-reader-focus-only');
assert.equal(output.interpretation.counterfactualReview.status,
 'different-reader-language-method-still-unverified');
assert.equal(output.incrementalPremiumValueEstablished,false);
assert.equal(output.readyForAnotherPaidModelProbe,false);
assert.equal(output.readyForCustomer,false);
assert.equal(output.providerCalls,0);
// The changed month/hour positional table MUST be truly derivable.
const p=facts.build({calendar:'lunar',birthDate:'1982-11-24',
 leapMonth:false,birthTime:'20:20',gender:'male',mbti:'ISFP'},2027);
const actual=branch.natal(p.chart);
const triad=earthCommentary.inspect(p);
assert.equal(triad.chartHasAllThreeEarthBranches,true);
assert.deepEqual(triad.representativePositions,[
 {branch:'丑',position:'month'},
 {branch:'戌',position:'year'},
 {branch:'未',position:'day'}]);
const tampered=structuredClone(p);
tampered.facts.natalBranchRelations.pairs=[];
assert.throws(()=>earthCommentary.inspect(tampered),
 /QA_THREE_PUNISHMENT_BRANCH_LEDGER_DRIFT/);
const elsewhere=facts.build({calendar:'solar',birthDate:'2024-02-17',
 birthTime:'14:20',gender:'male',mbti:'ISFP'},2027);
assert.equal(earthCommentary.inspect(elsewhere).chartHasAllThreeEarthBranches,false);
assert.deepEqual(output.changed.monthHourTableAfter,
 actual.pairs.filter(x=>x.positions.includes('month')&&
 x.positions.includes('hour')).map(x=>x.type).sort());
console.log('QA_TWO_HOUR_REAL_EDITORIAL_CONTRAST='+JSON.stringify({
 beforeHour:output.charts.before.hour,afterHour:output.charts.after.hour,
 symbolChangedFrom:output.changed.priorHourCategory,
 symbolChangedTo:output.changed.changedHourCategory,
 monthDayRelationUnchanged:true,
 threeBranchTypesAlreadyPresentInBoth:true,
 monthHourRelationChanged:true,
 freeReadingTextIdentical:true,
 twoDistinctEditorialManuscripts:true,
 realPersonalInferenceVerified:false,paidCalls:0,customerReady:false
}));
