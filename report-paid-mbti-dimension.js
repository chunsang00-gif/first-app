'use strict';
// Two genuinely separate USER-ENTERED MBTI preference questions.
// Not a personality diagnosis and NOT a Saju/MBTI agreement claim.
// The current agreement/difference topics still own cross-framework claims.
const specs=Object.freeze({
 information:Object.freeze({
  index:1,letters:'SN',
  question:'정보를 접할 때 구체적인 사실을 우선할지 가능한 연결을 우선할지',
  sides:Object.freeze({
   S:'구체적으로 확인한 사실과 이전 경험을 먼저 살피는 정보 선호',
   N:'자료 사이의 연결과 가능한 해석을 먼저 살피는 정보 선호'
  }),
  before:'새 자료가 도착했을 때 무엇을 먼저 확인하고 어떤 정보를 보완할 것인가',
  boundary:'실제 판단 정확도·상상력·창의력·업무 능력은 측정하지 않았다'
 }),
 judgment:Object.freeze({
  index:2,letters:'TF',
  question:'선택할 때 일관된 기준을 우선할지 사람에게 미치는 영향을 우선할지',
  sides:Object.freeze({
   T:'논리적 일관성과 같은 기준의 적용을 먼저 살피는 판단 선호',
   F:'중요하게 여기는 가치와 사람에게 미치는 영향을 먼저 살피는 판단 선호'
  }),
  before:'두 선택지의 기준과 영향을 비교할 때 어느 질문을 먼저 할 것인가',
  boundary:'지능·공감 능력·실제 결단력이나 어느 판단이 더 옳은지는 측정하지 않았다'
 })
});
function build(type,topic){
 const spec=specs[topic];
 if(!spec||typeof type!=='string'||!/^[EI][SN][TF][JP]$/.test(type))return null;
 const code=type[spec.index],meaning=spec.sides[code];
 if(!meaning)throw Error('PAID_MBTI_DIMENSION_SOURCE_MISMATCH:'+topic);
 const condition='사용자가 입력한 MBTI '+type+'의 '+code+' 선호를 '+
  spec.question+'라는 질문으로만 풀이한다. '+meaning+
  '를 선호한다는 입력의 뜻은 '+spec.before+'의 한쪽 출발점일 뿐이다. '+
  spec.boundary+'. 사주 계산이 이 선호를 증명하거나 반박한 것은 아니다.';
 return Object.freeze({
  kind:'self-reported-mbti-dimension-question-v1',
  sourceRefs:Object.freeze(['person.mbti']),
  topic,dimension:spec.letters,selectedCode:code,
  inputType:type,interpretedPreference:meaning,
  readerQuestion:spec.question,appliedQuestion:spec.before,
  limit:spec.boundary,computedCondition:condition,
  actualBehaviorObserved:false,relativeAbilityVerified:false,
  sajuAgreementVerified:false,customerApproved:false
 });
}
module.exports={build,specs};
