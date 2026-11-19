'use strict';
const assert=require('node:assert/strict');
const boundary=require('./report-paid-core-free-baseline');
const qa=require('./qa-next-first-chapter-offline-preflight');
const neutral=require('./qa-current-core-preflight');
const capture=require('./report-core-paid-full-prompt-capture').capture;
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const schema=require('./report-schema.json');
const free=require('./report-reading-sample');
const facts=require('./report-facts-node');
const values=[qa.SAMPLE,{...qa.SAMPLE,decisionContext:{
 currentWork:'출하 전 품질 검수 및 준비',
 targetSkill:'지게차 실습과 자격 취득'}}];
let modelCalls=0;
const old=global.fetch;
global.fetch=()=>{modelCalls++;throw Error('PAID_BASELINE_TEST_NETWORK_FORBIDDEN')};
(async()=>{
 try{
  for(const input of values){
   const v=await capture(input);
   assert.equal(v.status,'captured-full-paid-composition');
   assert.equal(v.providerCalls,0);
   assert.deepEqual(v.requestedSections,['saju_core']);
   const payload=writer.compile(v.prompt);
   const hour=payload.task.chapters.saju_core.topics.temperament.sourceOwnedHourExtension;
   assert.equal(hour.kind,'buyer-choice-hour-symbolic-extension-v1');
   const checked=boundary.build(v.prompt.facts,hour);
   assert.equal(checked.modelCalls,0);
   assert.equal(checked.merchantCalls,0);
   assert.equal(checked.extraNatalEvidenceAdded,false);
   assert.equal(checked.saleApproved,false);
   const actual=free.build(v.prompt.facts).cards.filter(c=>
    boundary.IDS.includes(c.id));
   assert.deepEqual(checked.alreadyPublicCards,actual,
    'paid writer must receive the real free prose from the SAME birth chart');
   const strict=writer.schema(v.prompt,wire.schemaFor(v.prompt,schema));
   const slot=strict.properties.chapters.properties.saju_core
    .properties.paragraphs.properties.temperament;
   assert.equal(slot.anyOf.length,1,
    'eligible independent hour must still be a mandatory paid first-chapter paragraph');
   const text=slot.anyOf[0].properties.text.description;
   assert(text.includes(checked.writerInstruction));
   for(const c of actual)assert(text.includes(c.text),
    'do not merely name the free topic: send its existing customer-visible words');
   for(const id of hour.sourceRefs)assert(
    slot.anyOf[0].properties.basis.properties.refs.items.enum.includes(id));
   assert(!checked.alreadyPublicCards.some(c=>
    /출하 전 품질 검수 및 준비|지게차 실습과 자격 취득/.test(c.text)),
    'free actual chart meaning may not inherit buyer work/skill input');
   assert.equal(payload.task.chapters.saju_core.topics.strength
    .sourceOwnedCoreReaderValue.kind,'grounded-paid-core-reader-takeaway-v1');
   assert.deepEqual(v.prompt.facts.chart,
    facts.build({...input,decisionContext:undefined},2027).chart,
    'self-reported buyer input cannot alter birth chart source truth');
  }
  // The previously paid, buyer-neutral prompt must remain untouched.
  const oldCase=await capture(neutral.SAMPLE);
  const legacy=writer.compile(oldCase.prompt);
  assert.equal(legacy.task.chapters.saju_core.topics.temperament
   .sourceOwnedHourExtension,undefined);
  const legacySchema=writer.schema(oldCase.prompt,wire.schemaFor(oldCase.prompt,schema));
  const optional=legacySchema.properties.chapters.properties.saju_core
   .properties.paragraphs.properties.temperament;
  assert(!JSON.stringify(optional).includes('이미 고객에게 무료 공개된 실제 본문'));
  // No fabricated or unrelated hour evidence can introduce the writer instruction.
  const packet=facts.build(qa.SAMPLE,2027);
  assert.throws(()=>boundary.build(packet,{kind:'invalid'}),/VERIFIED_HOUR_SOURCE/);
  assert.throws(()=>boundary.build({}, {kind:'buyer-choice-hour-symbolic-extension-v1'}),/VERIFIED_HOUR_SOURCE/);
  assert.equal(modelCalls,0);
  console.log('PASS REAL paid first-chapter provider schema receives same-chart already-public FREE prose only for valid hour-choice customer, strict source remains, zero API calls');
 }finally{global.fetch=old}
})().catch(e=>{console.error(e);process.exitCode=1;});
