'use strict';
// Regression fixture: the user's canonical sample is LUNAR 1982-11-24,
// 14:20, ISFP. It must never be replaced by a solar calendar interpretation
// merely because a YYYY-MM-DD string is otherwise identical.
const assert=require('node:assert/strict');
const {Lunar}=require('lunar-javascript');
const calendar=require('./calendar-provider-node');
const facts=require('./report-facts-node');
const integrity=require('./report-calculation-integrity');
const guidance=require('./report-analysis-guidance');
const invariant=require('./report-interpretation-invariants');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const schema=require('./report-schema.json');
const birth={calendar:'lunar',leapMonth:false,birthDate:'1982-11-24',
 birthTime:'14:20',gender:'male',mbti:'ISFP'};
const correctSolar=Lunar.fromYmdHms(1982,11,24,14,20,0).getSolar();
const normalized=correctSolar.toYmd();
assert.notEqual(normalized,birth.birthDate,'lunar date must be solar-converted before pillars');
const provided=calendar.calculate(birth);
assert.equal(provided.status,'complete');
assert.equal(provided.solarDate,normalized);
const convertedInput={...birth,calendar:'solar',birthDate:normalized};
const solarEquivalent=calendar.calculate(convertedInput);
assert.equal(solarEquivalent.status,'complete');
assert.deepEqual(provided.chart,solarEquivalent.chart,
 'lunar->solar conversion must not change eight characters');
assert.deepEqual(provided.solarTermTiming,solarEquivalent.solarTermTiming,
 'the same moment must have identical Jie clock evidence');
const wrongCalendar=calendar.calculate({...birth,calendar:'solar'});
assert.equal(wrongCalendar.status,'complete');
assert.notDeepEqual(wrongCalendar.chart,provided.chart,
 'accidentally treating lunar YYYY-MM-DD as solar must produce a distinct chart');

const expected=facts.build(birth,2027);
const exactSolar=facts.build(convertedInput,2027);
const wrongFacts=facts.build({...birth,calendar:'solar'},2027);
assert.equal(expected.status,'ready');
assert.equal(exactSolar.status,'ready');
assert.equal(expected.calculationInput.calendar,'lunar');
assert.equal(expected.calculationInput.leapMonth,false);
assert.equal(expected.calculationInput.birthDate,'1982-11-24');
assert.equal(expected.calculationInput.birthTime,'14:20');
assert.equal(expected.person.mbti,'ISFP');
assert.deepEqual(expected.chart,exactSolar.chart);
assert.deepEqual(expected.facts.tenGods,exactSolar.facts.tenGods);
assert.deepEqual(expected.facts.seasonalEvidence,exactSolar.facts.seasonalEvidence);
assert.deepEqual(expected.facts.stemConnections,exactSolar.facts.stemConnections);
assert.deepEqual(expected.facts.rootConditions,exactSolar.facts.rootConditions);
assert.deepEqual(expected.facts.targetYearBranchRelations,exactSolar.facts.targetYearBranchRelations);
assert.deepEqual(expected.facts.solarTermTiming,exactSolar.facts.solarTermTiming);
assert.notDeepEqual(expected.chart,wrongFacts.chart);
assert.deepEqual(integrity.verify(expected).errors,[]);
assert.deepEqual(integrity.verify(exactSolar).errors,[]);
const tampered=structuredClone(expected);
tampered.calculationInput.calendar='solar';
assert(integrity.verify(tampered).errors.includes('birth-input-chart-mismatch'),
 'an incorrect lunar/solar flag must fail before paid generation');
const wrongDate=structuredClone(expected);
wrongDate.calculationInput.birthDate='1982-11-25';
assert(integrity.verify(wrongDate).errors.includes('birth-input-chart-mismatch'));

const blueprint=guidance.preflight(expected);
const preflight=invariant.verify(expected,blueprint);
assert.equal(preflight.pass,true,preflight.errors.join('; '));
assert.equal(blueprint.saju_core.topicTasks.temperament.mode,'use-primary');
const refs=['facts.seasonalEvidence','facts.qiEvidence','facts.stemConnections',
 'facts.rootConditions','natal.month.stem'];
assert.deepEqual(blueprint.saju_core.topicTasks.temperament.requiredSourceKinds,
 ['seasonal','qi-ledger','natal-month-position','stem-linkage','root-condition']);
const prompt={stage:'body',facts:expected,requestedSections:['saju_core'],
 analysisGuidance:{...guidance.forRequest(['saju_core'],birth.mbti),
  editorialBlueprint:{saju_core:blueprint.saju_core}}};
const transport=writer.compile(prompt);
for(const ref of refs)assert(Object.hasOwn(transport.source,ref),
 'the lunar source-bound writer cannot drop '+ref);
assert.equal(transport.task.comparisonContract.calculatedAgreement,false);
const expectedRefs=writer.schema(prompt,wire.schemaFor(prompt,schema))
 .properties.chapters.properties.saju_core.properties.paragraphs.properties
 .temperament.properties.basis.properties.refs.items.enum;
for(const ref of refs)assert(expectedRefs.includes(ref),'schema lacks '+ref);
const result=refs=>({chapters:{saju_core:{
 title:'출생 계산에 근거한 풀이',keyJudgment:'월지와 지장간의 관계를 확인했습니다.',
 mood:'reflective',paragraphs:{temperament:{
 label:'계산된 관계',text:'음력 출생일을 양력으로 변환해 명리 근거를 확인했습니다.',
 basis:{refs,interpretation:'출생 당시 계절·뿌리·천간 위치를 각각 비교했습니다.',
 condition:'음력 변환과 절입 기준을 일치시켰습니다.',limit:'강약·용신·실제 미래는 확정하지 않았습니다.'}
 },strength:null}}}});
assert.doesNotThrow(()=>writer.restoreEvidence(result(refs),prompt));
for(const omitted of refs){
 const remaining=refs.filter(x=>x!==omitted);
 assert.throws(()=>writer.restoreEvidence(result(remaining),prompt),
  /missing (?:required|verified)|unrelated paragraph basis/, 'missing '+omitted+' must reject the paid draft');
}
console.log('PASS USER_LUNAR_REFERENCE '+JSON.stringify({
 inputCalendar:birth.calendar,inputDate:birth.birthDate,normalizedSolarDate:normalized,
 natalChart:expected.chart,mbti:birth.mbti,year2027Pillar:expected.targetYear.pillar,
 basisSourcesChecked:refs.length,providerCalls:0
}));
