'use strict';
// Entire checkout -> durable owner-bound one-report flow, with NO real
// payment, NO real OpenAI/model network request, and NO live sales flags.
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),http=require('node:http');
const nativeFetch=global.fetch;
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'saju-paid-order-http-'));
const env={REPORT_STORAGE_DIR:dir,PREMIUM_REPORT_PRICE_KRW:'9900',
 PREMIUM_SALES_APPROVED:'true',PREMIUM_EDITORIAL_REVIEW_APPROVED:'true',
 PREMIUM_PRODUCT_MODE:'adaptive-v1',PREMIUM_ADAPTIVE_CONTRACT_APPROVED:'true',
 TOSS_SECRET_KEY:'offline-test-secret-not-a-merchant',
 TOSS_CLIENT_KEY:'test_ck_offline_checkout_123456',
 TOSS_LOOKUP_SECRET_KEY:'test_sk_offline_lookup_123456',RENDER:'true',
 REPORT_MODEL_URL:'https://offline-model.invalid/report'};
const prior=Object.fromEntries(Object.keys(env).map(k=>[k,process.env[k]]));
Object.assign(process.env,env);
let chargeAttempts=0,modelAttempts=0;
global.fetch=async(url,opts={})=>{
 const u=String(url);
 if(u==='https://api.tosspayments.com/v1/payments/confirm'){
  chargeAttempts++;
  const p=JSON.parse(opts.body);
  if(p.paymentKey==='offline-uncertain-test')
   throw Error('OFFLINE_SIMULATED_PROVIDER_RESPONSE_LOST');
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
// Exercise the REAL, existing adaptive product readiness and chart-scoped
// order. All approval flags and payment providers are isolated in THIS
// offline test process. No live deployment or provider request occurs.
const realReadiness=require('./report-commercial-readiness');
const actual=realReadiness.assess();
assert.equal(actual.canAcceptNewPayment,false);
assert.equal(actual.targetTopics,35);
assert.equal(actual.definedTopics,35);
assert.equal(actual.structuralUpperBound,32);
assert.equal(actual.minimumShortfall,3);
assert.equal(realReadiness.assessAdaptive().canPrepareScopeBoundOrder,true);
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
  const input={calendar:'solar',birthDate:'1994-07-15',
   birthTime:'14:20',gender:'male',mbti:'ISFP',name:'testing'};
  const startPayload={analysisInput:{status:'ready',calculationInput:input}};
  const missingOffer=await post('/api/checkout/start',{});
  assert.equal(missingOffer.code,422);
  assert.equal(chargeAttempts,0);
  const liveConfig=await nativeFetch(base+'/api/checkout/config').then(r=>r.json());
  assert.equal(liveConfig.enabled,true);
  assert.equal(liveConfig.clientKey,env.TOSS_CLIENT_KEY);
  assert.equal(liveConfig.amount,9900);
  assert(!JSON.stringify(liveConfig).includes(env.TOSS_SECRET_KEY));
  const request=await post('/api/checkout/start',startPayload);
  assert.equal(request.code,201);
  const {orderId,ownerToken,amount}=request.data;
  assert.match(orderId,/^[a-f0-9-]{36}$/);
  assert.match(ownerToken,/^[a-f0-9]{64}$/);
  assert.equal(amount,9900);
  assert.equal(request.data.productId,'saju-mbti-adaptive-report-v1');
  assert.equal(request.data.scope.productMode,'adaptive-v1');
  assert.equal(request.data.scope.countsAreUpperBounds,true);
  assert.equal(request.data.scope.fixed12ChaptersPromised,false);
  assert.equal(request.data.scope.fixed35TopicsPromised,false);
  assert(request.data.scope.plannedChapters>=8);
  const pending=await post('/api/checkout/status',{orderId,ownerToken});
  assert.equal(pending.code,200);
  assert.equal(pending.data.state,'awaiting-provider-confirmation',
   'owner must see an unconfirmed reserved order without provider approval');
  const pendingImpostor=await post('/api/checkout/status',{
   orderId,ownerToken:'f'.repeat(64)});
  assert.equal(pendingImpostor.code,403,
   'an order ID alone must not disclose pending payment state');
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
  const mismatched=await post('/api/report',{
   purchase:{orderId,ownerToken},requestId:'test-paid-offer-mismatch-01',
   analysisInput:{status:'ready',calculationInput:{...input,birthTime:'20:20'}}});
  assert.equal(mismatched.code,409,'paid offer MUST match birth hour + actual chart');
  assert.equal(mismatched.data.code,'PAYMENT_ORDER_REPORT_SCOPE_MISMATCH');
  assert.equal(modelAttempts,0);
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
  assert.deepEqual(recover.data.scope,request.data.scope);
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
  assert(modelAttempts<=1,
    'no automatic second billable attempt; the evidence gate may reject before a model request');
  // The second buyer pays before new sales are deliberately paused, but
  // chooses to start delivery only after the switch has been turned off.
  const prepaid=await post('/api/checkout/start',startPayload);
  assert.equal(prepaid.code,201);
  const prepaidInfo=prepaid.data;
  const prepaidApproval=await post('/api/checkout/confirm',{
   orderId:prepaidInfo.orderId,ownerToken:prepaidInfo.ownerToken,
   paymentKey:'offline-prepaid-before-pause',amount:prepaidInfo.amount});
  assert.equal(prepaidApproval.code,200);
  assert.equal(chargeAttempts,2);
  process.env.PREMIUM_SALES_APPROVED='false';
  const afterClose=await status(ownerToken);
  assert.equal(afterClose.data.status,'failed',
   'previous purchase owner remains authorized after sales are disabled');
  const blockedNew=await post('/api/checkout/start',{});
  assert.equal(blockedNew.code,403);
  const preSalePaidStatus=await post('/api/checkout/status',{
   orderId:prepaidInfo.orderId,ownerToken:prepaidInfo.ownerToken});
  assert.equal(preSalePaidStatus.code,200);
  assert.equal(preSalePaidStatus.data.state,'verified-paid');
  const pausedSalesMismatch=await post('/api/report',{
   purchase:{orderId:prepaidInfo.orderId,ownerToken:prepaidInfo.ownerToken},
   requestId:'test-paused-sales-wrong-chart-001',
   analysisInput:{status:'ready',calculationInput:{...input,birthTime:'20:20'}}});
  assert.equal(pausedSalesMismatch.code,409);
  assert.equal(pausedSalesMismatch.data.code,'PAYMENT_ORDER_REPORT_SCOPE_MISMATCH');
  const pausedSalesNoOwner=await post('/api/report',{
   purchase:{orderId:prepaidInfo.orderId,ownerToken:'f'.repeat(64)},
   requestId:'test-paused-sales-invalid-owner-01',
   analysisInput:{status:'ready',calculationInput:input}});
  assert.equal(pausedSalesNoOwner.code,403);
  const paidFulfillment=await post('/api/report',{
   purchase:{orderId:prepaidInfo.orderId,ownerToken:prepaidInfo.ownerToken},
   requestId:'test-paid-fulfillment-after-pause',
   analysisInput:{status:'ready',calculationInput:input}});
  assert.equal(paidFulfillment.code,202,
   'closing new checkout must not strand a verified-paid customer');
  assert.equal(paidFulfillment.data.accessToken,prepaidInfo.ownerToken);
  const existingAfterPause=await post('/api/checkout/status',{
   orderId:prepaidInfo.orderId,ownerToken:prepaidInfo.ownerToken});
  assert.equal(existingAfterPause.data.state,'delivery-bound');
  assert.equal(existingAfterPause.data.jobId,paidFulfillment.data.jobId);
  const noSecondJobAfterPause=await post('/api/report',{
   purchase:{orderId:prepaidInfo.orderId,ownerToken:prepaidInfo.ownerToken},
   requestId:'test-paid-fulfillment-after-pause-2',
   analysisInput:{status:'ready',calculationInput:input}});
  assert.equal(noSecondJobAfterPause.code,409,
   'previously paid order still buys only one report after sales stop');
  let fulfillmentOutcome=null;
  for(let i=0;i<80;i++){
   const r=await nativeFetch(base+'/api/report-status?id='+paidFulfillment.data.jobId,{
    headers:{'x-report-access-token':prepaidInfo.ownerToken}});
   const data=await r.json();
   if(data.status!=='processing'){fulfillmentOutcome={code:r.status,data};break}
   await new Promise(resolve=>setTimeout(resolve,35));
  }
  assert(fulfillmentOutcome,'paused-sales paid fulfillment must have a retrievable outcome');
  assert.equal(fulfillmentOutcome.code,422,
   'offline model failure is not a completed report or grounds for another charge');
  assert.equal(fulfillmentOutcome.data.status,'failed');
  assert(modelAttempts<=2,'no automatic provider retry after paused-sales fulfillment');
  // The owner must retain refund/uncertain-state visibility after closing sales.
  const refundFile=path.join(dir,'purchases','purchase-'+orderId+'.refunded.json');
  fs.writeFileSync(refundFile,JSON.stringify({
   orderId,status:'refund-verified',amount}));
  const refunded=await post('/api/checkout/status',{orderId,ownerToken});
  assert.equal(refunded.code,200);
  assert.equal(refunded.data.state,'refunded');
  const refundedDelivery=await status(ownerToken);
  assert.equal(refundedDelivery.code,403,
   'a refunded order must not expose a report even with the right owner token');
  process.env.PREMIUM_SALES_APPROVED='true';
  const uncertainOrder=await post('/api/checkout/start',startPayload);
  assert.equal(uncertainOrder.code,201);
  const uncertainArgs={orderId:uncertainOrder.data.orderId,
   ownerToken:uncertainOrder.data.ownerToken,
   paymentKey:'offline-uncertain-test',amount:9900};
  const uncertainResult=await post('/api/checkout/confirm',uncertainArgs);
  assert.equal(uncertainResult.code,409);
  const uncertainStatus=await post('/api/checkout/status',uncertainArgs);
  assert.equal(uncertainStatus.code,200);
  assert.equal(uncertainStatus.data.state,'confirmation-uncertain');
  const callsBeforeRetry=chargeAttempts;
  const uncertainRepeat=await post('/api/checkout/confirm',uncertainArgs);
  assert.equal(uncertainRepeat.code,409);
  assert.equal(chargeAttempts,callsBeforeRetry,
   'no second provider confirmation after a lost response');
  process.env.PREMIUM_SALES_APPROVED='false';
  const uncertainAfterClose=await post('/api/checkout/status',uncertainArgs);
  assert.equal(uncertainAfterClose.code,200);
  assert.equal(uncertainAfterClose.data.state,'confirmation-uncertain');
  const receiptDisk=JSON.stringify(fs.readdirSync(path.join(dir,'purchases'))
   .map(file=>fs.readFileSync(path.join(dir,'purchases',file),'utf8')));
  assert(!receiptDisk.includes(ownerToken),'purchase credential is stored as hash only');
  assert.equal(chargeAttempts,3);
  console.log('PASS real adaptive offer checkout offline: server-calculated chapters, persisted order scope, changed birth hour rejected before paid model, one charge per order, owner-only recovery, fulfill already-paid order after closing new sales; zero external requests');
 }finally{
  await new Promise(resolve=>server.close(resolve));
  global.fetch=nativeFetch;
  for(const [key,value] of Object.entries(prior))
   if(value===undefined)delete process.env[key];else process.env[key]=value;
  fs.rmSync(dir,{recursive:true,force:true});
 }
})().catch(err=>{console.error(err);process.exitCode=1});
