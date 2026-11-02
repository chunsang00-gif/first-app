'use strict';
// Structural PREMIUM sales gate, independent of merchant environment flags.
// This is NOT an expert approval of traditional interpretations or the prose.
// A product promised as 35 independently grounded topics cannot collect a
// real payment while the canonical writer has fewer deliverable topic slots.
const {topics}=require('./report-outline');
const {CONSTRAINED}=require('./report-qa12-chapter-topic-evidence-matrix');
const TARGET=35;
const annual=require('./report-interpretation-core');
// The current annual money AND career chapters each require a different
// annual VISIBLE-STEM subtype. As 2027 has ONE visible stem, mutually
// exclusive source families make a fixed twelve-chapter promise impossible
// regardless of how many optional topic slots are added.
function annualChapterCompatibility(){
 const money=annual.eligibleAnnualStemGods('money');
 const career=annual.eligibleAnnualStemGods('career');
 const overlap=money.filter(g=>career.includes(g));
 return Object.freeze({
  rule:'one-visible-annual-stem-with-disjoint-premium-domains',
  both2027MoneyAndCareerPossible:overlap.length>0,
  exclusiveEligibilityFamilies:overlap.length===0,
  overlapGods:Object.freeze(overlap),
  requiresManualRuleReviewIfNewAnnualSourcesAdded:true
 });
}
function assess(){
 const names=Object.entries(topics).flatMap(([chapter,slots])=>
  Object.keys(slots).map(topic=>chapter+'.'+topic));
 const defined=new Set(names);
 // QA12 only lists slots that the actual preflight deliberately disables
 // for lack of distinct evidence. A stale/unrecognized policy is NOT a
 // license to sell it; fail closed on contract mismatch.
 const disabled=CONSTRAINED.filter(id=>defined.has(id));
 const policyUnknown=CONSTRAINED.filter(id=>!defined.has(id));
 const structuralUpperBound=names.length-disabled.length;
 const compatibility=annualChapterCompatibility();
 const blockers=[];
 if(policyUnknown.length)blockers.push('unreconciled-disabled-topic-policy');
 if(names.length< TARGET)blockers.push('fewer-than-35-defined-topic-slots');
 if(structuralUpperBound<TARGET)
  blockers.push('fewer-than-35-evidence-eligible-topic-slots');
 if(!compatibility.both2027MoneyAndCareerPossible)
  blockers.push('twelve-chapters-impossible-under-exclusive-annual-stem-domains');
 return Object.freeze({
  kind:'premium-commercial-coverage-readiness-v1',
  targetTopics:TARGET,definedTopics:names.length,
  policyDisabledTopics:disabled.length,
  structuralUpperBound,minimumShortfall:Math.max(0,TARGET-structuralUpperBound),
  annualChapterCompatibility:compatibility,
  fixedTwelveChapterPromisePossible:compatibility.both2027MoneyAndCareerPossible,
  canAcceptNewPayment:blockers.length===0,
  blockers:Object.freeze(blockers),
  // Even a future 35-slot catalog needs actual customer-specific preflight,
  // paid output quality and explicit expert/editorial sign-off before sale.
  doesNotCertifyAnyCustomerReport:true,
  editorialReviewStillRequired:true
 });
}
module.exports={assess,TARGET};
