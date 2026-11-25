'use strict';
// Separate compact G1 experiment. NO permission inherited from the consumed
// 18,000-token request. Only a newly approved exact marker-only push can run.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process'),assert=require('node:assert/strict');
const compact=require('./qa-launch-g1-compact-writer'),pilot=require('./qa-launch-g1-money-preflight');
const contract=require('./report-server-contract'),archive=require('./report-qa-secure-archive');
const REPO='chunsang00-gif/first-app',BRANCH='fix-paid-qa-fact-bindings-20261014';
const WORKFLOW='.github/workflows/launch-g1-compact-one-approved-push.yml';
const MARKER='qa-approvals/launch-g1-compact-once.json';
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x),'utf8').digest('hex');
const STOP='COMPACT_FIRST_CHAPTER_ONLY_STOP';
async function preflight(){
 const result=await compact.inspect();
 const c=await require('./report-core-paid-full-prompt-capture').capture(pilot.INPUT);
 assert.equal(c.providerCalls,0);
 const candidate=compact.build(c.prompt);
 assert.equal(candidate.request.max_output_tokens,1200);
 assert.equal(result.newRequestBytes,6414);
 const packet={requestSha256:hash(candidate.request),requestBytes:6414,model:pilot.MODEL,outputLimit:1200,
  previousAttemptConsumed:true,paidCalls:0,saleApproved:false};
 await testAuthorization(packet);
 return packet;
}
function approve(marker,expected,env,git){
 assert.deepEqual(marker,{
  kind:'launch-g1-compact-explicit-one-call-v1',operatorApprovedOneBillableCall:true,
  requestSha256:expected.requestSha256,model:pilot.MODEL,noRetries:true,noPayment:true,noDeployment:true,
  parentCommit:git(['rev-parse','HEAD^'])
 });
 assert.equal(env.GITHUB_REPOSITORY,REPO);assert.equal(env.GITHUB_REF,'refs/heads/'+BRANCH);
 assert.equal(env.GITHUB_WORKFLOW_REF,REPO+'/'+WORKFLOW+'@refs/heads/'+BRANCH);
 assert.equal(env.GITHUB_EVENT_NAME,'push');assert.equal(env.GITHUB_ACTIONS,'true');
 assert.equal(env.GITHUB_RUN_ATTEMPT,'1');assert.equal(env.NODE_ENV,'test');
 assert.equal(git(['rev-parse','HEAD']),env.GITHUB_SHA);
 assert.equal(git(['diff','--name-only','HEAD^','HEAD']),MARKER);
 assert.match(env.GITHUB_RUN_ID,/^[1-9][0-9]*$/);
 assert(env.OPENAI_API_KEY?.length>=32&&env.GITHUB_TOKEN?.length>=8);
 assert(!env.REPORT_MODEL_URL&&env.RENDER!=='true');
}
async function history(env,fetcher){
 const u='https://api.github.com/repos/'+REPO+'/actions/workflows/launch-g1-compact-one-approved-push.yml/runs?event=push&branch='+BRANCH+'&per_page=100';
 const r=await fetcher(u,{headers:{authorization:'Bearer '+env.GITHUB_TOKEN,accept:'application/vnd.github+json'}});
 assert(r.ok);const b=await r.json();assert.equal(b.total_count,1);assert.equal(b.workflow_runs.length,1);
 const v=b.workflow_runs[0];
 assert.equal(v.id,Number(env.GITHUB_RUN_ID));assert.equal(v.head_sha,env.GITHUB_SHA);
 assert.equal(v.head_branch,BRANCH);assert.equal(v.run_attempt,1);assert.equal(v.event,'push');assert.equal(v.path,WORKFLOW);
}
// Offline-only authorization regression: real paid marker and history
// are never consulted here. These fake credentials cannot call a provider.
async function testAuthorization(expected){
 const parent='a'.repeat(40),head='b'.repeat(40);
 const marker={kind:'launch-g1-compact-explicit-one-call-v1',operatorApprovedOneBillableCall:true,
  requestSha256:expected.requestSha256,model:pilot.MODEL,noRetries:true,noPayment:true,noDeployment:true,parentCommit:parent};
 const env={GITHUB_REPOSITORY:REPO,GITHUB_REF:'refs/heads/'+BRANCH,
  GITHUB_WORKFLOW_REF:REPO+'/'+WORKFLOW+'@refs/heads/'+BRANCH,GITHUB_EVENT_NAME:'push',
  GITHUB_ACTIONS:'true',GITHUB_RUN_ATTEMPT:'1',NODE_ENV:'test',GITHUB_SHA:head,GITHUB_RUN_ID:'1234',
  OPENAI_API_KEY:'OFFLINE_FAKE_ONLY_NEVER_A_PROVIDER_KEY_123456',GITHUB_TOKEN:'OFFLINE_FAKE_ONLY'};
 const git=a=>({'rev-parse HEAD^':parent,'rev-parse HEAD':head,'diff --name-only HEAD^ HEAD':MARKER})[a.join(' ')];
 approve(marker,expected,env,git);
 for(const change of [{requestSha256:'0'.repeat(64)},{noRetries:false},{operatorApprovedOneBillableCall:false}])
  assert.throws(()=>approve({...marker,...change},expected,env,git));
 assert.throws(()=>approve(marker,expected,{...env,GITHUB_RUN_ATTEMPT:'2'},git));
 assert.throws(()=>approve(marker,expected,{...env,GITHUB_EVENT_NAME:'workflow_dispatch'},git));
 assert.throws(()=>approve(marker,expected,env,a=>a[0]==='diff'?'server.js':git(a)));
 const first={id:1234,head_sha:head,head_branch:BRANCH,run_attempt:1,event:'push',path:WORKFLOW};
 const fake=b=>async()=>({ok:true,json:async()=>b});
 await history(env,fake({total_count:1,workflow_runs:[first]}));
 await assert.rejects(()=>history(env,fake({total_count:2,workflow_runs:[first,first]})));
 await assert.rejects(()=>history(env,fake({total_count:1,workflow_runs:[{...first,run_attempt:2}]})));
}
function save(name,data){
 assert(archive.NAMES.includes(name));fs.writeFileSync(name,JSON.stringify(data,null,2),{flag:'wx',mode:0o600});
}
async function run(){
 const expected=await preflight(),env=process.env;
 const marker=JSON.parse(fs.readFileSync(MARKER,'utf8'));
 approve(marker,expected,env,a=>cp.execFileSync('git',a,{encoding:'utf8'}).trim());
 await history(env,global.fetch);
 for(const n of archive.NAMES)assert(!fs.existsSync(n));
 save('private-qa-first-chapter-attempt.json',{kind:'compact-one-attempt',status:'charge-possible-no-retry',...expected,runId:env.GITHUB_RUN_ID});
 let calls=0,validated=false;
 try{
  await contract.generate(pilot.INPUT,async prompt=>{
   const candidate=compact.build(prompt);
   assert.equal(hash(candidate.request),expected.requestSha256);
   assert.equal(++calls,1);
   const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',
    headers:{'content-type':'application/json',authorization:'Bearer '+env.OPENAI_API_KEY},
    signal:AbortSignal.timeout(180000),body:JSON.stringify(candidate.request)});
   const raw=await response.json();
   save('private-qa-first-chapter-provider-calls.json',{kind:'compact-original-response',request:candidate.request,response:raw});
   if(!response.ok||raw.status!=='completed')throw Error('COMPACT_PROVIDER_NOT_COMPLETED');
   const text=raw.output?.flatMap(x=>x.type==='message'?x.content||[]:[]).filter(x=>x.type==='output_text').map(x=>x.text).join('');
   if(!text)throw Error('COMPACT_PROVIDER_NO_TEXT');
   return compact.assemble(candidate,JSON.parse(text),prompt).decoded;
  },()=>{},async batch=>{
   assert.equal(calls,1);assert.deepEqual(batch.ids,['saju_core']);assert.equal(batch.completedSections,1);
   save('private-qa-first-chapter-validated-first-chapter.json',{kind:'compact-canonical-batch',batch,humanReviewed:false,saleApproved:false});
   validated=true;throw Error(STOP);
  });
  throw Error('COMPACT_UNEXPECTED_CONTINUATION');
 }catch(e){
  if(e.message!==STOP||!validated){
   save('private-qa-first-chapter.json',{status:'stopped-no-retry',calls,validated,saleApproved:false});
   throw Error('COMPACT_ONE_ATTEMPT_STOPPED_NO_RETRY');
  }
 }
 save('private-qa-first-chapter.json',{status:'machine-validated-not-human-reviewed',calls,validated,saleApproved:false});
 console.log('COMPACT_FIRST_CHAPTER_MACHINE_PASS; private original retained; no sale');
}
if(require.main===module){
 const fn=process.argv[2]==='--preflight'?async()=>console.log('COMPACT_APPROVAL_PACKET='+JSON.stringify(await preflight())):run;
 fn().catch(e=>{if(process.argv[2]==='--preflight')console.error('COMPACT_OFFLINE_PREFLIGHT_FAILED:',e.stack);else console.error('COMPACT_EXECUTION_STOPPED');process.exitCode=1});
}
module.exports={preflight,approve,history,hash};
