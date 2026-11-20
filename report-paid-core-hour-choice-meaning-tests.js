'use strict';
// REAL computed natal sources + real first-batch strict writer schema.
// Synthetic sentences test mechanical rejection, NOT paid manuscript quality.
// Nothing contacts OpenAI, a merchant, or production.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const guidance=require('./report-analysis-guidance');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const schema=require('./report-schema.json');
const audit=require('./report-paid-core-hour-choice-meaning');
const server=require('./report-server-contract');
const input=require('./qa-next-first-chapter-offline-preflight').SAMPLE;
const packet=facts.build(input,2027);
const source=Object.fromEntries(require('./report-fact-bindings')
 .build(packet).map(x=>[x.id,x]));
const proof=require('./report-paid-core-hour-extension').build(packet,source);
assert.equal(proof?.readerDomain,'skill');
assert.equal(proof?.hourHiddenRole,'식신');
assert.equal(proof?.distinctFromFreeVisibleNatal,true);
const plan=guidance.preflight(packet);
const prompt={stage:'body',facts:packet,requestedSections:['saju_core'],
 analysisGuidance:{...guidance.forRequest(['saju_core'],packet.person.mbti),
  editorialBlueprint:{saju_core:plan.saju_core}}};
const compiled=writer.compile(prompt);
const strict=writer.schema(prompt,wire.schemaFor(prompt,schema));
const topic=compiled.task.chapters.saju_core.topics.temperament;
assert.deepEqual(topic.sourceOwnedHourExtension,proof);
const slot=strict.properties.chapters.properties.saju_core
 .properties.paragraphs.properties.temperament;
assert.equal(slot.anyOf.length,1);
assert(slot.anyOf[0].properties.text.description.includes(
 audit.taskFor(proof).writer),
 'the ACTUAL first paid provider schema must make both buyer alternatives apply hour-specific meaning');
let calls=0;const orig=global.fetch;
global.fetch=()=>{calls++;throw Error('PAID_PROVIDER_NETWORK_FORBIDDEN')};
const make=hour=>[{id:'saju_core',
 bodyTopics:['temperament','strength'],
 body:[hour,'태어난 달의 분류는 정보를 이해하고 자원을 살펴보는 전통적 질문입니다.'],
 evidence:[...proof.sourceRefs,'natal.month.stem']}];
const q=input.readerDecision;
const good='태어난 시간의 숨은 글자는 익힌 내용을 결과물로 마무리하는 전통적인 질문입니다. '+
 '현재 일을 유지할 경우 기존 결과물의 납기와 검수 기준이 유지되는지 확인합니다. '+
 '새 기술을 배울 경우 연습 결과물의 완성 기준과 연습 기간을 확인합니다.';
const onlyIntro='태어난 시간의 숨은 글자는 익힌 내용을 결과물로 마무리하는 전통적인 질문입니다. '+
 '현재 일을 유지할 경우 무엇을 할지 필요한 비용과 자료를 확인해야 합니다. '+
 '새 기술을 배울 경우 필요한 비용과 시간부터 확인해야 합니다.';
const sameCheck='태어난 시간의 숨은 글자는 익힌 것을 결과물로 만드는 전통적 질문입니다. '+
 '현재 일을 유지할 경우 결과물의 완성 기준을 살펴봅니다. '+
 '새 기술을 배울 경우 결과물의 완성 기준을 다시 살펴봅니다.';
const differentOnlyAtIntro='태어난 시간의 숨은 글자는 결과물로 마무리하는 질문입니다. '+
 '현재 일을 유지할 경우 기존 결과물을 검수할 때 필요한 기준을 기록합니다. '+
 '새 기술을 배울 경우 연습 비용과 일정을 확인합니다.';
try{
 assert.deepEqual(audit.inspectParagraph(good,q,proof),[]);
 assert.deepEqual(server.earlyPaidCoreHourMeaningProblems(make(good),packet),[]);
 for(const [text,code] of [
  [onlyIntro,'buyer-first-option-lacks-hour-role-meaning'],
  [sameCheck,'buyer-hour-role-choices-have-no-distinct-checks'],
  [differentOnlyAtIntro,'buyer-second-option-lacks-hour-role-meaning']
 ]){
  const issues=audit.inspectParagraph(text,q,proof);
  assert(issues.includes(code),JSON.stringify({issues,code}));
  assert(server.earlyPaidCoreHourMeaningProblems(make(text),packet)
   .includes('saju_core:'+code),
   'do not buy second batch for an hour-introduction plus generic buyer answer');
 }
 assert.deepEqual(server.earlyPaidCoreHourMeaningProblems(
   make('태어난 달의 풀이입니다.'),facts.build({...input,readerDecision:undefined},2027)),[],
  'do not impose buyer-choice contract on customer who gave no question');
 assert(audit.inspectParagraph('고객이 한 가지만 질문했습니다.',
  '새로운 기술을 배우고 싶습니다.',proof)
  .includes('buyer-single-concern-not-grounded-in-hour-role'),
  'single-question report must NOT silently pass when the buyer concern was ignored');
 assert.equal(calls,0);
 console.log('PASS real first-chapter writer requires the new hour role in EACH buyer option and different checks, rejects generic advice before additional paid calls; 0 API/payment');
}finally{global.fetch=orig}
