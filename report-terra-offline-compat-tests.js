'use strict';
const assert=require('node:assert/strict');
const terra=require('./report-terra-offline-compat');
const batches=require('./report-paid-batch-plan');
const options=require('./report-provider-model-options');
const older=require('./qa-current-core-preflight');
const cost=require('./report-adaptive-v1-offline-cost-plan');
(async()=>{
 const original={key:process.env.OPENAI_API_KEY,model:process.env.REPORT_MODEL,
  url:process.env.REPORT_MODEL_URL,fetch:global.fetch};
 const report=await terra.inspect();
 assert.equal(report.model,'gpt-6.1-terra');
 assert.equal(report.providerCalls,0);
 assert.equal(report.approvalToCharge,false);
 assert.equal(report.productionDeployed,false);
 assert.equal(report.remoteSchemaAccepted,false);
 assert.equal(report.KoreanPremiumProseApproved,false);
 assert.equal(report.pricingTier,'Standard');
 assert.deepEqual([report.rateUSDPerMillion.input,report.rateUSDPerMillion.output],[1,5]);
 assert.equal(report.firstCallIllustrativeUSD,0.160225,
  'do not mistake Flex/Batch half-price for the synchronous Standard endpoint');
 assert.equal(report.legacyIllustrativeUSD,0.284378);
 assert.equal(report.outputTokenCeiling,18000);
 assert.notEqual(report.firstRequestSha256,report.oldModelSha256);
 assert.match(report.firstRequestSha256,/^[0-9a-f]{64}$/);
 assert.deepEqual(options.requestFields('gpt-6.1-terra'),{reasoning:{effort:'none'}});
 assert.deepEqual(options.requestFields('gpt-4.1'),{});
 assert.equal(batches.outputLimit('gpt-6.1-terra',{stage:'synthesis'}),12000);
 assert.equal(batches.outputLimit('gpt-6.1-terra',{stage:'body',requestedSections:['money']}),12000);
 assert.equal(batches.outputLimit('gpt-6.1-terra',{stage:'body',requestedSections:['saju_core']}),18000);
 assert.equal(batches.outputLimit('unknown-family',{stage:'body',requestedSections:['saju_core']}),9000);
 const base=await older.prepare({includePrompt:true});
 const expected=cost.envelope(base.prompt,terra.MODEL);
 assert.equal(expected.model,'gpt-6.1-terra');
 assert.equal(expected.reasoning.effort,'none');
 assert.equal(expected.input.length,2);
 assert.equal(expected.text.format.strict,true);
 assert.equal(expected.text.format.schema.type,'object');
 // Intercept the actual server boundary with a LOCAL fake. Neither scenario
 // can send a real API request even if the runner has credentials.
 let calls=0,observed=null;
 try{
  process.env.OPENAI_API_KEY='offline-not-a-credential';
  process.env.REPORT_MODEL=terra.MODEL;
  delete process.env.REPORT_MODEL_URL;
  global.fetch=async(url,request)=>{
   assert.equal(String(url),'https://api.openai.com/v1/responses');
   calls++;
   const body=JSON.parse(request.body);
   assert.equal(body.model,terra.MODEL);
   assert.equal(body.store,false);
   assert.equal(body.max_output_tokens,18000);
   assert.deepEqual(body.reasoning,{effort:'none'});
   assert.deepEqual(body,expected,'real model boundary must match offline-pinned envelope');
   return {ok:true,json:async()=>({status:'completed',
    output_text:'{"chapters":{}}',usage:{input_tokens:1200,output_tokens:99,
     output_tokens_details:{reasoning_tokens:0}}})};
  };
  await assert.rejects(require('./server').callOpenAI(base.prompt,(_content,receipt)=>{
   observed=receipt;
   throw Error('LOCAL_STOP_BEFORE_DECODE');
  }),/LOCAL_STOP_BEFORE_DECODE/);
  assert.equal(calls,1,'one locally mocked response, no second request');
  assert.equal(observed.model,terra.MODEL);
  assert.equal(observed.usage.input_tokens,1200);
  global.fetch=async(url,request)=>{
   calls++;
   assert.equal(JSON.parse(request.body).model,terra.MODEL);
   return {ok:true,json:async()=>({status:'incomplete',
    incomplete_details:{reason:'max_output_tokens'},
    usage:{input_tokens:1400,output_tokens:18000,
     output_tokens_details:{reasoning_tokens:3000}}})};
  };
  let failedReceipt=null;
  await assert.rejects(require('./server').callOpenAI(base.prompt,raw=>{
   failedReceipt=raw;
  }),/AI report service output token limit/);
  assert.equal(calls,2,'incomplete remote output must not cause automatic retry');
  assert.equal(failedReceipt.status,'incomplete');
  assert.equal(failedReceipt.usage.output_tokens_details.reasoning_tokens,3000);
 }finally{
  global.fetch=original.fetch;
  for(const [name,value] of [['OPENAI_API_KEY',original.key],
   ['REPORT_MODEL',original.model],['REPORT_MODEL_URL',original.url]]){
   if(value===undefined)delete process.env[name];else process.env[name]=value;
  }
 }
 console.log('PASS Terra offline provider payload equals real server boundary, exact 18k output, Standard $0.160225 scenario, 0 paid calls');
 console.log('TERRA_OFFLINE_COMPAT='+JSON.stringify(report));
})().catch(error=>{console.error(error);process.exitCode=1});
