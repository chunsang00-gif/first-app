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
assert.equal(offer.build(base).actualProseNotYetGenerated,true,
 'building a free scope or unsigned merchant fingerprint cannot reserve money');
const good=gate.inspect({...base,readerDecision:choice});
assert.equal(good.eligible,false);
assert.equal(good.reason,'hour-role-already-in-other-natal-pillar-unreviewed-positional-meaning');
assert.equal(good.existingModelCalls,0);
assert.equal(good.additionalModelCalls,0);
assert.equal(good.modelQualityValidated,false);
assert.equal(good.customerSaleApproved,false);
for(const question of [
 '기존 일을 유지할지, 새로운 기술을 배울지 고민 중입니다.',
 '기존 일을 유지할지, 아니면 새로운 기술을 배울지 고민 중입니다.'
]){
 const withPunctuation=gate.inspect({...base,readerDecision:question});
 assert.equal(withPunctuation.eligible,false,
  'comma/아니면 must not bypass the full natal repetition blocker');
 assert.equal(withPunctuation.customerSaleApproved,false);
 assert.equal(withPunctuation.additionalModelCalls,0);
}
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
assert.equal(offer.build(unrelated).actualProseNotYetGenerated,true,
 'unqualified coverage preview is still inspectable without charge');
const context={currentWork:'출하 전 품질 검수',targetSkill:'지게차 실습'};
const withContext=gate.inspect({...base,readerDecision:choice,decisionContext:context});
assert.equal(withContext.eligible,false);
const unparseable={...base,readerDecision:'새로운 기술을 배우고 싶습니다.',
 decisionContext:context};
const unparseableResult=gate.inspect(unparseable);
assert.equal(unparseableResult.eligible,false,
 'an unparseable paid two-option buyer context must never reach checkout');
assert.equal(unparseableResult.reason,'buyer-context-unusable-for-two-option-paid-explanation');
const sameLabels=gate.inspect({...base,readerDecision:choice,
 decisionContext:{currentWork:'물류 품질 검수',targetSkill:'물류 품질 검수'}});
assert.equal(sameLabels.eligible,false,
 'identical work and skill cannot be sold as an independently compared pair');
assert.equal(sameLabels.additionalModelCalls,0);
const noTime=gate.inspect({...base,birthTime:'',unknownBirthTime:true,readerDecision:choice});
assert.equal(noTime.eligible,false);
console.log('PASS zero-cost precharge rejects repeated hour roles across the natal chart');
