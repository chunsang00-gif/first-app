'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node'),guide=require('./report-analysis-guidance');
const wire=require('./report-wire'),writer=require('./report-generation-request');
const schema=require('./report-schema.json'),core=require('./report-core-thesis');
const inputs=[
 {calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'1994-04-15',birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'1994-07-15',birthTime:'14:20',gender:'male',mbti:'ISFP'}
];
function prompt(input,options={}){
 const factsPacket=facts.build(input,2027);assert.equal(factsPacket.status,'ready');
 return {stage:'body',facts:factsPacket,requestedSections:['saju_core'],...options,
  analysisGuidance:{...guide.forRequest(['saju_core'],input.mbti),
  editorialBlueprint:{saju_core:guide.preflight(factsPacket).saju_core}}};
}
let normal=[];
for(const input of inputs){
 const p=prompt(input),judgment=core.forPrompt(p);
 const frozen=core.forPrompt(prompt(input,{paidCoreDepthV2:true}));
 assert(judgment.keyJudgment.startsWith('사주에서는 태어난 달의'));
 assert(!judgment.keyJudgment.includes('기질을,'));
 assert(!judgment.keyJudgment.includes('기질로'));
 assert(frozen.keyJudgment.includes('기질'),
 'historical paid QA lock must be unchanged');
 const output=writer.schema(p,wire.schemaFor(p,schema));
 const chapter=output.properties.chapters.properties.saju_core.properties;
 assert.deepEqual(chapter.keyJudgment.enum,[judgment.keyJudgment]);
 const slot=chapter.paragraphs.properties.strength;
 const text=(slot.anyOf?.find(x=>x.type==='object')||slot).properties.text.description;
 assert(text.includes('대칭 주의문을 작성하지 않는다'));
 assert(text.includes('실제 선택 경향'));
 assert(text.includes('basis.refs'));
 assert(!text.includes('언제 이롭거나 불리한가'),
 'normal paid must not be forced to invent beneficial or harmful real outcomes');
 assert(!text.includes('한 가지 생활 선택에서 뜻하는 기질을 쉬운 말로 풀고'));
 assert(chapter.keyJudgment.description.includes('실제 고객의 선택 경향'));
 assert(!chapter.keyJudgment.description.includes('전통적 기질 해석을 조건부로 말하고'));
 const request=writer.compile(p);
 const allowed=[...new Set(Object.values(request.task.chapters.saju_core.topics)
 .flatMap(x=>x.citableFacts.map(y=>y.id)))].sort();
 assert.deepEqual(Object.keys(request.source).sort(),allowed);
 normal.push(judgment.keyJudgment);
}
assert(new Set(normal).size>=2,'month-specific judgments cannot all be identical');
assert(normal[0].includes('제약하는'),'1982 verified direction must not reverse');
assert(normal[1].includes('한 가지 전통적 뜻'),'identical category must stay one interpretation');
console.log('PASS normal first chapter no longer forces observed temperament or invented outcomes, historical QA remains immutable, 0 paid calls');
