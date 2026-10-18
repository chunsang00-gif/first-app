'use strict';
const assert=require('node:assert/strict');
const root=require('./report-root-conditions');
const links=require('./report-stem-connections');
const facts=require('./report-facts-node');
const integrity=require('./report-calculation-integrity');
const guidance=require('./report-analysis-guidance');
const invariant=require('./report-interpretation-invariants');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const schema=require('./report-schema.json');

// A same-element root is NOT deleted by natal or 2027 branch clash.
// Synthetic pillars here test POSITIONAL tables; no claim about an actual person.
const chart={year:'辛丑',month:'乙未',day:'己未',hour:'癸丑'};
const proof=root.build(chart,'丁未');
const connections=links.build(chart);
assert.equal(proof.version,'root-conditions-v1');
assert.equal(proof.rootDeletionPolicy,'never-infer-erasure-from-clash-alone');
assert.equal(proof.monthClashDoesNotRemoveBirthSeason,true);
assert.equal(proof.strengthVerdict,'not-assessed');
assert.equal(proof.usefulGodVerdict,'not-assessed');
assert.equal(proof.quantitativeEffect,'not-computed');
assert(proof.rootCases.length>0);
for(const item of proof.rootCases){
 assert(connections.rooting.some(v=>v.visibleId===item.visibleId&&
  v.sameElementRoots.some(x=>x.hiddenId===item.rootId)));
 assert.equal(item.existence,'observed-hidden-stem');
 assert.equal(item.remainingRootAvailability,'not-assessed');
 assert.equal(item.canDeleteRootForClash,false);
 assert.equal(item.transformation,'not-assessed');
 assert.equal(item.seasonalContext.actualRootQiStrength,'not-assessed');
}
const natalAndAnnual=proof.dayMasterRootCases.find(x=>x.rootPosition==='year'&&x.rootStem==='己');
assert(natalAndAnnual,'must identify the same-earth year-branch root');
assert(natalAndAnnual.natal.hasDirectClash,'natal 丑未 clash is present');
assert(natalAndAnnual.year.hasDirectClash,'2027 未 directly clashes with natal 丑');
assert(natalAndAnnual.natal.clashes.every(x=>x.positions.includes('year')));
assert(natalAndAnnual.year.clashes.every(x=>x.between==='year'));
assert(natalAndAnnual.alternativeRootIds.length>0,
 'other natal roots remain recorded, not silently cancelled');
const month=proof.dayMasterRootCases.find(x=>x.rootPosition==='month');
assert(month.natal.hasDirectClash);
assert.equal(month.year.hasDirectClash,false,
 'the same 未 as 2027 is not a fabricated clash');
assert.equal(month.seasonalContext.monthPhase,'transition');
assert.equal(month.seasonalContext.dominantElement,null);
const noHour=root.build({...chart,hour:null},'丁未');
assert.equal(noHour.unknownBirthHour,true);
assert(noHour.rootCases.every(x=>x.rootPosition!=='hour'&&x.visiblePosition!=='hour'));
assert(noHour.rootCases.every(x=>x.remainingRootAvailability==='not-assessed'));
assert.throws(()=>root.build(chart,''),/requires/);

const cases=[
 {calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'1990-05-15',birthTime:'10:30',gender:'male',mbti:'INTJ'},
 {calendar:'solar',birthDate:'2001-11-03',unknownBirthTime:true,gender:'male',mbti:'모름'},
 {calendar:'lunar',birthDate:'1995-05-12',birthTime:'14:20',gender:'female',mbti:'ISTJ'}
];
for(const input of cases){
 const packet=facts.build(input,2027);
 assert.equal(packet.status,'ready',input.birthDate);
 assert.deepEqual(packet.facts.rootConditions,root.build(packet.chart,packet.targetYear.pillar));
 assert.deepEqual(integrity.verify(packet).errors,[],input.birthDate);
 const plan=guidance.preflight(packet);
 assert(invariant.verify(packet,plan).pass,'root interpretation preflight must be consistent');
 const topic=plan.saju_core.topicTasks.strength;
 assert(topic.requiredSourceKinds.includes('month-ten-god'));
 const prompt={stage:'body',facts:packet,requestedSections:['saju_core'],
  analysisGuidance:{...guidance.forRequest(['saju_core'],packet.person.mbti),
   editorialBlueprint:{saju_core:plan.saju_core}}};
 const compiled=writer.compile(prompt);
 // Full root and clash information stays in the original verified packet.
 // The current first chapter is about the month categories, so its
 // provider input must not expose unrelated root diagnostics.
 assert(!Object.hasOwn(compiled.source,'facts.rootConditions')&&
  !Object.hasOwn(compiled.source,'facts.stemConnections'));
 assert.equal(packet.facts.rootConditions.version,
  root.build(packet.chart,packet.targetYear.pillar).version);
 assert(Array.isArray(packet.facts.rootConditions.dayMasterRootCases),
  'full root-condition cases remain calculated and available for integrity review');
 const slots=writer.schema(prompt,wire.schemaFor(prompt,schema))
  .properties.chapters.properties.saju_core.properties.paragraphs.properties;
 const enums=(slots.strength.anyOf?.find(x=>x.type==='object')||slots.strength)
  .properties.basis.properties.refs.items.enum;
 assert(!enums.includes('facts.rootConditions')&&!enums.includes('facts.stemConnections'),
  'real paid first chapter must not expose optional root/clash sources in ten-god text');
 assert(!slots.temperament.anyOf.find(x=>x.type==='object').properties.basis.properties.refs.items.enum.includes('facts.rootConditions'),
  'root conditions must not leak into seasonal paragraph');
 const paragraph=refs=>({basis:{refs,interpretation:'원국과 세운의 지지 관계 위치를 비교합니다.',
  condition:'각 천간과 지장간의 위치 확인',limit:'뿌리의 실제 강도와 소멸 여부는 확정할 수 없습니다.'},
  label:'뿌리와 충',text:'뿌리의 존재와 충 관계를 구별합니다.'});
 const fake=refs=>({chapters:{saju_core:{title:'명리의 기초',
  keyJudgment:'근거 위치 구분',mood:'reflective',
  paragraphs:{temperament:paragraph(['facts.seasonalEvidence','facts.qiEvidence','natal.month.stem']),
   strength:paragraph(refs)}}}});
 const mainMonth='natal.month.hidden.'+compiled.source['facts.structuralEvidence.monthCommand'].mainHiddenStem;
 const required=['natal.month.stem',mainMonth];
 assert.doesNotThrow(()=>writer.restoreEvidence(fake(required),prompt),
  'a valid month ten-god comparison should not need root provenance');
 assert.throws(()=>writer.restoreEvidence(fake(required.filter(id=>id!==mainMonth)),prompt),
  /missing paired month ten-god citations/,
  'one month classification cannot substantiate a pair comparison');
 for(const rootSource of ['facts.rootConditions','facts.stemConnections',
  'facts.structuralEvidence.dayMasterRoots']){
  assert.throws(()=>writer.restoreEvidence(fake([...required,rootSource]),prompt),
   /missing verified paragraph basis|unrelated paragraph basis/,
   'real root calculations stay verified but cannot be cited for unrelated month question');
 }
 const modified=structuredClone(packet);
 modified.facts.rootConditions.rootDeletionPolicy='clash-erases-root';
 assert(integrity.verify(modified).errors.includes('incorrect-positional-root-conditions'));
 assert(invariant.verify(modified,plan).errors.includes('calculated-root-condition-mismatch'));
 const altered=structuredClone(plan);
 altered.saju_core.topicTasks.strength.requiredSourceKinds=
  altered.saju_core.topicTasks.strength.requiredSourceKinds.filter(x=>x!=='month-ten-god');
 assert(invariant.verify(packet,altered).errors.includes('missing-canonical-month-ten-god-topic-requirement'));
}
console.log('PASS natal/annual root-clash source separation, no erasure, no strength scores, real input integrity and required paid citations; zero paid API');
