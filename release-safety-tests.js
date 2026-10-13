'use strict';
const assert=require('node:assert/strict');
const {resolvePublic}=require('./public-files');
for(const url of ['/server.js','/.env','/node_modules/lunar-javascript/index.js','/.github/workflows/test.yml','/../server.js','/%2e%2e/server.js','/assets/characters/../../server.js','/%ZZ'])assert.equal(resolvePublic(__dirname,url),null,url);
for(const url of ['/','/report-renderer.js?v=1','/assets/result/insight-1.webp'])assert(resolvePublic(__dirname,url));
const {validateInput}=require('./input-validation');
const input={calendar:'solar',birthDate:'1990-06-15',birthTime:'12:00',gender:'male',mbti:'INFP'};
assert.deepEqual(validateInput(input),[]);
for(const changes of [{birthDate:'2999-01-01'},{birthDate:'2027-02-30'},{birthDate:'2000-02-30'},{birthTime:'25:00'},{calendar:'other'},{gender:'other'},{mbti:'XXXX'},{unknownBirthTime:'yes'},{birthDate:'2000-13-01'},{calendar:'lunar',birthDate:'2026-02-01',leapMonth:true}])assert(validateInput({...input,...changes}).length,JSON.stringify(changes));
assert.deepEqual(validateInput({...input,birthTime:'',unknownBirthTime:true}),[]);
const outline=require('./report-outline'),wire=require('./report-wire'),schema=require('./report-schema.json');
const ids=Object.keys(outline.topics),prompt={requestedSections:ids};
const providerSchema=wire.schemaFor(prompt,schema);assert.deepEqual(providerSchema.properties.chapters.required,ids);
const chapters=Object.fromEntries([...ids].reverse().map(id=>[id,{paragraphs:Object.fromEntries(Object.keys(outline.topics[id]).reverse().map(t=>[t,{label:outline.topics[id][t],text:id+':'+t}]))}]));
const decoded=wire.decode({chapters},prompt);assert.equal(decoded.sections.reduce((n,s)=>n+s.body.length,0),29);
for(const s of decoded.sections){assert.deepEqual(s.bodyTopics,Object.keys(outline.topics[s.id]));s.body.forEach((v,i)=>assert.equal(v,s.id+':'+s.bodyTopics[i]));}
const diagnostics=require('./report-diagnostics');
assert.equal(diagnostics.failureCode('AI report service output token limit'),'MODEL_OUTPUT_TOKEN_LIMIT');
assert.equal(diagnostics.failureCode('AI report service returned invalid report structure'),'REPORT_STRUCTURE_INVALID');
const facts=require('./report-facts-node').build(input),quality=require('./report-quality-node');
const wrongGod=facts.facts.annualTenGods.stemTenGod==='정재'?'편재':'정재';
assert(quality.verifyEvidenceAgainstFacts({sections:[],finalJudgment:{body:['2027년 세운은 '+wrongGod+'입니다.']}},facts).errors.length);
const noClash={...facts,facts:{...facts.facts,targetYearRelations:[]}};
assert.equal(quality.verifyEvidenceAgainstFacts({sections:[{id:'year_2027',body:['2027년 일지와 충이 없습니다.']}]},noClash).errors.length,0);
assert(quality.verifyEvidenceAgainstFacts({sections:[{id:'year_2027',body:['2027년 일지와 충이 있습니다.']}]},noClash).errors.length);
console.log('PASS private-file denial, invalid inputs, required 29-topic transport, distinct failures, final-summary factual checks and negated clash');

// Completed reports remain readable after recreating a store on the same mounted directory.
{const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),d=fs.mkdtempSync(path.join(os.tmpdir(),'saju-job-'));try{const store=require('./report-job-store');const id='00000000-0000-4000-8000-000000000001';store.create(d).save(id,{status:'ready',result:{report:{meta:{name:'sample'}}}});assert.equal(store.create(d).load(id).result.report.meta.name,'sample');assert.equal(store.create(d).load('../server.js'),null);assert.equal(fs.statSync(path.join(d,id+'.json')).mode&0o777,0o600);const request='request-id-for-restart-0001',fingerprint='a'.repeat(64);store.create(d).saveRequest(request,{id,fingerprint});assert.deepEqual(store.create(d).loadRequest(request),{id,fingerprint});assert.equal(store.create(d).loadRequest('../server.js'),null);assert.equal(fs.statSync(path.join(d,'request-'+request+'.json')).mode&0o777,0o600);store.create(d).save(id,{status:'ready',result:{report:{meta:{name:'persisted'}}}});assert.equal(store.create(d).load(id).result.report.meta.name,'persisted');console.log('PASS mounted report results survive store recreation with owner-only file permissions');}finally{fs.rmSync(d,{recursive:true,force:true})}}
// A public Render deployment must not spend paid model tokens before purchase validation exists.
(async()=>{const http=require('node:http');const server=http.createServer(require('./server').handler);const prevRender=process.env.RENDER,prevMode=process.env.REPORT_UNPAID_TEST_MODE;try{process.env.RENDER='true';process.env.REPORT_UNPAID_TEST_MODE='true';await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const res=await fetch(`http://127.0.0.1:${server.address().port}/api/report`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({analysisInput:{status:'ready',calculationInput:input}})});assert.equal(res.status,403);const result=await res.json();assert.equal(result.code,'PAYMENT_NOT_CONFIGURED');const status=await fetch(`http://127.0.0.1:${server.address().port}/api/report-status?id=00000000-0000-4000-8000-000000000001`);assert.equal(status.status,403);assert.equal((await status.json()).code,'PURCHASE_VERIFICATION_REQUIRED');console.log('PASS Render production blocks unauthenticated generation and report retrieval');}finally{await new Promise(resolve=>server.close(resolve));if(prevRender===undefined)delete process.env.RENDER;else process.env.RENDER=prevRender;if(prevMode===undefined)delete process.env.REPORT_UNPAID_TEST_MODE;else process.env.REPORT_UNPAID_TEST_MODE=prevMode}})().catch(e=>{console.error(e);process.exitCode=1});
