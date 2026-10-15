'use strict';
// Test the REAL one-shot paid QA HTTP route, but replace the outbound model
// request with local in-process fake Responses JSON. Paid API calls: ZERO.
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const http=require('node:http'),net=require('node:net');
const {spawn}=require('node:child_process');
const {create}=require('./report-job-store');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function unusedPort(){const s=net.createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));
 const n=s.address().port;await new Promise(r=>s.close(r));return n}
async function stop(child){if(!child)return;
 if(child.exitCode===null)child.kill('SIGKILL');
 await Promise.race([new Promise(r=>child.once('exit',r)),wait(1000)])}
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'saju-private-paid-qa-'));
 const token='operator-test-secret-keep-private-1234567890';
 const marker=path.join(dir,'used-qa-attempt.json');
 const env={...process.env,RENDER:'true',NODE_ENV:'production',REPORT_QA_ENABLED:'true',
  REPORT_STORAGE_DIR:dir,REPORT_QA_MARKER_FILE:marker,
  REPORT_QA_ADMIN_TOKEN:token,OPENAI_API_KEY:'offline-only-fake-key',REPORT_MODEL:'gpt-4.1'};
 const before=Object.fromEntries(Object.keys(env).map(k=>[k,process.env[k]]));
 const realFetch=global.fetch;
 Object.assign(process.env,env);
 let providerCalls=0;
 global.fetch=(url,opts)=>{
  if(String(url)==='https://api.openai.com/v1/responses'){
   providerCalls++;
   const data=JSON.parse(opts.body);
   assert.equal(data.store,false);
   assert.equal(data.text.format.type,'json_schema');
   return Promise.resolve({ok:true,json:async()=>({output_text:'{"chapters":',usage:{output_tokens:11}})});
  }
  return realFetch(url,opts);
 };
 const handler=require('./server').handler;
 const s=http.createServer(handler);
 let child=null;
 try{
  await new Promise(resolve=>s.listen(0,'127.0.0.1',resolve));
  const origin='http://127.0.0.1:'+s.address().port+'/api/internal/report-qa';
  const forbidden=await realFetch(origin,{headers:{'x-report-qa-token':'wrong'}});
  assert.equal(forbidden.status,403);
  const started=await realFetch(origin,{method:'POST',headers:{'x-report-qa-token':token}});
  assert.equal(started.status,202);
  let result;
  for(let i=0;i<70;i++){
   result=await (await realFetch(origin,{headers:{'x-report-qa-token':token}})).json();
   if(result.status==='failed')break;await wait(80);
  }
  assert.equal(result.status,'failed');
  assert.equal(result.errorCode,'MODEL_INVALID_OUTPUT');
  assert.equal(providerCalls,1,'first failure must halt before second provider call');
  const used=JSON.parse(fs.readFileSync(marker,'utf8'));
  assert(/^[a-f0-9-]{36}$/.test(used.jobId));
  const saved=create(dir).loadProviderCall(used.jobId,1);
  assert.equal(saved.state,'received');
  assert.equal(saved.response.status,'invalid_json');
  assert.equal(saved.response.rawOutput,'{"chapters":');
  assert.equal(fs.statSync(path.join(dir,'provider-'+used.jobId+'-01.json')).mode&0o777,0o600);
  assert.equal(create(dir).load(used.jobId).status,'failed');
  assert(!JSON.stringify(result).includes('{"chapters":'), 'QA status may not disclose raw provider bytes');
  const duplicate=await realFetch(origin,{method:'POST',headers:{'x-report-qa-token':token}});
  assert.equal(duplicate.status,409);
  const childEnv={...env,PORT:String(await unusedPort())};
  child=spawn(process.execPath,['server.js'],{cwd:__dirname,env:childEnv,stdio:'ignore'});
  const host='http://127.0.0.1:'+childEnv.PORT+'/api/internal/report-qa';
  let ready=false;
  for(let i=0;i<70;i++){
   if(child.exitCode!==null)throw Error('restart process exited');
   try{const r=await realFetch(host,{headers:{'x-report-qa-token':token}});
    if(r.status===200){const res=await r.json();if(res.status==='failed'&&res.id===used.jobId&&res.calls===1){ready=true;break}}}
   catch{}
   await wait(80);
  }
  assert(ready,'QA marker and private failed journal must reload after restart');
  const retry=await realFetch(host,{method:'POST',headers:{'x-report-qa-token':token}});
  assert.equal(retry.status,409);
  assert.equal(providerCalls,1);
  console.log('PASS private one-shot QA: provider raw preserved, restart restores failed status, no duplicate API calls, no raw output exposure');
 }finally{
  await stop(child);
  await new Promise(resolve=>s.close(resolve));
  global.fetch=realFetch;
  for(const [k,v] of Object.entries(before))if(v===undefined)delete process.env[k];else process.env[k]=v;
  fs.rmSync(dir,{recursive:true,force:true});
 }
})().catch(e=>{console.error(e);process.exitCode=1});
