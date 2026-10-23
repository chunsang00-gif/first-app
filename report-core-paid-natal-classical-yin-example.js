'use strict';
// ONE documented example in Zi Ping Zhen Quan, chapter "On Changing
// Month-Command Use": Yin month, Jia (main hidden stem) NOT exposed,
// Bing (secondary hidden stem) exposed. The text describes a change
// in the interpretation's point of departure, not a proven personality.
// The test does not adopt the school, select Yong Shen or rank people.
const seasonal=require('./report-seasonal-evidence');
const POS=['year','month','hour'];
const PRIMARY='甲',SECONDARY='丙';
function inspect(packet){
 if(packet?.status!=='ready'||!packet.chart?.hour||!packet.facts?.seasonalEvidence)
  throw Error('QA_CLASSICAL_MONTH_EXAMPLE_INCOMPLETE');
 const s=seasonal.evaluate(packet.chart);
 if(JSON.stringify(s)!==JSON.stringify(packet.facts.seasonalEvidence))
  throw Error('QA_CLASSICAL_MONTH_EXAMPLE_SEASONAL_DRIFT');
 const branch=packet.chart.month[1];
 const stems=POS.map(pos=>({position:pos,
  sourceId:'natal.'+pos+'.stem',stem:packet.chart[pos][0]}));
 const primary=stems.filter(x=>x.stem===PRIMARY);
 const secondary=stems.filter(x=>x.stem===SECONDARY);
 const third=stems.filter(x=>x.stem==='戊');
 const scoped=branch==='寅'&&s.monthMainQiStem===PRIMARY&&
  s.monthHiddenStems.some(x=>x.stem===SECONDARY);
 const exactMatch=scoped&&primary.length===0&&secondary.length>0;
 const dualCaseApplies=scoped&&packet.chart.day[0]==='辛'&&primary.length>0&&secondary.length>0;
 const dualExposureTextualPriority={
  example:'Xin-day Yin-month with Jia and Bing both exposed',
  scopeMatched:dualCaseApplies,
  firstRole:dualCaseApplies?'정재':null,
  additionalRole:dualCaseApplies?'정관':null,
  source:'Zi Ping Zhen Quan, chapter 10, final examples',
  textualPriorityBasis:dualCaseApplies?
   'Jia is the main hidden stem of the Yin month and is exposed alongside Bing; this classical case retains the month-main pattern and adds the Bing category':
   null,
  notDeterminedByElementGenerationArrow:true,
  subjectToIndependentFullChartReview:true,
  finalTraditionalPatternEstablished:false,
  observedBehavior:false
 };
 return {
  kind:'qa-classical-yin-month-textual-example-v1',
  classicalReference:{
   work:'子平真詮',chapter:'論用神變化',
   url:'https://caipu.donglishuzhai.net/chapter/3723.html',
   originalExample:'寅月，甲不透而丙透（僅核對文本所述條件）',
   traditionChosenForCommercialInterpretation:false
  },
  natalMonthBranch:branch,
  observed:{
   applicableMonth:scoped,
   exposedMainStemPositions:primary.map(x=>x.position),
   exposedSecondaryStemPositions:secondary.map(x=>x.position),
   exposedOtherHiddenStemPositions:third.map(x=>x.position),
   dayMasterExcludedFromExposureScan:true,
   exactTextualExampleConditionsMet:exactMatch
  },
  candidate:!scoped?'out-of-example-scope':
   exactMatch?'documented-textual-example-match':
   primary.length?'textual-condition-fails-main-is-exposed':
   'textual-condition-fails-secondary-not-exposed',
  interpretiveStatementAllowed:exactMatch?
   '이 명식은 고전의 특정 예시처럼 달의 대표 글자는 다른 겉자리에 없고, 달의 다른 숨은 글자가 겉자리에 나타나는 계산 조건을 충족한다.':
   '이 명식은 해당 고전 예시의 계산 조건을 그대로 충족하지 않는다.',
  alternativeExposuresNeedReview:third.length>0,
  dualExposureTextualPriority,
  chapterExampleIsNotFullPatternRule:true,
  otherBranchesAndCombinedRelationsNotAssessed:true,
  actualPersonalityOrCareerNotEstablished:true,
  canAutomateFinalTraditionalPattern:false,
  providerCalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={inspect};
