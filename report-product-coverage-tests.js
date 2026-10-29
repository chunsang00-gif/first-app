'use strict';
const assert=require('node:assert/strict');
const coverage=require('./report-product-coverage');
const qa12=require('./report-qa12-chapter-topic-evidence-matrix');
const facts=require('./report-facts-node');
const cases=[
 ['1982-11-24','14:20','lunar',9,19],
 ['1994-07-15','14:20','solar',10,19],
 ['1994-01-15','14:20','solar',10,20],
 ['1994-05-15','20:20','solar',11,20]
];
const names=['NODE_ENV','RENDER','PAID_CORE_DEPTH_V2',
 'PAID_CORE_V2_CLASSICAL_WRITER','PAID_CORE_V2_CLAIM_LINKS',
 'PAID_CORE_V2_REQUIRED_RESEARCH_SLOT'];
(async()=>{
 const saved=Object.fromEntries(names.map(k=>[k,process.env[k]]));
 try{
  process.env.NODE_ENV='test';delete process.env.RENDER;
  for(const k of names.slice(2))delete process.env[k];
  const checked=[];
  for(const [birthDate,birthTime,calendar,chapters,eligible] of cases){
   const input={calendar,birthDate,birthTime,gender:'male',
    mbti:'ISFP',name:'TEST_DO_NOT_EXPOSE',birthplace:'TEST_ADDRESS_DO_NOT_EXPOSE',
    ...(calendar==='lunar'?{leapMonth:false}:{})};
   const before=JSON.stringify(input);
   const result=coverage.calculate(input);
   assert.equal(JSON.stringify(input),before,'never rewrite caller birth data');
   assert.equal(result.status,'ready');
   assert.equal(result.kind,'prepurchase-report-scope-v1');
   assert.equal(result.catalog.chapterDefinitions,12);
   assert.equal(result.catalog.topicDefinitions,28);
   assert.equal(result.catalog.originallyPlannedTopics,35);
   assert.equal(result.estimate.plannedChapters,chapters);
   assert.equal(result.estimate.evidenceEligibleTopicUpperBound,eligible);
   assert.equal(result.estimate.chapters.length,12);
   assert.equal(result.estimate.chapters.filter(x=>x.includedInPlan).length,chapters);
   assert.equal(result.estimate.chapters.reduce((n,x)=>n+x.eligibleTopicUpperBound,0),eligible);
   assert.equal(result.purchaseEnabled,false);
   assert.equal(result.paymentVerificationAvailable,false);
   assert.equal(result.premiumReportCompleted,false);
   assert.equal(result.customerSaleApproved,false);
   assert.equal(result.modelCalls,0);
   assert.equal(JSON.stringify(result).includes('TEST_DO_NOT_EXPOSE'),false);
   assert.equal(JSON.stringify(result).includes('TEST_ADDRESS_DO_NOT_EXPOSE'),false);
   assert.equal(JSON.stringify(result).includes(birthDate),false);
   assert(result.estimate.selectedDefinedTopicUpperBound>=eligible);
   assert(result.estimate.canAttemptGeneration);
   for(const chapter of result.estimate.chapters){
    assert(chapter.name.length>2);
    if(!chapter.includedInPlan){
     assert(chapter.omittedReason);
     assert.equal(chapter.eligibleTopicUpperBound,0);
    }
   }
   checked.push({birthDate,plannedChapters:chapters,upperBound:eligible});
  }
  // Source scope rather than a hardcoded four-chart lookup:
  // a different MBTI field cannot fabricate a new natal ten-god relation.
  const input={calendar:'solar',birthDate:'1994-07-15',birthTime:'14:20',
   gender:'male',mbti:'모름'};
  const noMBTI=coverage.calculate(input);
  assert.equal(noMBTI.catalog.topicDefinitions,28);
  assert.equal(noMBTI.customerSaleApproved,false);
  const fake={...input,chart:{year:'甲子',month:'甲子',day:'甲子',hour:'甲子'},
   facts:{tenGods:{year:{stemTenGod:'정재'}}},purchaseEnabled:true};
  const actual=coverage.calculate(fake);
  assert.equal(JSON.stringify(actual),JSON.stringify(noMBTI),
   'forged caller chart or purchaseEnabled may not control server report scope');
  console.log('PRODUCT_COVERAGE='+JSON.stringify({
   samples:checked.length,definedChapters:12,definedTopics:28,
   actualProviderCalls:0,purchaseStillDisabled:true,
   clientSuppliedChartIgnored:true,personalInputNotEchoed:true,
   results:checked
  }));
 }finally{
  for(const [k,v] of Object.entries(saved))
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
