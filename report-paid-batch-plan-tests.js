'use strict';
// All tests are offline. They must never spend a paid generation.
const assert=require('node:assert/strict');
const batch=require('./report-paid-batch-plan');
const {build}=require('./report-facts-node');
const selection=require('./report-chapter-selection');
const guidance=require('./report-analysis-guidance');
const contract=require('./report-server-contract');
const allGroups=[
 ['saju_core','mbti_contradiction'],['decision','stress'],
 ['money','career'],['relationship','integrated_judgment'],
 ['year_2027','year_2027_money'],
 ['year_2027_career','year_2027_relationship']
];
(async()=>{
 const birth={calendar:'lunar',leapMonth:false,birthDate:'1982-11-24',
  birthTime:'14:20',gender:'male',mbti:'ISFP',name:'검증용'};
 const packet=build(birth,2027);
 assert.equal(packet.status,'ready');
 const coverage=selection.select(allGroups,guidance.preflight(packet));
 assert(coverage.canGenerate,'real lunar ISFP report must be eligible');
 assert.equal(coverage.groups.length,5,'expected five grounded body batches for real ISFP report');
 const planned=batch.plan(coverage.groups);
 assert.equal(planned.length+1,7,'exact six body calls and one synthesis for this sample');
 assert.deepEqual(planned[0],['saju_core']);
 assert.deepEqual(planned[1],['mbti_contradiction']);
 assert.deepEqual(planned.slice(2),coverage.groups.slice(1),
  'splitting must not change downstream chapter coverage or order');
 assert.equal(batch.plan(allGroups).length+1,7,
  'full twelve-chapter scenario must not exceed the original seven calls');
 assert.deepEqual(batch.plan(allGroups)[0],allGroups[0],
  'do not split when it would require an eighth paid model call');
 assert.throws(()=>batch.plan([...allGroups,['extra']]),/maximum model call count/);
 assert.deepEqual(allGroups[0],['saju_core','mbti_contradiction'],
  'input groups must not be mutated');
 assert.equal(batch.outputLimit('gpt-4.1',{stage:'body',requestedSections:['saju_core']}),18000);
 assert.equal(batch.outputLimit('gpt-4.1',{stage:'body',requestedSections:['saju_core','mbti_contradiction']}),18000);
 assert.equal(batch.outputLimit('gpt-4.1',{stage:'body',requestedSections:['mbti_contradiction']}),12000);
 assert.equal(batch.outputLimit('gpt-4.1',{stage:'body',requestedSections:['money','career']}),12000);
 assert.equal(batch.outputLimit('gpt-4.1',{stage:'synthesis'}),12000);
 assert.equal(batch.outputLimit('other-model',{stage:'body',requestedSections:['saju_core']}),9000);
 let calls=0,first=null;
 await assert.rejects(contract.generate(birth,async prompt=>{
  calls++;first=prompt;throw Error('OFFLINE_NO_PAID_CALL');
 }),/OFFLINE_NO_PAID_CALL/);
 assert.equal(calls,1,'failure must never retry or continue paid QA calls');
 assert.deepEqual(first.requestedSections,['saju_core'],
  'the real contract must isolate the oversized first chapter');
 // Verify provider request parameters and the explicit single-call stop for
 // incomplete output, without any real network traffic.
 const server=require('./server');
 const saved={fetch:global.fetch,key:process.env.OPENAI_API_KEY,model:process.env.REPORT_MODEL};
 try{
  process.env.OPENAI_API_KEY='offline-placeholder';process.env.REPORT_MODEL='gpt-4.1';
  let providerCalls=0,archived=[];
  global.fetch=async(_url,options)=>{
   providerCalls++;
   const body=JSON.parse(options.body);
   assert.equal(body.max_output_tokens,18000,
    'the provider must receive the intended dense-chapter budget');
   return {ok:true,json:async()=>({
    status:'incomplete',incomplete_details:{reason:'max_output_tokens'},
    usage:{output_tokens:18000}
   })};
  };
  await assert.rejects(server.callOpenAI(first,value=>{archived.push(value)}),/output token limit/);
  assert.equal(providerCalls,1,'provider truncation must not trigger a paid retry');
  assert.equal(archived.length,1,'even rejected paid output must be preserved exactly once');
  assert.deepEqual(archived[0],{
   status:'incomplete',incomplete_details:{reason:'max_output_tokens'},
   usage:{output_tokens:18000},partialOutput:null
  },'incomplete response metadata must be available to the private QA artifact');
 }finally{
  global.fetch=saved.fetch;
  for(const [name,value] of [['OPENAI_API_KEY',saved.key],['REPORT_MODEL',saved.model]]){
   if(value===undefined)delete process.env[name];else process.env[name]=value;
  }
 }
 console.log('PASS output-aware user lunar batch plan, max 7 calls, controlled token cap, single-call abort; zero real API calls');
})().catch(e=>{console.error(e);process.exitCode=1});
