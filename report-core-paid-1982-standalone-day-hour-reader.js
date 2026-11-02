'use strict';
// QA-ONLY curated sample copy for TWO EXACT calculated chart+hour conditions.
// Unlike the historical counterfactual worksheets, each passage is written
// for the person whose chart is being read: it never discusses the other
// time, QA fixtures, provenance identifiers or an invented workplace scene.
// This DOES NOT constitute observed personality, school adoption, human
// expert review or authorization to pass a passage to the paid provider.
const facts=require('./report-facts-node');
const method=require('./report-core-paid-1982-question-scoped-method-decision');
const gap=require('./report-core-paid-depth-gap-audit');
const bindings=require('./report-fact-bindings');
const policy=require('./report-reader-policy');
const CLASSIC='https://zh.wikisource.org/zh-hant/%E4%B8%89%E5%91%BD%E9%80%9A%E6%9C%83/%E5%8D%B7%E5%85%AB';
const BASE={calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,gender:'male',mbti:'ISFP'};
const CASES={
 '14:20':{
  expectedHour:'癸未',
  expectedQuestion:'乙未日癸未時+冬',
  label:'태어난 날과 시간이 함께 들어맞는 겨울의 고전 풀이',
  text:'태어난 날과 시간을 함께 대조하면, 이 조합을 겨울에 따로 설명한 옛 사주책의 구절이 있습니다. 그 구절은 해당 날과 시간으로 겨울에 태어난 경우를 안온한 쪽으로 풀이합니다. 출생월에 나타난 기본적인 상징만 읽었을 때는 확인할 수 없던 내용이며, 태어난 날과 시간까지 정확하게 맞아야 인용할 수 있는 전통적 설명입니다. 다만 고전의 이 표현으로 실제로 평온한 성격인지, 생활에 어려움이 없을지 판단할 수는 없습니다. 다른 출생 자리의 관계와 계절 판단법을 합쳐 이 해석이 최종적으로 우세하다는 결론도 아직 내리지 않았습니다.',
  citedCondition:'exact-day-hour-with-winter-subclause',
  requiredRefs:['natal.day.stem','natal.hour.stem','facts.seasonalEvidence'],
  positiveHistoricalClauseAllowed:true,
  yearMonthQualifiersResolved:false
 },
 '20:20':{
  expectedHour:'丙戌',
  expectedQuestion:'乙未日丙戌時+unresolved-year-month-qualification',
  label:'해와 달의 조건을 따로 확인해야 하는 고전 풀이',
  text:'태어난 날과 시간을 함께 대조하면, 옛 사주책에는 바로 이 조합을 다룬 다른 구절이 있습니다. 그 구절은 기운이 왕한 경우를 경계하면서도 특정 해와 달의 글자가 놓인 경우에는 높은 지위를 언급합니다. 이 출생 기록의 해에 있는 글자는 그 목록에 있지만 달에 있는 글자는 목록에 없습니다. 따라서 해의 글자 하나만 맞는다고 좋은 결과가 확정됐다고 읽을 수 없습니다. 고전의 짧은 연·월 표현이 어떤 결합 조건을 가리키는지도 별도로 검토해야 합니다. 이 기록에서 확인할 수 있는 것은 정확한 날과 시간에 해당하는 고전 구절이 무엇인지까지이며, 실제 지위·성격·미래의 길흉은 판정되지 않았습니다.',
  citedCondition:'exact-day-hour-with-ambiguous-year-month-clause',
  requiredRefs:['natal.year.stem','natal.month.stem','natal.day.stem','natal.hour.stem','facts.seasonalEvidence'],
  positiveHistoricalClauseAllowed:false,
  yearMonthQualifiersResolved:false
 }
};
function build(packet){
 if(packet?.status!=='ready'||packet.targetYear?.year!==2027)return null;
 const input=packet.calculationInput||{};
 if(Object.entries(BASE).some(([k,v])=>input[k]!==v))return null;
 const spec=CASES[input.birthTime];
 if(!spec||packet.chart?.hour!==spec.expectedHour)return null;
 const scoped=method.inspect(packet);
 if(!scoped||scoped.appliedQuestionOrder?.[0]?.selectedCitationScope!==spec.expectedQuestion||
    scoped.referencePreferenceScope!=='more-specific-source-for-the-same-question-only'||
    scoped.independentMethodPrioritySelected!==false||
    scoped.traditionalFullChartPatternSelected!==false||
    scoped.eligibleForPaidWriter!==false||
    scoped.approvedForSale!==false)
  throw Error('QA_1982_STANDALONE_WRITER_METHOD_SCOPE_DRIFT');
 const raw=require('./report-core-paid-classical-decision-handoff').build(packet);
 const eligibility=raw.independentClassicalSourceEligibility;
 const historical=input.birthTime==='14:20'?
  eligibility?.exactDayHour:eligibility?.alternativeExactDayHour;
 if(!historical||historical.url!==CLASSIC||
    historical.requiredDayPillar!=='乙未'||historical.requiredHourPillar!==spec.expectedHour||
    historical.approvedPaidInsight!==false)
  throw Error('QA_1982_STANDALONE_WRITER_HISTORICAL_SCOPE_DRIFT');
 if(input.birthTime==='14:20'&&
    (historical.winterSourceClauseMatched!==true||
     historical.sourceContainsSeasonalHistoricJudgment!=='冬安穩'))
  throw Error('QA_1982_STANDALONE_WRITER_WINTER_NOT_ATTESTED');
 if(input.birthTime==='20:20'&&
    (historical.historicalPhrase!=='旺處凶。卯午未戌年月，貴顯。'||
     historical.listedContainsYearBranch!==true||
     historical.listedContainsMonthBranch!==false||
     historical.yearMonthGrammarAndOtherConditionsNotResolved!==true||
     historical.cannotBorrowGuiWeiWinterClause!==true))
  throw Error('QA_1982_STANDALONE_WRITER_OTHER_HOUR_SCOPE_UNRESOLVED');
 const baseline=gap.reportOne(packet);
 if(baseline.paidWholeChartGrounded!==false||
    baseline.paidReceivesOfflineSynthesis!==false||
    baseline.paidCitableRefs.some(id=>/^(natal\.(?:day|hour|year)\.|facts\.natalBranchRelations)/.test(id))||
    !baseline.paidCitableRefs.includes('natal.month.stem')||
    baseline.releaseVerdict!=='blocked-unreviewed-paid-depth')
  throw Error('QA_1982_STANDALONE_WRITER_REAL_PAID_BASELINE_DRIFT');
 const ledger=Object.fromEntries(bindings.build(packet).map(x=>[x.id,x]));
 for(const id of spec.requiredRefs){
  if(id.startsWith('natal.')&&(
    ledger[id]?.stem!==packet.chart[id.split('.')[1]][0]||
    ledger[id]?.interpretationScope!=='traditional-symbol-only'||
    ledger[id]?.observedBehavior!==false))
   throw Error('QA_1982_STANDALONE_WRITER_BAD_ROLE_SOURCE:'+id);
  if(id==='facts.seasonalEvidence'&&
     packet.facts.seasonalEvidence?.monthBranch!==packet.chart.month[1])
   throw Error('QA_1982_STANDALONE_WRITER_BAD_SEASON');
 }
 if(policy.errors([spec.label,spec.text]).length||
    /[\u3400-\u4dbf\u4e00-\u9fff]/.test(spec.text)||
    /(오후 2시|오후 8시|다른 출생시간|가상의|가정해 보|동료|납품|장비)/.test(spec.text)||
    spec.text.length<200||spec.text.length>690)
  throw Error('QA_1982_STANDALONE_WRITER_NON_READER_TEXT');
 return {
  kind:'qa-independent-day-hour-citation-manuscript-v1',
  chartFingerprint:[packet.chart.year,packet.chart.month,packet.chart.day,packet.chart.hour].join('/'),
  label:spec.label,text:spec.text,
  source:{work:'三命通會',chapter:input.birthTime==='14:20'?
    '卷八·六乙日癸未時斷':'卷八·六乙日丙戌時斷',
   url:CLASSIC,sourceScope:spec.citedCondition},
  exactDayHourReferences:spec.requiredRefs.slice(),
  baselinePaidReferences:baseline.paidCitableRefs.slice(),
  newIndependentTraditionalQuestion:'exact-cited-day-hour-classical-passage-not-month-symbol-glossary',
  oneLiterarySourceNotUniversalSajuSchool:true,
  traditionalHistoricalPhraseIsNotObservedLife:true,
  positiveHistoricalClauseAllowed:spec.positiveHistoricalClauseAllowed,
  yearMonthQualifiersResolved:false,
  crossHourTextCopied:false,
  writtenForStandaloneReader:true,
  comparedAgainstActualPaidProviderOutput:false,
  humanExpertReviewComplete:false,
  personalInsightProven:false,
  customerValueValidated:false,
  includedInPaidWriter:false,
  saleApproved:false,providerCalls:0,releaseVerdict:'not-approved'
 };
}
function pair(){
 const a=build(facts.build({...BASE,birthTime:'14:20'},2027));
 const b=build(facts.build({...BASE,birthTime:'20:20'},2027));
 if(!a||!b||a.chartFingerprint===b.chartFingerprint||
    a.source.sourceScope===b.source.sourceScope||
    a.text===b.text||a.positiveHistoricalClauseAllowed!==true||
    b.positiveHistoricalClauseAllowed!==false||
    a.text.includes('목록에 있지만')||b.text.includes('안온한 쪽으로')||
    a.saleApproved!==false||b.saleApproved!==false)
  throw Error('QA_1982_STANDALONE_WRITER_COUNTERFACTUAL_COLLAPSE');
 return {kind:'qa-two-separate-reader-exact-classical-subcases-v1',cases:[a,b],
  sharedPriorMonthEvidence:true,differentSourceSubcases:true,
  noUniversalPersonalOutcome:true,independentlySaleApproved:false,
  readyForPaidWriter:false,providerCalls:0,releaseVerdict:'not-approved'};
}
module.exports={build,pair,BASE};
