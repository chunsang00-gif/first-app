'use strict';
// Private, non-billable editorial REVIEW packet for a single already-paid
// natal-depth response. Human scores are always pending; no automatic
// "premium quality" or release approval is possible here.
// This packet must be placed only inside the existing encrypted QA archive.
const reader=require('./report-reader-policy');
const semantic=require('./report-core-paid-natal-depth-response-gate');
const CORE=['temperament','strength','natal_depth'];
const CRITERIA=Object.freeze([
 {id:'accurate_calculated_basis',question:'계산 근거와 해석 의미가 실제로 맞는가?'},
 {id:'distinct_from_free_reading',question:'기본 풀이의 반복이 아닌 새롭고 구별되는 해석인가?'},
 {id:'interprets_not_glossary',question:'계산 과정이나 용어 정의 대신 독자가 이해할 수 있는 해석을 제공하는가?'},
 {id:'condition_and_downside',question:'가상 상황에서 유리한 조건과 놓치기 쉬운 조건을 구체적으로 구분하는가?'},
 {id:'natural_korean',question:'한자·전문용어·어색한 표현·무의미한 면책 반복이 없는가?'},
 {id:'no_unfounded_certainty',question:'실제 성격·과거·성취·2027 사건을 근거 없이 단정하지 않는가?'},
 {id:'reader_value',question:'이 한 장을 유료로 읽을 독자가 새로운 통찰을 얻는가?'}
]);
const text=v=>typeof v==='string'?v:'';
const count=(s,re)=>[...s.matchAll(re)].length;
function build({providerResponse,decoded,qa}){
 if(!qa?.prompt?.qaNatalDepthPreview||qa?.releaseVerdict!=='not-approved')
  throw Error('QA_PRIVATE_REVIEW_INVALID_SCOPE');
 const chapter=providerResponse?.chapters?.saju_core;
 const parts=chapter?.paragraphs;
 if(!parts||!CORE.every(k=>Object.hasOwn(parts,k))||
    !parts.natal_depth||typeof parts.natal_depth.text!=='string'||
    !decoded?.sections?.[0]?.bodyTopics?.includes('natal_depth'))
  throw Error('QA_PRIVATE_REVIEW_DEPTH_MISSING');
 const topics=qa.payload?.task?.chapters?.saju_core?.topics;
 if(!topics||!Object.hasOwn(topics,'natal_depth'))
  throw Error('QA_PRIVATE_REVIEW_PROVIDER_SCOPE');
 const documents=Object.fromEntries(CORE.map(k=>[k,parts[k]===null?null:{
  label:text(parts[k].label),body:text(parts[k].text),
  basis:parts[k].basis
 }]));
 const depth=documents.natal_depth.body;
 const visible=CORE.flatMap(k=>documents[k]?[documents[k].label,documents[k].body]:[]);
 const roleRefs=topics.natal_depth.citableFacts.map(x=>x.id);
 const cited=documents.natal_depth.basis?.refs||[];
 const sentences=depth.split(/[.!?。！？\n]+/).map(x=>x.trim()).filter(x=>x.length>=18);
 const seen=new Set(),identicalSentences=[];
 for(const sentence of sentences){
  const normalized=sentence.replace(/\s+/g,' ').replace(/[^가-힣a-zA-Z0-9]/g,'');
  if(seen.has(normalized))identicalSentences.push(sentence);
  seen.add(normalized);
 }
 const automated=semantic.inspect(providerResponse,qa.prompt);
 const diagnostics={
  depthChars:depth.length,
  sourceRefsAvailable:roleRefs.length,
  sourceRefsCited:cited.length,
  referenceMismatch:cited.filter(id=>!roleRefs.includes(id)),
  visibleJargon:reader.errors(visible),
  duplicateSentencesInsideDepth:identicalSentences.length,
  disclaimerMentions:count(depth,/(?:알 수 없|확인할 수 없|실제(?:로)?\s*(?:성격|행동|능력)|단정하지|보장하지|판정하지)/g),
  genericAdviceMentions:count(depth,/(?:준비물|체크리스트|확인해야|살펴봐야|정리해야)/g),
  modelResponseGuardErrors:automated
 };
 return {
  kind:'qa-natal-depth-private-editorial-review-v1',
  confidentiality:'PRIVATE ENCRYPTED ARTIFACT ONLY — NEVER print manuscripts or identifiable inputs in logs',
  automatedStatus:automated.length?'rejected':'technically-passed-not-editorially-reviewed',
  releaseVerdict:'not-approved',apiCallsForThisReview:0,
  sourceContext:Object.fromEntries(roleRefs.map(id=>[id,qa.payload.source[id]||null])),
  paragraphs:documents,
  diagnostics,
  // Only a human editor may change pending to pass/fail after reading.
  humanReview:{
   status:'pending',decision:'not-assessed',
   items:CRITERIA.map(row=>({...row,result:'pending',reason:''})),
   conclusion:'',
   releaseVerdict:'not-approved'
  }
 };
}
// Preserve reviewable paragraphs even when the already-paid result failed
// decoding, provenance QA, or returned natal_depth=null. This is diagnostic
// evidence, NEVER a validated checkpoint or an automatic retry.
function buildRejected({providerResponse,qa,reason}){
 if(!qa?.prompt?.qaNatalDepthPreview||qa.releaseVerdict!=='not-approved'||
    !qa.payload?.task?.chapters?.saju_core?.topics?.natal_depth)
  throw Error('QA_PRIVATE_REVIEW_INVALID_SCOPE');
 const scope=qa.payload.task.chapters.saju_core.topics.natal_depth;
 const refs=scope.citableFacts.map(x=>x.id);
 const chapter=providerResponse?.chapters?.saju_core;
 const parts=chapter?.paragraphs;
 const paragraphs=Object.fromEntries(CORE.map(k=>{
  const piece=parts&&Object.hasOwn(parts,k)?parts[k]:null;
  return [k,piece&&typeof piece==='object'&&!Array.isArray(piece)?
   {label:text(piece.label),body:text(piece.text),basis:piece.basis||null}:null];
 }));
 const visible=CORE.flatMap(k=>paragraphs[k]?
  [paragraphs[k].label,paragraphs[k].body]:[]);
 const depth=paragraphs.natal_depth;
 const cited=Array.isArray(depth?.basis?.refs)?depth.basis.refs:[];
 let issues=[];
 // Some charged outputs have malformed structure. Do not treat a validator
 // exception as approval or lose their original archived response.
 if(chapter&&parts){
  try{issues=semantic.inspect(providerResponse,qa.prompt)}
  catch{issues=['QA_PRIVATE_REVIEW_CANNOT_PARSE_SEMANTIC_GUARD'];}
 }
 const status=typeof providerResponse?.status==='string'?
  providerResponse.status:'json-response-rejected';
 const reasonCode=String(reason||'quality-rejected').slice(0,80);
 return {
  kind:'qa-natal-depth-private-rejected-editorial-review-v1',
  confidentiality:'PRIVATE ENCRYPTED ARTIFACT ONLY — do not expose source or manuscript in logs',
  automatedStatus:'rejected',releaseVerdict:'not-approved',
  apiCallsForThisReview:0,rejectionCode:reasonCode,
  providerResponseStatus:status,
  sourceContext:Object.fromEntries(refs.map(id=>[id,qa.payload.source[id]||null])),
  paragraphs,
  diagnostics:{
   depthPresent:!!depth?.body,depthChars:depth?.body.length||0,
   sourceRefsAvailable:refs.length,sourceRefsCited:cited.length,
   referenceMismatch:cited.filter(id=>!refs.includes(id)),
   visibleJargon:reader.errors(visible),
   modelResponseGuardErrors:issues
  },
  humanReview:{status:'pending',decision:'not-assessed',
   items:CRITERIA.map(row=>({...row,result:'pending',reason:''})),
   conclusion:'',releaseVerdict:'not-approved'}
 };
}
module.exports={build,buildRejected,CRITERIA};

