'use strict';
// Execute the real HTML wizard plus real free-results script inside a fake
// local browser; never contact an API, merchant or paid model.
const assert=require('node:assert/strict'),fs=require('node:fs'),
path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const live=fs.readFileSync(path.join(__dirname,'live-report-ui.js'),'utf8');
const marker='<script>(()=>{let step=1,verifiedStepOne=null;',start=html.lastIndexOf(marker);
assert(start>0);const end=html.indexOf('</script>',start);assert(end>start);
const wizard=html.slice(start+'<script>'.length,end);
function el(id,value=''){
 const classes=new Set(),listeners={};
 return {id,value,checked:false,disabled:false,innerHTML:'',textContent:'',
  style:{},dataset:{},listeners,
  classList:{contains:k=>classes.has(k),add:k=>classes.add(k),
   remove:k=>classes.delete(k),toggle(k,on){if(on===undefined?!classes.has(k):on)
    classes.add(k);else classes.delete(k);return classes.has(k)}},
  addEventListener(k,f){listeners[k]=f},
  querySelector(){return null},querySelectorAll(){return []}};
}
const ids=['birthYear','birthMonth','birthDay','time','city','name',
 'mbti','unknownTime','leapMonth','readerDecision','bar','prev','next',
 'actions','reportTitle','reportMeta','reportBody','summary',
 'returnFromCoverageError','coverageBackToInput','returnToInput'];
const els=Object.fromEntries(ids.map(id=>[id,el(id)]));
Object.assign(els.birthYear,{value:'1982'});
Object.assign(els.birthMonth,{value:'11'});
Object.assign(els.birthDay,{value:'24'});
Object.assign(els.time,{value:'14:20'});
Object.assign(els.city,{value:'서울'});
Object.assign(els.name,{value:'검증용'});
Object.assign(els.mbti,{value:'ISFP'});
const screens=[1,2,3].map(i=>{const x=el('screen'+i);x.dataset.step=String(i);return x});
const find=selector=>selector.startsWith('#')?els[selector.slice(1)]||null:
 selector==='[data-choice="gender"] .chip.on'?{dataset:{v:'male'}}:
 selector==='[data-choice="calendar"] .chip.on'?{dataset:{v:'solar'}}:null;
const calls=[],scheduled=[],alerts=[],network={dropNext:false},coverage={count:0};
const ctx={
 window:null,console,Date,JSON,Promise,Array,Set,Map,Object,Math,Number,
 document:{getElementById:id=>els[id]||null,querySelector:find,
  querySelectorAll:selector=>selector==='.screen'?screens:[],
  addEventListener(){}},
 sessionStorage:{getItem(){return null},setItem(){},removeItem(){}},
 BIRTH_DAY_OPTIONS:{maxDays:(calendar,y,m)=>calendar==='lunar'?30:new Date(y,m,0).getDate()},
 FREE_CALCULATION_STATE:require('./free-calculation-state'),
 setTimeout(fn){scheduled.push(fn);return scheduled.length},
 setInterval(){return 1},clearInterval(){},clearTimeout(){},
 scrollTo(){},alert(s){alerts.push(s)},
 fetch:async(url,opts)=>{
  assert.equal(url,'/api/calculate','paid and unrelated requests forbidden');
  assert.equal(opts.method,'POST');
  const input=JSON.parse(opts.body);
  assert.equal(input.birthDate,'1982-11-24');
  calls.push(input);
  if(network.dropNext){network.dropNext=false;throw Error('offline network outage')}
  return {ok:true,json:async()=>({status:'ready',calculationInput:input})};
 },
 CHARACTER_ASSETS:{state:()=>'<span>상태</span>'},
 REPORT_API:{elapsedSeconds:x=>x,timingText:()=> '테스트',progress:null,
  async coverage(){coverage.count++;return {status:'blocked',errors:['일시적 제공 범위 실패']}},
  async resume(){return {status:'missing'}}}
};
ctx.window=ctx;vm.createContext(ctx);
vm.runInContext(live,ctx,{filename:'live-report-ui.js'});
vm.runInContext(wizard,ctx,{filename:'index-html-wizard.js'});
const active=n=>screens[n-1].classList.contains('active');
(async()=>{
 assert(active(1),'first page must be open');
 // A mobile network failure should keep every entered field and button.
 network.dropNext=true;
 await els.next.onclick();
 assert(active(1),'failed free calculation must remain on the input form');
 assert.equal(els.birthYear.value,'1982');
 assert.equal(els.birthDay.value,'24');
 assert.equal(els.name.value,'검증용');
 assert(alerts.some(x=>x.includes('계산 서버에서 생년월일')),
  'a network error should show a meaningful local retry message');
 assert(!els.next.disabled,'Next is enabled again even after a failed fetch');
 await els.next.onclick();
 assert(active(2),'a retry with unchanged fields can still validate');
 assert.equal(calls.length,2,'one failed attempt and one successful free calculation');
 await els.next.onclick();assert(active(3));
 assert.equal(scheduled.length,1,'one free result render is scheduled');
 await scheduled.shift()();
 assert.equal(calls.length,2,'free results MUST NOT call /api/calculate again');
 assert.equal(coverage.count,1);
 assert(els.reportBody.innerHTML.includes('제공 가능 범위를 확인하지 못했습니다'));
 assert.equal(typeof els.returnFromCoverageError.listeners.click,'function');
 els.returnFromCoverageError.listeners.click();
 assert(active(1),'return after coverage failure must reset actual wizard');
 assert.equal(els.next.textContent,'사주 확인하기');
 assert.equal(els.birthDay.value,'24','birth values survive coverage failures');
 await els.next.onclick();
 assert(active(2),'Next must work after returning from free coverage error');
 assert.equal(calls.length,2,'same successfully verified input reuses cached free calculation');
 await els.next.onclick();assert(active(3));
 await scheduled.shift()();
 assert.equal(coverage.count,2,'a coverage failure retries only /api/report-coverage');
 assert.equal(calls.length,2,'coverage retry must NOT duplicate /api/calculate');
 ctx.sessionStorage.getItem=key=>key==='reportJobId'?'expired-id':null;
 assert.equal(await ctx.LIVE_REPORT_UI.resume(),true);
 assert(els.reportBody.innerHTML.includes('이전 분석 작업이 만료됐습니다'));
 assert.equal(typeof els.returnToInput.listeners.click,'function');
 els.returnToInput.listeners.click();
 assert(active(1),'expired job return must reset wizard state');
 assert(!els.actions.classList.contains('hidden'));
 await els.next.onclick();assert(active(2));
 assert.equal(calls.length,2,'expired report return must preserve ready free receipt');
 els.prev.onclick();assert(active(1));
 els.name.value='다른 독자';
 await els.next.onclick();
 assert(active(2),'changing actual personal data requires a fresh free calculation');
 assert.equal(calls.length,3,'a changed name invalidates previously verified calculation');
 assert.equal(calls[2].name,'다른 독자');
 // Newly verified data still reaches the result flow once.
 await els.next.onclick();assert(active(3));
 await scheduled.shift()();
 assert.equal(coverage.count,3);
 assert.equal(calls.length,3);
 // A late old FREE scope response must not replace a new form or result.
 let resolveOld;
 ctx.REPORT_API.coverage=()=>new Promise(resolve=>{resolveOld=resolve});
 const validInput=calls.at(-1),receipt={status:'ready',calculationInput:validInput};
 const staleRequest=ctx.LIVE_REPORT_UI.run(receipt,validInput);
 assert.equal(typeof resolveOld,'function','the old scope request is pending');
 ctx.REPORT_STEP_NAVIGATION.returnToInput();
 assert(active(1),'leaving the result must invalidate its pending request');
 const staleErrorText='이전 요청이 현재 화면을 덮어쓰면 안 됩니다';
 resolveOld({status:'blocked',errors:[staleErrorText]});
 await staleRequest;
 assert(active(1),'late scope failure cannot reopen the old result');
 assert(!els.reportBody.innerHTML.includes(staleErrorText),
  'old scope response must not show a new error after leaving');
 // Deferred callbacks queued for an abandoned result must also be dropped.
 await els.next.onclick();assert(active(2));
 await els.next.onclick();assert(active(3));
 assert.equal(scheduled.length,1);
 ctx.REPORT_STEP_NAVIGATION.returnToInput();
 const beforeQueued=coverage.count;
 await scheduled.shift()();
 assert(active(1));
 assert.equal(coverage.count,beforeQueued,'abandoned result callback must be a no-op');
 assert.equal(calls.length,3,'no extra calculation during these races');
 console.log('PASS actual input-confirm-result browser flow: free calculation once per stable input, no second free API on results, retry coverage separately, offline retry retains inputs and new name forces verification; 0 paid calls');
})().catch(e=>{console.error(e);process.exitCode=1});
