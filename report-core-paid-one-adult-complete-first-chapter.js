'use strict';
// ONE adult paid-value editorial benchmark using actual natal calculations.
// This is a human-readable EXAMPLE under QA, not the paid provider output;
// Saju categories are traditional symbols, not observed personality facts.
const factsCore=require('./report-core-knowledge-engine');
const source=require('./report-fact-bindings');
const readerPolicy=require('./report-reader-policy');
const paidAudit=require('./report-core-paid-depth-gap-audit');
const branch=require('./report-branch-relations');
const {LunarUtil}=require('lunar-javascript');
const names={'比肩':'비견','劫财':'겁재','食神':'식신','伤官':'상관',
 '偏财':'편재','正财':'정재','七杀':'편관','正官':'정관',
 '偏印':'편인','正印':'정인'};
const CHART={year:'壬戌',month:'癸丑',day:'乙未',hour:'癸未'};
const REFS=['natal.year.stem','natal.month.stem','natal.day.stem',
 'natal.hour.stem','natal.month.hidden.己',
 'natal.day.hidden.乙','natal.hour.hidden.乙',
 'facts.natalBranchRelations','facts.stemConnections','facts.seasonalEvidence'];
const TITLE='기존 기준과 새 방식을 함께 검토하는 선택';
const PARAGRAPHS=[
 {kind:'interpretation',
  text:'이 사주에서 태어난 해에는 이미 알려진 설명을 참고하는 뜻이 있습니다. 달과 시간의 윗글자에는 낯선 내용을 자기 방식으로 이해하는 뜻이 반복되고, 달의 안쪽 대표 글자는 사람·도구·시간처럼 실제 사용할 자원을 살피는 뜻으로 따로 분류됩니다. 다만 여기서 확인되는 것은 익숙한 설명, 새로운 정보, 필요한 자원이 서로 다른 뜻으로 분류된다는 점까지입니다. 무엇을 우선할지는 이 계산만으로 정할 수 없습니다. 같은 뜻이 두 자리에 있다고 이해력이 더 좋다고 판단하지는 않습니다.'},
 {kind:'opposing-evidence',
  text:'태어난 날과 시간은 아랫글자가 똑같고, 두 자리 안쪽에는 날의 기준과 같은 종류의 글자가 확인됩니다. 달과 날, 달과 시간에는 서로 마주보는 관계가 하나씩 표시되는데, 양쪽 모두 같은 달 글자와 같은 날·시간 글자의 조합입니다. 이 표시는 서로 다른 두 사건의 예고가 아닙니다. 같은 뜻이 여러 자리에 나타나더라도 실제 갈등이 많거나 특정 성향이 더 강하다고 판단할 수 없습니다.'},
 {kind:'adult-scenario',
  text:'예를 들어 기존 작업 절차를 바꾸자는 제안이 나왔다고 가정해 보겠습니다. 기존 지침에서 유지할 안전 기준은 남기고, 새 설명이 해결하려는 문제와 시험에 필요한 사람·도구를 비교할 수 있습니다. 기존 방식만 따지면 개선 기회를 놓칠 수 있고, 새 방법만 살피면 준비할 자원이나 안전 조건을 빠뜨릴 수 있습니다. 어느 순서로 시험할지는 사주가 아니라 실제 작업 규정과 현장 여건에 따라 정해야 합니다.'},
 {kind:'bounded-action',
  text:'이 상황에서는 유지할 기준, 시험할 변경점, 필요한 자원과 결과를 확인할 시점을 따로 적는 방식이 가능합니다. 다만 이 사례는 계산된 전통 상징을 이해하기 위한 가정입니다. 실제 업무 능력이나 행동을 관찰한 결과가 아니며, 어느 사주 요소를 우선할지도 아직 전문적인 검토가 필요합니다.'}
];
// Each reader-facing paragraph is checked against a precise origin. The
// scenario and its practical recommendation are NOT paid personal insights.
// No inference priority or user behaviour is established by this ledger.
const CLAIMS=[
 {id:'year-known-guidance',kind:'traditional-symbol-meaning',paragraph:'interpretation',
  quote:'태어난 해에는 이미 알려진 설명을 참고하는 뜻이 있습니다',
  refs:['natal.year.stem']},
 {id:'month-hour-unfamiliar-understanding',kind:'traditional-symbol-meaning',
  paragraph:'interpretation',
  quote:'달과 시간의 윗글자에는 낯선 내용을 자기 방식으로 이해하는 뜻이 반복되고',
  refs:['natal.month.stem','natal.hour.stem']},
 {id:'month-hidden-resources',kind:'traditional-symbol-meaning',
  paragraph:'interpretation',
  quote:'달의 안쪽 대표 글자는 사람·도구·시간처럼 실제 사용할 자원을 살피는 뜻',
  refs:['natal.month.hidden.己']},
 {id:'no-auto-priority',kind:'unresolved-interpretive-method',
  paragraph:'interpretation',
  quote:'무엇을 우선할지는 이 계산만으로 정할 수 없습니다',
  refs:[]},
 {id:'day-and-hour-identical-branch',kind:'verified-computed-relation',
  paragraph:'opposing-evidence',
  quote:'태어난 날과 시간은 아랫글자가 똑같고',
  refs:['facts.natalBranchRelations']},
 {id:'day-hour-hidden-same-stem',kind:'verified-computed-relation',
  paragraph:'opposing-evidence',
  quote:'두 자리 안쪽에는 날의 기준과 같은 종류의 글자가 확인됩니다',
  refs:['natal.day.hidden.乙','natal.hour.hidden.乙','facts.stemConnections']},
 {id:'month-day-and-month-hour-table-pairs',kind:'verified-computed-relation',
  paragraph:'opposing-evidence',
  quote:'달과 날, 달과 시간에는 서로 마주보는 관계가 하나씩 표시되는데',
  refs:['facts.natalBranchRelations']},
 {id:'pair-count-is-not-event-count',kind:'unresolved-interpretive-method',
  paragraph:'opposing-evidence',
  quote:'이 표시는 서로 다른 두 사건의 예고가 아닙니다',
  refs:[]},
 {id:'workplace-change-only-an-example',kind:'hypothetical-not-chart-inference',
  paragraph:'adult-scenario',
  quote:'예를 들어 기존 작업 절차를 바꾸자는 제안이 나왔다고 가정해 보겠습니다',
  refs:[]},
 {id:'practical-steps-not-premium-personality',kind:'generic-practical-advice',
  paragraph:'bounded-action',
  quote:'이 상황에서는 유지할 기준, 시험할 변경점, 필요한 자원과 결과를 확인할 시점을 따로 적는 방식이 가능합니다',
  refs:[]},
 {id:'traditional-priority-remains-unreviewed',kind:'unresolved-interpretive-method',
  paragraph:'bounded-action',
  quote:'어느 사주 요소를 우선할지도 아직 전문적인 검토가 필요합니다',
  refs:[]}
];
function traceClaims(rows){
 const allowed=new Set(REFS),positions=new Map(PARAGRAPHS.map(p=>[p.kind,p.text]));
 if(new Set(CLAIMS.map(c=>c.id)).size!==CLAIMS.length)
  throw Error('QA_ADULT_CLAIM_TRACE_DUPLICATE');
 const result=[];
 for(const claim of CLAIMS){
  if(!positions.get(claim.paragraph)?.includes(claim.quote)||
     !Array.isArray(claim.refs)||claim.refs.some(id=>!allowed.has(id)))
   throw Error('QA_ADULT_CLAIM_TRACE_TEXT_OR_REFS_DRIFT:'+claim.id);
  const sourceBased=['traditional-symbol-meaning','verified-computed-relation'].includes(claim.kind);
  if(sourceBased!==Boolean(claim.refs.length))
   throw Error('QA_ADULT_CLAIM_TRACE_UNSUPPORTED_SOURCE_CLASS:'+claim.id);
  for(const id of claim.refs){
   if(id.startsWith('natal.')){
    if(!rows[id]||rows[id].interpretationScope!=='traditional-symbol-only')
     throw Error('QA_ADULT_CLAIM_TRACE_MISSING_CALCULATION:'+id);
   }else if(!['facts.stemConnections','facts.natalBranchRelations'].includes(id))
    throw Error('QA_ADULT_CLAIM_TRACE_UNVERIFIED_FACT:'+id);
  }
  result.push({id:claim.id,kind:claim.kind,paragraph:claim.paragraph,
   exactText:claim.quote,sourceRefs:claim.refs.slice(),
   calculationOnly:claim.kind==='verified-computed-relation',
   symbolOnly:claim.kind==='traditional-symbol-meaning',
   licensedAsPersonalConclusion:false});
 }
 return {
  kind:'qa-adult-first-chapter-claim-origin-review-v1',
  claims:result,
  tracedClaimCount:result.length,
  concreteComputedRelationCount:result.filter(c=>c.calculationOnly).length,
  traditionalSymbolExplanationCount:result.filter(c=>c.symbolOnly).length,
  hypotheticalAndGeneralClaims:result.filter(c=>
   ['hypothetical-not-chart-inference','generic-practical-advice'].includes(c.kind))
   .map(c=>c.id),
  methodPriorityUnresolved:true,realWorldTraitInferred:false,
  paidValueProven:false,releaseVerdict:'not-approved',providerCalls:0
 };
}
function build(packet){
 if(packet?.status!=='ready'||!packet.chart?.hour)throw Error('QA_ADULT_CORE_VALID_PACKET_REQUIRED');
 const input=packet.calculationInput||{};
 // Exact fixture (including demographic/MBTI and target year), not a horoscope classifier. A future year or an adult
 // with the same pillar cycle cannot silently receive this personal draft.
 if(input.calendar!=='lunar'||input.birthDate!=='1982-11-24'||
    input.birthTime!=='14:20'||input.leapMonth!==false||
    input.gender!=='male'||input.mbti!=='ISFP'||
    packet.targetYear?.year!==2027||
    !Object.entries(CHART).every(([k,v])=>packet.chart[k]===v))
  return null;
 const age=packet.targetYear?.year-1982;
 if(!Number.isInteger(age)||age<18)return null;
 const calculated=factsCore.compile(packet),paid=paidAudit.reportOne(packet);
 if(calculated.status!=='draft-for-human-review'||
    calculated.review.fourPillar?.ruleId!==
     'full-four-pillars-chukmi-day-hour-roots-v1'||
    calculated.review.fourPillar?.methodPriorityReview?.priorityVerdict!=='not-established'||
    calculated.releaseVerdict!=='not-approved'||
    paid.paidWholeChartGrounded!==false||
    paid.paidReceivesOfflineSynthesis!==false)
  throw Error('QA_ADULT_CORE_SOURCE_OR_PAID_BOUNDARY_DRIFT');
 const rows=Object.fromEntries(source.build(packet).map(x=>[x.id,x]));
 const expected={
  'natal.year.stem':'정인','natal.month.stem':'편인',
  'natal.day.stem':'일간','natal.hour.stem':'편인',
  'natal.month.hidden.己':'편재',
  'natal.day.hidden.乙':'비견','natal.hour.hidden.乙':'비견'
 };
 for(const [id,role] of Object.entries(expected)){
  const row=rows[id];
  if(!row||row.tenGod!==role||
     (id==='natal.day.stem'?role!== '일간':
      names[LunarUtil.SHI_SHEN[CHART.day[0]+row.stem]]!==role)||
     row.observedBehavior!==false||
     row.interpretationScope!=='traditional-symbol-only')
   throw Error('QA_ADULT_CORE_FALSE_SOURCE_ROLE:'+id);
 }
 const relations=branch.natal(packet.chart);
 if(JSON.stringify(relations)!==JSON.stringify(packet.facts.natalBranchRelations))
  throw Error('QA_ADULT_CORE_BRANCH_LEDGER_DRIFT');
 const pairMatches=relations.pairs.filter(x=>x.type==='충'&&
  x.positions.includes('month')&&
  (x.positions.includes('day')||x.positions.includes('hour')));
 if(pairMatches.length!==2||
    new Set(pairMatches.map(x=>x.positions.slice().sort().join('/'))).size!==2)
  throw Error('QA_ADULT_CORE_DAY_HOUR_MONTH_CONTRAST_MISSING');
 // These are TWO positional entries for the SAME two branch characters,
 // not two independent predicted life events or independently ranked clashes.
 const canonicalPair=x=>[...x.branches].sort().join('');
 const sameBranchRelation=new Set(pairMatches.map(x=>x.type+':'+canonicalPair(x)));
 if(packet.chart.day[1]!==packet.chart.hour[1]||
    sameBranchRelation.size!==1||
    canonicalPair(pairMatches[0])!==canonicalPair(pairMatches[1])||
    pairMatches.some(x=>canonicalPair(x)!==
     canonicalPair({branches:packet.chart.month[1]+packet.chart.day[1]})))
  throw Error('QA_ADULT_CORE_DUPLICATED_BRANCH_PAIR_NOT_VERIFIED');
 const claimOrigin=traceClaims(rows);
 const copy=PARAGRAPHS.map(x=>x.text).join('\n\n');
 if(readerPolicy.errors([TITLE,copy]).length||
    /[?？]\s*$/.test(copy)||
    /(?:실제 직업이 정해집니다|갈등이 반복될 운명)/.test(copy))
  throw Error('QA_ADULT_CORE_READER_POLICY_VIOLATION');
 return {
  kind:'qa-adult-four-pillar-first-chapter-v1',
  label:TITLE,paragraphs:PARAGRAPHS.map(x=>({...x})),text:copy,
  ageAtTargetYear:age,audience:'adult',
  sourceChart:{...CHART},sourceRefs:REFS.slice(),
  claimOrigin,
  evidence:{
   verifiedStemRoles:expected,
   monthDayAndMonthHourClashTablePairs:2,
   repeatedBranchPairObservation:{
    natalDayAndHourBranchSame:true,
    distinctMonthOppositionBranchTypes:1,
    twoPositionEntriesDoNotMeanTwoLifeEvents:true,
    monthBranch:packet.chart.month[1],
    dayAndHourBranch:packet.chart.day[1]
   },
   clashesAreNotRealWorldEvents:true,
   methodPriority:'not-established',
   actualPaidFirstChapterHasWholeChartRefs:false,
   existingCuratedRuleId:calculated.review.fourPillar.ruleId
  },
  editorialAssessment:{
   concreteHypotheticalExample:true,
   counterevidenceIncluded:true,
   professionalTraditionalInterpretationApproved:false,
   userPersonalityVerified:false,
   readerPaidValueEmpiricallyValidated:false,
   practicalScenarioNotDerivedFromBirthChart:true,
   copiesIntoRealProviderRequest:false
  },
  status:'draft-for-human-review',releaseVerdict:'not-approved',
  providerCalls:0,readyForSale:false
 };
}
module.exports={build};
