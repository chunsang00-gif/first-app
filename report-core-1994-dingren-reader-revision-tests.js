'use strict';
// Direct QA gate for one rewritten (still unapproved) reader manuscript.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const policy=require('./report-reader-policy');
const original=require('./report-core-v2-authored-first-chapter');
const rewritten=require('./report-core-1994-dingren-reader-revision');
const classical=require('./report-core-1994-dingren-classical-rule-audit');
const triage=require('./report-paid-core-v2-editorial-triage');
const {capture}=require('./report-core-paid-full-prompt-capture');
const writer=require('./report-generation-request');
(async()=>{
 const keys=['NODE_ENV','PAID_CORE_DEPTH_V2','RENDER'];
 const previous=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 try{
  process.env.NODE_ENV='test';process.env.PAID_CORE_DEPTH_V2='offline-preview';
  delete process.env.RENDER;
  const packet=facts.build(classical.INPUT,2027);
  const old=original.make(packet);
  const originalSnapshot=JSON.stringify(old);
  const revision=rewritten.make(packet);
  assert(revision);
  assert.equal(JSON.stringify(old),originalSnapshot);
  assert.equal(revision.releaseVerdict,'not-approved');
  assert.equal(revision.approvedForCustomer,false);
  assert.equal(revision.approvedForPaidWriter,false);
  assert.equal(revision.origin,'human-edited-not-model-generated');
  assert.equal(revision.paragraphCount,3);
  assert(revision.candidate.text.length>=600);
  assert.equal(policy.errors([revision.candidate.label,
    revision.candidate.text]).length,0);
  assert(!/[\u3400-\u4dbf\u4e00-\u9fff]/.test(
   revision.candidate.label+revision.candidate.text));
  assert(!/(?:장비를 도입|재고 관리 업무|봉투.*포장|첫 조건만 준비|반대로 추가 조건만)/.test(
   revision.candidate.text));
  assert(revision.candidate.text.includes('『삼명통회』'));
  assert(revision.candidate.text.includes('『자평진전』'));
  assert(revision.candidate.text.includes('오후 8시 20분'));
  assert(revision.candidate.text.includes('달의 범위에 들어갑니다'));
  assert(revision.candidate.text.includes('실제로 바뀐 것은 아닙니다'));
  assert.equal(revision.ancientSources.length,2);
  assert(revision.candidate.basis.refs.every(id=>old.proposal.basis.refs.includes(id)));
  assert.notEqual(revision.candidate.text,old.proposal.text);
  assert(!revision.candidate.text.includes('여섯 달'));
  const free=await capture(classical.INPUT);
  assert.equal(free.providerCalls,0);
  const prompt={...free.prompt,requestedSections:['saju_core'],paidCoreDepthV2:true};
  const topic=writer.compile(prompt).task.chapters.saju_core.topics.temperament;
  assert(revision.candidate.basis.refs.every(id=>
   topic.citableFacts.some(f=>f.id===id)));
  // Existing machine editorial is designed for two-sided generic job scenes.
  // Report this known limitation instead of adding an unrelated scene to pass.
  const mechanical=triage.inspect(revision.candidate,
   '태어난 달은 배우는 역할과 규칙을 상징합니다.',topic.paidCoreDepthV2);
  assert(mechanical.canSell===false);
  assert(mechanical.manualReview==='traditional-interpretation-and-paid-reader-value-required');
  // Research is exact-hour only: the differing time must not borrow this.
  assert.equal(rewritten.make(facts.build({...classical.INPUT,
   birthTime:'20:20'},2027)),null);
  assert.equal(rewritten.make(facts.build({...classical.INPUT,
   birthDate:'1994-07-16'},2027)),null);
  assert.equal(rewritten.make(facts.build(classical.INPUT,2028)),null);
  process.env.NODE_ENV='production';
  assert.throws(()=>rewritten.make(packet),/QA_1994_DINGREN_READER_RESEARCH_ONLY/);
  process.env.NODE_ENV='test';process.env.RENDER='true';
  assert.throws(()=>rewritten.make(packet),/QA_1994_DINGREN_READER_RESEARCH_ONLY/);
  console.log('QA_1994_CLASSICS_READER_REWRITE='+JSON.stringify({
   exactChart:revision.exactChart,
   oldBodyCharacters:old.proposal.text.length,
   newBodyCharacters:revision.candidate.text.length,
   paragraphs:revision.paragraphCount,
   genericWorkplaceSceneRemoved:true,expertTermsInPublicCopy:0,
   allCitationsExistingAndAllowed:true,
   explicitChangedHourCounterexample:true,
   editorialMachineCodes:mechanical.findings,
   historicalRuleSelectedAsDominant:false,
   releasedToPaidCustomers:false,
   automaticPremiumQualityPass:false,
   originalDraftPreserved:true,
   modelCalls:0
  }));
 }finally{
  for(const [key,v] of Object.entries(previous))
   if(v===undefined)delete process.env[key];else process.env[key]=v;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
