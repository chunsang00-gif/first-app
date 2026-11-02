'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const relations=require('./report-branch-relations');
const harmony=require('./report-paid-natal-day-harmony');
const guidance=require('./report-analysis-guidance');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const synthetic={chart:{year:'甲辰',month:'乙未',day:'丙午',hour:'戊辰'}};
synthetic.facts={natalBranchRelations:relations.natal(synthetic.chart)};
const proof=harmony.candidate(synthetic);
assert(proof&&proof.otherPosition==='month'&&proof.dayBranch==='午'&&proof.otherBranch==='未');
assert.equal(proof.relationshipOutcomeObserved,false);
assert.equal(proof.transformationConfirmed,false);
const bad=structuredClone(synthetic);bad.facts.natalBranchRelations.pairs=[];
assert.equal(harmony.candidate(bad),null,'tampered source must be rejected');
const competing={chart:{year:'甲子',month:'乙未',day:'丙午',hour:'丁戌'}};
competing.facts={natalBranchRelations:relations.natal(competing.chart)};
assert.equal(harmony.candidate(competing),null,'a day clash and harmony cannot be treated as an isolated pair');
let actual=null;
for(let d=1;d<=31;d++){
 const packet=facts.build({calendar:'solar',birthDate:'1988-07-'+String(d).padStart(2,'0'),birthTime:'08:20',gender:'male',mbti:'ISFP'},2027);
 if(packet.status!=='ready')continue;
 const item=harmony.candidate(packet);
 if(item){actual={packet,proof:item};break}
}
assert(actual,'an actual calendar chart must reach the new question');
const plan=guidance.preflight(actual.packet);
const task=plan.relationship.topicTasks.coordination;
assert.equal(task.mode,'use-primary');
assert.deepEqual(task.allowedSourceRefs,[harmony.SOURCE]);
assert.equal(task.sourceOwnedDayHarmony.kind,proof.kind);
const prompt={facts:actual.packet,stage:'body',requestedSections:['relationship'],priorSections:[],
 analysisGuidance:{...guidance.forRequest(['relationship'],actual.packet.person.mbti),editorialBlueprint:{relationship:plan.relationship}},
 rules:{sectionGoals:require('./report-prompt').sectionGoals}};
const payload=writer.compile(prompt),topic=payload.task.chapters.relationship.topics.coordination;
assert.deepEqual(topic.citableFacts.map(x=>x.id),[harmony.SOURCE]);
assert.equal(topic.sourceOwnedDayHarmony.computedCondition,actual.proof.computedCondition);
const schema=writer.schema(prompt,wire.schemaFor(prompt,require('./report-schema.json')));
const slot=schema.properties.chapters.properties.relationship.properties.paragraphs.properties.coordination;
assert(slot.anyOf.some(x=>x.type==='null'));
const leaf=slot.anyOf.find(x=>x.type==='object');
assert.deepEqual(leaf.properties.basis.properties.refs.items.enum,[harmony.SOURCE]);
assert.deepEqual(leaf.properties.basis.properties.condition.enum,[actual.proof.computedCondition]);
const para={label:'두 조건의 관계',text:'태어난 날과 달의 결합 관계는 서로 다른 요구를 한 상황에서 비교하는 질문이 됩니다. 실제 사람과 잘 맞거나 혼인한다는 뜻은 아닙니다.',
 basis:{refs:[harmony.SOURCE],condition:actual.proof.computedCondition,interpretation:'두 출생 위치의 육합 관계표에 기반합니다.',limit:'실제 조화와 관계 경험은 알 수 없습니다.'}};
const response=p=>({chapters:{relationship:{paragraphs:{coordination:p}}}});
assert.doesNotThrow(()=>writer.restoreEvidence(response(para),prompt));
const wrong=structuredClone(para);wrong.basis.condition='관계운이 좋아집니다.';
assert.throws(()=>writer.restoreEvidence(response(wrong),prompt),/day harmony evidence missing/);
const sourceSwap=structuredClone(para);sourceSwap.basis.refs=['natal.day.stem'];
assert.throws(()=>writer.restoreEvidence(response(sourceSwap),prompt),/day harmony evidence missing|not permitted|unrelated paragraph basis/);
console.log('PASS real chart day harmony evidence, strict source schema, rejected false condition; zero paid calls');
