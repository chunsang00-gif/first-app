'use strict';
// NO AI call; a human-authored bounded benchmark can prove the free
// month content is not the paid centerpiece, but CANNOT prove willingness
// to pay or expert-approved divination.
const assert=require('node:assert/strict');
const candidate=require('./qa-paid-core-1982-offline-editorial-candidate');
const {prepare}=candidate;
const x=prepare(),q=x.quality;
assert.equal(x.kind,'offline-human-written-first-chapter-editorial-benchmark-v1');
assert.deepEqual(q.sourceProof,['natal.hour.stem','natal.hour.hidden.丁']);
assert.equal(q.checkedHourRole,'식신');
assert.equal(q.actualModelManuscript,false);
assert.equal(q.independentlyReviewedByTraditionalExpert,false);
assert.equal(q.customerSaleApproved,false);
assert.equal(q.additionalProviderCalls,0);
assert.equal(q.readyToDeploy,false);
assert.deepEqual(q.hourReaderProblems,[]);
assert.deepEqual(q.twoDifferentOptionProblems,[]);
assert.deepEqual(q.copiedFreeMeaningProblems,[]);
assert(q.rawCustomerCharacterCount>q.priorRealModelFirstChapterCharacterCount,
 'the benchmark must illustrate a structurally deeper single paid passage');
for(const t of ['기존 일을 유지할 경우','기존 결과물의 합격 기준',
 '새로운 기술을 배울 경우','작은 연습 결과물 하나',
 '어느 기간 동안 연습','결과와 개선 기준',
 '선택을 점검할 수 있도록 제시한 일반적인 질문']){
 assert(x.paidText.includes(t),'missing actual check for '+t);
}
assert(!x.freeMonthCard.includes('태어난 시간의 숨은 글자'),
 'editorial benchmark must add a proven hour fact not already in free month card');
assert(x.paidText.includes('어느 쪽에 돈이나 시간을 쓰는 것이 유리한지는')||
 x.paidText.includes('어느 쪽에 돈이나 시간을 쓰는 것이 유리한지는'),
 'the bounded hour symbol cannot justify choosing a career path');
assert(x.freeMonthCard.length>100);
assert(x.yearHourFreeCard.length>80);
console.log('PASS editorial paid first chapter offline candidate: actual chart-bound hour source, TWO distinct check criteria, free cards contrasted, customer sale remains HOLD, provider calls 0');
