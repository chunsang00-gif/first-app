'use strict';
// Inspectable PER-CLAIM/PER-SENTENCE provenance ledger for one synthetic QA.
// A paragraph-level citation is NOT evidence that any particular sentence
// states that fact correctly. Cue matching is never semantic entailment.
const contradictionToClaim=Object.freeze({
 QA3_FALSE_MONTH_HOUR_EXPOSURE:['hidden-and-visible'],
 QA3_FALSE_DAY_HOUR_PAIR:['day-hour-pair'],
 QA3_FALSE_LISTED_MONTH_ELIGIBILITY:['listed-month'],
 QA3_REVERSED_ELEMENT_DIRECTIONS:['contrasting-directions'],
 QA3_FALSE_HOUR_COUNTERFACTUAL:['hour-counterexample'],
 QA3_UNPROVEN_ACTUAL_TRANSFORMATION:['day-hour-pair','listed-month']
});
function unique(rows){return [...new Set(rows)]}
function trace({paragraph,brief,payload,rules,splitSentences,detectHazards}={}){
 if(!brief||brief.kind!=='qa3-1994-classical-verified-writing-brief-v1'||
    brief.releaseVerdict!=='not-approved'||
    !Array.isArray(brief.permittedClaims)||
    !payload?.source||
    typeof splitSentences!=='function'||typeof detectHazards!=='function'||
    !rules||typeof rules!=='object')
  throw Error('QA3_CLAIM_TRACE_INVALID_VERIFIED_INPUT');
 const claimIds=brief.permittedClaims.map(c=>c.id);
 if(unique(claimIds).length!==claimIds.length||
    claimIds.some(id=>typeof rules[id]!=='function'))
  throw Error('QA3_CLAIM_TRACE_MISSING_RULE');
 const cited=Array.isArray(paragraph?.basis?.refs)?paragraph.basis.refs:[];
 const citedSet=new Set(cited);
 const source=payload.source;
 const sentenceRows=splitSentences(paragraph?.text).map((text,index)=>{
  const claimCues=claimIds.filter(id=>rules[id](text));
  const hazards=unique(detectHazards(text));
  const contradictedClaimIds=unique(hazards.flatMap(h=>
   contradictionToClaim[h]||[]));
  const possibleClaims=unique([...claimCues,...contradictedClaimIds]);
  const candidateEvidenceRefIds=unique(brief.permittedClaims
   .filter(c=>possibleClaims.includes(c.id))
   .flatMap(c=>c.refs));
  return {
   index,text,claimCues,
   contradictsClaimIds:contradictedClaimIds,
   hazardCodes:hazards,
   candidateEvidenceRefIds,
   evidenceRefsPresentAtParagraphLevel:candidateEvidenceRefIds
    .filter(id=>citedSet.has(id)),
   evidenceRefsMissingAtParagraphLevel:candidateEvidenceRefIds
    .filter(id=>!citedSet.has(id)),
   // Even cue+reference matches are only candidates for manual adjudication.
   claimMeaningVerified:false,
   individualSentenceCitationsVerified:false,
   needsHumanReview:true
  };
 });
 const claimRows=brief.permittedClaims.map(c=>{
  if(!Array.isArray(c.refs)||!c.refs.length||!c.refs.every(x=>
    brief.requiredEvidenceRefs.includes(x)))
   throw Error('QA3_CLAIM_TRACE_NON_CANONICAL_CLAIM_REFS:'+c.id);
  const cues=sentenceRows.filter(s=>s.claimCues.includes(c.id));
  const contradicted=sentenceRows.filter(s=>
   s.contradictsClaimIds.includes(c.id));
  const safeCueIndices=cues.filter(s=>
   !s.contradictsClaimIds.includes(c.id)&&s.hazardCodes.length===0)
   .map(s=>s.index);
  const missingInParagraph=c.refs.filter(id=>!citedSet.has(id));
  const missingOnServer=c.refs.filter(id=>!Object.hasOwn(source,id));
  return {
   claimId:c.id,canonicalStatement:c.statement,
   requiredSourceRefIds:c.refs.slice(),
   citationGranularity:'paragraph-only',
   citationPresence:missingInParagraph.length===0,
   sourceExistence:missingOnServer.length===0,
   missingParagraphCitationIds:missingInParagraph,
   missingServerSourceIds:missingOnServer,
   sentenceCueIndices:cues.map(s=>s.index),
   candidateNonContradictoryCueIndices:safeCueIndices,
   contradictedSentenceIndices:contradicted.map(s=>s.index),
   evidenceMeaningChecked:false,
   independentMethodApproved:false,
   humanDecision:'pending'
  };
 });
 // The provider may also invent a conclusion inside title or JSON basis
 // explanations, even when the public body is cautious. These fields are
 // not a second source of authority and must be reviewed independently.
 const metadataSentenceRows=[
  ['label',paragraph?.label],
  ['basis.interpretation',paragraph?.basis?.interpretation],
  ['basis.condition',paragraph?.basis?.condition],
  ['basis.limit',paragraph?.basis?.limit]
 ].flatMap(([field,text])=>splitSentences(text).map((sentence,index)=>({
  field,index,text:sentence,
  claimCues:claimIds.filter(id=>rules[id](sentence)),
  hazardCodes:unique(detectHazards(sentence)),
  claimMeaningVerified:false,needsHumanReview:true
 })));
 const missingCues=claimRows.filter(c=>
  c.candidateNonContradictoryCueIndices.length===0)
  .map(c=>c.claimId);
 const missingRefs=unique(claimRows.flatMap(c=>
  [...c.missingParagraphCitationIds,...c.missingServerSourceIds]));
 const contradictions=sentenceRows.filter(s=>s.hazardCodes.length);
 return {
  kind:'qa3-classical-per-claim-review-ledger-v1',
  chartScope:brief.exactChart,
  claimRows,sentenceRows,metadataSentenceRows,
  metadataHazards:metadataSentenceRows.filter(x=>x.hazardCodes.length)
   .map(x=>({field:x.field,index:x.index,text:x.text,flags:x.hazardCodes})),
  missingNonContradictoryClaimCues:missingCues,
  incompleteSourceRefIds:missingRefs,
  hazardSentenceIndices:contradictions.map(s=>s.index),
  mechanicallyReadyForHumanAdjudication:
   !missingCues.length&&!missingRefs.length&&!contradictions.length&&
   !metadataSentenceRows.some(x=>x.hazardCodes.length),
  paragraphLevelOnlyCitations:true,
  individualSentenceCitationsVerified:false,
  sentenceMeaningVerified:false,
  independentClassicalMethodApproved:false,
  humanReviewRequired:true,
  canSell:false,releaseVerdict:'not-approved'
 };
}
module.exports={trace,contradictionToClaim};
