'use strict';
const assert=require('node:assert/strict');
const plan=require('./report-adaptive-v1-offline-cost-plan');
(async()=>{
 const before={key:process.env.OPENAI_API_KEY,url:process.env.REPORT_MODEL_URL};
 const report=await plan.inspect();
 assert.equal(report.kind,'adaptive-v1-offline-cost-plan-v1');
 assert.equal(report.providerCalls,0);
 assert.equal(report.operatorApprovalGranted,false);
 assert.equal(report.salesApproved,false);
 assert.equal(report.realMeasuredTokenCount,null);
 assert.equal(report.guaranteedBillingCapUSD,null);
 assert.equal(report.totalCalls,report.bodyCalls+1);
 assert.equal(report.totalCalls,7,'existing lunar 1982 sample should be six body + one final');
 assert.equal(report.rows.length,report.bodyCalls);
 assert.deepEqual(report.rows[0].chapters,['saju_core']);
 assert.equal(report.rows[0].kind,'actual-first-envelope');
 assert(report.rows[0].requestUtf8Bytes>20000,'real writer+schema must be serialized');
 assert(report.rows.slice(1).every(row=>
  row.kind==='later-batch-no-prior-prose-projection'&&
  row.requestUtf8Bytes>1000),'later batches are unbilled envelope projections');
 assert.equal(report.rows[0].outputTokenCeiling,18000);
 assert.equal(report.totalOutputTokenCeiling,90000);
 assert.equal(report.outputIfAllLimitsReachedUSD,0.72);
 assert(report.illustrativeFullRunUSD>0.72);
 assert(report.illustrativeInputPlanningTokens>report.rows[0].requestUtf8Bytes);
 assert(report.rateUSDPerMillion.input===2&&report.rateUSDPerMillion.output===8);
 assert.equal(report.chosenChapters.includes('saju_core'),true);
 assert.equal(report.chosenChapters.includes('year_2027'),true);
 assert.equal(process.env.OPENAI_API_KEY,before.key);
 assert.equal(process.env.REPORT_MODEL_URL,before.url);
 console.log('ADAPTIVE_V1_OFFLINE_COST_PLAN='+JSON.stringify(report));
})().catch(e=>{console.error(e);process.exitCode=1});
