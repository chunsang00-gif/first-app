'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const capture=require('./report-core-paid-full-prompt-capture').capture;
const audit=require('./report-qa12-chapter-topic-evidence-matrix');
const outline=require('./report-outline');
const cases=[
 {calendar:'lunar',leapMonth:false,birthDate:'1982-11-24',
  birthTime:'14:20',gender:'male',mbti:'ISFP',name:'검증용'},
 {calendar:'solar',birthDate:'1994-07-15',
  birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'1994-01-15',
  birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'1994-05-15',
  birthTime:'20:20',gender:'male',mbti:'ISFP'}
];
const keys=['NODE_ENV','RENDER','PAID_CORE_DEPTH_V2',
 'PAID_CORE_V2_CLASSICAL_WRITER','PAID_CORE_V2_CLAIM_LINKS',
 'PAID_CORE_V2_REQUIRED_RESEARCH_SLOT'];
(async()=>{
 const saved=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 try{
  process.env.NODE_ENV='test';delete process.env.RENDER;
  for(const k of keys.slice(2))delete process.env[k];
  const observations=[],allStates=new Set();
  let last=null,lastPacket=null;
  for(const input of cases){
   const packet=facts.build(input,2027);
   assert.equal(packet.status,'ready');
   const snapshot=await capture(input);
   assert.equal(snapshot.providerCalls,0);
   assert.equal(snapshot.status,'captured-full-paid-composition');
   const unchanged=JSON.stringify(snapshot.prompt);
   const result=audit.inspect(packet,snapshot.prompt);
   assert.equal(JSON.stringify(snapshot.prompt),unchanged);
   assert.equal(result.targetTopics,35);
   assert.equal(result.definedTopics,28);
   assert.equal(result.countPolicyDisabled,5);
   assert.equal(result.structurallyPossibleTopicSlotsAtMost,23);
   assert.equal(result.minimumGapTo35EvenForOptimisticChart,12);
   assert.equal(result.actualGeneratedTopics,0);
   assert.equal(result.canPromise35,false);
   assert.equal(result.canSell,false);
   assert.equal(result.providerCalls,0);
   assert(result.eligibleSlots<=23);
   assert(result.eligibleSlots<=result.selectedDefinedSlots);
   assert.equal(Object.keys(result.byChapter).length,12);
   const rows=Object.values(result.byChapter).flatMap(x=>x.entries);
   assert.equal(rows.length,28);
   assert.deepEqual(rows.map(x=>x.chapterId+'.'+x.topicId),
    Object.entries(outline.topics).flatMap(([c,ts])=>Object.keys(ts).map(t=>c+'.'+t)));
   assert.deepEqual(rows.filter(x=>x.permanentlyDisabledByCurrentPolicy)
    .map(x=>x.chapterId+'.'+x.topicId),audit.CONSTRAINED);
   for(const row of rows){
    if(row.permanentlyDisabledByCurrentPolicy)assert.equal(row.mode,'state-limits');
    if(row.eligibleForModelDraft){
     assert(row.selected);
     assert.notEqual(row.mode,'state-limits');
     assert(['calculated-source-candidate-not-personal-observation',
      'only-secondary-calculated-evidence'].includes(row.reason));
    }
    if(!row.selected)assert.equal(row.eligibleForModelDraft,false);
    if(row.anchor&&row.selected)assert(row.eligibleForModelDraft);
    if(row.mode==='state-limits'&&row.selected)assert.equal(row.eligibleForModelDraft,false);
    allStates.add(row.mode);
   }
   const disabled=rows.filter(x=>x.selected&&!x.eligibleForModelDraft)
    .map(x=>x.chapterId+'.'+x.topicId+':'+x.reason);
   const omitted=result.omittedChapters.map(x=>x.id+':'+x.reason);
   observations.push({
    birthDate:input.birthDate,calendar:input.calendar,
    selectedChapters:result.selectedChapters.length,
    eligibleTopicUpperBound:result.eligibleSlots,
    selectedDefinedSlots:result.selectedDefinedSlots,
    omittedChapters:omitted,blockedSelectedTopics:disabled,
    perChapter:Object.fromEntries(Object.entries(result.byChapter)
     .map(([id,row])=>[id,row.selected?row.eligible+'/'.concat(String(row.defined)):'omitted']))
   });
   last=snapshot.prompt;lastPacket=packet;
  }
  assert(allStates.has('state-limits')&&allStates.has('use-primary'));
  assert.equal(observations[0].selectedChapters,9);
  assert.equal(observations[0].eligibleTopicUpperBound,19);
  assert.equal(observations[1].selectedChapters,10);
  assert.equal(observations[1].eligibleTopicUpperBound,19);
  process.env.NODE_ENV='production';
  assert.throws(()=>audit.inspect(lastPacket,last),
   /QA12_PREPAID_DIAGNOSTIC_OFFLINE_ONLY/);
  process.env.NODE_ENV='test';process.env.RENDER='true';
  assert.throws(()=>audit.inspect(lastPacket,last),
   /QA12_PREPAID_DIAGNOSTIC_OFFLINE_ONLY/);
  console.log('QA12_CHAPTER_TOPIC_EVIDENCE='+JSON.stringify({
   charts:observations.length,definedChapters:12,definedTopics:28,
   currentPolicyDisabledTopics:5,maximumPotentialBeforeChartSelection:23,
   minimumUnreachable35TopicGap:12,
   archivedPaidResponsesUnchanged:true,actualProviderCalls:0,
   businessScopeFullyAuthorized:false,cases:observations
  }));
 }finally{
  for(const [k,v] of Object.entries(saved))
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
