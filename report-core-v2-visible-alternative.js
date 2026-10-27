'use strict';
// Conservative supplementary first-chapter candidate when there is NO
// independently selected exact month-hidden exposure. Contrasting a
// different calculated visible ten-god with the month-main role is not
// an "exposure", nor proof of dominant traits, real life or priority.
const bindings=require('./report-fact-bindings');
const graph=require('./report-stem-connections');
const symbolic=require('./report-core-paid-natal-visible-relation-bridge');
const plan=require('./report-core-v2-directional-writing-plan');
function build(packet,existingExact){
 if(existingExact||packet?.status!=='ready'||!packet.chart?.hour)return null;
 if(JSON.stringify(graph.build(packet.chart))!==JSON.stringify(packet.facts?.stemConnections))
  throw Error('V2_VISIBLE_ALTERNATIVE_STEM_GRAPH_MISMATCH');
 const lookup=Object.fromEntries(bindings.build(packet).map(x=>[x.id,x]));
 const mainStem=packet.facts?.structuralEvidence?.monthCommand?.mainHiddenStem;
 const mainId=mainStem?'natal.month.hidden.'+mainStem:null;
 const main=lookup[mainId],month=lookup['natal.month.stem'];
 if(!main?.tenGod||!main?.traditionalMeaning||
    !month?.tenGod||!month?.traditionalMeaning)return null;
 const monthHidden=new Set((packet.facts?.stemConnections?.exposure||[])
  .filter(x=>x.position==='month').map(x=>x.hiddenStem));
 const otherIds=['natal.year.stem','natal.hour.stem'];
 const eligible=otherIds.filter(id=>{
  const row=lookup[id],place=id.split('.')[1];
  return row?.stem===packet.chart[place]?.[0]&&
   row?.observedBehavior===false&&
   row?.interpretationScope==='traditional-symbol-only'&&
   !!row.tenGod&&!!row.traditionalMeaning&&
   row.tenGod!==main.tenGod&&row.tenGod!==month.tenGod&&
   // Do not relabel a hidden-month EXACT match as a simple comparison.
   !monthHidden.has(row.stem);
 });
 // Multiple unrelated visible candidates have no verified reading
 // priority. Neither choosing year over hour nor choosing the "best"
 // symbolic direction is justified by available facts.
 if(eligible.length!==1)return null;
 const selected=eligible[0],row=lookup[selected];
 const direction=symbolic.direction(main.stem,row.stem);
 const sourceRefs=['natal.month.stem',mainId,selected,'facts.stemConnections'];
 const candidate={
  kind:'verified-distinct-visible-category-conditional-comparison-v1',
  linkageKind:'different-visible-role-not-exact-month-hidden-exposure',
  visiblePosition:selected,mainMonthId:mainId,
  otherVisibleId:selected,
  mainRole:main.tenGod,otherRole:row.tenGod,
  monthMainToExposedElementDirection:direction,
  visiblePositionRelationVerified:true,
  realizedDirectionEffectVerified:false,
  sourceRefs,
  comparisonQuestion:'태어난 달의 대표 속글자와 '+(selected==='natal.year.stem'?'해':'시간')+
   ' 겉글자의 서로 다른 전통 분류 및 기운 관계를 비교할 때 한 가지 가상 선택에서 어떤 질문이 달라지는가?',
  sourceNovelty:'다른 달 속글자가 드러난 것이 아니라 출생 해 또는 시간에 실제로 있는 별도의 겉글자 분류',
  observedLifeEvents:false,realizedInfluenceVerified:false,
  prioritizationVerified:false,approvedForSale:false
 };
 candidate.readerWritingPlan=plan.forContrast(candidate);
 return candidate;
}
module.exports={build};