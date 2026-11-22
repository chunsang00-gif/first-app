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
// Conditional language is the NORMAL paid writing style; "가정하면"
// alone cannot make a duplicated cited interpretation invisible.
const imaginedMoney=section('money','earning',
 '가상의 거래를 가정하면 자료와 판단 근거를 먼저 확인하고 결정합니다.');
const imaginedCareer=section('career','workstyle',
 '새로운 업무를 가정하면 정보를 검토하고 기준을 확인한 다음 선택합니다.');
assert(inspect([imaginedMoney,imaginedCareer]).some(s=>s.includes('evidence-check-before-decision')),
 'a duplicated claim on the SAME cited natal row must not escape because it says 가정하면');
assert.deepEqual(inspect([imaginedMoney,section('career','workstyle',
 imaginedCareer.body[0],['natal.day.stem'])]),[],
 'conditional interpretations citing different natal facts are not proven duplicates');
assert.deepEqual(inspect([imaginedMoney,section('career','workstyle',
 '이것은 실제 행동을 관찰한 결과가 아니며, 판단은 단정할 수 없습니다.')]),[],
 'a meaningful explicit limitation is not the same conditional behavior claim');
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
// Regression from the actual editorial diagnosis: the premium manuscript
// repeated "understand the material vs find the resources" in multiple
// chapters while earlier signature families did not cover this motif.
const understandVsResourcesA=section('saju_core','strength',
 '새로운 내용을 이해하는 문제와 실행에 필요한 비용을 마련하는 문제를 따로 읽습니다.',
 ['natal.month.stem','natal.month.hidden.己']);
const understandVsResourcesB=section('decision','choice',
 '선택할 때도 설명을 이해하는 문제와 필요한 자원이 부족한 문제를 구분합니다.',
 ['natal.month.stem','natal.day.stem']);
const understandVsResourcesC=section('stress','pressure',
 '압박 상황에서도 정보를 이해할 것인지, 사용할 예산이 부족한지 따로 구별합니다.',
 ['natal.month.stem']);
assert(inspect([understandVsResourcesA,understandVsResourcesB]).some(e=>
 e.includes('understanding-vs-resources')),
 'the same source-owned learning/resources contrast must not be sold as a fresh decision thesis');
assert(inspect([understandVsResourcesA,understandVsResourcesB,understandVsResourcesC])
 .filter(e=>e.includes('understanding-vs-resources')).length>=2,
 'recycling the same cited premise in a third chapter must also be detected');
assert.deepEqual(inspect([understandVsResourcesA,section('decision','choice',
 understandVsResourcesB.body[0],['natal.day.stem'])]),[],
 'an unrelated chart source does not prove the explanation is a repeat');
assert.deepEqual(inspect([understandVsResourcesA,section('money','spending',
 '구매할 때 필요한 도구와 예산을 나누어 기록합니다.',
 ['natal.month.stem'])]),[],
 'a distinct resource-only expense comparison is not the same thesis');
assert(!signatures('정보를 이해하지 못했다고 단정할 수 없고 비용 부족도 확인할 수 없습니다.')
 .has('understanding-vs-resources'),
 'an explicit limitation is not a second positive interpretation');


const {synthesisRepetition}=require('./report-interpretation-overlap');
const firstUnique='출생월의 두 전통 분류는 출생 위치가 달라 서로 다른 가상 판단 질문에 연결됩니다.';
const finalSource=section('saju_core','strength',firstUnique,['natal.month.stem']);
assert(synthesisRepetition({sections:[finalSource],finalJudgment:{
 body:[firstUnique],closingQuestion:'현재의 계산된 차이를 유의해 살펴봅니다.'}})
 .some(e=>e.includes('final synthesis copies prior reader sentence')),
 'copying an entire paid chapter sentence into the closing body must not pass as synthesis');
const coreRecycled=section('saju_core','strength',
 '실제로 필요한 정보를 이해하는 일과 실행에 드는 자원을 마련하는 일은 다른 문제입니다.',
 ['natal.month.stem']);
const lastRecycled='기존 원고에서 설명한 내용의 이해와 실행에 필요한 비용을 마련하는 문제는 따로 구분해서 판단합니다.';
assert(synthesisRepetition({sections:[coreRecycled],finalJudgment:{body:[lastRecycled]}})
 .some(e=>e.includes('understanding-vs-resources')),
 'the rejected learning-vs-resources thesis cannot return as a new final summary');
assert.deepEqual(synthesisRepetition({sections:[coreRecycled],finalJudgment:{
 body:['태어난 해와 연도의 실제 관계는 달의 계산 위치와 질문이 다르므로 함께 살펴볼 만합니다.']}}),[],
 'a different, conditional source-bound summary must not fail as generic word overlap');
assert.deepEqual(synthesisRepetition({sections:[section('saju_core','strength',
 coreRecycled.body[0],['natal.day.stem'])],finalJudgment:{
 body:['정보를 이해하지 못한다고 단정할 수 없고 비용 부족도 확인할 수 없습니다.']}}),[],
 'a mere denial in final prose is not a repeated positive thesis');
// Work73: the original gate compared chapter BODY only and skipped
// keyJudgment, final strengths/watchouts/routines. Verbatim padding in those
// visible fields was therefore treated as a new premium conclusion.
const longVerdict='태어난 달의 계산된 두 위치는 같은 상황에서도 확인할 사항을 서로 다르게 설명할 수 있습니다.';
const separateVerdict=section('saju_core','strength',
 '태어난 달의 겉글자와 안쪽 글자를 구분한 뒤 실제 선택 상황에 적용하는 예시를 살핍니다.',
 ['natal.month.stem']);
separateVerdict.keyJudgment=longVerdict;
const withFinal=finalJudgment=>({sections:[separateVerdict],finalJudgment});
assert(synthesisRepetition(withFinal({body:[longVerdict]}))
 .some(x=>x.includes('saju_core:keyJudgment')),
 'copying the original chapter verdict into the final body is not fresh analysis');
for(const field of ['strengths','watchouts']){
 assert(synthesisRepetition(withFinal({
  body:['서로 다른 계산 위치를 하나의 관점으로 읽을 때는 출처부터 따로 확인합니다.'],
  [field]:[longVerdict]
 })).some(x=>x.includes('saju_core:keyJudgment')),
 'a copied long key verdict in final '+field+' must be detected');
}
assert(synthesisRepetition(withFinal({
 body:['마지막 본문에서는 앞에서 검토한 조건을 간결하게 연결합니다.'],
 routines:[{trigger:'선택 전',action:'계산 근거 확인',reason:longVerdict}]
})).some(x=>x.includes('saju_core:keyJudgment')),
 'routines cannot recycle a whole original paid verdict as a new action reason');
assert(synthesisRepetition(withFinal({body:['짧은 요약입니다.'],
 closingQuestion:longVerdict})).some(x=>x.includes('saju_core:keyJudgment')),
 'the closing sentence must not simply repeat the chapter verdict');
assert.deepEqual(synthesisRepetition(withFinal({
 body:['태어난 달의 서로 다른 분류를 실제 선택의 조건으로 비교하는 데 한계가 있음을 확인합니다.'],
 strengths:['두 출처 확인'],watchouts:['단정하지 않기']
})),[],
 'a genuinely shorter synthesis with a different question must not be blocked');
const yearCalcA=section('year_2027','change',
 '2027년에는 태어난 날과 새해의 지지 사이에 직접 충이 계산됩니다.',
 ['facts.targetYearRelations']);
const yearCalcOpposite='2027년에는 태어난 날과 새해의 지지 사이에 직접 충이 계산되지 않았습니다.';
assert(synthesisRepetition({sections:[yearCalcA],
 finalJudgment:{body:[yearCalcOpposite]}})
 .some(x=>x.includes('final synthesis contradicts previously stated calculation')),
 'the exact same annual/day calculation cannot reverse its existence in the conclusion');
assert(synthesisRepetition({sections:[yearCalcA,section('year_2027_money','change',
 yearCalcOpposite,['facts.targetYearRelations'])],finalJudgment:{body:[]}})
 .some(x=>x.includes('contradictory calculated claim between chapters')),
 'a direct source-fact contradiction must not hide across body chapters');
assert.deepEqual(synthesisRepetition({sections:[yearCalcA],finalJudgment:{
 body:['2027년에는 태어난 달과 새해의 지지 사이에 직접 충이 계산되지 않았습니다.']
}}),[],
 'different natal positions are not a contradiction merely because the same word 충 appears');
assert.deepEqual(synthesisRepetition({sections:[yearCalcA],finalJudgment:{
 body:['2027년의 관계를 근거로 실제 갈등이 일어난다고 단정할 수 없습니다.']
}}),[],
 'a non-predictive limitation does not reverse the computed annual relation');
assert.deepEqual(synthesisRepetition({sections:[separateVerdict],finalJudgment:{
 body:['원국의 계산 글자를 독자 생활의 실제 결과로 단정해서는 안 됩니다.']
}}),[],
 'ordinary limitations and generic vocabulary are not copied paid conclusions');

// Work74: use the REAL pre-synthesis gate, not just the post-synthesis
// quality validator. Reject known contradictions before another model bill.
const preSynthesis=require('./report-server-contract').preSynthesisDuplicateErrors;
const yearOpposite=section('year_2027_money','change',yearCalcOpposite,
 ['facts.targetYearRelations']);
const preCharge=preSynthesis([yearCalcA,yearOpposite]);
assert(preCharge.some(code=>
 code.includes('contradictory calculated claim between chapters:')),
 'opposite calculated annual/day assertions must reject before paid synthesis');
const restored=[{
 id:yearCalcA.id,keyJudgment:yearCalcA.keyJudgment,
 bodyTopics:yearCalcA.bodyTopics,topicConclusions:yearCalcA.body,
 evidence:yearCalcA.evidence
}];
assert(preSynthesis([...restored,yearOpposite]).some(code=>
 code.includes('contradictory calculated claim between chapters:')),
 'a resumed/previous batch stores topicConclusions, not body: still reject');
const differentSite=section('year_2027_money','change',
 '2027년에는 태어난 달과 새해의 지지 사이에 직접 충이 계산되지 않았습니다.',
 ['facts.targetYearRelations']);
assert(!preSynthesis([yearCalcA,differentSite]).some(code=>
 code.includes('contradictory calculated claim between chapters:')),
 'different natal positions are not one contradictory calculated assertion');
const cautious=section('year_2027_money','change',
 '2027년 충으로 실제 손실이나 금전 문제가 생긴다고 단정할 수 없습니다.',
 ['facts.targetYearRelations']);
assert(!preSynthesis([yearCalcA,cautious]).some(code=>
 code.includes('contradictory calculated claim between chapters:')),
 'a proper uncertainty statement cannot reverse an annual symbolic calculation');
console.log('PASS deterministic repeated causal interpretation under shared verified facts; no paid API');
