'use strict';
// Foundational contract: exact position > elemental direction > unknown qi
// effectiveness. A symbolic row cannot turn into a numeric strength estimate.
const assert=require('node:assert/strict');
const qi=require('./report-qi-evidence');
const seasonal=require('./report-seasonal-evidence');
const facts=require('./report-facts-node');
const integrity=require('./report-calculation-integrity');
const guidance=require('./report-analysis-guidance');
const binding=require('./report-fact-bindings');
const invariant=require('./report-interpretation-invariants');
const generation=require('./report-generation-request');
const wire=require('./report-wire');
const schema=require('./report-schema.json');
const chart={year:'甲寅',month:'庚申',day:'甲子',hour:'癸亥'};
const ledger=qi.build(chart);
assert.equal(ledger.dayStem,'甲');
assert.equal(ledger.dayElement,'wood');
assert.equal(ledger.strengthVerdict,'not-assessed');
assert.equal(ledger.usefulGodVerdict,'not-assessed');
assert.equal(ledger.governance.monthMainHiddenStem,'庚');
assert.equal(ledger.governance.activeHiddenStemId,null);
assert.equal(ledger.governance.activeHiddenStemStatus,'unresolved');
assert.equal(ledger.governance.preciseSolarTermElapsedTime,'not-calculated');
assert.equal(ledger.governance.hiddenStemGoverningDaysRule,'not-selected');
const source=id=>ledger.entries.find(e=>e.id===id);
assert.equal(source('natal.year.stem').category,'peer');
assert.equal(source('natal.year.hidden.甲').sameElementRoot,true);
assert.equal(source('natal.year.hidden.丙').category,'output');
assert.equal(source('natal.year.hidden.戊').category,'wealth');
assert.equal(source('natal.month.stem').category,'authority');
assert.equal(source('natal.month.hidden.庚').category,'authority');
assert.equal(source('natal.month.hidden.壬').category,'resource');
assert.equal(source('natal.day.hidden.癸').category,'resource');
assert.equal(source('natal.day.hidden.癸').sameElementRoot,false);
assert.equal(source('natal.hour.stem').category,'resource');
assert.equal(source('natal.hour.hidden.甲').sameElementRoot,true);
assert.equal(source('natal.hour.hidden.甲').layer,'secondary');
assert(!source('natal.day.stem'),'the day stem is reference, not a fake supporting source');
assert.deepEqual(ledger.roots.map(e=>e.id),['natal.year.hidden.甲','natal.hour.hidden.甲']);
assert(ledger.byDirection.support.includes('natal.day.hidden.癸'),'Resource support is not a same-element root');
assert(ledger.byDirection.output.includes('natal.year.hidden.丙'));
assert(ledger.byDirection.wealth.includes('natal.year.hidden.戊'));
assert(ledger.byDirection.authority.includes('natal.month.stem'));
assert(!Object.hasOwn(ledger,'strengthScore'),'do not turn stem counts into personal strength percentages');
for(const row of ledger.entries){
 assert.equal(row.effectiveStrength,'not-assessed');
 assert.equal(row.observed,'calculated-symbol');
}
for(const branch of Object.keys(seasonal.MONTH)){
 const monthly=qi.build({...chart,month:'庚'+branch});
 assert.equal(monthly.governance.hiddenStemCandidates.length,seasonal.HIDDEN[branch].length);
 assert.equal(monthly.governance.activeHiddenStemId,null);
 assert.equal(monthly.governance.monthMainHiddenStem,seasonal.HIDDEN[branch][0]);
}
for(const stem of Object.keys(seasonal.ELEMENTS)){
 const variant=qi.build({...chart,day:stem+'子'});
 const allowed=['peer','resource','output','wealth','authority'];
 assert(variant.entries.every(row=>allowed.includes(row.category)));
 assert.equal(variant.entries.length,new Set(variant.entries.map(x=>x.id)).size);
}
const noHour=qi.build({...chart,hour:null});
assert(noHour.entries.every(x=>x.position!=='hour'));
assert(noHour.roots.every(x=>x.position!=='hour'));
assert.throws(()=>qi.build({...chart,month:'庚?'}),/required|Invalid/);

for(const input of [
 {calendar:'solar',birthDate:'1982-11-24',birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'1990-05-15',birthTime:'10:30',gender:'male',mbti:'INTJ'},
 {calendar:'solar',birthDate:'2001-11-03',unknownBirthTime:true,gender:'male',mbti:'모름'},
 {calendar:'lunar',birthDate:'1995-05-12',birthTime:'14:20',gender:'female',mbti:'ISTJ'}
]){
 const packet=facts.build(input,2027);
 assert.equal(packet.status,'ready');
 assert.deepEqual(packet.facts.qiEvidence,qi.build(packet.chart,packet.facts.solarTermTiming));
 const sourceRows=binding.build(packet);
 const sourceIds=new Map(sourceRows.map(row=>[row.id,row]));
 for(const row of packet.facts.qiEvidence.entries){
  const actual=sourceIds.get(row.id);
  assert(actual,'ledger must never contain unbound source ID '+row.id);
  assert.equal(actual.stem,row.stem,'ledger may not move another stem into '+row.id);
  assert(actual.tenGod,'ten-god classification must exist for positional stem '+row.id);
 }
 assert(!packet.facts.qiEvidence.entries.some(x=>x.id==='natal.day.stem'),
  'the day stem anchors the chart instead of counting as evidence in its favor');
 assert.equal(integrity.verify(packet).pass,true,input.birthDate);
 if(input.unknownBirthTime)assert(!packet.facts.qiEvidence.entries.some(row=>row.position==='hour'));
 const plan=guidance.preflight(packet);
 assert.equal(invariant.verify(packet,plan).pass,true,'provider preflight must accept real calculated inputs');
 assert.deepEqual(plan.saju_core.topicTasks.temperament.requiredSourceKinds,['seasonal','qi-ledger','natal-month-position','stem-linkage','root-condition']);
 const prompt={stage:'body',facts:packet,requestedSections:['saju_core'],
  analysisGuidance:{...guidance.forRequest(['saju_core'],packet.person.mbti),
    editorialBlueprint:{saju_core:plan.saju_core}}};
 const compiled=generation.compile(prompt);
 assert.deepEqual(compiled.source['facts.qiEvidence'],packet.facts.qiEvidence);
 assert(!Object.hasOwn(compiled.source,'facts.governingDayDiagnostic'),
  'unreviewed governing-day method cannot appear in paid writer source map');
 assert(!Object.hasOwn(compiled.source['facts.qiEvidence'].governance,'publishedMethodExploration'),
  'a research-only allocation must not become a paid interpretation fact');
 const transport=generation.schema(prompt,wire.schemaFor(prompt,schema));
 const allowed=transport.properties.chapters.properties.saju_core.properties.paragraphs.properties
  .temperament.properties.basis.properties.refs.items.enum;
 assert(allowed.includes('facts.qiEvidence'));
 assert(allowed.includes('facts.seasonalEvidence'));
 const paragraph=(refs)=>({basis:{refs,interpretation:'월령과 오행의 관계를 비교합니다.',
  condition:'절기의 경계를 확인한 상황',limit:'사령과 강약은 확정하지 못합니다.'},
  label:'월령과 뿌리',text:'월지의 계절과 일간 뿌리 위치를 구분합니다.'});
 const output=(refs)=>({chapters:{saju_core:{title:'기본 명리',keyJudgment:'계절 및 오행 근거를 구분합니다.',
  mood:'reflective',paragraphs:{temperament:paragraph(refs),strength:null}}}});
 assert.doesNotThrow(()=>generation.restoreEvidence(output(['facts.seasonalEvidence','facts.qiEvidence','facts.stemConnections','facts.rootConditions','natal.month.stem']),prompt));
 assert.throws(()=>generation.restoreEvidence(output(['facts.seasonalEvidence','facts.stemConnections','facts.rootConditions','natal.month.stem']),prompt),/missing required positional qi evidence/);
 assert.throws(()=>generation.restoreEvidence(output(['facts.qiEvidence','facts.stemConnections','facts.rootConditions','natal.month.stem']),prompt),/missing required month seasonal source/);
 const tampered=structuredClone(packet);tampered.facts.qiEvidence.governance.activeHiddenStemId='natal.month.hidden.甲';
 assert(integrity.verify(tampered).errors.includes('incorrect-positional-qi-evidence'));
 assert(invariant.verify(tampered,plan).errors.includes('calculated-positional-qi-context-mismatch'));
 const missing=structuredClone(plan);missing.saju_core.topicTasks.temperament.requiredSourceKinds=['seasonal'];
 assert(invariant.verify(packet,missing).errors.includes('missing-canonical-qi-ledger-topic-requirement'));
}
console.log('PASS exact peer/resource/output/wealth/authority source rows, 12 monthly qi uncertainty profiles, all day-stem classes, lunar/solar and missing-time live provider gates; no paid calls');
