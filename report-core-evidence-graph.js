'use strict';
// Offline only: verified positional evidence to support human-reviewed
// contextual interpretation. Never measures personality, power, good/bad
// luck or an event. Does not feed paid generation until explicitly approved.
const qi=require('./report-qi-evidence');
const links=require('./report-stem-connections');
const relations=require('./report-branch-relations');
const bindings=require('./report-fact-bindings');
const {LunarUtil}=require('lunar-javascript');
const GOD={'比肩':'비견','劫财':'겁재','食神':'식신','伤官':'상관',
 '偏财':'편재','正财':'정재','七杀':'편관','正官':'정관',
 '偏印':'편인','正印':'정인'};
function tenGod(day,other){
 const value=GOD[LunarUtil.SHI_SHEN[day+other]];
 if(!value)throw Error('CORE_GRAPH_UNKNOWN_TEN_GOD');
 return value;
}
function equal(a,b){return JSON.stringify(a)===JSON.stringify(b)}
function build(packet){
 if(packet?.status!=='ready'||!packet.chart||!packet.facts)
  throw Error('CORE_GRAPH_VALIDATED_CALCULATION_REQUIRED');
 const chart=packet.chart,facts=packet.facts;
 // Rebuild from original chart rather than trusting a possibly modified
 // interpretation packet. Only fields directly used by this graph are checked.
 const expectedQi=qi.build(chart,facts.solarTermTiming);
 const expectedLinks=links.build(chart),expectedRelations=relations.natal(chart);
 if(!equal(facts.qiEvidence?.entries,expectedQi.entries)||
    !equal(facts.stemConnections?.dayMasterRooting,expectedLinks.dayMasterRooting)||
    !equal(facts.natalBranchRelations?.pairs,expectedRelations.pairs)||
    !equal(facts.natalBranchRelations?.groups,expectedRelations.groups))
  throw Error('CORE_GRAPH_CALCULATED_EVIDENCE_DIVERGED');
 const allRows=Object.fromEntries(bindings.build(packet).map(row=>[row.id,row]));
 const visible=[];
 for(const position of ['year','month','hour']){
  if(!chart[position])continue;
  const id='natal.'+position+'.stem';
  const row=allRows[id];
  const qiRow=expectedQi.entries.find(x=>x.id===id);
  const god=tenGod(chart.day[0],chart[position][0]);
  if(row?.tenGod!==god||row.stem!==chart[position][0]||
     qiRow?.stem!==row.stem||qiRow.position!==position)
   throw Error('CORE_GRAPH_VISIBLE_POSITION_DIVERGED:'+position);
  visible.push({id,position,tenGod:god,category:qiRow.category,
   relation:qiRow.relation,layer:'visible',strength:'not-assessed'});
 }
 const month=visible.find(x=>x.position==='month');
 if(!month)throw Error('CORE_GRAPH_MONTH_POSITION_MISSING');
 const otherVisible=visible.filter(x=>x.position!=='month')
  .map(x=>({...x,relativeToMonth:x.category===month.category?
   (x.tenGod===month.tenGod?'same-category-same-subtype':
    'same-category-different-subtype'):'different-category'}));
 const dayMaster=expectedLinks.dayMasterRooting;
 const roots=(dayMaster?.sameElementRoots||[]).map(x=>{
  const row=allRows[x.hiddenId];
  if(!row||row.stem!==x.hiddenStem||!chart[x.position]||
     row.layer!=='지장간'||x.type!=='exact-stem'&&x.type!=='same-element-different-stem')
   throw Error('CORE_GRAPH_ROOT_ROW_NOT_VERIFIED:'+x.hiddenId);
  return {id:x.hiddenId,position:x.position,layer:x.layer,
   matchType:x.type,effectStrength:'not-assessed'};
 });
 const natalRelations=expectedRelations.pairs.map(row=>({
  type:row.type,positions:row.positions.slice(),branches:row.branches,
  sourceIds:['facts.natalBranchRelations'],
  verdict:'table-membership-only',transformation:'not-assessed'
 }));
 return {
  version:'core-chart-graph-v1',monthVisible:month,otherVisible,
  dayMasterRoots:roots,dayMasterRootState:dayMaster?.rootObservationStatus||'unknown',
  natalRelations,unknownBirthHour:chart.hour==null,
  measuredStrength:false,personalityObserved:false,fortuneInferred:false,
  usedAnnualFacts:false,usedMbti:false
 };
}
module.exports={build};
