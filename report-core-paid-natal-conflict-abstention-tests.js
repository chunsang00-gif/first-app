'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const coverage=require('./report-core-knowledge-coverage');
const engine=require('./report-core-knowledge-engine');
const review=require('./report-core-paid-natal-conflict-abstention');
const bridge=require('./report-core-paid-natal-uncovered-editorial-bridge');
const kb=require('./report-core-knowledge.json');
const all=coverage.representativeInputs();
assert.equal(all.length,99);
const categories=new Map(),rows=[];
for(const input of all){
 const packet=facts.build(input,2027),r=review.inspect(packet);
 assert.equal(packet.status,'ready');
 assert.equal(r.kind,'qa-natal-interpretation-conflict-abstention-v1');
 assert.equal(r.conclusion,'abstain-from-full-chart-interpretation');
 assert.equal(r.finalTraditionalPattern,null);
 assert.equal(r.adoptedMonthMethod,null);
 assert.equal(r.governingHiddenStem,null);
 assert.equal(r.branchTransformationRealized,false);
 assert.equal(r.dayMasterStrengthKnown,false);
 assert.equal(r.noDetectedTensionsProvesDominantPattern,false);
 assert.equal(r.detectedTensionsProveLifeConflict,false);
 assert.equal(r.downstreamPaidApproval,false);
 assert.equal(r.providerCalls,0);
 assert.equal(r.releaseVerdict,'not-approved');
 assert.equal(r.distinctObservedTensions,r.findings.length);
 assert.equal(r.calculatedFacts.monthMainSourceId,
  'natal.month.hidden.'+packet.facts.seasonalEvidence.monthMainQiStem);
 const actualExposed=packet.facts.stemConnections.exposure
  .filter(x=>x.position==='month'&&x.exactExposure&&
    x.exactVisibleMatches.some(v=>v.id!=='natal.day.stem'))
  .map(x=>x.hiddenId);
 assert.deepEqual(r.calculatedFacts.nonDayVisibleMonthHiddenSourceIds,
  actualExposed);
 const roles=require('./report-fact-bindings').build(packet);
 const validRefs=new Set(roles.map(x=>x.id));
 const factRefs=new Set(['facts.stemConnections','facts.seasonalEvidence',
  'facts.governingDayDiagnostic','facts.natalBranchRelations']);
 for(const finding of r.findings){
  assert.equal(finding.relativePriority,'not-assessed');
  assert.equal(finding.impactOnActualLife,'not-established');
  assert(finding.sourceRefs.length>0);
  assert.equal(finding.sourceRefs.length,new Set(finding.sourceRefs).size);
  assert(finding.sourceRefs.every(id=>validRefs.has(id)||factRefs.has(id)));
  categories.set(finding.id,(categories.get(finding.id)||0)+1);
 }
 const candidate=engine.compile(packet);
 if(candidate.review?.fourPillar){
  assert.deepEqual(candidate.review.fourPillar
   .methodPriorityReview.competingEvidence,r);
  assert.equal(candidate.review.fourPillar
   .methodPriorityReview.selectedTraditionalMethod,null);
 }
 rows.push({month:packet.chart.month,day:packet.chart.day,
  hour:packet.chart.hour,status:r.allowedInterpretationScope,
  findings:r.findings.map(x=>x.id)});
}
assert(rows.some(x=>x.findings.includes(
 'month-main-and-other-hidden-both-visible')||
 x.findings.includes('other-month-hidden-exposed-without-main')));
assert(rows.some(x=>x.findings.includes(
 'approximate-governing-day-differs-from-month-main')||
 x.findings.includes('approximate-governing-day-outside-canonical-hidden-stems')));
const targeted=[
 ['1989-02-10','xin-yin-bing-only-month-command-change','정관'],
 ['2024-02-17','xin-yin-jia-and-bing-coexposed-month-main-plus-authority','정재']
];
for(const [birthDate,caseId,firstRole] of targeted){
 const packet=facts.build({calendar:'solar',birthDate,
  birthTime:'14:20',gender:'male',mbti:'ISFP'},2027);
 const r=review.inspect(packet),candidate=bridge.review(packet);
 assert.equal(r.calculatedFacts.classicalCaseOnly,caseId);
 assert.equal(r.documentedClassicalFirstRole,firstRole);
 assert.equal(r.allowedInterpretationScope,
  'narrow-document-specific-starting-role-only');
 assert(r.findings.some(x=>x.id===
  'source-specific-classical-example-needs-whole-chart-review'));
 assert.equal(candidate.status,'narrow-textual-editorial-candidate-only');
 assert.deepEqual(candidate.contextualReview.competingMethodEvidence,r);
 assert.equal(candidate.eligibleForPaidRelease,undefined);
 assert.equal(candidate.curatedCoreStillMissing,true);
}
const near=[
 ['1989-02-10','20:20'],
 ['2024-02-17','20:20'],
 ['2024-02-15','14:20'],
 ['2024-03-17','14:20'],
 ['1990-05-15','14:20']
];
for(const [date,hour] of near){
 const p=facts.build({calendar:'solar',birthDate:date,birthTime:hour,
  gender:'male',mbti:'ISFP'},2027);
 const r=review.inspect(p);
 assert.equal(r.calculatedFacts.classicalCaseOnly,null);
 assert.equal(r.documentedClassicalFirstRole,null);
 assert.equal(r.allowedInterpretationScope,
  'calculated-positions-and-competing-candidate-descriptions-only');
}
const corrupted=facts.build({calendar:'solar',birthDate:'2024-02-17',
 birthTime:'14:20',gender:'male',mbti:'ISFP'},2027);
corrupted.facts.natalBranchRelations.pairs=[];
assert.throws(()=>review.inspect(corrupted),
 /QA_MONTH_METHOD_CALCULATION_DIVERGED:branch-relations/);
const missing=facts.build({calendar:'solar',birthDate:'1989-02-10',
 birthTime:'14:20',gender:'male',mbti:'ISFP'},2027);
missing.facts.stemConnections.exposure=[];
assert.throws(()=>review.inspect(missing),
 /QA_MONTH_METHOD_CALCULATION_DIVERGED:stem-connections/);
const categoryCount=Object.fromEntries([...categories.entries()].sort());
console.log('QA_NATAL_METHOD_CONFLICT_ABSTENTION='+JSON.stringify({
 chartFixtures:99,provenanceClasses:categoryCount,
 narrowClassicalMatches:targeted.length,nearMatchesRejected:near.length,
 invalidGraphInputsRejected:2,
 selectedMethods:0,fullChartReadingsApproved:0,paidCalls:0}));
console.log('PASS 99 varied charts retain competing method evidence and abstain from unsupported final interpretations');
