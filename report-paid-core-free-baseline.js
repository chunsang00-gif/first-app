'use strict';
// Give the actual PAID hour-extension writer the SAME already-public FREE
// chapter prose that its buyer can read. This prevents falsely presenting
// synonyms of free month/year-hour material as a billable new insight.
// The preview is calculated locally; no provider, payment, or network calls.
// It is READER CONTEXT, NOT extra natal evidence or expert approval.
const free=require('./report-reading-sample');
const SOURCE_KIND='buyer-choice-hour-symbolic-extension-v1';
const IDS=Object.freeze(['birth-month','month-visible-link','year-hour']);
function build(packet,hour){
 if(packet?.status!=='ready'||hour?.kind!==SOURCE_KIND||
    hour.distinctFromMonth!==true||
    !Array.isArray(hour.sourceRefs)||hour.sourceRefs.length!==2||
    !hour.sourceRefs.includes('natal.hour.stem')||
    !hour.sourceRefs.some(ref=>ref.startsWith('natal.hour.hidden.'))||
    hour.realAbilityObserved!==false||hour.premiumValueApproved!==false)
  throw Error('PAID_CORE_FREE_BASELINE_REQUIRES_VERIFIED_HOUR_SOURCE');
 const preview=free.build(packet);
 if(preview?.status!=='calculated-example'||preview.modelCalls!==0||
    preview.completedPremiumParagraphs!==0)
  throw Error('PAID_CORE_FREE_BASELINE_UNVERIFIED_PREVIEW');
 const alreadyPublic=preview.cards.filter(c=>IDS.includes(c.id));
 if(!alreadyPublic.some(c=>c.id==='birth-month')||
    !alreadyPublic.some(c=>c.id==='year-hour')||
    alreadyPublic.some(c=>typeof c.text!=='string'||c.text.length<30))
  throw Error('PAID_CORE_FREE_BASELINE_REQUIRED_CARDS_MISSING');
 const summary=alreadyPublic.map(c=>c.title+' — '+c.text).join(' / ');
 const instruction=
  '동일한 출생정보로 이미 고객에게 무료 공개된 실제 본문은 다음과 같다: '+summary+
  ' 유료 첫 장의 출생월 필수 strength에서는 출처 설명을 필요한 만큼만 하고 이것을 새 발견이라 부르지 않는다. '+
  '이 유료 temperament에서는 무료에 있던 출생월 풀이와 태어난 해·시간의 겉글자 뜻을 바꿔 말하거나 요약하지 말고, '+
  '위 무료 문장에 나타나지 않은 출생시간의 안쪽 글자와 그 전통적 분류만 별도로 해석한다. '+
  '그 추가 분류를 독자가 직접 적은 두 선택에 각각 어떻게 조건부로 적용할지 다른 확인 기준으로 설명한다. '+
  '업무·기술 입력은 고객이 적은 문맥이지 출생으로 증명된 개인 경험이나 능력은 아니다. '+
  '실제 성격, 취업, 학습속도, 재정 성과, 최종 선택의 우열은 판정하지 않는다. '+
  '무료에 없던 새 독자 해석을 설명할 수 없으면 고급 보고서로 판매 가능하다고 단정하지 않는다.';
 return Object.freeze({
  kind:'same-chart-free-first-chapter-boundary-v1',
  alreadyPublicCards:alreadyPublic.map(c=>({id:c.id,title:c.title,text:c.text})),
  writerInstruction:instruction,modelCalls:0,merchantCalls:0,
  extraNatalEvidenceAdded:false,freeTextIsUserFacing:true,
  professionalApproval:false,saleApproved:false
 });
}
module.exports={build,IDS};
