'use strict';
const assert=require('node:assert/strict');
const audit=require('./report-qa3-next-paid-decision-audit');
const historic=require('./qa-core-v2-qa3-dispatch-guard');
(async()=>{
 const keys=['NODE_ENV','RENDER','PAID_CORE_DEPTH_V2',
  'PAID_CORE_V2_CLASSICAL_WRITER','PAID_CORE_V2_CLAIM_LINKS',
  'PAID_CORE_V2_LOCK_REFS','PAID_CORE_V2_CLOSED_CLAIMS'];
 const before=Object.fromEntries(keys.map(x=>[x,process.env[x]]));
 const output=await audit.assess();
 assert.equal(output.historicalRunId,40633333735);
 assert.equal(output.historicalApprovalConsumed,true);
 assert.equal(output.oldQA3WorkflowHardDisabled,true);
 assert.equal(output.historicalProviderStageReached,true);
 assert.equal(output.historicalActualBilledAmount,'unknown');
 assert.equal(output.oldQA3RequestHash,historic.REQUEST_HASH);
 assert.notEqual(output.newClaimLinkedRequestHash,output.oldQA3RequestHash);
 assert.match(output.newClaimLinkedRequestHash,/^[a-f0-9]{64}$/);
 assert.equal(output.hashesDifferent,true);
 assert.equal(output.consentForNewHashObtained,false);
 assert.equal(output.currentTrialDispatchImplemented,true);
 assert.equal(output.newTrialWorkflowHardDisabled,false);
 assert.equal(output.newTrialAwaitingExactManualDispatch,true);
 assert.equal(output.newTrialNeverTriggeredByPush,true);
 assert.equal(output.newTrialOneAttemptRunnerPrepared,true);
 assert.equal(output.legalToReuseOldQA3Approval,false);
 assert.equal(output.remoteStructuredOutputAccepted,'unknown-no-network-call');
 assert.equal(output.localStrictSchemaInspection,'passed');
 assert.equal(output.providerCalls,0);
 assert.equal(output.actualNewPaidGeneration,false);
 assert.equal(output.customerRelease,false);
 assert.equal(output.releaseVerdict,'not-approved');
 assert.equal(output.model,'gpt-4.1');
 assert.equal(output.maxOutputTokens,18000);
 assert(output.budgetUSDAtConservativeCapacityEstimate>0.144);
 assert(output.budgetUSDAtConservativeCapacityEstimate<1);
 for(const key of keys)assert.equal(process.env[key],before[key],
  'the entire offline audit must restore preexisting environment: '+key);
 // Even legacy approval/copyable exact old hash cannot trigger the
 // retired job; this test creates no billable Actions dispatch.
 console.log('QA3_CONSUMED_VS_FRESH_HASH_DECISION='+JSON.stringify(output));
})().catch(e=>{console.error(e);process.exitCode=1});
