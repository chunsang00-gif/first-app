'use strict';
// Work58: a customer-controlled, local-only TEXT export. Never includes the
// reader's original question, work/skill names, birthday, MBTI, phone, or
// other free-text inputs. Numbers ARE personal information: user should
// review the draft before choosing to save/copy or share it.
(function(root){
const workbook=typeof module!=='undefined'&&module.exports?
 require('./report-work-skill-decision-workbook'):
 root?.REPORT_WORK_SKILL_DECISION_WORKBOOK;
const comparisonEngine=typeof module!=='undefined'&&module.exports?
 require('./report-work-skill-decision-comparison'):
 root?.REPORT_WORK_SKILL_DECISION_COMPARISON;
if(!workbook?.quickPreview||!workbook?.build||!comparisonEngine?.build)
 throw Error('WORK58_SHARED_CALCULATIONS_REQUIRED');
const format=x=>Number(x).toLocaleString('ko-KR');
const FILENAME='learning-time-budget-summary.txt';
const DEFAULT_QUESTION='기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.';
function compose({preview}={}){
 if(preview?.kind!=='buyer-self-reported-partial-work-skill-capacity-v1'||
    preview.scope!=='arithmetic-only-no-career-recommendation'||
    preview.natalEvidenceUsed!==false||preview.mbtiPredictionUsed!==false||
    preview.providerCalls!==0||preview.paymentApproved!==false)
  throw Error('WORK58_UNTRUSTED_PRIVATE_PREVIEW');
 // Independently recalculate numeric source fields; don't accidentally
 // export a manipulated or stale display-only value.
 const clean=workbook.quickPreview({
  readerDecision:DEFAULT_QUESTION,constraints:preview.sourceData
 });
 for(const key of [
  'availableHoursByTarget','minimumWeeklyHoursForTarget','deficitHours',
  'weeksOnSchedule','budgetGapKRW','enteredFieldCount'
 ])if(!Object.is(clean[key],preview[key]))
  throw Error('WORK58_INCONSISTENT_NUMERIC_PREVIEW:'+key);
 if(!clean.capacityKnown&&!clean.requiredWeeklyKnown&&!clean.moneyKnown)
  throw Error('WORK58_NOTHING_CALCULATED_TO_EXPORT');
 // Build any more detailed alternatives from the customer NUMBERS but
 // deliberately use fixed anonymous labels. This is not a formatter that
 // silently exports arbitrary customer-written context or a report fragment.
 const internallyComputed=comparisonEngine.build(workbook.build({
  readerDecision:DEFAULT_QUESTION,
  decisionContext:{currentWork:'현재 업무',targetSkill:'배울 기술'},
  constraints:clean.sourceData
 }));
 if(internallyComputed.kind!=='self-reported-work-vs-learning-comparison-v1'||
    internallyComputed.modelCalls!==0||
    internallyComputed.paymentApproved!==false)
  throw Error('WORK58_UNTRUSTED_COMPARISON_RESULT');
 const n=clean.sourceData;
 const line=(name,key,unit)=>name+': '+
  (n[key]===null?'미입력':format(n[key])+unit);
 const lines=[
  '학습시간·교육비 선택 비교 | 무료 계산 요약',
  '고민 유형: 현재 일 유지 / 새 기술 학습',
  '출처: 이용자가 직접 입력한 추정치 (사주·MBTI 아님)',
  '',
  '[직접 입력한 숫자]',
  line('주당 확보 가능한 시간','weeklyStudyHours','시간'),
  line('필요 학습시간','requiredStudyHours','시간'),
  line('목표 기간','targetWeeks','주'),
  line('예상 교육비','trainingCostKRW','원'),
  line('학습용 예산','availableBudgetKRW','원'),
  '',
  '[계산으로 확인한 내용]'
 ];
 if(clean.capacityKnown)lines.push(
  '목표 기간에 배치 가능한 시간: '+
   format(clean.availableHoursByTarget)+'시간');
 if(clean.requiredWeeklyKnown)lines.push(
  '목표 기간에 필요한 주당 시간: '+
   format(clean.minimumWeeklyHoursForTarget)+'시간');
 if(clean.fullTimeKnown)lines.push(
  '목표 기간에 부족한 학습시간: '+
   format(clean.deficitHours)+'시간',
  '현재 학습시간을 유지할 때 필요한 총 기간: '+
   (clean.weeksOnSchedule===null?'산출 불가 (주당 0시간)':
    format(clean.weeksOnSchedule)+'주'));
 if(clean.moneyKnown)lines.push(
  '교육비 부족 금액: '+format(clean.budgetGapKRW)+'원');
 if(internallyComputed.waysToAdjust.length){
  lines.push('','[검토할 수 있는 조건 변경]');
  for(const option of internallyComputed.waysToAdjust){
   if(!['schedule','budget'].includes(option.kind)||
      typeof option.text!=='string'||option.text.length>300)
    throw Error('WORK58_INVALID_COMPARISON_OPTION');
   lines.push('- '+option.text);
  }
 }
 lines.push('','[확인할 사항]',
  '- 근무시간, 급여, 휴식시간, 교육과정 조건은 이 숫자만으로 평가할 수 없습니다.',
  '- 교육비에 교통비·시험비·생활비가 포함됐는지 확인해야 합니다.',
  '- 현재 일을 유지하면서 배우는 방법도 가능합니다.',
  '- 선택한 시간표와 비용이 실제 실천 가능한지는 별도 확인이 필요합니다.',
  '',
  '공유 주의: 회사명·업무명·기술명·자유입력 질문은 자동으로 포함하지 않았지만 시간·비용 숫자는 개인 정보일 수 있습니다. 다른 사람에게 전달하기 전에 직접 확인하세요.',
  '실제 학습 성공·취업 결과를 예측하거나 돈을 내고 구매하는 보고서가 아닙니다.'
 );
 const content=lines.join('\n');
 if(content.length>7000)throw Error('WORK58_EXPORT_TOO_LONG');
 return Object.freeze({
  kind:'buyer-private-number-only-summary-v1',
  filename:FILENAME,content,
  numbersAreUserEntered:true,
  customerFreeTextIncluded:false,
  generatedLocally:true,
  customerReviewRequiredBeforeSharing:true,
  copyOrDownloadRequiresExplicitGesture:true,
  networkCalls:0,modelCalls:0,paymentApproved:false,
  saleApproved:false
 });
}
const api=Object.freeze({compose,FILENAME});
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(root?.document)root.REPORT_WORK_SKILL_DECISION_PRIVATE_EXPORT=api;
})(typeof window!=='undefined'?window:null);
