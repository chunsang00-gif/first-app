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
  // Old work47 packet is NOW REVOKED: the selected hourly 丁 already
  // appears in the YEAR and DAY hidden stems. Different position does not
  // prove a new traditional meaning worth selling.
  await assert.rejects(pkg.inspect(),err=>
   /old-luna-qa-sample-repeats-hour-role-across-natal/.test(err.message)&&
   err.message.includes('natal.year.hidden.丁')&&
   err.message.includes('natal.day.hidden.丁'));
  const overlap=require('./report-paid-core-hour-cross-pillar-audit')
   .inspect(require('./report-facts-node').build(sample,2027));
  assert.equal(overlap.eligibleForNewPaidRoleClaim,false);
  assert.equal(overlap.sameExactStemOtherNatalPositions.length,2);
  assert.equal(overlap.salesApproved,false);
  assert.equal(calls,0);
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
  console.log('PASS REVOKED LUNA FIRST-CHAPTER OFFLINE PACKET '+JSON.stringify({
    reason:'same symbol already in year and day natal hidden stems',
    oldRequestPreviouslyFrozen:true,oldTrialNoLongerApproved:true,
    modelRequests:calls,merchantRequests:0,
    previousTerraConsentReusable:false,
    newOperatorApprovalWouldNotFixMissingChartMethod:true,
    releaseVerdict:'not-approved'
  }));
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
