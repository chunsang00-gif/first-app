'use strict';
// Zero-cost, source-bound, complete first-chapter positive and mutations.
// This is not a paid report, not a simulated provider permission.
const assert=require('node:assert/strict');
const capture=require('./report-core-paid-full-prompt-capture').capture;
const authored=require('./report-core-v2-authored-first-chapter');
const revised=require('./report-core-1994-dingren-reader-revision');
const thesis=require('./report-core-thesis');
const writer=require('./report-generation-request');
const bridge=require('./report-paid-core-v2-classical-provider-bridge');
const audit=require('./report-qa3-classical-open-prose-audit');
const gate=require('./report-qa6-response-review-gate');
const names=['NODE_ENV','RENDER','PAID_CORE_DEPTH_V2',
 'PAID_CORE_V2_CLASSICAL_WRITER','PAID_CORE_V2_CLAIM_LINKS',
 'PAID_CORE_V2_REQUIRED_RESEARCH_SLOT','PAID_CORE_V2_LOCK_REFS',
 'PAID_CORE_V2_CLOSED_CLAIMS','PAID_CORE_V2_SOURCE_BOUND_READER'];
async function run(){
 const old=Object.fromEntries(names.map(x=>[x,process.env[x]]));
 try{
  process.env.NODE_ENV='test';
  for(const k of ['RENDER','PAID_CORE_V2_LOCK_REFS',
   'PAID_CORE_V2_CLOSED_CLAIMS','PAID_CORE_V2_SOURCE_BOUND_READER'])
   delete process.env[k];
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  process.env.PAID_CORE_V2_CLASSICAL_WRITER='offline-preview';
  process.env.PAID_CORE_V2_CLAIM_LINKS='offline-preview';
  process.env.PAID_CORE_V2_REQUIRED_RESEARCH_SLOT='offline-preview';
  const captured=await capture(authored.INPUT);
  assert.equal(captured.providerCalls,0);
  const prompt=captured.prompt;
  const payload=writer.compile(prompt);
  const brief=bridge.inspect(prompt,payload);
  const specimen=revised.make(prompt.facts).candidate;
  const checked=audit.screen(prompt,specimen);
  assert.equal(checked.mechanicallyEligible,true,JSON.stringify(checked.findings));
  const rows=audit.sentences(specimen.text);
  const temperament=structuredClone(specimen);
  temperament.basis.claimLinks=brief.permittedClaims.map(claim=>{
   const row=checked.claimTrace.claimRows.find(r=>r.claimId===claim.id);
   const index=row.candidateNonContradictoryCueIndices[0];
   assert(Number.isInteger(index));
   return {claimId:claim.id,sentenceIndex:index,
    sentenceQuote:rows[index],refs:claim.refs.slice()};
  });
  const allowed=writer.allowedRefs(payload,
   payload.task.chapters.saju_core.topics.strength,'saju_core','strength');
  const strengthRefs=['natal.month.stem','natal.month.hidden.己',
   'facts.seasonalEvidence','facts.qiEvidence'].filter(id=>allowed.has(id));
  const t=thesis.forPrompt(prompt);
  const response={
   chapters:{saju_core:{title:t.title,keyJudgment:t.keyJudgment,
    mood:'reflective',paragraphs:{temperament,
     strength:{label:'태어난 달의 두 기준',
      text:'태어난 달에는 배우는 문제와 역할을 맡는 문제가 함께 드러납니다. 이 분류를 실제 행동이나 결과로 단정할 수는 없습니다.',
      basis:{refs:strengthRefs,
       interpretation:'달 겉글자와 달의 대표 속글자는 서로 다릅니다.',
       condition:'배움과 규칙을 비교하는 가정입니다.',
       limit:'실제 기질과 능력은 증명되지 않았습니다.'}}}}},
    cover:null,finalJudgment:null
  };
  const source=JSON.stringify(response);
  const result=gate.inspect(prompt,response);
  assert.equal(JSON.stringify(response),source,'archived response never mutated');
  assert.equal(result.firstChapterMachineStructureAccepted,true);
  assert.equal(result.linkedClaims,5);
  assert.equal(result.sourceRowsChecked,9);
  assert.equal(result.providerCalls,0);
  assert.equal(result.semanticEntailmentVerified,false);
  assert.equal(result.readyForSale,false);
  assert.equal(result.status,'requires-human-editorial-review');
  assert(!JSON.stringify(result).includes(specimen.text),'no raw prose in public QA metadata');
  const reject=(change,reason)=>{
   const copy=structuredClone(response);
   change(copy,copy.chapters.saju_core.paragraphs.temperament);
   assert.throws(()=>gate.inspect(prompt,copy),reason);
  };
  reject((raw)=>{raw.chapters.saju_core.paragraphs.temperament=null},
   /QA6_REQUIRED_RESEARCH_AND_MONTH_PARAGRAPHS_MISSING/);
  reject((raw)=>{raw.chapters.saju_core.paragraphs.strength=null},
   /QA6_REQUIRED_RESEARCH_AND_MONTH_PARAGRAPHS_MISSING/);
  reject((raw,p)=>{p.basis.claimLinks=[]},
   /QA6_FIVE_CLAIM_LINKS_REQUIRED/);
  reject((raw,p)=>{p.basis.claimLinks[0].refs=['natal.month.hidden.丁']},
   /QA3_CLAIM_LINKS_FACT_OR_QUOTE_MISMATCH/);
  reject((raw,p)=>{p.basis.claimLinks[2].sentenceQuote='허위 인용'},
   /QA3_CLAIM_LINKS_FACT_OR_QUOTE_MISMATCH/);
  reject((raw,p)=>{p.basis.refs=p.basis.refs.slice(2)},
   /QA3_CLAIM_LINKS_UNSAFE_PROSE/);
  reject((raw,p)=>{p.text+=' 실제로 두 글자는 이미 木으로 합화되었습니다.'},
   /QA6_KNOWN_UNSUPPORTED_ASSERTION/);
  reject((raw,p)=>{p.basis.interpretation='이 사람은 반드시 돈을 많이 벌고 부자가 됩니다.'},
   /QA6_KNOWN_UNSUPPORTED_ASSERTION/);
  reject((raw,p)=>{p.text+=' 태어난 달의 숨은 글자와 시간의 글자는 일치하지 않습니다.'},
   /QA6_KNOWN_UNSUPPORTED_ASSERTION/);
  reject((raw,p)=>{p.text+=' 같은 생일 오후 8시 20분에도 날과 시간의 같은 짝을 그대로 적용할 수 있습니다.'},
   /QA6_KNOWN_UNSUPPORTED_ASSERTION/);
  reject((raw,p)=>{p.text+=' 이 사주에서는 무조건 혈압이 올라갑니다.'},
   /QA6_KNOWN_UNSUPPORTED_ASSERTION/);
  // Unknown newly invented claims are NOT automatically verified by a
  // correct quote/ref mapping: the only allowed outcome remains human review.
  const novel=structuredClone(response);
  novel.chapters.saju_core.paragraphs.temperament.text+=
   ' 근거 없이 매운 음식을 좋아할 가능성이 높습니다.';
  // Safe result is either mechanical rejection or a HUMAN-ONLY hold.
  // Keyword heuristics cannot certify that an unlinked novel claim is true.
  try{
   const novelVerdict=gate.inspect(prompt,novel);
   assert.equal(novelVerdict.semanticEntailmentVerified,false);
   assert.equal(novelVerdict.status,'requires-human-editorial-review');
   assert.equal(novelVerdict.readyForSale,false);
  }catch(e){
   assert(/QA3_CLAIM_LINKS_UNSAFE_PROSE|QA6_KNOWN_UNSUPPORTED_ASSERTION/.test(e.message));
  }
  process.env.NODE_ENV='production';
  assert.throws(()=>gate.inspect(prompt,response),
   /QA6_RESPONSE_GATE_OFFLINE_ONLY/);
  process.env.NODE_ENV='test';
  process.env.RENDER='true';
  assert.throws(()=>gate.inspect(prompt,response),
   /QA6_RESPONSE_GATE_OFFLINE_ONLY/);
  console.log('QA6_RESPONSE_REVIEW_GATE='+JSON.stringify({
   syntheticReviewedFirstChapterAcceptedForHumanReview:true,
   originalOutputUnchanged:true,
   nullOrMissingParagraphBlocked:true,
   forgedQuotesAndRefsBlocked:true,
   knownFalseClaimsBlockedAcrossBodyAndMetadata:true,
   otherUnsupportedSentencesNotAutomaticallyApproved:true,
   originalRealDecoderUsed:true,providerCalls:0,
   semanticTruthProven:false,customerRelease:false,
   humanReviewRequired:true
  }));
 }finally{
  for(const [k,v] of Object.entries(old))
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
}
run().catch(e=>{console.error(e);process.exitCode=1});
