'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {generate}=require('./report-server-contract');
const {decode}=require('./report-response-decoder');
const {callOpenAI}=require('./server');
const {history}=require('./qa-launch-whole-chart-first-chapter-once');

const REPO='chunsang00-gif/first-app';
const BRANCH='fix-paid-qa-fact-bindings-20261014';
const MODEL='gpt-6-luna';
const originalGate={
 kind:'resume-archived-first-chapter-v1',
 offset:0,
 workflow:'.github/workflows/qa-resume-paid-report-once.yml',
 marker:'qa-approvals/resume-paid-report-once.json'
};
const remainingGate={
 kind:'resume-archived-four-chapters-v1',
 offset:2,
 continuationRun:'45953625555',
 workflow:'.github/workflows/qa-finish-paid-report-once.yml',
 marker:'qa-approvals/finish-paid-report-once.json'
};
const SOURCE_RUN='45896281549';
const SOURCE_HASH='c9bb5d4b2c5f00ba17af339fd15f4abec3fb2e30e7b2a46008a328e8b0e2cf14';
const INPUT={...require('./qa-launch-g1-money-preflight').INPUT,birthDate:'1982-10-15',
 readerDecision:'기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.'};
const OPTIONS={paidWholeNatalContext:true};
const PLAN=[['mbti_contradiction'],['money','career'],['relationship'],['year_2027'],[]];
const MAX_OUTPUT=12000;
const MAX_REQUEST_BYTES=225000;
const SUMMARY='private-qa-first-chapter.json';
const ARCHIVE='private-qa-first-chapter-provider-calls.json';
const CHECKPOINTS='private-qa-first-chapter-validated-first-chapter.json';

function authorize(marker,env,git,gate){
 assert.deepEqual(marker,{
  kind:gate.kind,operatorApprovedOneReport:true,
  sourceRun:SOURCE_RUN,sourceRequestSha256:SOURCE_HASH,
  ...(gate.continuationRun?{continuationRun:gate.continuationRun}:{}),
  maxNewCalls:PLAN.length-gate.offset,totalOutputTokenLimit:(PLAN.length-gate.offset)*MAX_OUTPUT,
  model:MODEL,noRetries:true,noPayment:true,noDeployment:true,
  parentCommit:git(['rev-parse','HEAD^'])
 });
 assert.equal(env.GITHUB_REPOSITORY,REPO);
 assert.equal(env.GITHUB_REF,'refs/heads/'+BRANCH);
 assert.equal(env.GITHUB_WORKFLOW_REF,REPO+'/'+gate.workflow+'@refs/heads/'+BRANCH);
 assert.equal(env.GITHUB_EVENT_NAME,'push');
 assert.equal(env.GITHUB_ACTIONS,'true');
 assert.equal(env.GITHUB_RUN_ATTEMPT,'1');
 assert.equal(env.NODE_ENV,'test');
 assert.equal(env.REPORT_MODEL,MODEL);
 assert.equal(git(['rev-parse','HEAD']),env.GITHUB_SHA);
 assert.equal(git(['diff','--name-only','HEAD^','HEAD']),gate.marker);
 assert.match(env.GITHUB_RUN_ID,/^[1-9][0-9]*$/);
 assert(env.OPENAI_API_KEY?.length>=32&&env.GITHUB_TOKEN?.length>=8);
 assert(!env.REPORT_MODEL_URL&&env.RENDER!=='true');
}

function checkStage(prompt,index){
 const ids=PLAN[index];
 assert(ids,'unapproved continuation call');
 assert.equal(prompt.stage,ids.length?'body':'synthesis');
 assert.deepEqual(prompt.requestedSections,ids);
 assert.equal(require('./report-paid-batch-plan').outputLimit(MODEL,prompt),MAX_OUTPUT);
}
function checkTransport(url,options){
 assert.equal(url,'https://api.openai.com/v1/responses');
 assert.equal(options.method,'POST');
 assert(Buffer.byteLength(options.body)<=MAX_REQUEST_BYTES,'request size exceeds approved scope');
 const body=JSON.parse(options.body);
 assert.equal(body.model,MODEL);
 assert.equal(body.store,false);
 assert.equal(body.max_output_tokens,MAX_OUTPUT);
}

function readArchivedOutput(dir){
 const read=name=>JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'));
 assert.equal(read('private-qa-first-chapter-attempt.json').runId,SOURCE_RUN);
 const original=read(ARCHIVE);
 assert.equal(original.kind,'whole-chart-original-response');
 assert.equal(crypto.createHash('sha256').update(JSON.stringify(original.request)).digest('hex'),SOURCE_HASH);
 assert.equal(original.response.status,'completed');
 return providerOutput(original.response);
}
function providerOutput(response){
 assert.equal(response?.status,'completed');
 const text=response.output_text||response.output
  .flatMap(item=>item.content||[])
  .filter(item=>item.type==='output_text').map(item=>item.text).join('');
 return JSON.parse(text);
}
function readContinuation(dir){
 const read=name=>JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'));
 const summary=read(SUMMARY);
 const archived=read(ARCHIVE);
 assert.equal(summary.sourceRun,SOURCE_RUN);
 assert.equal(summary.status,'stopped-no-retry');
 assert.equal(summary.dispatched,remainingGate.offset);
 assert.deepEqual(summary.stage,PLAN[remainingGate.offset-1]);
 assert.equal(archived.sourceRun,SOURCE_RUN);
 assert.equal(archived.calls.length,remainingGate.offset);
 return archived.calls.map((call,index)=>{
  assert.equal(call.stage,'body');
  assert.deepEqual(call.sections,PLAN[index]);
  assert.equal(call.httpStatus,200);
  return providerOutput(call.response);
 });
}
async function restorePrefix(original,continuation){
 const raw=[original,...continuation];
 const checkpoints=[];
 const stop=Error('restored');
 let used=0;
 await assert.rejects(()=>generate(INPUT,async prompt=>{
  if(used===0)assert.deepEqual(prompt.requestedSections,['saju_core']);
  else checkStage(prompt,used-1);
  if(used===raw.length)throw stop;
  return decode(raw[used++],prompt);
 },()=>{},batch=>{
  assert.deepEqual(batch.ids,used===1?['saju_core']:PLAN[used-2]);
  checkpoints.push(batch);
 },[],OPTIONS),error=>error===stop);
 assert.equal(checkpoints.length,raw.length);
 return checkpoints;
}

function writePrivate(file,data){
 fs.writeFileSync(file,JSON.stringify(data,null,2),{mode:0o600});
}

async function run(dir,continuationDir,gate){
 const env=process.env;
 const marker=JSON.parse(fs.readFileSync(gate.marker,'utf8'));
 authorize(marker,env,args=>execFileSync('git',args,{encoding:'utf8'}).trim(),gate);
 const transport=global.fetch;
 await history(env,transport,gate);
 for(const name of [ARCHIVE,CHECKPOINTS,SUMMARY])assert(!fs.existsSync(name));
 const saved=[],batches=[];
 let dispatched=0,active=null;
 const log=console.error;
 console.error=()=>{};
 global.fetch=async(url,options)=>{
  assert(active&&!active.sent,'no retry or unplanned network call');
  checkTransport(url,options);
  active.sent=true;
  dispatched++;
  const response=await transport(url,options);
  const value=await response.clone().json().catch(()=>null);
  saved.push({stage:active.stage,sections:active.sections,httpStatus:response.status,response:value});
  writePrivate(ARCHIVE,{sourceRun:SOURCE_RUN,calls:saved});
  return response;
 };
 try{
  const continuation=gate.offset?readContinuation(continuationDir):[];
  const checkpoints=await restorePrefix(readArchivedOutput(dir),continuation);
  batches.push(...checkpoints);
  writePrivate(CHECKPOINTS,{sourceRun:SOURCE_RUN,batches});
  const result=await generate(INPUT,async prompt=>{
   checkStage(prompt,gate.offset+dispatched);
   active={stage:prompt.stage,sections:prompt.requestedSections.slice(),sent:false};
   try{
    return await callOpenAI(prompt);
   }finally{active=null;}
  },()=>{},batch=>{
   batches.push(batch);
   writePrivate(CHECKPOINTS,{sourceRun:SOURCE_RUN,batches});
  },checkpoints,OPTIONS);
  writePrivate(SUMMARY,{sourceRun:SOURCE_RUN,dispatched,result,saleApproved:false});
  console.log('REPORT_QA_STATUS='+result.status+'; new_calls='+dispatched+'; first_chapter_reused=true');
  if(result.status!=='ready')process.exitCode=2;
 }catch(error){
  writePrivate(SUMMARY,{sourceRun:SOURCE_RUN,dispatched,stage:dispatched?PLAN[gate.offset+dispatched-1]:null,
   reason:error.message,status:'stopped-no-retry',saleApproved:false});
  console.log('REPORT_QA_STATUS=stopped-no-retry; new_calls='+dispatched);
  process.exitCode=1;
 }finally{
  global.fetch=transport;
  console.error=log;
 }
}
async function preflight(gate){
 const proof=await require('./qa-whole-report-continuation').inspect();
 assert.equal(proof.resumedFirstBatchWithoutAnotherCall,true);
 assert.equal(proof.rejectedFirstBatchStopped,true);
 assert.equal(proof.modelNetworkCalls,0);
 assert.deepEqual([...proof.body.slice(1).map(x=>x.chapters),[]],PLAN);
 assert.equal(proof.maxCalls-1,5);
 const parent='a'.repeat(40),head='b'.repeat(40);
 const env={
  GITHUB_REPOSITORY:REPO,GITHUB_REF:'refs/heads/'+BRANCH,
  GITHUB_WORKFLOW_REF:REPO+'/'+gate.workflow+'@refs/heads/'+BRANCH,
  GITHUB_EVENT_NAME:'push',GITHUB_ACTIONS:'true',GITHUB_RUN_ATTEMPT:'1',GITHUB_RUN_ID:'123',
  GITHUB_SHA:head,NODE_ENV:'test',REPORT_MODEL:MODEL,
  OPENAI_API_KEY:'offline-only-fake-key-used-to-test-authorization',GITHUB_TOKEN:'offline-only'
 };
 const git=cmd=>({
  'rev-parse HEAD^':parent,'rev-parse HEAD':head,'diff --name-only HEAD^ HEAD':gate.marker
 })[cmd.join(' ')];
 const maxNewCalls=PLAN.length-gate.offset;
 const marker={kind:gate.kind,operatorApprovedOneReport:true,
  sourceRun:SOURCE_RUN,sourceRequestSha256:SOURCE_HASH,
  ...(gate.continuationRun?{continuationRun:gate.continuationRun}:{}),
  maxNewCalls,totalOutputTokenLimit:maxNewCalls*MAX_OUTPUT,
  model:MODEL,noRetries:true,noPayment:true,noDeployment:true,parentCommit:parent};
 authorize(marker,env,git,gate);
 assert.throws(()=>authorize({...marker,operatorApprovedOneReport:false},env,git,gate));
 assert.throws(()=>authorize({...marker,sourceRun:'123'},env,git,gate));
 assert.throws(()=>authorize({...marker,maxNewCalls:maxNewCalls+1},env,git,gate));
 assert.throws(()=>authorize(marker,{...env,GITHUB_RUN_ATTEMPT:'2'},git,gate));
 PLAN.forEach((sections,i)=>{
  checkStage({stage:sections.length?'body':'synthesis',requestedSections:sections},i);
 });
 assert.throws(()=>checkStage({stage:'body',requestedSections:['saju_core']},0));
 assert.throws(()=>checkStage({stage:'synthesis',requestedSections:[]},5));
 const url='https://api.openai.com/v1/responses';
 const data={model:MODEL,store:false,max_output_tokens:MAX_OUTPUT};
 const request=(body=data)=>({method:'POST',body:JSON.stringify(body)});
 checkTransport(url,request());
 assert.throws(()=>checkTransport(url,request({...data,store:true})));
 assert.throws(()=>checkTransport(url,request({...data,max_output_tokens:MAX_OUTPUT+1})));
 assert.throws(()=>checkTransport(url,request({...data,padding:'x'.repeat(MAX_REQUEST_BYTES)})));
 if(gate.offset){
  assert.throws(()=>authorize({...marker,continuationRun:'123'},env,git,gate));
  assert.throws(()=>checkStage({stage:'body',requestedSections:['money','career']},gate.offset));
  assert.deepEqual(PLAN.slice(gate.offset),[['relationship'],['year_2027'],[]]);
 }
 console.log(JSON.stringify({sourceRun:SOURCE_RUN,continuationRun:gate.continuationRun,
  plan:PLAN.slice(gate.offset),maxNewCalls,totalOutputTokenLimit:maxNewCalls*MAX_OUTPUT,
  maxRequestBytes:MAX_REQUEST_BYTES,modelCalls:0}));
}
async function verifyPrefix(dir,continuationDir){
 global.fetch=async()=>{throw Error('Offline replay attempted network access');};
 const batches=await restorePrefix(readArchivedOutput(dir),readContinuation(continuationDir));
 console.log(JSON.stringify({restored:batches.flatMap(batch=>batch.ids),next:PLAN[remainingGate.offset],modelCalls:0}));
}

const [mode,dir,continuationDir]=process.argv.slice(2);
const offline=mode==='--preflight'||mode==='--finish-preflight';
const verify=mode==='--verify-prefix';
const paid=mode==='--resume'||mode==='--finish';
const gate=verify||mode?.startsWith('--finish')?remainingGate:originalGate;
const inputsReady=path.isAbsolute(dir||'')&&(!gate.offset||path.isAbsolute(continuationDir||''));
(offline?preflight(gate):verify&&inputsReady?verifyPrefix(dir,continuationDir):
 paid&&inputsReady?run(dir,continuationDir,gate):
 Promise.reject(Error('Explicit mode required'))).catch(error=>{
 console.error(offline?error.stack:'REPORT_QA_BLOCKED_BEFORE_EXECUTION');
 process.exitCode=1;
});
