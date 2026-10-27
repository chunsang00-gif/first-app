'use strict';
// Candidate source envelope for the actual first paid chapter. This changes
// no released output. A computed symbol is not a verified life trait.
const bindings=require('./report-fact-bindings');
const graph=require('./report-stem-connections');
const pairing=require('./report-core-paid-natal-visible-stem-pair-screen');
const directions=require('./report-core-paid-natal-visible-relation-bridge');
const REFS=['natal.year.stem','natal.day.stem','natal.hour.stem','facts.stemConnections'];
function build(packet){
 if(packet?.status!=='ready'||!packet.chart?.hour)throw Error('PAID_CORE_DEPTH_V2_HOUR_REQUIRED');
 if(JSON.stringify(graph.build(packet.chart))!==JSON.stringify(packet.facts?.stemConnections))
  throw Error('PAID_CORE_DEPTH_V2_INVALID_CALCULATION');
 const rows=Object.fromEntries(bindings.build(packet).map(x=>[x.id,x]));
 const positions=REFS.filter(id=>id.startsWith('natal.')).map(id=>{
  const row=rows[id],place=id.split('.')[1];
  if(row?.stem!==packet.chart[place][0]||(!row.traditionalMeaning&&place!=='day')||
     row.observedBehavior!==false||row.interpretationScope!=='traditional-symbol-only')
   throw Error('PAID_CORE_DEPTH_V2_POSITION_DRIFT:'+id);
  return {id,stem:row.stem,role:row.tenGod,
   meaning:row.traditionalMeaning,observedBehavior:false};
 });
 const pairAudit=pairing.inspect(packet);
 const visiblePairCandidates=pairAudit.matches.map(row=>({
  from:row.from,to:row.to,
  combination:row.combination,
  adjacent:row.adjacent,
  betweenPositions:row.betweenPositions.slice(),
  tableMatchOnly:true,
  actualCombinationEstablished:false,
  transformationVerified:false,
  usableForLifePrediction:false
 }));
 const visibleElementDirections=[
  ['year','hour'],['day','hour'],['hour','month']
 ].map(([from,to])=>({
  from:'natal.'+from+'.stem',to:'natal.'+to+'.stem',
  direction:directions.direction(packet.chart[from][0],packet.chart[to][0]),
  literalElementRelationOnly:true,realizedEffectVerified:false
 }));
 const exposures=packet.facts.stemConnections.exposure.filter(x=>x.position==='month')
  .flatMap(x=>x.exactVisibleMatches.filter(v=>v.position==='year'||v.position==='hour')
   .map(v=>({hiddenRef:x.hiddenId,visibleRef:v.id,exactMatchOnly:true})));
 const mainStem=packet.facts.structuralEvidence?.monthCommand?.mainHiddenStem;
 const mainId=mainStem?'natal.month.hidden.'+mainStem:null;
 const baselineRoles=[rows['natal.month.stem']?.tenGod,rows[mainId]?.tenGod];
 const ROLE={
  비견:{focus:'스스로 맡아 책임질 일의 범위',risk:'다른 사람과 맡은 몫이 불분명해지는 조건'},
  겁재:{focus:'함께 사용할 자원의 분담',risk:'공동 자원의 사용 기준이 뒤늦게 바뀌는 조건'},
  식신:{focus:'일을 눈에 보이는 결과물로 완성하는 과정',risk:'완성할 작업량과 소요 시간이 빠진 조건'},
  상관:{focus:'기존 작업 방식에 개선안을 제안하는 과정',risk:'새 방법과 기존 승인 절차가 충돌하는 조건'},
  정재:{focus:'반복해서 투입해야 하는 비용과 유지 자원',risk:'시작은 했지만 정기 비용과 담당자가 없는 조건'},
  편재:{focus:'여러 경로에서 필요한 자원을 확보하는 과정',risk:'공급 경로는 늘었지만 자원의 사용 목적이 모호한 조건'},
  정관:{focus:'규칙·승인 절차와 역할의 범위',risk:'운영 자원은 있어도 권한과 책임이 불분명한 조건'},
  편관:{focus:'갑자기 들어온 요구에 대한 책임 경계',risk:'긴급 요청의 처리 범위를 정하지 않은 조건'},
  정인:{focus:'배운 내용과 외부의 지원을 활용하는 과정',risk:'도움을 받아도 적용할 작업 기준이 불분명한 조건'},
  편인:{focus:'낯선 자료를 자기 기준으로 해석하는 과정',risk:'자료의 의미는 파악해도 실제 적용 범위를 정하지 않은 조건'}
 };
 // Only a DIFFERENT month-hidden category exposed at a non-day visible
 // position is eligible for a chart-specific conditional comparison.
 // Symbol membership alone never establishes dominance, strength, career
 // suitability or personal history. Ambiguous multiple candidates stay null.
 const qualified=exposures.filter(x=>{
  const hidden=rows[x.hiddenRef],visible=rows[x.visibleRef];
  return x.hiddenRef!==mainId&&!!mainId&&
   hidden?.observedBehavior===false&&visible?.observedBehavior===false&&
   hidden?.stem===visible?.stem&&hidden?.tenGod===visible?.tenGod&&
   !!ROLE[hidden.tenGod]&&!baselineRoles.includes(hidden.tenGod);
 });
 const uniqueCandidates=[...new Set(qualified.map(x=>x.hiddenRef))];
 const selected=qualified.length===1&&uniqueCandidates.length===1?qualified[0]:null;
 const role=selected?rows[selected.hiddenRef].tenGod:null;
 const primary=rows[mainId]?.tenGod;
 // Classical five-element direction is an observable symbolic relationship
 // between the *two cited stems*. It is NOT assessed dominance, realised
 // behaviour or a personality claim. Do not compare with an unrelated pillar.
 const monthToVisible=selected&&rows[mainId]?.stem?
  directions.direction(rows[mainId].stem,rows[selected.visibleRef].stem):null;
 const comparison=selected&&ROLE[primary]?{
  kind:'verified-other-month-hidden-visible-role-conditional-reading-v1',
  visiblePosition:selected.visibleRef,
  extraHiddenId:selected.hiddenRef,
  mainMonthId:mainId,
  otherRole:role,
  mainRole:primary,
  monthMainToExposedElementDirection:monthToVisible,
  visiblePositionRelationVerified:true,
  realizedDirectionEffectVerified:false,
  sourceRefs:['natal.month.stem',mainId,selected.hiddenRef,
   selected.visibleRef,'facts.stemConnections'],
  comparisonQuestion:'태어난 달의 대표적인 '+ROLE[primary].focus+
    '과, 다른 속글자가 '+(selected.visibleRef==='natal.hour.stem'?'시간':'해')+
    ' 자리에서 드러내는 '+ROLE[role].focus+
    '을 한 가지 실제 상황에서 구분하면 무엇이 달라지는가?',
  scene:'한 가지 일을 맡아 시작한 뒤 계속 진행하는 상황에서, '+
   ROLE[primary].focus+'과 '+ROLE[role].focus+'을 각각 구분하는 가상 예시',
  conditionIfMissingMain:ROLE[primary].risk,
  conditionIfMissingNew:ROLE[role].risk,
  sourceNovelty:'출생월의 겉글자와 대표 속글자만 보는 기본 풀이로는 '+
   selected.visibleRef+'에 드러난 별도 달 속글자를 설명할 수 없음',
  noObservedOutcome:true,realizedInfluenceVerified:false,
  prioritizationVerified:false,approvedForSale:false
 }:null;
 return {kind:'first-chapter-optional-full-chart-source-v1',
  sourceRefs:[...REFS,...(comparison?[mainId,selected.hiddenRef]:[])],
  positions,exposures,visiblePairCandidates,
  readerContrast:comparison,
  visibleElementDirections,
  comparisonScope:'computed-position-and-exact-exposure-only',
  observedPersonality:false,selectedTraditionalPriority:false,
  strengthAndTransformationUnassessed:true,
  allPairingsAreCandidatesOnly:true,
  approvedAsPremiumValue:false,customerQualityValidated:false,
  optionalSlot:'temperament',unchangedSlot:'strength'};
}
module.exports={build,REFS};