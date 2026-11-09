'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const bindings=require('./report-fact-bindings');
const extra=require('./report-paid-core-month-nonmain-exposure');
const capture=require('./report-core-paid-full-prompt-capture').capture;
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const schema=require('./report-schema.json');

const base={calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,
 birthTime:'14:20',gender:'male',mbti:'ISFP'};
const packet=facts.build(base,2027);
assert.equal(packet.status,'ready');
const rows=Object.fromEntries(bindings.build(packet).map(x=>[x.id,x]));
const source={...rows,
 'facts.structuralEvidence.monthCommand':packet.facts.structuralEvidence.monthCommand,
 'facts.stemConnections':packet.facts.stemConnections};
const e=extra.inspect(source);
assert(e,'a genuine extra month-hidden positional observation exists');
assert.equal(e.nonmainSourceId,'natal.month.hidden.癸');
assert.equal(e.mainSourceId,'natal.month.hidden.己');
assert.deepEqual(e.sourceRefs,['natal.month.stem',
 'natal.month.hidden.己','natal.month.hidden.癸']);
assert(e.newEvidence.includes('달의 다른 숨은 글자'));
assert.equal(e.additionalInterpretivePrioritySelected,false);
assert.equal(e.actualTraitObserved,false);
assert.equal(e.sameTraditionalRoleAsVisible,true);
assert.equal(e.distinctTraditionalRole,false);
assert.equal(e.additionalIndependentPaidInterpretation,false);
assert.equal(e.optionalSupportingSourceOnly,true);
assert(e.readerGoal.includes('독립된 유료 통찰')&&e.readerGoal.includes('생략한다'));
assert.equal(e.approvedAsPremiumValue,false);
for(const hour of ['14:20','20:20']){
 const p=facts.build({...base,birthTime:hour},2027);
 const src={...Object.fromEntries(bindings.build(p).map(x=>[x.id,x])),
  'facts.structuralEvidence.monthCommand':p.facts.structuralEvidence.monthCommand,
  'facts.stemConnections':p.facts.stemConnections};
 assert.deepEqual(extra.inspect(src),e,
  'this finding is about the birth MONTH, not a fictional birth-hour difference');
}
const identical=facts.build({calendar:'solar',birthDate:'1994-04-15',
 birthTime:'14:20',gender:'male',mbti:'ISFP'},2027);
const identicalSource={
 ...Object.fromEntries(bindings.build(identical).map(x=>[x.id,x])),
 'facts.structuralEvidence.monthCommand':identical.facts.structuralEvidence.monthCommand,
 'facts.stemConnections':identical.facts.stemConnections};
assert.equal(extra.inspect(identicalSource),null,
 'where visible equals the main hidden, do not invent an exposed nonmain');
const tampered=structuredClone(source);
tampered['natal.month.hidden.癸'].tenGod='정관';
assert.throws(()=>extra.inspect(tampered),/PAID_CORE_NONMAIN_EXPOSURE_FACT_DRIFT/);
const graphChanged=structuredClone(source);
graphChanged['facts.stemConnections'].exposure=[];
assert.throws(()=>extra.inspect(graphChanged),
 /PAID_CORE_NONMAIN_EXPOSURE_GRAPH_UNVERIFIED/);
(async()=>{
 const oldFetch=global.fetch;let network=0;
 global.fetch=()=>{network++;throw Error('NO_NETWORK_FOR_FIRST_CHAPTER_EXTENSION')};
 try{
  const q=await capture(base);
  assert.equal(q.status,'captured-full-paid-composition');
  assert.equal(q.providerCalls,0);
  const payload=writer.compile(q.prompt);
  const chapter=payload.task.chapters.saju_core;
  const strength=chapter.topics.strength;
  const actual=strength.sourceOwnedMonthNonmainExposure;
  assert.deepEqual(actual,e);
  assert(strength.citableFacts.some(r=>r.id===actual.nonmainSourceId));
  assert(strength.citableFacts.some(r=>r.id===actual.mainSourceId));
  assert(!chapter.topics.temperament.sourceOwnedMonthNonmainExposure,
   'seasonal optional paragraph must not duplicate the month observation');
  const strict=writer.schema(q.prompt,wire.schemaFor(q.prompt,schema));
  const detail=strict.properties.chapters.properties.saju_core.properties
   .paragraphs.properties.strength.properties.text.description;
  const refs=strict.properties.chapters.properties.saju_core.properties
   .paragraphs.properties.strength.properties.basis.properties.refs;
  assert(detail.includes(e.readerGoal));
  assert(refs.items.enum.includes(e.nonmainSourceId));
  assert(!/당신은 실제로|부자가 될|무조건 성공/.test(detail));
  assert.equal(network,0);
  console.log('PASS paid core: third exact month source reaches real strict provider schema; distinct from main, hour independent, forged graph rejected, no network or charge');
 }finally{global.fetch=oldFetch}
})().catch(e=>{console.error(e);process.exitCode=1});
