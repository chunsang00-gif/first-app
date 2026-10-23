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
  text:'이 사주에서 태어난 해에는 이미 알려진 기준을 참고하는 뜻이 있습니다. 달과 시간의 윗글자에는 낯선 내용을 자기 방식으로 이해하는 뜻이 반복되고, 달의 안쪽 대표 글자는 사람·도구·시간처럼 실제 사용할 자원을 살피는 뜻으로 따로 분류됩니다. 그래서 이 풀이의 중심은 기준을 지키는 일, 새로운 설명을 검토하는 일, 실행에 필요한 수단을 고르는 일을 한데 섞지 않는 데 있습니다. 같은 뜻이 두 자리에 있다고 이해력이 더 좋다고 판단하지는 않습니다.'},
 {kind:'opposing-evidence',
  text:'태어난 날과 시간의 안쪽에는 날의 기준과 같은 종류의 글자가 각각 확인됩니다. 반면 달과 날, 달과 시간의 두 자리 쌍에는 서로 마주보는 관계가 기록됩니다. 새로운 내용을 이해한다는 뜻이 반복되더라도, 이 다른 근거를 무시하고 한쪽 성향이 더 강하다고 결론낼 수는 없습니다. 관계표상의 마주봄을 실제 다툼이나 실패로 해석할 수도 없습니다.'},
 {kind:'adult-scenario',
  text:'예를 들어 기존 작업 절차를 바꾸자는 제안이 나왔다고 가정해 보겠습니다. 기존 지침에서 반드시 지킬 안전 기준은 남기고, 새 설명이 해결하려는 문제와 시험에 필요한 사람·도구를 비교할 수 있습니다. 기존 방식만 따지면 개선 기회를 놓칠 수 있고, 새 방법만 살피면 준비할 자원이나 안전 조건을 빠뜨릴 수 있습니다. 어느 순서로 시험할지는 사주가 아니라 실제 작업 규정과 현장 여건에 따라 정해야 합니다.'},
 {kind:'bounded-action',
  text:'이 상황에서는 유지할 기준, 시험할 변경점, 필요한 자원과 결과를 확인할 시점을 따로 적는 방식이 가능합니다. 다만 이 사례는 계산된 전통 상징을 이해하기 위한 가정입니다. 실제 업무 능력이나 행동을 관찰한 결과가 아니며, 어느 사주 요소를 우선할지도 아직 전문적인 검토가 필요합니다.'}
];
function build(packet){
 if(packet?.status!=='ready'||!packet.chart?.hour)throw Error('QA_ADULT_CORE_VALID_PACKET_REQUIRED');
 const input=packet.calculationInput||{};
 // Exact fixture, not a horoscope classifier. A future year or an adult
 // with the same pillar cycle cannot silently receive this personal draft.
 if(input.calendar!=='lunar'||input.birthDate!=='1982-11-24'||
    input.birthTime!=='14:20'||input.leapMonth!==false||
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
  evidence:{
   verifiedStemRoles:expected,
   monthDayAndMonthHourClashTablePairs:2,
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
   copiesIntoRealProviderRequest:false
  },
  status:'draft-for-human-review',releaseVerdict:'not-approved',
  providerCalls:0,readyForSale:false
 };
}
module.exports={build};
