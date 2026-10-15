'use strict';
const assert=require('node:assert/strict');
const {inspect,signatures,coverage}=require('./report-interpretation-overlap');
const source='natal.month.stem';
const section=(id,topic,text,refs=[source])=>({
 id,bodyTopics:[topic],body:[text],
 evidence:[topic+': '+refs.map(ref=>ref+' (월간 辛 겁재)').join('; ')+' / 해석: 계산 상징 / 조건: 가정 / 한계: 실제 행동은 알 수 없음']
});
// Old paid QA reused the same verify-then-decide story in different domains.
const money=section('money','earning','돈을 벌 때에는 계산된 자료와 판단 근거를 먼저 확인하고 결정합니다.');
const career=section('career','workstyle','직업에서 업무를 선택할 때에도 자료를 검토한 다음 기준을 확인하고 판단합니다.');
assert(inspect([money,career]).some(x=>x.includes('evidence-check-before-decision')),
 'reworded conclusion based on same calculated row must be caught');
assert.deepEqual(inspect([money,section('career','workstyle',career.body[0],['natal.day.stem'])]),[],
 'same cliché with different calculated source must not be reported by source-specific gate');
const meaningful=section('career','workstyle','직업에서 정해진 업무를 배울 때는 익혀야 할 절차의 의미와 자신의 역할을 구분합니다.');
assert.deepEqual(inspect([money,meaningful]),[],
 'shared source with a different substantive claim is permissible');
const limited=section('career','workstyle','자료를 먼저 확인하고 결정한다고 단정할 수 없습니다.');
assert.deepEqual(inspect([money,limited]),[],
 'explicit limitation is not the same asserted behavior');
const noEvidence={...career,evidence:['검증이 필요한 오래된 원문 근거']};
assert.deepEqual(inspect([money,noEvidence]),[],
 'unverified source references must never trigger definitive rejection');
const annualMoney=section('year_2027_money','change','2027년에는 조직의 책임과 공식 규칙을 다시 확인한 뒤 따릅니다.',['facts.annualTenGods']);
const annualCareer=section('year_2027_career','change','2027년에는 조직의 역할과 책임을 검토하고 규칙을 지키는 해입니다.',['facts.annualTenGods']);
assert(inspect([annualMoney,annualCareer]).some(x=>x.includes('rules-and-duty-before-action')),
 'annual ten-god generality cannot be repackaged as two paid predictions');
assert(!signatures('그 뜻으로 실제 행동을 판단할 수 없습니다.').size);
assert(!signatures('돈을 얼마 벌 것인지는 확인할 수 없습니다.').size);
// Paragraph-level evidence ownership: a preceding null topic never counts.
assert.deepEqual(inspect([money,{...career,bodyTopics:['unrelated']}]),[]);
const oldReport={sections:[{id:'money',bodyTopics:['earning'],body:['일반 설명'],evidence:['예전 QA는 자유로운 근거 문장을 기록했습니다.']}]};
assert.equal(coverage(oldReport.sections).status,'no-canonical-source-data');
assert.equal(coverage([money,career]).status,'canonical-source-data');
assert.equal(coverage([money,noEvidence]).status,'partial-canonical-source-data');
assert.equal(coverage([money,career]).withCitations,2);
console.log('PASS deterministic repeated causal interpretation under shared verified facts; no paid API');
