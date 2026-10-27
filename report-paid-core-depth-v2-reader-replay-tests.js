'use strict';
// End-to-end, OFFLINE first paid chapter: real server request + real provider
// writer + source restoration + real reader decoder; simulated model output.
// No model, charge, payment, or production activation.
const assert=require('node:assert/strict');
const {capture}=require('./report-core-paid-full-prompt-capture');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const thesis=require('./report-core-thesis');
const manuscript=require('./report-core-paid-adult-new-role-reader-trial');
const review=require('./report-paid-core-depth-v2-reader-review');
const input={calendar:'solar',birthDate:'1994-07-15',birthTime:'14:20',
 gender:'male',mbti:'ISFP'};
async function run(){
 const prior={flag:process.env.PAID_CORE_DEPTH_V2,
  node:process.env.NODE_ENV,render:process.env.RENDER};
 try{
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  process.env.NODE_ENV='test';delete process.env.RENDER;
  const captured=await capture(input),prompt=captured.prompt;
  assert.equal(captured.providerCalls,0);
  assert.equal(prompt.paidCoreDepthV2,true);
  const source=writer.compile(prompt),task=source.task.chapters.saju_core;
  const appendix=task.topics.temperament.paidCoreDepthV2;
  assert(appendix);
  assert.equal(appendix.allPairingsAreCandidatesOnly,true);
  const pair=appendix.visiblePairCandidates.find(x=>
   x.combination==='丁壬'&&x.adjacent&&x.from==='natal.day.stem'&&
   x.to==='natal.hour.stem');
  assert(pair);
  assert.equal(pair.transformationVerified,false);
  assert.equal(pair.actualCombinationEstablished,false);
  const trial=manuscript.build(prompt.facts);
  assert(trial&&trial.approvedForCustomer===false);
  const fixed=thesis.forPrompt(prompt);
  const hidden='natal.month.hidden.'+
   prompt.facts.facts.structuralEvidence.monthCommand.mainHiddenStem;
  assert.equal(hidden,'natal.month.hidden.己');
  const strength={
   label:'배움과 맡은 역할을 같이 보는 기준',
   text:'태어난 달의 겉글자는 새로운 내용을 익히거나 주변에서 조언을 구할 때를 살피는 분류입니다. 같은 달의 대표적인 안쪽 글자는 정해진 규칙을 따르고 자신에게 맡겨진 역할을 다룰 때를 살피는 분류입니다. 둘의 뜻을 구분할 수는 있지만 실제 경험과 능력까지 확인된 것은 아닙니다.',
   basis:{refs:['natal.month.stem',hidden],
    interpretation:'출생월의 두 독립 전통 분류를 대조합니다.',
    condition:'역할이 정해진 일을 새로 배워야 하는 상황을 가정합니다.',
    limit:'실제 성격이나 경험을 관찰한 자료는 아닙니다.'}
  };
  const temperament={
   label:trial.label,text:trial.text,
   basis:{refs:[
    'facts.seasonalEvidence','facts.qiEvidence','natal.month.stem',
    'natal.year.stem','natal.day.stem','natal.hour.stem',
    'facts.stemConnections'],
    interpretation:'계산상 출생연도·날짜·시간의 독립 분류 및 날과 시간의 짝 관계 후보를 구분하며 실제 결과는 확정하지 않습니다.',
    condition:'여섯 달 동안 재고 관리 업무를 맡는 가상의 상황을 비교합니다.',
    limit:'실제 적성·소비·금전 성과나 짝 관계의 실제 효과는 입증되지 않았습니다.'}
  };
  const mock={chapters:{saju_core:{
   title:fixed.title,keyJudgment:fixed.keyJudgment,
   mood:'reflective',paragraphs:{temperament,strength}
  }},cover:null,finalJudgment:null};
  assert.deepEqual(review.inspect(temperament,strength.text,appendix),[]);
  const restored=writer.restoreEvidence(mock,prompt);
  const decoded=wire.decode(restored,prompt);
  assert.deepEqual(decoded.sections.map(s=>s.id),['saju_core']);
  assert.deepEqual(decoded.sections[0].bodyTopics,['temperament','strength']);
  assert.equal(decoded.sections[0].body[0],trial.text);
  assert.equal(decoded.sections[0].body[1],strength.text);
  assert(decoded.sections[0].evidence.some(x=>
   x.includes('natal.year.stem')&&x.includes('natal.day.stem')&&
   x.includes('natal.hour.stem')));
  assert(temperament.basis,'mock source must not mutate');
  const originalNull=structuredClone(mock);
  originalNull.chapters.saju_core.paragraphs.temperament=null;
  const decodedNull=wire.decode(writer.restoreEvidence(originalNull,prompt),prompt);
  assert.deepEqual(decodedNull.sections[0].bodyTopics,['strength']);
  assert.equal(decodedNull.sections[0].body[0],strength.text);
  const fake=(mutate,reason)=>{
   const altered=structuredClone(mock);
   mutate(altered.chapters.saju_core.paragraphs.temperament);
   assert.throws(()=>writer.restoreEvidence(altered,prompt),reason);
  };
  fake(p=>{p.text=strength.text},/PAID_CORE_V2_READER_REJECTED/);
  fake(p=>{p.text=p.text.replace(/태어난 날과 시간의 겉글자는[^.]+\./,
   '출생 자료에 다른 글자가 나타납니다.')},
   /PAID_CORE_V2_READER_REJECTED/);
  fake(p=>{p.text+=' 반드시 부자가 됩니다.'},
   /PAID_CORE_V2_READER_REJECTED/);
  fake(p=>{p.basis.refs=p.basis.refs.filter(x=>x!=='natal.hour.stem')},
   /MISSING_EXPLICIT_ADDITIONAL_CITATIONS/);
  const otherCapture=await capture({...input,birthTime:'20:20'});
  assert.equal(otherCapture.providerCalls,0);
  const other=writer.compile(otherCapture.prompt);
  const otherPairs=other.task.chapters.saju_core.topics.temperament
   .paidCoreDepthV2.visiblePairCandidates;
  assert(!otherPairs.some(x=>x.combination==='丁壬'&&x.adjacent&&
   x.from==='natal.day.stem'&&x.to==='natal.hour.stem'));
  process.env.NODE_ENV='production';
  const production=await capture(input);
  assert.equal(production.prompt.paidCoreDepthV2,false);
  console.log('PAID_CORE_V2_OFFLINE_READER_REPLAY='+JSON.stringify({
   firstChapterActualWriterAndDecoder:true,
   readerParagraphs:decoded.sections[0].body.length,
   guardedAdditionalTextCharacters:trial.text.length,
   exactHourMismatchNotReused:true,
   invalidResponsesRejected:4,
   nullableFallbackKept:true,
   productionDisabled:true,providerCalls:0,
   fullCustomerProseQualityCertified:false,
   releaseVerdict:'not-approved'
  }));
 }finally{
  for(const [key,value] of [['PAID_CORE_DEPTH_V2',prior.flag],
   ['NODE_ENV',prior.node],['RENDER',prior.render]]){
   if(value===undefined)delete process.env[key];
   else process.env[key]=value;
  }
 }
}
run().catch(e=>{console.error(e);process.exitCode=1;});
