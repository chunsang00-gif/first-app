'use strict';
// Exact old-vs-revised synthetic chapter through the REAL app decoder.
// No API, no archive decryption, no schema bypass, no approval on a
// method-only editorial rubric. Source text is synthetic study material.
const assert=require('node:assert/strict');
const {capture}=require('./report-core-paid-full-prompt-capture');
const writer=require('./report-generation-request');
const decoder=require('./report-response-decoder');
const thesis=require('./report-core-thesis');
const authored=require('./report-core-v2-authored-first-chapter');
const revision=require('./report-core-1994-dingren-reader-revision');
const review=require('./report-paid-core-v2-editorial-method-router');
const locks=['NODE_ENV','RENDER','PAID_CORE_DEPTH_V2',
 'PAID_CORE_V2_CLASSICAL_WRITER','PAID_CORE_V2_SOURCE_BOUND_READER',
 'PAID_CORE_V2_LOCK_REFS','PAID_CORE_V2_CLOSED_CLAIMS'];
(async()=>{
 const before=Object.fromEntries(locks.map(k=>[k,process.env[k]]));
 try{
  process.env.NODE_ENV='test';
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  for(const flag of locks.filter(k=>k!=='NODE_ENV'&&k!=='PAID_CORE_DEPTH_V2'))
   delete process.env[flag];
  const cap=await capture(authored.INPUT);
  assert.equal(cap.providerCalls,0);
  const prompt=cap.prompt;
  assert.deepEqual(prompt.requestedSections,['saju_core']);
  const plan=writer.compile(prompt);
  const allowed=writer.allowedRefs(plan,
   plan.task.chapters.saju_core.topics.strength,'saju_core','strength');
  const monthRefs=['natal.month.stem','natal.month.hidden.己',
   'facts.seasonalEvidence','facts.qiEvidence'].filter(id=>allowed.has(id));
  assert(monthRefs.includes('natal.month.stem'));
  assert(monthRefs.includes('natal.month.hidden.己'));
  const old=authored.make(prompt.facts);
  const next=revision.make(prompt.facts);
  assert(old&&next);
  const thesisValue=thesis.forPrompt(prompt);
  const raw={
   chapters:{saju_core:{title:thesisValue.title,
    keyJudgment:thesisValue.keyJudgment,mood:'reflective',
    paragraphs:{
     temperament:structuredClone(old.proposal),
     strength:{
      label:'태어난 달의 두 기준',
      text:'태어난 달에는 배우는 문제와 역할을 맡는 문제가 함께 드러납니다. 이 분류를 실제 행동이나 결과로 단정할 수는 없습니다.',
      basis:{refs:monthRefs,
       interpretation:'달 겉글자와 달의 대표 속글자는 서로 다릅니다.',
       condition:'배움과 규칙을 비교하는 가정입니다.',
       limit:'실제 기질과 능력은 증명되지 않았습니다.'}
     }
    }}},cover:null,finalJudgment:null
  };
  const immutable=JSON.stringify(raw);
  const baseline=decoder.decode(raw,prompt);
  assert(baseline.sections?.[0]?.bodyTopics.includes('temperament'));
  assert.equal(JSON.stringify(raw),immutable);
  const candidate=structuredClone(raw);
  candidate.chapters.saju_core.paragraphs.temperament=
   structuredClone(next.candidate);
  const candidateBefore=JSON.stringify(candidate);
  const method=review.inspect({route:review.ROUTES.CLASSICAL,
   prompt,paragraph:next.candidate,
   monthText:raw.chapters.saju_core.paragraphs.strength.text});
  assert.equal(method.mechanicallySupported,true);
  assert.equal(method.canSell,false);
  let error=null,accepted=false;
  try{decoder.decode(candidate,prompt);accepted=true}
  catch(e){error=String(e.message||'unknown');}
  // The real decoder only enforces transport/provenance/reader semantics.
  // It DOES ACCEPT this fixed research text. The scene-specific editorial
  // triage is a DIFFERENT gate, and sale approval is NEVER implied.
  assert.equal(accepted,true,'record the actual decoder result accurately');
  assert.equal(error,null);
  assert.equal(JSON.stringify(candidate),candidateBefore);
  assert.equal(JSON.stringify(raw),immutable);
  // A model-facing writing brief changes provider INPUT, not the decoder's
  // existing output accept/reject behavior. Verify that boundary explicitly.
  process.env.PAID_CORE_V2_CLASSICAL_WRITER='offline-preview';
  const providerPlan=require('./report-paid-core-v2-classical-provider-bridge')
   .inspect(prompt,plan);
  assert.equal(providerPlan.releaseVerdict,'not-approved');
  let flaggedError=null,flaggedAccepted=false;
  try{decoder.decode(candidate,prompt);flaggedAccepted=true}
  catch(e){flaggedError=String(e.message||'unknown');}
  assert.equal(flaggedAccepted,true);
  assert.equal(flaggedError,error,
   'provider-only QA preview must not change decoder acceptance');
  const generic=require('./report-paid-core-v2-editorial-triage').inspect(
   next.candidate,
   raw.chapters.saju_core.paragraphs.strength.text,
   plan.task.chapters.saju_core.topics.temperament.paidCoreDepthV2);
  assert(generic.findings.includes('no-concrete-hypothetical-scene'));
  assert(generic.findings.includes('missing-two-sided-conditional-downside'));
  assert.equal(generic.canSell,false);
  const weak=structuredClone(next.candidate);
  weak.basis.refs=['natal.month.stem'];
  assert.equal(review.inspect({route:review.ROUTES.CLASSICAL,prompt,
   paragraph:weak,monthText:raw.chapters.saju_core.paragraphs.strength.text})
   .mechanicallySupported,false);
  assert.equal(bridgeFlagProduction(),false);
  const edited=structuredClone(candidate);
  edited.chapters.saju_core.paragraphs.temperament.basis.refs=
   ['natal.month.stem'];
  assert.throws(()=>decoder.decode(edited,prompt),
   'the actual decoder still rejects missing core citations');
  const genericAddition=structuredClone(next.candidate);
  genericAddition.text+=' 누구나 계획을 세울 때 조심하면 좋습니다.';
  assert.equal(review.inspect({route:review.ROUTES.CLASSICAL,prompt,
   paragraph:genericAddition,
   monthText:raw.chapters.saju_core.paragraphs.strength.text})
   .mechanicallySupported,false);
  console.log('QA3_CLASSICAL_REAL_DECODER_BOUNDARY='+JSON.stringify({
   previousAuthoredSpecimenAccepted:true,
   rewrittenClassicalSpecimenDecoderAccepted:true,
   sceneEditorialTriageStillRejects:true,
   differentiatedClassicalResearchGateAcceptsReviewedText:true,
   actualDecoderAndEditorialMethodAreDistinct:true,
   modelBriefDoesNotChangeDecoderAcceptance:true,
   missingCitationsRejectedByRealDecoder:true,
   unreviewedAddedClaimRejectedByResearchGate:true,
   originalProviderResponseChanged:false,
   modelCalls:0,
   humanQualityApproved:false,
   approvedForSale:false,
   releaseVerdict:'not-approved'
  }));
 }finally{
  for(const [k,v] of Object.entries(before))
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
function bridgeFlagProduction(){
 const bridge=require('./report-paid-core-v2-classical-provider-bridge');
 const p={
  paidCoreDepthV2:true,stage:'body',requestedSections:['saju_core'],
  facts:{chart:{hour:'丁未'}}
 };
 return bridge.enabled(p,{NODE_ENV:'production',
  PAID_CORE_DEPTH_V2:'offline-preview',
  PAID_CORE_V2_CLASSICAL_WRITER:'offline-preview'});
}
