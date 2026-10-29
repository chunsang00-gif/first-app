'use strict';
// NEW QA6 offline research response boundary. No calls, billing, stored user
// content, or automatic publication. The original QA3/QA5 decoder stays intact.
// Five links are mechanically checked, NOT evidence of semantic truth.
const qa6=require('./report-qa6-required-research-slot');
const links=require('./report-qa3-classical-claim-linked-schema');
const decoder=require('./report-response-decoder');
const sentences=require('./report-qa3-classical-open-prose-audit').sentences;
const dangerous=require('./report-qa3-classical-open-prose-audit').dangerous;
const contradiction=require('./report-qa3-classical-contradiction-screen').contradiction;
function inspect(prompt,response){
 if(!qa6.enabled(prompt))throw Error('QA6_RESPONSE_GATE_OFFLINE_ONLY');
 const original=require('./report-generation-request').compile(prompt);
 const brief=qa6.requireVerified(prompt,original);
 const section=response?.chapters?.saju_core;
 const p=section?.paragraphs?.temperament;
 const strength=section?.paragraphs?.strength;
 if(!p||typeof p!=='object'||Array.isArray(p)||
   typeof p.label!=='string'||!p.label.trim()||
   typeof p.text!=='string'||!p.text.trim()||
   !strength||typeof strength!=='object'||Array.isArray(strength))
  throw Error('QA6_REQUIRED_RESEARCH_AND_MONTH_PARAGRAPHS_MISSING');
 if(!Array.isArray(p.basis?.claimLinks)||p.basis.claimLinks.length!==5)
  throw Error('QA6_FIVE_CLAIM_LINKS_REQUIRED');
 // Fail closed on obvious false or invented assertions anywhere in the
 // optional paragraph and its private basis, not only the five quoted lines.
 for(const field of [p.label,p.text,p.basis.interpretation,
  p.basis.condition,p.basis.limit]){
  if(typeof field!=='string')throw Error('QA6_REVIEW_METADATA_REQUIRED');
  for(const line of sentences(field))
   if(dangerous(line).length||contradiction(line).length)
    throw Error('QA6_KNOWN_UNSUPPORTED_ASSERTION');
 }
 // Existing QA3 audit enforces server refs, quotes, claim order, true text
 // matching, cue screening, reader checks and rejection of known false claims.
 const checked=links.validateAndStrip(prompt,response);
 const seen=checked.review;
 if(seen.linkedClaims!==brief.permittedClaims.length||
   seen.sourceRowsChecked!==brief.requiredEvidenceRefs.length||
   seen.canSell!==false||seen.newOriginalProseSemanticallyProven!==false)
  throw Error('QA6_CLAIM_REVIEW_CONTRACT_NOT_PRESERVED');
 // The UNMODIFIED real app decoder must accept the stripped copy.
 const decoded=decoder.decode(checked.value,prompt);
 if(decoded.sections?.length!==1||decoded.sections[0]?.id!=='saju_core'||
    !decoded.sections[0].bodyTopics?.includes('temperament')||
    !decoded.sections[0].bodyTopics?.includes('strength'))
  throw Error('QA6_REAL_DECODER_REJECTED_OR_MISSING_FIRST_CHAPTER');
 const rows=sentences(p.text);
 // Fixed vocabulary only: neither user input nor generated prose is returned.
 return Object.freeze({
  kind:'qa6-offline-first-chapter-editorial-hold-v1',
  firstChapterMachineStructureAccepted:true,
  linkedClaims:seen.linkedClaims,sourceRowsChecked:seen.sourceRowsChecked,
  originalModelResponseModified:false,
  allSentencesRequireHumanReview:true,
  sentenceCount:rows.length,
  semanticEntailmentVerified:false,
  classicalExpertReviewApproved:false,
  customerRelease:false,providerCalls:0,
  readyForSale:false,
  status:'requires-human-editorial-review'
 });
}
module.exports={inspect};
