'use strict';
// Local-only editor workbench for an actually completed report JSON export.
// The source file's provider authenticity cannot be verified here.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const IDS=require('./report-quality-node').IDS;
const NAME={saju_core:'사주 기본 풀이',mbti_contradiction:'사주와 MBTI 비교',decision:'선택과 결정',money:'금전',career:'직업과 일',relationship:'인간관계',stress:'스트레스와 대처',integrated_judgment:'종합 풀이',year_2027:'2027년 기본 해석',year_2027_money:'2027년 금전',year_2027_career:'2027년 직업',year_2027_relationship:'2027년 관계'};
const html=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list=v=>Array.isArray(v)?v:[];
const questions=[
 ['source','계산 출처와 해석 내용이 정확하게 연결됩니까?'],
 ['novel','다른 장이나 무료 소개와 다른 새 해석이 있습니까?'],
 ['readable','용어 강의·추상어·중복 없이 읽힙니까?'],
 ['personal','실제 이력·능력·미래 사건을 지어내지 않았습니까?'],
 ['value','같은 출생정보의 무료 예시보다 돈을 낼 이유가 있습니까?']
];
function inspect(raw){
 if(raw?.status!=='ready'||!raw.report)throw Error('FULL_HUMAN_REVIEW_REQUIRES_COMPLETED_EXPORT');
 const report=raw.report,sections=report.sections;
 if(!report.meta||!report.cover||!report.finalJudgment||
    !Array.isArray(sections)||!sections.length)
  throw Error('FULL_HUMAN_REVIEW_INCOMPLETE_REPORT');
 const ids=sections.map(s=>s?.id);
 if(!ids.includes('saju_core')||new Set(ids).size!==ids.length||
    ids.some(id=>!IDS.includes(id))||
    JSON.stringify(ids)!==JSON.stringify(IDS.filter(id=>ids.includes(id))))
  throw Error('FULL_HUMAN_REVIEW_INVALID_CHAPTER_ORDER');
 for(const s of sections){
  const count=s.body?.length;
  if(!s.title||!s.keyJudgment||!Array.isArray(s.body)||!count||
     !Array.isArray(s.bodyTopics)||s.bodyTopics.length!==count||
     new Set(s.bodyTopics).size!==count||
     !Array.isArray(s.bodyLabels)||s.bodyLabels.length!==count||
     !Array.isArray(s.evidence)||!s.evidence.length||
     s.body.some(x=>typeof x!=='string'||!x.trim())||
     s.bodyLabels.some(x=>typeof x!=='string'||!x.trim()))
   throw Error('FULL_HUMAN_REVIEW_INVALID_CHAPTER:'+s.id);
 }
 if(!Array.isArray(report.finalJudgment.body)||!report.finalJudgment.body.length)
  throw Error('FULL_HUMAN_REVIEW_MISSING_SUMMARY');
 return {kind:'private-full-human-editorial-review-v1',report,
  sourceHash:crypto.createHash('sha256').update(JSON.stringify(report)).digest('hex'),
  chapterCount:sections.length,topicCount:sections.reduce((n,s)=>n+s.body.length,0),
  releaseVerdict:'not-approved',saleApproved:false,providerProvenanceVerified:false};
}
// This function is serialized as source for the offline HTML, not executed in Node.
// It makes NO network calls and intentionally cannot alter release state.
function localReviewHandler(){
 document.getElementById('saveReview').addEventListener('click',function(){
  const grades=Array.from(document.querySelectorAll('select[data-chapter]'))
   .map(function(x){return {chapter:x.dataset.chapter,grade:x.value,
    note:document.querySelector('textarea[data-note="'+x.dataset.chapter+'"]')
     .value.trim().slice(0,1200)};});
  const checks=Array.from(document.querySelectorAll('select[data-check]'))
   .map(function(x){return {criterion:x.dataset.check,grade:x.value};});
  const editorialVerdict=document.getElementById('overallGrade').value;
  const complete=grades.every(function(x){return x.grade!=='unreviewed';})&&
   checks.every(function(x){return x.grade!=='unreviewed';})&&
   editorialVerdict!=='unreviewed';
  const record={kind:'private-full-human-editorial-rating-v1',
   sourceHash:document.body.dataset.sourceHash,grades,checks,editorialVerdict,
   humanReviewComplete:complete,
   notes:document.getElementById('overallNotes').value.trim().slice(0,2000),
   providerProvenanceVerified:false,releaseVerdict:'not-approved',
   automaticSaleApproval:false,saleApproved:false};
  const blob=new Blob([JSON.stringify(record,null,2)],
   {type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download='full-manuscript-human-rating.json';link.click();
  setTimeout(function(){URL.revokeObjectURL(url)},30000);
  document.getElementById('message').textContent=complete?
   '평가 파일을 저장했습니다. 출시에는 전문가와 운영자의 별도 승인이 필요합니다.':
   '미완료 평가를 저장했습니다. 아직 미검토 항목이 있습니다.';
 });
}
function render(view){
 if(view?.kind!=='private-full-human-editorial-review-v1'||
   view.releaseVerdict!=='not-approved'||view.saleApproved!==false||
   !/^[0-9a-f]{64}$/.test(view.sourceHash||''))
  throw Error('FULL_HUMAN_REVIEW_INVALID_SOURCE');
 const r=view.report;
 const chapters=r.sections.map((s,i)=>
  '<section class="panel chapter" id="chapter-'+i+'">'+
  '<small>'+(i+1)+' / '+view.chapterCount+' · '+html(NAME[s.id])+'</small>'+
  '<h2>'+html(s.title)+'</h2><p class="judgment">'+html(s.keyJudgment)+'</p>'+
  s.body.map((body,j)=>'<section class="topic"><h3>'+html(s.bodyLabels[j])+
   '</h3><p>'+html(body)+'</p></section>').join('')+
  '<details><summary>실제 저장된 계산 근거 확인</summary><ul>'+
  s.evidence.map(e=>'<li>'+html(e)+'</li>').join('')+'</ul></details>'+
  '<div class="rating"><label for="rating-'+i+'">이 장의 판단</label>'+
  '<select id="rating-'+i+'" data-chapter="'+html(s.id)+'">'+
  '<option value="unreviewed">미검토</option>'+
  '<option value="rewrite">다른 내용이 없어 재작성 필요</option>'+
  '<option value="expert">명리 전문가 확인 필요</option>'+
  '<option value="reader-acceptable">독자 문장 수용 가능 (판매 승인 아님)</option>'+
  '</select><label for="note-'+i+'">구체적인 수정할 점</label>'+
  '<textarea id="note-'+i+'" data-note="'+html(s.id)+'" rows="3" placeholder="원문이나 이름 대신 수정 방향을 기록"></textarea></div>'+
  '</section>').join('');
 const toc='<nav class="panel"><h2>보고서 실제 목차</h2><ol>'+
  r.sections.map((s,i)=>'<li><a href="#chapter-'+i+'">'+
   html(NAME[s.id])+' ('+s.body.length+'개 풀이)</a></li>').join('')+
  '<li><a href="#final">종합 결론</a></li></ol></nav>';
 const final=r.finalJudgment;
 const last='<section class="panel" id="final"><h2>최종 종합 결론</h2>'+
  '<h3>'+html(final.headline)+'</h3>'+
  list(final.body).map(x=>'<p>'+html(x)+'</p>').join('')+
  '<h3>강점</h3><ul>'+list(final.strengths).map(x=>'<li>'+html(x)+'</li>').join('')+'</ul>'+
  '<h3>주의점</h3><ul>'+list(final.watchouts).map(x=>'<li>'+html(x)+'</li>').join('')+'</ul>'+
  '<h3>적용할 상황</h3><ol>'+
  list(final.routines).map(x=>'<li>'+html(x.trigger)+' — '+html(x.action)+
   ' ('+html(x.reason)+')</li>').join('')+'</ol>'+
  '<p class="judgment">'+html(final.closingQuestion)+'</p></section>';
 const options='<option value="unreviewed">미검토</option>'+
  '<option value="pass">충족</option><option value="fail">미흡</option>'+
  '<option value="expert">전문가 확인 필요</option>';
 const fields=questions.map(([id,label])=>
  '<label for="check-'+html(id)+'">'+html(label)+'</label>'+
  '<select data-check="'+html(id)+'" id="check-'+html(id)+'">'+options+'</select>').join('');
 const checklist='<section class="panel"><h2>전체 편집 검수</h2>'+
  '<p>같은 출생정보의 무료 예시와 실제 비교하지 않았다면 유료 가치 질문은 미검토로 두세요. 중간 평가도 저장할 수 있습니다.</p>'+
  fields+'<label for="overallGrade">전체 판정</label>'+
  '<select id="overallGrade"><option value="unreviewed">미검토</option>'+
  '<option value="rewrite">재작성 필요</option>'+
  '<option value="expert">명리 전문가 심사 필요</option>'+
  '<option value="reader-acceptable">독자용 문장 수용 가능 (출시 아님)</option></select>'+
  '<label for="overallNotes">수정 우선순위</label>'+
  '<textarea id="overallNotes" rows="5"></textarea>'+
  '<p><button type="button" id="saveReview">개인 PC에 검수 기록 저장</button></p>'+
  '<p id="message" role="status"></p>'+
  '<p class="subtle">검수 기록에는 원문·출생정보를 자동 포함하지 않지만 메모에 개인정보를 적지 마세요. 어느 결과도 자동으로 출시를 승인하지 않습니다.</p></section>';
 const css="body{background:#edf2f8;margin:0;color:#15253a;font:15px/1.8 system-ui,-apple-system,sans-serif}"+
  "main{max-width:940px;margin:auto;padding:20px 16px 60px}"+
  ".panel{background:#fff;border:1px solid #dae2ec;border-radius:12px;margin:17px 0;padding:24px 30px}"+
  "h1{font-size:28px}h2{font-size:22px}h3{font-size:17px}"+
  ".notice{background:#fff7e4;padding:16px;border:1px solid #e7d5aa;border-radius:10px}"+
  ".judgment{background:#edf4fa;border-left:4px solid #4473a4;padding:15px}"+
  ".topic{border-top:1px solid #e3e9f0;padding:12px 0}.topic p,li{white-space:pre-wrap;overflow-wrap:anywhere}"+
  ".rating{background:#f5f8fc;padding:15px;border-radius:10px;margin-top:20px}"+
  "label{display:block;font-weight:650;margin:12px 0 5px}"+
  "select,textarea{box-sizing:border-box;width:100%;padding:9px;font:inherit;border:1px solid #b0becd;border-radius:8px}"+
  "small,.subtle{font-size:12px;color:#5a7083}summary{cursor:pointer;font-weight:650}"+
  "a{color:#24517c}button{padding:12px 18px;background:#24517c;color:#fff;border:0;border-radius:8px;cursor:pointer}"+
  "@media(max-width:650px){main{padding:10px}.panel{padding:17px}}"+
  "@media print{body{background:white}.panel{border:0;border-bottom:1px solid #aaa;break-inside:avoid-page}button{display:none}}";
 return '<!doctype html><html lang="ko"><head><meta charset="utf-8">'+
  '<meta name="viewport" content="width=device-width,initial-scale=1">'+
  '<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; style-src &#39;unsafe-inline&#39;; script-src &#39;unsafe-inline&#39;; connect-src &#39;none&#39;; img-src &#39;none&#39;; form-action &#39;none&#39;; object-src &#39;none&#39;; base-uri &#39;none&#39;">'+
  '<title>전체 보고서 비공개 인적 검수</title><style>'+css+'</style></head>'+
  '<body data-source-hash="'+view.sourceHash+'"><main>'+
  '<h1>전체 유료 보고서 검수</h1>'+
  '<p class="notice">완성된 보고서 원문 JSON을 읽는 로컬 검수 화면입니다. 파일이 실제 AI 응답인지 이 도구만으로 검증할 수 없습니다. 이름·원문·내부 근거를 포함하므로 공개하지 마세요. 검사 통과는 판매 승인이 아닙니다.</p>'+
  '<header class="panel"><h2>'+html(r.meta.name||'독자')+'님의 보고서</h2>'+
  '<p>'+html(r.cover.headline)+'</p><p>'+html(r.cover.description)+'</p>'+
  '<p>실제 작성된 '+view.chapterCount+'개 장 · '+view.topicCount+'개 세부 풀이</p></header>'+
  toc+chapters+last+checklist+
  '</main><script>('+localReviewHandler.toString()+')();</script></body></html>';
}
function main(args=process.argv.slice(2)){
 if(args.length!==2||!args.every(path.isAbsolute))
  throw Error('Usage: node report-full-manuscript-human-review.js /absolute/saju-mbti-report-review.json /absolute/private-review.html');
 const v=inspect(JSON.parse(fs.readFileSync(args[0],'utf8')));
 fs.writeFileSync(args[1],render(v),{mode:0o600,flag:'wx'});
 console.log('PRIVATE_FULL_REVIEW_CREATED: chapters='+v.chapterCount+
  ' topics='+v.topicCount+' paidCalls=0 approved=false');
}
if(require.main===module){try{main()}catch(e){
 console.error('PRIVATE_FULL_REVIEW_FAILED:'+e.message);process.exitCode=1;
}}
module.exports={inspect,render,main};
