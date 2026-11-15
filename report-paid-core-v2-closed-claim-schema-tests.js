'use strict';
const assert=require('node:assert/strict');
const {capture}=require('./report-core-paid-full-prompt-capture');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const sourceSchema=require('./report-schema.json');
const decoder=require('./report-response-decoder');
const thesis=require('./report-core-thesis');
const specimen=require('./report-qa3-multichart-source-owned-editorial');
const closed=require('./report-paid-core-v2-closed-claim-schema');
const cases=[
 ['1982-08-15','14:20'],['1994-01-15','14:20'],
 ['1994-04-15','14:20'],['1994-05-15','20:20'],
 ['1994-07-15','14:20'],['1994-06-15','14:20'],
 ['2006-08-15','14:20'],['2018-07-15','14:20']
];
function props(schema){
 return schema.properties.chapters.properties.saju_core.properties
  .paragraphs.properties.temperament.anyOf.find(x=>x.type==='object').properties;
}
(async()=>{
 const keys=['NODE_ENV','RENDER','PAID_CORE_DEPTH_V2',
  'PAID_CORE_V2_LOCK_REFS','PAID_CORE_V2_CLOSED_CLAIMS'];
 const previous=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 try{
  process.env.NODE_ENV='test';
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  process.env.PAID_CORE_V2_LOCK_REFS='offline-preview';
  delete process.env.RENDER;
  delete process.env.PAID_CORE_V2_CLOSED_CLAIMS;
  let accepted=0,excluded=0;
  const fingerprints=new Set();
  for(const [birthDate,birthTime] of cases){
   delete process.env.PAID_CORE_V2_CLOSED_CLAIMS;
   const captured=await capture({calendar:'solar',birthDate,birthTime,
    gender:'male',mbti:'ISFP'});
   assert.equal(captured.providerCalls,0);
   const prompt={...captured.prompt,paidCoreDepthV2:true,
    requestedSections:['saju_core']};
   const payload=writer.compile(prompt),task=payload.task.chapters.saju_core;
   const contract=task.topics.temperament.serverOwnedWritingContract;
   assert(contract&&contract.releaseVerdict==='not-approved');
   const baseline=writer.schema(prompt,wire.schemaFor(prompt,sourceSchema));
   assert.equal(props(baseline).text.enum,undefined);
   process.env.PAID_CORE_V2_CLOSED_CLAIMS='offline-preview';
   assert(closed.enabled(prompt));
   const strict=writer.schema(prompt,wire.schemaFor(prompt,sourceSchema));
   const leaf=props(strict);
   const proposal=specimen.build(prompt).candidate;
   for(const name of ['label','text'])
    assert.deepEqual(leaf[name].enum,[proposal[name]]);
   for(const name of ['interpretation','condition','limit'])
    assert.deepEqual(leaf.basis.properties[name].enum,[proposal.basis[name]]);
   assert.deepEqual(leaf.basis.properties.refs.enum,[proposal.basis.refs]);
   assert.strictEqual(leaf.text.type,'string');
   assert(proposal.text.length>350);
   assert(!proposal.text.includes('가정을 가정해'),
    'reader prose must not repeat the same hypothetical noun');
   assert(!fingerprints.has(proposal.text),
    'another chart must not inherit entire manuscript');
   fingerprints.add(proposal.text);
   const mock=structuredClone(proposal);
   assert.equal(closed.assertClosed(prompt,task.topics.temperament,mock),true);
   const tampered=structuredClone(mock);
   tampered.text+=' 이 사례의 적용 방법을 다시 한번 설명합니다.';
   assert.throws(()=>closed.assertClosed(prompt,task.topics.temperament,tampered),
    /QA3_CLOSED_CLAIMS_TEXT_DRIFT/);
   const label=structuredClone(mock);label.label='누구나 같은 길';
   assert.throws(()=>closed.assertClosed(prompt,task.topics.temperament,label),
    /QA3_CLOSED_CLAIMS_TEXT_DRIFT/);
   const basis=structuredClone(mock);
   basis.basis.interpretation='실제 성격이 반드시 이렇습니다.';
   assert.throws(()=>closed.assertClosed(prompt,task.topics.temperament,basis),
    /QA3_CLOSED_CLAIMS_BASIS_DRIFT/);
   const refs=structuredClone(mock);refs.basis.refs=refs.basis.refs.slice(1);
   assert.throws(()=>closed.assertClosed(prompt,task.topics.temperament,refs),
    /QA3_CLOSED_CLAIMS_BASIS_DRIFT/);
   const monthStem=prompt.facts.facts.structuralEvidence.monthCommand.mainHiddenStem;
   const allowed=writer.allowedRefs(payload,task.topics.strength,
    'saju_core','strength');
   const monthRefs=['natal.month.stem','natal.month.hidden.'+monthStem,
    'facts.seasonalEvidence','facts.qiEvidence'].filter(x=>allowed.has(x));
   const t=thesis.forPrompt(prompt);
   const raw={chapters:{saju_core:{title:t.title,keyJudgment:t.keyJudgment,
    mood:'reflective',paragraphs:{
     temperament:structuredClone(proposal),
     strength:{
      label:'태어난 달의 전통 분류',
      text:'태어난 달의 겉글자와 대표 속글자에는 다른 전통적 의미가 있습니다. 실제 삶의 결과를 검증한 것은 아닙니다.',
      basis:{refs:monthRefs,interpretation:'달의 두 위치를 구별합니다.',
       condition:'달의 기본 분류에 한정합니다.',
       limit:'개인의 경험을 측정하지 않았습니다.'}
     }
    }}},cover:null,finalJudgment:null};
   const snap=JSON.stringify(raw);
   const result=decoder.decode(raw,prompt);
   assert(result.sections?.[0]?.bodyTopics.includes('temperament'));
   assert.equal(JSON.stringify(raw),snap);
   const bad=structuredClone(raw);
   bad.chapters.saju_core.paragraphs.temperament=structuredClone(tampered);
   assert.throws(()=>decoder.decode(bad,prompt),
    /QA3_CLOSED_CLAIMS_TEXT_DRIFT/);
   const certainty=structuredClone(raw);
   certainty.chapters.saju_core.paragraphs.temperament.text+=
    ' 이 사람은 반드시 성공합니다.';
   assert.throws(()=>decoder.decode(certainty,prompt),
    /PAID_CORE_V2_READER_PERSONAL_CERTAINTY/);
   delete process.env.PAID_CORE_V2_CLOSED_CLAIMS;
   assert.equal(closed.enabled(prompt),false);
   assert.equal(writer.schema(prompt,wire.schemaFor(prompt,sourceSchema))
    .properties.chapters.properties.saju_core.properties.paragraphs.properties
    .temperament.anyOf.find(x=>x.type==='object').properties.text.enum,undefined);
   accepted++;
  }
  process.env.NODE_ENV='production';
  const x=await capture({calendar:'solar',birthDate:'1994-07-15',
   birthTime:'14:20',gender:'male',mbti:'ISFP'});
  const isolated={...x.prompt,paidCoreDepthV2:true,
   requestedSections:['saju_core']};
  assert.equal(closed.enabled(isolated),false);
  process.env.PAID_CORE_V2_CLOSED_CLAIMS='offline-preview';
  assert.throws(()=>closed.apply(isolated,{serverOwnedWritingContract:{}},{},{}),
   /QA3_CLOSED_CLAIMS_DISABLED_CONTEXT/);
  excluded++;
  process.env.NODE_ENV='test';process.env.RENDER='true';
  assert.equal(closed.enabled(isolated),false);excluded++;
  delete process.env.RENDER;delete process.env.PAID_CORE_V2_LOCK_REFS;
  assert.equal(closed.enabled(isolated),false);excluded++;
  assert.equal(accepted,8);
  assert.equal(fingerprints.size,8);
  console.log('QA3_CLOSED_CLAIM_FIRST_CHAPTER='+JSON.stringify({
   charts:accepted,distinctSourceBoundTexts:fingerprints.size,
   fullParagraphSchemaFixed:true,basisAndLabelFixed:true,
   actualDecoderAccepted:8,tamperedTextsRejected:8,
   normalGenerationUnchanged:true,disabledContexts:excluded,
   extraProviderCalls:0,remoteSchemaAccepted:'not-tested',
   modelWrittenPremiumProse:false,humanEditorialApproved:false,
   releaseVerdict:'not-approved'
  }));
 }finally{
  for(const [key,value] of Object.entries(previous))
   if(value===undefined)delete process.env[key];else process.env[key]=value;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
