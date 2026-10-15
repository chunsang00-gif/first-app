'use strict';
const assert=require('node:assert/strict');
const {archive,replay,layer}=require('./report-offline-replay');
const decoder=require('./report-response-decoder');
const sample={calendar:'lunar',leapMonth:false,birthDate:'1982-11-24',
 birthTime:'14:20',gender:'male',mbti:'ISFP',name:'검증용'};
(async()=>{
 assert.throws(()=>archive({sample,calls:[{number:1,stage:'body',
  requestedSections:['saju_core'],response:{chapters:{saju_core:{}}}}]}),
 /OFFLINE_ARCHIVE_NOT_DECODED_RAW_CALLS/);
 assert.equal(layer('READER_COPY_REJECTED'),'editorial-content');
 assert.equal(layer('PROVIDER_TOKEN_LIMIT'),'provider-transport');
 assert.equal(layer('EVIDENCE_CONTRACT_REJECTED'),'evidence-validation');
 assert.throws(()=>decoder.decode({status:'incomplete',
  incomplete_details:{reason:'max_output_tokens'}},{stage:'body',requestedSections:['saju_core']}),
  /output token limit/);
 const oldFetch=global.fetch;
 let called=0;
 global.fetch=async()=>{called++;throw Error('No network in replay test')};
 try{
  const empty=await replay({sample,calls:[]});
  assert.equal(empty.firstFailure,'ARCHIVE_EXHAUSTED');
  assert.equal(empty.failureLayer,'offline-replay');
  assert.equal(empty.archivedCallsConsumed,0);
  assert.equal(empty.providerRequests,0);
  const drift=await replay({sample,calls:[{number:1,stage:'body',
   requestedSections:['mbti_contradiction'],response:{sections:[]}}]});
  assert.equal(drift.firstFailure,'REQUEST_PLAN_CHANGED');
  assert.equal(drift.archivedCallsConsumed,0);
  const malformed=await replay({sample,calls:[{number:1,stage:'body',
   requestedSections:['saju_core'],response:{sections:[]}}]});
  assert.equal(malformed.firstFailure,'OUTPUT_CONTRACT_REJECTED');
  assert.equal(malformed.failureLayer,'response-structure');
  assert.equal(malformed.archivedCallsConsumed,1);
  const provider={sample,calls:[{number:1,request:{stage:'body',
   task:{chapters:{saju_core:{}}}},response:{status:'incomplete',
   incomplete_details:{reason:'max_output_tokens'}}}]};
  const incomplete=await replay(provider);
  assert.equal(incomplete.archiveKind,'provider');
  assert.equal(incomplete.archivedCallsConsumed,1);
  assert.equal(incomplete.firstFailure,'PROVIDER_TOKEN_LIMIT');
  assert.equal(incomplete.failureLayer,'provider-transport');
  assert.equal(incomplete.providerRequests,0);
  assert.equal(incomplete.stoppedAt,'provider-response-decoding');
  assert.equal(incomplete.archivedContractChanged,true,
   'historical provider input must not masquerade as a current schema response');
  assert.equal(called,0,'archive replay must never access network');
 }finally{global.fetch=oldFetch}
 console.log('PASS live/shared provider decoder and offline raw/provider archive replay, classified failure without billable calls');
})().catch(e=>{console.error(e);process.exitCode=1});
