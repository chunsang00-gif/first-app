'use strict';
const assert=require('node:assert/strict');
const {capture}=require('./report-core-paid-full-prompt-capture');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const sourceSchema=require('./report-schema.json');
const lock=require('./report-paid-core-v2-locked-reference-schema');
const triage=require('./report-paid-core-v2-editorial-triage');
const specimen=require('./report-qa3-multichart-source-owned-editorial');
const cases=[
 ['1982-08-15','14:20'],['1994-01-15','14:20'],
 ['1994-04-15','14:20'],['1994-05-15','20:20'],
 ['1994-07-15','14:20'],['1994-06-15','14:20'],
 ['2006-08-15','14:20'],['2018-07-15','14:20']
];
const outputRefs=s=>s.properties.chapters.properties.saju_core.properties
 .paragraphs.properties.temperament.anyOf.find(x=>x.type==='object')
 .properties.basis.properties.refs;
(async()=>{
 const keys=['NODE_ENV','RENDER','PAID_CORE_DEPTH_V2',
  'PAID_CORE_V2_LOCK_REFS'];
 const prior=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 try{
  process.env.NODE_ENV='test';
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  delete process.env.RENDER;
  delete process.env.PAID_CORE_V2_LOCK_REFS;
  let locked=0,exact=0,alternative=0;
  const saved=[];
  for(const [birthDate,birthTime] of cases){
   const x=await capture({calendar:'solar',birthDate,birthTime,
    gender:'male',mbti:'ISFP'});
   assert.equal(x.providerCalls,0);
   // An actual first batch may contain MBTI; isolate only first chapter for
   // this frozen, opt-in offline schema research. No live request here.
   const p={...x.prompt,paidCoreDepthV2:true,requestedSections:['saju_core']};
   const plan=writer.compile(p);
   const owned=plan.task.chapters.saju_core.topics.temperament
    .serverOwnedWritingContract;
   assert(owned);
   if(owned.kind==='server-owned-first-chapter-evidence-and-claim-contract-v1')
    exact++;
   else alternative++;
   const baseline=writer.schema(p,wire.schemaFor(p,sourceSchema));
   assert.equal(outputRefs(baseline).enum,undefined);
   assert.equal(outputRefs(baseline).minItems,undefined);
   process.env.PAID_CORE_V2_LOCK_REFS='offline-preview';
   assert.equal(lock.enabled(p),true);
   const strict=writer.schema(p,wire.schemaFor(p,sourceSchema));
   const refs=outputRefs(strict);
   assert.deepEqual(refs.enum,[owned.evidenceRefs]);
   assert.deepEqual(refs.items.enum,outputRefs(baseline).items.enum);
   assert.equal(refs.minItems,owned.evidenceRefs.length);
   assert.equal(refs.maxItems,owned.evidenceRefs.length);
   assert.deepEqual(outputRefs(baseline).items.enum,refs.items.enum);
   assert.equal(owned.releaseVerdict,'not-approved');
   assert(owned.evidenceRefs.every(id=>refs.items.enum.includes(id)));
   // Any subset, superfluous value or permuted source array violates the
   // exact array enum before decoding (local JSON-Schema semantics).
   const matches=ids=>JSON.stringify(refs.enum).includes('__NEVER__')||
    refs.enum.some(expected=>JSON.stringify(expected)===JSON.stringify(ids));
   assert.equal(matches(owned.evidenceRefs),true);
   assert.equal(matches(owned.evidenceRefs.slice(0,-1)),false);
   assert.equal(matches([...owned.evidenceRefs,'natal.fake']),false);
   assert.equal(matches(owned.evidenceRefs.slice().reverse()),false);
   const candidate=specimen.build(p);
   assert(candidate);
   assert.deepEqual(candidate.candidate.basis.refs,owned.evidenceRefs);
   assert.deepEqual(lock.rejectEmptyClaims(p,candidate.candidate,'',
    plan.task.chapters.saju_core.topics.temperament.paidCoreDepthV2),[]);
   const hollow=structuredClone(candidate.candidate);
   hollow.text='달과 시간은 여러 기준을 함께 살펴볼 수 있습니다. '+
    '예를 들어 새로운 상황에서 여유롭게 계획하고 판단해야 합니다. '+
    '반대로 조심해서 선택하는 것이 중요하며 미래는 알 수 없습니다.';
   assert.throws(()=>lock.rejectEmptyClaims(p,hollow,'',
     plan.task.chapters.saju_core.topics.temperament.paidCoreDepthV2),
    /QA3_LOCKED_REF_PROSE_REJECTED/);
   const alternate=writer.schema(p,wire.schemaFor(p,sourceSchema));
   assert.deepEqual(outputRefs(alternate),refs,'schema must be deterministic');
   process.env.NODE_ENV='production';
   assert.equal(lock.enabled(p),false);
   assert.equal(outputRefs(writer.schema(p,wire.schemaFor(p,sourceSchema))).enum,
    undefined);
   process.env.NODE_ENV='test';process.env.RENDER='true';
   assert.equal(lock.enabled(p),false);
   assert.equal(outputRefs(writer.schema(p,wire.schemaFor(p,sourceSchema))).enum,
    undefined);
   delete process.env.RENDER;
   delete process.env.PAID_CORE_V2_LOCK_REFS;
   assert.equal(lock.enabled(p),false);
   assert.deepEqual(writer.schema(p,wire.schemaFor(p,sourceSchema)),baseline,
    'old frozen QA3 schema must remain identical unless explicitly enabled');
   saved.push({birthDate,birthTime,refs:refs.enum[0].length});
   locked++;
  }
  assert.equal(locked,8);
  assert.equal(exact,5);assert.equal(alternative,3);
  // Strict schema compatibility with the remote provider is NOT claimed
  // without a separately approved billable verification.
  console.log('QA3_LOCKED_CITATION_GENERATION_SCHEMA='+JSON.stringify({
   charts:locked,exact,alternative,allRefArraysServerFixed:true,
   weakProseStillRejected:true,oldQa3UnchangedWithoutFlag:true,
   actualRemoteSchemaAcceptance:'not-verified',
   customerApproved:false,providerCalls:0,productionDisabled:true,
   samples:saved
  }));
 }finally{
  for(const [key,value] of Object.entries(prior))
   if(value===undefined)delete process.env[key];else process.env[key]=value;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
