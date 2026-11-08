'use strict';
// Owner-only checkout status may describe an ALREADY BOUND report job.
// Never reinterpret a failed delivery as unpaid; the existing confirmed
// payment remains a financial obligation until operator reconciliation.
// No model calls, payment calls, refunds or automatic retries are triggered.
const ATTENTION=new Set(['failed','rejected','interrupted','missing','review-required']);
function assess(job,{inActiveMemory=false}={}){
 let status='review-required';
 if(!job)status='missing';
 else if(job.status==='processing')
  status=inActiveMemory?'processing':'interrupted';
 else if(job.status==='failed'||job.status==='rejected')
  status=job.status;
 else if(job.status==='ready'){
  const gate=job.result?.qa?.releaseGate;
  status=gate?.technicalChecks==='passed'&&
   gate?.releaseVerdict==='not-approved'?'ready':'review-required';
 }
 return Object.freeze({
  deliveryStatus:status,
  humanSupportRequired:ATTENTION.has(status),
  automaticRetryAllowed:false,
  // This is not a verified refund and MUST NOT be shown as one.
  refundCompleted:false
 });
}
module.exports={assess};
