'use strict';
// NON-BILLABLE cross-check of the newly prepared claim-linked model request
// against the previously consumed historical QA3 workflow and frozen hash.
// This module cannot dispatch a workflow, fetch secrets or call OpenAI.
const fs=require('node:fs');
const path=require('node:path');
const prior=require('./qa-core-v2-qa3-dispatch-guard');
const strict=require('./report-qa3-offline-provider-readiness-audit');
const HISTORICAL=Object.freeze({
 workflowRunId:40633333735,
 dateUTC:'2026-10-28T04:37:06Z',
 event:'workflow_dispatch',
 workflow:'.github/workflows/paid-report-qa.yml',
 branch:'fix-paid-qa-fact-bindings-20261014',
 providerStepReached:true,
 runConclusion:'failure',
 consentConsumed:true,
 actualChargeAmount:'unknown'
});
const vars=['NODE_ENV','RENDER','PAID_CORE_DEPTH_V2',
 'PAID_CORE_V2_CLASSICAL_WRITER','PAID_CORE_V2_CLAIM_LINKS',
 'PAID_CORE_V2_LOCK_REFS','PAID_CORE_V2_CLOSED_CLAIMS'];
async function assess(){
 const original=Object.fromEntries(vars.map(x=>[x,process.env[x]]));
 try{
  // Research-only flags; no real paid workflow input, no API key access.
  process.env.NODE_ENV='test';
  delete process.env.RENDER;
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  process.env.PAID_CORE_V2_CLASSICAL_WRITER='offline-preview';
  process.env.PAID_CORE_V2_CLAIM_LINKS='offline-preview';
  delete process.env.PAID_CORE_V2_LOCK_REFS;
  delete process.env.PAID_CORE_V2_CLOSED_CLAIMS;
  const draft=await strict.inspectOne();
  const text=fs.readFileSync(path.join(__dirname,HISTORICAL.workflow),'utf8');
  const retired=/# RETIRED: real QA3 workflow_dispatch 40633333735/.test(text)&&
   /\n  qa3-first-chapter:\n(?:[^\n]*\n){1,10}?    if: \$\{\{ false \}\}/.test(text);
  if(!retired)throw Error('QA3_CONSUMED_WORKFLOW_NOT_HARD_DISABLED');
  if(HISTORICAL.workflowRunId<=prior.LAST_PREVIOUS_DISPATCH_ID||
     prior.REQUEST_HASH===draft.envelopeSha256||
     !/^[a-f0-9]{64}$/.test(draft.envelopeSha256)||
     draft.providerCalls!==0||draft.approvalToCharge!==false||
     draft.strictSchemaStructuralCheck!=='passed-local-only')
   throw Error('QA3_FRESH_HASH_OR_CONSUMED_STATUS_INVALID');
  return {
   kind:'qa3-next-call-decision-offline-only-v1',
   historicalRunId:HISTORICAL.workflowRunId,
   historicalOutcome:HISTORICAL.runConclusion,
   historicalProviderStageReached:HISTORICAL.providerStepReached,
   historicalApprovalConsumed:HISTORICAL.consentConsumed,
   historicalActualBilledAmount:HISTORICAL.actualChargeAmount,
   oldQA3WorkflowHardDisabled:true,
   oldQA3RequestHash:prior.REQUEST_HASH,
   newClaimLinkedRequestHash:draft.envelopeSha256,
   hashesDifferent:true,
   model:draft.model,
   modelStatus:'deprecated-in-public-model-catalog',
   firstChapterOnly:true,
   maxOutputTokens:draft.outputTokenCap,
   budgetUSDAtConservativeCapacityEstimate:
    draft.estimatedCostUSDAtOutputCapAndInputBound,
   localStrictSchemaInspection:'passed',
   remoteStructuredOutputAccepted:'unknown-no-network-call',
   currentTrialDispatchImplemented:false,
   consentForNewHashObtained:false,
   legalToReuseOldQA3Approval:false,
   automaticRetryAllowed:false,
   providerCalls:0,actualNewPaidGeneration:false,
   editorialQualityApproved:false,customerRelease:false,
   releaseVerdict:'not-approved',
   nextAction:'new-request-specific-user-consent-plus-dedicated-one-time-runner'
  };
 }finally{
  for(const [k,v] of Object.entries(original))
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
}
module.exports={assess,HISTORICAL};
