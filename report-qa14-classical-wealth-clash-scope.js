'use strict';
// QA14: source-applicability boundaries for a verified wealth-at-clash
// position. Source notes were manually checked against the linked text;
// code DOES NOT certify philological accuracy or pick a traditional school.
// NO change to paid product, model prompt, chapter selector or decoder.
const qa13=require('./report-qa13-money-risk-independent-source');
const relations=require('./report-branch-relations');
const STORAGE=new Set(['辰','戌','丑','未']);
const ZHENG=new Set(['子','午','卯','酉']);
const GEN=new Set(['寅','申','巳','亥']);
const SOURCE=Object.freeze([
 Object.freeze({
  work:'子平真詮',chapter:'七、論刑沖會合解法',
  url:'https://www.donglishuzhai.net/chapter/3720.html',
  safePrinciple:'지지의 충·합·회합은 서로 영향을 주는 다른 표기 조건이 있어 단독 충 하나로 해석 우선순위를 확정할 수 없음',
  notEstablished:'특정 재성 위치가 충을 받아 돈을 잃거나 큰 부를 얻는다는 결론'
 }),
 Object.freeze({
  work:'子平真詮',chapter:'八、論用神',
  url:'https://www.donglishuzhai.net/chapter/3721.html',
  safePrinciple:'월령을 중심으로 나머지 출생 위치의 전통적 분류와 조합을 함께 살펴야 함',
  notEstablished:'재성이라는 이름 또는 지지 충만으로 용신·격국이나 운세를 확정한다는 결론'
 }),
 Object.freeze({
  work:'子平真詮',chapter:'十七、論墓庫刑沖之說',
  url:'https://www.donglishuzhai.net/chapter/3730.html',
  safePrinciple:'진술축미 충을 항상 재물창고가 열리는 좋은 징조라고 풀이하는 것은 원문에서 비판됨. 재성의 오행·월령·투간 등 조건에 따라 사례가 다름',
  notEstablished:'사주에 진술 또는 축미 충이 있으면 자동으로 재물이 열리거나 손실이 생긴다는 결론'
 })
]);
function pairType(pair){
 const token=[...String(pair)].sort().join('');
 if(token==='戌辰'.split('').sort().join(''))return '辰戌-four-storage';
 if(token==='丑未'.split('').sort().join(''))return '丑未-four-storage';
 if([...String(pair)].every(x=>ZHENG.has(x)))return 'four-cardinal-opposition';
 if([...String(pair)].every(x=>GEN.has(x)))return 'four-birth-opposition';
 throw Error('QA14_UNCLASSIFIED_VERIFIED_CLASH:'+pair);
}
function inspect(packet){
 if(process.env.NODE_ENV!=='test'||process.env.RENDER==='true')
  throw Error('QA14_CLASSICAL_SCOPE_OFFLINE_ONLY');
 const base=qa13.inspect(packet);
 const chart=packet.chart,month=chart.month?.[1];
 const full=relations.natal(chart);
 const otherRelations=full.pairs.filter(x=>x.type!=='충');
 const positions=['year','month','hour'].filter(id=>chart[id]);
 const candidateReviews=base.candidates.map(row=>{
  const kind=pairType(row.branchPair);
  const isFourStorage=kind.endsWith('four-storage');
  const wealthVisibleAt=positions.filter(pos=>chart[pos]?.[0]===row.wealthStem)
   .map(pos=>'natal.'+pos+'.stem');
  const related=otherRelations.filter(x=>row.pairedPositions.some(pos=>
   x.positions.includes(pos)));
  const grouped=full.groups.filter(x=>row.pairedPositions.some(pos=>
   x.positions.includes(pos)));
  const governing=packet.facts.structuralEvidence.monthCommand;
  if(governing.branch!==month)throw Error('QA14_MONTH_COMMAND_NOT_GROUNDED');
  const exactWorkedCaseLike={
   // Chapter 17 examples require a concrete day/month/exposed stem and
   // the exact 辰戌 opposition; even all these matches do NOT establish
   // the complete pattern or a money prediction.
   earthWealthCase:chart.day?.[0]==='甲'&&month==='辰'&&
    wealthVisibleAt.length>0&&
    row.wealthStem==='戊'&&kind==='辰戌-four-storage'&&
    row.pairedPositions.includes('month'),
   waterWealthCounterCase:chart.day?.[0]==='己'&&month==='辰'&&
    positions.some(pos=>chart[pos][0]==='壬')&&
    kind==='辰戌-four-storage'&&row.pairedPositions.includes('month')
  };
  const methodologicalScope=isFourStorage?
   'ch17-four-storage-branch-contrast-only':
   'ch7-general-branch-interaction-only;ch17-four-storage-example-not-applicable';
  return Object.freeze({
   sourceId:row.wealthSourceId,wealthStem:row.wealthStem,
   wealthCategory:row.wealthCategory,
   clashPositions:row.pairedPositions.slice(),
   branchPair:row.branchPair,clashClass:kind,
   touchedMonth:row.pairedPositions.includes('month'),
   monthBranch:month,monthMainHiddenStem:governing.mainHiddenStem,
   wealthPositionIsHidden:true,matchingStemVisibleAt:wealthVisibleAt,
   competingPairRelationTypes:[...new Set(related.map(x=>x.type))],
   competingGroupMembershipTypes:[...new Set(grouped.map(x=>x.type))],
   ...exactWorkedCaseLike,methodologicalScope,
   exactClassicWorkedCaseProven:false,
   otherRelationPriorityChosen:false,
   wealthSymbolDamagedOrOpened:false,
   positiveOrNegativeMoneyOutcomePredicted:false,
   customerMeaningApproved:false
  });
 });
 return Object.freeze({
  kind:'qa14-classical-money-clash-source-scope-v1',
  sourceDocuments:SOURCE,chartInput:packet.calculationInput,
  candidatesExamined:candidateReviews.length,
  fourStorageCandidates:candidateReviews.filter(x=>x.clashClass.endsWith('four-storage')).length,
  otherClashCandidates:candidateReviews.filter(x=>!x.clashClass.endsWith('four-storage')).length,
  candidates:candidateReviews,
  sourceConditionsRequireMonthAndCompetingRelations:true,
  classicalTextDoesNotImplyWealthLossFromAClash:true,
  sourceChapter17NotUniversalToOtherClashClasses:true,
  independentTraditionalMethodSelectionPerformed:false,
  exactChapterExampleOrFavorablePatternConfirmed:false,
  paidMoneyRiskTopicUnchanged:'state-limits',
  permittedResearchOutcome:'method-applicability-only',
  userFacingNewFinancialRiskInsightApproved:false,
  humanExpertReviewed:false,
  realWorldEventPrediction:false,providerCalls:0,canSell:false
 });
}
module.exports={inspect,SOURCE,pairType};
