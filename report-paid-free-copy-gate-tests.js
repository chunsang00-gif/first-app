'use strict';
const assert=require('node:assert/strict');
const copy=require('./report-paid-free-copy-gate');
const facts=require('./report-facts-node');
const sample=require('./report-reading-sample');
const cases=[
 {calendar:'lunar',leapMonth:false,birthDate:'1982-11-24',birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'1994-07-15',birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'1994-01-15',birthTime:'14:20',gender:'male',mbti:'ISFP'}
];
for(const input of cases){
 const packet=facts.build(input,2027);
 assert.equal(packet.status,'ready');
 const original=sample.build(packet).cards.find(x=>x.id==='birth-month').text;
 const section=body=>[{id:'saju_core',bodyTopics:['strength'],body:[body]}];
 const code='copied-free-reader-meaning:saju_core:strength:birth-month';
 assert(copy.inspect(section(original),packet).includes(code));
 assert(copy.inspect(section(original+' 별도의 유료 내용입니다.'),packet).includes(code));
 const swapped=original.replace('태어난 달','출생한 달').replace('안쪽','내부').replace('겉에','바깥에');
 assert(copy.inspect(section(swapped),packet).includes(code));
 const unique='이 출생월에 계산된 두 분류를 이어서 한 가지 선택 상황에 적용하는 질문입니다. '+
  '각각의 전통적 뜻이 판단의 어느 부분을 설명하는지 연결하되, 실제 행동을 확인하거나 출생월 관계의 우위를 확정할 수는 없습니다. '+
  '선택 상황과 해석 한계가 구분되지 않는 경우에는 그 의미를 짧게만 남기고, 새로운 직업이나 사건을 만들어내지 않습니다.';
 assert.deepEqual(copy.inspect(section(unique),packet),[]);
 assert.deepEqual(copy.inspect([{id:'decision',bodyTopics:['approach'],body:[original]}],packet),[]);
 assert.equal(copy.similarity('',original),0);
}
assert.throws(()=>copy.inspect([{id:'saju_core',body:['충분히 긴 문장을 작성합니다.']}],{}),
 /PAID_FREE_COPY_VERIFIED_PACKET_REQUIRED/);
console.log('PASS three independent charts reject copied and minimally rewritten free reading, but allow distinct paid meaning; no provider calls');
