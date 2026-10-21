'use strict';
// Synthesizes verified natal SOURCE FACTS for human editorial review only.
// NOT a fortune prediction, validated personality inference or paid report.
const season=require('./report-seasonal-evidence');
const stems=require('./report-stem-connections');
const branch=require('./report-branch-relations');
const bindings=require('./report-fact-bindings');
const kb=require('./report-core-knowledge.json');
const ELEMENT={wood:'나무',fire:'불',earth:'흙',metal:'쇠',water:'물'};
const PERIOD={spring:'봄',summer:'여름',autumn:'가을',winter:'겨울'};
const POS={year:'해',month:'달',day:'날',hour:'시간'};
const CAT={비견:'peer',겁재:'peer',식신:'output',상관:'output',
 정재:'wealth',편재:'wealth',정관:'authority',편관:'authority',
 정인:'resource',편인:'resource'};
const LINK={
 'same-category-same-subtype':'같은 세부 분류가 반복됩니다. 그러나 뜻의 크기가 두 배라는 말은 아닙니다',
 'same-category-different-subtype':'같은 큰 계열이지만 세부 뜻이 달라 서로 나누어 해석해야 합니다',
 'different-category':'다른 계열이므로 둘을 한 가지 성격이나 결과로 합치면 안 됩니다'
};
const PERIOD_REL={
 'same-element':'계절 오행과 날의 중심 오행이 같은 계열',
 resource:'계절 오행이 날의 중심 오행을 생하는 관계',
 output:'날의 중심 오행이 계절 오행을 생하는 관계',
 'day-controls':'날의 중심 오행이 계절 오행을 제어하는 관계',
 'control-on-day':'계절 오행이 날의 중심 오행을 제어하는 관계'
};
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const meaning=god=>{
 const m=kb.tenGodScopes[god];
 if(typeof m!=='string')throw Error('CORE_CHART_SYNTHESIS_UNKNOWN_TEN_GOD');
 return m;
};
function select(packet,graph){
 const chart=packet?.chart;
 if(!chart?.year||!chart?.month||!chart?.day||!chart?.hour)return null;
 if(!graph||graph.unknownBirthHour!==false||graph.measuredStrength!==false||
    graph.personalityObserved!==false||graph.usedAnnualFacts!==false||
    graph.usedMbti!==false)throw Error('CORE_CHART_SYNTHESIS_GRAPH_REQUIRED');
 const month=season.evaluate(chart),provided=packet.facts?.seasonalEvidence;
 if(!provided||!['monthBranch','monthPhase','monthSeason','seasonToDayRelation','dayStem']
  .every(k=>provided[k]===month[k]))
  throw Error('CORE_CHART_SYNTHESIS_SEASON_DIVERGED');
 const rows=Object.fromEntries(bindings.build(packet).map(r=>[r.id,r]));
 const year=graph.otherVisible?.find(x=>x.position==='year');
 const monthVisible=graph.monthVisible;
 const hour=graph.otherVisible?.find(x=>x.position==='hour');
 const hiddenStem=season.HIDDEN[chart.month[1]]?.[0];
 const hid='natal.month.hidden.'+hiddenStem;
 if(rows['natal.day.stem']?.stem!==chart.day[0]||
    rows['natal.day.stem']?.tenGod!=='일간'||
    rows[hid]?.stem!==hiddenStem||
    rows[hid]?.tenGod!==packet.facts?.structuralEvidence?.monthCommand?.mainHiddenStemTenGod||
    !kb.tenGodScopes[rows[hid]?.tenGod])
  throw Error('CORE_CHART_SYNTHESIS_HIDDEN_DIVERGED');
 const check=[['year',year],['month',monthVisible],['hour',hour]];
 for(const [position,node] of check){
  const id='natal.'+position+'.stem',row=rows[id];
  if(node?.id!==id||row?.stem!==chart[position][0]||
     row?.tenGod!==node.tenGod||node.category!==CAT[node.tenGod]||
     node.strength!=='not-assessed'||!kb.tenGodScopes[node.tenGod])
   throw Error('CORE_CHART_SYNTHESIS_VISIBLE_DIVERGED:'+position);
 }
 if(!LINK[year.relativeToMonth]||!LINK[hour.relativeToMonth])
  throw Error('CORE_CHART_SYNTHESIS_COMPARISON_DIVERGED');
 const roots=stems.build(chart).dayMasterRooting.sameElementRoots;
 const graphRoots=graph.dayMasterRoots||[];
 if(!equal(roots.map(r=>[r.hiddenId,r.position,r.layer,r.type]),
  graphRoots.map(r=>[r.id,r.position,r.layer,r.matchType]))||
  graphRoots.some(r=>r.effectStrength!=='not-assessed'))
  throw Error('CORE_CHART_SYNTHESIS_ROOT_DIVERGED');
 const natal=branch.natal(chart),recorded=packet.facts?.natalBranchRelations;
 if(!equal(natal.pairs,recorded?.pairs)||!equal(natal.groups,recorded?.groups)||
    !equal(natal.pairs.map(r=>[r.type,r.branches,r.positions]),
     graph.natalRelations?.map(r=>{
      if(r.verdict!=='table-membership-only'||r.transformation!=='not-assessed'||
        !equal(r.sourceIds,['facts.natalBranchRelations']))
       throw Error('CORE_CHART_SYNTHESIS_RELATION_GRAPH_INVALID');
      return [r.type,r.branches,r.positions]
     })))
  throw Error('CORE_CHART_SYNTHESIS_RELATION_DIVERGED');
 const clauses=[
  '태어난 날의 중심 오행은 '+ELEMENT[month.dayElement]+' 계열입니다. 달의 겉글자 '+
   monthVisible.tenGod+'는 '+meaning(monthVisible.tenGod)+'이고, 달 안쪽 대표 글자의 '+
   rows[hid].tenGod+'는 '+meaning(rows[hid].tenGod)+
   '이므로 서로 다른 위치의 의미를 먼저 구별합니다.',
  '해의 겉글자 '+year.tenGod+'는 '+meaning(year.tenGod)+
   '입니다. 달의 '+monthVisible.tenGod+'와 비교하면 '+LINK[year.relativeToMonth]+
   '. 시간 겉글자의 '+hour.tenGod+'는 '+meaning(hour.tenGod)+
   '이며 달과 비교할 때 '+LINK[hour.relativeToMonth]+
   '. 따라서 출생월만으로 해와 시간의 의미까지 대신 설명할 수는 없습니다.'
 ];
 clauses.push(month.monthPhase==='transition'?
  '이 달은 '+PERIOD[month.monthSeason]+'의 전환월이므로 달 안쪽 대표 글자를 실제 계절의 우세나 전체 사주의 강약으로 단정하지 않습니다.':
  '이 달은 '+PERIOD[month.monthSeason]+'의 핵심월이며 '+
   PERIOD_REL[month.seasonToDayRelation]+'로 계산됩니다. 계절 관계가 실제 능력이나 기운의 강약을 측정한 것은 아닙니다.');
 const rootPositions=[...new Set(graphRoots.map(r=>r.position))];
 clauses.push(rootPositions.length?
  '날의 중심과 같은 오행의 숨은 글자는 출생 '+
   rootPositions.map(p=>POS[p]).join('·')+
   ' 자리에서 확인됩니다. 위치의 목록은 효과의 크기나 실제 성격을 나타내는 점수가 아닙니다.':
  '확인된 네 기둥의 숨은 글자에는 날의 중심과 같은 오행이 발견되지 않습니다. 찾지 못했다는 이유만으로 기운이 약하다고 판정할 수는 없습니다.');
 const priority={충:0,형:1,해:2,파:3,육합:4};
 const rank=r=>(r.positions.includes('day')?0:10)+(priority[r.type]??9);
 const picked=natal.pairs.slice().sort((a,b)=>rank(a)-rank(b)).slice(0,2);
 if(picked.length)clauses.push('출생 '+
  picked.map(r=>r.positions.map(p=>POS[p]).join('·')+' 사이의 '+r.type).join('와 ')+
  ' 관계가 지지 관계표에 해당합니다. 이는 실제 충돌이나 사건 발생을 뜻하지 않습니다.');
 if(natal.groups.length)clauses.push('또한 출생 '+
  natal.groups[0].positions.map(p=>POS[p]).join('·')+' 자리에 '+
  natal.groups[0].type+'의 세 글자가 나타납니다. 이것만으로 실제 합화나 오행 변화가 일어났다고 할 수는 없습니다.');
 clauses.push('이 비교는 달의 기본 뜻을 해와 시간의 차이, 날의 같은 오행 위치와 계절 관계까지 연결한 설명입니다. 개인의 관찰된 행동이나 미래의 결과에 대한 판단은 별도의 근거 없이는 하지 않습니다.');
 const text=clauses.join(' ');
 const sourceRefs=['natal.day.stem','natal.month.stem',hid,
  'natal.year.stem','natal.hour.stem','facts.seasonalEvidence',
  'facts.stemConnections',...graphRoots.map(r=>r.id)];
 if(picked.length||natal.groups.length)sourceRefs.push('facts.natalBranchRelations');
 const evidence={chart:{...chart},dayElement:month.dayElement,monthPhase:month.monthPhase,
  seasonToDayRelation:month.seasonToDayRelation,
  yearTenGod:year.tenGod,monthTenGod:monthVisible.tenGod,
  hiddenTenGod:rows[hid].tenGod,hourTenGod:hour.tenGod,
  yearRelativeToMonth:year.relativeToMonth,hourRelativeToMonth:hour.relativeToMonth,
  rootRefs:graphRoots.map(r=>r.id),
  relationPairs:picked.map(r=>({...r,positions:r.positions.slice()})),
  relationGroups:natal.groups.map(r=>({...r,positions:r.positions.slice()}))};
 return {reader:{label:'네 기둥을 연결해 확인한 해석 근거',text},
  sourceRefs:[...new Set(sourceRefs)],evidence,
  editorialStatus:'machine-composed-review-only',humanReviewRequired:true,
  releaseVerdict:'not-approved',apiCalls:0,
  limits:['no-observed-personality','no-strength-rating',
   'no-actual-transformation','no-predicted-events']};
}
module.exports={select};
