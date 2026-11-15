'use strict';
// QA ONLY: an auditable, source-locked conflict matrix for *candidate
// interpretations*. It NEVER chooses a method, useful god, dominant qi,
// behavioral trait or commercial conclusion. A calculation difference does
// not itself prove two classical schools are incompatible.
const review=require('./report-core-paid-natal-month-method-review');
const example=require('./report-core-paid-natal-classical-method-applicability');
const chapter11=require('./report-core-paid-natal-ch11-two-cases');
const mixedDirections=require('./report-core-paid-natal-mixed-visible-reconciliation');
const chapter9=require('./report-core-paid-natal-classical-rescue-priority');
const branchRescue=require('./report-core-paid-natal-rescue-branch-relation-review');
function inspect(packet){
 const m=review.assess(packet),classical=example.evaluate(packet);
 if(m.status!=='method-priority-not-selected'||
    m.adoptedMethodId!==null||m.interpretivePriorityVerified!==false||
    classical.chosenCommercialTraditionalSchool!==null||
    classical.finalPatternSelected!==false)
  throw Error('QA_NATAL_CONFLICT_UNAPPROVED_METHOD_ADOPTED');
 const o=m.observed,scope=o.exactExposureScopeComparison;
 const main=o.mainHiddenStemSourceId;
 const hidden=new Set(o.hiddenStemSourceIds);
 const exposed=scope.nonDayExposedHiddenStemIds;
 if(new Set(exposed).size!==exposed.length||
    exposed.some(id=>!hidden.has(id))||
    !hidden.has(main))
  throw Error('QA_NATAL_CONFLICT_BAD_EXPOSURE_CANDIDATES');
 const mainVisible=exposed.includes(main);
 const otherVisible=exposed.filter(id=>id!==main);
 const approx=o.approximateGoverningCandidate;
 const approxId=approx?.natalSourceId||null;
 if(approxId&&!hidden.has(approxId))
  throw Error('QA_NATAL_CONFLICT_OUT_OF_MONTH_HIDDEN_CANDIDATE');
 const cardinality=o.natalRelationsTouchingMonth.relationshipCardinality;
 const contacts=cardinality.uniquePairContacts;
 if(cardinality.independentPairContactCount!==contacts.length||
    cardinality.pairTableEntryCount!==contacts.reduce((n,c)=>n+c.tableLabels.length,0)||
    cardinality.multipleLabelsOnSamePair.length!==contacts.filter(c=>c.tableLabels.length>1).length)
  throw Error('QA_NATAL_CONFLICT_DUPLICATED_BRANCH_CONTACT');
 const cases=[];
 const push=(id,details,refs)=>cases.push({id,observed:details,
  sourceRefs:[...new Set(refs)],relativePriority:'not-assessed',
  impactOnActualLife:'not-established'});
 if(mainVisible&&otherVisible.length)
  push('month-main-and-other-hidden-both-visible',
   {mainSourceId:main,otherSourceIds:otherVisible.slice()},
   ['facts.stemConnections',main,...otherVisible]);
 else if(!mainVisible&&otherVisible.length)
  push('other-month-hidden-exposed-without-main',
   {mainSourceId:main,otherSourceIds:otherVisible.slice()},
   ['facts.stemConnections',main,...otherVisible]);
 if(otherVisible.length>1)
  push('multiple-competing-non-main-visible-stems',
   {otherSourceIds:otherVisible.slice()},
   ['facts.stemConnections',...otherVisible]);
 if(approx&&!approxId)
  push('approximate-governing-day-outside-canonical-hidden-stems',
   {publishedStem:approx.stem,canonicalMonthHiddenSourceIds:[...hidden]},
   ['facts.governingDayDiagnostic','facts.seasonalEvidence']);
 else if(approxId&&approxId!==main)
  push('approximate-governing-day-differs-from-month-main',
   {illustrativeCandidateSourceId:approxId,mainSourceId:main,
    boundarySensitive:approx.nearApproximateBoundary},
   ['facts.governingDayDiagnostic',main,approxId]);
 if(scope.dayMasterOnlyExposedHiddenStemIds.length)
  push('day-master-only-match-is-not-non-day-exposure',
   {excludedSourceIds:scope.dayMasterOnlyExposedHiddenStemIds.slice()},
   ['facts.stemConnections',...scope.dayMasterOnlyExposedHiddenStemIds]);
 if(cardinality.hasDuplicateLabelsForSameTwoPositions)
  push('multiple-relation-labels-for-one-month-pair',
   {contacts:cardinality.multipleLabelsOnSamePair.map(x=>({
    otherPosition:x.otherPosition,tableLabels:x.tableLabels.slice()}))},
   ['facts.natalBranchRelations']);
 if(cardinality.independentPairContactCount>1)
  push('more-than-one-independent-month-branch-pair',
   {independentMonthContacts:cardinality.independentPairContactCount},
   ['facts.natalBranchRelations']);
 if(cardinality.completeGroupEntryCount)
  push('month-included-in-branch-group',
   {groupTableEntries:cardinality.completeGroupEntryCount},
   ['facts.natalBranchRelations']);
 const visibleMixed=mixedDirections.review(packet);
 if(visibleMixed.finalTraditionalPattern!==null||
    visibleMixed.customerReady!==false||
    visibleMixed.noWinnerChosen!==true||
    visibleMixed.notOffsettingForces!==true)
  throw Error('QA_NATAL_CONFLICT_MIXED_VISIBLE_UNVERIFIED_DECISION');
 if(visibleMixed.mixed){
  push('visible-generating-and-controlling-pairs-coexist',
   {generatingPairCount:visibleMixed.counts.generating,
    controllingPairCount:visibleMixed.counts.restricting,
    noDominantArrowCalculated:true,
    individualPairs:visibleMixed.edges.map(x=>({
     from:x.from,to:x.to,direction:x.elementalDirection,
     relativePriority:'not-assessed'}))},
   visibleMixed.sourceRefs);
 }
 const extended=chapter11.evaluate(packet);
 if(extended.examples.length>1||
    extended.clientReleaseAllowed!==false||
    extended.fullChartVerdict!=='not-assessed')
  throw Error('QA_NATAL_CONFLICT_EXTRA_CLASSICAL_SCOPE');
 const furtherExample=extended.examples[0]||null;
 if(furtherExample){
  push('chapter11-symbol-relation-requires-full-chart-method-review',
   {id:furtherExample.id,symbolRelation:furtherExample.sourceTextualRelation,
    otherPillarEffect:'not-assessed'},
   furtherExample.sourceRefs);
 }
 const rescue=chapter9.evaluate(packet);
 if(rescue.match){
  if(rescue.restorationEffectVerified!==false||
     rescue.fullPatternAssigned!==false||
     rescue.approved!==false)
   throw Error('QA_NATAL_CONFLICT_UNAPPROVED_CHAPTER9_RESCUE');
  push('chapter9-officer-output-rescue-condition-must-be-considered',
   {sourceChapter:'九、論用神成敗救應',
    condition:rescue.assessment,
    observedProtectionIds:rescue.observed.independentlyProvenProtectionIds.slice(),
    restorationEffect:'not-assessed'},
   ['facts.stemConnections',rescue.observed.monthMainSourceId,
    ...rescue.observed.officerVisibleIds,
    ...rescue.observed.outputVisibleIds,
    ...rescue.observed.independentlyProvenProtectionIds]);
 }
 const rescueBranch=branchRescue.audit(packet);
 if(rescueBranch.rescueVisible!==(rescue.match&&
    rescue.assessment==='candidate-rescue-condition-visible')||
    rescueBranch.rescueEffectVerified!==false||
    rescueBranch.branchCombinationRealised!==false||
    rescueBranch.anyPairDominant!==false||
    rescueBranch.fullTraditionalPatternConfirmed!==false)
  throw Error('QA_NATAL_CONFLICT_RESCUE_BRANCH_PRIORITY_LEAK');
 if(rescueBranch.rescueVisible&&
    (rescueBranch.monthBranchPairs.length>0||
     rescueBranch.monthBranchGroups.length>0))
  push('visible-rescue-and-unresolved-month-branch-relations-coexist',
   {observedMonthPairCount:rescueBranch.uniqueMonthContactPairs,
    observedMonthRelationLabels:rescueBranch.monthBranchPairs.length,
    observedMonthGroupCount:rescueBranch.monthBranchGroups.length,
    monthDayContacts:rescueBranch.monthContacts.day,
    monthDayTableLabels:rescueBranch.monthRelationLabelCounts.day,
    anyContactConfirmedToOverrideRescue:false},
   ['facts.natalBranchRelations','facts.stemConnections',
    ...rescue.observed.independentlyProvenProtectionIds]);
 const sourceLimited=classical.textuallyMatchedExample;
 if(sourceLimited!==null){
  if(classical.status!=='exact-textual-conditions-only'||
     !['xin-yin-bing-only-month-command-change',
       'xin-yin-jia-and-bing-coexposed-month-main-plus-authority'].includes(sourceLimited)||
     classical.observedConditions.computedMainHiddenSourceId!==main)
   throw Error('QA_NATAL_CONFLICT_BAD_CLASSICAL_MATCH');
  push('source-specific-classical-example-needs-whole-chart-review',
   {classicalExample:sourceLimited,
    firstRoleInOnlyThatText:classical.textualCaseFirstRole,
    otherBranchEffect:'not-assessed'},
   ['natal.day.stem','natal.month.stem',main,'facts.stemConnections']);
 }
 const factsEvidence={
  monthMainSourceId:main,
  nonDayVisibleMonthHiddenSourceIds:exposed.slice(),
  dayMasterOnlyMatchSourceIds:scope.dayMasterOnlyExposedHiddenStemIds.slice(),
  mainVisibleOutsideDay:mainVisible,
  competingNonMainSourceIds:otherVisible.slice(),
  approximateStageCandidateSourceId:approxId,
  approximateStageStatus:approx?.status||null,
  monthBranchTableEntries:cardinality.pairTableEntryCount,
  independentMonthContacts:cardinality.independentPairContactCount,
  classicalCaseOnly:sourceLimited
 };
 const allowable=sourceLimited?'narrow-document-specific-starting-role-only':
   furtherExample?'narrow-document-specific-symbolic-relation-only':
    'calculated-positions-and-competing-candidate-descriptions-only';
 return {
  kind:'qa-natal-interpretation-conflict-abstention-v1',
  calculatedFacts:factsEvidence,
  rescueBranchContext:rescueBranch.rescueVisible?{
   monthContacts:{...rescueBranch.monthContacts},
   monthRelationLabelCounts:{...rescueBranch.monthRelationLabelCounts},
   uniqueMonthContactPairs:rescueBranch.uniqueMonthContactPairs,
   monthPairTypes:rescueBranch.monthBranchPairs.map(x=>x.type),
   conditionalDecisionPath:structuredClone(rescueBranch.conditionalDecisionPath),
   independentlyEditedExampleAvailable:rescueBranch.readerDraft!==null,
   sourceRefs:['facts.stemConnections','facts.natalBranchRelations'],
   rescueEffectVerified:false,branchTransformationRealised:false,
   anyDominantEffectChosen:false,approvedForPaid:false
  }:null,
  chapter9ConditionalRescueEvidence:rescue.match?{
   assessment:rescue.assessment,
   visibleProtectionIds:rescue.observed.independentlyProvenProtectionIds.slice(),
   sourceUrl:rescue.source.url,
   rescueActuallyEstablished:false,
   fullChartApproval:false
  }:null,
  visibleMixedDirectionReview:{
   mixed:visibleMixed.mixed,
   counts:{...visibleMixed.counts},
   sourceRefs:visibleMixed.sourceRefs.slice(),
   candidateForEditorialReviewOnly:visibleMixed.combinedReaderDraft!==null,
   realizedDirectionPriority:'not-assessed',
   anyPaidCopyApproved:false
  },
  additionalPublishedSymbolRelation:furtherExample?{
   id:furtherExample.id,
   relation:furtherExample.sourceTextualRelation,
   sourceRefs:furtherExample.sourceRefs.slice(),
   manuscriptProhibitedFromPaidRelease:true,
   fullPatternReviewed:false
  }:null,
  findings:cases,
  distinctObservedTensions:cases.length,
  allowedInterpretationScope:allowable,
  documentedClassicalFirstRole:sourceLimited?
   classical.textualCaseFirstRole:null,
  // Absence of a detected tension is NOT affirmative evidence for a method.
  noDetectedTensionsProvesDominantPattern:false,
  detectedTensionsProveLifeConflict:false,
  adoptedMonthMethod:null,governingHiddenStem:null,
  branchTransformationRealized:false,dayMasterStrengthKnown:false,
  finalTraditionalPattern:null,
  conclusion:'abstain-from-full-chart-interpretation',
  downstreamPaidApproval:false,providerCalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={inspect};
