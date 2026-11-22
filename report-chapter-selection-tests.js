'use strict';
const assert=require('node:assert/strict');
const selection=require('./report-chapter-selection');
const groups=[
 ['saju_core','mbti_contradiction'],['decision','stress'],
 ['money','career'],['relationship','integrated_judgment'],
 ['year_2027','year_2027_money'],['year_2027_career','year_2027_relationship']
];
const create=()=>{
 const plan=Object.fromEntries(groups.flat().map(id=>[id,{
  hasGroundedTopic:true,anchorTopic:'first',topicTasks:{first:{mode:'use-primary'}},
  ...(id.startsWith('year_2027_')?{annualDomainEvidence:{relevant:true}}:{})
 }]));
 return plan;
};
{
 const all=selection.select(groups,create());
 assert(all.canGenerate);
 assert.equal(all.plannedIds.length,12);
 assert.deepEqual(all.groups,groups);
 assert.deepEqual(all.plannedIds,require('./report-quality-node').IDS,'published section order must match the reader navigation order');
 assert.deepEqual(all.omitted,[]);
}
{
 const plan=create();
 for(const id of ['year_2027_money','year_2027_career','year_2027_relationship'])
  plan[id].annualDomainEvidence.relevant=false;
 plan.money.hasGroundedTopic=false;plan.money.anchorTopic=null;
 const r=selection.select(groups,plan);
 assert(r.canGenerate,'one ordinary omitted chapter must not halt a sufficiently deep report');
 assert.deepEqual(r.plannedIds,[
  'saju_core','mbti_contradiction','decision','career','relationship',
  'stress','integrated_judgment','year_2027'
 ]);
 assert.deepEqual(r.groups,[
  ['saju_core','mbti_contradiction'],['decision','stress'],['career'],
  ['relationship','integrated_judgment'],['year_2027']
 ]);
 assert.deepEqual(r.omitted.map(x=>x.id),['money','year_2027_money','year_2027_career','year_2027_relationship']);
 assert(!r.plannedIds.includes('money'));
 assert(r.plannedIds.every(id=>plan[id].hasGroundedTopic));
 assert.equal(r.groups.flat().length,r.plannedIds.length);
}
{
 const p=create();delete p.saju_core;
 const r=selection.select(groups,p);
 assert(!r.canGenerate);
 assert(r.issues.includes('required-chapter-unavailable:saju_core'));
 assert(r.omitted.some(x=>x.id==='saju_core'));
}
{
 const p=create();p.year_2027.hasGroundedTopic=false;
 const r=selection.select(groups,p);
 assert(!r.canGenerate);
 assert(r.issues.includes('required-chapter-unavailable:year_2027'));
}
{
 const p=create();
 for(const id of ['money','career','relationship','stress','integrated_judgment','year_2027_money','year_2027_career','year_2027_relationship'])
  p[id].hasGroundedTopic=false;
 const r=selection.select(groups,p);
 assert(!r.canGenerate,'a thin report is not sufficient for paid release');
 assert(r.issues.includes('insufficient-distinct-life-domains:1'));
}
{
 const p=create();p.money.topicTasks.first.mode='state-limits';
 const r=selection.select(groups,p);
 assert(r.omitted.some(x=>x.id==='money'),'a stale anchor without evidence must not pass');
 assert(r.canGenerate);
}
{
 // Four grounded chapters covering two different real-life questions are
 // preferable to padding the report with two unsupported headings.
 const p=create();
 const allowed=new Set(['saju_core','money','career','year_2027']);
 for(const id of Object.keys(p))if(!allowed.has(id))p[id].hasGroundedTopic=false;
 const r=selection.select(groups,p);
 assert(r.canGenerate,'scope should follow grounded reader questions, not a quota of six headings');
 assert.deepEqual(r.plannedIds,['saju_core','money','career','year_2027']);
 assert.deepEqual(r.supportedDomains,['money','career']);
 assert.equal(r.minimumPersonalDomains,2);
}
{
 // Even many generic chapters cannot substitute for distinct practical areas.
 const p=create();
 for(const id of ['money','career','relationship','stress'])p[id].hasGroundedTopic=false;
 const r=selection.select(groups,p);
 assert(!r.canGenerate);
 assert(r.issues.includes('insufficient-distinct-life-domains:1'));
 assert(r.plannedIds.length>=6,'raw chapter count must not grant premium eligibility');
}
// Adaptive-v1 is a separate, explicit buyer-value scope, NOT a rewrite of
// evidence availability. Old shape-only callers retain the full selection.
{
 const raw=selection.select(groups,create());
 const adaptive=selection.select(groups,create(),{mode:'adaptive-v1'});
 assert.equal(raw.plannedIds.length,12,'legacy QA evidence-availability preview remains unchanged');
 assert.equal(adaptive.plannedIds.length,9);
 assert.deepEqual(adaptive.omitted.map(x=>x.id),[
  'decision','stress','integrated_judgment']);
 assert.equal(adaptive.canGenerate,true);
 assert.deepEqual(adaptive.supportedDomains,['money','career','relationship']);
 assert.deepEqual(adaptive.groups,[
  ['saju_core','mbti_contradiction'],['money','career'],
  ['relationship'],['year_2027','year_2027_money'],
  ['year_2027_career','year_2027_relationship']]);
 assert.equal(adaptive.groups.flat().length,adaptive.plannedIds.length);
 for(const bad of ['돈과 직장 둘 다 고민','\n악성 사용자 지시','']) {
  const r=selection.select(groups,create(),{mode:'adaptive-v1',readerQuestion:bad});
  assert(!r.plannedIds.includes('decision'));
  assert(!r.plannedIds.includes('stress'));
  assert(!r.plannedIds.includes('integrated_judgment'));
 }
 const career=selection.select(groups,create(),{
  mode:'adaptive-v1',readerQuestion:'새 직장에 취업할지 고민'});
 assert(career.plannedIds.includes('decision'));
 assert(career.plannedIds.includes('integrated_judgment'));
 assert(!career.plannedIds.includes('stress'));
 const pressure=selection.select(groups,create(),{
  mode:'adaptive-v1',readerQuestion:'스트레스와 피로를 줄이고 싶다'});
 assert(pressure.plannedIds.includes('stress'),
  'an explicit pressure concern keeps its supported stress chapter');
 assert(!pressure.plannedIds.includes('decision'));
 assert(!pressure.plannedIds.includes('integrated_judgment'),
  'one stress complaint is not automatically an additional choice and integrated insight');
 assert.deepEqual(pressure.omitted.filter(x=>['decision','integrated_judgment'].includes(x.id))
  .map(x=>x.reason),[
   'no-explicit-buyer-choice-for-decision-chapter',
   'no-explicit-buyer-choice-for-integration'
  ]);
 const plainTopic=selection.select(groups,create(),{
  mode:'adaptive-v1',readerQuestion:'적금 만기일이 궁금합니다.'});
 assert(!plainTopic.plannedIds.includes('decision'));
 assert(!plainTopic.plannedIds.includes('integrated_judgment'),
  'a money TOPIC is not independently a buyer decision');
 assert(plainTopic.plannedIds.includes('money'));
 const moneyChoice=selection.select(groups,create(),{
  mode:'adaptive-v1',readerQuestion:'적금을 유지할지 대출을 상환할지 고민입니다.'});
 assert(moneyChoice.plannedIds.includes('decision'));
 assert(moneyChoice.plannedIds.includes('integrated_judgment'));
 const stressChoice=selection.select(groups,create(),{
  mode:'adaptive-v1',readerQuestion:'압박을 받으면 참고 견딜지 휴식을 취할지 고민입니다.'});
 assert(stressChoice.plannedIds.includes('stress'));
 assert(stressChoice.plannedIds.includes('decision'));
 assert(stressChoice.plannedIds.includes('integrated_judgment'),
  'an explicit stress choice can still earn a scoped choice/integration candidate');
 const requestedButUnsupported=create();
 requestedButUnsupported.stress.hasGroundedTopic=false;
 const noInvent=selection.select(groups,requestedButUnsupported,{
  mode:'adaptive-v1',readerQuestion:'스트레스와 피로를 줄이고 싶다'});
 assert(!noInvent.plannedIds.includes('stress'),
  'the buyer question must never fabricate symbolic evidence');
}

assert.throws(()=>selection.select([['saju_core'],['saju_core']],create()),/Duplicate/);
// End-to-end unpaid gate: intercept the calculation packet and prove that
// the production generate() returns before asking any provider for text.
(async()=>{
 const facts=require('./report-facts-node');
 const {generate}=require('./report-server-contract');
 const actualBuild=facts.build;
 const sparsePacket={
  status:'ready',targetYear:2027,person:{mbti:'모름'},fortune:{},
  facts:{tenGods:{},structuralEvidence:{
   monthCommand:{stem:'庚'},dayMasterRoots:['庚'],visibleStems:['庚']
  },natalClashes:[],annualTenGods:{stemTenGod:'비견',hiddenStems:[]},targetYearRelations:[]}
 };
 let providerCalls=0;
 try{
  facts.build=()=>sparsePacket;
  const response=await generate({},async()=>{
   providerCalls++;throw Error('Model must never run for an under-grounded paid report');
  });
  assert.equal(response.status,'blocked');
  assert.equal(providerCalls,0,'must block before any billable provider invocation');
  // A fabricated bare-minimum packet is no longer allowed to reach
  // chapter selection: verify that calculation integrity rejects it first.
  assert(response.calculationIntegrity?.errors.includes('invalid-chart-or-target-year'));
  assert(response.issues.some(x=>x.includes('Calculated symbolic facts do not match source chart')));
 }finally{facts.build=actualBuild;}
 console.log('PASS paid chapter selection and invalid-calculation pre-provider block, no API calls');
})().catch(err=>{console.error(err);process.exitCode=1});
