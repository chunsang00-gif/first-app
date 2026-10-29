'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const capture=require('./report-core-paid-full-prompt-capture').capture;
const outline=require('./report-outline');
const scope=require('./report-qa11-premium-scope-audit');
const first={calendar:'lunar',leapMonth:false,birthDate:'1982-11-24',
 birthTime:'14:20',gender:'male',mbti:'ISFP',name:'검증용'};
const second={calendar:'solar',birthDate:'1994-07-15',birthTime:'14:20',
 gender:'male',mbti:'ISFP'};
const keys=['NODE_ENV','RENDER','PAID_CORE_DEPTH_V2',
 'PAID_CORE_V2_CLASSICAL_WRITER','PAID_CORE_V2_CLAIM_LINKS',
 'PAID_CORE_V2_REQUIRED_RESEARCH_SLOT'];
(async()=>{
 const saved=Object.fromEntries(keys.map(x=>[x,process.env[x]]));
 try{
  process.env.NODE_ENV='test';delete process.env.RENDER;
  for(const key of keys.slice(2))delete process.env[key];
  const results=[];
  for(const input of [first,second]){
   const packet=facts.build(input,2027);
   assert.equal(packet.status,'ready');
   const observed=await capture(input);
   assert.equal(observed.status,'captured-full-paid-composition');
   assert.equal(observed.providerCalls,0);
   const before=JSON.stringify(observed.prompt);
   const audit=scope.scope(packet,observed.prompt);
   assert.equal(JSON.stringify(observed.prompt),before);
   assert.equal(audit.canonicalChapterCount,12);
   assert.equal(audit.definedCanonicalTopicSlots,28);
   assert.equal(audit.missingDefinedTopicSlots,7);
   assert(audit.chartSelectedChapters<=12&&audit.chartSelectedChapters>=4);
   assert(audit.chartSelectedDefinedTopicUpperBound<=28);
   assert(audit.chartEvidenceEligibleTopicUpperBound<=
    audit.chartSelectedDefinedTopicUpperBound);
   assert.equal(audit.firstProviderSchemaTopicKeys.saju_core.join('/'),
    'temperament/strength');
   assert(audit.gapCodes.includes('PRODUCT_35_TOPICS_NOT_DEFINED'));
   assert.equal(audit.canPromise12Chapters35Topics,false);
   assert.equal(audit.canSell,false);
   assert.equal(audit.providerCalls,0);
   assert(audit.paidCallsPlanned<=7);
   assert.deepEqual(audit.firstBatchRequestedSections,observed.requestedSections);
   results.push({chapters:audit.chartSelectedChapters,
    selectedUpperBound:audit.chartSelectedDefinedTopicUpperBound,
    eligibleUpperBound:audit.chartEvidenceEligibleTopicUpperBound,
    omitted:audit.chartOmittedChapters.length,plannedCalls:audit.paidCallsPlanned});
   const mangled=structuredClone(observed.prompt);
   mangled.requestedSections=['saju_core','year_2027'];
   assert.throws(()=>scope.scope(packet,mangled),
    /QA11_FIRST_LIVE_BATCH_SCOPE_DRIFT/);
  }
  assert.equal(Object.values(outline.topics).reduce((n,v)=>n+
   Object.keys(v).length,0),28);
  process.env.NODE_ENV='production';
  assert.throws(()=>scope.scope(facts.build(first,2027),(await capture(first)).prompt),
   /QA11_LIVE_CONTRACT_INSPECTION_OFFLINE_ONLY/);
  process.env.NODE_ENV='test';process.env.RENDER='true';
  assert.throws(()=>scope.scope(facts.build(first,2027),{stage:'body'}),
   /QA11_LIVE_CONTRACT_INSPECTION_OFFLINE_ONLY/);
  console.log('QA11_PRODUCT_SCOPE='+JSON.stringify({
   chaptersDefined:12,topicsDefined:28,targetTopics:35,
   missingTopics:7,productionScopeCanOmitChapters:true,
   optionalTopicsMayBeNull:true,realProviderFirstBatchSchemaChecked:true,
   syntheticInputs:results,actualProviderCalls:0,
   twelveByThirtyFivePromiseVerified:false,
   customerReleaseAuthorized:false
  }));
 }finally{
  for(const [key,v] of Object.entries(saved))
   if(v===undefined)delete process.env[key];else process.env[key]=v;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
