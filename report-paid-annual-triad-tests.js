'use strict';
const assert=require('node:assert/strict');
const relations=require('./report-branch-relations');
const facts=require('./report-facts-node');
const triad=require('./report-paid-annual-triad');
const guidance=require('./report-analysis-guidance');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const chart={year:'甲亥',month:'乙卯',day:'丙子',hour:null};
const synthetic={chart,targetYear:{year:2027,pillar:'丁未'},
 facts:{natalBranchRelations:relations.natal(chart),targetYearBranchRelations:relations.annual(chart,'丁未')}};
const proof=triad.candidate(synthetic);
assert(proof&&proof.groupType==='삼합'&&proof.groupBranches==='亥卯未');
assert.deepEqual(proof.natalPositions,['year','month']);
assert.equal(proof.transformed,false);
assert.equal(proof.futureEventPredicted,false);
const fake=structuredClone(synthetic);
fake.facts.targetYearBranchRelations.groups[0].newlyCompletedByAnnual=false;
assert.equal(triad.candidate(fake),null,'cannot use tampered annual membership');
const before=structuredClone(synthetic);before.targetYear={year:2026,pillar:'丁未'};
assert.equal(triad.candidate(before),null,'never attribute this annual condition to the wrong year');
const overlapChart={year:'甲亥',month:'乙卯',day:'丙巳',hour:'丁午'};
const overlap={chart:overlapChart,targetYear:{year:2027,pillar:'丁未'},
 facts:{natalBranchRelations:relations.natal(overlapChart),targetYearBranchRelations:relations.annual(overlapChart,'丁未')}};
assert.equal(triad.candidate(overlap),null,'two newly complete groups cannot be promoted into one chosen reading');
let actual=null,seen=0;
for(let year=1980;year<=2006&&!actual;year+=2)for(const month of [1,3,5,7,9,11]){
 const input={calendar:'solar',birthDate:year+'-'+String(month).padStart(2,'0')+'-15',
  birthTime:'08:20',gender:'male',mbti:'ISFP'};
 const packet=facts.build(input,2027);seen++;
 if(packet.status!=='ready')continue;
 const match=triad.candidate(packet);
 if(match){actual={packet,match};break}
}
assert(actual,'at least one real calendar chart must qualify for annual three-branch question');
const plan=guidance.preflight(actual.packet);
assert.deepEqual(require('./report-interpretation-invariants').verify(actual.packet,plan).errors,[],
 'qualifying annual triad must pass the real pre-billable integrity gate');
const task=plan.year_2027.topicTasks.new_triad;
assert.equal(task.mode,'use-primary');
assert.deepEqual(task.allowedSourceRefs,[triad.REF]);
assert.equal(task.sourceOwnedAnnualTriad.computedCondition,actual.match.computedCondition);
const prompt={stage:'body',facts:actual.packet,requestedSections:['year_2027'],
 priorSections:[],rules:{sectionGoals:require('./report-prompt').sectionGoals},
 analysisGuidance:{...guidance.forRequest(['year_2027'],actual.packet.person.mbti),
  editorialBlueprint:{year_2027:plan.year_2027}}};
const payload=writer.compile(prompt);
const topic=payload.task.chapters.year_2027.topics.new_triad;
assert.deepEqual(topic.citableFacts.map(x=>x.id),[triad.REF]);
assert.equal(topic.sourceOwnedAnnualTriad.groupBranches,actual.match.groupBranches);
const schema=writer.schema(prompt,wire.schemaFor(prompt,require('./report-schema.json')));
const optional=schema.properties.chapters.properties.year_2027.properties.paragraphs.properties.new_triad;
assert(optional.anyOf.some(x=>x.type==='null'),'optional evidence must not force filler');
const leaf=optional.anyOf.find(x=>x.type==='object');
assert.deepEqual(leaf.properties.basis.properties.refs.items.enum,[triad.REF]);
assert.deepEqual(leaf.properties.basis.properties.condition.enum,[actual.match.computedCondition]);
const paragraph={label:'2027년에 갖춰지는 세 자리',text:'태어날 당시에는 두 자리만 갖춰졌지만 2027년 지지가 더해지며 전통 관계표의 세 글자가 모입니다. 이 계산만으로 실제 사건이나 좋은 해가 생긴다고 말할 수 없습니다.',
 basis:{refs:[triad.REF],condition:actual.match.computedCondition,
 interpretation:'새로운 2027년 지지가 기존 두 위치에 더해져 세 자리가 완성됩니다.',
 limit:'합화, 실현된 변화나 길흉은 확인되지 않았습니다.'}};
const response=p=>({chapters:{year_2027:{paragraphs:{new_triad:p}}}});
assert.doesNotThrow(()=>writer.restoreEvidence(response(paragraph),prompt));
const invalid=structuredClone(paragraph);invalid.basis.condition='2027년에 좋은 일이 생깁니다.';
assert.throws(()=>writer.restoreEvidence(response(invalid),prompt),/annual triad evidence missing/);
const wrongRef=structuredClone(paragraph);wrongRef.basis.refs=['facts.annualTenGods'];
assert.throws(()=>writer.restoreEvidence(response(wrongRef),prompt),/unrelated paragraph basis|annual triad evidence missing/);
console.log('PASS annual 2027 triad real chart, source lock, optional schema and unsafe claims rejected; samples='+seen+'; zero paid calls');
