'use strict';
// The REAL server first-batch composer, actual paid writer, schema and source
// audit. The intercepted callback prevents every paid/network operation.
const assert=require('node:assert/strict');
const {capture}=require('./report-core-paid-full-prompt-capture');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const reportSchema=require('./report-schema.json');
const audit=require('./report-instruction-audit');
const input={calendar:'solar',birthDate:'1994-07-15',birthTime:'14:20',
 gender:'male',mbti:'ISFP'};
(async()=>{
 const prev={flag:process.env.PAID_CORE_DEPTH_V2,node:process.env.NODE_ENV,render:process.env.RENDER};
 try{
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  process.env.NODE_ENV='test';delete process.env.RENDER;
  const captureResult=await capture(input);
  assert.equal(captureResult.status,'captured-full-paid-composition');
  assert.equal(captureResult.providerCalls,0);
  const prompt=captureResult.prompt;
  assert.equal(prompt.paidCoreDepthV2,true);
  assert.deepEqual(prompt.requestedSections,['saju_core']);
  assert.equal(prompt.qaNatalDepthPreview,undefined);
  const paid=writer.compile(prompt);
  const core=paid.task.chapters.saju_core;
  const extra=core.topics.temperament.paidCoreDepthV2;
  assert(extra);
  assert.equal(extra.kind,'first-chapter-optional-full-chart-source-v1');
  assert.equal(extra.approvedAsPremiumValue,false);
  assert.equal(extra.selectedTraditionalPriority,false);
  assert(extra.exposures.some(x=>
   x.hiddenRef==='natal.month.hidden.丁'&&
   x.visibleRef==='natal.hour.stem'));
  const required=['natal.year.stem','natal.day.stem',
   'natal.hour.stem','facts.stemConnections'];
  assert(required.every(x=>extra.sourceRefs.includes(x)));
  assert(required.every(x=>Object.hasOwn(paid.source,x)));
  assert(required.every(x=>core.topics.temperament.citableFacts.some(y=>y.id===x)));
  assert(required.every(x=>!core.topics.strength.citableFacts.some(y=>y.id===x)));
  assert(!Object.hasOwn(paid.source,'person.mbti'));
  const normal=writer.compile({...prompt,paidCoreDepthV2:false});
  assert(required.every(x=>!Object.hasOwn(normal.source,x)));
  assert.deepEqual(normal.task.chapters.saju_core.topics.strength.citableFacts,
   core.topics.strength.citableFacts);
  assert.deepEqual(Object.keys(core.topics),['temperament','strength']);
  const responseSchema=writer.schema(prompt,wire.schemaFor(prompt,reportSchema));
  const paragraphs=responseSchema.properties.chapters.properties.saju_core
   .properties.paragraphs.properties;
  assert.deepEqual(Object.keys(paragraphs),['temperament','strength']);
  assert(paragraphs.temperament.anyOf.some(x=>x.type==='null'));
  const refs=paragraphs.temperament.anyOf.find(x=>x.type==='object')
   .properties.basis.properties.refs.items.enum;
  assert(required.every(x=>refs.includes(x)));
  assert.deepEqual(audit.inspectTransport(prompt,paid),[]);
  const corrupted=structuredClone(paid);
  corrupted.task.chapters.saju_core.topics.temperament.paidCoreDepthV2
   .selectedTraditionalPriority=true;
  assert(audit.inspectTransport(prompt,corrupted).includes(
   'paid-core-depth-v2-source-context-drift'));
  assert.throws(()=>writer.compile({...prompt,qaNatalDepthPreview:true}),
   /PAID_CORE_DEPTH_V2_INVALID_FIRST_BATCH_SCOPE/);
  process.env.NODE_ENV='production';
  const noActivation=await capture(input);
  assert.equal(noActivation.prompt.paidCoreDepthV2,false);
  assert.equal(noActivation.providerCalls,0);
  console.log('PAID_CORE_DEPTH_V2_REAL_FIRST_BATCH='+JSON.stringify({
   status:'first-paid-chapter-scope-intercepted-before-network',
   sourceRefs:extra.sourceRefs,
   fullChartEvidenceAvailableInOptionalTopic:true,
   existingRequiredCoreUnchanged:true,
   schemaParagraphSlotsUnchanged:true,
   whenProductionEnvironment:false,
   newReaderProseQualityVerified:false,apiCalls:0,
   deployed:false
  }));
 }finally{
  for(const [key,value] of [['PAID_CORE_DEPTH_V2',prev.flag],
   ['NODE_ENV',prev.node],['RENDER',prev.render]]){
   if(value===undefined)delete process.env[key];
   else process.env[key]=value;
  }
 }
})().catch(err=>{console.error(err);process.exitCode=1;});
