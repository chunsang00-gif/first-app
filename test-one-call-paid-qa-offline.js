'use strict';
// Integration test of the REAL one-call paid QA entrypoint with fake network.
// Private archived response is downloaded from the prior paid run by CI.
// NO secret or live provider request. Never print report content.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const assert=require('node:assert/strict');
const inputFile=process.env.QA_PREVIOUS_PROVIDER_ARCHIVE;
async function test(){
 if(!path.isAbsolute(inputFile||'')||!fs.existsSync(inputFile))
  throw Error('Previous private provider archive required');
 const source=JSON.parse(fs.readFileSync(inputFile,'utf8'));
 assert.equal(source.calls?.length,1);
 assert(source.calls[0].response?.chapters?.saju_core);
 const previous={
  fetch:global.fetch,key:process.env.OPENAI_API_KEY,model:process.env.REPORT_MODEL,
  approval:process.env.REPORT_QA_CONFIRM,output:process.env.REPORT_QA_OUTPUT
 };
 process.env.OPENAI_API_KEY='offline-only-fake-key';
 process.env.REPORT_MODEL=previous.model||'gpt-4.1';
 process.env.REPORT_QA_CONFIRM='RUN_ONE_PAID_SAMPLE';
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'saju-onecall-test-'));
 try{
  let calls=0;
  global.fetch=async(url,options)=>{
   assert.equal(String(url),'https://api.openai.com/v1/responses');
   calls++;assert.equal(calls,1,'NO second provider request is permitted');
   const body=JSON.parse(options.body);
   assert.equal(body.store,false);
   assert.deepEqual(Object.keys(body.text.format).includes('schema'),true);
   assert.equal(JSON.parse(body.input[1].content).task.chapters.saju_core.topics.strength.evidenceFocus.readerReasoning?.contrastQuestion.length>20,true);
   return {ok:true,json:async()=>({
    status:'completed',output_text:JSON.stringify(source.calls[0].response),
    usage:{output_tokens:1600}
   })};
  };
  process.env.REPORT_QA_OUTPUT=path.join(directory,'first.json');
  await require('./run-paid-first-chapter-qa').run();
  assert.equal(process.exitCode,1,
   'prior paid technical-first draft must now FAIL the improved reader-quality gate');
  process.exitCode=0; // deliberate negative test
  assert.equal(calls,1,'failed reader gate must never retry the provider');
  assert.equal(fs.existsSync(process.env.REPORT_QA_OUTPUT),false,
   'rejected paid draft must not be labeled as a validated first chapter');
  assert.equal(fs.existsSync(path.join(directory,'first-validated-first-chapter.json')),false,
   'rejected paid draft must never create a validated checkpoint');
  const original=JSON.parse(fs.readFileSync(path.join(directory,'first-provider-calls.json'),'utf8'));
  assert.equal(original.calls.length,1);
  assert.equal(original.calls[0].request.task.chapters.saju_core.topics.strength.evidenceFocus.readerReasoning?.contrastQuestion.length>20,true);
  assert.equal(fs.statSync(path.join(directory,'first-provider-calls.json')).mode&0o777,0o600,
   'paid draft archive must remain private even when quality validation fails');
  // And a malformed charged output is retained, without any second call.
  calls=0;
  global.fetch=async()=>{
   calls++;assert.equal(calls,1);
   return {ok:true,json:async()=>({status:'completed',output_text:'{"chapters":'})};
  };
  process.env.REPORT_QA_OUTPUT=path.join(directory,'malformed.json');
  await require('./run-paid-first-chapter-qa').run();
  assert.equal(process.exitCode,1);
  process.exitCode=0; // Failure was EXPECTED in this negative integration test.
  assert.equal(calls,1);
  const malformed=JSON.parse(fs.readFileSync(path.join(directory,'malformed-provider-calls.json'),'utf8'));
  assert.equal(malformed.calls.length,1);
  assert.equal(malformed.calls[0].response.status,'invalid_json');
  assert.equal(fs.existsSync(path.join(directory,'malformed-validated-first-chapter.json')),false);
  console.log('PASS one-call first-chapter QA: obsolete paid draft and malformed response each rejected after exactly one mock call, both originals kept private, no real API requests');
 }finally{
  global.fetch=previous.fetch;
  for(const [k,v] of [['OPENAI_API_KEY',previous.key],['REPORT_MODEL',previous.model],
    ['REPORT_QA_CONFIRM',previous.approval],['REPORT_QA_OUTPUT',previous.output]]){
   if(v===undefined)delete process.env[k];else process.env[k]=v;
  }
  fs.rmSync(directory,{recursive:true,force:true});
 }
}
test().catch(e=>{console.error('Offline first-chapter integration failed:',e.message);process.exitCode=1});
