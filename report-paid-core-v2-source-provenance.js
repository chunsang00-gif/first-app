'use strict';
// Reconcile deterministic source provenance only AFTER independently
// checking the actual model text for the exact, chart-specific relation.
// DEV / TEST V2 first chapter only. No prose rewrite and no invented
// proof of a real person's behavior. Historical model responses untouched.
const writer=require('./report-generation-request');
const reader=require('./report-paid-core-depth-v2-reader-review');
// Terms from unrelated sentences do not constitute one claimed exact
// month-hidden to visible-stem match. Explicit negations cannot validate it.
function hasLocalExactMatch(text,position){
 const place=position==='시간'?/(?:태어난\s*시간|출생\s*시간|시간의\s*겉글자)/:
  position==='해'?/(?:태어난\s*해|출생\s*연도|해의\s*겉글자)/:null;
 if(!place)return false;
 return String(text||'').split(/[.!?。！？\n]+/).some(sentence=>{
  if(sentence.length<24||sentence.length>320||
     !place.test(sentence)||
     !/(?:태어난\s*달|출생월|달의|달\s*안쪽|달\s*속)/.test(sentence)||
     !/(?:속글자|숨은\s*글자|안쪽에\s*있는\s*(?:또\s*)?다른\s*글자)/.test(sentence)||
     !/(?:정확히\s*일치|정확히\s*대응|정확히\s*같|똑같)/.test(sentence)||
     !/(?:다른|별도|대표)/.test(sentence))
   return false;
  if(/(?:정확히\s*(?:일치|대응|같)|똑같)(?:[^,]{0,35})(?:않|아니|없|못|불확실|미확인|확인되지|단정할\s*수\s*없|알\s*수\s*없)/.test(sentence))
   return false;
  return true;
 });
}
function bind(value,prompt){
 if(prompt?.paidCoreDepthV2!==true||prompt?.stage!=='body'||
    JSON.stringify(prompt.requestedSections)!=='["saju_core"]'||
    process.env.NODE_ENV!=='test'||
    process.env.PAID_CORE_DEPTH_V2!=='offline-preview'||
    process.env.RENDER==='true')
  return {value,changed:false,reason:'out-of-scope'};
 const para=value?.chapters?.saju_core?.paragraphs?.temperament;
 if(!para||!Array.isArray(para.basis?.refs))
  return {value,changed:false,reason:'empty-or-invalid-paragraph'};
 const payload=writer.compile(prompt);
 const topic=payload.task.chapters.saju_core.topics.temperament;
 const decision=topic.sourceQualifiedWritingDecision;
 // Exact hidden-to-visible evidence is the only independently proven,
 // text-checkable candidate this binding routine can address.
 if(decision?.selectedScope!=='verified-month-hidden-exposure'||
    decision.decision!=='attempt-one-distinct-conditional-symbolic-reading'||
    !decision.readerFactAnchor||decision.approvedForSale!==false)
  return {value,changed:false,reason:'method-out-of-scope'};
 const contract=topic.serverOwnedWritingContract;
 const required=contract?.evidenceRefs;
 const allowed=new Set(topic.citableFacts.map(x=>x.id));
 if(contract?.kind!=='server-owned-first-chapter-evidence-and-claim-contract-v1'||
    contract.humanEditorialApproval!==false||
    contract.releaseVerdict!=='not-approved'||
    JSON.stringify(contract.verifiedSourceIds)!==
      JSON.stringify(decision.requiredCitationIds)||
    !Array.isArray(required)||required.length<5||
    !required.every(x=>allowed.has(x)&&Object.hasOwn(payload.source,x))||
    para.basis.refs.some(x=>!allowed.has(x)||!Object.hasOwn(payload.source,x))||
    new Set(para.basis.refs).size!==para.basis.refs.length)
  return {value,changed:false,reason:'untrusted-or-unknown-citations'};
 // The model's array is never the source of truth. The server's verified
 // contract is the complete source list. Unsupported text still fails.
 const missing=required.filter(x=>!para.basis.refs.includes(x));
 if(!missing.length&&para.basis.refs.length===required.length)
  return {value,changed:false,reason:'server-sources-already-match'};
 // Never turn vague advice into a sourced chart claim. Only the one
 // verifiable exact month-hidden/visible relationship may be bound.
 const text=String(para.text||'');
 const target=topic.paidCoreDepthV2.readerContrast;
 const position=target?.visiblePosition==='natal.hour.stem'?'시간':
   target?.visiblePosition==='natal.year.stem'?'해':null;
 if(!position||!target||target.approvedForSale!==false||
    !hasLocalExactMatch(text,position))
  return {value,changed:false,reason:'chart-fact-absent-from-prose'};
 // Use a CLONE only for the QA-only check. The model's original response
 // is already saved by the caller's provider callback and must remain raw.
 const clone=structuredClone(value);
 const extra=clone.chapters.saju_core.paragraphs.temperament;
 extra.basis.refs=required.slice(); // exact server-owned canonical refs
 const base=clone.chapters.saju_core.paragraphs.strength?.text;
 if(reader.inspect(extra,base,topic.paidCoreDepthV2).length)
  return {value,changed:false,reason:'reader-meaning-or-grounding-rejected'};
 const semantic=require('./report-paid-core-v2-editorial-triage')
  .inspect(extra,base,topic.paidCoreDepthV2);
 // Reader-value warnings that do not alter the underlying calculation
 // remain available to human editors but must not be mistaken for a
 // missing/false source relation. Concrete factual/conditional blockers
 // still fail closed and the result is NEVER customer-approved.
 const advisory=new Set(['repeated-disclaimers-replace-reader-value']);
 const blockers=semantic.findings.filter(code=>!advisory.has(code));
 if(blockers.length)
  return {value,changed:false,reason:'two-way-meaning-or-scene-rejected',
   issueCodes:blockers};
 const editorialWarnings=semantic.findings.filter(code=>advisory.has(code));
 // The authoritative validator still runs in the decoder after binding.
 // No conditional paragraph can skip restoreEvidence or its source checks.
 return {value:clone,changed:true,reason:'deterministic-verified-exposure-provenance',
  serverBoundRefCount:missing.length,
  evidenceOwner:'server-contract',bodyTextUnchanged:true,
  editorialWarnings,approvedForSale:false};
}
module.exports={bind,hasLocalExactMatch};
