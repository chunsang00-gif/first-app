'use strict';
const assert=require('node:assert/strict');
const gate=require('./qa4-model-lifecycle-gate');
const qa4=require('./run-paid-core-v2-qa4-claimlinked');
const old=require('./qa-core-v2-qa3-dispatch-guard');
const before=gate.status('gpt-4.1',new Date('2026-10-28T10:36:00Z'));
assert.equal(before.deprecatedSince,'2026-10-14');
assert.equal(before.announcedShutdownDate,'2027-01-14');
assert.equal(before.eligibleForRequestTimeGate,true);
assert.equal(before.modelAccessVerified,false);
assert.equal(before.publicDocumentationReportsStructuredOutputs,true);
assert.equal(before.recommendedMigrationModel,'gpt-6-luna');
assert.equal(before.maxOutputTokens,32768);
assert.equal(before.contextTokens,1047576);
assert.equal(before.newRequestAuthorizationNeeded,true);
assert.equal(gate.assertBeforeShutdown('gpt-4.1',
 new Date('2027-01-13T23:59:59.999Z')).eligibleForRequestTimeGate,true);
assert.equal(gate.status('gpt-4.1',
 new Date('2027-01-14T00:00:00Z')).eligibleForRequestTimeGate,false);
assert.throws(()=>gate.assertBeforeShutdown('gpt-4.1',
 new Date('2027-01-14T00:00:00Z')),
 /QA4_GPT41_SHUTDOWN_DATE_REACHED_REQUIRE_NEW_MODEL_AND_HASH/);
assert.throws(()=>gate.assertBeforeShutdown('gpt-4.1',
 new Date('2027-02-01T00:00:00Z')),
 /QA4_GPT41_SHUTDOWN_DATE_REACHED_REQUIRE_NEW_MODEL_AND_HASH/);
assert.throws(()=>gate.status('gpt-6-luna',
 new Date('2026-10-28T00:00:00Z')),
 /QA4_UNREVIEWED_MODEL_REQUIRES_NEW_HASH/);
assert.throws(()=>gate.status('gpt-4.1',
 new Date('bogus')),
 /QA4_INVALID_CLOCK/);
assert.equal(qa4.MODEL,gate.MODEL);
assert.notEqual(qa4.REQUEST_HASH,old.REQUEST_HASH);
console.log('QA4_GPT41_DEPRECATION_STOP_GATE='+JSON.stringify({
 officialDeprecationDate:gate.ANNOUNCED,
 officialShutdownDate:gate.SHUTDOWN,
 model:'gpt-4.1',newModelWouldChangeRequestHash:true,
 noSilentMigration:true,retirementDateStopsNewAttempt:true,
 structuredOutputsSupportedByPublishedModelPage:true,
 publishedContextLimit:gate.CONTEXT_TOKENS,
 publishedOutputLimit:gate.MAX_OUTPUT_TOKENS,
 customerModelAccessActuallyVerified:false,
 networkRequests:0,providerCalls:0,
 customerRelease:false
}));
