'use strict';
// Isolated editorial hypothesis from an exact published classical hour rule.
// It is NOT attached to provider schemas, paid customer outputs or the
// formerly approved one-call QA input. Human review is still required.
const bindings=require('./report-fact-bindings');
const policy=require('./report-reader-policy');
const decision=require('./report-core-paid-classical-decision-handoff');
const EXPECTED={year:'壬戌',month:'癸丑',day:'乙未',hour:'癸未'};
const ORIGINAL='https://zh.wikisource.org/zh-hant/%E4%B8%89%E5%91%BD%E9%80%9A%E6%9C%83/%E5%8D%B7%E5%85%AB';
const readerText='이 사주를 고전의 출생시간 풀이로 읽으면, 새로운 내용을 받아들이는 뜻과 그것을 눈에 보이는 결과로 바꾸는 뜻을 따로 살핍니다. 시간의 겉글자는 배우고 해석하는 쪽, 시간 안에 숨은 다른 글자는 만들어 표현하는 쪽에 해당합니다. 이 책은 겉에 있는 글자가 안쪽의 표현을 누르는 관계를 따로 적습니다. 예를 들어 새로운 일을 익힌 뒤 남이 사용할 수 있도록 설명서를 만든다면, 내용을 이해하는 과정과 결과를 밖으로 보여 주는 과정은 별개의 일이 됩니다. 이 둘 사이의 관계를 전통적으로 비교할 수 있지만, 실제로 표현력이 부족하거나 일을 늦게 끝내는 사람이라는 뜻은 아닙니다. 같은 책은 해당 출생일·시간이 겨울에 놓였을 때를 별도로 평가하므로, 하나의 관계만으로 좋고 나쁨을 정할 수도 없습니다.';
function build(packet){
 const input=packet?.calculationInput;
 if(packet?.status!=='ready'||packet?.targetYear?.year!==2027||
    input?.calendar!=='lunar'||input.birthDate!=='1982-11-24'||
    input.birthTime!=='14:20'||input.leapMonth!==false||
    input.gender!=='male'||input.mbti!=='ISFP'||
    Object.entries(EXPECTED).some(([k,v])=>packet.chart?.[k]!==v))return null;
 const index=Object.fromEntries(bindings.build(packet).map(row=>[row.id,row]));
 const visible=index['natal.hour.stem'];
 const hidden=index['natal.hour.hidden.丁'];
 if(visible?.stem!=='癸'||visible.tenGod!=='편인'||
    hidden?.stem!=='丁'||hidden.tenGod!=='식신'||
    visible.observedBehavior!==false||hidden.observedBehavior!==false||
    visible.interpretationScope!=='traditional-symbol-only'||
    hidden.interpretationScope!=='traditional-symbol-only')
  throw Error('QA_CLASSICAL_OUTPUT_HOUR_SOURCE_DRIFT');
 const source=decision.build(packet).independentClassicalSourceEligibility;
 if(source.exactDayHour?.requiredDayPillar!=='乙未'||
    source.exactDayHour?.requiredHourPillar!=='癸未'||
    source.exactDayHour?.winterSourceClauseMatched!==true||
    source.exactDayHour?.url!==ORIGINAL||
    source.alternativeExactDayHour!==null||
    source.exactDayHour?.approvedPaidInsight!==false)
  throw Error('QA_CLASSICAL_OUTPUT_EXACT_WINTER_RULE_DRIFT');
 const label='새로운 것을 이해하는 일과 결과로 보여 주는 일';
 if(policy.errors([label,readerText]).length||
    /[\\u3400-\\u4dbf\\u4e00-\\u9fff]/.test(readerText)||
    readerText.length<450||readerText.length>850)
  throw Error('QA_CLASSICAL_OUTPUT_READER_VIOLATION');
 return {
  kind:'qa-isolated-yi-guiwei-hour-expression-editorial-reading-v1',
  authoringSource:'hand-edited-exact-classical-hour-rule',
  text:readerText,label,
  basis:{
   sourceUrl:ORIGINAL,chapter:'卷八·六乙日癸未時斷',
   generalRuleScope:'乙日癸未時; visible 癸 vs hidden 丁',
   additionalNarrowRuleScope:'乙未日癸未時; 겨울 조건',
   refs:['natal.day.stem','natal.hour.stem','natal.hour.hidden.丁','facts.seasonalEvidence'],
   comparisonMeaning:'understanding-versus-expression-as-traditional-symbols',
   noVerifiedRealLifeSkillOrTemperament:true,
   noWholeChartMethodPrioritySelected:true
  },
  chartFingerprint:Object.values(EXPECTED).join('/'),
  sourceInActualProviderRequest:false,
  uncitableInFrozenApprovedWriter:true,
  standaloneEditorialOnly:true,
  approvedForCustomer:false,
  paidApiCalls:0,
  releaseVerdict:'not-approved'
 };
}
module.exports={build};
