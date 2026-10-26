'use strict';
// One source-specific first-chapter rewrite. The older adult QA draft
// repeats month-core propositions; this version is a NEW editorial example,
// not a validated personal prediction or an approved customer manuscript.
const reader=require('./report-reader-policy');
const facts=require('./report-facts-node');
const method=require('./report-core-paid-natal-classical-method-applicability');
const applied=require('./report-core-paid-month-ch16-application');
const EXPECTED={year:'壬戌',month:'癸丑',day:'乙未',hour:'癸未'};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const P=[
 {kind:'exact-day-hour-text',label:'같은 겨울에도 다른 날과 시간의 조건',
  text:'출생의 네 자리를 함께 보면, 태어난 날과 시간의 아랫글자가 같습니다. 고전에는 바로 이 날과 시간의 조합이 겨울에 놓였을 때를 따로 평가한 문장이 있습니다. 기본 풀이에서 다룬 출생월의 뜻과 달리 특정 날과 시간까지 일치하는 자료입니다. 따라서 이 출생 기록은 그 문헌이 겨울의 해당 날·시간 조합을 안정된 쪽으로 풀이한 조건에 들어갑니다. 다만 이것은 고전의 제한된 전통적 평가일 뿐, 실제 생활이나 성격이 평온하다는 확인은 아닙니다.',
  sourceRefs:['natal.day.stem','natal.day.hidden.乙',
   'natal.hour.stem','natal.hour.hidden.乙','facts.seasonalEvidence'],
  sourceType:'exact-published-day-hour-winter-clause'},
 {kind:'different-winter-condition',label:'겨울의 또 다른 판단 조건',
  text:'그러나 다른 고전은 같은 겨울이라도 별도의 조건을 살핍니다. 따뜻함을 뜻하는 글자가 겉에 나타나는지, 다른 글자가 함께 나오지 않는지를 기준으로 설명합니다. 이 출생 기록에는 그 따뜻함의 글자가 겉에 없고 함께 검토해야 할 다른 글자가 달과 시간에 있습니다. 따라서 첫 문헌에 적힌 표현을 그대로 확대하거나, 두 번째 문헌의 조건이 맞지 않는다는 이유로 첫 문헌을 취소할 수는 없습니다. 서로 질문 자체가 다른 자료입니다.',
  sourceRefs:['natal.month.stem','natal.hour.stem','facts.seasonalEvidence'],
  sourceType:'separate-published-winter-month-condition'},
 {kind:'counterfactual-source-boundary',label:'출생시간을 바꾸면 달라지는 적용 범위',
  text:'태어난 달과 날, 달과 시간에는 같은 종류의 마주 보는 관계가 각각 표시됩니다. 이는 계산표의 두 위치이지 실제 다툼을 두 번 겪는다는 예고가 아닙니다. 태어난 달 안쪽의 글자가 달과 시간의 겉에 함께 드러나지만, 두 번 나타난다는 이유로 뜻이 더 강해지는 것은 아닙니다. 출생시간만 오후 8시 20분으로 바꾸어 계산하면 시간의 글자가 달라져, 첫 문헌의 해당 날·시간 조합을 더는 인용할 수 없습니다. 실제로 입력한 오후 2시 20분과 비교한 이유는 고전 문구의 적용 범위를 확인하기 위해서입니다. 달의 안쪽에는 여러 글자가 있어도, 겉으로 나온 서로 다른 후보는 이 사례에서 하나입니다. 고전의 해당 규칙으로 그 후보를 먼저 검토할 수 있습니다. 시간을 바꿔도 달에서 확인되는 해석 출발점 후보는 유지됩니다. 시간에 같은 글자가 또 있는지만 달라집니다. 이것이 삶의 결과를 바꾼다는 해석은 입증되지 않았습니다.',
  sourceRefs:['natal.day.stem','natal.hour.stem',
   'natal.month.stem','facts.stemConnections','facts.natalBranchRelations'],
  sourceType:'verified-hour-counterfactual-not-historical-prediction'}
];
function build(packet,winter,previous){
 if(!winter)return null;
 if(packet?.status!=='ready'||!same(packet.chart,EXPECTED)||
    packet.calculationInput?.calendar!=='lunar'||
    packet.calculationInput?.birthDate!=='1982-11-24'||
    packet.calculationInput?.birthTime!=='14:20'||
    packet.calculationInput?.mbti!=='ISFP'||
    packet.calculationInput?.gender!=='male'||
    packet.targetYear?.year!==2027||
    winter.kind!=='qa-exact-winter-source-and-counterevidence-reader-v1'||
    winter.releaseVerdict!=='not-approved'||
    winter.extraPaidParagraphApproved!==false||
    winter.actualProviderCalls!==0||
    winter.sourceScope?.whichMethodDominates!=='unresolved'||
    winter.sourceScope?.paidWriterAuthorized!==false||
    winter.sourceScope?.exactDayHour?.sourceUnit!=='exact-day-hour-winter-subcase'||
    winter.sourceScope?.seasonalMonth?.compoundConditionMatched!==false||
    winter.sourceScope?.historicalClauseDoesNotOverrideSeasonalConditions!==true||
    winter.sourceScope?.seasonalConditionsDoNotNegateHistoricalClause!==true||
    previous?.releaseVerdict!=='not-approved'||
    previous?.valueDecision?.verdict!=='not-demonstrably-more-valuable-than-free'||
    previous?.valueDecision?.repeatedReaderPropositions?.length!==3)
  throw Error('QA_REVISED_CLASSICAL_CHAPTER_SOURCE_SCOPE_INVALID');
 const methodResult=applied.inspect(packet);
 if(!methodResult||methodResult.verified.candidateExposedAt.length!==2||
    methodResult.overallPatternSelected!==false||
    methodResult.source.originalRule!=='一透則一用'||
    methodResult.approvedForCustomer!==false)
  throw Error('QA_REVISED_CH16_CLASSICAL_METHOD_APPLICATION_INVALID');
 const m=method.evaluate(packet).generalMonthRule;
 if(m.conditionObserved!==true||m.monthMainSourceId!=='natal.month.hidden.己'||
    m.monthMainExposedOutsideDay!==false||
    m.otherCandidateRoles?.[0]?.sourceId!=='natal.month.hidden.癸'||
    m.otherCandidateRoles[0].symbolicTenGodCategory!=='편인'||
    JSON.stringify(m.otherCandidateRoles[0].exposedAt)!==
     JSON.stringify(['natal.month.stem','natal.hour.stem'])||
    m.methodPriority!=='not-selected'||m.monthCommandRoleConfirmed!==false)
  throw Error('QA_REVISED_MONTH_METHOD_ORIGIN_INVALID');
 const changed=facts.build({...packet.calculationInput,birthTime:'20:20'},2027);
 const other=method.evaluate(changed).generalMonthRule;
 if(JSON.stringify(other.otherCandidateRoles?.[0]?.exposedAt)!==
    JSON.stringify(['natal.month.stem'])||
    other.otherCandidateRoles?.[0]?.sourceId!==m.otherCandidateRoles[0].sourceId)
  throw Error('QA_REVISED_MONTH_METHOD_COUNTERFACTUAL_INVALID');
 if(changed.status!=='ready'||changed.chart.day!==packet.chart.day||
    changed.chart.month!==packet.chart.month||
    changed.chart.year!==packet.chart.year||
    changed.chart.hour!=='丙戌')
  throw Error('QA_REVISED_CLASSICAL_CHAPTER_TIME_COUNTERFACTUAL_INVALID');
 const knownWinterRefs=new Set(winter.paragraphs.flatMap(row=>row.sourceRefs));
 const rows=P.map((p,i)=>({
  ...p,
  sourceRefs:p.sourceRefs.slice(),
  sourceUrl:i===0?winter.sourceScope.exactDayHour.url:
   i===1?winter.sourceScope.seasonalMonth.url:null
 }));
 const allowed=new Set([...knownWinterRefs,...previous.sourceRefs]);
 if(rows.some(x=>x.sourceRefs.some(id=>!allowed.has(id)))||
    rows[0].sourceUrl!==winter.paragraphs[0].originalUrl||
    rows[1].sourceUrl!==winter.paragraphs[1].originalUrl)
  throw Error('QA_REVISED_CLASSICAL_CHAPTER_UNCITABLE');
 const text=rows.map(row=>row.text).join('\n\n');
 if(text.length<550||text.length>1100||
    reader.errors(rows.flatMap(x=>[x.label,x.text])).length||
    /[\u3400-\u4dbf\u4e00-\u9fff]/.test(text)||
    /(?:낯선 정보|실제 사용할 자원|기존 작업 절차|동료에게|언제 승진|얼마를 벌)/.test(text)||
    /[?？]\s*$/.test(text))
  throw Error('QA_REVISED_CLASSICAL_CHAPTER_READER_VIOLATION');
 return {
  kind:'qa-source-specific-adult-first-chapter-revision-v1',
  chartFingerprint:Object.values(EXPECTED).join('/'),
  label:'같은 겨울에도 달라지는 고전 풀이의 조건',
  paragraphs:rows,text,sourceRefs:[...new Set(rows.flatMap(x=>x.sourceRefs))],
  priorEditorDecision:'rewrite-overlapping-month-story',
  revisedAgainst:'canonical-month-only-editorial-comparator',
  comparedAgainstLiveFreeProduct:false,
  removedPriorThreeRepeatedMonthThemes:true,
  narrowNewContent:'verifiable-classical-eligibility-and-contrasting-conditions',
  differentHourWouldLoseExactHistoricalEligibility:true,
  specificHistoricalTextIsNotPersonalCertainty:true,
  monthClassicalMethodApplication:structuredClone(methodResult),
  provenIncrementalCustomerBenefit:false,
  professionalMethodApproved:false,
  paidWriterAuthorized:false,approvedForCustomer:false,
  providerCalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={build};