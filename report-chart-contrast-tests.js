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
 assert.deepEqual(request.task.chapters.saju_core.chartContrast,contrast,
  'contrast must reach the real paid model request unchanged');
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
