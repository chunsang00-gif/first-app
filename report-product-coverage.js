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
const WHY=Object.freeze({
 'missing-plan':'계산에 필요한 분석 계획이 확인되지 않았습니다.',
 'no-grounded-topic':'독립적으로 해석할 계산 근거가 확인되지 않았습니다.',
 'no-direct-annual-domain-evidence':'2027년 계산과 이 분야를 따로 연결할 근거가 확인되지 않았습니다.'
});
function calculate(input){
 const packet=facts.build(input,2027);
 if(packet.status!=='ready')return {status:'blocked',code:'CHART_UNAVAILABLE'};
 const verified=integrity.verify(packet);
 if(!verified.pass)return {status:'blocked',code:'CALCULATION_NOT_VERIFIED'};
 const blueprint=guidance.preflight(packet);
 const choice=selection.select(groups,blueprint);
 const expected=quality.IDS;
 if(JSON.stringify(groups.flat())!==JSON.stringify([
    'saju_core','mbti_contradiction','decision','stress',
    'money','career','relationship','integrated_judgment',
    'year_2027','year_2027_money','year_2027_career','year_2027_relationship'
  ])||JSON.stringify(Object.keys(outline.topics))!==JSON.stringify(expected)||
  expected.some(id=>!NAMES[id]||!blueprint[id]))
  throw Error('PRODUCT_COVERAGE_CONTRACT_DRIFT');
 const planned=new Set(choice.plannedIds);
 const chapters=expected.map(id=>{
  const entries=Object.keys(outline.topics[id]);
  const selected=planned.has(id);
  const active=selected?entries.filter(key=>
   blueprint[id].topicTasks[key]?.mode!=='state-limits'):[];
  const omitted=choice.omitted.find(x=>x.id===id);
  if(selected&&(!active.length||
    !active.includes(blueprint[id].anchorTopic)))throw Error('PRODUCT_COVERAGE_INVALID_ANCHOR:'+id);
  return {id,name:NAMES[id],includedInPlan:selected,
   definedTopicSlots:entries.length,
   eligibleTopicUpperBound:active.length,
   omittedReason:selected?null:WHY[omitted?.reason]||'독립적인 근거가 부족합니다.'};
 });
 const currentDefined=chapters.reduce((n,x)=>n+x.definedTopicSlots,0);
 const selectedDefined=chapters.filter(x=>x.includedInPlan)
  .reduce((n,x)=>n+x.definedTopicSlots,0);
 const eligible=chapters.reduce((n,x)=>n+x.eligibleTopicUpperBound,0);
 if(eligible>selectedDefined||selectedDefined>currentDefined||
    choice.plannedIds.length!==chapters.filter(x=>x.includedInPlan).length)
  throw Error('PRODUCT_COVERAGE_COUNT_MISMATCH');
 return {
  status:'ready',kind:'prepurchase-report-scope-v1',
  catalog:{chapterDefinitions:expected.length,topicDefinitions:currentDefined,
   originallyPlannedTopics:35},
  estimate:{plannedChapters:choice.plannedIds.length,
   selectedDefinedTopicUpperBound:selectedDefined,
   evidenceEligibleTopicUpperBound:eligible,
   chapters,
   canAttemptGeneration:choice.canGenerate,
   eligibilityIssues:choice.issues.slice()},
  notice:'제공 가능 범위의 사전 계산 결과입니다. 실제 생성된 보고서나 확정 제공 문단 수가 아닙니다.',
  limitations:[
   '항목마다 독립적인 풀이가 가능한지는 실제 작성·검증 후에만 확정됩니다.',
   '근거가 약하거나 다른 항목과 중복되면 해당 문단이 생략될 수 있습니다.',
   '현재 12장·35항목 고정 제공은 검증되지 않았습니다.'
  ],
  purchaseEnabled:false,
  paymentVerificationAvailable:false,
  premiumReportCompleted:false,
  customerSaleApproved:false,
  modelCalls:0
 };
}
module.exports={calculate,NAMES};
