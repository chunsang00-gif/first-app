'use strict';
// Adaptive buyer checkout UI, disabled by default. All price/eligibility,
// ownership and payment finality come from the server, never a browser flag.
// No automatic duplicate confirmation, charge, or paid report retry.
(()=>{
const KEY='sajuAdaptiveCheckoutPendingV1';
const SDK='https://js.tosspayments.com/v2/standard';
let loadingSDK=null,opening=false;
const find=id=>document.getElementById(id);
const read=()=>{try{return JSON.parse(sessionStorage.getItem(KEY)||'null')}catch{return null}};
const save=v=>sessionStorage.setItem(KEY,JSON.stringify(v));
const safeText=(node,message)=>{if(node)node.textContent=String(message)};
const cleanupUrl=()=>{
 const u=new URL(window.location.href);
 for(const p of ['checkout','paymentKey','orderId','amount','paymentType','code','message'])
  u.searchParams.delete(p);
 window.history.replaceState(null,'',u.pathname+u.search+u.hash);
};
async function json(path,body){
 const r=await fetch(path,{
  method:'POST',headers:{'content-type':'application/json'},
  body:JSON.stringify(body),cache:'no-store'
 });
 const out=await r.json().catch(()=>null);
 return {ok:r.ok,status:r.status,data:out};
}
async function sdk(){
 if(window.TossPayments)return window.TossPayments;
 if(loadingSDK)return loadingSDK;
 loadingSDK=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src=SDK;script.async=true;
  script.onload=()=>window.TossPayments?resolve(window.TossPayments):
   reject(Error('결제 SDK를 확인하지 못했습니다.'));
  script.onerror=()=>reject(Error('결제창을 불러오지 못했습니다.'));
  document.head.appendChild(script);
 });
 return loadingSDK;
}
async function config(){
 const r=await fetch('/api/checkout/config',{cache:'no-store'});
 const x=await r.json().catch(()=>null);
 if(!r.ok||x?.enabled!==true||x?.productMode!=='adaptive-v1'||
    !/^(test|live)_ck_[A-Za-z0-9_-]{8,}$/.test(x?.clientKey||'')||
    !Number.isSafeInteger(x?.amount)||x.amount<=0||
    x.currency!=='KRW'||x.scopeMustMatchOrder!==true||
    x.fixed12x35Promised!==false)return null;
 return x;
}
function showPaidState(p,info){
 if(!p||!p.confirmed||!p.orderId||!p.ownerToken||!p.analysisInput)return;
 window.LIVE_REPORT_UI?.openResult?.();
 const body=find('reportBody');if(!body)return;
 body.replaceChildren();
 const section=document.createElement('section');section.className='section';
 const title=document.createElement('h2');title.textContent='결제가 확인됐습니다';
 const text=document.createElement('p');
 text.textContent='주문에 연결된 출생정보로 보고서를 한 번만 작성할 수 있습니다. 작성이 실패하거나 중단되면 자동으로 재결제·재생성하지 않으며 주문 상태를 확인해야 합니다.';
 const status=document.createElement('p');status.className='meta';
 status.textContent='주문 번호: '+p.orderId+
  ' · 결제 금액: '+Number(p.amount).toLocaleString('ko-KR')+'원';
 section.append(title,text,status);
 if(info?.state==='delivery-bound'||p.generationStarted){
  const report=document.createElement('p');
  report.textContent='이미 연결된 보고서가 있습니다. 중복 생성하지 않고 기존 작업을 조회합니다.';
  section.append(report);
  const resume=document.createElement('button');
  resume.className='btn primary';resume.textContent='기존 보고서 조회';
  resume.addEventListener('click',()=>window.LIVE_REPORT_UI?.resume?.());
  section.append(resume);
 }else{
  const button=document.createElement('button');
  button.className='btn primary';button.textContent='내 유료 보고서 작성 시작';
  button.addEventListener('click',async()=>{
   if(button.disabled)return;
   button.disabled=true;p.generationStarted=true;save(p);
   try{
    await window.LIVE_REPORT_UI.generatePurchased(p.analysisInput,
      {orderId:p.orderId,ownerToken:p.ownerToken});
   }catch{
    safeText(text,'보고서 생성 결과를 확인하지 못했습니다. 결제를 반복하지 말고 주문 상태를 확인해 주세요.');
   }
  });
  section.append(button);
 }
 body.append(section);
}
function showIssue(message,p){
 window.LIVE_REPORT_UI?.openResult?.();
 const body=find('reportBody');if(!body)return;
 body.replaceChildren();
 const section=document.createElement('section');section.className='section analysis-error';
 const title=document.createElement('h2');title.textContent='결제 상태 확인이 필요합니다';
 const paragraph=document.createElement('p');paragraph.textContent=message;
 section.append(title,paragraph);
 if(p?.orderId){
  const order=document.createElement('p');order.className='meta';
  order.textContent='주문 번호: '+p.orderId;
  section.append(order);
 }
 body.append(section);
}
async function status(p){
 return json('/api/checkout/status',{orderId:p.orderId,ownerToken:p.ownerToken});
}
async function restore(){
 const u=new URL(window.location.href),result=u.searchParams.get('checkout');
 const key=u.searchParams.get('paymentKey');
 const amount=u.searchParams.get('amount');
 const returnedOrder=u.searchParams.get('orderId');
 const errorCode=u.searchParams.get('code');
 if(result)cleanupUrl();
 const p=read();
 if(result==='failed'){
  if(p&&!p.confirmed&&!p.confirmAttempted)sessionStorage.removeItem(KEY);
  showIssue('결제 인증이 취소되거나 실패했습니다 ('+
   String(errorCode||'사용자 취소').slice(0,80)+'). 결제 승인은 요청하지 않았습니다.',p);
  return true;
 }
 if(result==='success'){
  if(!p||p.orderId!==returnedOrder||
     !Number.isSafeInteger(Number(amount))||Number(amount)!==p.amount||
     !key||key.length>200){
   showIssue('이 브라우저에 보관된 주문과 결제 인증 정보가 다릅니다. 결제를 다시 시도하지 말고 주문을 확인해 주세요.',p);
   return true;
  }
  if(p.confirmed){
   const checked=await status(p);
   if(checked.ok&&['verified-paid','delivery-bound'].includes(checked.data?.state))
    showPaidState(p,checked.data);
   else showIssue('이전에 확인한 결제의 현재 상태를 조회할 수 없습니다.',p);
   return true;
  }
  if(p.confirmAttempted){
   const checked=await status(p);
   if(checked.ok&&['verified-paid','delivery-bound'].includes(checked.data?.state)){
    p.confirmed=true;save(p);showPaidState(p,checked.data);
   }else showIssue('승인 요청이 이미 전송됐을 수 있습니다. 중복 승인을 시도하지 말고 주문 확인이 필요합니다.',p);
   return true;
  }
  // Save BEFORE the network request; after an unknown response never
  // send a second confirmation, even after browser refresh.
  p.confirmAttempted=true;save(p);
  const result=await json('/api/checkout/confirm',{
   orderId:p.orderId,ownerToken:p.ownerToken,paymentKey:key,amount:p.amount
  }).catch(()=>null);
  if(result?.ok&&result.data?.status==='verified-paid'){
   p.confirmed=true;save(p);showPaidState(p);
  }else showIssue('서버 결제 승인이 확인되지 않았습니다. 카드 결제 여부를 먼저 확인하고 주문 번호로 문의해 주세요. 자동 재승인은 하지 않습니다.',p);
  return true;
 }
 if(p?.confirmed){
  const check=await status(p).catch(()=>null);
  if(check?.ok&&['verified-paid','delivery-bound'].includes(check.data?.state)){
   showPaidState(p,check.data);return true;
  }
 }
 return false;
}
async function mount({container,analysisInput,proposal}={}){
 if(!container||!analysisInput?.calculationInput||
    proposal?.status!=='draft-not-for-sale')return;
 const state=read();
 if(state?.confirmed||state?.confirmAttempted||state?.orderId)return;
 const cfg=await config().catch(()=>null);
 if(!cfg||!container.isConnected)return;
 const notice=find('coverageSalesNotice');
 if(notice)notice.textContent='판매 준비 검증이 완료된 구성입니다. 제시한 최대 항목 수는 실제 완성 문단 수가 아닙니다. 아래 내용을 확인한 뒤 결제를 진행할 수 있습니다.';
 const panel=document.createElement('section');panel.className='section report-checkout';
 panel.id='reportCheckoutSection';
 const heading=document.createElement('h2');
 heading.textContent='맞춤형 유료 보고서 결제';
 const description=document.createElement('p');
 description.textContent=proposal.plannedChapterCount+'개 장, 최대 '+
  proposal.topicCandidateUpperBound+'개 후보 항목을 계산했습니다. 실제 작성 결과는 검수 중 일부 문단이 생략될 수 있습니다. 12장·35항목 고정 제공 상품이 아닙니다.';
 const price=document.createElement('p');price.className='meta';
 price.textContent='결제 금액: '+cfg.amount.toLocaleString('ko-KR')+
  '원 · 실제 생성 후 보고서가 기대에 미달하면 별도 검토가 필요합니다.';
 const ack=document.createElement('label');ack.className='meta';
 const checked=document.createElement('input');
 checked.type='checkbox';checked.id='adaptiveScopeAcknowledged';
 ack.append(checked,document.createTextNode(
  ' 실제 보고서 장 수와 항목 수는 출생정보 및 근거에 따라 달라지고, 결제 후 작성 실패 시 자동 재결제·재생성이 없음을 확인했습니다.'));
 const start=document.createElement('button');start.className='btn primary';
 start.textContent='결제수단 확인하기';
 const message=document.createElement('p');message.className='meta';
 message.setAttribute('aria-live','polite');
 panel.append(heading,description,price,ack,start,message);
 container.append(panel);
 start.addEventListener('click',async()=>{
  if(opening)return;
  if(!checked.checked){
   safeText(message,'맞춤형 제공 범위와 생성 실패 시 처리 방식을 확인해 주세요.');
   return;
  }
  opening=true;start.disabled=true;
  try{
   const order=await json('/api/checkout/start',{analysisInput});
   const data=order.data;
   if(!order.ok||data?.status!=='pending'||!data.orderId||
      !/^[a-f0-9]{64}$/.test(data.ownerToken||'')||
      data.amount!==cfg.amount||data.currency!=='KRW'||
      data.scope?.productMode!=='adaptive-v1'||
      data.scope?.plannedChapters!==proposal.plannedChapterCount||
      data.scope?.candidateTopicUpperBound!==proposal.topicCandidateUpperBound)
    throw Error('서버가 확인한 상품 범위 또는 가격과 화면의 정보가 일치하지 않습니다.');
   const pending={orderId:data.orderId,ownerToken:data.ownerToken,
    amount:data.amount,analysisInput,confirmed:false,
    confirmAttempted:false,generationStarted:false};
   save(pending);
   const toss=(await sdk())(cfg.clientKey);
   const widgets=toss.widgets({customerKey:'ANONYMOUS'});
   await widgets.setAmount({currency:'KRW',value:data.amount});
   start.hidden=true;
   const methods=document.createElement('div');methods.id='reportPaymentMethods';
   const agreements=document.createElement('div');agreements.id='reportPaymentAgreements';
   const pay=document.createElement('button');pay.className='btn primary';
   pay.textContent=data.amount.toLocaleString('ko-KR')+'원 결제하기';
   panel.append(methods,agreements,pay);
   await widgets.renderPaymentMethods({selector:'#reportPaymentMethods',variantKey:'DEFAULT'});
   await widgets.renderAgreement({selector:'#reportPaymentAgreements',variantKey:'DEFAULT'});
   pay.addEventListener('click',async()=>{
    if(pay.disabled)return;pay.disabled=true;
    try{
     await widgets.requestPayment({
      orderId:data.orderId,orderName:'사주 × MBTI 맞춤형 심화 보고서',
      successUrl:window.location.origin+'/?checkout=success',
      failUrl:window.location.origin+'/?checkout=failed'
     });
    }catch{
     pay.disabled=false;
     safeText(message,'결제 요청에 문제가 있었습니다. 결제 승인 여부를 확인하세요.');
    }
   });
   safeText(message,'결제 인증 후 서버가 금액과 주문 소유권을 다시 확인합니다.');
  }catch(e){
   safeText(message,e?.message||'결제 준비를 완료하지 못했습니다.');
   // A reserved order is never silently retried with a different scope.
  }finally{opening=false}
 });
}
window.REPORT_CHECKOUT_UI={mount,restore};
})();
