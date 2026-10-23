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
 'same-category-same-subtype':'같은 세부 분류',
 'same-category-different-subtype':'같은 큰 계열이지만 다른 세부 분류',
 'different-category':'서로 다른 계열'
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
 const QUESTIONS={
  peer:['누가 어떤 몫을 맡는지','서로의 담당 범위가 어디서 갈리는지','공동으로 쓸 몫은 어떻게 구분되는지'],
  output:['어떤 내용을 결과물로 남길지','표현을 바꾸더라도 지킬 내용은 무엇인지','남에게 전달할 형태는 무엇인지'],
  wealth:['어떤 자원이 필요한지','계속 준비할 항목과 별도로 구할 항목은 무엇인지','고른 자원이 실제 목적에 맞는지'],
  authority:['어떤 기준이 정해져 있는지','담당하는 역할의 경계가 어디인지','새 조건에서도 규칙이 그대로 적용되는지'],
  resource:['어떤 안내를 참고할지','낯선 내용을 어떻게 이해할지','이해한 내용의 출처를 어디서 확인할지']
 };
 const roleQuestions=[
  {position:'year',tenGod:year.tenGod,category:year.category,question:QUESTIONS[year.category][0]},
  {position:'month',tenGod:monthVisible.tenGod,category:monthVisible.category,question:QUESTIONS[monthVisible.category][1]},
  {position:'hour',tenGod:hour.tenGod,category:hour.category,question:QUESTIONS[hour.category][2]}
 ];
 const insideGod=rows[hid].tenGod;
 const insideCategory=CAT[insideGod];
 const linkedYear=year.category===insideCategory;
 const linkedHour=hour.category===insideCategory;
 const focusKind=linkedYear&&linkedHour?'month-hidden-links-year-and-hour':
  linkedYear?'month-hidden-links-year':
  linkedHour?'month-hidden-links-hour':
  year.tenGod===hour.tenGod?'year-hour-same-ten-god':
  year.category===hour.category?'year-hour-same-category':
  'three-separate-functions';
 // Keep specialized ten-god classifications and editorial questions in
 // evidence, not in prose. The following meaning categories are a symbolic
 // editorial analogy; no chart-specific behavior or success is inferred.
 const MEANING={
  peer:'함께 맡는 역할과 몫',
  output:'생각을 밖으로 표현하고 결과로 남기는 일',
  wealth:'필요한 자원과 비용의 관리',
  authority:'맡은 책임과 지켜야 할 기준',
  resource:'정보와 도움을 받아 배우는 과정'
 };
 const yearMeaning=MEANING[year.category];
 const hiddenMeaning=MEANING[insideCategory];
 const hourMeaning=MEANING[hour.category];
 if(!yearMeaning||!hiddenMeaning||!hourMeaning)
  throw Error('CORE_CHART_SYNTHESIS_READER_MEANING_MISSING');
 const sameMeaning=(a,b)=>a===b?'같은 성격의 상징':'비슷한 주제를 다른 방식으로 나타내는 상징';
 let point='',comparison='';
 if(focusKind==='month-hidden-links-year-and-hour'){
  point='태어난 달의 안쪽과 태어난 해, 시간에는 '+hiddenMeaning+
   '에 관한 비슷한 주제가 겹칩니다. 그렇다고 세 자리가 똑같은 역할을 한다는 뜻은 아닙니다.';
  comparison='예를 들어 함께 일을 준비하는 상황이라면, 달에서는 어떤 자원이 바탕이 되는지, 해에서는 누구와 그 몫을 나누는지, 시간에서는 무엇을 결과로 남길지를 구분해 읽어볼 수 있습니다. 이 차이는 계산 위치에 따른 풀이의 관점입니다.';
 }else if(focusKind==='month-hidden-links-year'){
  point='태어난 달의 안쪽과 해에는 '+sameMeaning(insideGod,year.tenGod)+
   '이 나타나고, 시간에는 '+hourMeaning+'라는 별도의 주제가 있습니다.';
  comparison='예를 들어 새 일을 준비할 때 달과 해에서 겹치는 뜻은 '+hiddenMeaning+
   '을 중심으로 비교하고, 시간에 드러난 '+hourMeaning+
   '은 별도의 관점으로 살펴볼 수 있습니다. 서로 다른 종류의 뜻을 한 가지 성격으로 뭉뚱그리지 않는 방식입니다.';
 }else if(focusKind==='month-hidden-links-hour'){
  point='태어난 달의 안쪽과 시간에는 '+sameMeaning(insideGod,hour.tenGod)+
   '이 나타나고, 해에서는 '+yearMeaning+'라는 다른 주제를 보여줍니다.';
  comparison='예를 들어 함께 일을 준비한다면 달과 시간에 겹치는 '+hiddenMeaning+
   '의 뜻을 비교하고, 해에 드러난 '+yearMeaning+
   '은 따로 살펴볼 수 있습니다. 어느 한 뜻이 다른 뜻보다 강하다는 결론은 아닙니다.';
 }else if(focusKind==='year-hour-same-ten-god'){
  point='태어난 해와 시간에는 같은 종류의 상징이 반복되지만, 달의 안쪽에는 '+hiddenMeaning+'이라는 다른 주제가 있습니다.';
  comparison='예를 들어 새로운 역할을 맡는다면 해와 시간에 모두 나타난 '+yearMeaning+
   '을 같은 출발점으로 보고, 달 안쪽의 '+hiddenMeaning+
   '은 다른 조건으로 분리해 읽을 수 있습니다. 반복된다는 사실을 실제 능력의 크기로 바꾸지는 않습니다.';
 }else if(focusKind==='year-hour-same-category'){
  point='태어난 해와 시간에는 모두 '+yearMeaning+
   '과 관련된 상징이 있지만 세부적인 구분은 다릅니다. 달의 안쪽에는 '+hiddenMeaning+'라는 다른 주제가 놓입니다.';
  comparison='예를 들어 함께 일을 준비할 때 해와 시간의 비슷한 뜻도 구분해 살펴보고, 달 안쪽의 '+hiddenMeaning+
   '을 별도의 관점으로 놓을 수 있습니다. 계산상 비슷하다는 이유로 동일한 행동을 예측하지는 않습니다.';
 }else{
  point='태어난 해에서는 '+yearMeaning+', 달의 안쪽에서는 '+hiddenMeaning+
   ', 시간에서는 '+hourMeaning+'이라는 서로 다른 주제가 나타납니다.';
  comparison='예를 들어 새로운 일을 계획할 때 이 세 뜻을 각각 분담, 준비 조건, 결과를 살피는 관점에 대입할 수 있습니다. 서로 다른 상징을 하나의 단정적인 성격 평가로 합치지 않는 풀이입니다.';
 }
 const interpretiveFocus={kind:focusKind,sourceRefs:['natal.year.stem',hid,'natal.hour.stem'],
  categories:{year:year.category,monthHidden:insideCategory,hour:hour.category},
  tenGods:{year:year.tenGod,monthHidden:insideGod,hour:hour.tenGod},
  premise:point,conditionalReading:comparison,
  verdict:'review-only',observedPersonality:false,determinedStrength:false,
  eventPrediction:false};
 // The reader should not be forced through an internal questionnaire.
 // Show a chart-specific contrast once, with a concrete hypothetical frame.
 const clauses=[
  '태어난 해와 달, 시간에 있는 서로 다른 뜻을 비교하면 '+point+' '+comparison,
  month.monthPhase==='transition'?
   '태어난 달은 '+PERIOD[month.monthSeason]+'이 바뀌는 시기에 해당합니다. 계절의 경계에 있다는 계산 사실만으로 무엇이 더 강하게 작용하는지는 알 수 없습니다.':
   '태어난 달은 '+PERIOD[month.monthSeason]+'에 속합니다. 태어난 날을 기준으로 계절과의 관계가 계산되지만, 이것만으로 전체 사주의 강약을 판정할 수는 없습니다.'
 ];
 const rootPositions=[...new Set(graphRoots.map(r=>r.position))];
 clauses.push(rootPositions.length?
  '태어난 날의 기준과 같은 종류의 기운이 안쪽에서 확인되는 자리는 '+
   rootPositions.map(p=>POS[p]).join('·')+
   '입니다. 어느 자리에 있는지와 그 작용이 어느 정도인지는 다른 문제입니다.':
  '확인된 숨은 글자에는 날의 중심과 같은 오행이 나타나지 않습니다. 그렇다고 실제로 기운이 약하다고 단정할 수는 없습니다.');
 const priority={충:0,형:1,해:2,파:3,육합:4};
 const rank=r=>(r.positions.includes('day')?0:10)+(priority[r.type]??9);
 const picked=natal.pairs.slice().sort((a,b)=>rank(a)-rank(b)).slice(0,2);
 if(picked.length)clauses.push('태어난 자리를 서로 비교하는 전통 관계표에도 대응하는 위치가 있습니다. 단순한 분류표의 일치만으로 생활 속 갈등이나 실제 사건을 예상할 수는 없습니다.');
 if(natal.groups.length)clauses.push('태어난 세 자리 사이에도 전통 관계표에 해당하는 조합이 확인됩니다. 이 표시만으로 어떤 변화가 실제 일어난다고 판단하지 않습니다.');
 clauses.push('이 설명은 계산된 상징을 읽어보는 예시입니다. 실제로 그런 행동을 한다거나 미래에 같은 일이 일어난다는 주장은 아닙니다.');
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
  roleQuestions:roleQuestions.map(r=>({...r})),
  interpretiveFocus,
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
