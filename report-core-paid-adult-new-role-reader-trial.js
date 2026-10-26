'use strict';
// One deliberately authored, nonbillable adult example with NEW source
// content vs the normal paid core's MONTH-only facts. A useful hypothetical
// comparison is not a demonstrated traditional life judgment or paid value.
const facts=require('./report-facts-node');
const delta=require('./report-core-paid-general-month-value-delta');
const screen=require('./report-core-paid-general-month-classical-screen');
const ledger=require('./report-fact-bindings');
const policy=require('./report-reader-policy');
const INPUT={calendar:'solar',birthDate:'1994-07-15',birthTime:'14:20',
 gender:'male',mbti:'ISFP'};
const CHART={year:'甲戌',month:'辛未',day:'壬寅',hour:'丁未'};
const PARAGRAPHS=[
 {kind:'three-different-questions',
  text:'태어난 달에서 계산된 두 가지 전통 분류는 각각 배움과 보호, 규칙과 역할을 살피는 항목입니다. 이 둘만 읽는다면 무엇을 배우고 어떤 기준을 따라야 하는지에 질문이 집중됩니다. 그런데 태어난 시간에는 달 안쪽에 있던 별개의 글자가 드러나고, 그 글자는 재물 관리와 지속적인 수고를 살피는 항목으로 분류됩니다. 따라서 이 출생 기록에서는 규칙을 따지는 질문과 실제로 계속 감당할 자원을 따지는 질문을 분리해 비교할 수 있습니다. 다만 어떤 항목이 더 중요하거나 실제 성격에 더 잘 맞는지는 확인되지 않았습니다.',
  sourceRefs:['natal.month.stem','natal.month.hidden.己',
   'natal.month.hidden.丁','natal.hour.stem','facts.stemConnections']},
 {kind:'conditional-decision-example',
  text:'가령 팀에서 매달 반복할 업무를 새로 맡을지 검토한다고 가정하겠습니다. 규칙과 역할을 살피는 항목은 맡을 권한과 필요한 절차가 무엇인지 묻는 데 사용하고, 재물 관리와 지속적인 수고를 살피는 항목은 매달 들어갈 비용과 반복해서 투입할 시간을 묻는 데 사용할 수 있습니다. 승인 절차만 따지고 실제 유지 비용을 빼놓으면 시작한 뒤 감당할 일을 놓치기 쉽습니다. 반대로 비용만 계산하고 지켜야 할 절차를 생략하면 실행 자체에 차질이 생길 수 있습니다. 이는 전통 분류 사이의 질문을 비교하기 위한 가상 사례이지, 본인이 업무나 돈을 실제로 어떻게 관리하는지 관찰한 결과가 아닙니다.',
  sourceRefs:['natal.month.hidden.己','natal.month.hidden.丁',
   'natal.hour.stem']},
 {kind:'counterfactual-limit',
  text:'같은 생년월일에 출생시간만 오후 8시 20분으로 바꾸면, 앞서 재물 관리와 지속적인 수고를 나타냈던 글자가 시간의 겉에서 사라집니다. 그러므로 시간에서 확인된 근거를 저녁 시간대의 사주에도 그대로 복사하면 안 됩니다. 하지만 출생시간에 따른 계산 차이가 실제 직업 능력이나 수입의 차이를 뜻한다는 근거도 없습니다. 이 원고는 계산 근거를 구분해 설명하는 수준이며 개인별 미래를 판단한 유료 풀이로 승인할 수 없습니다.',
  sourceRefs:['natal.month.hidden.丁','natal.hour.stem',
   'facts.stemConnections']}
];
function build(packet){
 if(packet?.status!=='ready'||!Object.entries(INPUT).every(
   ([k,v])=>packet.calculationInput?.[k]===v)||
   !Object.entries(CHART).every(([k,v])=>packet.chart?.[k]===v)||
   packet.targetYear?.year!==2027)return null;
 const value=delta.inspect(packet),method=screen.inspect(packet);
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
  label:'기준을 지키는 일과 지속해서 감당할 일을 따로 보는 선택',
  paragraphs:PARAGRAPHS.map(p=>({...p,sourceRefs:p.sourceRefs.slice()})),
  text,sourceRefs:all,unrelatedHourBorrowingForbidden:true,
  comparison:{baselineRefs:value.baselineSourceIds.slice(),
   novelRole:'정재',newVisiblePosition:'natal.hour.stem',
   otherHourHasThisVisibleRole:false,
   newSourceContentVerified:true,newPersonalJudgmentVerified:false},
  readerValueVerdict:'more-specific-questions-not-proven-paid-insight',
  personalTraitObserved:false,individualOutcomeValidated:false,
  methodProfessionallyApproved:false,approvedForCustomer:false,
  eligibleForPaidWriter:false,providerCalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={build};