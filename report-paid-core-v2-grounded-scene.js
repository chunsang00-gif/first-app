'use strict';
// A narrowly verified EDITORIAL SCENE, not an observed event, personality
// inference or a commercial approval. Deliberately sparse: other
// classification pairs must not borrow this story.
function forContrast(contrast,source){
 if(!contrast||!source||contrast.visiblePositionRelationVerified!==true||
    contrast.realizedDirectionEffectVerified!==false||
    contrast.prioritizationVerified!==false||
    contrast.approvedForSale!==false)return null;
 const {mainMonthId,extraHiddenId,visiblePosition,sourceRefs}=contrast;
 const main=source[mainMonthId],hidden=source[extraHiddenId],
  visible=source[visiblePosition];
 if(!Array.isArray(sourceRefs)||!sourceRefs.includes(mainMonthId)||
    !sourceRefs.includes(extraHiddenId)||
    !sourceRefs.includes(visiblePosition)||
    !sourceRefs.includes('facts.stemConnections')||
    hidden?.stem!==visible?.stem||
    hidden?.tenGod!==visible?.tenGod||
    main?.tenGod!==contrast.mainRole||
    hidden?.tenGod!==contrast.otherRole)
  throw Error('CORE_V2_EDITORIAL_SCENE_SOURCE_MISMATCH');
 // 정관 (roles and authorization) / 정재 (recurrent inputs).
 // Verified direction: the additional fire symbol generates earth.
 // A causal *real-world* effect does not follow from the element relation.
 if(contrast.mainRole!=='정관'||contrast.otherRole!=='정재'||
    contrast.monthMainToExposedElementDirection!=='right-generates-left'||
    visiblePosition!=='natal.hour.stem')return null;
 return {
  kind:'v2-verified-classifications-conditional-editorial-scene-v1',
  sceneId:'maintained-equipment-two-missing-conditions',
  rolePair:['정관','정재'],
  traditionOnly:true,realPersonObservation:false,
  priorityDetermined:false,approvedForSale:false,
  sourceRefs:sourceRefs.slice(),
  scene:'공용 장비 한 대를 도입해 여섯 달 동안 운영하는 가정',
  openingQuestion:'고장이 발견되면 누가 가동을 멈출 권한을 갖고, 정기 점검에 드는 돈과 시간을 누가 마련할까?',
  originalCondition:'중단·수리 승인 기준과 담당 권한이 정해진 상태',
  additionalCondition:'매달 교체 부품비와 점검 담당 시간이 마련된 상태',
  whenOnlyOriginal:'중단 기준은 명확해도 교체 부품비와 점검 시간이 없으면 제때 수리하기 어렵다',
  whenOnlyAdditional:'부품비와 담당 시간이 있어도 중단 승인 권한이 불명확하면 결함 발견 후 조치가 늦어질 수 있다',
  directionLimit:'새로 드러난 분류가 기존 분류를 생하는 전통적 방향으로 계산되지만 어느 쪽이 우선인지, 실제 사고나 성과가 생기는지는 알 수 없다',
  readerSequence:[
   '한 문장에서 태어난 달의 다른 속글자와 출생시간의 겉글자가 정확히 같은 계산 관계를 명시',
   '위 가정의 장비 운영 장면을 한 가지 사례로 제시',
   '승인 기준만 준비한 경우와 정기 자원만 준비한 경우에 각각 무엇이 빠지는지 대조',
   '도움이 되는 계산 방향은 전통 분류의 상징에만 적용하고 실제 적성·경험을 확정하지 않음'
  ],
  // Write the model instruction as specific actions, not as a copied
  // reader manuscript. Do not force claims when the required premise fails.
  writerInstruction:'다음은 관찰된 고객 이력이 아닌 한 가지 가상 사례다. 장면: 공용 장비 한 대를 여섯 달 동안 운영. 먼저 고장이 나면 누가 멈출지(승인 기준)와 매달 누가 부품비·점검 시간을 확보할지(운영 자원)를 질문한다. 승인 권한만 있고 정비 예산·시간이 없다면 수리가 늦어지는 조건, 예산·시간만 있고 중단 승인권이 없다면 결함 발견 후 대응이 늦어지는 조건을 각각 별도 문장으로 설명한다. 두 조건을 모두 고려하라는 공허한 결론 대신, 무엇이 누락될 때 어떤 결정이 지연되는지를 구별한다. 신규 시간 출처가 출생월의 다른 숨은 글자와 실제로 대응한다는 근거를 먼저 밝힌다. 비교할 전통 기운의 방향은 추가 분류가 기본 분류를 생하는 관계이지만, 현실에서 실제로 그런 효과가 발생하거나 이 사람이 장비를 운영한다는 주장은 절대 하지 않는다. 가정의 예시를 관찰된 성격·직업으로 쓰지 않는다.'
 };
}
module.exports={forContrast};
