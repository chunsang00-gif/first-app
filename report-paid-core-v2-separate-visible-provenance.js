'use strict';
// QA only: reattach server-owned source IDs to a CLONE when a real model
// explicitly explains a DISTINCT year/hour role without falsely describing
// month-hidden exact exposure. No provider calls or paid release approval.
const writer=require('./report-generation-request');
const review=require('./report-paid-core-depth-v2-reader-review');
const anchorWords=Object.freeze({
 'fixed-supply-vs-output-year':['봉투','포장'],
 'suppliers-vs-explanation-hour':['재료','수업'],
 'shared-resources-vs-personal-duties-year':['책상','작업']
});
function verify(text,contract){
 const s=String(text||''),position=contract.sourcePosition==='natal.year.stem'?
  /(?:태어난\s*해|태어난\s*연도)/:
  /(?:태어난\s*시간|출생\s*시간)/;
 const sentences=s.split(/[.!?。！？\n]+/).map(x=>x.trim()).filter(Boolean);
 const positionContrast=sentences.some(x=>
  position.test(x)&&/(?:태어난\s*달|달의|출생월)/.test(x)&&
  /(?:서로\s*다른|별도|별개|다른\s*분류)/.test(x));
 const noExposure=/(?:드러난\s*것은\s*(?:아니|아닙|아닌)|드러났다는\s*뜻은\s*(?:아니|아닙|아닌)|정확히\s*일치(?:하는\s*것)?이?\s*(?:아니|아닙|아닌)|정확히\s*같(?:은\s*것)?은\s*(?:아니|아닙|아닌))/.test(s);
 const opposite=/(?:반대로|반면|한편|다른\s*경우)/.test(s);
 const failures=sentences.filter(x=>
  /(?:없으면|없다면|부족하면|빠지면|않으면|못하면|미리\s*정하지\s*않)/.test(x));
 const hypothetical=/(?:예를\s*들어|가정|상황을\s*생각)/.test(s);
 const keywords=anchorWords[contract.sceneId]||[];
 const distinctScene=keywords.length>=2&&keywords.every(w=>s.includes(w));
 const fabricated=sentences.some(sentence=>/(?:태어난\s*(?:해|연도|시간)|출생\s*시간).{0,65}(?:달의\s*(?:다른\s*)?(?:속글자|숨은\s*글자)|달\s*속글자).{0,65}(?:정확히\s*(?:일치|같|대응)|겉으로\s*드러)/.test(sentence)&&
  !/(?:아니|아닙|아닌|않|없|미확인)/.test(sentence));
 const impossible=/(?:반드시\s*부자가|무조건\s*성공|운명입니다|실제로\s*이\s*일을\s*했습니다)/.test(s);
 return {pass:positionContrast&&noExposure&&opposite&&failures.length>=2&&
  hypothetical&&distinctScene&&!fabricated&&!impossible,
  flags:[
   ...(!positionContrast?['missing-local-separate-position']:[]),
   ...(!noExposure?['missing-explicit-non-exposure']:[]),
   ...(!opposite||failures.length<2?['missing-two-counter-conditions']:[]),
   ...(!hypothetical||!distinctScene?['missing-concrete-scene']:[]),
   ...(fabricated?['false-month-hidden-exposure']:[]),
   ...(impossible?['invented-real-world-outcome']:[])
  ]};
}
function bind(value,prompt){
 if(prompt?.paidCoreDepthV2!==true||prompt?.stage!=='body'||
    JSON.stringify(prompt?.requestedSections)!=='["saju_core"]'||
    process.env.NODE_ENV!=='test'||
    process.env.PAID_CORE_DEPTH_V2!=='offline-preview'||
    process.env.RENDER==='true')
  return {value,changed:false,reason:'out-of-scope'};
 const para=value?.chapters?.saju_core?.paragraphs?.temperament;
 if(!para||!Array.isArray(para.basis?.refs))
  return {value,changed:false,reason:'missing-or-invalid-paragraph'};
 const payload=writer.compile(prompt),topic=payload.task.chapters.saju_core.topics.temperament;
 const contract=topic.serverOwnedWritingContract;
 if(contract?.kind!=='server-owned-first-chapter-separate-visible-contract-v1')
  return {value,changed:false,reason:'separate-visible-method-out-of-scope'};
 // Re-evaluate contract from server-held chart calculations. Never trust
 // model-written identifiers or a previous customer's report.
 const original=require('./report-paid-core-v2-separate-visible-contract')
  .build(payload.source,topic);
 if(!original||JSON.stringify(contract)!==JSON.stringify(original)||
    contract.humanEditorialApproval!==false||
    contract.releaseVerdict!=='not-approved')
  return {value,changed:false,reason:'contract-drift'};
 const permitted=new Set(topic.citableFacts.map(x=>x.id));
 const required=contract.evidenceRefs;
 if(!Array.isArray(required)||required.length<4||
    !required.every(x=>permitted.has(x)&&Object.hasOwn(payload.source,x))||
    para.basis.refs.some(x=>!permitted.has(x)||!Object.hasOwn(payload.source,x))||
    new Set(para.basis.refs).size!==para.basis.refs.length)
  return {value,changed:false,reason:'untrusted-references'};
 const current=para.basis.refs;
 if(current.length===required.length&&required.every(x=>current.includes(x)))
  return {value,changed:false,reason:'already-complete'};
 const semantic=verify(para.text,contract);
 if(!semantic.pass)
  return {value,changed:false,reason:'unsupported-separate-visible-meaning',
   flagCodes:semantic.flags};
 const clone=structuredClone(value);
 const extra=clone.chapters.saju_core.paragraphs.temperament;
 extra.basis.refs=required.slice();
 const main=clone.chapters.saju_core.paragraphs.strength?.text;
 const readerErrors=review.inspect(extra,main,topic.paidCoreDepthV2);
 if(readerErrors.length)
  return {value,changed:false,reason:'reader-rejected',flagCodes:readerErrors};
 return {value:clone,changed:true,reason:'server-owned-separate-visible-provenance',
  attachedCount:required.filter(x=>!current.includes(x)).length,
  textUnchanged:true,modelResponseMutated:false,approvedForSale:false};
}
module.exports={bind,verify};
