'use strict';
// Exact-chart, non-billable reference-priority decision for one question.
// Textual specificity is not chart-wide Saju school/method priority.
const hour=require('./report-core-paid-classical-decision-handoff');
const month=require('./report-core-paid-month-ch16-application');
const ledger=require('./report-fact-bindings');
const CHART={year:'壬戌',month:'癸丑',day:'乙未'};
const SOURCE='https://zh.wikisource.org/zh-hant/%E4%B8%89%E5%91%BD%E9%80%9A%E6%9C%83/%E5%8D%B7%E5%85%AB';
function inspect(packet){
 const input=packet?.calculationInput;
 if(packet?.status!=='ready'||input?.calendar!=='lunar'||
   input.birthDate!=='1982-11-24'||input.leapMonth!==false||
   input.gender!=='male'||input.mbti!=='ISFP'||
   !['14:20','20:20'].includes(input.birthTime)||
   packet.targetYear?.year!==2027||
   Object.entries(CHART).some(([name,v])=>packet.chart?.[name]!==v)||
   packet.chart?.hour!==(input.birthTime==='14:20'?'癸未':'丙戌'))return null;
 const early=input.birthTime==='14:20';
 const d=hour.build(packet),c=d.independentClassicalSourceEligibility;
 const rules=d.sourceScopedEditorialReferenceChoice?.questionRoutes;
 const m=month.inspect(packet),l=Object.fromEntries(ledger.build(packet).map(x=>[x.id,x]));
 const historical=early?c?.exactDayHour:c?.alternativeExactDayHour;
 if(!m||m.source?.originalRule!=='一透則一用'||
    m.approvedForCustomer!==false||m.overallPatternSelected!==false||
    m.verified.soleDistinctExposedMonthHiddenCandidate!=='natal.month.hidden.癸'||
    m.verified.candidateExposedAt.length!==(early?2:1)||
    m.verified.completeMonthBranchGroups!==0||
    !historical||historical.url!==SOURCE||
    historical.requiredDayPillar!=='乙未'||
    historical.requiredHourPillar!==(early?'癸未':'丙戌')||
    historical.approvedPaidInsight!==false||
    Boolean(c?.exactDayHour)!==early||
    Boolean(c?.alternativeExactDayHour)===early||
    rules?.whichClassicalDayHourText?.url!==SOURCE||
    rules?.whichClassicalDayHourText?.sourceUnit!==(early?
      'exact-day-hour-winter-subcase':
      'exact-day-hour-with-unresolved-year-month-qualifier')||
    rules?.whatSeasonalConditionToConsider?.compoundBingVisibleWithoutGuiMatched!==false||
    c?.climate?.bingExposed!==!early||c?.climate?.guiExposed!==true||
    c?.climate?.favorableHistoricalCompoundConditionMatched!==false||
    d.methodApproved!==false||d.releaseVerdict!=='not-approved')
  throw Error('QA_1982_SCOPED_METHOD_SOURCE_OR_PRIORITY_DRIFT');
 const general=early?{
  question:'what-does-Yi-day-Gui-Wei-hour-symbolically-compare',
  sourceUrl:SOURCE,section:'六乙日癸未時斷',
  textualUnit:'general-乙-day-癸未-hour-rule',
  visibleRole:'편인',hiddenRole:'식신',
  traditionalRelation:'癸-overcomes-丁',
  refs:['natal.hour.stem','natal.hour.hidden.丁'],
  descriptiveOnly:true,observedAbility:false
 }:null;
 if(early&&(l['natal.hour.stem']?.stem!=='癸'||
   l['natal.hour.stem']?.tenGod!=='편인'||
   l['natal.hour.hidden.丁']?.stem!=='丁'||
   l['natal.hour.hidden.丁']?.tenGod!=='식신'||
   l['natal.hour.hidden.丁']?.observedBehavior!==false))
  throw Error('QA_1982_GENERAL_HOUR_RELATION_BAD_PROVENANCE');
 if(early&&(historical.winterSourceClauseMatched!==true||
    historical.sourceContainsSeasonalHistoricJudgment!=='冬安穩'))
  throw Error('QA_1982_EXACT_WINTER_CLAUSE_NOT_VERIFIED');
 if(!early&&(historical.yearMonthGrammarAndOtherConditionsNotResolved!==true||
    historical.listedContainsYearBranch!==true||
    historical.listedContainsMonthBranch!==false||
    historical.cannotBorrowGuiWeiWinterClause!==true))
  throw Error('QA_1982_OTHER_HOUR_CLAUSE_QUALIFIER_INVALID');
 return {
  kind:'qa-1982-classical-question-specificity-decision-v1',
  chartFingerprint:[packet.chart.year,packet.chart.month,packet.chart.day,packet.chart.hour].join('/'),
  birthTime:input.birthTime,
  appliedQuestionOrder:[
   {question:'which-day-hour-history-can-be-described',
    selectedCitationScope:early?'乙未日癸未時+冬':
      '乙未日丙戌時+unresolved-year-month-qualification',
    permittedClaim:early?'historically-described-winter-condition':
      'matching-day-hour-text-only-no-year-month-fortune',
    rejects:early?['generic-Yi-hour-clause-as-complete-fate',
     'the-other-丙戌-hour-verse']:
     ['borrow-癸未-hour-winter-verse','match-year-alone-means-fortune']},
   {question:'which-month-hidden-role-is-a-candidate',
    selectedCitationScope:'general-mixed-month-single-visible-category',
    permittedClaim:'one-distinct-癸-month-candidate-only-not-a-final-pattern',
    rejects:['two-visible-positions-mean-two-independent-candidates',
     'general-example-determines-1982-whole-chart-pattern']},
   {question:'is-the-winter-climate-favorable-compound-condition-met',
    selectedCitationScope:'丙-visible-AND-癸-not-visible',
    permittedClaim:'not-met-for-this-hour',
    rejects:['unmet-condition-means-opposite-misfortune',
     'climate-rule-overrides-different-historical-question']}
  ],
  generalHourSymbolicRelation:general,
  referencePreferenceScope:'more-specific-source-for-the-same-question-only',
  natalMonthMethodCandidate:'natal.month.hidden.癸',
  candidateExposurePositions:m.verified.candidateExposedAt.slice(),
  independentMethodPrioritySelected:false,
  traditionalFullChartPatternSelected:false,
  verifiedReaderPersonalConclusion:false,
  eligibleForPaidWriter:false,approvedForSale:false,
  APIcalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={inspect};
