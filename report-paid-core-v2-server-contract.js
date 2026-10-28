'use strict';
// The server, not the model, owns evidence IDs and the facts/conditions
// the optional first-chapter prose is permitted to express.
// Thirteen explicitly enumerated source-qualified role and direction categories.
// All other charts take existing V2 path. No generalized personality inference.
// TEST/PREVIEW ONLY; no customer release or paid-model approval.
const SCENES=Object.freeze({
 'maintained-equipment-two-missing-conditions':Object.freeze({
  position:'natal.hour.stem',mainRole:'정관',otherRole:'정재',
  direction:'right-generates-left',
  comparedRoles:'달의 대표 속글자(승인 기준·책임)와 시간에 나타난 다른 속글자(운영 비용·담당 시간)',
  traditionalDirection:'운영 자원에 해당하는 분류가 역할·승인 기준에 해당하는 분류를 돕는 전통적 오행 방향'
 }),
 'community-notice-materials-two-missing-conditions':Object.freeze({
  position:'natal.year.stem',mainRole:'비견',otherRole:'식신',
  direction:'left-generates-right',
  comparedRoles:'달의 대표 속글자(맡을 책임과 역할 범위)와 해에 나타난 다른 속글자(실제 결과물 제작·완성 과정)',
  traditionalDirection:'책임 범위에 해당하는 기본 분류가 결과물 완성에 해당하는 추가 분류를 생하는 전통적 오행 방향'
 }),
 ...Object.fromEntries(Object.values(
  require('./report-paid-core-v2-reviewed-scene-catalog').CATALOG
 ).map(e=>[e.sceneId,Object.freeze({
  position:e.position,mainRole:e.mainRole,otherRole:e.otherRole,
  direction:e.direction,comparedRoles:e.comparedRoles,
  traditionalDirection:e.traditionalDirection
 })])),
 ...Object.fromEntries(Object.values(
  require('./report-paid-core-v2-expanded-scene-catalog').CATALOG
 ).map(e=>[e.sceneId,Object.freeze({
  positions:e.positions,mainRole:e.mainRole,otherRole:e.otherRole,
  direction:e.direction,comparedRoles:e.comparedRoles,
  traditionalDirection:e.traditionalDirection
 })]))
});
function build(source,topic){
 const choice=topic?.sourceQualifiedWritingDecision,scene=choice?.readerScene;
 const contrast=topic?.paidCoreDepthV2?.readerContrast;
 if(choice?.selectedScope!=='verified-month-hidden-exposure'||!scene)
  return null;
 const spec=SCENES[scene.sceneId];
 if(!spec||
    scene.kind!=='v2-verified-classifications-conditional-editorial-scene-v1'||
    scene.approvedForSale!==false||scene.realPersonObservation!==false||
    scene.traditionOnly!==true||contrast?.approvedForSale!==false||
    contrast?.visiblePositionRelationVerified!==true||
    contrast?.realizedDirectionEffectVerified!==false||
    contrast?.prioritizationVerified!==false||
    !(spec.position===contrast?.visiblePosition||
      spec.positions?.includes(contrast?.visiblePosition))||
    contrast?.mainRole!==spec.mainRole||
    contrast?.otherRole!==spec.otherRole||
    contrast?.monthMainToExposedElementDirection!==spec.direction||
    choice.approvedForSale!==false||!choice.readerFactAnchor)
  throw Error('CORE_V2_SERVER_CONTRACT_UNVERIFIED_SCENE');
 // Compare entire text/conditions with the source-derived canonical scene,
 // not only the role labels. A forged story would be invalid even with
 // otherwise correct IDs and symbolic direction.
 const originalScene=require('./report-paid-core-v2-grounded-scene')
  .forContrast(contrast,source);
 if(!originalScene||JSON.stringify(originalScene)!==JSON.stringify(scene))
  throw Error('CORE_V2_SERVER_CONTRACT_SCENE_DRIFT');
 const ids=choice.requiredCitationIds;
 const expected=contrast.sourceRefs;
 const main=source[contrast.mainMonthId],hidden=source[contrast.extraHiddenId],
  exposed=source[contrast.visiblePosition];
 if(!Array.isArray(ids)||JSON.stringify(ids)!==JSON.stringify(expected)||
    JSON.stringify(ids)!==JSON.stringify(scene.sourceRefs)||
    ids.length!==5||main?.tenGod!==spec.mainRole||
    hidden?.tenGod!==spec.otherRole||exposed?.tenGod!==spec.otherRole||
    hidden.stem!==exposed.stem||main.stem===hidden.stem||
    scene.rolePair?.join('/')!==[spec.mainRole,spec.otherRole].join('/')||
    !ids.every(id=>Object.hasOwn(source,id)&&
      topic.citableFacts.some(f=>f.id===id)))
  throw Error('CORE_V2_SERVER_CONTRACT_FACT_OR_REFERENCE_DRIFT');
 const seasonal=(topic.requiredSourceKinds||[]).includes('seasonal')?
  ['facts.seasonalEvidence']:[];
 const qi=(topic.requiredSourceKinds||[]).includes('qi-ledger')?
  ['facts.qiEvidence']:[];
 const serverRefs=[...new Set([...ids,...seasonal,...qi])];
 if(!serverRefs.every(id=>Object.hasOwn(source,id)&&
    topic.citableFacts.some(f=>f.id===id)))
  throw Error('CORE_V2_SERVER_CONTRACT_REQUIRED_SOURCE_UNAVAILABLE');
 const location=contrast.visiblePosition==='natal.year.stem'?'해':'시간';
 const outline=Object.freeze({
  proof:'태어난 '+location+'의 겉글자는 태어난 달의 다른 속글자와 정확히 일치한다',
  comparedRoles:spec.comparedRoles,
  example:scene.scene,
  originalOnly:scene.whenOnlyOriginal,
  additionalOnly:scene.whenOnlyAdditional,
  direction:spec.traditionalDirection,
  limitation:'어느 조건이 현실에서 우선할지, 실제 성격·직업 능력·성과는 계산만으로 결정되지 않는다'
 });
 return {
  kind:'server-owned-first-chapter-evidence-and-claim-contract-v1',
  scope:'verified-'+location+'-visible-from-month-hidden',
  onlyFor:'saju_core/temperament',modelRole:'Korean-prose-rendering-only',
  evidenceRefs:serverRefs,
  sourcePosition:contrast.visiblePosition,
  verifiedSourceIds:ids.slice(),
  outline,
  textContract:'아래 7개의 확정된 계산·가정 명제를 독자가 이해할 만한 자연스러운 한 문단으로 풀어 써라. 핵심 출처·관계·예시의 양쪽 누락 조건을 선택하거나 바꾸지 말고, 실제 있었던 사건이나 성격으로 만들지 마라. 다른 근거를 선택해 새 성격을 추론하지 마라. 한 번에 설명할 수 없으면 문단을 null로 둔다.',
  humanEditorialApproval:false,releaseVerdict:'not-approved'
 };
}
module.exports={build,SCENES};
