'use strict';
// Durable pending -> confirming -> verified-paid -> delivery-bound order
// journal. No live checkout route, no charges without explicit merchant setup,
// and no successful-payment inference from a browser redirect.
// Synchronous wx markers are a deliberate fail-closed cross-process lock.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const access=require('./report-job-access');
const toss=require('./report-toss-payment');
const PRODUCT='saju-mbti-premium-report-v1';
const UUID=/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/;
function create({dir,priceKRW,salesApproved=false,secretKey,transport}={}){
 if(!dir||!path.isAbsolute(dir))throw Error('PAYMENT_DURABLE_STORAGE_REQUIRED');
 fs.mkdirSync(dir,{recursive:true,mode:0o700});
 const base=id=>{
  if(!UUID.test(id||''))throw Error('PAYMENT_ORDER_ID_INVALID');
  return path.join(dir,'purchase-'+id);
 };
 function read(file){
  try{return JSON.parse(fs.readFileSync(file,'utf8'))}
  catch(e){if(e.code==='ENOENT')return null;throw e}
 }
 function flush(){const fd=fs.openSync(dir,'r');try{fs.fsyncSync(fd)}finally{fs.closeSync(fd)}}
 function createOnce(file,record){
  const fd=fs.openSync(file,'wx',0o600);
  try{fs.writeFileSync(fd,JSON.stringify(record));fs.fsyncSync(fd)}
  finally{fs.closeSync(fd)}
  flush();
 }
 function authorized(orderId,ownerToken){
  const root=base(orderId),order=read(root+'.json');
  if(!order||!access.valid(ownerToken,order.ownerHash))
   throw Error('PAYMENT_ORDER_OWNER_DENIED');
  if(order.productId!==PRODUCT||order.currency!=='KRW')throw Error('PAYMENT_ORDER_CORRUPTED');
  return {root,order};
 }
 function ensureSalesReady(){
  // Both human/editorial launch approval AND a configured server-side price
  // must be explicitly supplied by a future real checkout integration.
  if(salesApproved!==true||!Number.isSafeInteger(priceKRW)||priceKRW<=0)
   throw Error('PREMIUM_SALES_NOT_APPROVED');
 }
 return {
  reserve(){
   ensureSalesReady();
   const orderId=crypto.randomUUID(),ownerToken=access.issue();
   const order={orderId,productId:PRODUCT,currency:'KRW',amount:priceKRW,
    ownerHash:access.digest(ownerToken),createdAt:new Date().toISOString()};
   createOnce(base(orderId)+'.json',order);
   return {orderId,ownerToken,amount:order.amount,currency:'KRW',productId:PRODUCT};
  },
  status({orderId,ownerToken}){
   const {root,order}=authorized(orderId,ownerToken);
   const paid=read(root+'.paid.json'),started=read(root+'.confirming.json');
   const bound=read(root+'.delivery.json');
   return {orderId,amount:order.amount,currency:order.currency,
    state:paid?(bound?'delivery-bound':'verified-paid'):
     started?'confirmation-uncertain':'awaiting-provider-confirmation',
    jobId:bound?.jobId||null};
  },
  async confirm({orderId,ownerToken,paymentKey,claimedAmount}={}){
   ensureSalesReady();
   const {root,order}=authorized(orderId,ownerToken);
   // Validate all browser-supplied values BEFORE the lock or API request.
   toss.checkOrder(order);
   if(typeof paymentKey!=='string'||paymentKey.length<1||paymentKey.length>200||
      claimedAmount!==order.amount)throw Error('PAYMENT_REDIRECT_DOES_NOT_MATCH_STORED_ORDER');
   if(read(root+'.paid.json'))throw Error('PAYMENT_ALREADY_VERIFIED');
   // The lock remains after a timeout/crash: never retry a potentially
   // successful charge. Operator reconciliation must query Toss separately.
   try{createOnce(root+'.confirming.json',{
    startedAt:new Date().toISOString(),
    paymentKeyHash:crypto.createHash('sha256').update(paymentKey).digest('hex')
   })}catch(e){if(e.code==='EEXIST')throw Error('PAYMENT_CONFIRMATION_ALREADY_ATTEMPTED');throw e}
   const receipt=await toss.confirm({order,paymentKey,
    claimedOrderId:orderId,claimedAmount,secretKey,transport});
   // The previously locked order alone can reach here. Never overwrite a
   // verified receipt, even with the same paymentKey.
   createOnce(root+'.paid.json',receipt);
   return {orderId,status:'verified-paid',amount:order.amount};
  },
  bindDelivery({orderId,ownerToken,jobId}={}){
   const {root}=authorized(orderId,ownerToken);
   if(!UUID.test(jobId||''))throw Error('PAYMENT_DELIVERY_JOB_INVALID');
   const receipt=read(root+'.paid.json');
   if(!receipt||receipt.status!=='verified-paid')
    throw Error('PAYMENT_DELIVERY_NOT_AUTHORIZED');
   const file=root+'.delivery.json';
   const prior=read(file);
   if(prior){
    if(prior.jobId!==jobId)throw Error('PAYMENT_ALREADY_USED_FOR_ANOTHER_REPORT');
    return {jobId,orderId};
   }
   try{createOnce(file,{jobId,orderId,createdAt:new Date().toISOString()})}
   catch(e){if(e.code!=='EEXIST')throw e;
    const competing=read(file);
    if(competing?.jobId!==jobId)throw Error('PAYMENT_ALREADY_USED_FOR_ANOTHER_REPORT');
   }
   return {jobId,orderId};
  }
 };
}
module.exports={create,PRODUCT};
