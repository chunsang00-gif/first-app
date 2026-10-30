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
 async function request(method,url,data){const req=new EventEmitter();req.method=method;req.url=url;req.socket={remoteAddress:'127.0.0.1'};let output;const res={writeHead(code){this.code=code},end(s){output={code:this.code,...JSON.parse(s)}}};const p=server.module.exports.handler(req,res);if(method==='POST'){req.emit('data',JSON.stringify(data));req.emit('end');}await p;return output;}
 const payload={analysisInput:{status:'ready',calculationInput:{calendar:'solar',birthDate:'1990-06-15',unknownBirthTime:true,gender:'male',mbti:'INFP'}}};
 const first=await request('POST','/api/report',{...payload,requestId:'one-delivery-test-0001'});const duplicate=await request('POST','/api/report',{...payload,requestId:'one-delivery-test-0001'});assert.equal(duplicate.jobId,first.jobId);assert.equal(first.timing.averageSeconds,null);
 clock=31000;const loading=await request('GET','/api/report-status?id='+first.jobId);assert.equal(loading.timing.elapsedSeconds,30);
 clock=121000;finish({status:'ready',report:{}});await Promise.resolve();
 const second=await request('POST','/api/report',payload);assert.equal(second.timing.averageSeconds,120);assert.equal(second.timing.sampleCount,1);
 fail(Error('AI report service timed out'));await Promise.resolve();await Promise.resolve();
 const third=await request('POST','/api/report',payload);assert.equal(third.timing.sampleCount,1);
 finish({status:'rejected'});await Promise.resolve();
 const fourth=await request('POST','/api/report',payload);assert.equal(fourth.timing.sampleCount,1);finish({status:'rejected'});await Promise.resolve();
 const storage=new Map();let requests=0;
 const api={window:{},sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},setTimeout:fn=>fn(),Date,console,
  fetch:async()=>{requests++;const value=requests===1?{status:'processing',jobId:'test',timing:{averageSeconds:120,sampleCount:1,elapsedSeconds:0}}:requests===2?{status:'processing',timing:{averageSeconds:120,sampleCount:1,elapsedSeconds:30}}:{status:'ready',report:{}};return {ok:true,status:200,json:async()=>value};}};
 vm.runInNewContext(fs.readFileSync(require.resolve('./report-api-contract'),'utf8'),api);
 assert(api.window.REPORT_API.timingText().includes('아직 완료된 분석 기록이 없습니다'));
 await api.window.REPORT_API.generate({analysisInput:{status:'ready'}});
 assert(api.window.REPORT_API.timingText().includes('평균 약 2분'));assert(api.window.REPORT_API.timingText().includes('1건 기준'));assert.equal(requests,3);assert(api.window.REPORT_API.elapsedSeconds()>=30);
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
 resolveCoverage({status:'ready',catalog:{chapterDefinitions:12,topicDefinitions:28,originallyPlannedTopics:35},estimate:{plannedChapters:1,
  evidenceEligibleTopicUpperBound:2,chapters:[
   {name:'사주 기본',includedInPlan:true,eligibleTopicUpperBound:2,
    eligibleTopics:[{id:'temperament',title:'태어난 시기의 전통적 해석'},{id:'strength',title:'기질을 설명하는 별도 근거'}]},
   {name:'2027년 금전',includedInPlan:false,eligibleTopicUpperBound:0,
    eligibleTopics:[],omittedReason:'근거 없음'}]}});
 await pending;
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
 console.log('PASS real-duration mean, bounded/expired samples, restart reset, failed/rejected exclusions, status timing, existing polling only, average loading text; no paid API');
})().catch(e=>{console.error(e);process.exitCode=1});

