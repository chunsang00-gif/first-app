const http=require('http');const fs=require('fs');const path=require('path');const facts=require('./report-facts-node');const reportContract=require('./report-server-contract');
const diagnostics=require('./report-diagnostics');
const wire=require('./report-wire');
const {validateInput}=require('./input-validation');
const {resolvePublic}=require('./public-files');
const reportTiming=require('./report-timing').createTiming();
const reportStore=require('./report-job-store').create(process.env.REPORT_STORAGE_DIR);
const checkpointIdentity=require('./report-checkpoint-identity');
const jobAccess=require('./report-job-access');
// Mock generation is strictly for non-production local testing, never a public deployment.
function localMockEnabled(req){const remote=req?.socket?.remoteAddress;const loopback=remote==='127.0.0.1'||remote==='::1'||remote==='::ffff:127.0.0.1';return loopback&&process.env.RENDER!=='true'&&process.env.NODE_ENV!=='production'&&/^http:\/\/127\.0\.0\.1:\d+\//.test(process.env.REPORT_MODEL_URL||'')}
const {createQueue,rateLimitKind}=require('./report-request-control');const enqueueModel=createQueue();
const PORT=Number(process.env.PORT||3000),ROOT=__dirname,MODEL_TIMEOUT_MS=Number(process.env.REPORT_MODEL_TIMEOUT_MS||180000),JOB_TTL_MS=45*60*1000,JOBS=new Map(),REQUESTS=new Map();
function cleanupJobs(){const now=Date.now();for(const [id,j] of JOBS)if(now-(j.createdAt||now)>JOB_TTL_MS)JOBS.delete(id);for(const [key,value] of REQUESTS)if(!JOBS.has(value.id))REQUESTS.delete(key)}
function json(res,status,data){res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'});res.end(JSON.stringify(data))}
function body(req){return new Promise((ok,fail)=>{let s='';req.on('data',c=>{s+=c;if(s.length>200000){fail(Error('request too large'));req.destroy()}});req.on('end',()=>{try{ok(JSON.parse(s||'{}'))}catch(e){fail(Error('invalid json'))}});req.on('error',fail)})}
function mime(file){return file.endsWith('.webp')?'image/webp':file.endsWith('.png')?'image/png':file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':file.endsWith('.json')?'application/json; charset=utf-8':'application/octet-stream'}
function staticHeaders(type){return {'content-type':type,'x-content-type-options':'nosniff','referrer-policy':'no-referrer','x-frame-options':'DENY','permissions-policy':'geolocation=(), camera=(), microphone=()'}}
function responseText(x){if(typeof x?.output_text==='string'&&x.output_text.trim())return x.output_text;const fragments=[];for(const item of x?.output||[])for(const c of item?.content||[])if(c?.type==='output_text'&&typeof c.text==='string')fragments.push(c.text);return fragments.join('')}
async function callOpenAI(prompt,onProviderResponse=null){
 // Offline editorial research can be compiled and audited, but never sent
 // through the billable provider boundary, even with a real key configured.
 if(prompt?.qaOfflineEditorialResearchPreview===true)
  throw Error('QA_OFFLINE_EDITORIAL_REFERENCE_NEVER_BILLABLE');
 const key=process.env.OPENAI_API_KEY;if(!key)throw Error('AI report service is not configured');const model=process.env.REPORT_MODEL;if(!model)throw Error('AI report model is not configured');let schema=JSON.parse(fs.readFileSync(path.join(ROOT,'report-schema.json'),'utf8'));
 // OpenAI strict JSON schema supports only a subset: bounds are verified locally.
 function toStrictSchema(value){if(Array.isArray(value))return value.map(toStrictSchema);if(!value||typeof value!=='object')return value;const out={};for(const [k,v] of Object.entries(value)){if(['$schema','minLength','maxLength','minItems','maxItems','minimum','maximum','pattern','format'].includes(k)||(k==='title'&&typeof v==='string'))continue;out[k]=toStrictSchema(v);}return out;}
 schema=toStrictSchema(schema);
 schema=wire.schemaFor(prompt,schema);
 const generation=require('./report-generation-request');
 const compiled=generation.compile(prompt);
 // Compare the REAL compressed provider JSON with the upstream editorial
 // contract before issuing a billable request. Auditing only the original
 // prompt previously missed dropped depth, scope and MBTI instructions.
 if(compiled)require('./report-instruction-audit').assertTransport(prompt,compiled);
 schema=generation.schema(prompt,schema);
 if(compiled)require('./report-provider-preflight').assert(prompt,compiled,schema);
 // Scope-limited V2 provider view is built ONLY AFTER complete unmodified
 // evidence, policy and schema preflight. Ordinary requests are identical.
 const providerPayload=compiled?
  require('./report-paid-core-v2-provider-projection').project(prompt,compiled):null;
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),MODEL_TIMEOUT_MS);let r;try{r=await fetch('https://api.openai.com/v1/responses',{method:'POST',signal:controller.signal,headers:{'content-type':'application/json','authorization':`Bearer ${key}`},body:JSON.stringify({model,store:false,max_output_tokens:require('./report-paid-batch-plan').outputLimit(model,prompt),input:[{role:'system',content:'Return only the requested premium report JSON. '+(compiled?generation.policyFor(prompt):require('./report-reader-policy').systemInstruction)+' '+wire.instruction},{role:'user',content:JSON.stringify(providerPayload||prompt)}],text:{format:{type:'json_schema',name:'saju_mbti_premium_report',strict:true,schema}}})});}catch(e){if(e?.name==='AbortError')throw Error('AI report service timed out');throw Error('AI report service request failed')}finally{clearTimeout(timer)}if(!r.ok){let detail='',errorCode='';try{const err=await r.json();errorCode=err?.error?.code||'';detail=String(err?.error?.message||err?.error?.type||'').replace(/[\r\n]+/g,' ').slice(0,500)}catch{}if(r.status===429)throw Error('AI report service '+rateLimitKind(detail,errorCode));console.error('[OpenAI API error]',{status:r.status,model,error:detail||'no error detail'});throw Error(`AI report service error (${r.status})`)}const x=await r.json();if(x.status==='incomplete'){console.error('[OpenAI incomplete response]',{reason:x.incomplete_details?.reason||'unknown',model,stage:prompt?.stage||'unknown',sectionIds:prompt?.requestedSections||[],outputTokens:x.usage?.output_tokens||null,tokenLimit:require('./report-paid-batch-plan').outputLimit(model,prompt)});if(onProviderResponse)await onProviderResponse({status:'incomplete',incomplete_details:x.incomplete_details||null,usage:x.usage||null,partialOutput:x.output||null});throw Error(x.incomplete_details?.reason==='max_output_tokens'?'AI report service output token limit':x.incomplete_details?.reason==='content_filter'?'AI report service content filter':'AI report service returned incomplete report data')}const text=responseText(x);
if(!text){
 // The provider may have charged for an empty response. Retain private
 // diagnostic metadata before any downstream error or retry decision.
 if(onProviderResponse)await onProviderResponse({status:'empty_output',usage:x.usage||null,output:x.output||null});
 throw Error('AI report service returned no output');
}
let value;
try{value=JSON.parse(text)}catch{
 // Store malformed paid text privately: without this record a billable call
 // cannot be replayed or diagnosed without paying again. Never log its text.
 if(onProviderResponse)await onProviderResponse({status:'invalid_json',rawOutput:text,usage:x.usage||null});
 throw Error('AI report service returned invalid report data');
}
if(onProviderResponse)await onProviderResponse(value);
return require('./report-response-decoder').decode(value,prompt)}
async function callModel(prompt,onProviderResponse=null){if(process.env.REPORT_MODEL_URL){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),MODEL_TIMEOUT_MS);let r;try{r=await fetch(process.env.REPORT_MODEL_URL,{method:'POST',signal:controller.signal,headers:{'content-type':'application/json',...(process.env.REPORT_MODEL_KEY?{'authorization':`Bearer ${process.env.REPORT_MODEL_KEY}`}:{})},body:JSON.stringify(prompt)});}catch(e){if(e?.name==='AbortError')throw Error('AI report service timed out');throw Error('AI report service request failed')}finally{clearTimeout(timer)}if(!r.ok)throw Error(`AI report service error (${r.status})`);
const raw=await r.text();
if(!raw){if(onProviderResponse)await onProviderResponse({status:'empty_output'});
 throw Error('AI report service returned no output')}
let value;
try{value=JSON.parse(raw)}catch{
 if(onProviderResponse)await onProviderResponse({status:'invalid_json',rawOutput:raw});
 throw Error('AI report service returned invalid report data');
}
if(onProviderResponse)await onProviderResponse(value);
return value;}return callOpenAI(prompt,onProviderResponse)}

// Private operator QA: never enabled without a separate secret; no customer report bypass.
const qaCrypto=require('node:crypto');
let qaJob=null;
function qaAuthorized(req){
 const secret=process.env.REPORT_QA_ADMIN_TOKEN||'';
 const provided=req.headers['x-report-qa-token'];
 if(secret.length<32||typeof provided!=='string')return false;
 const a=Buffer.from(secret),b=Buffer.from(provided);
 return a.length===b.length&&qaCrypto.timingSafeEqual(a,b);
}
function qaEnabled(){return process.env.REPORT_QA_ENABLED==='true'&&process.env.REPORT_QA_ADMIN_TOKEN?.length>=32&&process.env.RENDER==='true'&&reportStore.enabled&&path.isAbsolute(process.env.REPORT_STORAGE_DIR||'')&&process.env.REPORT_QA_MARKER_FILE?.startsWith(path.resolve(process.env.REPORT_STORAGE_DIR)+path.sep)}
const qaSample={calendar:'solar',birthDate:'1990-05-15',birthTime:'10:30',gender:'male',birthplace:'서울',mbti:'INTJ',name:'검증용'};
async function qaHandler(req,res){
 if(!qaEnabled())return json(res,404,{status:'missing'});
 if(!qaAuthorized(req))return json(res,403,{status:'blocked'});
 if(req.method==='GET'){
  if(qaJob)return json(res,200,{...qaJob,report:qaJob.result?.report||null,qa:qaJob.result?.qa||null,result:undefined});
  // An old QA run must NOT look idle after an instance restart.
  const marker=process.env.REPORT_QA_MARKER_FILE;
  let recorded=null;
  try{recorded=JSON.parse(fs.readFileSync(marker,'utf8'))}
  catch(e){if(e.code!=='ENOENT')throw e}
  if(recorded?.jobId){
   const prior=reportStore.load(recorded.jobId);
   const saved=reportStore.loadCheckpoint(recorded.jobId);
   const state=prior?.status==='processing'?'interrupted':prior?.status||'interrupted';
   return json(res,200,{status:state,id:recorded.jobId,calls:prior?.calls||0,
    validatedBatches:saved?.batches?.length||0,
    report:prior?.result?.report||null,qa:prior?.result?.qa||null,
    errorCode:prior?.errorCode||null,automaticResumeAllowed:false});
  }
  return json(res,200,{status:recorded?'interrupted':'idle',automaticResumeAllowed:false});
 }
 if(req.method!=='POST')return json(res,405,{status:'blocked'});
 if(qaJob)return json(res,409,{status:'blocked',message:'This server instance has already used its one QA attempt',state:qaJob.status});
 // Persist the spent marker before the first paid call; fail closed across restarts.
 const marker=process.env.REPORT_QA_MARKER_FILE;
 if(!marker||!path.isAbsolute(marker))return json(res,503,{status:'blocked',message:'Persistent QA marker path is required'});
 const qaId=require('node:crypto').randomUUID();
 const startedAt=Date.now();
 try{fs.mkdirSync(path.dirname(marker),{recursive:true});fs.writeFileSync(marker,JSON.stringify({startedAt:new Date(startedAt).toISOString(),jobId:qaId}),{flag:'wx',mode:0o600});}
 catch(err){return json(res,409,{status:'blocked',message:'QA already used or marker storage unavailable'});}
 const c=diagnostics.configuration();
 if(!c.configured)return json(res,503,{status:'failed',issues:c.issues});
 qaJob={id:qaId,status:'processing',createdAt:startedAt,calls:0};
 try{reportStore.save(qaId,{status:'processing',createdAt:startedAt,calls:0})}
 catch(e){qaJob=null;return json(res,503,{status:'blocked',message:'QA private job storage unavailable; no model called'})}
 reportContract.generate(qaSample,async prompt=>{
  if(qaJob.calls>=7)throw Error('QA model call cap reached');
  const callNumber=++qaJob.calls;
  return enqueueModel(async()=>{
   reportStore.startProviderCall(qaId,callNumber,{
    stage:prompt.stage,requestedSections:prompt.requestedSections||[],
    identity:checkpointIdentity.signature(qaSample)
   });
   return callOpenAI(prompt,raw=>reportStore.saveProviderResponse(qaId,callNumber,raw));
  });
 },progress=>{qaJob.progress=progress},async batch=>{
  const saved=reportStore.loadCheckpoint(qaId);
  reportStore.saveCheckpoint(qaId,{identity:checkpointIdentity.signature(qaSample),
   batches:[...(saved?.batches||[]),batch]});
 }).then(result=>{
  qaJob.status=result.status;qaJob.result=result;qaJob.finishedAt=Date.now();
  try{reportStore.save(qaId,{status:result.status,createdAt:startedAt,
   finishedAt:qaJob.finishedAt,calls:qaJob.calls,result})}
  catch(e){console.error('[QA journal write failure]',e?.code||'write failure')}
 }).catch(err=>{
  qaJob.status='failed';qaJob.errorCode=diagnostics.failureCode(err?.message);qaJob.finishedAt=Date.now();
  try{reportStore.save(qaId,{status:'failed',createdAt:startedAt,
   finishedAt:qaJob.finishedAt,calls:qaJob.calls,errorCode:qaJob.errorCode})}
  catch(e){console.error('[QA journal write failure]',e?.code||'write failure')}
  console.error('[Operator QA]',qaJob.errorCode);
 });
 return json(res,202,{status:'processing',message:'One QA attempt started; no automatic retry'});
}

async function handler(req,res){try{if(req.url.split('?')[0]==='/api/internal/report-qa')return await qaHandler(req,res);if(req.method==='GET'&&req.url.split('?')[0]==='/api/health'){const c=diagnostics.configuration();return json(res,200,{status:'ok',reportServiceConfigured:c.configured,premiumSalesReady:false,reportGenerationEnabled:localMockEnabled(req)&&c.configured,configurationIssues:c.issues,deployCommit:process.env.RENDER_GIT_COMMIT||process.env.GIT_COMMIT||null})}if(req.method==='POST'&&req.url==='/api/calculate'){const input=await body(req),errors=validateInput(input);if(errors.length)return json(res,422,{status:'blocked',errors});if(input.unknownBirthTime)input.birthTime='12:00';const packet=facts.build(input,2027);return json(res,packet.status==='ready'?200:422,packet)}if(req.method==='POST'&&req.url==='/api/report-coverage'){const input=await body(req),errors=validateInput(input);if(errors.length)return json(res,422,{status:'blocked',errors});if(input.unknownBirthTime)input.birthTime='12:00';const summary=require('./report-product-coverage').calculate(input);return json(res,summary.status==='ready'?200:422,summary)}if(req.method==='POST'&&req.url==='/api/report'){if(!localMockEnabled(req))return json(res,403,{status:'blocked',code:'PAYMENT_NOT_CONFIGURED',message:'유료 보고서 결제 및 구매 권한 확인 기능이 준비되지 않아 보고서 생성을 중단했습니다. 결제 없이 API 비용이 발생하지 않습니다.'});const payload=await body(req),a=payload.analysisInput;if(a?.status!=='ready'||!a.calculationInput)return json(res,422,{status:'blocked',errors:['validated calculation input is missing']});const errors=validateInput(a.calculationInput);if(errors.length)return json(res,422,{status:'blocked',errors});if(a.calculationInput.unknownBirthTime)a.calculationInput.birthTime='12:00';const config=diagnostics.configuration();if(!config.configured)return json(res,503,{status:'failed',code:config.issues[0],message:diagnostics.messageFor(config.issues[0])});cleanupJobs();const requestId=payload.requestId;if(requestId!==undefined&&(typeof requestId!=='string'||!/^[a-zA-Z0-9-]{16,100}$/.test(requestId)))return json(res,422,{status:'blocked',errors:['invalid request id']});const fingerprint=require('crypto').createHash('sha256').update(JSON.stringify(a.calculationInput)).digest('hex');const previous=requestId&&(REQUESTS.get(requestId)||reportStore.loadRequest(requestId));if(previous){if(previous.fingerprint!==fingerprint)return json(res,409,{status:'blocked',errors:['request id already used for different input']});const existing=JOBS.get(previous.id)||reportStore.load(previous.id);if(!existing)return json(res,409,{status:'blocked',code:'REPORT_REQUEST_ALREADY_USED',message:'기존 요청 기록이 있으나 생성 상태를 확인할 수 없습니다. 자동 재생성을 막았습니다.'});
// A duplicate idempotency key is NOT proof of ownership. Only the browser
// holding the original unguessable credential may resume the same job.
if(!jobAccess.valid(req.headers?.['x-report-access-token'],existing.accessHash))
 return json(res,403,{status:'blocked',code:'REPORT_ACCESS_DENIED'});
if(existing.status==='processing'&&!JOBS.has(previous.id)){
 const saved=reportStore.loadCheckpoint(previous.id);
 return json(res,409,{status:'failed',code:'REPORT_INTERRUPTED',jobId:previous.id,
  validatedBatches:saved?.batches?.length||0,
  message:'중단된 작업을 새 작업으로 착각하지 않도록 차단했습니다. 검증된 장은 별도 보관되지만 유료 생성은 자동 재개하지 않습니다.'});
}
return json(res,202,{status:'processing',jobId:previous.id,timing:reportTiming.snapshot(existing.createdAt)})}const id=require('crypto').randomUUID(),startedAt=Date.now();
const accessToken=jobAccess.issue(),accessHash=jobAccess.digest(accessToken);
if(reportStore.enabled){reportStore.save(id,{status:'processing',createdAt:startedAt,startedAt,accessHash});if(requestId)reportStore.saveRequest(requestId,{id,fingerprint})}if(requestId)REQUESTS.set(requestId,{id,fingerprint});JOBS.set(id,{status:'processing',createdAt:startedAt,accessHash});let attemptedCalls=0;
reportContract.generate(a.calculationInput,prompt=>enqueueModel(async()=>{
 const n=++attemptedCalls;
 if(reportStore.enabled)reportStore.startProviderCall(id,n,{
  stage:prompt.stage,requestedSections:prompt.requestedSections||[],
  identity:checkpointIdentity.signature(a.calculationInput)});
 return callModel(prompt,async response=>{
  if(reportStore.enabled)reportStore.saveProviderResponse(id,n,response)
 });
}),progress=>{
 const job=JOBS.get(id);if(job?.status==='processing')job.progress=progress
},async batch=>{
 if(!reportStore.enabled)return;
 const existing=reportStore.loadCheckpoint(id);
 const identity=checkpointIdentity.signature(a.calculationInput);
 reportStore.saveCheckpoint(id,{identity,batches:[...(existing?.batches||[]),batch]});
 const job=JOBS.get(id);
 if(job?.status==='processing')job.validatedBatches=(existing?.batches.length||0)+1;
}).then(result=>{if(result.status==='ready')reportTiming.record(startedAt);const completed={status:result.status,result,createdAt:Date.now(),startedAt,accessHash};if(reportStore.enabled)reportStore.save(id,completed);JOBS.set(id,completed)}).catch(e=>{const m=String(e?.message||'');console.error('[Report job error]',{type:e?.name||'Error',message:/^AI report service/.test(m)?m:'report generation failed'});const failed={status:'failed',progress:JOBS.get(id)?.progress||null,code:diagnostics.failureCode(m),message:/^AI report service/.test(m)?m:'report generation failed',createdAt:Date.now(),accessHash};JOBS.set(id,failed);if(reportStore.enabled)try{reportStore.save(id,failed)}catch(err){console.error('[Report storage error]',err?.code||'storage failure')}});return json(res,202,{status:'processing',jobId:id,accessToken,timing:reportTiming.snapshot(startedAt)})}if(req.method==='GET'&&req.url.startsWith('/api/report-status?')){if(!localMockEnabled(req))return json(res,403,{status:'blocked',code:'PURCHASE_VERIFICATION_REQUIRED',message:'결제 및 구매 권한 확인 기능이 준비되지 않아 보고서를 조회할 수 없습니다.'});cleanupJobs();const id=new URL(req.url,'http://localhost').searchParams.get('id'),job=JOBS.get(id)||reportStore.load(id);
if(!job)return json(res,404,{status:'missing'});
// Legacy jobs have no credential. They are deliberately inaccessible;
// never serve a saved paid manuscript to anyone who guesses a job id.
if(!jobAccess.valid(req.headers?.['x-report-access-token'],job.accessHash))
 return json(res,403,{status:'blocked',code:'REPORT_ACCESS_DENIED'});if(job.status==='processing'){if(!JOBS.has(id)){
 const saved=reportStore.loadCheckpoint(id);
 return json(res,503,{status:'failed',code:'REPORT_INTERRUPTED',
  validatedBatches:saved?.batches?.length||0,
  message:'서버 재시작으로 기존 분석이 중단됐습니다. 저장된 장이 있어도 추가 API 비용 방지를 위해 자동 재생성하지 않습니다.'});
}return json(res,200,{status:'processing',progress:job.progress||null,timing:reportTiming.snapshot(job.createdAt)})}if(job.status==='ready'){
 const gate=job.result?.qa?.releaseGate;
 // Old or corrupted persisted jobs cannot bypass the current technical
 // completion check by retaining a historical 'ready' status on disk.
 if(gate?.technicalChecks!=='passed'||gate.releaseVerdict!=='not-approved')
  return json(res,422,{status:'rejected',code:'REPORT_TECHNICAL_GATE_INCOMPLETE',
   message:'보고서의 출고 기술 검사가 확인되지 않았습니다. 자동 재생성하지 않습니다.'});
 return json(res,200,{status:'ready',report:job.result.report,
  technicalChecks:'passed',humanReviewRequired:true,
  releaseVerdict:'not-approved',customerSaleApproved:false});
}if(job.status==='rejected'){console.warn('[Report quality rejected]',{errors:job.result?.qa?.errors||[],issues:job.result?.qa?.issues||[]});return json(res,422,{status:'rejected',code:'REPORT_QUALITY_REJECTED',jobId:id,report:job.result.report,qa:job.result.qa,headingRepairs:job.result.headingRepairs||[],message:'풀이에서 수정할 문장이 발견됐습니다. 원문과 검사 내용을 저장할 수 있습니다. 다시 생성할 필요 없이 문제 부분부터 확인하세요.'})}console.error('[Report quality failure]',job.message||job.result?.qa?.errors||'report generation failed');const code=job.code||'REPORT_GENERATION_FAILED';return json(res,422,{status:'failed',code,progress:job.progress||null,message:diagnostics.messageFor(code)})}if(req.method==='GET'){const file=resolvePublic(ROOT,req.url);if(!file||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);return res.end('Not found')}res.writeHead(200,staticHeaders(mime(file)));return fs.createReadStream(file).pipe(res)}res.writeHead(405);res.end('Method not allowed')}catch(e){const safe=/^(AI report service|invalid json|request too large)/.test(String(e.message||''))?e.message:'server error';json(res,500,{status:'error',message:safe})}}
if(require.main===module)http.createServer(handler).listen(PORT,()=>console.log(`saju-mbti server listening on ${PORT}`));
module.exports={handler,callOpenAI};

