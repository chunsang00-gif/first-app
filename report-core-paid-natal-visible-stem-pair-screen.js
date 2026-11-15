'use strict';
// OFFLINE QA. Five traditional visible heavenly-stem pair tables, NOT actual
// 合化, 合去, strength, successful pattern or life outcome. All four pillars
// are checked, retaining exact position and separation by other stems.
const ledger=require('./report-fact-bindings');
const links=require('./report-stem-connections');
const PAIRS=Object.freeze({
 '甲己':'earth','乙庚':'metal','丙辛':'water','丁壬':'wood','戊癸':'fire'
});
const POS=['year','month','day','hour'];
const SOURCE={
 pairing:'https://changxianyi.com/guji/ziping/wz-20260914/chapter-005/',
 qualification:'https://changxianyi.com/guji/ziping/wz-20260914/chapter-006/'
};
const key=(a,b)=>[a,b].sort().join('');
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function inspect(packet){
 if(packet?.status!=='ready'||!packet.chart?.hour||!packet.facts)
  throw Error('QA_STEM_PAIR_INCOMPLETE_CHART');
 const actual=links.build(packet.chart);
 if(!same(actual,packet.facts.stemConnections))
  throw Error('QA_STEM_PAIR_SOURCE_CONNECTIONS_DIVERGED');
 const index=Object.fromEntries(ledger.build(packet).map(row=>[row.id,row]));
 const visible=POS.map((position,slot)=>{
  const id='natal.'+position+'.stem',row=index[id];
  if(!row||row.stem!==packet.chart[position]?.[0]||
     row.interpretationScope!=='traditional-symbol-only'||
     row.observedBehavior!==false)
   throw Error('QA_STEM_PAIR_STEM_OR_POSITION_DRIFT:'+position);
  return {id,position,slot,stem:row.stem};
 });
 const matches=[];
 for(let i=0;i<visible.length;i++)for(let j=i+1;j<visible.length;j++){
  const a=visible[i],b=visible[j],pairName=
   Object.keys(PAIRS).find(p=>key(...p)===key(a.stem,b.stem));
  if(!pairName)continue;
  const gap=b.slot-a.slot-1;
  matches.push({
   combination:pairName,
   from:a.id,to:b.id,
   fromStem:a.stem,toStem:b.stem,
   sourceRefs:[a.id,b.id],
   betweenPositions:POS.slice(a.slot+1,b.slot),
   interveningStemRefs:visible.slice(i+1,j).map(x=>x.id),
   adjacent:gap===0,
   matchedDayMaster:a.position==='day'||b.position==='day',
   traditionalAssociatedElement:PAIRS[pairName],
   tableMatchOnly:true,
   // Source chapter 5: own day-master pairing does NOT imply another
   // star is removed from the natal chart. Chapter 4 lists pairs;
   // neither chapter certifies transformation in this chart.
   ownDayStemNotAutomaticallyCombinedAway:true,
   pairReallyCombines:'not-assessed',
   transformedToElement:'not-assessed',
   whichInterpretationPrevails:'not-assessed'
  });
 }
 return {
  kind:'qa-visible-stem-pair-table-with-positional-separation-v1',
  fingerprint:POS.map(k=>packet.chart[k]).join('/'),
  sourceUrls:{...SOURCE},
  visiblePositions:visible.map(x=>({id:x.id,stem:x.stem})),
  matches,
  actualCombinationEstablished:false,
  elementalTransformationEstablished:false,
  conflictingElementalArrowsResolved:false,
  favorabilityOrStrengthDetermined:false,
  inferredPersonalityOrFuture:false,
  eligibleForPaidWriter:false,
  providerCalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={inspect,PAIRS};