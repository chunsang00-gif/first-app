'use strict';
// Offline HUMAN comparison of the SAME fixed synthetic chart's original
// already-billed paid first chapter and its actual current free preview.
// No new model calls, external content, public text logs or sales approval.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const fixture=require('./qa-current-core-preflight');
const facts=require('./report-facts-node');
const free=require('./report-reading-sample');
const EXPECTED_HASH='dd5c1a38775aaab052363a41c2ddab7ea7336d8db456140442bc0bb78eda6170';
const RUN_ID=42369675176;
const clean=v=>String(v==null?'':v);
const html=v=>clean(v).replace(/&/g,'&amp;').replace(/</g,'&lt;')
 .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const sha=v=>crypto.createHash('sha256').update(JSON.stringify(v),'utf8').digest('hex');
const QUESTIONS=Object.freeze([
 ['novel','유료 원문에 무료 예시로는 알 수 없던 해석이 명확하게 있는가?'],
 ['source','그 추가 해석에 검증된 출생 위치와 전통 해석 규칙이 연결되는가?'],
 ['specificity','출생정보가 달라지면 결론도 달라지는 이유가 설명되는가?'],
 ['readability','용어 강의·반복·막연한 조언 없이 이해할 수 있는가?'],
 ['worthiness','무료를 먼저 읽어도 유료 첫 장의 추가 가치를 느끼는가?']
]);
function build(record){
 if(record?.kind!=='private-first-chapter-original-provider-response'||
    record.providerCalls!==1||record.model!=='gpt-4.1'||
    record.requestHash!==EXPECTED_HASH||
    JSON.stringify(record.sample)!==JSON.stringify(fixture.SAMPLE))
  throw Error('PRIVATE_PAID_FIRST_CHAPTER_IDENTITY_MISMATCH');
 const packet=facts.build(fixture.SAMPLE,2027);
 if(packet?.status!=='ready'||Object.entries(fixture.CHART)
  .some(([p,value])=>packet.chart?.[p]!==value))
  throw Error('HUMAN_COMPARISON_FREE_CHART_DRIFT');
 const original=record.response?.chapters?.saju_core;
 if(!original||typeof original.title!=='string'||
    typeof original.keyJudgment!=='string'||
    typeof original.paragraphs?.strength?.text!=='string'||
    !original.paragraphs.strength.text.trim())
  throw Error('PRIVATE_PAID_FIRST_CHAPTER_MISSING');
 const baseline=free.build(packet);
 if(baseline?.status!=='calculated-example'||baseline.modelCalls!==0||
    baseline.completedPremiumParagraphs!==0)
  throw Error('HUMAN_COMPARISON_FREE_PREVIEW_DRIFT');
 const relevant=new Set(['birth-month','month-visible-link','year-hour']);
 const freeCards=baseline.cards.filter(c=>relevant.has(c.id))
  .map(c=>({id:c.id,title:c.title,text:c.text}));
 if(!freeCards.some(c=>c.id==='birth-month')||!freeCards.length)
  throw Error('HUMAN_COMPARISON_FREE_CORE_MISSING');
 const paidParagraphs=['temperament','strength'].flatMap(id=>{
  const p=original.paragraphs?.[id];
  return typeof p?.text==='string'&&p.text.trim()?
   [{id,label:clean(p.label||id),text:p.text}]:[];
 });
 const paid={title:original.title,keyJudgment:original.keyJudgment,
  paragraphs:paidParagraphs};
 return Object.freeze({
  kind:'same-chart-human-first-chapter-value-comparison-v1',
  sourceRun:RUN_ID,sourceHash:sha({paid,freeCards}),
  freeCards,paid,questions:QUESTIONS.map(([id,label])=>({id,label})),
  actualPaidProviderCallsInArchive:1,additionalModelCalls:0,
  humanReviewRequired:true,reviewStatus:'not-assessed',
  professionalInterpretationApproved:false,customerSaleApproved:false,
  releaseVerdict:'not-approved'
 });
}
function renderHtml(r){
 if(r?.kind!=='same-chart-human-first-chapter-value-comparison-v1'||
   !/^[a-f0-9]{64}$/.test(r.sourceHash||'')||
   !r.humanReviewRequired||r.customerSaleApproved!==false||
   r.releaseVerdict!=='not-approved')throw Error('UNVERIFIED_PRIVATE_REVIEW_DATA');
 const cards=(r.freeCards||[]).map(c=>'<article><h3>'+html(c.title)+
  '</h3><p>'+html(c.text)+'</p></article>').join('');
 const paragraphs=(r.paid.paragraphs||[]).map(p=>'<article><h3>'+
  html(p.label)+'</h3><p>'+html(p.text)+'</p></article>').join('');
 const questionRows=r.questions.map(q=>
  '<label for="q-'+html(q.id)+'">'+html(q.label)+'</label>'+
  '<select data-question="'+html(q.id)+'" id="q-'+html(q.id)+'">'+
   '<option value="undecided">판정 전</option>'+
   '<option value="yes">충족</option>'+
   '<option value="no">미흡</option>'+
   '<option value="uncertain">근거 부족</option></select>').join('');
 const script=[
  "'use strict';",
  "document.getElementById('save').addEventListener('click',function(){",
  "const choices=Array.from(document.querySelectorAll('select[data-question]')).map(function(s){return {id:s.dataset.question,answer:s.value};});",
  "const decision=document.getElementById('decision').value;",
  "if(choices.some(function(x){return x.answer==='undecided';})||decision==='undecided'){document.getElementById('message').textContent='모든 항목과 최종 판단을 먼저 선택하세요.';return;}",
  "const result={kind:'private-first-chapter-human-rating-v1',sourceHash:document.body.dataset.sourceHash,",
  "sourceRun:42369675176,criteria:choices,editorialDecision:decision,",
  "newInformation:document.getElementById('newInfo').value.trim(),",
  "reason:document.getElementById('reason').value.trim(),",
  "technicalTestsNotHumanApproval:true,customerSaleApproved:false,releaseVerdict:'not-approved'};",
  "const url=URL.createObjectURL(new Blob([JSON.stringify(result,null,2)],{type:'application/json'}));",
  "const a=document.createElement('a');a.href=url;a.download='first-chapter-human-review.json';",
  "document.body.append(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);",
  "document.getElementById('message').textContent='평가만 이 PC에 저장했습니다. 출시는 별도 승인이 필요합니다.';",
  "});"
 ].join('\n');
 return '<!doctype html><html lang="ko"><head><meta charset="utf-8">'+
  '<meta name="viewport" content="width=device-width,initial-scale=1">'+
  '<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; style-src &#39;unsafe-inline&#39;; script-src &#39;unsafe-inline&#39;; connect-src &#39;none&#39;; img-src &#39;none&#39;; form-action &#39;none&#39;; object-src &#39;none&#39;; base-uri &#39;none&#39;">'+
  '<title>동일 명식 무료·유료 첫 장 비교 — 비공개</title>'+
  '<style>body{margin:0;background:#f3f4f7;color:#172435;font:16px/1.7 system-ui,sans-serif}'+
  'main{max-width:1180px;margin:auto;padding:28px 18px}h1{font-size:26px}h2{font-size:21px}h3{font-size:16px}'+
  '.notice{background:#fff8e8;padding:15px 18px;border-radius:12px;border:1px solid #e6d3a7}'+
  '.grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:24px 0}'+
  '.panel{background:white;border:1px solid #dbe2ec;border-radius:16px;padding:22px;min-width:0}'+
  'article{padding:14px 0;border-top:1px solid #e8edf2}article p{white-space:pre-wrap;word-break:keep-all}'+
  '.form{display:grid;grid-template-columns:2fr 1fr;gap:10px;align-items:center}'+
  '.form label{font-weight:650}.form select,textarea{width:100%;padding:10px;border:1px solid #adb8c5;border-radius:9px;font:inherit}'+
  'textarea{resize:vertical;min-height:80px}button{padding:12px 18px;background:#243b56;color:#fff;border:0;border-radius:10px;font:inherit;cursor:pointer}'+
  'small{color:#64748b}#message{min-height:22px;color:#334155}'+
  '@media(max-width:760px){.grid{grid-template-columns:1fr}.form{grid-template-columns:1fr}}'+
  '</style></head><body data-source-hash="'+html(r.sourceHash)+'"><main>'+
  '<h1>같은 출생정보의 무료·유료 첫 장 비교</h1>'+
  '<p class="notice">기존에 한 번 생성한 유료 원문과 현재 무료 계산 예시를 나란히 보여줍니다. 두 자료를 사람 눈으로 비교하는 검토용 화면입니다. 자동 점수나 검사 통과는 유료 출시 승인이 아닙니다. 이 파일에는 원문이 담겨 있으니 공개 업로드하거나 공유하지 마세요.</p>'+
  '<div class="grid"><section class="panel"><h2>무료 계산 예시 — 동일 명식</h2>'+cards+
  '</section><section class="panel"><h2>당시 실제 유료 첫 장 — 원문</h2>'+
  '<h3>'+html(r.paid.title)+'</h3><p>'+html(r.paid.keyJudgment)+'</p>'+
  paragraphs+'</section></div><section class="panel"><h2>독자 가치 직접 평가</h2>'+
  '<p>무조건 통과시키지 말고 무료에서 이미 설명한 내용이라면 미흡을 선택하세요.</p>'+
  '<div class="form">'+questionRows+'</div>'+
  '<h3>무료에는 없던 구체적인 새 해석 한 가지</h3>'+
  '<textarea id="newInfo" placeholder="새로운 해석이 없다면 없다고 기록"></textarea>'+
  '<h3>판정 근거</h3><textarea id="reason" placeholder="중복 문장·출처·조건을 직접 비교"></textarea>'+
  '<p><label for="decision">최종 편집 판단</label> '+
  '<select id="decision"><option value="undecided">판정 전</option>'+
  '<option value="needs-rewrite">재작성 필요</option>'+
  '<option value="requires-expert">전문가 확인 필요</option>'+
  '<option value="human-review-acceptable">일반 독자 품질은 수용 가능(출시 승인 아님)</option></select></p>'+
  '<button id="save" type="button">개인 PC에 평가 JSON 저장</button>'+
  '<p id="message" role="status"></p><small>저장되는 평가 파일에는 원문·출생정보를 넣지 않습니다. 어느 선택도 고객 판매 승인을 자동으로 바꾸지 않습니다. 네트워크 사용 없음.</small>'+
  '</section></main><script>'+script+'</script></body></html>';
}
function main(){
 const args=process.argv.slice(2);
 if(args.length!==2||!args.every(p=>path.isAbsolute(p)))
  throw Error('Usage: node qa-first-chapter-human-value-review.js /absolute/private-qa-first-chapter-provider-calls.json /absolute/private-review.html');
 const r=build(JSON.parse(fs.readFileSync(args[0],'utf8')));
 fs.writeFileSync(args[1],renderHtml(r),{mode:0o600,flag:'wx'});
 console.log('PRIVATE_SAME_CHART_EDITORIAL_HTML_CREATED: no paid calls; human review required; do not publish');
}
if(require.main===module){
 try{main()}catch(e){console.error('PRIVATE_EDITORIAL_REVIEW_FAILED:'+e.message);process.exitCode=1;}
}
module.exports={build,renderHtml,QUESTIONS,RUN_ID};
