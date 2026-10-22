'use strict';
// Derive QA-only single Saju chapter FROM a captured real full paid first
// batch prompt. Never mutate the actual production prompt or call a provider.
const capture=require('./report-core-paid-full-prompt-capture').capture;
const preview=require('./report-core-paid-natal-depth-preview');
const guidance=require('./report-analysis-guidance');
const audit=require('./report-instruction-audit');
const generation=require('./report-generation-request');
const wire=require('./report-wire');
const schema=require('./report-schema.json');
const preflight=require('./report-provider-preflight');
const MIN=['natal.year.stem','natal.month.stem','natal.day.stem',
 'natal.hour.stem','facts.stemConnections'];
async function assemble(input){
 const captured=await capture(input);
 if(captured.status!=='captured-full-paid-composition')
  throw Error('QA_COMPOSE_NO_VALID_FULL_PROMPT:'+captured.reason);
 const original=captured.prompt;
 const sample=original.facts;
 const candidate=preview.prepare(sample);
 if(!candidate)throw Error('QA_COMPOSE_CURATED_SAMPLE_NOT_COVERED');
 const full=structuredClone(original),ids=['saju_core'];
 const originalPlan=full.analysisGuidance.editorialBlueprint.saju_core;
 const qaPlan=candidate.prompt.analysisGuidance.editorialBlueprint.saju_core;
 if(!originalPlan||!originalPlan.topicTasks.strength||
    originalPlan.topicTasks.natal_depth||
    JSON.stringify(Object.keys(originalPlan.topicTasks))!=='["temperament","strength"]')
  throw Error('QA_COMPOSE_ORIGINAL_TOPIC_CONTRACT_DRIFT');
 if(JSON.stringify(qaPlan.topicTasks.strength)!==
    JSON.stringify(originalPlan.topicTasks.strength))
  throw Error('QA_COMPOSE_MONTH_ANCHOR_CHANGED');
 // Strictly limit a copied first-batch prompt to the standalone Saju core.
 // The original first batch may include MBTI; it is not part of this QA.
 full.requestedSections=ids;
 full.qaNatalDepthPreview=true;
 full.includeFinal=false;full.includeCover=false;
 full.analysisGuidance={...guidance.forRequest(ids,sample.person?.mbti),
  editorialBlueprint:{saju_core:qaPlan}};
 full.rules.sections=ids;
 full.rules.sectionGoals={saju_core:original.rules.sectionGoals.saju_core};
 full.rules.chapterOwnershipPlan={saju_core:{
  ...original.rules.chapterOwnershipPlan.saju_core,topicTasks:qaPlan.topicTasks}};
 full.rules.previousChapterOwnership={};
 full.rules.reusedEvidenceWithPriorConclusions=[];
 full.rules.alreadyRepeatedNarrativeMotifs=[];
 full.rules.annualDomainScopes={};
 full.rules.topicPlan={saju_core:{
  ...original.rules.topicPlan.saju_core,
  natal_depth:'QA 전용이다. 계산된 출생 해·일·시간의 분류를 각각 독립적으로 확인하고, 한 가지 가상의 구체적인 선택 상황에서 서로 다른 뜻이 선택과 판단 조건에 어떻게 연결되는지 이유를 설명한다. 유리하게 읽을 조건과 한쪽 뜻만 따르면 놓치기 쉬운 조건을 근거로 구별한다. 분류 이름·계산 위치를 소개한 다음 일반 조언만 덧붙이거나 앞선 기본 풀이를 다시 쓰지 않는다. 새로 뒷받침할 수 있는 해석 차이가 없으면 null로 반환한다.'
 }};
 full.rules.returnOnlyRequestedSections=true;
 full.output={...full.output,requestedSections:ids,
  cover:'null',finalJudgment:'null'};
 full.editorialTask=original.editorialTask+
  ' QA 전용 선택적 natal_depth에서만 출생 해·날·시간의 독립된 계산 근거를 사용한다. 먼저 내부적으로 출처 두 위치의 정확한 전통적 뜻과 차이를 확인한 뒤 독자에게는 그 차이가 한 가지 구체적인 가정 상황에서 서로 다른 선택과 유리하거나 주의할 조건으로 이어지는 이유를 자연스러운 한국어로 적는다. 계산 항목 나열, 사전적 뜻 두 문장+범용 생활 팁, 같은 면책의 반복은 유료 심화 설명이 아니다. 실제 성격이나 성과가 입증된 것처럼 쓰지 않는다. 기본 strength/temperament 내용과 고정 핵심 판단은 변경하지 않고 새 근거·별도 판단이 부족하면 natal_depth는 null로 비운다.';
 const errors=audit.inspect(full);
 if(errors.length)throw Error('QA_COMPOSE_FULL_INSTRUCTIONS_REJECTED:'+errors.join('|'));
 const provider=generation.compile(full);
 const strictSchema=generation.schema(full,wire.schemaFor(full,schema));
 const transportErrors=audit.inspectTransport(full,provider);
 const preflightErrors=preflight.inspect(full,provider,strictSchema);
 if(transportErrors.length||preflightErrors.length)throw Error(
  'QA_COMPOSE_PROVIDER_INTEGRITY_REJECTED:'+JSON.stringify({transportErrors,preflightErrors}));
 const depth=provider.task.chapters.saju_core.topics.natal_depth;
 const refIds=depth.citableFacts.map(x=>x.id);
 const expected=candidate.payload.task.chapters.saju_core.topics.natal_depth.citableFacts
  .map(x=>x.id);
 if(JSON.stringify(refIds)!==JSON.stringify(expected)||
    !MIN.every(x=>refIds.includes(x)))
  throw Error('QA_COMPOSE_SOURCE_SCOPE_MISMATCH');
 if(provider.task.chapters.mbti_contradiction||
    provider.source['person.mbti']||
    provider.task.chapters.saju_core.topics.strength.citableFacts
     .some(r=>r.id==='natal.hour.stem'||r.id==='natal.year.stem'))
  throw Error('QA_COMPOSE_SCOPE_LEAKAGE');
 return {prompt:full,payload:provider,schema:strictSchema,
  sourceRefs:refIds,originalRequestedSections:captured.requestedSections,
  providerCalls:0,releaseVerdict:'not-approved',
  reviewKind:candidate.reviewKind};
}
module.exports={assemble};
