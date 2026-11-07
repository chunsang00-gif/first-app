'use strict';
// Browser-only premium manuscript display regression. No model/payment calls.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'report-renderer.js'),'utf8');
function run(mbti,readerDecision){
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
 const sections=ids.map((id,i)=>({
  id,title:'각 장의 고유한 제목 '+i,
  keyJudgment:id==='decision'?'각 장의 고유한 제목 '+i:
   '별도의 핵심 결론 '+id,
  body:['이 장에 실제로 제공되는 서로 다른 내용 '+id],
  bodyTopics:['topic'],bodyLabels:['실제 작성된 질문'],
  evidence:['계산된 근거를 설명하는 자료입니다.']
 }));
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
assert(paid.html.includes('MBTI와 다른 의외의 점'));
assert(paid.html.includes('사주 × MBTI 종합'));
assert(paid.html.includes('성격 · 의외의 차이'));
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
assert(!paid.html.includes('reader-decision-note'),
 'omitted customer input must not create an empty or copied question');
const unsafeQuestion=run('ISFP','<img src=x onerror=alert(1)>');
assert(!unsafeQuestion.html.includes('<img src=x onerror=alert(1)>'),
 'uploaded user text must always remain escaped in rendered HTML');
console.log('PASS self-reported choice appears only once in decision chapter, remains escaped and is disclosed in full sharing');

