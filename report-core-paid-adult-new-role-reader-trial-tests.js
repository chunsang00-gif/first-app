'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const manuscript=require('./report-core-paid-adult-new-role-reader-trial');
const delta=require('./report-core-paid-general-month-value-delta');
const policy=require('./report-reader-policy');
const base={calendar:'solar',birthDate:'1994-07-15',
 birthTime:'14:20',gender:'male',mbti:'ISFP'};
const packet=facts.build(base,2027);
const result=manuscript.build(packet);
assert(result);
assert.equal(result.paragraphs.length,3);
assert(result.text.length>=600&&result.text.length<=1200);
assert.equal(result.paragraphs.map(x=>x.text).join('\n\n'),result.text);
assert(result.paragraphs[0].text.includes('규칙을 따지는 질문과 실제로 계속 감당할 자원을'));
assert(result.paragraphs[1].text.includes('승인 절차만 따지고 실제 유지 비용을'));
assert(result.paragraphs[1].text.includes('반대로 비용만 계산하고'));
assert(result.paragraphs[2].text.includes('오후 8시 20분'));
assert(result.paragraphs[2].text.includes('그대로 복사하면 안 됩니다'));
assert(result.sourceRefs.includes('natal.month.hidden.丁'));
assert(result.sourceRefs.includes('natal.hour.stem'));
assert.deepEqual(result.comparison.baselineRefs,
 ['natal.month.stem','natal.month.hidden.己']);
assert.equal(result.comparison.newVisiblePosition,'natal.hour.stem');
assert.equal(result.comparison.newSourceContentVerified,true);
assert.equal(result.comparison.newPersonalJudgmentVerified,false);
assert.equal(result.readerValueVerdict,
 'more-specific-questions-not-proven-paid-insight');
assert.equal(result.personalTraitObserved,false);
assert.equal(result.eligibleForPaidWriter,false);
assert.equal(result.approvedForCustomer,false);
assert.equal(result.providerCalls,0);
assert.equal(result.releaseVerdict,'not-approved');
assert.deepEqual(policy.errors([result.label,result.text]),[]);
const monthOnly=delta.inspect(packet);
assert.equal(monthOnly.valueClass,'new-symbol-category-and-independent-position');
assert.equal(monthOnly.paidValueApproved,false);
const differentHour=facts.build({...base,birthTime:'20:20'},2027);
assert.equal(manuscript.build(differentHour),null);
assert.equal(manuscript.build(facts.build({...base,birthDate:'1994-07-16'},2027)),null);
assert.equal(manuscript.build(facts.build({...base,mbti:'ENTP'},2027)),null);
assert.equal(manuscript.build(facts.build(base,2028)),null);
const changed=structuredClone(packet);
changed.facts.stemConnections.exposure=[];
assert.throws(()=>manuscript.build(changed),/CALCULATION_DIVERGED/);
console.log('QA_ADULT_NEW_ROLE_READER_TRIAL='+JSON.stringify({
 chart:result.chartFingerprint,chars:result.text.length,
 paragraphCount:result.paragraphs.length,
 independentVisibleHourRole:true,comparedAgainstRealFree:false,
 readerQuestionIsMoreSpecific:true,personalInsightValidated:false,
 paidReady:false,paidCalls:0
}));
console.log('PASS one newly evidenced adult candidate reaches a bounded, concrete first-chapter trial, without paid approval');