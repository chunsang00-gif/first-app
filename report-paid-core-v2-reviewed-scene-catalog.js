'use strict';
// Explicit, narrow traditional-symbol comparisons. A business/household
// scene is a hypothetical reader illustration, never a fact about a person.
// No scenario may be promoted solely from matching a ten-god label;
// the caller must also check exact month-hidden exposure and stem direction.
const ENTRIES=Object.freeze([
 {
  sceneId:'archive-label-review-vs-delivery',
  position:'natal.year.stem',mainRole:'편인',otherRole:'식신',
  direction:'left-controls-right',
  comparedRoles:'달의 대표 속글자(낯선 자료의 해석·검토)와 해에 드러난 다른 속글자(완성된 안내물 제작)',
  traditionalDirection:'자료를 해석하는 기본 분류가 결과물을 만드는 추가 분류를 제약하는 전통적 방향',
  scene:'지역 자료관에서 전시 안내문 20장을 만드는 가정',
  openingQuestion:'낯선 기록의 사실관계를 누가 확인하고 안내문을 몇 장 언제 완성할까?',
  originalCondition:'안내문에 담을 원문 자료를 교차 확인하고 사용 범위를 정한 상태',
  additionalCondition:'안내문 문구 편집·출력 수량과 납품 시간이 정해진 상태',
  whenOnlyOriginal:'자료의 출처를 확인했어도 안내문 편집과 출력 일정을 잡지 않으면 전시일까지 안내문을 완성하지 못할 수 있다',
  whenOnlyAdditional:'출력부터 진행하고 자료의 출처와 사용 범위를 확인하지 않으면 문구를 수정하거나 다시 인쇄해야 할 수 있다',
  directionLimit:'검토 분류가 표현 분류를 제약하는 오행 관계일 뿐 실제 검토 습관이나 제작 실력은 알 수 없다'
 },
 {
  sceneId:'after-school-materials-vs-support',
  position:'natal.hour.stem',mainRole:'정인',otherRole:'편재',
  direction:'right-controls-left',
  comparedRoles:'달의 대표 속글자(배움·안내·지원)와 시간에 드러난 다른 속글자(여러 경로의 준비물 확보)',
  traditionalDirection:'추가 자원 분류가 기존 배움·지원 분류를 제약하는 전통적 방향',
  scene:'방과 후 만들기 수업에 필요한 재료를 여러 공급처에서 준비하는 가정',
  openingQuestion:'수업 진행 방법을 누가 안내하고 공급처에서 필요한 재료를 언제 받을까?',
  originalCondition:'수업의 진행 방법과 참여자에게 필요한 안내가 준비된 상태',
  additionalCondition:'복수의 공급처에서 필요한 재료의 수량과 전달 일정이 확보된 상태',
  whenOnlyOriginal:'수업 안내를 준비했어도 재료의 수량이나 도착 일정이 확보되지 않으면 정해진 활동을 시작하기 어렵다',
  whenOnlyAdditional:'재료가 제때 도착해도 사용할 순서와 안전 안내가 없다면 참여자에게 활동을 제대로 설명하기 어렵다',
  directionLimit:'새 자원 분류가 배움·지원 분류를 제약하는 오행 관계일 뿐 실제 학습 능력이나 자금력이 확인된 것은 아니다'
 },
 {
  sceneId:'shared-inspection-rule-vs-training',
  position:'natal.hour.stem',mainRole:'정관',otherRole:'정인',
  direction:'left-generates-right',
  comparedRoles:'달의 대표 속글자(승인 절차·역할)와 시간에 드러난 다른 속글자(교육·지원 자료)',
  traditionalDirection:'기본 승인·역할 분류가 추가 교육·지원 분류를 생하는 전통적 방향',
  scene:'공용 장비의 주간 점검 절차를 새 담당자에게 인계하는 가정',
  openingQuestion:'점검 결과의 최종 승인 권한은 누구에게 있고 새 담당자가 참고할 설명서는 준비됐을까?',
  originalCondition:'고장 보고와 점검 완료 승인 담당이 정해진 상태',
  additionalCondition:'새 담당자가 작업 순서를 익힐 안내와 교육 시간이 제공된 상태',
  whenOnlyOriginal:'승인 담당을 정했어도 점검 순서와 교육 시간이 없다면 새 담당자가 필요한 점검을 빠뜨릴 수 있다',
  whenOnlyAdditional:'점검 방법을 배워도 어떤 상황에서 누구의 승인을 받아야 하는지 불명확하면 장비를 재가동할 결정을 내리기 어렵다',
  directionLimit:'승인·역할 분류가 교육·지원 분류를 생하는 상징적 방향일 뿐 실제 현장 업무 능력이나 사고를 예측하지 않는다'
 }
].map(e=>Object.freeze(e)));
const CATALOG=Object.freeze(Object.fromEntries(ENTRIES.map(e=>[e.sceneId,e])));
function forContrast(c){
 if(!c||c.visiblePositionRelationVerified!==true||
    c.realizedDirectionEffectVerified!==false||
    c.prioritizationVerified!==false||
    c.approvedForSale!==false)return null;
 const e=ENTRIES.find(x=>x.position===c.visiblePosition&&
  x.mainRole===c.mainRole&&x.otherRole===c.otherRole&&
  x.direction===c.monthMainToExposedElementDirection);
 if(!e)return null;
 const location=e.position==='natal.hour.stem'?'시간':'해';
 return {
  kind:'v2-verified-classifications-conditional-editorial-scene-v1',
  sceneId:e.sceneId,rolePair:[e.mainRole,e.otherRole],
  traditionOnly:true,realPersonObservation:false,
  priorityDetermined:false,approvedForSale:false,
  sourceRefs:c.sourceRefs.slice(),
  scene:e.scene,openingQuestion:e.openingQuestion,
  originalCondition:e.originalCondition,
  additionalCondition:e.additionalCondition,
  whenOnlyOriginal:e.whenOnlyOriginal,
  whenOnlyAdditional:e.whenOnlyAdditional,
  directionLimit:e.directionLimit,
  readerSequence:[
   '태어난 '+location+'의 겉글자가 태어난 달의 다른 숨은 글자와 정확히 같다는 계산 출처를 먼저 밝힘',
   '서로 다른 역할을 가상 상황 한 가지로 비교하고 담당 조건을 분리',
   '기본 조건만 있는 경우와 추가 조건만 있는 경우에 발생할 수 있는 서로 다른 누락을 설명',
   '실제 삶·직업·성향 관찰이나 미래 결과를 사주만으로 추정하지 않음'
  ],
  writerInstruction:'고객의 실제 경험을 지어내지 말고 한 가지 가상 사례를 독자에게 쉽게 풀어 쓴다. 장면: '+e.scene+
   '. 확인 질문: '+e.openingQuestion+'. 기본 조건: '+e.originalCondition+
   '. 추가 조건: '+e.additionalCondition+
   '. 기본 조건만 있을 때의 차이: '+e.whenOnlyOriginal+
   '. 추가 조건만 있을 때의 차이: '+e.whenOnlyAdditional+
   '. 먼저 태어난 '+location+'의 겉글자가 태어난 달의 다른 속글자와 정확히 같다는 실제 계산 근거를 밝힌다. 전통 분류 사이의 기운 방향: '+e.traditionalDirection+
   '. 이 방향은 실제 선택의 성패, 성격, 능력이나 직업 경험을 입증하지 않는다. 명식에 없는 사실은 쓰지 않는다.'
 };
}
module.exports={CATALOG,forContrast};
