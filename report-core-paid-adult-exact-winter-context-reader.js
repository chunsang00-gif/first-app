'use strict';
// OFFLINE only: exact 1982 14:20 winter day/hour text needs other-pillar
// counterevidence before any reader wording. Never part of paid writer.
const method=require('./report-core-paid-classical-decision-handoff');
const branch=require('./report-branch-relations');
const bindings=require('./report-fact-bindings');
const reader=require('./report-reader-policy');
const core=require('./report-core-knowledge-engine');
const EXPECTED={year:'壬戌',month:'癸丑',day:'乙未',hour:'癸未'};
const INPUT={calendar:'lunar',birthDate:'1982-11-24',birthTime:'14:20',
 leapMonth:false,gender:'male',mbti:'ISFP'};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const need=(ok,why)=>{if(!ok)throw Error('QA_EXACT_WINTER_CONTEXT_'+why);};
const paragraphs=[
 {kind:'historical-eligibility-only',label:'날과 시간에 반복된 자리',
  text:'태어난 날과 시간은 윗글자가 서로 다르지만 아랫글자는 같습니다. 옛 사주책에는 이 정확한 날과 시간의 조합을 겨울에 태어난 경우와 연결해 따로 설명합니다. 달의 글자만 보던 풀이에서 빠진 것은 바로 이 날과 시간의 조합입니다.',
  sourceRefs:['natal.day.stem','natal.day.hidden.乙',
   'natal.hour.stem','natal.hour.hidden.乙','facts.seasonalEvidence'],
  originalUrl:'https://zh.wikisource.org/zh-hant/%E4%B8%89%E5%91%BD%E9%80%9A%E6%9C%83/%E5%8D%B7%E5%85%AB'},
 {kind:'month-and-branch-counterevidence',
  label:'겨울 풀이에서 함께 봐야 할 관계',
  text:'태어난 달은 날과 시간의 아랫자리 각각과 서로 마주 보는 관계로 기록됩니다. 두 자리에 같은 관계가 반복됐다고 실제 다툼이 두 번 생기는 것은 아닙니다. 또 다른 옛 책은 겨울의 해석에 특정 글자가 겉에 드러나는 조건을 두지만, 이 사주에는 그 조건이 없습니다. 따라서 안정적이라는 평가나 갈등이 많다는 평가는 둘 다 이 근거만으로 결정할 수 없습니다.',
  sourceRefs:['facts.natalBranchRelations','facts.seasonalEvidence',
   'natal.year.stem','natal.month.stem','natal.hour.stem'],
  originalUrl:'https://luckclub.cn/bazi/004/024/'}
];
function build(packet){
 if(packet?.status!=='ready'||!packet.chart)return null;
 if(!Object.entries(INPUT).every(([k,v])=>packet.calculationInput?.[k]===v)||
  !same(packet.chart,EXPECTED)||packet.targetYear?.year!==2027)return null;
 const handoff=method.build(packet),elig=handoff.independentClassicalSourceEligibility;
 const d=elig?.exactDayHour,c=elig?.climate;
 const chosen=handoff.sourceScopedEditorialReferenceChoice;
 need(chosen?.questionRoutes?.whichClassicalDayHourText
    ?.sourceUnit==='exact-day-hour-winter-subcase'&&
  chosen.questionRoutes.whichClassicalDayHourText
    .originalSeasonalPhrase==='冬安穩'&&
  chosen.questionRoutes.whatSeasonalConditionToConsider
    .compoundBingVisibleWithoutGuiMatched===false&&
  chosen.globalInterpretationSchoolSelected===false&&
  chosen.customerSpecificNewDecisionEstablished===false,
  'EXACT_SOURCE_CITATION_CHOICE_NOT_VALID');
 need(handoff.methodApproved===false&&handoff.releaseVerdict==='not-approved'&&
  d?.winterSourceClauseMatched===true&&d.requiredDayPillar==='乙未'&&
  d.requiredHourPillar==='癸未'&&d.sourceContainsSeasonalHistoricJudgment==='冬安穩'&&
  d.url===paragraphs[0].originalUrl&&d.approvedPaidInsight===false,
  'HISTORICAL_DAY_HOUR_CLAUSE');
 need(c?.url===paragraphs[1].originalUrl&&c.bingExposed===false&&
  c.guiExposed===true&&same(c.observedGuiVisibleRefs,
   ['natal.month.stem','natal.hour.stem'])&&
  c.favorableHistoricalCompoundConditionMatched===false&&
  c.historicalFortuneClaimAllowedForCustomer===false,
  'DIFFERENT_CLIMATE_CONDITIONS');
 const actual=branch.natal(packet.chart);
 need(same(actual,packet.facts.natalBranchRelations),'BRANCH_CALCULATION_DRIFT');
 const clash=actual.pairs.filter(p=>p.type==='충'&&
  p.positions.includes('month')&&
  (p.positions.includes('day')||p.positions.includes('hour')));
 need(clash.length===2&&clash.every(p=>
  [...p.branches].sort().join('')==='丑未'.split('').sort().join(''))&&
  clash.some(p=>p.positions.includes('day'))&&
  clash.some(p=>p.positions.includes('hour')),'TWO_CONTACTS_NOT_EVENTS');
 const rows=Object.fromEntries(bindings.build(packet).map(r=>[r.id,r]));
 for(const id of [...new Set(paragraphs.flatMap(p=>p.sourceRefs))]){
  if(id.startsWith('natal.'))need(rows[id]?.observedBehavior===false&&
   rows[id].interpretationScope==='traditional-symbol-only',
   'MISSING_NATAL_SOURCE:'+id);
  else need(id==='facts.seasonalEvidence'||id==='facts.natalBranchRelations',
   'FOREIGN_SOURCE:'+id);
 }
 const text=paragraphs.flatMap(p=>[p.label,p.text]);
 need(reader.errors(text).length===0&&
  !/[\u3400-\u4dbf\u4e00-\u9fff]/.test(text.join(''))&&
  paragraphs[0].text.includes('윗글자가 서로 다르지만 아랫글자는 같습니다')&&
  paragraphs[1].text.includes('두 자리에 같은 관계가 반복됐다고')&&
  paragraphs[1].text.includes('둘 다 이 근거만으로 결정할 수 없습니다'),
  'READER_UNSUPPORTED_PREDICTION');
 const free=core.compile(packet);
 need(free.status==='draft-for-human-review'&&
  typeof free.reader?.paragraphs?.strength?.text==='string'&&
  free.releaseVerdict==='not-approved'&&
  same(free.scope?.sourceIds,['natal.month.stem','natal.month.hidden.己']),
  'FREE_BASELINE');
 const addedComparedWithFree=[
  {id:'same-day-hour-branch',sourceIds:['natal.day.stem','natal.hour.stem'],
   newlyRelevant:true,observedPersonalBehavior:false},
  {id:'two-month-branch-oppositions',sourceIds:['facts.natalBranchRelations'],
   newlyRelevant:true,observedPersonalBehavior:false},
  {id:'seasonal-exact-day-hour-classical-example',
   sourceIds:['natal.day.stem','natal.hour.stem','facts.seasonalEvidence'],
   newlyRelevant:true,observedPersonalBehavior:false},
  {id:'other-winter-classical-compound-not-met',
   sourceIds:['natal.month.stem','natal.hour.stem','facts.seasonalEvidence'],
   newlyRelevant:true,observedPersonalBehavior:false}
 ];
 const allText=paragraphs.map(x=>x.text).join(' ');
 need(addedComparedWithFree.every(x=>x.sourceIds.every(id=>
   id.startsWith('natal.')?rows[id]?.observedBehavior===false:
   ['facts.seasonalEvidence','facts.natalBranchRelations'].includes(id)))&&
  !allText.includes('낯선 내용을 자기 방식으로 이해')&&
  !allText.includes('사람·도구·시간처럼 실제 사용할 자원')&&
  !allText.includes('동료에게')&&
  !allText.includes('상황을 가정')&&
  addedComparedWithFree.every(x=>x.observedPersonalBehavior===false),
  'FREE_VS_CLASSICAL_READER_SCOPE');
 return {
  kind:'qa-exact-winter-source-and-counterevidence-reader-v1',
  chart:{...packet.chart},paragraphs:structuredClone(paragraphs),
  freeMonthText:free.reader.paragraphs.strength.text,
  editorialDifference:{kind:'qa-real-free-month-vs-exact-winter-comparison-v1',
   comparedMonthRefs:free.scope.sourceIds.slice(),
   additionalEvidence:addedComparedWithFree,
   addedSourceSpecificExplanation:true,
   sourceSpecificityIsNotProvenPersonalInsight:true,
   readerPaidValueEmpiricallyValidated:false,
   approvedForCustomer:false},
  exactWinterPassageVerified:true,
  sourceScopedQuestionResolved:true,
  sourceScopeIsNotFullChartMethodApproval:true,
  monthDayHourContacts:2,
  doubleContactIsNotTwoPredictedEvents:true,
  climateSourceDoesNotMatchFavorableCompound:true,
  appliedMethodsStillUnranked:true,
  traditionalVeracityNotScientificallyEstablished:true,
  individualLifeOrAbilityObserved:false,
  commercialReaderBenefitEstablished:false,
  extraPaidParagraphApproved:false,
  actualProviderCalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={build};
