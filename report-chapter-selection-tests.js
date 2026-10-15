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
 assert(r.issues.some(x=>x.startsWith('insufficient-premium-depth:')));
}
{
 const p=create();p.money.topicTasks.first.mode='state-limits';
 const r=selection.select(groups,p);
 assert(r.omitted.some(x=>x.id==='money'),'a stale anchor without evidence must not pass');
 assert(r.canGenerate);
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
