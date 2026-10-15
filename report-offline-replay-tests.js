'use strict';
const assert=require('node:assert/strict');
const {archive,replay}=require('./report-offline-replay');
const sample={calendar:'lunar',leapMonth:false,birthDate:'1982-11-24',
 birthTime:'14:20',gender:'male',mbti:'ISFP',name:'검증용'};
(async()=>{
 assert.throws(()=>archive({sample,calls:[{number:1,stage:'body',
   requestedSections:['saju_core'],response:{chapters:{saju_core:{}}}}]}),
  /OFFLINE_ARCHIVE_NOT_DECODED_RAW_CALLS/);
 const oldFetch=global.fetch;
 let called=0;
 global.fetch=async()=>{called++;throw Error('No network in replay test')};
 try{
  const empty=await replay({sample,calls:[]});
  assert.equal(empty.firstFailure,'ARCHIVE_EXHAUSTED');
  assert.equal(empty.archivedCallsConsumed,0);
  assert.equal(empty.providerRequests,0);
  const drift=await replay({sample,calls:[{number:1,stage:'body',
   requestedSections:['mbti_contradiction'],response:{sections:[]}}]});
  assert.equal(drift.firstFailure,'REQUEST_PLAN_CHANGED');
  assert.equal(drift.archivedCallsConsumed,0);
  const structurallyInvalid=await replay({sample,calls:[{number:1,stage:'body',
   requestedSections:['saju_core'],response:{sections:[]}}]});
  assert.equal(structurallyInvalid.firstFailure,'OUTPUT_CONTRACT_REJECTED');
  assert.equal(structurallyInvalid.archivedCallsConsumed,1);
  assert.equal(called,0,'offline replay must never access network');
  assert.equal(global.fetch!==oldFetch,true);
 }finally{global.fetch=oldFetch}
 console.log('PASS private paid-QA offline replay: archive-only, no network or billable calls, request drift and structural failures isolated');
})().catch(err=>{console.error(err);process.exitCode=1});
