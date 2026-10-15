'use strict';
const assert=require('node:assert/strict');
const season=require('./report-seasonal-evidence');
const facts=require('./report-facts-node');
const integrity=require('./report-calculation-integrity');
const guidance=require('./report-analysis-guidance');
const generation=require('./report-generation-request');
const wire=require('./report-wire');
const schema=require('./report-schema.json');
const chart=(month,day='甲子',hour='庚申')=>({year:'甲寅',month:'乙'+month,day,hour});
const spring=season.evaluate(chart('卯'));
assert.equal(spring.monthSeason,'spring');
assert.equal(spring.monthPhase,'core');
assert.equal(spring.coreSeasonElement,'wood');
assert.equal(spring.dayElement,'wood');
assert.equal(spring.seasonToDayRelation,'same-element');
assert.equal(spring.directSeasonalSupport,true);
assert(spring.monthlyRoots.some(r=>r.stem==='乙'&&r.layer==='main'));
assert(spring.roots.some(r=>r.position==='year'&&r.stem==='甲'));
assert.equal(spring.strengthVerdict,'not-assessed');
assert.equal(spring.usefulGodVerdict,'not-assessed');
const autumn=season.evaluate(chart('酉'));
assert.equal(autumn.monthSeason,'autumn');
assert.equal(autumn.seasonToDayRelation,'control-on-day');
assert.equal(autumn.directSeasonalSupport,false);
assert.deepEqual(autumn.monthlyRoots,[]);
const winter=season.evaluate(chart('子'));
assert.equal(winter.seasonToDayRelation,'resource');
assert.equal(winter.directSeasonalSupport,true);
const summer=season.evaluate(chart('午'));
assert.equal(summer.seasonToDayRelation,'output');
assert.equal(summer.directSeasonalSupport,false);
for(const branch of ['辰','未','戌','丑']){
 const p=season.evaluate(chart(branch));
 assert.equal(p.monthPhase,'transition');
 assert.equal(p.coreSeasonElement,null);
 assert.equal(p.directSeasonalSupport,null,'transition month cannot be a forced strength claim');
 assert.equal(p.seasonToDayRelation,'transitional-month-unresolved');
 assert.equal(p.monthMainQiElement,'earth');
}
const transitional=season.evaluate(chart('辰'));
assert(transitional.monthlyRoots.some(r=>r.stem==='乙'&&r.layer==='secondary'));
assert.deepEqual(season.evaluate(chart('卯','甲子',null)).visible.map(v=>v.position),['year','month']);
for(const branch of Object.keys(season.MONTH))
 assert.equal(season.evaluate(chart(branch)).monthBranch,branch);
assert.throws(()=>season.evaluate({year:'甲寅',month:'乙?',day:'甲子'}),/required/);
assert.equal(season.relation('earth','wood'),'day-controls');
assert.equal(season.relation('fire','wood'),'output');

// Calendar-backed test: the exact same derived context travels from facts,
// through integrity preflight and the strictly narrowed provider schema.
const actualCases=[
 {calendar:'solar',birthDate:'1990-05-15',birthTime:'10:30',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'1982-11-24',birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'2001-11-03',unknownBirthTime:true,gender:'male',mbti:'모름'},
 {calendar:'lunar',birthDate:'1995-05-12',birthTime:'14:20',gender:'female',mbti:'INTJ'}
];
for(const input of actualCases){
 const packet=facts.build(input,2027);
 assert.equal(packet.status,'ready',input.birthDate);
 const expected=season.evaluate(packet.chart);
 assert.deepEqual(packet.facts.seasonalEvidence,expected);
 assert.equal(integrity.verify(packet).pass,true,'calculation integrity: '+input.birthDate);
 assert.equal(packet.facts.targetYearBranchContext.monthlyContext.monthPhase,expected.monthPhase);
 assert.equal(packet.facts.targetYearBranchContext.monthlyContext.seasonToDayRelation,expected.seasonToDayRelation);
 const blueprint=guidance.preflight(packet);
 const t=blueprint.saju_core.topicTasks.temperament;
 assert.equal(t.mode,'use-primary');
 assert.deepEqual(t.requiredSourceKinds,['seasonal']);
 const prompt={stage:'body',facts:packet,requestedSections:['saju_core'],
  analysisGuidance:{...guidance.forRequest(['saju_core'],packet.person.mbti),
   editorialBlueprint:{saju_core:blueprint.saju_core}}};
 const task=generation.compile(prompt);
 assert.deepEqual(task.source['facts.seasonalEvidence'],expected);
 const s=generation.schema(prompt,wire.schemaFor(prompt,schema));
 const refs=s.properties.chapters.properties.saju_core.properties.paragraphs.properties.temperament
  .properties.basis.properties.refs.items.enum;
 assert(refs.includes('facts.seasonalEvidence'),'season must be an allowed provider reference');
 const build=(refs)=>({chapters:{saju_core:{title:'기본 풀이',keyJudgment:'계산된 계절의 역할',
  mood:'reflective',paragraphs:{temperament:{
   basis:{refs,interpretation:'월지의 계절을 일간과 비교',condition:'전환월은 따로 확인',
    limit:'강약의 전체 결론은 알 수 없음'},
   label:'월령과 계절',text:'월지와 일간의 관계는 계절 맥락에서 설명합니다.'},
   strength:null}}}});
 assert.doesNotThrow(()=>generation.restoreEvidence(build(['facts.seasonalEvidence']),prompt));
 assert.throws(()=>generation.restoreEvidence(build(['facts.structuralEvidence.monthCommand']),prompt),
  /missing required month seasonal source/);
 const tampered=structuredClone(packet);
 tampered.facts.seasonalEvidence.monthPhase=expected.monthPhase==='core'?'transition':'core';
 assert(integrity.verify(tampered).errors.includes('incorrect-monthly-seasonal-evidence'));
}
console.log('PASS all 12 month branches, seasonal transition/root classification, real calendar inputs and required paid provider provenance; 0 paid calls');
