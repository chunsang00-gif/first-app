'use strict';
// Never run automatically or from a public route. The operator must approve
// one failed paid order. Raw paymentKey is looked up ONLY in memory via
// separately issued Tosspayments individual API secret (test_sk/live_sk).
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const UUID=/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/;
const BASE='https://api.tosspayments.com/v1/payments/';
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const read=f=>{try{return JSON.parse(fs.readFileSync(f,'utf8'))}
 catch(e){if(e.code==='ENOENT')return null;throw e}};
function durableCreate(f,obj){
 const fd=fs.openSync(f,'wx',0o600);
 try{fs.writeFileSync(fd,JSON.stringify(obj));fs.fsyncSync(fd)}
 finally{fs.closeSync(fd)}
 const d=fs.openSync(path.dirname(f),'r');
 try{fs.fsyncSync(d)}finally{fs.closeSync(d)}
}
function inspect({storageDir,orderId}={}){
 if(!path.isAbsolute(storageDir||'')||!UUID.test(orderId||''))
  throw Error('REFUND_ORDER_AND_DURABLE_STORAGE_REQUIRED');
 const base=path.join(storageDir,'purchases','purchase-'+orderId);
 const order=read(base+'.json'),paid=read(base+'.paid.json');
 const bound=read(base+'.delivery.json');
 if(order?.orderId!==orderId||!['saju-mbti-adaptive-report-v1',
    'saju-mbti-premium-report-v1'].includes(order?.productId)||
    order.currency!=='KRW'||!Number.isSafeInteger(order.amount)||
    order.amount<=0||paid?.orderId!==orderId||
    paid.status!=='verified-paid'||paid.amount!==order.amount||
    !/^[a-f0-9]{64}$/.test(paid.paymentKeyHash||''))
  throw Error('REFUND_PAID_ORDER_NOT_VERIFIED');
 if(!UUID.test(bound?.jobId||''))throw Error('REFUND_DELIVERY_JOB_MISSING');
 const job=read(path.join(storageDir,bound.jobId+'.json'));
 if(job?.paidOrderId!==orderId||
    !['failed','rejected'].includes(job.status))
  throw Error('REFUND_DELIVERY_NOT_FAILED_OR_REJECTED');
 return {order,paid,base,alreadyDone:!!read(base+'.refunded.json'),
  attempted:!!read(base+'.refund-started.json')};
}
async function refund({storageDir,orderId,reason,lookupSecretKey,
 secretKey,operatorApproved=false,transport=globalThis.fetch}={}){
 if(operatorApproved!==true)
  throw Error('REFUND_OPERATOR_APPROVAL_REQUIRED');
 if(!/^(test|live)_sk_[A-Za-z0-9_-]{8,}$/.test(lookupSecretKey||'')||
    typeof secretKey!=='string'||secretKey.length<16||
    typeof transport!=='function')
  throw Error('REFUND_REQUIRED_MERCHANT_KEYS_MISSING');
 if(typeof reason!=='string'||reason.length<6||reason.length>200)
  throw Error('REFUND_REASON_REQUIRED');
 const record=inspect({storageDir,orderId});
 if(record.alreadyDone)throw Error('REFUND_ALREADY_COMPLETE');
 if(record.attempted)throw Error('REFUND_ATTEMPT_UNCERTAIN_MANUAL_RECONCILIATION');
 const authorization=s=>'Basic '+Buffer.from(s+':').toString('base64');
 const query=await transport(BASE+'orders/'+orderId,{
  method:'GET',headers:{authorization:authorization(lookupSecretKey)},
  signal:AbortSignal.timeout(15000)
 });
 if(!query?.ok)throw Error('REFUND_ORDER_LOOKUP_FAILED');
 const payment=await query.json();
 if(payment?.orderId!==orderId||payment.status!=='DONE'||
    payment.currency!=='KRW'||payment.totalAmount!==record.order.amount||
    payment.balanceAmount!==record.order.amount||
    (Array.isArray(payment.cancels)&&payment.cancels.length>0)||
    typeof payment.paymentKey!=='string'||
    sha(payment.paymentKey)!==record.paid.paymentKeyHash)
  throw Error('REFUND_PAYMENT_KEY_OR_AMOUNT_MISMATCH');
 if(['가상계좌','VIRTUAL_ACCOUNT'].includes(payment.method))
  throw Error('REFUND_VIRTUAL_ACCOUNT_BANK_DETAILS_REQUIRED');
 const idempotency=crypto.randomUUID();
 durableCreate(record.base+'.refund-started.json',{
  orderId,amount:record.order.amount,startedAt:new Date().toISOString(),
  idempotency,reasonCode:'paid-report-delivery-failure'
 });
 // A crash/timeout here requires manual reconciliation; NEVER reissue
 // a second cancellation request merely because no response arrived.
 const response=await transport(BASE+encodeURIComponent(payment.paymentKey)+'/cancel',{
  method:'POST',
  headers:{authorization:authorization(secretKey),
   'content-type':'application/json','Idempotency-Key':idempotency},
  body:JSON.stringify({cancelReason:reason}),
  signal:AbortSignal.timeout(15000)
 });
 if(!response?.ok)throw Error('REFUND_CANCEL_OUTCOME_UNCERTAIN');
 const canceled=await response.json();
 if(canceled?.orderId!==orderId||canceled.currency!=='KRW'||
    canceled.totalAmount!==record.order.amount||canceled.balanceAmount!==0||
    !Array.isArray(canceled.cancels)||
    !canceled.cancels.some(x=>x.cancelStatus==='DONE'&&
      x.cancelAmount===record.order.amount))
  throw Error('REFUND_RESPONSE_NEEDS_MANUAL_RECONCILIATION');
 durableCreate(record.base+'.refunded.json',{orderId,
  status:'refund-verified',amount:record.order.amount,currency:'KRW',
  verifiedAt:new Date().toISOString()});
 return {orderId,status:'refund-verified',amount:record.order.amount};
}
module.exports={inspect,refund};
if(require.main===module){
 const [command,orderId]=process.argv.slice(2);
 if(command!=='--one-approved-full-refund'||!UUID.test(orderId||'')||
    process.env.PREMIUM_REFUND_OPERATOR_APPROVED!=='true'){
  console.error('REFUND_OPERATOR_APPROVAL_REQUIRED');process.exitCode=2;
 }else refund({storageDir:process.env.REPORT_STORAGE_DIR,orderId,
  reason:'유료 보고서 생성 실패에 따른 결제 전액 취소',
  lookupSecretKey:process.env.TOSS_LOOKUP_SECRET_KEY,
  secretKey:process.env.TOSS_SECRET_KEY,operatorApproved:true})
  .then(x=>console.log(JSON.stringify(x)))
  .catch(e=>{console.error(e.message);process.exitCode=1});
}
