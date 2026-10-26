'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const alt=require('./report-core-paid-alternative-hour-revised-chapter');
const old=require('./report-core-paid-exact-winter-revised-chapter');
const winter=require('./report-core-paid-adult-exact-winter-context-reader');
const complete=require('./report-core-paid-one-adult-complete-first-chapter');
const input={calendar:'lunar',birthDate:'1982-11-24',
 birthTime:'20:20',leapMonth:false,gender:'male',mbti:'ISFP'};
const after=facts.build(input,2027),before=facts.build({...input,birthTime:'14:20'},2027);
const a=alt.build(after),b=old.build(before,winter.build(before),complete.build(before));
assert(a&&b);
assert.equal(a.paragraphs.length,3);
assert.equal(a.monthClassicalMethodApplication.source.originalRule,'一透則一用');
assert.equal(a.monthClassicalMethodApplication.verified.candidateExposedAt.length,1);
assert.equal(a.monthClassicalMethodApplication.overallPatternSelected,false);
assert(a.paragraphs[2].text.includes('서로 다른 후보는 하나이며'));

assert(a.text.length>600);
assert.notEqual(a.text,b.text);
assert.equal(a.paragraphs[0].sourceUrl,b.paragraphs[0].sourceUrl);
assert.notEqual(a.paragraphs[0].text,b.paragraphs[0].text);
assert.equal(a.paragraphs[2].sourceUrl,b.paragraphs[1].sourceUrl);
assert(a.text.includes('오후 8시 20분'));
assert(a.text.includes('오후 2시 20분'));
assert(a.paragraphs[2].text.includes('달의 해석 후보가 유지되더라도'));
assert(a.paragraphs[2].text.includes('달과 날의 관계표는 그대로지만'));
assert(a.paragraphs[2].text.includes('마주 보는 관계는 사라집니다'));
assert(a.paragraphs[2].sourceRefs.includes('facts.natalBranchRelations'));
assert(a.paragraphs[2].sourceRefs.includes('facts.stemConnections'));
assert(a.text.includes('해의 아랫글자는 그 목록에 들어가지만'));
assert(a.paragraphs[0].text.includes(
 '강한 기운을 경계하는 문장과 일부 해·달 조건을 좋게 풀이하는 문장'));
assert(a.paragraphs[0].text.includes('두 조건을 따로 확인해야 하며'));
assert(!a.text.includes('안정된 쪽으로 풀이한 조건에 들어갑니다'));
assert(!a.text.includes('앞으로 불운이 찾아옵니다'));
assert(a.text.includes('따뜻함을 나타내는 글자가 시간의 겉에 있지만'));
assert.equal(a.paidWriterAuthorized,false);
assert.equal(a.approvedForCustomer,false);
assert.equal(a.provenIncrementalCustomerBenefit,false);
assert.equal(a.providerCalls,0);
assert.equal(a.releaseVerdict,'not-approved');
assert.equal(alt.build(before),null);
const changed=structuredClone(after);
changed.chart.hour='癸未';
assert.equal(alt.build(changed),null);
const month=facts.build({...input,birthDate:'1982-11-23'},2027);
assert.equal(alt.build(month),null);
console.log('QA_OTHER_HOUR_SOURCE_SPECIFIC_CHAPTER='+JSON.stringify({
 beforeChars:b.text.length,afterChars:a.text.length,
 sameHistoricalVolumeDifferentExactSubcase:true,
 yearListedMonthNotListed:true,
 actualPersonalOutcomeApproved:false,paidCalls:0
}));
console.log('PASS exact other-hour manuscript is nonbillable, distinct from the 14:20 source and not for customers');