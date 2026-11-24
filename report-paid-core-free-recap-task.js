'use strict';
// Work96: The *same-chart public month reading* is not premium content.
// A source-owned month PLAN is still verified locally in full, but the
// actual paid HOUR-qualified provider task should receive ONLY the month
// evidence IDs and a short, explicitly non-billable recap assignment.
// Sending the long month 'new insight' script plus an instruction to ignore
// that script was a contradictory writer contract. No paid model call here.
function fromPlan(plan){
 if(plan?.kind!=='grounded-paid-core-reader-takeaway-v1'||
    plan.topic!=='saju_core.strength'||
    !Array.isArray(plan.refs)||plan.refs.length!==2||
    plan.refs[0]!=='natal.month.stem'||
    !/^natal\.month\.hidden\.[甲乙丙丁戊己庚辛壬癸]$/.test(plan.refs[1])||
    plan.notAnAdditionalPaidParagraph!==true||
    plan.noInventedHistory!==true||
    plan.noUnverifiedPersonalTrait!==true||
    plan.additionalTopic!==false||
    plan.professionalReviewComplete!==false)
  throw Error('PAID_FREE_MONTH_RECAP_SOURCE_PLAN_DRIFT');
 return Object.freeze({
  kind:plan.kind,topic:plan.topic,
  refs:Object.freeze(plan.refs.slice()),
  scope:'already-public-month-recap-only-v1',
  writerInstruction:
   '태어난 달의 기존 무료 본문을 한 번만 짧게 복습한다. '+
   '같은 명식의 이미 공개된 cards 중 출생월 설명을 참고하되 '+
   '월의 계산법, 다른 숨은 글자, 가상의 생활 장면, 새 개인별 판단을 추가하지 않는다. '+
   '고객의 실제 고민이나 선택별 조언은 출생시간의 별도 temperament에서만 작성한다.',
  notAnAdditionalPaidParagraph:true,
  noInventedHistory:true,noUnverifiedPersonalTrait:true,
  additionalTopic:false,professionalReviewComplete:false
 });
}
module.exports={fromPlan};
