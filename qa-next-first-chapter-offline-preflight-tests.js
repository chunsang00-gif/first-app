'use strict';
const assert=require('node:assert/strict');
const next=require('./qa-next-first-chapter-offline-preflight');
const spent=require('./qa-terra-first-chapter-one-shot');
const checkout=require('./report-paid-core-precharge-value');
(async()=>{
 const result=await next.inspect();
 assert.equal(result.kind,'next-one-call-first-chapter-scenario-offline-preflight-v1');
 assert.equal(result.normalPaidFirstChapter,true);
 assert.equal(result.requiredPaidSupplementalParagraph,true);
 assert.equal(result.independentlyCitableHourRefs,2);
 assert.equal(result.requestUtf8Bytes>10000,true);
 assert.equal(result.outputTokenCeiling,18000);
 assert.match(result.exactProviderRequestSha256,/^[0-9a-f]{64}$/);
 assert.notEqual(result.exactProviderRequestSha256,spent.FROZEN_REQUEST_SHA256);
 assert.equal(result.previousApprovedCodeValid,false);
 assert.equal(result.previousPaidOneShotReused,false);
 assert.equal(result.separateNewExactCommitApprovalRequired,true);
 assert.equal(result.freshSingleUseWorkflowRequired,true);
 assert.equal(result.realPaidProviderCalls,0);
 assert.equal(result.merchantCalls,0);
 assert.equal(result.noProviderKeysRead,true);
 assert.equal(result.modelOutputGenerated,false);
 assert.equal(result.comparedWithFreeReading,false);
 assert.equal(result.expertReviewed,false);
 assert.equal(result.saleApproved,false);
 assert.equal(result.releaseVerdict,'not-approved');
 const noQuestion={...next.SAMPLE};
 delete noQuestion.readerDecision;
 assert.equal(checkout.inspect(noQuestion).eligible,false);
 assert.equal(checkout.inspect(next.SAMPLE).eligible,true);
 assert(!JSON.stringify(result).includes(next.SAMPLE.readerDecision),
  'Never expose the full private prompt or customer-entered question');
 const quote={
  kind:'next-first-chapter-consent-packet-offline-v1',
  featureCommit:process.env.GITHUB_SHA||null,
  model:next.MODEL,modelRateUSDPerMillion:{input:1,output:5},
  exactRequestSha256:result.exactProviderRequestSha256,
  requestUtf8Bytes:result.requestUtf8Bytes,
  maximumProviderOutputTokens:result.outputTokenCeiling,
  priorMeasuredInputTokens:26006,priorMeasuredOutputTokens:454,
  exampleCostAtPriorMeasuredTokensUSD:Number(
   ((26006+454*5)/1000000).toFixed(6)),
  exampleCostAtPriorInputAndMaxOutputUSD:Number(
   ((26006+result.outputTokenCeiling*5)/1000000).toFixed(6)),
  guaranteedBillingCapUSD:null,
  previousPaidConsentReusable:false,newPaidApprovalObtained:false,
  providerCalls:0,operatorReleaseApproved:false
 };
 assert.equal(quote.exampleCostAtPriorMeasuredTokensUSD,0.028276);
 assert.equal(quote.exampleCostAtPriorInputAndMaxOutputUSD,0.116006);
 assert.equal(quote.guaranteedBillingCapUSD,null);
 console.log('NEXT_QA_CONSENT_PACKET='+JSON.stringify(quote));
 console.log('PASS next first-chapter realistic question: exact provider envelope OFFLINE, old one-shot consumed, independent hour paragraph required, no billing');
})().catch(e=>{console.error(e);process.exitCode=1});
