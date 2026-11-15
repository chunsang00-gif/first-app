'use strict';
// One stable scope rule for V2 first-chapter QA within normal paid batching.
// Only the first chapter, optionally paired with the MBTI comparison, can
// receive this OFFLINE feature. Never infer consent for a new API charge.
const first=ids=>Array.isArray(ids)&&(
 JSON.stringify(ids)==='["saju_core"]'||
 JSON.stringify(ids)==='["saju_core","mbti_contradiction"]');
function valid(prompt){
 return prompt?.stage==='body'&&first(prompt.requestedSections)&&
 prompt.qaNatalDepthPreview!==true&&prompt.qaAdditiveDepthPreview!==true&&
 !!prompt.facts?.chart?.hour;
}
function enabled(ids,stage,packet,env=process.env){
 return stage==='body'&&first(ids)&&!!packet?.chart?.hour&&
 env.PAID_CORE_DEPTH_V2==='offline-preview'&&
 env.NODE_ENV!=='production'&&env.RENDER!=='true';
}
module.exports={first,valid,enabled};
