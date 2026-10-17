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
 assert(fixed.title.length>=8&&fixed.title.length<=70);
 assert(fixed.keyJudgment.length>=35&&fixed.keyJudgment.length<120);
 assert(fixed.keyJudgment.startsWith('사주에서는 '));
 assert.equal(fixed.keyJudgment.split(/(?<=[.!?。！？])\\s+|\\n+/).length,1);
 assert(!/(?:冬|癸|己|乙|원국|월지|십성|본기|실제 성격이 확정)/.test(fixed.keyJudgment));
 assert.deepEqual(wire.schemaFor(prompt,schema).properties.chapters.properties.saju_core.properties.keyJudgment.enum,[fixed.keyJudgment]);
 assert.deepEqual(wire.schemaFor(prompt,schema).properties.chapters.properties.saju_core.properties.title.enum,[fixed.title]);
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
assert.equal(core.forPrompt({stage:'synthesis',requestedSections:[],facts:actual}),null);
assert.throws(()=>core.forPrompt({...prompt,facts:{}}),/NO_VERIFIED_MONTH_PAIR/);
console.log('PASS deterministic single-sentence core thesis from real lunar/month stems for 5 cases, strict schema and decoding; 0 paid API');
