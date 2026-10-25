'use strict';
// A non-billable editorial comparison against the REAL verified month-only
// core manuscript. Additional cited facts and different words are NOT
// evidence of professional Saju interpretation or customer value.
const core=require('./report-core-knowledge-engine');
const bindings=require('./report-fact-bindings');
const {overlap}=require('./report-core-paid-natal-depth-response-gate');
const INDEPENDENT=['natal.year.stem','natal.hour.stem'];
const getSentences=text=>String(text||'').split(/[.!?。！？\n]+/)
 .map(x=>x.replace(/\s+/g,' ').trim()).filter(x=>x.length>=22);
const sourceMeaning=r=>r?{id:r.id,position:r.position||null,
 classification:r.tenGod||null,meaning:r.traditionalMeaning||null}:null;
// This review is an independently edited EXACT chart manuscript, not a
// numerical similarity score and never the real product's free tier.
// Verify it against the checked-in canonical source on every use, so an
// arbitrary caller cannot claim "editorial review" by setting a boolean.
function semanticReview(packet,authored){
 if(authored==null)return {
  status:'not-independently-reviewed',comparedAgainstLiveFreeProduct:false,
  repeatedConceptIds:[],repeatedConceptCount:0,
  verifiedNewPersonalConclusion:false
 };
 const exact=require('./report-core-paid-one-adult-complete-first-chapter')
  .build(packet);
 const decision=authored?.valueDecision;
 if(!exact||authored.status!=='draft-for-human-review'||
    authored.readyForSale!==false||
    authored.text!==exact.text||
    JSON.stringify(decision)!==JSON.stringify(exact.valueDecision)||
    decision?.verdict!=='not-demonstrably-more-valuable-than-free'||
    decision?.comparedAgainstActualCoreText!==true||
    decision?.ordinaryPaidWriterReceivesTheseNewFacts!==false||
    decision?.personalizedConclusionBeyondFreeValidated!==false||
    decision?.userDecisionWouldChangeFromFree!==false||
    !Array.isArray(decision.repeatedReaderPropositions)||
    !decision.repeatedReaderPropositions.length||
    decision.repeatedReaderPropositions.some(x=>
     !x.id||!x.freeEvidence||!x.qaEvidence||
     x.strongerPersonalConclusionEstablished!==false))
  throw Error('QA_VALUE_DELTA_INVALID_OR_FORGED_SEMANTIC_REVIEW');
 return {
  status:'reviewed-repeated-meaning-no-independent-personal-judgment',
  source:'canonical-exact-chart-authored-proposition-audit',
  comparedAgainstLiveFreeProduct:false,
  repeatedConceptIds:decision.repeatedReaderPropositions.map(x=>x.id),
  repeatedConceptCount:decision.repeatedReaderPropositions.length,
  verifiedNewPersonalConclusion:false
 };
}
function assess(packet,computed,selected,draftKind,authoredReview=null){
 if(packet?.status!=='ready'||computed?.status!=='draft-for-human-review'||
    !['authored','machine'].includes(draftKind)||
    !Array.isArray(selected?.sourceRefs)||!selected.sourceRefs.length)
  throw Error('QA_VALUE_DELTA_INVALID_DRAFT');
 const baseline=computed.reader?.paragraphs?.strength?.text;
 const deep=computed.reader?.paragraphs?.[draftKind==='authored'?'fourPillar':'chartSynthesis']?.text;
 const month=computed.scope?.sourceIds||[];
 if(typeof baseline!=='string'||baseline.length<80||
    typeof deep!=='string'||deep.length<180||
    month.length!==2||month[0]!=='natal.month.stem'||
    !month[1].startsWith('natal.month.hidden.'))
  throw Error('QA_VALUE_DELTA_MONTH_COMPARATOR_INVALID');
 // Cross-check this really is the canonical month-only core returned for
 // these SAME facts. This prevents substituting a conveniently weak baseline.
 const comparison=core.compile(packet);
 if(comparison.status!=='draft-for-human-review'||
    comparison.ruleId!==computed.ruleId||
    comparison.reader.paragraphs.strength.text!==baseline)
  throw Error('QA_VALUE_DELTA_BASELINE_TAMPERED');
 const extra=selected.sourceRefs.filter(id=>!month.includes(id));
 if(!INDEPENDENT.every(id=>extra.includes(id))||
    !extra.includes('facts.stemConnections'))
  throw Error('QA_VALUE_DELTA_NO_INDEPENDENT_NATAL_PROVENANCE');
 const index=Object.fromEntries(bindings.build(packet).map(x=>[x.id,x]));
 const year=index['natal.year.stem'],hour=index['natal.hour.stem'];
 const main=index[month[1]],visible=index[month[0]];
 if(![year,hour,main,visible].every(r=>r?.tenGod&&r?.traditionalMeaning))
  throw Error('QA_VALUE_DELTA_MISSING_INDEPENDENT_MEANING');
 const distinctive=[year,hour].filter(r=>![visible.tenGod,main.tenGod].includes(r.tenGod));
 const baselineSentences=new Set(getSentences(baseline));
 const shared=getSentences(deep).filter(x=>baselineSentences.has(x));
 const eightGramOverlap=overlap(baseline,deep);
 if(!Number.isFinite(eightGramOverlap)||eightGramOverlap<0||eightGramOverlap>1)
  throw Error('QA_VALUE_DELTA_COMPARISON_FAILED');
 const hasScene=/(?:가정|예를 들|상황|프로젝트|업무|일을 맡|새 일을)/.test(deep);
 const describesTradeoff=/(?:반대로|그러나|하지만|다만|놓치|경계)/.test(deep);
 const hasAction=/(?:정리|구분|점검|확인|선택|비교|따져|살피)/.test(deep);
 const monthOnlyRepeats=shared.length>0||eightGramOverlap>0.55;
 if(authoredReview&&draftKind!=='authored')
  throw Error('QA_VALUE_DELTA_MACHINE_CANNOT_CLAIM_HUMAN_REVIEW');
 const semantic=semanticReview(packet,authoredReview);
 // Do not confuse textual novelty with new decisions. The current
 // 1982 adult first chapter repeats THREE month-core propositions even
 // when the string overlap is near zero.
 const repeatsReaderMeaning=semantic.repeatedConceptCount>0;
 const narratedIndividualDifference=year.tenGod!==hour.tenGod&&
   hasScene&&describesTradeoff&&hasAction&&!monthOnlyRepeats;
 return {
  kind:'qa-first-chapter-substantive-delta-v1',
  baselineKind:'actual-curated-month-pair-manuscript-not-a-paid-model-output',
  baselineAvailableAsLiveFreeProduct:false,
  comparisonIsOfflineEditorialBenchmark:true,
  baselineRuleId:computed.ruleId,
  baselineSourceRefs:month.slice(),
  extraSourceRefs:extra.slice(),
  dayMasterVisibleExplicitlyCited:extra.includes('natal.day.stem'),
  independentPositions:{
   year:sourceMeaning(year),hour:sourceMeaning(hour),
   monthVisible:sourceMeaning(visible),monthPrincipalHidden:sourceMeaning(main)
  },
  yearHourClassificationsDiffer:year.tenGod!==hour.tenGod,
  yearOrHourDistinctFromMonth:distinctive.map(r=>r.id),
  exactlyRepeatedLongSentences:shared.length,
  textOverlap8gram:Math.round(eightGramOverlap*1000)/1000,
  hasConcreteHypotheticalScene:hasScene,
  hasExplicitTradeoff:describesTradeoff,
  hasActionFraming:hasAction,
  textNearOrCopyingMonthCore:monthOnlyRepeats,
  independentlyReviewedSemanticOverlap:semantic,
  repeatsReaderMeaningDespiteDifferentWords:repeatsReaderMeaning,
  distinctReaderDecisionBeyondBaselineVerified:false,
  // An authored example with differentiated natal refs is worth EDITORIAL
  // review; do not treat formal prose structure as proving paid value.
  reviewPriority:draftKind==='machine'?'requires-individual-authoring':
   (monthOnlyRepeats||repeatsReaderMeaning)?'rewrite-overlapping-month-story':
   narratedIndividualDifference?'check-method-and-reader-benefit':
    'revise-specificity-or-counterargument',
  selectedDraftKind:draftKind,
  personalInsightValidated:false,traditionalMethodApproved:false,
  benefitBeyondFreeVerified:false,paidReaderTested:false,
  releaseVerdict:'not-approved',providerCalls:0
 };
}
module.exports={assess};
