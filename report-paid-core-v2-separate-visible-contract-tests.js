'use strict';
// No model/provider requests. Real 96 first-chapter packet -> writer ->
// strict provider schema and preflight; alternate MUST NOT be described
// as the distinct month-hidden stem exposed outside its hidden position.
const assert=require('node:assert/strict');
const {capture}=require('./report-core-paid-full-prompt-capture');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const blueprint=require('./report-schema.json');
const preflight=require('./report-provider-preflight');
const audit=require('./report-instruction-audit');
const separate=require('./report-paid-core-v2-separate-visible-contract');
const matches=new Set(Object.keys(
 require('./report-paid-core-v2-visible-alternative-scene').CASES).filter(()=>false));
async function run(){
 const prev={n:process.env.NODE_ENV,f:process.env.PAID_CORE_DEPTH_V2,r:process.env.RENDER};
 let tested=0,eligible=0,exact=0,alternative=0,unqualified=0;
 const scenes=new Set(),positions=new Set(),samples=[];
 try{
  process.env.NODE_ENV='test';process.env.PAID_CORE_DEPTH_V2='offline-preview';delete process.env.RENDER;
  for(const year of [1982,1994,2006,2018])for(let month=1;month<=12;month++)
   for(const time of ['14:20','20:20']){
    const input={calendar:'solar',birthDate:year+'-'+String(month).padStart(2,'0')+'-15',
      birthTime:time,gender:'male',mbti:'ISFP'};
    const x=await capture(input);assert.equal(x.providerCalls,0);tested++;
    const payload=writer.compile(x.prompt);
    const t=payload.task.chapters.saju_core.topics.temperament;
    const c=t.paidCoreDepthV2;
    if(c.readerContrast){exact++;assert.equal(separate.build(payload.source,t),null);continue}
    if(!c.readerAlternative){unqualified++;assert.equal(separate.build(payload.source,t),null);continue}
    alternative++;
    const owned=separate.build(payload.source,t);
    if(!owned){assert(!t.serverOwnedWritingContract);continue}
    eligible++;
    assert.equal(t.serverOwnedWritingContract?.kind,
     'server-owned-first-chapter-separate-visible-contract-v1');
    assert.deepEqual(t.serverOwnedWritingContract,owned);
    assert.equal(owned.releaseVerdict,'not-approved');
    assert.equal(owned.humanEditorialApproval,false);
    assert.equal(owned.evidenceRefs.includes('facts.stemConnections'),true);
    assert.equal(owned.verifiedSourceIds.length,4);
    assert(owned.outline.proof.includes('드러났다는 뜻은 아니다'));
    assert(!owned.outline.proof.includes('정확히 일치'));
    scenes.add(owned.sceneId);positions.add(owned.sourcePosition);
    const strict=writer.schema(x.prompt,wire.schemaFor(x.prompt,blueprint));
    assert.deepEqual(preflight.inspect(x.prompt,payload,strict),[]);
    assert.deepEqual(audit.inspectTransport(x.prompt,payload),[]);
    const leaf=strict.properties.chapters.properties.saju_core.properties.paragraphs
     .properties.temperament.anyOf.find(x=>x.type==='object');
    const text=leaf.properties.text.description;
    assert(text.includes(owned.outline.proof));
    assert(text.includes(owned.outline.originalOnly));
    assert(text.includes(owned.outline.additionalOnly));
    assert(!text.includes('readerContrast.sourceRefs'));
    const bad=structuredClone(t);
    bad.paidCoreDepthV2.readerAlternative.otherRole='가짜십성';
    assert.equal(separate.build(payload.source,bad),null);
    const noVerified=structuredClone(t);
    noVerified.paidCoreDepthV2.readerAlternative.sourceRefs.push('natal.fake');
    assert.throws(()=>separate.build(payload.source,noVerified),
     /CORE_V2_SEPARATE_VISIBLE_UNVERIFIED_SOURCE/);
    const substituted=structuredClone(strict);
    const target=substituted.properties.chapters.properties.saju_core
     .properties.paragraphs.properties.temperament.anyOf.find(x=>x.type==='object');
    target.properties.text.description=
     '이 사주의 달 숨은 속글자가 출생 해에 정확히 드러난 사실을 쓴다';
    assert(preflight.inspect(x.prompt,payload,substituted)
     .includes('core-v2-server-contract-not-on-provider-wire'));
    if(samples.length<6)samples.push({date:input.birthDate,time,scene:owned.sceneId,
      position:owned.sourcePosition});
   }
  assert.equal(tested,96);
  assert.equal(exact,20);
  assert.equal(alternative,29);
  assert.equal(unqualified,47);
  assert(eligible>=3,'all three source-qualified alternate scenes must occur');
  assert.equal(scenes.size,3,'all independent alternate scenario types must be checked');
  assert.deepEqual([...positions].sort(),['natal.hour.stem','natal.year.stem']);
  console.log('PASS_SEPARATE_VISIBLE_SERVER_96='+JSON.stringify({tested,exact,alternative,
   unqualified,serverOwnedAdditional:eligible,distinctScenes:[...scenes].sort(),
   positions:[...positions].sort(),samples,providerCalls:0,
   falseMonthHiddenExposureRejected:true,humanApproved:false,productionChanged:false}));
 }finally{
  for(const [k,v] of [['NODE_ENV',prev.n],['PAID_CORE_DEPTH_V2',prev.f],['RENDER',prev.r]])
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
}
run().catch(e=>{console.error(e);process.exitCode=1});
