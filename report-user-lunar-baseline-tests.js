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
const independentReference={
 solarDate:'1983-01-07',
 chart:{year:'壬戌',month:'癸丑',day:'乙未',hour:'癸未'},
 year2027:'丁未'
};
// Fixed external references, not values calculated by the same library:
// https://wikidocs.net/249512
// https://datedb.net/tool/saju-worksheet/19830107/
// https://sajuclass.com/명리-사전/역법-명식/시두법/
assert.equal(provided.solarDate,independentReference.solarDate,
 'external lunar-to-solar oracle: 1982-11-24 lunar converts to January 7, not January 8');
assert.deepEqual(provided.chart,independentReference.chart,
 'external independent year/month/day oracle plus time-head table');

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
assert.equal(expected.targetYear.pillar,independentReference.year2027);
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
const scope=require('./report-chapter-selection').select([
 ['saju_core','mbti_contradiction'],['decision','stress'],
 ['money','career'],['relationship','integrated_judgment'],
 ['year_2027','year_2027_money'],['year_2027_career','year_2027_relationship']
],blueprint);
assert(scope.canGenerate,'real lunar+ISFP input must be evaluated for two distinct grounded life domains: '+scope.issues.join(', '));
assert(scope.supportedDomains.length>=2);
console.log('USER_LUNAR_INTERPRETATION_SCOPE '+JSON.stringify({
 included:scope.plannedIds,omitted:scope.omitted.map(x=>x.id),
 lifeDomains:scope.supportedDomains,
 groundedTopics:scope.plannedIds.reduce((n,id)=>n+blueprint[id].activeTopicKeys.length,0),
 paidCalls:0
}));
const preflight=invariant.verify(expected,blueprint);
assert.equal(preflight.pass,true,preflight.errors.join('; '));
assert.equal(blueprint.saju_core.topicTasks.temperament.mode,'use-primary');
const seasonRefs=['facts.seasonalEvidence','facts.qiEvidence','natal.month.stem'];
const rootBaseRefs=['facts.structuralEvidence.dayMasterRoots','facts.stemConnections','facts.rootConditions'];
const refs=[...seasonRefs,...rootBaseRefs];
assert.deepEqual(blueprint.saju_core.topicTasks.temperament.requiredSourceKinds,
 ['seasonal','qi-ledger','natal-month-position']);
assert.deepEqual(blueprint.saju_core.topicTasks.strength.requiredSourceKinds,['month-ten-god']);
assert.equal(blueprint.saju_core.topicTasks.strength.primaryEvidencePath,'facts.tenGods.month');
// Confirm the actual lunar 1982-11-24 14:20 ISFP case reaches the paid
// integrated writer with TWO independent sources, not natal data alone.
const integrationPrompt={stage:'body',facts:expected,requestedSections:['integrated_judgment'],
 analysisGuidance:{...guidance.forRequest(['integrated_judgment'],'ISFP'),
  editorialBlueprint:{integrated_judgment:blueprint.integrated_judgment}}};
const integrationPayload=writer.compile(integrationPrompt);
assert.equal(integrationPayload.source['person.mbti'].type,'ISFP');
const integratedSlot=writer.schema(integrationPrompt,wire.schemaFor(integrationPrompt,schema))
 .properties.chapters.properties.integrated_judgment.properties.paragraphs.properties
 [blueprint.integrated_judgment.anchorTopic].properties.basis.properties.refs.items.enum;
assert(integratedSlot.includes('person.mbti')&&integratedSlot.includes('natal.month.stem'),
 'user lunar ISFP combined insight must cite MBTI plus computed natal source');
// Root QA on the actual user case, not a generic INTJ fixture: life-domain
// chapters now have an OPTIONAL ISFP lens and verifiable linked sources.
for(const id of ['decision','money','career','relationship','stress']){
 if(!scope.plannedIds.includes(id))continue;
 const individual={stage:'body',facts:expected,requestedSections:[id],
  analysisGuidance:{...guidance.forRequest([id],'ISFP'),
   editorialBlueprint:{[id]:blueprint[id]}}};
 const payload=writer.compile(individual);
 const anchor=blueprint[id].anchorTopic;
 const topic=payload.task.chapters[id].topics[anchor];
 const lens=topic.mbtiFocus;
 assert(lens,'ISFP topic-specific lens was removed from supported paragraph '+id+'/'+anchor);
 assert.equal(lens.preferences.length,1,'each grounded topic must use only its relevant submitted preference');
 assert(lens.preferences.every(p=>'ISFP'.includes(p.code)));
 assert.equal(Object.hasOwn(payload.task.chapters[id],'domainMbtiLens'),false,
  'chapter-wide MBTI narrative must not mix unrelated questions');
 const sourceIds=writer.schema(individual,wire.schemaFor(individual,schema))
  .properties.chapters.properties[id].properties.paragraphs.properties
  [blueprint[id].anchorTopic].properties.basis.properties.refs.items.enum;
 assert(sourceIds.includes('person.mbti')&&sourceIds.some(p=>p.startsWith('natal.')),
  id+' optional combination must cite both the actual ISFP source and traditional natal evidence');
}
const prompt={stage:'body',facts:expected,requestedSections:['saju_core'],
 analysisGuidance:{...guidance.forRequest(['saju_core'],birth.mbti),
  editorialBlueprint:{saju_core:blueprint.saju_core}}};
const transport=writer.compile(prompt);
for(const ref of refs)assert(Object.hasOwn(transport.source,ref),
 'the lunar source-bound writer cannot drop '+ref);
assert.equal(transport.task.comparisonContract.calculatedAgreement,false);
const slots=writer.schema(prompt,wire.schemaFor(prompt,schema))
 .properties.chapters.properties.saju_core.properties.paragraphs.properties;
const expectedSeasonRefs=slots.temperament.properties.basis.properties.refs.items.enum;
const expectedRootRefs=(slots.strength.anyOf?.find(x=>x.type==='object')||slots.strength)
 .properties.basis.properties.refs.items.enum;
for(const ref of seasonRefs)assert(expectedSeasonRefs.includes(ref),'seasonal schema lacks '+ref);
for(const ref of rootBaseRefs)assert(expectedRootRefs.includes(ref),'root schema lacks '+ref);
assert(!expectedSeasonRefs.includes('facts.rootConditions')&&!expectedSeasonRefs.includes('facts.stemConnections'));
const rootPlaces=(transport.source['facts.stemConnections']?.dayMasterRooting?.sameElementRoots||[])
 .map(x=>x.hiddenId);
const rootRefs=['natal.month.stem',...rootBaseRefs,...(rootPlaces[0]?[rootPlaces[0]]:[])];
const result=(first=seasonRefs,second=rootRefs)=>({chapters:{saju_core:{
 title:'출생 계산에 근거한 풀이',keyJudgment:'출생 자료의 서로 다른 계산 위치를 확인했습니다.',
 mood:'reflective',paragraphs:{
 temperament:{label:'계절과 겉글자',text:'태어난 계절과 겉글자의 오행 관계를 구별합니다.',
  basis:{refs:first,interpretation:'태어난 달과 일간의 전통 관계를 비교했습니다.',
  condition:'음력 변환과 절입을 기준으로 합니다.',limit:'실제 능력이나 성격을 확정하지 않습니다.'}},
 strength:{label:'뿌리의 실제 위치',text:'지장간의 실제 뿌리와 충 관계를 구별합니다.',
  basis:{refs:second,interpretation:'같은 오행의 뿌리 위치를 구별했습니다.',
  condition:'출생 위치를 확인합니다.',limit:'신강약과 실제 능력은 확정하지 않습니다.'}}
 }}}});
assert.doesNotThrow(()=>writer.restoreEvidence(result(),prompt));
// This matches the just-paid provider's citation pattern, without shipping
// any user-visible/private report prose into the public test repository.
const observedOnly=['natal.month.stem','facts.stemConnections','facts.rootConditions',...rootPlaces];
assert(rootPlaces.length>0,'canonical lunar sample must provide real rooted positions');
assert(!observedOnly.includes('facts.structuralEvidence.dayMasterRoots'));
const sparseResponse=result(seasonRefs,observedOnly);
const completed=writer.restoreEvidence(sparseResponse,prompt);
assert(completed.chapters.saju_core.evidence.some(x=>
 x.startsWith('strength:')&&x.includes('facts.structuralEvidence.dayMasterRoots')),
 'attach canonical root summary only after all actual hidden roots were cited');
assert.deepEqual(sparseResponse.chapters.saju_core.paragraphs.strength.basis.refs,observedOnly,
 'never silently rewrite the provider raw response or saved paid diagnostic');
const mutated=structuredClone(transport);
mutated.source['facts.structuralEvidence.dayMasterRoots'][0].sameElementStems=[];
for(const root of mutated.source['facts.structuralEvidence.dayMasterRoots']){
 if(rootPlaces.some(x=>x.startsWith('natal.'+root.position+'.hidden.')))
  root.sameElementStems=[];
}
assert.deepEqual(writer.completeRootSummaryCitation(mutated,observedOnly),observedOnly,
 'a structural mismatch must fail closed rather than auto-credit roots');
const inaccurate=structuredClone(transport);
inaccurate.source['facts.rootConditions'].dayMasterRootCases=[];
assert.deepEqual(writer.completeRootSummaryCitation(inaccurate,observedOnly),observedOnly,
 'root condition records are mandatory to auto-complete a provenance link');
assert.deepEqual(writer.completeRootSummaryCitation(transport,observedOnly.slice(0,-1)),
 observedOnly.slice(0,-1),'missing even one observed root may not be auto-completed');

const missingSeason={
 'facts.seasonalEvidence':/missing required month seasonal source/,
 'facts.qiEvidence':/missing required positional qi evidence/,
 'natal.month.stem':/missing month-position evidence/
};
for(const omitted of seasonRefs)
 assert.throws(()=>writer.restoreEvidence(result(seasonRefs.filter(x=>x!==omitted)),prompt),
  missingSeason[omitted], 'missing first-paragraph '+omitted+' must reject the draft');
for(const omitted of rootBaseRefs)
 assert.throws(()=>writer.restoreEvidence(result(seasonRefs,rootRefs.filter(x=>x!==omitted)),prompt),
  /missing verified root provenance/, 'missing root paragraph '+omitted+' must reject the draft');
console.log('PASS USER_LUNAR_REFERENCE '+JSON.stringify({
 inputCalendar:birth.calendar,inputDate:birth.birthDate,normalizedSolarDate:normalized,
 natalChart:expected.chart,mbti:birth.mbti,year2027Pillar:expected.targetYear.pillar,
 basisSourcesChecked:refs.length,providerCalls:0
}));
