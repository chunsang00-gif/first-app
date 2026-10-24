'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const preview=require('./report-core-paid-adult-exact-winter-context-reader');
const input={calendar:'lunar',birthDate:'1982-11-24',
 birthTime:'14:20',leapMonth:false,gender:'male',mbti:'ISFP'};
const packet=facts.build(input,2027),x=preview.build(packet);
assert(x);
assert.deepEqual(x,preview.build(packet),'offline output must be deterministic');
assert.deepEqual(x.chart,{year:'壬戌',month:'癸丑',
 day:'乙未',hour:'癸未'});
assert.equal(x.exactWinterPassageVerified,true);
assert.equal(x.sourceScopedQuestionResolved,true);
assert.equal(x.sourceScopeIsNotFullChartMethodApproval,true);
assert.equal(x.monthDayHourContacts,2);
assert.equal(x.doubleContactIsNotTwoPredictedEvents,true);
assert.equal(x.climateSourceDoesNotMatchFavorableCompound,true);
assert.equal(x.appliedMethodsStillUnranked,true);
assert.equal(x.commercialReaderBenefitEstablished,false);
assert.equal(x.extraPaidParagraphApproved,false);
assert.equal(x.actualProviderCalls,0);
assert.equal(x.releaseVerdict,'not-approved');
assert.deepEqual(x.paragraphs.map(p=>p.kind),[
 'historical-eligibility-only','month-and-branch-counterevidence']);
assert(x.paragraphs[0].text.includes('겨울'));
assert(x.paragraphs[1].text.includes('같은 글자 조합'));
assert(x.paragraphs.every(p=>p.text!==x.freeMonthText));
assert(!x.paragraphs.some(p=>/동료|직장에선|가정해 봅/.test(p.text)));
assert.equal(preview.build(facts.build({...input,birthTime:'20:20'},2027)),null);
assert.equal(preview.build(facts.build({...input,mbti:'ISTP'},2027)),null);
assert.equal(preview.build(facts.build(input,2028)),null);
const forged=structuredClone(packet);
forged.facts.natalBranchRelations.pairs=[];
assert.throws(()=>preview.build(forged),/QA_/);
const forgedMonth=structuredClone(packet);
forgedMonth.facts.tenGods.month.stemTenGod='정관';
assert.throws(()=>preview.build(forgedMonth),/QA_/);
console.log('QA_CLASSICAL_WINTER_CONTEXT='+JSON.stringify({
 exactDayHourSourceMatched:1,comparisonToFreeMonthOnly:1,
 seasonalClauseNotACustomerPromise:true,branchPositionContacts:2,
 rejectedMismatchedHour:1,reviewOnlyParagraphs:x.paragraphs.length,
 realLifePredictions:0,paidApiCalls:0,customerReady:false
}));
