'use strict';
// Real production module, real server routing, synthetic merchant settings.
// No mocked readiness and NO third-party network request is permitted.
// Even accidentally setting both human approval flags cannot sell an
// undeliverable 35-topic product.
const assert=require('node:assert/strict');
const http=require('node:http'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'saju-scope-sales-closed-'));
const keys=['REPORT_STORAGE_DIR','PREMIUM_REPORT_PRICE_KRW',
 'PREMIUM_SALES_APPROVED','PREMIUM_EDITORIAL_REVIEW_APPROVED',
 'TOSS_SECRET_KEY','RENDER','REPORT_MODEL_URL','OPENAI_API_KEY','REPORT_MODEL'];
const previous=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
Object.assign(process.env,{
 REPORT_STORAGE_DIR:dir,PREMIUM_REPORT_PRICE_KRW:'9900',
 PREMIUM_SALES_APPROVED:'true',PREMIUM_EDITORIAL_REVIEW_APPROVED:'true',
 TOSS_SECRET_KEY:'offline-test-secret-not-a-merchant',
 RENDER:'true',REPORT_MODEL_URL:'https://offline-model.invalid/report',
 OPENAI_API_KEY:'offline-not-a-real-key',REPORT_MODEL:'offline-model'
});
const readiness=require('./report-commercial-readiness').assess();
assert.equal(readiness.canAcceptNewPayment,false);
assert.equal(readiness.definedTopics,28);
assert.equal(readiness.structuralUpperBound,23);
assert.equal(readiness.minimumShortfall,12);
const server=http.createServer(require('./server').handler);
const nativeFetch=global.fetch;
global.fetch=async()=>{throw Error('PRODUCTION_GATE_MUST_NOT_CONTACT_PAYMENT_OR_MODEL_PROVIDER')};
(async()=>{
 try{
  await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
  const host='http://127.0.0.1:'+server.address().port;
  const get=(url)=>nativeFetch(host+url).then(async r=>({code:r.status,json:await r.json()}));
  const post=async route=>{
   const r=await nativeFetch(host+route,{method:'POST',
    headers:{'content-type':'application/json'},body:'{}'});
   return {code:r.status,json:await r.json()};
  };
  const health=await get('/api/health');
  assert.equal(health.code,200);
  assert.equal(health.json.premiumSalesReady,false);
  const reserve=await post('/api/checkout/start');
  assert.equal(reserve.code,403);
  assert.equal(reserve.json.code,'PREMIUM_SALES_NOT_APPROVED');
  const confirm=await post('/api/checkout/confirm');
  assert.equal(confirm.code,403);
  assert.equal(confirm.json.code,'PREMIUM_SALES_NOT_APPROVED');
  const purchases=path.join(dir,'purchases');
  assert(!fs.existsSync(purchases)||fs.readdirSync(purchases).length===0,
   'the closed gate must not create even a pending order');
  console.log('PASS real HTTP production checkout stays closed with both sales flags set: canonical writer max 22 vs promised 35; zero payments or model calls');
 }finally{
  await new Promise(ok=>server.close(ok));
  global.fetch=nativeFetch;
  for(const [k,v] of Object.entries(previous))
   if(v===undefined)delete process.env[k];else process.env[k]=v;
  fs.rmSync(dir,{recursive:true,force:true});
 }
})().catch(e=>{console.error(e);process.exitCode=1});
