'use strict';
// REAL HTTP POST /api/calculate is always free. Proves that a receipt bound
// to one buyer work/skill story cannot be reused for another, and that the
// same birth chart's FREE preview is invariant to that customer self-report.
// No model call, merchant call, real payment or production deployment.
const assert=require('node:assert/strict');
const http=require('node:http');
const state=require('./free-calculation-state');
const {handler}=require('./server');
const input={
 calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,
 birthTime:'14:20',unknownBirthTime:false,gender:'male',mbti:'ISFP',
 birthplace:'서울',name:'테스트',
 readerDecision:'기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.'
};
const one={currentWork:'출하 전 품질 검수',targetSkill:'지게차 조종 실습'};
const two={currentWork:'창고 재고 조사',targetSkill:'엑셀 자동화 학습'};
const server=http.createServer(handler);
const nativeFetch=global.fetch;
(async()=>{
 try{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  async function calculate(data){
   const r=await nativeFetch(base+'/api/calculate',{method:'POST',
    headers:{'content-type':'application/json'},body:JSON.stringify(data)});
   return {code:r.status,data:await r.json()};
  }
  const initial=await calculate(input);
  const a=await calculate({...input,decisionContext:one});
  const b=await calculate({...input,decisionContext:two});
  for(const reply of [initial,a,b])assert.equal(reply.code,200);
  assert.equal(initial.data.status,'ready');
  assert.equal(a.data.status,'ready');
  assert.equal(b.data.status,'ready');
  assert.equal(state.matchesReady(initial.data,input),true);
  assert.equal(state.matchesReady(a.data,{...input,decisionContext:one}),true);
  assert.equal(state.matchesReady(b.data,{...input,decisionContext:two}),true);
  assert.equal(state.matchesReady(initial.data,{...input,decisionContext:one}),false);
  assert.equal(state.matchesReady(a.data,input),false);
  assert.equal(state.matchesReady(a.data,{...input,decisionContext:two}),false);
  assert.equal(state.matchesReady(b.data,{...input,decisionContext:one}),false);
  assert.deepEqual(a.data.person.decisionContext,one);
  assert.deepEqual(b.data.person.decisionContext,two);
  assert.deepEqual(a.data.facts,initial.data.facts,
   'actual self-report must never change calculated Saju facts');
  assert.deepEqual(a.data.chart,initial.data.chart);
  assert.deepEqual(b.data.chart,initial.data.chart);
  assert.deepEqual(require('./report-reading-sample').build(a.data).cards,
   require('./report-reading-sample').build(b.data).cards,
   'buyer text may affect premium context only, not the free natal calculation');

  // The wizard must reject incomplete context before even posting, while
  // the server also fails closed on an unauthorized partial input.
  const partial=await calculate({...input,decisionContext:{
   currentWork:one.currentWork,targetSkill:''}});
  assert.equal(partial.code,422);
  const noQuestion=await calculate({...input,readerDecision:undefined,
   decisionContext:one});
  assert.equal(noQuestion.code,422);
  // The optional two-choice text remains contextual data and does not grant
  // a purchase: sales are still source-controlled closed.
  const cfg=await nativeFetch(base+'/api/checkout/config').then(r=>r.json());
  assert.equal(cfg.enabled,false);
  console.log('PASS REAL free /api/calculate rebinds buyer work+skill receipt, rejects stale input and preserves identical natal FREE reading; checkout disabled, 0 provider/payment');
 }finally{await new Promise(resolve=>server.close(resolve))}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
