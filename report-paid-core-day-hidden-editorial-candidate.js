'use strict';
// PROTOTYPE ONLY: can an independently calculated birth-DAY hidden stem
// supply a genuinely different symbolic QUESTION from the actual FREE cards?
// A different category or natal position DOES NOT prove a personal insight,
// valid reading hierarchy, paid writing ability, or value to a buyer.
// Must not be plugged into checkout, writer schema, paid precharge or API.
const bindings=require('./report-fact-bindings');
const seasonal=require('./report-seasonal-evidence');
const hour=require('./report-paid-core-hour-extension');
const free=require('./report-reading-sample');
const {LunarUtil}=require('lunar-javascript');
const TRADITIONAL=Object.freeze({
 '比肩':'비견','劫财':'겁재','食神':'식신','伤官':'상관',
 '偏财':'편재','正财':'정재','七杀':'편관','正官':'정관',
 '偏印':'편인','正印':'정인'
});
const TOPICS=Object.freeze({
 skill:Object.freeze({
  식신:'익힌 것을 무엇으로 완성했는지 점검하는 질문',
  상관:'기존의 방법과 수정할 방법의 차이를 따지는 질문'
 }),
 money:Object.freeze({
  정재:'반복적으로 들어가는 비용을 관리하는 질문',
  편재:'자원을 마련할 수 있는 서로 다른 경로를 따지는 질문'
 }),
 pressure:Object.freeze({
  정관:'정해진 책임과 승인 절차를 확인하는 질문',
  편관:'예외적 요구가 늘어났을 때 책임 범위를 확인하는 질문'
 })
});
function inspect(packet){
 const none=reason=>Object.freeze({
  kind:'offline-day-hidden-novel-reader-question-v1',status:'not-qualified',
  reason,authorReviewOnly:true,paidWriterAuthorized:false,
  newPaymentAuthorized:false,additionalModelCalls:0
 });
 if(packet?.status!=='ready')return none('calculation-unavailable');
 // Unknown birth times can change the day pillar around the midnight
 // boundary. Do not market a day-branch source for a provisional day chart.
 if(packet.calculationInput?.unknownBirthTime===true||
    !packet.chart?.hour||!packet.calculationInput?.birthTime)
  return none('exact-birth-time-not-verified');
 const birthYear=Number(packet.calculationInput?.birthDate?.slice(0,4));
 if(!Number.isInteger(birthYear)||2027-birthYear<19)
  return none('adult-question-audience-not-established');
 const choice=hour.domainFor(packet.person?.readerDecision);
 if(!choice)return none('specific-single-domain-question-required');
 const [domain,rule]=choice;
 if(!TOPICS[domain]||rule.roles.some(x=>!TOPICS[domain][x]))
  throw Error('DAY_EDITORIAL_ROLE_SCOPE_MISMATCH');
 const rows=Object.fromEntries(bindings.build(packet).map(row=>[row.id,row]));
 const day=packet.facts?.tenGods?.day,month=packet.facts?.tenGods?.month;
 const year=packet.facts?.tenGods?.year,clock=packet.facts?.tenGods?.hour;
 const mainStem=packet.facts?.structuralEvidence?.monthCommand?.mainHiddenStem;
 const mainRow=month?.hiddenStems?.find(x=>x.stem===mainStem);
 if(!day?.stem||!day?.hiddenStems||!month?.stemTenGod||
    !mainRow?.tenGod||!year?.stemTenGod||!clock?.stemTenGod)
  throw Error('DAY_EDITORIAL_FREE_ROLE_OR_NATAL_SOURCE_MISSING');
 // These four categories are already disclosed in the actual current
 // free birth-month and year-hour cards. They are NOT paid novelty.
 const publicRoles=new Set([month.stemTenGod,mainRow.tenGod,
  year.stemTenGod,clock.stemTenGod]);
 const raw=day.hiddenStems||[];
 const branchHidden=seasonal.HIDDEN[packet.chart.day?.[1]];
 if(!Array.isArray(branchHidden)||raw.length!==branchHidden.length||
    new Set(raw.map(x=>x.stem)).size!==raw.length||
    !raw.every(x=>branchHidden.includes(x.stem)&&
     TRADITIONAL[LunarUtil.SHI_SHEN[day.stem+x.stem]]===x.tenGod))
  throw Error('DAY_EDITORIAL_CALCULATED_HIDDEN_ROLES_TAMPERED');
 const eligible=raw.filter(x=>rule.roles.includes(x.tenGod)&&
  !publicRoles.has(x.tenGod));
 if(eligible.length!==1)return none(eligible.length>1?
  'multiple-unranked-day-hidden-categories':'no-distinct-day-hidden-category');
 const selected=eligible[0],a='natal.day.stem',
  b='natal.day.hidden.'+selected.stem;
 const outside=rows[a],inside=rows[b];
 // The DAY visible stem is the reference/subject, marked 일간 in
 // canonical facts; it is NOT a second interpreted ten-god category.
 // Only the validated DAY hidden row supplies the new symbolic role.
 if(outside?.position!=='일간'||outside.stem!==day.stem||
    outside.tenGod!=='일간'||outside.traditionalMeaning!==null||
    inside?.position!=='일지'||inside?.stem!==selected.stem||
    inside.tenGod!==selected.tenGod||
    !inside.traditionalMeaning||
    outside.observedBehavior!==false||inside.observedBehavior!==false||
    !seasonal.HIDDEN[packet.chart.day?.[1]]?.includes(selected.stem))
  throw Error('DAY_EDITORIAL_EXACT_POSITION_OR_ROLE_MISMATCH');
 const freeReading=free.build(packet);
 if(freeReading.status!=='calculated-example'||
    freeReading.modelCalls!==0||
    freeReading.completedPremiumParagraphs!==0||
    !freeReading.cards.some(c=>c.id==='birth-month')||
    !freeReading.cards.some(c=>c.id==='year-hour'))
  throw Error('DAY_EDITORIAL_CURRENT_FREE_READING_UNAVAILABLE');
 const question=TOPICS[domain][selected.tenGod];
 return Object.freeze({
  kind:'offline-day-hidden-novel-reader-question-v1',
  status:'candidate-for-human-editorial-research',readerDomain:domain,
  candidateRole:selected.tenGod,
  sourceRefs:Object.freeze([a,b]),exactStem:selected.stem,
  publicRoleNames:Object.freeze([...publicRoles]),
  sameChartFreeCardIds:Object.freeze(freeReading.cards.map(x=>x.id)),
  traditionalQuestion:question,
  readerWritingBrief:'태어난 날 안쪽의 실제 계산 글자에서 확인된 ‘'+
   question+'’라는 별도 전통적 질문을, 고객이 적은 한 가지 '+rule.label+
   ' 고민에만 조건부로 적용할 수 있는지 전문가와 독자가 검토한다. '+
   '달·해·시간 겉글자의 이미 공개된 의미를 다시 설명하거나 고객이 적지 않은 대안을 만들지 않는다. '+
   '태어난 날 안쪽 분류 하나를 실제 성격·직업·재산·관계의 결과, 사령, 우선순위로 확정하지 않는다.',
  distinctSymbolFromFourFreelyShownRoles:true,
  // This is merely a non-duplicated SYMBOL: actual method priority,
  // distinct real-life reading and value versus free remain UNPROVEN.
  verifiedIndependentPersonalConclusion:false,
  methodPriorityEstablished:false,chartResultPredicted:false,
  comparedWithRealPaidProviderManuscript:false,
  professionallyApproved:false,customerValueApproved:false,
  authorReviewOnly:true,paidWriterAuthorized:false,
  newPaymentAuthorized:false,additionalModelCalls:0
 });
}
module.exports={inspect,TOPICS};
