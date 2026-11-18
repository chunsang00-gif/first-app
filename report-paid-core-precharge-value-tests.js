'use strict';
// All tests use local deterministic calculations and the REAL normal paid
// first-chapter writer schema, never a provider/merchant network request.
const assert=require('node:assert/strict');
const gate=require('./report-paid-core-precharge-value');
const offer=require('./report-checkout-offer');
const base={calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,
 birthTime:'14:20',gender:'male',mbti:'ISFP'};
const choice='기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.';
const noChoice=gate.inspect(base);
assert.equal(noChoice.eligible,false);
assert.equal(noChoice.reason,'no-guaranteed-independent-first-chapter-paragraph');
assert.throws(()=>offer.build(base),/ADAPTIVE_OFFER_FIRST_CHAPTER_NOT_READY/);
const good=gate.inspect({...base,readerDecision:choice});
assert.equal(good.eligible,true);
assert.equal(good.reason,'verified-hour-addition-awaits-human-review');
assert.equal(good.existingModelCalls,0);
assert.equal(good.additionalModelCalls,0);
assert.equal(good.modelQualityValidated,false);
assert.equal(good.customerSaleApproved,false);
const eligible=offer.build({...base,readerDecision:choice});
assert.equal(eligible.productMode,'adaptive-v1');
assert.equal(eligible.actualProseNotYetGenerated,true);
assert.equal(eligible.fixed12ChaptersPromised,false);
assert(!JSON.stringify(eligible).includes(choice),
 'raw buyer question must not leak into payment order');
// An unrelated buyer question cannot claim the birth-hour learning symbol.
const unrelated={...base,readerDecision:'집을 살지 전세로 살지 고민 중입니다.'};
const unqualifiedConcern=gate.inspect(unrelated);
assert.equal(unqualifiedConcern.eligible,false);
assert.throws(()=>offer.build(unrelated),
 /ADAPTIVE_OFFER_FIRST_CHAPTER_NOT_READY/);
const noTime=gate.inspect({...base,birthTime:'',unknownBirthTime:true,readerDecision:choice});
assert.equal(noTime.eligible,false);
console.log('PASS zero-cost checkout gate blocks month-only paid first chapters and preserves source-qualified current-choice first chapter');
