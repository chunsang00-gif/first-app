'use strict';
// Free-only regression: QA5 consumed original stays identical, QA6's
// source-verified contract cannot accept null or fabricate citations.
const assert=require('node:assert/strict');
const capture=require('./report-core-paid-full-prompt-capture').capture;
const authored=require('./report-core-v2-authored-first-chapter');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const schemaBase=require('./report-schema.json');
const readiness=require('./report-paid-core-v2-billable-readiness');
const preflight=require('./report-provider-preflight');
const projection=require('./report-paid-core-v2-provider-projection');
const links=require('./report-qa3-classical-claim-linked-schema');
const required=require('./report-qa6-required-research-slot');
const flags=['NODE_ENV','RENDER','PAID_CORE_DEPTH_V2',
 'PAID_CORE_V2_CLASSICAL_WRITER','PAID_CORE_V2_CLAIM_LINKS',
 'PAID_CORE_V2_REQUIRED_RESEARCH_SLOT',
 'PAID_CORE_V2_LOCK_REFS','PAID_CORE_V2_CLOSED_CLAIMS'];
async function run(){
 const saved=Object.fromEntries(flags.map(x=>[x,process.env[x]]));
 try{
  process.env.NODE_ENV='test';
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  process.env.PAID_CORE_V2_CLASSICAL_WRITER='offline-preview';
  process.env.PAID_CORE_V2_CLAIM_LINKS='offline-preview';
  for(const x of ['RENDER','PAID_CORE_V2_REQUIRED_RESEARCH_SLOT',
   'PAID_CORE_V2_LOCK_REFS','PAID_CORE_V2_CLOSED_CLAIMS'])
   delete process.env[x];
  const {prompt,providerCalls}=await capture(authored.INPUT);
  assert.equal(providerCalls,0);
  const payload=writer.compile(prompt);
  const originalSource=JSON.stringify(payload.source);
  const baseline=writer.schema(prompt,wire.schemaFor(prompt,schemaBase));
  const normalSlot=baseline.properties.chapters.properties.saju_core
   .properties.paragraphs.properties.temperament;
  assert.equal(normalSlot.anyOf.length,2);
  assert.equal(normalSlot.anyOf[1].type,'null');
  const qa5Hash=(await readiness.prepare()).requestHash;
  assert.equal(qa5Hash,
   '9e5c729912c3ff8de023c170a8513c06485466e6e6ae7bba82aed56920e49808');
  process.env.PAID_CORE_V2_REQUIRED_RESEARCH_SLOT='offline-preview';
  assert.equal(required.enabled(prompt),true);
  const brief=required.requireVerified(prompt,payload);
  assert.equal(brief.permittedClaims.length,5);
  assert.equal(brief.requiredEvidenceRefs.length,9);
  const next=writer.schema(prompt,wire.schemaFor(prompt,schemaBase));
  const slot=next.properties.chapters.properties.saju_core
   .properties.paragraphs.properties.temperament;
  assert.equal(slot.type,'object');
  assert.equal(slot.anyOf,undefined);
  assert.equal(slot.additionalProperties,false);
  assert(slot.required.includes('basis'));
  assert(slot.properties.basis.required.includes('claimLinks'));
  assert.deepEqual(slot.properties.basis.properties.claimLinks.items
   .properties.claimId.enum,brief.permittedClaims.map(x=>x.id));
  assert(slot.properties.text.description.includes(required.INSTRUCTION));
  assert(!slot.properties.text.description.includes('문단 전체를 null로 둔다'));
  assert(!slot.properties.text.description.includes('근거를 설명할 수 없으면 null로 둔다'));
  assert(writer.policyFor(prompt).includes(required.INSTRUCTION));
  assert.deepEqual(preflight.inspect(prompt,payload,next),[]);
  assert.deepEqual(JSON.stringify(payload.source),originalSource);
  const outgoing=projection.project(prompt,payload);
  const topic=outgoing.task.chapters.saju_core.topics.temperament;
  assert(topic.qaClassicalWritingBrief.textInstruction.includes(required.INSTRUCTION));
  assert(!topic.coreV2ConditionalReadingBrief);
  assert(outgoing.task.chapters.saju_core.coreV2ConditionalReadingBrief
   .includes('검증 실패로 중단'));
  const fresh=await readiness.prepare();
  assert.notEqual(fresh.requestHash,qa5Hash,'new contract needs fresh consent');
  const twice=await readiness.prepare();
  assert.equal(fresh.requestHash,twice.requestHash,'QA6 full request must be stable');
  assert.equal(fresh.schemaHash,twice.schemaHash,'QA6 schema must be stable');
  assert(/^[0-9a-f]{64}$/.test(fresh.requestHash));
  assert(/^[0-9a-f]{64}$/.test(fresh.schemaHash));
  assert.equal(fresh.providerCalls,0);
  assert.equal(fresh.approvalToCharge,false);
  assert.equal(fresh.releaseVerdict,'not-approved');
  const fake={chapters:{saju_core:{paragraphs:{
   temperament:null,strength:{text:'검증용 필수 내용'}}}}};
  assert.throws(()=>links.validateAndStrip(prompt,fake),
   /QA3_CLAIM_LINKS_REQUIRED/);
  const broken=structuredClone(payload);
  delete broken.source['natal.hour.stem'];
  assert.throws(()=>required.requireVerified(prompt,broken),
   /QA3_CLASSICAL_PROVIDER_SOURCE_DIVERGENCE|QA6_CLAIMS_NOT_GROUNDED/);
  process.env.NODE_ENV='production';
  assert.equal(required.enabled(prompt),false);
  assert.throws(()=>required.requireVerified(prompt,payload),
   /QA6_REQUIRES_EXACT_OFFLINE_RESEARCH_FLAGS/);
  process.env.NODE_ENV='test';process.env.RENDER='true';
  assert.equal(required.enabled(prompt),false);
  delete process.env.RENDER;
  delete process.env.PAID_CORE_V2_REQUIRED_RESEARCH_SLOT;
  assert.equal(required.enabled(prompt),false);
  assert.deepEqual(writer.schema(prompt,wire.schemaFor(prompt,schemaBase)),baseline);
  assert.equal((await readiness.prepare()).requestHash,qa5Hash,
   'consumed QA5 provider envelope must be bit-for-bit unchanged');
  console.log('QA6_REQUIRED_RESEARCH_SLOT='+JSON.stringify({
   historicalQA5HashUntouched:true,qa6RequestHashDiffers:true,
   qa6ResearchSlotNonnullable:true,allFiveClaimLinksStillRequired:true,
   missingEvidenceFailsBeforeProvider:true,
   productionAndRenderDisabled:true,oldDefaultSchemaUnchanged:true,
   historicalQA5ApprovalReusable:false,
   qa6RequestFingerprint:fresh.requestHash,
   qa6SchemaFingerprint:fresh.schemaHash,
   qa6SystemFingerprint:fresh.systemHash,
   realProviderCalls:0,
   customerRelease:false}));
 }finally{
  for(const [k,v] of Object.entries(saved))
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
}
run().catch(e=>{console.error(e);process.exitCode=1});
