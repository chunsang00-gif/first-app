'use strict';
const assert=require('node:assert/strict');
const {prepare,FIXTURE,MODEL}=require('./report-paid-core-v2-billable-readiness');
const {capture}=require('./report-core-paid-full-prompt-capture');
async function test(){
 const restore={node:process.env.NODE_ENV,flag:process.env.PAID_CORE_DEPTH_V2,
 render:process.env.RENDER};
 const x=await prepare(),y=await prepare();
 assert.deepEqual(x,y,'billable request preflight hash must be stable');
 assert.equal(x.kind,'offline-actual-provider-first-chapter-v2-envelope-v1');
 assert.equal(x.chart,'甲戌/辛未/壬寅/丁未');
 assert.equal(MODEL,'gpt-4.1');
 assert.equal(x.model,MODEL);
 assert.equal(x.firstChapterOnly,true);
 assert.equal(x.tokenLimit,18000);
 assert.equal(x.requestHash.length,64);
 assert.equal(x.systemHash.length,64);
 assert.equal(x.schemaHash.length,64);
 assert.equal(x.taskHash.length,64);
 assert.deepEqual(x.allowedSourceRefs,
  ['natal.year.stem','natal.day.stem',
   'natal.hour.stem','facts.stemConnections']);
 assert.equal(x.approvalToCharge,false);
 assert.equal(x.providerCalls,0);
 assert.equal(x.customerReady,false);
 assert.equal(x.realOutputTextVerified,false);
 assert.equal(x.editorialMethodApproved,false);
 assert.equal(x.releaseVerdict,'not-approved');
 assert.deepEqual({node:process.env.NODE_ENV,flag:process.env.PAID_CORE_DEPTH_V2,
 render:process.env.RENDER},restore,'QA activation flags must always be restored');
 assert.equal(FIXTURE.birthDate,'1994-07-15');
 assert.equal(FIXTURE.birthTime,'14:20');
 console.log('PAID_CORE_V2_BILLING_READINESS='+JSON.stringify(x));
 console.log('PASS real HTTP payload fingerprint for V2 first chapter, approval=false, no provider calls');
}
test().catch(err=>{console.error(err);process.exitCode=1;});