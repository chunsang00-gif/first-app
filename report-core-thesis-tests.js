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
assert.equal(core.forPrompt({stage:'synthesis',requestedSections:[],facts:actual}),null);
assert.throws(()=>core.forPrompt({...prompt,facts:{}}),/NO_VERIFIED_MONTH_PAIR/);
console.log('PASS deterministic single-sentence core thesis from real lunar/month stems for 5 cases, strict schema and decoding; 0 paid API');
