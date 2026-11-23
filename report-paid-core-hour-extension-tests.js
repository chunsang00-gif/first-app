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
assert(v.readerGoal.includes('현재 일을 유지하는 가정에서는 기존 결과물'),
 'postmortem: current-work option must have a concrete baseline criterion');
assert(v.readerGoal.includes('새 기술을 배우는 가정에서는 작은 연습 결과물'),
 'postmortem: learning option must have a different practice-output criterion');
assert(v.readerGoal.includes('같은 행동을 단어만 바꿔 반복하면 실패'),
 'the original real paid prose repeated the same make/show recommendation');
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
 const tampered=structuredClone(outgoingSchema);
 tampered.properties.chapters.properties.saju_core.properties.paragraphs
  .properties.temperament.anyOf[0].properties.basis.properties
  .refs.items.enum.push('natal.month.stem');
 assert(require('./report-provider-preflight')
  .inspect(captured.prompt,currentPayload,tampered)
  .includes('topic-allowed-citations-drift:saju_core/temperament'),
  'preflight must catch accidental reintroduction of free month sources into the paid hour paragraph');
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
 assert(first.sourceOwnedHourExtension.readerGoal===v.readerGoal,
  'calculated natal-hour reading stays in the actual paid request task');
 assert(opt.properties.text.description.includes('sourceOwnedHourExtension.readerGoal'),
  'strict schema references the already-present goal instead of duplicating it');
 assert(!opt.properties.text.description.includes(v.readerGoal),
  'the provider must not get the long reader goal twice');
 assert.deepEqual(opt.properties.basis.properties.refs.items.enum,v.sourceRefs,
  'strict outgoing first-chapter hour paragraph must NOT allow month/season sources');
 const older=await capture(input);
 assert.equal(older.providerCalls,0);
 const old=writer.compile(older.prompt);
 assert(!old.task.chapters.saju_core.topics.temperament.sourceOwnedHourExtension);
 assert(!old.source['natal.hour.hidden.丁']);
 assert(writer.editorialGoalFor(older.prompt).includes('계절의 독립적 해석을 확인할 수 없으면'),
   'without a supported hour extension the core goal must keep the optional seasonal paragraph nullable');
 const oldSchema=writer.schema(older.prompt,wire.schemaFor(older.prompt,schema));
 assert(oldSchema.properties.chapters.properties.saju_core.properties
  .paragraphs.properties.temperament.anyOf.some(x=>x.type==='null'));
 console.log('PASS: buyer skill question adds independently calculated birth-hour output symbol to actual optional paid writer slot, no provider call');
})().catch(e=>{console.error(e);process.exitCode=1});
