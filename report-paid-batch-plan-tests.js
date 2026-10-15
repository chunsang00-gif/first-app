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
    usage:{output_tokens:18000},
    output:[{type:'message',content:[{type:'output_text',text:'{"chapters":{"saju_core":'}]}]
   })};
  };
  await assert.rejects(server.callOpenAI(first,value=>{archived.push(value)}),/output token limit/);
  assert.equal(providerCalls,1,'provider truncation must not trigger a paid retry');
  assert.equal(archived.length,1,'even rejected paid output must be preserved exactly once');
  assert.deepEqual(archived[0],{
   status:'incomplete',incomplete_details:{reason:'max_output_tokens'},
   usage:{output_tokens:18000},
   partialOutput:[{type:'message',content:[{type:'output_text',text:'{"chapters":{"saju_core":'}]}]
  },'incomplete response metadata must be available to the private QA artifact');
 }finally{
  global.fetch=saved.fetch;
  for(const [name,value] of [['OPENAI_API_KEY',saved.key],['REPORT_MODEL',saved.model]]){
   if(value===undefined)delete process.env[name];else process.env[name]=value;
  }
 }
  // Real paid run 38744366989 leaked private chart vocabulary in public copy.
 // Repair only display fields, preserve evidence and the unmodified input.
 const reader=require('./report-reader-policy');
 const original={sections:[{title:'이 명식의 성향',keyJudgment:'월지의 계절적 위치와 오행을 확인한다.',
  bodyLabels:['원국에서 보는 일간'],body:['월지에는 흙이, 일지와 시지에는 나무가 있습니다.'],
  evidence:['월지 癸丑 / 일간 乙 / 시지 癸未']}],
  cover:{headline:'이 명식은',description:'월지에는',keywords:['오행'],highlights:[{title:'시지',description:'일지와 시지'}]},
  finalJudgment:{headline:'월지',body:['오행'],strengths:['명식'],watchouts:['일간'],
   routines:[{trigger:'월지',action:'시지',reason:'원국'}],closingQuestion:'일지와 시지'}};
 const cleaned=reader.normalizeVisible(original);
 assert.deepEqual(reader.errors(reader.visibleFields(cleaned)),[],
  'known internal terms must not leak into reader text');
 assert.deepEqual(cleaned.sections[0].evidence,original.sections[0].evidence,
  'calculated evidence must never be rewritten');
 assert.equal(original.sections[0].keyJudgment,'월지의 계절적 위치와 오행을 확인한다.',
  'archived raw output must not be changed');
 assert(cleaned.sections[0].body[0].includes('태어난 날과 시간을 나타내는 자리'));
 assert.deepEqual(reader.normalizeVisible(cleaned),cleaned,'display copy normalization is idempotent');
 assert(reader.errors(['전통 해석의 정관으로 판단합니다.']).length,
  'unhandled technical meaning must still fail closed');
  // Offline regression from the first paid Saju chapter (no identifying data).
 const inspect=require('./report-grounding-review').inspect;
 const weak={sections:[{id:'saju_core',
  keyJudgment:'다양한 자원이 함께 드러납니다. 서로 다른 방향이 병존합니다.',
  body:['여러 기운이 함께 작용합니다. 상황에 따라 다양한 판단과 조정이 필요합니다.',
        '다양한 상황에 적응하는 균형이 필요합니다.']}]};
 assert(inspect(weak).blockingErrors.length>0,'generic paid prose must block next call');
 const deep={sections:[{id:'saju_core',
  keyJudgment:'겉에 드러난 글자에는 배움의 상징이 반복됩니다.',
  body:['겉에 나온 글자와 달 안쪽에 숨은 글자의 전통적 의미는 달라, 하나를 같은 성격이라고 단정할 수 없습니다. 두 위치를 구분해 읽는 것이 먼저입니다.',
        '이 계산은 새로운 일을 배울 때의 선택을 생각해 보는 참고이지 실제 능력의 기록이 아닙니다.']}]};
 assert.deepEqual(inspect(deep).blockingErrors,[]);
 assert.equal(inspect(deep).verdict,'not-assessed','a clean heuristic does not approve release');
 console.log('PASS output-aware user lunar batch plan, max 7 calls, controlled token cap, single-call abort; zero real API calls');
})().catch(e=>{console.error(e);process.exitCode=1});
