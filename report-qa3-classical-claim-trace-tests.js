'use strict';
// Per-claim evidence lineage for synthetic, non-provider free-text QA.
const assert=require('node:assert/strict');
const {capture}=require('./report-core-paid-full-prompt-capture');
const authored=require('./report-core-v2-authored-first-chapter');
const revised=require('./report-core-1994-dingren-reader-revision');
const screen=require('./report-qa3-classical-open-prose-audit');
const claimTrace=require('./report-qa3-classical-claim-trace');
const writer=require('./report-generation-request');
(async()=>{
 const keys=['NODE_ENV','RENDER','PAID_CORE_DEPTH_V2',
  'PAID_CORE_V2_CLASSICAL_WRITER'];
 const before=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 try{
  process.env.NODE_ENV='test';
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  delete process.env.RENDER;
  delete process.env.PAID_CORE_V2_CLASSICAL_WRITER;
  const c=await capture(authored.INPUT);
  assert.equal(c.providerCalls,0);
  const original=revised.make(c.prompt.facts).candidate;
  const snapshot=JSON.stringify(original);
  const standard=screen.screen(c.prompt,original);
  const trace=standard.claimTrace;
  assert.equal(trace.kind,'qa3-classical-per-claim-review-ledger-v1');
  assert.equal(trace.claimRows.length,5);
  assert.equal(trace.sentenceRows.length,standard.totalSentences);
  assert.equal(trace.mechanicallyReadyForHumanAdjudication,true,
   JSON.stringify(trace.missingNonContradictoryClaimCues));
  assert.equal(trace.paragraphLevelOnlyCitations,true);
  assert.equal(trace.individualSentenceCitationsVerified,false);
  assert.equal(trace.sentenceMeaningVerified,false);
  assert.equal(trace.humanReviewRequired,true);
  assert.equal(trace.canSell,false);
  assert.equal(trace.releaseVerdict,'not-approved');
  assert(trace.claimRows.every(x=>x.citationPresence&&x.sourceExistence&&
   x.requiredSourceRefIds.length>=2&&x.humanDecision==='pending'));
  assert(trace.claimRows.some(x=>x.claimId==='hour-counterexample'&&
   x.requiredSourceRefIds.includes('natal.hour.stem')));
  assert(trace.sentenceRows.every(x=>x.needsHumanReview===true&&
   x.claimMeaningVerified===false&&
   x.individualSentenceCitationsVerified===false));
  const changed=structuredClone(original);
  const base='태어난 시간의 윗글자는 태어난 달 속에 숨은 자원 관리 관련 글자와 정확히 같습니다.';
  assert(changed.text.includes(base));
  const inverted='태어난 달 속에 숨은 글자와 태어난 시간의 글자는 서로 다릅니다.';
  changed.text=changed.text.replace(base,inverted);
  const wrong=screen.screen(c.prompt,changed);
  assert(wrong.coveredClaimCues.includes('hidden-and-visible'),
   'old cue detector would still see the word 일치/같이 in a false claim');
  assert(wrong.findings.includes('QA3_FALSE_MONTH_HOUR_EXPOSURE'));
  const exposure=wrong.claimTrace.claimRows.find(x=>x.claimId==='hidden-and-visible');
  assert(exposure.contradictedSentenceIndices.length>0);
  assert.equal(exposure.candidateNonContradictoryCueIndices.length,0);
  assert(wrong.findings.includes(
   'QA3_OPEN_PROSE_NO_NONCONTRADICTORY_CLAIM_CUE:hidden-and-visible'));
  assert.equal(wrong.claimTrace.mechanicallyReadyForHumanAdjudication,false);
  assert.equal(wrong.canSell,false);
  const noCitation=structuredClone(original);
  noCitation.basis.refs=noCitation.basis.refs.filter(x=>x!=='natal.hour.stem');
  const lacking=screen.screen(c.prompt,noCitation);
  assert(lacking.findings.includes('QA3_OPEN_PROSE_SOURCE_IDS_INVALID'));
  assert(lacking.findings.includes('QA3_OPEN_PROSE_CLAIM_SOURCE_INCOMPLETE'));
  assert(lacking.claimTrace.claimRows.some(x=>
   x.missingParagraphCitationIds.includes('natal.hour.stem')));
  const unknown=structuredClone(original);
  unknown.text+=' 이 사람은 매운 음식을 좋아할 가능성이 높습니다.';
  const pending=screen.screen(c.prompt,unknown);
  assert.equal(pending.status,'requires-human-review');
  assert(pending.claimTrace.sentenceRows.some(x=>
   x.text.includes('매운 음식')&&x.claimCues.length===0&&x.needsHumanReview));
  assert.equal(pending.claimTrace.sentenceMeaningVerified,false);
  // A corrupt source in a test-only copy must be visible to the per-claim
  // ledger even when the cited reference ID is still printed.
  const payload=writer.compile(c.prompt);
  const broken=structuredClone(payload);
  delete broken.source['natal.hour.stem'];
  const brief={
   kind:'qa3-1994-classical-verified-writing-brief-v1',
   releaseVerdict:'not-approved',
   requiredEvidenceRefs:original.basis.refs.slice(),
   exactChart:'甲戌/辛未/壬寅/丁未',
   permittedClaims:[
    {id:'hidden-and-visible',statement:'synthetic',refs:[
     'natal.month.hidden.丁','natal.hour.stem']}
   ]
  };
  const direct=claimTrace.trace({paragraph:original,brief,payload:broken,
   rules:{'hidden-and-visible':screen.rules['hidden-and-visible']},
   splitSentences:screen.sentences,detectHazards:()=>[]});
  assert(direct.incompleteSourceRefIds.includes('natal.hour.stem'));
  assert.equal(direct.claimRows[0].sourceExistence,false);
  assert.equal(direct.mechanicallyReadyForHumanAdjudication,false);
  assert.equal(JSON.stringify(original),snapshot);
  process.env.NODE_ENV='production';
  assert.throws(()=>screen.screen(c.prompt,original),/QA3_OPEN_PROSE_OFFLINE_ONLY/);
  console.log('QA3_CLASSICAL_PER_CLAIM_LINEAGE='+JSON.stringify({
   exactChart:'甲戌/辛未/壬寅/丁未',
   claimRows:trace.claimRows.length,
   sentenceRows:trace.sentenceRows.length,
   allPerSentenceProofExplicitlyPending:true,
   falseClaimWithValidRefAndMatchingCueDenied:true,
   missingParagraphSourceDetected:true,
   missingServerSourceDetected:true,
   unrelatedNovelSentencePendingHumanReview:true,
   originalManuscriptUnchanged:true,providerCalls:0,
   productionDisabled:true,releaseVerdict:'not-approved'
  }));
 }finally{
  for(const [k,v] of Object.entries(before))
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
