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
  text:'이 사주에는 태어난 달에서 말하는 새 정보의 이해와 별도로, 결과를 만들고 표현하는 뜻도 들어 있습니다. 태어난 시간의 겉글자는 배움·해석에 관한 분류이고, 같은 시간 안쪽에는 생산·표현에 관한 다른 분류가 있습니다. 『삼명통회』는 이 겉글자가 안쪽의 표현을 누르는 관계로 설명합니다. 이 방식으로 풀이하면 준비하고 이해하는 일과 그것을 밖으로 내놓는 일을 같은 강점으로 묶을 수 없습니다. 다만 실제로 표현이 서툴거나 일을 늦게 끝낸다는 뜻은 아닙니다. 또한 특정 날과 시간까지 일치하는 겨울 구절이 따로 있습니다. 이 출생 기록은 고전이 겨울의 해당 날·시간 조합을 안정된 쪽으로 풀이한 조건에 들어갑니다. 이것은 고전의 제한된 전통적 평가일 뿐, 현실의 삶이 안정적이라는 확인은 아닙니다.',
  sourceRefs:['natal.day.stem','natal.day.hidden.乙',
   'natal.hour.stem','natal.hour.hidden.乙','natal.hour.hidden.丁',
   'facts.seasonalEvidence'],
  sourceType:'verified-general-hour-role-contrast-and-exact-winter-day-hour-clause'},
 {kind:'different-winter-condition',label:'겨울의 또 다른 판단 조건',
  text:'다른 고전은 겨울에 따뜻함을 뜻하는 글자가 겉으로 드러나고 특정 다른 글자가 나오지 않는 조건을 살핍니다. 이 사주에는 따뜻함의 글자가 겉에 없고, 함께 나오지 않아야 할 글자가 달과 시간에 있습니다. 따라서 그 문헌의 유리한 조건은 충족되지 않습니다. 그렇다고 첫 고전의 겨울 평가가 취소되거나 반대로 불운이 정해지는 것은 아닙니다. 서로 질문 자체가 다른 자료입니다.',
  sourceRefs:['natal.month.stem','natal.hour.stem','facts.seasonalEvidence'],
  sourceType:'separate-published-winter-month-condition'},
 {kind:'counterfactual-source-boundary',label:'출생시간을 바꾸면 달라지는 적용 범위',
  text:'출생시간을 오후 8시 20분으로 바꾸면 첫 고전의 해당 겨울 구절을 더는 적용할 수 없습니다. 다른 일·시 조합에 해당하지만, 해·달의 추가 조건과 결과는 아직 판정하지 않습니다. 다른 겨울 문헌에서는 따뜻함을 뜻하는 글자가 겉에 나오지만, 함께 나오지 않아야 할 글자가 달에 남아 있어 유리한 복합 조건 역시 충족하지 못합니다. 달의 숨은 글자 중 겉으로 나온 서로 다른 후보는 이 사례에서 하나이며, 해석 출발점 후보는 유지됩니다. 달과 날의 관계표는 그대로지만 달과 시간 사이의 마주 보는 관계는 사라집니다. 출생시간이 바뀌면서 사라진 것은 시간 겉글자와 안쪽 표현 글자에 관한 앞 문단의 직접적인 관계입니다. 이것을 다른 시간에 똑같이 적용할 수 없습니다.',
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
 if(!methodResult?.verified?.monthHourBranchContactChangesByBirthHour||
    !methodResult.verified.branchTable.monthHour.tableLabels.includes('충')||
    methodResult.verified.branchTable.alternateMonthHour.tableLabels.includes('충'))
  throw Error('QA_REVISED_SOURCE_BRANCH_INTERPRETATION_NOT_GROUNDED');
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
 const alternateClassical=require('./report-core-paid-classical-decision-handoff')
  .build(changed).independentClassicalSourceEligibility;
 const otherHour=alternateClassical?.alternativeExactDayHour;
 const otherClimate=alternateClassical?.climate;
 if(alternateClassical?.exactDayHour!==null||
    otherHour?.requiredDayPillar!=='乙未'||
    otherHour?.requiredHourPillar!=='丙戌'||
    otherHour?.yearMonthGrammarAndOtherConditionsNotResolved!==true||
    otherHour?.cannotBorrowGuiWeiWinterClause!==true||
    otherHour?.approvedPaidInsight!==false||
    otherClimate?.bingExposed!==true||otherClimate?.guiExposed!==true||
    JSON.stringify(otherClimate?.observedBingVisibleRefs)!==
      JSON.stringify(['natal.hour.stem'])||
    JSON.stringify(otherClimate?.observedGuiVisibleRefs)!==
      JSON.stringify(['natal.month.stem'])||
    otherClimate?.favorableHistoricalCompoundConditionMatched!==false||
    otherClimate?.historicalFortuneClaimAllowedForCustomer!==false)
  throw Error('QA_REVISED_ALTERNATE_CLASSICAL_CONDITIONS_NOT_VERIFIED');
 // The same cited passage distinguishes the general Yi/Gui-Wei hour
 // relation from the narrower Yi-Wei/Gui-Wei winter clause. Keep these
 // as traditional categories, not proof of slow delivery or weak expression.
 const categoryRows=Object.fromEntries(require('./report-fact-bindings')
  .build(packet).map(row=>[row.id,row]));
 const outside=categoryRows['natal.hour.stem'];
 const inside=categoryRows['natal.hour.hidden.丁'];
 if(outside?.stem!=='癸'||outside?.tenGod!=='편인'||
    inside?.stem!=='丁'||inside?.tenGod!=='식신'||
    outside.interpretationScope!=='traditional-symbol-only'||
    inside.interpretationScope!=='traditional-symbol-only'||
    outside.observedBehavior!==false||inside.observedBehavior!==false)
  throw Error('QA_REVISED_CLASSICAL_HOUR_READING_FACT_DRIFT');
 const knownWinterRefs=new Set(winter.paragraphs.flatMap(row=>row.sourceRefs));
 const rows=P.map((p,i)=>({
  ...p,
  sourceRefs:p.sourceRefs.slice(),
  sourceUrl:i===0?winter.sourceScope.exactDayHour.url:
   i===1?winter.sourceScope.seasonalMonth.url:null
 }));
 const allowed=new Set([...knownWinterRefs,...previous.sourceRefs,
  'natal.hour.hidden.丁']);
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