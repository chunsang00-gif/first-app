'use strict';
// This historic "next Terra first chapter" candidate was created before
// Work50 proved hidden 丁 repeats in YEAR and DAY. The REAL precharge now
// blocks it; no frozen request/cost packet can be rebuilt or billed.
const assert=require('node:assert/strict');
const next=require('./qa-next-first-chapter-offline-preflight');
const spent=require('./qa-terra-first-chapter-one-shot');
const checkout=require('./report-paid-core-precharge-value');
const facts=require('./report-facts-node');
const audit=require('./report-paid-core-hour-cross-pillar-audit');
let network=0;
const old=global.fetch;
global.fetch=()=>{network++;throw Error('OLD_TERRA_QA_MUST_NOT_FETCH')};
(async()=>{
 try{
  const candidate=checkout.inspect(next.SAMPLE);
  assert.equal(candidate.eligible,false);
  assert.equal(candidate.reason,
   'hour-role-already-in-other-natal-pillar-unreviewed-positional-meaning');
  assert.equal(candidate.customerSaleApproved,false);
  assert.equal(candidate.additionalModelCalls,0);
  assert.equal(candidate.wholeNatalHourRoleNotRepeated,false);
  assert.equal(checkout.inspect({...next.SAMPLE,readerDecision:undefined}).eligible,false);
  const chart=facts.build(next.SAMPLE,2027);
  assert.equal(chart.status,'ready');
  const inspected=audit.inspect(chart);
  assert.equal(inspected.wholeNatalCategoryIsNew,false);
  assert.deepEqual(inspected.sameExactStemOtherNatalPositions.map(x=>x.sourceId),[
   'natal.year.hidden.丁','natal.day.hidden.丁'
  ]);
  await assert.rejects(()=>next.inspect(),
   /NEXT_QA_NO_NEW_INDEPENDENT_EDITORIAL_SOURCE/,
   'the original 1982 repeated-symbol request must now be refused BEFORE model envelope or pricing');
  assert.match(spent.FROZEN_REQUEST_SHA256,/^[0-9a-f]{64}$/);
  assert.equal(network,0);
  console.log('PASS OLD TERRA FIRST-CHAPTER OFFLINE PREFLIGHT REVOKED: exact 丁 already in year/day, no model request, no merchant order, no prior paid consent reused');
 }finally{global.fetch=old}
})().catch(e=>{console.error(e);process.exitCode=1});
