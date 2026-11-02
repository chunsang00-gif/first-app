'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const guidance=require('./report-analysis-guidance');
const writer=require('./report-generation-request');
const readable=require('./report-paid-annual-reader-substance');
const roles={
 비견:'자기 몫과 같은 역할',겁재:'자원의 분담과 경쟁',
 식신:'결과물을 만드는 과정',상관:'기존 방법을 바꾸어 제안하는 질문',
 정재:'돈과 자원을 관리하는 질문',편재:'외부 자원을 활용하는 질문',
 정관:'규칙과 맡은 역할',편관:'예상 밖의 요구와 압박',
 정인:'도움과 새로운 배움',편인:'낯선 자료를 자기 방식으로 이해하는 과정'
};
let tested=0;const kinds=new Set();
for(const year of [1982,1990,1998,2006])
for(const month of [2,5,8,11])for(const day of [7,21]){
 const input={calendar:'solar',
  birthDate:year+'-'+String(month).padStart(2,'0')+'-'+String(day).padStart(2,'0'),
  birthTime:'14:20',gender:'male',mbti:'ISFP'};
 const packet=facts.build(input,2027);
 const plan=guidance.preflight(packet);
 const prompt={stage:'body',facts:packet,requestedSections:['year_2027'],
  analysisGuidance:{...guidance.forRequest(['year_2027'],packet.person.mbti),
   editorialBlueprint:plan},rules:{sectionGoals:require('./report-prompt').sectionGoals},
  priorSections:[]};
 const task=writer.compile(prompt).task.chapters.year_2027.topics.change;
 const proof=task.sourceOwnedAnnualIntegratedScope;
 assert(proof);
 const word=roles[proof.annualGod];
 assert(word);
 kinds.add(proof.annualGod);
 const paragraph=(text)=>({label:'2027년의 전통적 분류',text,
  basis:{refs:['facts.annualTenGods'],interpretation:'계산된 연간 뜻',
   condition:'출생 근거를 독립적으로 비교하는 경우',
   limit:'실제 운세 사건을 확정하지 않습니다.'}});
 const response=p=>({chapters:{year_2027:{paragraphs:{change:p}}}});
 const correct='2027년의 겉글자에서는 '+word+
  '에 해당하는 전통적 의미가 확인됩니다. 출생 당시의 분류와 연도별 분류는 다른 질문이므로 강약이나 실제 사건을 예측하지 않습니다.';
 assert.equal(readable.inspect(paragraph(correct),'year_2027','change',task),null);
 assert.doesNotThrow(()=>writer.restoreEvidence(response(paragraph(correct)),prompt));
 const generic='2027년에는 자료를 확인한 뒤 계획을 세워야 합니다. 여러 조건을 충분히 검토하는 것이 중요합니다.';
 assert.equal(readable.inspect(paragraph(generic),'year_2027','change',task),
  'annual-role-meaning-not-explained-in-reader-prose');
 assert.throws(()=>writer.restoreEvidence(response(paragraph(generic)),prompt),
  /paid annual reader meaning missing: year_2027:change/);
 const disclaimer='이 계산만으로 앞으로 벌어질 일을 알 수 없습니다. 실제 결과를 단정할 수 없습니다.';
 assert.throws(()=>writer.restoreEvidence(response(paragraph(disclaimer)),prompt),
  /paid annual reader meaning missing: year_2027:change/);
 // An unrelated topic must never inherit the change paragraph's role words.
 assert.equal(readable.inspect(paragraph(generic),'career','workstyle',task),null);
 tested++;
}
assert.equal(tested,32);
assert(kinds.size>=4,'real charts must exercise several different traditional roles');
const secondaryTask={sourceOwnedAnnualDayContext:{mode:'secondary-table-only'}};
const base={text:'2027년의 연간 계산을 확인하고 조건을 비교하는 것이 좋습니다.'};
assert.equal(readable.inspect(base,'year_2027','impact',secondaryTask),
 'secondary-day-relation-not-explained-in-reader-prose');
assert.equal(readable.inspect({text:'2027년 지지와 태어난 날의 지지 사이에 부수적인 관계표 쌍이 계산됩니다. 이는 실제 만남이나 이별을 예측한 것이 아닙니다.'},'year_2027','impact',secondaryTask),null);
assert.equal(readable.inspect(base,'year_2027','impact',
 {sourceOwnedAnnualDayContext:{mode:'separate-chapter'}}),null);
console.log('PASS QA19 annual paid prose meaning gate for 32 real charts and secondary day pair; zero paid API calls');
