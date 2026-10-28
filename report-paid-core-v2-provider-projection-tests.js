'use strict';
// One-way transport-only projection. Verify all source owners and normal
// operations are unchanged; no network/keys and no billable opt-in.
const assert=require('node:assert/strict');
const {capture}=require('./report-core-paid-full-prompt-capture');
const writer=require('./report-generation-request');
const {project}=require('./report-paid-core-v2-provider-projection');
const sample={calendar:'solar',birthDate:'1994-07-15',
 birthTime:'14:20',gender:'male',mbti:'ISFP'};
async function run(){
 const old={n:process.env.NODE_ENV,v:process.env.PAID_CORE_DEPTH_V2,
  r:process.env.RENDER};
 try{
  process.env.NODE_ENV='test';
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  delete process.env.RENDER;
  const full=await capture(sample);
  assert.equal(full.providerCalls,0);
  const source=writer.compile(full.prompt);
  const snapshot=structuredClone(source);
  const lean=project(full.prompt,source);
  assert.notEqual(lean,source);
  assert.deepEqual(source,snapshot);
  assert.deepEqual(lean.source,source.source);
  assert.deepEqual(lean.task.chapters.saju_core.topics.strength,
   source.task.chapters.saju_core.topics.strength);
  assert.deepEqual(lean.task.chapters.saju_core.topics.temperament
   .serverOwnedWritingContract,
   source.task.chapters.saju_core.topics.temperament.serverOwnedWritingContract);
  assert.deepEqual(lean.task.chapters.saju_core.topics.temperament.citableFacts,
   source.task.chapters.saju_core.topics.temperament.citableFacts);
  assert(!lean.task.chapters.saju_core.topics.temperament
   .paidCoreDepthV2.visiblePairCandidates);
  assert(lean.task.chapters.saju_core.topics.temperament
   .serverOwnedWritingContract.releaseVerdict==='not-approved');
  assert(Buffer.byteLength(JSON.stringify(source))-
   Buffer.byteLength(JSON.stringify(lean))>=6000);
  // A frozen or altered server contract is NEVER regarded as trusted merely
  // because it contains familiar category names or a real source ID.
  const forgedContract=structuredClone(source);
  forgedContract.task.chapters.saju_core.topics.temperament
   .serverOwnedWritingContract.outline.originalOnly='일단 모두 좋다고 하자';
  assert.throws(()=>project(full.prompt,forgedContract),
   /CORE_V2_PROVIDER_PROJECTION_UNVERIFIED_FACTS/);
  const forgery=structuredClone(source);
  forgery.task.chapters.saju_core.topics.temperament
   .sourceQualifiedWritingDecision.requiredCitationIds=['natal.fake.id'];
  assert.throws(()=>project(full.prompt,forgery),
   /CORE_V2_PROVIDER_PROJECTION_UNVERIFIED_FACTS/);
  const badSource=structuredClone(source);
  delete badSource.source['natal.hour.stem'];
  assert.throws(()=>project(full.prompt,badSource));
  // Disabling V2 and keeping all real user production flows intact is an
  // identity operation, not a reinterpretation or a new writing assignment.
  const ordinary=await capture(sample);
  const original=writer.compile({...ordinary.prompt,paidCoreDepthV2:false});
  assert.equal(project({...ordinary.prompt,paidCoreDepthV2:false},original),original);
  process.env.NODE_ENV='production';
  assert.throws(()=>project(full.prompt,source),
   /CORE_V2_PROVIDER_PROJECTION_PRODUCTION_DISABLED/);
  process.env.NODE_ENV='test';process.env.RENDER='true';
  assert.throws(()=>project(full.prompt,source),
   /CORE_V2_PROVIDER_PROJECTION_PRODUCTION_DISABLED/);
  process.env.RENDER='true';
  const live=await capture(sample);
  assert.equal(live.prompt.paidCoreDepthV2,false);
  const livePayload=writer.compile(live.prompt);
  assert.equal(project(live.prompt,livePayload),livePayload);
  console.log('CORE_V2_PROVIDER_PROJECTION_ISOLATION='+JSON.stringify({
   sourceUnchanged:true,editorialContractUnchanged:true,
   originalRendererFullyUnchanged:true,
   invalidFactOrContractBlocked:true,legacyIdentity:true,
   productionIdentity:true,devPreviewCannotRunOnRender:true,
   savedFromOneExactSourceOwnerBytes:Buffer.byteLength(JSON.stringify(source))-
    Buffer.byteLength(JSON.stringify(lean)),
   paidProviderCalls:0,approvedForSale:false
  }));
 }finally{
  for(const [k,v] of [['NODE_ENV',old.n],['PAID_CORE_DEPTH_V2',old.v],
   ['RENDER',old.r]])
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
}
run().catch(e=>{console.error(e);process.exitCode=1});
