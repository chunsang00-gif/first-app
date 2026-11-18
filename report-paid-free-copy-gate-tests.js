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
 assert.deepEqual(copy.inspect([{id:'decision',bodyTopics:['approach'],body:[original]}],packet),[]);
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
 assert(copy.inspect([thin],packet).includes(reason),
  'a synonym-only month explanation must not clear the paid editorial gate');
 const extra={...thin,bodyTopics:['temperament','strength'],
  body:['계절과 겉글자가 태어난 날에 서로 다르게 닿는 경우를 따로 설명합니다.',essay],
  evidence:[...proof,'temperament: facts.seasonalEvidence (independent evidence)']};
 assert(!copy.inspect([extra],packet).includes(reason),
  'an independently grounded second topic remains eligible for human review');
 const buyer=facts.build({...cases[0],
  readerDecision:'새 기술을 배울지 현재 일을 계속할지 고민합니다.'},2027);
 assert.equal(typeof buyer.person.readerDecision,'string');
 assert(!copy.inspect([thin],buyer).includes(reason),
  'a voluntary concrete customer question is handled by its separate application gate');
 const noProof={...thin,evidence:['unstructured prose without verified IDs']};
 assert(!copy.inspect([noProof],packet).includes(reason),
  'missing provenance should be rejected by the grounding gate, not guessed here');
}

assert.throws(()=>copy.inspect([{id:'saju_core',body:['충분히 긴 문장을 작성합니다.']}],{}),
 /PAID_FREE_COPY_VERIFIED_PACKET_REQUIRED/);
console.log('PASS three independent charts reject copied and minimally rewritten free reading, but allow distinct paid meaning; no provider calls');
