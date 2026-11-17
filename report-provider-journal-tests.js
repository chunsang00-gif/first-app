'use strict';
// Prove private paid-response journal survives a server restart, with a
// local invalid JSON provider and zero actual paid API requests.
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const http=require('node:http'),net=require('node:net');
const {spawn}=require('node:child_process');
const {create}=require('./report-job-store');
const input={calendar:'solar',birthDate:'1990-06-15',birthTime:'12:00',
 birthplace:'서울',gender:'male',mbti:'INFP',name:'offline check'};
const requestId='offline-provider-attempt-20261016';
const wait=t=>new Promise(r=>setTimeout(r,t));
async function port(){const x=net.createServer();
 await new Promise(r=>x.listen(0,'127.0.0.1',r));
 const p=x.address().port;await new Promise(r=>x.close(r));return p;
}
async function launch(env){
 const child=spawn(process.execPath,['server.js'],{cwd:__dirname,env,stdio:['ignore','ignore','pipe']});
 let err='';child.stderr.on('data',v=>{err+=String(v).slice(0,1500)});
 const origin='http://127.0.0.1:'+env.PORT;
 for(let i=0;i<60;i++){
  if(child.exitCode!==null)throw Error('server crashed before start: '+err);
  try{if((await fetch(origin+'/api/health')).ok)return {child,origin}}catch{}
  await wait(85);
 }
 child.kill('SIGKILL');throw Error('server not ready: '+err);
}
async function stop(child){if(!child)return;
 if(child.exitCode===null)child.kill('SIGKILL');
 await Promise.race([new Promise(r=>child.once('exit',r)),wait(800)]);
}
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'saju-private-provider-'));
 const mock=http.createServer((req,res)=>{mock.calls++;
  if(mock.unconfirmed){res.writeHead(503);res.end('provider unavailable');return}
  res.writeHead(200,{'content-type':'application/json'});res.end('{"chapters":')});
 mock.calls=0;let child=null,child2=null;
 try{
  await new Promise(r=>mock.listen(0,'127.0.0.1',r));
  const env={...process.env,PORT:String(await port()),NODE_ENV:'test',RENDER:'false',
   REPORT_STORAGE_DIR:dir,REPORT_MODEL_URL:'http://127.0.0.1:'+mock.address().port+'/report'};
  let srv=await launch(env);child=srv.child;
  const packet=require('./report-facts-node').build(input,2027);
  assert.equal(packet.status,'ready');
  const created=await fetch(srv.origin+'/api/report',{method:'POST',
   headers:{'content-type':'application/json'},
   body:JSON.stringify({analysisInput:packet,requestId})});
  assert.equal(created.status,202);
  const createdJob=await created.json();
  const id=createdJob.jobId,accessToken=createdJob.accessToken;
  assert(/^[a-f0-9-]{36}$/.test(id));
  assert.match(accessToken,/^[a-f0-9]{64}$/);
  let status;
  for(let i=0;i<60;i++){
   const r=await fetch(srv.origin+'/api/report-status?id='+id,{headers:{'x-report-access-token':accessToken}});status=await r.json();
   if(status.status==='failed')break;await wait(100);
  }
  assert.equal(status.status,'failed');
  assert.equal(status.code,'MODEL_INVALID_OUTPUT');
  assert.equal(mock.calls,1,'no automatic provider retry');
  const first=create(dir).loadProviderCall(id,1);
  assert.equal(first.state,'received');
  assert.equal(first.response.status,'invalid_json');
  assert.equal(first.response.rawOutput,'{"chapters":');
  assert.equal(first.requestedSections[0],'saju_core');
  assert.equal(fs.statSync(path.join(dir,'provider-'+id+'-01.json')).mode&0o777,0o600);
  assert(!JSON.stringify(status).includes('{"chapters":'),'raw private content cannot appear in API result');
  assert.throws(()=>create(dir).startProviderCall(id,1,{
   stage:'body',requestedSections:['saju_core'],identity:first.identity}),/EEXIST/);
  assert.throws(()=>create(dir).saveProviderResponse(id,1,{status:'overwritten'}),/cannot overwrite/);
  // Server/provider failure is ambiguous: never invent a received response.
  mock.unconfirmed=true;
  const unknownRequest='offline-provider-uncertain-20261016';
  const secondary=await fetch(srv.origin+'/api/report',{method:'POST',
   headers:{'content-type':'application/json'},
   body:JSON.stringify({analysisInput:packet,requestId:unknownRequest})});
  assert.equal(secondary.status,202);
  const secondaryJob=await secondary.json();
  const uncertainId=secondaryJob.jobId,uncertainToken=secondaryJob.accessToken;
  let unknownResult;
  for(let i=0;i<60;i++){
   const t=await fetch(srv.origin+'/api/report-status?id='+uncertainId,{headers:{'x-report-access-token':uncertainToken}});
   unknownResult=await t.json();
   if(unknownResult.status==='failed')break;
   await wait(90);
  }
  assert.equal(unknownResult.status,'failed');
  assert.equal(create(dir).loadProviderCall(uncertainId,1).state,'started',
   '503/unknown completion must remain ambiguous, not be marked received');
  assert.equal(mock.calls,2);
  
  await stop(child);child=null;
  env.PORT=String(await port());srv=await launch(env);child2=srv.child;
  const retry=await fetch(srv.origin+'/api/report',{method:'POST',
   headers:{'content-type':'application/json','x-report-access-token':accessToken},body:JSON.stringify({analysisInput:packet,requestId})});
  assert.equal(retry.status,202);
  const anonymous=await fetch(srv.origin+'/api/report-status?id='+id);
  assert.equal(anonymous.status,403,'restart must not expose old paid content by id');
  const restarted=await fetch(srv.origin+'/api/report-status?id='+id,{headers:{'x-report-access-token':accessToken}});
  assert.equal(restarted.status,422);
  assert.equal((await restarted.json()).status,'failed');
  assert.equal(mock.calls,2,'restart cannot duplicate the provider request');
  const uncertainRetry=await fetch(srv.origin+'/api/report',{method:'POST',
   headers:{'content-type':'application/json','x-report-access-token':uncertainToken},
   body:JSON.stringify({analysisInput:packet,requestId:'offline-provider-uncertain-20261016'})});
  assert.equal(uncertainRetry.status,202);
  assert.equal((await uncertainRetry.json()).jobId,uncertainId);
  assert.equal(create(dir).loadProviderCall(uncertainId,1).state,'started');
  assert.equal(mock.calls,2,'unconfirmed provider attempt must not auto-repeat');
  assert.deepEqual(create(dir).loadProviderCall(id,1),first);
  // Real paid stages must retain PRIVATE provider token usage on every
  // received response, including an incomplete paid call. Unknown or
  // still-started attempts must never be counted as free usage.
  const storage=create(dir),receiptId=require('node:crypto').randomUUID();
  const meta={identity:first.identity};
  storage.startProviderCall(receiptId,1,{...meta,stage:'body',requestedSections:['saju_core']});
  storage.saveProviderResponse(receiptId,1,{chapters:{}},{
   model:'gpt-4.1',usage:{input_tokens:1200,output_tokens:340,
    input_tokens_details:{cached_tokens:200}}});
  assert.deepEqual(storage.loadProviderCall(receiptId,1).receipt,{
   model:'gpt-4.1',inputTokens:1200,outputTokens:340,cachedInputTokens:200});
  storage.startProviderCall(receiptId,2,{...meta,stage:'body',requestedSections:['career']});
  storage.saveProviderResponse(receiptId,2,{status:'incomplete',
   usage:{input_tokens:580,output_tokens:180}});
  storage.startProviderCall(receiptId,3,{...meta,stage:'synthesis',requestedSections:[]});
  assert.deepEqual(storage.providerUsageSummary(receiptId),{
   attemptedCalls:3,receivedCalls:2,usageRecordedCalls:2,
   unknownUsageCalls:1,inputTokens:1780,outputTokens:520,
   cachedInputTokens:200,cachedUsageCalls:1,complete:false});
  assert.deepEqual(create(dir).providerUsageSummary(receiptId),
   storage.providerUsageSummary(receiptId),
   'private usage receipts must survive restart without any new model attempt');
  assert.equal(storage.loadProviderCall(receiptId,3).state,'started',
   'an unknown billable attempt must retain its preflight marker');
  const unknownReceiptId=require('node:crypto').randomUUID();
  storage.startProviderCall(unknownReceiptId,1,{
   ...meta,stage:'body',requestedSections:['saju_core']});
  storage.saveProviderResponse(unknownReceiptId,1,{chapters:{}});
  assert.equal(storage.providerUsageSummary(unknownReceiptId).unknownUsageCalls,1,
   'a response without usage metadata is not a confirmed zero-dollar call');
  assert.equal(storage.providerUsageSummary(unknownReceiptId).complete,false);
  const validId=require('node:crypto').randomUUID();
  storage.startProviderCall(validId,1,{...meta,stage:'body',requestedSections:['saju_core']});
  storage.saveProviderResponse(validId,1,{chapters:{}},{
   model:'gpt-4.1',usage:{input_tokens:10,output_tokens:20}});
  assert.equal(storage.providerUsageSummary(validId).complete,true,
   'all known receipts can be summed without guessing missing usage');
  console.log('PASS provider journal: malformed raw saved, ambiguous 503 attempt retained, owner-only files, restart no retry or leak');
 }finally{
  await stop(child);await stop(child2);
  if(mock.listening)await new Promise(r=>mock.close(r));
  fs.rmSync(dir,{recursive:true,force:true});
 }
})().catch(e=>{console.error(e);process.exitCode=1});
