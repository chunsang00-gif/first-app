'use strict';
// Actual production first-body prompt and strict Responses schema, captured
// BEFORE model transport with the real offline natal calculator. The paid
// reader must not receive irreconcilable MONTH and HOUR instructions for the
// same temperament field. This is prompt quality, not reader-value approval.
const assert=require('node:assert/strict');
const capture=require('./report-core-paid-full-prompt-capture').capture;
const qa=require('./qa-next-first-chapter-offline-preflight');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const schema=require('./report-schema.json');
const free=require('./report-reading-sample');
const data=require('./report-facts-node');
const forbidden=()=>{
 throw Error('PAID_HOUR_WRITER_POLICY_NETWORK_FORBIDDEN');
};
const oldFetch=global.fetch;
let requests=0;
global.fetch=(...args)=>{requests++;return forbidden(...args)};
(async()=>{
 try{
  const original=qa.SAMPLE;
  const captured=await capture(original);
  assert.equal(captured.status,'captured-full-paid-composition');
  assert.equal(captured.providerCalls,0);
  const prompt=captured.prompt;
  const policy=writer.policyFor(prompt);
  const payload=writer.compile(prompt);
  const p=writer.schema(prompt,wire.schemaFor(prompt,schema));
  const core=payload.task.chapters.saju_core;
  const hour=core.topics.temperament.sourceOwnedHourExtension;
  assert.equal(hour.kind,'buyer-choice-hour-symbolic-extension-v1');
  assert.equal(hour.distinctFromFreeVisibleNatal,true);
  assert.equal(hour.twoBuyerChoicesParsed,true);
  assert(policy.includes(hour.hiddenRef));
  assert(policy.includes('이 명식의 선택 문단 temperament는 실제 출생시간'));
  assert(!policy.includes('temperament에서는 facts.seasonalEvidence와 facts.qiEvidence를 근거로 출생월'),
   'the TOP-LEVEL instructions must never tell a source-owned hour paragraph to repeat free month season');
  assert(!policy.includes('temperament는 출생 계절·겉글자 관계에서 독립적인 추가 해석이 확인될 때만'),
   'obsolete season-writing brief still contaminates the paid hour paragraph');
  const fields=p.properties.chapters.properties.saju_core.properties.paragraphs.properties;
  assert.equal(fields.temperament.anyOf.length,1);
  const hourText=fields.temperament.anyOf[0].properties.text.description;
  const monthText=fields.strength.properties.text.description;
  assert(core.topics.temperament.sourceOwnedHourExtension.readerGoal===hour.readerGoal,
   'the live task keeps exactly the one verified hour-role meaning');
  assert(hourText.includes('sourceOwnedHourExtension.readerGoal'),
   'schema refers to the task rather than duplicating a full hour-goal paragraph');
  assert(hourText.includes('출생시간'));
  assert(hourText.includes('이미 고객에게 무료 공개된 실제 본문'));
  assert(monthText.includes('이미 고객에게 공개한 출생월 기본 풀이의 복습'));
  assert(monthText.includes('alreadyPublicFreeReading.cards'));
  assert(monthText.includes('sourceOwnedCoreReaderValue.script의 월별 해석 확대·가상 사례 작성 지시는 이 무료 복습 문단에 적용하지 않는다'),
   'the same FIRST PAID paragraph must not be told to produce NEW month insight');
  assert(!monthText.includes('이 필수 본문은 task.chapters.saju_core.topics.strength.sourceOwnedCoreReaderValue.script을 따른다'),
   'base month script and explicit FREE-recap-only writer must not give opposite orders');
  assert(!monthText.includes('고객이 직접 입력한 현재 질문(명리 근거 아님)'));
  assert(!monthText.includes(original.readerDecision),
   'the buyer decision belongs ONLY to the NEW hour explanation, not the free month paraphrase');
  assert(core.coreReaderChoiceContext.writerBoundary.includes('추가 문단은 temperament이며'));
  assert(!core.coreReaderChoiceContext.writerBoundary.includes('고객의 질문에서 각각 어떤 점을'));
  const freeChart=free.build(data.build(original,2027));
  assert.equal(freeChart.modelCalls,0);
  assert.equal(freeChart.completedPremiumParagraphs,0);
  const noQuestion=await capture({
   calendar:original.calendar,birthDate:original.birthDate,
   birthTime:original.birthTime,leapMonth:original.leapMonth,
   gender:original.gender,mbti:original.mbti
  });
  assert.equal(noQuestion.providerCalls,0);
  assert.equal(noQuestion.status,'captured-full-paid-composition');
  const older=writer.policyFor(noQuestion.prompt);
  assert(older.includes('temperament에서는 facts.seasonalEvidence와 facts.qiEvidence를 근거로 출생월'));
  assert(!older.includes('이 명식의 선택 문단 temperament는 실제 출생시간'));
  assert.equal(writer.compile(noQuestion.prompt).task.chapters.saju_core
   .topics.temperament.sourceOwnedHourExtension,undefined);
  const oldSchema=writer.schema(noQuestion.prompt,wire.schemaFor(noQuestion.prompt,schema));
  assert(oldSchema.properties.chapters.properties.saju_core.properties
   .paragraphs.properties.temperament.anyOf.some(x=>x.type==='null'));
  assert.equal(requests,0);
  console.log('PASS REAL source-owned paid first chapter sends ONE hour-focused policy, confines free month to strength, does not leak buyer dilemma there, preserves non-hour policy; 0 API');
 }finally{global.fetch=oldFetch}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
