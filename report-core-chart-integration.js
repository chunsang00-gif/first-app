'use strict';
// Synthesizes verified natal SOURCE FACTS for human editorial review only.
// NOT a fortune prediction, validated personality inference or paid report.
const season=require('./report-seasonal-evidence');
const stems=require('./report-stem-connections');
const branch=require('./report-branch-relations');
const bindings=require('./report-fact-bindings');
const kb=require('./report-core-knowledge.json');
const {LunarUtil}=require('lunar-javascript');
const TRADITIONAL_ROLE={'比肩':'비견','劫财':'겁재','食神':'식신',
 '伤官':'상관','偏财':'편재','正财':'정재','七杀':'편관',
 '正官':'정관','偏印':'편인','正印':'정인'};
const role=(day,stem)=>TRADITIONAL_ROLE[LunarUtil.SHI_SHEN[day+stem]];
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
    rows[hid]?.tenGod!==role(chart.day[0],hiddenStem)||
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
 const stemLinks=stems.build(chart);
 if(!equal(packet.facts?.stemConnections,stemLinks))
  throw Error('CORE_CHART_SYNTHESIS_STEM_EXPOSURE_SOURCE_DIVERGED');
 const roots=stemLinks.dayMasterRooting.sameElementRoots;
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
 // An exact month-hidden-to-visible match is a concrete explanation
 // constraint, not a priority, strength, or personality decision.
 // Ignore the day master as a separate exposure: it is the reference for
 // classification, not an independent year/month/hour visible placement.
 const monthExposures=stemLinks.exposure.filter(row=>row.position==='month')
  .map(row=>({
   hiddenId:row.hiddenId,hiddenStem:row.hiddenStem,layer:row.layer,
   visibleMatches:row.exactVisibleMatches
    .filter(v=>v.position!=='day')
    .map(v=>({sourceId:v.id,position:v.position}))
  }));
 const mainExposure=monthExposures.find(row=>row.hiddenId===hid);
 if(!mainExposure||mainExposure.layer!=='main')
  throw Error('CORE_CHART_SYNTHESIS_MONTH_MAIN_EXPOSURE_MISSING');
 const mainPositions=mainExposure.visibleMatches.map(x=>x.position);
 const otherExposures=monthExposures.filter(row=>row.layer!=='main'&&
  row.visibleMatches.length>0);
 const otherMatches=otherExposures.flatMap(row=>row.visibleMatches.map(v=>({
  hiddenId:row.hiddenId,sourceId:v.sourceId,position:v.position
 })));
 // Every other exposed month-hidden stem must have an independently
 // verified ledger role. A generic link graph alone is not its semantic
 // classification or a sufficient source row for reader explanations.
 for(const item of otherExposures){
  const row=rows[item.hiddenId];
  if(!row||row.stem!==item.hiddenStem||
     !CAT[row.tenGod]||row.tenGod!==role(chart.day[0],item.hiddenStem)||
     row.observedBehavior!==false||
     row.interpretationScope!=='traditional-symbol-only')
   throw Error('CORE_CHART_SYNTHESIS_SECONDARY_EXPOSURE_SOURCE_DIVERGED:'+item.hiddenId);
 }
 const exposureStatus=mainPositions.length?
  (otherMatches.length?'main-and-other-exposed':'month-main-exposed-only'):
  (otherMatches.length?'other-month-hidden-exposed-only':'no-nonday-exposure');
 const display=positions=>[...new Set(positions)].map(p=>
  p==='month'?'태어난 달':p==='year'?'태어난 해':'태어난 시간').join('·');
 const MEANING={
  peer:'함께 맡는 역할과 몫',
  output:'생각을 밖으로 표현하고 결과로 남기는 일',
  wealth:'필요한 자원과 비용의 관리',
  authority:'맡은 책임과 지켜야 할 기준',
  resource:'정보와 도움을 받아 배우는 과정'
 };
 const mainMeaning=MEANING[CAT[rows[hid]?.tenGod]];
 const otherMeaning=otherExposures.length?
  [...new Set(otherExposures.map(x=>MEANING[CAT[rows[x.hiddenId]?.tenGod]]))].join('과 '):null;
 if(!mainMeaning||(otherExposures.length&&!otherMeaning))
  throw Error('CORE_CHART_SYNTHESIS_MONTH_EXPOSURE_READER_MEANING_MISSING');
 const exposureReason=exposureStatus==='main-and-other-exposed'?
  '태어난 달의 가장 기본이 되는 안쪽 글자가 '+display(mainPositions)+
   '의 겉에도 그대로 나타나고, 달의 다른 안쪽 글자도 '+display(otherMatches.map(x=>x.position))+
   '에서 확인됩니다. 앞의 글자는 '+mainMeaning+', 다른 글자는 '+otherMeaning+
   '이라는 관점으로 구분됩니다. 둘 다 드러났다는 사실만으로 무엇이 중심인지 결정할 수는 없습니다.':
  exposureStatus==='month-main-exposed-only'?
   '태어난 달의 가장 기본이 되는 안쪽 글자는 '+display(mainPositions)+
    '의 겉에도 그대로 나타납니다. 여기에서 확인되는 주제는 '+mainMeaning+
    '입니다. 다른 안쪽 글자에서는 같은 겉자리 대응이 확인되지 않지만, 이것만으로 실제 능력이나 강약을 판단할 수는 없습니다.':
  exposureStatus==='other-month-hidden-exposed-only'?
   '태어난 달의 가장 기본이 되는 안쪽 글자는 해·달·시간의 겉에 그대로 나타나지 않습니다. 대신 달의 다른 안쪽 글자가 '+display(otherMatches.map(x=>x.position))+
    '의 겉에 나타납니다. 기본 글자는 '+mainMeaning+', 실제로 드러난 다른 글자는 '+otherMeaning+
    '이라는 주제로 구분해 읽습니다. 어느 쪽을 우선할지는 전체 사주를 따로 검토해야 합니다.':
   '태어난 달의 기본 글자는 '+mainMeaning+
   '을 뜻하지만, 달의 안쪽 글자 가운데 해·달·시간의 겉글자에 그대로 드러난 경우는 확인되지 않습니다. 그렇다고 이 주제가 실제 생활에서 없거나 약하다는 뜻은 아닙니다.';
 const exposureEvidence={
  kind:'month-hidden-to-nonday-visible-observation-v1',
  sourceRefs:['facts.stemConnections',hid,
   ...otherExposures.map(row=>row.hiddenId),
   'natal.year.stem','natal.month.stem','natal.hour.stem'],
  status:exposureStatus,mainSourceId:hid,mainVisiblePositions:mainPositions,
  otherMatches,displayedReaderReason:exposureReason,
  monthPatternPriority:'not-assessed',
  strengthVerified:false,personalBehaviorObserved:false
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
  comparison='예를 들어 함께 일을 준비하는 상황이라면 세 자리에 공통으로 나타난 '+hiddenMeaning+'이라는 주제를 위치별로 나눠 읽어볼 수 있습니다. 하지만 반복됐다는 이유로 실제 능력이 크거나 삶에서 그 일을 더 많이 겪는다고 판단할 수는 없습니다.';
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
  exposureReason,
  month.monthPhase==='transition'?
   '태어난 달은 '+PERIOD[month.monthSeason]+'이 바뀌는 시기에 해당합니다. 계절의 경계에 있다는 계산 사실만으로 무엇이 더 강하게 작용하는지는 알 수 없습니다.':
   '태어난 달은 '+PERIOD[month.monthSeason]+'에 속합니다. 태어난 날을 기준으로 계절과의 관계가 계산되지만, 이것만으로 전체 사주의 강약을 판정할 수는 없습니다.'
 ];
 const rootPositions=[...new Set(graphRoots.map(r=>r.position))];
 clauses.push(rootPositions.length?
  '태어난 날의 기준과 같은 종류의 기운이 안쪽에서 확인되는 자리는 '+
   rootPositions.map(p=>POS[p]).join('·')+
   '입니다. 어느 자리에 있는지와 그 작용이 어느 정도인지는 다른 문제입니다.':
  '태어난 날의 기준과 같은 종류의 기운이 안쪽에서 확인되지 않습니다. 그렇다고 실제로 기운이 약하다고 단정할 수는 없습니다.');
 // Preserve ALL independently calculated table labels. An arbitrary
 // "clash before combination" order, or truncating to the first two labels,
 // silently asserts an unvalidated traditional priority. The exact table
 // data is already available and must be used without selective ranking.
 const fullPairs=natal.pairs.map(r=>({...r,positions:r.positions.slice()}));
 const contacts=new Map();
 for(const relation of fullPairs){
  const key=relation.positions.slice().sort().join('/');
  if(!contacts.has(key))contacts.set(key,{
   positions:relation.positions.slice(),tableLabels:[]});
  contacts.get(key).tableLabels.push(relation.type);
 }
 const distinctContacts=[...contacts.values()];
 const duplicatedLabels=distinctContacts.filter(x=>x.tableLabels.length>1);
 const displayPositions=x=>x.map(p=>POS[p]).join('·');
 const directContacts=distinctContacts.filter(x=>x.positions.includes('month'));
 const contactReason=duplicatedLabels.length?
  '태어난 '+displayPositions(duplicatedLabels[0].positions)+
   ' 사이의 관계가 표에서 서로 다른 이름으로도 표시됩니다. 이를 별개의 두 사건이나 더 강한 영향으로 세지 않습니다.':
  directContacts.length>1?
   '태어난 달과 연결된 관계가 '+directContacts.length+
   '개의 서로 다른 출생 자리 조합에서 확인됩니다. 어느 관계가 먼저 작용하는지 이 계산만으로 결정하지 않습니다.':
  directContacts.length===1?
   '태어난 '+displayPositions(directContacts[0].positions)+
   ' 사이에 관계표의 대응이 있습니다. 같은 조건에서 실제 일이 일어나는지는 알 수 없습니다.':
  distinctContacts.length?
   '출생 자리 사이에 관계표의 대응이 있지만, 태어난 달의 의미가 다른 자리보다 우선한다고 볼 근거는 아닙니다.':
   '출생 자리 사이에 이 관계표에서 확인된 짝은 없습니다. 그렇다고 특정한 인간관계나 변화가 없다는 뜻은 아닙니다.';
 if(distinctContacts.length)clauses.push(contactReason);
 if(natal.groups.length)clauses.push('태어난 세 자리 사이에도 관계표에 기록된 조합이 있습니다. 이 사실만으로 어떤 변화가 실제 일어난다고 예측하지 않습니다.');
 clauses.push('이 설명은 계산된 상징을 읽어보는 예시입니다. 실제로 그런 행동을 한다거나 미래에 같은 일이 일어난다는 주장은 아닙니다.');
 const text=clauses.join(' ');
 const sourceRefs=['natal.day.stem','natal.month.stem',hid,
  'natal.year.stem','natal.hour.stem','facts.seasonalEvidence',
  'facts.stemConnections',...otherExposures.map(r=>r.hiddenId),
  ...graphRoots.map(r=>r.id)];
 if(fullPairs.length||natal.groups.length)sourceRefs.push('facts.natalBranchRelations');
 const evidence={chart:{...chart},dayElement:month.dayElement,monthPhase:month.monthPhase,
  seasonToDayRelation:month.seasonToDayRelation,
  yearTenGod:year.tenGod,monthTenGod:monthVisible.tenGod,
  hiddenTenGod:rows[hid].tenGod,hourTenGod:hour.tenGod,
  yearRelativeToMonth:year.relativeToMonth,hourRelativeToMonth:hour.relativeToMonth,
  rootRefs:graphRoots.map(r=>r.id),
  exposureEvidence,
  roleQuestions:roleQuestions.map(r=>({...r})),
  interpretiveFocus,
  relationPairs:fullPairs,
  relationGroups:natal.groups.map(r=>({...r,positions:r.positions.slice()})),
  relationSummary:{
   kind:'unranked-calculated-branch-table-contacts-v1',
   pairTableEntries:fullPairs.length,
   independentContacts:distinctContacts.map(x=>({
    positions:x.positions.slice(),tableLabels:x.tableLabels.slice()})),
   sameContactWithMultipleLabels:duplicatedLabels.map(x=>({
    positions:x.positions.slice(),tableLabels:x.tableLabels.slice()})),
   monthIndependentContactCount:directContacts.length,
   anyGroupCount:natal.groups.length,
   displayedReaderReason:contactReason,
   adoptedPriority:'none',inferredLifeEvents:false,
   measuredInteractionStrength:false
  }};
 return {reader:{label:'네 기둥을 연결해 확인한 해석 근거',text},
  sourceRefs:[...new Set(sourceRefs)],evidence,
  editorialStatus:'machine-composed-review-only',humanReviewRequired:true,
  releaseVerdict:'not-approved',apiCalls:0,
  limits:['no-observed-personality','no-strength-rating',
   'no-actual-transformation','no-predicted-events']};
}
module.exports={select};
