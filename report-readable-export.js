/* Buyer-controlled, offline-readable premium report export. No model calls. */
(function(root){
'use strict';
const esc=value=>String(value==null?'':value).replace(/[&<>"']/g,c=>
 ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const array=value=>Array.isArray(value)?value:[];
// Keep the full validated report, but distinguish a free birth-month recap
// from an independently sourced paid explanation in the offline export.
const freeMonthRecap=(section,i)=>section?.id==='saju_core'&&
 Array.isArray(section.bodyTopics)&&section.bodyTopics[i]==='strength';
const named=Object.freeze({
 saju_core:'사주 기본',mbti_contradiction:'사주와 MBTI',
 decision:'선택과 결정',money:'돈',career:'일',
 relationship:'관계',stress:'압박과 대처',
 integrated_judgment:'종합 풀이',year_2027:'2027년 풀이',
 year_2027_money:'2027년 금전',year_2027_career:'2027년 직업',
 year_2027_relationship:'2027년 관계'
});
const style=[
 ':root{color-scheme:light;font-family:system-ui,-apple-system,"Malgun Gothic",sans-serif;color:#1b2735;background:#edf2f7}',
 '*{box-sizing:border-box}body{margin:0}main{max-width:860px;margin:20px auto;background:white;padding:48px 52px;box-shadow:0 12px 40px #23364a14}',
 'h1{font-size:30px;line-height:1.35;margin:10px 0}h2{font-size:23px;line-height:1.4;margin:0 0 12px}h3{font-size:17px;margin:26px 0 8px}',
 'p,li{font-size:15px;line-height:1.9;overflow-wrap:anywhere}p{margin:9px 0}small,.subtle{font-size:12px;color:#5e6d7e}',
 'header{padding-bottom:30px;border-bottom:2px solid #213e62}header .eyebrow{font-size:13px;font-weight:700;color:#315e94}',
 '.scope{font-size:13px;background:#f2f6fc;padding:12px 15px;border-radius:9px;margin-top:20px}',
 'nav{background:#f6f9fc;padding:20px 24px;border-radius:14px;margin:26px 0}nav ol{margin:12px 0 0;padding-left:24px;columns:2}',
 'a{color:#234d89;text-decoration:none}a:hover{text-decoration:underline}',
 'article{border-top:1px solid #dce5ef;padding:29px 0;break-inside:avoid-page}',
 '.chapter-label{font-size:12px;color:#446a92;font-weight:700;margin-bottom:8px}',
 '.judgment{font-weight:650;background:#f1f5fb;border-left:4px solid #5078aa;padding:12px 15px;border-radius:2px 8px 8px 2px}',
 '.topic{margin:20px 0;break-inside:avoid-page}.topic h3{margin-top:18px}.topic p{white-space:pre-wrap}',
 '.free-month-recap{border-left:3px solid #bdc7d4;background:#f6f8fb;padding:10px 15px;margin-top:24px}.free-month-recap .recap-notice{font-size:13px;color:#526477;font-weight:650}',
 'ul{padding-left:24px}.reader-question{background:#fffaed;padding:12px 14px;border-radius:10px}',
 ' .choice-shortcut{background:#f0f5fc;padding:18px 20px;border-radius:12px;border:1px solid #d7e3f1;margin:22px 0}.choice-shortcut p{margin:5px 0 10px;font-size:13px}.choice-shortcut-links a{display:inline-block;margin:5px 10px 5px 0;padding:7px 12px;border-radius:8px;background:white;border:1px solid #b6cbe8;font-size:13px;font-weight:650}',
 '.final{background:#fafbfd;margin-top:24px;padding:26px 28px;border-radius:14px;border:1px solid #e4eaf0}',
 '.keywords{margin-top:18px;color:#425e80}.keywords span{display:inline-block;padding:5px 10px;background:#edf4fd;border-radius:24px;margin:4px}',
 '.chart{border-collapse:collapse;margin-top:22px;width:100%}.chart th,.chart td{padding:8px;border:1px solid #dce5ef;text-align:left;font-size:13px}',
 'footer{border-top:1px solid #dce5ef;padding-top:20px;margin-top:32px;color:#607083;font-size:12px;line-height:1.8}',
 '@media(max-width:680px){main{padding:24px 20px;margin:0;box-shadow:none}nav ol{columns:1}h1{font-size:25px}h2{font-size:21px}}',
 '@media print{@page{size:A4;margin:18mm}body{background:#fff}main{margin:0;max-width:none;padding:0;box-shadow:none}nav{break-inside:avoid}article{break-before:auto}a{color:inherit}}'
].join('');
function build(report){
 const raw=array(report?.sections);
 if(!raw.length)throw Error('READABLE_EXPORT_NO_COMPLETED_CHAPTERS');
 const sections=raw.map((s,i)=>{
  if(!s||typeof s.id!=='string'||!Object.hasOwn(named,s.id)||
     !Array.isArray(s.body)||!s.body.length||
     s.body.some(t=>typeof t!=='string'||!t.trim()))
   throw Error('READABLE_EXPORT_INVALID_COMPLETED_CHAPTER:'+(i+1));
  return {...s,position:i+1};
 });
 if(new Set(sections.map(s=>s.id)).size!==sections.length)
  throw Error('READABLE_EXPORT_DUPLICATE_CHAPTER');
 const accurate=sections.every(s=>
  Array.isArray(s.bodyTopics)&&s.bodyTopics.length===s.body.length&&
  s.bodyTopics.every(t=>typeof t==='string'&&t.length>0)&&
  new Set(s.bodyTopics).size===s.bodyTopics.length);
 const actualTopics=accurate?sections.reduce((n,s)=>n+s.body.length,0):null;
 const freeTopicCount=accurate?sections.reduce((n,s)=>n+s.bodyTopics.filter((_,i)=>freeMonthRecap(s,i)).length,0):null;
 const additionalTopicCount=actualTopics===null?null:actualTopics-freeTopicCount;
 const buyerChoice=root.REPORT_BUYER_QUESTION_LINKS?.locateDelivered(report)||null;
 const choiceShortcuts=buyerChoice?
  '<aside class="choice-shortcut" aria-label="고민과 관련된 실제 풀이"><strong>내가 적은 고민, 관련 풀이 바로가기</strong><p>실제로 제공된 장과 문단만 안내합니다.</p><div class="choice-shortcut-links">'+
  (buyerChoice.coreAnswer?'<a href="#part-'+(buyerChoice.coreAnswer.chapterIndex+1)+'-topic-'+(buyerChoice.coreAnswer.topicIndex+1)+'">출생시간에서 추가된 선택 풀이</a>':'')+
  (buyerChoice.decisionIndex!==null?'<a href="#part-'+(buyerChoice.decisionIndex+1)+'">선택·결정 풀이</a>':'')+
  (buyerChoice.related?'<a href="#part-'+(buyerChoice.related.chapterIndex+1)+'-topic-'+(buyerChoice.related.topicIndex+1)+'">관련 분야의 세부 풀이</a>':'')+
  '</div><small>고객의 입력은 출생사실의 증거가 아니며 풀이가 정답을 보장하지 않습니다.</small></aside>':'';

 const name=String(report?.meta?.name||'독자').trim();
 const mbti=String(report?.meta?.mbti||'모름').trim()||'모름';
 const hasMbti=mbti!=='모름';
 const title=hasMbti?'사주 × MBTI 보고서':'사주 보고서';
 // Match the actual live-reader labels for a Saju-only report. Never
 // imply that MBTI preferences were analyzed when the user entered 모름.
 const chapterLabel=id=>!hasMbti&&id==='mbti_contradiction'?
  '성격 풀이의 다른 관점':!hasMbti&&id==='integrated_judgment'?
  '사주 종합':named[id];
 const cover=report?.cover||{};
 const keys=array(cover.keywords).filter(v=>typeof v==='string'&&v.trim()).slice(0,8);
 const nameText=name?esc(name):'독자';
 const summary=esc(sections.length+'개 장'+(actualTopics===null?'':
  ' · 추가 세부 풀이 '+additionalTopicCount+'개'+
  (freeTopicCount?' · 무료 출생월 복습 '+freeTopicCount+'개(추가 유료 내용 아님)':'')));
 const chart=report?.meta?.chart||{};
 const chartRows=[['연주',chart.year],['월주',chart.month],['일주',chart.day],['시주',chart.hour]]
  .filter(row=>typeof row[1]==='string'&&row[1].trim());
 const hourUnknown=!chartRows.some(row=>row[0]==='시주');
 const table=chartRows.length?
  '<table class="chart"><caption class="subtle">'+
  (hourUnknown?'출생정보에서 계산된 자리와 시간 미상 안내':'출생정보에서 계산된 네 자리')+
  '</caption><tbody>'+
  chartRows.map(([key,v])=>'<tr><th scope="row">'+esc(key)+'</th><td>'+esc(v)+'</td></tr>').join('')+
  (hourUnknown?'<tr><th scope="row">시주</th><td>시간 모름 — 출생시간을 입력하지 않아 계산하지 않음</td></tr>':'')+
  '</tbody></table>':'';
 const body=sections.map(s=>{
  const judgment=String(s.keyJudgment||'').trim();
  const questionOwner=s.id==='decision'||
   (buyerChoice?.decisionChapterId===null&&
    (buyerChoice?.related?.chapterId===s.id||
     (!buyerChoice?.related&&s.id==='saju_core'&&
      buyerChoice?.coreAnswer?.chapterId==='saju_core')));
  const customerQuestion=questionOwner&&typeof report?.meta?.readerDecision==='string'&&
   report.meta.readerDecision.trim()?
   '<div class="reader-question"><strong>내가 직접 적은 고민</strong><p>'+
   esc(report.meta.readerDecision.trim())+'</p><small>사용자가 입력한 문장이며 출생정보로 확인된 사실은 아닙니다.</small></div>':'';
  const paragraphs=s.body.map((text,i)=>{
   const recap=freeMonthRecap(s,i);
   return '<section class="topic'+(recap?' free-month-recap':'')+'" id="part-'+s.position+'-topic-'+(i+1)+'">'+
    (recap?'<div class="recap-notice">무료에서 이미 다룬 출생월 설명 · 유료 추가 풀이 아님</div>':'')+
    '<p>'+esc(text)+'</p></section>';
  }).join('');
  return '<article id="part-'+s.position+'"><h2>'+esc(chapterLabel(s.id))+'</h2>'+
   (judgment?'<p>'+esc(judgment)+'</p>':'')+
   customerQuestion+paragraphs+'</article>';
 }).join('');
 const final=report?.finalJudgment;
 const finalContent=final&&typeof final==='object'?(
  '<section class="final" id="final"><h2>총평</h2>'+
  (final.headline?'<p>'+esc(final.headline)+'</p>':'')+
  array(final.body).filter(t=>typeof t==='string'&&t.trim())
   .map(t=>'<p>'+esc(t)+'</p>').join('')+
  (array(final.strengths).length?'<p><strong>강점</strong></p><ul>'+
   array(final.strengths).map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>':'')+
  (array(final.watchouts).length?'<p><strong>주의점</strong></p><ul>'+
   array(final.watchouts).map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>':'')+
  (array(final.routines).length?'<p><strong>실천 방법</strong></p><ol>'+
   array(final.routines).map(r=>'<li><strong>'+esc(r.trigger)+'</strong> — '+
    esc(r.action)+' <span class="subtle">'+esc(r.reason)+'</span></li>').join('')+'</ol>':'')+
  (final.closingQuestion?'<p>'+esc(final.closingQuestion)+'</p>':'')+
  '</section>'):'';
 return '<!doctype html><html lang="ko"><head><meta charset="utf-8">'+
  '<meta name="viewport" content="width=device-width,initial-scale=1">'+
  '<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; style-src &#39;unsafe-inline&#39;; base-uri &#39;none&#39;; form-action &#39;none&#39;">'+
  '<title>'+esc(title)+'</title><style>'+style+'</style></head><body><main>'+
  '<header><div class="eyebrow">'+(hasMbti?'SAJU × MBTI':'SAJU')+' · 개인 보관용</div>'+
  '<h1>'+nameText+'님의 '+esc(title)+'</h1>'+
  '<p class="subtle">완성된 보고서를 읽고 인쇄할 수 있도록 저장한 문서입니다. 인터넷 연결이 필요하지 않습니다.'+
  (mbti==='모름'?'':' · 직접 입력한 MBTI: '+esc(mbti))+'</p>'+
  (cover.headline?'<h2>'+esc(cover.headline)+'</h2>':'')+
  (cover.description?'<p>'+esc(cover.description)+'</p>':'')+
  '<div class="scope">실제로 작성된 내용: '+summary+'</div>'+
  (keys.length?'<div class="keywords">'+keys.map(k=>'<span>#'+esc(k.replace(/^#+/,''))+'</span>').join('')+'</div>':'')+
  table+'</header>'+choiceShortcuts+
  '<nav aria-label="실제 작성된 장 목록"><strong>내 보고서 목차</strong><ol>'+
  sections.map(s=>'<li><a href="#part-'+s.position+'">'+esc(chapterLabel(s.id))+'</a> <small>('+
   s.body.filter((_,i)=>!freeMonthRecap(s,i)).length+'개 추가 풀이'+
   (s.body.some((_,i)=>freeMonthRecap(s,i))?' · 무료 복습 1개':'')+')</small></li>').join('')+
  (finalContent?'<li><a href="#final">총평</a></li>':'')+
  '</ol></nav>'+body+finalContent+
  '<footer>이 파일에는 개인의 이름, 사주 해석 및 직접 입력한 고민이 포함될 수 있습니다. 외부에 공유하기 전에 내용을 확인하세요. '+
  '사주와 MBTI의 해석은 개인의 실제 성격·능력이나 미래 사건을 객관적으로 확인한 결과가 아닙니다. '+
  '이 파일은 실제 작성된 문단만 담으며, 생략된 장이나 문단을 채워 넣지 않습니다.</footer>'+
  '</main></body></html>';
}
function save(report){
 const documentText=build(report);
 const blob=new Blob([documentText],{type:'text/html;charset=utf-8'});
 const url=URL.createObjectURL(blob),anchor=document.createElement('a');
 anchor.href=url;anchor.download='saju-mbti-readable-report.html';
 anchor.click();
 setTimeout(()=>URL.revokeObjectURL(url),30000);
}
root.REPORT_READER_EXPORT={build,save};
})(window);
