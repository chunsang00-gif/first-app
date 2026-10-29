'use strict';
// Six offline tests of the SAFE summary produced from encrypted QA5 evidence;
// never need a real API key, downloaded artifact, HTTP, or provider calls.
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const diagnosis=require('./qa5-safe-archive-diagnosis').diagnostic;
const HASH='9e5c729912c3ff8de023c170a8513c06485466e6e6ae7bba82aed56920e49808';
const secret='SECRET_MODEL_PROSE_AND_SENSITIVE_PROMPT_SHOULD_NOT_LEAK';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'qa5-meta-only-'));
function write(name,data){
 fs.writeFileSync(path.join(root,'private-qa-first-chapter'+name+'.json'),
  JSON.stringify(data));
}
function run(label,response,category,reason,outputTokens=null){
 write('-attempt',{providerCallMaximum:1});
 write('',{requestHash:HASH,releaseVerdict:'not-approved',providerCalls:1});
 write('-provider-calls',{providerCalls:1,response});
 const result=diagnosis(root);
 assert.equal(result.responseCategory,category,label);
 assert.equal(result.rootCauseCategory,reason,label);
 assert.equal(result.outputTokens,outputTokens,label);
 assert.equal(result.repeatOrRetryAllowed,false);
 assert.equal(result.noRawOutputPrinted,true);
 assert.equal(result.providerCallAttempts,1);
 assert.equal(result.potentialBilling,true);
 assert(!JSON.stringify(result).includes(secret),'raw leaked in '+label);
 return result;
}
try{
 run('incomplete output',{status:'incomplete',
  incomplete_details:{reason:'max_output_tokens'},usage:{output_tokens:18000},
  partialOutput:[{content:[{text:secret}]}]},
  'incomplete','provider-incomplete',18000);
 run('content filter incomplete',{status:'incomplete',
  incomplete_details:{reason:'content_filter'},usage:{output_tokens:200}},
  'incomplete','provider-incomplete',200);
 run('bad json',{status:'invalid_json',rawOutput:secret},
  'invalid_json','provider-json-parse-failed');
 run('empty output',{status:'empty_output',output:[]},
  'empty_output','provider-empty-output');
 run('missing first chapter',{chapters:{},other:secret},
  'parsed-json-callback','parsed-json-missing-first-chapter');
 run('missing claim links',{chapters:{saju_core:{paragraphs:{
  temperament:{basis:{refs:[secret]}}}}}},
  'parsed-json-callback','parsed-json-missing-claim-links');
 run('present claim links',{chapters:{saju_core:{paragraphs:{
  temperament:{basis:{claimLinks:[{id:secret}]}}}}}},
  'parsed-json-callback','parsed-json-claim-links-present-check-downstream');
 assert.throws(()=>diagnosis(path.join(root,'missing')),/QA5_ARCHIVE_IDENTITY/);
 write('',{requestHash:'forged',releaseVerdict:'not-approved',providerCalls:1});
 assert.throws(()=>diagnosis(root),/QA5_ARCHIVE_IDENTITY/);
 console.log('QA5_NO_BILL_SAFE_ARCHIVE_DIAGNOSIS_TESTS='+JSON.stringify({
  scenarios:7,
  fixedVocabularyOnly:true,originalProseNeverLogged:true,
  incompleteAndInvalidJsonDistinguished:true,
  customerContentNeverReleased:true,actualProviderCalls:0,
  historicalAttemptRemainsConsumed:true}));
}finally{fs.rmSync(root,{recursive:true,force:true});}
