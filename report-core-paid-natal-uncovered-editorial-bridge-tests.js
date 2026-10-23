'use strict';
// Exercise real calculated sample charts and adversarial near-matches.
// No paid model call, no commercial reader registration, no approval.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const bridge=require('./report-core-paid-natal-uncovered-editorial-bridge');
const triage=require('./report-core-paid-natal-manuscript-editorial-audit');
const knowledge=require('./report-core-knowledge-engine');
const reader=require('./report-reader-policy');
const input=(date,time='14:20')=>({
 calendar:'solar',birthDate:date,birthTime:time,gender:'male',mbti:'ISFP'
});
const cases=[
 {date:'1989-02-10',category:'bing-only-textual-change'},
 {date:'2024-02-17',category:'jia-and-bing-textual-priority'}
];
const candidates=[];
for(const sample of cases){
 const packet=facts.build(input(sample.date),2027);
 assert.equal(packet.status,'ready');
 assert.equal(knowledge.compile(packet).status,'not-covered',
  'the two missing production core cases must NOT be silently registered');
 const x=bridge.review(packet);
 assert.equal(x.kind,'qa-uncovered-natal-editorial-bridge-v1');
 assert.equal(x.status,'narrow-textual-editorial-candidate-only');
 assert.equal(x.candidate.category,sample.category);
 assert.equal(x.curatedCoreStillMissing,true);
 assert.equal(x.releaseVerdict,'not-approved');
 assert.equal(x.providerCalls,0);
 assert.equal(x.candidate.independentlyProfessionallyReviewed,false);
 assert.equal(x.candidate.fullChartCausalBridgeEstablished,false);
 assert(x.needs.includes('separate-curated-core-rule-before-production'));
 assert(x.candidate.text.length>=180);
 assert.deepEqual(reader.errors([x.candidate.label,x.candidate.text]),[]);
 assert(x.candidate.sourceRefs.includes('natal.day.stem'));
 const context=x.contextualReview;
 assert.equal(context.status,'full-chart-structural-comparison-only');
 assert.equal(context.releaseVerdict,'not-approved');
 assert.equal(context.overallMethodApproved,false);
 assert.equal(context.chosenClassicalPriorityForFullChart,false);
 assert.equal(context.monthExposureStatus,
  sample.category==='bing-only-textual-change'?
   'other-month-hidden-exposed-only':'main-and-other-exposed');
 assert(context.monthExposureExplanation.length>=90);
 assert(context.text.includes(context.monthExposureExplanation));
 assert(context.sourceRefs.includes('facts.stemConnections'));
 assert(context.sourceRefs.some(id=>id.startsWith('natal.month.hidden.')));
 assert.deepEqual(reader.errors([context.label,context.text]),[]);
 assert.equal(context.mainVisiblePositions.length,
  sample.category==='bing-only-textual-change'?0:1);
 assert(context.otherMatches.length>=1);
 assert.equal(typeof context.independentMonthBranchContacts,'number');
 assert.equal(typeof context.multipleLabelsForOneBranchContact,'boolean');
 const draft=x.interpretiveCaseDraft;
 assert.equal(draft.kind,'qa-classical-case-conditional-manuscript-v1');
 assert.equal(draft.releaseVerdict,'not-approved');
 assert.equal(draft.customerReady,false);
 assert.equal(draft.independentlyReviewed,false);
 assert.equal(draft.competingFullChartEvidenceStillUnresolved,true);
 assert.equal(draft.textualOrdering,sample.category==='bing-only-textual-change'?
  'responsibility-before-resources':'resources-before-responsibility');
 assert(draft.text.includes('고전의 해당 사례'));
 assert(draft.text.includes('예를 들어'));
 assert(draft.text.includes('반대로')||draft.text.includes('다만'));
 assert(draft.text.includes('별도 검토')||draft.text.includes('확인되지')||
  draft.text.includes('확정하지')||draft.text.includes('우선순위'));
 assert(draft.text.length>=350);
 assert.deepEqual(reader.errors([draft.label,draft.text]),[]);
 assert(!/[?？]\\s*$/.test(draft.text));
 assert(draft.sourceRefs.includes('natal.day.stem'));
 assert(draft.sourceRefs.includes('natal.month.stem'));
 assert(draft.sourceRefs.includes('facts.stemConnections'));
 assert(draft.sourceRefs.length===new Set(draft.sourceRefs).size);
 const t=triage.inspect(packet);
 assert.equal(t.status,'missing-curated-coverage');
 assert.equal(t.readerPresent,false);
 assert.equal(t.supplementalCandidateAvailable,true);
 assert.equal(t.supplementalCandidateKind,x.candidate.category);
 assert.deepEqual(t.supplementalCitedRefs,x.candidate.sourceRefs);
 assert(t.findings.some(f=>f.id==='no-chart-specific-manuscript'));
 assert(t.findings.some(f=>f.id==='narrow-classical-editorial-candidate-available'));
 assert.equal(t.eligibleForPaidRelease,false);
 candidates.push(x.candidate);
}
assert.notEqual(candidates[0].text,candidates[1].text);
assert.notEqual(candidates[0].textualRule,candidates[1].textualRule);
const contextualCases=cases.map(x=>bridge.review(
 facts.build(input(x.date),2027)).contextualReview);
const conditionalCases=cases.map(x=>bridge.review(
 facts.build(input(x.date),2027)).interpretiveCaseDraft);
assert.notEqual(conditionalCases[0].text,conditionalCases[1].text);
assert.notEqual(conditionalCases[0].textualOrdering,
 conditionalCases[1].textualOrdering);
assert.notEqual(contextualCases[0].monthExposureExplanation,
 contextualCases[1].monthExposureExplanation,
 'single vs dual classical exposure must produce different factual rationale');
for(const row of [
 input('1989-02-10','20:20'), // third Yin-month hidden stem competes
 input('2024-02-17','20:20'),
 input('2024-02-15'),         // other day master
 input('2024-03-17'),         // out-of-scope month
 input('1990-05-15')          // unrelated uncovered core sample
]){
 const packet=facts.build(row,2027);
 assert.equal(packet.status,'ready');
 const result=bridge.review(packet);
 assert.notEqual(result.status,'narrow-textual-editorial-candidate-only',
  'a near-match cannot borrow either classical reader candidate');
 assert.equal(result.candidate,null);
 assert.equal(result.releaseVerdict,'not-approved');
 assert.equal(result.providerCalls,0);
}
const curated=facts.build(input('1982-06-15'),2027);
assert.equal(knowledge.compile(curated).status,'draft-for-human-review');
const existing=bridge.review(curated);
assert.equal(existing.status,'existing-curated-core-draft');
assert.equal(existing.candidate,null);
assert.equal(existing.curatedCoreStillMissing,false);
const corrupted=facts.build(input('1989-02-10'),2027);
corrupted.facts.tenGods.month.stemTenGod='편인';
assert.throws(()=>bridge.review(corrupted),
 /QA_COUNTERFACTUAL_SOURCE_ROLE_DRIFT:month/);
console.log('QA_TWO_UNCOVERED_CLASSICAL_EDITORIAL_CANDIDATES='+JSON.stringify({
 missingFullCuratedCore:2,sourceMatchedTextualPreviewCandidates:2,
 contextualFourPillarEvidenceCompanions:contextualCases.length,
 distinctConditionalReasoningDrafts:conditionalCases.length,
 disallowedNearMatches:5,distinctNarrowReaderTexts:2,
 specialistMethodReviewRequired:true,fullChartReadingApproved:false,
 billableCalls:0,releaseVerdict:'not-approved'
}));
console.log('PASS two uncovered natal examples have source-locked QA review text without promoting paid coverage');
