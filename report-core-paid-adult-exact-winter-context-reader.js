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
 {kind:'historical-eligibility-only',label:'같은 날과 시간의 겨울 조건',
  text:'태어난 날과 시간의 아랫글자가 같고, 태어난 달도 겨울에 해당합니다. 옛 사주책에는 이 날과 시간의 조합을 겨울에 놓았을 때의 설명이 따로 실려 있습니다. 여기까지는 출생 정보와 문헌이 맞는다는 뜻이지, 실제 생활이 안정적이라는 확인은 아닙니다.',
  sourceRefs:['natal.day.stem','natal.day.hidden.乙',
   'natal.hour.stem','natal.hour.hidden.乙','facts.seasonalEvidence'],
  originalUrl:'https://zh.wikisource.org/zh-hant/%E4%B8%89%E5%91%BD%E9%80%9A%E6%9C%83/%E5%8D%B7%E5%85%AB'},
 {kind:'month-and-branch-counterevidence',
  label:'함께 고려할 다른 출생 자리',
  text:'그런데 태어난 달은 날과 시간 양쪽에 같은 종류의 마주 보는 관계를 이룹니다. 같은 글자 조합이 두 자리에 반복됐으므로 불운이 두 번 생긴다는 뜻은 아닙니다. 겨울의 차고 따뜻함을 중요하게 보는 다른 옛 책은 특정 글자가 겉에 나타나는지를 따지는데, 이 사주에는 그 글자가 겉에 없습니다. 서로 다른 기준을 합쳐 안정적이거나 불안정한 사람이라고 결론내릴 수 없습니다.',
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
  paragraphs[0].text.includes('실제 생활이 안정적이라는 확인은 아닙니다')&&
  paragraphs[1].text.includes('불운이 두 번 생긴다는 뜻은 아닙니다'),
  'READER_UNSUPPORTED_PREDICTION');
 const free=core.compile(packet);
 need(free.status==='draft-for-human-review'&&
  typeof free.reader?.paragraphs?.strength?.text==='string'&&
  free.releaseVerdict==='not-approved','FREE_BASELINE');
 return {
  kind:'qa-exact-winter-source-and-counterevidence-reader-v1',
  chart:{...packet.chart},paragraphs:structuredClone(paragraphs),
  freeMonthText:free.reader.paragraphs.strength.text,
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
