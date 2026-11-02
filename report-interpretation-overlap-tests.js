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
// Three recently shipped source-ledger types used to bypass the older
// inspector: their refs were parsed, but not considered interpretive sources.
// Check different wordings of one computed proposition, not word counts.
const annualTriadA=section('year_2027','new_triad',
 '2027년에는 태어날 때 미완성이던 세 자리 조합이 새로 완성되는 것으로 계산됩니다.',
 ['facts.targetYearBranchRelations']);
const annualTriadB=section('year_2027','impact',
 '2027년 세운이 더해지며 출생 당시 없던 삼합의 세 지지가 모두 갖춰집니다.',
 ['facts.targetYearBranchRelations']);
assert(inspect([annualTriadA,annualTriadB]).some(x=>
 x.includes('new-annual-triad-membership')&&x.includes('year_2027:new_triad / year_2027:impact')),
 'same newly completed annual group cannot be sold twice inside the year chapter');
const annualRootA=section('year_2027','root_contrast',
 '2027년에는 태어난 날을 받치는 뿌리의 한 자리가 충을 만나지만 다른 자리는 같은 충을 맺지 않습니다.',
 ['facts.rootConditions']);
const annualRootB=section('year_2027','impact',
 '2027년 세운의 충은 숨은 글자가 있는 한 위치에만 걸리므로 다른 위치의 뿌리와 구분됩니다.',
 ['facts.rootConditions']);
assert(inspect([annualRootA,annualRootB]).some(x=>x.includes('annual-clash-vs-other-day-root')),
 'same positional root contrast cannot be republished as a year overview');
const natalHarmonyA=section('relationship','coordination',
 '태어난 날과 태어난 달의 지지 사이에 육합 짝 관계가 계산되므로 두 출생 자리를 연결해 살펴봅니다.',
 ['facts.natalBranchRelations']);
const natalHarmonyB=section('relationship','closeness',
 '일지와 월지의 결합 관계는 하나의 짝으로 확인되지만 실제 배우자 운세를 보증하지 않습니다.',
 ['facts.natalBranchRelations']);
assert(inspect([natalHarmonyA,natalHarmonyB]).some(x=>x.includes('isolated-natal-day-harmony-pair')),
 'same natal day combination cannot be rebranded as a second intimacy insight');
// Having a ledger in common is not enough to call two DIFFERENT traditional
// calculations identical. Different factual propositions remain eligible.
const separateAnnual=section('year_2027','impact',
 '2027년의 지지와 태어난 날 사이의 직접 충을 계산했더라도 실제 관계 갈등은 알 수 없습니다.',
 ['facts.targetYearBranchRelations']);
assert.deepEqual(inspect([annualTriadA,separateAnnual]),[],
 'a new triad and an unrelated direct annual pair are not interchangeable');
assert.deepEqual(inspect([annualTriadA,{
 ...annualTriadB,evidence:['새로운 세 자리 계산은 검증되지 않았습니다.']
}]),[],
 'citation missing: a similar phrase alone is not a source-proven duplicate');
assert.deepEqual(inspect([annualTriadA,{
 ...annualTriadB,evidence:[annualTriadB.evidence[0].replace('facts.targetYearBranchRelations','facts.annualTenGods')]
}]),[],
 'unrelated annual stems must not be equated to actual branch groups');
const genuineLimit=section('year_2027','impact',
 '2027년 세운으로 삼합 세 글자가 완성된다고 단정할 수 없습니다.',
 ['facts.targetYearBranchRelations']);
assert.deepEqual(inspect([annualTriadA,genuineLimit]),[],
 'a caution about unverified transformation cannot be treated as a second asserted result');
assert.equal(coverage([annualTriadA,annualRootA,natalHarmonyA]).withCitations,3,
 'the new ledgers must be counted as actually cited report evidence');
console.log('PASS deterministic repeated causal interpretation under shared verified facts; no paid API');
