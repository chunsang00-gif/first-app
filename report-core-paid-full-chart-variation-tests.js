'use strict';
// QA-only: exercise the real paid first-batch composition with multiple
// DIFFERENT computed four-pillar charts. No provider/HTTP request is permitted.
// This tests source provenance and contract isolation, not prose quality.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const coverage=require('./report-core-knowledge-coverage');
const preview=require('./report-core-paid-natal-depth-preview');
const capture=require('./report-core-paid-full-prompt-capture').capture;
const assemble=require('./report-core-paid-full-qa-compose').assemble;
const writer=require('./report-generation-request');
const bindings=require('./report-fact-bindings');
const preflight=require('./report-provider-preflight');
const factLock=require('./report-core-paid-natal-depth-fact-lock');
const coreThesis=require('./report-core-thesis');
const fixed=require('./report-core-paid-full-prompt-capture').FIXTURE;
(async()=>{
 const samples=[];
 const years=new Set([fixed.birthDate.slice(0,4)]);
 const months=new Set([fixed.birthDate.slice(5,7)]);
 for(const input of coverage.representativeInputs()){
  if(input.calendar!=='solar')continue;
  const y=input.birthDate.slice(0,4),m=input.birthDate.slice(5,7);
  if(years.has(y)||months.has(m))continue;
  const packet=facts.build(input,2027);
  if(!preview.prepare(packet))continue;
  samples.push({input,packet});
  years.add(y);months.add(m);
  if(samples.length===3)break;
 }
 assert.equal(samples.length,3,
  'sample grid must include three distinct eligible birth years/months');
 const previousFetch=global.fetch;
 let httpAttempts=0;
 global.fetch=()=>{httpAttempts++;throw Error('OFFLINE_QA_MUST_NOT_USE_HTTP');};
 const findings=[],locks=new Set();
 try{
  for(const {input,packet} of samples){
   const original=await capture(input);
   assert.equal(original.status,'captured-full-paid-composition');
   assert.equal(original.providerCalls,0);
   assert.equal(original.prompt.qaNatalDepthPreview,undefined);
   assert.equal(original.prompt.requestedSections[0],'saju_core');
   assert(!Object.hasOwn(writer.compile(original.prompt).task.chapters.saju_core.topics,
    'natal_depth'),'normal paid generation must remain unchanged');
   const qa=await assemble(input);
   assert.equal(qa.providerCalls,0);
   assert.equal(qa.releaseVerdict,'not-approved');
   assert.equal(qa.prompt.qaNatalDepthPreview,true);
   assert.deepEqual(qa.prompt.facts.chart,packet.chart,
    'captured real provider request must use THIS computed chart, not a prior fixture');
   assert.deepEqual(qa.originalRequestedSections,original.requestedSections);
   const topic=qa.payload.task.chapters.saju_core.topics.natal_depth;
   const ids=topic.citableFacts.map(row=>row.id);
   const permitted=qa.schema.properties.chapters.properties.saju_core
    .properties.paragraphs.properties.natal_depth
    .properties.basis.properties.refs.items.enum;
   assert.deepEqual(ids,permitted,'strict JSON citation options must match transported source rows');
   assert.deepEqual(preflight.inspect(qa.prompt,qa.payload,qa.schema),[]);
   const verified=Object.fromEntries(bindings.build(packet).map(row=>[row.id,row]));
   for(const id of ids.filter(id=>id.startsWith('natal.'))){
    assert.deepEqual(qa.payload.source[id],verified[id],
     'never reuse a natal source from another calculated chart: '+id);
   }
   const actualSources=[...new Set(Object.values(qa.payload.task.chapters.saju_core.topics)
    .flatMap(topic=>topic.citableFacts.map(x=>x.id)))].sort();
   assert.deepEqual(Object.keys(qa.payload.source).sort(),actualSources,
    'QA provider must not receive unrelated evidence from other chapters');
   assert(!Object.hasOwn(qa.payload.task.chapters,'mbti_contradiction'));
   assert.equal(qa.payload.task.mbti,null);
   assert(!Object.hasOwn(qa.payload.source,'person.mbti'));
   const coreStrength=writer.compile(original.prompt).task
    .chapters.saju_core.topics.strength;
   const qaStrength=qa.payload.task.chapters.saju_core.topics.strength;
   const visibility=coreStrength.evidenceFocus.tenGodFocus.monthStemVisibility;
   assert.equal(visibility.kind,
    'calculated-month-stem-to-month-hidden-comparison-v1');
   assert.equal(visibility.traditionalPatternPriority,'not-determined');
   assert.equal(visibility.onlyTheseTwoMonthPositionsCitable,true);
   assert.equal(Object.hasOwn(qaStrength.evidenceFocus.tenGodFocus,
    'monthStemVisibility'),false,
    'operator QA first-chapter task must retain its frozen envelope');
   const copied=structuredClone(coreStrength);
   delete copied.evidenceFocus.tenGodFocus.monthStemVisibility;
   assert.deepEqual(qaStrength,copied,
    'QA depth must preserve every existing month fact and question; '+
    'normal paid gets only one bounded month-exposure safety observation');
   const lock=factLock.fromPayload(qa.payload);
   assert(lock.sourceRefs.every(id=>ids.includes(id)));
   assert.equal(qa.schema.properties.chapters.properties.saju_core
    .properties.paragraphs.properties.natal_depth
    .properties.basis.properties.interpretation.enum[0],
    lock.literal);
   assert.equal(qa.schema.properties.chapters.properties.saju_core
    .properties.keyJudgment.enum[0],coreThesis.forPrompt(qa.prompt).keyJudgment);
   locks.add(lock.literal);
   findings.push({sourceCount:ids.length,reviewKind:qa.reviewKind,
    normalPaidDepthExposed:false,verifiedDifferentFullChart:true});
  }
 }finally{global.fetch=previousFetch;}
 assert.equal(httpAttempts,0,'no HTTP/network call permitted');
 assert.equal(locks.size,3,'different charts must preserve distinct locked birth evidence');
 assert.equal(findings.length,3);
 console.log('QA_FULL_CHART_VARIATION='+JSON.stringify({
  syntheticDifferentBirthYearsAndMonths:3,providerCalls:0,httpAttempts,
  liveProviderChanged:false,releaseVerdict:'not-approved',findings}));
 console.log('PASS varied full charts preserve exact paid source/schema boundaries and no API calls');
})().catch(e=>{console.error(e);process.exitCode=1;});
