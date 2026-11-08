'use strict';
// Offline checkout redirect and no-double-confirmation boundary. No SDK,
// payment provider, HTTP network, API model, or browser UI is invoked.
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'report-checkout-ui.js'),'utf8');
assert(source.includes('adaptiveScopeAcknowledged'));
assert(source.includes('if(!checked.checked)'));
assert(source.includes('결제수단 확인하기'));

const OWNER='a'.repeat(64),ORDER='12345678-1234-1234-1234-123456789012';
const JOB='af12bc34-1234-4123-8123-123456789abc';
const input={status:'ready',calculationInput:{calendar:'solar',
 birthDate:'1994-07-15',birthTime:'14:20',gender:'male',mbti:'ISFP'}};
function scenario({kind='success',amount='9900',confirm='ok',state='verified-paid',deliveryStatus=null,jobId=null,generationStarted=false,statusOk=true}={}){
 const entries=new Map();
 entries.set('sajuAdaptiveCheckoutPendingV1',JSON.stringify({
  orderId:ORDER,ownerToken:OWNER,amount:9900,analysisInput:input,
  confirmed:false,confirmAttempted:false,generationStarted
 }));
 const body={children:[],replaceChildren(){this.children=[]},
  append(...args){this.children.push(...args)}};
 const document={
  getElementById(id){return id==='reportBody'?body:null},
  createElement(tag){return {tagName:tag,children:[],handlers:{},
   append(...parts){this.children.push(...parts)},
   setAttribute(){},addEventListener(event,cb){this.handlers[event]=cb},textContent:''}}
 };
 const calls=[],history=[];
 const fetch=async(url,init)=>{
  calls.push({url,body:init?.body?JSON.parse(init.body):null});
  if(url==='/api/checkout/confirm')
   return {ok:confirm==='ok',status:confirm==='ok'?200:409,
    json:async()=>confirm==='ok'?{status:'verified-paid'}:
     {status:'blocked',code:'PAYMENT_CONFIRMATION_UNCERTAIN'}};
  if(url==='/api/checkout/status')
   return {ok:statusOk&&JSON.parse(init.body).ownerToken===OWNER&&
     JSON.parse(init.body).orderId===ORDER,status:statusOk?200:403,
    json:async()=>({status:'ready',amount:9900,state,orderId:ORDER,
    ...(deliveryStatus?{deliveryStatus}: {}),...(jobId?{jobId}:{})})};
  throw Error('UNEXPECTED_NETWORK_PATH:'+url);
 };
 const params=kind==='no-redirect'?new URLSearchParams():
  new URLSearchParams({checkout:kind,orderId:ORDER,
   paymentKey:'opaque-payment-key',amount});
 let resumes=0;
 const window={location:{href:'https://test.example/?'+params.toString()},
  history:{replaceState(...args){history.push(args)}},
  LIVE_REPORT_UI:{openResult(){},resume(){resumes++}},
  TossPayments:undefined};
 const sessionStorage={getItem:k=>entries.get(k)||null,
  setItem(k,v){entries.set(k,v)},removeItem(k){entries.delete(k)}};
 const sandbox={window,document,sessionStorage,fetch,URL,console};
 vm.runInNewContext(source,sandbox,{filename:'report-checkout-ui.js'});
 return {ui:window.REPORT_CHECKOUT_UI,calls,entries,body,history,window,getResumes:()=>resumes};
}
(async()=>{
 let s=scenario();
 assert.equal(await s.ui.restore(),true);
 assert.equal(s.calls.filter(c=>c.url==='/api/checkout/confirm').length,1);
 assert.deepEqual(s.calls[0].body,{
  orderId:ORDER,ownerToken:OWNER,paymentKey:'opaque-payment-key',amount:9900
 });
 assert.equal(JSON.parse(s.entries.get('sajuAdaptiveCheckoutPendingV1')).confirmed,true);
 assert.equal(s.body.children[0].children[0].textContent,'결제가 확인됐습니다');
 assert(s.body.children[0].children.some(x=>x.tagName==='details'&&
  x.children.some(y=>y.tagName==='textarea'&&
   y.value==='SMB1:'+ORDER+':'+OWNER)),
  'verified buyer still has access to recovery code after payment redirect');
 assert(s.history[0][2].indexOf('paymentKey')<0,
  'remove payment key and returned auth values from address bar');
 assert.equal(await s.ui.restore(),true);
 assert.equal(s.calls.filter(c=>c.url==='/api/checkout/confirm').length,1,
  'a second redirect must only QUERY the verified charge, never confirm again');
 s=scenario({amount:'9901'});
 assert.equal(await s.ui.restore(),true);
 assert.equal(s.calls.length,0,'tampered redirect amount MUST NOT call provider confirmation');
 s=scenario({confirm:'uncertain',state:'confirmation-uncertain'});
 assert.equal(await s.ui.restore(),true);
 assert.equal(await s.ui.restore(),true);
 assert.equal(s.calls.filter(c=>c.url==='/api/checkout/confirm').length,1,
  'ambiguous payment outcome must NEVER auto-retry a charge');
 s=scenario({confirm:'uncertain',state:'verified-paid'});
 assert.equal(await s.ui.restore(),true);
 assert.equal(s.calls.filter(c=>c.url==='/api/checkout/confirm').length,1);
 assert.equal(JSON.parse(s.entries.get('sajuAdaptiveCheckoutPendingV1')).confirmed,true,
  'lost confirm HTTP response can recover a server-persisted verified payment by status only');
 s=scenario({kind:'no-redirect',state:'confirmation-uncertain'});
 let retained=JSON.parse(s.entries.get('sajuAdaptiveCheckoutPendingV1'));
 retained.confirmAttempted=true;
 s.entries.set('sajuAdaptiveCheckoutPendingV1',JSON.stringify(retained));
 assert.equal(await s.ui.restore(),true);
 assert.equal(s.calls.filter(c=>c.url==='/api/checkout/status').length,1);
 assert.equal(s.calls.filter(c=>c.url==='/api/checkout/confirm').length,0,
  'refresh after uncertain payment must only query status, never re-confirm');
 assert(s.body.children[0].children[1].textContent.includes('결제 승인 결과'));
 // Paid report failure is not payment failure and must not show a
 // "retry generation" CTA or falsely claim the customer was refunded.
 for(const delivery of ['failed','rejected','interrupted','missing','review-required']){
  s=scenario({kind:'no-redirect',state:'delivery-bound',deliveryStatus:delivery});
  retained=JSON.parse(s.entries.get('sajuAdaptiveCheckoutPendingV1'));
  retained.confirmed=true;
  s.entries.set('sajuAdaptiveCheckoutPendingV1',JSON.stringify(retained));
  assert.equal(await s.ui.restore(),true);
  const panel=s.body.children[0];
  assert(panel.children[1].textContent.includes('환불 처리를 요청'));
  assert(panel.children[1].textContent.includes('자동 환불된 상태가 아닙니다'));
  assert.equal(panel.children.filter(x=>x.tagName==='button').length,0);
  assert.equal(s.calls.filter(x=>x.url==='/api/checkout/confirm').length,0);
 }
 // Real owner-only order lookup supplies its bound job ID. Session loss
 // must restore it without paying again, and stale results must not leak.
 s=scenario({kind:'no-redirect',state:'delivery-bound',jobId:JOB});
 retained=JSON.parse(s.entries.get('sajuAdaptiveCheckoutPendingV1'));
 retained.confirmed=true;
 s.entries.set('sajuAdaptiveCheckoutPendingV1',JSON.stringify(retained));
 s.entries.set('reportCompleted',JSON.stringify({status:'ready',report:'wrong older job'}));
 assert.equal(await s.ui.restore(),true);
 assert.equal(s.entries.get('reportJobId'),JOB);
 assert.equal(s.entries.get('reportJobAccessToken'),OWNER);
 assert.equal(s.entries.get('reportCompleted'),undefined,
  'the previously cached report must not be displayed for another paid order');
 let panel=s.body.children[0],resumeButton=panel.children.find(x=>x.tagName==='button');
 assert.equal(resumeButton?.textContent,'기존 보고서 조회');
 resumeButton.handlers.click();
 assert.equal(s.getResumes(),1,'buyer can resume the server-bound job');
 assert.equal(s.calls.filter(c=>c.url==='/api/checkout/confirm').length,0);
 assert.equal(s.calls.filter(c=>c.url==='/api/report').length,0,
  'recovering paid order must never create another provider call');
 // A missing job ID or an uncertain started request is support-only.
 s=scenario({kind:'no-redirect',state:'delivery-bound'});
 retained=JSON.parse(s.entries.get('sajuAdaptiveCheckoutPendingV1'));
 retained.confirmed=true;
 s.entries.set('sajuAdaptiveCheckoutPendingV1',JSON.stringify(retained));
 assert.equal(await s.ui.restore(),true);
 panel=s.body.children[0];
 assert(!panel.children.some(x=>x.tagName==='button'));
 assert(panel.children.some(x=>String(x.textContent).includes('운영자에게')));
 s=scenario({kind:'no-redirect',state:'verified-paid',generationStarted:true});
 retained=JSON.parse(s.entries.get('sajuAdaptiveCheckoutPendingV1'));
 retained.confirmed=true;
 s.entries.set('sajuAdaptiveCheckoutPendingV1',JSON.stringify(retained));
 assert.equal(await s.ui.restore(),true);
 assert(!s.body.children[0].children.some(x=>x.tagName==='button'));
 // Recovery via an explicitly saved bearer code works with NO local
 // checkout session and NEVER initiates a new report or payment.
 const code='SMB1:'+ORDER+':'+OWNER;
 s=scenario({kind:'no-redirect',state:'delivery-bound',jobId:JOB});
 s.entries.clear();
 let recovered=await s.ui.recoverWithCode(code);
 assert.equal(recovered.ok,true);
 assert.equal(s.entries.get('reportJobAccessToken'),OWNER);
 assert.equal(s.entries.get('reportJobId'),JOB);
 assert.equal(JSON.parse(s.entries.get('sajuAdaptiveCheckoutPendingV1')).analysisInput,null,
  'recovery code never contains private natal input');
 assert.equal(s.calls.filter(c=>c.url==='/api/checkout/status').length,1);
 assert.equal(s.calls.filter(c=>c.url==='/api/checkout/confirm').length,0);
 assert.equal(s.calls.filter(c=>c.url==='/api/report').length,0);
 s=scenario({kind:'no-redirect',state:'delivery-bound',jobId:JOB});
 s.entries.clear();
 recovered=await s.ui.recoverWithCode('SMB1:'+ORDER+':'+'b'.repeat(64));
 assert.equal(recovered.ok,false);
 assert.equal(s.entries.size,0,'wrong owner code cannot create a local entitlement');
 s=scenario({kind:'no-redirect',state:'delivery-bound',jobId:JOB});
 s.entries.clear();
 recovered=await s.ui.recoverWithCode('SMB1:'+ORDER+':invalid');
 assert.equal(recovered.ok,false);
 assert.equal(s.calls.length,0,'malformed code is rejected without HTTP');
 s=scenario({kind:'no-redirect',state:'verified-paid'});
 s.entries.clear();
 recovered=await s.ui.recoverWithCode(code);
 assert.equal(recovered.ok,false);
 assert.equal(recovered.reason,'no-existing-report');
 assert.equal(s.entries.size,0,
  'unbound paid order without original birth input must NOT regenerate');
 s=scenario({kind:'no-redirect',state:'refunded'});
 s.entries.clear();
 recovered=await s.ui.recoverWithCode(code);
 assert.equal(recovered.ok,false);
 assert.equal(recovered.reason,'refunded');
 assert.equal(s.entries.size,0,'refunded order cannot be restored');
 s=scenario({kind:'no-redirect',state:'refunded'});
 retained=JSON.parse(s.entries.get('sajuAdaptiveCheckoutPendingV1'));
 retained.confirmed=true;
 s.entries.set('sajuAdaptiveCheckoutPendingV1',JSON.stringify(retained));
 assert.equal(await s.ui.restore(),true);
 assert(s.body.children[0].children[1].textContent.includes('환불'));
 assert.equal(s.calls.filter(c=>c.url==='/api/checkout/confirm').length,0);
 s=scenario({kind:'no-redirect',state:'awaiting-provider-confirmation'});
 assert.equal(await s.ui.restore(),true);
 assert(s.body.children[0].children[1].textContent.includes('아직 요청되지'));
 assert.equal(s.calls.filter(c=>c.url==='/api/checkout/confirm').length,0);
 s=scenario({kind:'failed'});
 assert.equal(await s.ui.restore(),true);
 assert.equal(s.calls.length,0,'failed authentication must not trigger confirmation');
 assert.equal(s.entries.get('sajuAdaptiveCheckoutPendingV1'),undefined,
  'canceled authorization can start a NEW checkout, without automatically charging');
 const blocked=new Map();
 const noSdk={location:{href:'https://test.example/'},
  history:{replaceState(){}},LIVE_REPORT_UI:{}};
 const container={isConnected:true,children:[],append(x){this.children.push(x)}};
 const env={window:noSdk,document:{createElement(){throw Error('not permitted')}},
  sessionStorage:{getItem:k=>blocked.get(k)||null,setItem(k,v){blocked.set(k,v)}},
  URL,console,fetch:async()=>({ok:true,json:async()=>({enabled:false})})};
 vm.runInNewContext(source,env);
 await noSdk.REPORT_CHECKOUT_UI.mount({container,analysisInput:input,
  proposal:{status:'draft-not-for-sale',plannedChapterCount:9,topicCandidateUpperBound:24}});
 assert.equal(container.children.length,0,
  'default disabled sales flag must not create a payment button');

 // A server response with the SAME number of chapters but a different
 // chapter ID is NOT the product the buyer was shown. Do not open Toss.
 async function checkoutWithIds(serverIds){
  const entries=new Map(),requests=[],sdkCalls=[];
  const el=(tag)=>({
   tagName:tag,children:[],isConnected:true,handlers:{},
   append(...items){this.children.push(...items)},
   addEventListener(event,callback){this.handlers[event]=callback},
   setAttribute(){},textContent:'',hidden:false,disabled:false
  });
  const container=el('div'),notice=el('p');
  const proposal={
   status:'draft-not-for-sale',
   mainChapterIds:['saju_core','decision','year_2027'],
   conditional2027ChapterIds:[],
   mainChapterCount:3,conditionalChapterCount:0,
   plannedChapterCount:3,topicCandidateUpperBound:5
  };
  const window={
   location:{href:'https://test.example/',origin:'https://test.example'},
   history:{replaceState(){}},
   TossPayments:()=>({
    widgets:()=>({
     setAmount:async()=>sdkCalls.push('setAmount'),
     renderPaymentMethods:async()=>sdkCalls.push('methods'),
     renderAgreement:async()=>sdkCalls.push('agreement')
    })
   })
  };
  const document={
   getElementById:id=>id==='coverageSalesNotice'?notice:null,
   createElement:el,createTextNode:value=>({textContent:value})
  };
  const fetch=async(url,init)=>{
   requests.push({url,body:init?.body?JSON.parse(init.body):null});
   if(url==='/api/checkout/config')return{
    ok:true,json:async()=>({
     enabled:true,productMode:'adaptive-v1',
     clientKey:'test_ck_offline_checkout_123456',
     amount:9900,currency:'KRW',scopeMustMatchOrder:true,
     fixed12x35Promised:false
    })
   };
   if(url==='/api/checkout/start')return{
    ok:true,json:async()=>({
     status:'pending',orderId:ORDER,ownerToken:OWNER,
     amount:9900,currency:'KRW',
     scope:{
      productMode:'adaptive-v1',plannedChapters:3,
      plannedChapterIds:serverIds,candidateTopicUpperBound:5,
      countsAreUpperBounds:true,fixed12ChaptersPromised:false,
      fixed35TopicsPromised:false
     }
    })
   };
   throw Error('UNEXPECTED_CHECKOUT_NETWORK:'+url);
  };
  const sessionStorage={
   getItem:k=>entries.get(k)||null,
   setItem(k,v){entries.set(k,v)},
   removeItem(k){entries.delete(k)}
  };
  vm.runInNewContext(source,{window,document,fetch,sessionStorage,URL,console},
   {filename:'report-checkout-ui.js'});
  await window.REPORT_CHECKOUT_UI.mount({container,analysisInput:input,proposal});
  assert.equal(container.children.length,1);
  const panel=container.children[0];
  const list=panel.children.find(x=>x.tagName==='ul');
  assert.deepEqual(list.children.map(x=>x.textContent),[
   '사주 기본 풀이','선택과 결정','2027년 기본 해석'
  ]);
  const checkbox=panel.children.find(x=>x.tagName==='label').children[0];
  const start=panel.children.find(x=>x.tagName==='button');
  checkbox.checked=true;
  await start.handlers.click();
  return {entries,requests,sdkCalls,panel};
 }
 let bought=await checkoutWithIds(['saju_core','money','year_2027']);
 assert.equal(bought.requests.filter(x=>x.url==='/api/checkout/start').length,1);
 assert.equal(bought.sdkCalls.length,0,
  'same chapter count cannot hide a different product from the buyer');
 assert.equal(bought.entries.has('sajuAdaptiveCheckoutPendingV1'),false,
  'mismatched scope must not become a stored payment entitlement');
 assert(bought.panel.children.find(x=>x.tagName==='p'&&
  x.textContent.includes('일치하지 않습니다')));
 bought=await checkoutWithIds(['saju_core','decision','year_2027']);
 assert.equal(bought.sdkCalls.length,3,
  'only exact chapter scope can prepare client-side payment methods');
 assert.equal(JSON.parse(bought.entries.get('sajuAdaptiveCheckoutPendingV1')).confirmed,false);
 assert.equal(bought.requests.filter(x=>x.url==='/api/checkout/start').length,1);
 const storedRecovery=bought.panel.children.find(x=>x.tagName==='details');
 assert(storedRecovery,'buyer must be offered recovery code before payment');
 assert(storedRecovery.children.some(x=>x.tagName==='textarea'&&
  x.value==='SMB1:'+ORDER+':'+OWNER));
 assert(!bought.requests.some(x=>JSON.stringify(x).includes('SMB1:')),
  'owner recovery code must not be sent to payment or model routes');

 console.log('PASS buyer redirect and refresh: owner-only pending, uncertain, verified and refunded recovery; no double charge; checkout disabled by default');
})().catch(e=>{console.error(e);process.exitCode=1});
