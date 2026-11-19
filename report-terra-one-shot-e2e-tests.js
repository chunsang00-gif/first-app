'use strict';
// Simulates the final first-chapter run and evidence encryption with local
// fakes only. This file never contacts OpenAI or authorizes a paid request.
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const crypto=require('node:crypto');
const contract=require('./report-server-contract');
const server=require('./server');
const readiness=require('./qa-current-core-preflight');
const archive=require('./report-qa-secure-archive');
const oldGenerate=contract.generate,oldCall=server.callOpenAI;
const originalFetch=global.fetch;
const keys=['GITHUB_ACTIONS','GITHUB_REPOSITORY','GITHUB_REF_NAME',
 'GITHUB_WORKFLOW_REF','GITHUB_SHA','GITHUB_RUN_ID','GITHUB_RUN_ATTEMPT',
 'GITHUB_TOKEN','REPORT_MODEL','OPENAI_API_KEY','REPORT_MODEL_URL',
 'REPORT_QA_CONFIRM','REPORT_QA_OUTPUT','NODE_ENV',
 'REPORT_QA_ARCHIVE_KEY','PAID_CORE_DEPTH_V2','QA_NATAL_DEPTH_PREVIEW',
 'PAID_CORE_V2_CLASSICAL_WRITER','PAID_CORE_V2_CLAIM_LINKS','RENDER'];
const original=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
let scenario='success',modelCalls=0,githubReads=0;
const repo='chunsang00-gif/first-app';
const branch='fix-paid-qa-fact-bindings-20261014';
const CHAPTER={id:'saju_core',title:'출생월의 두 계산 출처',
 keyJudgment:'출생월의 전통 분류 둘을 구별하여 한 가지 풀이를 합니다.',
 bodyTopics:['strength'],bodyLabels:['구체적 강점'],
 body:['출생월의 중심 분류와 겉글자에 드러난 다른 분류를 구별해서 설명합니다.'],
 evidence:['월간과 월지 주기 출처 비교']};
const workflow='.github/workflows/terra-first-chapter-qa.yml';
function checkedFiles(dir,expected){
 const found=archive.NAMES.filter(n=>fs.existsSync(path.join(dir,n)));
 assert.deepEqual(found,expected);
 return found;
}
(async()=>{
 // Inject local doubles BEFORE loading the one-shot module, which captures
 // its callOpenAI reference at module initialization.
 server.callOpenAI=async(_prompt,onResponse)=>{
  modelCalls++;
  if(scenario==='provider-failure')throw Error('FAKE_PROVIDER_UNAVAILABLE');
  // Match the real server boundary: onProviderResponse receives the parsed
  // strict JSON VALUE, not the outer Responses API HTTP envelope.
  const response={chapters:{saju_core:{
   title:CHAPTER.title,keyJudgment:CHAPTER.keyJudgment,
   paragraphs:{strength:{label:CHAPTER.bodyLabels[0],text:CHAPTER.body[0]}}
  }},cover:null,finalJudgment:null};
  await onResponse(response,{model:'gpt-6.1-terra',
   usage:{input_tokens:123,output_tokens:456}});
  return response;
 };
 contract.generate=async(_sample,call,_onProgress,onBatch)=>{
  // Preflight captures the real request through the two-argument generator.
  // Mock only the four-argument runner call, never its nested preflight.
  if(typeof onBatch!=='function')
   return oldGenerate(_sample,call,_onProgress,onBatch);
  const {prompt}=await readiness.prepare({includePrompt:true});
  await call(prompt);
  if(scenario==='second-batch')await call(prompt);
  else await onBatch({ids:['saju_core'],completedSections:1,
   sections:[structuredClone(CHAPTER)]});
 };
 delete require.cache[require.resolve('./qa-terra-first-chapter-one-shot')];
 const qa=require('./qa-terra-first-chapter-one-shot');
 assert.equal(qa.MODEL,'gpt-6.1-terra');
 for(const [i,mode] of ['success','provider-failure','second-batch'].entries()){
  scenario=mode;modelCalls=0;githubReads=0;
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'saju-terra-e2e-'));
  try{
   const sha=crypto.createHash('sha1').update('synthetic-'+i).digest('hex');
   const runId=44990000001+i;
   const vars={
    GITHUB_ACTIONS:'true',GITHUB_REPOSITORY:repo,
    GITHUB_REF_NAME:branch,
    GITHUB_WORKFLOW_REF:repo+'/'+workflow+'@refs/heads/'+branch,
    GITHUB_SHA:sha,GITHUB_RUN_ID:String(runId),GITHUB_RUN_ATTEMPT:'1',
    GITHUB_TOKEN:'fake-gh-token-123456',
    REPORT_MODEL:'gpt-6.1-terra',OPENAI_API_KEY:'FAKE_LOCAL_NO_CREDENTIAL_123456789012345',
    REPORT_QA_CONFIRM:qa.APPROVAL_PREFIX+sha,
    REPORT_QA_OUTPUT:path.join(dir,'private-qa-first-chapter.json'),
    NODE_ENV:'test'
   };
   for(const k of keys)delete process.env[k];
   Object.assign(process.env,vars);
   global.fetch=async url=>{
    assert.equal(String(url),
     'https://api.github.com/repos/'+repo+
     '/actions/workflows/terra-first-chapter-qa.yml/runs?event=workflow_dispatch&branch='+branch+'&per_page=100');
    githubReads++;
    return {ok:true,json:async()=>({total_count:1,workflow_runs:[{
     id:runId,path:workflow,event:'workflow_dispatch',head_branch:branch,
     head_sha:sha,run_attempt:1}]})};
   };
   if(mode==='success')await qa.run();
   else await assert.rejects(qa.run(),/TERRA_ONE_CALL_STOPPED_NO_RETRY/);
   assert.equal(githubReads,1,'only the local mocked workflow history may be read');
   assert.equal(modelCalls,1,'a failure or duplicate batch may never call twice');
   const summary=JSON.parse(fs.readFileSync(vars.REPORT_QA_OUTPUT,'utf8'));
   assert.equal(summary.releaseVerdict,'not-approved');
   const names=mode==='success'?
    ['private-qa-first-chapter.json','private-qa-first-chapter-attempt.json',
     'private-qa-first-chapter-provider-calls.json',
     'private-qa-first-chapter-validated-first-chapter.json']:
    mode==='provider-failure'?
    ['private-qa-first-chapter.json','private-qa-first-chapter-attempt.json']:
    ['private-qa-first-chapter.json','private-qa-first-chapter-attempt.json',
     'private-qa-first-chapter-provider-calls.json'];
   checkedFiles(dir,names);
   assert.equal(summary.status,mode==='success'?
    'first-chapter-machine-validated':'stopped-no-retry');
   if(mode==='success'){
    const provider=JSON.parse(fs.readFileSync(path.join(dir,names[2]),'utf8'));
    assert.deepEqual(provider.usage,{input_tokens:123,output_tokens:456});
    assert.equal(provider.requestHash,qa.FROZEN_REQUEST_SHA256);
    assert.deepEqual(provider.response.chapters.saju_core.paragraphs.strength.text,
     CHAPTER.body[0],'the archived response must be actual parsed provider JSON');
    assert.equal(provider.response.status,undefined,
     'successful server callback must not be mocked as an HTTP status envelope');
    // Even with the exact same local approval, persisted evidence prohibits
    // reusing the run folder; a second provider call must not happen.
    await assert.rejects(qa.run(),/TERRA_ONE_CALL_DENIED:old-attempt/);
    assert.equal(modelCalls,1);
   }
   assert.equal(archive.encrypt(dir),true);
   const encrypted=fs.readFileSync(path.join(dir,archive.ARCHIVE));
   assert(!encrypted.includes(Buffer.from('FAKE_LOCAL_NO_CREDENTIAL')),
    'the encrypted artifact must not contain the mock passphrase');
   assert(!encrypted.includes(Buffer.from('input_tokens')),
    'raw usage and provider response must not appear in the artifact');
   const restored=path.join(dir,'restored');
   assert.deepEqual(archive.decrypt(path.join(dir,archive.ARCHIVE),restored),names);
   for(const name of names)assert.deepEqual(
    fs.readFileSync(path.join(restored,name)),fs.readFileSync(path.join(dir,name)));
   if(mode==='success'){
    const reviewed=require('./qa-terra-first-chapter-human-review')
     .build(require('./qa-terra-first-chapter-human-review').readPrivate(restored));
    assert.equal(reviewed.paid.paragraphs[0].text,CHAPTER.body[0],
     'encrypted saved provider value must survive through offline human review');
    assert.equal(reviewed.releaseVerdict,'not-approved');
   }
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
 }
 console.log('PASS Terra local one-shot pipeline: success, provider failure, second-batch guard, no retry, encrypted private evidence; provider calls=0 (all mocks)');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{
 contract.generate=oldGenerate;server.callOpenAI=oldCall;global.fetch=originalFetch;
 for(const k of keys){if(original[k]===undefined)delete process.env[k];
  else process.env[k]=original[k];}
 delete require.cache[require.resolve('./qa-terra-first-chapter-one-shot')];
});
