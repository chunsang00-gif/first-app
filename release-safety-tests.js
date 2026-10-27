'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const paidWorkflow=fs.readFileSync(require('node:path').join(__dirname,'.github/workflows/paid-report-qa.yml'),'utf8');
assert(paidWorkflow.includes('paid_qa_confirmation:')&&paidWorkflow.includes('REPORT_QA_CONFIRM: ${{ inputs.paid_qa_confirmation }}'),'paid QA must require explicitly supplied workflow approval');
assert(paidWorkflow.includes('test "$REPORT_QA_CONFIRM" = "RUN_ONE_CORE_V2_APPROVED_ONCE"'),'paid V2 API calls must fail closed without a NEW one-shot approval');
assert(paidWorkflow.includes('run: node qa-core-v2-dispatch-guard.js'),'paid V2 must reject reruns and previously used V2 approval');
assert(paidWorkflow.includes('run: node run-paid-core-v2-first-chapter-qa.js'),'paid test must target the guarded V2 first chapter, not the old V1 runner');
assert(paidWorkflow.includes('run: npm test && npm run smoke'),'manual paid QA must complete all free checks before model calls');
// The repository is public: UNIX mode 0600 does NOT make GitHub Actions
// artifacts private. Never archive raw paid model outputs in the clear.
assert(paidWorkflow.includes('on:\n  workflow_dispatch:')&&
 !/on:\n  push:/.test(paidWorkflow),
 'paid QA must remain manual-only, never automatic on push');
assert(paidWorkflow.includes('test "${#OPENAI_API_KEY}" -ge 32')&&
 !paidWorkflow.includes('test "${#REPORT_QA_ARCHIVE_KEY}"'),
 'paid QA must reuse the already configured API secret for encryption, not force a NEW user key');
assert(paidWorkflow.includes('          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}\\n')===false,
 'workflow text should contain a real newline rather than escaped YAML value');
assert(!paidWorkflow.includes('secrets.REPORT_QA_ARCHIVE_KEY'),
 'legacy archive secret must not be mandatory in manual QA steps');
assert(paidWorkflow.includes('run: node report-qa-secure-archive.js encrypt'),
 'encrypted packaging must run even after quality rejection');
assert(paidWorkflow.includes('retention-days: 30'),
 'paid evidence should remain reviewable without repeated billing');
const artifactBlock=paidWorkflow.slice(paidWorkflow.indexOf('      - name: Upload encrypted first-chapter evidence'));
assert(artifactBlock.includes('path: premium-first-chapter-qa.enc')&&
 !/path:.*private-qa-first-chapter(?:-provider-calls)?\.json/.test(artifactBlock),
 'only encrypted bytes, NEVER raw QA reports, may reach public repo artifacts');
assert(!paidWorkflow.slice(0,paidWorkflow.indexOf('    steps:')).includes('OPENAI_API_KEY'),
 'OpenAI API key must not be exposed to dependency install or test jobs');
{
 const secureArchive=require('./report-qa-secure-archive');
 const path=require('node:path'),os=require('node:os');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'saju-secure-qa-test-'));
 const prior=process.env.REPORT_QA_ARCHIVE_KEY;
 const priorApi=process.env.OPENAI_API_KEY;
 const key='qa-test-independent-secret-0123456789-abcdef-0123456789';
 try{
  delete process.env.REPORT_QA_ARCHIVE_KEY;
  delete process.env.OPENAI_API_KEY;
  assert.throws(()=>secureArchive.encrypt(dir),/already configured OpenAI API key/);
  process.env.OPENAI_API_KEY=key;
  const rawName='private-qa-first-chapter-provider-calls.json';
  const raw='paid-model-response-visible-only-after-decrypt-1234567';
  fs.writeFileSync(path.join(dir,rawName),raw,{mode:0o600});
  assert.equal(secureArchive.encrypt(dir),true);
  const archiveFile=path.join(dir,secureArchive.ARCHIVE);
  const bytes=fs.readFileSync(archiveFile);
  assert(!bytes.includes(Buffer.from(raw)),
   'unencrypted original model output must not appear in uploaded artifact');
  const out=path.join(dir,'extracted');
  assert.deepEqual(secureArchive.decrypt(archiveFile,out),[rawName]);
  assert.equal(fs.readFileSync(path.join(out,rawName),'utf8'),raw);
  assert.equal(fs.statSync(path.join(out,rawName)).mode&0o777,0o600);
  const tampered=Buffer.from(bytes);tampered[tampered.length-1]^=1;
  const altered=path.join(dir,'tampered.enc');fs.writeFileSync(altered,tampered);
  assert.throws(()=>secureArchive.decrypt(altered,path.join(dir,'tampered-output')),
   'authenticated archive must reject modification before writing plaintext');
  assert(!fs.existsSync(path.join(dir,'tampered-output')));
  process.env.OPENAI_API_KEY='independent-wrong-passphrase-1234567890';
  assert.throws(()=>secureArchive.decrypt(archiveFile,path.join(dir,'wrong-key')),
   'wrong secret must not produce QA plaintext');
 }finally{
  if(prior===undefined)delete process.env.REPORT_QA_ARCHIVE_KEY;
  else process.env.REPORT_QA_ARCHIVE_KEY=prior;
  if(priorApi===undefined)delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY=priorApi;
  fs.rmSync(dir,{recursive:true,force:true});
 }
 console.log('PASS first-chapter QA archive: encrypted with existing API secret; no extra user key; AES-GCM tamper and wrong-key rejection');
}
const workflow=fs.readFileSync(require('node:path').join(__dirname,'.github/workflows/test.yml'),'utf8');
assert(workflow.includes("github.ref != 'refs/heads/saju-mbti-app'")&&
 workflow.includes("github.ref == 'refs/heads/saju-mbti-app'"),
 'feature CI may not imply it deployed to Render');
assert(workflow.includes("throw Error('NOT DEPLOYED: branch revision differs from running service')"),
 'production commit drift must be visibly reported in the deploy-check step');
const {resolvePublic}=require('./public-files');
for(const url of ['/server.js','/.env','/node_modules/lunar-javascript/index.js','/.github/workflows/test.yml','/../server.js','/%2e%2e/server.js','/assets/characters/../../server.js','/%ZZ'])assert.equal(resolvePublic(__dirname,url),null,url);
for(const url of ['/','/report-renderer.js?v=1','/assets/result/insight-1.webp'])assert(resolvePublic(__dirname,url));
const {validateInput}=require('./input-validation');
const input={calendar:'solar',birthDate:'1990-06-15',birthTime:'12:00',gender:'male',mbti:'INFP'};
assert.deepEqual(validateInput(input),[]);
for(const changes of [{birthDate:'2999-01-01'},{birthDate:'2027-02-30'},{birthDate:'2000-02-30'},{birthTime:'25:00'},{calendar:'other'},{gender:'other'},{mbti:'XXXX'},{unknownBirthTime:'yes'},{birthDate:'2000-13-01'},{calendar:'lunar',birthDate:'2026-02-01',leapMonth:true}])assert(validateInput({...input,...changes}).length,JSON.stringify(changes));
assert.deepEqual(validateInput({...input,calendar:'lunar',birthDate:'2026-09-01',leapMonth:false}),[],'past lunar date must not be rejected by lexical solar comparison');
assert(validateInput({...input,calendar:'lunar',birthDate:'2026-12-01',leapMonth:false}).length,'future lunar date must be rejected after solar conversion');
assert.deepEqual(validateInput({...input,birthTime:'',unknownBirthTime:true}),[]);
const outline=require('./report-outline'),wire=require('./report-wire'),schema=require('./report-schema.json');
const ids=Object.keys(outline.topics),prompt={requestedSections:ids};
const providerSchema=wire.schemaFor(prompt,schema);assert.deepEqual(providerSchema.properties.chapters.required,ids);
const chapters=Object.fromEntries([...ids].reverse().map(id=>[id,{paragraphs:Object.fromEntries(Object.keys(outline.topics[id]).reverse().map(t=>[t,{label:outline.topics[id][t],text:id+':'+t}]))}]));
const decoded=wire.decode({chapters},prompt);assert.equal(decoded.sections.reduce((n,s)=>n+s.body.length,0),28);
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
