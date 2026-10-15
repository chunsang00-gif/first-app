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
  const id=(await created.json()).jobId;
  assert(/^[a-f0-9-]{36}$/.test(id));
  let status;
  for(let i=0;i<60;i++){
   const r=await fetch(srv.origin+'/api/report-status?id='+id);status=await r.json();
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
  const uncertainId=(await secondary.json()).jobId;
  let unknownResult;
  for(let i=0;i<60;i++){
   const t=await fetch(srv.origin+'/api/report-status?id='+uncertainId);
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
   headers:{'content-type':'application/json'},body:JSON.stringify({analysisInput:packet,requestId})});
  assert.equal(retry.status,202);
  const restarted=await fetch(srv.origin+'/api/report-status?id='+id);
  assert.equal(restarted.status,422);
  assert.equal((await restarted.json()).status,'failed');
  assert.equal(mock.calls,2,'restart cannot duplicate the provider request');
  const uncertainRetry=await fetch(srv.origin+'/api/report',{method:'POST',
   headers:{'content-type':'application/json'},
   body:JSON.stringify({analysisInput:packet,requestId:'offline-provider-uncertain-20261016'})});
  assert.equal(uncertainRetry.status,202);
  assert.equal((await uncertainRetry.json()).jobId,uncertainId);
  assert.equal(create(dir).loadProviderCall(uncertainId,1).state,'started');
  assert.equal(mock.calls,2,'unconfirmed provider attempt must not auto-repeat');
  assert.deepEqual(create(dir).loadProviderCall(id,1),first);
  console.log('PASS provider journal: malformed raw saved, ambiguous 503 attempt retained, owner-only files, restart no retry or leak');
 }finally{
  await stop(child);await stop(child2);
  if(mock.listening)await new Promise(r=>mock.close(r));
  fs.rmSync(dir,{recursive:true,force:true});
 }
})().catch(e=>{console.error(e);process.exitCode=1});
