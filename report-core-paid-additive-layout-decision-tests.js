'use strict';
const assert=require('node:assert/strict');
const {inspect}=require('./report-core-paid-additive-layout-decision');
const cases=[
 {calendar:'lunar',birthDate:'1982-11-24',birthTime:'14:20',
  leapMonth:false,gender:'male',mbti:'ISFP'},
 {calendar:'lunar',birthDate:'1982-11-24',birthTime:'20:20',
  leapMonth:false,gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'1982-06-15',birthTime:'14:20',
  gender:'male',mbti:'ISFP'}
];
(async()=>{
 const results=[];
 const oldFetch=global.fetch;
 let requests=0;
 global.fetch=()=>{requests++;throw Error('QA_ADDITIVE_LAYOUT_HTTP_FORBIDDEN');};
 try{
  for(const input of cases){
   const x=await inspect(input);
   assert.equal(x.kind,'offline-real-first-batch-additive-layout-decision-v1');
   assert.deepEqual(x.existingNormalReaderSlots,['temperament','strength']);
   assert.deepEqual(x.qaReaderSlots,['temperament','strength','natal_depth']);
   assert.equal(x.actualNormalDoesNotExposeDepth,true);
   assert.equal(x.qaSuppressesExistingTemperament,true);
   assert.equal(x.additivePrototype.preservesNormalCoreFields,true);
   assert.equal(x.additivePrototype.preservesNormalCitationEnums,true);
   assert.equal(x.additivePrototype.requiresDepthOutput,false);
   assert.equal(x.additivePrototype.strictlyNoReaderOrProviderIntegration,true);
   assert.equal(x.abilityToUsePrototypeForCustomer,false);
   assert.equal(x.paidApiCalls,0);
   assert.equal(x.releaseVerdict,'not-approved');
   assert.equal(x.blockingIssues.length,5);
   assert(x.citations.qaDepth.includes('natal.hour.stem'));
   assert(!x.citations.normalCore.strength.includes('natal.hour.stem'));
   const s=x.additivePrototype.schema.properties.chapters.properties
    .saju_core.properties.paragraphs;
   assert.deepEqual(Object.keys(s.properties),['temperament','strength','natal_depth']);
   assert.deepEqual(s.required,['temperament','strength','natal_depth']);
   assert.equal(s.properties.temperament.anyOf[1].type,'null');
   assert.equal(s.properties.strength.type,'object');
   assert.equal(s.properties.natal_depth.anyOf[1].type,'null');
   const x2=await inspect(input);
   assert.deepEqual(x2.additivePrototype.schema,x.additivePrototype.schema,
    'additive dry run must be deterministic per identical input');
   results.push([input.birthTime,x.actualChart.hour,x.citations.qaDepth.length]);
  }
 }finally{global.fetch=oldFetch;}
 assert.equal(requests,0);
 assert.notEqual(results[0][1],results[1][1]);
 console.log('QA_ADDITIVE_LAYOUT_DECISION='+JSON.stringify({
  checked:results,originalTwoSlotsPreserved:true,
  existingQaReplacesSeasonalSlot:true,
  proposedThirdSlotNullable:true,
  quoteableDepthFactsAreStillQaOnly:true,
  noLiveWriterOrDecoderChange:true,
  humanMethodAndPremiumValueStillMissing:true,
  httpAttempts:requests,paidCalls:0,releaseVerdict:'not-approved'
 }));
})().catch(err=>{console.error(err);process.exitCode=1;});
