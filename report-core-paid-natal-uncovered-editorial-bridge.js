'use strict';
// QA ONLY: surface source-matched classical editorial candidates for natal
// samples that have NO curated month-to-reader rule. This never fills the
// commercial core, adopts a classical school or authorizes paid generation.
const core=require('./report-core-knowledge-engine');
const classical=require('./report-core-paid-natal-classical-yin-example');
const counterfactual=require('./report-core-paid-natal-counterfactual-audit');
const bindings=require('./report-fact-bindings');
const language=require('./report-reader-policy');
const graph=require('./report-core-evidence-graph');
const synthesis=require('./report-core-chart-integration');
const monthReview=require('./report-core-paid-natal-month-method-review');
function review(packet){
 const verified=counterfactual.snapshot(packet);
 const result=core.compile(packet);
 if(result.releaseVerdict!=='not-approved'||result.apiCalls!==0)
  throw Error('QA_UNCOVERED_CLASSICAL_RELEASE_INTEGRITY');
 if(result.status==='draft-for-human-review')
  return {kind:'qa-uncovered-natal-editorial-bridge-v1',
   status:'existing-curated-core-draft',candidate:null,
   curatedCoreStillMissing:false,providerCalls:0,releaseVerdict:'not-approved'};
 if(result.status!=='not-covered'||result.reason!=='curated-contextual-rule-required'||
    result.reader!==null)
  throw Error('QA_UNCOVERED_CLASSICAL_UNEXPECTED_CORE_STATUS');
 const chapter=classical.inspect(packet);
 if(chapter.releaseVerdict!=='not-approved'||
    chapter.canAutomateFinalTraditionalPattern!==false||
    chapter.classicalReference.traditionChosenForCommercialInterpretation!==false)
  throw Error('QA_UNCOVERED_CLASSICAL_PREMATURE_ADOPTION');
 const candidates=[
  classical.offlineSingleReaderCandidate(packet),
  classical.offlineReaderCandidate(packet)
 ].filter(Boolean);
 if(candidates.length>1)
  throw Error('QA_UNCOVERED_CLASSICAL_OVERLAPPING_CANDIDATES');
 if(candidates.length===0)
  return {kind:'qa-uncovered-natal-editorial-bridge-v1',
   status:'uncovered-no-source-matched-textual-candidate',candidate:null,
   curatedCoreStillMissing:true,providerCalls:0,releaseVerdict:'not-approved'};
 const found=candidates[0];
 const category=found.kind==='qa-classical-natal-single-reader-candidate-v1'?
  'bing-only-textual-change':found.kind==='qa-classical-natal-reader-candidate-v1'?
   'jia-and-bing-textual-priority':null;
 if(!category||found.releaseVerdict!=='not-approved'||
    found.readyForPaidModelProbe!==false||
    found.independentlyProfessionallyReviewed!==false||
    found.individualPersonalityOrCareerVerified!==false||
    found.providerCalls!==0||found.otherBranchEffects!=='not-assessed'||
    found.calculatedChart!==packet.chart)
  throw Error('QA_UNCOVERED_CLASSICAL_INVALID_CANDIDATE');
 // Verify the exact day, month, hour, and each cited stem independently
 // from the source ledger. The upstream narrowed example is NOT sufficient
 // by itself to certify the whole chart's causal/interpretive bridge.
 const rows=Object.fromEntries(bindings.build(packet).map(x=>[x.id,x]));
 if(verified.positions.day.stem!=='辛'||packet.chart.month[1]!=='寅'||
    verified.positions.month.stem!=='丙')
  throw Error('QA_UNCOVERED_CLASSICAL_WRONG_NATAL_CONTEXT');
 const refs=found.sourceRefs;
 if(!Array.isArray(refs)||refs.length<4||
    refs.length!==new Set(refs).size||
    !['natal.day.stem','natal.year.stem','natal.month.stem'].every(x=>
     refs.includes(x))||
    !refs.every(id=>id.startsWith('natal.')&&rows[id]?.stem&&
      rows[id]?.observedBehavior===false&&rows[id]?.interpretationScope===
       'traditional-symbol-only'))
  throw Error('QA_UNCOVERED_CLASSICAL_SOURCE_REFS_INVALID');
 if(typeof found.text!=='string'||found.text.length<180||
    typeof found.label!=='string'||language.errors([found.label,found.text]).length||
    /[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]/.test(found.label+' '+found.text)||
    /[?？]\s*$/.test(found.text))
  throw Error('QA_UNCOVERED_CLASSICAL_VISIBLE_LANGUAGE_INVALID');
 // Contrast the cited classical month condition against OTHER calculated
 // positions instead of presenting its narrow priority as a full reading.
 // Even perfect exact-stem matching does NOT choose a governing tradition.
 const structural=synthesis.select(packet,graph.build(packet));
 const observed=structural?.evidence?.exposureEvidence;
 const expectedExposure=category==='bing-only-textual-change'?
  'other-month-hidden-exposed-only':'main-and-other-exposed';
 if(structural.releaseVerdict!=='not-approved'||
    structural.humanReviewRequired!==true||structural.apiCalls!==0||
    observed?.status!==expectedExposure||
    observed?.monthPatternPriority!=='not-assessed'||
    !structural.sourceRefs.includes('facts.stemConnections')||
    !structural.sourceRefs.includes(observed.mainSourceId)||
    observed.sourceRefs.some(id=>!structural.sourceRefs.includes(id))||
    JSON.stringify(structural.evidence.chart)!==JSON.stringify(packet.chart)||
    !structural.reader.text.includes(observed.displayedReaderReason))
  throw Error('QA_UNCOVERED_CLASSICAL_FULL_CHART_CONTRAST_DRIFT');
 if(language.errors([structural.reader.label,structural.reader.text]).length)
  throw Error('QA_UNCOVERED_CLASSICAL_FULL_CHART_READER_JARGON');
 const monthly=monthReview.assess(packet);
 const cardinality=monthly.observed.natalRelationsTouchingMonth.relationshipCardinality;
 if(cardinality.realizedCombinationOrBreakage!=='not-assessed'||
    cardinality.whichLabelPrevails!=='not-assessed')
  throw Error('QA_UNCOVERED_CLASSICAL_BRANCH_PRIORITY_NOT_VERIFIED');
 // This adds a useful editor-facing comparison and case-specific explanation
 // while full causal priority, personality and saleable depth remain blocked.
 const contextualReview={
  status:'full-chart-structural-comparison-only',
  label:structural.reader.label,text:structural.reader.text,
  sourceRefs:structural.sourceRefs.slice(),
  monthExposureExplanation:observed.displayedReaderReason,
  monthExposureStatus:observed.status,
  mainVisiblePositions:observed.mainVisiblePositions.slice(),
  otherMatches:observed.otherMatches.map(x=>({...x})),
  independentMonthBranchContacts:cardinality.independentPairContactCount,
  multipleLabelsForOneBranchContact:
   cardinality.hasDuplicateLabelsForSameTwoPositions,
  monthBranchGroups:cardinality.completeGroupEntryCount,
  chosenClassicalPriorityForFullChart:false,
  overallMethodApproved:false,releaseVerdict:'not-approved'
 };
 // QA-only artifact. NOT a complete natal reading: year/hour branch
 // interactions and editorial worth remain unreviewed. Never report this
 // as core coverage or as a finished personal interpretation.
 return {kind:'qa-uncovered-natal-editorial-bridge-v1',
  status:'narrow-textual-editorial-candidate-only',
  candidate:{kind:found.kind,category,label:found.label,text:found.text,
   sourceRefs:refs.slice(),textualRule:found.textualRule,
   independentlyProfessionallyReviewed:false,
   fullChartCausalBridgeEstablished:false,releaseVerdict:'not-approved'},
  contextualReview,
  curatedCoreStillMissing:true,
  needs:['professional-textual-interpretive-method-check',
   'full-chart-competing-relationships-review','individual-reader-value-review',
   'separate-curated-core-rule-before-production'],
  providerCalls:0,releaseVerdict:'not-approved'};
}
module.exports={review};
