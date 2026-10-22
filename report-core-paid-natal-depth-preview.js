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
 const ids=[...new Set([...selected.sourceRefs,'natal.day.stem'])];
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
 // QA-only: the paid sample repeated the seasonal intro and dropped its
 // mandatory qi citation. Suppress this OPTIONAL subtopic rather than
 // weakening qi evidence requirements or silently inventing missing refs.
 // The ordinary/production core plan remains untouched.
 modelPlan.topicTasks.temperament={
  ...modelPlan.topicTasks.temperament,mode:'state-limits',
  primaryEvidencePath:null,verifiedFallbackPaths:[],
  allowedSourceRefs:[],requiredSourceKinds:[],
  interpretationBoundary:'이 QA의 심화 문단 검증에서만 생략한다. 기존 유료 앱의 기질 문단은 변경하지 않는다.'
 };
 modelPlan.activeTopicKeys=modelPlan.activeTopicKeys.filter(x=>x!=='temperament');
 modelPlan.topicTasks[TOPIC]={
  question:'기본 출생월 풀이와 중복하지 않으면서 출생 해·날·시간의 독립된 계산 근거로 어떤 조건부 차이만 더 설명할 수 있는가?',
  primaryEvidencePath:'facts.stemConnections',
  mode:'use-primary',verifiedFallbackPaths:[],allowedSourceRefs:ids.slice(),
  requiredSourceKinds:['natal','stem-linkage'],
  interpretationBoundary:'QA 전용 심화 검토 문단이다. 검증된 출생 해·날·시간의 서로 다른 분류를 출처별로 구별한다. 독자에게는 한 가지 가상의 구체적인 선택 상황에서 (1) 어느 출처의 뜻이 어떤 선택에 연결되는지 (2) 그 선택이 유리하게 해석되는 조건과 놓치기 쉬운 조건이 무엇인지 근거와 함께 설명한다. 단순 상징 풀이·계산 위치 소개·일반적인 준비 조언을 새로운 통찰처럼 판매하지 않는다. 기존 strength와 temperament의 결론을 다시 쓰지 않는다. 강약·실제 성격·능력·충돌·합화·사건은 관찰하거나 확정하지 않았다. 이 QA의 사전 선별된 독립 근거가 독자용 차이로 이어지는지 실제 원고로 검증한다. 근거를 설명할 수 없다면 그럴듯한 문장으로 대체하지 말고 사후 QA에서 실패 처리한다.'
 };
 modelPlan.activeTopicKeys=[...modelPlan.activeTopicKeys,TOPIC];
 const prompt={stage:'body',facts:packet,requestedSections:['saju_core'],
  qaNatalDepthPreview:true,
  editorialTask:'검증된 출생월 풀이를 유지하고 별도 출생 해·날·시간의 전통 분류를 출처별로 구별해 설명하는 사전 심화 검증 원고만 작성한다.',
  rules:{},
  analysisGuidance:{
   ...guidance.forRequest(['saju_core'],packet.person?.mbti),
   editorialBlueprint:{saju_core:modelPlan}}};
 const payload=sources.compile(prompt);
 const topic=payload.task.chapters.saju_core.topics[TOPIC];
 if(!topic||topic.mode!=='use-primary'||
    JSON.stringify(topic.citableFacts.map(x=>x.id))!==JSON.stringify(ids)||
    JSON.stringify(Object.keys(payload.source).sort())!==
    JSON.stringify([...new Set(Object.values(payload.task.chapters.saju_core.topics)
     .flatMap(x=>x.citableFacts.map(v=>v.id)))].sort()))
  throw Error('QA_NATAL_DEPTH_PROVIDER_SOURCE_SCOPE_DIVERGED:'+JSON.stringify({
   requested:ids,
   permitted:topic?.citableFacts?.map(x=>x.id)||[],
   sourceKeys:Object.keys(payload.source),
   allTopics:Object.values(payload.task.chapters.saju_core.topics)
    .flatMap(x=>x.citableFacts.map(v=>v.id))
  }));
 if(topic.citableFacts.some(x=>PROHIBITED.test(x.id)))
  throw Error('QA_NATAL_DEPTH_PERSONAL_OR_FUTURE_SOURCE');
 return {prompt,payload,previewTopic:TOPIC,offlineRuleId:candidate.ruleId,
  reviewKind:candidate.review.fourPillar?'human-authored-candidate':'machine-composed-review',
  releaseVerdict:'not-approved',paidApiCalls:0};
}
module.exports={prepare,TOPIC};
