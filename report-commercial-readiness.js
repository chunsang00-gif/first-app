'use strict';
// Structural PREMIUM sales gate, independent of merchant environment flags.
// This is NOT an expert approval of traditional interpretations or the prose.
// A product promised as 35 independently grounded topics cannot collect a
// real payment while the canonical writer has fewer deliverable topic slots.
const {topics}=require('./report-outline');
const {CONSTRAINED}=require('./report-qa12-chapter-topic-evidence-matrix');
const TARGET=35;
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
 const blockers=[];
 if(policyUnknown.length)blockers.push('unreconciled-disabled-topic-policy');
 if(names.length< TARGET)blockers.push('fewer-than-35-defined-topic-slots');
 if(structuralUpperBound<TARGET)
  blockers.push('fewer-than-35-evidence-eligible-topic-slots');
 return Object.freeze({
  kind:'premium-commercial-coverage-readiness-v1',
  targetTopics:TARGET,definedTopics:names.length,
  policyDisabledTopics:disabled.length,
  structuralUpperBound,minimumShortfall:Math.max(0,TARGET-structuralUpperBound),
  canAcceptNewPayment:blockers.length===0,
  blockers:Object.freeze(blockers),
  // Even a future 35-slot catalog needs actual customer-specific preflight,
  // paid output quality and explicit expert/editorial sign-off before sale.
  doesNotCertifyAnyCustomerReport:true,
  editorialReviewStillRequired:true
 });
}
module.exports={assess,TARGET};
