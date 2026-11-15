'use strict';
// Local-only expert handoff for two pre-existing source-bound manuscripts.
// This is NOT an expert opinion, paid writer, payment or release switch.
const fs=require('node:fs'),path=require('node:path');
const facts=require('./report-facts-node');
const chapters=require('./report-core-paid-1982-integrated-first-chapter');
const intake=require('./report-first-chapter-expert-intake');
const BASE={calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,
 gender:'male',mbti:'ISFP'};
const esc=v=>String(v??'').replace(/[&<>"']/g,
 c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function sourceIntake(){
 const run=time=>facts.build({...BASE,birthTime:time},2027);
 return intake.compare(run('14:20'),run('20:20'));
}
function build(){
 const record=sourceIntake(),pair=chapters.compare();
 if(record.authorizesSale!==false||record.authorizesPaidWriter!==false||
    record.releaseVerdict!=='not-approved'||record.questions?.length!==5||
    pair.kind!=='qa-two-complete-first-chapters-source-limited-v1'||
    pair.readyForCustomer!==false||pair.normalPaidWriterChanged!==false||
    pair.cases?.length!==2||pair.providerCalls!==0)
  throw Error('EXPERT_LOCAL_REVIEW_UNAPPROVED_RESEARCH_BOUNDARY');
 const items=pair.cases.map((doc,i)=>{
  const hour=i===0?'癸未':'丙戌',time=i===0?'14:20':'20:20';
  const matches=doc.paragraphs?.[2]?.conditionalRelationAudit?.volumeSix?.matches;
  const vol6=doc.competingClassicalClause,vol8=doc.extraTraditionalSource;
  if(doc.chartFingerprint?.split('/')[3]!==hour||
     doc.releaseVerdict!=='not-approved'||doc.readerValueApproved!==false||
     doc.methodProfessionallyApproved!==false||doc.checkoutEnabled!==false||
     doc.paragraphs?.length!==3||matches?.[0]?.exactPillar!=='癸丑'||
     (i===0&&matches?.[1]?.exactPillar!=='癸未')||
     (i===1&&matches?.length!==1)||
     !vol6?.url?.startsWith('https://zh.wikisource.org/')||
     !vol8?.url?.startsWith('https://zh.wikisource.org/'))
   throw Error('EXPERT_LOCAL_REVIEW_SOURCE_DRIFT:'+time);
  return {time,chart:doc.chartFingerprint,hour,
   paragraphs:doc.paragraphs.map(p=>({label:p.label,text:p.text})),
   sourceUrls:[vol6.url,vol8.url],
   volumeSixMatchedPositions:matches.map(x=>x.position),
   reviewedByExpert:false,forSale:false};
 });
 if(items[0].hour!==record.first.hourPillar||
    items[1].hour!==record.changedHour.hourPillar)
  throw Error('EXPERT_LOCAL_REVIEW_BINDING_DRIFT');
 return {kind:'offline-two-hour-expert-manuscript-review-v1',
  chartBinding:record.chartBinding,items,
  comparedHourPillars:items.map(x=>x.hour),
  questions:record.questions.map(x=>({id:x.id,question:x.question})),
  hasExpertDecision:false,saleApproved:false,providerCalls:0};
}
// Runs only inside locally generated HTML. Browser never submits to a server.
function localHandler(){
 document.getElementById('save').addEventListener('click',function(){
  const answers=Array.from(document.querySelectorAll('[data-question]')).map(function(p){
   const a={id:p.dataset.question};
   for(const k of ['conclusion','citationUrl','applicationRule','counterexample'])
    a[k]=p.querySelector('[data-field="'+k+'"]').value.trim();
   return a;
  });
  const submission={kind:'qa-proposed-method-decisions-v1',
   chartBinding:document.body.dataset.hash,
   comparedHourPillars:[document.body.dataset.hourA,document.body.dataset.hourB],
   authorizesSale:false,authorizesPaidWriter:false,
   reusableForOtherBirthCharts:false,answers};
  const file=new Blob([JSON.stringify(submission,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(file),a=document.createElement('a');
  a.href=url;a.download='first-chapter-expert-answers.json';
  document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  document.getElementById('message').textContent=
   '내 컴퓨터에 답변을 저장했습니다. 미완료 문항도 저장됩니다. 전문 검수와 별도 형식 검사가 필요합니다.';
 });
}
function render(data){
 if(data?.kind!=='offline-two-hour-expert-manuscript-review-v1'||
    data.hasExpertDecision!==false||data.saleApproved!==false||
    data.providerCalls!==0||data.items?.length!==2||
    data.questions?.length!==5||
    !/^[a-f0-9]{64}$/.test(data.chartBinding||''))
  throw Error('EXPERT_LOCAL_REVIEW_UNTRUSTED_RENDER');
 const cases=data.items.map(x=>
  '<article class="card"><h2>'+esc(x.time)+' — 비판매 첫 장</h2>'+
  '<p class="small">검증 계산: '+esc(x.chart)+'</p>'+
  x.paragraphs.map(p=>'<section><h3>'+esc(p.label)+'</h3><p>'+esc(p.text)+'</p></section>').join('')+
  '<p class="small">고전 6권 원문: '+esc(x.sourceUrls[0])+'</p>'+
  '<p class="small">고전 8권 원문: '+esc(x.sourceUrls[1])+'</p>'+
  '<p class="small">6권 조건 일치 위치: '+esc(x.volumeSixMatchedPositions.join(', '))+
  ' — 실제 삶의 결론은 미확인</p></article>').join('');
 const labels={conclusion:'이 질문에 대한 결론',
  citationUrl:'직접 확인한 원전 URL (https)',
  applicationRule:'해석 규칙과 이 사례의 적용 이유',
  counterexample:'이 규칙의 반례·제외 조건'};
 const questions=data.questions.map((q,i)=>
  '<fieldset data-question="'+esc(q.id)+'"><legend>'+(i+1)+'. '+esc(q.question)+'</legend>'+
  Object.keys(labels).map(k=>'<label>'+labels[k]+
    (k==='citationUrl'?'<input type="url" data-field="'+k+'" placeholder="https://...">':
    '<textarea rows="3" maxlength="2200" data-field="'+k+'"></textarea>')+
   '</label>').join('')+'</fieldset>').join('');
 const css='body{margin:0;background:#f3f5f8;color:#192b3e;font:15px/1.8 system-ui,sans-serif}main{max-width:1100px;margin:auto;padding:22px 15px 80px}'+
  '.notice{background:#fff7e7;padding:15px;border:1px solid #e8d2ac;border-radius:12px}'+
  '.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.card,fieldset{background:#fff;border:1px solid #dce3eb;border-radius:12px;padding:20px;min-width:0}'+
  'section{border-top:1px solid #e5e8ee}section p{white-space:pre-wrap}fieldset{margin:17px 0}legend{font-weight:700}'+
  'label{display:block;font-weight:600;margin:12px 0}textarea,input{display:block;width:100%;box-sizing:border-box;border:1px solid #9eb0c4;padding:9px;font:inherit;border-radius:6px}'+
  '.small{color:#58687b;font-size:12px;overflow-wrap:anywhere}button{background:#225d95;color:#fff;border:0;border-radius:9px;padding:13px 20px;font:inherit;cursor:pointer}'+
  '@media(max-width:760px){.grid{grid-template-columns:1fr}}';
 return '<!doctype html><html lang="ko"><head><meta charset="utf-8">'+
  '<meta name="viewport" content="width=device-width,initial-scale=1">'+
  '<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; script-src &#39;unsafe-inline&#39;; style-src &#39;unsafe-inline&#39;; connect-src &#39;none&#39;; form-action &#39;none&#39;; img-src &#39;none&#39;; object-src &#39;none&#39;; base-uri &#39;none&#39;">'+
  '<title>유료 사주 첫 장 · 전문가 독립 검토표</title><style>'+css+'</style></head>'+
  '<body data-hash="'+esc(data.chartBinding)+'" data-hour-a="'+esc(data.comparedHourPillars[0])+
  '" data-hour-b="'+esc(data.comparedHourPillars[1])+'"><main>'+
  '<h1>유료 첫 장 — 고전 규칙 전문가 검토</h1>'+
  '<p class="notice"><b>연구용, 판매 미승인.</b> 아래는 실제 구매자의 정보가 아닌 고정 계산 사례입니다. 두 원고 모두 기존의 미승인 편집 시안입니다. 원문 주소를 복사해 독립 검증하세요. 모든 답변은 이 기기에만 저장됩니다. 실제 고객 개인정보는 입력하지 마세요.</p>'+
  '<div class="grid">'+cases+'</div><h2>독립 검토 5개 질문</h2>'+
  '<p>결론·문헌·적용 규칙·반례를 각각 답하세요. 같은 설명의 복제는 형식 검사에서 차단됩니다.</p>'+
  questions+'<button id="save" type="button">답변 JSON을 내 컴퓨터에 저장</button>'+
  '<p id="message" role="status"></p><p class="small">저장 및 형식 검사만으로 전문가 자격·해석 진실성·유료 상품 품질·결제·배포가 승인되지 않습니다. 공개 저장소에 답변 파일을 올리지 마세요.</p>'+
  '</main><script>('+localHandler.toString()+')();</script></body></html>';
}
function check(answer){
 const result=intake.screen(sourceIntake(),answer);
 if(result.canGeneratePaidReport!==false||result.canSell!==false||
    result.releaseVerdict!=='not-approved')
  throw Error('EXPERT_LOCAL_REVIEW_SALE_GATE_BROKEN');
 return {status:result.status,errors:result.errors,
  methodProfessionallyApproved:false,saleApproved:false};
}
function main(args=process.argv.slice(2)){
 if(args.length!==2||!path.isAbsolute(args[1]))
  throw Error('Usage: node report-first-chapter-expert-local-review.js --write /absolute/private/review.html OR --check /absolute/private/answers.json');
 if(args[0]==='--write'&&path.extname(args[1]).toLowerCase()==='.html'){
  fs.writeFileSync(args[1],render(build()),{flag:'wx',mode:0o600});
  console.log('LOCAL_EXPERT_REVIEW_HTML_CREATED: sales=false, paidCalls=0');
 }else if(args[0]==='--check'&&path.extname(args[1]).toLowerCase()==='.json'){
  if(fs.statSync(args[1]).size>131072)throw Error('EXPERT_LOCAL_REVIEW_FILE_TOO_LARGE');
  const result=check(JSON.parse(fs.readFileSync(args[1],'utf8')));
  console.log(JSON.stringify(result,null,2));
  if(result.errors.length)process.exitCode=1;
 }else throw Error('EXPERT_LOCAL_REVIEW_INVALID_COMMAND');
}
if(require.main===module){try{main()}catch(e){
 console.error('EXPERT_LOCAL_REVIEW_ERROR:'+e.message);process.exitCode=1;
}}
module.exports={build,render,check,main};
