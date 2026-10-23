'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const method=require('./report-core-paid-classical-decision-handoff');
const conflict=require('./report-core-paid-natal-conflict-abstention');
const scenarios=[
 ['lunar','1982-11-24',null,'no-published-textual-case-matches-this-chart'],
 ['solar','1989-02-10','정관','single-secondary-exposure-textual-case-only'],
 ['solar','2024-02-17','정재','main-plus-secondary-exposure-textual-case-only']
];
for(const [calendar,birthDate,first,status] of scenarios){
 const p=facts.build({calendar,birthDate,birthTime:'14:20',
  ...(calendar==='lunar'?{leapMonth:false}:{}),
  gender:'male',mbti:'ISFP'},2027);
 const x=method.build(p);
 assert.equal(x.status,status);
 assert.equal(x.exactTextualDecision?.firstTraditionalCategory||null,first);
 assert.equal(x.expertDecisions.length,5);
 const expectedConflict=conflict.inspect(p);
 assert.equal(x.unresolvedConditionCount,expectedConflict.distinctObservedTensions);
 const earth=x.earthThreePunishmentSourceReview;
 assert.equal(earth.kind,'qa-xu-commentary-three-punishment-candidate-v1');
 assert.equal(earth.attribution.original.explicitlyNamesThisExactEarthTriad,false);
 assert.equal(earth.attribution.laterCommentary.explicitlyListsEarthTriad,true);
 assert.equal(earth.groupStrengthOrActivationVerified,false);
 assert.equal(earth.providerCalls,0);
 assert.deepEqual(x.unresolvedConditions.map(z=>z.id),
  expectedConflict.findings.map(z=>z.id));
 assert.deepEqual(x.unresolvedConditions.map(z=>z.sourceRefs),
  expectedConflict.findings.map(z=>z.sourceRefs));
 assert.equal(x.methodEvidenceProvenance,'deterministic-qa-conflict-review');
 assert.equal(x.noDetectedConflictsCannotApproveMethod,true);
 assert.equal(x.monthBranchContactCount,expectedConflict.calculatedFacts.independentMonthContacts);
 assert.equal(x.monthBranchTableLabelCount,expectedConflict.calculatedFacts.monthBranchTableEntries);
 assert(x.unresolvedConditions.every(z=>z.priority==='not-assessed'&&
  z.actualLifeEffect==='not-established'));
 assert(x.expertDecisions.every(z=>z.chartSpecificEvidenceSupplied===true));
 assert(x.expertDecisions.every(q=>q.relevantConditions.every(c=>
  x.unresolvedConditions.some(z=>z.id===c.id&&
   JSON.stringify(z.sourceRefs)===JSON.stringify(c.sourceRefs)))));
 assert(x.expertDecisions.every(d=>d.status==='pending'&&
  d.decision===null&&d.sourceCitation===null));
 assert(x.candidates.every(d=>d.priority==='not-assessed'));
 assert.equal(x.methodApproved,false);
 assert.equal(x.readerInterpretationBoundary.conditionCount,
  x.unresolvedConditionCount);
 assert.equal(x.readerInterpretationBoundary.allowedHighestScope,
  first?'specific-published-example-only':
   'calculated-facts-and-symbol-classifications-only');
 assert.equal(x.readerInterpretationBoundary.authorizedForPaidWriter,false);
 assert.equal(x.readerInterpretationBoundary.professionalReviewComplete,false);
 assert.equal(x.readyForPaidModelProbe,false);
 assert.equal(x.customerReady,false);
 assert.equal(x.providerCalls,0);
 assert.equal(x.releaseVerdict,'not-approved');
 if(birthDate==='1982-11-24'){
  assert.equal(earth.chartHasAllThreeEarthBranches,true);
  assert.equal(earth.tableRelationLabels,5);
  assert.equal(earth.independentPairContacts,3);
  assert(x.expertDecisions.find(q=>q.id==='resolve-other-positions')
   .commentaryOnlyConditions.some(c=>
    c.id==='xu-commentary-earth-three-punishment'&&
    c.originalDoesNotExplicitlyNameTriad===true));
 }else{
  assert.equal(earth.chartHasAllThreeEarthBranches,false);
  assert(x.expertDecisions.every(q=>q.commentaryOnlyConditions.length===0));
 }
 if(first){
  assert(x.expertDecisions.find(z=>z.id==='review-counterexample')
   .relevantConditions.some(z=>z.id==='source-specific-classical-example-needs-whole-chart-review'));
  assert.equal(x.exactTextualDecision.fullChartConclusionEstablished,false);
  assert.equal(x.exactTextualDecision.url,
   'https://caipu.donglishuzhai.net/chapter/3723.html');
  assert(x.exactTextualDecision.evidenceRefs.includes('natal.day.stem'));
 }else assert.equal(x.exactTextualDecision,null);
}
for(const birthDate of ['1989-02-10','2024-02-17']){
 const p=facts.build({calendar:'solar',birthDate,birthTime:'20:20',
  gender:'male',mbti:'ISFP'},2027);
 const x=method.build(p);
 assert.equal(x.exactTextualDecision,null);
 assert(x.calculatedScope.competingThirdVisiblePositions.length>0);
 assert(x.unresolvedConditions.some(z=>z.id==='multiple-competing-non-main-visible-stems')||
  x.unresolvedConditions.some(z=>z.id==='month-main-and-other-hidden-both-visible')||
  x.unresolvedConditions.some(z=>z.id==='other-month-hidden-exposed-without-main'));
 assert.equal(x.customerReady,false);
}
const bad=facts.build({calendar:'solar',birthDate:'2024-02-17',
 birthTime:'14:20',gender:'male',mbti:'ISFP'},2027);
bad.facts.tenGods.month.stemTenGod='편인';
assert.throws(()=>method.build(bad),/QA_|CORE_/);
// The same 1982 exact chart cannot inherit the other two published
// examples; its actual branch and month observations must still reach QA.
const adult=facts.build({calendar:'lunar',birthDate:'1982-11-24',
 leapMonth:false,birthTime:'14:20',gender:'male',mbti:'ISFP'},2027);
const adultReview=method.build(adult);
assert.equal(adultReview.exactTextualDecision,null);
assert.equal(adultReview.noDetectedConflictsCannotApproveMethod,true);
assert(adultReview.unresolvedConditionCount>0);
assert(adultReview.expertDecisions.some(q=>q.id==='resolve-other-positions'&&
 q.relevantConditions.some(z=>z.sourceRefs.includes('facts.natalBranchRelations'))));
console.log('QA_CLASSICAL_METHOD_HANDOFF='+JSON.stringify({
 reviewedCaseTypes:scenarios.length,
 exactTextualExamples:2,
 missingGeneralMethodForAdultSample:1,
 contradictoryHourCasesRejected:2,
 expertDecisionsPending:5,chartSpecificConflictConditions:true,
 providerCalls:0,readyForSale:false}));
