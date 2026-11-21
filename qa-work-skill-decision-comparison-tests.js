'use strict';
// Work54: same-reader calculation-driven decision report, no natal claims,
// made-up salary, simulated employer rules, market data or external IO.
const assert=require('node:assert/strict');
const workbook=require('./report-work-skill-decision-workbook');
const decision=require('./report-work-skill-decision-comparison');
const input={
 readerDecision:'기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.',
 decisionContext:{currentWork:'물류 재고 확인',targetSkill:'엑셀 자동화'}
};
let network=0;
const orig=global.fetch;global.fetch=()=>{network++;throw Error('NO_NETWORK_IN_DECISION_COMPARISON')};
try{
 const report=constraints=>decision.build(workbook.build({...input,constraints}));
 const short=report({weeklyStudyHours:3,requiredStudyHours:60,targetWeeks:8,
  trainingCostKRW:300000,availableBudgetKRW:100000});
 assert.equal(short.kind,'self-reported-work-vs-learning-comparison-v1');
 assert.equal(short.timeSummary.deficitHours,36);
 assert.equal(short.timeSummary.minimumHoursPerWeekForTarget,7.5);
 assert.equal(short.timeSummary.additionalWeeklyHoursForTarget,4.5);
 assert.equal(short.timeSummary.weeksOnCurrentEnteredSchedule,20);
 assert.equal(short.timeSummary.extraWeeksAtCurrentSchedule,12);
 assert.equal(short.budgetSummary.gapKRW,200000);
 assert.deepEqual(short.choices.map(x=>x.id),['keep-work','learn-skill']);
 assert.equal(short.choices[0].numericVerdict,'not-calculable-from-given-data');
 assert(short.choices[0].text.includes('근무시간·소득·안정성'));
 assert(short.choices[1].text.includes('학습시간과 교육비'));
 assert.deepEqual(short.waysToAdjust.map(x=>x.id),[
  'increase-weekly-hours','extend-target-weeks','resolve-education-budget-gap'
 ]);
 assert.deepEqual(short.waysToAdjust.map(x=>x.amount),[4.5,12,200000]);
 assert(short.waysToAdjust[0].text.includes('총 7.5시간'));
 assert(short.waysToAdjust[1].text.includes('총 20주'));
 assert(short.waysToAdjust[2].text.includes('200,000원'));
 assert(short.waysToAdjust.every(x=>x.customerMustVerify&&
   x.actualFeasibilityProved===false));
 assert(short.nextChecks.length>=3);
 assert(short.nextChecks.some(x=>x.includes('추가 지출')));
 assert(short.nextChecks.some(x=>x.includes('현재 직장')));
 const prose=decision.reportText(short);
 assert(prose.includes('주당 4.5시간'));
 assert(prose.includes('12주 연장'));
 assert(prose.includes('200,000원'));
 assert(!prose.includes('추천합니다.'));
 assert(!prose.includes('이직하게 됩니다'));
 assert(!prose.includes('태어난 시간'));
 assert.equal(short.consumerValueProven,false);
 assert.equal(short.natalEvidenceUsed,false);
 assert.equal(short.mbtiPredictionUsed,false);
 assert.equal(short.cannotChooseForCustomer,true);
 assert.equal(short.paymentApproved,false);
 assert.equal(short.modelCalls,0);
 const pass=report({weeklyStudyHours:8,requiredStudyHours:60,targetWeeks:8,
  trainingCostKRW:150000,availableBudgetKRW:200000});
 assert.equal(pass.status,'resources-fit-on-entered-estimates');
 assert.equal(pass.timeSummary.additionalWeeklyHoursForTarget,0);
 assert.equal(pass.timeSummary.extraWeeksAtCurrentSchedule,0);
 assert.equal(pass.budgetSummary.gapKRW,0);
 assert.equal(pass.waysToAdjust.length,0,'should not suggest fake constraints when inputs fit');
 assert(pass.nextChecks.some(x=>x.includes('실제 근무표')));
 assert(pass.nextChecks.some(x=>x.includes('생활비')));
 const timeOnly=report({weeklyStudyHours:3,requiredStudyHours:60,targetWeeks:8});
 assert.equal(timeOnly.timeSummary.extraWeeksAtCurrentSchedule,12);
 assert.equal(timeOnly.budgetSummary,null);
 assert.equal(timeOnly.waysToAdjust.length,2);
 assert(timeOnly.missingQuestions.some(x=>x.includes('예산')));
 assert(timeOnly.nextChecks.some(x=>x.includes('교육비')));
 const moneyOnly=report({trainingCostKRW:300000,availableBudgetKRW:100000});
 assert.equal(moneyOnly.timeSummary,null);
 assert.equal(moneyOnly.waysToAdjust.length,1);
 assert.equal(moneyOnly.waysToAdjust[0].id,'resolve-education-budget-gap');
 const zero=report({weeklyStudyHours:0,requiredStudyHours:25,targetWeeks:10,
  trainingCostKRW:0,availableBudgetKRW:0});
 assert.equal(zero.timeSummary.weeksOnCurrentEnteredSchedule,null);
 assert.equal(zero.timeSummary.extraWeeksAtCurrentSchedule,null);
 assert.equal(zero.timeSummary.additionalWeeklyHoursForTarget,2.5);
 assert.deepEqual(zero.waysToAdjust.map(x=>x.id),['increase-weekly-hours'],
  'with zero weekly hours extending the target cannot finish any training');
 const edge=report({weeklyStudyHours:2.5,requiredStudyHours:10,targetWeeks:4,
  trainingCostKRW:99000,availableBudgetKRW:99000});
 assert.equal(edge.waysToAdjust.length,0);
 // A 168h/week cap means a larger weekly target cannot be offered as
 // mathematically viable: fail closed instead of fabricating 200h/week.
 const impossible=report({weeklyStudyHours:0,requiredStudyHours:10000,targetWeeks:1,
  trainingCostKRW:0,availableBudgetKRW:0});
 assert.equal(impossible.timeSummary.additionalWeeklyHoursForTarget,10000);
 assert.equal(impossible.waysToAdjust[0].id,'schedule-no-verified-adjustment');
 assert.equal(impossible.waysToAdjust[0].amount,null);
 assert.equal(impossible.waysToAdjust.length,1);
 assert.throws(()=>decision.build({kind:'wrong'}),/WORK54_UNTRUSTED_WORKBOOK/);
 assert.equal(network,0);
 console.log('WORK54_DECISION_COMPARISON='+JSON.stringify({
  first:'work continuation is NOT numeric-scored without employer terms',
  second:'learning schedule and budget gaps are calculated only from self-report',
  constrained:{extraHoursPerWeek:4.5,extraWeeks:12,budgetGapKRW:200000},
  feasible:{extraHoursPerWeek:0,extraWeeks:0,budgetGapKRW:0},
  partialAndZeroHandled:true,unfeasibleSchedulesNotInvented:true,
  realModelCalls:network,merchantCalls:0,revenueApproved:false,
  soldProductValueProven:false
 }));
}finally{global.fetch=orig}
