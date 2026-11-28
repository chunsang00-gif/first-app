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
// Calculated context for the ordinary first-chapter writer. It can rule
// out broad claims, but does not expand a topic's citation permissions.
function forPaidFirstChapter(packet){
 const evidence=build(packet);
 return {
  positions:Object.fromEntries(Object.entries(packet.chart).filter(([,value])=>value)),
  monthSeason:packet.facts.seasonalEvidence?.monthSeason??null,
  visibleRoles:[evidence.monthVisible,...evidence.otherVisible],
  dayMasterRoots:evidence.dayMasterRoots,
  natalRelations:evidence.natalRelations,
  unknownBirthHour:evidence.unknownBirthHour,
  measuredStrength:false,interpretivePriorityEstablished:false,
  readerBoundary:'태어난 날을 기준으로 태어난 달의 계절과 해·달·날·시간 관계를 먼저 대조한다. 다른 자리의 근거가 좁은 풀이를 제한하면 그만큼 판단을 좁힌다. 같은 글자나 관계가 반복돼도 강도나 사건 횟수로 세지 않는다. 시간을 모르면 그 자리를 추정하지 않는다. 본문은 해당 항목에서 허용한 인용으로 뒷받침할 수 있는 해석만 짧게 쓴다. 근거가 없는 조언, 관찰하지 않은 성격, 미래 사건으로 분량을 채우지 않는다.'
 };
}
// Lead with the verified month/hour role comparison when it changes the
// learning question. Otherwise use the existing branch comparison.
function firstChapterOpening(packet){
 const context=forPaidFirstChapter(packet);
 const month=context.visibleRoles.find(role=>role.position==='month');
 const hour=context.visibleRoles.find(role=>role.position==='hour');
 if(month?.category==='resource'&&hour?.relativeToMonth==='same-category-same-subtype'){
  return {
   text:'태어난 달과 시간의 겉글자에서 배움의 같은 뜻이 반복됩니다.',
   refs:[month.id,hour.id]
  };
 }
 if(month?.category==='resource'&&hour?.category==='output'){
  return {
   text:'태어난 달의 겉글자는 이해하는 뜻을, 시간의 겉글자는 표현하는 뜻을 가리킵니다.',
   refs:[month.id,hour.id]
  };
 }
 const labels={day:'날',hour:'시간',year:'해',month:'달'};
 const clashes=context.natalRelations.filter(row=>row.type==='충');
 const pair=clashes.find(row=>row.positions.includes('month')&&row.positions.includes('day'))||
  clashes.find(row=>row.positions.includes('month'))||clashes[0];
 if(!pair)return null;
 const [a,b]=pair.positions.map(position=>labels[position]);
 const join=a==='달'||a==='날'?'과':'와';
 return {
  text:'태어난 '+a+join+' '+b+'의 아랫글자는 서로 맞서는 관계입니다.',
  refs:['facts.natalBranchRelations']
 };
}
module.exports={build,forPaidFirstChapter,firstChapterOpening};
