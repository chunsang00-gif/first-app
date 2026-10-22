'use strict';
// A fixed, SYNTHETIC one-shot paid QA readiness packet. Entirely local:
// no network request, no API credential read, no live report generation.
const crypto=require('node:crypto');
const facts=require('./report-facts-node');
const preview=require('./report-core-paid-natal-depth-preview');
const generation=require('./report-generation-request');
const wire=require('./report-wire');
const schema=require('./report-schema.json');
const preflight=require('./report-provider-preflight');
const instruction=require('./report-instruction-audit');
const thesis=require('./report-core-thesis');
const factLock=require('./report-core-paid-natal-depth-fact-lock');
const {outputLimit}=require('./report-paid-batch-plan');
const FIXTURE=Object.freeze({calendar:'solar',birthDate:'1982-06-15',
 birthTime:'14:20',gender:'male',mbti:'ISFP'});
const SAMPLE_ID='fixed-synthetic-natal-qa-1982-06-15-1420';
const hash=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const yes=(ok,reason)=>{if(!ok)throw Error('QA_ONE_SHOT_NOT_READY:'+reason);};
function build(){
 const packet=facts.build({...FIXTURE},2027);
 yes(packet.status==='ready','calendar-not-ready');
 const candidate=preview.prepare(packet);
 yes(candidate?.releaseVerdict==='not-approved'&&
  candidate.reviewKind==='machine-composed-review','candidate-not-curated-or-reviewable');
 yes(candidate.prompt?.qaNatalDepthPreview===true,'qa-only-flag-missing');
 const provider=candidate.payload;
 const chapter=provider.task?.chapters?.saju_core;
 yes(chapter&&JSON.stringify(Object.keys(chapter.topics))===
  JSON.stringify(['temperament','strength','natal_depth']),'wrong-provider-topic-set');
 const source=provider.source;
 const refs=chapter.topics.natal_depth.citableFacts.map(x=>x.id);
 const required=['natal.year.stem','natal.month.stem','natal.day.stem',
  'natal.hour.stem','facts.stemConnections'];
 yes(required.every(id=>refs.includes(id)),'missing-cross-pillar-ref');
 yes(refs.every(id=>Object.hasOwn(source,id)),'source-row-not-in-provider');
 yes(refs.every(id=>!id.startsWith('annual.')&&
  !id.startsWith('person.')&&!id.startsWith('fortune.')),'foreign-source-cited');
 const wireSchema=wire.schemaFor(candidate.prompt,schema);
 const strictSchema=generation.schema(candidate.prompt,wireSchema);
 yes(preflight.inspect(candidate.prompt,provider,strictSchema).length===0,
  'source-schema-preflight');
 yes(instruction.inspect(candidate.prompt).length===0,'instruction-audit');
 yes(instruction.inspectTransport(candidate.prompt,provider).length===0,
  'transport-instruction-audit');
 const depthSchema=strictSchema.properties.chapters.properties.saju_core
  .properties.paragraphs.properties.natal_depth.anyOf.find(x=>x.type==='object');
 yes(depthSchema?.properties?.basis?.properties?.refs?.items?.enum?.join('|')===
  refs.join('|'),'schema-citation-mismatch');
 const baseTopic=chapter.topics.strength.citableFacts.map(x=>x.id);
 yes(!baseTopic.includes('natal.year.stem')&&
  !baseTopic.includes('natal.hour.stem'),'existing-month-topic-mutated');
 const core=thesis.forPrompt(candidate.prompt);
 const lock=factLock.fromPayload(provider);
 yes(lock.sourceRefs.every(id=>refs.includes(id)),'natal-lock-out-of-scope');
 yes(lock.rows.length===4&&core?.sourceIds.length===2,'missing-verified-theses');
 const normalPrompt={...candidate.prompt,qaNatalDepthPreview:false,
  analysisGuidance:{...candidate.prompt.analysisGuidance,
   editorialBlueprint:{...candidate.prompt.analysisGuidance.editorialBlueprint,
    saju_core:require('./report-analysis-guidance').preflight(packet).saju_core}}};
 const original=generation.compile(normalPrompt);
 yes(!Object.hasOwn(original.task.chapters.saju_core.topics,'natal_depth')&&
  !Object.hasOwn(original.source,'facts.natalBranchRelations'),
  'live-default-depth-exposure');
 yes(generation.allowedRefs(provider,chapter.topics.strength,'saju_core','strength').size===
  new Set(baseTopic).size,'core-source-boundary');
 const checks=[
  'four-pillar-facts-match-calendar',
  'independent-month-core-preserved',
  'qa-only-natal-topic-isolated',
  'strict-json-citation-enum-equals-outgoing-source-refs',
  'provider-and-transport-preflight-pass',
  'date-locked-fact-interpretation-immutable',
  'unknown-or-unsupported-charts-remain-blocked-in-preview',
  'no-live-branch-or-paid-provider-calls'
 ];
 return {
  sample:SAMPLE_ID,kind:'one-shot-paid-qa-readiness-offline',
  approvalToSpendTokens:false,releaseVerdict:'not-approved',
  runStatus:'dry-run-ready',providerCalls:0,
  isLiveCustomerRequest:false,
  qaTopic:'natal_depth',reviewKind:candidate.reviewKind,
  requestedSections:candidate.prompt.requestedSections.slice(),
  sourceRefs:refs,sourceCount:refs.length,
  coreThesis:core.keyJudgment,
  verifiedNatalSummary:lock.literal,
  lockedYearTenGod:source['natal.year.stem'].tenGod,
  lockedHourTenGod:source['natal.hour.stem'].tenGod,
  apiResponseQuality:'not-tested',
  modelSelection:'not-authorized',
  maxOutputTokenSettingIfGPT41:outputLimit('gpt-4.1',candidate.prompt),
  inputHash:hash({packet:packet.chart,sourceRefs:refs,
   coreJudgment:core.keyJudgment,natalFactLock:lock.literal}),
  providerTaskHash:hash(provider.task),
  strictResponseSchemaHash:hash(strictSchema),
  checklist:checks,
  nextGate:'explicit-approval-for-one-billable-model-call-then-human-review'
 };
}
module.exports={build,FIXTURE,SAMPLE_ID};
if(require.main===module)console.log('QA_ONE_SHOT_READINESS='+JSON.stringify(build()));
