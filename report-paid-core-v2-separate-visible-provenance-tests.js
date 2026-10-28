'use strict';
// Offline through the genuine first-chapter composer, source matcher,
// decoder and canonical evidence restoration. No OpenAI call/production.
const assert=require('node:assert/strict');
const {capture}=require('./report-core-paid-full-prompt-capture');
const writer=require('./report-generation-request');
const decoder=require('./report-response-decoder');
const binder=require('./report-paid-core-v2-separate-visible-provenance');
const thesis=require('./report-core-thesis');
const INPUT={calendar:'solar',birthDate:'1994-06-15',
 birthTime:'14:20',gender:'male',mbti:'ISFP'};
async function run(){
 const env={node:process.env.NODE_ENV,v2:process.env.PAID_CORE_DEPTH_V2,
  render:process.env.RENDER,override:process.env.PAID_CORE_V2_SOURCE_BOUND_READER};
 try{
  process.env.NODE_ENV='test';process.env.PAID_CORE_DEPTH_V2='offline-preview';
  delete process.env.RENDER;delete process.env.PAID_CORE_V2_SOURCE_BOUND_READER;
  const cap=await capture(INPUT),prompt=cap.prompt;
  assert.equal(cap.providerCalls,0);
  assert.deepEqual(prompt.requestedSections,['saju_core']);
  const payload=writer.compile(prompt);
  const topic=payload.task.chapters.saju_core.topics.temperament;
  const con=topic.serverOwnedWritingContract;
  assert.equal(con?.kind,'server-owned-first-chapter-separate-visible-contract-v1');
  assert.equal(con?.sceneId,'fixed-supply-vs-output-year');
  const month=payload.source['facts.structuralEvidence.monthCommand'].mainHiddenStem;
  const text='태어난 달의 대표 속글자와 태어난 해의 겉글자는 서로 다른 분류입니다. '+
   '달의 다른 숨은 글자가 밖으로 드러난 것은 아닙니다. '+
   '예를 들어 동네 행사에서 재활용 봉투 50장을 포장하는 상황을 가정해 봅니다. '+
   '매달 봉투 확보 예산이 있어도 포장 인력과 검수 시간이 없으면 정해진 배부 일정에 맞추기 어렵습니다. '+
   '반대로 포장 순서와 검수 시간을 마련했어도 봉투를 확보할 예산과 납품 일정이 없다면 일을 시작하기 어렵습니다. '+
   '이는 실제로 이 일을 했거나 사업을 한다는 관찰이 아니라 출생월과 출생연도에 계산된 전통적인 구분을 설명하는 가정입니다.';
  assert(text.length>=220);
  const v=binder.verify(text,con);
  assert.equal(v.pass,true,JSON.stringify(v.flags));
  const t=thesis.forPrompt(prompt);
  const response={chapters:{saju_core:{title:t.title,
   keyJudgment:t.keyJudgment,mood:'reflective',paragraphs:{
    strength:{label:'달의 대표 기준',text:'태어난 달의 겉글자와 속글자에 서로 다른 전통 분류가 있습니다. 이 계산만으로 실제 생활이나 사람의 성향을 결정하지 않습니다.',
      basis:{refs:['natal.month.stem','natal.month.hidden.'+month],
       interpretation:'달의 두 글자를 계산합니다.',
       condition:'가상 상황에서 차이를 읽습니다.',
       limit:'실제 생활은 확인하지 않았습니다.'}},
    temperament:{label:'달과 출생 해의 독립된 분류',text,
      basis:{refs:[],interpretation:'태어난 해와 달의 서로 다른 분류를 대조합니다.',
       condition:'봉투 포장에 필요한 두 조건을 가정합니다.',
       limit:'실제 개인의 일과 능력은 확인할 수 없습니다.'}}
   }}},cover:null,finalJudgment:null};
  const raw=structuredClone(response);
  assert.throws(()=>writer.restoreEvidence(response,prompt),
   /missing verified paragraph basis/);
  const bound=binder.bind(response,prompt);
  assert.equal(bound.changed,true,bound.reason+':'+JSON.stringify(bound.flagCodes));
  assert.deepEqual(bound.value.chapters.saju_core.paragraphs.temperament.basis.refs,
   con.evidenceRefs);
  assert.equal(bound.value.chapters.saju_core.paragraphs.temperament.text,text);
  assert.deepEqual(response,raw,'raw provider response must remain unchanged');
  assert.doesNotThrow(()=>writer.restoreEvidence(bound.value,prompt));
  const visible=decoder.decode(response,prompt);
  assert.equal(visible.sections[0].bodyTopics[0],'temperament');
  assert.equal(visible.sections[0].body[0],text);
  assert.deepEqual(response,raw);

  for(const [reason,modify] of [
   ['generic',p=>{p.text='태어난 달과 해는 서로 다른 분류입니다. 둘 다 중요합니다. 무난하게 생활을 정리하는 것이 좋겠습니다.';}],
   ['false exposure',p=>{p.text+=' 태어난 해의 겉글자는 태어난 달의 다른 숨은 글자와 정확히 일치합니다.';}],
   ['no reverse case',p=>{p.text=p.text.replace(/반대로 포장 순서.{0,110}?어렵습니다\./,'');}],
   ['bad id',p=>{p.basis.refs.push('natal.fake.stem');}],
   ['wrong location',p=>{p.text=p.text.replaceAll('태어난 해의 겉글자','태어난 시간의 겉글자').replaceAll('출생연도','출생시간');}]
  ]){
   const bad=structuredClone(response);modify(bad.chapters.saju_core.paragraphs.temperament);
   assert.equal(binder.bind(bad,prompt).changed,false,reason);
   assert.throws(()=>decoder.decode(bad,prompt),undefined,reason);
  }
  // The same prose and source choices cannot be assigned to another chart.
  const different=(await capture({...INPUT,birthDate:'2006-08-15'})).prompt;
  assert.equal(binder.bind(response,different).changed,false);
  assert.throws(()=>decoder.decode(response,different));
  process.env.NODE_ENV='production';
  assert.equal(binder.bind(response,prompt).changed,false);
  console.log('PASS QA-only alternative source ownership: 3-way distinction protected, real decoder accepts well-grounded missing refs, generic/forged/borrowed text rejected, API calls 0, customer release false');
 }finally{
  for(const [k,v] of [['NODE_ENV',env.node],['PAID_CORE_DEPTH_V2',env.v2],
   ['RENDER',env.render],['PAID_CORE_V2_SOURCE_BOUND_READER',env.override]])
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
}
run().catch(e=>{console.error(e);process.exitCode=1});
