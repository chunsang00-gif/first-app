'use strict';
// Work60: The Work47 Luna first-chapter fingerprint was NEVER used for a
// real provider call, and Work50 revoked it after detecting a repeated
// YEAR/DAY/HOUR 丁 category. Do not manufacture a "success" sample from
// the NEW writer envelope and label it the OLD frozen request. All records
// are synthetic; no model, merchant, HTTP, private text or credential.
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const reviewer=require('./qa-luna-private-first-chapter-review');
const cost=require('./report-adaptive-v1-offline-cost-plan');
const capture=require('./report-core-paid-full-prompt-capture');
const precharge=require('./report-paid-core-precharge-value');
const audit=require('./report-paid-core-hour-cross-pillar-audit');
const facts=require('./report-facts-node');
const sha=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const oldFetch=global.fetch;
let calls=0;
global.fetch=()=>{calls++;throw Error('RETIRED_LUNA_TEST_CANNOT_FETCH')};
(async()=>{
 try{
  const input=cost.qualifiedSample;
  const packet=facts.build(input,2027);
  const review=audit.inspect(packet);
  assert.equal(review.wholeNatalCategoryIsNew,false);
  assert.deepEqual(review.sameExactStemOtherNatalPositions.map(x=>x.sourceId),[
   'natal.year.hidden.丁','natal.day.hidden.丁'
  ]);
  const beforeMoney=precharge.inspect(input);
  assert.equal(beforeMoney.eligible,false);
  assert.equal(beforeMoney.reason,
   'hour-role-already-in-other-natal-pillar-unreviewed-positional-meaning');
  const captureResult=await capture.capture(input);
  assert.equal(captureResult.status,'captured-full-paid-composition');
  const NEW_NOT_APPROVED=cost.envelope(captureResult.prompt,'gpt-6-luna');
  assert.notEqual(sha(NEW_NOT_APPROVED),reviewer.FROZEN_REQUEST_SHA256,
   'changed writer cannot reuse a revoked frozen Luna request hash');
  // Never claim a new prompt is the original encrypted archive merely
  // because it has the same model, first chapter or similar inputs.
  const attempt={
   kind:'luna-first-chapter-one-attempt',
   status:'charge-possible-no-retry',
   commit:'0123456789abcdef0123456789abcdef01234567',
   runId:774411,model:'gpt-6-luna',
   requestHash:sha(NEW_NOT_APPROVED),
   providerCallsAllowed:1,releaseVerdict:'not-approved'
  };
  assert.throws(()=>reviewer.build({
   attempt,raw:null,validated:null,summary:null
  }),/LUNA_PRIVATE_FIRST_CHAPTER_REVIEW_DENIED:unverifiable-declared-attempt-identity/);
  const forged={...attempt,requestHash:reviewer.FROZEN_REQUEST_SHA256};
  assert.throws(()=>reviewer.build({
   attempt:forged,
   raw:{kind:'luna-first-chapter-private-provider-response',
    model:'gpt-6-luna',providerCalls:1,
    requestHash:reviewer.FROZEN_REQUEST_SHA256,
    request:NEW_NOT_APPROVED,response:{chapters:{}},
    releaseVerdict:'not-approved'},
   validated:null,
   summary:{kind:'luna-first-chapter-one-call-qa',
    status:'stopped-no-retry',providerCallsAttempted:1,
    originalResponseSaved:true,automatedValidated:false,
    releaseVerdict:'not-approved'}
  }),/LUNA_PRIVATE_FIRST_CHAPTER_REVIEW_DENIED:raw-model-or-original-request-identity/);
  assert.equal(calls,0);
  console.log('PASS RETIRED LUNA PRIVATE REVIEW: old request hash immutable, modified provider envelope rejected, full natal recurrence blocks precharge, no API and no false positive archive');
 }finally{global.fetch=oldFetch}
})().catch(e=>{console.error('LUNA_RETIRED_REVIEW_TEST_FAILED:'+e.message);process.exitCode=1});
