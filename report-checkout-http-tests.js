'use strict';
// Entire checkout -> durable owner-bound one-report flow, with NO real
// payment, NO real OpenAI/model network request, and NO live sales flags.
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),http=require('node:http');
const nativeFetch=global.fetch;
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'saju-paid-order-http-'));
const env={REPORT_STORAGE_DIR:dir,PREMIUM_REPORT_PRICE_KRW:'9900',
 PREMIUM_SALES_APPROVED:'true',PREMIUM_EDITORIAL_REVIEW_APPROVED:'true',
 TOSS_SECRET_KEY:'offline-test-secret-not-a-merchant',RENDER:'true',
 REPORT_MODEL_URL:'https://offline-model.invalid/report'};
const prior=Object.fromEntries(Object.keys(env).map(k=>[k,process.env[k]]));
Object.assign(process.env,env);
let chargeAttempts=0,modelAttempts=0;
global.fetch=async(url,opts={})=>{
 const u=String(url);
 if(u==='https://api.tosspayments.com/v1/payments/confirm'){
  chargeAttempts++;
  const p=JSON.parse(opts.body);
  assert(opts.headers.authorization?.startsWith('Basic '));
  return {ok:true,json:async()=>({orderId:p.orderId,paymentKey:p.paymentKey,
   totalAmount:p.amount,balanceAmount:p.amount,currency:'KRW',
   status:'DONE',approvedAt:'2026-10-31T09:00:00+09:00',cancels:null})};
 }
 if(u==='https://offline-model.invalid/report'){
  // Fail before any billable output, proving the paid order stays bound and
  // a second automatic model attempt cannot occur.
  modelAttempts++;
  return {ok:false,status:503};
 }
 return nativeFetch(url,opts);
};
// Keep testing the previously working one-payment/one-report HTTP flow
// with a synthetic fully eligible catalog. This is ONLY require-cache test
// injection into this offline process, not an environment flag that an
// operator could accidentally enable in production.
const realReadiness=require('./report-commercial-readiness');
const actual=realReadiness.assess();
assert.equal(actual.canAcceptNewPayment,false);
assert.equal(actual.targetTopics,35);
assert.equal(actual.definedTopics,28);
assert.equal(actual.structuralUpperBound,22);
assert.equal(actual.minimumShortfall,13);
require.cache[require.resolve('./report-commercial-readiness')].exports={
 assess:()=>({canAcceptNewPayment:true})
};
const server=http.createServer(require('./server').handler);
(async()=>{
 try{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const post=async(endpoint,value,headers={})=>{
   const r=await nativeFetch(base+endpoint,{method:'POST',
    headers:{'content-type':'application/json',...headers},
    body:JSON.stringify(value||{})});
   return {code:r.status,data:await r.json()};
  };
  const request=await post('/api/checkout/start',{});
  assert.equal(request.code,201);
  const {orderId,ownerToken,amount}=request.data;
  assert.match(orderId,/^[a-f0-9-]{36}$/);
  assert.match(ownerToken,/^[a-f0-9]{64}$/);
  assert.equal(amount,9900);
  const wrongAmount=await post('/api/checkout/confirm',{
   orderId,ownerToken,paymentKey:'fake-payment-key',amount:1});
  assert.equal(wrongAmount.code,409);
  assert.equal(chargeAttempts,0);
  const paid=await post('/api/checkout/confirm',{
   orderId,ownerToken,paymentKey:'fake-payment-key',amount});
  assert.equal(paid.code,200);
  assert.equal(paid.data.status,'verified-paid');
  assert.equal(chargeAttempts,1);
  const falseOwner=await post('/api/checkout/status',{
   orderId,ownerToken:'f'.repeat(64)});
  assert.equal(falseOwner.code,403);
  const input={calendar:'solar',birthDate:'1994-07-15',
   birthTime:'14:20',gender:'male',mbti:'ISFP',name:'testing'};
  const invalidOwner=await post('/api/report',{
   purchase:{orderId,ownerToken:'f'.repeat(64)},
   requestId:'test-unauthorized-uuid-01',
   analysisInput:{status:'ready',calculationInput:input}});
  assert.equal(invalidOwner.code,403);
  assert.equal(modelAttempts,0);
  const created=await post('/api/report',{
   purchase:{orderId,ownerToken},
   requestId:'test-paid-report-one-shot-01',
   analysisInput:{status:'ready',calculationInput:input}});
  assert.equal(created.code,202,JSON.stringify(created.data));
  assert.equal(created.data.status,'processing');
  assert.equal(created.data.accessToken,ownerToken,
   'purchase owner token must recover the same delivery job after restart');
  const jobId=created.data.jobId;
  const recover=await post('/api/checkout/status',{orderId,ownerToken});
  assert.equal(recover.code,200);
  assert.equal(recover.data.state,'delivery-bound');
  assert.equal(recover.data.jobId,jobId);
  const status=async token=>{const r=await nativeFetch(base+'/api/report-status?id='+jobId,{
   headers:token?{'x-report-access-token':token}:{}});return {code:r.status,data:await r.json()}};
  const anon=await status(null),wrong=await status('f'.repeat(64));
  assert.equal(anon.code,403);assert.equal(wrong.code,403);
  const replay=await post('/api/report',{
   purchase:{orderId,ownerToken},
   requestId:'test-paid-report-another-attempt-02',
   analysisInput:{status:'ready',calculationInput:input}});
  assert.equal(replay.code,409,'one paid order must never fund another job');
  let final;
  for(let i=0;i<80;i++){
   const r=await status(ownerToken);
   if(r.data.status!=='processing'){final=r;break}
   await new Promise(resolve=>setTimeout(resolve,35));
  }
  assert(final,'an existing customer must retrieve the bound job result');
  assert.equal(final.code,422,'simulated model failure may not claim delivery succeeded');
  assert.equal(final.data.status,'failed');
  assert.equal(modelAttempts,1,'no automatic second billable attempt');
  process.env.PREMIUM_SALES_APPROVED='false';
  const afterClose=await status(ownerToken);
  assert.equal(afterClose.data.status,'failed',
   'previous purchase owner remains authorized after sales are disabled');
  const blockedNew=await post('/api/checkout/start',{});
  assert.equal(blockedNew.code,403);
  const receiptDisk=JSON.stringify(fs.readdirSync(path.join(dir,'purchases'))
   .map(file=>fs.readFileSync(path.join(dir,'purchases',file),'utf8')));
  assert(!receiptDisk.includes(ownerToken),'purchase credential is stored as hash only');
  assert.equal(chargeAttempts,1);
  console.log('PASS offline HTTP checkout with synthetic scope: exact amount, one Toss confirmation, one report entitlement, owner-only recovery, sales-off access, failure without auto recharging; zero external requests');
 }finally{
  await new Promise(resolve=>server.close(resolve));
  global.fetch=nativeFetch;
  for(const [key,value] of Object.entries(prior))
   if(value===undefined)delete process.env[key];else process.env[key]=value;
  fs.rmSync(dir,{recursive:true,force:true});
 }
})().catch(err=>{console.error(err);process.exitCode=1});
