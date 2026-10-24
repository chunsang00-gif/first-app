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
// Match server.callOpenAI() strict-schema cleanup BEFORE wire/schema binding.
// Do not modify the production server just to make a QA digest pass.
function providerStrictBase(value){
 if(Array.isArray(value))return value.map(providerStrictBase);
 if(!value||typeof value!=='object')return value;
 const out={};
 for(const [key,item] of Object.entries(value)){
  if(['$schema','minLength','maxLength','minItems','maxItems',
    'minimum','maximum','pattern','format'].includes(key)||
    (key==='title'&&typeof item==='string'))continue;
  out[key]=providerStrictBase(item);
 }
 return out;
}
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
  natal_depth:'QA 전용이다. 계산된 출생 해·일·시간의 분류를 각각 독립적으로 확인하고, 한 가지 가상의 구체적인 선택 상황에서 서로 다른 뜻이 선택과 판단 조건에 어떻게 연결되는지 이유를 설명한다. 유리하게 읽을 조건과 한쪽 뜻만 따르면 놓치기 쉬운 조건을 근거로 구별한다. 분류 이름·계산 위치를 소개한 다음 일반 조언만 덧붙이거나 앞선 기본 풀이를 다시 쓰지 않는다. 근거를 바탕으로 새 해석을 작성하지 못하면 품질 검증에서 거절되며, 그 사실을 감추려고 내용을 지어내지 않는다.'
 }};
 full.rules.returnOnlyRequestedSections=true;
 full.output={...full.output,requestedSections:ids,
  cover:'null',finalJudgment:'null'};
 // The local copy keeps the captured server task unchanged. The REAL compact
 // outgoing model brief is scoped in generation.editorialGoalFor(qa flag).
 // Do not append a second, untransmitted or contradictory writing directive.
 full.editorialTask=original.editorialTask;
 const errors=audit.inspect(full);
 if(errors.length)throw Error('QA_COMPOSE_FULL_INSTRUCTIONS_REJECTED:'+errors.join('|'));
 const provider=generation.compile(full);
 const strictSchema=generation.schema(full,wire.schemaFor(full,providerStrictBase(schema)));
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

async function assembleAdditiveTransportPreview(input){
 const frozen=await assemble(input),prompt=structuredClone(frozen.prompt);
 if(prompt.qaAdditiveDepthPreview!==undefined||
    prompt.qaOfflineEditorialResearchPreview===true||
    prompt.qaNatalDepthPreview!==true||
    JSON.stringify(prompt.requestedSections)!=='["saju_core"]')
  throw Error('QA_ADDITIVE_PREVIEW_UNSAFE_BASE');
 prompt.qaAdditiveDepthPreview=true;
 const payload=generation.compile(prompt);
 const strictSchema=generation.schema(prompt,
  wire.schemaFor(prompt,providerStrictBase(schema)));
 const errors=audit.inspect(prompt),transportErrors=audit.inspectTransport(prompt,payload);
 const preflightErrors=preflight.inspect(prompt,payload,strictSchema);
 if(errors.length||transportErrors.length||preflightErrors.length)
  throw Error('QA_ADDITIVE_REAL_TRANSPORT_PREFLIGHT_FAILED:'+
   JSON.stringify({errors,transportErrors,preflightErrors}));
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const slots=strictSchema.properties.chapters.properties.saju_core.properties.paragraphs.properties;
 const original=frozen.schema.properties.chapters.properties.saju_core.properties.paragraphs.properties;
 if(!same(Object.keys(slots),['temperament','strength','natal_depth'])||
    !same(slots.temperament.anyOf?.map(x=>x.type),['object','null'])||
    !same(slots.natal_depth.anyOf?.map(x=>x.type),['object','null'])||
    !same(slots.strength,original.strength)||
    !same(slots.natal_depth.anyOf[0],original.natal_depth)||
    original.temperament.type!=='null'||
    !same(payload.task.chapters.saju_core.topics.strength,
     frozen.payload.task.chapters.saju_core.topics.strength)||
    !same(payload.source,frozen.payload.source))
  throw Error('QA_ADDITIVE_REAL_TRANSPORT_NOT_PRESERVING_BASELINE');
 return {kind:'offline-actual-provider-additive-three-slots-v1',
  prompt,payload,schema:strictSchema,originalFrozenQaUnchanged:true,
  originalTemperamentPreserved:true,originalStrengthUnchanged:true,
  independentDepthNullAllowed:true,providerCalls:0,
  modelResponse:null,readerValueApproved:false,
  releaseVerdict:'not-approved'};
}

module.exports={assemble,assembleAdditiveTransportPreview};
