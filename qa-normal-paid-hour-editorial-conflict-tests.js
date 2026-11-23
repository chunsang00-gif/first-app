'use strict';
// Work46: execute the REAL normal paid first-chapter composer, not a mock
// hand-written prompt. The older buyer-neutral request remains unchanged.
// Stop before all provider transport; no billable AI or payment.
const assert=require('node:assert/strict');
const capture=require('./report-core-paid-full-prompt-capture');
const writer=require('./report-generation-request');
const cost=require('./report-adaptive-v1-offline-cost-plan');
const precharge=require('./report-paid-core-precharge-value');
const hour=require('./report-paid-core-hour-extension');
const facts=require('./report-facts-node');
const bindings=require('./report-fact-bindings');
const grid=require('./report-core-knowledge-coverage');
const questions=Object.freeze({
 skill:'기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.',
 money:'적금을 유지할지 대출을 상환할지 고민입니다.',
 pressure:'업무 압박 때문에 마감 일정을 조정할지 업무 요청을 거절할지 고민입니다.'
});
function status(prompt){
 const body=writer.compile(prompt);
 const chapter=body.task?.chapters?.saju_core;
 assert(chapter);
 const context=chapter.coreReaderChoiceContext;
 const source=chapter.topics.temperament.sourceOwnedHourExtension;
 assert(source);
 const high=writer.policyFor(prompt);
 const goal=chapter.analysisGoal,contextRule=context.writerBoundary;
 const interpretive=require('./report-paid-core-hour-editorial-brief');
 const verified=interpretive.build(source,prompt.facts.person.readerDecision);
 assert.equal(verified.readerAngleFromCalculatedHour,true);
 assert.equal(verified.actualBuyerBehaviorObserved,false);
 assert.equal(verified.saleApproved,false);
 assert(verified.verifiedRoleReaderAngle.length>25,
  'real hour role must supply a concrete, differentiated interpretive idea');
 assert(verified.verifiedRoleReaderContrast.length>35,
  'source-owned role must reach the buyer question with a conditional contrast');
 assert(contextRule.includes(verified.verifiedRoleReaderAngle)&&
  contextRule.includes(verified.verifiedRoleReaderContrast),
  'the LIVE model receives the actual calculated interpretation, not only its glossary meaning');
 assert(contextRule.includes('독자 문단에는 전통 분류 이름을 쓰지 말고'),
  'technical ten-god labels belong in cited evidence, not the reader paragraph');
 assert(body.task.editorialGoal?.includes('필수 strength는 태어난 달의 이미 공개된 기본 맥락'),
  'top-level model editorial brief must NOT remain month-only');
 assert(!body.task.editorialGoal.includes('계절의 독립적 해석을 확인할 수 없으면 선택 문단을 null로 둔다'),
  'old optional-season rule must not contradict mandatory hour schema');
 assert(goal.includes('필수 strength는 태어난 달의 이미 공개된 기본 맥락'));
 assert(goal.includes('필수 temperament는 출생시간의 검증된 별도 분류'));
 assert(!goal.includes('계절의 독립적 해석을 확인할 수 없으면 선택 문단을 null로 둔다'),
  'mandatory paid hour slot must not inherit month-season null instruction');
 assert(contextRule.includes('고객 질문은 오직 출생시간 선택 문단(temperament)'));
 assert(contextRule.includes('필수 출생월 문단(strength)에서 이 고민의 양자택일을 미리 답하지 않는다'));
 assert(!contextRule.includes('먼저 이 사람 출생월의 겉글자와 중심 글자'));
 assert(goal.includes('실제 성격')&&contextRule.includes('지어내지 않는다'));
 assert(high.includes('temperament는 실제 출생시간 안쪽 글자의 별도 전통적 분류'));
 assert.equal(context.text,prompt.facts.person.readerDecision);
 assert.equal(source.distinctFromFreeVisibleNatal,true);
 assert.equal(source.premiumValueApproved,false);
 const envelope=cost.envelope(prompt,'gpt-6-luna');
 const wire=JSON.parse(envelope.input[1].content);
 assert.equal(wire.task.chapters.saju_core.analysisGoal,goal);
 assert.equal(wire.task.chapters.saju_core.coreReaderChoiceContext.writerBoundary,
  contextRule);
 assert.equal(envelope.store,false);
 assert.equal(envelope.reasoning.effort,'none');
 assert.equal(envelope.text.format.strict,true);
 const slot=envelope.text.format.schema.properties.chapters
  .properties.saju_core.properties.paragraphs.properties.temperament;
 assert.deepEqual(slot.anyOf.map(v=>v.type),['object'],
  'hour-specific paid paragraph is mandatory after source verification');
 assert.deepEqual(slot.anyOf[0].properties.basis.properties.refs.items.enum,
  source.sourceRefs);
 assert(slot.anyOf[0].properties.text.description.includes(
  '출생시간 분류별 핵심 해석 질문'),
  'strict writer must prioritize the semantic question selected from exact natal role');
 return {domain:source.readerDomain,twoChoice:source.twoBuyerChoicesParsed,
  schemaSourceCount:source.sourceRefs.length,extraModelCalls:0};
}
(async()=>{
 // Six different verified roles must never share one generic interpretation.
 const roleRules=require('./report-paid-core-hour-editorial-brief').READER_ANGLE;
 const expected=hour.DOMAINS;
 for(const [domain,detail] of Object.entries(expected)){
  assert.deepEqual(Object.keys(roleRules[domain]).sort(),detail.roles.slice().sort());
  for(const role of detail.roles){
   const v=roleRules[domain][role];
   assert(v.focus.length>=25&&v.two.length>=35&&v.one.length>=25);
   assert(!/(?:실제로 .*성격|반드시 성공|운명|미래에 .*생긴다)/.test(
    [v.focus,v.two,v.one].join(' ')));
  }
 }
 assert.equal(new Set(Object.values(roleRules).flatMap(x=>
  Object.values(x).map(y=>y.focus))).size,6,
  'different calculated categories cannot all render the same generic glossary');
 const neutral=await capture.capture(require('./qa-current-core-preflight').SAMPLE);
 assert.equal(neutral.status,'captured-full-paid-composition');
 const neutralBody=writer.compile(neutral.prompt);
 assert(neutralBody.task.chapters.saju_core.analysisGoal
  .includes('계절의 독립적 해석을 확인할 수 없으면 선택 문단을 null로 둔다'),
  'historical buyer-neutral scenario must retain exact old instructions');
 assert.equal(neutralBody.task.chapters.saju_core.coreReaderChoiceContext,undefined);
 const results=[];
 // Historical SKILL draft has a genuine hour role, but it repeats
 // YEAR/DAY and therefore cannot be treated as a billable source.
 const standard=cost.qualifiedSample;
 const standardGuard=precharge.inspect(standard);
 assert.equal(standardGuard.eligible,false);
 assert.equal(standardGuard.reason,
  'hour-role-already-in-other-natal-pillar-unreviewed-positional-meaning');
 const c=await capture.capture(standard);
 assert.equal(c.status,'captured-full-paid-composition');
 const main=status(c.prompt);
 assert.equal(main.domain,'skill');
 assert.equal(main.twoChoice,true);
 results.push(main);
 // MONEY/PRESSURE need their own actual source role. Never relabel the
 // learning chart to manufacture another product eligibility.
 for(const domain of ['money','pressure']){
  let picked=null;
  for(const base of grid.representativeInputs()){
   if(!base.birthTime||base.unknownBirthTime===true)continue;
   const input={...base,readerDecision:questions[domain]};
   const p=facts.build(input,2027);
   if(p.status!=='ready')continue;
   const rows=Object.fromEntries(bindings.build(p).map(x=>[x.id,x]));
   if(hour.build(p,rows)?.readerDomain!==domain)continue;
   const technical=precharge.inspect(input);
   if(!technical.eligible)continue;
   picked=input;break;
  }
  assert(picked,'no actual qualified synthetic '+domain+' source');
  const cc=await capture.capture(picked);
  const line=status(cc.prompt);
  assert.equal(line.domain,domain);
  assert.equal(line.twoChoice,true);
  results.push(line);
 }
 // A real single-topic buyer question must not be promoted to two choices.
 const single={...standard,readerDecision:'새로운 기술을 배우고 싶습니다.'};
 const eligibility=precharge.inspect(single);
 if(eligibility.eligible){
  const sc=await capture.capture(single);
  const singleStatus=status(sc.prompt);
  assert.equal(singleStatus.twoChoice,false);
  assert(sc.prompt.facts.person.readerDecision.includes('기술'));
  const boundary=writer.compile(sc.prompt).task.chapters.saju_core
   .coreReaderChoiceContext.writerBoundary;
  assert(boundary.includes('없는 둘째 대안을 발명하지 않는다'));
  results.push(singleStatus);
 }
 console.log('NORMAL_PAID_HOUR_EDITORIAL_SEPARATION='+JSON.stringify({
  normalFirstChapterSourceBoundCases:results,
  allUseRealServerComposer:true,
  oldNeutralRequestUnchanged:true,
  modelGeneratedProseValidated:false,
  humanEditorialReviewApproved:false,
  addedProviderCalls:0,newPaymentEnabled:false,releaseVerdict:'not-approved'
 }));
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
