'use strict';
// Work60: Historical source-qualified Luna price quote was tied to a
// repeated 1982 HOUR 丁 and is no longer an eligible first chapter.
// Never quote it as a future customer order. All operations here are
// strictly offline, with no merchant or model provider call.
const assert=require('node:assert/strict');
const cost=require('./report-adaptive-v1-offline-cost-plan');
const precharge=require('./report-paid-core-precharge-value');
const facts=require('./report-facts-node');
const audit=require('./report-paid-core-hour-cross-pillar-audit');
let calls=0;
const saved=global.fetch;
global.fetch=()=>{calls++;throw Error('RETIRED_LUNA_COST_MUST_NOT_FETCH')};
(async()=>{
 try{
  const sample=cost.qualifiedSample;
  const p=facts.build(sample,2027);
  assert.equal(p.status,'ready');
  const role=audit.inspect(p);
  assert.equal(role.wholeNatalCategoryIsNew,false);
  assert.deepEqual(role.sameExactStemOtherNatalPositions.map(x=>x.sourceId),[
   'natal.year.hidden.丁','natal.day.hidden.丁'
  ]);
  const paid=precharge.inspect(sample);
  assert.equal(paid.eligible,false);
  assert.equal(paid.reason,
   'hour-role-already-in-other-natal-pillar-unreviewed-positional-meaning');
  assert.equal(paid.additionalModelCalls,0);
  assert.equal(paid.customerSaleApproved,false);
  for(const model of ['gpt-6-luna','gpt-4.1'])
   await assert.rejects(()=>cost.inspect({
    model,scenario:'source-qualified-skill-choice'
   }),/ADAPTIVE_COST_SCENARIO_NOT_ELIGIBLE_FOR_FIRST_CHAPTER/,
   'no projected price may imply that this repeated source is sellable');
  const neutral=await cost.inspect({model:'gpt-6-luna'});
  assert.equal(neutral.firstChapterPrechargeQualified,false);
  assert.equal(neutral.salesApproved,false);
  assert.equal(neutral.providerCalls,0);
  assert.equal(neutral.nextPaidProviderCallAuthorized,false);
  assert.equal(neutral.guaranteedBillingCapUSD,null);
  assert.equal(calls,0);
  console.log('PASS WORK60 REVOKED LUNA PRICE OFFER: 1982 year/day duplicate, no qualified quote, no provider calls, no sales approval');
 }finally{global.fetch=saved}
})().catch(e=>{console.error('WORK60_LUNA_COST_REVOKED:'+e.stack);process.exitCode=1});
