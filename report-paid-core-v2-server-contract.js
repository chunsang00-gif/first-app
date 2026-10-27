'use strict';
// The server, not the model, owns evidence IDs and the facts/conditions
// the optional first-chapter prose is permitted to express.
// One VERIFIABLE chart category only. Other charts take existing V2 path.
// TEST/PREVIEW ONLY; no customer release or paid-model approval.
function build(source,topic){
 const choice=topic?.sourceQualifiedWritingDecision,scene=choice?.readerScene;
 const contrast=topic?.paidCoreDepthV2?.readerContrast;
 if(choice?.selectedScope!=='verified-month-hidden-exposure'||!scene)
  return null;
 if(scene.kind!=='v2-verified-classifications-conditional-editorial-scene-v1'||
    scene.approvedForSale!==false||scene.realPersonObservation!==false||
    scene.traditionOnly!==true||contrast?.approvedForSale!==false||
    contrast?.visiblePositionRelationVerified!==true||
    contrast?.realizedDirectionEffectVerified!==false||
    contrast?.visiblePosition!=='natal.hour.stem'||
    contrast.monthMainToExposedElementDirection!=='right-generates-left'||
    choice.approvedForSale!==false||!choice.readerFactAnchor)
  throw Error('CORE_V2_SERVER_CONTRACT_UNVERIFIED_SCENE');
 const ids=choice.requiredCitationIds;
 const expected=contrast.sourceRefs;
 const main=source[contrast.mainMonthId],hidden=source[contrast.extraHiddenId],
  exposed=source[contrast.visiblePosition];
 if(!Array.isArray(ids)||JSON.stringify(ids)!==JSON.stringify(expected)||
    JSON.stringify(ids)!==JSON.stringify(scene.sourceRefs)||
    ids.length!==5||main?.tenGod!=='정관'||hidden?.tenGod!=='정재'||
    exposed?.tenGod!=='정재'||hidden.stem!==exposed.stem||
    main.stem===hidden.stem||scene.rolePair?.join('/')!=='정관/정재'||
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
 const outline=Object.freeze({
  proof:'태어난 시간의 겉글자는 태어난 달의 다른 속글자와 정확히 일치한다',
  comparedRoles:'달의 대표 속글자(승인 기준·책임)와 시간에 나타난 다른 속글자(운영 비용·담당 시간)',
  example:scene.scene,
  originalOnly:scene.whenOnlyOriginal,
  additionalOnly:scene.whenOnlyAdditional,
  direction:'운영 자원에 해당하는 분류가 역할·승인 기준에 해당하는 분류를 돕는 전통적 오행 방향',
  limitation:'어느 조건이 현실에서 우선할지, 실제 성격·직업 능력·성과는 계산만으로 결정되지 않는다'
 });
 return {
  kind:'server-owned-first-chapter-evidence-and-claim-contract-v1',
  scope:'verified-hour-visible-from-month-hidden',
  onlyFor:'saju_core/temperament',modelRole:'Korean-prose-rendering-only',
  evidenceRefs:serverRefs,
  sourcePosition:contrast.visiblePosition,
  verifiedSourceIds:ids.slice(),
  outline,
  textContract:'아래 7개의 확정된 계산·가정 명제를 독자가 이해할 만한 자연스러운 한 문단으로 풀어 써라. 핵심 출처·관계·예시의 양쪽 누락 조건을 선택하거나 바꾸지 말고, 실제 있었던 사건이나 성격으로 만들지 마라. 다른 근거를 선택해 새 성격을 추론하지 마라. 한 번에 설명할 수 없으면 문단을 null로 둔다.',
  humanEditorialApproval:false,releaseVerdict:'not-approved'
 };
}
module.exports={build};
