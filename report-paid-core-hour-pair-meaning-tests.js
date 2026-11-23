'use strict';
// Work80: actual calculated input -> real source ledger -> ordinary paid
// first-chapter writer+STRICT schema. No provider, merchant, or deploy calls.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const bindings=require('./report-fact-bindings');
const guide=require('./report-analysis-guidance');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const reportSchema=require('./report-schema.json');
const hour=require('./report-paid-core-hour-extension');
const pair=require('./report-paid-core-hour-pair-meaning');
const precharge=require('./report-paid-core-precharge-value');
function run(input,expected){
 const packet=facts.build(input,2027);
 assert.equal(packet.status,'ready');
 assert.deepEqual(['year','month','day','hour'].map(k=>packet.chart[k]),expected.pillars);
 const source=Object.fromEntries(bindings.build(packet).map(x=>[x.id,x]));
 const proof=hour.build(packet,source);
 assert(proof&&proof.wholeNatalCategoryDistinct===true,
  'example MUST have a genuinely distinct hour hidden stem across whole natal chart');
 const meaning=pair.build(packet,source,proof);
 assert(meaning);
 assert.equal(meaning.hourVisibleStem,packet.chart.hour[0]);
 assert.equal(meaning.hourHiddenStem,proof.hiddenRef.split('.').at(-1));
 assert.equal(meaning.elementDirection,expected.direction,
  'the two hour SOURCE stems must decide relation, not a generic reader domain');
 assert.equal(meaning.strictlySymbolic,true);
 assert.equal(meaning.saleApproved,false);
 assert.deepEqual(meaning.sourceRefs,proof.sourceRefs);
 assert(!/(?:반드시 성공|수입이 늘|취업한다|본인이 실제로)/.test(meaning.symbolicQuestion));
 const p={stage:'body',facts:packet,requestedSections:['saju_core'],
  analysisGuidance:{...guide.forRequest(['saju_core'],packet.person?.mbti),
   editorialBlueprint:guide.preflight(packet)}};
 const task=writer.compile(p);
 const first=task.task.chapters.saju_core;
 const t=first.topics.temperament;
 assert.deepEqual(t.sourceOwnedHourPairMeaning,meaning);
 assert(first.coreReaderChoiceContext.writerBoundary.includes(meaning.symbolicQuestion));
 const outputSchema=writer.schema(p,wire.schemaFor(p,reportSchema));
 const slot=outputSchema.properties.chapters.properties.saju_core
  .properties.paragraphs.properties.temperament.anyOf[0];
 assert(slot.properties.text.description.includes(meaning.symbolicQuestion));
 assert.deepEqual(slot.properties.basis.properties.refs.items.enum,proof.sourceRefs);
 assert.equal(precharge.inspect(input).customerSaleApproved,false);
 // A fabricated label or stem must not be accepted as a real source.
 const forged={...source,[proof.hiddenRef]:{...source[proof.hiddenRef],stem:'庚'}};
 assert.throws(()=>pair.build(packet,forged,proof),/PAID_HOUR_PAIR_SOURCE_NOT_VERIFIED/);
 return meaning;
}
let calls=0;const originalFetch=global.fetch;
global.fetch=()=>{calls++;throw Error('WORK80_NETWORK_FORBIDDEN');};
try{
 const money=run({
  calendar:'solar',birthDate:'1982-07-15',birthTime:'02:20',
  gender:'male',mbti:'ISFP',
  readerDecision:'적금을 유지할지 대출을 상환할지 고민입니다.'
 },{pillars:['壬戌','丁未','己亥','乙丑'],direction:'resource'});
 const skill=run({
  calendar:'solar',birthDate:'1982-10-15',birthTime:'02:20',
  gender:'male',mbti:'ISFP',
  readerDecision:'기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.'
 },{pillars:['壬戌','庚戌','辛未','己丑'],direction:'day-controls'});
 assert.notEqual(money.elementDirection,skill.elementDirection);
 assert.notEqual(money.symbolicQuestion,skill.symbolicQuestion);
 const old=require('./qa-next-first-chapter-offline-preflight').SAMPLE;
 const p=facts.build(old,2027);
 const source=Object.fromEntries(bindings.build(p).map(x=>[x.id,x]));
 const oldProof=hour.build(p,source);
 if(oldProof&&oldProof.wholeNatalCategoryDistinct===false){
  assert.equal(pair.build(p,source,oldProof),null);
  const task=writer.compile({stage:'body',facts:p,requestedSections:['saju_core'],
   analysisGuidance:{...guide.forRequest(['saju_core'],p.person.mbti),
    editorialBlueprint:guide.preflight(p)}});
  assert.equal(task.task.chapters.saju_core.topics.temperament
   .sourceOwnedHourPairMeaning,undefined,
  'duplicate-hour legacy QA must not get a falsely new premium relation');
 }
 assert.equal(calls,0);
 console.log('PASS work80 source-bound hour role + two-stem direction varies across actual calculated charts, premium is still unapproved, 0 API/payment');
}finally{global.fetch=originalFetch;}
