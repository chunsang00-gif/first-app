'use strict';
// Work81: two independent REAL charts -> source-owned hour pair -> factual
// post-provider reader text gate. All tests are OFFLINE and non-billable.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const bindings=require('./report-fact-bindings');
const hour=require('./report-paid-core-hour-extension');
const pair=require('./report-paid-core-hour-pair-meaning');
const gate=require('./report-paid-core-hour-pair-reader-gate');
const server=require('./report-server-contract');
const cases=[
 [{calendar:'solar',birthDate:'1982-07-15',birthTime:'02:20',
  gender:'male',mbti:'ISFP',
  readerDecision:'적금을 유지할지 대출을 상환할지 고민입니다.'},
  'resource','output'],
 [{calendar:'solar',birthDate:'1982-10-15',birthTime:'02:20',
  gender:'male',mbti:'ISFP',
  readerDecision:'기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.'},
  'day-controls','control-on-day']
];
let calls=0;const fetchBefore=global.fetch;
global.fetch=()=>{calls++;throw Error('WORK81_PAID_NETWORK_FORBIDDEN');};
try{
 for(const [input,expected,inverse] of cases){
  const packet=facts.build(input,2027);
  assert.equal(packet.status,'ready');
  const source=Object.fromEntries(bindings.build(packet).map(x=>[x.id,x]));
  const proof=hour.build(packet,source);
  assert.equal(proof?.wholeNatalCategoryDistinct,true);
  const meaning=pair.build(packet,source,proof);
  assert.equal(meaning.elementDirection,expected);
  assert.equal(meaning.saleApproved,false);
  const right='출생시간의 두 글자는 '+pair.PHRASES[expected]+'입니다.';
  const wrong='출생시간의 두 글자는 '+pair.PHRASES[inverse]+'입니다.';
  assert.deepEqual(gate.inspectParagraph(right,meaning),[],
   'a literal true chart relation must be allowed');
  for(const [prose,reason] of [
   [wrong,'hour-pair-element-direction-conflicts-with-calculation'],
   [right+' '+wrong,'hour-pair-element-direction-conflicts-with-calculation'],
   ['출생시간의 두 전통적 질문을 비교합니다.','hour-pair-relation-not-explained']
  ]){
   assert(gate.inspectParagraph(prose,meaning).includes(reason));
   const sections=[{id:'saju_core',bodyTopics:['temperament'],body:[prose]}];
   assert(server.earlyPaidCoreHourMeaningProblems(sections,packet)
    .includes('saju_core:'+reason),
    'real early paid batch must reject before a second billable AI call');
  }
  assert(gate.inspectParagraph(right.replace('출생시간','일반적인 관계'),meaning)
   .includes('hour-pair-relation-not-explained'));
  assert.throws(()=>gate.inspectParagraph(right,{...meaning,saleApproved:true}),
   /PAID_HOUR_PAIR_READER_PROOF_DRIFT/);
 }
 const archived=require('./qa-next-first-chapter-offline-preflight').SAMPLE;
 const packet=facts.build(archived,2027);
 const source=Object.fromEntries(bindings.build(packet).map(x=>[x.id,x]));
 const proof=hour.build(packet,source);
 if(proof&&proof.wholeNatalCategoryDistinct===false){
  assert.equal(pair.build(packet,source,proof),null);
  assert.deepEqual(gate.inspectParagraph('아직 판매하지 않는 편집 시안.',null),[]);
 }
 assert.equal(calls,0);
 console.log('PASS work81 factual direction veto for two real natal charts and resumed paid early-batch gate, 0 API/payment');
}finally{global.fetch=fetchBefore;}
