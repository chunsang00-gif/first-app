'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const reader=require('./report-core-paid-1982-standalone-day-hour-reader');
const gap=require('./report-core-paid-depth-gap-audit');
const policy=require('./report-reader-policy');
const base=reader.BASE;
const early=facts.build({...base,birthTime:'14:20'},2027);
const late=facts.build({...base,birthTime:'20:20'},2027);
const a=reader.build(early),z=reader.build(late),pair=reader.pair();
assert(a&&z);
assert.equal(pair.cases.length,2);
assert.equal(pair.sharedPriorMonthEvidence,true);
assert.equal(pair.differentSourceSubcases,true);
assert.equal(pair.readyForPaidWriter,false);
assert.equal(pair.releaseVerdict,'not-approved');
assert.equal(pair.providerCalls,0);
assert.deepEqual(pair.cases,[a,z]);
assert.equal(a.kind,'qa-independent-day-hour-citation-manuscript-v1');
assert.equal(z.kind,a.kind);
assert.equal(a.source.work,'三命通會');
assert.equal(z.source.work,'三命通會');
assert.equal(a.source.url,z.source.url);
assert.notEqual(a.source.chapter,z.source.chapter);
assert.notEqual(a.source.sourceScope,z.source.sourceScope);
assert.equal(a.positiveHistoricalClauseAllowed,true);
assert.equal(z.positiveHistoricalClauseAllowed,false);
assert.equal(z.yearMonthQualifiersResolved,false);
assert(a.text.includes('안온한 쪽으로 풀이합니다'));
assert(z.text.includes('해에 있는 글자는 그 목록에 있지만'));
assert(z.text.includes('달에 있는 글자는 목록에 없습니다'));
assert(!z.text.includes('안온한 쪽으로 풀이합니다'));
assert(!a.text.includes('해에 있는 글자는 그 목록에 있지만'));
assert.notEqual(a.text,z.text);
for(const [p,row] of [[early,a],[late,z]]){
 const baseline=gap.reportOne(p);
 assert.equal(row.chartFingerprint,[p.chart.year,p.chart.month,p.chart.day,p.chart.hour].join('/'));
 assert.deepEqual(row.baselinePaidReferences,baseline.paidCitableRefs);
 assert.equal(baseline.paidWholeChartGrounded,false);
 assert.equal(baseline.paidReceivesOfflineSynthesis,false);
 assert(row.exactDayHourReferences.includes('natal.day.stem'));
 assert(row.exactDayHourReferences.includes('natal.hour.stem'));
 assert(!row.baselinePaidReferences.includes('natal.day.stem'));
 assert(!row.baselinePaidReferences.includes('natal.hour.stem'));
 assert.equal(row.newIndependentTraditionalQuestion,
  'exact-cited-day-hour-classical-passage-not-month-symbol-glossary');
 assert.equal(row.writtenForStandaloneReader,true);
 assert.equal(row.includedInPaidWriter,false);
 assert.equal(row.humanExpertReviewComplete,false);
 assert.equal(row.personalInsightProven,false);
 assert.equal(row.customerValueValidated,false);
 assert.equal(row.comparedAgainstActualPaidProviderOutput,false);
 assert.equal(row.saleApproved,false);
 assert.equal(row.providerCalls,0);
 assert.equal(row.releaseVerdict,'not-approved');
 assert.deepEqual(policy.errors([row.label,row.text]),[]);
 assert(!/오후 2시|오후 8시|다른 출생시간|가상의|가정해 보|동료|장비|납품/.test(row.text));
 assert(!/\b(?:QA|API|MBTI)\b/.test(row.text));
 assert(!/성격이 좋|부자|승진한다|반드시 성공|운이 좋아집니다/.test(row.text));
 assert(row.text.length>=200);
}
assert.deepEqual(reader.pair(),pair,'the result must be deterministic');
assert.equal(reader.build(facts.build({...base,birthTime:'10:20'},2027)),null);
assert.equal(reader.build(facts.build({...base,birthDate:'1982-11-23',birthTime:'14:20'},2027)),null);
assert.equal(reader.build(facts.build({calendar:'solar',birthDate:'1982-11-24',
 birthTime:'14:20',gender:'male',mbti:'ISFP'},2027)),null);
const invalid=structuredClone(early);
invalid.facts.seasonalEvidence.monthBranch='申';
assert.throws(()=>reader.build(invalid),/QA_1982_STANDALONE_WRITER_BAD_SEASON|QA_|DIVERGED/);
const changedHour=structuredClone(late);
changedHour.chart.hour='癸未';
assert.equal(reader.build(changedHour),null,
 'wrong hour fingerprint cannot inherit a favorable classical citation');
const sameMonth=a.baselinePaidReferences.join('|')===z.baselinePaidReferences.join('|');
assert(sameMonth,'source-based differences must be independent of unchanged real paid month evidence');
console.log('QA_1982_STANDALONE_EXACT_SOURCE='+JSON.stringify({
 cases:pair.cases.map(x=>({chart:x.chartFingerprint,
  historicalScope:x.source.sourceScope,
  sourceBackedIndependentQuestion:true,customerApproved:false,
  chars:x.text.length})),
 paidMonthRefsUnchanged:sameMonth,strictlyDifferentSourceClaims:true,
 paidCalls:0,releaseVerdict:'not-approved'
}));
console.log('PASS two independent actual-reader first-chapter drafts for different classical day-hour sources, not fixed-life scenes or paid approval');
