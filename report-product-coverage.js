'use strict';
// Customer-readable PRE-PURCHASE report SCOPE, not an AI interpretation.
// All inputs are recalculated; a browser-supplied chart never determines
// eligibility. It makes no payment, provider, job or cached-report call.
const facts=require('./report-facts-node');
const integrity=require('./report-calculation-integrity');
const guidance=require('./report-analysis-guidance');
const selection=require('./report-chapter-selection');
const outline=require('./report-outline');
const quality=require('./report-quality-node');
const groups=Object.freeze([
 ['saju_core','mbti_contradiction'],['decision','stress'],
 ['money','career'],['relationship','integrated_judgment'],
 ['year_2027','year_2027_money'],['year_2027_career','year_2027_relationship']
].map(x=>Object.freeze(x)));
const NAMES=Object.freeze({
 saju_core:'사주 기본 풀이',mbti_contradiction:'사주와 MBTI 비교',
 decision:'선택과 결정',money:'금전',career:'직업과 일',
 relationship:'인간관계',stress:'압박과 대처',
 integrated_judgment:'종합 풀이',year_2027:'2027년 기본 해석',
 year_2027_money:'2027년 금전',year_2027_career:'2027년 직업',
 year_2027_relationship:'2027년 관계'
});
// These are PREVIEW QUESTION LABELS, never a generated answer or a promise
// that a completed premium paragraph will survive final quality review.
const TOPIC_NAMES=Object.freeze({
 saju_core:Object.freeze({
  temperament:'태어난 시기의 전통적 해석',
  strength:'기본 기질을 설명하는 별도의 근거'
 }),
 mbti_contradiction:Object.freeze({
  agreement:'사주와 MBTI가 각각 설명하는 공통 질문',
  difference:'두 풀이가 다르게 설명할 수 있는 조건',
  information:'입력한 MBTI에서 정보를 받아들이는 선호',
  judgment:'입력한 MBTI에서 선택할 때의 판단 선호'
 }),
 decision:Object.freeze({
  approach:'선택할 때 정보를 비교하는 관점',
  followthrough:'결정을 유지하거나 바꾸는 조건'
 }),
 money:Object.freeze({
  earning:'수입 활동과 보상에 대한 전통적 질문',
  spending:'자원의 사용과 보유에 관한 질문',
  risk:'출생월의 숨은 재성과 실제 충을 구별하는 고전적 질문'
 }),
 career:Object.freeze({
  workstyle:'활동과 일을 수행하는 방식에 대한 질문',
  teamwork:'함께 맡는 일과 역할의 관점',
  growth:'배움과 새로운 과제를 보는 관점',
  change:'현재 대운과 태어난 사주의 직업 관련 관점 비교'
 }),
 relationship:Object.freeze({
  closeness:'가까운 관계를 이해하는 관점',
  expression:'마음을 표현하고 이해하는 관점',
  conflict:'태어난 날과 다른 자리의 마주 보는 관계',
  coordination:'출생일과 다른 자리 사이의 독립적 결합 조건'
 }),
 stress:Object.freeze({
  trigger:'압박과 요구를 해석할 수 있는 조건',
  response:'대응과 회복에 관해 살펴볼 조건'
 }),
 integrated_judgment:Object.freeze({
  insight:'사주와 MBTI를 함께 볼 때 추가되는 설명',
  tradeoff:'서로 다른 조건을 함께 고려할 부분'
 }),
 year_2027:Object.freeze({
  change:'2027년 계산에서 달라지는 부분',
  impact:'2027년 풀이의 적용 조건과 한계',
  new_triad:'2027년에 새로 모이는 세 지지의 조건',
  root_contrast:'2027년 충을 받는 자리와 별도 뿌리 위치의 차이'
 }),
 year_2027_money:Object.freeze({
  change:'2027년 금전 분야에 연결되는 별도 근거',
  action:'2027년 금전 행동을 예측할 때의 한계'
 }),
 year_2027_career:Object.freeze({
  change:'2027년 일과 배움에 연결되는 별도 근거',
  action:'2027년 직업 변화를 예측할 때의 한계'
 }),
 year_2027_relationship:Object.freeze({
  change:'2027년 관계 분야에 연결되는 별도 근거',
  action:'2027년 관계 사건을 예측할 때의 한계'
 })
});
const WHY=Object.freeze({
 'missing-plan':'계산에 필요한 분석 계획이 확인되지 않았습니다.',
 'no-grounded-topic':'독립적으로 해석할 계산 근거가 확인되지 않았습니다.',
 'no-direct-annual-domain-evidence':'2027년 계산과 이 분야를 따로 연결할 근거가 확인되지 않았습니다.'
});
// These two brief reader paragraphs come from the SAME source-owned
// interpretive builder used by the REAL paid writer. They are free,
// unapproved illustrative interpretations, not a paid provider response.
// Never return the original natal ledger, raw IDs, personal name or birth date.
function independentDomainReadings(packet,blueprint,planned){
 if(packet.calculationInput?.unknownBirthTime===true)return [];
 const birthYear=Number(packet.calculationInput?.birthDate?.slice(0,4));
 const targetYear=Number(packet.targetYear?.year||2027);
 // A younger reader's study and allowance questions require a different
 // audience. Do not reuse adult income/employment illustrations for minors.
 if(!Number.isInteger(birthYear)||targetYear-birthYear<=19)return [];
 const owned=[
  {id:'money.earning',chapter:'money',topic:'earning',title:'돈을 얻는 활동의 두 조건',
   field:'earnedValueConditionalReading'},
  {id:'career.workstyle',chapter:'career',topic:'workstyle',title:'일을 배우고 완성하는 두 조건',
   field:'careerWorkstyleCondition'}
 ].filter(x=>planned.has(x.chapter)&&
  blueprint[x.chapter]?.topicTasks?.[x.topic]?.mode!=='state-limits');
 if(!owned.length)return [];
 const sections=[...new Set(owned.map(x=>x.chapter))];
 const guidance=require('./report-analysis-guidance');
 const prompt={
  facts:packet,stage:'body',requestedSections:sections,
  includeFinal:false,includeCover:false,priorSections:[],
  analysisGuidance:{...guidance.forRequest(sections,packet.person.mbti),
   editorialBlueprint:blueprint},
  rules:{sectionGoals:require('./report-prompt').sectionGoals}
 };
 // This only compiles local calculated evidence; it cannot call the model.
 const payload=require('./report-generation-request').compile(prompt);
 return owned.flatMap(x=>{
  const task=payload.task.chapters?.[x.chapter]?.topics?.[x.topic];
  const reading=task?.sourceOwnedInterpretiveThesis?.[x.field];
  if(!reading)return [];
  if(!Array.isArray(reading.sourceRefs)||reading.sourceRefs.length!==2||
     !reading.sourceRefs.every(ref=>payload.source[ref]?.stem)||
     reading.observedIncome===true||reading.observedWorkPerformance===true||
     typeof reading.readerParagraph!=='string'||
     reading.readerParagraph.length<130||
     /(?:natal\.|annual\.|facts\.|person\.)/.test(reading.readerParagraph))
   throw Error('PREPURCHASE_INTERPRETIVE_READING_SOURCE_DRIFT:'+x.id);
  return [Object.freeze({id:x.id,title:x.title,text:reading.readerParagraph})];
 });
}
function calculate(input){
 const packet=facts.build(input,2027);
 if(packet.status!=='ready')return {status:'blocked',code:'CHART_UNAVAILABLE'};
 const verified=integrity.verify(packet);
 if(!verified.pass)return {status:'blocked',code:'CALCULATION_NOT_VERIFIED'};
 const readingSample=require('./report-reading-sample').build(packet);
 const blueprint=guidance.preflight(packet);
 const choice=selection.select(groups,blueprint);
 const expected=quality.IDS;
 if(JSON.stringify(groups.flat())!==JSON.stringify([
    'saju_core','mbti_contradiction','decision','stress',
    'money','career','relationship','integrated_judgment',
    'year_2027','year_2027_money','year_2027_career','year_2027_relationship'
  ])||JSON.stringify(Object.keys(outline.topics))!==JSON.stringify(expected)||
  expected.some(id=>!NAMES[id]||!blueprint[id]||
    JSON.stringify(Object.keys(TOPIC_NAMES[id]||{}))!==
    JSON.stringify(Object.keys(outline.topics[id]))))
  throw Error('PRODUCT_COVERAGE_CONTRACT_DRIFT');
 const planned=new Set(choice.plannedIds);
 const productProposal=require('./report-adaptive-product-proposal').build(blueprint,choice);
 const interpretivePreviews=independentDomainReadings(packet,blueprint,planned);
 const chapters=expected.map(id=>{
  const entries=Object.keys(outline.topics[id]);
  const selected=planned.has(id);
  const modes=Object.fromEntries(entries.map(key=>[
   key,blueprint[id]?.topicTasks?.[key]?.mode
  ]));
  if(Object.values(modes).some(mode=>
    !['use-primary','use-verified-fallback','state-limits'].includes(mode)))
   throw Error('PRODUCT_COVERAGE_MISSING_TOPIC_DECISION:'+id);
  const active=selected?entries.filter(key=>modes[key]!=='state-limits'):[];
  const excludedTopics=selected?entries.filter(key=>modes[key]==='state-limits')
   .map(key=>({id:key,title:TOPIC_NAMES[id][key],
    reason:id==='mbti_contradiction'&&['information','judgment'].includes(key)?
     '해당 MBTI 선호가 확인되지 않아 이 질문을 제외했습니다.':
     '이 질문에만 사용할 별도의 계산 근거가 확인되지 않았습니다.'
   })):[];
  const omitted=choice.omitted.find(x=>x.id===id);
  if(selected&&(!active.length||
    !active.includes(blueprint[id].anchorTopic)))throw Error('PRODUCT_COVERAGE_INVALID_ANCHOR:'+id);
  // The displayed questions are derived from the same canonical evidence
  // plan that selects actual provider output slots. A topic name cannot
  // create eligibility, and a disabled or omitted topic is never advertised.
  const eligibleTopics=active.map(topicId=>({
   id:topicId,title:TOPIC_NAMES[id][topicId]
  }));
  return {id,name:NAMES[id],includedInPlan:selected,
   definedTopicSlots:entries.length,
   eligibleTopicUpperBound:active.length,
   eligibleTopics,excludedTopics,
   omittedReason:selected?null:
    (omitted?.reason==='no-direct-annual-domain-evidence'?
     require('./report-annual-domain-omission').explain(packet,id):null)||
    WHY[omitted?.reason]||'독립적인 근거가 부족합니다.'};
 });
 const currentDefined=chapters.reduce((n,x)=>n+x.definedTopicSlots,0);
 const selectedDefined=chapters.filter(x=>x.includedInPlan)
  .reduce((n,x)=>n+x.definedTopicSlots,0);
 const eligible=chapters.reduce((n,x)=>n+x.eligibleTopicUpperBound,0);
 const excludedWithinPlanned=chapters.reduce((n,x)=>n+x.excludedTopics.length,0);
 const omittedWithChapter=chapters.filter(x=>!x.includedInPlan)
  .reduce((n,x)=>n+x.definedTopicSlots,0);
 const historicalDefinitionShortfall=Math.max(0,35-currentDefined);
 if(currentDefined!==eligible+excludedWithinPlanned+omittedWithChapter||
    Math.max(0,35-eligible)!==
      historicalDefinitionShortfall+excludedWithinPlanned+omittedWithChapter)
  throw Error('PRODUCT_COVERAGE_TOPIC_GAP_ARITHMETIC_DRIFT');
 if(productProposal.topicCandidateUpperBound!==eligible||
    productProposal.plannedChapterCount!==choice.plannedIds.length)
  throw Error('PRODUCT_PROPOSAL_AND_PAID_PLAN_MISMATCH');
 if(eligible>selectedDefined||selectedDefined>currentDefined||
    choice.plannedIds.length!==chapters.filter(x=>x.includedInPlan).length||
    chapters.some(c=>c.eligibleTopics.length!==c.eligibleTopicUpperBound||
    (c.includedInPlan?
     c.eligibleTopics.length+c.excludedTopics.length!==c.definedTopicSlots:
     c.excludedTopics.length!==0)))
  throw Error('PRODUCT_COVERAGE_COUNT_MISMATCH');
 return {
  status:'ready',kind:'prepurchase-report-scope-v1',
  readingSample,interpretivePreviews,productProposal,
  catalog:{chapterDefinitions:expected.length,topicDefinitions:currentDefined,
   originallyPlannedTopics:35,historicalDefinitionShortfall},
  estimate:{plannedChapters:choice.plannedIds.length,
   chaptersNotSelected:expected.length-choice.plannedIds.length,
   targetChapterCount:12,targetTopicCount:35,
   topicUpperBoundGapToTarget:Math.max(0,35-eligible),
   excludedDefinedTopicsWithinPlannedChapters:excludedWithinPlanned,
   topicsUnavailableBecauseChaptersOmitted:omittedWithChapter,
   totalDefinedTopicsNotEligible:excludedWithinPlanned+omittedWithChapter,
   advertised12x35NotDeliverable:choice.plannedIds.length!==12||eligible<35,
   selectedDefinedTopicUpperBound:selectedDefined,
   evidenceEligibleTopicUpperBound:eligible,
   chapters,
   canAttemptGeneration:choice.canGenerate,
   eligibilityIssues:choice.issues.slice()},
  notice:'이 출생정보에서는 기본 해석 '+productProposal.mainChapterCount+
   '개 장과 조건부 2027년 분야별 해석 '+productProposal.conditionalChapterCount+
   '개 장이 선택됐습니다. 세부 항목은 최대 '+eligible+
   '개가 작성 후보이며 실제 완성·품질 승인된 문단 수는 아닙니다.',
  limitations:[
   '항목마다 독립적인 풀이가 가능한지는 실제 작성·검증 후에만 확정됩니다.',
   '근거가 약하거나 다른 항목과 중복되면 해당 문단이 생략될 수 있습니다.',
   '기존 12장·35항목 고정 제공 목표는 현재 상품 약속에 사용할 수 없습니다. 실제 구성과 가격은 미확정입니다.'
  ],
  purchaseEnabled:false,
  paymentVerificationAvailable:false,
  premiumReportCompleted:false,
  customerSaleApproved:false,
  modelCalls:0
 };
}
module.exports={calculate,NAMES};
