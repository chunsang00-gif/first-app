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
 const xinDay=scoped&&packet.chart.day[0]==='辛';
 const singleExposureCaseApplies=xinDay&&primary.length===0&&secondary.length>0;
 const dualCaseApplies=xinDay&&primary.length>0&&secondary.length>0;
 // The same classical chapter distinguishes a Bing-only change of the
 // month-command category from the Jia+Bing case that retains Jia first.
 // These are TEXTUAL applicability checks, not approval of a full pattern.
 const singleExposureTextualChange={
  example:'Xin-day Yin-month, Bing exposed, Jia not exposed',
  scopeMatched:singleExposureCaseApplies,
  firstRole:singleExposureCaseApplies?'정관':null,
  source:'Zi Ping Zhen Quan, chapter 10, Xin-in-Yin change example',
  textualChangeBasis:singleExposureCaseApplies?
   'In a Xin-day Yin month, Bing exposure without Jia exposure changes the textually described month-command interpretation from wealth to authority':null,
  distinctFromDualExposurePriority:true,
  finalTraditionalPatternEstablished:false,
  subjectToIndependentFullChartReview:true,
  observedBehavior:false
 };
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
  singleExposureTextualChange,dualExposureTextualPriority,
  chapterExampleIsNotFullPatternRule:true,
  otherBranchesAndCombinedRelationsNotAssessed:true,
  actualPersonalityOrCareerNotEstablished:true,
  canAutomateFinalTraditionalPattern:false,
  providerCalls:0,releaseVerdict:'not-approved'
 };
}

// Single narrowly curated reader example for an INTERNAL offline editorial
// comparison. Not a generalized natal generator, paid report, or prediction.
// Only the explicit YEAR-Jia / MONTH-Bing / DAY-Xin / MONTH-Yin configuration
// may receive this copy; never fill other charts with the same text.
function offlineReaderCandidate(packet){
 const caseResult=inspect(packet);
 const rank=caseResult.dualExposureTextualPriority;
 if(rank.scopeMatched!==true||
    !caseResult.observed.exposedMainStemPositions.includes('year')||
    !caseResult.observed.exposedSecondaryStemPositions.includes('month'))
  return null;
 const ledger=Object.fromEntries(require('./report-fact-bindings').build(packet)
  .map(row=>[row.id,row]));
 const expected={
  'natal.day.stem':['辛','일간'],
  'natal.year.stem':['甲','정재'],
  'natal.month.stem':['丙','정관'],
  'natal.month.hidden.甲':['甲','정재']
 };
 for(const [id,[stem,tenGod]] of Object.entries(expected)){
  const row=ledger[id];
  if(row?.stem!==stem||row?.tenGod!==tenGod)
   throw Error('QA_CLASSICAL_READER_FACT_DRIFT:'+id);
 }
 const label='책임보다 먼저 보는 자원의 의미';
 const text='이 사주를 고전의 한 방식으로 읽을 때는 높은 자리를 맡는다는 말보다, 그 자리를 뒷받침할 자원을 다루는 뜻을 먼저 살펴봅니다. 태어난 달에서 가장 기본이 되는 글자는 태어난 해에도 드러나 자원 관리에 관한 뜻으로 읽힙니다. 같은 달에 드러난 다른 글자는 맡은 역할과 지켜야 할 기준을 나타냅니다. 그래서 두 뜻의 순서를 정할 때도 막연히 어느 쪽이 더 강하다고 말하지 않습니다. 달의 기본 글자가 실제로 드러났고 다른 뜻도 함께 나타났다는 조건에 따라, 이 고전은 자원에 관한 뜻을 중심에 두고 책임에 관한 뜻을 곁들입니다. 이 풀이에서 직업을 바라보는 초점 역시 직책의 크기 자체보다 자원과 책임을 어떻게 연결해 해석하는지에 있습니다. 실제로 돈을 잘 모으거나 직장에서 인정받는다는 결론은 아닙니다.';
 return {
  kind:'qa-classical-natal-reader-candidate-v1',
  calculatedChart:packet.chart,
  label,text,
  sourceRefs:Object.keys(expected),
  textualRule:'xin-yin-jia-and-bing-both-exposed; primary wealth, supplementary authority',
  cause:'month-main-Jia-and-additional-Bing-visible-not-element-arrow',
  otherBranchEffects:'not-assessed',
  individualPersonalityOrCareerVerified:false,
  independentlyProfessionallyReviewed:false,
  readyForPaidModelProbe:false,
  releaseVerdict:'not-approved',
  providerCalls:0
 };
}
module.exports={inspect,offlineReaderCandidate};
