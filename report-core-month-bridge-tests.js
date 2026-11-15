'use strict';
// Relation direction oracle over REAL calendar charts; no paid API calls.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const contrast=require('./report-chart-contrast');
const bridge=require('./report-core-month-bridge');
const engine=require('./report-core-knowledge-engine');
const coverage=require('./report-core-knowledge-coverage');
const expected={
 'same-element':{arrow:'parallel',reading:'같은 오행'},
 'hidden-generates-visible':{arrow:'hidden-to-visible',reading:'속글자 오행이 겉글자 오행을 생'},
 'visible-generates-hidden':{arrow:'visible-to-hidden',reading:'겉글자 오행이 대표 속글자 오행을 생'},
 'hidden-controls-visible':{arrow:'hidden-to-visible',reading:'속글자 오행이 겉글자 오행을 극'},
 'visible-controls-hidden':{arrow:'visible-to-hidden',reading:'겉글자 오행이 대표 속글자 오행을 극'}
};
const found=new Map();
for(const input of coverage.representativeInputs()){
 const packet=facts.build(input,2027);
 if(packet.status!=='ready')continue;
 const output=engine.compile(packet);
 const source=contrast.build(packet).monthTenGodContext;
 const selected=bridge.build(packet,source);
 const kind=selected.classification.kind;
 if(!found.has(kind))found.set(kind,{packet,source,selected});
 assert.equal(selected.visible.sourceId,'natal.month.stem');
 assert.equal(selected.hidden.sourceId,
  'natal.month.hidden.'+packet.facts.structuralEvidence.monthCommand.mainHiddenStem);
 assert.equal(selected.visible.tenGod,output.scope.visibleTenGod);
 assert.equal(selected.hidden.tenGod,output.scope.hiddenTenGod);
 assert.equal(selected.classification.sameTenGod,
  selected.visible.tenGod===selected.hidden.tenGod);
 assert.equal(selected.status,'internal-editorial-relationship-only');
 assert.equal(selected.customerReady,false);
 assert.equal(selected.releaseVerdict,'not-approved');
 assert.equal(selected.apiCalls,0);
 assert.deepEqual(selected.sourceRefs,output.compositionPlan.editorialOutline.monthBridge.sourceRefs);
 assert.equal(selected.classification.arrow,expected[kind].arrow);
 assert(selected.relationStatement.includes(expected[kind].reading));
}
assert.deepEqual([...found.keys()].sort(),Object.keys(expected).sort(),
 'the frozen QA dates should contain all five five-element directions');
const b=found.get('hidden-generates-visible');
const broken=structuredClone(b.source);
broken.elementLink.kind='visible-generates-hidden';
assert.throws(()=>bridge.build(b.packet,broken),/CORE_BRIDGE_DIRECTION_MISMATCH/);
const falseGod=structuredClone(b.packet);
falseGod.facts.tenGods.month.stemTenGod=b.source.monthStem.tenGod==='상관'?'정관':'상관';
assert.throws(()=>bridge.build(falseGod,b.source),/CORE_BRIDGE_MONTH_PROVENANCE_MISMATCH/);
const falseSeason=structuredClone(b.packet);
falseSeason.facts.seasonalEvidence.monthSeason='spring';
assert.throws(()=>bridge.build(falseSeason,b.source),/CORE_BRIDGE_MONTH_PROVENANCE_MISMATCH/);
const same=found.get('same-element').selected;
assert.equal(same.classification.arrow,'parallel');
const cases=found.get('visible-generates-hidden');
const newYear=structuredClone(cases.packet);
newYear.person.mbti='ENTP';
newYear.facts.annualTenGods.stemTenGod='편관';
assert.deepEqual(bridge.build(newYear,cases.source),cases.selected,
 'only natal positions can change a positional symbolic bridge');
const unknownHour=facts.build({calendar:'lunar',birthDate:'1982-11-24',
 unknownBirthTime:true,birthTime:'',mbti:'ISFP',gender:'male'},2027);
const knownHour=facts.build({calendar:'lunar',birthDate:'1982-11-24',
 birthTime:'14:20',mbti:'ISFP',gender:'male'},2027);
assert.deepEqual(bridge.build(unknownHour,contrast.build(unknownHour).monthTenGodContext),
 bridge.build(knownHour,contrast.build(knownHour).monthTenGodContext),
 'a month-only bridge must not invent any hour-specific conclusion');
console.log('PASS five independently sourced month-element directions across '+
 coverage.representativeInputs().length+' fixed cases; internal only, no paid API');
