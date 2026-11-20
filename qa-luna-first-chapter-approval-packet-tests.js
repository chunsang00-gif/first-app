'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const pkg=require('./qa-luna-first-chapter-approval-packet');
const sample=require('./report-adaptive-v1-offline-cost-plan').qualifiedSample;
async function run(){
 const restore=global.fetch;
 const old={
  confirm:process.env.REPORT_QA_CONFIRM,
  payment:process.env.REPORT_QA_ALLOW_PAYMENT,
  key:process.env.OPENAI_API_KEY
 };
 let calls=0;
 try{
  global.fetch=async()=>{calls++;throw Error('REAL_NETWORK_FORBIDDEN_WORK47')};
  delete process.env.REPORT_QA_CONFIRM;
  delete process.env.REPORT_QA_ALLOW_PAYMENT;
  delete process.env.OPENAI_API_KEY;
  const p=await pkg.inspect();
  assert.equal(p.model,'gpt-6-luna');
  assert.equal(p.kind,'one-luna-first-chapter-explicit-approval-required-offline-v1');
  assert.match(p.firstChapterProviderRequestSha256,/^[a-f0-9]{64}$/);
  assert(p.requestUtf8Bytes>60000);
  assert.equal(p.outputTokenCeiling,18000);
  assert.equal(p.sourceRefs.length,2);
  assert.deepEqual(p.sourceRefs,['natal.hour.stem','natal.hour.hidden.丁']);
  assert(p.approximateFirstCallMaxOutputScenarioUSD>0.01);
  assert(p.approximateFirstCallMaxOutputScenarioUSD<0.03);
  assert.equal(p.freeBaselineCardCount>=2,true);
  assert.match(p.freeBaselineTextSha256,/^[a-f0-9]{64}$/);
  assert.equal(p.humanReviewQuestions.length,5);
  assert.equal(p.realProviderCalls,0);
  assert.equal(p.merchantCalls,0);
  assert.equal(p.userApprovedAdditionalPaidCall,false);
  assert.equal(p.previousTerraConsentReusable,false);
  assert.equal(p.modelOutputGenerated,false);
  assert.equal(p.manuscriptHumanVerified,false);
  assert.equal(p.productSaleApproved,false);
  assert.equal(p.productionDeploymentApproved,false);
  assert.equal(p.releaseVerdict,'not-approved');
  assert.equal(p.exactModelAvailabilityAndOutputNotVerified,true);
  assert.equal(p.estimatedNotGuaranteedCap,true);
  assert.equal(p.work46ProviderBriefPresent,true);
  assert(!fs.existsSync(path.join(__dirname,'.github/workflows/luna-first-chapter-qa.yml')),
   'never leave an active billable workflow without explicit new operator approval');
  assert.equal(calls,0);
  await assert.rejects(pkg.inspect({
   sample:{...sample,birthTime:'02:20'}
  }),/only-reviewed-synthetic-buyer-fixture/);
  await assert.rejects(pkg.inspect({model:'gpt-6.1-terra'}),
   /only-reviewed-synthetic-buyer-fixture/);
  process.env.REPORT_QA_CONFIRM='REUSED_20261118_TERRA_CONSENT';
  await assert.rejects(pkg.inspect(),/paid-approval-env-must-be-absent/);
  delete process.env.REPORT_QA_CONFIRM;
  process.env.REPORT_QA_ALLOW_PAYMENT='true';
  await assert.rejects(pkg.inspect(),/paid-approval-env-must-be-absent/);
  assert.equal(calls,0,'even a forged approval token never performs network IO');
  console.log('PASS LUNA NO-BILL FIRST-CHAPTER APPROVAL PACKET '+
   JSON.stringify({requestSha256:p.firstChapterProviderRequestSha256,
    requestUtf8Bytes:p.requestUtf8Bytes,outputLimit:p.outputTokenCeiling,
    firstCallOutputMaxScenarioUSD:p.approximateFirstCallMaxOutputScenarioUSD,
    actualModelRequests:calls,merchantRequests:0,
    consumedTerraConsentReusable:false,
    newOperatorApprovalRequired:true,releaseVerdict:p.releaseVerdict}));
 }finally{
  global.fetch=restore;
  for(const [key,value] of [
   ['REPORT_QA_CONFIRM',old.confirm],['REPORT_QA_ALLOW_PAYMENT',old.payment],
   ['OPENAI_API_KEY',old.key]]){
    if(value===undefined)delete process.env[key];
    else process.env[key]=value;
   }
 }
}
if(require.main===module)run().catch(e=>{
 console.error('LUNA_APPROVAL_PACKET_TEST_FAILED:'+e.stack);
 process.exitCode=1;
});
module.exports={run};
