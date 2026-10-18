'use strict';
const assert=require('node:assert/strict');
const guidance=require('./report-analysis-guidance'),facts=require('./report-facts-node');
const core=require('./report-core-thesis'),wire=require('./report-wire');
const schema=require('./report-schema.json');
const inputs=[
 {calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'1982-11-24',birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'1990-05-15',birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'1990-11-15',birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'2001-11-03',unknownBirthTime:true,gender:'male',mbti:'ISFP'}
];
for(const input of inputs){
 const packet=facts.build(input,2027);assert.equal(packet.status,'ready');
 const plan=guidance.preflight(packet);
 const prompt={stage:'body',facts:packet,requestedSections:['saju_core'],
  analysisGuidance:{...guidance.forRequest(['saju_core'],input.mbti),
   editorialBlueprint:{saju_core:plan.saju_core}}};
 const fixed=core.forPrompt(prompt);
 assert.equal(fixed.status,'traditional-reading-not-observed-trait');
 assert(fixed.title.length>=8&&fixed.title.length<=30);
 assert(fixed.keyJudgment.length>=35&&fixed.keyJudgment.length<120);
 assert(fixed.keyJudgment.startsWith('사주에서는 '));
 assert.equal(fixed.keyJudgment.split(/(?<=[.!?。！？])\\s+|\\n+/).length,1);
 assert(!/(?:冬|癸|己|乙|원국|월지|십성|본기|실제 성격이 확정)/.test(fixed.keyJudgment));
 assert.deepEqual(wire.schemaFor(prompt,schema).properties.chapters.properties.saju_core.properties.keyJudgment.enum,[fixed.keyJudgment]);
 assert.deepEqual(wire.schemaFor(prompt,schema).properties.chapters.properties.saju_core.properties.title.enum,[fixed.title]);
 const mandatory=wire.schemaFor(prompt,schema).properties.chapters.properties.saju_core.properties.paragraphs.properties.strength;
 assert(mandatory.properties.text.description.includes(fixed.keyJudgment),
  'every verified pair must bind the exact locked judgment to the mandatory writing field');
 assert(mandatory.properties.text.description.includes('그대로 다시 적지 말고'),
  'the body must explain the thesis, not copy it');
 assert.doesNotThrow(()=>core.assertDecoded(fixed,prompt));
 assert.throws(()=>core.assertDecoded({...fixed,keyJudgment:fixed.keyJudgment+' 이 장은 참고용입니다.'},prompt));
}
// Actual distinct-source/same-category case: in a 甲 year, April's
// calculated 戊辰 month has 戊 as both visible and principal hidden stem.
const sameInput={calendar:'solar',birthDate:'1994-04-15',birthTime:'14:20',gender:'male',mbti:'ISFP'};
const samePacket=facts.build(sameInput,2027);
assert.equal(samePacket.status,'ready');
const sameContrast=require('./report-chart-contrast').build(samePacket);
assert.equal(sameContrast.monthTenGodContext.sameClassification,true,
 'real birth date must exercise a SAME-classification month pair');
const sameBlueprint=guidance.preflight(samePacket);
const samePrompt={stage:'body',facts:samePacket,requestedSections:['saju_core'],
 analysisGuidance:{...guidance.forRequest(['saju_core'],sameInput.mbti),editorialBlueprint:{saju_core:sameBlueprint.saju_core}}};
const sameSchema=wire.schemaFor(samePrompt,schema).properties.chapters.properties.saju_core.properties;
const sameRole=sameSchema.paragraphs.properties.strength;
const sameText=sameRole.properties.text.description;
assert(sameText.includes('두 출생 위치의 십성 분류와 전통적 뜻이 같으므로')&&
 sameText.includes('고정된 핵심 판단을 한 가지 가상 선택에 적용한다')&&
 sameRole.properties.label.description.includes('같은 전통 분류'),
 'same-category paid reader must be instructed to interpret ONE traditional lens from TWO provenance locations');
assert(!sameText.includes('서로 다른 뜻을 한 가지 조건부 기질 해석으로 연결')&&
 !sameText.includes('두 선택의 뜻이 한 상황에 연결되는 이유')&&
 !sameText.includes('한쪽의 의미만 보면 놓칠 조건'),
 'the output schema must not force a fictional distinction between identical classifications');
assert.deepEqual(sameSchema.keyJudgment.enum,[core.forPrompt(samePrompt).keyJudgment]);
assert.equal(core.forPrompt(samePrompt).categories[0],core.forPrompt(samePrompt).categories[1]);
assert(require('./report-generation-request').policy.includes('같은 전통 분류라면 거짓 의미 차이'));
assert(sameBlueprint.saju_core.topicTasks.strength.interpretationBoundary.includes('거짓 차이·갈등·강도 증폭'));
assert(require('./report-prompt').sectionGoals.saju_core.includes('같은 분류면 서로 다른 뜻'));
const actual=facts.build(inputs[0],2027);
const prompt={stage:'body',facts:actual,requestedSections:['saju_core']};
const case0=core.forPrompt(prompt);
assert.deepEqual(case0.categories,['편인','편재']);
assert(case0.keyJudgment.includes('낯선 내용을 자기 방식으로 이해하고'));
assert(case0.keyJudgment.includes('필요한 자원을 여러 곳에서 찾아 활용하려는'));
assert(!case0.keyJudgment.includes('상징')&&!case0.keyJudgment.includes('한계'));
const grounding=require('./report-grounding-review');
const draft=body=>({sections:[{id:'saju_core',title:case0.title,
 keyJudgment:case0.keyJudgment,bodyTopics:['strength'],
 bodyLabels:['가상 선택의 조건'],body:[body],evidence:[]}]});
const affirmative='낯선 정보를 자기 방식으로 이해하고 필요한 자원을 여러 곳에서 찾아 활용하는 두 관점을 연결합니다. 예를 들어 낯선 자료를 살핀 다음 필요한 재료를 찾아 선택할 때 두 조건이 중요하다는 전통적 풀이입니다.';
assert(!grounding.inspect(draft(affirmative),actual).blockingErrors.includes(
 'saju_core:main-paragraph-explicitly-reverses-locked-judgment'),
 'a source-grounded conditional interpretation must not be falsely rejected');
const reversed='낯선 정보를 자기 방식으로 이해하지 않는 기질입니다. 필요한 자원을 여러 곳에서 찾아 활용하지 않는 성향입니다.';
assert(grounding.inspect(draft(reversed),actual).blockingErrors.includes(
 'saju_core:main-paragraph-explicitly-reverses-locked-judgment'),
 'repeated source vocabulary must not hide a categorical reversal of the locked thesis');
const qualified='낯선 정보를 자기 방식으로 이해하고 필요한 자원을 여러 곳에서 활용하는 뜻으로 풀이합니다. 하지만 그런 행동을 실제로 해 왔다고 단정할 수는 없습니다. 예를 들어 자료를 받고 필요한 도구를 고르는 상황을 가정합니다.';
assert(!grounding.inspect(draft(qualified),actual).blockingErrors.includes(
 'saju_core:main-paragraph-explicitly-reverses-locked-judgment'),
 'lack of observed behavioral evidence is NOT a contradictory traditional reading');
// A stock example after two glossary definitions must not qualify as paid
// interpretation merely because it contains the required meaning words.
const dictionaryOnly=draft(
 '태어난 달의 겉글자는 낯선 정보를 자기 방식으로 이해하는 뜻입니다. 그 달의 중심 숨은 글자는 필요한 자원을 여러 곳에서 찾아 활용하는 의미입니다. 예를 들어 새로운 일을 할 때는 자료를 확인하고 준비하는 것이 좋습니다.');
assert(grounding.inspect(dictionaryOnly,actual).blockingErrors.includes(
 'saju_core:dictionary-plus-generic-advice-masquerading-as-reading'),
 'source-word coverage plus universal preparation advice is not an applied interpretation');
const appliedDifference=draft(
 '태어난 달의 겉글자는 낯선 정보를 자기 방식으로 이해하는 뜻입니다. 그 달의 중심 숨은 글자는 필요한 자원을 여러 곳에서 찾아 활용하는 의미입니다. 예를 들어 낯선 재료를 고를 때 정보의 쓰임새와 구할 곳을 함께 살피는 해석이 유리합니다. 정보 해석만 오래 하면 자원을 마련할 기회를 놓칠 수 있다는 조건도 설명합니다.');
assert(!grounding.inspect(appliedDifference,actual).blockingErrors.includes(
 'saju_core:dictionary-plus-generic-advice-masquerading-as-reading'),
 'an actually related advantage and overlooked condition must not be penalized');
const plainScene=draft(
 '낯선 정보를 자기 방식으로 이해하고 필요한 자원을 여러 곳에서 찾아 활용하는 관점을 연결합니다. 예를 들어 재료를 선택할 때 쓰임새를 파악한 다음 공급처를 살피는 모습으로 풀이합니다.');
assert(!grounding.inspect(plainScene,actual).blockingErrors.includes(
 'saju_core:dictionary-plus-generic-advice-masquerading-as-reading'),
 'source-grounded prose without two glossary definitions is not a false positive');
const leaked=draft('낯선 정보를 살피는 모습으로 풀이합니다. 다음 문단에서는 자원을 활용하는 특징을 설명합니다.');
assert(grounding.inspect(leaked,actual).blockingErrors.includes(
 'saju_core:editorial-outline-leaked-to-reader'),
 'paid core cannot expose the next-paragraph editorial outline');
const withPrivateEvidence=draft(affirmative);
withPrivateEvidence.sections[0].evidence=['다음 문단에서는 출처를 검증한다'];
assert(!grounding.inspect(withPrivateEvidence,actual).blockingErrors.includes(
 'saju_core:editorial-outline-leaked-to-reader'),
 'private calculated provenance remains separate from visible copy');
const corePair=(first,second)=>({sections:[{id:'saju_core',title:case0.title,
 keyJudgment:case0.keyJudgment,bodyTopics:['temperament','strength'],
 bodyLabels:['추가 계절 조건','한 가지 선택'],body:[first,second],evidence:[]}]});
const repeated=corePair(
 '계절과 겉글자에서는 가상의 선택에 도움이 되는 조건을 살핍니다. 실제 성격을 단정할 수 없습니다.',
 '낯선 정보를 이해하고 필요한 자원을 여러 곳에서 살피는 사주로 풀이합니다. 실제 행동을 단정할 수 없습니다.');
assert(grounding.inspect(repeated,actual).blockingErrors.includes(
 'saju_core:repeated-generic-observation-disclaimer'),
 'two separate core paragraphs must not repeat the same global disclaimer');
const specific=corePair(
 '계절 분류만으로 실제 적응력을 확정할 수는 없습니다. 가령 재료를 마련할 때 필요한 도움을 살피는 해석입니다.',
 '낯선 정보를 이해한 뒤 여러 곳의 자원을 살피는 기질로 풀이합니다. 실제 성격을 단정할 수 없습니다.');
assert(!grounding.inspect(specific,actual).blockingErrors.includes(
 'saju_core:repeated-generic-observation-disclaimer'),
 'source-specific limitation must not be mistaken for global repetition');
const single=draft('낯선 정보와 필요한 자원을 함께 살피는 태도로 풀이합니다. 다만 실제 행동은 단정할 수 없습니다.');
assert(!grounding.inspect(single,actual).blockingErrors.includes(
 'saju_core:repeated-generic-observation-disclaimer'),
 'one appropriately bounded disclaimer is allowed');
assert.equal(core.forPrompt({stage:'synthesis',requestedSections:[],facts:actual}),null);
assert.throws(()=>core.forPrompt({...prompt,facts:{}}),/NO_VERIFIED_MONTH_PAIR/);
console.log('PASS deterministic single-sentence core thesis from real lunar/month stems for 5 cases, strict schema and decoding; 0 paid API');
