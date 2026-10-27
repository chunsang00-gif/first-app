'use strict';
const assert=require('node:assert/strict');
const {capture}=require('./report-core-paid-full-prompt-capture');
const writer=require('./report-generation-request');
const decoder=require('./report-response-decoder');
const provenance=require('./report-paid-core-v2-source-provenance');
const thesis=require('./report-core-thesis');
const trial=require('./report-core-paid-adult-new-role-reader-trial');
const INPUT={calendar:'solar',birthDate:'1994-07-15',
 birthTime:'14:20',gender:'male',mbti:'ISFP'};
async function run(){
 const initial={n:process.env.NODE_ENV,f:process.env.PAID_CORE_DEPTH_V2,
  r:process.env.RENDER,override:process.env.PAID_CORE_V2_SOURCE_BOUND_READER};
 try{
  process.env.NODE_ENV='test';
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  delete process.env.RENDER;
  delete process.env.PAID_CORE_V2_SOURCE_BOUND_READER;
  const cap=await capture(INPUT),prompt=cap.prompt;
  assert.equal(cap.providerCalls,0);
  const t=trial.build(prompt.facts);
  assert(t&&t.approvedForCustomer===false);
  const basic={label:'태어난 달이 나타내는 두 방향',
   text:'태어난 달의 겉글자는 도움받고 배우는 일, 달의 대표 안쪽 글자는 규칙과 맡은 역할을 다루는 전통 상징입니다. 이 뜻을 실제 개인의 기질과 똑같다고 단정할 수는 없습니다.',
   basis:{refs:['natal.month.stem','natal.month.hidden.己'],
    interpretation:'출생월의 실제 두 위치를 구별합니다.',
    condition:'배우고 맡은 역할을 확인하는 가정입니다.',
    limit:'개인의 행동과 성과는 관찰한 사실이 아닙니다.'}};
  const supported={label:t.label,text:t.text,
   basis:{refs:['natal.month.stem','natal.year.stem',
      'natal.day.stem','natal.hour.stem'],
    interpretation:'출생달과 실제 출생시간의 관계를 비교합니다.',
    condition:'여섯 달 재고 관리 상황을 가정합니다.',
    limit:'실제 성격·직업 적성을 입증하지 않았습니다.'}};
  const heading=thesis.forPrompt(prompt);
  const data={chapters:{saju_core:{title:heading.title,
    keyJudgment:heading.keyJudgment,mood:'reflective',
    paragraphs:{temperament:supported,strength:basic}}},
    cover:null,finalJudgment:null};
  const raw=structuredClone(data);
  assert.throws(()=>writer.restoreEvidence(data,prompt),
   /PAID_CORE_DEPTH_V2_MISSING_EXPLICIT_ADDITIONAL_CITATIONS/);
  const candidate=provenance.bind(data,prompt);
  assert.equal(candidate.changed,true);
  assert.equal(candidate.serverBoundRefCount,3);
  assert.equal(candidate.approvedForSale,false);
  const expected=['natal.month.stem','natal.month.hidden.己',
   'natal.month.hidden.丁','natal.hour.stem','facts.stemConnections'];
  for(const ref of expected)assert(candidate.value.chapters.saju_core
    .paragraphs.temperament.basis.refs.includes(ref));
  assert.deepEqual(data,raw,'never mutate original provider response');
  assert.equal(candidate.value.chapters.saju_core.paragraphs
   .temperament.text,data.chapters.saju_core.paragraphs.temperament.text);
  assert.doesNotThrow(()=>writer.restoreEvidence(candidate.value,prompt));
  const result=decoder.decode(data,prompt);
  assert.deepEqual(result.sections[0].bodyTopics,['temperament','strength']);
  assert.equal(result.sections[0].body[0],t.text);
  assert.deepEqual(data,raw,'decoder must not mutate original response');
  const invalids=[
   ['only generic advice',p=>{p.text=
      '태어난 달과 시간을 함께 고려하는 상황에서는 둘 다 살펴보면 좋습니다. '+
      '이것은 실제 성격이나 돈에 대한 확정이 아닙니다.';}],
   ['false new observable behavior',p=>{p.text+=' 반드시 부자가 됩니다.';}],
   ['no exact exposure',p=>{p.text=p.text.replaceAll('정확히 같고','비슷해 보이고');}],
   ['outside basis id',p=>{p.basis.refs.push('natal.unknown.ref');}]
  ];
  for(const [reason,mutate] of invalids){
   const bad=structuredClone(data);
   mutate(bad.chapters.saju_core.paragraphs.temperament);
   const res=provenance.bind(bad,prompt);
   assert.equal(res.changed,false,reason+' must never receive provenance');
   assert.throws(()=>decoder.decode(bad,prompt),undefined,reason);
  }
  // Changing birth hour invalidates this very exact exposure and cannot
  // be "repaired" by attaching sources from the unrelated earlier chart.
  const changed=(await capture({...INPUT,birthTime:'20:20'})).prompt;
  assert.equal(provenance.bind(data,changed).changed,false);
  assert.throws(()=>decoder.decode(data,changed));
  // Same model output in a genuine customer setting is not rewritten.
  process.env.NODE_ENV='production';
  const live=provenance.bind(data,prompt);
  assert.equal(live.changed,false);
  assert.equal(live.value,data);
  console.log('PASS scoped server-provenance binding: only source-verified exact claim, unchanged prose/raw archive, wrong hour/unsupported advice rejected, no provider calls');
 }finally{
  for(const [k,v] of [['NODE_ENV',initial.n],['PAID_CORE_DEPTH_V2',initial.f],
   ['RENDER',initial.r],['PAID_CORE_V2_SOURCE_BOUND_READER',initial.override]])
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
}
run().catch(err=>{console.error(err);process.exitCode=1});
