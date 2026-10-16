'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const contrasts=require('./report-chart-contrast');
const guidance=require('./report-analysis-guidance');
const generation=require('./report-generation-request');
const binding=require('./report-fact-bindings');

const common={birthTime:'14:20',gender:'male',mbti:'ISFP'};
const cases=[
 {...common,calendar:'lunar',birthDate:'1982-11-24',leapMonth:false},
 {...common,calendar:'solar',birthDate:'1982-11-24',leapMonth:false},
 {...common,calendar:'solar',birthDate:'1990-05-15',leapMonth:false},
 {...common,calendar:'solar',birthDate:'1990-11-15',leapMonth:false},
 {...common,calendar:'solar',birthDate:'2001-11-03',unknownBirthTime:true,birthTime:undefined,leapMonth:false}
];
const results=[];
for(const input of cases){
 const packet=facts.build(input,2027);
 assert.equal(packet.status,'ready',input.birthDate);
 const contrast=contrasts.build(packet);
 assert(contrast,'real source packet must produce core distinctions');
 assert.equal(contrast.version,'chart-evidence-contrast-v1');
 assert.equal(contrast.chartSignature,[packet.chart.year,packet.chart.month,packet.chart.day,
  packet.chart.hour||'hour-unknown'].join('/'));
 assert.equal(contrast.monthAndDay.monthBranch,packet.chart.month[1]);
 assert.equal(contrast.monthAndDay.dayElement,packet.facts.seasonalEvidence.dayElement);
 assert.equal(contrast.monthAndDay.phase,packet.facts.seasonalEvidence.monthPhase);
 assert.equal(contrast.monthAndDay.direction,packet.facts.seasonalEvidence.seasonToDayRelation);
 assert.equal(contrast.monthAndDay.transitionUnresolved,
  packet.facts.seasonalEvidence.monthPhase==='transition');
 assert.equal(contrast.factsOnly,true);
 assert(contrast.cannotInfer.includes('day-master-strength'));
 for(const point of contrast.contrastPoints){
  assert.equal(typeof point.calculatedExplanation,'string');
  assert(point.calculatedExplanation.length>=35,
   'chart-specific editor must receive an actual sourced comparison, not a label: '+point.kind);
  assert(!/(승진|이직|연애운이|결혼|수입이|재산이)/.test(point.calculatedExplanation),
   'computed explanations cannot fabricate personal results');
 }
 assert(contrast.contrastPoints[0].calculatedExplanation.includes(packet.chart.month[1]),
  'reader explanation must mention actual month branch, not generic season prose');
 assert(contrast.contrastPoints[2].calculatedExplanation.includes('강약')||
   contrast.contrastPoints[2].calculatedExplanation.includes('신약'),
  'root observation must explicitly remain distinct from verified strength');
 assert.deepEqual(contrast.contrastPoints.map(x=>x.kind),[
  'month-vs-day','visible-support-vs-counter','actual-day-master-roots','root-relation-overlap']);
 const sourceIDs=new Set(binding.build(packet).map(x=>x.id));
 const support=contrast.contrastPoints[1].evidence;
 for(const row of [...support.support,...support.counter]){
  assert(sourceIDs.has(row.sourceId),'exact visible qi stem must exist '+row.sourceId);
  const original=packet.facts.qiEvidence.entries.find(x=>x.id===row.sourceId);
  assert.equal(original?.category,row.category);
  assert.equal(original?.direction,row.direction);
 }
 const root=contrast.contrastPoints[2].evidence;
 const observed=packet.facts.stemConnections.dayMasterRooting.sameElementRoots;
 assert.equal(root.observedRootCount,observed.length);
 for(const row of root.rootLocations){
  assert(sourceIDs.has(row.sourceId),'root must reference an actual natal hidden stem');
  assert(observed.some(x=>x.hiddenId===row.sourceId&&x.type===row.matchType));
  assert(!row.sourceId.startsWith('natal.hour.')||packet.chart.hour,
   'unknown birth hour must never generate an hour source');
 }
 const rootClashes=contrast.contrastPoints[3].evidence.collisions;
 assert.equal(rootClashes.length,(packet.facts.rootConditions.dayMasterRootCases||[])
  .filter(x=>x.natal.hasDirectClash).length);
 assert(rootClashes.every(x=>x.natalClash===true&&!Object.hasOwn(x,'annualClash')),
  'the core natal chapter must not recycle 2027 branch conclusions');
 const blueprint=guidance.preflight(packet);
 const p={stage:'body',facts:packet,requestedSections:['saju_core'],
  analysisGuidance:{...guidance.forRequest(['saju_core'],input.mbti),
   editorialBlueprint:{saju_core:blueprint.saju_core}}};
 const request=generation.compile(p);
 const core=request.task.chapters.saju_core;
 assert.equal(Object.hasOwn(core,'chartContrast'),false,
  'do not send four unassigned comparisons in a wide chapter blob');
 const temperament=core.topics.temperament.evidenceFocus;
 const strength=core.topics.strength.evidenceFocus;
 assert.deepEqual(temperament.points.map(x=>x.kind),
  ['month-vs-day','visible-support-vs-counter']);
 assert.deepEqual(strength.points.map(x=>x.kind),
  ['actual-day-master-roots','root-relation-overlap']);
 const firstRefs=new Set(core.topics.temperament.citableFacts.map(x=>x.id));
 const secondRefs=new Set(core.topics.strength.citableFacts.map(x=>x.id));
 assert(firstRefs.has('facts.seasonalEvidence')&&firstRefs.has('facts.qiEvidence'),
  'core first paragraph must cite season and visible-element observation');
 assert(!firstRefs.has('facts.stemConnections')&&!firstRefs.has('facts.rootConditions'),
  'root and clash evidence may not leak into the month/visible qi explanation');
 assert(secondRefs.has('facts.stemConnections')&&secondRefs.has('facts.rootConditions'),
  'actual rooting and clash provenance must remain mandatory in the second paragraph');
 assert.deepEqual(blueprint.saju_core.topicTasks.temperament.requiredSourceKinds,
  ['seasonal','qi-ledger','natal-month-position']);
 assert(blueprint.saju_core.topicTasks.strength.requiredSourceKinds.includes('root-condition'));
 assert(!generation.policy.includes('temperament는 facts.seasonalEvidence, facts.qiEvidence, facts.stemConnections를 모두 인용'),
  'conflicting legacy instruction must not override paragraph evidence ownership');
 assert.deepEqual([...temperament.points,...strength.points].map(x=>x.calculatedExplanation),
  contrast.contrastPoints.map(x=>x.calculatedExplanation),
  'all four computed facts must reach the exact assigned paragraph without reinterpretation');
 for(const [topicId,focus] of [['temperament',temperament],['strength',strength]]){
  const permitted=new Set(core.topics[topicId].citableFacts.map(x=>x.id));
  for(const point of focus.points){
   assert(point.sourceRefs.length>0,'calculated focus must have actual source: '+point.kind);
   for(const ref of point.sourceRefs)assert(permitted.has(ref),
    'topic evidence may not cite another topic\'s references: '+topicId+'/'+ref);
   assert(!/능력이 뛰어|실제로 성실|성공한다/.test(point.calculatedExplanation),
    'deterministic facts must never become observed personal traits');
  }
 }
 for(const point of contrast.contrastPoints)for(const ref of point.refs){
  assert(Object.hasOwn(request.source,ref),'contrast references unknown paid source '+ref);
 }
 assert(!JSON.stringify(contrast).includes('percentStrength'));
 assert(!JSON.stringify(contrast).includes('predictedMarriage'));
 results.push({signature:contrast.chartSignature,season:contrast.monthAndDay.season,
  monthBranch:contrast.monthAndDay.monthBranch,
  direction:contrast.monthAndDay.direction,
  natalRoots:root.observedRootCount,
  supportVisible:support.support.length,counterVisible:support.counter.length,
  natalRootClashes:rootClashes.length});
}
assert.notEqual(results[0].signature,results[1].signature,
 'same date string in lunar and solar must have distinct chart identity');
assert.notEqual(contrasts.build(facts.build(cases[0],2027)).contrastPoints[0].calculatedExplanation,
 contrasts.build(facts.build(cases[1],2027)).contrastPoints[0].calculatedExplanation,
 'the actual editorial seed must change between lunar and solar readings of the same birth string');
assert.notEqual(results[2].monthBranch,results[3].monthBranch,
 'spring/summer and winter seasonal contrasts should not collapse');
assert(new Set(results.map(x=>JSON.stringify(x))).size>=4,
 'at least four materially different calculated contrasts are required');
const sameChartNewMbti=facts.build({...cases[0],mbti:'INTJ'},2027);
assert.deepEqual(contrasts.build(sameChartNewMbti),contrasts.build(facts.build(cases[0],2027)),
 'MBTI label cannot silently change a deterministic Saju contrast');
assert.equal(contrasts.build({}),null,'missing calculated facts cannot create chart-specific personality claims');
console.log('PASS real multi-chart contrast reaches paid writer without invented traits or annual spillover');
console.log('CHART_CONTRAST_AUDIT '+JSON.stringify(results));
