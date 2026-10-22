'use strict';
const assert=require('node:assert/strict');
const readiness=require('./report-core-paid-one-shot-readiness');
const inspect=require('./report-core-paid-natal-depth-response-gate');
(async()=>{
let attemptedNetwork=0;
const prev=global.fetch;
global.fetch=()=>{attemptedNetwork++;throw Error('FREE_QA_MUST_NOT_CALL_NETWORK');};
let a,b;
try{a=await readiness.build();b=await readiness.build();}
finally{global.fetch=prev;}
assert.deepEqual(a,b,'same frozen facts must produce the identical provider hashes');
assert.equal(attemptedNetwork,0,'do not reach real or mocked paid transport');
assert.equal(a.sample,readiness.SAMPLE_ID);
assert.equal(a.actualServerRulesVerified,true);
assert.equal(a.derivedFromRealServerBatch,true);
assert.deepEqual(a.capturedServerBatchSections,['saju_core','mbti_contradiction']);
assert.equal(a.kind,'one-shot-paid-qa-readiness-offline');
assert.equal(a.runStatus,'dry-run-ready');
assert.equal(a.approvalToSpendTokens,false);
assert.equal(a.releaseVerdict,'not-approved');
assert.equal(a.providerCalls,0);
assert.equal(a.isLiveCustomerRequest,false);
assert.equal(a.apiResponseQuality,'not-tested');
assert.equal(a.modelSelection,'not-authorized');
assert.equal(a.qaTopic,'natal_depth');
assert.equal(a.reviewKind,'machine-composed-review');
assert.deepEqual(a.requestedSections,['saju_core']);
assert(a.sourceCount>=5&&a.sourceCount===a.sourceRefs.length);
assert(['natal.year.stem','natal.month.stem','natal.day.stem',
 'natal.hour.stem','facts.stemConnections'].every(x=>a.sourceRefs.includes(x)));
assert(!a.sourceRefs.some(x=>x.startsWith('annual.')||x.startsWith('person.')));
assert(/^.{5,}$/.test(a.verifiedNatalSummary));
assert.equal(a.maxOutputTokenSettingIfGPT41,18000);
assert.equal(a.lockedYearTenGod,'정재');
assert.equal(a.lockedHourTenGod,'식신');
for(const h of ['inputHash','providerTaskHash','strictResponseSchemaHash','fullInstructionHash'])
 assert.match(a[h],/^[0-9a-f]{64}$/);
assert.equal(a.checklist.length,8);
assert.equal(a.nextGate,
 'explicit-approval-for-one-billable-model-call-then-human-review');
assert.equal(inspect.assert===undefined,false);
// The same REAL server first-batch composer must also work for a different
// synthetic birth hour. It must not recycle the earlier four-pillar evidence
// or make the QA-only topic available to normal paying users.
const assemble=require('./report-core-paid-full-qa-compose').assemble;
const fixed=await assemble();
const later=await assemble({...readiness.FIXTURE,birthTime:'20:20'});
const factLock=require('./report-core-paid-natal-depth-fact-lock');
const generation=require('./report-generation-request');
const capture=require('./report-core-paid-full-prompt-capture').capture;
const captured=await capture();
const ordinaryGoal=generation.compile(captured.prompt).task.editorialGoal;
const qaGoal=fixed.payload.task.editorialGoal;
// The server-facing editorialGoal used to override editorialTask and silently
// discarded previous QA additions. Verify the REAL compact provider payload.
assert.equal(qaGoal,generation.editorialGoalFor(fixed.prompt));
assert.equal(later.payload.task.editorialGoal,qaGoal);
for(const phrase of ['구체적인 가상 선택 상황','유리하게 읽히는 조건','사전적인 뜻 두 문장','새 통찰이 없으면 natal_depth는 null']){
 assert(qaGoal.includes(phrase),'QA editorial content must reach the actual provider: '+phrase);
 assert(!ordinaryGoal.includes(phrase),'ordinary paid flow must not inherit QA-only instructions: '+phrase);
}
assert.equal(fixed.prompt.editorialTask,captured.prompt.editorialTask,
 'QA must not rely on untransmitted editorialTask suffixes');
assert(!ordinaryGoal.includes('QA 전용 세 번째 natal_depth'));

const firstDepth=fixed.payload.task.chapters.saju_core.topics.natal_depth;
const laterDepth=later.payload.task.chapters.saju_core.topics.natal_depth;
assert.deepEqual(fixed.originalRequestedSections,['saju_core','mbti_contradiction']);
assert.deepEqual(later.originalRequestedSections,fixed.originalRequestedSections);
assert.equal(later.prompt.qaNatalDepthPreview,true);
assert.equal(later.releaseVerdict,'not-approved');
assert.equal(later.providerCalls,0);
assert.equal(later.prompt.facts.chart.month,fixed.prompt.facts.chart.month);
assert.notEqual(later.prompt.facts.chart.hour,fixed.prompt.facts.chart.hour);
assert.deepEqual(later.payload.task.chapters.saju_core.topics.strength,
 fixed.payload.task.chapters.saju_core.topics.strength,
 'the month-only paid anchor must not be silently widened');
assert.notDeepEqual(laterDepth.citableFacts,firstDepth.citableFacts,
 'a different birth hour must reach the QA provider as different evidence');
assert.notEqual(factLock.fromPayload(later.payload).literal,
 factLock.fromPayload(fixed.payload).literal,
 'the source-locked four-pillar interpretation must follow the input');
for(const draft of [fixed,later]){
 const refs=draft.payload.task.chapters.saju_core.topics.natal_depth.citableFacts.map(x=>x.id);
 const enforced=draft.schema.properties.chapters.properties.saju_core
  .properties.paragraphs.properties.natal_depth.anyOf.find(x=>x.type==='object')
  .properties.basis.properties.refs.items.enum;
 assert.deepEqual(enforced,refs,'real-server QA transport/schema source integrity');
 assert(refs.every(x=>Object.hasOwn(draft.payload.source,x)));
 assert(!Object.hasOwn(draft.payload.task.chapters,'mbti_contradiction'));
 assert.deepEqual(Object.keys(draft.payload.task.chapters.saju_core.topics),
  ['temperament','strength','natal_depth']);
}
// Missing birth hour may be supported by the normal report, but must never
// fabricate the hour-based QA depth. No customer or API data is involved.
await assert.rejects(assemble({...readiness.FIXTURE,
 unknownBirthTime:true,birthTime:''}),/QA_COMPOSE_(?:CURATED_SAMPLE_NOT_COVERED|NO_VALID_FULL_PROMPT)/);
console.log('QA_ONE_SHOT_READINESS='+JSON.stringify(a));
console.log('PASS real server rules preserved in QA one-shot readiness, fixed response schema fingerprint, zero provider requests');
})().catch(e=>{console.error(e);process.exitCode=1;});
