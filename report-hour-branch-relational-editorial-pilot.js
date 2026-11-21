'use strict';
// OFFLINE PRODUCT R&D ONLY. A change of hour alters which branches the
// hour-branch CLASHES with. This is a new *relational source*, not a new stem
// category and NOT a verified individual trait, career outcome or sellable
// traditional interpretation. Do not import into paid writer or checkout.
const data=require('./report-facts-node');
const branches=require('./report-branch-relations');
const free=require('./report-reading-sample');
const P=['year','month','day'];
const LABEL=Object.freeze({
 month:'출생월 자리',day:'출생일 자리',year:'출생년 자리',
 hour:'출생시간 자리'
});
function snapshot(input){
 const packet=data.build(input,2027);
 if(packet.status!=='ready'||!packet.chart?.hour||
    !packet.facts?.natalBranchRelations)
  throw Error('HOUR_RELATION_CHART_NOT_COMPLETE');
 const v=branches.natal(packet.chart);
 if(JSON.stringify(v)!==JSON.stringify(packet.facts.natalBranchRelations))
  throw Error('HOUR_RELATION_ENGINE_AND_PACKAGED_FACTS_DIFFER');
 const reading=free.build(packet);
 if(reading.status!=='calculated-example'||reading.modelCalls!==0||
    reading.completedPremiumParagraphs!==0)
  throw Error('HOUR_RELATION_REAL_FREE_BASELINE_UNAVAILABLE');
 const hourPairs=v.pairs.filter(x=>x.positions.includes('hour'));
 const stablePairs=v.pairs.filter(x=>!x.positions.includes('hour'));
 return Object.freeze({
  chart:packet.chart,
  hourPairs,
  stablePairs,
  fullNatalPairs:v.pairs,
  freeCards:reading.cards.map(c=>({id:c.id,title:c.title,text:c.text})),
  // This provenance is trustworthy as calculated relationship data only.
  sourceRef:'facts.natalBranchRelations',
  tableOnly:true,
  realisedLifeEvent:false,
  rolePriorityVerified:false
 });
}
function key(rel){return rel.type+'|'+rel.positions.join('-')+'|'+rel.branches}
function compare(a,b){
 if(!a||!b||a===b||
    ['calendar','birthDate','leapMonth','gender','mbti','readerDecision']
     .some(k=>a[k]!==b[k])||
    a.birthTime===b.birthTime)
  throw Error('HOUR_RELATION_COMPARE_REQUIRES_SAME_READER_AND_TWO_HOURS');
 const first=snapshot(a),second=snapshot(b);
 if(P.some(p=>first.chart[p]!==second.chart[p])||
    first.chart.hour===second.chart.hour||
    JSON.stringify(first.stablePairs)!==JSON.stringify(second.stablePairs))
  throw Error('HOUR_RELATION_NOT_A_PURE_HOUR_CONTRAST');
 const old=new Set(first.hourPairs.map(key));
 const newer=new Set(second.hourPairs.map(key));
 const onlyFirst=first.hourPairs.filter(x=>!newer.has(key(x)));
 const onlySecond=second.hourPairs.filter(x=>!old.has(key(x)));
 const clash=x=>x.filter(r=>r.type==='충'&&
  r.positions.filter(p=>p!=='hour').length===1);
 const lens=(rel,all)=>{
  const counterpart=rel.positions.find(p=>p!=='hour');
  if(!LABEL[counterpart])throw Error('UNKNOWN_HOUR_RELATION_COUNTERPART');
  // 丑未 appears as both 沖 and a pairwise 刑 table hit. They describe
  // ONE POSITION PAIR, not "two independent bad events". Preserve both
  // table labels but never double count intensity or infer an outcome.
  const onSameEndpoints=all.filter(x=>
   x.branches===rel.branches&&
   JSON.stringify(x.positions)===JSON.stringify(rel.positions));
  const categories=[...new Set(onSameEndpoints.map(x=>x.type))];
  if(!categories.includes('충'))throw Error('HOUR_CONTRAST_CLASH_LOST');
  return Object.freeze({
   type:rel.type,sourceRef:'facts.natalBranchRelations',
   endpoints:rel.positions.slice(),branches:rel.branches,
   samePairRelationLabels:Object.freeze(categories),
   adjacentPillars:Math.abs(['year','month','day','hour'].indexOf(counterpart)-3)===1,
   traditionalPositionQuestion:LABEL[counterpart]+'와 '+
    LABEL.hour+'의 관계를 구조적으로 비교하는 질문',
   onePairNotDoubleWeight:true,
   personalEventOrOutcomePredicted:false
  });
 };
 const left=clash(onlyFirst).map(x=>lens(x,first.hourPairs));
 const right=clash(onlySecond).map(x=>lens(x,second.hourPairs));
 return Object.freeze({
  kind:'offline-hour-to-other-pillar-branch-contrast-v1',
  status:left.length&&right.length?
   'chart-dependent-different-relational-endpoints':
   'no-distinct-hour-clash-pair-in-both-cases',
  sameYearMonthDay:true,
  sameReaderQuestion:true,
  basePillars:Object.freeze(Object.fromEntries(P.map(p=>[p,first.chart[p]]))),
  cases:Object.freeze([
   {hourTime:a.birthTime,hourPillar:first.chart.hour,
    hourRelationDeltas:left,allHourPairs:first.hourPairs,
    freeCardCount:first.freeCards.length,actualFreeCards:first.freeCards},
   {hourTime:b.birthTime,hourPillar:second.chart.hour,
    hourRelationDeltas:right,allHourPairs:second.hourPairs,
    freeCardCount:second.freeCards.length,actualFreeCards:second.freeCards}
  ]),
  unchangedNonHourPairCount:first.stablePairs.length,
  exactHourPairDeltaCount:first.hourPairs.length+second.hourPairs.length,
  underlyingStemsNotAnInterpretiveLicense:true,
  pairTableNotTransformationOrClassicalPriority:true,
  theoryMustExplainPositionsBeforeProductWriting:true,
  customerChoiceEffectProved:false,professionalMethodValidated:false,
  actualPremiumManuscriptWritten:false,paidWriterAuthorized:false,
  checkoutAuthorized:false,modelCalls:0
 });
}
module.exports={snapshot,compare};
