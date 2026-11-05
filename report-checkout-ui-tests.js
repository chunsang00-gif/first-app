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
const input={status:'ready',calculationInput:{calendar:'solar',
 birthDate:'1994-07-15',birthTime:'14:20',gender:'male',mbti:'ISFP'}};
function scenario({kind='success',amount='9900',confirm='ok',state='verified-paid'}={}){
 const entries=new Map();
 entries.set('sajuAdaptiveCheckoutPendingV1',JSON.stringify({
  orderId:ORDER,ownerToken:OWNER,amount:9900,analysisInput:input,
  confirmed:false,confirmAttempted:false,generationStarted:false
 }));
 const body={children:[],replaceChildren(){this.children=[]},
  append(...args){this.children.push(...args)}};
 const document={
  getElementById(id){return id==='reportBody'?body:null},
  createElement(tag){return {tagName:tag,children:[],
   append(...parts){this.children.push(...parts)},
   setAttribute(){},addEventListener(){},textContent:''}}
 };
 const calls=[],history=[];
 const fetch=async(url,init)=>{
  calls.push({url,body:init?.body?JSON.parse(init.body):null});
  if(url==='/api/checkout/confirm')
   return {ok:confirm==='ok',status:confirm==='ok'?200:409,
    json:async()=>confirm==='ok'?{status:'verified-paid'}:
     {status:'blocked',code:'PAYMENT_CONFIRMATION_UNCERTAIN'}};
  if(url==='/api/checkout/status')
   return {ok:true,status:200,json:async()=>({state,orderId:ORDER})};
  throw Error('UNEXPECTED_NETWORK_PATH:'+url);
 };
 const params=kind==='no-redirect'?new URLSearchParams():
  new URLSearchParams({checkout:kind,orderId:ORDER,
   paymentKey:'opaque-payment-key',amount});
 const window={location:{href:'https://test.example/?'+params.toString()},
  history:{replaceState(...args){history.push(args)}},
  LIVE_REPORT_UI:{openResult(){},resume(){}},
  TossPayments:undefined};
 const sessionStorage={getItem:k=>entries.get(k)||null,
  setItem(k,v){entries.set(k,v)},removeItem(k){entries.delete(k)}};
 const sandbox={window,document,sessionStorage,fetch,URL,console};
 vm.runInNewContext(source,sandbox,{filename:'report-checkout-ui.js'});
 return {ui:window.REPORT_CHECKOUT_UI,calls,entries,body,history,window};
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
 console.log('PASS buyer redirect and refresh: owner-only pending, uncertain, verified and refunded recovery; no double charge; checkout disabled by default');
})().catch(e=>{console.error(e);process.exitCode=1});
