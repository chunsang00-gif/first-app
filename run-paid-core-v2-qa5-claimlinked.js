'use strict';
// Dedicated QA5 attempt identity after QA4 run 40704124862 failed BEFORE
// the provider stage. Reuse the tested exact QA4 model request and its
// archive/decoder boundaries; DO NOT silently alter the request hash.
// Workflow may run only after new user consent via owner-initiated exact branch/approval.
const oldRunner=require('./run-paid-core-v2-qa4-claimlinked');
const guard=require('./qa5-claimlinked-dispatch-guard');
const run=()=>oldRunner.run(guard);
const preflight=()=>oldRunner.preflight(guard);
const requireApproval=(env=process.env)=>oldRunner.requireApproval(env,guard);
if(require.main===module)run().catch(e=>{
 console.error('QA5_ONE_ATTEMPT_STOPPED:'+
  String(e?.message||e).replace(/[\r\n]+/g,' ').slice(0,180));
 process.exitCode=1;
});
module.exports={run,preflight,requireApproval,guard,
 REQUEST_HASH:guard.REQUEST_HASH,MODEL:oldRunner.MODEL,
 OUTPUT:oldRunner.OUTPUT};
