'use strict';
const assert=require('node:assert/strict');
const {capture}=require('./report-core-paid-full-prompt-capture');
const authored=require('./report-core-v2-authored-first-chapter');
const thesis=require('./report-core-thesis');
const repair=require('./report-qa3-archived-first-chapter-reconstruction');
const decoder=require('./report-response-decoder');
(async()=>{
 const names=['NODE_ENV','PAID_CORE_DEPTH_V2','RENDER'];
 const old=Object.fromEntries(names.map(k=>[k,process.env[k]]));
 try{
  process.env.NODE_ENV='test';
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  delete process.env.RENDER;
  const cap=await capture(authored.INPUT);
  assert.equal(cap.providerCalls,0);
  const prompt=cap.prompt,t=thesis.forPrompt(prompt);
  const raw={
   chapters:{saju_core:{title:t.title,keyJudgment:t.keyJudgment,
    mood:'reflective',paragraphs:{
     temperament:{
      label:'모호한 가정',text:'다양한 조건을 살피고 계획을 세우면 좋습니다.',
      basis:{
       refs:['facts.seasonalEvidence','facts.qiEvidence','natal.month.stem'],
       interpretation:'기본 분류에 대한 일반적인 의견입니다.',
       condition:'일반적인 선택 상황입니다.',
       limit:'실제 개인의 성격이나 삶은 확인되지 않았습니다.'
      }},
     strength:{
      label:'태어난 달의 두 기준',
      text:'태어난 달에는 배우는 문제와 역할을 맡는 문제가 함께 드러납니다. 이 분류를 실제 행동이나 결과로 단정할 수는 없습니다.',
      basis:{
       refs:['natal.month.stem','natal.month.hidden.己',
        'facts.seasonalEvidence','facts.qiEvidence'],
       interpretation:'달 겉글자와 달의 대표 속글자는 서로 다릅니다.',
       condition:'배움과 규칙을 비교하는 가정입니다.',
       limit:'실제 기질과 능력은 증명되지 않았습니다.'
      }}
    }}},cover:null,finalJudgment:null
  };
  const frozen=JSON.stringify(raw);
  assert.throws(()=>decoder.decode(raw,prompt));
  const verdict=repair.inspect(prompt,raw);
  assert.equal(JSON.stringify(raw),frozen);
  assert.equal(verdict.originalPreserved,true);
  assert.equal(verdict.originalMonthPreserved,true);
  assert.equal(verdict.candidateCitationCoverage,true);
  assert.equal(verdict.originalProviderCallsAdded,0);
  assert.equal(verdict.humanReviewRequired,true);
  assert.equal(verdict.approvedForSale,false);
  assert.equal(verdict.releaseVerdict,'not-approved');
  assert.equal(verdict.proposedCharacterCount>700,true);
  assert.equal(verdict.requiredServerCitations,7);
  assert(verdict.candidateCitations>=verdict.requiredServerCitations);
  const noExtra=structuredClone(raw);
  noExtra.chapters.saju_core.paragraphs.temperament=null;
  assert.throws(()=>repair.inspect(prompt,noExtra),
   /QA3_ORIGINAL_FIRST_CHAPTER_NOT_RECONSTRUCTABLE/);
  assert.throws(()=>repair.inspect(prompt,raw,{requestHash:'wrong'}),
   /QA3_ARCHIVED_EDITORIAL_RECONSTRUCTION_OFFLINE_ONLY/);
  process.env.NODE_ENV='production';
  assert.throws(()=>repair.inspect(prompt,raw),
   /QA3_ARCHIVED_EDITORIAL_RECONSTRUCTION_OFFLINE_ONLY/);
  process.env.NODE_ENV='test';
  process.env.RENDER='true';
  assert.throws(()=>repair.inspect(prompt,raw),
   /QA3_ARCHIVED_EDITORIAL_RECONSTRUCTION_OFFLINE_ONLY/);
  console.log('QA3_OFFLINE_SOURCE_OWNED_RECONSTRUCTION_TEST='+JSON.stringify({
   originalBadOutputRejected:true,
   archivedRawImmutable:true,
   candidateDecoderAccepted:verdict.actualDecoderAccepted,
   candidateDecoderFailure:verdict.decoderFailure,
   candidateMachineFindings:verdict.qualityFindings,
   noExtraProviderCalls:true,
   productionDisabled:true,
   approvedForSale:false
  }));
 }finally{
  for(const [k,v] of Object.entries(old))
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
