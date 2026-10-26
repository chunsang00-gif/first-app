'use strict';
// OFFLINE QA ONLY. A genuinely different day/hour source for the same day
// after changing 14:20 -> 20:20. No observed traits or approved paid text.
const facts=require('./report-facts-node');
const handoff=require('./report-core-paid-classical-decision-handoff');
const core=require('./report-core-knowledge-engine');
const reader=require('./report-reader-policy');
const method=require('./report-core-paid-natal-classical-method-applicability');
const applied=require('./report-core-paid-month-ch16-application');
const EXPECTED={year:'壬戌',month:'癸丑',day:'乙未',hour:'丙戌'};
const INPUT={calendar:'lunar',birthDate:'1982-11-24',birthTime:'20:20',
 leapMonth:false,gender:'male',mbti:'ISFP'};
const CLASSIC='https://zh.wikisource.org/zh-hant/%E4%B8%89%E5%91%BD%E9%80%9A%E6%9C%83/%E5%8D%B7%E5%85%AB';
const CLIMATE='https://luckclub.cn/bazi/004/024/';
const rows=[
 {kind:'different-day-hour-text',label:'같은 날에도 출생시간에 따라 달라지는 원문',
  text:'태어난 날은 같아도 오후 8시 20분의 시간 자리는 오후 2시 20분과 다르게 계산됩니다. 이 조합을 직접 다룬 옛 문헌의 대목도 다릅니다. 앞선 시간에 해당했던 겨울의 안정에 관한 한 줄을 지금 시간에 가져오면 안 됩니다. 이 출생시간에 적용할 고전 대목은 강한 기운을 경계하는 문장과 일부 해·달 조건을 좋게 풀이하는 문장을 구분합니다. 따라서 이 사주에서는 두 조건을 따로 확인해야 하며, 좋은 표현 하나만 골라 실제 성격이나 미래의 결과로 단정할 수 없습니다.',
  sourceRefs:['natal.day.stem','natal.hour.stem','facts.seasonalEvidence'],
  sourceUrl:CLASSIC},
 {kind:'year-month-qualifier',label:'해의 글자가 맞아도 달의 조건까지 맞는 것은 아닙니다',
  text:'그 문헌은 해와 달에 놓일 수 있는 몇 가지 글자를 함께 열거합니다. 실제 계산에서는 태어난 해의 아랫글자는 그 목록에 들어가지만, 태어난 달의 아랫글자는 목록에 없습니다. 따라서 해의 글자 하나가 맞는다는 이유로 문헌의 연·월 조건이 모두 충족됐다고 결론 내릴 수 없습니다. 원문의 짧은 조건을 어느 범위까지 적용해야 하는지도 따로 검토해야 합니다. 좋은 결과나 나쁜 결과를 확정하는 근거로 사용하지 않는 이유입니다.',
  sourceRefs:['natal.year.stem','natal.month.stem','natal.day.stem',
   'natal.hour.stem','facts.natalBranchRelations'],
  sourceUrl:CLASSIC},
 {kind:'independent-winter-condition',label:'따뜻함을 뜻하는 글자 하나만으로 결정되지 않습니다',
  text:'또 다른 겨울 관련 문헌은 태어난 날과 시간의 조합이 아니라 서로 다른 두 조건을 동시에 살핍니다. 오후 8시 20분에는 따뜻함을 나타내는 글자가 시간의 겉에 있지만, 달에는 함께 나오지 않아야 한다고 적힌 다른 글자가 남아 있습니다. 따라서 그 문헌의 두 조건을 모두 충족했다고 볼 수 없습니다. 태어난 달 안쪽에서 나온 글자는 오후 8시 20분에도 달의 겉에 남습니다. 다만 시간에는 같은 글자가 더 이상 반복되지 않습니다. 고전의 해당 규칙으로 보면 달 안쪽에서 겉으로 나온 서로 다른 후보는 하나이며, 그 종류는 오후 2시 20분과 같습니다. 달과 날의 관계표는 그대로지만 달과 시간 사이에서 이전에 있던 마주 보는 관계는 사라집니다. 달의 해석 후보가 유지되더라도 전체 관계까지 같다는 뜻은 아닙니다. 어느 관계가 더 중요한지 또는 삶의 결과가 달라지는지는 계산표만으로 판단할 수 없습니다.',
  sourceRefs:['natal.month.stem','natal.hour.stem','facts.seasonalEvidence',
   'facts.stemConnections'],
  sourceUrl:CLIMATE}
];
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function build(packet){
 if(packet?.status!=='ready'||!packet.chart)return null;
 if(!Object.entries(INPUT).every(([k,v])=>packet.calculationInput?.[k]===v)||
    !same(packet.chart,EXPECTED)||packet.targetYear?.year!==2027)
  return null;
 const h=handoff.build(packet),i=h.independentClassicalSourceEligibility;
 const special=i?.alternativeExactDayHour,climate=i?.climate;
 const route=h.sourceScopedEditorialReferenceChoice?.questionRoutes;
 if(h.releaseVerdict!=='not-approved'||h.methodApproved!==false||
    h.sourceScopedEditorialReferenceChoice?.releasedToPaidWriter!==false||
    h.sourceScopedEditorialReferenceChoice?.customerSpecificNewDecisionEstablished!==false||
    i.exactDayHour!==null||!special||
    special.requiredDayPillar!==EXPECTED.day||
    special.requiredHourPillar!==EXPECTED.hour||
    special.historicalPhrase!=='旺處凶。卯午未戌年月，貴顯。'||
    special.listedContainsYearBranch!==true||
    special.listedContainsMonthBranch!==false||
    special.yearMonthGrammarAndOtherConditionsNotResolved!==true||
    special.cannotBorrowGuiWeiWinterClause!==true||
    special.url!==CLASSIC||
    route?.whichClassicalDayHourText?.sourceUnit!==
     'exact-day-hour-with-unresolved-year-month-qualifier'||
    route.whichClassicalDayHourText.url!==CLASSIC||
    route.whatSeasonalConditionToConsider?.url!==CLIMATE||
    climate?.bingExposed!==true||climate?.guiExposed!==true||
    !same(climate.observedBingVisibleRefs,['natal.hour.stem'])||
    !same(climate.observedGuiVisibleRefs,['natal.month.stem'])||
    climate.favorableHistoricalCompoundConditionMatched!==false)
  throw Error('QA_ALT_HOUR_CLASSICAL_CONDITIONS_NOT_VERIFIED');
 const methodResult=applied.inspect(packet);
 if(!methodResult?.verified?.monthHourBranchContactChangesByBirthHour||
    methodResult.verified.branchTable.monthHour.tableLabels.includes('충')||
    !methodResult.verified.branchTable.alternateMonthHour.tableLabels.includes('충'))
  throw Error('QA_ALT_SOURCE_BRANCH_INTERPRETATION_NOT_GROUNDED');
 if(!methodResult||methodResult.verified.candidateExposedAt.length!==1||
    methodResult.overallPatternSelected!==false||
    methodResult.source.originalRule!=='一透則一用'||
    methodResult.approvedForCustomer!==false)
  throw Error('QA_ALT_CH16_CLASSICAL_METHOD_APPLICATION_INVALID');
 const m=method.evaluate(packet).generalMonthRule;
 if(m.conditionObserved!==true||m.monthMainSourceId!=='natal.month.hidden.己'||
    m.monthMainExposedOutsideDay!==false||
    m.otherCandidateRoles?.[0]?.sourceId!=='natal.month.hidden.癸'||
    m.otherCandidateRoles[0].symbolicTenGodCategory!=='편인'||
    JSON.stringify(m.otherCandidateRoles[0].exposedAt)!==
     JSON.stringify(['natal.month.stem'])||
    m.methodPriority!=='not-selected'||m.monthCommandRoleConfirmed!==false)
  throw Error('QA_ALT_MONTH_METHOD_ORIGIN_INVALID');
 const before=facts.build({...packet.calculationInput,birthTime:'14:20'},2027);
 const other=method.evaluate(before).generalMonthRule;
 if(JSON.stringify(other.otherCandidateRoles?.[0]?.exposedAt)!==
    JSON.stringify(['natal.month.stem','natal.hour.stem'])||
    other.otherCandidateRoles?.[0]?.sourceId!==m.otherCandidateRoles[0].sourceId)
  throw Error('QA_ALT_MONTH_METHOD_COUNTERFACTUAL_INVALID');
 if(before.status!=='ready'||before.chart.year!==packet.chart.year||
    before.chart.month!==packet.chart.month||
    before.chart.day!==packet.chart.day||before.chart.hour!=='癸未')
  throw Error('QA_ALT_HOUR_COUNTERFACTUAL_INVALID');
 const baseline=core.compile(packet);
 if(baseline.status!=='draft-for-human-review'||
    baseline.review.fourPillar?.ruleId!==
     'full-four-pillars-chukmi-day-root-hour-expression-v1'||
    baseline.releaseVerdict!=='not-approved'||
    baseline.scope.sourceIds.join('|')!==
     'natal.month.stem|natal.month.hidden.己')
  throw Error('QA_ALT_HOUR_BASELINE_INVALID');
 const text=rows.map(p=>p.text).join('\n\n');
 if(text.length<600||text.length>1100||
    reader.errors(rows.flatMap(p=>[p.label,p.text])).length||
    /[\u3400-\u4dbf\u4e00-\u9fff]/.test(text)||
    /(?:낯선 정보|실제 사용할 자원|기존 작업 절차|동료에게)/.test(text)||
    /[?？]\s*$/.test(text))
  throw Error('QA_ALT_HOUR_VISIBLE_TEXT_INVALID');
 return {
  kind:'qa-source-specific-adult-other-hour-revision-v1',
  chartFingerprint:Object.values(EXPECTED).join('/'),
  label:'출생시간에 따라 달라지는 고전의 조건',
  paragraphs:rows.map(x=>({...x,sourceRefs:x.sourceRefs.slice()})),
  text,sourceRefs:[...new Set(rows.flatMap(x=>x.sourceRefs))],
  comparedAgainstLiveFreeProduct:false,
  previousHourEligibleForSameClassicalVerse:false,
  independentHistoricalSubcaseForChangedHour:true,
  yearMatchesListedBranchesMonthDoesNot:true,
  climateBingVisibleButGuiAlsoVisible:true,
  cannotInferPersonalOutcomeFromHistoricalText:true,
  monthClassicalMethodApplication:structuredClone(methodResult),
  provenIncrementalCustomerBenefit:false,
  professionalMethodApproved:false,
  paidWriterAuthorized:false,approvedForCustomer:false,
  providerCalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={build};