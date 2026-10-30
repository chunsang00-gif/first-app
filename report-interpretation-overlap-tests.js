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
// A duplicate inside ONE chapter used to be skipped even when both
// paragraphs cited the exact same natal row and sold the same causal claim.
const sameChapterCopied={id:'money',
 bodyTopics:['earning','spending'],
 body:[money.body[0],
  '지출과 보유를 결정할 때에도 계산된 근거와 자료를 검토한 다음 기준을 확인하고 선택합니다.'],
 evidence:[
  'earning: natal.month.stem (월간 辛 겁재) / 해석: 돈의 상징 / 조건: 가정 / 한계: 실제 수입 미측정',
  'spending: natal.month.stem (월간 辛 겁재) / 해석: 같은 상징 / 조건: 가정 / 한계: 실제 지출 미측정'
 ]};
assert(inspect([sameChapterCopied]).some(x=>x.includes('money:earning / money:spending')),
 'same-chapter paid topics cannot sell one cited causal claim twice');
const sameChapterDistinct=structuredClone(sameChapterCopied);
sameChapterDistinct.body[1]='금전 관련 전통 기호는 자원을 보유한다는 뜻을 설명하지만 실제 지출 습관이나 수입은 측정한 것이 아닙니다.';
assert.deepEqual(inspect([sameChapterDistinct]),[],
 'the same traditional symbol can answer a genuinely different, limited question');
const sameChapterDifferentSource=structuredClone(sameChapterCopied);
sameChapterDifferentSource.evidence[1]=sameChapterDifferentSource.evidence[1]
 .replace('natal.month.stem','natal.day.hidden.己');
assert.deepEqual(inspect([sameChapterDifferentSource]),[],
 'shared vocabulary without actually cited shared source cannot prove duplication');

// The real paid writer is allowed to cite multiple exact rows; padding a
// duplicate MBTI/Saju claim with one extra row must NOT bypass this gate.
const expanded=section('career','workstyle',career.body[0],
 [source,'natal.day.hidden.己']);
assert(inspect([money,expanded]).some(x=>x.includes('evidence-check-before-decision')),
 'same behavior with shared natal source must fail even after adding an extra verified citation');
const narrowed=section('money','earning',money.body[0],[source,'natal.year.stem']);
assert(inspect([narrowed,career]).some(x=>x.includes('evidence-check-before-decision')),
 'subset/superset source paths must not determine whether paid copy is duplicated');
const moneyMbti=section('money','earning',
 'ISFP의 MBTI 감각형 선호 때문에 정보를 확인하고 나서 결정합니다.',
 ['person.mbti','natal.month.hidden.己']);
const careerMbti=section('career','workstyle',
 'ISFP의 MBTI 감각형 선호라서 업무에서도 자료를 검토한 다음에 판단하고 선택합니다.',
 ['person.mbti','natal.day.hidden.乙']);
assert(inspect([moneyMbti,careerMbti]).some(x=>x.includes('evidence-check-before-decision')),
 'identical MBTI-derived decision story cannot be resold by changing unrelated natal citations');
const relationMbti=section('relationship','closeness',
 'ISFP의 MBTI 감각형 선호로 관계에서도 자료를 먼저 확인한 다음 결정합니다.',
 ['person.mbti','natal.hour.stem']);
assert(inspect([moneyMbti,careerMbti,relationMbti]).length>=2,
 'three domain names must not turn one MBTI generalization into three insights');
const unrelatedMbti=section('relationship','closeness',
 'ISFP의 MBTI 선호를 설명하더라도 친밀한 사람과의 애정 표현을 실제로 측정한 결과가 아닙니다.',
 ['person.mbti','natal.day.hidden.乙']);
assert.deepEqual(inspect([moneyMbti,unrelatedMbti]),[],
 'shared MBTI evidence with a genuinely different question and no causal repeat must be allowed');
const unnamedMbti=section('career','workstyle',
 '업무 자료를 확인한 다음 기준에 따라 결정합니다.',
 ['person.mbti','natal.day.hidden.乙']);
assert.deepEqual(inspect([moneyMbti,unnamedMbti]),[],
 'a shared MBTI source alone without a visible MBTI-attributed claim must not be decisive');
const annualExact=section('year_2027_money','change',
 '2027년에는 관련된 자료를 확인하고 판단한 뒤 결정합니다.',['annual.stem']);
const annualExtra=section('year_2027_career','change',
 '2027년에는 정보를 검토하고 기준을 살펴서 선택합니다.',['annual.stem','natal.month.stem']);
assert(inspect([annualExact,annualExtra]).some(x=>x.includes('evidence-check-before-decision')),
 'same annual position plus irrelevant extra fact must not republish one yearly reading');
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
