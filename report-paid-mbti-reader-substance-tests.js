'use strict';
const assert=require('node:assert/strict');
const {inspect,similarity}=require('./report-paid-mbti-reader-substance');
const topics=['energy','information','judgment','planning'];
const genuine=[
 'I 선호는 혼자 생각을 정리하는 시간이 필요한지 묻는 입력입니다. 다른 사람의 도움을 거부한다는 뜻은 아니며, 실제 얼마나 말하고 활동했는지는 이 정보로 확인되지 않습니다.',
 'S 선호는 구체적인 자료와 확인된 사실을 먼저 살피는 입력입니다. 사실을 찾는 선택과 의미를 연결하는 선택은 다른 질문이며, 이 선호만으로 능력을 판단하지 않습니다.',
 'F 선호는 결정을 내릴 때 사람에게 미치는 영향과 중요한 가치를 살펴보는 입력입니다. 논리적 판단을 못 한다거나 항상 타인에게 양보한다는 실제 행동의 증거는 아닙니다.',
 'P 선호는 일정의 수정 여지를 열어 두고 상황에 맞게 조정하려는 입력입니다. 계획을 세울 수 없거나 마감에 늦는다는 단정과 구별하며 실제 수행 결과는 확인되지 않았습니다.'
];
const sec={id:'mbti_contradiction',bodyTopics:topics,body:genuine};
assert.deepEqual(inspect(sec,'ISFP'),[]);
const batchGuard=require('./report-server-contract').earlyMbtiReaderProblems;
assert.deepEqual(batchGuard([sec],'ISFP'),[],
 'a valid reader paragraph must not add a model retry');
assert.deepEqual(batchGuard([sec],'모름'),[],
 'unknown MBTI must not create a fabricated preferred dimension');
const tiny=structuredClone(sec);tiny.body[0]='혼자 생각합니다.';
assert(inspect(tiny,'ISFP').some(e=>e.includes('energy standalone explanation too thin')));
const switched=structuredClone(sec);switched.body[0]=
 'E 선호는 사람들과 대화를 주고받으며 생각을 정리하는 편이 더 편하다고 느끼는 입력을 말합니다. 혼자 생각하지 않는다는 뜻이 아니고 실제 사교성이나 활동 횟수는 알 수 없습니다.';
assert(!inspect(switched,'ESFP').some(x=>x.includes('energy selected preference meaning missing')));
const wrong=structuredClone(sec);wrong.body[0]=genuine[1];
assert(inspect(wrong,'ISFP').some(e=>e.includes('energy selected preference meaning missing')));
assert(batchGuard([wrong],'ISFP').some(e=>
 e.includes('energy selected preference meaning missing')),
 'the first paid batch must reject a wrong preference before more calls');
const cloned=structuredClone(sec);
cloned.body[3]=genuine[0]+' 일정의 조정 여지는 별도로 살펴봅니다.';
assert(similarity(cloned.body[0],cloned.body[3])>=0.82);
assert(inspect(cloned,'ISFP').some(e=>e.includes('repeated independent preference content')));
assert(batchGuard([cloned],'ISFP').some(e=>
 e.includes('repeated independent preference content')),
 'copied source-owned MBTI paragraphs must fail at batch time');
assert.deepEqual(inspect(sec,'모름'),[]);
const nullable={id:'mbti_contradiction',bodyTopics:['energy','planning'],body:[]};
assert.deepEqual(inspect(nullable,'ISFP'),[]);
// New 35-topic report contract must activate source and transport order checks.
const fs=require('node:fs');
const server=fs.readFileSync(require.resolve('./report-quality-node'),'utf8');
const client=fs.readFileSync(require.resolve('./report-validator'),'utf8');
assert(server.includes("'concise-v7','concise-v8'"));
assert(client.includes("'concise-v7','concise-v8'"));
// Probe the REAL customer-report validator, not just the isolated helper.
const quality=require('./report-quality-node');
const full={
 meta:{mbti:'ISFP',versions:{schema:'concise-v8'}},
 sections:[
  {id:'saju_core',title:'출생 자료',keyJudgment:'출생 자료의 뜻을 구별합니다.',
   bodyTopics:['temperament'],bodyLabels:['태어난 달'],body:['태어난 달의 글자는 전통 풀이에서 서로 다른 내용을 설명합니다.'],
   evidence:['월지와 원국의 출생 위치를 확인했습니다.']},
  {id:'mbti_contradiction',title:'입력한 선호 차원',keyJudgment:'입력한 네 가지 선호는 서로 다른 질문입니다.',
   bodyTopics:['information','judgment','energy','planning'],
   bodyLabels:['정보를 읽는 방법','선택의 판단','생각을 정리하는 대화','일정의 조정'],
   body:[genuine[1],genuine[2],genuine[0],genuine[3]],
   evidence:['사용자가 직접 입력한 성격 선호입니다.']}
 ],
 finalJudgment:{body:['각 선호의 해석 경계를 나눠 살핍니다.'],
  closingQuestion:'입력한 선호와 실제 생활 행동은 서로 구별해야 합니다.'}
};
assert(!quality.validate(full).errors.some(x=>/mbti_contradiction: (?:topics unknown|.*preference|.*explanation|repeated independent)/.test(x)));
const badOrder=structuredClone(full);
badOrder.sections[1].bodyTopics[0]='planning';
assert(quality.validate(badOrder).errors.includes('mbti_contradiction: topics unknown or reordered'),
 'concise-v8 must enforce canonical topic keys and order');
const noContent=structuredClone(full);
noContent.sections[1].body.pop();
assert(quality.validate(noContent).errors.includes('mbti_contradiction: topic explanations incomplete'),
 'concise-v8 must reject omitted filled paragraph');
const detached=structuredClone(full);
detached.sections[1].body[2]=genuine[1];
assert(quality.validate(detached).errors.some(x=>x.includes('mbti_contradiction: energy selected preference meaning missing')),
 'the actual release validator must reject a swapped or generic I-E explanation');
console.log('PASS 4 MBTI source-specific reader checks, near-duplicate blocking, and concise-v8 server/client parity; no paid calls');
