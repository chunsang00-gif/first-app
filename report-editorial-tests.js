Warning: truncated output (original token count: 20784)
Total output lines: 814

'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const quality=require('./report-quality-node'),outline=require('./report-outline');
const offlineReplay=require('./report-qa-replay').replay;
const reader=require('./report-reader-policy');
const grounding=require('./report-grounding-review');
const generation=require('./report-generation-request');
assert(generation.policy.includes('충의 세기까지 측정한 것은 아니다'));
assert(generation.policy.includes('기본 기질')&&generation.policy.includes('내부 계산 근거'),
 'first paid chapter must explain a reader concern grounded by internal sources');
const rejected={sections:[{id:'saju_core',title:'태어난 뿌리의 차이',
 keyJudgment:'계산된 관계를 확인합니다.',bodyLabels:['뿌리의 계산'],
 body:['주인공과 같은 방향의 숨은 글자는 태어난 날에 있습니다. 두 자리에는 강한 충이 계산되어 있습니다. 성격은 단정할 수 없습니다. 강도는 확정할 수 없습니다. 능력은 판단할 수 없습니다.']}]};
const issues=grounding.inspect(rejected).blockingErrors;
const glossaryHeavy={sections:[{id:'saju_core',title:'나의 기본 기질',
 keyJudgment:'전통적인 조건을 해석합니다.',bodyLabels:['기질에 영향을 주는 조건'],
 body:['뿌리는 태어난 날과 시간에 있습니다. 뿌리에 충이 걸리고 또 다른 뿌리에도 충이 걸립니다. 이 오행의 뿌리와 충을 따로 확인해야 합니다. 오행의 강도는 계산하지 않았습니다.']}]};
assert(grounding.inspect(glossaryHeavy).blockingErrors.includes(
 'saju_core:technical-lecture-instead-of-reader-interpretation'),
 'glossary-heavy prose must not pass just because it has a natural headline');
const chartToMind={sections:[{id:'saju_core',title:'기질의 바탕',body:[
 '사주 안에 비슷한 힘이 두 곳에서 확인됩니다. 이것은 마음 깊은 곳에서 두 부분이 균형을 이루는 성격을 의미합니다. 두 중심이 변화에 다르게 반응합니다.'
]}]};
assert(grounding.inspect(chartToMind).blockingErrors.includes(
 'saju_core:root-count-to-psychology-overreach'),
 'a real root count does not measure two psychological centers');
const seasonalToTrait={sections:[{id:'saju_core',title:'계절과 기질',body:[
 '태어난 달이 전환기에 놓입니다. 이 시기에 태어난다는 것은 어느 곳에도 고정되지 않고 외부로부터 영향을 받는 성향이라는 뜻입니다.'
]}]};
assert(grounding.inspect(seasonalToTrait).blockingErrors.includes(
 'saju_core:season-transition-to-personality-overreach'),
 'seasonal position cannot directly establish measured personality adaptability');
// Regression anchored to two already-paid first-chapter QA artifacts
// (2026-10-16 runs 38854417208 and 38870530839). The PUBLIC regression
// deliberately keeps only the failed claim, never the private full report.
// An automated batch gate historically accepted them; semantic QA must not.
// Archive run 38854417208: the model returned a TWO-sentence
// calculator-style main judgment, not the requested single paid insight.
const archivedKeyOne={sections:[{id:'saju_core',title:'출생 사주 구조의 기본 성향 해석',
 keyJudgment:'겉에 드러난 글자와 달 아래 숨은 글자, 실제 계절의 전환 구간은 각각 전통적으로 배움·보호, 자원 활용, 상황 변화에 대한 상징으로 구별된다. 각각은 성격이나 강약 점수가 아니라, 구체적인 출생 위치와 그 관계를 밝히려는 근거일 뿐이다.',
 body:['배움을 살피는 전통적 의미와 자원을 다루는 뜻을 가정한 상황으로 풀이합니다.']}]};
const keyOneErrors=grounding.inspect(archivedKeyOne).blockingErrors;
assert(keyOneErrors.includes('saju_core:key-judgment-not-one-sentence'),
 'archived paid two-sentence main judgment cannot pass early QA');
assert(keyOneErrors.includes('saju_core:key-judgment-is-symbol-lecture'),
 'a chart-definition main judgment is not a reader insight');
// A single-sentence PERSONAL interpretation with a clear situation is OK;
// legitimate supporting symbols belong in the body and internal citations.
const customerFirst={sections:[{id:'saju_core',title:'새로운 일을 준비할 때의 선택',
 keyJudgment:'새로운 일을 준비한다면 배우는 방법과 필요한 자원을 마련할 방법을 서로 다른 질문으로 살펴볼 수 있습니다.',
 body:['태어난 달의 배움 관련 글자와 자원에 연결된 글자를 구별하여 전통적으로 읽습니다.']}]};
const customerErrors=grounding.inspect(customerFirst).blockingErrors;
assert(!customerErrors.includes('saju_core:key-judgment-not-one-sentence'));
assert(!customerErrors.includes('saju_core:key-judgment-is-symbol-lecture'));
const oneSentenceCalculated={sections:[{id:'saju_core',title:'출생 정보에서 읽을 점',
 keyJudgment:'계산된 관계를 바탕으로 새로운 정보를 배우는 상황과 필요한 돈을 마련하는 상황의 뜻을 서로 다르게 풀이합니다.',
 body:['서로 다른 출생 글자의 전통적 의미를 설명합니다.']}]};
assert(!grounding.inspect(oneSentenceCalculated).blockingErrors.includes(
 'saju_core:key-judgment-is-symbol-lecture'),
 'technical word alone must not trigger overbroad rejection');
// 2026-10-16 paid first-chapter raw audit: the response spoke ABOUT the
// chart for multiple sentences rather than doing a personal, bounded reading.
// Keep only depersonalized failing language in the public regression test.
const paidGlossaryOnly={sections:[{id:'saju_core',
 title:'기본 기질을 바라보는 두 가지 전통적 기준',
 keyJudgment:'서로 다른 전통적 뜻을 살펴보는 장입니다.',
 bodyLabels:['전통 상징의 설명','두 글자가 나타내는 해석 기준'],
 body:[
  '이 시기의 특징은 계절이 뚜렷하게 결정되지 않는 과도기라는 점입니다. 겉에 나타나는 글자는 도움을 뜻하는 물의 상징과 연결됩니다. 전통적으로 이런 조합은 배우는 환경이나 새로운 지식을 받아들이는 방향에 대한 의미를 갖습니다. 이와 같은 근거는 사주의 전통적 해석의 출발점입니다.',
  '태어난 달의 겉글자는 배우고 생각하는 능력을 의미하는 상징으로 풀이됩니다. 이는 경험을 받아들일 때 자기만의 이해를 강조하는 방향으로 해석됩니다. 반면, 달의 중심에 숨은 글자는 자원이나 돈을 살피는 상징을 담고 있습니다. 두 글자는 서로 다른 전통적 질문을 드러내는 해석의 기초가 됩니다.'
 ]}]};
const paidGlossaryCodes=grounding.inspect(paidGlossaryOnly).blockingErrors;
assert(paidGlossaryCodes.includes('saju_core:editorial-title-instead-of-interpretation'),
 'archived paid meta-title is not a customer-centered chapter title');
assert(paidGlossaryCodes.includes('saju_core:symbol-definitions-without-applied-interpretation'),
 'archived paid glossary-only prose with no applied choice must never pass');
const customerMeaning={sections:[{id:'saju_core',
 title:'새로운 일을 준비할 때 따로 살필 두 문제',
 keyJudgment:'일을 준비한다면 배우는 방법과 필요한 자원을 마련하는 방법은 각각 따로 생각해 볼 질문입니다.',
 bodyLabels:['정보를 이해하는 일','필요한 것을 마련하는 일'],
 body:[
  '겨울에 태어난 사주에 확인된 겉글자는 배움이나 도움을 전통적으로 살피는 근거입니다. 이는 실제 학습 능력을 측정하지 않습니다. 새로운 일을 맡을 때 모르는 정보를 누구에게 배우고 어떻게 정리할지 가정해 보면 그 뜻을 구체적으로 이해하기 쉽습니다. 배우는 방식을 생각하는 일은 필요한 자원을 마련하는 질문과 다릅니다.',
  '태어난 달의 겉글자는 배움과 연결된 전통적 뜻을 담고 있습니다. 달의 중심 숨은 글자는 돈이나 재료를 다루는 상징입니다. 두 위치는 각각 다른 전통적인 해석의 출처입니다. 예를 들어 새로운 일을 준비한다면, 먼저 무엇을 알아야 하는지 정하고 필요한 비용을 별도로 계산하는 두 질문을 함께 살필 수 있습니다.'
 ]}]};
assert(!grounding.inspect(customerMeaning).blockingErrors.includes(
 'saju_core:symbol-definitions-without-applied-interpretation'),
 'a source-grounded applied scene must remain valid despite necessary symbol explanations');
const compactInterpretation={sections:[{id:'saju_core',
 title:'일을 시작하기 전에 따져 볼 문제',
 keyJudgment:'새 일을 준비할 때 정보를 구하는 관점과 비용을 마련하는 관점을 구별합니다.',
 body:['태어난 달의 두 글자는 다른 뜻을 가집니다. 예를 들어 일을 시작하기 전에 배움과 예산을 따로 살피는 상황을 생각할 수 있습니다.']}]};
assert(!grounding.inspect(compactInterpretation).blockingErrors.includes(
 'saju_core:symbol-definitions-without-applied-interpretation'),
 'short but meaningful interpretation does not have to meet an arbitrary word quota');
const oldFirstChapterOverreach={sections:[{id:'saju_core',
 title:'평소 기질의 해석과 해석 조건',keyJudgment:'전통 상징의 의미입니다.',
 bodyLabels:['기질의 기반과 고려할 점'],
 body:[
  '당신의 사주에서는 실제로 비슷한 힘을 갖는 영역이 두 곳에서 확인됩니다. 각각 자신의 중심을 지키는 성향으로 전통적으로 해석해왔습니다. 쉽게 이야기하면, 마음 깊은 곳이나 행동의 원천이 한 군데에만 의존하지 않고 두 부분에서 균형을 이루려는 전통적 상징이 있다고 볼 수 있습니다.'
 ]}]};
assert(grounding.inspect(oldFirstChapterOverreach).blockingErrors.includes(
 'saju_core:root-count-to-psychology-overreach'),
 'the ACTUAL previously-paid first-chapter failure must never re-enter user text');
const olderFirstChapterOverfocus={sections:[{id:'saju_core',title:'출생 사주 구조의 기본 성향 해석',
 keyJudgment:'전통 상징의 비교입니다.',bodyLabels:['기질의 기반'],
 body:['뿌리에는 같은 오행이 있습니다. 뿌리는 태어난 날과 시간에서 보입니다. 뿌리의 위치는 계산됩니다. 두 뿌리의 충은 실제 출생 위치에서 구별합니다. 다른 뿌리와 충의 강도는 예언할 수 없습니다.']}]};
assert(grounding.inspect(olderFirstChapterOverfocus).blockingErrors.includes(
 'saju_core:technical-lecture-instead-of-reader-interpretation'),
 'the older paid root/clash glossary cannot substitute for customer interpretation');
// Do not turn an otherwise accurate MONTH-ten-god contrast into a rejection.
const groundedMonthQuestion={sections:[{id:'saju_core',title:'태어난 달이 뜻하는 서로 다른 질문',
 keyJudgment:'배움을 이해하는 물음과 필요한 자원을 살피는 물음은 서로 다릅니다.',
 body:['새로운 일을 준비하는 가상 상황에서 배우는 방법과 필요한 돈이나 재료를 마련할 방법은 서로 다른 선택입니다. 출생월 겉글자의 배움 관련 전통적 의미와 달의 중심 숨은 글자가 가진 자원 관련 의미를 구별해 풀이합니다. 다만 이것은 실제 학습 능력이나 재산을 측정한 결과가 아닙니다.']}]};
assert(!grounding.inspect(groundedMonthQuestion).blockingErrors.includes(
 'saju_core:root-count-to-psychology-overreach'),
 'actually distinct grounded traditional topics must remain permitted');
assert(!grounding.inspect(groundedMonthQuestion).blockingErrors.includes(
 'saju_core:technical-lecture-instead-of-reader-interpretation'),
 'a comprehensible traditional month question is not a technical lecture');
const correctBoundary={sections:[{id:'saju_core',title:'해석의 조건',body:[
 '같은 기운의 뿌리 두 곳은 계산된 위치입니다. 이것이 마음의 두 부분을 뜻한다는 근거는 없습니다. 계절이 바뀌는 달이지만 외부 영향에 잘 적응하는 능력까지는 판단할 수 없습니다.'
]}]};
// Third paid QA incorrectly called early January a winter-to-New-Year
// seasonal boundary. Reject only the false conversion, not a factual
// observation that the month is traditionally classified transitional.
// The body must explain BOTH calculated lunar month categories. Merely
// listing an accurate citation and a fixed title must not hide generic prose.
const realCorePacket=require('./report-facts-node').build({
 calendar:'lunar',leapMonth:false,birthDate:'1982-11-24',birthTime:'14:20',
 gender:'male',mbti:'ISFP'
},2027);
const absentPairedMeaning={sections:[{id:'saju_core',title:'낯선 정보 이해 · 필요한 자원 활용',
 keyJudgment:'사주에서는 낯선 내용을 자기 방식으로 이해하고 필요한 자원을 여러 곳에서 찾아 활용하려는 기질로 풀이합니다.',
 bodyTopics:['strength'],bodyLabels:['판단 조건'],
 body:['여러 관점이 전통적으로 중요하게 해석됩니다. 새로운 일을 시작한다면 상황과 기준을 함께 검토하는 일이 유리할 수 있습니다. 태어난 글자가 보여 주는 방향과 실제 경험은 서로 다릅니다.']}]};
assert(grounding.inspect(absentPairedMeaning,realCorePacket).blockingErrors.includes(
 'saju_core:month-pair-meaning-missing-from-main-paragraph'),
 'accurate fixed headline cannot hide a generic main paragraph');
const genuinePairedMeaning=structuredClone(absentPairedMeaning);
genuinePairedMeaning.sections[0].body=[
 '낯선 정보를 자기 방식으로 이해하는 태도와 필요한 자원을 찾아 활용하려는 관점을 함께 읽는 사주입니다. 새로운 업무에 필요한 자료를 검토할 때 이해에만 시간을 쓰고 재료와 비용 마련을 미루는 경우도 따로 생각해 볼 수 있습니다. 이는 계산에 근거한 전통적 가능성이며 실제 경험을 단정하지 않습니다.'
];
assert(!grounding.inspect(genuinePairedMeaning,realCorePacket).blockingErrors.includes(
 'saju_core:month-pair-meaning-missing-from-main-paragraph'),
 'both authentic monthly meanings may be expressed in plain Korean');
// Copying a correct frozen conclusion alone cannot pass as paid prose.
const pastedVerdict=structuredClone(absentPairedMeaning);
pastedVerdict.sections[0].body[0]+=' '+pastedVerdict.sections[0].keyJudgment;
assert(grounding.inspect(pastedVerdict,realCorePacket).blockingErrors.includes(
 'saju_core:main-paragraph-merely-repeats-locked-judgment'));
const verdictOnly=structuredClone(genuinePairedMeaning);
verdictOnly.sections[0].body[0]=verdictOnly.sections[0].keyJudgment;
assert(grounding.inspect(verdictOnly,realCorePacket).blockingErrors.includes(
 'saju_core:main-paragraph-merely-repeats-locked-judgment'));
const expandedVerdict=structuredClone(genuinePairedMeaning);
expandedVerdict.sections[0].body[0]=expandedVerdict.sections[0].keyJudgment+' '+genuinePairedMeaning.sections[0].body[0];
assert(!grounding.inspect(expandedVerdict,realCorePacket).blockingErrors.includes(
 'saju_core:main-paragraph-merely-repeats-locked-judgment'));
// Previously paid output reused the person's learning method in both
// optional visible-resource and mandatory month-stem learning readings.
const overlappingChart=require('./report-chart-contrast').build(realCorePacket);
assert.equal(overlappingChart.monthTenGodContext.monthStem.tenGod,'편인');
assert(overlappingChart.contrastPoints.find(x=>
 x.kind==='visible-support-vs-counter').evidence.support
 .some(x=>x.relation==='resource'));
const repeatedLearning=structuredClone(genuinePairedMeaning);
repeatedLearning.sections[0].bodyTopics=['temperament','strength'];
repeatedLearning.sections[0].bodyLabels=['계절과 겉글자','기질의 중심'];
repeatedLearning.sections[0].body.unshift(
 '새로운 정보를 자기 방식으로 해석하는 태도가 겉글자에서 보입니다. 자료를 받아들일 때 자기 방식으로 정리하려는 방향입니다.'
);
assert(grounding.inspect(repeatedLearning,realCorePacket).blockingErrors.includes(
 'saju_core:season-paragraph-repeats-month-learning'),
 'verified overlapping learning theme must not appear in optional paragraph');
// Whitespace in "낯선 내용" must not evade the optional paragraph's
// no-repeat guard: this previously used literal double-escaped regex chars.
const spacedLearning=structuredClone(repeatedLearning);
spacedLearning.sections[0].body[0]=
 '낯선 내용을 자기 방식으로 해석하는 흐름을 겉글자의 의미로 소개합니다.';
assert(grounding.inspect(spacedLearning,realCorePacket).blockingErrors.includes(
 'saju_core:season-paragraph-repeats-month-learning'),
 'natural spacing in learning theme must still be detected');
const externalHelp=structuredClone(repeatedLearning);
externalHelp.sections[0].body[0]=
 '겉글자의 전통적 도움 관계에서는 외부에서 참고 자료나 조언을 얻을 조건을 따져 봅니다. 이는 누군가에게 도움을 받은 과거의 증거가 아닙니다.';
assert(!grounding.inspect(externalHelp,realCorePacket).blockingErrors.includes(
 'saju_core:season-paragraph-repeats-month-learning'),
 'external-resource availability is not personal information processing');
const omittedSeason=structuredClone(repeatedLearning);
omittedSeason.sections[0].bodyTopics=['strength'];
omittedSeason.sections[0].bodyLabels=['기질의 중심'];
omittedSeason.sections[0].body.shift();
assert(!grounding.inspect(omittedSeason,realCorePacket).blockingErrors.includes(
 'saju_core:season-paragraph-repeats-month-learning'),
 'omitted optional seasonal paragraph should not be rejected');
const nonOverlapPacket=require('./report-facts-node').build({
 calendar:'solar',birthDate:'1990-05-15',birthTime:'14:20',
 gender:'male',mbti:'ISFP'
},2027);
assert(!grounding.inspect(repeatedLearning,nonOverlapPacket).blockingErrors.includes(
 'saju_core:season-paragraph-repeats-month-learning'),
 'do not impose lunar chart ownership rules on other types');
// Two correct citations and two dictionary definitions do not yet
// explain how the calculated readings apply to a conditional situation.
const onlyGlossary=structuredClone(genuinePairedMeaning);
onlyGlossary.sections[0].body=[
 '월간은 낯선 정보를 자기 방식으로 이해한다는 뜻입니다. 월지 중심의 숨은 글자는 필요한 자원을 찾아 활용한다는 의미입니다. 실제 고객의 행동을 관찰한 것은 아닙니다.'
];
assert(grounding.inspect(onlyGlossary,realCorePacket).blockingErrors.includes(
 'saju_core:month-pair-dictionary-only-without-application'),
 'two source definitions plus disclaimer cannot masquerade as paid analysis');
const appliedAfterDefinitions=structuredClone(onlyGlossary);
appliedAfterDefinitions.sections[0].body[0]+=
 ' 새로운 업무를 준비할 때 정보 조사에 시간을 집중하고 필요한 재료와 돈을 확보하지 못한 경우에는 실행에 필요한 조건이 빠질 수 있다는 뜻입니다.';
assert(!grounding.inspect(appliedAfterDefinitions,realCorePacket).blockingErrors.includes(
 'saju_core:month-pair-dictionary-only-without-application'),
 'a conditional scenario that joins both meanings must remain permitted');
assert(!grounding.inspect(genuinePairedMeaning,realCorePacket).blockingErrors.includes(
 'saju_core:month-pair-dictionary-only-without-application'),
 'actual reader-level interpretation must remain permitted');
const onlyLearning=structuredClone(genuinePairedMeaning);
onlyLearning.sections[0].body=['낯선 정보를 자기 방식으로 이해하고 정리하는 태도에 관한 해석입니다. 새로운 업무를 배울 때 정보를 살펴볼 수 있습니다.'];
assert(grounding.inspect(onlyLearning,realCorePacket).blockingErrors.includes(
 'saju_core:month-pair-meaning-missing-from-main-paragraph'),
 'a paragraph about learning alone cannot substitute for actual resource meaning');
const seasonalOnly=structuredClone(absentPairedMeaning);
seasonalOnly.sections[0].bodyTopics=['temperament'];
assert(!grounding.inspect(seasonalOnly,realCorePacket).blockingErrors.includes(
 'saju_core:month-pair-meaning-missing-from-main-paragraph'),
 'legacy or partial review fixtures without the monthly slot are not misclassified');
const winterPacket=require('./report-facts-node').build({
 calendar:'lunar',leapMonth:false,birthDate:'1982-11-24',birthTime:'14:20',
 gender:'male',mbti:'ISFP'
},2027);
assert.equal(winterPacket.facts.seasonalEvidence.monthSeason,'winter');
assert.equal(winterPacket.facts.seasonalEvidence.monthPhase,'transition');
const mislabeledWinter={sections:[{id:'saju_core',title:'새로운 일을 이해하는 태도',
 keyJudgment:'사주에서는 새로운 일을 이해하고 자원을 활용하려는 기질로 풀이합니다.',
 body:['겨울이 끝나고 새해로 넘어가는 전환기에 태어난 사주입니다.']}]};
assert(grounding.inspect(mislabeledWinter,winterPacket).blockingErrors.includes(
 'saju_core:winter-transition-misrepresented-as-new-year'));
const accurateWinter={sections:[{id:'saju_core',title:'새로운 일을 이해하는 태도',
 keyJudgment:'사주에서는 새로운 일을 이해하고 자원을 활용하려는 기질로 풀이합니다.',
 body:['태어난 달은 사주에서 겨울에 속하며 계절의 기운이 한 가지로 확정되지 않는 달입니다.']}]};
assert(!grounding.inspect(accurateWinter,winterPacket).blockingErrors.includes(
 'saju_core:winter-transition-misrepresented-as-new-year'));
const correctBoundaryCodes=grounding.inspect(correctBoundary).blockingErrors;
assert(!correctBoundaryCodes.includes('saju_core:root-count-to-psychology-overreach'));
assert(!correctBoundaryCodes.includes('saju_core:season-transition-to-personality-overreach'));
const readerCentered={sections:[{id:'saju_core',title:'내 기본 기질과 조건',
 keyJudgment:'전통적 의미를 여러 출생 조건으로 구분합니다.',
 body:['새로운 일을 결정하는 가상 상황에서는 기존의 기반을 살피는 관점과 달라지는 상황을 따로 고려할 수 있습니다. 이는 계산된 기운이 서로 다른 역할을 맡는다는 전통적 풀이입니다. 다만 실제 행동은 입력 정보로 확인되지 않았습니다. 의견 충돌이 생기는 상황도 생활 속 사건을 예언하는 말은 아닙니다.']}]};
assert(!grounding.inspect(readerCentered).blockingErrors.includes(
 'saju_core:technical-lecture-instead-of-reader-interpretation'),
 'normal Korean and a brief explanation of evidence must not be overblocked');
const technicalHeader={sections:[{id:'saju_core',title:'사주의 뿌리와 충',
 keyJudgment:'기본 기질을 설명합니다.',bodyLabels:['통근의 의미','충 관계'],
 body:['계산된 전통적 뜻을 다룹니다.']}]};
assert(grounding.inspect(technicalHeader).blockingErrors.includes(
 'saju_core:technical-evidence-used-as-reader-headline'),
 'the first chapter must not market a roots-and-clashes lecture');
const naturalHeader={sections:[{id:'saju_core',title:'나의 기본 기질과 조건',
 keyJudgment:'전통적인 해석의 출발점을 설명합니다.',
 bodyLabels:['기본 기질','기질에 영향을 주는 조건'],
 body:['계산된 출생 자료에 따라 설명할 수 있는 조건을 비교합니다.']}]};
assert(!grounding.inspect(naturalHeader).blockingErrors.includes(
 'saju_core:technical-evidence-used-as-reader-headline'));
assert(!grounding.inspect({sections:[{id:'saju_core',title:'의견 충돌이 생기는 상황'}]})
 .blockingErrors.includes('saju_core:technical-evidence-used-as-reader-headline'),
 'ordinary Korean 충돌 must remain valid');
for(const code of ['saju_core:unmeasured-clash-strength-assertion',
 'saju_core:unnatural-protagonist-address',
 'saju_core:repeated-limitations-displace-interpretation'])
 assert(issues.includes(code),'past paid failure must not pass again: '+code);
const denied={sections:[{id:'saju_core',keyJudgment:'뿌리 위치의 뜻을 구별합니다.',
 body:['강한 충이라고 단정할 수 없습니다. 계산된 충 관계는 뿌리의 위치를 가리키며 그 세기를 증명하지 않습니다.']}]};
assert(!grounding.inspect(denied).blockingErrors.includes('saju_core:unmeasured-clash-strength-assertion'),
 'a correct negated strength claim must not be blocked');
for(const [input,output] of [['같은 오행의 글자','같은 기운의 글자'],
 ['실제 오행 뿌리','실제 기운의 뿌리'],
 ['오행의 관계','기운 사이의 관계']])
 assert.equal(reader.plainText(input),output,'contextual reader translation');
const inputReport={sections:[{id:'saju_core',title:'실제 오행 뿌리',
 keyJudgment:'같은 오행의 의미',body:['오행의 관계를 따집니다.'],
 evidence:['원국 일지 乙 자료는 수정하면 안 됩니다.']}]};
const changed=reader.normalizeVisible(inputReport);
assert.equal(changed.sections[0].title,'실제 기운의 뿌리');
assert.deepEqual(changed.sections[0].evidence,inputReport.sections[0].evidence);
// Reproduce the ACTUAL paid 2nd run: month clashes with day and hour
// separately. No day/hour mutual clash exists, even though each root is hit.
const truePairPacket=require('./report-facts-node').build({
 calendar:'lunar',leapMonth:false,birthDate:'1982-11-24',birthTime:'14:20',
 gender:'male',mbti:'ISFP'
},2027);
assert.deepEqual(truePairPacket.facts.natalClashes.map(x=>x.positions),
 [['month','day'],['month','hour']]);
const wrongPair={sections:[{id:'saju_core',title:'실제 뿌리',
 keyJudgment:'날과 시간의 뿌리를 확인합니다.',body:[
 '태어난 날과 시간에 같은 기운의 뿌리가 보입니다. 이 두 자리 모두 서로 충이 겹치는 구조입니다.'
]}]};
assert(grounding.inspect(wrongPair,truePairPacket).blockingErrors.includes(
 'saju_core:invented-day-hour-clash-from-separate-month-pairs'));
const correctPair={sections:[{id:'saju_core',title:'실제 뿌리',
 keyJudgment:'날과 시간의 뿌리를 확인합니다.',body:[
 '태어난 달과 날의 자리에서 충이 계산되고, 태어난 달과 시간의 자리에도 충이 계산됩니다. 날과 시간의 자리가 서로 충이라는 뜻은 아닙니다.'
]}]};
assert(!grounding.inspect(correctPair,truePairPacket).blockingErrors.includes(
 'saju_core:invented-day-hour-clash-from-separate-month-pairs'));
assert(grounding.inspect({sections:[{id:'saju_core',
 body:['계절의 성격이 뚜렷하지 않아 변화의 흐름을 보여줍니다.']}]},
 truePairPacket).blockingErrors.includes('saju_core:unmeasured-seasonal-adaptability'));
const semanticReview=require('./report-semantic-review').review;
const flaggedReview=semanticReview({sections:[
 {id:'saju_core',body:['자신의 기준을 주변 상황과 비교합니다. 신뢰를 받기도 한다.','주변 규칙과 자기 판단 기준을 비교합니다.']},
 {id:'mbti_contradiction',body:['INTJ는 원칙적으로 결정을 바꾸지 않는 모습으로 그려지지만, 이 사주에서는 자신의 기준을 주변 상황에 맞춥니다.']}
]});
for(const code of ['mbti-rigidity-review','unobserved-reputation-review','repeated-standards-context-review'])assert(flaggedReview.findings.some(x=>x.code===code));
assert.equal(flaggedReview.releaseVerdict,'not-assessed');
assert.equal(semanticReview({sections:[]}).requiresHumanReview,true);
assert.equal(semanticReview({sections:[]}).releaseVerdict,'not-assessed');
// Negated mentions are deliberately only review leads, never automatic failure.
assert.equal(semanticReview({sections:[{id:'comparison',body:['INTJ가 결정을 바꾸지 않는다고 단정할 수 없습니다.']}]}).releaseVerdict,'not-assessed');
for(const text of ['상관(뜻을 풀어 쓴 설명)','원국을 보면','일간은','겁재가 있습니다','월지의 계산','2027년 세운','세운은 바뀝니다','세운의 관계','…6784 tokens truncated…'마음에 드는 물건에는 예산보다 많은 돈을 쓸 수 있습니다.'];assert(quality.validate(contradiction).errors.includes('money: categorical money headline conflicts with spending exception'));
const conditional=fixture();conditional.sections[3].title='평소에는 돈을 아끼지만 좋아하는 물건에는 지출합니다';conditional.sections[3].body=['마음에 드는 물건에는 예산보다 많은 돈을 쓸 수 있습니다.'];assert(!quality.validate(conditional).errors.some(x=>x.includes('categorical money headline')));
const natural=fixture();natural.sections[0].body=['충분히 알아본 뒤 시작하려다 실행이 늦어집니다.'];assert(!quality.validate(natural).errors.some(e=>/unnatural Korean|interpretation boilerplate|abstract headline/.test(e)));
const emptyEnding=fixture();emptyEnding.finalJudgment.closingQuestion='이 보고서는 전통 사주 해석과 입력된 MBTI를 비교한 참고 자료입니다.';assert(quality.validate(emptyEnding).errors.includes('final conclusion is disclaimer instead of personal insight'));
for(const ending of ['어떤 선택을 하시겠습니까?','이제 어떻게 할까요','무엇이 중요합니까？']){const r=fixture();r.finalJudgment.closingQuestion=ending;assert(quality.validate(r).errors.includes('final conclusion must not ask a question'));}
assert(!quality.validate(fixture()).errors.some(e=>e.includes('conclusion')));
const client={window:{addEventListener(){},CHARACTER_ASSETS:{badge(){return ""},hero(){return ""},detail(){return ""}}},document:{body:{classList:{add(){}}},getElementById(){return null}},requestAnimationFrame(){},console};
vm.runInNewContext(fs.readFileSync(require.resolve('./report-validator'),'utf8'),client);
assert(!client.window.REPORT_VALIDATOR.validate(fixture()).errors.some(e=>e.includes('conclusion')));
const browserConcise=structuredClone(concise);assert(!client.window.REPORT_VALIDATOR.validate(browserConcise).errors.some(e=>e.includes('concise topics incomplete')));browserConcise.sections[0].body.pop();assert(client.window.REPORT_VALIDATOR.validate(browserConcise).errors.includes('saju_core: concise topics incomplete'));
vm.runInNewContext(fs.readFileSync(require.resolve('./report-renderer'),'utf8'),client);
const target={innerHTML:'',closest(){return {classList:{add(){}}}},querySelectorAll(){return []},querySelector(){return null}};
client.window.REPORT_RENDERER.render({...fixture(),meta:{}},target);
assert(!target.innerHTML.includes('report-evidence'),'internal calculation evidence must not be rendered');
assert(target.innerHTML.includes('<h2>총평</h2>'));assert(!target.innerHTML.includes('가장 중요한 결론'));
assert(target.innerHTML.indexOf('<h2>총평</h2>')<target.innerHTML.indexOf(fixture().finalJudgment.closingQuestion));
// Exercise the actual pipeline without an API key, network, or calculation dependency.
const sandbox={module:{exports:{}},process:{env:{}},require:n=>n==='./report-facts-node'?{build:()=>packet2027}:require(n)};
vm.runInNewContext(fs.readFileSync(require.resolve('./report-server-contract'),'utf8'),sandbox);
const repeatedTopics=sandbox.module.exports.findRepeatedTopicContent;
const paraphrases=sandbox.module.exports.findParaphrasedTopicContent;
const adviceAudit=sandbox.module.exports.findRepeatedAdvice;
const recurring=[
 {id:'money',body:['돈을 쓰기 전에 기준을 확인하고 결정을 내립니다.']},
 {id:'career',body:['직업을 선택할 때 근거를 검토한 다음 판단합니다.']},
 {id:'relationship',body:['관계에서 선택하기 전에 서로 확인하는 것이 중요합니다.']}
];
assert(adviceAudit(recurring).some(x=>x.includes('verify-before-deciding')));
assert.equal(adviceAudit([{id:'money',body:['지출을 기록합니다.']},{id:'career',body:['업무 일정을 계획합니다.']},{id:'relationship',body:['상대의 말을 듣습니다.']}]).length,0);

const overlapA='생각을 충분히 정리하고 자료를 확인한 뒤에 결정하는 방식이 반복됩니다. 상대방의 설명을 듣고 책임지는 범위를 구별한 다음 다시 검토하는 행동이 나타납니다.';
const overlapB='자료를 확인하고 생각을 충분히 정리한 뒤에 결정하는 방식이 나타납니다. 다시 검토하는 행동이 반복되며 상대방의 설명을 듣고 책임지는 범위를 구별합니다.';
const distinct='2027년 계절에 해당하는 월별 지지의 충합은 실제로 계산되지 않았으며 예측할 수 없는 미래 사건과 구별해야 합니다. 그 대신 입력 시각에 따른 한계를 정확히 밝힙니다.';
assert(paraphrases([{id:'money',bodyTopics:['spending'],body:[overlapA]},{id:'career',bodyTopics:['workstyle'],body:[overlapB]}]).length>0);
const sameMoneyCopied={id:'money',bodyTopics:['earning','spending'],
 body:[overlapA,overlapB]};
assert(paraphrases([sameMoneyCopied]).some(x=>x.includes('money:earning / money:spending')),
 'same-chapter rearranged paragraphs must not be resold as separate paid topics');
const sameMoneyDistinct={id:'money',bodyTopics:['earning','spending'],
 body:[overlapA,distinct]};
assert.equal(paraphrases([sameMoneyDistinct]).length,0,
 'sharing a chapter or a money-related word does not automatically duplicate a conclusion');

assert.equal(paraphrases([{id:'money',bodyTopics:['spending'],body:[overlapA]},{id:'career',bodyTopics:['workstyle'],body:[distinct]}]).length,0);

const themeAudit=sandbox.module.exports.findRecycledThemes;
const patterned=(id)=>({id,keyJudgment:'책임과 기준에 따라 다시 확인합니다.',body:['업무를 맡을 때 기존 규칙을 설명하고 검토합니다.']});
assert.equal(themeAudit(['a','b','c','d'].map(patterned)).length,0);
assert(themeAudit(['a','b','c','d','e'].map(patterned)).some(x=>x.includes('responsibility-and-rules')));
const distinctJudgments=['사주의 월지와 일간이 나타내는 계산값을 설명합니다.','입력된 성격 선호의 한계를 비교합니다.','변경할 선택 조건을 구분합니다.','지출과 보유에 관한 해석을 나눕니다.','실제 맡은 업무는 추정하지 않습니다.'];
const vocabularyHeavy='논리와 근거를 설명하고 책임과 규칙을 확인하지만 이 말은 일반적인 배경 설명일 뿐입니다.';
assert.equal(themeAudit(distinctJudgments.map((keyJudgment,i)=>({id:'chapter'+i,keyJudgment,body:[vocabularyHeavy]}))).length,0,'Shared body vocabulary must not be treated as repeated chapter conclusions');
const annualRepeated=[
 {id:'year_2027_money',keyJudgment:'2027년에는 공식적 책임과 관리 기준이 중요해집니다.'},
 {id:'year_2027_career',keyJudgment:'2027년에는 사회적 역할과 규칙을 중시합니다.'},
 {id:'year_2027_relationship',keyJudgment:'2027년 관계에서는 책임 분배와 관리가 강조됩니다.'}
];
assert(themeAudit(annualRepeated).some(x=>x.includes('2027 domain chapters repeat')));
assert.equal(themeAudit([annualRepeated[0],{id:'year_2027_career',keyJudgment:'2027년 업무에서 새로 계산된 십성을 확인합니다.'},{id:'year_2027_relationship',keyJudgment:'해당 연간 지지와 원국에 충이 계산되지 않았습니다.'}]).length,0);



const shared='시간을 충분히 들여 여러 선택지의 장단점을 비교하며 결정을 고른 뒤에는 주변 상황과 필요한 절차를 다시 검토한다. 이 과정을 마치면 다른 사람에게도 선택의 이유를 충분히 설명하려고 한다.';
assert(repeatedTopics([{id:'decision',bodyTopics:['approach'],body:[shared]},{id:'career',bodyTopics:['workstyle'],body:[shared]}]).some(x=>x.includes('repeated topic paragraph')));
assert.equal(repeatedTopics([{id:'decision',bodyTopics:['approach'],body:[shared]},{id:'career',bodyTopics:['workstyle'],body:['새로운 과업을 배우는 과정에서는 이미 정해진 역할을 먼저 이해한 다음 실제 결과를 확인한다.']}]).length,0);
const unsupportedAnnualPacket={facts:{tenGods:{},annualTenGods:{stemTenGod:'비견',hiddenStems:[]},targetYearRelations:[]}};
const unsupportedAnnualReport={sections:[{id:'year_2027_money',keyJudgment:'2027년 수입이 늘어납니다.',body:[]}]};
assert(quality.verifyEvidenceAgainstFacts(unsupportedAnnualReport,unsupportedAnnualPacket).errors.some(x=>x.includes('unsupported 2027 domain outcome prediction')));
const supportedButNotGuaranteed={facts:{tenGods:{},annualTenGods:{stemTenGod:'정재',hiddenStems:[]},targetYearRelations:[]}};
assert(quality.verifyEvidenceAgainstFacts({sections:[{id:'year_2027_money',title:'2027년 수입이 늘어납니다.',keyJudgment:'계산 근거를 설명합니다.',body:[]}]},supportedButNotGuaranteed).errors.some(x=>x.includes('categorical 2027 domain outcome prediction')));
assert(quality.verifyEvidenceAgainstFacts({sections:[{id:'year_2027_money',title:'금전 해석',keyJudgment:'계산 근거를 설명합니다.',body:[],evidence:['2027년 수입이 늘어납니다.']}]},supportedButNotGuaranteed).errors.some(x=>x.includes('categorical 2027 domain outcome prediction')));

assert(quality.verifyEvidenceAgainstFacts({sections:[{id:'year_2027_money',keyJudgment:'2027년 수입이 늘어납니다.',body:[]}]},supportedButNotGuaranteed).errors.some(x=>x.includes('categorical 2027 domain outcome prediction')));
assert(quality.verifyEvidenceAgainstFacts({sections:[{id:'year_2027_money',keyJudgment:'2027년 수입이 늘어납니다. 하지만 예측할 수 없습니다.',body:[]}]},supportedButNotGuaranteed).errors.some(x=>x.includes('categorical 2027 domain outcome prediction')));
unsupportedAnnualReport.sections[0].keyJudgment='2027년 수입이 늘어난다고 단정할 수 없습니다.';
assert(!quality.verifyEvidenceAgainstFacts(unsupportedAnnualReport,unsupportedAnnualPacket).errors.some(x=>x.includes('unsupported 2027 domain outcome prediction')));
const guidance=require('./report-analysis-guidance');
const blueprint=guidance.preflight({person:{mbti:'ISFP'},facts:{structuralEvidence:{monthCommand:{branch:'子'},visibleStems:[{stem:'甲'}]},tenGods:{day:{stem:'甲',hiddenStems:[]},month:{stem:'乙'}},natalClashes:[],annualTenGods:{stem:'丁',hiddenStems:[]},targetYearRelations:[]},fortune:{activeDecade:null}});
assert.equal(Object.keys(blueprint).length,12);
assert.equal(Object.values(blueprint).reduce((count,chapter)=>count+Object.keys(chapter.topicTasks).length,0),35);
assert.equal(blueprint.money.topicTasks.earning.primaryEvidencePath,'facts.tenGods.month');
for(const id of ['decision','money','relationship','stress'])for(const topic of Object.values(blueprint[id].topicTasks))if(topic.primaryEvidencePath==='facts.natalClashes'){
 assert.equal(topic.mode,'state-limits','no calculated clash must not become inferred real-life conflict');
 assert.equal(topic.evidenceReuseBoundary,undefined,'planned or absent clashes must not claim an already cited source');
}

assert.equal(blueprint.year_2027_relationship.topicTasks.change.evidencePresent,false);
assert.equal(blueprint.year_2027_relationship.topicTasks.change.mode,'state-limits');
assert.deepEqual(blueprint.year_2027_relationship.topicTasks.change.verifiedFallbackPaths,[],'blocked annual relationship cannot retain unrelated ten-god fallbacks');
assert.equal(blueprint.year_2027_career.topicTasks.change.mode,'state-limits');
assert.equal(blueprint.year_2027_relationship.topicTasks.action.mode,'state-limits');
assert.equal(blueprint.year_2027_relationship.topicTasks.action.evidencePresent,false,'unavailable annual relationship may not retain a phantom evidence-present flag');
assert.equal(new Set(Object.values(blueprint).map(x=>x.question)).size,12);
assert.equal(blueprint.year_2027_relationship.requiredMode,'state-insufficient-evidence','omitted annual section cannot advertise a fallback');
assert(blueprint.year_2027_relationship.negativeEvidence);
assert.deepEqual(blueprint.year_2027_relationship.fallbackEvidencePaths,[],'unsupported annual topic must not retain a phantom fallback');
assert.equal(blueprint.year_2027_career.requiredMode,'state-insufficient-evidence');
assert.equal(blueprint.year_2027.requiredMode,'explain-with-limits');
assert.equal(blueprint.year_2027_money.annualDomainEvidence.relevant,false);
assert.equal(blueprint.year_2027_career.annualDomainEvidence.relevant,false);
assert.equal(blueprint.year_2027_relationship.annualDomainEvidence.relevant,false);
const special=guidance.preflight({person:{mbti:'ISFP'},facts:{annualTenGods:{stemTenGod:'정재',hiddenStems:[]},targetYearRelations:[{between:'day',type:'충'}]}});
assert.equal(special.year_2027_money.annualDomainEvidence.relevant,false);
assert.equal(special.year_2027_career.annualDomainEvidence.relevant,false);
assert.equal(special.year_2027_relationship.annualDomainEvidence.relevant,true);

assert.equal(guidance.forRequest(['saju_core'],'모름').mbtiReference,null);
assert.equal(guidance.forRequest(['saju_core'],'INVALID').mbtiReference,null);
// The failed paid draft invented INTJ inflexibility to fill its second slot.
// Keep a neutral task and an explicit nullable slot at the provider boundary.
assert(guidance.forRequest(['mbti_contradiction'],'INTJ').mbtiReference.preferences.find(x=>x.code==='J').notEvidenceOf.includes('결정을 바꾸지 않음'));
const comparisonPrompt={requestedSections:['mbti_contradiction'],analysisGuidance:{editorialBlueprint:blueprint}};
const comparisonWire=require('./report-wire');
const comparisonSchema=comparisonWire.schemaFor(comparisonPrompt,require('./report-schema.json'));
const comparisonSlots=comparisonSchema.properties.chapters.properties.mbti_contradiction.properties.paragraphs.properties;
assert.equal(comparisonSlots.agreement.type,'object');
assert(comparisonSlots.difference.anyOf.some(x=>x.type==='null'));
assert(comparisonSlots.difference.anyOf[0].properties.text.description.includes(outline.topics.mbti_contradiction.difference));
assert(comparisonSlots.difference.anyOf[0].description.includes('같은 응답 안에서 이미 답한 내용'));
const singleComparison=comparisonWire.decode({chapters:{mbti_contradiction:{title:'비교',keyJudgment:'판단',evidence:[],mood:'reflective',paragraphs:{agreement:{label:'선호와 이유',text:'첫 문단에서 상황과 이유를 충분히 설명합니다.'},difference:null,information:null,judgment:null,energy:null,planning:null,energy:null,planning:null}}},cover:null,finalJudgment:null},comparisonPrompt);
assert.deepEqual(singleComparison.sections[0].bodyTopics,['agreement']);
const forcedComparison={stage:'body',rules:{hanjaPolicy:reader.instruction,topicPlan:{integrated_judgment:{insight:'같은 선택에서 서로 다른 결론을 제시하는 조건'}}}};
assert(require('./report-instruction-audit').inspect(forcedComparison).includes('forced contrast in writing plan'));
for(const a of ['I','E'])for(const b of ['S','N'])for(const c of ['T','F'])for(const d of ['J','P']){const type=a+b+c+d; const ref=guidance.forRequest(['decision'],type).mbtiReference; assert.equal(ref.preferences.map(x=>x.code).join(''),type);assert.equal(ref.preferences.length,4);}
// Mock output has to follow calculated source eligibility; returning
// state-limits paragraphs is a real paid-batch failure, not valid filler.
const eligibleTopics=(prompt,id)=>Object.keys(outline.topics[id]).filter(k=>
 prompt.analysisGuidance?.editorialBlueprint?.[id]?.topicTasks?.[k]?.mode!=='state-limits');
const mockMbtiPaidDimensions={
 information:'S 선호는 새로운 정보를 살펴볼 때 구체적인 자료와 직접 확인한 사실을 먼저 찾는다는 입력입니다. 의미를 연결하는 능력이 없다는 뜻은 아니며 실제 판단력이나 성적을 확인한 결과는 아닙니다.',
 judgment:'F 선호는 선택을 비교할 때 사람에게 미칠 영향과 중요하게 여기는 가치를 먼저 생각한다는 입력입니다. 논리적인 기준을 못 쓴다는 뜻이 아니며 실제 공감 행동은 관찰하지 않았습니다.',
 energy:'I 선호는 생각을 정리할 때 사람들과 이야기하기 전에 혼자 살펴볼 시간을 두는 쪽이 편하다는 입력입니다. 사교성이 부족하다는 의미가 아니며 실제 대화 빈도를 측정하지 않았습니다.',
 planning:'P 선호는 일정의 변경 여지를 열어 두고 정보를 더 확인한 뒤 조정할 수 있는 쪽이 편하다는 입력입니다. 마감을 어긴다거나 계획이 없다는 실제 행동을 확인한 결과가 아닙니다.'
};
(async()=>{
 let calls=0;const seen=[];
 const dryRun=await sandbox.module.exports.generate({mbti:'ISFP'},async p=>{
  calls++;seen.push(p.stage);
  assert(p.rules.naturalKoreanRule.includes('본문은 그 이유와 상황을 충분히 설명한다'));
  assert(p.rules.candidRule.includes('실제 능력이나 타인의 평판은 입력받지 않았다면'));
  assert(p.rules.yearAndDecadeIntegrationRule.startsWith('실제로 생성 대상으로 선택된'));
  for(const obsolete of ['2027년 분석 네 장에서는','한 가지 뜻은 한 번만 쓰며 제목·핵심 판정·본문·총평에서','무엇을 얼마나 꼼꼼하게·빠르게·끈기 있게']){
   const changed=structuredClone(p);changed.rules.regression=obsolete;
   assert(require('./report-instruction-audit').inspect(changed).some(x=>x.startsWith('obsolete scope or unsupported precision instruction:')));
  }
  assert(!require('./report-instruction-audit').inspect(p).includes('forced contrast in writing plan'));
  if(p.stage==='body'){
   const changed=structuredClone(p);
   changed.rules.chapterOwnershipPlan={integrated_judgment:{owns:'사주와 MBTI가 다른 판단을 낳는 구체적인 경계'}};
   assert(require('./report-instruction-audit').inspect(changed).includes('forced contrast in writing plan'));
  }
  for(const key of ['plainSentenceRule','coherenceRule','depthAndEvidenceRule','yearAndDecadeIntegrationRule','hanjaPolicy','concreteReviewRule','topicOwnershipRule','interpretationFirstRule','readerLanguageRule','internalEvidenceScopeRule'])assert(p.rules[key],key);
  for(const key of ['decisiveSentenceRule','actionableMoneyRule','idiomaticWritingRule','everydayWordChoiceRule','expressionPolicyRule'])assert.equal(p.rules[key],undefined);
  assert(p.rules.topicOwnershipRule.includes('중복 금지 자료'));
  assert(p.rules.hanjaPolicy.includes('괄호'));
  if(p.stage==='synthesis'){assert(p.rules.finalEditingTask.includes('routines는 빈 배열'));assert(p.rules.coverNaturalnessRule.includes('반복 비용이라는 말을 자동으로 넣지 않는다'));assert(p.rules.naturalKoreanRule.includes('이 연결은 필요한 설명이지 중복이 아니다'));assert(p.rules.finalRule.includes('교훈이나 감동 문구를 억지로 붙이지 않는다'));assert(p.rules.finalRule.includes('실제 생성된 앞 장들을 다시 요약하지 않는다'));assert(p.completedReport.sections.every(s=>s.body.length>=1),'each chapter must retain a grounded paragraph');assert(p.completedReport.sections.reduce((n,s)=>n+s.body.length,0)<=28,'unused topic slots must be omitted');return {cover:null,finalJudgment:{body:['마지막 설명'],closingQuestion:'꼼꼼하게 확인하느라 결정을 늦출 때는, 오늘 확인할 내용을 먼저 정하는 것이 도움이 됩니다.',afterClosingText:''}};}
  assert(p.rules.domainBoundaryRule.includes('분야의 명사만 바꾸어 반복'));
  assert(p.rules.integrationContrastRule.includes('MBTI를 사주 결론의 검증이나 증거로 쓰지 않는다'));
  assert(p.rules.readerProofRule.includes('불필요한 한자'));
  assert(p.rules.annualDeltaRule.includes('변화가 확인되지 않는다고'));
  assert.equal(Object.keys(p.analysisGuidance.editorialBlueprint).length,p.requestedSections.length);
  assert(p.crossChapterNoveltyRule.includes('이전 장과 하나씩 대조'));
   assert.equal(p.priorChapterConclusions.length,p.priorSections.length,'each earlier completed chapter must have exactly one tracked prior conclusion even after optional chapter omissions');
  assert.equal(JSON.stringify(p.priorChapterConclusions.map(s=>s.chapterId)),JSON.stringify(p.priorSections.map(s=>s.id)));
  for(const chapter of p.priorChapterConclusions){
   assert.equal(typeof chapter.judgment,'string');
   assert.equal(chapter.topicConclusions.length,p.priorSections.find(s=>s.id===chapter.chapterId).topicConclusions.length);
  }

  const annualIds=['year_2027_money','year_2027_career','year_2027_relationship'];
  const expectedAnnual=p.requestedSections.filter(id=>annualIds.includes(id));
  assert.equal(JSON.stringify(Object.keys(p.rules.annualDomainScopes)),JSON.stringify(expectedAnnual));
  for(const id of expectedAnnual){
   const scope=p.rules.annualDomainScopes[id];
   assert(scope.length>30);
   assert(scope.includes(id==='year_2027_money'?'수입':id==='year_2027_career'?'업무':'친밀감'));
  }

   assert(p.analysisGuidance.editorialBlueprint[p.requestedSections[0]].question);
   assert(p.rules.mbtiDepthRule);assert.equal(p.priorSections.length,p.priorChapterConclusions.length,'each prior section is preserved even when fewer annual chapters lead to split body batches');
  if(calls>1){assert(p.priorSections.every(s=>s.topicConclusions.length===s.bodyLabels.length)); assert(p.priorSections.every(s=>s.topicConclusions.every(t=>typeof t==='string'&&t.length>0)),'previous chapter text must be preserved after domain-evidence enforcement');}
  assert.deepEqual(Object.keys(p.analysisGuidance.chapterTasks),Array.from(p.requestedSections));
  assert.equal(p.analysisGuidance.mbtiReference.type,'ISFP');
  assert.equal(p.analysisGuidance.mbtiReference.preferences.map(x=>x.code).join(''),'ISFP');
  return {sections:p.requestedSections.map(id=>({id,title:'제목',keyJudgment:'핵심',evidence:['계산한 사주 항목의 설명입니다.'],bodyTopics:eligibleTopics(p,id),bodyLabels:eligibleTopics(p,id).map((_,i)=>'검증 항목 '+i),body:eligibleTopics(p,id).map((topic,i)=>(id==='mbti_contradiction'&&mockMbtiPaidDimensions[topic])||('첫 번째 결론 '+i+'. 이어지는 설명입니다.'+(id==='saju_core'&&topic==='strength'?' '+require('./qa/core-meaning-mock').body(p):'')))}))};
 });
 // The mock intentionally contains placeholder evidence and no cover.
 // Never mistake completed provider calls for a publishable report.
 assert.equal(dryRun.status,'rejected');
 assert.equal(dryRun.qa.pass,false);
 assert.equal(dryRun.qa.semanticReview.releaseVerdict,'not-assessed','automated semantic review is never a release certificate');
 assert.equal(dryRun.qa.semanticReview.requiresHumanReview,true);
 assert.equal(dryRun.qa.releaseGate.releaseVerdict,'not-approved','technical and editorial checks cannot automatically authorize product launch');
 assert.equal(dryRun.qa.releaseGate.humanReviewRequired,true);
 assert.equal(dryRun.qa.releaseGate.technicalChecks,'incomplete','known rejected QA draft must remain unapproved');
 assert(dryRun.qa.releaseGate.failedTechnicalChecks.includes('automated-quality-not-passed'));
 assert(dryRun.qa.semanticReview.findings.every(f=>!Object.hasOwn(f,'excerpt')),'do not leak report sentences into QA metadata');
 assert(dryRun.qa.errors.length>0);
 assert(dryRun.report.sections.every(section=>section.body.length>=1),'all chapters retain a meaningful topic');assert(dryRun.report.sections.reduce((count,section)=>count+section.body.length,0)<=28,'optional report topics do not add filler');
 assert.equal(calls,seen.length);assert(seen.filter(stage=>stage==='body').length>=1);assert.equal(seen.at(-1),'synthesis');
 // Detect a known live-QA phrase before any subsequent provider request.
 let earlyCalls=0;
 await assert.rejects(
  sandbox.module.exports.generate({mbti:'ISFP'},async p=>{
   earlyCalls++;
   return {sections:p.requestedSections.map(id=>({
    id,title:'제목',keyJudgment:'직접 실행으로 연결합니다.',
    evidence:['계산한 사주 항목의 설명입니다.'],bodyTopics:eligibleTopics(p,id),
    bodyLabels:eligibleTopics(p,id).map((_,i)=>'검증 항목 '+i),
    body:eligibleTopics(p,id).map(topic=>'문장입니다.'+(id==='saju_core'&&topic==='strength'?' '+require('./qa/core-meaning-mock').body(p):''))
   }))};
  }),
  /reader-facing editorial defects/
 );
 assert.equal(earlyCalls,1);
 // A repetitive full draft must be rejected before the seventh paid synthesis call.
 let preflightCalls=0;
 await assert.rejects(sandbox.module.exports.generate({mbti:'ISFP'},async p=>{
  preflightCalls++;
  if(p.stage==='synthesis')throw Error('Synthesis must be skipped for repetitive draft');
  return {sections:p.requestedSections.map(id=>({
   id,title:'서로 다른 제목 '+id,keyJudgment:'논리적인 근거를 확인하고 설명을 납득해야 결정합니다.',
   evidence:['원국의 일간 계산 근거 '+id],bodyTopics:eligibleTopics(p,id),
   bodyLabels:eligibleTopics(p,id).map((_,i)=>'검증 항목 '+i),
   body:eligibleTopics(p,id).map((topic,i)=>(id==='mbti_contradiction'&&mockMbtiPaidDimensions[topic])||('서로 다른 주제 '+id+i+'에서 논리와 근거를 확인하고 설명에 납득해야 합니다.'+(id==='saju_core'&&topic==='strength'?' '+require('./qa/core-meaning-mock').body(p):'')))
  }))};
 }),/cross-chapter recycled thesis/);
 assert.equal(preflightCalls,3,'adaptive-v1 must detect a recycled thesis before synthesis without buying redundant decision/stress chapters');
 console.log('PASS editorial phrases, repetitive templates, natural phrasing, active body/summary rules, topic memory, 29 topics and seven calls; no paid API');
})().catch(e=>{console.error(e);process.exitCode=1});

const seasonalPacket={status:'ready',calculationPolicy:{annualPillarBoundary:'ipchun-solar-term'},facts:{tenGods:{}}};
const seasonalBad=fixture();seasonalBad.sections[8].body=['2027년 1월부터 정미 세운이 시작됩니다.'];
assert(quality.validate(seasonalBad,seasonalPacket).errors.includes('2027: annual pillar incorrectly applied to full Gregorian year'));
const seasonalBadReverse=fixture();seasonalBadReverse.sections[8].body=['정미 세운은 양력 1년 내내 적용됩니다.'];
assert(quality.validate(seasonalBadReverse,seasonalPacket).errors.includes('2027: annual pillar incorrectly applied to full Gregorian year'));
const seasonalCorrect=fixture();seasonalCorrect.sections[8].body=['2027년 정미 세운은 입춘을 기준으로 해석합니다.'];
assert(!quality.validate(seasonalCorrect,seasonalPacket).errors.includes('2027: annual pillar incorrectly applied to full Gregorian year'));

const locationPacket={status:'ready',calculationPolicy:{birthplaceUsedForCalculation:false},facts:{tenGods:{}}};
const locationBad=fixture();locationBad.sections[0].body=['출생지 경도를 보정하여 시주를 산출했습니다.'];
assert(quality.validate(locationBad,locationPacket).errors.includes('calculation: unsupported birthplace or solar-time correction claim'));
const locationBadSolar=fixture();locationBadSolar.sections[0].body=['진태양시를 반영한 정밀한 사주입니다.'];
assert(quality.validate(locationBadSolar,locationPacket).errors.includes('calculation: unsupported birthplace or solar-time correction claim'));
const locationGood=fixture();locationGood.sections[0].body=['출생지에 따른 진태양시 보정은 적용하지 않았습니다.'];
assert(!quality.validate(locationGood,locationPacket).errors.includes('calculation: unsupported birthplace or solar-time correction claim'));

const revisedTopics=require('./report-outline').topics;
for(const id of ['integrated_judgment','year_2027_money','year_2027_career','year_2027_relationship']){
 const items=Object.values(revisedTopics[id]);
 assert.equal(items.length,2);
 assert.notEqual(items[0],items[1]);
 assert.ok(items.some(x=>/근거|관점|세운|원국|사주|MBTI/.test(x)));
}
assert(revisedTopics.year_2027_money.action.includes('단정하지'));
assert(revisedTopics.year_2027_career.action.includes('예언하지'));
assert(revisedTopics.year_2027_relationship.action.includes('예언하지'));
