'use strict';
// A copyable/exportable result is useful only when it is CURRENT, privacy-
// minimized and NOT a disguised paid product. All data are fake.
const assert=require('node:assert/strict');
const workbook=require('./report-work-skill-decision-workbook');
const exporter=require('./report-work-skill-decision-private-export');
const QUESTION='기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.';
const preview=constraints=>workbook.quickPreview({
 readerDecision:QUESTION,constraints
});
const fakeLabel='비공개ABC물류회사유지';
const fakeSkill='비공개XYZ기술교육';
let network=0;
const oldFetch=global.fetch;
global.fetch=async()=>{network++;throw Error('PRIVACY_EXPORT_MUST_NOT_FETCH')};
try{
 const mini=exporter.compose({preview:preview({
  weeklyStudyHours:8,targetWeeks:8
 })});
 assert.equal(mini.kind,'buyer-private-number-only-summary-v1');
 assert.equal(mini.customerFreeTextIncluded,false);
 assert.equal(mini.generatedLocally,true);
 assert.equal(mini.customerReviewRequiredBeforeSharing,true);
 assert.equal(mini.paymentApproved,false);
 assert.equal(mini.modelCalls,0);
 assert.equal(mini.filename,'learning-time-budget-summary.txt');
 assert(mini.content.includes('목표 기간에 배치 가능한 시간: 64시간'));
 assert(mini.content.includes('필요 학습시간: 미입력'));
 assert(mini.content.includes('예상 교육비: 미입력'));
 assert(!mini.content.includes('부족한 학습시간: 0시간'),
  'incomplete time data cannot be converted to zero shortage');
 assert(!mini.content.includes('교육비 부족 금액: 0원'));
 const constrained=exporter.compose({preview:preview({
  weeklyStudyHours:3,requiredStudyHours:60,targetWeeks:8,
  trainingCostKRW:300000,availableBudgetKRW:100000
 })});
 for(const t of [
  '목표 기간에 배치 가능한 시간: 24시간',
  '목표 기간에 부족한 학습시간: 36시간',
  '현재 학습시간을 유지할 때 필요한 총 기간: 20주',
  '교육비 부족 금액: 200,000원',
  '주당 학습시간을 4.5시간 더 확보',
  '목표를 12주 연장',
  '교육비 부족분 200,000원',
  '전달하기 전에 직접 확인'
 ])assert(constrained.content.includes(t),'missing true numeric or guidance: '+t);
 assert(!constrained.content.includes(fakeLabel));
 assert(!constrained.content.includes(fakeSkill));
 assert(!constrained.content.includes(QUESTION),
  'original free-text question MUST NOT appear in shared text');
 assert(!constrained.content.includes('회사에서'));
 assert(constrained.content.length<7000);
 assert(constrained.content.indexOf('직장 선택을 보장')>=0||
   constrained.content.includes('취업 결과를 예측'));
 const blankMoney=exporter.compose({preview:preview({
  trainingCostKRW:0,availableBudgetKRW:0
 })});
 assert(blankMoney.content.includes('예상 교육비: 0원'));
 assert(blankMoney.content.includes('교육비 부족 금액: 0원'));
 assert(!blankMoney.content.includes('목표 기간에 배치 가능한 시간: 0시간'));
 const onlyRequired=exporter.compose({preview:preview({
  requiredStudyHours:60,targetWeeks:8
 })});
 assert(onlyRequired.content.includes('목표 기간에 필요한 주당 시간: 7.5시간'));
 assert(!onlyRequired.content.includes('목표 기간에 배치 가능한 시간'));
 const zero=exporter.compose({preview:preview({
  weeklyStudyHours:0,requiredStudyHours:25,targetWeeks:10,
  trainingCostKRW:0,availableBudgetKRW:0
 })});
 assert(zero.content.includes('산출 불가 (주당 0시간)'));
 assert(zero.content.includes('주당 학습시간을 2.5시간 더 확보'));
 assert(!zero.content.includes('목표를 10주 연장'));
 assert.throws(()=>exporter.compose({preview:preview({})}),
  /WORK58_NOTHING_CALCULATED_TO_EXPORT/);
 assert.throws(()=>exporter.compose({preview:{
  ...preview({weeklyStudyHours:3,requiredStudyHours:60,targetWeeks:8}),
  deficitHours:0
 }}),/WORK58_INCONSISTENT_NUMERIC_PREVIEW/);
 assert.throws(()=>exporter.compose({preview:{
  ...preview({weeklyStudyHours:3,requiredStudyHours:60,targetWeeks:8}),
  paymentApproved:true
 }}),/WORK58_UNTRUSTED_PRIVATE_PREVIEW/);
 assert.equal(network,0);
 console.log('PASS WORK58 NUMERIC-ONLY LOCAL EXPORT '+JSON.stringify({
  partialCapacity:'64-hours-with-unknown-shortfall',
  fullShortage:{hours:36,extraWeeklyHours:4.5,extraWeeks:12,
   budgetGapKRW:200000},
  zeroNotBlank:true,allFreeTextExcluded:true,
  networkCalls:network,paidModelCalls:0,merchantCalls:0,saleApproved:false
 }));
}finally{global.fetch=oldFetch}
