'use strict';
const assert=require('node:assert/strict');
const comparison=require('./report-core-paid-adult-two-hour-contrast');
const facts=require('./report-facts-node');
const branch=require('./report-branch-relations');
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
assert.equal(output.changed.changedHourCategory,'상관');
assert.equal(output.changed.sameMonthAndHourSymbolBefore,true);
assert.equal(output.changed.sameMonthAndHourSymbolAfter,false);
assert(output.changed.hourRootsBefore.includes('乙'));
assert.deepEqual(output.changed.hourRootsAfter,[]);
assert.deepEqual(output.changed.monthDayTableBefore,output.changed.monthDayTableAfter);
assert(output.changed.monthHourTableBefore.includes('충'));
assert(!output.changed.monthHourTableAfter.includes('충'));
assert(output.changed.monthHourTableAfter.includes('형'));
assert(output.changed.calculatedSourceDiff.some(x=>x.key==='hour-stem-and-role'));
assert(output.changed.calculatedSourceDiff.some(x=>x.key==='hour-branch'));
assert(!output.changed.calculatedSourceDiff.some(x=>x.key==='month-stem-and-role'));
const after=output.editorialAlternative.after;
assert(after.text.includes('달과 시간이 같은 뜻으로 반복되는 구성이 아니라'));
assert(after.text.includes('새로운 표현이나 결과물로 밖에 내놓는 뜻'));
assert(after.text.includes('달과 시간에는 같은 관계가 없습니다'));
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
assert.deepEqual(output.changed.monthHourTableAfter,
 actual.pairs.filter(x=>x.positions.includes('month')&&
 x.positions.includes('hour')).map(x=>x.type).sort());
console.log('QA_TWO_HOUR_REAL_EDITORIAL_CONTRAST='+JSON.stringify({
 beforeHour:output.charts.before.hour,afterHour:output.charts.after.hour,
 symbolChangedFrom:output.changed.priorHourCategory,
 symbolChangedTo:output.changed.changedHourCategory,
 monthDayRelationUnchanged:true,
 monthHourRelationChanged:true,
 freeReadingTextIdentical:true,
 twoDistinctEditorialManuscripts:true,
 realPersonalInferenceVerified:false,paidCalls:0,customerReady:false
}));
