'use strict';
const assert=require('node:assert/strict');
const audit=require('./report-qa3-offline-provider-readiness-audit');
const flags=['NODE_ENV','RENDER','PAID_CORE_DEPTH_V2',
 'PAID_CORE_V2_CLASSICAL_WRITER','PAID_CORE_V2_CLAIM_LINKS',
 'PAID_CORE_V2_LOCK_REFS','PAID_CORE_V2_CLOSED_CLAIMS'];
(async()=>{
 const old=Object.fromEntries(flags.map(x=>[x,process.env[x]]));
 try{
  process.env.NODE_ENV='test';
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  process.env.PAID_CORE_V2_CLASSICAL_WRITER='offline-preview';
  process.env.PAID_CORE_V2_CLAIM_LINKS='offline-preview';
  for(const x of ['RENDER','PAID_CORE_V2_LOCK_REFS','PAID_CORE_V2_CLOSED_CLAIMS'])
   delete process.env[x];
  const ready=await audit.inspectOne();
  assert.equal(ready.kind,'qa3-actual-envelope-dry-run-and-budget-v1');
  assert.equal(ready.strictSchemaStructuralCheck,'passed-local-only');
  assert.equal(ready.providerEndpointValidation,'not-tested');
  assert.equal(ready.actualModelCompletion,'not-generated');
  assert.equal(ready.outputTokenCap,18000);
  assert.equal(ready.publishedInputUSDPerMillion,2);
  assert.equal(ready.publishedOutputUSDPerMillion,8);
  assert(ready.estimatedCostUSDAtOutputCapAndInputBound>0.144);
  assert(ready.estimatedCostUSDAtOutputCapAndInputBound<1,
   'halt if one complete first-chapter request worst-case cost > $1');
  assert(ready.schemaStatistics.objects>=5);
  assert(ready.schemaStatistics.properties>=10);
  assert(ready.schemaStatistics.enumValues>0);
  assert(ready.schemaStatistics.maxDepth<=10);
  assert.equal(ready.providerCalls,0);
  assert.equal(ready.approvalToCharge,false);
  assert.equal(ready.releaseVerdict,'not-approved');
  const testSchema={type:'object',additionalProperties:false,
   required:['claims'],properties:{claims:{type:'array',items:{
    type:'object',additionalProperties:false,required:['id','refs'],
    properties:{id:{type:'string',enum:['a','b']},
     refs:{type:'array',items:{type:'string'}}}}}}};
  assert.equal(audit.checkStrictSchema(testSchema).eligibleForRemoteTrial,true);
  const noReq=structuredClone(testSchema);
  noReq.properties.claims.items.required=['id'];
  assert(audit.checkStrictSchema(noReq).findings.some(x=>
   x.startsWith('required-properties-not-exact')));
  const extra=structuredClone(testSchema);
  extra.properties.claims.items.additionalProperties=true;
  assert(audit.checkStrictSchema(extra).findings.some(x=>
   x.startsWith('object-missing-additionalProperties-false')));
  const banned=structuredClone(testSchema);
  banned.properties.claims.items.properties.id.not={type:'null'};
  assert(audit.checkStrictSchema(banned).findings.some(x=>
   x.startsWith('unsupported-keyword')));
  const badRoot={anyOf:[testSchema,testSchema]};
  assert(audit.checkStrictSchema(badRoot).findings.some(x=>
   x==='root-must-be-object-not-anyOf'));
  delete process.env.PAID_CORE_V2_CLAIM_LINKS;
  await assert.rejects(audit.inspectOne(),/REQUIRES_EXACT_OFFLINE_RESEARCH_FLAGS/);
  process.env.PAID_CORE_V2_CLAIM_LINKS='offline-preview';
  process.env.NODE_ENV='production';
  await assert.rejects(audit.inspectOne(),/REQUIRES_EXACT_OFFLINE_RESEARCH_FLAGS/);
  process.env.NODE_ENV='test';process.env.RENDER='true';
  await assert.rejects(audit.inspectOne(),/REQUIRES_EXACT_OFFLINE_RESEARCH_FLAGS/);
  console.log('QA3_STRICT_SCHEMA_BUDGET_PREFLIGHT='+JSON.stringify({
   actualFirstChapterEnvelopeMatchedExistingHash:true,
   verifiedObjectCount:ready.schemaStatistics.objects,
   verifiedMaxSchemaDepth:ready.schemaStatistics.maxDepth,
   verifiedEnumValues:ready.schemaStatistics.enumValues,
   envelopeUTF8Bytes:ready.envelopeUTF8Bytes,
   conservativeInputTokenBound:ready.inputTokenConservativeBound,
   outputTokenCap:ready.outputTokenCap,
   costUSDAtConservativeBound:ready.estimatedCostUSDAtOutputCapAndInputBound,
   strictSchemaSubsetCheckedLocally:true,
   unsupportedRequiredAdditionalPropertiesAndRootAnyOfRejected:true,
   actualRemoteAcceptability:'not-tested',
   actualInputTokens:'not-metered',
   actualPriceAndModelAvailabilityAtCall:'not-verified',
   modelCalls:0,customerApproval:false,releaseVerdict:'not-approved'
  }));
 }finally{
  for(const [k,v] of Object.entries(old))
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
