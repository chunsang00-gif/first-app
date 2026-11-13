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
 const payload=request;

 // Both policy and strict text-field schema reach the provider. Previously
 // high-level policy still demanded invented real-life advantages.
 assert(writer.policyFor(p).includes('출생월 겉글자와 중심 숨은 글자의 전통적 뜻'));
 assert(!writer.policyFor(p).includes('한쪽만 따르면 놓치는 조건을 설명하고'),
  'regular paid high-level policy must not contradict source-only body field');
 assert(!writer.policyFor(p).includes('가상의 한 선택에서 언제 도움이 되고 어느 조건에서 손해가 생기는지'));
 assert(payload.task.chapters.saju_core.analysisGoal.includes('첫 사주 장의 실제 결제 원고'));
 const plan=payload.task.chapters.saju_core.topics.strength.sourceOwnedCoreReaderValue;
 assert(plan?.illustrativeScene?.includes('가상 예시:'));
 assert.equal(plan.illustrativeSceneIsCustomerHistory,false);
 assert(plan.script.includes(plan.illustrativeScene));
 assert(plan.script.includes('무료 화면에 이미 제공된'),
  'premium first-chapter text must not repackage the free preview');
 assert(text.includes(plan.illustrativeScene),
  'the source-specific scene must reach the real paid paragraph writing schema');
 normal.push(judgment.keyJudgment);
}
assert(new Set(normal).size>=2,'month-specific judgments cannot all be identical');
const scenes=inputs.map(input=>writer.compile(prompt(input)).task.chapters
 .saju_core.topics.strength.sourceOwnedCoreReaderValue.illustrativeScene);
assert(new Set(scenes).size>=2);
const verifiedMonth=require('./report-chart-contrast')
 .build(prompt(inputs[0]).facts).monthTenGodContext;
const expectedScene=require('./report-chart-contrast')
 .TEN_GOD_SCENE[verifiedMonth.monthStem.tenGod];
assert(scenes[0].includes(expectedScene),
 'the source-verified visible month role must choose the actual paid illustration');
assert(normal[0].includes('제약하는'),'1982 verified direction must not reverse');
assert(normal[1].includes('한 가지 전통적 뜻'),'identical category must stay one interpretation');

const base=prompt(inputs[0]);
const packet=base.facts;
const mixed={...base,requestedSections:['saju_core','decision'],
 analysisGuidance:{...base.analysisGuidance,
  editorialBlueprint:{...base.analysisGuidance.editorialBlueprint,
   decision:guide.preflight(packet).decision}}};
const mixedWritten=writer.compile(mixed);
assert(writer.policyFor(mixed).includes('출생월 겉글자와 중심 숨은 글자의 전통적 뜻'));
assert(!writer.policyFor(mixed).includes('한쪽만 따르면 놓치는 조건을 설명하고'));
assert(mixedWritten.task.chapters.saju_core.analysisGoal.includes('첫 사주 장의 실제 결제 원고'));
const historic=writer.compile(prompt(inputs[0],{paidCoreDepthV2:true}));
assert(writer.policyFor(prompt(inputs[0],{paidCoreDepthV2:true})).includes('한쪽만 따르면 놓치는 조건을 설명하고'),
 'the explicit development-only old paid QA policy remains unchanged');
console.log('PASS normal first chapter no longer forces observed temperament or invented outcomes, historical QA remains immutable, 0 paid calls');
