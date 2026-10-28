'use strict';
const assert=require('node:assert/strict');
const {capture}=require('./report-core-paid-full-prompt-capture');
const {prepare}=require('./report-paid-core-v2-billable-readiness');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const originalSchema=require('./report-schema.json');
const projection=require('./report-paid-core-v2-provider-projection');
const bridge=require('./report-paid-core-v2-classical-provider-bridge');
const scope=require('./report-paid-core-v2-scope');
const keys=['NODE_ENV','RENDER','PAID_CORE_DEPTH_V2',
 'PAID_CORE_V2_CLASSICAL_WRITER','PAID_CORE_V2_LOCK_REFS',
 'PAID_CORE_V2_CLOSED_CLAIMS'];
(async()=>{
 const prev=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 try{
  process.env.NODE_ENV='test';
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  delete process.env.RENDER;
  delete process.env.PAID_CORE_V2_CLASSICAL_WRITER;
  delete process.env.PAID_CORE_V2_LOCK_REFS;
  delete process.env.PAID_CORE_V2_CLOSED_CLAIMS;
  const input={calendar:'solar',birthDate:'1994-07-15',
   birthTime:'14:20',gender:'male',mbti:'ISFP'};
  const c=await capture(input);
  assert.equal(c.providerCalls,0);
  assert.equal(c.prompt.paidCoreDepthV2,true);
  assert(scope.valid(c.prompt));
  assert.deepEqual(c.prompt.requestedSections,['saju_core']);
  const payload=writer.compile(c.prompt);
  const freeze=JSON.stringify(payload);
  const standard=projection.project(c.prompt,payload);
  assert.equal(standard.task.chapters.saju_core.topics.temperament
   .qaClassicalWritingBrief,undefined);
  const standardWire=writer.schema(c.prompt,
   wire.schemaFor(c.prompt,originalSchema));
  const standardPolicy=writer.policyFor(c.prompt);
  const standardHttp=await prepare();
  assert.equal(standardHttp.providerCalls,0);
  assert.equal(bridge.enabled(c.prompt),false);
  process.env.PAID_CORE_V2_CLASSICAL_WRITER='offline-preview';
  assert.equal(bridge.enabled(c.prompt),true);
  const plan=bridge.inspect(c.prompt,payload);
  assert(plan);
  assert.equal(plan.permittedClaims.length,5);
  assert.equal(plan.requiredEvidenceRefs.length,9);
  assert.equal(plan.modelCallsAllowed,0);
  assert.equal(plan.customerAuthorized,false);
  assert.equal(plan.releaseVerdict,'not-approved');
  assert(plan.reviewedClassicalSources.some(r=>r.title==='三命通會'));
  assert(plan.reviewedClassicalSources.some(r=>r.title==='子平真詮'));
  assert(plan.permittedClaims.some(c=>c.id==='hour-counterexample'));
  assert(plan.prohibited.some(x=>x.includes('실제')));
  const target=projection.project(c.prompt,payload);
  assert.equal(JSON.stringify(payload),freeze,
   'original canonical payload must remain untouched');
  const core=target.task.chapters.saju_core;
  const dest=core.topics.temperament;
  assert(!dest.serverOwnedWritingContract,
   'model must not receive a contradictory generic workplace scene');
  assert.deepEqual(dest.qaClassicalWritingBrief,plan);
  assert.deepEqual(dest.sourceQualifiedWritingDecision.requiredCitationIds,
   plan.requiredEvidenceRefs);
  assert.equal(dest.paidCoreDepthV2.readerContrast,null);
  assert.equal(dest.paidCoreDepthV2.readerAlternative,null);
  assert.equal(dest.serverOwnedWritingContract,undefined);
  assert.deepEqual(target.source,payload.source);
  assert.deepEqual(core.topics.strength,
   payload.task.chapters.saju_core.topics.strength);
  assert.deepEqual(dest.citableFacts,
   payload.task.chapters.saju_core.topics.temperament.citableFacts);
  assert(core.coreV2ConditionalReadingBrief.includes('qaClassicalWritingBrief'));
  assert(!core.coreV2ConditionalReadingBrief.includes('두 누락 조건을 비교'));
  const qaSchema=writer.schema(c.prompt,
   wire.schemaFor(c.prompt,originalSchema));
  const textField=s=>s.properties.chapters.properties.saju_core.properties
   .paragraphs.properties.temperament.anyOf.find(x=>x.type==='object')
   .properties;
  assert.notDeepEqual(qaSchema,standardWire);
  const field=textField(qaSchema);
  assert(field.text.description.includes('삼명통회'));
  assert(field.text.description.includes('자평진전'));
  assert(field.text.description.includes('고전'));
  assert(field.basis.properties.refs.description.includes('qaClassicalWritingBrief'));
  assert.deepEqual(field.basis.properties.refs.items.enum,
   textField(standardWire).basis.properties.refs.items.enum,
   'canonical permitted source values must remain identical');
  assert.deepEqual(qaSchema.properties.chapters.properties.saju_core
   .properties.paragraphs.properties.strength,
   standardWire.properties.chapters.properties.saju_core
   .properties.paragraphs.properties.strength);
  const instructions=writer.policyFor(c.prompt);
  assert.notEqual(instructions,standardPolicy);
  assert(instructions.includes('qaClassicalWritingBrief'));
  // Compile, project, strict schema and real provider-envelope hashing.
  // prepare() builds the real HTTP-shaped request but stops before network.
  const qaHttp=await prepare();
  assert.equal(qaHttp.model,'gpt-4.1');
  assert.equal(qaHttp.providerCalls,0);
  assert.equal(qaHttp.approvalToCharge,false);
  assert.notEqual(qaHttp.requestHash,standardHttp.requestHash);
  assert.equal(qaHttp.releaseVerdict,'not-approved');
  delete process.env.PAID_CORE_V2_CLASSICAL_WRITER;
  assert.deepEqual(projection.project(c.prompt,payload),standard,
   'original production-shaped projection unchanged when flag is off');
  assert.deepEqual(writer.schema(c.prompt,
   wire.schemaFor(c.prompt,originalSchema)),standardWire);
  assert.equal(writer.policyFor(c.prompt),standardPolicy);
  const repeated=await prepare();
  assert.equal(repeated.requestHash,standardHttp.requestHash,
   'no new frozen paid QA3 fingerprint in default path');
  // Fail-closed: another person's birth chart never borrows the passage.
  process.env.PAID_CORE_V2_CLASSICAL_WRITER='offline-preview';
  const another=await capture({...input,birthTime:'20:20'});
  assert.equal(another.providerCalls,0);
  assert.throws(()=>bridge.inspect(another.prompt,writer.compile(another.prompt)),
   /QA3_CLASSICAL_PROVIDER_(?:UNVERIFIED_METHOD_SCOPE|NO_CANONICAL_SOURCE_CONTRACT)/);
  const tampered=structuredClone(payload);
  tampered.source['natal.hour.stem'].stem='戊';
  assert.throws(()=>bridge.inspect(c.prompt,tampered),
   /QA3_CLASSICAL_PROVIDER_SOURCE_DIVERGENCE/);
  process.env.NODE_ENV='production';
  assert.equal(bridge.enabled(c.prompt),false);
  process.env.NODE_ENV='test';process.env.RENDER='true';
  assert.equal(bridge.enabled(c.prompt),false);
  console.log('QA3_CLASSICAL_ACTUAL_PROVIDER_PATH='+JSON.stringify({
   realCapturedFirstPaidBatch:true,
   model:'gpt-4.1',
   verifiedClaims:plan.permittedClaims.length,
   requiredSourceRefs:plan.requiredEvidenceRefs.length,
   explicitOriginalMethodAndCounterexample:true,
   sceneContractNotSentToModelInPreview:true,
   conflictingFiveRefDecisionNotSent:true,
   actualOutputSchemaFieldChangedInPreview:true,
   oldStrictSourceEnumsAndStrengthUnaffected:true,
   realHttpEnvelopeBuiltOffline:true,
   qaHttpFingerprintDiffers:true,
   originalRequestHashPreserved:repeated.requestHash===standardHttp.requestHash,
   unrelatedChartBlocked:true,productionDisabled:true,
   remoteSchemaAccepted:'not-tested',
   actualModelTextQuality:'not-tested',
   decoderNotRelaxed:true,providerCalls:0,releaseVerdict:'not-approved'
  }));
 }finally{
  for(const [k,v] of Object.entries(prev))
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
