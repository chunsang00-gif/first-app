'use strict';
// Browser-only premium manuscript display regression. No model/payment calls.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'report-renderer.js'),'utf8');
function run(mbti,readerDecision,withCareer=false,withoutDecision=false,includeFreeRecap=false,coreHourText=null){
 const details=[];
 const window={
  CHARACTER_ASSETS:{
   badge:()=>'<span class="test-badge"></span>',
   hero:()=>'<span class="test-hero"></span>',
   detail:id=>{details.push(id);return '<span class="test-art"></span>'}
  },
  LIVE_REPORT_UI:{input:()=>({mbti})},
  REPORT_VALIDATOR:{validate:()=>({pass:true,errors:[]})},
  REPORT_SHARE:{mount(){},mountFull(){}},
  addEventListener(){}
 };
 const document={body:{classList:{add(){}}},getElementById(){return null}};
 const target={
  innerHTML:'',
  closest(){return null},
  querySelector(){return null},
  querySelectorAll(){return []}
 };
 const ids=['saju_core','mbti_contradiction','decision',
  'relationship','integrated_judgment','year_2027'];
 if(withCareer)ids.splice(3,0,'career');
 if(withoutDecision)ids.splice(ids.indexOf('decision'),1);
 const sections=ids.map((id,i)=>({
  id,title:'각 장의 고유한 제목 '+i,
  keyJudgment:id==='decision'?'각 장의 고유한 제목 '+i:
   '별도의 핵심 결론 '+id,
  body:['이 장에 실제로 제공되는 서로 다른 내용 '+id],
  bodyTopics:[id==='career'?'growth':'topic'],bodyLabels:['실제 작성된 질문'],
  evidence:['계산된 근거를 설명하는 자료입니다.']
 }));
 if(includeFreeRecap){
  const core=sections.find(x=>x.id==='saju_core');
  core.body=['새 출생시간의 독립적인 의미를 설명하는 별도의 독자용 문단입니다.',
   '무료 공개된 출생월의 전통적인 기질 풀이를 다시 설명합니다.'];
  core.bodyTopics=['temperament','strength'];
  core.bodyLabels=['출생시간 추가 풀이','기본 출생월'];
  if(coreHourText!==null)core.body[0]=coreHourText;
 }
 if(withCareer&&withCareer!=='generic'){
  sections.find(x=>x.id==='career').body[0]="기존 일을 유지할 때에는 이미 익힌 방법을 계속 활용할 수 있는 조건을 확인합니다. 새로운 기술을 배울 경우에는 익히는 시간과 준비할 도구를 따로 확보해야 하는지 설명합니다.";
 }
 const report={
  meta:{mbti,name:'검증 사용자',...(readerDecision?{readerDecision}:{}),chart:{year:'甲子',month:'乙丑',day:'丙寅',hour:'丁卯'}},
  cover:{headline:'원고를 보여 주는 검증',description:'본문 확인',keywords:[],
   highlights:[
    {sectionId:'saju_core',title:'첫 번째 요점',description:'기본 풀이 요약'},
    {sectionId:'mbti_contradiction',title:'두 번째 요점',description:'비교 풀이 요약'},
    {sectionId:'integrated_judgment',title:'세 번째 요점',description:'종합 풀이 요약'}
   ]},
  sections,
  finalJudgment:{headline:'종합 총평',body:['마지막 본문'],closingQuestion:'마지막 결론'}
 };
 const sandbox={window,document,console,requestAnimationFrame:fn=>fn()};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'report-paid-reader-question-domain.js'),'utf8'),sandbox,{filename:'report-paid-reader-question-domain.js'});
 vm.runInNewContext(source,sandbox,{filename:'report-renderer.js'});
 const qa=window.REPORT_RENDERER.render(report,target);
 assert.equal(qa.pass,true);
 return {html:target.innerHTML,details,ids,sections};
}
const free=run('모름');
assert(free.html.includes('성격 풀이의 다른 관점'));
assert(free.html.includes('성격 · 서로 다른 해석 관점'));
assert(free.html.includes('사주 종합'));
assert(!free.html.includes('MBTI와 다른 의외의 점'));
assert(!free.html.includes('사주 × MBTI 종합'));
assert(free.html.includes('별도의 핵심 결론 saju_core'));
assert(free.html.includes('별도의 핵심 결론 mbti_contradiction'));
assert(free.html.includes('별도의 핵심 결론 integrated_judgment'));
assert.equal((free.html.match(/<h2>별도의 핵심 결론 /g)||[]).length,5,
 'unique judgments must become chapter headlines, not additional summaries');
assert(free.html.includes('<h2>각 장의 고유한 제목 2</h2>'),
 'identical title and judgment must be displayed only once');
assert(!free.html.includes('detail-verdict'),
 'do not reintroduce the duplicate-verdict block');
assert(free.html.includes('이 장에 실제로 제공되는 서로 다른 내용 relationship'));
assert.deepEqual(free.details,
 ['saju_core','relationship','integrated_judgment','year_2027'],
 'art must follow chapter ID even when other chapters are omitted');
const paid=run('ISFP');
assert(paid.html.includes('id="saveReadableReport"'));
assert(paid.html.includes('읽기용 전체 보고서 저장'));
assert(paid.html.includes('인터넷 없이 열 수 있는 HTML 파일'));
assert(paid.html.includes('사주와 MBTI 비교'));
assert(!paid.html.includes('MBTI와 다른 의외의 점'),
 'the report must not manufacture a contradiction simply because two lenses are compared');
assert(paid.html.includes('사주 × MBTI 종합'));
assert(paid.html.includes('성격 · 두 풀이 비교'));
assert(!paid.html.includes('성격 · 의외의 차이'));
assert.deepEqual(paid.details,free.details);
console.log('PASS premium reader displays unique chapter judgments, truthful no-MBTI labels and ID-bound art across omitted chapters');
const question='현재 일을 유지할지 새로운 기술을 배울지 고민 중입니다.';
const personalized=run('ISFP',question);
assert(personalized.html.includes('<small>내가 직접 입력한 고민</small>'));
assert(personalized.html.includes(question));
assert(personalized.html.includes('사주로 알아낸 사실은 아닙니다.'));
assert(personalized.html.includes('직접 입력한 고민도 포함됩니다.'),
 'full sharing must disclose the additional personal context');
assert.equal(personalized.html.split(question).length-1,1,
 'the customer question must appear only in the decision chapter, not repeat across all chapters');
assert(personalized.html.includes('href="#detail-decision"'),
 'personal question shortcut must take the buyer to delivered decision chapter');
assert(!personalized.html.includes('href="#topic-career-'),
 'do not invent absent career questions just because input mentions work');
const withCareer=run('ISFP',question,true);
assert(withCareer.html.includes('href="#topic-career-0"'),
 'target a delivered career paragraph, not a guessed report section');
assert(withCareer.html.includes('id="topic-career-0"'),
 'the exact target should exist in rendered paid prose');
const topicWithoutDecision=run('ISFP',question,true,true);
assert(topicWithoutDecision.html.includes('href="#topic-career-0"'),
 'adaptive topical report must link the actually delivered buyer answer without adding decision');
assert(!topicWithoutDecision.html.includes('href="#detail-decision"'),
 'no link to omitted and nonexistent decision chapter');
assert(!topicWithoutDecision.html.includes('id="detail-decision"'));
assert.equal(topicWithoutDecision.html.split(question).length-1,1,
 'voluntary question must appear exactly once, in the actual related chapter');
assert(topicWithoutDecision.html.includes('<small>내가 직접 입력한 고민</small>'));
const genericCareer=run('ISFP',question,'generic');
assert(genericCareer.html.includes('id="topic-career-0"'));
assert(!genericCareer.html.includes('href="#topic-career-0"'),
 'an existing but unresponsive topic cannot be presented as the buyer answer');
assert(!paid.html.includes('report-question-guide'),
 'no volunteered buyer question means no personalized navigation');

assert(!paid.html.includes('reader-decision-note'),
 'omitted customer input must not create an empty or copied question');
const unsafeQuestion=run('ISFP','<img src=x onerror=alert(1)>');
assert(!unsafeQuestion.html.includes('<img src=x onerror=alert(1)>'),
 'uploaded user text must always remain escaped in rendered HTML');
console.log('PASS self-reported choice appears only once in decision chapter, remains escaped and is disclosed in full sharing');



// The real mandatory strength slot uses already FREE month evidence. It is
// still kept in the validated report, but must not be sold to a reader as an
// additional premium insight. The same distinction must appear in counts,
// chapter navigation and the actual first-chapter HTML (including sharing).
const recap=run('ISFP',null,false,false,true);
assert(recap.html.includes('<details class="copy-block free-month-recap" id="topic-saju_core-1">'));
assert(recap.html.includes('무료에서 이미 다룬 출생월 설명 · 유료 추가 풀이 아님'));
assert(recap.html.includes('새 출생시간의 독립적인 의미'));
assert(recap.html.includes('무료 공개된 출생월의 전통적인 기질 풀이'));
assert(recap.html.includes('실제로 작성된 분석: 6개 장 · 추가 세부 풀이 6개 · 무료 출생월 복습 1개(추가 유료 내용 아님)'));
assert(recap.html.includes('추가 1개 · 무료 복습 1개'));
assert(!recap.html.includes('7개 세부 풀이'));
assert(!recap.html.includes('href="#topic-saju_core-1"'),
 'already FREE month text cannot be added to the premium-only topic navigation');
const ordinary=run('ISFP');
assert(!ordinary.html.includes('무료에서 이미 다룬 출생월 설명 · 유료 추가 풀이 아님'),
 'do not relabel a report slot as free unless its actual source topic is strength');
// Work95: the ONLY buyer-specific answer may be the actual hour addition
// in saju_core; no optional decision or money chapter needs to exist.
const moneyQuestion='적금을 유지할지 대출을 상환할지 고민입니다.';
const work85=fs.readFileSync(path.join(__dirname,'qa',
 'work85-authored-first-paid-hour-money-reader-1982-0715-0220-20261124.md'),'utf8');
const moneyHourText=work85.split(
 '### 적금을 그대로 둘까, 대출을 갚을까 — 태어난 시간에서 따로 나오는 질문')[1]
 ?.split('## 내부 출처 확인')[0].replace(/\\*/g,'').trim();
assert(moneyHourText&&moneyHourText.length>800);
const moneyOnly=run('ISFP',moneyQuestion,false,true,true,moneyHourText);
assert(moneyOnly.html.includes('href="#topic-saju_core-0"'),
 'real reader must find the actual extra hour paragraph in core-only adaptive output');
assert(moneyOnly.html.includes('id="topic-saju_core-0"'));
assert(moneyOnly.html.includes('>출생시간에서 추가된 선택 풀이</a>'));
assert(!moneyOnly.html.includes('href="#topic-saju_core-1"'),
 'never navigate to the FREE month recap as a premium buyer answer');
assert.equal(moneyOnly.html.split(moneyQuestion).length-1,1,
 'the buyer question belongs in one core answer, not copied to every chapter');
assert(moneyOnly.html.includes('<small>내가 직접 입력한 고민</small>'));
assert(moneyOnly.html.includes('사주로 알아낸 사실은 아닙니다.'));
assert(!moneyOnly.html.includes('href="#detail-decision"'));
const genericCore=run('ISFP',moneyQuestion,false,true,true,
 '태어난 시간의 뜻도 살펴볼 수 있습니다. 적금과 대출은 신중하게 검토해야 합니다.');
assert(!genericCore.html.includes('href="#topic-saju_core-0"'),
 'just naming the topic and the birth hour cannot be an advertised paid answer');
assert(!genericCore.html.includes('reader-decision-note'),
 'do not show a fabricated question-owner badge without responsive prose');
console.log('PASS work95 live reader routes the full archived money buyer answer in first chapter and labels FREE month separately; no live provider');

console.log('PASS work89 first paid core: month-only strength stays in source report but appears as clearly labeled collapsed FREE recap; customer counts exclude it');
