'use strict';
// Model-facing, claim-by-claim evidence annotations on ONE synthetic chart.
// Offline only. A submitted quote+reference is an assertion by the model,
// NOT independent verification of a classical interpretation.
const bridge=require('./report-paid-core-v2-classical-provider-bridge');
const offline=require('./report-qa3-classical-open-prose-audit');
const ledger=require('./report-qa3-classical-claim-trace');
const contradiction=require('./report-qa3-classical-contradiction-screen');
const FLAG='offline-preview';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function enabled(prompt,env=process.env){
 return env.NODE_ENV==='test'&&env.RENDER!=='true'&&
  env.PAID_CORE_DEPTH_V2===FLAG&&
  env.PAID_CORE_V2_CLASSICAL_WRITER===FLAG&&
  env.PAID_CORE_V2_CLAIM_LINKS===FLAG&&
  env.PAID_CORE_V2_LOCK_REFS!==FLAG&&
  env.PAID_CORE_V2_CLOSED_CLAIMS!==FLAG&&
  bridge.enabled(prompt,env);
}
function contract(prompt,payload){
 if(!enabled(prompt))return null;
 const brief=bridge.inspect(prompt,payload);
 if(!brief||brief.releaseVerdict!=='not-approved'||
    !Array.isArray(brief.permittedClaims)||brief.permittedClaims.length!==5)
  throw Error('QA3_CLAIM_LINKS_UNVERIFIED_BRIEF');
 return brief;
}
function apply(prompt,payload,paragraphObject,basis){
 const brief=contract(prompt,payload);
 if(!brief)return false;
 if(!paragraphObject?.properties?.text||!basis?.properties?.refs||
    basis.properties.claimLinks||basis.required?.includes('claimLinks'))
  throw Error('QA3_CLAIM_LINKS_SCHEMA_NOT_CANONICAL');
 const enumIds=brief.permittedClaims.map(c=>c.id);
 const refIds=brief.requiredEvidenceRefs;
 const evidence=refIds.every(id=>
  payload.source[id]&&
  payload.task.chapters.saju_core.topics.temperament.citableFacts
   .some(row=>row.id===id));
 if(!evidence)throw Error('QA3_CLAIM_LINKS_SOURCE_MISSING');
 const item={type:'object',additionalProperties:false,
  required:['claimId','sentenceIndex','sentenceQuote','refs'],
  properties:{
   claimId:{type:'string',enum:enumIds},
   sentenceIndex:{type:'integer'},
   sentenceQuote:{type:'string'},
   refs:{type:'array',items:{type:'string',enum:refIds}}
  }};
 basis.properties.claimLinks={type:'array',items:item,
  description:'각 검증 주장 5개에 대해 반드시 서로 다른 claimId를 정확히 한 번 기록한다. '+
   'sentenceIndex는 temperament.text의 문장을 0부터 셌을 때 인덱스다. '+
   'sentenceQuote는 본문 해당 문장과 글자 하나까지 같아야 한다. '+
   '각 claimId의 refs는 qaClassicalWritingBrief.permittedClaims에서 그 주장에 지정된 refs만 순서까지 그대로 복사한다. '+
   '출처를 적었다고 해석이 입증된 것은 아니며 실제 합화·성격·재물 결과는 만들어 내지 않는다.'};
 basis.required.push('claimLinks');
 return true;
}
function validateAndStrip(prompt,value){
 if(!enabled(prompt))throw Error('QA3_CLAIM_LINKS_OFFLINE_ONLY');
 const payload=require('./report-generation-request').compile(prompt);
 const brief=contract(prompt,payload);
 const result=structuredClone(value);
 const p=result?.chapters?.saju_core?.paragraphs?.temperament;
 if(!p||!p.basis||!Array.isArray(p.basis.claimLinks))
  throw Error('QA3_CLAIM_LINKS_REQUIRED');
 const links=p.basis.claimLinks;
 const required=brief.permittedClaims;
 if(links.length!==required.length||
    new Set(links.map(x=>x?.claimId)).size!==required.length||
    !same(links.map(x=>x?.claimId),required.map(x=>x.id)))
  throw Error('QA3_CLAIM_LINKS_MISSING_DUPLICATE_OR_OUT_OF_ORDER');
 const sentences=offline.sentences(p.text);
 const globalRefs=p.basis.refs;
 if(!Array.isArray(globalRefs)||new Set(globalRefs).size!==globalRefs.length)
  throw Error('QA3_CLAIM_LINKS_PARAGRAPH_CITATIONS_INVALID');
 const audit=offline.screen(prompt,{
  ...p,basis:Object.fromEntries(Object.entries(p.basis).filter(([k])=>k!=='claimLinks'))
 },{monthText:result.chapters.saju_core.paragraphs.strength?.text||''});
 if(audit.status!=='requires-human-review'||
    audit.findings.length||!audit.claimTrace?.mechanicallyReadyForHumanAdjudication)
  throw Error('QA3_CLAIM_LINKS_UNSAFE_PROSE:'+audit.findings.join('|'));
 for(let i=0;i<required.length;i++){
  const row=required[i],link=links[i];
  if(!link||Object.keys(link).sort().join('|')!==
      ['claimId','refs','sentenceIndex','sentenceQuote'].sort().join('|')||
     !Number.isInteger(link.sentenceIndex)||
     link.sentenceIndex<0||link.sentenceIndex>=sentences.length||
     typeof link.sentenceQuote!=='string'||
     link.sentenceQuote!==sentences[link.sentenceIndex]||
     !same(link.refs,row.refs)||
     !link.refs.every(id=>Object.hasOwn(payload.source,id)&&
       globalRefs.includes(id)))
   throw Error('QA3_CLAIM_LINKS_FACT_OR_QUOTE_MISMATCH:'+row.id);
  if(!offline.rules[row.id](link.sentenceQuote)||
     offline.dangerous(link.sentenceQuote).length||
     contradiction.contradiction(link.sentenceQuote).length)
   throw Error('QA3_CLAIM_LINKS_UNVERIFIED_SENTENCE:'+row.id);
 }
 // Even five valid model-provided links only establish an auditable mapping,
 // not sentence-level semantic entailment. Human editorial review is still
 // required. Strip the experimental metadata from a clone before handing it
 // to the unchanged app decoder.
 delete p.basis.claimLinks;
 return {value:result,review:{
  kind:'qa3-five-claim-annotation-check-v1',
  linkedClaims:required.length,
  exactSentenceQuotes:true,
  canonicalRefsChecked:true,
  sourceRowsChecked:brief.requiredEvidenceRefs.length,
  newOriginalProseSemanticallyProven:false,
  independentClassicalMethodApproved:false,
  allRemainingSentencesHumanReview:true,
  providerCalls:0,canSell:false,releaseVerdict:'not-approved'
 }};
}
module.exports={enabled,contract,apply,validateAndStrip};
