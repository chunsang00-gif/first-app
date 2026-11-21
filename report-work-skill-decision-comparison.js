'use strict';
// Work54: a reproducible two-option REPORT made only from customer input.
// Does NOT recommend career action, use natal/MBTI, send data, or enable sales.
(function(root){
const source=typeof module!=='undefined'&&module.exports?
 require('./report-work-skill-decision-workbook'):
 root?.REPORT_WORK_SKILL_DECISION_WORKBOOK;
if(!source?.build)throw Error('WORK54_SHARED_WORKBOOK_REQUIRED');
const roundHalfUp=x=>Math.ceil((x-1e-10)*2)/2;
const format=x=>Number(x).toLocaleString('ko-KR');
function build(workbook){
 if(workbook?.kind!=='buyer-self-reported-work-skill-workbook-v1'||
    workbook.entryKind!=='self-reported-only'||
    workbook.natalEvidenceUsed!==false||
    workbook.mbtiBehaviorInferred!==false||
    workbook.providerCalls!==0||
    workbook.paymentApproved!==false)
  throw Error('WORK54_UNTRUSTED_WORKBOOK');
 const t=workbook.time,b=workbook.budget;
 if(!t||!b)throw Error('WORK54_INCOMPLETE_WORKBOOK');
 const timeKnown=t.state!=='unknown',budgetKnown=b.state!=='unknown';
 const shortTime=timeKnown&&t.hoursShortByTarget>0;
 const shortBudget=budgetKnown&&b.additionalKRWNeeded>0;
 const weeklyIncrease=timeKnown?
  Math.max(0,roundHalfUp(t.hoursNeededPerWeek-t.availableWeeklyHours)):null;
 const delayWeeks=timeKnown&&t.earliestWholeWeeksOnEnteredSchedule!==null?
  Math.max(0,t.earliestWholeWeeksOnEnteredSchedule-t.targetWeeks):null;
 const changes=[];
 if(shortTime){
  if(weeklyIncrease>0&&t.availableWeeklyHours+weeklyIncrease<=168)
   changes.push(Object.freeze({
    id:'increase-weekly-hours',kind:'schedule',
    amount:weeklyIncrease,unit:'hours/week',
    text:'목표 '+t.targetWeeks+'주를 유지한다면 주당 학습시간을 '+
      format(weeklyIncrease)+'시간 더 확보해 총 '+
      format(t.availableWeeklyHours+weeklyIncrease)+'시간으로 조정할 수 있는지 확인',
    customerMustVerify:true,actualFeasibilityProved:false
   }));
  if(delayWeeks!==null&&delayWeeks>0&&
     t.earliestWholeWeeksOnEnteredSchedule<=260)
   changes.push(Object.freeze({
    id:'extend-target-weeks',kind:'schedule',
    amount:delayWeeks,unit:'weeks',
    text:'주당 '+format(t.availableWeeklyHours)+'시간을 유지한다면 목표를 '+
      format(delayWeeks)+'주 연장한 총 '+
      format(t.earliestWholeWeeksOnEnteredSchedule)+'주로 잡을 수 있는지 확인',
    customerMustVerify:true,actualFeasibilityProved:false
   }));
  if(!changes.some(x=>x.kind==='schedule'))
   changes.push(Object.freeze({
    id:'schedule-no-verified-adjustment',kind:'schedule',
    amount:null,unit:null,
    text:'현재 입력과 범위 안에서 가능한 학습시간 조정안을 계산하지 못했습니다. 실제 주간 일정과 전체 교육 시간을 확인해 주세요.',
    customerMustVerify:true,actualFeasibilityProved:false
   }));
 }
 if(shortBudget)
  changes.push(Object.freeze({
   id:'resolve-education-budget-gap',kind:'budget',
   amount:b.additionalKRWNeeded,unit:'KRW',
   text:'교육비 부족분 '+format(b.additionalKRWNeeded)+
    '원을 어떤 방식으로 마련할지, 또는 수업 비용 자체를 낮출 수 있는지 확인',
   customerMustVerify:true,actualFeasibilityProved:false
  }));
 const openQuestions=[
  {id:'keep-work',title:'현재 일을 유지하는 경우',
   subject:workbook.workChoice,
   text:'현재 업무의 근무시간·소득·안정성·변경 가능한 근무일정은 입력되지 않았으므로 이 선택의 유불리는 계산할 수 없습니다.',
   numericVerdict:'not-calculable-from-given-data'},
  {id:'learn-skill',title:'새 기술을 배우거나 병행하는 경우',
   subject:workbook.learningChoice,
   text:!timeKnown&&!budgetKnown?
    '예상 학습시간·목표 기간·교육비·예산이 부족해 실행 조건을 계산할 수 없습니다.':
    '고객이 입력한 학습시간과 교육비의 제약만 계산합니다. 실제 학습 성과나 취업 결과는 예측하지 않습니다.',
   numericVerdict:workbook.status}
 ];
 const nextChecks=[];
 if(!timeKnown)nextChecks.push('예상 총 학습시간·매주 확보 가능한 시간·목표 기간을 확인');
 else if(shortTime)nextChecks.push('일정 변경안 중 현실적으로 가능한 방법을 확인');
 else nextChecks.push('실제 근무표와 수업 시간대가 서로 겹치지 않는지 확인');
 if(!budgetKnown)nextChecks.push('교육비와 별도로 사용할 수 있는 예산을 확인');
 else if(shortBudget)nextChecks.push('교육비 부족분과 추가 지출 가능 여부를 확인');
 else nextChecks.push('교육비에 교통비·시험비·생활비가 포함됐는지 확인');
 nextChecks.push('현재 직장의 조건과 학습 병행 가능 여부를 확인');
 const result=Object.freeze({
  kind:'self-reported-work-vs-learning-comparison-v1',
  sourceKind:workbook.kind,
  title:'현재 일 유지 vs 기술 학습 — 실행 조건 비교',
  readerQuestion:workbook.question,
  workChoice:workbook.workChoice,learningChoice:workbook.learningChoice,
  evidenceKind:'buyer-self-report-only',
  status:workbook.status,
  timeKnown,budgetKnown,
  timeSummary:timeKnown?Object.freeze({
   enteredWeeklyHours:t.availableWeeklyHours,
   enteredRequiredHours:t.requiredHours,
   enteredTargetWeeks:t.targetWeeks,
   enteredHoursAvailableByTarget:t.totalHoursByTarget,
   deficitHours:t.hoursShortByTarget,
   minimumHoursPerWeekForTarget:t.hoursNeededPerWeek,
   additionalWeeklyHoursForTarget:weeklyIncrease,
   weeksOnCurrentEnteredSchedule:t.earliestWholeWeeksOnEnteredSchedule,
   extraWeeksAtCurrentSchedule:delayWeeks
  }):null,
  budgetSummary:budgetKnown?Object.freeze({
   estimatedEducationCostKRW:b.enteredCostKRW,
   availableEducationBudgetKRW:b.enteredBudgetKRW,
   gapKRW:b.additionalKRWNeeded
  }):null,
  choices:Object.freeze(openQuestions.map(x=>Object.freeze(x))),
  waysToAdjust:Object.freeze(changes),
  nextChecks:Object.freeze(nextChecks),
  missingQuestions:Object.freeze([...workbook.missingQuestions]),
  cannotChooseForCustomer:true,
  alternativesAreNotGuaranteed:true,
  predictedOutcome:false,natalEvidenceUsed:false,mbtiPredictionUsed:false,
  modelCalls:0,paymentApproved:false,releaseApproved:false,
  consumerValueProven:false
 });
 return result;
}
function reportText(report){
 if(report?.kind!=='self-reported-work-vs-learning-comparison-v1'||
    report.paymentApproved!==false)throw Error('WORK54_INVALID_COMPARISON');
 return [
  report.title,
  '기존 일: '+report.workChoice,
  '새로 배울 기술: '+report.learningChoice,
  ...report.choices.map(x=>x.title+': '+x.text),
  ...(report.timeSummary?[
   '목표까지 '+format(report.timeSummary.deficitHours)+'시간 부족',
   '목표 기한을 유지하려면 추가로 주당 '+
     format(report.timeSummary.additionalWeeklyHoursForTarget)+'시간 필요'
  ]:[]),
  ...(report.budgetSummary?[
   '추가 교육비 필요: '+format(report.budgetSummary.gapKRW)+'원'
  ]:[]),
  ...report.waysToAdjust.map(x=>x.text),
  ...report.nextChecks,
  '현실 조건으로 계산한 무료 정보이며 사주·MBTI로 실제 선택 결과를 예측하지 않습니다.'
 ].join('\n');
}
const api=Object.freeze({build,reportText});
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(root?.document)root.REPORT_WORK_SKILL_DECISION_COMPARISON=api;
})(typeof window!=='undefined'?window:null);
