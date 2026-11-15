'use strict';
// Separate from exact month-hidden exposure. The visible-year/hour stem is
// a distinct, independently calculated classification, NEVER exposure.
// All claims and refs are server-owned, never customer-quality approved.
function build(source,topic){
 const chosen=topic?.sourceQualifiedWritingDecision;
 const c=topic?.paidCoreDepthV2?.readerAlternative;
 if(chosen?.selectedScope!=='verified-separate-visible-role')return null;
 if(topic?.paidCoreDepthV2?.readerContrast||
    topic?.paidCoreDepthV2?.readerClassicalScope||!c)return null;
 const scene=require('./report-paid-core-v2-visible-alternative-scene')
  .forAlternative(c,source);
 if(!scene)return null; // No verified, distinct scene: keep original path.
 const required=chosen.requiredCitationIds,permitted=new Set(
  (topic.citableFacts||[]).map(x=>x.id));
 const IDs=c.sourceRefs;
 const graph=source['facts.stemConnections'];
 if(!Array.isArray(required)||JSON.stringify(required)!==JSON.stringify(IDs)||
   JSON.stringify(chosen.sourceRefs)!==JSON.stringify(IDs)||
   JSON.stringify(scene.sourceRefs)!==JSON.stringify(IDs)||
   chosen.approvedForSale!==false||
   !IDs.every(id=>permitted.has(id)&&Object.hasOwn(source,id))||
   graph?.exposure?.some(x=>x.position==='month'&&
    x.hiddenStem===source[c.visiblePosition]?.stem)||
   c.prioritizationVerified!==false||c.realizedDirectionEffectVerified!==false||
   scene.realPersonObservation!==false||scene.approvedForSale!==false)
  throw Error('CORE_V2_SEPARATE_VISIBLE_CONTRACT_DRIFT');
 const optional=['facts.seasonalEvidence','facts.qiEvidence']
  .filter(id=>permitted.has(id)&&Object.hasOwn(source,id));
 const evidenceRefs=[...new Set([...IDs,...optional])];
 const outline=Object.freeze({
  proof:scene.sourceExplanation,
  comparedRoles:'달의 기본 분류('+scene.originalCondition+
   ')와 출생 '+(scene.visiblePosition==='natal.year.stem'?'해':'시간')+
   '의 독립 겉글자 분류('+scene.additionalCondition+')',
  example:scene.scene,
  originalOnly:scene.whenOnlyOriginal,
  additionalOnly:scene.whenOnlyAdditional,
  direction:scene.directionMeaning,
  limitation:'이것은 달의 다른 숨은 글자가 겉으로 드러난 관계가 아니다. 실제 인생 경험이나 성과를 뜻하지 않는다.'
 });
 return {
  kind:'server-owned-first-chapter-separate-visible-contract-v1',
  scope:'separate-visible-role-without-month-hidden-exposure',
  onlyFor:'saju_core/temperament',modelRole:'Korean-prose-rendering-only',
  sceneId:scene.sceneId,sourcePosition:scene.visiblePosition,
  verifiedSourceIds:IDs.slice(),evidenceRefs,outline,
  textContract:'서버에서 확인한 겉글자와 달의 대표 속글자 차이만 자연스러운 한국어로 설명한다. 별도 겉글자를 달 속글자의 정확한 노출로 잘못 서술하지 않는다. 가상의 한 상황에서 두 조건이 각각 없을 때 발생할 수 있는 다른 한계를 설명한다. 계산 근거 외의 실제 개인 성향·이력·미래 결과를 만들지 않는다. 설명할 수 없으면 temperament를 null로 둔다.',
  humanEditorialApproval:false,releaseVerdict:'not-approved'
 };
}
module.exports={build};
