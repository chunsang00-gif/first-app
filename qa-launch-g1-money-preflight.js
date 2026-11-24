'use strict';
// LAUNCH G1: a SINGLE independently sourced synthetic money dilemma.
// This captures the EXACT first body API envelope before any provider call.
// It is an APPROVAL PACKET, not approval, a paid model call or sale.
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const readiness=require('./report-paid-core-precharge-value');
const capture=require('./report-core-paid-full-prompt-capture').capture;
const writer=require('./report-generation-request');
const cost=require('./report-adaptive-v1-offline-cost-plan');
const MODEL='gpt-6-luna';
const INPUT=Object.freeze({
 calendar:'solar',birthDate:'1982-07-15',birthTime:'02:20',
 gender:'male',mbti:'ISFP',
 readerDecision:'적금을 유지할지 대출을 상환할지 고민입니다.'
});
const sha=value=>crypto.createHash('sha256').update(JSON.stringify(value),'utf8').digest('hex');
async function inspect(){
 const oldFetch=global.fetch;
 let networkCalls=0;
 global.fetch=async()=>{networkCalls++;throw Error('LAUNCH_G1_NETWORK_FORBIDDEN')};
 try{
  const pre=readiness.inspect(INPUT);
  assert.equal(pre.eligible,true,
   'the current money pilot must be precharge-qualified before any API request');
  assert.equal(pre.reason,'verified-hour-addition-awaits-human-review');
  assert.equal(pre.wholeNatalHourRoleNotRepeated,true);
  assert.equal(pre.customerSaleApproved,false);
  const observed=await capture(INPUT);
  assert.equal(observed.status,'captured-full-paid-composition');
  assert.equal(observed.providerCalls,0);
  assert.deepEqual(observed.requestedSections,['saju_core']);
  const prompt=observed.prompt;
  const compiled=writer.compile(prompt);
  const topics=compiled.task.chapters.saju_core.topics;
  const hour=topics.temperament.sourceOwnedHourExtension;
  const recap=topics.strength.sourceOwnedCoreReaderValue;
  assert.deepEqual(hour?.sourceRefs,['natal.hour.stem','natal.hour.hidden.癸']);
  assert.equal(hour.wholeNatalCategoryDistinct,true);
  assert.equal(hour.readerDomain,'money');
  assert.equal(recap?.scope,'already-public-month-recap-only-v1');
  assert.equal(recap?.script,undefined);
  const env=cost.envelope(prompt,MODEL);
  assert.equal(env.model,MODEL);
  assert.equal(env.store,false);
  assert.equal(env.reasoning?.effort,'none');
  assert.equal(env.text?.format?.strict,true);
  const core=env.text.format.schema.properties.chapters.properties.saju_core.properties;
  const extra=core.paragraphs.properties.temperament.anyOf;
  assert.equal(extra.length,1);
  assert.deepEqual(extra[0].properties.basis.properties.refs.items.enum,
   ['natal.hour.stem','natal.hour.hidden.癸']);
  assert.equal(extra[0].type,'object');
  assert(core.paragraphs.properties.strength.properties.text.description
   .includes('무료 공개'));
  assert.equal(networkCalls,0);
  // Cost here uses the existing 2026-11-20 model-rate assumption and a
  // BYTE-based planning proxy, NOT tokenized real usage or a hard dollar cap.
  const bytes=Buffer.byteLength(JSON.stringify(env),'utf8');
  const illustrativeCost=cost.dollars(
   bytes+2048,env.max_output_tokens,cost.LUNA_RATE);
  return Object.freeze({
   stage:'G1',state:'offline-preflight-passed-waiting-explicit-one-call-consent',
   target:'single-synthetic-money-dilemma-first-paid-chapter',
   model:MODEL,modelAvailabilityAndPriceRecheckRequired:true,
   requestSha256:sha(env),requestUtf8Bytes:bytes,
   outputTokenCeiling:env.max_output_tokens,
   illustrativeUSDIfFullOutputAt20261120Rate:illustrativeCost,
   actualBilledTokens:null,guaranteedBillingCapUSD:null,
   firstChapterHourRefs:hour.sourceRefs,
   freeMonthScope:recap.scope,
   paidModelCalls:0,merchantCalls:0,productionDeployment:false,
   billableFirstChapterApproval:false,humanMeaningReviewComplete:false,
   finalManuscriptApproved:false,customerSaleApproved:false
  });
 }finally{global.fetch=oldFetch}
}
if(require.main===module)inspect().then(x=>
 console.log('LAUNCH_G1_OFFLINE_PREFLIGHT='+JSON.stringify(x))
).catch(err=>{console.error('LAUNCH_G1_PRECONDITION_FAILED:'+err.stack);process.exitCode=1});
module.exports={inspect,INPUT,MODEL};
