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
   const careerChange=result.byChapter.career.entries.find(x=>x.topicId==='change');
   const eligibleDecade=require('./report-paid-career-decade-reading').candidate(packet);
   assert.equal(careerChange.eligibleForModelDraft,
    result.byChapter.career.selected&&Boolean(eligibleDecade),
    'the previously disabled career topic may appear ONLY for a verified independent decade pair');
   if(eligibleDecade){
    assert.deepEqual(careerChange.explicitSourceRefs,eligibleDecade.sourceRefs);
    assert.equal(eligibleDecade.predictedJobChange,false);
   }
   assert.equal(result.countPolicyDisabled,3);
   assert.equal(result.structurallyPossibleTopicSlotsAtMost,25);
   assert.equal(result.minimumGapTo35EvenForOptimisticChart,10);
   assert.equal(result.actualGeneratedTopics,0);
   assert.equal(result.canPromise35,false);
   assert.equal(result.canSell,false);
   assert.equal(result.providerCalls,0);
   assert(result.eligibleSlots<=25);
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
  assert(observations[0].eligibleTopicUpperBound>=20&&
   observations[0].eligibleTopicUpperBound<=21);
  assert.equal(observations[1].selectedChapters,10);
  assert(observations[1].eligibleTopicUpperBound>=19&&
   observations[1].eligibleTopicUpperBound<=20);
  // Confirm a REAL calculated chart can actually unlock this topic:
  // otherwise 'possible' is only a marketing counter, not an executable
  // product improvement. No model calls, no birth data is exported.
  let positive=null;
  for(let year=1978;year<=2006;year+=2){
   const input={calendar:'solar',birthDate:year+'-07-15',
    birthTime:'14:20',gender:'male',mbti:'ISFP'};
   const packet=facts.build(input,2027);
   if(packet.status!=='ready')continue;
   const verified=require('./report-paid-career-decade-reading').candidate(packet);
   if(verified){positive={packet,verified};break}
  }
  assert(positive,'an independent chart must really qualify for a current-decade career comparison');
  const plan=require('./report-analysis-guidance').preflight(positive.packet);
  assert.equal(plan.career.topicTasks.change.mode,'use-primary');
  assert.deepEqual(plan.career.topicTasks.change.allowedSourceRefs,
   positive.verified.sourceRefs);
  const selected=require('./report-chapter-selection')
   .select(require('./report-qa11-premium-scope-audit').GROUPS,plan);
  assert(selected.plannedIds.includes('career'));
  const writer=require('./report-generation-request');
  const prompt={stage:'body',facts:positive.packet,requestedSections:['career'],
   analysisGuidance:{...require('./report-analysis-guidance')
    .forRequest(['career'],positive.packet.person.mbti),editorialBlueprint:plan},
   rules:{sectionGoals:require('./report-prompt').sectionGoals},priorSections:[]};
  const compiled=writer.compile(prompt);
  const item=compiled.task.chapters.career.topics.change;
  assert.deepEqual(item.sourceOwnedDecadeCareer,positive.verified);
  const spec=writer.schema(prompt,require('./report-wire')
   .schemaFor(prompt,require('./report-schema.json')));
  const field=spec.properties.chapters.properties.career.properties.paragraphs.properties.change;
  const slot=field.anyOf?.find(x=>x.type==='object')||field;
  assert.deepEqual(slot.properties.basis.properties.condition.enum,
   [positive.verified.computedCondition],
   'actual paid JSON contract must constrain decade comparison to original evidence');
  const paragraph={label:'출생 사주와 대운을 구별하는 조건',
   text:'출생 사주의 직업 관련 분류와 2027년을 포함한 대운은 같은 분야에서도 서로 다른 질문을 다룹니다. 이 계산만으로 실제 이직이나 승진을 알 수는 없습니다.',
   basis:{refs:positive.verified.sourceRefs.slice(),
    interpretation:'두 시기의 같은 분류군 안에서 실제 십성 종류가 다릅니다.',
    condition:positive.verified.computedCondition,
    limit:'실제 이직·승진·직업 성과를 예측하지 않습니다.'}};
  const response=x=>({chapters:{career:{paragraphs:{change:x}}}});
  assert.doesNotThrow(()=>writer.restoreEvidence(response(paragraph),prompt));
  const wrongPeriod=structuredClone(paragraph);
  wrongPeriod.basis.refs=wrongPeriod.basis.refs.filter(x=>x!=='fortune.activeDecade');
  assert.throws(()=>writer.restoreEvidence(response(wrongPeriod),prompt),
   /career decade evidence missing: career:change/,
   'an unsupported decade claim must never be accepted as a paid paragraph');
  const generic=structuredClone(paragraph);
  generic.basis.condition='직업을 바꿀 때 신중하게 판단합니다.';
  assert.throws(()=>writer.restoreEvidence(response(generic),prompt),
   /career decade evidence missing: career:change/,
   'general career advice cannot replace two chart-specific sources');
  const tampered=structuredClone(positive.packet);
  tampered.fortune.activeDecade.pillar='甲子'===tampered.fortune.activeDecade.pillar?'乙丑':'甲子';
  assert.throws(()=>require('./report-paid-career-decade-reading').candidate(tampered),
   /PAID_CAREER_DECADE_ORIGINAL_ROW_MISMATCH/,
   'a fabricated active decade must not enter the paid provider');
  process.env.NODE_ENV='production';
  assert.throws(()=>audit.inspect(lastPacket,last),
   /QA12_PREPAID_DIAGNOSTIC_OFFLINE_ONLY/);
  process.env.NODE_ENV='test';process.env.RENDER='true';
  assert.throws(()=>audit.inspect(lastPacket,last),
   /QA12_PREPAID_DIAGNOSTIC_OFFLINE_ONLY/);
  console.log('QA12_CHAPTER_TOPIC_EVIDENCE='+JSON.stringify({
   charts:observations.length,definedChapters:12,definedTopics:28,
   currentPolicyDisabledTopics:3,maximumPotentialBeforeChartSelection:25,
   minimumUnreachable35TopicGap:10,
   archivedPaidResponsesUnchanged:true,actualProviderCalls:0,
   businessScopeFullyAuthorized:false,cases:observations
  }));
 }finally{
  for(const [k,v] of Object.entries(saved))
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
