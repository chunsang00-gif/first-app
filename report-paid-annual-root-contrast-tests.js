'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const roots=require('./report-root-conditions');
const reader=require('./report-paid-annual-root-contrast');
const guidance=require('./report-analysis-guidance');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
// Real calculated root sources: one year-branch 丑 clashes with 2027 未,
// the other month-branch 巳 is a different same-element stem source.
const chart={year:'甲丑',month:'乙巳',day:'庚寅',hour:'丙子'};
const synthetic={chart,targetYear:{year:2027,pillar:'丁未'},
 facts:{rootConditions:roots.build(chart,'丁未')}};
const proof=reader.candidate(synthetic);
assert(proof,'two distinct metal roots with only the year root clashed qualify');
assert.equal(proof.collidedPosition,'year');
assert.equal(proof.alternativePosition,'month');
assert.equal(proof.rootErased,false);
assert.equal(proof.strengthMeasured,false);
const corrupted=structuredClone(synthetic);
corrupted.facts.rootConditions.dayMasterRootCases[0].rootPosition='hour';
assert.equal(reader.candidate(corrupted),null,'forged root position is rejected');
const wrongYear=structuredClone(synthetic);wrongYear.targetYear.year=2026;
assert.equal(reader.candidate(wrongYear),null,'annual analysis must be 2027');
const noAlternative={chart:{year:'甲丑',month:'乙卯',day:'庚寅',hour:'丁子'},targetYear:{year:2027,pillar:'丁未'}};
noAlternative.facts={rootConditions:roots.build(noAlternative.chart,'丁未')};
assert.equal(reader.candidate(noAlternative),null,'one clashed root alone is not an independent comparison');
let actual=null,examined=0;
outer: for(const year of [1985,1997,2009,2021])for(let month=2;month<=11;month++){
 for(const day of [5,15,25])for(const birthTime of ['08:20','16:20','20:20']){
  const packet=facts.build({calendar:'solar',birthDate:year+'-'+String(month).padStart(2,'0')+'-'+String(day).padStart(2,'0'),
   birthTime,gender:'male',mbti:'ISFP'},2027);
  examined++;
  if(packet.status!=='ready')continue;
  const result=reader.candidate(packet);
  if(result){actual={packet,result};break outer}
 }
}
assert(actual,'an actual calendar-calculated chart must qualify; no synthetic-only feature');
const plan=guidance.preflight(actual.packet);
assert.deepEqual(require('./report-interpretation-invariants').verify(actual.packet,plan).errors,[],
 'the real pre-billing source policy must authorize only the verified root comparison');
const task=plan.year_2027.topicTasks.root_contrast;
assert.equal(task.mode,'use-primary');
assert.deepEqual(task.allowedSourceRefs,[reader.REF]);
assert.equal(task.sourceOwnedAnnualRootContrast.computedCondition,actual.result.computedCondition);
const prompt={stage:'body',facts:actual.packet,requestedSections:['year_2027'],priorSections:[],
 rules:{sectionGoals:require('./report-prompt').sectionGoals},
 analysisGuidance:{...guidance.forRequest(['year_2027'],actual.packet.person.mbti),
 editorialBlueprint:{year_2027:plan.year_2027}}};
const payload=writer.compile(prompt),topic=payload.task.chapters.year_2027.topics.root_contrast;
assert.deepEqual(topic.citableFacts.map(x=>x.id),[reader.REF]);
assert.equal(topic.sourceOwnedAnnualRootContrast.collidedRootId,actual.result.collidedRootId);
const schema=writer.schema(prompt,wire.schemaFor(prompt,require('./report-schema.json')));
const field=schema.properties.chapters.properties.year_2027.properties.paragraphs.properties.root_contrast;
assert(field.anyOf.some(x=>x.type==='null'),'no forced fictional paragraph');
const leaf=field.anyOf.find(x=>x.type==='object');
assert.deepEqual(leaf.properties.basis.properties.refs.items.enum,[reader.REF]);
assert.deepEqual(leaf.properties.basis.properties.condition.enum,[actual.result.computedCondition]);
const paragraph={label:'2027년 충과 두 뿌리 자리',text:'태어날 때 같은 오행을 품은 두 위치가 있지만 2027년 지지가 충을 맺는 자리는 한 곳입니다. 나머지 위치를 같은 충으로 설명할 근거는 없습니다. 이는 운이나 힘의 크기를 확정하는 이야기가 아닙니다.',
 basis:{refs:[reader.REF],condition:actual.result.computedCondition,
 interpretation:'두 위치가 같은 오행의 출처를 품지만 한 자리만 세운 충의 상대입니다.',
 limit:'실제 신강약·합화·능력·결과는 계산으로 판정되지 않았습니다.'}};
const response=p=>({chapters:{year_2027:{paragraphs:{root_contrast:p}}}});
const restored=writer.restoreEvidence(response(paragraph),prompt);
const actualEvidence=restored.chapters.year_2027.evidence;
assert.equal(actualEvidence.length,1);
assert.deepEqual(require('./report-source-ledger').usedPaths({
 evidence:actualEvidence},'root_contrast'),[reader.REF],
 'the real restored provider output must preserve the source ID in the citation ledger');
const repeated={
 id:'year_2027',bodyTopics:['root_contrast','impact'],
 body:[paragraph.text,'2027년 세운의 충은 숨은 글자가 있는 한 위치에만 걸리므로 다른 위치의 뿌리와 구분됩니다.'],
 evidence:[actualEvidence[0],
  'impact: facts.rootConditions / 해석: 2027년 충과 뿌리 / 조건: 실제 다른 위치 / 한계: 강약 미판정']
};
assert(require('./report-interpretation-overlap').inspect([repeated])
 .some(x=>x.includes('annual-clash-vs-other-day-root')),
 'actual paid response evidence must trigger same-chapter duplicate interpretation rejection');
const altered=structuredClone(paragraph);altered.basis.condition='충으로 뿌리가 사라져 운세가 약합니다.';
assert.throws(()=>writer.restoreEvidence(response(altered),prompt),/annual root contrast evidence missing/);
const wrong=structuredClone(paragraph);wrong.basis.refs=['facts.annualTenGods'];
assert.throws(()=>writer.restoreEvidence(response(wrong),prompt),/unrelated paragraph basis|annual root contrast evidence missing/);
console.log('PASS chart-specific annual root contrast, alternative root, strict provider schema; samples='+examined+'; no paid calls');
