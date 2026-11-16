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
 assert.equal(report.totalCalls,6,'adaptive-v1 omits three buyer-neutral repeated chapters: five body + one final');
 assert.equal(report.rows.length,report.bodyCalls);
 assert.deepEqual(report.rows[0].chapters,['saju_core']);
 assert.equal(report.rows[0].kind,'actual-first-envelope');
 assert(report.rows[0].requestUtf8Bytes>20000,'real writer+schema must be serialized');
 assert(report.rows.slice(1).every(row=>
  row.kind==='later-batch-no-prior-prose-projection'&&
  row.requestUtf8Bytes>1000),'later batches are unbilled envelope projections');
 assert.equal(report.rows[0].outputTokenCeiling,18000);
 assert.equal(report.totalOutputTokenCeiling,78000);
 assert.equal(report.outputIfAllLimitsReachedUSD,0.624);
 assert(report.illustrativeFullRunUSD>0.624);
 assert(report.illustrativeInputPlanningTokens>report.rows[0].requestUtf8Bytes);
 assert(report.rateUSDPerMillion.input===2&&report.rateUSDPerMillion.output===8);
 assert.equal(report.chosenChapters.includes('saju_core'),true);
 assert.equal(report.chosenChapters.includes('year_2027'),true);
 assert.equal(process.env.OPENAI_API_KEY,before.key);
 assert.equal(process.env.REPORT_MODEL_URL,before.url);
 // Test the real OpenAI success-envelope callback without internet or paid
 // calls. Stop deliberately inside the private observer before the decoder.
 const captured=await require('./report-core-paid-full-prompt-capture')
  .capture(plan.sample);
 assert.equal(captured.providerCalls,0);
 const original={fetch:global.fetch,key:process.env.OPENAI_API_KEY,
  model:process.env.REPORT_MODEL,url:process.env.REPORT_MODEL_URL};
 let fakeCalls=0,receiptSeen=false;
 try{
  process.env.OPENAI_API_KEY='offline-fake-key-not-a-credential';
  process.env.REPORT_MODEL='gpt-4.1';
  delete process.env.REPORT_MODEL_URL;
  global.fetch=async(url)=>{
   assert.equal(String(url),'https://api.openai.com/v1/responses');
   fakeCalls++;
   return {ok:true,json:async()=>({status:'completed',
    output_text:'{"chapters":{}}',
    usage:{input_tokens:1234,output_tokens:567}})};
  };
  await assert.rejects(require('./server').callOpenAI(captured.prompt,
   (_response,receipt)=>{
    assert.deepEqual(receipt.usage,{input_tokens:1234,output_tokens:567});
    assert.equal(receipt.model,'gpt-4.1');
    receiptSeen=true;
    throw Error('OFFLINE_STOP_BEFORE_DECODE');
   }),/OFFLINE_STOP_BEFORE_DECODE/);
  assert.equal(fakeCalls,1);
  assert(receiptSeen,'private cost observer must receive real provider token usage');
 }finally{
  global.fetch=original.fetch;
  for(const [name,value] of [['OPENAI_API_KEY',original.key],
   ['REPORT_MODEL',original.model],['REPORT_MODEL_URL',original.url]]){
   if(value===undefined)delete process.env[name];else process.env[name]=value;
  }
 }
 console.log('ADAPTIVE_V1_OFFLINE_COST_PLAN='+JSON.stringify(report));
})().catch(e=>{console.error(e);process.exitCode=1});
