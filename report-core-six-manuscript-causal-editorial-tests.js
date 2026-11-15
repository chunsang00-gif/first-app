'use strict';
// The six EXACT author-reviewed-for-editing four-pillar scenarios: not
// professionally verified traditional interpretations and not releaseable.
// This test binds reader statements to real computed source roles AND to a
// distinct, conditional real-world example, downside and suggested action.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const core=require('./report-core-knowledge-engine');
const kb=require('./report-core-knowledge.json');
const binding=require('./report-fact-bindings');
const policy=require('./report-reader-policy');
const {assess}=require('./report-core-paid-natal-qa-value-delta');
const synthesis=require('./report-core-four-pillar-synthesis');
const monthMethod=require('./report-core-paid-natal-month-method-review');
const cases=[
 {birthDate:'1982-11-24',calendar:'lunar',birthTime:'14:20',
  id:'full-four-pillars-chukmi-day-hour-roots-v1',
  scene:'기존 작업 지침',year:'알려진 설명',month:'낯선 내용',
  hour:'낯선 내용',benefit:'확인된 기준',risk:'기존 지침만 고수',
  action:'시험할 한 가지 변경점',limit:'실제 행동'},
 {birthDate:'1982-11-24',calendar:'lunar',birthTime:'20:20',
  id:'full-four-pillars-chukmi-day-root-hour-expression-v1',
  scene:'작업 절차를 동료에게 인계',year:'이미 알려진 설명',
  month:'낯선 내용',hour:'말이나 결과물',
  benefit:'기존 안내에서 유지할 부분',risk:'설명을 생략',
  action:'작업 순서 세 가지',limit:'실제 설명 능력'},
 {birthDate:'1988-12-15',calendar:'solar',birthTime:'14:20',
  id:'full-1988-12-15-year-day-punishment-hour-duty-v1',
  scene:'설비 점검 업무',year:'자원과 비용',month:'각자 맡을 일',
  hour:'책임과 규칙',benefit:'담당자와 승인자를 구별',
  risk:'승인 기준을 빼놓',action:'최종 확인 기준',limit:'실제 다툼'},
 {birthDate:'1988-12-15',calendar:'solar',birthTime:'20:20',
  id:'full-1988-12-15-year-hour-clash-peer-v1',
  scene:'공동으로 자재를 관리',year:'자원과 비용',month:'역할',
  hour:'달과 시간',benefit:'업무를 모두가 맡았다고 생각',
  risk:'지나치게 세분화',action:'기록 담당',limit:'갈등이 생긴다'},
 {birthDate:'1994-08-15',calendar:'solar',birthTime:'14:20',
  id:'full-1994-08-15-month-root-hour-duty-v1',
  scene:'긴급 변경 요청',year:'새로운 제안',month:'나눌 몫',
  hour:'책임',benefit:'누가 변경을 승인',risk:'요청을 모두 받아들이',
  action:'추가로 쓸 자원',limit:'돌발 사건'},
 {birthDate:'1994-08-15',calendar:'solar',birthTime:'20:20',
  id:'full-1994-08-15-month-root-hour-sharing-v1',
  scene:'새로운 작업 방식을 시험',year:'달리 표현',month:'함께 쓰는 몫',
  hour:'달과 시간',benefit:'아이디어의 목적',risk:'업무량의 차이',
  action:'결과를 확인할 날짜',limit:'성공의 증거'}
];
const observations=[];
for(const example of cases){
 const packet=facts.build({
  calendar:example.calendar,birthDate:example.birthDate,
  birthTime:example.birthTime,leapMonth:false,
  gender:'male',mbti:'ISFP'},2027);
 assert.equal(packet.status,'ready');
 const draft=core.compile(packet);
 const rule=kb.fullChartRules.find(x=>x.id===example.id);
 assert(rule);
 assert.equal(draft.review.fourPillar?.ruleId,example.id);
 assert.equal(draft.releaseVerdict,'not-approved');
 assert.equal(draft.apiCalls,0);
 assert.equal(draft.review.humanReviewRequired,true);
 const author=draft.reader.paragraphs.fourPillar;
 const attribution=draft.review.fourPillar.readerAttribution;
 const priorities=draft.review.fourPillar.methodPriorityReview;
 const independent=monthMethod.assess(packet);
 assert.equal(priorities.kind,'qa-unselected-natal-method-priority-v1');
 assert.equal(priorities.priorityVerdict,'not-established');
 assert.equal(priorities.selectedTraditionalMethod,null);
 assert.equal(priorities.activeQiVerified,false);
 assert.equal(priorities.professionalTraditionalMethodApproved,false);
 assert.equal(priorities.possibleReaderBenefitVerified,false);
 assert.equal(priorities.scenarioOrderingStatus,
  'hypothetical-workflow-not-deduced-from-chart');
 assert.equal(priorities.branchRelationPriority,'not-assessed');
 assert.equal(priorities.releaseVerdict,'not-approved');
 assert.equal(independent.status,'method-priority-not-selected');
 assert.equal(independent.adoptedMethodId,null);
 assert.equal(priorities.currentMonthMainSourceId,
  independent.observed.mainHiddenStemSourceId);
 assert.deepEqual(priorities.alternativeCandidateRefs,
  independent.methodCandidates.map(m=>({
   id:m.id,sourceIds:m.rowIds.slice(),status:m.status,
   priority:m.interpretivePriority
  })));
 assert.deepEqual(priorities.dayMasterOnlyExposedHiddenStemIds,
  independent.observed.exactExposureScopeComparison
   .dayMasterOnlyExposedHiddenStemIds);
 assert.deepEqual(priorities.nonDayExposedHiddenStemIds,
  independent.observed.exactExposureScopeComparison
   .nonDayExposedHiddenStemIds);
 const relations=independent.observed.natalRelationsTouchingMonth.relationshipCardinality;
 assert.equal(priorities.independentMonthBranchContacts,
  relations.independentPairContactCount);
 assert.equal(priorities.monthBranchTableEntries,relations.pairTableEntryCount);
 assert.equal(priorities.monthBranchGroupEntries,relations.completeGroupEntryCount);
 assert(priorities.alternativeCandidateRefs.every(x=>x.priority==='not-assessed'));
 assert.equal(attribution.kind,'qa-reader-attribution-ledger-v1');
 assert.equal(attribution.sourceClaims.length,4);
 assert.equal(attribution.priority,'not-approved-for-full-chart-causal-order');
 assert.equal(attribution.paidReaderValueApproved,false);
 assert.equal(attribution.observedPersonality,false);
 assert.equal(attribution.example.class,'hypothetical-editorial-application');
 assert.equal(attribution.example.computedConsequence,false);
 assert.equal(attribution.example.verifiedUserSituation,false);
 assert.equal(attribution.example.domainFitEstablished,false);
 assert(author.text.includes(attribution.example.readerSpan));
 const expected=[
  ['natal.year.stem',rule.yearGod],['natal.month.stem',rule.monthGod],
  ['natal.month.hidden.'+require('./report-seasonal-evidence')
   .HIDDEN[packet.chart.month[1]][0],rule.hiddenGod],
  ['natal.hour.stem',rule.hourGod]
 ];
 for(let i=0;i<expected.length;i++){
  const claim=attribution.sourceClaims[i];
  assert.equal(claim.sourceId,expected[i][0]);
  assert.equal(claim.calculatedRole,expected[i][1]);
  assert(author.text.includes(claim.readerSpan));
  assert(draft.review.fourPillar.sourceRefs.includes(claim.sourceId));
 }

 const text=author.text,ref=draft.review.fourPillar.sourceRefs;
 assert.equal(author.text,rule.reader.text);
 assert(text.length>=490&&text.length<=760);
 assert.deepEqual(policy.errors([author.label,text]),[]);
 assert(!/[?？]\s*$/.test(text));
 assert(!/(?:반드시 성공|합격할 운|당신의 실제 성격|미래를 예측할 수 있습니다)/.test(text));
 for(const [type,needle] of Object.entries({
  scenario:example.scene,year:example.year,month:example.month,
  hour:example.hour,conditionalBenefit:example.benefit,
  contraryCondition:example.risk,specificAction:example.action,
  explicitLimits:example.limit
 }))assert(text.includes(needle),example.id+': missing '+type+' ('+needle+')');
 const scene=text.indexOf(example.scene);
 const upside=text.indexOf(example.benefit);
 const downside=text.indexOf(example.risk);
 const action=text.indexOf(example.action);
 assert(scene>=0&&upside>scene&&downside>upside&&action>downside,
  example.id+': evidence must lead to situation then potential benefit, downside and action');
 const indexed=Object.fromEntries(binding.build(packet).map(row=>[row.id,row]));
 for(const id of ['natal.year.stem','natal.month.stem',
  'natal.hour.stem','facts.stemConnections','facts.natalBranchRelations']){
  assert(ref.includes(id),example.id+': missing verifiable source '+id);
  if(id.startsWith('natal.')){
   assert.equal(indexed[id].observedBehavior,false);
   assert.equal(indexed[id].interpretationScope,'traditional-symbol-only');
  }
 }
 assert.equal(indexed['natal.year.stem'].tenGod,rule.yearGod);
 assert.equal(indexed['natal.month.stem'].tenGod,rule.monthGod);
 assert.equal(indexed['natal.hour.stem'].tenGod,rule.hourGod);
 assert.equal(draft.review.fourPillar.matched.dayRootExpected,
  rule.dayRootExpected??true);
 assert.equal(draft.review.fourPillar.matched.hourRootExpected,rule.hourRootExpected);
 const delta=assess(packet,draft,draft.review.fourPillar,'authored');
 assert.equal(delta.selectedDraftKind,'authored');
 assert.equal(delta.traditionalMethodApproved,false);
 assert.equal(delta.benefitBeyondFreeVerified,false);
 assert.equal(delta.personalInsightValidated,false);
 assert.equal(delta.releaseVerdict,'not-approved');
 observations.push({id:example.id,scene:example.scene,chars:text.length,
  monthSimilarity:delta.textOverlap8gram,
  repeatedMonthSentences:delta.exactlyRepeatedLongSentences,
  sourceRefs:ref.length,reviewPriority:delta.reviewPriority});
}
assert.equal(observations.length,6);
assert.deepEqual(synthesis.audit(),{fullChartRules:6});
for(let i=0;i<6;i++){
 const input=structuredClone(kb);
 const rule=input.fullChartRules[i];
 rule.readerAttribution.sourceClaims[0].calculatedRole='가짜분류';
 assert.throws(()=>synthesis.audit(input),/CORE_FOUR_PILLAR_RULE_INVALID/,
  'a changed symbolic classification must block the editorial claim');
 const wrongPosition=structuredClone(kb);
 wrongPosition.fullChartRules[i].readerAttribution.sourceClaims[0].sourceId=
  'natal.hour.stem';
 assert.throws(()=>synthesis.audit(wrongPosition),/CORE_FOUR_PILLAR_RULE_INVALID/,
  'a source attribution cannot be moved to an unrelated natal position');
 const discarded=structuredClone(kb);
 discarded.fullChartRules[i].readerAttribution.sourceClaims[0].readerSpan=
  '출처에 없는 허위 해석 문장';
 assert.throws(()=>synthesis.audit(discarded),/CORE_FOUR_PILLAR_RULE_INVALID/,
  'reader prose and claim ledger must always describe identical actual text');
 const falselyPersonal=structuredClone(kb);
 falselyPersonal.fullChartRules[i].readerAttribution.example.verifiedUserSituation=true;
 assert.throws(()=>synthesis.audit(falselyPersonal),/CORE_FOUR_PILLAR_RULE_INVALID/,
  'a hypothetical scenario cannot become an observed personal event');
}

assert.equal(new Set(observations.map(x=>x.scene)).size,6);
for(let i=0;i<6;i+=2){
 const a=observations[i],b=observations[i+1];
 assert.notEqual(a.scene,b.scene);
 assert.notEqual(a.id,b.id);
}
console.log('QA_SIX_NATAL_READER_CAUSAL_EDITORIAL_REVIEW='+JSON.stringify({
 sixExactBirthCharts:observations,
 casesWithSpecificScenario:6,casesWithDownsideAndAction:6,
 independentlyReconciledPositionClaims:24,
 independentMethodPriorityComparisons:6,workplaceOrdersDeducedFromChart:0,
 disallowedRoleTextOrScenarioForgeries:24,
 professionalInterpretationValidated:0,
 releaseReady:0,apiCalls:0}));
console.log('PASS six chart-bound editorial scenarios remain specific, non-predictive and unapproved');
