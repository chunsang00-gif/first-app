'use strict';
const assert=require('node:assert/strict');
const copy=require('./report-paid-free-copy-gate');
const facts=require('./report-facts-node');
const sample=require('./report-reading-sample');
const cases=[
 {calendar:'lunar',leapMonth:false,birthDate:'1982-11-24',birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'1994-07-15',birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'1994-01-15',birthTime:'14:20',gender:'male',mbti:'ISFP'}
];
for(const input of cases){
 const packet=facts.build(input,2027);
 assert.equal(packet.status,'ready');
 const original=sample.build(packet).cards.find(x=>x.id==='birth-month').text;
 const section=body=>[{id:'saju_core',bodyTopics:['strength'],body:[body]}];
 const code='copied-free-reader-meaning:saju_core:strength:birth-month';
 assert(copy.inspect(section(original),packet).includes(code));
 assert(copy.inspect(section(original+' 별도의 유료 내용입니다.'),packet).includes(code));
 const swapped=original.replace('태어난 달','출생한 달').replace('안쪽','내부').replace('겉에','바깥에');
 assert(copy.inspect(section(swapped),packet).includes(code));
 const unique='이 출생월에 계산된 두 분류를 이어서 한 가지 선택 상황에 적용하는 질문입니다. '+
  '각각의 전통적 뜻이 판단의 어느 부분을 설명하는지 연결하되, 실제 행동을 확인하거나 출생월 관계의 우위를 확정할 수는 없습니다. '+
  '선택 상황과 해석 한계가 구분되지 않는 경우에는 그 의미를 짧게만 남기고, 새로운 직업이나 사건을 만들어내지 않습니다.';
 assert.deepEqual(copy.inspect(section(unique),packet),[]);
 // The new paid year/hour reader must also prove value over the
 // FREE year/hour card, not merely over the FREE month-only material.
 const yearHour=sample.build(packet).cards.find(c=>c.id==='year-hour');
 assert(yearHour?.text,'known time should have a free year/hour card');
 const yearCopier=[{id:'saju_core',bodyTopics:['temperament'],body:[yearHour.text]}];
 assert(copy.inspect(yearCopier,packet).includes(
  'copied-free-reader-meaning:saju_core:temperament:year-hour'),
  'relabeling the free year/hour prose as paid must not pass');
 const paddedYear=[{id:'saju_core',bodyTopics:['temperament'],
  body:[yearHour.text+' 개인에게 적용할 때 확인할 내용입니다.']}];
 assert(copy.inspect(paddedYear,packet).some(v=>v.endsWith(':year-hour')),
  'padding an unchanged free year/hour paragraph is not paid value');
 const moved=copy.inspect([{id:'decision',bodyTopics:['approach'],body:[original]}],packet);
 assert(moved.includes('copied-free-reader-meaning:decision:approach:birth-month'),
  'moving FREE core prose into an optional paid decision chapter is not added value');
 const annual=sample.build(packet).cards.find(c=>c.id==='annual-2027').text;
 assert(copy.inspect([{id:'year_2027',bodyTopics:['change'],body:[annual]}],packet)
  .includes('copied-free-reader-meaning:year_2027:change:annual-2027'),
  'annual category already explained FREE cannot be billed again under a new heading');
 assert(copy.inspect([{id:'year_2027_money',bodyTopics:['change'],
  body:[annual+' 금전 항목의 별도 설명입니다.']}],packet)
  .some(x=>x.endsWith(':annual-2027')),
  'padding an annual-free card with domain labels is still free copying');
 const restored=copy.inspect([{id:'relationship',bodyTopics:['closeness'],
  topicConclusions:[original]}],packet);
 assert(restored.some(x=>x.includes('relationship:closeness:birth-month')),
  'restored batches store topicConclusions, not body, and must be checked');
 assert.equal(copy.similarity('',original),0);
}
// Real paid QA regression: even when the prose paraphrases rather than COPIES
// the free text, a single month-only paragraph has no separately evidenced
// customer value. Do not persist real provider text in the public repository.
{
 const packet=facts.build(cases[0],2027);
 const monthMain=packet.facts?.structuralEvidence?.monthCommand?.mainHiddenStem;
 assert(monthMain,'the exact month main stem must come from calculation');
 const essay='가상의 선택에서 자료를 스스로 이해하는 질문과 자원을 마련하는 질문을 함께 생각합니다. 각각의 전통적인 의미를 연결하되 이것이 실제로 일어났다는 뜻은 아닙니다.';
 const proof=['strength: natal.month.stem (verified month visible); '+
  'natal.month.hidden.'+monthMain+' (verified month main hidden)'];
 const thin={id:'saju_core',bodyTopics:['strength'],body:[essay],evidence:proof};
 const reason='paid-core-no-independent-reader-value:saju_core:strength';
 assert(copy.minimumValueProblems(thin,packet).includes(reason),
  'a synonym-only month explanation must not clear the paid editorial gate');
 const extra={...thin,bodyTopics:['temperament','strength'],
  body:['계절과 겉글자가 태어난 날에 서로 다르게 닿는 경우를 따로 설명합니다.',essay],
  evidence:[...proof,'temperament: facts.seasonalEvidence (independent evidence)']};
 assert(!copy.minimumValueProblems(extra,packet).includes(reason),
  'an independently grounded second topic remains eligible for human review');
 const buyer=facts.build({...cases[0],
  readerDecision:'새 기술을 배울지 현재 일을 계속할지 고민합니다.'},2027);
 assert.equal(typeof buyer.person.readerDecision,'string');
 assert(copy.minimumValueProblems(thin,buyer).includes(reason),
  'a buyer question alone must not approve a month-only paid chapter');
 const noProof={...thin,evidence:['unstructured prose without verified IDs']};
 assert(!copy.minimumValueProblems(noProof,packet).includes(reason),
  'missing provenance should be rejected by the grounding gate, not guessed here');
}

// Work76: verify the EXACT customer-visible free income/work paragraphs
// cannot be re-sold as money/career paid material. No model/merchant.
{
 const calculated=require('./report-product-coverage').calculate(cases[0]);
 assert.equal(calculated.status,'ready');
 const publicExamples=calculated.interpretivePreviews;
 assert(publicExamples.length>0,'the actual free customer preview has authored domain examples');
 const packet=facts.build(cases[0],2027);
 for(const preview of publicExamples){
  const [id,topic]=preview.id.split('.');
  const copied=copy.inspect([{id,bodyTopics:[topic],body:[preview.text]}],packet);
  assert(copied.includes('copied-free-reader-meaning:'+id+':'+topic+':'+preview.id),
   'the FREE pre-purchase '+preview.id+' paragraph must never qualify as paid insight');
  const repackaged=copy.inspect([{
   id:'saju_core',bodyTopics:['temperament'],body:[preview.text]
  }],packet);
  assert(repackaged.includes('copied-free-reader-meaning:saju_core:temperament:'+preview.id),
   'moving an already-FREE '+preview.id+' paragraph to the paid FIRST chapter is still copying');
 }
 const trulyDifferent=[{id:'money',bodyTopics:['spending'],
  body:['가상의 생활비 지출에서 이미 나간 금액과 아직 결정하지 않은 예정 지출을 나누어 기록합니다. 이 비교는 출생 정보에서 계산된 사실과 구별되는 사용자 선택의 연습입니다.'] }];
 assert.deepEqual(copy.inspect(trulyDifferent,packet),[],
  'different customer questions may reuse normal vocabulary without being called copies');
}
// The FINAL synthesis/strengths are also a paid, customer-visible deliverable.
{
 const packet=facts.build(cases[0],2027);
 const freeAnnual=sample.build(packet).cards.find(c=>c.id==='annual-2027').text;
 const quality=require('./report-quality-node');
 const r={
  meta:{name:packet.person.name,mbti:packet.person.mbti,
   chart:packet.chart,targetYear:packet.targetYear?.year},
  sections:[{id:'saju_core',title:'출생월의 계산 위치를 설명하는 독립적인 제목',
   keyJudgment:'태어난 달의 겉글자와 안쪽 글자는 서로 다른 위치입니다.',
   body:['태어난 달의 계산한 글자가 서로 다른 위치에 있어 한 가지 결론만 적용해서는 안 됩니다.'],
   bodyLabels:['태어난 달의 자리'],bodyTopics:['strength'],
   evidence:['월간과 월지 중심 글자의 계산된 관계를 구별합니다.']}],
  cover:{headline:'출생월의 위치 비교',description:'전통 해석의 구별되는 출처를 설명합니다.',
   keywords:['위치 비교','전통 분류','출생 자료'],highlights:[]},
  finalJudgment:{headline:'확인된 점과 한계',body:[freeAnnual],
   strengths:['출처를 구분해 읽을 수 있습니다.'],watchouts:[],
   routines:[],closingQuestion:'입력된 출생자료의 계산된 위치를 구별해야 합니다.'}
 };
 const copied=quality.validate(r,packet).errors;
 assert(copied.some(x=>x.startsWith('copied-free-reader-meaning:finalJudgment:final-0:annual-2027')),
  'the ACTUAL final report QA must block free annual card copied into final conclusion');
 const notCopied=structuredClone(r);
 notCopied.finalJudgment.body=[
  '전통적인 출생월 계산만으로 실제 개인의 수입과 직장 변화를 판정할 수는 없습니다.'
 ];
 assert(!quality.validate(notCopied,packet).errors.some(x=>x.startsWith(
  'copied-free-reader-meaning:finalJudgment:')),
  'a distinct final limitation must not be falsely called a verbatim free card');
}
assert.throws(()=>copy.inspect([{id:'saju_core',body:['충분히 긴 문장을 작성합니다.']}],{}),
 /PAID_FREE_COPY_VERIFIED_PACKET_REQUIRED/);
console.log('PASS three independent charts reject copied and minimally rewritten free reading, but allow distinct paid meaning; no provider calls');
