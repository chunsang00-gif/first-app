'use strict';
const assert=require('node:assert/strict');
const {assess}=require('./report-paid-delivery-state');
const pending=assess({status:'processing'},{inActiveMemory:true});
assert.equal(pending.deliveryStatus,'processing');
assert.equal(pending.humanSupportRequired,false);
const interrupted=assess({status:'processing'});
assert.equal(interrupted.deliveryStatus,'interrupted');
assert.equal(interrupted.humanSupportRequired,true);
for(const x of ['failed','rejected']){
 const observed=assess({status:x,code:'PRIVATE_ERROR_DETAILS'});
 assert.equal(observed.deliveryStatus,x);
 assert.equal(observed.humanSupportRequired,true);
 assert.equal(observed.automaticRetryAllowed,false);
 assert.equal(observed.refundCompleted,false);
 assert(!JSON.stringify(observed).includes('PRIVATE_ERROR_DETAILS'));
}
assert.equal(assess(null).deliveryStatus,'missing');
assert.equal(assess({status:'ready'}).deliveryStatus,'review-required',
 'no historical ready flag can pretend the technical release gate passed');
assert.equal(assess({status:'ready',result:{qa:{releaseGate:{
 technicalChecks:'passed',releaseVerdict:'not-approved'
}}}}).deliveryStatus,'ready');
assert.equal(assess({status:'ready',result:{qa:{releaseGate:{
 technicalChecks:'passed',releaseVerdict:'approved'
}}}}).deliveryStatus,'review-required');
assert.equal(assess({status:'surprise'}).humanSupportRequired,true);
console.log('PASS paid owner delivery status: failed/rejected/interrupted visible, no order detail leaks, no auto-refund or model retry');
