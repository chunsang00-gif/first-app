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
for(const text of ['상관(뜻을 풀어 쓴 설명)','원국을 보면','일간은','겁재가 있습니다','월지의 계산','2027년 세운','세운은 바뀝니다','세운의 관계','세운 천간','세운(한 해의 운)','대운을 비교합니다'])assert(reader.errors([text]).length,text);
for(const text of ['자신이 세운 기준과 실제 행동이 다르게 나타나는 이유','계획을 세운다.','미리 세운 목표를 점검합니다.','서로 세운 약속을 지킵니다.','세운 기준을 바꿉니다.','시간이 걸립니다.','통근 시간이 깁니다.','그 일과 상관없습니다.','그 일과 상관이 없습니다.','특정인의 경험을 만들지 않습니다.','정관 수술 여부는 입력받지 않았습니다.','두 해석을 함께 비교합니다.'])assert.deepEqual(reader.errors([text]),[],text);
const visibleSetters=[r=>r.sections[0].title='원국',r=>r.sections[0].keyJudgment='원국',r=>r.sections[0].bodyLabels=['원국'],r=>r.sections[0].body=['원국'],r=>r.cover.keywords=['원국'],r=>r.cover.highlights=[{title:'원국'}],r=>r.finalJudgment.routines=[{reason:'원국'}],r=>r.finalJudgment.closingQuestion='원국'];
for(const inject of visibleSetters){const r={sections:[{evidence:['원국 월간 겁재']}],cover:{},finalJudgment:{}};assert.deepEqual(reader.errors(reader.visibleFields(r)),[]);inject(r);assert(reader.errors(reader.visibleFields(r)).includes('reader jargon: 원국'));}
const offlineFixture={status:'rejected',qa:{errors:['historic rejection']},report:{sections:[{id:'money',keyJudgment:'금전 기준을 확인합니다.',body:['돈은 관리합니다.']},{id:'career',keyJudgment:'역할 기준을 확인합니다.',body:['업무를 확인합니다.']}]}};
const offlineResult=offlineReplay(offlineFixture);
assert.equal(offlineResult.chapterCount,2);
assert.equal(offlineResult.topicCount,2);
assert(offlineResult.originalErrors.includes('historic rejection'));
assert.equal(offlineResult.semanticReview.releaseVerdict,'not-assessed');
assert.equal(offlineResult.semanticReview.requiresHumanReview,true);
assert.equal(offlineResult.releaseGate.releaseVerdict,'not-approved');
assert(offlineResult.releaseGate.failedTechnicalChecks.includes('calculation-packet-not-verified'));
assert(offlineResult.releaseGate.failedTechnicalChecks.includes('paragraph-citation-coverage-incomplete'));
assert.equal(offlineResult.releaseGate.humanReviewRequired,true);
assert.throws(()=>offlineReplay({report:{sections:null}}),/report.sections/);

const hanjaFindings=require('./inspect-paid-qa').inspect({calls:[{number:6,response:{sections:[{id:'year_2027_career',title:'직업운',keyJudgment:'丁未년 직업 판단',body:['한글 문장'],bodyLabels:['관계']}]}}]});
assert.equal(hanjaFindings.length,2);
assert(hanjaFindings.every(x=>x.section==='year_2027_career'&&x.field==='keyJudgment'));
assert.deepEqual(require('./inspect-paid-qa').inspect({calls:[{number:1,response:{sections:[{id:'career',body:['일반적인 문장']} ]}}]}),[]);
assert.throws(()=>require('./inspect-paid-qa').inspect({}),/raw-calls/);
const fixture=()=>({sections:quality.IDS.map((id,i)=>({id,title:'제목'+i,keyJudgment:'판정'+i,evidence:['계산한 사주 항목의 설명입니다.'],body:['문단'+i]})),finalJudgment:{body:['마지막 설명'],closingQuestion:'꼼꼼하게 확인하느라 결정을 늦출 때는, 오늘 확인할 내용을 먼저 정하는 것이 도움이 됩니다.',afterClosingText:''}});
for(const phrase of require('./report-editorial').awkwardPhrases){const r=fixture();r.sections[0].body=[phrase];assert(quality.validate(r).errors.includes('unnatural Korean: '+phrase));}
for(const field of ['title','keyJudgment','bodyLabels','body']){
 const report=fixture();report.sections[0][field]=field==='bodyLabels'||field==='body'?['丁未년 설명']:'丁未년 설명';
 assert(quality.validate(report).errors.includes('saju_core: unnecessary Hanja in general-audience prose'),field+': Hanja must fail reader quality gate');
}
const injectors=[
 (r,t)=>r.sections[0].title=t,(r,t)=>r.sections[0].keyJudgment=t,
 (r,t)=>r.sections[0].bodyLabels=[t],(r,t)=>r.sections[0].evidence=[t],
 (r,t)=>r.cover={headline:t},(r,t)=>r.cover={description:t},
 (r,t)=>r.cover={keywords:[t]},(r,t)=>r.cover={highlights:[{title:t,description:t}]},
 (r,t)=>r.finalJudgment.headline=t,(r,t)=>r.finalJudgment.body=[t],
 (r,t)=>r.finalJudgment.strengths=[t],(r,t)=>r.finalJudgment.watchouts=[t],
 (r,t)=>r.finalJudgment.routines=[{trigger:t,action:t,reason:t}],
 (r,t)=>r.finalJudgment.closingQuestion=t
];
for(const set of injectors){const r=fixture();set(r,'핵심  성향');if(r.cover)r.cover={headline:'제목',description:'설명',keywords:['하나','둘','셋'],...r.cover};assert(quality.validate(r).errors.includes('unnatural Korean: 핵심 성향'));}
// Regression: repeated causal thesis across five unrelated chapters is rejected.
const recycled=fixture();
for(let i=0;i<5;i++)recycled.sections[i].body=['이유와 논리를 먼저 확인하고 설명을 납득해야 결정합니다.'];
assert(quality.validate(recycled).errors.some(x=>x.startsWith('cross-chapter recycled thesis (logic-and-proof)')));
// The production plan omits unsupported annual chapters. Overlap findings
// must name actual section IDs, not their positions in a fixed twelve-item list.
const omittedChapterOverlap=fixture();
omittedChapterOverlap.sections=omittedChapterOverlap.sections.filter(s=>s.id!=='mbti_contradiction');
const realOverlapIds=['decision','stress'];
for(const id of realOverlapIds)omittedChapterOverlap.sections.find(s=>s.id===id).body=['서로 동일한 가상의 예문으로 문단의 단어들이 끝까지 반복되는 사례입니다.'];
const omittedFindings=quality.validate(omittedChapterOverlap).errors;
assert(omittedFindings.some(x=>x.includes('section insight overlap: decision / stress')),'overlap diagnostics must identify real section IDs after omissions');
const similarDomainConclusions=fixture();
similarDomainConclusions.sections.find(x=>x.id==='money').keyJudgment='계산 근거를 바탕으로 현실적인 선택 조건을 정리하고 결과를 비교해서 판단합니다.';
similarDomainConclusions.sections.find(x=>x.id==='career').keyJudgment='현실적인 선택 조건을 정리하고 결과를 비교해서 판단하며 계산 근거를 바탕으로 설명합니다.';
assert(quality.validate(similarDomainConclusions).errors.some(x=>x.includes('cross-domain near-identical key judgment: money / career')));
const duplicateMainConclusion=fixture();
duplicateMainConclusion.sections.find(ch=>ch.id==='money').keyJudgment='정해진 순서를 확인한 뒤에야 판단을 내립니다.';
duplicateMainConclusion.sections.find(ch=>ch.id==='relationship').keyJudgment='정해진 순서를 확인한 뒤에야 판단을 내립니다.';
assert(quality.validate(duplicateMainConclusion).errors.some(x=>x.includes('duplicated chapter key judgment: money / relationship')),'duplicate short core conclusions across two domains must be rejected');
const unrelatedParentheses=fixture();
const chartSample=require('./report-facts-node').build({calendar:'solar',birthDate:'1990-05-15',birthTime:'10:30',gender:'male',mbti:'INTJ'},2027);
unrelatedParentheses.sections.find(ch=>ch.id==='saju_core').body=['일간 경금은 성격을 뜻합니다. (주의해야 할 점)'];
assert(quality.validate(unrelatedParentheses,chartSample).errors.includes('reader jargon: 일간'),'unrelated parentheses do not explain a technical term');
const unfoundedRelationship=fixture();
unfoundedRelationship.sections.find(x=>x.id==='relationship').body=['원국에서는 지지 충이 확인되지 않아 겉으로 드러나는 극적인 갈등보다는 내면의 피로와 부담이 누적되는 쪽에 가깝습니다.'];
assert(quality.validate(unfoundedRelationship).errors.some(x=>x.includes('missing calculated clash cannot establish personal conflict')),'historical paid QA unfounded hidden-stress inference must fail');
const correctlyLimitedRelationship=fixture();
correctlyLimitedRelationship.sections.find(x=>x.id==='relationship').body=['지지 충이 계산되지 않았지만 이 사실만으로 갈등이 없거나 관계가 안정적이라고 말할 수 없습니다.'];
assert(!quality.validate(correctlyLimitedRelationship).errors.some(x=>x.includes('missing calculated clash cannot establish personal conflict')),'accurate limit should pass');
const threeDomainDuplicate=fixture();
for(const id of ['money','career','relationship'])threeDomainDuplicate.sections.find(s=>s.id===id).keyJudgment='논리와 근거를 확인하고 납득하면 진행합니다.';
assert(quality.validate(threeDomainDuplicate).errors.some(x=>x.startsWith('cross-domain recycled key judgment (logic-and-proof)')),'three paid domains must not recycle the same key thesis');
const threeDomainDistinct=fixture();
threeDomainDistinct.sections.find(s=>s.id==='money').keyJudgment='금전과 관련된 계산 항목이 소득의 실제 변화를 증명하지는 않습니다.';
threeDomainDistinct.sections.find(s=>s.id==='career').keyJudgment='업무에서 배우는 과정과 선택할 역할의 조건을 나누어 해석합니다.';
threeDomainDistinct.sections.find(s=>s.id==='relationship').keyJudgment='실제 상대의 감정을 사주만으로 알 수 없으며 대화 상황을 가정하지 않습니다.';
assert(!quality.validate(threeDomainDistinct).errors.some(x=>x.startsWith('cross-domain recycled key judgment')),'different domain conclusions must not be rejected');
const notRecycled=fixture();
for(let i=0;i<3;i++)notRecycled.sections[i].body=['이유와 논리를 먼저 확인하고 설명을 납득해야 결정합니다.'];
assert(!quality.validate(notRecycled).errors.some(x=>x.startsWith('cross-chapter recycled thesis')));
// Reproduces the paid QA rejection pattern without publishing customer report data.
// A single thesis reworded for every chapter must fail even when sentences differ.
const domainRepetition=fixture();
const sameThesis=[
 '논리적인 이유를 스스로 확인하고 설명을 납득해야 다음 단계로 갑니다.',
 '주어진 근거를 확인하고 그 이유가 납득되는지 검토합니다.',
 '선택에 따르는 책임의 이유와 설명이 충분한지 확인합니다.',
 '지출에 따르는 책임과 기준의 근거를 확인하고 결정합니다.',
 '일의 논리와 근거를 확인한 뒤 설명을 받아들입니다.',
 '상대가 한 설명의 이유를 확인하고 납득하려고 합니다.',
 '압박을 받으면 논리와 이유를 반복해서 확인합니다.',
 '중요한 선택에서도 근거와 설명을 검토해 납득합니다.',
 '2027년에는 규칙과 책임의 근거를 확인합니다.',
 '2027년 돈에서는 책임과 규칙을 검토합니다.',
 '2027년 업무에서는 책임과 기준을 확인합니다.',
 '2027년 관계에서는 규칙과 책임의 설명을 확인합니다.'
];
domainRepetition.sections.forEach((s,i)=>s.body=[sameThesis[i]]);
const repetitionErrors=quality.validate(domainRepetition).errors;
assert(repetitionErrors.some(x=>x.startsWith('cross-chapter recycled thesis (logic-and-proof)')));
assert(repetitionErrors.some(x=>x.startsWith('cross-chapter recycled thesis (responsibility-and-rules)')));
const annualOverreach=fixture();
annualOverreach.sections[9].body=['원국의 식상이 두드러지지 않으므로, 이 해에는 돈을 새롭게 벌기보다 현재 가진 자원 관리와 지출 통제에 관심이 쏠릴 수 있습니다.'];
assert(quality.validate(annualOverreach).errors.includes('year_2027_money: unsupported earnings inference from food-god presence'));
// Plain-language rule applies to every chapter, including natal and yearly overview.
for(const id of ['saju_core','year_2027']){
 const sample=fixture();
 sample.sections.find(s=>s.id===id).body=['경금(庚)을 검토합니다.'];
 assert(quality.validate(sample).errors.includes(id+': unnecessary Hanja in general-audience prose'));
}
const editorial=require('./report-editorial');
assert(editorial.wordingErrors(['우선할\n방향']).length);
assert(editorial.wordingErrors(['핵심\u200B성향']).length);
assert.deepEqual(editorial.wordingErrors(['정인(배움과 보호를 뜻하는 십성)을 함께 살펴봅니다.','부탁을 거절하지 못해 자신의 일을 끝내지 못합니다.']),[]);
// Concise reports must still contain every planned topic in its exact order.
const concise=fixture();
concise.meta={versions:{schema:'concise-v3'}};
for(const section of concise.sections){
 const keys=Object.keys(outline.topics[section.id]);
 section.bodyTopics=keys;
 section.body=keys.map((_,i)=>'서로 다른 설명 '+i);
 section.bodyLabels=keys.map((_,i)=>'문단 '+i);
}
assert(!quality.validate(concise).errors.some(e=>e.includes('required topics')||e.includes('topic explanations incomplete')));
// A structurally complete, non-repetitive report should pass the server quality gate.
const passing=structuredClone(concise);
passing.cover={headline:'서로 다른 상황을 차근차근 살펴봅니다',description:'계산 자료를 바탕으로 각 주제의 차이를 설명합니다.',keywords:['사주 풀이','성향 분석','연간 변화'],highlights:[{sectionId:'saju_core',title:'타고난 반응',description:'사주 풀이에서 드러나는 차이를 설명합니다.'},{sectionId:'career',title:'일하는 환경',description:'직장에서 나타날 수 있는 반응을 설명합니다.'},{sectionId:'year_2027',title:'2027년 해석',description:'2027년과 평소 풀이의 차이를 설명합니다.'}]};
const topicsSample=['원국의 일간과 월지를 비교해 성향의 차이를 풀이합니다.','월지에 나타난 기운과 다른 자리의 관계를 함께 설명합니다.','십성의 위치에 따라 해석의 범위를 구분합니다.','실제 계산된 항목을 확인한 후 해당 주제를 풀이합니다.'];
for(const [i,section] of passing.sections.entries()){
 section.title=['타고난 기질과 반응','사주와 성격 선호의 차이','결정할 때 살피는 점','돈을 사용할 때의 특징','일하는 환경과 역할','가까운 관계에서의 반응','압박을 받았을 때','사주와 성격의 종합','2027년과 평소의 차이','2027년 돈 관련 해석','2027년 일 관련 해석','2027년 관계 관련 해석'][i];
 section.keyJudgment=['감정을 표현하는 방식에 차이가 있습니다.','성향을 설명하는 두 관점은 같지 않습니다.','결정은 여러 조건을 비교해 이루어집니다.','지출과 관리 방식은 나누어 살펴야 합니다.','담당하는 역할에 따라 일하는 방식이 달라집니다.','가까운 사이에서 표현 방식이 달라집니다.','압박을 받는 상황을 구분해 살펴봅니다.','서로 다른 설명이 만나는 부분을 확인합니다.','2027년에는 평소와 다른 부분을 비교합니다.','2027년 돈에 관한 차이를 비교합니다.','2027년에는 직장 업무의 변화가 나타나는 이유를 살핍니다.','2027년에는 가족 및 지인과 만나는 방식을 따집니다.'][i];
 section.evidence=['월지와 일간의 관계를 바탕으로 '+section.title+' 주제의 전통적인 의미를 살펴봅니다.'];
 section.body=section.bodyTopics.map((_,j)=>{
  const domains=[
   ['마음속 기질을 이해하는 사례','혼자 있을 때의 감정 반응','자신의 습관을 돌아보는 모습','서로 다른 기질의 의미'],
   ['검사를 답하는 태도','낯선 모임에서의 표정','익숙한 사이의 소통','겉으로 드러난 행동'],
   ['자료를 확보하는 순서','위험을 따지는 판단','결정을 번복하는 계기','갈림길에서의 선택'],
   ['지갑을 여는 이유','통장을 관리하는 방법','계약금을 비교하는 상황','물건 값을 가늠하는 경험'],
   ['작업 현장에서 맡는 역할','회의를 준비하는 습관','동료와 일을 나누는 과정','직무를 익히는 속도'],
   ['친구에게 다가가는 태도','가족을 챙기는 마음','서운함을 전하는 장면','연인과 다투는 상황'],
   ['긴장할 때 숨을 고르는 모습','휴식이 필요한 순간','피로를 느끼는 환경','스스로 진정하는 과정'],
   ['두 관점을 나란히 살피는 방법','상반된 신호가 나타나는 이유','복잡한 해석을 정돈하는 순서','전체를 관통하는 특징'],
   ['2027년의 계산을 비교하는 과정','그해 계산에 담긴 뜻','태어난 때와 달라지는 점','이듬해를 바라보는 관점'],
   ['한 해 지출을 바라보는 관점','예산을 설정하는 순간','재정 계획을 바꾸는 이유','목돈을 고려하는 시기'],
   ['연간 직무 변화를 검토하는 일','동료와 책임을 나누는 경험','경력에 도움 되는 업무','새로운 일터를 알아보는 때'],
   ['오래된 인연을 만나는 상황','새로운 친구와 대화하는 장면','가까운 가족과 보내는 시간','함께하는 사람의 고민']
  ];
  const endings=['의 특징을 명리학의 전통적인 뜻과 비교해 풀이합니다.','이 다른 상황에서 어떻게 달라지는지 구분해 설명합니다.','이 가진 구체적인 의미를 본문에서 차근차근 설명합니다.','을 놓고 단정할 수 없는 부분도 분명하게 밝힙니다.'];
  return domains[i][j]+' — '+[
  ['음양의 기질을 설명하는 근본 특징입니다','감정 표현을 다룬 고유한 모습입니다','동기가 드러나는 자리입니다','성질을 구별하는 지표입니다'],
  ['외향 선호 검사와 연결됩니다','직관 선호의 조건을 따집니다','사고와 감정의 차이입니다','판단과 인식의 대비입니다'],
  ['확인할 자료를 고릅니다','손실 가능성을 계산합니다','선택한 이유를 기억합니다','우선순위를 비교합니다'],
  ['예산 한도를 생각합니다','청구 내역을 확인합니다','저축액을 정합니다','결제 기한을 검토합니다'],
  ['작업 순서를 나눕니다','직책에 따른 책임을 따집니다','장비 조작을 점검합니다','고용 조건을 비교합니다'],
  ['애정의 깊이를 드러냅니다','서운한 감정을 표현합니다','친밀감을 나누는 방법입니다','갈등을 푸는 모습입니다'],
  ['신체 긴장을 경험합니다','수면과 휴식이 필요합니다','불안을 유발하는 장소입니다','진정을 돕는 일과입니다'],
  ['양쪽 자료를 대조합니다','차이가 생긴 근본 이유입니다','서로 모순된 부분을 밝힙니다','독립된 관찰 기준입니다'],
  ['2027년을 풀이하는 자료입니다','화토 요소를 구분합니다','생극의 관계를 살핍니다','십간 관계를 확인합니다'],
  ['연간 지출 계획을 점검합니다','금전 계약의 조건입니다','현금 보유량을 따집니다','재산 운용의 한계를 밝힙니다'],
  ['업무 변경을 고려합니다','승진이나 전환의 조건입니다','기술 개발에 관심을 둡니다','채용 일정을 확인합니다'],
  ['인연의 변화를 설명합니다','만남의 계기를 비교합니다','가족 사이 대화를 다룹니다','서로에게 바라는 점입니다']
 ][i][j];
 });
}
passing.finalJudgment={body:['각 분야의 차이를 살펴본 결과를 바탕으로 중요한 부분을 정리합니다.'],closingQuestion:'계산 근거를 확인한 범위 안에서 판단하는 것이 좋습니다.',afterClosingText:''};
const passingQA=quality.validate(passing);
assert.equal(passingQA.pass,true,'complete report rejected: '+passingQA.errors.join(' | '));
const brokenPassing=structuredClone(passing);
brokenPassing.sections[0].body.pop();
assert.equal(quality.validate(brokenPassing).pass,false);
const incomplete=structuredClone(concise);
incomplete.sections[0].bodyTopics[0]='invalid_topic_key';
assert(quality.validate(incomplete).errors.includes('saju_core: topics unknown or reordered'));
const shorter=structuredClone(concise);
shorter.sections[0].body.pop();
assert(quality.validate(shorter).errors.includes('saju_core: topic explanations incomplete'));
const repeated=fixture();repeated.sections[0].body=Array.from({length:4},(_,i)=>'사주에서는 서로 다른 설명 '+i);assert(quality.validate(repeated).errors.some(e=>e.includes('repeated interpretation boilerplate')));
const genericEvidence=fixture();
assert(quality.validate(genericEvidence).errors.includes('saju_core: evidence is generic placeholder'));
const specificEvidence=fixture();specificEvidence.sections[0].evidence=['월지의 정인 관계가 전통적으로 배움과 보호를 뜻하는 항목입니다.'];
assert(!quality.validate(specificEvidence).warnings.some(x=>x.startsWith('saju_core: evidence')));
const calculatedFacts={facts:{tenGods:{year:{stemTenGod:'정관'},month:{stemTenGod:'정재'},day:{stemTenGod:'일간'},hour:{stemTenGod:'편인'}}}};
const badGod=fixture();badGod.sections[0].evidence=['월간의 편재는 사업에서 돈을 버는 방식으로 설명합니다.'];
assert(quality.validate(badGod,calculatedFacts).errors.includes('saju_core: 월간 편재 conflicts with calculated 정재'));
const badGodInBody=fixture();badGodInBody.sections[0].body=['월간의 편재가 일하는 모습에 영향을 준다는 해석입니다.'];assert(quality.validate(badGodInBody,calculatedFacts).errors.includes('saju_core: 월간 편재 conflicts with calculated 정재'));
const goodGod=fixture();goodGod.sections[0].evidence=['월간의 정재는 전통적으로 재물 관리에 관련된 십성입니다.'];
assert(!quality.validate(goodGod,calculatedFacts).errors.some(e=>e.includes('conflicts with calculated')));
const unstatedGod=fixture();unstatedGod.sections[0].evidence=['사주에서 편재를 어떻게 이해할 수 있는지 설명합니다.'];
assert(!quality.validate(unstatedGod,calculatedFacts).errors.some(e=>e.includes('conflicts with calculated')));
const yearFacts={facts:{tenGods:{},annualTenGods:{stemTenGod:'정재'},targetYearRelations:[{type:'충',between:'month',branches:'午子'}]}};
const wrongYear=fixture();wrongYear.sections[8].evidence=['2027년 세운은 편재이므로 소비가 늘어납니다.'];
assert(quality.validate(wrongYear,yearFacts).errors.includes('year_2027: 2027 편재 conflicts with calculated 정재'));
const correctYear=fixture();correctYear.sections[8].evidence=['2027년 세운은 정재로 나타납니다.'];
assert(!quality.validate(correctYear,yearFacts).errors.some(x=>x.includes('2027')&&x.includes('conflicts with calculated')));
const unsupportedClash=fixture();unsupportedClash.sections[8].evidence=['2027년 일지와 충돌하는 관계가 있습니다.'];
assert(quality.validate(unsupportedClash,yearFacts).errors.includes('year_2027: unsupported 2027 clash with 일지'));
const supportedClash=fixture();supportedClash.sections[8].evidence=['2027년 월지와 충돌하는 관계가 있습니다.'];
assert(!quality.validate(supportedClash,yearFacts).errors.some(x=>x.includes('unsupported 2027 clash')));
const uncalculatedFacts={facts:{tenGods:{},limits:['신강·신약·용신은 이 계산에서 판정하지 않음']}};
const unsupportedStrength=fixture();unsupportedStrength.sections[8].body=['2027년에는 신강으로 판정되므로 독립하기 좋습니다.'];
assert(quality.validate(unsupportedStrength,uncalculatedFacts).errors.includes('year_2027: unsupported strength or favorable-element classification'));
const unsupportedYongshin=fixture();unsupportedYongshin.sections[8].evidence=['2027년 용신은 목이라서 운이 좋아집니다.'];
assert(quality.validate(unsupportedYongshin,uncalculatedFacts).errors.includes('year_2027: unsupported strength or favorable-element classification'));
const limitedEvidence=fixture();limitedEvidence.sections[8].body=['이 계산만으로 신강인지 신약인지 판단하지 않습니다.'];
assert(!quality.validate(limitedEvidence,uncalculatedFacts).errors.some(x=>x.includes('unsupported strength')));
const decadeOnly={fortune:{status:'complete',forward:true,start:{year:3,month:0,day:0,hour:0}},facts:{tenGods:{}}};
const inventedDecade=fixture();inventedDecade.sections[8].evidence=['2027년 대운은 편재이므로 사업으로 돈을 벌게 됩니다.'];
assert(quality.validate(inventedDecade,decadeOnly).errors.includes('year_2027: unsupported decade-fortune pillar or ten-god claim'));
const acceptableDecade=fixture();acceptableDecade.sections[8].evidence=['대운의 십성은 현재 계산에서 제공되지 않아 단정할 수 없습니다.'];
assert(!quality.validate(acceptableDecade,decadeOnly).errors.some(x=>x.includes('unsupported decade-fortune')));
const computedDecade={fortune:{status:'complete',decades:[{pillar:'甲子',stemTenGod:'비견',startYear:2022,endYear:2031}],activeDecade:{pillar:'甲子',stemTenGod:'비견',startYear:2022,endYear:2031}},facts:{tenGods:{}}};
const falseDecadeGod=fixture();falseDecadeGod.sections[8].evidence=['2027년 대운은 편재로 나타납니다.'];
assert(quality.validate(falseDecadeGod,computedDecade).errors.includes('year_2027: 2027 decade 편재 conflicts with calculated 비견'));
const trueDecadeGod=fixture();trueDecadeGod.sections[8].evidence=['2027년 대운은 비견으로 나타납니다.'];
assert(!quality.validate(trueDecadeGod,computedDecade).errors.some(x=>x.includes('decade')&&x.includes('conflicts')));
const computedCalendar=require('./calendar-provider-node').fortune({calendar:'solar',birthDate:'1990-06-15',birthTime:'12:00',gender:'male'});
const packet2027=require('./report-facts-node').build({calendar:'solar',birthDate:'1990-06-15',birthTime:'12:00',gender:'male',mbti:'ISFP'},2027);
assert.equal(packet2027.status,'ready');
assert(packet2027.fortune.activeDecade?.pillar);
assert(packet2027.fortune.activeDecade?.stemTenGod);
assert.equal(packet2027.targetYear.year,2027);
assert(packet2027.facts.annualTenGods.stemTenGod);
const unknownTimePacket=require('./report-facts-node').build({calendar:'solar',birthDate:'1990-06-15',unknownBirthTime:true,gender:'male',mbti:'ISFP'},2027);
assert.equal(unknownTimePacket.status,'ready');
assert.equal(unknownTimePacket.chart.hour,null);
assert.equal(unknownTimePacket.fortune.status,'unavailable_without_birth_time');
assert.equal(unknownTimePacket.fortune.activeDecade,null);
assert.equal(unknownTimePacket.fortune.decades.length,0);
const unknownTimeMockReport=fixture();
unknownTimeMockReport.sections[8].evidence=['2027년 대운은 편재이므로 사업으로 돈을 벌게 됩니다.'];
assert(quality.validate(unknownTimeMockReport,unknownTimePacket).errors.includes('year_2027: unsupported decade-fortune pillar or ten-god claim'));


assert(Array.isArray(computedCalendar.decades)&&computedCalendar.decades.length>0);
assert(computedCalendar.decades.some(d=>d.pillar&&Number.isInteger(d.startYear)&&Number.isInteger(d.endYear)));
const contradiction=fixture();contradiction.sections[3].title='불필요한 지출은 하지 않습니다';contradiction.sections[3].body=['마음에 드는 물건에는 예산보다 많은 돈을 쓸 수 있습니다.'];assert(quality.validate(contradiction).errors.includes('money: categorical money headline conflicts with spending exception'));
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
assert(target.innerHTML.includes('종합 총평'));assert(target.innerHTML.includes('가장 중요한 결론'));
assert(target.innerHTML.indexOf('가장 중요한 결론')<target.innerHTML.indexOf(fixture().finalJudgment.closingQuestion));
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
assert.equal(Object.values(blueprint).reduce((count,chapter)=>count+Object.keys(chapter.topicTasks).length,0),28);
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
const singleComparison=comparisonWire.decode({chapters:{mbti_contradiction:{title:'비교',keyJudgment:'판단',evidence:[],mood:'reflective',paragraphs:{agreement:{label:'선호와 이유',text:'첫 문단에서 상황과 이유를 충분히 설명합니다.'},difference:null}}},cover:null,finalJudgment:null},comparisonPrompt);
assert.deepEqual(singleComparison.sections[0].bodyTopics,['agreement']);
const forcedComparison={stage:'body',rules:{hanjaPolicy:reader.instruction,topicPlan:{integrated_judgment:{insight:'같은 선택에서 서로 다른 결론을 제시하는 조건'}}}};
assert(require('./report-instruction-audit').inspect(forcedComparison).includes('forced contrast in writing plan'));
for(const a of ['I','E'])for(const b of ['S','N'])for(const c of ['T','F'])for(const d of ['J','P']){const type=a+b+c+d; const ref=guidance.forRequest(['decision'],type).mbtiReference; assert.equal(ref.preferences.map(x=>x.code).join(''),type);assert.equal(ref.preferences.length,4);}
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
  assert.equal(p.priorChapterConclusions.length,(calls-1)*2);
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
   assert(p.rules.mbtiDepthRule);assert.equal(p.priorSections.length,(calls-1)*2);
  if(calls>1){assert(p.priorSections.every(s=>s.topicConclusions.length===s.bodyLabels.length)); assert(p.priorSections.every(s=>s.topicConclusions.every(t=>typeof t==='string'&&t.length>0)),'previous chapter text must be preserved after domain-evidence enforcement');}
  assert.deepEqual(Object.keys(p.analysisGuidance.chapterTasks),Array.from(p.requestedSections));
  assert.equal(p.analysisGuidance.mbtiReference.type,'ISFP');
  assert.equal(p.analysisGuidance.mbtiReference.preferences.map(x=>x.code).join(''),'ISFP');
  return {sections:p.requestedSections.map(id=>({id,title:'제목',keyJudgment:'핵심',evidence:['계산한 사주 항목의 설명입니다.'],bodyTopics:Object.keys(outline.topics[id]),bodyLabels:Object.keys(outline.topics[id]).map((_,i)=>'검증 항목 '+i),body:Object.keys(outline.topics[id]).map((_,i)=>'첫 번째 결론 '+i+'. 이어지는 설명입니다.')}))};
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
    evidence:['계산한 사주 항목의 설명입니다.'],bodyTopics:Object.keys(outline.topics[id]),
    bodyLabels:Object.keys(outline.topics[id]).map((_,i)=>'검증 항목 '+i),
    body:Object.keys(outline.topics[id]).map(()=>'문장입니다.')
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
   evidence:['원국의 일간 계산 근거 '+id],bodyTopics:Object.keys(outline.topics[id]),
   bodyLabels:Object.keys(outline.topics[id]).map((_,i)=>'검증 항목 '+i),
   body:Object.keys(outline.topics[id]).map((_,i)=>'서로 다른 주제 '+id+i+'에서 논리와 근거를 확인하고 설명에 납득해야 합니다.')
  }))};
 }),/cross-chapter recycled thesis/);
 assert.equal(preflightCalls,3);
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
