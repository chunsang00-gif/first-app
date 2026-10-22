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
  natal_depth:'실제 계산된 연·일·시의 출처를 출생월의 기본 해석과 구별하며 한 가지 검증 가능한 차이만 설명한다. 새로운 해석 근거가 부족하면 null로 비운다.'
 }};
 full.rules.returnOnlyRequestedSections=true;
 full.output={...full.output,requestedSections:ids,
  cover:'null',finalJudgment:'null'};
 full.editorialTask=original.editorialTask+
  ' QA 전용 선택적 natal_depth에서만 출생 해·날·시간의 독립된 계산 근거를 쓸 수 있고, 기본 strength의 월간·본기 해석을 바꾸지 않는다. 새 결론이 없으면 null로 반환한다.';
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
