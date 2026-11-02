'use strict';
// QA15: source-based scope over a FIXED cross-chart grid. It measures
// pre-writing eligibility only, NEVER customer report quality or demographics.
// Actual provider calls, real payments and customer records: NONE.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const guidance=require('./report-analysis-guidance');
const selection=require('./report-chapter-selection');
const coverage=require('./report-product-coverage');
const {GROUPS}=require('./report-qa11-premium-scope-audit');
const outline=require('./report-outline');
const commercial=require('./report-commercial-readiness');
const names=Object.entries(outline.topics).flatMap(([c,ts])=>
 Object.keys(ts).map(t=>c+'.'+t));
assert.equal(names.length,33);
const chapters=Object.fromEntries(Object.keys(outline.topics).map(x=>[x,0]));
const eligible=Object.fromEntries(names.map(x=>[x,0]));
const examples=[],omittedReasons={},counts=[],sourceOverlap=[];
const years=[1978,1982,1986,1990,1994,1998,2002,2006];
const months=[2,5,8,11],days=[7,21],times=['08:20','20:20'];
const mbtis=['ISFP','ENTJ','INFP','ESTJ'];
const allSeen=new Set();
let generated=0;
for(const year of years)for(const month of months)
for(const day of days)for(const birthTime of times){
 const date=year+'-'+String(month).padStart(2,'0')+'-'+String(day).padStart(2,'0');
 const input={calendar:'solar',birthDate:date,birthTime,
  gender:(year/2+month+day)%2===0?'female':'male',
  mbti:mbtis[(year/2+month+day+(birthTime==='20:20'?1:0))%mbtis.length]};
 const packet=facts.build(input,2027);
 assert.equal(packet.status,'ready','expected fully calculable input');
 assert.equal(packet.targetYear.year,2027);
 const plan=guidance.preflight(packet);
 const chosen=selection.select(GROUPS,plan);
 const shown=coverage.calculate(input);
 assert.equal(shown.status,'ready');
 assert.equal(shown.catalog.chapterDefinitions,12);
 assert.equal(shown.catalog.topicDefinitions,33);
 assert.equal(shown.purchaseEnabled,false);
 assert.equal(shown.modelCalls,0);
 assert.deepEqual(shown.estimate.chapters.filter(x=>x.includedInPlan).map(x=>x.id),
  chosen.plannedIds,'customer preview and true paid chapter selector must agree');
 let valid=0;
 for(const group of shown.estimate.chapters){
  if(group.includedInPlan)chapters[group.id]++;
  const exact=group.includedInPlan?Object.entries(plan[group.id].topicTasks)
   .filter(([,task])=>task.mode!=='state-limits').map(([key])=>key):[];
  assert.deepEqual(group.eligibleTopics.map(t=>t.id),exact,
   'customer preview must not advertise disabled or unselected topics');
  for(const name of exact){eligible[group.id+'.'+name]++;valid++}
 }
 for(const missing of chosen.omitted){
  const key=missing.id+':'+missing.reason;
  omittedReasons[key]=(omittedReasons[key]||0)+1;
 }
 assert.equal(valid,shown.estimate.evidenceEligibleTopicUpperBound);
 assert.equal(chosen.plannedIds.length,shown.estimate.plannedChapters);
 assert(valid<=30);
 const signed=chosen.plannedIds.join('/');
 allSeen.add(signed);
 const snapshot={chapters:chosen.plannedIds.length,eligible:valid,
  omitted:chosen.omitted.length};
 counts.push(snapshot);
 // Source collision is a REVIEW flag, not proof of duplicate meaning.
 // Use explicit source refs only (not broad path labels).
 const shared=new Map();
 for(const id of chosen.plannedIds){
  for(const [t,task] of Object.entries(plan[id].topicTasks)){
   if(task.mode==='state-limits')continue;
   for(const ref of task.allowedSourceRefs||[]){
    if(!shared.has(ref))shared.set(ref,[]);
    shared.get(ref).push(id+'.'+t);
   }
  }
 }
 sourceOverlap.push([...shared.values()].filter(v=>v.length>1).length);
 generated++;
}
assert.equal(generated,128);
assert.equal(allSeen.size>1,true,'real charts must produce different chapter eligibility');
const structural=commercial.assess();
assert.equal(structural.canAcceptNewPayment,false);
assert.equal(structural.structuralUpperBound,30);
const sorted=counts.map(x=>x.eligible).sort((a,b)=>a-b);
const sortedChapters=counts.map(x=>x.chapters).sort((a,b)=>a-b);
const metrics={kind:'qa15-real-chart-128-scope-distribution-v1',
 profiles:generated,chartsCalculated:128,paidProviderCalls:0,
 realPaidManuscriptsEvaluated:0,readerProseQualityApproved:false,
 uniqueChapterSelections:allSeen.size,full12Chapters:counts.filter(x=>x.chapters===12).length,
 minSelectedChapters:sortedChapters[0],medianSelectedChapters:sortedChapters[63],
 maxSelectedChapters:sortedChapters[127],
 minEligibleTopics:sorted[0],medianEligibleTopics:sorted[63],maxEligibleTopics:sorted[127],
 averageEligibleTopics:Math.round(sorted.reduce((a,v)=>a+v,0)/128*100)/100,
 chapters,topics:eligible,
 frequentlyMissing: Object.fromEntries(Object.entries(omittedReasons).sort((a,b)=>b[1]-a[1]).slice(0,8)),
 conditionalTopics: Object.entries(eligible).filter(([,n])=>n<128).sort((a,b)=>a[1]-b[1]).slice(0,16),
 chartsWithReusedExplicitSource:sourceOverlap.filter(v=>v>0).length,
 method:'fixed 8 years x 4 months x 2 days x 2 birth hours; not a population estimate',
 canPromise12x35:false,canSell:false
};
assert(metrics.maxEligibleTopics<35);
assert(metrics.full12Chapters<128,'a 12-chapter promise is not generally supportable');
console.log('QA15_CROSS_CHART_REAL_SCOPE='+JSON.stringify(metrics));
