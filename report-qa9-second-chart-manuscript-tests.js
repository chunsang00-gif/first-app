'use strict';
// QA9 exact second-chart reader proposal. Real decoder, no provider or sales.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {capture}=require('./report-core-paid-full-prompt-capture');
const writer=require('./report-generation-request');
const thesis=require('./report-core-thesis');
const decoder=require('./report-response-decoder');
const original=require('./report-qa3-multichart-source-owned-editorial');
const gate=require('./report-qa8-multichart-transfer-guard');
const triage=require('./report-paid-core-v2-editorial-triage');
const {overlap}=require('./report-core-paid-natal-depth-response-gate');
const qa9=require('./report-qa9-second-chart-manuscript');
const names=['NODE_ENV','RENDER','PAID_CORE_DEPTH_V2'];
(async()=>{
 const saved=Object.fromEntries(names.map(k=>[k,process.env[k]]));
 try{
  process.env.NODE_ENV='test';process.env.PAID_CORE_DEPTH_V2='offline-preview';
  delete process.env.RENDER;
  const got=await capture(qa9.FIXTURE);
  assert.equal(got.providerCalls,0);
  const prompt={...got.prompt,paidCoreDepthV2:true,
   requestedSections:['saju_core']};
  const plan=writer.compile(prompt);
  const base=original.build(prompt);
  assert(base&&base.approvedForCustomer===false);
  const specimen=qa9.make(prompt);
  assert(specimen);
  assert.equal(specimen.sceneId,'archive-label-review-vs-delivery');
  assert.equal(specimen.contractKind,base.contractKind);
  assert.equal(specimen.chartFingerprint,base.chartFingerprint);
  assert.deepEqual(specimen.candidate.basis.refs,base.candidate.basis.refs);
  assert.notEqual(specimen.candidate.text,base.candidate.text);
  assert(overlap(specimen.candidate.text,base.candidate.text)<0.65,
   'QA9 must be a new composition, not a near-copy of the generic scene');
  const review=gate.inspect(prompt,specimen);
  assert.equal(review.concreteIllustrationDetected,true);
  assert.equal(review.actualPersonalBehaviourProven,false);
  assert.equal(review.canSell,false);
  const c=plan.task.chapters.saju_core;
  const th=thesis.forPrompt(prompt);
  const hidden=prompt.facts.facts.structuralEvidence.monthCommand.mainHiddenStem;
  const allowed=writer.allowedRefs(plan,c.topics.strength,'saju_core','strength');
  const monthRefs=['natal.month.stem','natal.month.hidden.'+hidden,
   'facts.seasonalEvidence','facts.qiEvidence'].filter(id=>allowed.has(id));
  assert.equal(monthRefs.length,4);
  const originalMonth='태어난 달의 겉글자와 대표 속글자는 다른 뜻이 있습니다. 출생월에 관한 이 계산만으로 실제 행동이나 능력은 판단할 수 없습니다.';
  const response={chapters:{saju_core:{
    title:th.title,keyJudgment:th.keyJudgment,mood:'reflective',
    paragraphs:{
     strength:{label:'태어난 달에서 구별할 두 기준',text:originalMonth,
      basis:{refs:monthRefs,interpretation:'출생월 기본 분류만 비교합니다.',
       condition:'출생월에서 확인한 계산에 한정합니다.',
       limit:'이 사람의 행동이나 성과는 확인되지 않았습니다.'}},
     temperament:structuredClone(specimen.candidate)
    }}},cover:null,finalJudgment:null};
  const frozen=JSON.stringify(response);
  const decoded=decoder.decode(response,prompt);
  assert.equal(JSON.stringify(response),frozen,'no response mutation');
  assert(decoded.sections?.[0]?.bodyTopics?.includes('temperament'));
  assert(decoded.sections?.[0]?.bodyTopics?.includes('strength'));
  const editorial=triage.inspect(specimen.candidate,originalMonth,
   c.topics.temperament.paidCoreDepthV2);
  assert.deepEqual(editorial.findings,[],JSON.stringify(editorial.findings));
  assert.equal(editorial.canSell,false);
  const altered=structuredClone(specimen);
  altered.candidate.basis.refs.pop();
  assert.throws(()=>gate.inspect(prompt,altered),
   /QA8_CROSS_CHART_SPECIMEN_OR_REFS_TRANSPLANTED/);
  const moved=await capture({calendar:'solar',birthDate:'1994-07-15',
   birthTime:'14:20',gender:'male',mbti:'ISFP'});
  const other={...moved.prompt,paidCoreDepthV2:true,requestedSections:['saju_core']};
  assert.equal(qa9.make(other),null);
  assert.throws(()=>gate.inspect(other,specimen),
   /QA8_CROSS_CHART_SPECIMEN_OR_REFS_TRANSPLANTED/);
  process.env.NODE_ENV='production';
  assert.throws(()=>qa9.make(prompt),/QA9_SECOND_CHART_OFFLINE_ONLY/);
  process.env.NODE_ENV='test';process.env.RENDER='true';
  assert.throws(()=>qa9.make(prompt),/QA9_SECOND_CHART_OFFLINE_ONLY/);
  console.log('QA9_SECOND_CHART_MANUSCRIPT='+JSON.stringify({
   secondOriginalChart:true,exactServerOwnedReferences:true,
   nonDuplicatedManuscript:true,caseSpecificConditionalExample:true,
   realAppDecoderPassed:true,realEditorMechanicalFindings:0,
   foreignChartProseBlocked:true,productionDisabled:true,
   actualProviderCalls:0,expertApproved:false,canSell:false
  }));
 }finally{
  for(const [k,v] of Object.entries(saved))
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
