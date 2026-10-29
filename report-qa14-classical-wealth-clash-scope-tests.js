'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const qa13=require('./report-qa13-money-risk-independent-source');
const qa14=require('./report-qa14-classical-wealth-clash-scope');
const guidance=require('./report-analysis-guidance');
const capture=require('./report-core-paid-full-prompt-capture').capture;
const sample=[
 ['1982-11-24','14:20','lunar'],['1994-07-15','14:20','solar'],
 ['1994-01-15','14:20','solar'],['1994-05-15','20:20','solar'],
 ['1982-08-15','14:20','solar'],['1994-04-15','14:20','solar'],
 ['1994-06-15','14:20','solar'],['2006-08-15','14:20','solar'],
 ['2018-07-15','14:20','solar'],['1994-05-15','14:20','solar']
];
const env=['NODE_ENV','RENDER','PAID_CORE_DEPTH_V2',
 'PAID_CORE_V2_CLASSICAL_WRITER','PAID_CORE_V2_CLAIM_LINKS',
 'PAID_CORE_V2_REQUIRED_RESEARCH_SLOT'];
(async()=>{
 const original=Object.fromEntries(env.map(x=>[x,process.env[x]]));
 try{
  process.env.NODE_ENV='test';delete process.env.RENDER;
  for(const x of env.slice(2))delete process.env[x];
  assert.equal(qa14.SOURCE.length,3);
  assert.deepEqual(qa14.SOURCE.map(x=>x.chapter),[
   '七、論刑沖會合解法','八、論用神','十七、論墓庫刑沖之說'
  ]);
  assert.equal(qa14.pairType('辰戌'),'辰戌-four-storage');
  assert.equal(qa14.pairType('未丑'),'丑未-four-storage');
  assert.equal(qa14.pairType('子午'),'four-cardinal-opposition');
  assert.equal(qa14.pairType('寅申'),'four-birth-opposition');
  assert.throws(()=>qa14.pairType('子酉'),/QA14_UNCLASSIFIED_VERIFIED_CLASH/);
  const seen=[],firstMatches=[];
  let packetForNegative=null,zeroPacket=null;
  for(const [date,time,calendar] of sample){
   const input={calendar,birthDate:date,birthTime:time,
    gender:'male',mbti:'ISFP',...(calendar==='lunar'?{leapMonth:false}:{})};
   const packet=facts.build(input,2027);
   assert.equal(packet.status,'ready');
   const before=JSON.stringify(packet);
   const source=qa13.inspect(packet);
   const checked=qa14.inspect(packet);
   assert.equal(JSON.stringify(packet),before);
   assert.equal(checked.candidatesExamined,source.wealthAtClashEndpointCount);
   assert.equal(checked.fourStorageCandidates+checked.otherClashCandidates,
    checked.candidatesExamined);
   assert.equal(checked.classicalTextDoesNotImplyWealthLossFromAClash,true);
   assert.equal(checked.independentTraditionalMethodSelectionPerformed,false);
   assert.equal(checked.exactChapterExampleOrFavorablePatternConfirmed,false);
   assert.equal(checked.paidMoneyRiskTopicUnchanged,'state-limits');
   assert.equal(checked.canSell,false);
   assert.equal(checked.providerCalls,0);
   assert.equal(guidance.preflight(packet).money.topicTasks.risk.mode,'state-limits');
   for(const row of checked.candidates){
    assert(source.candidates.some(x=>x.wealthSourceId===row.sourceId&&
     x.branchPair===row.branchPair));
    assert(row.sourceId.startsWith('natal.'+row.clashPositions[0]+'.hidden.')||
     row.sourceId.startsWith('natal.'+row.clashPositions[1]+'.hidden.'));
    assert.equal(row.wealthPositionIsHidden,true);
    assert.equal(row.exactClassicWorkedCaseProven,false);
    assert.equal(row.wealthSymbolDamagedOrOpened,false);
    assert.equal(row.otherRelationPriorityChosen,false);
    assert.equal(row.positiveOrNegativeMoneyOutcomePredicted,false);
    assert.equal(row.customerMeaningApproved,false);
    assert(row.matchingStemVisibleAt.every(id=>{
     const pos=id.split('.')[1];return packet.chart[pos][0]===row.wealthStem;
    }));
    assert(row.clashClass.endsWith('four-storage')?
     row.methodologicalScope==='ch17-four-storage-branch-contrast-only':
     row.methodologicalScope.includes('ch17-four-storage-example-not-applicable'));
   }
   const summarized={
    input:date+' '+time+(calendar==='lunar'?' lunar':' solar'),
    chart:packet.chart,
    clashes:source.natalClashCount,
    candidates:checked.candidates.map(x=>({
     source:x.sourceId,wealth:x.wealthCategory,branches:x.branchPair,
     clashClass:x.clashClass,monthTouched:x.touchedMonth,
     visible:x.matchingStemVisibleAt,
     competing:x.competingPairRelationTypes,
     completeGroups:x.competingGroupMembershipTypes,
     sourceWorkedExamplePrerequisites:{earth:x.earthWealthCase,
      water:x.waterWealthCounterCase}
    }))
   };
   seen.push(summarized);
   if(checked.candidates.length)firstMatches.push(summarized);
   else zeroPacket=packet;
   packetForNegative=packet;
  }
  assert.equal(firstMatches.length,4,'QA13 candidates must remain four charts');
  assert(zeroPacket);
  // A verified clash without matching wealth and an entirely missing clash
  // cannot be decorated with a classical claim.
  assert.equal(qa14.inspect(zeroPacket).candidatesExamined,0);
  const tampered=structuredClone(packetForNegative);
  tampered.facts.natalClashes.push({type:'충',positions:['year','month'],
   branches:'子午',note:'fabricated'});
  assert.throws(()=>qa14.inspect(tampered),/QA13_CALCULATION_INTEGRITY_INVALID/);
  process.env.NODE_ENV='production';
  assert.throws(()=>qa14.inspect(packetForNegative),
   /QA14_CLASSICAL_SCOPE_OFFLINE_ONLY/);
  process.env.NODE_ENV='test';process.env.RENDER='true';
  assert.throws(()=>qa14.inspect(packetForNegative),
   /QA14_CLASSICAL_SCOPE_OFFLINE_ONLY/);
  console.log('QA14_CLASSICAL_WEALTH_CLASH='+JSON.stringify({
   checkedCharts:seen.length,chartsWithRelationCandidates:firstMatches.length,
   interpretationMethodApproved:false,
   chapter17AppliedOnlyToFourStorage:false,
   sourceScopeSeparatedByClashClass:true,
   paidRiskSlotStillDisabled:true,modelCalls:0,
   cases:seen
  }));
 }finally{
  for(const [k,v] of Object.entries(original))
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
