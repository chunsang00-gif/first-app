'use strict';
const assert=require('node:assert/strict');
const readiness=require('./report-core-paid-one-shot-readiness');
const inspect=require('./report-core-paid-natal-depth-response-gate');
(async()=>{
let attemptedNetwork=0;
const prev=global.fetch;
global.fetch=()=>{attemptedNetwork++;throw Error('FREE_QA_MUST_NOT_CALL_NETWORK');};
let a,b;
try{a=await readiness.build();b=await readiness.build();}
finally{global.fetch=prev;}
assert.deepEqual(a,b,'same frozen facts must produce the identical provider hashes');
assert.equal(attemptedNetwork,0,'do not reach real or mocked paid transport');
assert.equal(a.sample,readiness.SAMPLE_ID);
assert.equal(a.actualServerRulesVerified,true);
assert.equal(a.derivedFromRealServerBatch,true);
assert.deepEqual(a.capturedServerBatchSections,['saju_core','mbti_contradiction']);
assert.equal(a.kind,'one-shot-paid-qa-readiness-offline');
assert.equal(a.runStatus,'dry-run-ready');
assert.equal(a.approvalToSpendTokens,false);
assert.equal(a.releaseVerdict,'not-approved');
assert.equal(a.providerCalls,0);
assert.equal(a.isLiveCustomerRequest,false);
assert.equal(a.apiResponseQuality,'not-tested');
assert.equal(a.modelSelection,'not-authorized');
assert.equal(a.qaTopic,'natal_depth');
assert.equal(a.reviewKind,'machine-composed-review');
assert.deepEqual(a.requestedSections,['saju_core']);
assert(a.sourceCount>=5&&a.sourceCount===a.sourceRefs.length);
assert(['natal.year.stem','natal.month.stem','natal.day.stem',
 'natal.hour.stem','facts.stemConnections'].every(x=>a.sourceRefs.includes(x)));
assert(!a.sourceRefs.some(x=>x.startsWith('annual.')||x.startsWith('person.')));
assert(/^.{5,}$/.test(a.verifiedNatalSummary));
assert.equal(a.maxOutputTokenSettingIfGPT41,18000);
assert.equal(a.lockedYearTenGod,'정재');
assert.equal(a.lockedHourTenGod,'식신');
for(const h of ['inputHash','providerTaskHash','strictResponseSchemaHash','fullInstructionHash'])
 assert.match(a[h],/^[0-9a-f]{64}$/);
assert.equal(a.checklist.length,8);
assert.equal(a.nextGate,
 'explicit-approval-for-one-billable-model-call-then-human-review');
assert.equal(inspect.assert===undefined,false);
console.log('QA_ONE_SHOT_READINESS='+JSON.stringify(a));
console.log('PASS real server rules preserved in QA one-shot readiness, fixed response schema fingerprint, zero provider requests');
})().catch(e=>{console.error(e);process.exitCode=1;});
