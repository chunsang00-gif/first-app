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
 skill:Object.freeze({
  paired:'실제 입력한 두 배움·기술 선택을 그대로 구분한다. 기존 업무와 새 기술 학습처럼 미리 정해 둔 비교 예시를 고객의 고민으로 대체하지 않고, 선택별로 다른 확인 기준을 제시한다.',
  single:'고객이 직접 질문한 배움·기술 한 가지를 중심으로, 어떤 작은 결과물·연습 조건이나 방식의 차이를 검토할지 조건부로 설명한다. 기존 일을 유지할지 또는 이직할지 같은 입력되지 않은 대안은 만들지 않는다.'
 }),
 money:Object.freeze({
  paired:'고객이 실제 입력한 두 금전 선택을 구분해 각 경우에 그 출생시간 분류가 더하는 확인 질문을 제시한다. 지출 관리와 외부 자금 마련을 고객이 입력하지 않았다면 그런 대안을 새로 만들지 않는다.',
  single:'고객이 직접 질문한 돈·자원 문제 한 가지만 다루고, 그 문제에 필요한 반복 비용 또는 자원 확보 경로를 가상의 점검 기준으로 설명한다. 다른 소비·투자 대안을 만들어 비교하지 않는다.'
 }),
 pressure:Object.freeze({
  paired:'고객이 실제 입력한 두 업무 압박 관련 선택을 구분해 각 경우에 그 출생시간 분류가 더하는 확인 질문을 제시한다. 정해진 절차와 긴급 요구를 고객이 입력하지 않았다면 임의로 양자택일로 꾸미지 않는다.',
  single:'고객이 직접 질문한 업무 압박 한 가지에 대해 맡은 책임 또는 추가 요구의 경계를 조건부로 설명한다. 질문하지 않은 두 번째 업무나 상사를 상상하지 않는다.'
 })
});
function build(packet,hour){
 if(packet?.status!=='ready'||hour?.kind!==SOURCE_KIND||
    hour.distinctFromMonth!==true||hour.distinctFromFreeVisibleNatal!==true||
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
 const templates=DOMAIN_TASKS[hour.readerDomain];
 if(!label||!templates)throw Error('PAID_CORE_FREE_BASELINE_UNKNOWN_READER_DOMAIN');
 const choices=require('./report-paid-core-choice-application')
  .alternatives(packet.person?.readerDecision);
 const domainTask=choices?templates.paired:templates.single;
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
