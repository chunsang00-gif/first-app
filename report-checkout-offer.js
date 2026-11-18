'use strict';
// One purchase is bound to the exact SERVER-calculated, chart-specific
// adaptive report composition shown before checkout. This does not approve
// traditional interpretation, complete paid prose, or set a price.
const crypto=require('node:crypto');
const coverage=require('./report-product-coverage');
const validation=require('./input-validation');
const PRODUCT_MODE='adaptive-v1';
const KIND='source-bound-adaptive-checkout-offer-v1';
const digest=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
function normalized(input){
 const errors=validation.validateInput(input);
 if(errors.length)throw Error('ADAPTIVE_OFFER_INVALID_CALCULATION_INPUT');
 // Only fields that determine the actual report plan are committed to an
 // order. Do NOT store personally identifying raw date/name in the ledger.
 return {
  calendar:input.calendar,birthDate:input.birthDate,
  birthTime:input.unknownBirthTime===true?'12:00':input.birthTime,
  unknownBirthTime:input.unknownBirthTime===true,
  leapMonth:input.calendar==='lunar'&&input.leapMonth===true,
  gender:input.gender,mbti:input.mbti||'모름',
  // Only hash the optional customer question. Its raw text is not stored
  // in a merchant order, but changing it invalidates the bound order.
  ...(typeof input.readerDecision==='string'&&input.readerDecision.trim()?{readerDecision:input.readerDecision.trim()}:{})
 };
}
function build(input){
 const canonical=normalized(input);
 const preview=coverage.calculate(canonical);
 if(preview.status!=='ready'||preview.purchaseEnabled!==false||
    preview.premiumReportCompleted!==false)
  throw Error('ADAPTIVE_OFFER_PREVIEW_NOT_VERIFIED');
 const p=preview.productProposal,e=preview.estimate;
 if(p?.kind!=='chart-specific-evidence-scoped-product-proposal-v1'||
    p.status!=='draft-not-for-sale'||p.paymentEnabled!==false||
    p.fixed12ChaptersPromised!==false||p.fixed35TopicsPromised!==false||
    p.humanEditorialApproved!==false||e.canAttemptGeneration!==true||
    p.plannedChapterCount!==e.plannedChapters||
    p.topicCandidateUpperBound!==e.evidenceEligibleTopicUpperBound||
    !p.mainChapterIds.includes('saju_core')||
    !p.mainChapterIds.includes('year_2027')||
    p.plannedChapterCount<3||p.topicCandidateUpperBound<3)
  throw Error('ADAPTIVE_OFFER_UNDELIVERABLE_SCOPE');
 const planned=e.chapters.filter(ch=>ch.includedInPlan).map(ch=>ch.id);
 const listed=[...p.mainChapterIds,...p.conditional2027ChapterIds];
 if(JSON.stringify(planned)!==JSON.stringify(listed)||
    new Set(planned).size!==planned.length||
    e.chapters.filter(ch=>ch.includedInPlan)
     .reduce((sum,ch)=>sum+ch.eligibleTopicUpperBound,0)!==p.topicCandidateUpperBound)
  throw Error('ADAPTIVE_OFFER_SCOPE_MISMATCH');
 const content=Object.freeze({
  kind:KIND,productMode:PRODUCT_MODE,targetYear:2027,
  inputFingerprint:digest(canonical),plannedChapterIds:Object.freeze(planned),
  candidateTopicUpperBound:p.topicCandidateUpperBound,
  mainChapterCount:p.mainChapterCount,
  conditionalChapterCount:p.conditionalChapterCount,
  fixed12ChaptersPromised:false,fixed35TopicsPromised:false,
  actualProseNotYetGenerated:true
 });
 return Object.freeze({...content,digest:digest(content)});
}
function customerSummary(offer){
 if(!offer||offer.kind!==KIND||offer.productMode!==PRODUCT_MODE||
    !/^[a-f0-9]{64}$/.test(offer.digest||''))
  throw Error('ADAPTIVE_OFFER_INVALID_SUMMARY');
 return {
  productMode:PRODUCT_MODE,plannedChapterIds:offer.plannedChapterIds.slice(),
  plannedChapters:offer.plannedChapterIds.length,
  candidateTopicUpperBound:offer.candidateTopicUpperBound,
  countsAreUpperBounds:true,
  fixed12ChaptersPromised:false,fixed35TopicsPromised:false
 };
}
module.exports={build,customerSummary,PRODUCT_MODE,KIND};
