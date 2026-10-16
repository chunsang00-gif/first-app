'use strict';
const assert=require('node:assert/strict');
const links=require('./report-stem-connections');
const facts=require('./report-facts-node');
const sourceRows=require('./report-fact-bindings');
const integrity=require('./report-calculation-integrity');
const guidance=require('./report-analysis-guidance');
const invariant=require('./report-interpretation-invariants');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const schema=require('./report-schema.json');
const chart={year:'甲寅',month:'乙卯',day:'甲子',hour:'辛酉'};
const graph=links.build(chart);
const expose=id=>graph.exposure.find(x=>x.hiddenId===id);
const roots=id=>graph.rooting.find(x=>x.visibleId===id);
assert(graph.dayMasterRooting&&graph.dayMasterRooting.role==='day-master');
assert.equal(graph.dayMasterRooting.visibleId,'natal.day.stem');
assert.deepEqual(expose('natal.year.hidden.甲').exactVisibleMatches.map(x=>x.id),
 ['natal.year.stem','natal.day.stem']);
assert.equal(expose('natal.year.hidden.甲').exactExposure,true);
assert.equal(expose('natal.month.hidden.乙').exactVisibleMatches[0].id,'natal.month.stem');
assert.equal(expose('natal.hour.hidden.辛').exactVisibleMatches[0].samePillar,true);
assert.equal(expose('natal.day.hidden.癸').exactExposure,false);
assert.equal(expose('natal.day.hidden.癸').exposureStatus,'not-found-in-known-stems');
assert.deepEqual(roots('natal.month.stem').exactStemRootIds,['natal.month.hidden.乙']);
assert(roots('natal.month.stem').sameElementOtherStemRootIds.includes('natal.year.hidden.甲'),
 'same-element roots do not imply exact heavenly/hidden stem identity');
assert.equal(roots('natal.hour.stem').sameElementRoots[0].samePillar,true);
assert.equal(roots('natal.year.stem').sameElementRoots.some(x=>x.type==='same-element-different-stem'),true);
assert.equal(graph.sourcePolicy.strength,'not-assessed');
assert.equal(graph.finalStrengthVerdict,'not-assessed');
assert(!Object.hasOwn(graph,'rootWeight'));
const missing=links.build({...chart,hour:null});
assert(missing.hiddenHourMayChangeFindings);
assert.equal(missing.sourcePolicy.hourPolicy,'unknown-hour-limits-negative-findings');
assert(missing.exposure.every(x=>!x.hiddenId.startsWith('natal.hour.')));
assert(missing.rooting.every(x=>!x.visibleId.startsWith('natal.hour.')));
assert.equal(missing.exposure.find(x=>x.hiddenId==='natal.day.hidden.癸').exposureStatus,
 'unobserved-hour-not-excluded');
assert.throws(()=>links.build({...chart,month:'乙?'}),/Invalid/);

for(const input of [
 {calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'1990-05-15',birthTime:'10:30',gender:'male',mbti:'INTJ'},
 {calendar:'solar',birthDate:'2001-11-03',unknownBirthTime:true,gender:'male',mbti:'모름'},
 {calendar:'lunar',birthDate:'1995-05-12',birthTime:'14:20',gender:'female',mbti:'ISTJ'}
]){
 const packet=facts.build(input,2027);
 assert.equal(packet.status,'ready');
 const exact=links.build(packet.chart);
 assert.deepEqual(packet.facts.stemConnections,exact);
 assert.equal(integrity.verify(packet).pass,true,input.birthDate);
 const rows=new Map(sourceRows.build(packet).map(x=>[x.id,x]));
 for(const record of exact.exposure){
  assert(rows.has(record.hiddenId),record.hiddenId);
  for(const entry of record.exactVisibleMatches){
   assert(rows.has(entry.id),entry.id);
   assert.equal(rows.get(record.hiddenId).stem,rows.get(entry.id).stem);
  }
 }
 for(const entry of exact.rooting){
  assert(rows.has(entry.visibleId),entry.visibleId);
  for(const root of entry.sameElementRoots){
   assert(rows.has(root.hiddenId));
   if(root.type==='exact-stem')assert.equal(rows.get(entry.visibleId).stem,root.hiddenStem);
   else assert.notEqual(rows.get(entry.visibleId).stem,root.hiddenStem);
  }
 }
 const blueprint=guidance.preflight(packet);
 assert(invariant.verify(packet,blueprint).pass);
 assert.deepEqual(blueprint.saju_core.topicTasks.temperament.requiredSourceKinds,
  ['seasonal','qi-ledger','natal-month-position']);
 assert(blueprint.saju_core.topicTasks.strength.requiredSourceKinds.includes('month-ten-god'));
 const prompt={stage:'body',facts:packet,requestedSections:['saju_core'],
  analysisGuidance:{...guidance.forRequest(['saju_core'],packet.person.mbti),
   editorialBlueprint:{saju_core:blueprint.saju_core}}};
 const payload=writer.compile(prompt);
 assert.deepEqual(payload.source['facts.stemConnections'],exact);
 const outputSchema=writer.schema(prompt,wire.schemaFor(prompt,schema));
 const slots=outputSchema.properties.chapters.properties.saju_core.properties.paragraphs.properties;
 const seasonRefs=slots.temperament.properties.basis.properties.refs.items.enum;
 const strengthRefs=(slots.strength.anyOf?.find(x=>x.type==='object')||slots.strength)
  .properties.basis.properties.refs.items.enum;
 assert(!seasonRefs.includes('facts.stemConnections'));
 assert(!strengthRefs.includes('facts.stemConnections')&&!strengthRefs.includes('facts.rootConditions')&&
  !strengthRefs.includes('facts.structuralEvidence.dayMasterRoots'),
  'paid first chapter must not invite the incomplete optional root evidence seen in real QA');
 const observed=payload.source['facts.stemConnections'].dayMasterRooting.sameElementRoots;
 const monthHidden='natal.month.hidden.'+payload.source['facts.structuralEvidence.monthCommand'].mainHiddenStem;
 const required=['natal.month.stem',monthHidden,'facts.structuralEvidence.monthCommand'];
 const forbidden=['facts.stemConnections','facts.structuralEvidence.dayMasterRoots',
  'facts.rootConditions',...observed.map(x=>x.hiddenId)
   .filter(x=>!x.startsWith('natal.month.'))];
 const report=(refs)=>({chapters:{saju_core:{title:'출생 근거',keyJudgment:'천간과 지장간 근거',
  mood:'reflective',paragraphs:{
   temperament:{label:'월간과 계절',text:'계절과 겉에 나타난 글자를 구별합니다.',
    basis:{refs:['facts.seasonalEvidence','facts.qiEvidence','natal.month.stem'],
     interpretation:'계절 맥락',condition:'출생 시기',limit:'성격 단정 금지'}},
   strength:{label:'뿌리의 실제 위치',text:'실제 지장간 뿌리 위치와 관계를 구별합니다.',
    basis:{refs,interpretation:'전통적 뿌리',condition:'태어난 글자',
     limit:'능력이나 강약은 판단하지 않습니다.'}}}}}});
 assert.doesNotThrow(()=>writer.restoreEvidence(report(required),prompt));
 for(const ref of forbidden){
  assert.throws(()=>writer.restoreEvidence(report([...required,ref]),prompt),
   /unrelated paragraph basis/,
   'the current customer paragraph cannot cite the unrelated root source: '+ref);
 }
 const tampered=structuredClone(packet);
 tampered.facts.stemConnections.dayMasterRooting.rootObservationStatus='fabricated-strong-root';
 assert(integrity.verify(tampered).errors.includes('incorrect-stem-connections'));
 assert(invariant.verify(tampered,blueprint).errors.includes('calculated-stem-connection-mismatch'));
 assert(!Object.hasOwn(payload.source,'facts.governingDayDiagnostic'));
 assert(payload.source['facts.rootConditions'].dayMasterRootCases);
 const flawed=structuredClone(blueprint);
 flawed.saju_core.topicTasks.strength.requiredSourceKinds=['root-condition'];
 assert(invariant.verify(packet,flawed).errors.includes('missing-canonical-month-ten-god-topic-requirement'));
 if(input.unknownBirthTime){
  assert(packet.facts.stemConnections.hiddenHourMayChangeFindings);
  assert(!packet.facts.stemConnections.rooting.some(x=>x.visiblePosition==='hour'));
 }
}
console.log('PASS exact 투간 vs same-element 통근, source-bound pillar links, missing-hour limits and paid-model citation refusal; 0 API calls');
