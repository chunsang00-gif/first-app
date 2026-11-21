'use strict';
// Offline adaptive product prototype: buyer-owned facts -> reproducible
// decision constraints. This is NOT natal/MBTI evidence, a prediction,
// financial advice, premium-sales approval, or a remote model request.
// Existing customer checkout, provider writer and UI are NOT connected here.
const context=require('./report-buyer-decision-context');
const scope=require('./report-buyer-work-skill-scope');
const FIELDS=Object.freeze({
 weeklyStudyHours:{label:'일주일에 실제로 확보할 수 있는 학습시간',unit:'시간',min:0,max:168,step:0.5},
 requiredStudyHours:{label:'목표 기술을 익히는 데 필요하다고 입력한 시간',unit:'시간',min:0.5,max:10000,step:0.5},
 targetWeeks:{label:'목표 기간',unit:'주',min:1,max:260,step:1},
 trainingCostKRW:{label:'배움에 필요한 총비용',unit:'원',min:0,max:100000000,step:1},
 availableBudgetKRW:{label:'배움에 쓸 수 있는 예산',unit:'원',min:0,max:100000000,step:1}
});
const KEYS=Object.freeze(Object.keys(FIELDS));
const MISSING_LABELS=Object.freeze(Object.fromEntries(
 KEYS.map(k=>[k,FIELDS[k].label])
));
function cleanQuestion(question){
 if(typeof question!=='string'||!question.trim()||question.length>140||
    /[<>\r\n\u0000-\u001f\u007f]|(?:https?:\/\/|www\.|@)/i.test(question))
  throw Error('WORKBOOK_BUYER_QUESTION_INVALID');
 return question.trim();
}
function parseValues(entered){
 if(entered===undefined||entered===null)entered={};
 if(!entered||typeof entered!=='object'||Array.isArray(entered)||
    Object.keys(entered).some(k=>!KEYS.includes(k)))
  throw Error('WORKBOOK_UNKNOWN_OR_NONOBJECT_CONSTRAINT');
 return Object.fromEntries(KEYS.map(k=>{
  const v=entered[k],spec=FIELDS[k];
  if(v===undefined||v===null||v==='')return [k,null];
  if(typeof v!=='number'||!Number.isFinite(v)||
     v<spec.min||v>spec.max||
     Math.abs(v/spec.step-Math.round(v/spec.step))>1e-8)
   throw Error('WORKBOOK_CONSTRAINT_INVALID:'+k);
  return [k,v];
 }));
}
function build({readerDecision,decisionContext,constraints}={}){
 const question=cleanQuestion(readerDecision);
 if(!scope.supportsDecision(question))
  throw Error('WORKBOOK_ONLY_EXPLICIT_WORK_VERSUS_LEARNING_QUESTION');
 const reported=context.checked(decisionContext);
 if(!reported||reported.currentWork===reported.targetSkill)
  throw Error('WORKBOOK_DISTINCT_USER_REPORTED_WORK_AND_SKILL_REQUIRED');
 const n=parseValues(constraints);
 const missing=KEYS.filter(k=>n[k]===null);
 const hourKnown=['weeklyStudyHours','requiredStudyHours','targetWeeks']
  .every(k=>n[k]!==null);
 const moneyKnown=['trainingCostKRW','availableBudgetKRW']
  .every(k=>n[k]!==null);
 // No fabricated estimates: these are calculations on self-reported inputs.
 const weeklyCapacity=hourKnown?n.weeklyStudyHours:null;
 const deadlineCapacity=hourKnown?
  +(n.weeklyStudyHours*n.targetWeeks).toFixed(4):null;
 const timeGap=hourKnown?
  +Math.max(0,n.requiredStudyHours-deadlineCapacity).toFixed(4):null;
 const estimatedWeeksToComplete=hourKnown?
  (weeklyCapacity===0?null:Math.ceil(n.requiredStudyHours/weeklyCapacity)):null;
 const hoursPerWeekNeeded=hourKnown?
  +Math.ceil(n.requiredStudyHours/n.targetWeeks*2)/2:null;
 const timeState=!hourKnown?'unknown':weeklyCapacity===0?
  'no-weekly-time':timeGap>0?'hours-short':'within-entered-hours';
 const budgetGap=moneyKnown?Math.max(0,n.trainingCostKRW-n.availableBudgetKRW):null;
 const budgetState=!moneyKnown?'unknown':budgetGap>0?
  'budget-short':'within-entered-budget';
 const complete=missing.length===0;
 const status=complete?(timeState==='within-entered-hours'&&
   budgetState==='within-entered-budget'?'resources-fit-on-entered-estimates':
   'at-least-one-entered-constraint-not-met'):'additional-customer-facts-required';
 const checks=[];
 if(!hourKnown){
  checks.push('학습에 필요한 시간·매주 확보 가능한 시간·목표 주수를 알려주면 시간 조건을 계산할 수 있습니다.');
 }else if(weeklyCapacity===0){
  checks.push('현재 입력으로는 일주일에 학습시간이 0시간입니다. 학습 일정을 마련하기 전에는 완료 시점을 계산할 수 없습니다.');
 }else if(timeGap>0){
  checks.push('현재 입력한 목표 기간 안에 총 '+timeGap+'시간이 부족합니다. 학습시간이나 목표 기간을 다시 검토해 주세요.');
 }else{
  checks.push('입력한 학습시간으로는 목표 기간 내 '+n.requiredStudyHours+'시간의 학습량을 배치할 수 있습니다. 실제 수료나 능력 습득을 보장하지는 않습니다.');
 }
 if(!moneyKnown){
  checks.push('교육비와 사용 가능한 예산을 모두 알려주면 필요한 추가 금액을 계산할 수 있습니다.');
 }else if(budgetGap>0){
  checks.push('교육비 기준으로 예산이 '+budgetGap.toLocaleString('ko-KR')+'원 부족합니다. 비용 구성과 별도 재원 여부를 확인해 주세요.');
 }else{
  checks.push('고객이 입력한 교육비는 입력한 예산 안에 들어갑니다. 생활비나 예상외 지출을 포함했다고 가정하지 않습니다.');
 }
 checks.push('기존 일을 유지하는 선택은 이 입력만으로 급여·승진·안정성을 평가할 수 없습니다. 현재 근무조건을 별도로 확인해야 합니다.');
 checks.push('일을 유지하면서 기술을 배울 수도 있으므로 두 선택이 반드시 상호 배타적이라고 가정하지 않습니다.');
 return Object.freeze({
  kind:'buyer-self-reported-work-skill-workbook-v1',
  status,question,workChoice:reported.currentWork,
  learningChoice:reported.targetSkill,
  entryKind:'self-reported-only',sourceData:Object.freeze({...n}),
  missingFields:Object.freeze(missing),
  missingQuestions:Object.freeze(missing.map(k=>MISSING_LABELS[k])),
  time:Object.freeze({
   state:timeState,
   availableWeeklyHours:n.weeklyStudyHours,
   requiredHours:n.requiredStudyHours,
   targetWeeks:n.targetWeeks,
   totalHoursByTarget:deadlineCapacity,
   hoursNeededPerWeek:hoursPerWeekNeeded,
   hoursShortByTarget:timeGap,
   earliestWholeWeeksOnEnteredSchedule:estimatedWeeksToComplete,
   scheduleOrCompletionGuaranteed:false
  }),
  budget:Object.freeze({
   state:budgetState,
   enteredCostKRW:n.trainingCostKRW,
   enteredBudgetKRW:n.availableBudgetKRW,
   additionalKRWNeeded:budgetGap,
   includesOtherLivingExpenses:false
  }),
  checks:Object.freeze(checks),
  natalEvidenceUsed:false,mbtiBehaviorInferred:false,
  predictedCareerSuccess:false,automatedDecisionRecommendation:false,
  providerCalls:0,paymentApproved:false,qualitySold:false,
  actualCustomerWillingnessToPayVerified:false
 });
}
function readerText(result){
 if(result?.kind!=='buyer-self-reported-work-skill-workbook-v1')
  throw Error('WORKBOOK_WRONG_RESULT');
 const line=[
  '고객이 입력한 고민: '+result.question,
  '현재 일: '+result.workChoice+' / 배우려는 기술: '+result.learningChoice,
  '계산 상태: '+(result.missingFields.length?
   '입력 부족 ('+result.missingQuestions.join(', ')+')':
   result.status==='resources-fit-on-entered-estimates'?
    '입력한 일정과 교육비가 제약 조건 안에 있음':'입력한 일정 또는 예산의 제약 미충족'),
  ...result.checks,
  '이 계산은 고객이 직접 입력한 시간·비용을 기준으로 하며, 사주나 MBTI에서 알게 된 개인의 능력·결과가 아닙니다.'
 ];
 return line.join('\n');
}
module.exports={build,readerText,parseValues,FIELDS};
