'use strict';
const assert=require('node:assert/strict');
const qa=require('./report-core-paid-full-qa-compose');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const thesis=require('./report-core-thesis');
const input=time=>({calendar:'lunar',birthDate:'1982-11-24',
 birthTime:time,leapMonth:false,gender:'male',mbti:'ISFP'});
(async()=>{
 const originalFetch=global.fetch;let calls=0;
 global.fetch=()=>{calls++;throw Error('NO_NETWORK_ALLOWED');};
 try{
  for(const time of ['14:20','20:20']){
   const previous=await qa.assemble(input(time));
   const previousDigest=JSON.stringify({
    prompt:previous.prompt,payload:previous.payload,schema:previous.schema});
   const sample=await qa.assembleAdditiveTransportPreview(input(time));
   const next=await qa.assemble(input(time));
   assert.equal(JSON.stringify({
    prompt:next.prompt,payload:next.payload,schema:next.schema}),previousDigest);
   assert.equal(sample.kind,'offline-actual-provider-additive-three-slots-v1');
   const slots=sample.schema.properties.chapters.properties.saju_core.properties
    .paragraphs.properties;
   assert.deepEqual(Object.keys(slots),['temperament','strength','natal_depth']);
   assert.deepEqual(slots.temperament.anyOf.map(s=>s.type),['object','null']);
   assert.deepEqual(slots.natal_depth.anyOf.map(s=>s.type),['object','null']);
   assert.equal(slots.strength.type,'object');
   const p=sample.prompt,source=sample.payload.source;
   const monthMain=source['facts.structuralEvidence.monthCommand'].mainHiddenStem;
   const fixed=thesis.forPrompt(p);
   const paragraph=(label,text,refs)=>({
    label,text,basis:{refs,interpretation:'계산 근거의 전통 분류를 설명합니다.',
     condition:'일상에서 선택하는 가상 상황입니다.',
     limit:'실제 성격과 미래는 이 근거로 확인하지 않았습니다.'}
   });
   const response={chapters:{saju_core:{title:fixed.title,
    keyJudgment:fixed.keyJudgment,mood:'reflective',paragraphs:{
     temperament:paragraph('태어난 시기',
      '태어난 시기에 계산된 조건을 참고한다는 가상의 설명입니다.',
      ['facts.seasonalEvidence','facts.qiEvidence','natal.month.stem']),
     strength:paragraph('태어난 달의 두 위치',
      '달의 겉과 안쪽의 전통적인 계산 분류가 다르다는 가상의 설명입니다.',
      ['natal.month.stem','natal.month.hidden.'+monthMain]),
     natal_depth:null
    }}},finalJudgment:null,cover:null};
   const hydrated=writer.restoreEvidence(response,p);
   const result=wire.decode(hydrated,p);
   assert.deepEqual(result.sections[0].bodyTopics,['temperament','strength']);
   assert.equal(result.sections[0].body.length,2);
   assert.equal(result.sections[0].evidence.length,2);
   // A NON-NULL third paragraph travels through the real schema/decoder.
   // This is a manually written transport fixture, not a generated or
   // approved paid reading. Both original paragraphs must stay identical.
   if(time==='14:20'){
    const lock=require('./report-core-paid-natal-depth-fact-lock')
     .fromPayload(sample.payload);
    const sources=sample.payload.task.chapters.saju_core.topics.natal_depth
     .citableFacts.map(x=>x.id);
    const refs=[...lock.sourceRefs,'facts.stemConnections'];
    assert(refs.every(x=>sources.includes(x)));
    const rich=structuredClone(response);
    rich.chapters.saju_core.paragraphs.natal_depth={
     label:'태어난 날과 시간의 추가 근거',
     text:'태어난 날과 시간의 글자가 서로 다르게 계산되는 점은 검증됐습니다. 이 구분은 계산 자료를 설명하는 데에만 사용하며 실제 성격이나 미래 결과를 확인하는 근거는 아닙니다. 기존 두 문단에 없는 출생 위치를 추가로 살펴보는 연구용 예시입니다.',
     basis:{refs,interpretation:lock.literal,
      condition:'출생 네 자리를 별도로 살피는 가상 설명',
      limit:'독립적인 개인별 판단과 유료 독자 효용은 검증되지 않음'}
    };
    const parsed=wire.decode(writer.restoreEvidence(rich,p),p);
    assert.deepEqual(parsed.sections[0].bodyTopics,
     ['temperament','strength','natal_depth']);
    assert.deepEqual(parsed.sections[0].body.slice(0,2),
     result.sections[0].body);
    assert.deepEqual(parsed.sections[0].evidence.slice(0,2),
     result.sections[0].evidence);
    assert.equal(parsed.sections[0].body.length,3);
    assert.equal(sample.readerValueApproved,false);
   }
   assert.equal(sample.modelResponse,null);
   assert.equal(sample.readerValueApproved,false);
   assert.equal(sample.providerCalls,0);
   assert.throws(()=>writer.compile({...p,qaNatalDepthPreview:false}),
    /QA_ADDITIVE_PROVIDER_SCOPE_REQUIRED/);
   assert.throws(()=>writer.compile({...p,qaOfflineEditorialResearchPreview:true}),
    /QA_ADDITIVE_PROVIDER_SCOPE_REQUIRED/);
  }
 }finally{global.fetch=originalFetch;}
 assert.equal(calls,0);
 console.log('QA_ACTUAL_ADDITIVE_TRANSPORT='+JSON.stringify({
  samples:2,normalTwoParagraphsPreserved:true,
  optionalThirdNullSurvivesProviderSchemaAndReaderDecoder:true,
  frozenApprovedOneShotUnchanged:true,providerCalls:0,
  productionBranchChanged:false,readerValueApproved:false
 }));
})().catch(e=>{console.error(e);process.exitCode=1;});
