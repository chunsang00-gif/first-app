'use strict';
// One deliberately authored, nonbillable adult example with NEW source
// content vs the normal paid core's MONTH-only facts. A useful hypothetical
// comparison is not a demonstrated traditional life judgment or paid value.
const facts=require('./report-facts-node');
const delta=require('./report-core-paid-general-month-value-delta');
const screen=require('./report-core-paid-general-month-classical-screen');
const interactions=require('./report-core-paid-adult-classical-relation-review');
const ledger=require('./report-fact-bindings');
const policy=require('./report-reader-policy');
const INPUT={calendar:'solar',birthDate:'1994-07-15',birthTime:'14:20',
 gender:'male',mbti:'ISFP'};
const CHART={year:'甲戌',month:'辛未',day:'壬寅',hour:'丁未'};
const PARAGRAPHS=[
 {kind:'distinct-evidence-not-automatic-personality',
  text:'태어난 달의 바깥 글자는 새로운 내용을 익히고 도움을 받는 문제를, 달 안쪽 대표 글자는 정해진 규칙과 맡은 역할을 살피는 문제를 가리키는 전통 분류입니다. 그런데 태어난 시간의 겉글자는 달 안쪽에 있는 또 다른 글자와 정확히 같고, 그 분류는 돈과 자원을 지속적으로 관리하는 일을 다룹니다. 이 기록을 읽을 때는 무엇을 지켜야 하는지만이 아니라, 그 일을 계속 맡는 데 무엇이 들어가는지도 별도로 살필 수 있습니다. 다만 두 분류가 늘 서로 도와준다는 뜻은 아닙니다. 두 글자만 비교하면 서로 제약하는 방향이지만, 그 사이에 태어난 날의 글자가 있어 이를 곧바로 현실의 충돌로 해석할 수는 없습니다. 달 안쪽의 규칙·역할 글자를 사이에 두면 이어지는 방향도 계산되지만, 그 가운데 글자는 겉에 드러나지 않아 완화 효과나 우선순위를 확정할 수 없습니다.',
  sourceRefs:['natal.month.stem','natal.month.hidden.己',
   'natal.month.hidden.丁','natal.hour.stem','facts.stemConnections']},
 {kind:'one-specific-two-way-conditional-example',
  text:'예를 들어 여섯 달 동안 재고 관리 업무를 맡는 상황을 가정하겠습니다. 월말 수량을 누가 승인하고 오류를 누가 고치는지는 규칙과 역할의 질문입니다. 매주 재고를 확인하는 데 드는 시간과 추가 인력은 계속 투입할 자원의 질문입니다. 승인권자가 분명해도 매주 확인할 시간이 없다면 운영이 버거워질 수 있습니다. 반대로 작업 시간을 충분히 잡았더라도 오류를 바로잡을 권한이 정해지지 않으면 문제가 생길 수 있습니다. 이는 서로 다른 전통 분류를 같은 상황에 대입한 예시이지, 본인의 업무 방식이나 실제 소비 습관을 관찰한 결과는 아닙니다.',
  sourceRefs:['natal.month.hidden.己','natal.month.hidden.丁',
   'natal.hour.stem']},
 {kind:'counterexample-and-interpretation-limit',
  text:'한 번 점검하고 끝나는 짧은 일이라면 매주 자원을 쓰는 예시는 맞지 않습니다. 게다가 태어난 해의 글자는 시간의 자원 관리 글자를 돕는 방향이고, 태어난 날과 시간의 겉글자는 서로 제약하는 기운 관계와 별도로 짝을 이루는 전통 규칙에도 해당합니다. 두 글자가 나란히 있는 사실은 확인되지만 실제로 합쳐져 다른 기운으로 바뀌었다는 판단은 아닙니다. 서로 다른 계산 관계가 공존하기 때문에 하나만 골라 실제 행동이나 금전 결과의 근거로 삼을 수 없습니다. 따라서 이 기록으로 장기적인 운영 업무가 적성에 맞는다거나 돈을 잘 관리하는 성격이라고 단정할 수는 없습니다.',
  sourceRefs:['natal.month.hidden.己','natal.month.hidden.丁',
   'natal.hour.stem','natal.year.stem','natal.day.stem']}
];
function build(packet){
 if(packet?.status!=='ready'||!Object.entries(INPUT).every(
   ([k,v])=>packet.calculationInput?.[k]===v)||
   !Object.entries(CHART).every(([k,v])=>packet.chart?.[k]===v)||
   packet.targetYear?.year!==2027)return null;
 const value=delta.inspect(packet),method=screen.inspect(packet);
 const directions=interactions.inspect(packet);
 if(!directions||
    directions.unresolved.traditionalMethodPriority!=='not-established'||
    directions.unresolved.overallPatternSelected!==false||
    directions.verified.directRelations.length!==3||
    directions.verified.directRelations[0].from!=='natal.hour.stem'||
    directions.verified.directRelations[0].to!=='natal.month.stem'||
    directions.verified.directRelations[0].direction!=='left-controls-right'||
    directions.verified.hiddenMainAsPossibleIntermediary.length!==2||
    directions.verified.dayHourCombinationCandidate.combination!=='丁壬'||
    directions.verified.dayHourCombinationCandidate.adjacent!==true||
    directions.verified.dayHourCombinationCandidate.transformedToElement!=='not-assessed'||
    directions.verified.hourMonthElementDirectionIsNonAdjacent!==true||
    directions.unresolved.dayHourCombinationDoesNotRemoveEitherStem!==true||
    directions.unresolved.hiddenMonthIntermediaryNotProvenActive!==true||
    directions.authorizesPaidWriter!==false)
  throw Error('QA_ADULT_NEW_ROLE_FULL_CHART_INTERACTIONS_UNVERIFIED');
 if(value.valueClass!=='new-symbol-category-and-independent-position'||
    JSON.stringify(value.baselineTraditionalRoles)!==
      JSON.stringify(['정인','정관'])||
    JSON.stringify(value.novelTraditionalRoleNamesBeyondMonthCore)!==
      JSON.stringify(['정재'])||
    JSON.stringify(value.newlyMentionedOtherPillarRefs)!==
      JSON.stringify(['natal.hour.stem'])||
    JSON.stringify(value.baselineSourceIds)!==
      JSON.stringify(['natal.month.stem','natal.month.hidden.己'])||
    method.provisionalMethodCandidate!=='natal.month.hidden.丁'||
    method.candidates.length!==1||
    method.candidates[0].traditionalRole!=='정재'||
    JSON.stringify(method.candidates[0].exposedAt)!==
      JSON.stringify(['natal.hour.stem'])||
    value.paidValueApproved!==false||
    method.anyFinalPatternChosen!==false)
  throw Error('QA_ADULT_NEW_ROLE_SOURCE_PREMISE_INVALID');
 const alternate=facts.build({...packet.calculationInput,
  birthTime:'20:20'},2027);
 const next=screen.inspect(alternate);
 if(alternate.status!=='ready'||alternate.chart.month!==packet.chart.month||
    alternate.chart.day!==packet.chart.day||
    alternate.chart.hour===packet.chart.hour||
    next.candidates.some(c=>c.traditionalRole==='정재'))
  throw Error('QA_ADULT_NEW_ROLE_TIME_COUNTERFACTUAL_INVALID');
 const rows=Object.fromEntries(ledger.build(packet).map(row=>[row.id,row]));
 const all=[...new Set(PARAGRAPHS.flatMap(p=>p.sourceRefs))];
 if(PARAGRAPHS.some(p=>p.sourceRefs.some(id=>
     !all.includes(id)||id.startsWith('natal.')&&!rows[id]))||
    rows['natal.month.stem']?.tenGod!=='정인'||
    rows['natal.month.hidden.己']?.tenGod!=='정관'||
    rows['natal.month.hidden.丁']?.tenGod!=='정재'||
    rows['natal.hour.stem']?.tenGod!=='정재'||
    rows['natal.hour.stem']?.stem!==rows['natal.month.hidden.丁']?.stem)
  throw Error('QA_ADULT_NEW_ROLE_PROVENANCE_INVALID');
 // The alternate-hour calculation is checked above, but is deliberately
 // retained in reviewer metadata; it is not a customer-facing explanation.
 const text=PARAGRAPHS.map(p=>p.text).join('\n\n');
 if(text.length<600||text.length>1200||
    policy.errors(PARAGRAPHS.flatMap(p=>[p.kind,p.text])).length||
    /[\u3400-\u4dbf\u4e00-\u9fff]/.test(text)||
    /(?:일간|지장간|원국|명식|십성)/.test(text)||
    /[?？]\s*$/.test(text))
  throw Error('QA_ADULT_NEW_ROLE_COPY_INVALID');
 return {
  kind:'qa-authored-one-adult-source-contrast-v1',
  chartFingerprint:Object.values(CHART).join('/'),
  label:'규칙을 정하는 일과 오래 운영하는 일을 함께 보는 조건',
  paragraphs:PARAGRAPHS.map(p=>({...p,sourceRefs:p.sourceRefs.slice()})),
  text,sourceRefs:all,unrelatedHourBorrowingForbidden:true,
  competingElementalDirectionsReviewed:structuredClone(directions),
  bothDirectAndMediatedInterpretationsStillUnresolved:true,
  counterfactualReviewedInternally:true,
  counterfactualPrintedInReader:false,
  hasConcreteTwoWayTradeoff:true,
  counterexampleIncluded:true,
  comparison:{baselineRefs:value.baselineSourceIds.slice(),
   novelRole:'정재',newVisiblePosition:'natal.hour.stem',
   otherHourHasThisVisibleRole:false,
   newSourceContentVerified:true,newPersonalJudgmentVerified:false},
  readerValueVerdict:'source-specific-conditional-scene-not-a-proven-personal-conclusion',
  personalTraitObserved:false,individualOutcomeValidated:false,
  methodProfessionallyApproved:false,approvedForCustomer:false,
  eligibleForPaidWriter:false,providerCalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={build};