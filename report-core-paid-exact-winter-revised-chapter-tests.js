'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const winter=require('./report-core-paid-adult-exact-winter-context-reader');
const old=require('./report-core-paid-one-adult-complete-first-chapter');
const revised=require('./report-core-paid-exact-winter-revised-chapter');
const month=require('./report-core-knowledge-engine');
const input={calendar:'lunar',birthDate:'1982-11-24',birthTime:'14:20',
 leapMonth:false,gender:'male',mbti:'ISFP'};
const packet=facts.build(input,2027),w=winter.build(packet),prior=old.build(packet);
assert(w&&prior);
const draft=revised.build(packet,w,prior);
assert(draft);
assert.equal(draft.paragraphs.length,3);
assert(draft.text.length>=550&&draft.text.length<=1100);
assert.equal(draft.approvedForCustomer,false);
assert.equal(draft.paidWriterAuthorized,false);
assert.equal(draft.provenIncrementalCustomerBenefit,false);
assert.equal(draft.professionalMethodApproved,false);
assert.equal(draft.providerCalls,0);
assert.equal(draft.releaseVerdict,'not-approved');
assert.equal(draft.paragraphs[0].sourceUrl,w.sourceScope.exactDayHour.url);
assert.equal(draft.paragraphs[1].sourceUrl,w.sourceScope.seasonalMonth.url);
assert(draft.paragraphs[0].text.includes('특정 날과 시간까지 일치'));
assert(draft.paragraphs[0].text.includes(
 '겨울의 해당 날·시간 조합을 안정된 쪽으로 풀이한 조건에 들어갑니다'));
assert(draft.paragraphs[0].text.includes(
 '고전의 제한된 전통적 평가일 뿐'));
assert(!draft.text.includes('당신은 안정적인 사람입니다'));
assert(!draft.text.includes('앞으로 평온한 삶을 살게 됩니다'));
assert(draft.paragraphs[1].text.includes('서로 질문 자체가 다른'));
assert(draft.paragraphs[2].text.includes('오후 8시 20분'));
assert(!draft.text.includes('동료에게'));
assert(!draft.text.includes('기존 작업 절차'));
assert.notEqual(draft.text,prior.text);
const baseline=month.compile(packet).reader.paragraphs.strength.text;
assert(baseline.length>100);
assert(!baseline.includes('특정 날과 시간까지 일치'));
assert(!baseline.includes('오후 8시 20분'));
assert(!baseline.includes('서로 질문 자체가 다른'));
assert.equal(draft.comparedAgainstLiveFreeProduct,false);
assert.equal(draft.removedPriorThreeRepeatedMonthThemes,true);
assert.equal(revised.build(facts.build({...input,birthTime:'20:20'},2027),
 null,null),null);
const forged=structuredClone(w);
forged.sourceScope.exactDayHour.sourceUnit='generic-winter-rule';
assert.throws(()=>revised.build(packet,forged,prior),
 /QA_REVISED_CLASSICAL_CHAPTER_SOURCE_SCOPE_INVALID/);
const moved=structuredClone(packet);
moved.chart.hour='丙戌';
assert.throws(()=>revised.build(moved,w,prior),
 /QA_REVISED_CLASSICAL_CHAPTER_SOURCE_SCOPE_INVALID/);
console.log('QA_REVISED_SOURCE_SPECIFIC_CHAPTER='+JSON.stringify({
 originalLength:prior.text.length,revisedLength:draft.text.length,
 baselineLength:baseline.length,paragraphs:draft.paragraphs.length,
 exactHistoricalQuestionCited:true,counterfactualDifferent:true,
 approvedForCustomer:false,paidApiCalls:0
}));
console.log('PASS QA revised actual adult manuscript has a different source-specific proposition, never claims paid-ready');