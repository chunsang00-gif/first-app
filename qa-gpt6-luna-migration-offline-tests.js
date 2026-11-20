'use strict';
// A zero-billing MIGRATION rehearsal. This executes the production envelope
// serializer with the exact first-chapter prompt but traps fetch BEFORE any
// network request. No new provider text, checkout, private keys or release.
const assert=require('node:assert/strict');
const cost=require('./report-adaptive-v1-offline-cost-plan');
const capture=require('./report-core-paid-full-prompt-capture');
const output=require('./report-paid-batch-plan');
const options=require('./report-provider-model-options');
const MODEL='gpt-6-luna';
async function run(){
 const legacy=await cost.inspect();
 const next=await cost.inspect({model:MODEL});
 assert.equal(legacy.model,'gpt-4.1');
 assert.equal(legacy.modelDeprecated,true);
 assert.equal(next.model,MODEL);
 assert.equal(next.modelDeprecated,false);
 assert.equal(next.modelShutdownDate,null);
 assert.equal(next.modelMigrationBeforeLaunchRequired,false);
 assert.equal(next.nextPaidProviderCallAuthorized,false);
 assert.equal(next.salesApproved,false);
 assert.equal(next.replacementModelRealKoreanQualityVerified,false);
 assert.equal(next.providerCalls,0);
 assert.equal(next.guaranteedBillingCapUSD,null);
 assert.equal(next.realMeasuredTokenCount,null);
 assert.equal(next.totalCalls,legacy.totalCalls);
 assert.deepEqual(next.chosenChapters,legacy.chosenChapters);
 assert.deepEqual(next.rows.map(x=>x.chapters),legacy.rows.map(x=>x.chapters));
 assert.equal(next.totalOutputTokenCeiling,legacy.totalOutputTokenCeiling);
 assert.equal(next.rows[0].outputTokenCeiling,18000);
 assert.equal(next.outputIfAllLimitsReachedUSD,0.039);
 assert.deepEqual(options.requestFields(MODEL),{reasoning:{effort:'none'}});
 assert.equal(output.outputLimit(MODEL,{stage:'body',
  requestedSections:['saju_core']}),18000);
 assert.equal(output.outputLimit('unreviewed-future-model',{stage:'body',
  requestedSections:['saju_core']}),9000);
 assert.equal(next.rateUSDPerMillion.input,0.1);
 assert.equal(next.rateUSDPerMillion.output,0.5);
 assert(next.illustrativeFullRunUSD<legacy.illustrativeFullRunUSD);
 assert(next.illustrativeFullRunUSD>next.outputIfAllLimitsReachedUSD);
 assert.notEqual(next.firstBodyRequestSha256,legacy.firstBodyRequestSha256);
 assert(next.rows.slice(1).every(x=>x.kind==='later-batch-no-prior-prose-projection'));
 const real=await capture.capture(cost.sample);
 assert.equal(real.status,'captured-full-paid-composition');
 assert.equal(real.providerCalls,0);
 assert.deepEqual(real.prompt.requestedSections,['saju_core']);
 const envelope=cost.envelope(real.prompt,MODEL);
 assert.equal(envelope.model,MODEL);
 assert.equal(envelope.store,false);
 assert.equal(envelope.max_output_tokens,18000);
 assert.equal(envelope.text.format.strict,true);
 assert.equal(envelope.text.format.type,'json_schema');
 assert.equal(envelope.reasoning.effort,'none');
 assert.equal(envelope.text.format.schema.properties.chapters.properties
  .saju_core.properties.paragraphs.properties.strength.type!=='null',true);
 assert.equal(next.firstBodyRequestSha256,
  require('node:crypto').createHash('sha256')
   .update(JSON.stringify(envelope)).digest('hex'));
 const previous={
  fetch:global.fetch,
  key:process.env.OPENAI_API_KEY,
  model:process.env.REPORT_MODEL,
  url:process.env.REPORT_MODEL_URL
 };
 let intercepted=0;
 try{
  process.env.OPENAI_API_KEY='offline-transport-not-a-real-credential';
  process.env.REPORT_MODEL=MODEL;
  delete process.env.REPORT_MODEL_URL;
  global.fetch=async(url,init)=>{
   intercepted++;
   assert.equal(url,'https://api.openai.com/v1/responses');
   assert.equal(init.method,'POST');
   assert.deepEqual(JSON.parse(init.body),envelope,
    'actual outgoing server body must exactly match offline calculated migration');
   // A fake successful HTTP envelope, callback aborts before decoding.
   return {ok:true,json:async()=>({status:'completed',
    output_text:'{"chapters":{}}',
    usage:{input_tokens:100,output_tokens:200}})};
  };
  await assert.rejects(require('./server').callOpenAI(real.prompt,
   (_parsed,receipt)=>{
    assert.deepEqual(receipt.usage,{input_tokens:100,output_tokens:200});
    assert.equal(receipt.model,MODEL);
    throw Error('STOP_BEFORE_DECODER_NO_REAL_GENERATION');
   }),/STOP_BEFORE_DECODER_NO_REAL_GENERATION/);
  assert.equal(intercepted,1);
 }finally{
  global.fetch=previous.fetch;
  for(const [key,value] of [
   ['OPENAI_API_KEY',previous.key],
   ['REPORT_MODEL',previous.model],
   ['REPORT_MODEL_URL',previous.url]]){
    if(value===undefined)delete process.env[key];else process.env[key]=value;
   }
 }
 const summary={
  kind:'gpt6-luna-actual-first-envelope-migration-offline-v1',
  existingModel:'gpt-4.1',
  existingModelScheduledShutdown:'2027-01-14',
  candidateModel:MODEL,
  candidateModelInputUSDPerMillion:0.1,
  candidateModelOutputUSDPerMillion:0.5,
  firstChapterRequestedOutputTokenCeiling:next.rows[0].outputTokenCeiling,
  sameSelectedChapters:true,
  fullRunProviderCallCount:next.totalCalls,
  oldFullOutputScenarioUSD:legacy.illustrativeFullRunUSD,
  newFullOutputScenarioUSD:next.illustrativeFullRunUSD,
  relativePlanningCostReductionPct:Math.round((1-
   next.illustrativeFullRunUSD/legacy.illustrativeFullRunUSD)*1000)/10,
  actualFirstEnvelopeMatchedProductionTransportMock:true,
  actualModelAvailabilityTested:false,
  actualModelKoreanReportQualityTested:false,
  actualTokenUsageMeasured:false,
  exactRealCostKnown:false,guaranteedCostCap:false,
  realProviderCalls:0,realMerchantCalls:0,
  operatorPermissionForPaidCall:false,
  operatingDeployAuthorized:false,customerSalesAuthorized:false
 };
 console.log('GPT6_LUNA_MIGRATION_OFFLINE='+JSON.stringify(summary));
 return summary;
}
if(require.main===module)run().catch(e=>{
 console.error('GPT6_LUNA_OFFLINE_REHEARSAL_FAILED:'+e.stack);
 process.exitCode=1;
});
module.exports={run};
