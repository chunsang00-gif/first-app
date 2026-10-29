'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {capture}=require('./report-core-paid-full-prompt-capture');
const old=require('./report-core-v2-authored-first-chapter');
const revision=require('./report-core-1994-dingren-reader-revision');
const qa9=require('./report-qa9-second-chart-manuscript');
const judge=require('./report-qa10-two-manuscript-evidence-delta');
const names=['NODE_ENV','RENDER','PAID_CORE_DEPTH_V2',
 'PAID_CORE_V2_CLASSICAL_WRITER','PAID_CORE_V2_CLAIM_LINKS',
 'PAID_CORE_V2_REQUIRED_RESEARCH_SLOT'];
const scoped=p=>({...p,requestedSections:['saju_core'],paidCoreDepthV2:true});
async function run(){
 const prior=Object.fromEntries(names.map(k=>[k,process.env[k]]));
 try{
  process.env.NODE_ENV='test';delete process.env.RENDER;
  for(const k of names.slice(2))process.env[k]='offline-preview';
  const a=await capture(old.INPUT),b=await capture(qa9.FIXTURE);
  assert.equal(a.providerCalls+b.providerCalls,0);
  const firstPrompt=scoped(a.prompt),secondPrompt=scoped(b.prompt);
  const f=fs.readFileSync(__dirname+'/qa/qa7-editorial-work-note.md','utf8');
  const heads=[
   '## 독자용 첫 문단 — 추가로 읽는 기준',
   '## 독자용 두 번째 문단 — 실제 선택을 설명하는 가정',
   '## 독자용 세 번째 문단 — 같은 출생정보에서 달라지는 판단 범위',
   '## 편집 경계'];
  const paragraphAt=i=>f.split(heads[i]+'\n\n')[1]?.split('\n'+heads[i+1])[0]?.trim();
  const paragraphs=[0,1,2].map(paragraphAt);
  assert(paragraphs.every(x=>x&&x.length>100));
  const first=structuredClone(revision.make(firstPrompt.facts).candidate);
  first.text=paragraphs.join('\n\n');
  first.label='배운 일을 계속하는 조건이 달라지는 이유';
  const second=qa9.make(secondPrompt);
  assert(second);
  const prev=JSON.stringify([first,second]);
  const inputs=[{prompt:firstPrompt,paragraph:first},
   {prompt:secondPrompt,specimen:second}];
  const report=judge.inspect(...inputs);
  assert.equal(JSON.stringify([first,second]),prev);
  assert.equal(report.verifiedDistinctNewPosition,'hour-vs-year');
  assert.equal(report.first.verifiedClaimScope,'day-hour-pair-month-condition');
  assert.equal(report.second.verifiedClaimScope,'month-hidden-visible-at-year');
  assert.equal(report.first.counterexampleConditionVerified,true);
  assert.equal(report.first.individualLifeConclusionProven,false);
  assert.equal(report.second.individualLifeConclusionProven,false);
  assert.equal(report.premiumReaderValueApproved,false);
  assert.equal(report.canSell,false);
  const wrong1=structuredClone(inputs[0]);
  wrong1.paragraph.text=second.candidate.text;
  assert.throws(()=>judge.inspect(wrong1,inputs[1]),
   /QA10_FIRST_CLAIMS_UNSUPPORTED|QA10_READER_EXPLANATION_NOT_SOURCE_SPECIFIC/);
  const wrong2=structuredClone(inputs[1]);
  wrong2.specimen.candidate.text=first.text;
  assert.throws(()=>judge.inspect(inputs[0],wrong2),
   /QA8_PROSE_NOT_ENTAILED_BY_CHART_OUTLINE/);
  // Maintain the scene and correct refs but paste an unrelated classical
  // premise. QA8 alone cannot establish the semantic validity of this prose.
  const borrowed=structuredClone(inputs[1]);
  borrowed.specimen.candidate.text+=' 『삼명통회』에서 이 사람의 출생시간이 서로 다른 기운으로 바뀐다고 합니다.';
  assert.throws(()=>judge.inspect(inputs[0],borrowed),
   /QA10_COPIED_FOREIGN_CHART_RESEARCH_OR_SCENE/);
  const oneSided=structuredClone(inputs[1]);
  oneSided.specimen.candidate.text=oneSided.specimen.candidate.text
   .replace('출처 확인이 빠지면','별도의 사전 검토를 마치면');
  assert.throws(()=>judge.inspect(inputs[0],oneSided),
   /QA10_CASE_COMPARISON_NOT_TWO_SIDED/);
  process.env.NODE_ENV='production';
  assert.throws(()=>judge.inspect(...inputs),/QA10_TWO_CHART_OFFLINE_ONLY/);
  process.env.NODE_ENV='test';process.env.RENDER='true';
  assert.throws(()=>judge.inspect(...inputs),/QA10_TWO_CHART_OFFLINE_ONLY/);
  console.log('QA10_TWO_MANUSCRIPT_DELTA='+JSON.stringify({
   matchedIndependentSourceScopes:2,
   chartSpecificDifferenceNotJustSceneNames:true,
   classicalChapterTransplantRejected:true,
   twoSidedComparisonPreserved:true,
   noObservedLifeOutcome:true,
   originalProseSemanticallyApproved:false,
   paidReaderValueApproved:false,actualProviderCalls:0,canSell:false
  }));
 }finally{
  for(const [key,v] of Object.entries(prior))
   if(v===undefined)delete process.env[key];else process.env[key]=v;
 }
}
run().catch(e=>{console.error(e);process.exitCode=1});
