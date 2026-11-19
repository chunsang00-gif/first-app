'use strict';
const assert=require('node:assert/strict');
const audit=require('./qa-first-chapter-value-audit');
const sample=require('./qa-first-chapter-reader-editorial-prototype');
const source=require('./report-facts-node');
const free=require('./report-reading-sample');
const before=global.fetch;
let calls=0;
global.fetch=async()=>{calls++;throw Error('VALUE_AUDIT_NETWORK_FORBIDDEN')};
try{
 const v=audit.build(),text=audit.markdown(v);
 assert.equal(v.kind,'offline-public-first-chapter-value-gap-v1');
 assert.equal(v.comparison,'actual-calculated-free-preview-vs-manually-written-public-benchmark');
 assert(v.checks.sameVerifiedChart&&v.checks.paidAddsSeparatelyCitedHourHiddenSource);
 assert.equal(v.checks.actuallyDeliveredProviderProseCompared,false);
 assert.equal(v.checks.substantiveReaderValueIndependentlyConfirmed,false);
 assert.equal(v.actualPaidManuscriptReviewed,false);
 assert.equal(v.saleApproved,false);
 assert.equal(v.providerCalls,0);
 assert.equal(v.merchantCalls,0);
 assert(v.paidParagraphs.some(x=>x.text.includes('출하 전 품질 검수 및 준비')));
 assert(v.paidParagraphs.some(x=>x.text.includes('지게차 실습과 자격 취득')));
 const packet=source.build(sample.input,2027);
 const original=free.build(packet);
 assert.deepEqual(v.freeCards,original.cards.filter(x=>
  ['birth-month','month-visible-link','year-hour'].includes(x.id)),
  'free text must be the current live deterministic free sample, not a hand-typed substitute');
 assert(text.includes('실제 무료 계산 예시')&&text.includes('사람이 작성한 공개 유료 원고 예시'));
 assert(text.includes('실제 상품 가격을 받을 가치가 입증됐다고 볼 수 없다'));
 assert(!text.includes('판매 승인됨')&&!text.includes('customerSaleApproved:true'));
 assert.equal(calls,0);
 console.log('PASS public first-chapter same-chart free-vs-manual-paid comparison; human review still pending; zero paid calls');
}finally{global.fetch=before}
