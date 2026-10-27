'use strict';
// Candidate source envelope for the actual first paid chapter. This changes
// no released output. A computed symbol is not a verified life trait.
const bindings=require('./report-fact-bindings');
const graph=require('./report-stem-connections');
const REFS=['natal.year.stem','natal.day.stem','natal.hour.stem','facts.stemConnections'];
function build(packet){
 if(packet?.status!=='ready'||!packet.chart?.hour)throw Error('PAID_CORE_DEPTH_V2_HOUR_REQUIRED');
 if(JSON.stringify(graph.build(packet.chart))!==JSON.stringify(packet.facts?.stemConnections))
  throw Error('PAID_CORE_DEPTH_V2_INVALID_CALCULATION');
 const rows=Object.fromEntries(bindings.build(packet).map(x=>[x.id,x]));
 const positions=REFS.filter(id=>id.startsWith('natal.')).map(id=>{
  const row=rows[id],place=id.split('.')[1];
  if(row?.stem!==packet.chart[place][0]||!row.traditionalMeaning||
     row.observedBehavior!==false||row.interpretationScope!=='traditional-symbol-only')
   throw Error('PAID_CORE_DEPTH_V2_POSITION_DRIFT:'+id);
  return {id,stem:row.stem,role:row.tenGod,
   meaning:row.traditionalMeaning,observedBehavior:false};
 });
 const exposures=packet.facts.stemConnections.exposure.filter(x=>x.position==='month')
  .flatMap(x=>x.exactVisibleMatches.filter(v=>v.position==='year'||v.position==='hour')
   .map(v=>({hiddenRef:x.hiddenId,visibleRef:v.id,exactMatchOnly:true})));
 return {kind:'first-chapter-optional-full-chart-source-v1',
  sourceRefs:REFS.slice(),positions,exposures,
  comparisonScope:'computed-position-and-exact-exposure-only',
  observedPersonality:false,selectedTraditionalPriority:false,
  strengthAndTransformationUnassessed:true,
  approvedAsPremiumValue:false,customerQualityValidated:false,
  optionalSlot:'temperament',unchangedSlot:'strength'};
}
module.exports={build,REFS};