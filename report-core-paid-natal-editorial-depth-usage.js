'use strict';
// OFFLINE QA editorial evidence-usage probe. Advisory only: lexical checks
// cannot certify classical Saju validity or human value and must NEVER
// authorize customer release or reject a production report.
const STEM_REFS=['year','month','day','hour'];
// Day stem provides the reference frame for other roles, not a separate
// observed personality trait that must be forced into customer prose.
const DETAIL_REQUIRED=['year','hour'];
const CALCULATION_ANCHORS=['day'];
const POSITION_MENTIONS={
 year:/(?:태어난\s*해|출생\s*해|해의\s*계산|해에서\s*읽는)/,
 month:/(?:태어난\s*달|출생\s*달|달의\s*(?:안쪽|윗글자|기준)|달과\s*(?:시간|날))/,
 day:/(?:태어난\s*날|출생\s*날|날의\s*기준|날과\s*시간|달과\s*날)/,
 hour:/(?:태어난\s*시간|출생\s*시간|시간의\s*(?:윗글자|안쪽|계산된\s*뜻)|시간에\s*놓인)/
};
const EXPLANATION=/(?:뜻|기준|분류|글자|계산|관계|해석|다른\s*근거)/;
function assess(response,prompt){
 if(prompt?.qaNatalDepthPreview!==true||
    JSON.stringify(prompt.requestedSections)!=='["saju_core"]')
  throw Error('QA_EDITORIAL_USAGE_REQUIRES_ISOLATED_DEPTH');
 const topics=response?.chapters?.saju_core?.paragraphs;
 const depth=topics?.natal_depth;
 if(!depth||typeof depth.text!=='string'||!Array.isArray(depth.basis?.refs))
  throw Error('QA_EDITORIAL_USAGE_REQUIRES_COMPLETED_DEPTH');
 const basis=new Set(depth.basis.refs);
 // A citation ID can look correct even when the reader never discusses it.
 // Month meaning already has its own required strength paragraph; the added
 // depth still needs independently visible year/day/hour reasoning.
 const sentences=depth.text.split(/[.!?。！？\n]+/)
  .map(s=>s.replace(/\s+/g,' ').trim()).filter(Boolean);
 const readerPositions=Object.fromEntries(STEM_REFS.map(position=>{
  const statementCount=sentences.filter(sentence=>
   sentence.length>=28&&POSITION_MENTIONS[position].test(sentence)&&
   EXPLANATION.test(sentence)).length;
  return [position,{cited:basis.has('natal.'+position+'.stem'),
   explanatorySentenceCount:statementCount,usedInReader:statementCount>0}];
 }));
 const missingDepthPositions=DETAIL_REQUIRED.filter(position=>
  !readerPositions[position].cited||!readerPositions[position].usedInReader);
 const citedButUnexplained=STEM_REFS.filter(position=>
  readerPositions[position].cited&&!readerPositions[position].usedInReader);
 const anchorOnlyCitations=CALCULATION_ANCHORS.filter(position=>
  readerPositions[position].cited&&!readerPositions[position].usedInReader);
 const body=depth.text.replace(/\s+/g,' ').trim();
 // Readability cues are advisory, never evidence of commercial quality.
 const situation=/(?:예를\s*들어|가정해\s*보|가정합니다|가정해\s*보겠습니다|상황을\s*가정)/.test(body);
 const concreteSetting=/(?:업무|작업\s*절차|협력처|행사|매장|공급처|거래처|회의|예약|계약|이사|학교)/.test(body);
 const alternatives=/(?:반면|반대로|하지만|그렇지만|기존\s*방식만|새\s*방법만)/.test(body);
 const conditionalDownside=/(?:경우|때는|때에는|[가-힣]+면)/.test(body)&&
  /(?:놓칠|놓치기|빠뜨릴|흔들릴|어려워질|소홀히|불리|위험|손해)/.test(body);
 const concreteChoice=situation&&concreteSetting&&alternatives&&conditionalDownside;
 const editorialWarnings=[
  ...(!situation?['hypothetical-situation-not-explicit']:[]),
  ...(!concreteSetting?['concrete-setting-not-obvious']:[]),
  ...(!alternatives?['contrasting-options-not-visible']:[]),
  ...(!conditionalDownside?['condition-and-downside-not-visible']:[])
 ];
 const depthEvidenceUsed=missingDepthPositions.length===0;
 return {
  kind:'qa-natal-depth-visible-source-use-audit-v1',
  status:depthEvidenceUsed?'visible-position-mentions-present-human-review-required':
   'cited-position-not-explained-in-depth-text',
  readerPositions,missingDepthPositions,citedButUnexplained,
  anchorOnlyCitations,calculationAnchorIsNotPersonalityEvidence:true,
  scenarioReview:{situation,concreteSetting,alternatives,
   conditionalDownside,concreteChoice,editorialWarnings},
  monthHasIndependentCoreSlot:typeof topics.strength?.text==='string',
  visiblePositionCoverageOnly:true,semanticClaimVerified:false,
  traditionalMethodApproved:false,paidReaderValueValidated:false,
  customerReleaseApproved:false,providerCalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={assess};
