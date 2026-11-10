'use strict';
// Execute the real HTML wizard plus real free-results script inside a fake
// local browser; never contact an API, merchant or paid model.
const assert=require('node:assert/strict'),fs=require('node:fs'),
path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const live=fs.readFileSync(path.join(__dirname,'live-report-ui.js'),'utf8');
const marker='<script>(()=>{let step=1;',start=html.lastIndexOf(marker);
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
const calls=[];
const ctx={
 window:null,console,Date,JSON,Promise,Array,Set,Map,Object,Math,Number,
 document:{getElementById:id=>els[id]||null,querySelector:find,
  querySelectorAll:selector=>selector==='.screen'?screens:[],
  addEventListener(){}},
 sessionStorage:{getItem(){return null},setItem(){},removeItem(){}},
 BIRTH_DAY_OPTIONS:{maxDays:(calendar,y,m)=>calendar==='lunar'?30:new Date(y,m,0).getDate()},
 setTimeout(){return 1},setInterval(){return 1},clearInterval(){},clearTimeout(){},
 scrollTo(){},alert(s){throw Error('Unexpected alert: '+s)},
 fetch:async(url,opts)=>{
  assert.equal(url,'/api/calculate','paid and unrelated requests forbidden');
  assert.equal(opts.method,'POST');
  const input=JSON.parse(opts.body);
  assert.equal(input.birthDate,'1982-11-24');
  calls.push(input);
  return {ok:true,json:async()=>({status:'ready',calculationInput:input})};
 },
 CHARACTER_ASSETS:{state:()=>'<span>상태</span>'},
 REPORT_API:{elapsedSeconds:x=>x,timingText:()=> '테스트',progress:null,
  async coverage(){return {status:'blocked',errors:['일시적 제공 범위 실패']}},
  async resume(){return {status:'missing'}}}
};
ctx.window=ctx;vm.createContext(ctx);
vm.runInContext(live,ctx,{filename:'live-report-ui.js'});
vm.runInContext(wizard,ctx,{filename:'index-html-wizard.js'});
const active=n=>screens[n-1].classList.contains('active');
(async()=>{
 assert(active(1));
 await els.next.onclick();assert(active(2),'first free calculation');
 await els.next.onclick();assert(active(3),'summary to free results');
 await ctx.LIVE_REPORT_UI.run();
 assert(els.reportBody.innerHTML.includes('제공 가능 범위를 확인하지 못했습니다'));
 assert.equal(typeof els.returnFromCoverageError.listeners.click,'function');
 els.returnFromCoverageError.listeners.click();
 assert(active(1),'error return must reset actual wizard to step 1');
 assert.equal(els.next.textContent,'사주 확인하기');
 await els.next.onclick();
 assert(active(2),'Next must work again after free-result error return');
 await els.next.onclick();assert(active(3));
 ctx.sessionStorage.getItem=key=>key==='reportJobId'?'fake-job':null;
 assert.equal(await ctx.LIVE_REPORT_UI.resume(),true);
 assert(els.reportBody.innerHTML.includes('이전 분석 작업이 만료됐습니다'));
 assert.equal(typeof els.returnToInput.listeners.click,'function');
 els.returnToInput.listeners.click();
 assert(active(1),'expired job return must reset the same wizard');
 assert(!els.actions.classList.contains('hidden'),'Next should be visible');
 await els.next.onclick();
 assert(active(2),'Next must work after expired-job return');
 assert.equal(calls.length,4,'all checks stay on the free calculate endpoint');
 assert(live.includes("$('#coverageBackToInput')?.addEventListener('click',backToInput)"),
  'ordinary free-result return must use the shared back-to-input');
 console.log('PASS actual browser wizard and result script: free error return, expired job return and repeat Next work; paid/model requests 0');
})().catch(e=>{console.error(e);process.exitCode=1});
