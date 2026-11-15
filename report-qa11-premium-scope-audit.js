'use strict';
// QA11: read the ACTUAL live paid contract before another billable call.
// Not a paid model evaluation, and NEVER alters user-facing production output.
const outline=require('./report-outline');
const quality=require('./report-quality-node');
const guidance=require('./report-analysis-guidance');
const selection=require('./report-chapter-selection');
const batch=require('./report-paid-batch-plan');
const canonical=require('./report-wire');
const schema=require('./report-schema.json');
const TARGET=Object.freeze({chapters:12,topics:35});
const GROUPS=Object.freeze([
 ['saju_core','mbti_contradiction'],['decision','stress'],
 ['money','career'],['relationship','integrated_judgment'],
 ['year_2027','year_2027_money'],['year_2027_career','year_2027_relationship']
].map(row=>Object.freeze(row)));
function scope(packet,liveFirstPrompt){
 if(process.env.NODE_ENV!=='test'||process.env.RENDER==='true'||
    liveFirstPrompt?.stage!=='body'||!packet||
    JSON.stringify(liveFirstPrompt.facts?.chart)!==JSON.stringify(packet.chart))
  throw Error('QA11_LIVE_CONTRACT_INSPECTION_OFFLINE_ONLY');
 const ids=quality.IDS;
 const entries=Object.entries(outline.topics);
 if(entries.length!==ids.length||
    JSON.stringify(entries.map(x=>x[0]))!==JSON.stringify(ids)||
    JSON.stringify(GROUPS.flat())!==
    JSON.stringify(['saju_core','mbti_contradiction','decision','stress',
     'money','career','relationship','integrated_judgment',
     'year_2027','year_2027_money','year_2027_career','year_2027_relationship']))
  throw Error('QA11_CHAPTER_IDS_DIVERGED_FROM_PRODUCTION');
 const plan=guidance.preflight(packet);
 const actual=selection.select(GROUPS,plan);
 const requested=liveFirstPrompt.requestedSections;
 const firstPlanned=batch.plan(actual.groups)[0];
 if(JSON.stringify(firstPlanned)!==JSON.stringify(requested))
  throw Error('QA11_FIRST_LIVE_BATCH_SCOPE_DRIFT');
 const wire=canonical.schemaFor(liveFirstPrompt,schema);
 const chapterSpecs=wire.properties?.chapters?.properties;
 if(Object.keys(chapterSpecs||{}).join('/')!==requested.join('/'))
  throw Error('QA11_LIVE_SCHEMA_CHAPTER_DRIFT');
 const byChapter=Object.fromEntries(entries.map(([id,defs])=>[id,{
  topicIds:Object.keys(defs),
  defined:Object.keys(defs).length,
  planned:actual.plannedIds.includes(id),
  eligible:actual.plannedIds.includes(id)?
   Object.keys(defs).filter(t=>plan[id].topicTasks[t]?.mode!=='state-limits'):[],
  anchor:plan[id]?.anchorTopic||null
 }]));
 const total=entries.reduce((n,[,defs])=>n+Object.keys(defs).length,0);
 const plannedTotal=Object.values(byChapter).filter(x=>x.planned)
  .reduce((n,x)=>n+x.defined,0);
 const eligibleTotal=Object.values(byChapter).reduce((n,x)=>n+x.eligible.length,0);
 // Confirm the true provider schema is *exactly* the current first batch:
 // not the displayed report count or a stale page-count promise.
 for(const id of requested){
  const slots=chapterSpecs[id]?.properties?.paragraphs?.properties;
  if(JSON.stringify(Object.keys(slots||{}))!==
     JSON.stringify(byChapter[id].topicIds))
   throw Error('QA11_FIRST_PROVIDER_TOPIC_CONTRACT_DRIFT:'+id);
  for(const key of Object.keys(slots)){
   const expectedAnchor=plan[id].anchorTopic===key;
   if(expectedAnchor&&slots[key].anyOf)
    throw Error('QA11_MANDATORY_ANCHOR_BECAME_NULLABLE:'+id+':'+key);
  }
 }
 const omitted=actual.omitted.map(x=>x.id);
 const full=actual.plannedIds.length===TARGET.chapters;
 return Object.freeze({
  kind:'qa11-live-premium-scope-truth-v1',
  target:TARGET,
  canonicalChapterCount:ids.length,
  definedCanonicalTopicSlots:total,
  missingDefinedTopicSlots:Math.max(0,TARGET.topics-total),
  chartSelectedChapters:actual.plannedIds.length,
  chartOmittedChapters:omitted,
  chartSelectedDefinedTopicUpperBound:plannedTotal,
  chartEvidenceEligibleTopicUpperBound:eligibleTotal,
  optionalTopicsMayReturnNull:true,
  guaranteedWrittenTopics:0,
  firstBatchRequestedSections:requested.slice(),
  firstProviderSchemaTopicKeys:Object.fromEntries(requested.map(
   id=>[id,Object.keys(chapterSpecs[id].properties.paragraphs.properties)])),
  bodyCallsPlanned:batch.plan(actual.groups).length,
  paidCallsPlanned:batch.plan(actual.groups).length+1,
  gapCodes:[
   ...(total<TARGET.topics?['PRODUCT_35_TOPICS_NOT_DEFINED']:[]),
   ...(!full?['PRODUCT_12_CHAPTERS_NOT_SELECTED_FOR_THIS_CHART']:[]),
   ...(eligibleTotal<total?['PRODUCT_SOME_TOPICS_NO_DIRECT_EVIDENCE']:[]),
   'PRODUCT_HUMAN_INTERPRETATION_AND_PROVIDER_OUTPUT_UNVERIFIED'
  ],
  canPromise12Chapters35Topics:false,
  canSell:false,expertReviewComplete:false,providerCalls:0,
  actualPaidModelOutputsVerified:false,
  note:'Topic slots are schema fields, NOT guaranteed non-null paragraphs or verified paid interpretations.'
 });
}
module.exports={scope,TARGET,GROUPS};
