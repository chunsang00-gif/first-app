'use strict';
// Four distinct USER-ENTERED MBTI preference questions, one per dimension.
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
 }),
 energy:Object.freeze({
  index:0,letters:'IE',
  question:'생각을 정리할 때 혼자 숙고할지 외부 상호작용을 거칠지',
  sides:Object.freeze({
   I:'혼자 생각을 정리하는 과정을 더 편안하게 여기는 선호',
   E:'사람이나 외부 활동과 상호작용하며 생각을 정리하는 선호'
  }),
  before:'의견을 나누기 전 혼자 정리할 시간과 대화할 기회 중 무엇을 먼저 둘 것인가',
  boundary:'말수·사회성·대인 능력과 실제 행동 빈도는 확인하지 않았다'
 }),
 planning:Object.freeze({
  index:3,letters:'JP',
  question:'일정과 결정을 일찍 닫을지 상황을 보며 선택의 여지를 유지할지',
  sides:Object.freeze({
   J:'결정과 일정을 미리 정리하고 진행하는 쪽을 선호',
   P:'정보와 선택의 여지를 열어 두며 상황에 맞춰 조정하는 쪽을 선호'
  }),
  before:'남아 있는 정보를 기다릴 때 마감 시점을 미리 정할지 수정 여지를 남길 것인가',
  boundary:'성실함·미루는 습관·실행 성과나 마감 준수 여부는 측정하지 않았다'
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
