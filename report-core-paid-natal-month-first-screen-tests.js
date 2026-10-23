'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const candidate=require('./report-core-paid-natal-month-first-screen');
const preview=require('./report-core-paid-natal-depth-preview');
const transport=require('./report-instruction-audit');
const cases=[
 {date:'1982-06-15',calendar:'solar',n:0,dayOnly:1,category:'no-independent-visible-month-exposure'},
 {date:'1982-03-15',calendar:'solar',n:0,dayOnly:0,category:'no-independent-visible-month-exposure'},
 {date:'1988-12-15',calendar:'solar',n:0,dayOnly:0,category:'no-independent-visible-month-exposure'},
 {date:'1994-04-15',calendar:'solar',n:2,dayOnly:0,category:'competing-visible-month-candidates'},
 {date:'1982-11-24',calendar:'lunar',n:1,dayOnly:0,category:'one-visible-month-candidate-needs-method-review'}
];
const diagnostic=[];
for(const row of cases){
 const input={calendar:row.calendar,birthDate:row.date,birthTime:'14:20',
  gender:'male',mbti:'ISFP'};
 if(row.calendar==='lunar')input.leapMonth=false;
 const packet=facts.build(input,2027);
 assert.equal(packet.status,'ready');
 const audit=candidate.build(packet);
 assert.equal(audit.kind,'qa-month-first-symbolic-applicability-screen-v1');
 assert.equal(audit.monthMethodCandidate,row.category);
 assert.equal(audit.conditions[1].nonDayExactCandidateCount,row.n);
 assert.equal(audit.conditions[1].dayMasterOnlyMatches,row.dayOnly);
 assert.equal(audit.conditions[4].status,'not-determined');
 assert.equal(audit.validPremiumInterpretationEstablished,false);
 assert.equal(audit.methodAdopted,false);
 assert.equal(audit.humanTraditionalReviewRequired,true);
 assert.equal(audit.providerCalls,0);
 assert(audit.disallowedWithoutIndependentReview.includes(
  'real-personality-career-relationships-or-events'));
 const qa=preview.prepare(packet);
 // Even if the offline core has no coverage, method diagnostic remains usable.
 if(qa){
  const focus=qa.payload.task.chapters.saju_core.topics.natal_depth.evidenceFocus;
  assert.deepEqual(focus.monthFirstApplicability,audit,
   'the actual provider must receive month-led limits, not a chart-independent slogan');
  assert.deepEqual(transport.inspectTransport(qa.prompt,qa.payload),[]);
  const wrong=structuredClone(qa.payload);
  wrong.task.chapters.saju_core.topics.natal_depth.evidenceFocus
   .monthFirstApplicability.validPremiumInterpretationEstablished=true;
  assert(transport.inspectTransport(qa.prompt,wrong).includes(
   'qa-natal-depth-evidence-brief-drift'),'bogus method approval must fail before sending');
 }
 diagnostic.push({date:row.date,kind:row.category,nonDayCount:row.n,
  dayMasterOnly:row.dayOnly,monthOverlaps:audit.conditions[3].observedCount,
  transition:audit.conditions[2].status,approved:false});
}

const nonYin=facts.build({calendar:'solar',birthDate:'1982-06-15',
 birthTime:'14:20',gender:'male',mbti:'ISFP'},2027);
const nonYinScreen=candidate.build(nonYin);
const nonYinQuestion=candidate.writingQuestion(nonYinScreen);
assert(nonYinQuestion.length<750,'non-Yin chart must not carry a page of inapplicable rules');
assert(!nonYinQuestion.includes('寅월'),'irrelevant classical month must be omitted');
assert(!nonYinQuestion.includes('정재를 중심에'),'irrelevant classically ranked roles must be omitted');
const nonYinQa=preview.prepare(nonYin);
assert(nonYinQa);
assert.equal(nonYinQa.payload.task.chapters.saju_core.topics.natal_depth
 .evidenceFocus.writingQuestion,nonYinQuestion);
assert.deepEqual(transport.inspectTransport(nonYinQa.prompt,nonYinQa.payload),[]);
const unrelated=structuredClone(nonYinQa.payload);
unrelated.task.chapters.saju_core.topics.natal_depth.evidenceFocus.writingQuestion+=
 ' 오행 상생으로 정재가 중심입니다.';
assert(transport.inspectTransport(nonYinQa.prompt,unrelated).includes(
 'qa-natal-depth-evidence-brief-drift'),
 'writer question must be bound to the source case before the provider');
const secondaryCase=facts.build({calendar:'solar',birthDate:'2000-02-15',
 birthTime:'08:20',gender:'male',mbti:'ISFP'},2027);
const secondaryReview=candidate.build(secondaryCase);
assert.equal(secondaryReview.classicalTextualExample.matched,true);
assert.equal(secondaryReview.classicalTextualExample.dualExposureTextualPriority.scopeMatched,false);
const secondaryQuestion=candidate.writingQuestion(secondaryReview);
assert(secondaryQuestion.includes('대표 글자 甲이 겉에 없고'));
assert(!secondaryQuestion.includes('정재를 중심에'),'two distinct Yin examples cannot be conflated');

const xinSample=facts.build({calendar:'solar',birthDate:'2024-02-17',
 birthTime:'14:20',gender:'male',mbti:'ISFP'},2027);
const xinScreen=candidate.build(xinSample);
const xinQuestion=candidate.writingQuestion(xinScreen);
assert(xinQuestion.includes('정재를 중심에, 정관을 곁에'));
assert(xinQuestion.includes('단순한 목생화 방향이 아니다'));
assert(xinQuestion.includes('같은 출생 두 자리 사이에 관계표의 명칭이 둘 이상'));

assert.equal(xinScreen.monthMethodCandidate,'competing-visible-month-candidates');
assert.equal(xinScreen.classicalTextualExample.dualExposureTextualPriority.scopeMatched,true);
assert.equal(xinScreen.classicalTextualExample.dualExposureTextualPriority.firstRole,'정재');
assert.equal(
 xinScreen.classicalTextualExample.dualExposureTextualPriority.notDeterminedByElementGenerationArrow,
 true);
assert.equal(xinScreen.classicalTextualExample.dualExposureTextualPriority.additionalRole,'정관');
const monthTouch=xinScreen.conditions.find(x=>
 x.id==='overlapping-month-branch-relations');
assert.equal(monthTouch.status,'same-position-pair-has-different-traditional-labels');
assert.equal(monthTouch.observedCount,2,'two table labels, not two distinct contacts');
assert.equal(monthTouch.labelCount,2);
assert.equal(monthTouch.independentPairContactCount,1);
assert.deepEqual(monthTouch.otherPositions,['day']);
assert.equal(monthTouch.completeGroupCount,0);
assert.deepEqual(monthTouch.samePairMultipleLabels,[{
 monthPosition:'month',otherPosition:'day',
 branches:'寅亥',tableLabels:['육합','파']
}]);
assert.equal(monthTouch.interpretationPriority,'not-assessed');
assert.equal(xinScreen.validPremiumInterpretationEstablished,false);
assert.equal(xinScreen.methodAdopted,false);
const notXin=facts.build({calendar:'solar',birthDate:'2024-02-15',
 birthTime:'14:20',gender:'male',mbti:'ISFP'},2027);
assert.equal(candidate.build(notXin).classicalTextualExample.dualExposureTextualPriority.scopeMatched,false);
assert.equal(candidate.build(notXin).classicalTextualExample.dualExposureTextualPriority.textualPriorityBasis,null);
const yinProvider=preview.prepare(xinSample);
if(yinProvider){
 const focus=yinProvider.payload.task.chapters.saju_core.topics.natal_depth.evidenceFocus;
 assert.deepEqual(focus.monthFirstApplicability,xinScreen);
 assert.deepEqual(transport.inspectTransport(yinProvider.prompt,yinProvider.payload),[]);
}
console.log('QA_CLASSICAL_PRIORITY_WRITER_SCOPE='+JSON.stringify({
 computedChart:xinSample.chart,
 candidate:xinScreen.monthMethodCandidate,
 classicalRoleOrder:xinScreen.classicalTextualExample.dualExposureTextualPriority,
 monthRelationOverlapCount:xinScreen.conditions[3].observedCount,
 uniqueMonthPartnerCount:monthTouch.independentPairContactCount,
 samePairRelationLabels:monthTouch.samePairMultipleLabels,
 qaWriterEligible:!!yinProvider,paidCalls:0,fullReadingApproved:false
}));
assert.equal(diagnostic.length,5);
assert(new Set(diagnostic.map(x=>x.kind)).size===3,
 'test matrix must contain absent, one, and competing month-exposure candidates');
console.log('QA_MONTH_FIRST_APPLICABILITY='+JSON.stringify({
 diagnostics:diagnostic,providerCalls:0,releaseVerdict:'not-approved'
}));
console.log('PASS month-led candidate cannot be promoted to a personal inference; no provider calls');
