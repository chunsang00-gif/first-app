'use strict';
// Give the actual PAID hour-extension writer the SAME already-public FREE
// chapter prose that its buyer can read. This prevents falsely presenting
// synonyms of free month/year-hour material as a billable new insight.
// The preview is calculated locally; no provider, payment, or network calls.
// It is READER CONTEXT, NOT extra natal evidence or expert approval.
const free=require('./report-reading-sample');
const SOURCE_KIND='buyer-choice-hour-symbolic-extension-v1';
const IDS=Object.freeze(['birth-month','month-visible-link','year-hour']);
// Keep the ordinary first-chapter writer aligned with the ACTUAL qualified
// buyer domain. A finance/pressure query is not a learning/career question.
const DOMAIN_LABELS=Object.freeze({
 skill:'배움·기술',money:'돈·자원',pressure:'업무 압박·책임'
});
const DOMAIN_TASKS=Object.freeze({
 skill:'기존 일을 계속할 때는 기존 결과물·진행 방식의 검토 조건을, 새 기술을 익힐 때는 처음 만들 연습 결과물과 연습 기간을 서로 다르게 다룬다.',
 money:'지출·저축·자금 마련 중 실제 고객이 질문한 선택에만 연결하고, 정기 비용과 필요한 돈을 마련할 경로 같은 서로 다른 확인 항목을 구별한다.',
 pressure:'고객이 직접 질문한 업무 부담에만 연결하고, 기존에 맡은 책임의 경계와 갑작스러운 추가 요구를 처리할 범위를 구별한다.'
});
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
 const label=DOMAIN_LABELS[hour.readerDomain];
 const domainTask=DOMAIN_TASKS[hour.readerDomain];
 if(!label||!domainTask)throw Error('PAID_CORE_FREE_BASELINE_UNKNOWN_READER_DOMAIN');
 const choices=require('./report-paid-core-choice-application')
  .alternatives(packet.person?.readerDecision);
 const choiceTask=choices?
  '고객이 실제로 적은 두 선택을 각각 다른 확인 조건에 적용한다. 고객 질문을 그대로 복사하거나 양쪽에 같은 조언을 반복하지 않는다. ':
  '고객 질문에서 두 선택이 명확히 확인되지 않았으므로 가짜 두 선택지를 창작하지 말고 실제 적은 한 가지 고민에만 조건부로 답한다. ';
 const summary=alreadyPublic.map(c=>c.title+' — '+c.text).join(' / ');
 const instruction=
  '동일한 출생정보로 이미 고객에게 무료 공개된 실제 본문은 다음과 같다: '+summary+
  ' 유료 첫 장의 출생월 필수 strength에서는 출처 설명을 필요한 만큼만 하고 이것을 새 발견이라 부르지 않는다. '+
  '이 유료 temperament에서는 무료에 있던 출생월 풀이와 태어난 해·시간의 겉글자 뜻을 바꿔 말하거나 요약하지 말고, '+
  '위 무료 문장에 나타나지 않은 출생시간의 안쪽 글자와 그 전통적 분류만 별도로 해석한다. '+
  '그 추가 분류를 고객이 직접 적은 '+label+' 질문에만 적용한다. '+domainTask+' '+choiceTask+
  '고객이 직접 적은 질문과 상황은 출생으로 증명된 경험이나 능력이 아니라 독자가 제공한 문맥이다. '+
  '실제 성격, 취업, 학습속도, 재정 성과, 최종 선택의 우열은 판정하지 않는다. '+
  '무료에 없던 새 독자 해석을 설명할 수 없으면 고급 보고서로 판매 가능하다고 단정하지 않는다.';
 return Object.freeze({
  kind:'same-chart-free-first-chapter-boundary-v1',
  alreadyPublicCards:alreadyPublic.map(c=>({id:c.id,title:c.title,text:c.text})),
  writerInstruction:instruction,readerDomain:hour.readerDomain,
  readerDomainLabel:label,twoBuyerChoicesParsed:Boolean(choices),
  modelCalls:0,merchantCalls:0,
  extraNatalEvidenceAdded:false,freeTextIsUserFacing:true,
  professionalApproval:false,saleApproved:false
 });
}
module.exports={build,IDS,DOMAIN_LABELS};
