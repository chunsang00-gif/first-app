'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('report-readable-export.js','utf8');
const context={window:{},console};
vm.runInNewContext(fs.readFileSync('report-paid-reader-question-domain.js','utf8'),context);
vm.runInNewContext(source,context);
const exp=context.window.REPORT_READER_EXPORT;
assert.equal(typeof exp.build,'function');
const ids=['saju_core','mbti_contradiction','decision','money','career',
 'relationship','stress','integrated_judgment','year_2027'];
const sections=ids.map((id,i)=>({
 id,title:'제목 '+(i+1),keyJudgment:'구체적인 해석 '+(i+1),
 body:['작성된 첫 번째 풀이 '+(i+1),'작성된 두 번째 풀이 '+(i+1)],
 bodyTopics:['first','second'],bodyLabels:['첫 해석','두 번째 해석'],
 evidence:['natal.hour.stem','내부 근거만 이곳에 있습니다']
}));
const report={meta:{name:'테스트 독자',mbti:'ISFP',readerDecision:'새 일로 <script>alert(9)</script> 갈까요?',
 chart:{year:'甲子',month:'乙丑',day:'丙寅',hour:'丁卯'}},
 cover:{headline:'이번 해석에서 확인할 일',description:'본문을 기준으로 살펴봅니다.',
  keywords:['해석','실행'],
  highlights:[{sectionId:'career',title:'진로에서 볼 핵심',description:'직업 본문에 있는 내용'},
  {sectionId:'year_2027_career',title:'제외되어야 할 연도 장',description:'없어야 합니다'}]},
 sections,finalJudgment:{headline:'종합 결론',body:['마지막 정리입니다.'],
  strengths:['검증된 장점'],watchouts:['주의해야 할 점'],
  routines:[{trigger:'결정하기 전에',action:'정보를 한 번 확인',reason:'설명하기 위해'}],
  closingQuestion:'선택에 앞서 두 조건을 구분하는 것이 이 해석의 핵심입니다.'}};
const html=exp.build(report);
assert(!html.includes('class="choice-shortcut"'),
 'invalid legacy buyer question must not create an unsupported topic shortcut');
const buyer=structuredClone(report);
buyer.meta.readerDecision='기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.';
buyer.sections.find(s=>s.id==='career').bodyTopics=['growth','workstyle'];
const genericHtml=exp.build(buyer);
assert(genericHtml.includes('href="#part-3"'));
assert(!genericHtml.includes('href="#part-5-topic-1"'),
 'an actually delivered but irrelevant growth paragraph must not be advertised as the answer');
buyer.sections.find(s=>s.id==='career').body[0]=
 '기존 일을 유지할 때에는 익숙한 작업을 이어갈 수 있는 조건을 확인합니다. '+
 '새로운 기술을 배울 경우에는 설명을 이해할 시간과 준비할 도구를 별도로 확보해야 하는지 비교합니다.';
const choiceHtml=exp.build(buyer);
assert(choiceHtml.includes('class="choice-shortcut"'));
assert(choiceHtml.includes('href="#part-3"'),
 'the decision chapter actually exists in the exported manuscript');
assert(choiceHtml.includes('href="#part-5-topic-1"'),
 'career chapter has a delivered growth paragraph');
assert(choiceHtml.includes('id="part-5-topic-1"'));
assert.equal(choiceHtml.split(buyer.meta.readerDecision).length-1,1,
 'do not repeat buyer question in both navigation and decision paragraph');
// Work72: a 6-chapter adaptive report may intentionally omit decision.
const topicalWithoutDecision=structuredClone(buyer);
topicalWithoutDecision.sections=topicalWithoutDecision.sections.filter(s=>s.id!=='decision');
const directTopicHtml=exp.build(topicalWithoutDecision);
assert(directTopicHtml.includes('class="choice-shortcut"'));
assert(directTopicHtml.includes('href="#part-4-topic-1"'),
 'the real career paragraph is reachable even without a decision chapter');
assert(directTopicHtml.includes('id="part-4-topic-1"'));
assert(!directTopicHtml.includes('>선택·결정 풀이</a>'),
 'do not create a dead link to an omitted decision chapter');
assert.equal(directTopicHtml.split(buyer.meta.readerDecision).length-1,1,
 'the buyer question is shown only in the actual related chapter');
const topicalGeneric=structuredClone(topicalWithoutDecision);
topicalGeneric.sections.find(s=>s.id==='career').body[0]='일반적인 직업 해석을 위한 계산 설명입니다.';
assert(!exp.build(topicalGeneric).includes('class="choice-shortcut"'),
 'no relevant delivered paragraph means no buyer-specific navigation');
const excluded=structuredClone(buyer);
excluded.sections.find(s=>s.id==='career').bodyTopics=['first','second'];
const omitted=exp.build(excluded);
assert(omitted.includes('href="#part-3"'));
assert(!omitted.includes('href="#part-5-topic-1"'),
 'do not link an unrelated career paragraph as the answer');

assert(html.startsWith('<!doctype html><html lang="ko">'));
assert(html.includes('<html lang="ko">')&&html.includes('<style>'));
assert(html.includes('Content-Security-Policy'));
assert(!html.includes('<script'));
assert(!html.includes('src="https://')&&!html.includes('href="https://'));
assert(html.includes('실제로 작성된 내용: 9개 장 · 실제 작성된 18개 세부 풀이'));
assert.equal((html.match(/<article id="part-/g)||[]).length,9);
assert.equal((html.match(/<section class="topic" id="part-\d+-topic-\d+">/g)||[]).length,18);
assert(!html.includes('2027년 직업')&&!html.includes('제외되어야 할 연도 장'));
for(let i=1;i<=9;i++)assert(html.includes('href="#part-'+i+'"'));
assert(html.includes('진로에서 볼 핵심')&&html.includes('직업 본문에 있는 내용'));
assert(html.includes('이번 해석에서 확인할 일'));
assert(html.includes('종합 결론')&&html.includes('정보를 한 번 확인'));
assert(html.includes('<h3>가장 중요한 결론</h3>'),
 'the saved report must label a conclusion as a conclusion, matching the live app');
assert(!html.includes('<h3>마지막 질문</h3>'));
assert(html.includes('&#39;none&#39;'), 'offline document must block active resources');
assert(!html.includes('natal.hour.stem'),'internal source IDs must never leak to reader document');
assert(!html.includes('내부 근거만 이곳에 있습니다'));
assert(html.includes('새 일로 &lt;script&gt;alert(9)&lt;/script&gt; 갈까요?'));
assert.equal(html.split('새 일로 &lt;script&gt;alert(9)&lt;/script&gt; 갈까요?').length-1,1);
assert(!html.includes('<script>alert(9)</script>'));
assert(html.includes('인쇄')&&html.includes('@media print'));
// Paid first-chapter provenance: its mandatory strength paragraph reuses
// the FREE month evidence. Offline HTML must preserve it for review while
// excluding it from the number of additional interpretations promised.
const coreRecap=structuredClone(report);
coreRecap.sections[0].bodyTopics=['temperament','strength'];
coreRecap.sections[0].bodyLabels=['추가 출생시간 풀이','출생월 기본 복습'];
const recapHtml=exp.build(coreRecap);
assert(recapHtml.includes('실제로 작성된 내용: 9개 장 · 추가 세부 풀이 17개 · 무료 출생월 복습 1개(추가 유료 내용 아님)'));
assert(recapHtml.includes('class="topic free-month-recap" id="part-1-topic-2"'));
assert(recapHtml.includes('무료에서 이미 다룬 출생월 설명 · 유료 추가 풀이 아님'));
assert(recapHtml.includes('작성된 두 번째 풀이 1'),
 'the original month paragraph remains available in the offline evidence record');
assert(recapHtml.includes('1개 추가 풀이 · 무료 복습 1개'));
assert.equal((recapHtml.match(/<section class="topic(?: free-month-recap)?" id="part-\d+-topic-\d+">/g)||[]).length,18,
 'labeling the free source must not silently delete evidence or change delivered section shape');
assert(!html.includes('무료에서 이미 다룬 출생월 설명 · 유료 추가 풀이 아님'),
 'do not mislabel missing or unknown topic IDs as a verified free month slot');

const withoutMbti=structuredClone(report);withoutMbti.meta.mbti='모름';
const withoutMbtiHtml=exp.build(withoutMbti);
assert(!withoutMbtiHtml.includes('직접 입력한 MBTI:'));
assert(withoutMbtiHtml.includes('<div class="eyebrow">SAJU · 개인 보관용</div>'));
assert(!withoutMbtiHtml.includes('사주와 MBTI 비교'),
 'do not advertise a missing MBTI preference as a delivered interpretation');
assert(!withoutMbtiHtml.includes('사주 × MBTI 보고서'));
assert(withoutMbtiHtml.includes('<a href="#part-2">성격 풀이의 다른 관점</a>'));
assert(withoutMbtiHtml.includes('<a href="#part-8">사주 종합</a>'));
assert(withoutMbtiHtml.includes('02 · 성격 풀이의 다른 관점'));
assert(withoutMbtiHtml.includes('08 · 사주 종합'));
const withoutHour=structuredClone(withoutMbti);
delete withoutHour.meta.chart.hour;
const withoutHourHtml=exp.build(withoutHour);
assert(withoutHourHtml.includes('<th scope="row">시주</th><td>시간 모름 — 출생시간을 입력하지 않아 계산하지 않음</td>'),
 'offline reading must disclose the fourth pillar is uncalculated, as the live app does');
assert(withoutHourHtml.includes('출생정보에서 계산된 자리와 시간 미상 안내'));
assert(!withoutHourHtml.includes('丁卯'),
 'an unknown time must never be replaced with a guessed pillar');
assert(!html.includes('시간 모름 — 출생시간을 입력하지 않아 계산하지 않음'),
 'the known-time sample must not be misrepresented as unknown');
const narrow=structuredClone(report);narrow.sections=narrow.sections.slice(0,3);
const narrowHtml=exp.build(narrow);
assert(narrowHtml.includes('실제로 작성된 내용: 3개 장 · 실제 작성된 6개 세부 풀이'));
assert.equal((narrowHtml.match(/<article id="part-/g)||[]).length,3);
assert.equal((narrowHtml.match(/<section class="topic" id="part-\d+-topic-\d+">/g)||[]).length,6);
assert(!narrowHtml.includes('직업 본문에 있는 내용'),'omitted chapter highlights cannot leak into export');
const legacy=structuredClone(narrow);for(const item of legacy.sections)delete item.bodyTopics;
const legacyHtml=exp.build(legacy);
assert(legacyHtml.includes('실제로 작성된 내용: 3개 장'));
assert(!legacyHtml.includes('실제 작성된 6개 세부 풀이'),
 'legacy data without source-owned topic IDs must not claim exact volume');
const malicious=structuredClone(narrow);malicious.meta.name='<img src=x onerror=alert(9)>';
malicious.sections[0].body[0]='</article><script>alert(9)</script>';
const safe=exp.build(malicious);
assert(!safe.includes('</article><script>'));
assert(safe.includes('&lt;/article&gt;&lt;script&gt;alert(9)&lt;/script&gt;'));
const invalid=structuredClone(report);invalid.sections[0].body[1]='  ';
assert.throws(()=>exp.build(invalid),/READABLE_EXPORT_INVALID_COMPLETED_CHAPTER/);
assert.throws(()=>exp.build({sections:[]}),/READABLE_EXPORT_NO_COMPLETED_CHAPTERS/);
const repeated=structuredClone(report);repeated.sections.push(repeated.sections[0]);
assert.throws(()=>exp.build(repeated),/READABLE_EXPORT_DUPLICATE_CHAPTER/);
console.log('PASS offline readable HTML export: delivered-only chapters/paragraphs, exact source-owned counts, bounded final summary, escaped private input, no network or script or fake chapter');
