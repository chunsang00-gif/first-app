'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{EventEmitter}=require('node:events');
const {createTiming}=require('./report-timing');
let now=1000;const stats=createTiming({limit:2,maxAgeMs:1000000,now:()=>now});
assert.equal(stats.snapshot().averageSeconds,null);
now=61000;stats.record(1000);now=181000;stats.record(61000);
assert.equal(stats.snapshot().averageSeconds,90);assert.equal(stats.snapshot(171000).elapsedSeconds,10);
now=211000;stats.record(181000);assert.equal(stats.snapshot().averageSeconds,75);assert.equal(stats.snapshot().sampleCount,2);
stats.record(NaN);assert.equal(stats.snapshot().sampleCount,2);
now+=1000001;assert.equal(stats.snapshot().averageSeconds,null);
assert.equal(createTiming().snapshot().sampleCount,0);
(async()=>{
 let clock=1000,finish,fail;
 const server={module:{exports:{}},__dirname:__dirname,process:{env:{REPORT_MODEL_URL:'http://127.0.0.1:3211/report'}},Date:{now:()=>clock},URL,console:{error(){},warn(){}},require:n=>{
  if(n==='./report-facts-node')return {};
  if(n==='./report-diagnostics')return {configuration:()=>({configured:true}),failureCode:()=> 'FAILED',messageFor:()=> 'failed'};
  if(n==='./report-server-contract')return {generate:()=>new Promise((resolve,reject)=>{finish=resolve;fail=reject;})};
  if(n==='./report-request-control')return {createQueue:()=>fn=>fn(),rateLimitKind:()=>''};
  if(n==='./report-timing')return {createTiming:()=>createTiming({now:()=>clock})};
  return require(n);
 }};
 vm.runInNewContext(fs.readFileSync(require.resolve('./server'),'utf8'),server);
 async function request(method,url,data,accessToken){const req=new EventEmitter();req.method=method;req.url=url;req.socket={remoteAddress:'127.0.0.1'};req.headers=accessToken?{'x-report-access-token':accessToken}:{};let output;const res={writeHead(code){this.code=code},end(s){output={code:this.code,...JSON.parse(s)}}};const p=server.module.exports.handler(req,res);if(method==='POST'){req.emit('data',JSON.stringify(data));req.emit('end');}await p;return output;}
 const payload={analysisInput:{status:'ready',calculationInput:{calendar:'solar',birthDate:'1990-06-15',unknownBirthTime:true,gender:'male',mbti:'INFP'}}};
 const first=await request('POST','/api/report',{...payload,requestId:'one-delivery-test-0001'});
 assert.match(first.accessToken,/^[a-f0-9]{64}$/);
 const stolen=await request('POST','/api/report',{...payload,requestId:'one-delivery-test-0001'});
 assert.equal(stolen.code,403,'a known idempotency key must not impersonate the original report owner');
 const duplicate=await request('POST','/api/report',{...payload,requestId:'one-delivery-test-0001'},first.accessToken);
 assert.equal(duplicate.jobId,first.jobId);
 assert.equal(duplicate.accessToken,undefined,'retries must not leak the credential');
 assert.equal(first.timing.averageSeconds,null);
 clock=31000;const anonymous=await request('GET','/api/report-status?id='+first.jobId);
 assert.equal(anonymous.code,403,'job id is not an authorization token');
 const stolenStatus=await request('GET','/api/report-status?id='+first.jobId,null,'f'.repeat(64));
 assert.equal(stolenStatus.code,403);
 const loading=await request('GET','/api/report-status?id='+first.jobId,null,first.accessToken);assert.equal(loading.timing.elapsedSeconds,30);
 clock=121000;finish({status:'ready',report:{},
  qa:{pass:true,releaseGate:{technicalChecks:'passed',releaseVerdict:'not-approved',humanReviewRequired:true}}});await Promise.resolve();
 const eligible=await request('GET','/api/report-status?id='+first.jobId,null,first.accessToken);
 assert.equal(eligible.status,'ready');
 assert.equal(eligible.humanReviewRequired,true);
 assert.equal(eligible.customerSaleApproved,false);
 assert.equal(eligible.releaseVerdict,'not-approved');
 const second=await request('POST','/api/report',payload);assert.equal(second.timing.averageSeconds,120);assert.equal(second.timing.sampleCount,1);
 fail(Error('AI report service timed out'));await Promise.resolve();await Promise.resolve();
 const third=await request('POST','/api/report',payload);assert.equal(third.timing.sampleCount,1);
 finish({status:'rejected'});await Promise.resolve();
 const fourth=await request('POST','/api/report',payload);assert.equal(fourth.timing.sampleCount,1);finish({status:'rejected'});await Promise.resolve();
 const storage=new Map();let requests=0;
 const clientAccess='a'.repeat(64);
 const polls=[];
 const api={window:{},sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},setTimeout:fn=>fn(),Date,console,
  fetch:async(url,opts)=>{requests++;if(String(url).startsWith('/api/report-status'))polls.push(opts?.headers?.['x-report-access-token']);
   const value=requests===1?{status:'processing',jobId:'test',accessToken:clientAccess,timing:{averageSeconds:120,sampleCount:1,elapsedSeconds:0}}:requests===2?{status:'processing',timing:{averageSeconds:120,sampleCount:1,elapsedSeconds:30}}:{status:'ready',report:{}};
   return {ok:true,status:200,json:async()=>value};}};
 vm.runInNewContext(fs.readFileSync(require.resolve('./report-api-contract'),'utf8'),api);
 assert(api.window.REPORT_API.timingText().includes('아직 완료된 분석 기록이 없습니다'));
 await api.window.REPORT_API.generate({analysisInput:{status:'ready'}});
 assert(api.window.REPORT_API.timingText().includes('평균 약 2분'));assert(api.window.REPORT_API.timingText().includes('1건 기준'));assert.equal(requests,3);assert(api.window.REPORT_API.elapsedSeconds()>=30);
 assert.deepEqual(polls,[clientAccess,clientAccess],'every poll must present the secret header, never the URL');
 // The public reader flow now shows the FREE scope before any paid model
 // generation; loading still displays timing while calculation is pending.
 let resolveCoverage,charged=0;
 const body={innerHTML:'',querySelector(){return null}};
 const ui={window:{REPORT_API:{...api.window.REPORT_API,
  coverage:()=>new Promise(resolve=>{resolveCoverage=resolve;})},
  CHARACTER_ASSETS:{state:()=>''},REPORT_RENDERER:{render(){}}},
  REPORT_API:{generate:async()=>{charged++;throw Error('Paid report must not be invoked');}},
  sessionStorage:{getItem:()=>null},setInterval:()=>1,clearInterval(){},
  fetch:async()=>({ok:true,json:async()=>({status:'ready',
   calculationInput:{calendar:'solar',birthDate:'1990-06-15'}})}),
  document:{querySelector:s=>s==='#reportBody'?body:null,
   querySelectorAll:()=>[],getElementById:()=>null,addEventListener(){}}};
 vm.runInNewContext(fs.readFileSync(require.resolve('./live-report-ui'),'utf8'),ui);
 const pending=ui.window.LIVE_REPORT_UI.run();
 for(let tick=0;tick<24&&typeof resolveCoverage!=='function';tick++)
  await Promise.resolve();
 assert(body.innerHTML.includes('analysis-average'));
 assert(body.innerHTML.includes('평균 약 2분'));
 assert(body.innerHTML.includes('1건 기준'));
 assert.equal(typeof resolveCoverage,'function');
 resolveCoverage({status:'ready',
  readingSample:{kind:'free-calculated-meaning-preview-v1',status:'calculated-example',
   cards:[
    {id:'birth-month',title:'태어난 달에서 확인되는 두 근거',text:'태어난 달에서 서로 다른 두 분류가 계산됐으나 실제 성향은 측정된 사실이 아닙니다.'},
    {id:'annual-2027',title:'2027년 계산에서 추가되는 질문',text:'2027년 천간은 미래를 예언하지 않으며 실제 삶의 결과를 입증한 것이 아닙니다.'}
   ],modelCalls:0,completedPremiumParagraphs:0,humanEditorialApproved:false,
   note:'전통적인 분류를 확인하는 무료 예시이며 유료 보고서가 아닙니다.'},
  catalog:{chapterDefinitions:12,topicDefinitions:28,originallyPlannedTopics:35},estimate:{plannedChapters:1,
  evidenceEligibleTopicUpperBound:2,chapters:[
   {name:'사주 기본',includedInPlan:true,eligibleTopicUpperBound:2,
    eligibleTopics:[{id:'temperament',title:'태어난 시기의 전통적 해석'},{id:'strength',title:'기질을 설명하는 별도 근거'}]},
   {name:'2027년 금전',includedInPlan:false,eligibleTopicUpperBound:0,
    eligibleTopics:[],omittedReason:'근거 없음'}]}});
 await pending;
 assert(body.innerHTML.includes('실제 출생정보에서 확인한 해석 근거'));
 assert(body.innerHTML.includes('태어난 달에서 확인되는 두 근거'));
 assert(body.innerHTML.includes('2027년 계산에서 추가되는 질문'));
 assert(body.innerHTML.indexOf('태어난 달에서 확인되는 두 근거')<
   body.innerHTML.indexOf('유료 심화 풀이 제공 가능 범위'),
   'the real calculated preview must appear BEFORE numerical scope');
 assert(body.innerHTML.includes('최대 2개 항목'));
 assert(body.innerHTML.includes('작성 후보 질문 보기'));
 assert(body.innerHTML.includes('태어난 시기의 전통적 해석'));
 assert(!body.innerHTML.includes('금전 손실 예측에서 알 수 없는 부분'));
 assert(body.innerHTML.includes('현재 유료 구매와 정식 보고서 생성은 준비 중입니다'));
 assert(body.innerHTML.includes('현재 목차에는 12개 장, 28개 세부 항목'));
 assert(body.innerHTML.includes('35항목 고정 제공은 검증되지 않았습니다'));
 assert(!body.innerHTML.includes('12개 장을 작성한 뒤'));
 assert.equal(charged,0);
 ui.window.REPORT_API.coverage=async()=>({status:'ready',
  catalog:{chapterDefinitions:12,topicDefinitions:28,originallyPlannedTopics:35},
  estimate:{plannedChapters:1,evidenceEligibleTopicUpperBound:2,
   chapters:[{name:'사주 기본',includedInPlan:true,eligibleTopicUpperBound:2,eligibleTopics:[]}]}});
 await ui.window.LIVE_REPORT_UI.run();
 assert(body.innerHTML.includes('작성 가능 항목 목록과 계산된 제공 범위가 일치하지 않습니다.'));
 assert.equal(charged,0,'forged/inconsistent topic preview must not dispatch provider');
 ui.window.REPORT_API.coverage=async()=>({status:'blocked',errors:['범위 조회 실패']});
 await ui.window.LIVE_REPORT_UI.run();
 assert(body.innerHTML.includes('제공 가능 범위를 확인하지 못했습니다'));
 assert(body.innerHTML.includes('입력 화면으로 돌아가기'));
 assert(body.innerHTML.includes('범위 조회 실패'));
 assert.equal(charged,0,'scope failure cannot dispatch a paid job');
 const resumed=await api.window.REPORT_API.resume();assert.equal(resumed.status,'ready');assert.equal(requests,3,'completed reload must not issue another request');
 const unfinished=await request('POST','/api/report',payload);
 finish({status:'ready',report:{}});await Promise.resolve();
 const oldReady=await request('GET','/api/report-status?id='+unfinished.jobId,null,unfinished.accessToken);
 assert.equal(oldReady.status,'rejected',
  'a persisted ready job without checked release metadata must not leak as a completed report');
 assert.equal(oldReady.code,'REPORT_TECHNICAL_GATE_INCOMPLETE');
 assert.equal(oldReady.report,undefined);

 console.log('PASS real-duration mean, bounded/expired samples, restart reset, failed/rejected exclusions, status timing, existing polling only, average loading text; no paid API');
})().catch(e=>{console.error(e);process.exitCode=1});

