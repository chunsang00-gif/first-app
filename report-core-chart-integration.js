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
 const hiddenQuestion=QUESTIONS[insideCategory][1];
 const yearQuestion=roleQuestions[0].question;
 const hourQuestion=roleQuestions[2].question;
 const sameMeaning=(a,b)=>a===b?'같은 세부 분류':'같은 큰 계열의 다른 세부 분류';
 let point='',comparison='';
 if(focusKind==='month-hidden-links-year-and-hour'){
  point='달의 안쪽 '+insideGod+'와 해의 '+year.tenGod+
   ', 시간의 '+hour.tenGod+'가 같은 큰 계열이라는 점이 이 명식에서 먼저 구별할 부분입니다.';
  comparison='세 출처가 같은 계열이라고 한 가지 의미만 세 번 반복하지 말고, 달 안쪽에서는 '+
   hiddenQuestion+', 해에서는 '+yearQuestion+', 시간에서는 '+hourQuestion+'를 서로 구별해 살펴야 합니다.';
 }else if(focusKind==='month-hidden-links-year'){
  point='달의 안쪽 '+insideGod+'와 해의 '+year.tenGod+'는 '+
   sameMeaning(insideGod,year.tenGod)+'입니다. 시간의 '+hour.tenGod+
   '는 다른 계열로 계산된다는 점이 핵심 차이입니다.';
  comparison='따라서 달 안쪽에서 '+hiddenQuestion+'와 해에서 '+yearQuestion+
   '를 함께 확인하되, 시간에서는 별도로 '+hourQuestion+'를 물어야 합니다.';
 }else if(focusKind==='month-hidden-links-hour'){
  point='달의 안쪽 '+insideGod+'와 시간의 '+hour.tenGod+'는 '+
   sameMeaning(insideGod,hour.tenGod)+'입니다. 해의 '+year.tenGod+
   '는 다른 계열이므로 판단의 질문을 구별해야 합니다.';
  comparison='달 안쪽에서 '+hiddenQuestion+'와 시간에서 '+hourQuestion+
   '를 따로 확인하고, 해에서는 '+yearQuestion+'를 별도 질문으로 남겨 둡니다.';
 }else if(focusKind==='year-hour-same-ten-god'){
  point='해와 시간의 겉글자는 모두 '+year.tenGod+
   '로 계산되지만, 달 안쪽의 '+insideGod+'는 다른 계열입니다.';
  comparison='같은 십성이 반복된 사실을 성격이나 능력의 강도로 바꾸지 않고, 해에서 '+
   yearQuestion+'와 시간에서 '+hourQuestion+'를 각각 확인해야 합니다. 달 안쪽에서는 '+hiddenQuestion+'라는 별도 질문이 남습니다.';
 }else if(focusKind==='year-hour-same-category'){
  point='해의 '+year.tenGod+'와 시간의 '+hour.tenGod+
   '는 같은 큰 계열이지만 서로 다른 세부 분류입니다. 달 안쪽의 '+insideGod+'는 또 다른 계열입니다.';
  comparison='따라서 해에서 '+yearQuestion+', 시간에서 '+hourQuestion+
   '를 구별하고 달 안쪽에서는 '+hiddenQuestion+'라는 별도 조건을 확인해야 합니다.';
 }else{
  point='해의 '+year.tenGod+', 달 안쪽의 '+insideGod+
   ', 시간의 '+hour.tenGod+'는 서로 다른 세 계열입니다.';
  comparison='한 가지 상황에서 해의 '+yearQuestion+', 달 안쪽의 '+
   hiddenQuestion+', 시간의 '+hourQuestion+'를 구별해야 하며, 어느 한 기호가 나머지를 대신 설명하지 않습니다.';
 }
 const interpretiveFocus={kind:focusKind,sourceRefs:['natal.year.stem',hid,'natal.hour.stem'],
  categories:{year:year.category,monthHidden:insideCategory,hour:hour.category},
  tenGods:{year:year.tenGod,monthHidden:insideGod,hour:hour.tenGod},
  premise:point,conditionalReading:comparison,
  verdict:'review-only',observedPersonality:false,determinedStrength:false,
  eventPrediction:false};
 const described=roleQuestions.map(r=>
  '출생 '+POS[r.position]+'의 '+r.tenGod+'에서 확인할 질문은 '+r.question+'입니다.');
 const categoryContrast='해·달은 '+LINK[year.relativeToMonth]+
  '이며, 달·시간은 '+LINK[hour.relativeToMonth]+
  '입니다. 출생 위치 간 분류가 같다는 사실만으로 강도를 더하거나 실제 성격을 정할 수는 없습니다.';
 const clauses=[
  '이 명식에서 출생월의 두 뜻은 앞에서 살펴봤습니다. 여기서는 태어난 날의 '+ELEMENT[month.dayElement]+
   ' 오행을 기준으로 해·달·시간의 차이를 연결합니다.',
  described.join(' '),
  point+' '+comparison,
  categoryContrast
 ];
 clauses.push(month.monthPhase==='transition'?
  '계절을 확인하면 '+PERIOD[month.monthSeason]+
   '의 전환월입니다. 달의 대표 속글자가 있다고 해서 어느 오행이 실제로 우세한지는 결론내릴 수 없습니다.':
  '계절을 확인하면 '+PERIOD[month.monthSeason]+'의 핵심월이고 '+
   PERIOD_REL[month.seasonToDayRelation]+'입니다. 이는 전체 사주 강약을 확정하는 계산은 아닙니다.');
 const rootPositions=[...new Set(graphRoots.map(r=>r.position))];
 clauses.push(rootPositions.length?
  '날의 중심과 같은 오행의 숨은 글자가 확인된 출생 위치는 '+
   rootPositions.map(p=>POS[p]).join('·')+
   '입니다. 어느 자리에 있는지와 그 작용이 어느 정도인지는 다른 문제입니다.':
  '확인된 숨은 글자에는 날의 중심과 같은 오행이 나타나지 않습니다. 그렇다고 실제로 기운이 약하다고 단정할 수는 없습니다.');
 const priority={충:0,형:1,해:2,파:3,육합:4};
 const rank=r=>(r.positions.includes('day')?0:10)+(priority[r.type]??9);
 const picked=natal.pairs.slice().sort((a,b)=>rank(a)-rank(b)).slice(0,2);
 if(picked.length)clauses.push('지지 관계표에서는 '+
  picked.map(r=>r.positions.map(p=>POS[p]).join('·')+' 사이의 '+r.type).join('와 ')+
  '가 확인됩니다. 다른 위치 간 관계라는 뜻만 기록하며 실제 충돌이나 사건으로 확대하지 않습니다.');
 if(natal.groups.length)clauses.push('세 지지의 조합은 '+
  natal.groups[0].positions.map(p=>POS[p]).join('·')+' 자리에서 '+
  natal.groups[0].type+'으로 분류됩니다. 이것만으로 합화나 실제 오행 변화가 이루어졌다고 판단하지 않습니다.');
 clauses.push('이 판단의 초점은 확인된 출생 위치의 전통 분류를 구별하는 데 있습니다. 실제 생활을 관찰했거나 미래 결과를 예측했다는 뜻은 아닙니다.');
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
