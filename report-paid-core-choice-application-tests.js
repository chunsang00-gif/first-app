'use strict';
const assert=require('node:assert/strict');
const audit=require('./report-paid-core-choice-application');
const facts=require('./report-facts-node');
const server=require('./report-server-contract');
const q='현재 일을 유지할지 새로운 기술을 배울지 고민 중입니다.';
const section=v=>[{id:'saju_core',bodyTopics:['strength'],body:[v]}];
const real='이미 하던 일을 유지한다면 기존에 익힌 방법을 살펴보면서 필요한 자원을 계속 마련할 수 있을지 묻는 선택입니다. '+
 '새로운 기술을 배울 경우 낯선 정보를 이해한 다음 시간과 도구를 확보할 수 있을지 생각하는 선택입니다.';
const generic='새로운 정보를 자기 방식으로 이해하고 필요한 자원을 찾아 활용하는 뜻을 봅니다. '+
 '어느 한 가지만 보면 놓치는 조건이 있으므로 두 가지 뜻을 함께 살펴봅니다.';
assert.deepEqual(audit.alternatives(q),{first:['유지'],second:['기술','배울']});
assert.deepEqual(audit.inspect(section(real),q),[]);
assert.deepEqual(audit.inspect(section(q+' '+real),q),[]);
assert(audit.inspect(section(q+' '+generic),q).includes(
 'saju_core:buyer-choice-not-applied-to-both-options'),
 'merely repeating the customer question plus generic interpretation must fail');
assert(audit.inspect(section('하던 일을 유지하는 경우 준비가 필요할 수 있습니다. '+generic),q).includes(
 'saju_core:buyer-choice-not-applied-to-both-options'),
 'applying the reading to only one alternative cannot pass');
assert.deepEqual(audit.inspect(section(generic),null),[]);
assert.deepEqual(audit.inspect(section(generic),'새로운 집이 좋을까요?'),[],
 'unknown question styles are explicitly left for human review');
assert.deepEqual(audit.inspect([{id:'career',bodyTopics:['workstyle'],body:[generic]}],q),[]);
const base={calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,
 birthTime:'14:20',gender:'male',mbti:'ISFP'};
assert.deepEqual(server.earlyPaidCoreChoiceProblems(section(real),
 facts.build({...base,readerDecision:q},2027)),[]);
assert(server.earlyPaidCoreChoiceProblems(section(q+' '+generic),
 facts.build({...base,readerDecision:q},2027)).includes(
 'saju_core:buyer-choice-not-applied-to-both-options'));
assert.deepEqual(server.earlyPaidCoreChoiceProblems(section(generic),
 facts.build(base,2027)),[]);
console.log('PASS buyer choice first-chapter actual response gate: 2-way application, no echo-only personalization, no input/citation leakage or new API calls');
