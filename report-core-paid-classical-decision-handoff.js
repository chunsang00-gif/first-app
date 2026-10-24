'use strict';
// OFFLINE expert method-decision worksheet; NEVER a paid Saju interpretation.
// Exact classical conditions do not determine a chart's full traditional
// pattern, personal traits, life events, or willingness to pay.
const classical=require('./report-core-paid-natal-classical-method-applicability');
const month=require('./report-core-paid-natal-month-method-review');
const conflict=require('./report-core-paid-natal-conflict-abstention');
const visibleDirections=require('./report-core-paid-natal-mixed-visible-reconciliation');
const boundaries=require('./report-core-paid-natal-interpretation-boundary');
const earthCommentary=require('./report-core-paid-natal-three-punishment-commentary');
const {LunarUtil}=require('lunar-javascript');
const names={'比肩':'비견','劫财':'겁재','食神':'식신','伤官':'상관',
 '偏财':'편재','正财':'정재','七杀':'편관','正官':'정관',
 '偏印':'편인','正印':'정인'};
function checkCalculatedRoles(packet){
 const day=packet.chart.day?.[0];
 for(const position of ['year','month','hour']){
  const stem=packet.chart[position]?.[0];
  const expected=names[LunarUtil.SHI_SHEN[day+stem]];
  const actual=packet.facts?.tenGods?.[position];
  if(!expected||actual?.stem!==stem||actual.stemTenGod!==expected)
   throw Error('QA_METHOD_HANDOFF_FALSE_CALCULATED_ROLE:'+position);
 }
}

// Map WHAT was observed to the relevant unanswered expert METHOD question.
// Multiple labels on one branch pair are not multiple independent effects.
// None of these conditions proves that one traditional method should prevail.
const REVIEW_THEMES=Object.freeze({
 'resolve-month':new Set([
  'month-main-and-other-hidden-both-visible',
  'other-month-hidden-exposed-without-main',
  'multiple-competing-non-main-visible-stems',
  'approximate-governing-day-outside-canonical-hidden-stems',
  'approximate-governing-day-differs-from-month-main',
  'day-master-only-match-is-not-non-day-exposure'
 ]),
 'resolve-other-positions':new Set([
  'multiple-relation-labels-for-one-month-pair',
  'more-than-one-independent-month-branch-pair',
  'month-included-in-branch-group',
  'visible-generating-and-controlling-pairs-coexist',
  'chapter11-symbol-relation-requires-full-chart-method-review',
  'chapter9-officer-output-rescue-condition-must-be-considered',
  'visible-rescue-and-unresolved-month-branch-relations-coexist'
 ]),
 'review-counterexample':new Set([
  'source-specific-classical-example-needs-whole-chart-review',
  'multiple-competing-non-main-visible-stems',
  'month-main-and-other-hidden-both-visible',
  'other-month-hidden-exposed-without-main'
 ])
});
const QUESTIONS=[
 ['choose-school','어느 전통 해석 체계를 선택하고 그 근거 문헌은 무엇인가?'],
 ['resolve-month','태어난 달의 기본 글자·겉에 드러난 글자·사령 자료 사이에서 무엇을 우선할 것인가?'],
 ['resolve-other-positions','해·날·시간의 다른 관계가 해당 우선순위를 바꿀 수 있는가?'],
 ['review-counterexample','기본 글자가 드러나지 않거나 세 번째 숨은 글자가 드러나면 이 결론은 유지되는가?'],
 ['review-reader-value','고전 분류 순서에서 독자의 구체적인 생활 해석으로 넘어가는 추가 근거는 무엇인가?']
];

// Independent classical references are NOT a single selected interpretation.
// Qiong Tong Bao Jian's "twelfth month" means the Chou solar-term month,
// not the numeric lunar birth month. Historical outcome words are NOT facts
// about the user's personality, health, career, income or future.
function reviewOtherClassicalSourceConditions(packet,monthScope){
 const chart=packet.chart,branch=chart.month[1];
 const season=require('./report-seasonal-evidence');
 const rows=Object.fromEntries(require('./report-fact-bindings')
  .build(packet).map(r=>[r.id,r]));
 const positions=['year','month','day','hour'];
 const visible=new Map(),hidden=new Map();
 for(const p of positions){
  const pillar=chart[p],stem=pillar[0],id='natal.'+p+'.stem',row=rows[id];
  if(!row||row.stem!==stem||
     row.interpretationScope!=='traditional-symbol-only')
   throw Error('QA_CLASSICAL_DIFFERENT_SCHOOL_VISIBLE_LEDGER_DRIFT:'+p);
  if(!visible.has(stem))visible.set(stem,[]);
  visible.get(stem).push(id);
  for(const character of season.HIDDEN[pillar[1]]||[]){
   const h='natal.'+p+'.hidden.'+character,src=rows[h];
   if(!src||src.stem!==character||
      src.interpretationScope!=='traditional-symbol-only')
    throw Error('QA_CLASSICAL_DIFFERENT_SCHOOL_HIDDEN_LEDGER_DRIFT:'+h);
   if(!hidden.has(character))hidden.set(character,[]);
   hidden.get(character).push(h);
  }
 }
 const v=s=>visible.get(s)||[],h=s=>hidden.get(s)||[];
 const yiChou=chart.day[0]==='乙'&&branch==='丑';
 const dayHourMatch=chart.day==='乙未'&&chart.hour==='癸未';
 const otherDayHourMatch=chart.day==='乙未'&&chart.hour==='丙戌';
 const winter=['亥','子','丑'].includes(branch);
 if(yiChou&&(monthScope?.monthMainSourceId!=='natal.month.hidden.己'||
   !monthScope.otherExposedHiddenSourceIds.includes('natal.month.hidden.癸')))
  throw Error('QA_CLASSICAL_YI_CHOU_MONTH_PROVENANCE_INVALID');
 const climate=yiChou?{
  work:'窮通寶鑑',chapter:'十二月乙木',
  url:'https://luckclub.cn/bazi/004/024/',
  tradition:'climate-adjustment-not-month-pattern-priority',
  dayStem:'乙',monthBranch:'丑',
  historicalTwelfthMonthMeansSolarTermChouMonth:true,
  sourceEmphasizes:'丙',
  observedBingVisibleRefs:v('丙').slice(),
  observedBingHiddenRefs:h('丙').slice(),
  observedGuiVisibleRefs:v('癸').slice(),
  observedDingHiddenRefs:h('丁').slice(),
  bingExposed:v('丙').length>0,guiExposed:v('癸').length>0,
  // The cited favorable clause requires BOTH conditions, not just Bing.
  bingExposedWithoutGui:v('丙').length>0&&v('癸').length===0,
  favorableHistoricalCompoundConditionMatched:
   v('丙').length>0&&v('癸').length===0,
  dingHiddenMustNotBeCountedAsBing:true,
  notSameAsMonthCommandHiddenExposure:true,
  historicalFortuneClaimAllowedForCustomer:false,
  actualQiStrengthOrUsefulGodEstablished:false,
  interpretationMethodApproved:false
 }:null;
 const dayHour=dayHourMatch?{
  work:'三命通會',chapter:'卷八·六乙日癸未時斷',
  url:'https://zh.wikisource.org/zh-hant/%E4%B8%89%E5%91%BD%E9%80%9A%E6%9C%83/%E5%8D%B7%E5%85%AB',
  requiredDayPillar:'乙未',requiredHourPillar:'癸未',
  observedWinterMonth:winter,winterSourceClauseMatched:winter,
  sourceContainsSeasonalHistoricJudgment:'冬安穩',
  // The section's general '乙日癸未時' verse is NOT the narrower
  // '乙未日癸未時' winter sentence. A nearby '乙丑日' line is also
  // inapplicable despite the native chart's month branch being 丑.
  generalYiDayHourVerseSeparateFromExactYiWeiDay:true,
  nearbyYiChouDayPassageExcluded:true,
  exactVerseForThisDayAndHour:true,
  historicalTextNotPrediction:true,
  sourceRefs:['natal.day.stem','natal.day.hidden.乙',
   'natal.hour.stem','natal.hour.hidden.乙',
   'facts.seasonalEvidence'],
  fullYearAndMonthConditionalEffectsNotResolved:true,
  personallyObservedTemperament:false,approvedPaidInsight:false
 }:null;
 // Previously the 20:20 case was omitted because it did not match Gui/Wei.
 // But the SAME original volume contains a separate Yi-Wei day/Bing-Xu
 // hour row. A different verse is not absence of a direct precedent.
 const alternativeDayHour=otherDayHourMatch?{
  work:'三命通會',chapter:'卷八·六乙日丙戌時斷',
  url:'https://zh.wikisource.org/zh-hant/%E4%B8%89%E5%91%BD%E9%80%9A%E6%9C%83/%E5%8D%B7%E5%85%AB',
  requiredDayPillar:'乙未',requiredHourPillar:'丙戌',
  section:'六乙日丙戌時斷',exactSubcase:'乙未日丙戌時',
  historicalPhrase:'旺處凶。卯午未戌年月，貴顯。',
  listedYearMonthBranches:['卯','午','未','戌'],
  actualYearBranch:chart.year[1],actualMonthBranch:branch,
  listedContainsYearBranch:['卯','午','未','戌'].includes(chart.year[1]),
  listedContainsMonthBranch:['卯','午','未','戌'].includes(branch),
  doesNotAuthorizeSimpleYearOrMonthRule:true,
  yearMonthGrammarAndOtherConditionsNotResolved:true,
  historicalGoodOrBadFortuneNotObserved:true,
  cannotBorrowGuiWeiWinterClause:true,
  sourceRefs:['natal.year.stem','natal.month.stem',
   'natal.day.stem','natal.hour.stem',
   'facts.seasonalEvidence'],
  approvedPaidInsight:false
 }:null;
 return {
  kind:'qa-independent-classical-source-eligibility-v1',
  chart:{...chart},
  monthPatternTextualWorkedCaseMatched:
   Boolean(monthScope.exactWorkedClassicalExampleMatched),
  climate,exactDayHour:dayHour,
  alternativeExactDayHour:alternativeDayHour,
  exactClassicalDayHourForThisChart:dayHour?{
   type:'yi-wei-gui-wei-winter',url:dayHour.url
  }:alternativeDayHour?{
   type:'yi-wei-bing-xu-year-month-qualifier-unresolved',
   url:alternativeDayHour.url
  }:null,
  rulesAreAlternativeFrameworksNotOneUnifiedPattern:true,
  climatePriorityVsMonthExposure:'not-selected',
  dayHourHistoricalVerdictVsActualLife:'not-established',
  dayAndMonthCycleFromSolarTerms:true,
  readerFacingPromiseAuthorized:false,
  humanExpertNeedsToReconcileSources:true,
  paidWriterAuthorized:false,providerCalls:0,releaseVerdict:'not-approved'
 };
}

function build(packet){
 if(packet?.status!=='ready'||!packet.chart?.hour)
  throw Error('QA_METHOD_HANDOFF_FULL_CHART_REQUIRED');
 checkCalculatedRoles(packet);
 const x=classical.evaluate(packet),m=month.assess(packet);
 const competing=conflict.inspect(packet);
 const general=x.generalMonthRule;
 const independentTexts=reviewOtherClassicalSourceConditions(packet,general);
 if(independentTexts.readerFacingPromiseAuthorized!==false||
    independentTexts.paidWriterAuthorized!==false||
    independentTexts.rulesAreAlternativeFrameworksNotOneUnifiedPattern!==true)
  throw Error('QA_METHOD_HANDOFF_PREMATURE_CROSS_SCHOOL_CONCLUSION');
 // Unlike a literal month-hidden stem exposure, an identical *element*
 // elsewhere does NOT mean the same hidden character was exposed.
 // The visible three-stem relation has to be checked separately from
 // classical month-command applicability. This may change when hour changes.
 const visibleReview=visibleDirections.review(packet);
 if(visibleReview.kind!=='qa-three-visible-mixed-elemental-relations-v1'||
    visibleReview.finalTraditionalPattern!==null||
    visibleReview.noWinnerChosen!==true||
    visibleReview.notOffsettingForces!==true||
    visibleReview.customerReady!==false||
    visibleReview.strengthOrPracticalEffectInferred!==false||
    visibleReview.providerCalls!==0||
    visibleReview.edges.length!==3||
    visibleReview.edges.some(e=>e.relativePriority!=='not-assessed'||
     e.realizedInfluence!=='not-assessed')||
    visibleReview.counts.generating+visibleReview.counts.restricting+
     visibleReview.counts.sameElement!==3)
  throw Error('QA_METHOD_HANDOFF_UNVERIFIED_VISIBLE_INTERACTION');
 if(general?.kind!=='qa-general-month-hidden-exposure-structural-analogy-v1'||
    general.methodPriority!=='not-selected'||
    general.authorizedForPaidWriter!==false||
    general.exactWorkedClassicalExampleMatched!==Boolean(x.textuallyMatchedExample)||
    JSON.stringify(general.otherExposedHiddenSourceIds)!==
     JSON.stringify(m.observed.exactExposureScopeComparison
      .nonDayExposedHiddenStemIds.filter(id=>
       id!==m.observed.mainHiddenStemSourceId))||
    general.monthMainSourceId!==m.observed.mainHiddenStemSourceId)
  throw Error('QA_METHOD_HANDOFF_GENERAL_RULE_FACTS_DIVERGED');
 const earth=earthCommentary.inspect(packet);
 if(competing.conclusion!=='abstain-from-full-chart-interpretation'||
    competing.downstreamPaidApproval!==false||competing.providerCalls!==0||
    competing.finalTraditionalPattern!==null||
    competing.adoptedMonthMethod!==null||
    competing.noDetectedTensionsProvesDominantPattern!==false||
    competing.calculatedFacts.monthMainSourceId!==
     m.observed.mainHiddenStemSourceId||
    JSON.stringify(competing.calculatedFacts.nonDayVisibleMonthHiddenSourceIds)!==
     JSON.stringify(m.observed.exactExposureScopeComparison.nonDayExposedHiddenStemIds)||
    competing.documentedClassicalFirstRole!==x.textualCaseFirstRole)
  throw Error('QA_METHOD_HANDOFF_CONFLICT_EVIDENCE_MISMATCH');
 if(x.providerCalls!==0||x.finalPatternSelected!==false||
    x.chosenCommercialTraditionalSchool!==null||
    x.professionReviewed!==false||m.adoptedMethodId!==null||
    m.canApproveDeepSajuInterpretation!==false)
  throw Error('QA_METHOD_HANDOFF_UNAPPROVED_SCOPE_REQUIRED');
 const one='xin-yin-bing-only-month-command-change';
 const two='xin-yin-jia-and-bing-coexposed-month-main-plus-authority';
 const caseId=x.textuallyMatchedExample;
 if(caseId!==null&&caseId!==one&&caseId!==two)
  throw Error('QA_METHOD_HANDOFF_UNRECOGNIZED_TEXTUAL_CASE');
 const src=x.observedConditions;
 const single=caseId===one,dual=caseId===two;
 if(caseId&&(src.dayStem!=='辛'||src.monthBranch!=='寅'||
   !src.exposedSecondaryPositionRefs.includes('natal.month.stem')||
   src.thirdMonthHiddenStemExposedRefs.length!==0||
   (single?src.exposedMainPositionRefs.length!==0:
    src.exposedMainPositionRefs.length===0)))
  throw Error('QA_METHOD_HANDOFF_FALSE_TEXTUAL_MATCH');
 const referenceIds=new Set([
  ...require('./report-fact-bindings').build(packet).map(x=>x.id),
  'facts.stemConnections','facts.seasonalEvidence',
  'facts.governingDayDiagnostic','facts.natalBranchRelations'
 ]);
 const unresolvedConditions=competing.findings.map(f=>{
  if(f.relativePriority!=='not-assessed'||
     f.impactOnActualLife!=='not-established'||
     !Array.isArray(f.sourceRefs)||!f.sourceRefs.length||
     f.sourceRefs.some(id=>!referenceIds.has(id)))
   throw Error('QA_METHOD_HANDOFF_UNVERIFIED_CONFLICT:'+f.id);
  return {id:f.id,sourceRefs:f.sourceRefs.slice(),
   structuralEvidence:structuredClone(f.observed),
   priority:'not-assessed',actualLifeEffect:'not-established'};
 });
 if(unresolvedConditions.length!==competing.distinctObservedTensions)
  throw Error('QA_METHOD_HANDOFF_FINDING_COUNT_DRIFT');
 // This is a source-applicability screen, not an automatic pattern choice.
 // The classical worked Xin/Yin case cannot determine an Yi/Chou chart.
 const groupRows=m.observed.natalRelationsTouchingMonth.groups;
 const branchCounts=m.observed.natalRelationsTouchingMonth.relationshipCardinality;
 const methodApplicabilityDecision={
  kind:'qa-natal-method-source-scope-decision-v1',
  chart:{day:packet.chart.day,month:packet.chart.month,
   hour:packet.chart.hour},
  applicable:{
   generalMonthVisibility:general.conditionObserved?{
    status:'candidate-only-not-interpretive-conclusion',
    sourceUrl:general.sourceUrl,
    monthMainSourceId:general.monthMainSourceId,
    alternativeMonthSourceIds:general.otherExposedHiddenSourceIds.slice(),
    alternativeVisiblePositions:general.otherCandidateRoles.map(c=>({
     sourceId:c.sourceId,role:c.symbolicTenGodCategory,
     visibleAt:c.exposedAt.slice()})),
    firstRoleSelected:false
   }:null
  },
  excluded:{
   literalXinYinWorkedRule:caseId?null:{
    status:'excluded-no-literal-classical-case-match',
    requiredDayStem:'辛',requiredMonthBranch:'寅',
    observedDayStem:packet.chart.day[0],
    observedMonthBranch:packet.chart.month[1],
    transferredClassicalConclusionAllowed:false
   },
   completedMonthBranchGroup:groupRows.length?null:{
    status:'excluded-no-complete-month-three-position-group',
    observableMonthGroupCount:0,
    relevance:'no-completed-three-branch-group-transformation-to-rank'
   }
  },
  unresolved:{
   // These three position pairs are five-element TABLE relationships, not
   // rankings or an approved interpretation of this person's actions.
   otherPillarVisibleInteractions:{
    sourceRefs:visibleReview.sourceRefs.slice(),
    calculatedPairs:visibleReview.edges.map(e=>({
     leftId:e.from,rightId:e.to,
     firstTraditionalCategory:e.fromCategory,
     secondTraditionalCategory:e.toCategory,
     elementalRelation:e.elementalDirection,
     relationClass:e.class,
     priority:'not-assessed',realizedEffect:'not-established'
    })),
    pairCounts:{...visibleReview.counts},
    sameElementDoesNotMeanIdenticalHiddenStem:true,
    changedHourCannotSelectDominantDirection:true,
    noPersonalityOrOccupationDerived:true,
    relativePriority:'not-assessed'
   },
   governingStem:'not-verified',
   monthMethodPriority:'not-selected',
   otherPillarBranchRelations:{
    independentMonthContacts:branchCounts.independentPairContactCount,
    monthPairTableLabels:branchCounts.pairTableEntryCount,
    completeMonthGroups:groupRows.length,
    traditionalPriority:'not-assessed'
   },
   personalityOrLifeOutcome:'not-established'
  },
  singleVisibleStemIsNotProofOfPattern:true,
  repeatedVisibleStemDoesNotAddPriorityWeight:true,
  commerciallyAdoptedMethod:null,
  allowedInPaidWriter:false,customerReady:false,
  providerCalls:0,releaseVerdict:'not-approved'
 };
 if(general.conditionObserved&&
   (general.otherCandidateRoles.length!==1||
    methodApplicabilityDecision.applicable.generalMonthVisibility
     .alternativeMonthSourceIds[0]!==general.otherCandidateRoles[0].sourceId))
  throw Error('QA_NATAL_METHOD_SOURCE_SCREEN_CANDIDATE_DIVERGED');
 const decision=caseId?{
  caseId,work:x.sourceDocuments[0].work,
  chapter:x.sourceDocuments[0].chapter,url:x.sourceDocuments[0].url,
  firstTraditionalCategory:x.textualCaseFirstRole,
  supplementaryCategory:x.textualCaseSecondaryRole,
  evidenceRefs:[src.computedMainHiddenSourceId,'natal.day.stem',
   ...src.exposedMainPositionRefs,...src.exposedSecondaryPositionRefs],
  pointOfDeparture:single?
   '달의 기본 글자가 겉으로 드러나지 않고 다른 숨은 글자가 드러난 해당 고전 사례에서는 해석 출발점이 바뀐다.':
   '달의 기본 글자와 다른 숨은 글자가 함께 겉에 드러난 해당 고전 사례에서는 기본 분류를 먼저 검토한다.',
  fullChartConclusionEstablished:false,observedPersonality:false
 }:null;
 const result={
  kind:'qa-source-specific-traditional-method-handoff-v1',
  status:single?'single-secondary-exposure-textual-case-only':
   dual?'main-plus-secondary-exposure-textual-case-only':
   'no-published-textual-case-matches-this-chart',
  calculatedScope:{dayStem:src.dayStem,monthBranch:src.monthBranch,
   mainHiddenSourceId:src.computedMainHiddenSourceId,
   mainVisiblePositions:src.exposedMainPositionRefs.slice(),
   secondaryVisiblePositions:src.exposedSecondaryPositionRefs.slice(),
   competingThirdVisiblePositions:src.thirdMonthHiddenStemExposedRefs.slice(),
   dayStemIsClassificationAnchor:true},
  exactTextualDecision:decision,
  generalMonthRule:structuredClone(general),
  independentClassicalSourceEligibility:independentTexts,
  // Legacy .status concerns ONLY the Xin/Yin month-command worked example.
  monthWorkedExampleStatusOnly:true,
  methodApplicabilityDecision,
  // The generic principle is relevant to a wider class of charts. Matching
  // its structural QUESTION is not matching either explicit Xin/Yin example.
  principleLevelCandidateStatus:general.scopeStatus,
  candidates:m.methodCandidates.map(row=>({id:row.id,status:row.status,
   sourceRefs:row.rowIds.slice(),priority:row.interpretivePriority})),
  // The editor now receives chart-SPECIFIC unresolved observations, not
  // just identical checkboxes. A table count is not a life-event count.
  unresolvedConditions,
  unresolvedConditionCount:unresolvedConditions.length,
  methodEvidenceProvenance:'deterministic-qa-conflict-review',
  noDetectedConflictsCannotApproveMethod:true,
  monthBranchContactCount:competing.calculatedFacts.independentMonthContacts,
  monthBranchTableLabelCount:competing.calculatedFacts.monthBranchTableEntries,
  // An explicitly named Earth-triad category appears in XU's commentary,
  // not explicitly in Shen's quoted original sentence; do not conflate.
  earthThreePunishmentSourceReview:earth,
  expertDecisions:QUESTIONS.map(([id,question])=>({
   id,question,status:'pending',decision:null,sourceCitation:null,
   relevantConditions:unresolvedConditions
    .filter(f=>REVIEW_THEMES[id]?.has(f.id))
    .map(f=>({id:f.id,sourceRefs:f.sourceRefs.slice()})),
   generalTextualPrincipleCandidates:id==='resolve-month'&&
    general.conditionObserved?[{
     id:'general-month-nonmain-exposure',
     sourceUrl:general.sourceUrl,
     monthMainSourceId:general.monthMainSourceId,
     competingSourceIds:general.otherExposedHiddenSourceIds.slice(),
     visibleCandidateRoles:structuredClone(general.otherCandidateRoles),
     exactClassicalCaseMatched:general.exactWorkedClassicalExampleMatched,
     traditionalPriority:'not-selected',
     customerConclusionApproved:false
    }]:[],
   commentaryOnlyConditions:id==='resolve-other-positions'&&
    earth.chartHasAllThreeEarthBranches?[{
     id:'xu-commentary-earth-three-punishment',
     sourceRefs:['facts.natalBranchRelations'],
     commentator:earth.attribution.laterCommentary.commentator,
     commentaryUrl:earth.attribution.laterCommentary.url,
     originalDoesNotExplicitlyNameTriad:true,
     interpretivePriority:'not-assessed',
     anyLifeEffectVerified:false
    }]:[],
   independentlyMatchedClassicalTexts:id==='choose-school'?[
    ...(independentTexts.climate?[{
     id:'qiong-tong-bao-jian-yi-chou-climate',
     url:independentTexts.climate.url,
     historicalCompoundConditionMatched:
      independentTexts.climate.favorableHistoricalCompoundConditionMatched,
     methodApproved:false
    }]:[]),
    ...(independentTexts.exactDayHour?[{
     id:'san-ming-tong-hui-yi-wei-gui-wei',
     url:independentTexts.exactDayHour.url,
     historicallyMatchedDayAndHour:true,
     humanLifeResultValidated:false
    }]:[]),
    ...(independentTexts.alternativeExactDayHour?[{
     id:'san-ming-tong-hui-yi-wei-bing-xu',
     url:independentTexts.alternativeExactDayHour.url,
     historicallyMatchedDayAndHour:true,
     historicYearMonthQualifiedVerdictNotApproved:true,
     humanLifeResultValidated:false
    }]:[])
   ]:[],
   chartSpecificEvidenceSupplied:true
  })),
  nextAction:'human-specialist-choose-method-then-review-reader-manuscript',
  transferToOtherBirthChartsForbidden:true,
  personSpecificPredictionVerified:false,methodApproved:false,
  humanReviewComplete:false,releaseVerdict:'not-approved',
  customerReady:false,readyForPaidModelProbe:false,providerCalls:0
 };
 result.readerInterpretationBoundary=boundaries.build(result);
 return result;
}
module.exports={build};
