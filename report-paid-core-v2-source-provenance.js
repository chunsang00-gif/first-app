'use strict';
// Reconcile deterministic source provenance only AFTER independently
// checking the actual model text for the exact, chart-specific relation.
// DEV / TEST V2 first chapter only. No prose rewrite and no invented
// proof of a real person's behavior. Historical model responses untouched.
const writer=require('./report-generation-request');
const reader=require('./report-paid-core-depth-v2-reader-review');
function bind(value,prompt){
 if(prompt?.paidCoreDepthV2!==true||prompt?.stage!=='body'||
    JSON.stringify(prompt.requestedSections)!=='["saju_core"]'||
    process.env.NODE_ENV!=='test'||
    process.env.PAID_CORE_DEPTH_V2!=='offline-preview'||
    process.env.RENDER==='true')
  return {value,changed:false,reason:'out-of-scope'};
 const para=value?.chapters?.saju_core?.paragraphs?.temperament;
 if(!para||!Array.isArray(para.basis?.refs)||!para.basis.refs.length)
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
 const required=decision.requiredCitationIds;
 const allowed=new Set(topic.citableFacts.map(x=>x.id));
 if(!Array.isArray(required)||required.length!==5||
    JSON.stringify(required)!==JSON.stringify(decision.sourceRefs)||
    !required.every(x=>allowed.has(x)&&Object.hasOwn(payload.source,x))||
    para.basis.refs.some(x=>!allowed.has(x)||!Object.hasOwn(payload.source,x))||
    new Set(para.basis.refs).size!==para.basis.refs.length)
  return {value,changed:false,reason:'untrusted-or-unknown-citations'};
 const missing=required.filter(x=>!para.basis.refs.includes(x));
 if(!missing.length)return {value,changed:false,reason:'no-omission'};
 // Never turn vague advice into a sourced chart claim. Only the one
 // verifiable exact month-hidden/visible relationship may be bound.
 const text=String(para.text||'');
 const target=topic.paidCoreDepthV2.readerContrast;
 const position=target?.visiblePosition==='natal.hour.stem'?'시간':
   target?.visiblePosition==='natal.year.stem'?'해':null;
 if(!position||!target||target.approvedForSale!==false||
    !text.includes('태어난 '+position)||
    !/(?:태어난 달|출생월|달의)/.test(text)||
    !/(?:속글자|숨은 글자|달 안쪽|달의 안쪽)/.test(text)||
    !/(?:정확히 일치|정확히 대응|정확히 같)/.test(text)||
    !/(?:다른|별도|대표)/.test(text))
  return {value,changed:false,reason:'chart-fact-absent-from-prose'};
 // Use a CLONE only for the QA-only check. The model's original response
 // is already saved by the caller's provider callback and must remain raw.
 const clone=structuredClone(value);
 const extra=clone.chapters.saju_core.paragraphs.temperament;
 extra.basis.refs=[...new Set([...extra.basis.refs,...missing])];
 const base=clone.chapters.saju_core.paragraphs.strength?.text;
 if(reader.inspect(extra,base,topic.paidCoreDepthV2).length)
  return {value,changed:false,reason:'reader-meaning-or-grounding-rejected'};
 // The authoritative validator still runs in the decoder after binding.
 // No conditional paragraph can skip restoreEvidence or its source checks.
 return {value:clone,changed:true,reason:'deterministic-verified-exposure-provenance',
  serverBoundRefCount:missing.length,
  approvedForSale:false};
}
module.exports={bind};
