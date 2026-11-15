'use strict';
// A differently visible stem is NOT a month-hidden exposure. These
// hypothetical scenes answer one narrow symbolic comparison only, not
// observed employment/wealth/personality facts or release approval.
const CASES=Object.freeze([
 Object.freeze({
  id:'fixed-supply-vs-output-year',
  position:'natal.year.stem',main:'정재',other:'식신',direction:'right-generates-left',
  original:'매달 필요한 유지비와 준비할 물량',additional:'작업을 완성하는 순서와 검수 시간',
  scene:'동네 행사에서 배부할 재활용 봉투 50장을 포장하는 가정',
  originalOnly:'월별 봉투 확보 예산이 있어도 포장 인력과 검수 시간이 없으면 배부 일정에 맞춰 완성하기 어렵다',
  additionalOnly:'포장 순서와 검수 담당을 정해도 실제 봉투를 마련할 예산과 납품 일정이 없으면 일을 시작하지 못할 수 있다',
  directionMeaning:'완성 과정의 분류가 반복적으로 필요한 자원 분류를 생하는 전통적 방향'
 }),
 Object.freeze({
  id:'suppliers-vs-explanation-hour',
  position:'natal.hour.stem',main:'편재',other:'정인',direction:'left-controls-right',
  original:'여러 공급처와 실제 재료 확보',additional:'활동 방법을 익히고 설명할 안내',
  scene:'방과 후 만들기 수업의 재료와 안내지를 준비하는 가정',
  originalOnly:'재료를 여러 곳에서 확보해도 학생들에게 사용 방법을 설명할 안내가 없으면 수업 진행이 늦어질 수 있다',
  additionalOnly:'안내지를 완성해도 실제 재료의 납품처와 수량이 정해지지 않으면 수업을 열기 어렵다',
  directionMeaning:'기본 자원 분류가 추가 배움·지원 분류를 제약하는 전통적 방향'
 }),
 Object.freeze({
  id:'shared-resources-vs-personal-duties-year',
  position:'natal.year.stem',main:'겁재',other:'비견',direction:'same-element',
  original:'모두 함께 쓰는 물품의 사용 순서',additional:'각자 책임지는 업무와 마감 시간',
  scene:'공동작업실에서 책상 세 개를 나누어 쓰며 안내물 제작을 맡기는 가정',
  originalOnly:'책상 사용 순서를 정해도 안내물 제작을 누가 마무리할지 정하지 않으면 마감일에 작업이 끝나지 않을 수 있다',
  additionalOnly:'담당자와 마감일을 정해도 공용 책상 사용 순서가 없으면 작업 시간에 서로 기다려야 할 수 있다',
  directionMeaning:'두 분류의 오행 성질이 같다는 계산일 뿐 실제 경쟁심이나 협업 성과를 뜻하지 않음'
 })
]);
function forAlternative(c,source){
 if(!c||c.kind!=='verified-distinct-visible-category-conditional-comparison-v1'||
   c.linkageKind!=='different-visible-role-not-exact-month-hidden-exposure'||
   c.visiblePositionRelationVerified!==true||
   c.realizedDirectionEffectVerified!==false||
   c.realizedInfluenceVerified!==false||
   c.prioritizationVerified!==false||
   c.approvedForSale!==false||
   c.observedLifeEvents!==false||
   c.visiblePosition!==c.otherVisibleId||
   !['natal.hour.stem','natal.year.stem'].includes(c.visiblePosition))
  return null;
 const row=CASES.find(x=>x.position===c.visiblePosition&&
  x.main===c.mainRole&&x.other===c.otherRole&&
  x.direction===c.monthMainToExposedElementDirection);
 if(!row)return null;
 const main=source?.[c.mainMonthId],visible=source?.[c.otherVisibleId];
 const graph=source?.['facts.stemConnections'];
 const hidden=(graph?.exposure||[]).filter(x=>x.position==='month')
  .map(x=>x.hiddenStem);
 const expected=['natal.month.stem',c.mainMonthId,c.visiblePosition,
  'facts.stemConnections'];
 if(!main||!visible||!graph||!main.stem||!visible.stem||
    main.tenGod!==row.main||visible.tenGod!==row.other||
    hidden.includes(visible.stem)||
    !Array.isArray(c.sourceRefs)||JSON.stringify(c.sourceRefs)!==JSON.stringify(expected)||
    require('./report-core-paid-natal-visible-relation-bridge')
      .direction(main.stem,visible.stem)!==row.direction)
  throw Error('CORE_V2_SEPARATE_VISIBLE_UNVERIFIED_SOURCE');
 const pos=c.visiblePosition==='natal.year.stem'?'해':'시간';
 return {
  kind:'verified-separate-visible-symbolic-scene-v1',
  sceneId:row.id,sourceRefs:expected.slice(),
  mainRole:row.main,otherRole:row.other,
  visiblePosition:c.visiblePosition,
  scene:row.scene,originalCondition:row.original,
  additionalCondition:row.additional,
  whenOnlyOriginal:row.originalOnly,
  whenOnlyAdditional:row.additionalOnly,
  directionMeaning:row.directionMeaning,
  // Important: no exact exposure; two unrelated source positions only.
  sourceExplanation:'태어난 달의 대표 속글자와 태어난 '+pos+
   '의 겉글자에 서로 다른 분류가 계산되었다. 출생월의 다른 숨은 글자가 밖으로 드러났다는 뜻은 아니다.',
  writerInstruction:'다음은 실제 개인의 경험이 아닌 가정이다: '+row.scene+
   '. 달의 기본 분류를 먼저 설명한다: '+row.original+
   '. 별도로 나타난 '+pos+'의 겉글자 분류를 설명한다: '+row.additional+
   '. 기본 조건만 있을 때: '+row.originalOnly+
   '. 추가 조건만 있을 때: '+row.additionalOnly+
   '. 계산한 오행 방향: '+row.directionMeaning+
   '. 반드시 달의 다른 숨은 글자가 밖에 드러난 사례가 아니라는 점을 분명히 밝힌다. 개인의 실제 행동과 장래를 단정하지 않는다.',
  realPersonObservation:false,approvedForSale:false
 };
}
module.exports={CASES,forAlternative};
