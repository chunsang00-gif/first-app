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

// A buyer must see the same chapters the server later reserves. Counts
// alone are not a binding description of a chart-scoped paid product.
const CHAPTER_LABELS=Object.freeze({
 saju_core:'사주 기본 풀이',mbti_contradiction:'사주와 MBTI 비교',
 decision:'선택과 결정',money:'금전',career:'직업과 일',
 relationship:'인간관계',stress:'압박과 대처',
 integrated_judgment:'종합 풀이',year_2027:'2027년 기본 해석',
 year_2027_money:'2027년 금전',year_2027_career:'2027년 직업',
 year_2027_relationship:'2027년 관계'
});
const CANONICAL_IDS=Object.freeze(Object.keys(CHAPTER_LABELS));
function displayedChapterIds(proposal){
 const main=proposal?.mainChapterIds,extra=proposal?.conditional2027ChapterIds;
 if(!Array.isArray(main)||!Array.isArray(extra)||
    !Number.isInteger(proposal.plannedChapterCount)||
    !Number.isInteger(proposal.topicCandidateUpperBound)||
    main.length!==proposal.mainChapterCount||
    extra.length!==proposal.conditionalChapterCount)return null;
 const ids=[...main,...extra];
 if(ids.length!==proposal.plannedChapterCount||
    ids.length<3||!main.includes('saju_core')||
    !main.includes('year_2027')||
    new Set(ids).size!==ids.length||
    main.some(id=>!Object.hasOwn(CHAPTER_LABELS,id)||id.startsWith('year_2027_'))||
    extra.some(id=>!Object.hasOwn(CHAPTER_LABELS,id)||!id.startsWith('year_2027_'))||
    JSON.stringify(ids)!==JSON.stringify(CANONICAL_IDS.filter(id=>ids.includes(id))))
  return null;
 return ids;
}

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
// Recover an existing OWNER-BOUND order from server state, never from a URL.
// Browser storage loss must not require a second payment or AI generation.
function restoreOwnerJob(p,info){
 if(info?.state!=='delivery-bound'||!p?.confirmed||
    !/^[a-f0-9]{64}$/.test(p.ownerToken||'')||
    !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(info.jobId||''))
  return false;
 const id=info.jobId;
 if(sessionStorage.getItem('reportJobId')!==id||
    sessionStorage.getItem('reportJobAccessToken')!==p.ownerToken){
  sessionStorage.removeItem('reportCompleted');
  sessionStorage.removeItem('reportQualityDraft');
 }
 sessionStorage.setItem('reportJobAccessToken',p.ownerToken);
 sessionStorage.setItem('reportJobId',id);
 return true;
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
 if(info?.state==='delivery-bound'){
  if(restoreOwnerJob(p,info)){
   const report=document.createElement('p');
   report.textContent='이미 연결된 보고서가 있습니다. 중복 생성하지 않고 기존 작업을 조회합니다.';
   section.append(report);
   const resume=document.createElement('button');
   resume.className='btn primary';resume.textContent='기존 보고서 조회';
   resume.addEventListener('click',()=>window.LIVE_REPORT_UI?.resume?.());
   section.append(resume);
  }else{
   const notice=document.createElement('p');
   notice.textContent='결제된 주문의 기존 작업 번호를 확인하지 못했습니다. 재결제하거나 재생성하지 말고 주문 번호로 운영자에게 문의해 주세요.';
   section.append(notice);
  }
 }else if(p.generationStarted){
  const notice=document.createElement('p');
  notice.textContent='보고서 생성 요청의 완료 여부가 불확실합니다. 중복 생성하지 말고 주문 번호로 운영자에게 확인해 주세요.';
  section.append(notice);
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
function showOrderState(p,response){
 const state=response?.ok?response.data?.state:null;
 const delivery=response?.ok?response.data?.deliveryStatus:null;
 if(state==='delivery-bound'&&
    ['failed','rejected','interrupted','missing','review-required'].includes(delivery)){
  if(!p.confirmed){p.confirmed=true;save(p)}
  // Never imply an automatic refund or offer a fresh charge/retry.
  const explanation=delivery==='rejected'?
   '보고서가 품질 검증을 통과하지 못했습니다.':
   delivery==='interrupted'?
   '보고서 작성이 중단되어 완료 여부를 다시 확인해야 합니다.':
   delivery==='missing'?
   '주문에 연결된 보고서 기록을 확인할 수 없습니다.':
   delivery==='review-required'?
   '보고서의 완료 검증이 확인되지 않았습니다.':
   '보고서 작성에 실패했습니다.';
  showIssue(explanation+
   ' 결제는 자동 환불된 상태가 아닙니다. 다시 결제하거나 자동 재생성하지 마세요. 주문 번호를 보관하고 운영자에게 확인 및 환불 처리를 요청해 주세요.',p);
 }else if(state==='verified-paid'||state==='delivery-bound'){
  if(!p.confirmed){p.confirmed=true;save(p)}
  showPaidState(p,response.data);
 }else if(state==='refunded'){
  showIssue('해당 주문은 환불 처리되었습니다. 이 결제로 보고서를 새로 생성할 수 없습니다.',p);
 }else if(state==='confirmation-uncertain'){
  showIssue('결제 승인 결과가 아직 확인되지 않았습니다. 자동 재승인이나 재결제를 진행하지 말고 주문 번호로 상태를 확인해 주세요.',p);
 }else if(state==='awaiting-provider-confirmation'){
  showIssue('이 주문에 대한 결제 승인이 아직 요청되지 않았습니다. 중복 결제에 주의해 주세요.',p);
 }else{
  showIssue('주문 상태를 확인할 수 없습니다. 새로운 결제를 진행하지 말고 주문 번호로 문의해 주세요.',p);
 }
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
  if(p.confirmed||p.confirmAttempted){
   // Query only: a previous unknown outcome must NEVER repeat confirmation.
   showOrderState(p,await status(p).catch(()=>null));
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
  }else{
   // A lost confirmation response may still be a successful payment.
   // Query the stored result without a second provider confirmation.
   showOrderState(p,await status(p).catch(()=>null));
  }
  return true;
 }
 if(p?.orderId){
  // Refresh or network loss must not silently hide an unresolved order.
  showOrderState(p,await status(p).catch(()=>null));
  return true;
 }
 return false;
}
async function mount({container,analysisInput,proposal}={}){
 if(!container||!analysisInput?.calculationInput||
    proposal?.status!=='draft-not-for-sale')return;
 const state=read();
 if(state?.confirmed||state?.confirmAttempted||state?.orderId)return;
 const displayedIds=displayedChapterIds(proposal);
 if(!displayedIds)return;
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
 const chapterTitle=document.createElement('p');
 chapterTitle.textContent='결제 전에 확인할 실제 작성 후보 장 목록';
 const chapterList=document.createElement('ul');
 for(const id of displayedIds){
  const item=document.createElement('li');
  item.textContent=CHAPTER_LABELS[id]+
   (id.startsWith('year_2027_')?' (별도 근거가 있을 때만)':'');
  chapterList.append(item);
 }
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
 panel.append(heading,description,chapterTitle,chapterList,price,ack,start,message);
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
      data.scope?.candidateTopicUpperBound!==proposal.topicCandidateUpperBound||
       data.scope?.countsAreUpperBounds!==true||
       data.scope?.fixed12ChaptersPromised!==false||
       data.scope?.fixed35TopicsPromised!==false||
       JSON.stringify(data.scope?.plannedChapterIds)!==JSON.stringify(displayedIds))
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
