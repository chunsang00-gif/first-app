'use strict';
const assert=require('node:assert/strict');
const claims=require('./report-seasonal-claims');
const quality=require('./report-quality-node');
const facts=require('./report-facts-node');
const input={calendar:'solar',birthDate:'1990-05-15',birthTime:'10:30',gender:'male',mbti:'ISFP'};
const packet=facts.build(input,2027);
assert.equal(packet.status,'ready');
const draft=text=>({sections:[{id:'saju_core',title:'계절과 원국',keyJudgment:text,body:[],evidence:[]}]});
const impossible=[
 '이 사주는 확실한 신강입니다.',
 '당신의 일간은 신약으로 판정했습니다.',
 '태어난 달은 가을입니다.',
 '사주의 용신은 화입니다.',
 '일간이 득령했습니다.'
];
for(const statement of impossible){
 const found=claims.check(draft(statement),packet);
 assert(found.length,'uncomputed seasonal claim must fail: '+statement);
 assert(quality.verifyEvidenceAgainstFacts(draft(statement),packet).errors.length,
  'real paid quality gate must reject seasonal claim: '+statement);
}
for(const acceptable of [
 '일간의 강약은 아직 판정하지 않았습니다.',
 '용신은 화라고 단정할 수 없습니다.',
 '득령으로 확정할 수 없습니다.',
 '월지의 계절과 지장간을 함께 비교해야 합니다.'
])assert.deepEqual(claims.check(draft(acceptable),packet),[],
 'qualified seasonal analysis is not a categorical claim: '+acceptable);
const expected={spring:'봄',summer:'여름',autumn:'가을',winter:'겨울'}[packet.facts.seasonalEvidence.monthSeason];
assert.deepEqual(claims.check(draft('태어난 달은 '+expected+'입니다.'),packet),[]);
const fake=structuredClone(packet);
delete fake.facts.tenGods;
assert(claims.check(draft('득령했습니다.'),fake).length);
assert(quality.verifyEvidenceAgainstFacts(draft('득령했습니다.'),fake).errors.length,
 'no ten-god input must not bypass independent seasonal safety');
assert(claims.check({sections:[],cover:{headline:'사주의 용신은 화입니다.',highlights:[]}},packet).length);
assert(claims.check({sections:[],finalJudgment:{headline:'결론',body:['일간은 신강입니다.']}},packet).length);
console.log('PASS natural Korean seasonal truth, unsupported strong-weak/useful-god assertions, optional negation, cover and summary; no paid API');
