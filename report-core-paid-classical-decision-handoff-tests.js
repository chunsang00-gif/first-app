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
 assert.equal(x.generalMonthRule.methodPriority,'not-selected');
 const cross=x.independentClassicalSourceEligibility;
 assert.equal(x.monthWorkedExampleStatusOnly,true);
 assert.equal(cross.rulesAreAlternativeFrameworksNotOneUnifiedPattern,true);
 assert.equal(cross.readerFacingPromiseAuthorized,false);
 assert.equal(cross.humanExpertNeedsToReconcileSources,true);
 assert.equal(cross.paidWriterAuthorized,false);
 assert.equal(cross.providerCalls,0);
 const screen=x.methodApplicabilityDecision;
 assert.equal(screen.kind,'qa-natal-method-source-scope-decision-v1');
 assert.equal(screen.allowedInPaidWriter,false);
 assert.equal(screen.customerReady,false);
 assert.equal(screen.commerciallyAdoptedMethod,null);
 assert.equal(screen.unresolved.monthMethodPriority,'not-selected');
 const arrows=screen.unresolved.otherPillarVisibleInteractions;
 assert.deepEqual(arrows.sourceRefs,[
  'natal.year.stem','natal.month.stem','natal.hour.stem',
  'facts.stemConnections']);
 assert.equal(arrows.calculatedPairs.length,3);
 assert.equal(arrows.relativePriority,'not-assessed');
 assert.equal(arrows.sameElementDoesNotMeanIdenticalHiddenStem,true);
 assert.equal(arrows.changedHourCannotSelectDominantDirection,true);
 assert.equal(arrows.noPersonalityOrOccupationDerived,true);
 assert(arrows.calculatedPairs.every(row=>
  row.priority==='not-assessed'&&row.realizedEffect==='not-established'));
 assert.equal(screen.unresolved.governingStem,'not-verified');
 assert.equal(screen.unresolved.otherPillarBranchRelations.traditionalPriority,
  'not-assessed');
 assert.equal(screen.repeatedVisibleStemDoesNotAddPriorityWeight,true);
 assert.equal(x.principleLevelCandidateStatus,x.generalMonthRule.scopeStatus);
 assert.equal(x.generalMonthRule.authorizedForPaidWriter,false);
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
  const g=x.generalMonthRule;
  assert.equal(g.conditionObserved,true);
  assert(cross.climate);
  assert(cross.exactDayHour);
  assert.equal(cross.alternativeExactDayHour,null);
  assert.equal(cross.exactClassicalDayHourForThisChart.type,
   'yi-wei-gui-wei-winter');
  assert.equal(cross.exactDayHour.generalYiDayHourVerseSeparateFromExactYiWeiDay,
   true);
  assert.equal(cross.exactDayHour.nearbyYiChouDayPassageExcluded,true);
  assert.equal(cross.monthPatternTextualWorkedCaseMatched,false);
  assert.equal(cross.climate.historicalTwelfthMonthMeansSolarTermChouMonth,true);
  assert.deepEqual(cross.climate.observedBingVisibleRefs,[]);
  assert.deepEqual(cross.climate.observedBingHiddenRefs,[]);
  assert.deepEqual(cross.climate.observedGuiVisibleRefs,
   ['natal.month.stem','natal.hour.stem']);
  assert.equal(cross.climate.favorableHistoricalCompoundConditionMatched,false);
  assert.equal(cross.climate.dingHiddenMustNotBeCountedAsBing,true);
  assert.deepEqual(cross.exactDayHour.sourceRefs.slice(0,4),[
   'natal.day.stem','natal.day.hidden.乙',
   'natal.hour.stem','natal.hour.hidden.乙']);
  assert.equal(cross.exactDayHour.observedWinterMonth,true);
  assert.equal(cross.exactDayHour.winterSourceClauseMatched,true);
  assert.equal(cross.exactDayHour.sourceContainsSeasonalHistoricJudgment,'冬安穩');
  assert.equal(cross.exactDayHour.historicalTextNotPrediction,true);
  assert.equal(cross.exactDayHour.approvedPaidInsight,false);
  assert.deepEqual(x.expertDecisions.find(q=>q.id==='choose-school')
   .independentlyMatchedClassicalTexts.map(t=>t.id),[
    'qiong-tong-bao-jian-yi-chou-climate',
    'san-ming-tong-hui-yi-wei-gui-wei']);
  assert.equal(screen.applicable.generalMonthVisibility.status,
   'candidate-only-not-interpretive-conclusion');
  assert.equal(screen.applicable.generalMonthVisibility.firstRoleSelected,false);
  assert.deepEqual(screen.applicable.generalMonthVisibility.alternativeMonthSourceIds,
   ['natal.month.hidden.癸']);
  assert.equal(screen.excluded.literalXinYinWorkedRule.status,
   'excluded-no-literal-classical-case-match');
  assert.equal(screen.excluded.literalXinYinWorkedRule.observedDayStem,'乙');
  assert.equal(screen.excluded.literalXinYinWorkedRule.observedMonthBranch,'丑');
  assert.equal(screen.excluded.completedMonthBranchGroup.status,
   'excluded-no-complete-month-three-position-group');
  assert.equal(screen.unresolved.otherPillarBranchRelations.completeMonthGroups,0);
  assert.equal(g.exactWorkedClassicalExampleMatched,false);
  assert.deepEqual(g.otherExposedHiddenSourceIds,['natal.month.hidden.癸']);
  assert.equal(x.exactTextualDecision,null,
   'general-month principle is NOT the explicit worked classical case');
  const q=x.expertDecisions.find(r=>r.id==='resolve-month');
  assert.deepEqual(q.generalTextualPrincipleCandidates.map(k=>k.id),
   ['general-month-nonmain-exposure']);
  assert.equal(q.generalTextualPrincipleCandidates[0].customerConclusionApproved,false);

  assert.equal(earth.chartHasAllThreeEarthBranches,true);
  assert.deepEqual(arrows.pairCounts,
   {generating:0,restricting:0,sameElement:3});
  const ym=arrows.calculatedPairs.find(x=>
   x.leftId==='natal.year.stem'&&
   x.rightId==='natal.month.stem');
  assert.equal(ym.elementalRelation,'same-element');
  assert.equal(ym.firstTraditionalCategory,'정인');
  assert.equal(ym.secondTraditionalCategory,'편인');
  assert.equal(earth.tableRelationLabels,5);
  assert.equal(earth.independentPairContacts,3);
  assert(x.expertDecisions.find(q=>q.id==='resolve-other-positions')
   .commentaryOnlyConditions.some(c=>
    c.id==='xu-commentary-earth-three-punishment'&&
    c.originalDoesNotExplicitlyNameTriad===true));
 }else{
  assert.equal(cross.exactDayHour,null);
  assert.equal(cross.alternativeExactDayHour,null);
  assert.equal(cross.exactClassicalDayHourForThisChart,null);
  assert.equal(cross.climate,null);
  assert.deepEqual(x.expertDecisions.find(q=>q.id==='choose-school')
   .independentlyMatchedClassicalTexts,[]);
  assert.equal(earth.chartHasAllThreeEarthBranches,false);
  assert(x.expertDecisions.every(q=>q.commentaryOnlyConditions.length===0));
 }
 if(first){
  assert.equal(screen.excluded.literalXinYinWorkedRule,null);
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
const late=facts.build({calendar:'lunar',birthDate:'1982-11-24',
 leapMonth:false,birthTime:'20:20',gender:'male',mbti:'ISFP'},2027);
const lateReview=method.build(late);
const beforeClassical=adultReview.independentClassicalSourceEligibility;
const afterClassical=lateReview.independentClassicalSourceEligibility;
assert.equal(beforeClassical.climate.favorableHistoricalCompoundConditionMatched,false);
assert.equal(beforeClassical.climate.bingExposed,false);
assert.equal(afterClassical.climate.bingExposed,true);
assert.deepEqual(afterClassical.climate.observedBingVisibleRefs,['natal.hour.stem']);
assert.deepEqual(afterClassical.climate.observedGuiVisibleRefs,['natal.month.stem']);
assert.equal(afterClassical.climate.guiExposed,true);
assert.equal(afterClassical.climate.bingExposedWithoutGui,false);
assert.equal(afterClassical.climate.favorableHistoricalCompoundConditionMatched,false);
assert.equal(afterClassical.exactDayHour,null);
assert.equal(afterClassical.alternativeExactDayHour.requiredDayPillar,'乙未');
assert.equal(afterClassical.alternativeExactDayHour.requiredHourPillar,'丙戌');
assert.equal(afterClassical.alternativeExactDayHour.listedContainsYearBranch,true);
assert.equal(afterClassical.alternativeExactDayHour.listedContainsMonthBranch,false);
assert.equal(afterClassical.alternativeExactDayHour
 .yearMonthGrammarAndOtherConditionsNotResolved,true);
assert.equal(afterClassical.alternativeExactDayHour
 .doesNotAuthorizeSimpleYearOrMonthRule,true);
assert.equal(afterClassical.alternativeExactDayHour
 .cannotBorrowGuiWeiWinterClause,true);
assert.equal(afterClassical.alternativeExactDayHour.approvedPaidInsight,false);
assert.equal(afterClassical.exactClassicalDayHourForThisChart.type,
 'yi-wei-bing-xu-year-month-qualifier-unresolved');
assert.equal(afterClassical.paidWriterAuthorized,false);
assert.deepEqual(lateReview.expertDecisions.find(q=>q.id==='choose-school')
 .independentlyMatchedClassicalTexts.map(x=>x.id),
 ['qiong-tong-bao-jian-yi-chou-climate',
  'san-ming-tong-hui-yi-wei-bing-xu']);
assert.equal(adultReview.exactTextualDecision,null);
assert.equal(adultReview.noDetectedConflictsCannotApproveMethod,true);
assert(adultReview.unresolvedConditionCount>0);
assert(adultReview.expertDecisions.some(q=>q.id==='resolve-other-positions'&&
 q.relevantConditions.some(z=>z.sourceRefs.includes('facts.natalBranchRelations'))));
console.log('QA_CLASSICAL_METHOD_HANDOFF='+JSON.stringify({
 reviewedCaseTypes:scenarios.length,
 exactTextualExamples:2,
 eligibleAdultWinterDayHourText:1,
 eligibleDifferentExactBingXuDayHourText:1,
 independentlyEligibleYiChouClimateRules:2,
 favorableCompoundConditionsMet:0,
 missingGeneralMethodForAdultSample:1,
 contradictoryHourCasesRejected:2,
 expertDecisionsPending:5,chartSpecificConflictConditions:true,
 providerCalls:0,readyForSale:false}));
