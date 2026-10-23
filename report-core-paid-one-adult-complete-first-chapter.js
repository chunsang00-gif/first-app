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
  text:'태어난 해에는 이미 확인된 설명을 참고하는 뜻이 있고, 달과 시간의 겉에는 낯선 내용을 자기 방식으로 이해하는 뜻이 같은 분류로 반복됩니다. 달의 안쪽 대표 글자는 필요한 사람이나 도구처럼 실제 사용할 자원을 살피는 뜻으로 따로 계산됩니다. 이를 한 가지 판단으로 연결하면 이미 알고 있는 기준을 참고하는 일, 새로운 설명을 검토하는 일, 필요한 수단을 확인하는 일을 구별해서 살펴보는 관점입니다. 같은 분류가 두 자리에 나타났다고 그 능력이 강하거나 실제로 자주 그런 행동을 한다는 뜻은 아닙니다.'},
 {kind:'opposing-evidence',
  text:'이 사주에서는 태어난 날과 시간의 안쪽에 날의 기준과 같은 종류의 글자가 확인됩니다. 한편 달과 날, 달과 시간을 나타내는 자리에는 서로 마주보는 관계가 표에 기록됩니다. 따라서 달과 시간에 비슷한 뜻이 반복된다는 한 가지 사실만으로 모든 해석을 밀어붙일 수는 없습니다. 관계표에 같은 이름이 여러 번 나온다고 실제 갈등이 반복되거나 앞서 설명한 뜻이 사라진다고 판단할 근거도 없습니다. 어떤 조건을 우선해야 하는지는 현재의 계산만으로 결정되지 않았습니다.'},
 {kind:'adult-scenario',
  text:'예를 들어 기존 작업 절차를 바꾸자는 제안을 받았다고 가정해 보겠습니다. 기존 방식에서 꼭 유지할 기준을 먼저 확인하고, 새 방식이 해결하려는 문제와 필요한 사람·도구를 나란히 놓고 비교할 수 있습니다. 이 비유의 장점은 바꾸면 좋은 부분과 유지해야 할 기준을 서로 혼동하지 않는다는 점입니다. 반대로 과거 기준만 고수하면 개선 기회를 놓칠 수 있고, 새로운 설명에만 집중하면 필요한 자원이나 안전 조건을 빠뜨릴 수 있습니다. 다만 실제 시험 순서는 정해진 안전 규정과 작업 환경에 따라 정해야 합니다.'},
 {kind:'bounded-action',
  text:'실생활에 적용한다면 바꾸지 않을 기준 하나, 시험할 변경점 하나, 필요한 자원과 결과를 확인할 시점을 각각 적어 보는 방식이 가능합니다. 이것은 출생 정보에서 실제 직업, 능력 또는 성과를 읽어 냈다는 뜻이 아니라 전통적인 상징을 이해하기 쉽게 만든 가상의 적용 예시입니다. 출생 달의 계절 경계와 다른 자리의 관계까지 검증해도 실제 행동이나 미래 결과를 예측할 수 없으며, 종합 해석의 우선순위도 아직 전문가 검토가 필요합니다.'}
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
