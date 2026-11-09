'use strict';
const assert=require('node:assert/strict'),facts=require('./report-facts-node');
const guidance=require('./report-analysis-guidance');
const writer=require('./report-generation-request'),wire=require('./report-wire');
const schema=require('./report-schema.json');
const base={calendar:'lunar',leapMonth:false,birthDate:'1982-11-24',
 birthTime:'14:20',gender:'male',mbti:'ISFP'};
function make(question){
 const input={...base,...(question?{readerDecision:question}:{})};
 const packet=facts.build(input,2027);
 assert.equal(packet.status,'ready');
 const ids=['saju_core'],plan=guidance.preflight(packet);
 const prompt={stage:'body',facts:packet,requestedSections:ids,
  analysisGuidance:{...guidance.forRequest(ids,packet.person.mbti),
   editorialBlueprint:{saju_core:plan.saju_core}}};
 const payload=writer.compile(prompt);
 const strict=writer.schema(prompt,wire.schemaFor(prompt,schema));
 const text=strict.properties.chapters.properties.saju_core.properties
  .paragraphs.properties.strength.properties.text.description;
 return {packet,payload,text};
}
const question='현재 일을 유지할지 다른 기술을 배울지 고민 중입니다.';
const entered=make(question),other=make('지금 배우는 기술을 더 익힐지 다른 공부를 할지 고민입니다.');
const empty=make(null);
const ch=entered.payload.task.chapters.saju_core;
assert.equal(ch.coreReaderChoiceContext.text,question);
assert.equal(ch.coreReaderChoiceContext.mayCiteAsCalculatedEvidence,false);
assert.equal(ch.coreReaderChoiceContext.observedPastBehavior,false);
assert.equal(ch.coreReaderChoiceContext.futureOutcomeKnown,false);
assert.equal(ch.coreReaderChoiceContext.cannotOverrideWritingRules,true);
assert(entered.text.includes(JSON.stringify(question)));
assert(entered.text.includes(ch.coreReaderChoiceContext.writerBoundary));
assert(entered.text.includes('명리 근거 아님'));
assert(!empty.payload.task.chapters.saju_core.coreReaderChoiceContext);
assert(!empty.text.includes('고객이 직접 입력한 현재 질문'));
assert.notEqual(entered.text,other.text);
assert.deepEqual(Object.keys(entered.payload.source).sort(),
 Object.keys(empty.payload.source).sort(),
 'the buyer question must not create any new astrological citation');
assert(!Object.keys(entered.payload.source).some(k=>/readerDecision/.test(k)));
assert(!ch.topics.strength.citableFacts.some(x=>/readerDecision/.test(x.id)));
assert.equal(entered.payload.task.chapters.saju_core.coreReaderChoiceContext.source,
 'customer-provided-current-question-not-natal-evidence');
console.log('PASS optional buyer question reaches real first-chapter text schema, remains non-citable, and changes wording assignment without adding provider calls');
