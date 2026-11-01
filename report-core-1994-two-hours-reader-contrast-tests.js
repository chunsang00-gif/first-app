'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const reader=require('./report-reader-policy');
const created=require('./report-core-1994-two-hours-reader-contrast');
const original=require('./report-core-1994-dingren-reader-revision');
const init=Object.fromEntries(['NODE_ENV','RENDER','PAID_CORE_DEPTH_V2'].map(k=>
 [k,process.env[k]]));
try{
 process.env.NODE_ENV='test';
 process.env.PAID_CORE_DEPTH_V2='offline-preview';
 delete process.env.RENDER;
 const result=created.make(created.INPUT);
 assert(result);
 assert.equal(result.releaseVerdict,'not-approved');
 assert.equal(result.customerQualityApproved,false);
 assert.equal(result.professionalReview,false);
 assert.equal(result.paidWriterChanged,false);
 assert.equal(result.providerCalls,0);
 assert.equal(result.paragraphsPerVariant,3);
 assert.equal(result.early.chart.hour,'丁未');
 assert.equal(result.later.chart.hour,'庚戌');
 for(const position of ['year','month','day'])
  assert.equal(result.early.chart[position],result.later.chart[position]);
 assert.notEqual(result.early.text,result.later.text);
 assert(result.early.text.length>=600);
 assert(result.later.text.length>=500);
 assert.equal(reader.errors([result.later.label,result.later.text]).length,0);
 assert(!/[\u3400-\u9fff]/.test(result.later.text));
 assert.deepEqual(result.verifiedChange,{
  birthYearMonthDayUnchanged:true,
  hourStemFrom:'丁',hourStemTo:'庚',
  hourRoleFrom:'정재',hourRoleTo:'편인',
  visibleWealthExposureAtEarlyHour:true,visibleWealthExposureAtLateHour:false,
  adjacentDayHourPairAtEarlyHour:true,adjacentDayHourPairAtLateHour:false,
  sameMonthMainMeaningRemains:true,relativeTraditionalPriority:'not-assessed',
  observedPersonalityOrIncome:false
 });
 const old=original.make(facts.build(created.INPUT,2027));
 assert.equal(result.early.text,old.candidate.text,
  'the existing verified first-hour manuscript must not change');
 const second=created.make(created.INPUT);
 assert.equal(JSON.stringify(result),JSON.stringify(second));
 assert.equal(created.make({...created.INPUT,birthTime:'20:20'}),null,
  'only the original two-hour QA pair may initiate this research');
 assert.equal(created.make({...created.INPUT,birthDate:'1994-07-16'}),null);
 process.env.NODE_ENV='production';
 assert.throws(()=>created.make(created.INPUT),/RESEARCH_ONLY/);
 process.env.NODE_ENV='test';process.env.RENDER='true';
 assert.throws(()=>created.make(created.INPUT),/RESEARCH_ONLY/);
 console.log('PASS independent FULL reader interpretations for original 14:20 and counterfactual 20:20; '+
  JSON.stringify({originalParagraphChars:result.early.text.length,
   changedHourParagraphChars:result.later.text.length,
   sameYearMonthDay:true,changedTraditionalRole:true,
   duplicateWorkplaceScene:false,providerCalls:0,
   paidWriterChanged:false,approvedForSale:false}));
}finally{
 for(const [key,val] of Object.entries(init))
  if(val===undefined)delete process.env[key];else process.env[key]=val;
}
