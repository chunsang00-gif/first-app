'use strict';
// Work37: test the ACTUAL first paid writer prompt and exact permitted
// month sources over three different charts. Do not fabricate paid prose.
const assert=require('node:assert/strict');
const capture=require('./report-core-paid-full-prompt-capture').capture;
const samples=require('./report-qa35-three-profile-reader-review').CASES;
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const baseSchema=require('./report-schema.json');
const chartQuestions=require('./report-chart-contrast');
const season=require('./report-seasonal-evidence');
const directionalQuestion=require('./report-paid-core-reader-value-plan').directionalQuestion;
const previous=global.fetch;
let networkAttempts=0;
global.fetch=()=>{networkAttempts++;throw Error('QA37_NETWORK_PROHIBITED')};
(async()=>{
 const results=[],scripts=new Set(),pairs=new Set();
 for(const input of samples){
  const request=await capture(input);
  assert.equal(request.status,'captured-full-paid-composition');
  assert.equal(request.providerCalls,0);
  assert.notEqual(request.prompt.paidCoreDepthV2,true);
  assert.equal(request.prompt.qaNatalDepthPreview,undefined);
  const packet=request.prompt.facts,month=packet.facts.tenGods.month;
  const main=packet.facts.structuralEvidence.monthCommand.mainHiddenStem;
  const hidden=month.hiddenStems.find(row=>row.stem===main);
  assert(hidden,'exact calendar main month source missing');
  const compiled=writer.compile(request.prompt);
  const topic=compiled.task.chapters.saju_core.topics.strength;
  const plan=topic.sourceOwnedCoreReaderValue;
  assert.equal(plan.kind,'grounded-paid-core-reader-takeaway-v1');
  assert.equal(plan.topic,'saju_core.strength');
  assert.deepEqual(plan.refs,['natal.month.stem','natal.month.hidden.'+main]);
  assert.deepEqual(plan.refs.every(id=>topic.citableFacts.some(row=>row.id===id)),true);
  assert.equal(plan.twoSidedScope.visibleRole,month.stemTenGod);
  assert.equal(plan.twoSidedScope.mainRole,hidden.tenGod);
  assert.equal(plan.twoSidedScope.visibleQuestion,
   chartQuestions.monthDecisionQuestion(month.stemTenGod));
  assert.equal(plan.twoSidedScope.centralQuestion,
   chartQuestions.monthDecisionQuestion(hidden.tenGod));
  assert.equal(plan.sameClassification,month.stemTenGod===hidden.tenGod);
  const expectedDirection=season.relation(season.ELEMENTS[hidden.stem],
   season.ELEMENTS[month.stem]);
  assert.equal(plan.twoSidedScope.elementDirection,expectedDirection);
  assert.equal(plan.twoSidedScope.sameQuestion,plan.sameClassification);
  const directional=directionalQuestion(expectedDirection,
   plan.twoSidedScope.visibleQuestion,plan.twoSidedScope.centralQuestion);
  assert.equal(plan.directionalReadingQuestion,directional);
  assert.equal(plan.twoSidedScope.directionalReadingQuestion,directional);
  assert(plan.script.includes('이 명식의 실제 질문: '+plan.actualTwoSidedReading));
  assert(!plan.script.includes('첫 질문만 답하면 무엇이 빠지고'));
  assert.equal(plan.twoSidedScope.mirrorAdviceRequired,false);
  assert.equal(Object.hasOwn(plan.twoSidedScope,'ifOnlyVisible'),false);
  assert.equal(Object.hasOwn(plan.twoSidedScope,'ifOnlyMain'),false);
  assert.equal(plan.actualElementRelationIsSymbolicOnly,true);
  assert.equal(plan.conditionalScenarioNotObserved,true);
  assert(!/성격이 원래|실제로 도움을 받았|제약을 경험했다/.test(directional));
  assert.equal(plan.twoSidedScope.canAssertObservedBehavior,false);
  assert.equal(plan.twoSidedScope.canRankWhichRoleDominates,false);
  assert.equal(plan.notAnAdditionalPaidParagraph,true);
  assert.equal(plan.freePreviewCopyDisallowed,true);
  assert(plan.actualTwoSidedReading.includes(plan.twoSidedScope.centralQuestion));
  assert(plan.actualTwoSidedReading.includes(plan.twoSidedScope.visibleQuestion));
  assert(!plan.actualTwoSidedReading.includes('겉자리만 읽으면'));
  assert(!plan.actualTwoSidedReading.includes('달 중심만 읽으면'));
  assert(plan.script.includes(plan.actualTwoSidedReading));
  assert(plan.script.includes(plan.monthVisibleTraditionalMeaning));
  assert(plan.script.includes(plan.monthMainTraditionalMeaning));
  assert(plan.actualElementRelation.length>7);
  assert(!/(?:고객님은 반드시|당신은 원래|승진합니다|소득이 늘어납니다)/.test(plan.script));
  const schema=writer.schema(request.prompt,wire.schemaFor(request.prompt,baseSchema));
  const words=schema.properties.chapters.properties.saju_core.properties
   .paragraphs.properties.strength.properties.text.description;
  assert(words.includes(plan.script),
   'the REAL paid model JSON schema must transport the source-owned reader distinction');
  scripts.add(plan.actualTwoSidedReading);
  pairs.add([month.stemTenGod,hidden.tenGod].join('/'));
  results.push({id:input.id,monthVisible:month.stemTenGod,
   monthCentral:hidden.tenGod,direction:expectedDirection,
   distinctiveDirectionalReading:true});
 }
 assert.equal(results.length,3);
 assert.equal(pairs.size,3,'three birth charts should have different verified month pairs');
 assert.equal(scripts.size,3,'the real paid first-chapter writer must vary the factual explanation');
 // Cover all five mathematically verified arrow types, including equal
 // elements, without making up another paid paragraph or a personal fact.
 const distinct=new Set();
 const samplesByDirection={
  resource:'달의 중심 쪽',output:'겉쪽',
  'control-on-day':'달 중심의','day-controls':'달 겉의',
  'same-element':'두 위치의 오행이 같을 때'
 };
 for(const [direction,anchor] of Object.entries(samplesByDirection)){
  const copy=directionalQuestion(direction,'겉쪽의 실제 질문','중심의 실제 질문');
  assert(copy.includes(anchor),'direction-specific source ordering: '+direction);
  assert(copy.includes('겉쪽의 실제 질문')||copy.includes('겉의 실제 질문')||
   copy.includes('겉쪽의 실제 질문'));
  assert(copy.includes('중심의 실제 질문'));
  distinct.add(copy);
 }
 assert.equal(distinct.size,5,'five arrow meanings must not collapse to one generic instruction');
 assert.throws(()=>directionalQuestion('invented','a','b'),
  /PAID_CORE_UNKNOWN_VERIFIED_ELEMENT_RELATION/);
 const hourChanged={...samples[0],birthTime:'20:20'};
 const first=(await capture(samples[0])).prompt;
 const late=(await capture(hourChanged)).prompt;
 assert.notDeepEqual(first.facts.chart,late.facts.chart,
  'the two hours must remain factually different charts');
 const firstPlan=writer.compile(first).task.chapters.saju_core.topics.strength
  .sourceOwnedCoreReaderValue;
 const latePlan=writer.compile(late).task.chapters.saju_core.topics.strength
  .sourceOwnedCoreReaderValue;
 assert.deepEqual(firstPlan.twoSidedScope,latePlan.twoSidedScope,
  'changing the birth hour cannot invent a new MONTH-only reader comparison');
 assert.equal(firstPlan.actualTwoSidedReading,latePlan.actualTwoSidedReading);
 assert.equal(firstPlan.directionalReadingQuestion,latePlan.directionalReadingQuestion);
 assert.equal(networkAttempts,0);
 console.log('QA37_PAID_CORE_REAL_PROMPT='+JSON.stringify({
  testedBirthCharts:results.length,distinctSourceOwnedReadings:scripts.size,
  distinctVerifiedElementDirectionPrompts:5,
  hourChangeCorrectlyMonthStable:true,actualLivePaidPromptSchemaChecked:true,
  paidProviderRequests:0,operatingDeployment:false,humanReviewApproved:false,
  cases:results
 }));
 console.log('PASS three chart-owned asymmetric month relations in real paid first-batch prompt; no provider calls');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{
 global.fetch=previous;
});
