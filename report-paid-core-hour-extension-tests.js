'use strict';
const assert=require('node:assert/strict'),facts=require('./report-facts-node');
const refs=require('./report-fact-bindings');
const ext=require('./report-paid-core-hour-extension');
const capture=require('./report-core-paid-full-prompt-capture').capture;
const writer=require('./report-generation-request');
const wire=require('./report-wire'),schema=require('./report-schema.json');
const input={calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,
 birthTime:'14:20',gender:'male',mbti:'ISFP'};
const q='기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.';
const packet=facts.build({...input,readerDecision:q},2027);
const source=Object.fromEntries(refs.build(packet).map(x=>[x.id,x]));
const v=ext.build(packet,source);
assert(v&&v.kind==='buyer-choice-hour-symbolic-extension-v1');
assert.deepEqual(v.sourceRefs,['natal.hour.stem','natal.hour.hidden.丁']);
assert.equal(v.hourHiddenRole,'식신');
assert.equal(v.premiumValueApproved,false);
assert.equal(v.chosenHiddenStemIsGoverning,false);
assert.equal(v.realOutcomePredicted,false);
assert.equal(ext.build(facts.build(input,2027),source),null);
assert.equal(ext.build(facts.build({...input,readerDecision:'집을 살지 임차할지'},2027),source),null);
const swapped=structuredClone(source);swapped['natal.hour.hidden.丁'].tenGod='편재';
assert.throws(()=>ext.build(packet,swapped),/CORE_HOUR_ADDITION_SOURCE_DRIFT/);
(async()=>{
 const captured=await capture({...input,readerDecision:q});
 assert.equal(captured.status,'captured-full-paid-composition');
 assert.equal(captured.providerCalls,0);
 const newGoal=writer.editorialGoalFor(captured.prompt);
 assert(newGoal.includes('선택 문단은 출생월의 계절 풀이 대신'));
 assert(newGoal.includes(v.hourHiddenRole));
 assert(!newGoal.includes('계절 보충 문단은 핵심 풀이'));
 const currentPayload=writer.compile(captured.prompt);
 assert.equal(currentPayload.task.editorialGoal,newGoal);
 const outgoingSchema=writer.schema(captured.prompt,wire.schemaFor(captured.prompt,schema));
 assert.deepEqual(require('./report-provider-preflight')
  .inspect(captured.prompt,currentPayload,outgoingSchema),[]);
 const payload=writer.compile(captured.prompt);
 const first=payload.task.chapters.saju_core.topics.temperament;
 assert.deepEqual(first.sourceOwnedHourExtension,v);
 for(const id of v.sourceRefs){
  assert(first.citableFacts.some(row=>row.id===id));
  assert(payload.source[id]);
 }
 assert(v.sourceRefs.every(id=>!payload.task.chapters.saju_core.topics.strength.citableFacts.some(x=>x.id===id)));
 const doc=writer.schema(captured.prompt,wire.schemaFor(captured.prompt,schema));
 const leaf=doc.properties.chapters.properties.saju_core.properties.paragraphs.properties.temperament;
 const opt=leaf.anyOf?.find(v=>v.type==='object')||leaf;
 assert.equal(leaf.anyOf.length,1,
  'buyer-triggered hour meaning must be present in paid first chapter');
 assert(!leaf.anyOf.some(x=>x.type==='null'));
 assert(opt.properties.text.description.includes(v.readerGoal));
 assert(v.sourceRefs.every(id=>opt.properties.basis.properties.refs.items.enum.includes(id)));
 const older=await capture(input);
 assert.equal(older.providerCalls,0);
 const old=writer.compile(older.prompt);
 assert(!old.task.chapters.saju_core.topics.temperament.sourceOwnedHourExtension);
 assert(!old.source['natal.hour.hidden.丁']);
 assert(writer.editorialGoalFor(older.prompt).includes('계절 보충 문단은 핵심 풀이'));
 const oldSchema=writer.schema(older.prompt,wire.schemaFor(older.prompt,schema));
 assert(oldSchema.properties.chapters.properties.saju_core.properties
  .paragraphs.properties.temperament.anyOf.some(x=>x.type==='null'));
 console.log('PASS: buyer skill question adds independently calculated birth-hour output symbol to actual optional paid writer slot, no provider call');
})().catch(e=>{console.error(e);process.exitCode=1});
