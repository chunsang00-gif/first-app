'use strict';
// One exact synthetic birth chart: cross-check two published traditional
// passages against computed positions. NO school priority, actual 化木,
// successful personality inference, live paid writer, or sale approval.
const facts=require('./report-facts-node');
const pairs=require('./report-core-paid-natal-visible-stem-pair-screen');
const relation=require('./report-core-paid-adult-classical-relation-review');
const ledger=require('./report-fact-bindings');
const INPUT=Object.freeze({calendar:'solar',birthDate:'1994-07-15',
 birthTime:'14:20',gender:'male',mbti:'ISFP'});
const CHART=Object.freeze({year:'甲戌',month:'辛未',day:'壬寅',hour:'丁未'});
const SOURCES=Object.freeze({
 shenming:{
  title:'三命通會',unit:'卷二 / 論進交退伏·論十干化氣',
  url:'https://zh.wikisource.org/zh-hant/三命通會/卷二',
  checkedPhrase:'丁壬化木，非亥卯未月不化',
  scope:'丁壬 pairing and an enumerated possible month condition only',
  matchingDayHourWorkedExample:false
 },
 ziping:{
  title:'子平真詮',unit:'五、論十干合而不合',
  url:'https://www.donglishuzhai.net/chapter/3718.html',
  checkedPhrase:'本身之合',
  scope:'self-day-stem pairing is not automatically combined away; general principle',
  matchingDayHourWorkedExample:false
 }
});
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function inspect(packet){
 if(process.env.NODE_ENV!=='test'||process.env.RENDER==='true'||
    process.env.PAID_CORE_DEPTH_V2!=='offline-preview')
  throw Error('QA_DINGREN_CLASSICAL_PREVIEW_ONLY');
 if(packet?.status!=='ready'||packet.targetYear?.year!==2027||
   Object.entries(INPUT).some(([k,v])=>packet.calculationInput?.[k]!==v)||
   !same(packet.chart,CHART))return null;
 const stems=Object.fromEntries(ledger.build(packet).map(row=>[row.id,row]));
 const day=stems['natal.day.stem'],hour=stems['natal.hour.stem'];
 const hidden=stems['natal.month.hidden.丁'];
 const observed=pairs.inspect(packet);
 const matches=observed.matches.filter(row=>row.combination==='丁壬'&&
   row.from==='natal.day.stem'&&row.to==='natal.hour.stem');
 const conflict=relation.inspect(packet);
 const seasonal=packet.facts.seasonalEvidence;
 if(day?.stem!=='壬'||day.tenGod!=='일간'||
    hour?.stem!=='丁'||hour.tenGod!=='정재'||
    hidden?.stem!=='丁'||hidden?.tenGod!=='정재'||
    seasonal?.monthBranch!=='未'||seasonal?.monthPhase!=='transition'||
    matches.length!==1||matches[0].adjacent!==true||
    matches[0].tableMatchOnly!==true||
    matches[0].transformedToElement!=='not-assessed'||
    observed.elementalTransformationEstablished!==false||
    conflict?.unresolved?.traditionalMethodPriority!=='not-established'||
    conflict?.verified?.hourMonthElementDirectionIsNonAdjacent!==true||
    conflict?.unresolved?.dayHourCombinationDoesNotRemoveEitherStem!==true)
  throw Error('QA_DINGREN_CLASSICAL_COMPUTED_PREMISE_MISMATCH');
 const other=facts.build({...packet.calculationInput,birthTime:'20:20'},2027);
 if(other.status!=='ready'||other.chart.year!==CHART.year||
    other.chart.month!==CHART.month||other.chart.day!==CHART.day||
    other.chart.hour===CHART.hour)
  throw Error('QA_DINGREN_CLASSICAL_TIME_COUNTERFACTUAL_INVALID');
 const otherPairs=pairs.inspect(other).matches.filter(row=>
    row.combination==='丁壬'&&
    row.from==='natal.day.stem'&&row.to==='natal.hour.stem');
 if(otherPairs.length!==0||other.chart.hour?.[0]==='丁')
  throw Error('QA_DINGREN_CLASSICAL_ALTERNATE_HOUR_STILL_MATCHES');
 const reader={
  heading:'같은 출생정보에서도 합의 후보와 실제 변화는 다르게 읽습니다',
  paragraphs:[
   '이 출생정보에서는 태어난 날의 壬과 태어난 시간의 丁이 가까이 놓입니다. 옛 사주 해석에는 이 두 글자를 한 쌍으로 살피는 규칙이 있습니다. 그래서 시간에 나타난 돈·자원 관련 분류를 독립된 성격이나 재물 운으로 바로 읽기 전에, 날의 기준 글자와 맺는 관계부터 함께 확인해야 합니다.',
   '『삼명통회』는 이 두 글자의 변화 가능성을 논하면서 亥·卯·未에 해당하는 출생월을 거론합니다. 이 사례의 월은 未이므로 그 설명에서 언급한 달의 범위에는 들어갑니다. 그러나 책에서 달의 범위를 언급했다는 이유만으로 두 글자가 실제로 木으로 변했다거나, 원래의 작용이 없어졌다고 판단할 수는 없습니다. 『자평진전』에서도 자신의 기준 글자가 맺는 관계를 단순히 다른 글자가 사라진 것으로 계산하지 않도록 구별합니다.',
   '출생시간을 같은 날 오후 8시 20분으로 바꾸면 시간의 글자가 달라져 이 날·시간의 짝 자체가 사라집니다. 따라서 원래 시간의 이야기를 새로운 시간에 그대로 복사할 수 없습니다. 어느 해석이 우선이고 실제 기질이나 금전 결과에 어떤 영향을 주는지는 이 계산과 두 문헌만으로 확정하지 않습니다.'
  ],
  evidentialNewPoint:'adjacent-day-hour-pair-and-seasonal-month-candidate-vs-unproven-transformation',
  notAnObservedPersonality:true,
  noFinancialPrediction:true,
  humanEditorialApproved:false
 };
 return {
  kind:'qa-1994-dingren-two-classics-method-scope-v1',
  exactChart:Object.values(CHART).join('/'),
  sourceUnits:Object.values(SOURCES).map(s=>({...s})),
  verified:{
   dayId:day.id,hourId:hour.id,monthHiddenId:hidden.id,
   pair:matches[0].combination,adjacent:true,
   monthBranch:'未',monthIsListedAmongTextConditions:true,
   secondaryMonthConditionMatched:true,
   seasonTransitionalNotProvenDominant:true,
   selfDayStemPairNotAutomaticallyRemoved:true,
   alternateBirthTime:'20:20',
   alternateHourPillar:other.chart.hour,
   sameDayMonthYearUnderCounterfactual:true,
   alternateHasDingRenDayHourPair:false
  },
  unresolved:{
   actualCombinationEffect:'not-established',
   transformationToWood:'not-established',
   hourStemMeaningRemoved:'not-established',
   schoolPriority:'not-established',
   dayMasterStrength:'not-assessed',
   favorableUnfavorable:'not-assessed',
   personalityCareerMoneyOutcome:'not-assessed'
  },
  reader,
  origin:'two-traditional-texts-plus-verified-calculation',
  fullClassicalExpertReview:false,
  approvedForPaidWriter:false,
  approvedForCustomer:false,
  extraApiCalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={inspect,INPUT,CHART,SOURCES};
