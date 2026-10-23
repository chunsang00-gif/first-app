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
 // Textually supported ORDER for one narrowly scoped example, not a
 // whole-chart ranking. Unlike a glossary, this draft explains what changed,
 // how a hypothetical decision differs, and what could invalidate the order.
 const single=category==='bing-only-textual-change';
 const explanation=single?
  '태어난 달에서 가장 기본이 되는 자원 관련 글자는 해·달·시간 겉에 드러나지 않고, 역할과 기준을 나타내는 다른 글자만 드러납니다. 그래서 이 고전의 해당 사례에서는 자원보다 맡은 책임을 읽는 쪽으로 해석의 출발점이 바뀝니다.':
  '태어난 달의 가장 기본이 되는 자원 관련 글자는 태어난 해의 겉에 나타나고, 역할과 기준을 나타내는 글자는 태어난 달의 겉에 함께 드러납니다. 그래서 이 고전의 해당 사례에서는 자원을 다루는 뜻을 중심에 놓고 책임과 기준의 뜻을 함께 비교합니다.';
 const conditional=single?
  '예를 들어 새 업무를 맡을지 판단하는 상황에서는 준비한 물건이나 비용보다, 맡아야 할 일과 지켜야 할 기준이 무엇인지부터 비교하는 풀이가 됩니다. 다만 책임만 생각하고 실행에 필요한 자원을 빼놓으면 이 두 상징을 함께 읽는 의미가 사라집니다.':
  '예를 들어 새로운 업무를 제안받은 상황에서는 먼저 사용할 자원과 감당할 비용을 살피고, 그다음 그 자원으로 맡을 수 있는 책임의 범위를 비교하는 풀이가 됩니다. 반대로 직책이나 규칙만 앞세우고 필요한 자원을 검토하지 않으면 이 사례에서 중심으로 둔 뜻을 놓칩니다.';
 const branchUncertainty=cardinality.completeGroupEntryCount>0?
  '한편 태어난 달을 포함하는 여러 자리의 조합도 확인되므로, 이 조합이 위 두 의미의 순서를 바꾸는지는 별도 검토가 필요합니다.':
  cardinality.independentPairContactCount>1?
   '태어난 달과 다른 두 개 이상의 자리 사이에도 관계가 표시됩니다. 각각의 관계가 위 순서를 바꾸는지는 확인되지 않았습니다.':
  cardinality.hasDuplicateLabelsForSameTwoPositions?
   '태어난 달과 다른 한 자리 사이에 관계표의 이름이 둘 이상 표시됩니다. 이를 서로 다른 두 작용으로 세거나 우선순위를 임의로 정할 수는 없습니다.':
   '태어난 달 이외의 출생 자리까지 종합했을 때도 이 순서가 유지되는지는 아직 확정하지 않았습니다.';
 const interpretiveCaseDraft={
  kind:'qa-classical-case-conditional-manuscript-v1',
  label:single?'기준을 먼저 살피는 경우':'자원을 먼저 살피는 경우',
  text:explanation+' '+conditional+' '+branchUncertainty+
   ' 이 설명은 고전의 정해진 조건을 현실의 선택 상황에 대입한 가정이며, 실제 성격이나 직장 성과를 관찰하거나 예언한 것이 아닙니다.',
  sourceRefs:[...new Set([...refs,...observed.sourceRefs,
   ...(cardinality.pairTableEntryCount||cardinality.completeGroupEntryCount?
    ['facts.natalBranchRelations']:[])])],
  textualOrdering:single?'responsibility-before-resources':
   'resources-before-responsibility',
  competingFullChartEvidenceStillUnresolved:true,
  independentlyReviewed:false,customerReady:false,
  releaseVerdict:'not-approved'
 };
 if(!interpretiveCaseDraft.sourceRefs.every(id=>
     structural.sourceRefs.includes(id)||refs.includes(id))||
    language.errors([interpretiveCaseDraft.label,interpretiveCaseDraft.text]).length||
    interpretiveCaseDraft.text.length<350||
    /[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]/.test(
     interpretiveCaseDraft.text))
  throw Error('QA_UNCOVERED_CLASSICAL_CASE_DRAFT_INTEGRITY');
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
  contextualReview,interpretiveCaseDraft,
  curatedCoreStillMissing:true,
  needs:['professional-textual-interpretive-method-check',
   'full-chart-competing-relationships-review','individual-reader-value-review',
   'separate-curated-core-rule-before-production'],
  providerCalls:0,releaseVerdict:'not-approved'};
}
module.exports={review};
