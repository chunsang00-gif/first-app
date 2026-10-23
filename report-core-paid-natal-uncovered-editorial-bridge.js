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
 // Two distinct editor-only revisions, not a blind swap of 'resources'
 // and 'responsibility'. Every practical scene is hypothetical and
 // explicitly bounded by the source-matched classical condition.
 const explanation=single?
  '태어난 달에서 바탕이 되는 글자는 해·달·시간의 겉에 나타나지 않습니다. 대신 책임과 정해진 기준을 뜻하는 다른 글자가 태어난 달의 겉에 드러났습니다. 이 고전의 해당 사례가 읽는 출발점을 바꾸는 이유는 바로 이 차이입니다.':
  '태어난 달의 바탕 글자가 해의 겉에도 나타나고, 역할과 규칙을 뜻하는 다른 글자는 달의 겉에 함께 드러납니다. 이 고전의 해당 사례에서는 바탕 글자가 실제로 드러난 조건 때문에 자원의 뜻을 먼저 다루고 책임의 뜻을 이어서 읽습니다.';
 const conditional=single?
  '새로운 관리 업무를 제안받았다고 가정해 보겠습니다. 이 풀이에서 먼저 따질 것은 직책의 이름이나 급여가 아니라 결정할 권한과 지켜야 할 기준이 얼마나 명확한지입니다. 다만 권한만 따지고 일을 수행할 사람과 도구를 놓치면 책임을 해석하는 데 필요한 현실 조건이 빠집니다.':
  '새 프로젝트를 맡아달라는 제안을 받았다고 가정해 보겠습니다. 이 풀이의 첫 비교 대상은 그 일에 투입할 사람과 예산이며, 그 범위가 확인된 뒤에 어느 부분까지 책임질 수 있는지 연결해 볼 수 있습니다. 반대로 직책이나 맡을 일만 앞세우고 필요한 자원을 확인하지 않으면 이 고전 사례에서 먼저 본 조건을 놓칩니다.';
 const rootPositions=[...new Set(structural.evidence.rootRefs.map(id=>
  id.split('.')[1]))];
 const place={year:'태어난 해',month:'태어난 달',day:'태어난 날',
  hour:'태어난 시간'};
 const rootEvidence=rootPositions.length?
  '태어난 날의 기준과 같은 종류의 글자도 '+rootPositions.map(p=>place[p]).join('·')+
   '의 안쪽에서 확인됩니다. 하지만 이 대응을 근거로 앞서 본 의미의 순서를 자동으로 바꾸거나 어느 뜻이 강하다고 말할 수는 없습니다.':
  '태어난 날의 기준과 같은 종류의 글자는 확인된 네 자리 안쪽에서 찾지 못했습니다. 이 부재만으로 앞서 본 의미가 약하거나 강하다고 말할 수는 없습니다.';
 const branchUncertainty=cardinality.completeGroupEntryCount>0?
  '출생월이 포함된 자리 조합이 별도로 확인됐습니다. 이 관계가 위 풀이의 우선순위를 바꾸는지는 아직 판단하지 않았습니다.':
  cardinality.independentPairContactCount>1?
   '출생월과 다른 자리 사이에 둘 이상의 독립적인 관계가 표시됩니다. 그 관계들을 어떻게 종합할지는 추가 검토가 필요합니다.':
  cardinality.hasDuplicateLabelsForSameTwoPositions?
   '같은 두 출생 자리에 관계표 이름이 여럿 붙어 있습니다. 이름 개수를 실제 작용 횟수로 세거나 어느 것이 우선하는지 단정할 수 없습니다.':
   '달 이외의 출생 자리가 이 풀이의 우선순위를 바꾸는지 판단할 근거는 아직 충분하지 않습니다.';
 // Editorial comparison is made against the PRE-EXISTING candidate. It is
 // review evidence, never an automatic assessment of saleable depth.
 const shortSentences=t=>t.split(/[.!?。！？]+/).map(x=>x.trim())
  .filter(x=>x.length>=18);
 const oldSentences=new Set(shortSentences(found.text));
 const revisedText=explanation+' '+conditional+' '+rootEvidence+' '+branchUncertainty;
 const repeatedSentences=shortSentences(revisedText)
  .filter(x=>oldSentences.has(x));
 const interpretiveCaseDraft={
  kind:'qa-classical-case-conditional-manuscript-v1',
  label:single?'기준을 먼저 살피는 경우':'자원을 먼저 살피는 경우',
  text:revisedText,
  replacesClassicalCandidateKind:found.kind,
  sourceRefs:[...new Set([...refs,...observed.sourceRefs,
   ...structural.evidence.rootRefs,
   ...(cardinality.pairTableEntryCount||cardinality.completeGroupEntryCount?
    ['facts.natalBranchRelations']:[])])],
  textualOrdering:single?'responsibility-before-resources':
   'resources-before-responsibility',
  readerReasoning:{monthPremise:explanation,conditionalScenario:conditional,
   rootObservation:rootEvidence,branchUncertainty,
   coreReadingIsConditional:true,verifiedPersonalBehavior:false},
  competingFullChartEvidenceStillUnresolved:true,
  independentlyReviewed:false,customerReady:false,
  releaseVerdict:'not-approved'
 };
 if(!interpretiveCaseDraft.sourceRefs.every(id=>
     structural.sourceRefs.includes(id)||refs.includes(id))||
    language.errors([interpretiveCaseDraft.label,interpretiveCaseDraft.text]).length||
    repeatedSentences.length>0||
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
  editorialComparison:{
   kind:'qa-original-vs-revised-classical-reader-v1',
   originalChars:found.text.length,revisedChars:revisedText.length,
   exactFullSentenceReuseCount:repeatedSentences.length,
   originalScope:'narrow-source-matched-classical-example',
   revisionScope:'case-specific-explanation-and-opposing-chart-conditions',
   personalInsightValidated:false,saleableQualityEstablished:false,
   humanReviewStillRequired:true,releaseVerdict:'not-approved'},
  curatedCoreStillMissing:true,
  needs:['professional-textual-interpretive-method-check',
   'full-chart-competing-relationships-review','individual-reader-value-review',
   'separate-curated-core-rule-before-production'],
  providerCalls:0,releaseVerdict:'not-approved'};
}
module.exports={review};
