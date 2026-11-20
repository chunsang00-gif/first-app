'use strict';
// Work45: the buyer-neutral $0.10 estimate was NOT a checkable paid offer.
// Recalculate the exact first charged body and full adaptive projections
// for a real SOURCE-QUALIFIED synthetic buyer question. Trap provider IO.
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const cost=require('./report-adaptive-v1-offline-cost-plan');
const capture=require('./report-core-paid-full-prompt-capture');
const qualify=require('./report-paid-core-precharge-value');
const writer=require('./report-generation-request');
const bodySha=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
async function run(){
 const existing=await cost.inspect({model:'gpt-6-luna'});
 assert.equal(existing.firstChapterPrechargeQualified,false);
 const buyer=cost.qualifiedSample;
 const gate=qualify.inspect(buyer);
 assert.equal(gate.eligible,true);
 assert.equal(gate.reason,'verified-hour-addition-awaits-human-review');
 assert.equal(gate.modelQualityValidated,false);
 assert.equal(gate.customerSaleApproved,false);
 const [plan,old]=await Promise.all([
  cost.inspect({model:'gpt-6-luna',scenario:'source-qualified-skill-choice'}),
  cost.inspect({model:'gpt-4.1',scenario:'source-qualified-skill-choice'})
 ]);
 assert.equal(plan.sourceQualifiedFirstChapterRequired,true);
 assert.equal(plan.firstChapterPrechargeQualified,true);
 assert.equal(plan.customerSalesAuthorized,undefined);
 assert.equal(plan.salesApproved,false);
 assert.equal(plan.providerCalls,0);
 assert.equal(plan.operatorApprovalGranted,false);
 assert.equal(plan.nextPaidProviderCallAuthorized,false);
 assert.equal(plan.guaranteedBillingCapUSD,null);
 assert.equal(plan.realMeasuredTokenCount,null);
 assert.equal(plan.model,'gpt-6-luna');
 assert.equal(plan.rateUSDPerMillion.input,0.1);
 assert.equal(plan.rateUSDPerMillion.output,0.5);
 assert.equal(old.model,'gpt-4.1');
 assert.deepEqual(plan.chosenChapters,old.chosenChapters);
 assert.deepEqual(plan.rows.map(x=>x.chapters),old.rows.map(x=>x.chapters));
 assert(plan.chosenChapters.includes('decision'),
  'a concrete buyer dilemma should not be quoted with the neutral chapter scope');
 assert(plan.totalCalls<=7);
 assert.deepEqual(plan.rows[0].chapters,['saju_core']);
 assert.equal(plan.rows[0].outputTokenCeiling,18000);
 assert.notEqual(plan.firstBodyRequestSha256,existing.firstBodyRequestSha256,
  'buyer question must materially change first-chapter request');
 assert(plan.illustrativeFullRunUSD>plan.firstBodyIllustrativeFullOutputUSD);
 const frozen=await capture.capture(buyer);
 assert.equal(frozen.status,'captured-full-paid-composition');
 assert.equal(frozen.providerCalls,0);
 const prompt=frozen.prompt,task=writer.compile(prompt).task;
 const extra=task.chapters.saju_core.topics.temperament.sourceOwnedHourExtension;
 assert.equal(extra.hourHiddenRole,'식신');
 assert.deepEqual([...extra.sourceRefs],[
  'natal.hour.stem','natal.hour.hidden.丁']);
 const envelope=cost.envelope(prompt,'gpt-6-luna');
 assert.equal(bodySha(envelope),plan.firstBodyRequestSha256);
 assert.equal(envelope.store,false);
 assert.equal(envelope.reasoning.effort,'none');
 const slot=envelope.text.format.schema.properties.chapters.properties.saju_core
  .properties.paragraphs.properties.temperament;
 assert.equal(slot.anyOf.length,1);
 assert.equal(slot.anyOf[0].type,'object');
 assert.deepEqual(slot.anyOf[0].properties.basis.properties.refs.items.enum,
  extra.sourceRefs);
 const transmitted=JSON.parse(envelope.input[1].content);
 assert(transmitted.task.chapters.saju_core.topics.temperament.sourceOwnedHourExtension);
 assert.equal(transmitted.task.chapters.saju_core.coreReaderChoiceContext?.text,buyer.readerDecision);
 const saved={
  fetch:global.fetch,key:process.env.OPENAI_API_KEY,
  model:process.env.REPORT_MODEL,url:process.env.REPORT_MODEL_URL};
 let calls=0;
 try{
  process.env.OPENAI_API_KEY='NONREAL_OFFLINE_TEST_ONLY';
  process.env.REPORT_MODEL='gpt-6-luna';
  delete process.env.REPORT_MODEL_URL;
  global.fetch=async(url,init)=>{
   assert.equal(url,'https://api.openai.com/v1/responses');
   assert.deepEqual(JSON.parse(init.body),envelope);
   calls++;
   return {ok:true,json:async()=>({status:'completed',
    output_text:'{"chapters":{}}',
    usage:{input_tokens:100,output_tokens:50}})};
  };
  await assert.rejects(require('./server').callOpenAI(prompt,
   (_parsed,receipt)=>{
    assert.equal(receipt.model,'gpt-6-luna');
    assert.deepEqual(receipt.usage,{input_tokens:100,output_tokens:50});
    throw Error('STOP_BEFORE_DECODE_CHARGE_FORBIDDEN');
   }),/STOP_BEFORE_DECODE_CHARGE_FORBIDDEN/);
  assert.equal(calls,1,'exactly one fake transport, zero real calls');
 }finally{
  global.fetch=saved.fetch;
  for(const [k,v] of [['OPENAI_API_KEY',saved.key],
   ['REPORT_MODEL',saved.model],['REPORT_MODEL_URL',saved.url]]){
   if(v===undefined)delete process.env[k];else process.env[k]=v;
  }
 }
 const summary={
  kind:'source-qualified-buyer-first-chapter-luna-plan-v1',
  buyerNeutralIsNotEligible:true,sourceQualifiedBuyerEligibleForTechnicalPrecharge:true,
  realPaidManuscriptApproved:false,
  buyerQuestionAddsDecisionChapter:plan.chosenChapters.includes('decision'),
  buyerReportChapterCount:plan.chosenChapters.length,
  buyerProjectedModelCalls:plan.totalCalls,
  firstCallOutputTokenCeiling:plan.rows[0].outputTokenCeiling,
  firstCallRequestBytes:plan.rows[0].requestUtf8Bytes,
  firstCallProjectedMaxOutputScenarioUSD:plan.firstBodyIllustrativeFullOutputUSD,
  fullBuyerScenarioUSD:plan.illustrativeFullRunUSD,
  previousNeutralScenarioUSD:existing.illustrativeFullRunUSD,
  oldBuyerModelScenarioUSD:old.illustrativeFullRunUSD,
  firstRequestMatchesActualProductionTransport:true,
  actualInputAndOutputTokensMeasured:false,
  noGuaranteedDollarCap:true,
  genuineNewModelQualityStillUnverified:true,
  realModelCalls:0,realPaymentCalls:0,
  saleOrDeploymentApproved:false
 };
 console.log('QUALIFIED_BUYER_LUNA_REAL_FIRST_CHAPTER_COST='+JSON.stringify(summary));
 return summary;
}
if(require.main===module)run().catch(e=>{
 console.error('QUALIFIED_BUYER_LUNA_COST_FAILED:'+(e.stack||e));
 process.exitCode=1;
});
module.exports={run};