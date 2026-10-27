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
    'natal.month.hidden.己','natal.month.hidden.丁',
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
  fake(p=>{p.text+=' 반드시 부자가 됩니다.'},
   /PAID_CORE_V2_READER_REJECTED/);
  fake(p=>{p.basis.refs=p.basis.refs.filter(x=>x!=='natal.hour.stem')},
   /MISSING_EXPLICIT_ADDITIONAL_CITATIONS/);
  const otherCapture=await capture({...input,birthTime:'20:20'});
  assert.equal(otherCapture.providerCalls,0);
  const other=writer.compile(otherCapture.prompt);
  // The 14:20 text cannot be reused verbatim for 20:20, even though
  // its mandatory source IDs and the month-only evidence are still present.
  assert.throws(()=>writer.restoreEvidence(mock,otherCapture.prompt),
   /AI report service missing verified paragraph basis/,
   'exact old-hour hidden sources must not be cited for a different hour');
  const otherAllowed=new Set(other.task.chapters.saju_core.topics
   .temperament.citableFacts.map(x=>x.id));
  const alteredForOther=structuredClone(mock);
  alteredForOther.chapters.saju_core.paragraphs.temperament.basis.refs=
   alteredForOther.chapters.saju_core.paragraphs.temperament.basis.refs
    .filter(ref=>otherAllowed.has(ref));
  const otherExtra=other.task.chapters.saju_core.topics.temperament.paidCoreDepthV2;
  const noIndependentSource=!otherExtra.readerContrast&&!otherExtra.readerAlternative;
  // With no second verified source, reject the entire optional paragraph
  // before reaching the narrower false-pair check.
  assert.throws(()=>writer.restoreEvidence(alteredForOther,otherCapture.prompt),
   noIndependentSource
    ?/PAID_CORE_V2_READER_REJECTED:.*HAS_NO_INDEPENDENT_SOURCE/
    :/PAID_CORE_V2_READER_REJECTED:.*FALSE_DAY_HOUR_PAIR/,
   'a changed hour cannot reuse a sourced paragraph, even after citation filtering');
  // Keep explicit coverage of the pair-claim guard when a separate
  // independent source remains valid but the claimed pair is not.
  const withoutPair=structuredClone(appendix);
  withoutPair.visiblePairCandidates=withoutPair.visiblePairCandidates.filter(x=>
   !(x.adjacent&&(x.from==='natal.day.stem'&&x.to==='natal.hour.stem')));
  const falsePairClaim=structuredClone(temperament);
  falsePairClaim.text+=' 태어난 날과 시간의 겉글자는 한 쌍으로 함께 묶입니다.';
  assert(review.inspect(falsePairClaim,strength.text,withoutPair)
   .includes('PAID_CORE_V2_READER_FALSE_DAY_HOUR_PAIR'),
   'a fabricated adjacent day-hour pair must fail with valid independent source');
  const noForcedPair=structuredClone(mock);
  noForcedPair.chapters.saju_core.paragraphs.temperament.text=
   noForcedPair.chapters.saju_core.paragraphs.temperament.text.replace(
    /태어난 날과 시간의 겉글자는[^.]+\./,
    '태어난 날은 계산의 기준이며 이 사실만으로 성격을 확정할 수 없습니다.');
  assert(!noForcedPair.chapters.saju_core.paragraphs.temperament.text
   .includes('짝을 이루는 전통 규칙'));
  assert.doesNotThrow(()=>writer.restoreEvidence(noForcedPair,prompt),
   'optional chart relationship should not be forced into customer prose');
  const otherPairs=other.task.chapters.saju_core.topics.temperament
   .paidCoreDepthV2.visiblePairCandidates;
  assert(!otherPairs.some(x=>x.combination==='丁壬'&&x.adjacent&&
   x.from==='natal.day.stem'&&x.to==='natal.hour.stem'));
  // Same-chart 1982: use the REAL intercepted paid first batch, not a
  // disconnected text preview. The deployed path keeps this feature OFF.
  const winterInput={calendar:'lunar',birthDate:'1982-11-24',
   leapMonth:false,birthTime:'14:20',gender:'male',mbti:'ISFP'};
  const winterCapture=await capture(winterInput);
  assert.equal(winterCapture.providerCalls,0);
  assert.equal(winterCapture.prompt.paidCoreDepthV2,true);
  const winterPayload=writer.compile(winterCapture.prompt);
  const coreWinter=winterPayload.task.chapters.saju_core;
  const scoped=coreWinter.topics.temperament.paidCoreDepthV2;
  const classical=scoped.readerClassicalScope;
  assert(classical);
  assert.equal(classical.approvedForSale,false);
  assert.equal(classical.methodPriority,'not-selected');
  assert(classical.sourceRefs.includes('natal.hour.hidden.丁'));
  assert(coreWinter.topics.temperament.citableFacts.some(
   x=>x.id==='natal.hour.hidden.丁'));
  assert(!coreWinter.topics.strength.citableFacts.some(
   x=>x.id==='natal.hour.hidden.丁'));
  const normalWinter=writer.compile({...winterCapture.prompt,paidCoreDepthV2:false});
  assert(!Object.hasOwn(normalWinter.source,'natal.hour.hidden.丁'));
  assert.equal(normalWinter.task.chapters.saju_core.topics.temperament
   .paidCoreDepthV2,undefined);
  const oldSource=coreWinter.topics.strength.citableFacts;
  assert.deepEqual(normalWinter.task.chapters.saju_core.topics.strength.citableFacts,
   oldSource);
  const historical=require('./report-core-paid-yi-guiwei-output-reading')
   .build(winterCapture.prompt.facts);
  assert(historical&&historical.approvedForCustomer===false);
  const winterStrength={
   label:'정보를 이해하는 방식과 필요한 자원',
   text:'태어난 달의 겉글자는 낯선 자료를 자기 방식으로 이해한다는 전통적 뜻을 담고 있습니다. 달의 중심 숨은 글자는 필요한 자원을 여러 경로에서 찾아 다루는 뜻입니다. 새로운 일을 준비하는 가상 상황이라면 이해해야 할 내용과 실제로 마련할 자원을 따로 점검하는 관점으로 풀이할 수 있습니다. 그러나 실제 능력이나 경험을 확인한 결과는 아닙니다.',
   basis:{refs:['natal.month.stem','natal.month.hidden.己'],
    interpretation:'월의 두 전통 분류를 서로 다른 위치에서 확인합니다.',
    condition:'새로운 일을 준비하는 가상 상황입니다.',
    limit:'관찰된 행동이 아니며 사주 전체의 우선순위가 아닙니다.'}
  };
  const winterTemperature={label:historical.label,
   text:historical.text+' 다만 고전의 이러한 분류는 가상의 설명이며 실제 삶에서 나타난 특징이라는 뜻은 아닙니다.',
   basis:{refs:['facts.qiEvidence','natal.month.stem',...classical.sourceRefs],
    interpretation:'시간의 겉글자와 숨은 글자의 전통 분류를 별도로 대비합니다.',
    condition:'배운 내용을 설명서로 만드는 가상 상황입니다.',
    limit:'실제 표현력과 업무 성취를 관찰하거나 예측하지 않았습니다.'}};
  const winterMock={chapters:{saju_core:{
   title:thesis.forPrompt(winterCapture.prompt).title,
   keyJudgment:thesis.forPrompt(winterCapture.prompt).keyJudgment,
   mood:'reflective',paragraphs:{temperament:winterTemperature,strength:winterStrength}
  }},cover:null,finalJudgment:null};
  assert.deepEqual(review.inspect(winterTemperature,winterStrength.text,scoped),[]);
  const winterRestored=writer.restoreEvidence(winterMock,winterCapture.prompt);
  const winterDecoded=wire.decode(winterRestored,winterCapture.prompt);
  assert.equal(winterDecoded.sections[0].body[0],winterTemperature.text);
  assert.deepEqual(winterDecoded.sections[0].bodyTopics,['temperament','strength']);
  const badHour=structuredClone(winterMock);
  const late=await capture({...winterInput,birthTime:'20:20'});
  assert.equal(late.providerCalls,0);
  assert.equal(writer.compile(late.prompt).task.chapters.saju_core.topics
   .temperament.paidCoreDepthV2.readerClassicalScope,null);
  assert.throws(()=>writer.restoreEvidence(badHour,late.prompt),
   /AI report service missing verified paragraph basis/,
   'other birth hour cannot reuse the exact 1982 classical verse');
  assert.throws(()=>writer.restoreEvidence(winterMock,
   {...winterCapture.prompt,paidCoreDepthV2:false}),
   /AI report service missing verified paragraph basis/,
   'ordinary paid output must never accept dev-only citations');
  const falsified=structuredClone(winterMock);
  falsified.chapters.saju_core.paragraphs.temperament.basis.refs=
   falsified.chapters.saju_core.paragraphs.temperament.basis.refs
    .filter(x=>x!=='natal.hour.hidden.丁');
  assert.throws(()=>writer.restoreEvidence(falsified,winterCapture.prompt),
   /MISSING_EXPLICIT_ADDITIONAL_CITATIONS/);
  process.env.NODE_ENV='production';
  const production=await capture(input);
  assert.equal(production.prompt.paidCoreDepthV2,false);
  console.log('PAID_CORE_V2_OFFLINE_READER_REPLAY='+JSON.stringify({
   firstChapterActualWriterAndDecoder:true,
   readerParagraphs:decoded.sections[0].body.length,
   guardedAdditionalTextCharacters:trial.text.length,
   exactHourMismatchNotReused:true,
   invalidResponsesRejected:5,
   crossHourFullManuscriptReuseRejected:true,
   verifiedPairMentionOptional:true,
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
