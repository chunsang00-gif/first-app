'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {capture}=require('./report-core-paid-full-prompt-capture');
const writer=require('./report-generation-request');
const sourceOwned=require('./report-qa3-multichart-source-owned-editorial');
const guard=require('./report-qa8-multichart-transfer-guard');
const cases=[
 ['1982-08-15','14:20'],['1994-01-15','14:20'],
 ['1994-04-15','14:20'],['1994-05-15','20:20'],
 ['1994-07-15','14:20'],['1994-06-15','14:20'],
 ['2006-08-15','14:20'],['2018-07-15','14:20']
];
async function run(){
 const keys=['NODE_ENV','RENDER','PAID_CORE_DEPTH_V2'];
 const saved=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 try{
  process.env.NODE_ENV='test';process.env.PAID_CORE_DEPTH_V2='offline-preview';
  delete process.env.RENDER;
  const originals=[],statuses=[],scenes=new Set(),kinds=new Set();
  for(const [date,time] of cases){
   const fixture={calendar:'solar',birthDate:date,birthTime:time,
    gender:'male',mbti:'ISFP'};
   const captured=await capture(fixture);
   assert.equal(captured.providerCalls,0);
   const prompt={...captured.prompt,requestedSections:['saju_core'],
    paidCoreDepthV2:true};
   const specimen=sourceOwned.build(prompt);
   assert(specimen);
   const before=JSON.stringify(specimen);
   const result=guard.inspect(prompt,specimen);
   assert.equal(JSON.stringify(specimen),before);
   assert.equal(result.status,'source-scoped-human-review');
   assert.equal(result.exampleMatchesServerOwnedQuestion,true);
   assert.equal(result.actualPersonalBehaviourProven,false);
   assert.equal(result.humanPremiumValueApproved,false);
   assert.equal(result.canSell,false);
   scenes.add(specimen.sceneId);kinds.add(specimen.contractKind);
   originals.push({prompt,specimen});
   statuses.push(result.status);
  }
  assert.equal(statuses.length,8);
  assert(scenes.size>=6,'several different source-owned situations must be checked');
  assert.equal(kinds.size,2,'check both independent source-claim contract types');
  const first=originals[0],foreign=originals.find(x=>
   x.specimen.chartFingerprint!==first.specimen.chartFingerprint);
  assert(foreign);
  assert.throws(()=>guard.inspect(foreign.prompt,first.specimen),
   /QA8_CROSS_CHART_SPECIMEN_OR_REFS_TRANSPLANTED/);
  const corrupt=structuredClone(first.specimen);
  corrupt.candidate.basis.refs=corrupt.candidate.basis.refs.slice(1);
  assert.throws(()=>guard.inspect(first.prompt,corrupt),
   /QA8_CROSS_CHART_SPECIMEN_OR_REFS_TRANSPLANTED/);
  const wrongScene=structuredClone(first.specimen);
  wrongScene.sceneId='imagined-unverified-scene';
  assert.throws(()=>guard.inspect(first.prompt,wrongScene),
   /QA8_CROSS_CHART_SPECIMEN_OR_REFS_TRANSPLANTED/);
  const proseChanged=structuredClone(first.specimen);
  proseChanged.candidate.text='이 사람은 반드시 부자가 됩니다.';
  assert.throws(()=>guard.inspect(first.prompt,proseChanged),
   /QA8_PROSE_NOT_ENTAILED_BY_CHART_OUTLINE/);
  // A chart with no separately verified writing contract MUST stay empty.
  let outOfScope=null;
  for(let month=1;month<=12&&!outOfScope;month++){
   const fixture={calendar:'solar',birthDate:'1982-'+
    String(month).padStart(2,'0')+'-15',birthTime:'20:20',
    gender:'male',mbti:'ISFP'};
   const c=await capture(fixture);
   assert.equal(c.providerCalls,0);
   const p={...c.prompt,requestedSections:['saju_core'],paidCoreDepthV2:true};
   if(!writer.compile(p).task.chapters.saju_core.topics.temperament
     .serverOwnedWritingContract)outOfScope=p;
  }
  assert(outOfScope,'must find a source-ineligible chart');
  assert.equal(guard.inspect(outOfScope,null).status,'source-abstention');
  assert.throws(()=>guard.inspect(outOfScope,first.specimen),
   /QA8_UNQUALIFIED_CHART_MUST_ABSTAIN/);
  const doc=fs.readFileSync(__dirname+'/qa/qa7-editorial-work-note.md','utf8');
  const article=doc.split('## 독자용 첫 문단')[1]
   .split('## 편집 경계')[0].trim();
  assert(article.length>350);
  const qa7Prompt=originals.find(x=>
   x.prompt.facts.chart.year==='甲戌'&&
   x.prompt.facts.chart.month==='辛未'&&
   x.prompt.facts.chart.day==='壬寅'&&
   x.prompt.facts.chart.hour==='丁未').prompt;
  assert.equal(guard.checkQA7HistoricalScope(qa7Prompt,article).status,
   'qa7-exact-synthetic-chart-human-review');
  const alt=await capture({calendar:'solar',birthDate:'1994-07-15',
   birthTime:'20:20',gender:'male',mbti:'ISFP'});
  const other={...alt.prompt,requestedSections:['saju_core'],paidCoreDepthV2:true};
  assert.throws(()=>guard.checkQA7HistoricalScope(other,article),
   /QA8_QA7_CLASSICAL_PARAGRAPH_WRONG_CHART/);
  assert.equal(guard.checkQA7HistoricalScope(other,null).status,
   'classical-abstention');
  process.env.NODE_ENV='production';
  assert.throws(()=>guard.inspect(first.prompt,first.specimen),/QA8_CROSS_CHART_OFFLINE_ONLY/);
  process.env.NODE_ENV='test';process.env.RENDER='true';
  assert.throws(()=>guard.checkQA7HistoricalScope(qa7Prompt,article),/QA8_CROSS_CHART_OFFLINE_ONLY/);
  console.log('QA8_MULTICHART_TRANSFER='+JSON.stringify({
   distinctSourceOwnedFirstChapters:8,
   independentContractTypes:kinds.size,
   distinctVerifiedScenes:scenes.size,
   foreignChartCopyBlocked:true,forgedRefsAndSceneBlocked:true,
   unqualifiedChartAbstains:true,
   oneChartClassicalProseNotPortable:true,
   actualProviderCalls:0,expertReview:false,canSell:false
  }));
 }finally{
  for(const [k,v] of Object.entries(saved))
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
}
run().catch(e=>{console.error(e);process.exitCode=1});
