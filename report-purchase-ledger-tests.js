'use strict';
// Merchant-integration contract test. Completely offline: no HTTP server,
// live Toss credentials, paid AI request, or purchase activation.
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {create,PRODUCT}=require('./report-purchase-ledger');
const toss=require('./report-toss-payment');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'saju-checkout-offline-'));
const secretKey='offline-only-merchant-secret-0123456789';
const key='opaque-payment-key-just-a-test';
let providerCalls=0;
const approved=(orderId,amount)=>({
 paymentKey:key,orderId,totalAmount:amount,balanceAmount:amount,
 currency:'KRW',status:'DONE',approvedAt:'2026-10-30T18:00:00+09:00',cancels:null
});
(async()=>{
 try{
  assert.throws(()=>create({}),/PAYMENT_DURABLE_STORAGE_REQUIRED/);
  let closed=create({dir:root,priceKRW:9900,secretKey});
  assert.throws(()=>closed.reserve(),/PREMIUM_SALES_NOT_APPROVED/,
   'no merchant integration may silently enable real purchases');
  const noPrice=create({dir:root,salesApproved:true,secretKey});
  assert.throws(()=>noPrice.reserve(),/PREMIUM_SALES_NOT_APPROVED/,
   'the browser cannot invent a price for a billable report');
  const falseTransport=async(url,opts)=>{
   providerCalls++;
   assert.equal(url,toss.ENDPOINT);
   assert.equal(opts.method,'POST');
   assert.equal(opts.headers.authorization,
    'Basic '+Buffer.from(secretKey+':').toString('base64'));
   const body=JSON.parse(opts.body);
   assert.equal(body.amount,9900,'merchant uses STORED price, never browser money');
   assert.equal(body.paymentKey,key);
   return {ok:true,json:async()=>approved(body.orderId,body.amount)};
  };
  const ledger=create({dir:root,priceKRW:9900,salesApproved:true,secretKey,
   transport:falseTransport});
  const first=ledger.reserve();
  assert.match(first.orderId,/^[a-f0-9-]{36}$/);
  assert.match(first.ownerToken,/^[a-f0-9]{64}$/);
  assert.equal(first.amount,9900);
  assert.equal(first.productId,PRODUCT);
  assert.equal(ledger.status(first).state,'awaiting-provider-confirmation');
  const file=path.join(root,'purchase-'+first.orderId+'.json');
  const disk=JSON.parse(fs.readFileSync(file,'utf8'));
  assert(!JSON.stringify(disk).includes(first.ownerToken));
  assert.equal(fs.statSync(file).mode&0o777,0o600);
  assert.throws(()=>ledger.status({orderId:first.orderId,ownerToken:'f'.repeat(64)}),
   /PAYMENT_ORDER_OWNER_DENIED/);
  await assert.rejects(ledger.confirm({...first,paymentKey:key,claimedAmount:990}),
   /PAYMENT_REDIRECT_DOES_NOT_MATCH_STORED_ORDER/);
  assert.equal(providerCalls,0,'tampered amount must never reach payment service');
  await assert.rejects(ledger.confirm({...first,ownerToken:'f'.repeat(64),
   paymentKey:key,claimedAmount:9900}),/PAYMENT_ORDER_OWNER_DENIED/);
  assert.equal(providerCalls,0);
  const withoutKey=create({dir:root,priceKRW:9900,salesApproved:true,
   transport:falseTransport});
  await assert.rejects(withoutKey.confirm({...first,paymentKey:key,
   claimedAmount:9900}),/PAYMENT_MERCHANT_NOT_CONFIGURED/);
  assert.equal(providerCalls,0,'missing merchant key must not burn order or call provider');
  const payment=await ledger.confirm({...first,paymentKey:key,claimedAmount:9900});
  assert.deepEqual(payment,{orderId:first.orderId,status:'verified-paid',amount:9900});
  assert.equal(providerCalls,1);
  assert.equal(ledger.status(first).state,'verified-paid');
  assert(!JSON.stringify(ledger.status(first)).includes(first.ownerToken));
  assert(!fs.readFileSync(path.join(root,'purchase-'+first.orderId+'.paid.json'),'utf8')
   .includes(key),'payment key must not be stored as cleartext in local confirmation receipt');
  await assert.rejects(ledger.confirm({...first,paymentKey:key,claimedAmount:9900}),
   /PAYMENT_ALREADY_VERIFIED/);
  assert.equal(providerCalls,1,'confirmed order never repeats a charge');
  assert.throws(()=>ledger.bindDelivery({...first,jobId:'wrong-id'}),
   /PAYMENT_DELIVERY_JOB_INVALID/);
  const jobId='00000000-0000-4000-8000-000000000099';
  assert.deepEqual(ledger.bindDelivery({...first,jobId}),{orderId:first.orderId,jobId});
  assert.equal(ledger.status(first).state,'delivery-bound');
  assert.deepEqual(create({dir:root}).bindDelivery({...first,jobId}),
   {orderId:first.orderId,jobId},'restarted process must keep same delivery');
  assert.throws(()=>ledger.bindDelivery({...first,jobId:'00000000-0000-4000-8000-000000000100'}),
   /PAYMENT_ALREADY_USED_FOR_ANOTHER_REPORT/);
  const uncertain=create({dir:root,priceKRW:9900,salesApproved:true,secretKey,
   transport:async()=>{providerCalls++;throw Error('SIMULATED_NETWORK_LOST_AFTER_SEND')}});
  const second=uncertain.reserve();
  await assert.rejects(uncertain.confirm({...second,paymentKey:'second-pay-key',
   claimedAmount:9900}),/SIMULATED_NETWORK_LOST_AFTER_SEND/);
  assert.equal(uncertain.status(second).state,'confirmation-uncertain');
  assert.throws(()=>uncertain.bindDelivery({...second,jobId}),
   /PAYMENT_DELIVERY_NOT_AUTHORIZED/);
  await assert.rejects(uncertain.confirm({...second,paymentKey:'second-pay-key',
   claimedAmount:9900}),/PAYMENT_CONFIRMATION_ALREADY_ATTEMPTED/);
  assert.equal(providerCalls,2,'uncertain payment is NEVER charged twice automatically');
  const rejection=create({dir:root,priceKRW:9900,salesApproved:true,secretKey,
   transport:async()=>{providerCalls++;return {ok:true,json:async()=>({
    ...approved('bad-order',9900),status:'DONE'})}}});
  const third=rejection.reserve();
  await assert.rejects(rejection.confirm({...third,paymentKey:key,claimedAmount:9900}),
   /PAYMENT_CONFIRMATION_MISMATCH_OR_NOT_PAID/);
  assert.equal(rejection.status(third).state,'confirmation-uncertain');
  assert.throws(()=>rejection.bindDelivery({...third,jobId}),
   /PAYMENT_DELIVERY_NOT_AUTHORIZED/);
  // Even a claimed successful response cannot override a mismatch or refund.
  const badOrder={orderId:first.orderId,amount:9900,productId:PRODUCT,currency:'KRW'};
  for(const p of [
   {...approved(first.orderId,9900),status:'WAITING_FOR_DEPOSIT'},
   {...approved(first.orderId,9900),totalAmount:9901},
   {...approved(first.orderId,9900),balanceAmount:0,cancels:[{}]},
   {...approved(first.orderId,9900),currency:'USD'}
  ]) assert.throws(()=>toss.assertPaid(p,{orderId:badOrder.orderId,amount:9900,paymentKey:key}),
   /PAYMENT_CONFIRMATION_MISMATCH_OR_NOT_PAID/);
  assert.equal(providerCalls,3);
  console.log('PASS offline Toss proof: server-set price, owner verification, one approval/one delivery, uncertain network no retry, refunds blocked; 0 real payments');
 }finally{fs.rmSync(root,{recursive:true,force:true})}
})().catch(e=>{console.error(e);process.exitCode=1});
