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
 const server={module:{exports:{}},__dirname:__dirname,process:{env:{}},Date:{now:()=>clock},URL,console:{error(){},warn(){}},require:n=>{
  if(n==='./report-facts-node')return {};
  if(n==='./report-diagnostics')return {configuration:()=>({configured:true}),failureCode:()=> 'FAILED',messageFor:()=> 'failed'};
  if(n==='./report-server-contract')return {generate:()=>new Promise((resolve,reject)=>{finish=resolve;fail=reject;})};
  if(n==='./report-request-control')return {createQueue:()=>fn=>fn(),rateLimitKind:()=>''};
  if(n==='./report-timing')return {createTiming:()=>createTiming({now:()=>clock})};
  return require(n);
 }};
 vm.runInNewContext(fs.readFileSync(require.resolve('./server'),'utf8'),server);
 async function request(method,url,data){const req=new EventEmitter();req.method=method;req.url=url;let output;const res={writeHead(code){this.code=code},end(s){output={code:this.code,...JSON.parse(s)}}};const p=server.module.exports.handler(req,res);if(method==='POST'){req.emit('data',JSON.stringify(data));req.emit('end');}await p;return output;}
 const payload={analysisInput:{status:'ready',calculationInput:{}}};
 const first=await request('POST','/api/report',payload);assert.equal(first.timing.averageSeconds,null);
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
 const body={innerHTML:'',querySelector(){return null}};const ui={window:{REPORT_API:api.window.REPORT_API,CHARACTER_ASSETS:{state:()=>''},REPORT_RENDERER:{render(){}}},REPORT_API:{generate:async()=>({status:'ready',report:{}})},sessionStorage:{getItem:()=>null},setInterval:()=>1,clearInterval(){},fetch:async()=>({ok:true,json:async()=>({status:'ready'})}),document:{querySelector:s=>s==='#reportBody'?body:null,querySelectorAll:()=>[],getElementById:()=>null,addEventListener(){}}};
 vm.runInNewContext(fs.readFileSync(require.resolve('./live-report-ui'),'utf8'),ui);
 await ui.window.LIVE_REPORT_UI.run();assert(body.innerHTML.includes('analysis-average'));assert(body.innerHTML.includes('평균 약 2분'));assert(body.innerHTML.includes('1건 기준'));
 console.log('PASS real-duration mean, bounded/expired samples, restart reset, failed/rejected exclusions, status timing, existing polling only, average loading text; no paid API');
})().catch(e=>{console.error(e);process.exitCode=1});
