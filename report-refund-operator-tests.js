'use strict';
// Simulate failed paid orders and two Toss API endpoints; zero real payments.
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const crypto=require('node:crypto');
const {inspect,refund}=require('./report-refund-operator');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'paid-refund-offline-'));
const id='11111111-2222-4333-8444-555555555555';
const jobId='aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const secret='test_gsk_offline_merchant_secret',lookup='test_sk_individual_lookup_secret';
const pkey='opaque-valid-toss-payment-key',amount=9900;
const digest=x=>crypto.createHash('sha256').update(x).digest('hex');
function record(orderId,amount0=amount){
 fs.mkdirSync(path.join(root,'purchases'),{recursive:true});
 const base=path.join(root,'purchases','purchase-'+orderId);
 fs.writeFileSync(base+'.json',JSON.stringify({orderId,
  amount:amount0,currency:'KRW',productId:'saju-mbti-adaptive-report-v1'}));
 fs.writeFileSync(base+'.paid.json',JSON.stringify({orderId,amount:amount0,
  status:'verified-paid',paymentKeyHash:digest(pkey)}));
 fs.writeFileSync(base+'.delivery.json',JSON.stringify({orderId,jobId}));
 fs.writeFileSync(path.join(root,jobId+'.json'),
  JSON.stringify({paidOrderId:orderId,status:'failed'}));
 return base;
}
(async()=>{try{
 const base=record(id);
 let get=0,post=0;
 const transport=async(url,options)=>{
  if(options.method==='GET'){
   get++;
   assert(url.endsWith('/orders/'+id));
   assert.equal(options.headers.authorization,
    'Basic '+Buffer.from(lookup+':').toString('base64'));
   return {ok:true,json:async()=>({orderId:id,status:'DONE',
    paymentKey:pkey,totalAmount:amount,balanceAmount:amount,
    currency:'KRW',cancels:null,method:'카드'})};
  }
  post++;
  assert(url.endsWith(encodeURIComponent(pkey)+'/cancel'));
  assert.match(options.headers['Idempotency-Key'],/^[a-f0-9-]{36}$/);
  assert.deepEqual(JSON.parse(options.body),{cancelReason:'보고서 작성 실패로 전액 환불'});
  return {ok:true,json:async()=>({orderId:id,currency:'KRW',
   totalAmount:amount,balanceAmount:0,
   cancels:[{cancelStatus:'DONE',cancelAmount:amount}]})};
 };
 const opts={storageDir:root,orderId:id,reason:'보고서 작성 실패로 전액 환불',
  lookupSecretKey:lookup,secretKey:secret,transport};
 await assert.rejects(refund(opts),/REFUND_OPERATOR_APPROVAL_REQUIRED/);
 assert.equal(get,0);assert.equal(post,0);
 const out=await refund({...opts,operatorApproved:true});
 assert.equal(out.status,'refund-verified');assert.equal(get,1);assert.equal(post,1);
 assert(fs.existsSync(base+'.refunded.json'));
 await assert.rejects(refund({...opts,operatorApproved:true}),/REFUND_ALREADY_COMPLETE/);
 assert.equal(post,1);
 const wrong='22222222-2222-4333-8444-555555555555';
 record(wrong);
 await assert.rejects(refund({...opts,orderId:wrong,operatorApproved:true,
  transport:async()=>({ok:true,json:async()=>({orderId:wrong,status:'DONE',
   paymentKey:'wrong-payment-key',totalAmount:amount,balanceAmount:amount,
   currency:'KRW',cancels:null})})}),/REFUND_PAYMENT_KEY_OR_AMOUNT_MISMATCH/);
 const uncertain='33333333-2222-4333-8444-555555555555';
 const uncertainBase=record(uncertain);
 let attempted=0;
 const flaky=async(url,options)=>{
  if(options.method==='GET')return {ok:true,json:async()=>({orderId:uncertain,
   status:'DONE',paymentKey:pkey,totalAmount:amount,balanceAmount:amount,
   currency:'KRW',cancels:null,method:'카드'})};
  attempted++;throw Error('SIMULATED_NO_RESPONSE_AFTER_CANCEL_SENT');
 };
 await assert.rejects(refund({...opts,orderId:uncertain,
  operatorApproved:true,transport:flaky}),/SIMULATED_NO_RESPONSE/);
 assert(fs.existsSync(uncertainBase+'.refund-started.json'));
 await assert.rejects(refund({...opts,orderId:uncertain,
  operatorApproved:true,transport:flaky}),/REFUND_ATTEMPT_UNCERTAIN/);
 assert.equal(attempted,1,'ambiguous refund must not be attempted twice');
 const active='44444444-2222-4333-8444-555555555555';
 record(active);
 fs.writeFileSync(path.join(root,jobId+'.json'),
  JSON.stringify({paidOrderId:active,status:'ready'}));
 assert.throws(()=>inspect({storageDir:root,orderId:active}),/REFUND_DELIVERY_NOT_FAILED/);
 console.log('PASS operator-only refund: hash-matched merchant lookup, one-time full cancel, uncertain outcome lock, delivery failure required; zero real provider requests');
 }finally{fs.rmSync(root,{recursive:true,force:true})}
})().catch(e=>{console.error(e);process.exitCode=1});
