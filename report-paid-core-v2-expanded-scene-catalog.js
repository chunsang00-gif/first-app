'use strict';
// Explicit chart-gated *hypothetical* cases, never observed life traits.
// A source stem and month-hidden EXACT equality is checked separately.
const SEEDS=Object.freeze([
 [
  "vendor-bid-vs-compliance",
  "편재",
  "정관",
  "left-generates-right",
  "마을회관 의자 40개를 세 업체에서 구매하는 가정",
  "여러 공급처의 견적과 납품 수량 확보",
  "구매 승인 담당과 반품 책임 기준",
  "견적은 있지만 누가 계약을 승인할지 정하지 않아 발주가 늦어질 수 있다",
  "승인 기준은 있어도 납품할 업체와 수량을 확보하지 않으면 의자를 받을 수 없다"
 ],
 [
  "library-instruction-vs-shared-supplies",
  "정인",
  "겁재",
  "left-generates-right",
  "작은 도서관에서 책 수선 방법을 배우며 공용 도구를 나누는 가정",
  "책 수선 방법과 안전한 사용 순서 안내",
  "여섯 개 공용 도구의 사용 시간과 반납 순서 배정",
  "수선 방법을 배워도 공용 도구 사용 순서가 없으면 여러 참여자가 동시에 작업하기 어렵다",
  "도구 사용 순서를 정해도 올바른 수선 방법이 안내되지 않으면 책을 손상시킬 수 있다"
 ],
 [
  "maintenance-budget-vs-repair-approval",
  "정재",
  "정관",
  "left-generates-right",
  "공동주택 현관 센서등을 분기마다 교체하는 가정",
  "센서등 부품 구매비와 정기 교체 비용 마련",
  "교체 승인 담당과 완료 확인 책임 지정",
  "부품 예산이 있어도 수리를 승인할 사람이 없다면 교체 결정이 늦어질 수 있다",
  "승인 담당이 있어도 부품과 정기 비용이 없다면 실제 교체를 진행하기 어렵다"
 ],
 [
  "shared-kitchen-schedule-vs-improvement",
  "겁재",
  "상관",
  "left-generates-right",
  "주민공동부엌에서 냉장고 공동 선반을 재배치하는 가정",
  "두 조가 사용하는 선반 구역과 공동 사용 순서 합의",
  "새 선반 배치를 시험할 기간과 개선안 승인 절차",
  "사용 구역이 정해져도 개선안을 시험할 기회가 없다면 반복되는 동선 불편은 그대로 남을 수 있다",
  "새 배치안이 있어도 공동 구역 사용 순서를 합의하지 않으면 상대 조의 물품을 옮기는 과정에서 마찰이 생길 수 있다"
 ],
 [
  "multiple-suppliers-vs-finished-craft",
  "편재",
  "식신",
  "right-generates-left",
  "행사장에서 나눠줄 종이 책갈피 80개를 제작하는 가정",
  "종이와 끈 재료를 조달할 업체와 대체 납품 경로 확보",
  "책갈피 80개 제작량과 검수 기준 및 마감 시한 지정",
  "재료 공급처가 많아도 실제 제작 작업과 검수 시간을 배정하지 않으면 행사 전에 완성하지 못할 수 있다",
  "제작 계획이 있어도 실제 종이와 끈의 납품 경로가 없다면 제작을 시작하지 못할 수 있다"
 ],
 [
  "queue-redesign-vs-owner-assignment",
  "상관",
  "비견",
  "right-generates-left",
  "동네 체험관의 입장 대기 안내판을 다시 제작하는 가정",
  "입장 순서를 바꾸기 위한 동선 개선안과 안내판 초안",
  "안내판 수정 책임과 현장 대기 안내 담당 배정",
  "동선 개선안을 만들어도 현장 담당자가 정해지지 않으면 실제 대기 줄에 적용하기 어렵다",
  "안내 담당이 있어도 바꿀 구체적인 절차가 없다면 기존 혼잡을 줄이는 개선안을 시험할 수 없다"
 ],
 [
  "urgent-intake-vs-boundary-allocation",
  "편관",
  "비견",
  "left-controls-right",
  "도서관에 갑자기 접수된 단체 예약을 두 담당자가 처리하는 가정",
  "긴급 예약의 승인 요건과 접수 가능 인원 한계 설정",
  "두 담당자의 좌석 확인과 예약자 회신 업무 분담",
  "긴급 승인 기준을 정해도 실제 좌석 확인 담당이 없으면 예약자에게 제때 답하기 어렵다",
  "좌석 확인 담당을 나눠도 승인 요건을 정하지 않으면 서로 다른 예약 확답을 줄 수 있다"
 ],
 [
  "repair-proposal-vs-shared-tool-budget",
  "상관",
  "겁재",
  "right-generates-left",
  "공용 자전거 수리소에서 공구 대여 절차를 개선하는 가정",
  "수리 접수와 공구 대여 순서를 바꾸는 개선안 마련",
  "두 정비조의 공동 공구 사용 시간과 반납 책임 분담",
  "대여 절차 개선안이 있어도 공동 공구의 이용 시간을 합의하지 않으면 현장에서 적용하기 어렵다",
  "공구 사용표만 정해도 접수 대기 줄을 바꾸는 구체적인 개선안이 없다면 대기 문제를 시험해 볼 수 없다"
 ]
]);
const CATALOG=Object.freeze(Object.fromEntries(SEEDS.map(
 ([id,mainRole,otherRole,direction,scene,original,additional,originalOnly,additionalOnly])=>[
  id,Object.freeze({sceneId:id,mainRole,otherRole,direction,
   positions:Object.freeze(['natal.year.stem','natal.hour.stem']),
   comparedRoles:'달의 대표 속글자('+original+')와 달의 다른 속글자가 밖에 드러낸 의미('+additional+')',
   traditionalDirection:direction==='left-generates-right'?
    '기본 분류가 추가 분류를 생하는 전통적 오행 방향':
    direction==='right-generates-left'?
    '추가 분류가 기본 분류를 생하는 전통적 오행 방향':
    direction==='left-controls-right'?
    '기본 분류가 추가 분류를 제약하는 전통적 오행 방향':
    '추가 분류가 기본 분류를 제약하는 전통적 오행 방향',
   scene,openingQuestion:original+'과 '+additional+'을 함께 다룰 때 각각 누락되면 무엇이 달라질까?',
   originalCondition:original,additionalCondition:additional,
   whenOnlyOriginal:originalOnly,whenOnlyAdditional:additionalOnly,
   directionLimit:'전통 분류의 계산 관계일 뿐 개인의 실제 일 경험, 성격, 능력과 미래 사건은 입증되지 않는다'
  })])));
function forContrast(c){
 if(!c||c.visiblePositionRelationVerified!==true||
    c.realizedDirectionEffectVerified!==false||
    c.prioritizationVerified!==false||c.approvedForSale!==false)return null;
 const e=Object.values(CATALOG).find(x=>
  x.mainRole===c.mainRole&&x.otherRole===c.otherRole&&
  x.direction===c.monthMainToExposedElementDirection&&
  x.positions.includes(c.visiblePosition));
 if(!e)return null;
 const pos=c.visiblePosition==='natal.year.stem'?'해':'시간';
 return {
  kind:'v2-verified-classifications-conditional-editorial-scene-v1',
  sceneId:e.sceneId,rolePair:[e.mainRole,e.otherRole],
  traditionOnly:true,realPersonObservation:false,
  priorityDetermined:false,approvedForSale:false,
  sourceRefs:c.sourceRefs.slice(),
  scene:e.scene,openingQuestion:e.openingQuestion,
  originalCondition:e.originalCondition,additionalCondition:e.additionalCondition,
  whenOnlyOriginal:e.whenOnlyOriginal,whenOnlyAdditional:e.whenOnlyAdditional,
  directionLimit:e.directionLimit,
  readerSequence:[
   '태어난 '+pos+'의 겉글자와 달의 다른 숨은 글자가 정확히 일치하는 실제 출생 위치를 밝힘',
   '한 가지 가상 장면에서 두 역할을 구별함',
   '기본 조건만 갖춘 경우와 추가 조건만 갖춘 경우의 차이를 각각 설명함',
   '개인의 실제 경험이나 결과를 사주만으로 확정하지 않음'
  ],
  writerInstruction:'실제 성격이나 직업을 단정하지 말고 한 가지 가정만 설명한다. 상황: '+
   e.scene+'. 기준 조건: '+e.originalCondition+
   '. 추가 조건: '+e.additionalCondition+
   '. 첫 조건만 있을 때의 한계: '+e.whenOnlyOriginal+
   '. 추가 조건만 있을 때의 한계: '+e.whenOnlyAdditional+
   '. 출생 위치가 검증되었으므로 태어난 '+pos+
   '의 겉글자가 태어난 달의 다른 속글자와 정확히 같다는 사실을 한 문장으로 설명한다. '+
   e.traditionalDirection+
   '. 이 관계는 상징 해석이며 실제 결과의 예언이 아니다.'
 };
}
module.exports={CATALOG,forContrast};
