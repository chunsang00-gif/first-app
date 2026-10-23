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
const sourceMethod=require('./report-core-paid-natal-classical-method-applicability');
const conflictReview=require('./report-core-paid-natal-conflict-abstention');
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
 // Counterfactuals are source-text applicability boundaries, not proof
 // that an actual person's work, character or future changes with a stem.
 // Both cases share a Xin day and Yin month. Only non-day visible Jia
 // differs; exposing Wu creates a third competing condition and abstention.
 const reversalCondition=single?
  '같은 달에 태어나도 바탕 글자가 해나 시간의 겉에 드러나면, 이 고전은 자원의 뜻을 먼저 읽는 다른 사례를 제시합니다. 이때 지금의 설명을 그대로 적용해서는 안 됩니다.':
  '반대로 달의 바탕 글자가 해·달·시간의 겉에 전혀 드러나지 않는다면, 이 고전에서는 기준과 책임의 뜻을 먼저 보는 다른 사례가 됩니다. 지금의 순서를 그대로 적용해서는 안 됩니다.';
 const competingExposure=single?
  '달에 숨어 있는 또 다른 글자까지 해나 시간의 겉에서 확인된다면, 지금의 책임 중심 설명만으로 결론을 정할 수 없습니다.':
  '달의 바탕 글자와 규칙의 글자 외에 세 번째 숨은 글자가 겉에 드러난다면, 지금의 자원 중심 설명을 그대로 유지할지 추가 검토해야 합니다.';

 const rootPositions=[...new Set(structural.evidence.rootRefs.map(id=>
  id.split('.')[1]))];
 const place={year:'태어난 해',month:'태어난 달',day:'태어난 날',
  hour:'태어난 시간'};
 const rootEvidence=rootPositions.length?
  '태어난 날의 기준과 같은 종류의 글자는 '+rootPositions.map(p=>place[p]).join('·')+
   '의 안쪽에도 있습니다. 이 대응은 '+(single?
    '역할과 규칙을 먼저 읽는 출발 조건과는 별개이므로, 실제 책임감의 크기를 뜻하지 않습니다.':
    '자원에 관한 뜻을 먼저 읽는 조건과는 별개이므로, 돈이나 업무 성과를 예상하는 근거가 아닙니다.'):
  single?
   '태어난 날의 기준과 같은 종류의 기운은 확인된 네 자리 안쪽에서 찾지 못했습니다. 그렇다고 이 부재가 책임과 규칙을 먼저 읽어야 한다는 독립적인 증거가 되는 것은 아닙니다.':
   '태어난 날의 기준과 같은 종류의 기운은 확인된 네 자리 안쪽에서 찾지 못했습니다. 이 사실은 자원의 뜻을 먼저 보는 고전의 조건과 별개이며 실제 재물 능력의 평가도 아닙니다.';
 const branchUncertainty=cardinality.completeGroupEntryCount>0?
  (single?
   '출생월을 포함하는 자리 조합도 확인되지만, 이 관계가 책임을 먼저 읽는 순서를 바꿀지는 별도의 검토가 필요합니다.':
   '출생월을 포함하는 자리 조합도 확인되지만, 이 관계가 자원을 먼저 읽는 순서를 바꿀지는 별도의 검토가 필요합니다.'):
  cardinality.independentPairContactCount>1?
   (single?
    '출생월에 연결된 여러 자리의 관계는 책임 중심의 해석에 다른 조건이 될 수 있지만 실제 우선순위는 확정하지 않았습니다.':
    '출생월에 연결된 여러 자리의 관계는 자원 중심의 해석에 다른 조건이 될 수 있지만 실제 우선순위는 확정하지 않았습니다.'):
  cardinality.hasDuplicateLabelsForSameTwoPositions?
   (single?
    '같은 두 자리의 관계표에 이름이 여러 개 있어도 책임을 먼저 보는 해석의 우선순위는 확정할 수 없습니다.':
    '같은 두 자리의 관계표에 이름이 여러 개 있어도 자원을 먼저 보는 해석의 우선순위는 확정할 수 없습니다.'):
   (single?
    '달 이외의 출생 자리를 모두 종합해도 책임을 먼저 읽는 순서가 유지될지는 아직 결론내리지 않았습니다.':
    '달 이외의 출생 자리를 모두 종합해도 자원을 먼저 읽는 순서가 유지될지는 아직 결론내리지 않았습니다.');
 // Editorial comparison is made against the PRE-EXISTING candidate. It is
 // review evidence, never an automatic assessment of saleable depth.
 const shortSentences=t=>t.split(/[.!?。！？]+/).map(x=>x.trim())
  .filter(x=>x.length>=18);
 const oldSentences=new Set(shortSentences(found.text));
 const revisedText=explanation+' '+conditional+' '+reversalCondition+' '+competingExposure+' '+rootEvidence+' '+branchUncertainty;
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
   sourceConditionCounterfactual:reversalCondition,
   thirdHiddenStemCompetingCase:competingExposure,
   rootObservation:rootEvidence,branchUncertainty,
   coreReadingIsConditional:true,verifiedPersonalBehavior:false},
  textualApplicabilityCannotBeGeneralized:true,
  rejectedCounterfactualIsAChartConditionNotPredictedBehavior:true,
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
 const applicability=sourceMethod.evaluate(packet);
 const expectedPublishedCase=single?
  'xin-yin-bing-only-month-command-change':
  'xin-yin-jia-and-bing-coexposed-month-main-plus-authority';
 if(applicability.textuallyMatchedExample!==expectedPublishedCase||
    applicability.status!=='exact-textual-conditions-only'||
    applicability.chosenCommercialTraditionalSchool!==null||
    applicability.finalPatternSelected!==false||
    applicability.readyForCustomer!==false)
  throw Error('QA_UNCOVERED_CLASSICAL_CASE_NOT_VERIFIED');
 const conflicts=conflictReview.inspect(packet);
 if(conflicts.conclusion!=='abstain-from-full-chart-interpretation'||
    conflicts.downstreamPaidApproval!==false||
    conflicts.documentedClassicalFirstRole!==applicability.textualCaseFirstRole)
  throw Error('QA_UNCOVERED_CONFLICT_PRIORITY_LEAK');
 const contextualReview={
  status:'full-chart-structural-comparison-only',
  competingMethodEvidence:conflicts,
  sourceBoundClassicalMethod:applicability,
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
