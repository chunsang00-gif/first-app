'use strict';
// ONE documented example in Zi Ping Zhen Quan, chapter "On Changing
// Month-Command Use": Yin month, Jia (main hidden stem) NOT exposed,
// Bing (secondary hidden stem) exposed. The text describes a change
// in the interpretation's point of departure, not a proven personality.
// The test does not adopt the school, select Yong Shen or rank people.
const seasonal=require('./report-seasonal-evidence');
const POS=['year','month','hour'];
const PRIMARY='甲',SECONDARY='丙';
function readerAudience(packet){
 const born=Number(String(packet.calculationInput?.birthDate||'').slice(0,4));
 const target=packet.targetYear?.year;
 const age=Number.isInteger(born)&&Number.isInteger(target)?target-born:null;
 if(age===null||age<0||age>125)
  throw Error('QA_CLASSICAL_EDITORIAL_AGE_OR_TARGET_INVALID');
 return {ageAtTargetYear:age,
  audience:age<13?'child-and-caregiver':'adult',child:age<13};
}
// The source condition is independent of audience; the everyday analogy is not.
// A toddler's matched classical symbol must NEVER surface as a career reading.
function inspect(packet){
 if(packet?.status!=='ready'||!packet.chart?.hour||!packet.facts?.seasonalEvidence)
  throw Error('QA_CLASSICAL_MONTH_EXAMPLE_INCOMPLETE');
 const s=seasonal.evaluate(packet.chart);
 if(JSON.stringify(s)!==JSON.stringify(packet.facts.seasonalEvidence))
  throw Error('QA_CLASSICAL_MONTH_EXAMPLE_SEASONAL_DRIFT');
 const branch=packet.chart.month[1];
 const stems=POS.map(pos=>({position:pos,
  sourceId:'natal.'+pos+'.stem',stem:packet.chart[pos][0]}));
 const primary=stems.filter(x=>x.stem===PRIMARY);
 const secondary=stems.filter(x=>x.stem===SECONDARY);
 const third=stems.filter(x=>x.stem==='戊');
 const scoped=branch==='寅'&&s.monthMainQiStem===PRIMARY&&
  s.monthHiddenStems.some(x=>x.stem===SECONDARY);
 const exactMatch=scoped&&primary.length===0&&secondary.length>0;
 const xinDay=scoped&&packet.chart.day[0]==='辛';
 // An additional exposed Yin-month stem is a competing textual condition.
 // Observe it, but do not promote either narrow rule to a sole priority.
 const uncluttered=xinDay&&third.length===0;
 const singleExposureCaseApplies=uncluttered&&primary.length===0&&secondary.length>0;
 const dualCaseApplies=uncluttered&&primary.length>0&&secondary.length>0;
 // The same classical chapter distinguishes a Bing-only change of the
 // month-command category from the Jia+Bing case that retains Jia first.
 // These are TEXTUAL applicability checks, not approval of a full pattern.
 const singleExposureTextualChange={
  example:'Xin-day Yin-month, Bing exposed, Jia not exposed',
  scopeMatched:singleExposureCaseApplies,
  firstRole:singleExposureCaseApplies?'정관':null,
  source:'Zi Ping Zhen Quan, chapter 10, Xin-in-Yin change example',
  textualChangeBasis:singleExposureCaseApplies?
   'In a Xin-day Yin month, Bing exposure without Jia exposure changes the textually described month-command interpretation from wealth to authority':null,
  distinctFromDualExposurePriority:true,
  finalTraditionalPatternEstablished:false,
  subjectToIndependentFullChartReview:true,
  observedBehavior:false
 };
 const dualExposureTextualPriority={
  example:'Xin-day Yin-month with Jia and Bing both exposed',
  scopeMatched:dualCaseApplies,
  firstRole:dualCaseApplies?'정재':null,
  additionalRole:dualCaseApplies?'정관':null,
  source:'Zi Ping Zhen Quan, chapter 10, final examples',
  textualPriorityBasis:dualCaseApplies?
   'Jia is the main hidden stem of the Yin month and is exposed alongside Bing; this classical case retains the month-main pattern and adds the Bing category':
   null,
  notDeterminedByElementGenerationArrow:true,
  subjectToIndependentFullChartReview:true,
  finalTraditionalPatternEstablished:false,
  observedBehavior:false
 };
 return {
  kind:'qa-classical-yin-month-textual-example-v1',
  classicalReference:{
   work:'子平真詮',chapter:'論用神變化',
   url:'https://caipu.donglishuzhai.net/chapter/3723.html',
   originalExample:'寅月，甲不透而丙透（僅核對文本所述條件）',
   traditionChosenForCommercialInterpretation:false
  },
  natalMonthBranch:branch,
  observed:{
   applicableMonth:scoped,
   exposedMainStemPositions:primary.map(x=>x.position),
   exposedSecondaryStemPositions:secondary.map(x=>x.position),
   exposedOtherHiddenStemPositions:third.map(x=>x.position),
   dayMasterExcludedFromExposureScan:true,
   exactTextualExampleConditionsMet:exactMatch
  },
  candidate:!scoped?'out-of-example-scope':
   exactMatch?'documented-textual-example-match':
   primary.length?'textual-condition-fails-main-is-exposed':
   'textual-condition-fails-secondary-not-exposed',
  interpretiveStatementAllowed:exactMatch?
   '이 출생 자료는 고전의 특정 예시처럼 달의 대표 글자는 다른 겉자리에 없고, 달의 다른 숨은 글자가 겉자리에 나타나는 계산 조건을 충족한다.':
   '이 출생 자료는 해당 고전 예시의 계산 조건을 그대로 충족하지 않는다.',
  alternativeExposuresNeedReview:third.length>0,
  singleExposureTextualChange,dualExposureTextualPriority,
  chapterExampleIsNotFullPatternRule:true,
  otherBranchesAndCombinedRelationsNotAssessed:true,
  actualPersonalityOrCareerNotEstablished:true,
  canAutomateFinalTraditionalPattern:false,
  providerCalls:0,releaseVerdict:'not-approved'
 };
}

// An exact source-table collision can change what the reader may NOT infer
// from one classical example. Same pair, two table LABELS, not two proven
// forces or events. No universal branch precedence is adopted here.
function exactMonthDayPairContext(packet){
 const source=require('./report-core-paid-natal-yinhai-source-scope').build(packet);
 if(!source)return null;
 if(source.pair!=='寅亥'||source.independentContactCount!==1||
    source.tableLabelCount!==2||source.adjacencyVerified!==true||
    source.liuheTextualConditionSatisfied!==true||
    source.relativeLiuhePoPriority!=='not-established'||
    source.poRuleSourcedByThisPassage!==false||
    source.fullNatalConclusionAllowed!==false||
    source.approvedForPaid!==false)
  throw Error('QA_CLASSICAL_ADJACENT_BRANCH_SOURCE_NOT_NARROW');
 return Object.freeze({
  kind:'same-month-day-pair-two-branch-table-labels-v1',
  monthPosition:'month',otherPosition:'day',
  sourceRefs:source.sourceRefs.slice(),
  labels:source.tableLabels.slice(),tableLabelCount:source.tableLabelCount,
  distinctPhysicalContactsForThisPair:source.independentContactCount,
  realizedCombination:false,realizedBreakage:false,
  relativePriority:'not-assessed',approvedForPaid:false,
  exactClassicalSourceScope:source,
  readerText:source.readerText+
   ' 이것은 같은 한 쌍의 관계표 이름 두 개이지 별개 사건이 두 번 생겼다는 뜻이 아닙니다. 따라서 앞에서 설명한 고전의 중심·보조 구분을 출생 전체에서 확정된 결과로 넓혀서는 안 됩니다.'
 });
}
// Single narrowly curated reader example for an INTERNAL offline editorial
// comparison. Not a generalized natal generator, paid report, or prediction.
// Only the explicit YEAR-Jia / MONTH-Bing / DAY-Xin / MONTH-Yin configuration
// may receive this copy; never fill other charts with the same text.
function offlineReaderCandidate(packet){
 const caseResult=inspect(packet);
 const rank=caseResult.dualExposureTextualPriority;
 if(rank.scopeMatched!==true||
    !caseResult.observed.exposedMainStemPositions.includes('year')||
    !caseResult.observed.exposedSecondaryStemPositions.includes('month')||
    caseResult.observed.exposedOtherHiddenStemPositions.length!==0)
  return null;
 const ledger=Object.fromEntries(require('./report-fact-bindings').build(packet)
  .map(row=>[row.id,row]));
 const expected={
  'natal.day.stem':['辛','일간'],
  'natal.year.stem':['甲','정재'],
  'natal.month.stem':['丙','정관'],
  'natal.month.hidden.甲':['甲','정재']
 };
 for(const [id,[stem,tenGod]] of Object.entries(expected)){
  const row=ledger[id];
  if(row?.stem!==stem||row?.tenGod!==tenGod)
   throw Error('QA_CLASSICAL_READER_FACT_DRIFT:'+id);
 }
 const target=readerAudience(packet);
 const label=target.child?'물건을 준비하는 일과 함께 지키는 약속':'책임보다 먼저 보는 자원의 의미';
 const text=target.child?
  '이 아이의 출생 자료에서 태어난 달에는 필요한 자원을 마련하고 다루는 뜻과 규칙·책임을 살피는 뜻이 함께 들어 있습니다. 둘을 나열하기만 해서는 어느 쪽을 먼저 읽는지 알 수 없습니다. 달에서 가장 기본이 되는 글자가 태어난 해에도 나타나고, 책임을 나타내는 다른 글자는 태어난 달의 겉에도 나타납니다. 이 두 조건이 함께 성립한 경우, 이 고전은 자원에 관한 뜻을 중심에 두고 책임에 관한 뜻을 곁들입니다. 달의 기본 글자는 드러나지 않고 책임을 뜻하는 글자만 드러나 해석의 출발점이 바뀌는 다른 사례와 구별됩니다. 따라서 먼저 살필 것은 이 글이 나타내는 준비와 자원의 의미이고, 그다음은 함께 등장한 역할과 기준의 의미입니다. 아이가 실제로 물건을 잘 관리하거나 약속을 잘 지킨다는 평가가 아닙니다. 성장 과정이나 앞으로의 생활을 예언하는 뜻도 아니며, 다른 출생 자리까지 종합한 최종 판단은 아직 이루어지지 않았습니다.':
  '이 사주를 고전의 한 방식으로 읽을 때는 맡을 역할보다 먼저 그 역할과 연결된 자원의 뜻을 살펴봅니다. 태어난 달에서 가장 기본이 되는 글자는 태어난 해에도 드러나 자원을 다루는 전통 분류로 확인됩니다. 같은 달에 드러난 다른 글자는 규칙과 책임을 살피는 분류입니다. 그래서 이 고전의 해당 사례는 자원에 관한 뜻을 중심에 두고 책임에 관한 뜻을 곁들입니다. 달의 기본 글자가 전혀 드러나지 않고 책임 쪽 글자만 드러난 경우라면 이 고전의 다른 예시에서는 해석의 출발점 자체가 바뀝니다. 이 출생 자료는 그 반대 조건에 해당하지 않으므로 두 설명을 섞어 어느 쪽이 더 강한 사람인지 말할 수 없습니다. 이 풀이가 추가로 보여 주는 것은 자원과 역할의 두 의미를 나열하는 것이 아니라 왜 첫 질문을 자원 쪽에서 시작하는지에 대한 조건입니다. 실제로 돈을 잘 모으거나 직장에서 인정받는다는 결론은 아닙니다. 전체 출생 관계의 최종 우선순위도 승인된 것은 아닙니다.';
 const monthDayPair=exactMonthDayPairContext(packet);
 // Editorial value decision: the same month-day pair has TWO table labels,
 // but neither changes this chapter's independently established classical
 // starting role. The long appendix only restates that full-chart judgment
 // is unapproved. Keep it in verifiable review metadata, NOT reader prose.
 if(monthDayPair&&(monthDayPair.relativePriority!=='not-assessed'||
    monthDayPair.exactClassicalSourceScope?.solePriorityClaimAllowed!==false||
    monthDayPair.exactClassicalSourceScope?.fullNatalConclusionAllowed!==false))
  throw Error('QA_CLASSICAL_BRANCH_NOT_AN_INDEPENDENT_READER_INSIGHT');
 const finalText=text;
 if(require('./report-reader-policy').errors([label,finalText]).length)
  throw Error('QA_CLASSICAL_READER_BRANCH_CONTEXT_JARGON');
 return {
  kind:'qa-classical-natal-reader-candidate-v1',
  calculatedChart:packet.chart,
  label,text:finalText,audience:target.audience,ageAtTargetYear:target.ageAtTargetYear,
  monthDayPairContext:monthDayPair,
  branchEvidenceScope:'review-only-does-not-change-classical-reader-conclusion',
  branchSourceAddsIndependentReaderInsight:false,
  appendedBranchReaderParagraph:false,
  contextualReviewSourceRefs:monthDayPair?monthDayPair.sourceRefs.slice():[],
  hypotheticalExampleNotObservedBehavior:true,
  sourceRefs:Object.keys(expected),
  textualRule:'xin-yin-jia-and-bing-both-exposed; primary wealth, supplementary authority',
  cause:'month-main-Jia-and-additional-Bing-visible-not-element-arrow',
  otherBranchEffects:'not-assessed',
  individualPersonalityOrCareerVerified:false,
  independentlyProfessionallyReviewed:false,
  readyForPaidModelProbe:false,
  releaseVerdict:'not-approved',
  providerCalls:0
 };
}
// Second constrained OFFLINE editorial comparison. This is a different
// classical textual condition, never a general-purpose paid interpretation.
// Absence of Jia must be checked across every non-day visible position.
// A third exposed hidden-month stem requires separate specialist review.
function offlineSingleReaderCandidate(packet){
 const example=inspect(packet),single=example.singleExposureTextualChange;
 if(single.scopeMatched!==true||
    example.observed.exposedMainStemPositions.length!==0||
    !example.observed.exposedSecondaryStemPositions.includes('month')||
    example.observed.exposedOtherHiddenStemPositions.length!==0)
  return null;
 const ledger=Object.fromEntries(require('./report-fact-bindings').build(packet)
  .map(row=>[row.id,row]));
 const expected={
  'natal.day.stem':['辛','일간'],
  'natal.month.stem':['丙','정관'],
  'natal.month.hidden.甲':['甲','정재'],
  'natal.month.hidden.丙':['丙','정관']
 };
 for(const [id,[stem,tenGod]] of Object.entries(expected)){
  const row=ledger[id];
  if(row?.stem!==stem||row?.tenGod!==tenGod)
   throw Error('QA_CLASSICAL_SINGLE_READER_FACT_DRIFT:'+id);
 }
 for(const position of ['year','hour']){
  const id='natal.'+position+'.stem',row=ledger[id];
  if(!row||row.stem!==packet.chart[position][0]||
     row.stem==='甲'||row.stem==='戊')
   throw Error('QA_CLASSICAL_SINGLE_READER_VISIBLE_SCOPE_DRIFT:'+id);
 }
 const target=readerAudience(packet);
 const label=target.child?'함께 지킬 약속부터 생각해 보는 경우':'먼저 살펴보는 책임의 의미';
 const text=target.child?
  '이 아이의 출생 자료에서는 태어난 달의 기본 글자가 다른 겉자리에서 보이지 않고, 책임과 약속을 뜻하는 다른 글자가 겉에 나타납니다. 두 글자의 뜻을 똑같이 앞세우기보다, 이 고전은 이런 조건에서 해석의 출발점을 바꿉니다. 자원을 마련하는 뜻부터 살피는 다른 사례와 달리 규칙과 역할을 뜻하는 쪽이 먼저 검토할 질문이 됩니다. 다만 아이가 실제로 약속을 더 잘 지키거나 어른의 지시를 잘 따른다는 뜻은 아닙니다. 달의 기본 글자도 함께 겉에 나타났다면 적용할 고전 사례가 달라지므로 이 문장을 그대로 쓸 수 없습니다. 다른 출생 자리의 관계를 종합해 성격이나 미래를 판단한 것은 아닙니다.':
  '이 사주는 태어난 달에서 자원을 다루는 뜻보다 역할과 지켜야 할 기준의 뜻을 먼저 살피는 고전 사례에 해당합니다. 그 이유는 태어난 달의 가장 기본 글자가 출생 해·달·시간의 겉자리에서 확인되지 않고, 규칙과 책임에 해당하는 다른 글자만 드러났기 때문입니다. 같은 달에 기본 글자도 함께 드러났다면 이 고전의 다른 예시에서는 자원을 중심에 두고 책임을 곁들이지만, 이 출생 자료는 그 조건이 성립하지 않아 해석의 출발점을 바꿉니다. 따라서 이 출생 자료에 두 가지 풀이를 한꺼번에 붙이거나 단순히 책임의 힘이 더 세다고 말하면 원문 조건을 놓치게 됩니다. 여기서 새로 확인되는 것은 돈이나 지위의 결과가 아니라, 태어난 달에 함께 들어 있는 두 전통적 뜻 중 무엇부터 읽어야 하는지를 가르는 실제 출생 위치의 차이입니다. 실제로 책임감이 강하거나 높은 직책을 맡는다는 뜻은 아닙니다. 다른 출생 자리의 관계와 최종 해석 방법까지 검증한 것은 아닙니다.';
 return {
  kind:'qa-classical-natal-single-reader-candidate-v1',
  calculatedChart:packet.chart,label,text,
  audience:target.audience,ageAtTargetYear:target.ageAtTargetYear,
  hypotheticalExampleNotObservedBehavior:true,
  sourceRefs:['natal.day.stem','natal.year.stem','natal.month.stem',
   'natal.hour.stem','natal.month.hidden.甲','natal.month.hidden.丙'],
  textualRule:'xin-yin-bing-exposed-jia-absent; changed-classical-point-of-departure',
  cause:'month-main-Jia-not-exposed-while-Bing-exposed',
  otherBranchEffects:'not-assessed',
  individualPersonalityOrCareerVerified:false,
  independentlyProfessionallyReviewed:false,
  readyForPaidModelProbe:false,
  releaseVerdict:'not-approved',providerCalls:0
 };
}
module.exports={inspect,offlineReaderCandidate,offlineSingleReaderCandidate};
