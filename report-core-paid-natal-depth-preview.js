'use strict';
// Explicit QA-ONLY first-chapter natal-depth provider candidate.
// Not part of live paid generation. Only after editorial/professional review
// can a separate decision enable this topic for paying users.
const guidance=require('./report-analysis-guidance');
const core=require('./report-core-knowledge-engine');
const rows=require('./report-fact-bindings');
const sources=require('./report-generation-request');
const TOPIC='natal_depth';
const PROHIBITED=/^(?:annual\.|person\.|fortune\.)/;
function prepare(packet){
 if(packet?.status!=='ready'||!packet?.chart?.hour)return null;
 const candidate=core.compile(packet);
 if(candidate.status!=='draft-for-human-review'||candidate.releaseVerdict!=='not-approved')
  return null;
 const selected=candidate.review?.fourPillar||candidate.review?.chartSynthesis;
 if(!selected)return null;
 const ids=selected.sourceRefs;
 if(!Array.isArray(ids)||!ids.includes('natal.year.stem')||
  !ids.includes('natal.month.stem')||!ids.includes('natal.hour.stem')||
  !ids.includes('natal.day.stem')||
  !ids.includes('facts.stemConnections')||
  ids.some(id=>typeof id!=='string'||PROHIBITED.test(id))||
  ids.length!==new Set(ids).size)
  throw Error('QA_NATAL_DEPTH_INVALID_PROVENANCE');
 // Actual source rows exist in the canonical paid source ledger, not
 // merely the offline graph. Lack of a row is a hard fail.
 const b=Object.fromEntries(rows.build(packet).map(x=>[x.id,x]));
 for(const id of ids.filter(x=>x.startsWith('natal.')))
  if(!b[id])throw Error('QA_NATAL_DEPTH_NONEXISTENT_ROW:'+id);
 const blue=guidance.preflight(packet);
 const planned=blue.saju_core;
 if(!planned||planned.topicTasks.natal_depth||
    planned.topicTasks.strength?.mode!=='use-primary')
  throw Error('QA_NATAL_DEPTH_CORRUPTED_CORE_PLAN');
 const modelPlan=structuredClone(planned);
 modelPlan.topicTasks[TOPIC]={
  question:'기본 출생월 풀이와 중복하지 않으면서 출생 해·날·시간의 독립된 계산 근거로 어떤 조건부 차이만 더 설명할 수 있는가?',
  primaryEvidencePath:'facts.stemConnections',
  mode:'use-primary',verifiedFallbackPaths:[],allowedSourceRefs:ids.slice(),
  requiredSourceKinds:['natal','stem-linkage'],
  interpretationBoundary:'독립 심화 검토용 문단이다. 직접 인용 가능한 원국의 해·달·날·시간 위치를 비교한다. 기존 strength의 월간·월지 풀이를 반복하지 않는다. 동일 오행 숨은 글자나 충·형·해·합 관계의 존재만으로 강약·실제 행동·충돌·합화·사건을 단정하지 않는다. 새로운 판단이 근거로 구별되지 않으면 null로 반환한다.'
 };
 modelPlan.activeTopicKeys=[...modelPlan.activeTopicKeys,TOPIC];
 const prompt={stage:'body',facts:packet,requestedSections:['saju_core'],
  qaNatalDepthPreview:true,analysisGuidance:{
   ...guidance.forRequest(['saju_core'],packet.person?.mbti),
   editorialBlueprint:{saju_core:modelPlan}}};
 const payload=sources.compile(prompt);
 const topic=payload.task.chapters.saju_core.topics[TOPIC];
 if(!topic||topic.mode!=='use-primary'||
    JSON.stringify(topic.citableFacts.map(x=>x.id))!==JSON.stringify(ids)||
    JSON.stringify(Object.keys(payload.source).sort())!==
    JSON.stringify([...new Set(Object.values(payload.task.chapters.saju_core.topics)
     .flatMap(x=>x.citableFacts.map(v=>v.id)))].sort()))
  throw Error('QA_NATAL_DEPTH_PROVIDER_SOURCE_SCOPE_DIVERGED');
 if(topic.citableFacts.some(x=>PROHIBITED.test(x.id)))
  throw Error('QA_NATAL_DEPTH_PERSONAL_OR_FUTURE_SOURCE');
 return {prompt,payload,previewTopic:TOPIC,offlineRuleId:candidate.ruleId,
  reviewKind:candidate.review.fourPillar?'human-authored-candidate':'machine-composed-review',
  releaseVerdict:'not-approved',paidApiCalls:0};
}
module.exports={prepare,TOPIC};
