'use strict';
// Server-to-server payment authorization candidate: Toss Payments.
// This module is NOT wired to public routes. A browser redirect, paymentKey,
// or success-page URL is never proof of payment. The operator must select a
// merchant, product price and complete the separate human quality gate first.
//
// Reference: https://docs.tosspayments.com/reference#결제-승인
const ENDPOINT='https://api.tosspayments.com/v1/payments/confirm';
const ORDER_ID=/^[A-Za-z0-9_=-]{6,64}$/;
function checkOrder(order){
 if(!order||!ORDER_ID.test(order.orderId||'')||
    !Number.isSafeInteger(order.amount)||order.amount<=0||
    order.currency!=='KRW'||order.productId!=='saju-mbti-premium-report-v1')
  throw Error('PAYMENT_ORDER_NOT_SERVER_VERIFIED');
}
function assertPaid(payment,{orderId,amount,paymentKey}){
 if(!payment||payment.orderId!==orderId||
    payment.paymentKey!==paymentKey||
    payment.status!=='DONE'||payment.currency!=='KRW'||
    payment.totalAmount!==amount||
    payment.balanceAmount!==amount||
    (Array.isArray(payment.cancels)&&payment.cancels.length!==0))
  throw Error('PAYMENT_CONFIRMATION_MISMATCH_OR_NOT_PAID');
 return Object.freeze({
  provider:'toss-payments',orderId,amount,currency:'KRW',
  paymentKeyHash:require('node:crypto').createHash('sha256')
   .update(paymentKey,'utf8').digest('hex'),
  approvedAt:typeof payment.approvedAt==='string'?payment.approvedAt:null,
  status:'verified-paid'
 });
}
async function confirm({order,paymentKey,claimedOrderId,claimedAmount,secretKey,transport=globalThis.fetch}={}){
 checkOrder(order);
 if(typeof paymentKey!=='string'||paymentKey.length<1||paymentKey.length>200||
    typeof claimedOrderId!=='string'||claimedOrderId!==order.orderId||
    claimedAmount!==order.amount)
  throw Error('PAYMENT_REDIRECT_DOES_NOT_MATCH_STORED_ORDER');
 if(typeof secretKey!=='string'||secretKey.length<16||
    typeof transport!=='function')throw Error('PAYMENT_MERCHANT_NOT_CONFIGURED');
 const response=await transport(ENDPOINT,{
  method:'POST',
  headers:{authorization:'Basic '+Buffer.from(secretKey+':','utf8').toString('base64'),
   'content-type':'application/json'},
  body:JSON.stringify({paymentKey,orderId:order.orderId,amount:order.amount}),
  signal:AbortSignal.timeout(15000)
 });
 if(!response?.ok)throw Error('PAYMENT_PROVIDER_CONFIRMATION_UNCERTAIN');
 let data;try{data=await response.json()}catch{
  throw Error('PAYMENT_PROVIDER_RESPONSE_INVALID')}
 return assertPaid(data,{orderId:order.orderId,amount:order.amount,paymentKey});
}
module.exports={confirm,assertPaid,checkOrder,ENDPOINT};
