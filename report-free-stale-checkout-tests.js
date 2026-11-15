'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const js=fs.readFileSync(path.join(__dirname,'report-checkout-ui.js'),'utf8');
const ui=fs.readFileSync(path.join(__dirname,'live-report-ui.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
assert(js.includes("typeof isCurrent==='function'&&!isCurrent()"),
 'late checkout configuration must not attach an expired offer');
assert(ui.includes('if(!isCurrent())return;'),
 'free-result coverage must ignore stale responses');
assert(ui.includes('await showCoverage(lastAnalysis.calculationInput,isCurrent)'),
 'render the active free calculation only');
assert(html.includes('viewSeq===resultRenderSeq'),
 'abandoned queued render callbacks must be discarded');
// Mock checkout configuration response only. No purchase start, SDK,
// merchant request or model request.
let completeConfig=null,configRequests=0,offersAttached=0;
const doc={
 getElementById(id){return id==='coverageSalesNotice'?{textContent:'미승인'}:null},
 addEventListener(){},
 createElement(){offersAttached++;return {}}
};
const storage={getItem(){return null}};
const context={
 window:{location:{href:'http://localhost/'},history:{replaceState(){}},
  REPORT_CHECKOUT_UI:null},
 document:doc,sessionStorage:storage,URL,Promise,JSON,Array,Map,Set,Object,
 console,
 fetch:async url=>{
  assert.equal(url,'/api/checkout/config','the stale-offer scenario must only fetch public config');
  configRequests++;
  return new Promise(resolve=>{completeConfig=resolve});
 }
};
context.window.window=context.window;
vm.createContext(context);
vm.runInContext(js,context,{filename:'report-checkout-ui.js'});
const cfg={enabled:true,productMode:'adaptive-v1',clientKey:'test_ck_abcdefghijk',
 amount:1000,currency:'KRW',scopeMustMatchOrder:true,fixed12x35Promised:false};
const realIds=['saju_core','mbti_contradiction','decision','money','career',
 'relationship','stress','integrated_judgment','year_2027'];
const proposal={status:'draft-not-for-sale',mainChapterIds:realIds,
 conditional2027ChapterIds:[],mainChapterCount:realIds.length,
 conditionalChapterCount:0,plannedChapterCount:realIds.length,
 topicCandidateUpperBound:18};
const container={isConnected:true,append(){offersAttached++}};
(async()=>{
 let active=true;
 const work=context.window.REPORT_CHECKOUT_UI.mount({
  container,analysisInput:{calculationInput:{birthDate:'1982-11-24'}},
  proposal,isCurrent:()=>active
 });
 assert.equal(configRequests,1);
 assert.equal(typeof completeConfig,'function');
 active=false;
 completeConfig({ok:true,json:async()=>cfg});
 await work;
 assert.equal(offersAttached,0,
  'a late but otherwise valid checkout config must not append an old offer');
 console.log('PASS stale successful checkout-config response cannot append an outdated paid offer; no model/merchant calls');
})().catch(e=>{console.error(e);process.exitCode=1});
