'use strict';
// Work65: ONE reproducible offline specialist handoff for S02.
// This prepares a question to an external independent reviewer; it never
// impersonates an expert opinion or changes checkout, paid writer or deploy.
const assert=require('node:assert/strict');
const work61=require('./qa-work61-nine-case-human-review-packet');
const CASE='S02';
const SOURCES=Object.freeze([
 // Main self-contained classical clause, plus an annotated second edition.
 'https://skqs.dazhishi.com/show_grdorvjlya.html',
 'https://www.mczwl.cn/guji/sanming/smth-09-002'
]);
// Work67: independently checked against BOTH cited public source pages on
// 2026-11-22. This establishes the text's wording, NOT its predictive truth
// or applicability to the whole chart. Historic outcomes cannot be sold.
const TEXT_SCOPE=Object.freeze({
 chapter:'六己日乙丑時斷',
 generalDayStem:'己',
 generalHour:'乙丑',
 visibleHourStem:'乙',
 hiddenHourStem:'癸',
 caseDayHour:'己亥日乙丑時',
 caseExplicitMonths:Object.freeze(['卯','申']),
 actualCalculatedMonth:'未',
 specificMonthRuleMatched:false,
 generalTextMentionsBothStems:true,
 dayHourRuleProfessionallyApplied:false,
 branchRelationAndMonthPriorityProfessionallyResolved:false,
 personalWealthPredictionVerified:false
});
const QUESTIONS=Object.freeze([
 {id:'original-clause',
  title:'원문 범위와 글자 해석',
  question:'《삼명통회》 六己日乙丑時斷에서 己亥日乙丑時에 적용되는 정확한 원문을 확인하십시오. 시주 겉글자 乙과 시지 속글자 癸의 역할을 어떻게 구분해야 하며, 일반 규칙과 개별 조항은 어디서 갈라집니까?'},
 {id:'month-exclusion',
  title:'未월과 卯·申월 조건',
  question:'원문 개별 조항의 卯月·申月 조건이 未월인 S02에서 불충족하는지 확인하십시오. 불충족한다면 어떤 긍정적 결과·재물/관직 문장을 명시적으로 제외해야 합니까?'},
 {id:'full-chart-priority',
  title:'戌·未·丑 관계와 다른 자리의 우선순위',
  question:'연지 戌·월지 未·시지 丑과 일주 己亥를 함께 볼 때, 월령과 형·충을 어떤 학파·문헌 규칙에 따라 우선 판단합니까? 적용 여부가 바뀌는 반례도 제시하십시오.'},
 {id:'independent-reader-value',
  title:'무료 대비 새로운 원고가 실제로 가능한가',
  question:'아래 무료 카드와 구별되는, 근거가 있는 독자용 설명을 실제로 한 단락 제시하십시오. 독자의 적금 유지 대 대출 상환 고민을 예측으로 해결하지 말고 확인해야 할 현실 금융 조건도 구분하십시오. 차별화가 불가능하면 명확히 불가능이라고 판정하십시오.'}
]);
const syntheticQuestion='적금을 유지할지 대출을 상환할지 고민입니다.';
function source(){
 const original=work61.build();
 const one=original.cases.find(x=>x.caseId===CASE);
 if(!one||one.syntheticOnly!==true||
  one.birthDate!=='1982-07-15'||one.birthTime!=='02:20'||
  one.domain!=='money'||one.readerQuestion!==syntheticQuestion||
  one.selectedHiddenStem!=='癸'||one.selectedTenGod!=='편재'||
  one.expertMethodPriorityVerified!==false||
  one.productVerdict!=='NOT_APPROVED'||
  one.actualPaidManuscriptForThisCase!=='not-generated')
  throw Error('S02_EXPERT_HANDOFF_SOURCE_BINDING_CHANGED');
 const chart=['year','month','day','hour'].map(k=>one.chart?.[k]);
 assert.deepEqual(chart,['壬戌','丁未','己亥','乙丑'],
  'the printed classical clause must match the REAL computed chart');
 if(!Array.isArray(one.currentFreeCards)||one.currentFreeCards.length<2)
  throw Error('S02_EXPERT_HANDOFF_FREE_BASELINE_MISSING');
 return Object.freeze({
  kind:'offline-s02-independent-expert-review-handoff-v1',caseId:CASE,
  chart:chart.join(' / '),birthDate:one.birthDate,birthTime:one.birthTime,
  readerQuestion:one.readerQuestion,
  sourceRef:one.selectedSource,hiddenStem:one.selectedHiddenStem,
  tenGod:one.selectedTenGod,
  freeCards:one.currentFreeCards,
  sourceUrls:SOURCES.slice(),textScope:TEXT_SCOPE,
  questions:QUESTIONS.map(x=>({...x})),
  requiresIndependentProfessionalReview:true,
  expertIdentityVerified:false,claimedMethodVerified:false,
  newlyAuthoredCustomerManuscriptApproved:false,
  licensedForPaidGeneration:false,approvedForSale:false,
  checkoutEnabled:false,paidProviderCalls:0
 });
}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({
 '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[c]));
function saveLocal(){
 const q=Array.from(document.querySelectorAll('[data-review]')).map(box=>{
  const fields={};for(const field of box.querySelectorAll('[data-answer]'))
   fields[field.dataset.answer]=field.value.trim();
  return {id:box.dataset.review,...fields};
 });
 const result={
  kind:'s02-independent-expert-proposed-answers-v1',
  caseId:'S02',computedChart:document.body.dataset.chart,
  reviewedBy:document.getElementById('reviewer').value.trim(),
  institutionOrQualification:document.getElementById('qualification').value.trim(),
  answeredAtLocalDate:document.getElementById('reviewDate').value,
  answers:q,
  expertiseIndependentlyAuthenticated:false,
  classicalApplicabilityIndependentlyVerified:false,
  premiumManuscriptApproved:false,
  releaseApproved:false,authorizesPayment:false,authorizesDeployment:false
 };
 const file=new Blob([JSON.stringify(result,null,2)],{type:'application/json'});
 const objectUrl=URL.createObjectURL(file);
 const a=document.createElement('a');a.href=objectUrl;
 a.download='S02-private-expert-proposed-answers.json';
 document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(objectUrl);
 document.getElementById('saved').textContent='이 기기에만 JSON을 저장했습니다. 내용의 진위와 검토자 자격은 별도로 확인해야 하며, 이 파일만으로 출시가 승인되지는 않습니다.';
}
function html(){
 const x=source();
 const free=x.freeCards.map(y=>'<section class="free"><h3>'+
  esc(y.title)+'</h3><p>'+esc(y.text)+'</p></section>').join('');
 const qs=x.questions.map((q,i)=>'<fieldset data-review="'+esc(q.id)+'">'+
  '<legend>'+(i+1)+'. '+esc(q.title)+'</legend><p>'+esc(q.question)+'</p>'+
  ['conclusion','sourceUrl','applicableConditions','excludedConditions','readerParagraph']
   .map((key,j)=>'<label>'+[
    '전문가의 판정','직접 대조한 원문 주소',
    '실제 명식의 적용 조건','비적용 조건·반례','독자용 예시 문단(불가능하면 이유)'
   ][j]+'<textarea data-answer="'+key+'" rows="'+(j===4?5:3)+'" maxlength="3000"></textarea></label>')
   .join('')+'</fieldset>').join('');
 const css='*{box-sizing:border-box}body{margin:0;color:#172b42;background:#f4f6fa;font:15px/1.65 system-ui,sans-serif}main{max-width:1020px;margin:auto;padding:24px 16px 64px}h1{line-height:1.25}h2{margin-top:30px}p{white-space:pre-wrap}section,fieldset{background:#fff;border:1px solid #dbe1eb;border-radius:10px;padding:14px 18px;margin:12px 0}section.free{background:#fbfcfe}legend{font-weight:700;background:#e8eef9;padding:4px 10px;border-radius:8px}label{display:block;font-weight:650;margin:12px 0}textarea,input{display:block;width:100%;min-width:0;padding:10px;border:1px solid #9aaec3;border-radius:7px;font:inherit;resize:vertical}small,.hint{color:#415970}button{background:#1b5e95;color:white;padding:13px 20px;border:0;border-radius:9px;font:inherit;cursor:pointer}.notice{border-left:4px solid #bf7d22;padding:12px 16px;background:#fff6df}.sources{overflow-wrap:anywhere}@media(min-width:760px){.free-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}}';
 return '<!doctype html><html lang="ko"><head><meta charset="utf-8">'+
  '<meta name="viewport" content="width=device-width,initial-scale=1">'+
  '<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; style-src &#39;unsafe-inline&#39;; script-src &#39;unsafe-inline&#39;; connect-src &#39;none&#39;; form-action &#39;none&#39;; img-src &#39;none&#39;; object-src &#39;none&#39;; base-uri &#39;none&#39;">'+
  '<title>S02 사주 유료 첫 장 — 독립 명리 전문가 검토</title><style>'+css+'</style></head>'+
  '<body data-chart="'+esc(x.chart)+'"><main><h1>S02 — 유료 첫 장 독립 검토표</h1>'+
  '<p class="notice"><strong>합성 사례 · 실제 유료 원고 없음 · 판매 미승인</strong>. 전문가가 실제 고전 원문과 명식 전체의 조건을 직접 판단하기 위한 자료입니다. 작성한 답변은 브라우저에서만 저장되며 외부로 전송되지 않습니다. 사주와 실제 금융성과의 인과 관계를 주장하지 마십시오.</p>'+
  '<p><b>원국:</b> '+esc(x.chart)+'<br><b>입력:</b> 양력 '+esc(x.birthDate)+' '+esc(x.birthTime)+
  ' / <b>고민:</b> '+esc(x.readerQuestion)+'<br><b>추가 유료 계산 후보:</b> 시지 속글자 '+esc(x.hiddenStem)+'('+esc(x.tenGod)+')</p>'+
  '<h2>① 원문에서 확인한 내용과 아직 판단할 수 없는 부분</h2>'+
  '<section><p><b>일·시 조합:</b> '+esc(x.textScope.caseDayHour)+' (명식과 글자 일치)</p>'+
  '<p><b>일반 조항:</b> 己일에 乙丑시가 왔을 때 겉의 乙과 丑 안의 癸를 함께 언급합니다. 이는 전통 문헌의 표현이며 개인별 미래·재물 결과를 검증한 것은 아닙니다.</p>'+
  '<p><b>개별 조항에 적힌 조건:</b> 卯월, 또는 申월과 水木運의 조합. <b>이 사례의 계산된 출생월:</b> 未월. 따라서 그 개별 월 조건의 결과를 S02의 재물운·관직·적금·대출 조언으로 가져오면 안 됩니다.</p>'+
  '<p><b>추가 미해결:</b> 원문의 戌·未 관련 형·충 표현이 S02 전체 명식에서 어떤 우선순위를 갖는지는 검증되지 않았습니다. 이를 재물 증가 공식처럼 취급하지 마십시오.</p>'+
  '<p class="hint">일부 온라인 전사본에서 己/已/巳가 혼용되는 대목이 있어 글자가 비슷하다고 간주하지 말고 원문을 교차 확인하십시오. 아래는 원문 주소 두 곳입니다.</p></section>'+
  '<p class="sources">'+x.sourceUrls.map(u=>esc(u)).join('\n')+'</p>'+
  '<h2>② 동일 명식에 현재 실제로 공개된 무료 풀이</h2><div class="free-grid">'+free+'</div>'+
  '<h2>③ 외부 전문가의 원문·반례·독자 가치 판정</h2>'+
  '<p>아래 각 항목을 별도로 검토해야 합니다. 긍정 판단을 강제하지 않으며, 근거가 없으면 비적용이라고 기록하십시오.</p>'+
  '<label>검토자 성명 또는 식별명<input id="reviewer" autocomplete="off"></label>'+
  '<label>검토 근거가 되는 전문분야·자격/소속<input id="qualification" autocomplete="off"></label>'+
  '<label>검토 일자<input id="reviewDate" type="date"></label>'+
  qs+'<button id="save" type="button">검토 답변을 이 기기에만 저장(JSON)</button>'+
  '<p id="saved" role="status"></p><small>검토자의 이름 기입이나 JSON 파일 생성만으로 자격·전통 해석·유료 원고가 인증되지 않습니다. 이 답변을 공개 GitHub에 업로드하지 마세요. 실제 결제, 유료 AI, 운영 배포는 여전히 금지됩니다.</small>'+
  '</main>'+
  '<script>'+saveLocal.toString()+';document.getElementById("save").addEventListener("click",saveLocal);</script></body></html>';
}
function main(argv=process.argv.slice(2)){
 if(argv.length!==1||!['--html','--json'].includes(argv[0]))
  throw Error('Usage: node report-s02-expert-handoff.js --html | --json');
 if(argv[0]==='--html')process.stdout.write(html());
 else process.stdout.write(JSON.stringify(source(),null,2)+'\n');
}
if(require.main===module)main();
module.exports={source,html,main};
