'use strict';
// Simulate an app restart with a persisted processing job and verified
// report batches. No OpenAI key, no purchases and NO provider calls.
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const http=require('node:http'),net=require('node:net');
const crypto=require('node:crypto'),{spawn}=require('node:child_process');
const {create}=require('./report-job-store');
const check=require('./report-checkpoint-identity');
const input={calendar:'solar',birthDate:'1990-06-15',birthTime:'12:00',
 gender:'male',mbti:'INFP',name:'offline-check'};
const requestId='restart-validated-job-20261016';
const jobId='00000000-0000-4000-8000-000000000049';
const batch={ids:['saju_core'],sections:[{id:'saju_core',title:'offline',
  keyJudgment:'offline',body:['offline'],bodyTopics:['temperament'],
  bodyLabels:['offline'],evidence:['offline']}],completedSections:1};
const fingerprint=crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
const listen=s=>new Promise(resolve=>s.listen(0,'127.0.0.1',resolve));
const close=s=>new Promise(resolve=>s.close(resolve));
async function unusedPort(){
 const socket=net.createServer();await listen(socket);
 const p=socket.address().port;await close(socket);return p;
}
const wait=t=>new Promise(resolve=>setTimeout(resolve,t));
(async()=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'saju-restart-check-'));
 const provider=http.createServer((req,res)=>{provider.calls++;
  res.writeHead(500);res.end('unexpected provider call')});
 provider.calls=0;
 let child=null;
 try{
  await listen(provider);
  const modelUrl='http://127.0.0.1:'+provider.address().port+'/report';
  const env={...process.env,PORT:String(await unusedPort()),
   REPORT_STORAGE_DIR:directory,REPORT_MODEL_URL:modelUrl,REPORT_MODEL:'mock-restart',
   RENDER:'false',NODE_ENV:'test'};
  const store=create(directory);
  const accessToken='c'.repeat(64);
  const accessHash=require('./report-job-access').digest(accessToken);
  store.save(jobId,{status:'processing',createdAt:Date.now()-5000,startedAt:Date.now()-5000,accessHash});
  assert.equal(store.load(jobId).accessHash,accessHash);
  assert(!JSON.stringify(store.load(jobId)).includes(accessToken),
   'durable state must never store the unencrypted user access token');
  store.saveRequest(requestId,{id:jobId,fingerprint});
  const identity=check.signature(input,env);
  store.saveCheckpoint(jobId,{identity,batches:[batch]});
  assert.equal(check.resumeBatches(create(directory),jobId,input,env).length,1);
  assert.throws(()=>check.resumeBatches(create(directory),jobId,input,
    {...env,REPORT_MODEL_URL:modelUrl+'/changed'}),/contract changed/);
  assert.throws(()=>store.saveCheckpoint(jobId,{identity,batches:[batch]}),/overwrite, gap/);
  assert.throws(()=>store.saveCheckpoint(jobId,{identity:'f'.repeat(64),batches:[batch,batch]}),/duplicate chapter|overwrite, gap/);
  assert.equal(store.loadCheckpoint('../server.js'),null);
  assert.equal(fs.statSync(path.join(directory,'checkpoint-'+jobId+'.json')).mode&0o777,0o600);
  let stderr='';
  child=spawn(process.execPath,['server.js'],{cwd:__dirname,env,stdio:['ignore','ignore','pipe']});
  child.stderr.on('data',chunk=>{stderr+=chunk.toString().slice(0,1024)});
  const origin='http://127.0.0.1:'+env.PORT;
  let connected=false;
  for(let n=0;n<70;n++){
   if(child.exitCode!==null)throw Error('Server exited before restart verification: '+stderr);
   try{const h=await fetch(origin+'/api/health');
    if(h.ok){connected=true;break}}catch{}
   await wait(100);
  }
  assert(connected,'offline restart server never became ready');
  const unauthorized=await fetch(origin+'/api/report-status?id='+jobId);
  assert.equal(unauthorized.status,403,'a saved job id cannot reveal results after restart');
  const status=await fetch(origin+'/api/report-status?id='+jobId,{
   headers:{'x-report-access-token':accessToken}});
  assert.equal(status.status,503);
  const stale=await status.json();
  assert.equal(stale.code,'REPORT_INTERRUPTED');
  assert.equal(stale.validatedBatches,1);
  const retry=await fetch(origin+'/api/report',{method:'POST',
   headers:{'content-type':'application/json','x-report-access-token':accessToken},
   body:JSON.stringify({requestId,analysisInput:{status:'ready',calculationInput:input}})});
  assert.equal(retry.status,409,'same request must NOT be advertised as processing');
  const refused=await retry.json();
  assert.equal(refused.code,'REPORT_INTERRUPTED');
  assert.equal(refused.validatedBatches,1);
  assert.equal(refused.jobId,jobId);
  assert.equal(provider.calls,0,'restart must NEVER trigger a provider call or auto-resume');
  assert.deepEqual(create(directory).loadCheckpoint(jobId).batches,[batch]);
  console.log('PASS restart: private checkpoint survives, stale job returns interrupted rather than processing, zero provider calls, identity mismatch blocked');
 }finally{
  if(child){
   if(child.exitCode===null)child.kill('SIGKILL');
   await Promise.race([new Promise(resolve=>child.once('exit',resolve)),wait(800)]);
  }
  if(provider.listening)await close(provider);
  fs.rmSync(directory,{recursive:true,force:true});
 }
})().catch(e=>{console.error(e);process.exitCode=1});
