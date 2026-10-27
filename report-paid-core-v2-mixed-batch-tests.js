'use strict';
// OFFLINE: real server first-body mixed bundle -> provider writer/strict schema
// -> optional first-chapter reader result, preserving original MBTI JSON.
const assert=require('node:assert/strict');
const {capture}=require('./report-core-paid-full-prompt-capture');
const facts=require('./report-facts-node');
const source=require('./report-paid-core-depth-v2');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const outline=require('./report-schema.json');
const audit=require('./report-instruction-audit');
const preflight=require('./report-provider-preflight');
const decoder=require('./report-response-decoder');
const planner=require('./report-core-v2-source-bound-manuscript');
const {enabled}=require('./report-paid-core-v2-scope');
const fixture=Object.freeze({calendar:'solar',birthDate:'1994-07-15',
 birthTime:'14:20',gender:'male',mbti:'ISFP'});
async function findMixed(){
 for(const year of [1982,1994,2006,2018])
  for(let month=1;month<=12;month++)
   for(const hour of ['14:20','20:20']){
    const input={...fixture,birthDate:year+'-'+String(month).padStart(2,'0')+'-15',
     birthTime:hour};
    if(!source.build(facts.build(input,2027)).readerContrast)continue;
    const result=await capture(input);
    if(JSON.stringify(result.requestedSections)==='["saju_core","mbti_contradiction"]')
     return result;
   }
 throw Error('MIXED_V2_NO_VERIFIED_SOURCE_CANDIDATE');
}
function mock(prompt){
 const payload=writer.compile(prompt);
 const schema=writer.schema(prompt,wire.schemaFor(prompt,outline));
 const chapters={};
 for(const [id,chapter] of Object.entries(payload.task.chapters)){
  const spec=schema.properties.chapters.properties[id].properties;
  const paragraphs={};
  for(const [topic,slot] of Object.entries(spec.paragraphs.properties)){
   if(topic!==chapter.anchor){paragraphs[topic]=null;continue}
   const model=slot.anyOf?.find(v=>v.type==='object')||slot;
   let refs=model.properties.basis.properties.refs.items.enum;
   if(id==='saju_core'){
    const main=payload.source['facts.structuralEvidence.monthCommand'].mainHiddenStem;
    refs=['natal.month.stem','natal.month.hidden.'+main];
   }else{
    refs=['person.mbti',refs.find(k=>k.startsWith('natal.'))];
   }
   if(refs.some(k=>!k))throw Error('MIXED_V2_NO_REQUIRED_BASIS');
   paragraphs[topic]={label:'계산된 자료를 비교하는 항목',
    text:'이 설명은 한 가지 가상 상황을 통해 실제로 계산된 차이를 살펴봅니다. 아직 특정한 성격이나 행동을 확인한 것은 아닙니다.',
    basis:{refs,interpretation:'각 출처의 계산 위치와 의미를 구별합니다.',
     condition:'새로운 선택을 검토하는 가정 상황입니다.',
     limit:'실제 관찰이나 사건을 입증하지 않습니다.'}};
  }
  chapters[id]={title:spec.title.enum?.[0]||id+' 구분',
   keyJudgment:spec.keyJudgment.enum?.[0]||'입력된 자료를 구분하여 해석합니다.',
   mood:'reflective',paragraphs};
 }
 return {chapters,cover:null,finalJudgment:null};
}
(async()=>{
 const vars=['NODE_ENV','RENDER','PAID_CORE_DEPTH_V2',
  'PAID_CORE_V2_SOURCE_BOUND_READER'];
 const old=Object.fromEntries(vars.map(v=>[v,process.env[v]]));
 try{
  process.env.NODE_ENV='test';delete process.env.RENDER;
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  delete process.env.PAID_CORE_V2_SOURCE_BOUND_READER;
  const captureResult=await findMixed(),prompt=captureResult.prompt;
  assert.equal(captureResult.providerCalls,0);
  assert.equal(prompt.paidCoreDepthV2,true);
  assert.deepEqual(prompt.requestedSections,['saju_core','mbti_contradiction']);
  assert(enabled(prompt.requestedSections,prompt.stage,prompt.facts));
  const payload=writer.compile(prompt);
  assert.deepEqual(Object.keys(payload.task.chapters),prompt.requestedSections);
  assert(payload.task.chapters.saju_core.coreV2ConditionalReadingBrief.includes('readerContrast'));
  assert(!Object.hasOwn(payload.task.chapters.mbti_contradiction,'coreV2ConditionalReadingBrief'));
  assert(payload.task.chapters.saju_core.topics.temperament.paidCoreDepthV2.readerContrast);
  const c=payload.task.chapters.saju_core.topics.temperament.paidCoreDepthV2.readerContrast;
  assert(c.sourceRefs.every(id=>payload.task.chapters.saju_core.topics.temperament
   .citableFacts.some(x=>x.id===id)));
  assert.equal(payload.task.chapters.mbti_contradiction.topics.agreement?.paidCoreDepthV2,undefined);
  const schema=writer.schema(prompt,wire.schemaFor(prompt,outline));
  assert.deepEqual(audit.inspectTransport(prompt,payload),[]);
  assert.deepEqual(preflight.inspect(prompt,payload,schema),[]);
  const guide=c.readerWritingPlan;
  assert(guide&&guide.relation===c.monthMainToExposedElementDirection);
  const option=schema.properties.chapters.properties.saju_core.properties
   .paragraphs.properties.temperament;
  const leaf=option.anyOf?.find(x=>x.type==='object')||option;
  const instructions=leaf.properties.text.description;
  for(const phrase of [guide.decisionQuestion,guide.onlyOriginalCondition,
    guide.onlyAdditionalCondition,guide.situationSequence,
    guide.distinctInterpretationRule])
   assert(instructions.includes(phrase),
    'the ACTUAL outgoing model schema must guide the one chart question');
  const strippedSchema=structuredClone(schema);
  const stripped=strippedSchema.properties.chapters.properties.saju_core
   .properties.paragraphs.properties.temperament;
  const only=stripped.anyOf?.find(x=>x.type==='object')||stripped;
  only.properties.text.description='generic, both sources are important';
  assert(preflight.inspect(prompt,payload,strippedSchema)
   .includes('core-v2-directional-writing-plan-not-on-provider-wire'));
  const corruptedPlan=structuredClone(payload);
  corruptedPlan.task.chapters.saju_core.topics.temperament
   .paidCoreDepthV2.readerContrast.readerWritingPlan.decisionQuestion=
    'generic, both conditions matter';
  assert(preflight.inspect(prompt,corruptedPlan,schema)
   .includes('core-v2-directional-writing-plan-not-on-provider-wire'));
  const chapters=schema.properties.chapters.properties;
  assert.deepEqual(Object.keys(chapters),prompt.requestedSections);
  assert(!Object.hasOwn(chapters.mbti_contradiction.properties.paragraphs.properties,'temperament'));
  const fake=mock(prompt),immutable=JSON.stringify(fake);
  const originalMbti=JSON.stringify(fake.chapters.mbti_contradiction);
  assert.equal(planner.build(prompt,fake)?.approvedForSale,false);
  const bare=decoder.decode(fake,prompt);
  assert.deepEqual(bare.sections.map(x=>x.id),prompt.requestedSections);
  assert.deepEqual(bare.sections[0].bodyTopics,['strength']);
  process.env.PAID_CORE_V2_SOURCE_BOUND_READER='offline-preview';
  const withNew=decoder.decode(fake,prompt);
  assert.deepEqual(withNew.sections.map(x=>x.id),prompt.requestedSections);
  assert.deepEqual(withNew.sections[0].bodyTopics,['temperament','strength']);
  assert.deepEqual(withNew.sections[1],bare.sections[1]);
  assert.equal(withNew.sections[0].body[1],bare.sections[0].body[0]);
  assert.equal(JSON.stringify(fake),immutable);
  assert.equal(JSON.stringify(fake.chapters.mbti_contradiction),originalMbti);
  const tampered=structuredClone(payload);
  tampered.task.chapters.mbti_contradiction.coreV2ConditionalReadingBrief='untrusted';
  assert(audit.inspectTransport(prompt,tampered)
   .includes('paid-core-v2-brief-leaked-to-unrelated-chapter:mbti_contradiction'));
  process.env.NODE_ENV='production';
  const prod=await capture({...fixture,birthDate:captureResult.prompt.facts.calculationInput.birthDate,
   birthTime:captureResult.prompt.facts.calculationInput.birthTime});
  assert.equal(prod.prompt.paidCoreDepthV2,false);
  assert(!enabled(prompt.requestedSections,'body',prompt.facts,process.env));
  process.env.NODE_ENV='test';
  process.env.RENDER='true';
  assert(!enabled(prompt.requestedSections,'body',prompt.facts,process.env));
  console.log('V2_REAL_MIXED_FIRST_BATCH='+JSON.stringify({
   fromActualServerRequest:true,bundle:['saju_core','mbti_contradiction'],
   mixedTransportSourcesVerified:true,strictSchemaValid:true,
   groundedDirectionalWritingPlanOnProviderSchema:true,
   missingDirectionalBriefRejectedBeforeNetwork:true,
   firstChapterDepthAddedInOfflineReader:true,unchangedMbtiReaderSection:true,
   originalModelResponseUnchanged:true,productionDisabled:true,
   noAddedModelCalls:true,apiCalls:0,humanQualityApproved:false,
   releaseVerdict:'not-approved'
  }));
 }finally{
  for(const [k,v] of Object.entries(old))
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
