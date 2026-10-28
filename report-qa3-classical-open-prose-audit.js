'use strict';
// Non-LLM, OFFLINE screening of freely worded first-chapter proposals.
// An ID or a keyword hit is NOT semantic entailment. Classify known claim
// cues, deny testable contradictions and quarantine every unknown sentence.
// No customer, payment, production or historical model-output changes.
const writer=require('./report-generation-request');
const bridge=require('./report-paid-core-v2-classical-provider-bridge');
const classical=require('./report-core-1994-dingren-classical-rule-audit');
const reader=require('./report-paid-core-depth-v2-reader-review');
const language=require('./report-reader-policy');
const ids=Object.freeze(['hidden-and-visible','day-hour-pair',
 'listed-month','contrasting-directions','hour-counterexample']);
const rules={
 'hidden-and-visible':s=>/(?:달|출생월)/.test(s)&&
  /(?:시간|시주)/.test(s)&&/(?:숨|속|안에)/.test(s)&&
  /(?:같|일치|대응)/.test(s),
 'day-hour-pair':s=>/(?:태어난 날|출생일|날의|일간)/.test(s)&&
  /(?:시간|시주)/.test(s)&&/(?:한 쌍|짝|인접|나란히)/.test(s),
 'listed-month':s=>/(?:삼명통회|三命通會)/.test(s)&&
  /(?:달|월)/.test(s)&&/(?:조건|범위|거론|제시|포함|들어갑니다)/.test(s),
 'contrasting-directions':s=>/(?:태어난 해|해의 글자)/.test(s)&&
  /(?:태어난 날|날의 글자)/.test(s)&&/(?:시간|시주)/.test(s)&&
  /(?:돕|생해)/.test(s)&&/(?:제약|누르|제어)/.test(s),
 'hour-counterexample':s=>/(?:오후 8시 20분|20:20|20시 20분)/.test(s)&&
  /(?:시간|시주|윗글자)/.test(s)&&/(?:바뀌|달라)/.test(s)&&
  /(?:짝|적용|해석|관계)/.test(s)
};
function sentences(body){
 return String(body||'').replace(/\r/g,'').split(/(?<=[.!?。！？])\s+|\n+/u)
  .map(s=>s.trim()).filter(Boolean);
}
const uniq=a=>[...new Set(a)];
const negative=s=>/(?:아니|않|없|미확|불확|단정할 수 없|확정할 수 없|알 수 없|판단할 수 없|증명할 수 없|검증된 상태는 아닙니다|확인할 수 없)/.test(s);
function dangerous(s){
 const flags=[];
 if(/(?:반드시|무조건|확실히|틀림없이).{0,65}(?:돈|재물|성공|수입|부자|승진|적성|능력|건강|운명)/.test(s)||
    /(?:부자가 됩니다|성공할 운명|좋은 재물운을 타고|돈을 잘 버는 사람입니다)/.test(s))
  flags.push('QA3_UNGROUNDED_PERSONAL_OUTCOME');
 // Explicit affirmative unsupported transformation. Negative discussion
 // of transformation is legitimate and must not be caught.
 if(/(?:실제로|완전히|확실히|반드시|이미).{0,45}(?:목|木)(?:으로)?.{0,20}(?:변했|변하|바뀌었|바뀝|합화되|되었습니다)/.test(s)&&!negative(s)||
    /(?:합화목|木으로 합화).{0,18}(?:확정|완성|성립)/.test(s)&&!negative(s))
  flags.push('QA3_UNPROVEN_ACTUAL_TRANSFORMATION');
 if(/(?:당신은|이 사람은|당신의 성격은|실제로 당신).{0,70}(?:책임감이 강|재능이 있|돈 관리에 능숙|이직할|재산이 늘)/.test(s)&&!negative(s))
  flags.push('QA3_UNOBSERVED_PERSONALITY_OR_EVENT');
 if(/(?:오후 8시 20분|20:20|20시 20분).{0,85}(?:같은 짝이 유지|똑같은 합|변하지 않는 날.시간의 짝|그대로 적용)/.test(s)&&!negative(s))
  flags.push('QA3_FALSE_HOUR_COUNTERFACTUAL');
 return flags;
}
function screen(prompt,paragraph,{monthText=''}={}){
 if(process.env.NODE_ENV!=='test'||process.env.RENDER==='true'||
    process.env.PAID_CORE_DEPTH_V2!=='offline-preview'||
    prompt?.paidCoreDepthV2!==true||
    JSON.stringify(prompt.requestedSections)!=='["saju_core"]')
  throw Error('QA3_OPEN_PROSE_OFFLINE_ONLY');
 const packet=classical.inspect(prompt.facts);
 if(!packet)return {status:'unsupported-chart',mechanicalEligibility:false,
  findings:['QA3_OPEN_PROSE_UNVERIFIED_CHART'],canSell:false,
  releaseVerdict:'not-approved'};
 // The working request itself is independent of the optional provider flag.
 const task=writer.compile(prompt);
 const base=task.task.chapters.saju_core.topics.temperament;
 const allowed=new Set(base.citableFacts.map(x=>x.id));
 const original=process.env.PAID_CORE_V2_CLASSICAL_WRITER;
 let brief;
 try{
  process.env.PAID_CORE_V2_CLASSICAL_WRITER='offline-preview';
  brief=bridge.inspect(prompt,task);
 }finally{
  if(original===undefined)delete process.env.PAID_CORE_V2_CLASSICAL_WRITER;
  else process.env.PAID_CORE_V2_CLASSICAL_WRITER=original;
 }
 if(!brief||brief.releaseVerdict!=='not-approved'||
    !ids.every(id=>brief.permittedClaims.some(c=>c.id===id)))
  throw Error('QA3_OPEN_PROSE_SOURCE_LEDGER_UNAVAILABLE');
 const findings=[];
 const add=x=>{if(!findings.includes(x))findings.push(x)};
 const basis=paragraph?.basis;
 const refs=basis?.refs;
 if(!paragraph||typeof paragraph.text!=='string'||
    typeof paragraph.label!=='string'||!Array.isArray(refs)||
    typeof basis.interpretation!=='string'||
    typeof basis.condition!=='string'||typeof basis.limit!=='string')
  add('QA3_OPEN_PROSE_INVALID_BODY');
 const required=brief.requiredEvidenceRefs;
 if(!Array.isArray(refs)||uniq(refs).length!==refs.length||
    !required.every(id=>refs.includes(id))||
    !refs.every(id=>allowed.has(id)))
  add('QA3_OPEN_PROSE_SOURCE_IDS_INVALID');
 const body=paragraph?.text||'';
 const lines=sentences(body);
 if(!body||lines.length<5)add('QA3_OPEN_PROSE_TOO_LITTLE_REVIEWABLE_TEXT');
 for(const err of language.errors([paragraph?.label||'',body]))
  add('QA3_OPEN_PROSE_READER_LANGUAGE:'+err);
 // Keep the actual decoder's existing reader contract active; this is
 // never a replacement for it or the provider's strict response schema.
 for(const err of reader.inspect(paragraph,monthText,base.paidCoreDepthV2))
  add('QA3_OPEN_PROSE_READER:'+err);
 const classified=lines.map((sentence,index)=>{
  const matches=ids.filter(id=>rules[id](sentence));
  const hazards=uniq([...dangerous(sentence),
   ...require('./report-qa3-classical-contradiction-screen')
    .contradiction(sentence)]);
  hazards.forEach(add);
  return {index,matches,flags:hazards,needsHumanReview:matches.length===0,
   sentence};
 });
 const matched=uniq(classified.flatMap(x=>x.matches));
 for(const id of ids)if(!matched.includes(id))
  add('QA3_OPEN_PROSE_REQUIRED_CLAIM_UNPROVEN:'+id);
 // A textual cue only narrows human work. It NEVER establishes
 // that a novel free-form sentence is entailed by an ancient text.
 const unknown=classified.filter(x=>x.needsHumanReview);
 return {
  kind:'qa3-open-prose-source-cue-and-negative-claim-screen-v1',
  status:findings.length?'blocked':'requires-human-review',
  findings,coveredClaimCues:matched,
  requiredClaimCues:ids.slice(),
  sourceRowsChecked:required.slice(),
  totalSentences:lines.length,
  unclassifiedSentences:unknown.map(x=>({index:x.index,text:x.sentence})),
  // Even a sentence with known cue words may add an invented conclusion.
  // Every sentence still requires independent interpretation review.
  allSentencesRequireHumanReview:classified.map(x=>({
   index:x.index,claimCues:x.matches,text:x.sentence})),
  criticalSentences:classified.filter(x=>x.flags.length).map(x=>({
   index:x.index,text:x.sentence,flags:x.flags})),
  mechanicallyEligible:findings.length===0,
  semanticEntailmentVerified:false,
  unsupportedNovelClaimsAutomaticallyExhaustive:false,
  humanLineByLineReviewRequired:true,
  modelGenerated:false,
  canSell:false,providerCalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={screen,sentences,dangerous,rules};
