'use strict';
// A no-model-call, no-production-change proof of whether a separately
// optional whole-chart paragraph can preserve both existing paid-core slots.
// The object returned here is a PROPOSED schema, never passed to the server.
const capture=require('./report-core-paid-full-prompt-capture').capture;
const qa=require('./report-core-paid-full-qa-compose').assemble;
const generation=require('./report-generation-request');
const wire=require('./report-wire');
const schema=require('./report-schema.json');
const source=require('./report-fact-bindings');
const pattern=require('./report-core-paid-classical-decision-handoff');
const BASE_TOPICS=['temperament','strength'];
const idList=task=>Object.keys(task?.topics||{});
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function strictBase(v){
 if(Array.isArray(v))return v.map(strictBase);
 if(!v||typeof v!=='object')return v;
 return Object.fromEntries(Object.entries(v)
  .filter(([k,x])=>!['$schema','minLength','maxLength','minItems',
   'maxItems','minimum','maximum','pattern','format'].includes(k)&&
   !(k==='title'&&typeof x==='string'))
  .map(([k,x])=>[k,strictBase(x)]));
}
const truth=(condition,code)=>{
 if(!condition)throw Error('QA_ADDITIVE_LAYOUT_'+code);
};
async function inspect(input){
 const real=await capture(input);
 truth(real.status==='captured-full-paid-composition'&&real.providerCalls===0,
  'REAL_FIRST_BATCH_UNAVAILABLE');
 const prompt=real.prompt,chart=prompt.facts.chart;
 const provider=generation.compile(prompt);
 const normalTask=provider.task.chapters.saju_core;
 truth(same(idList(normalTask),BASE_TOPICS)&&
  prompt.qaNatalDepthPreview!==true&&
  !Object.hasOwn(provider.source,'facts.natalBranchRelations')&&
  !normalTask.topics.natal_depth,
  'NORMAL_PAID_TOPIC_SCOPE_CHANGED');
 const normalSchema=generation.schema(prompt,wire.schemaFor(prompt,
  strictBase(schema)));
 const normalChapter=normalSchema.properties.chapters.properties.saju_core;
 const slots=normalChapter.properties.paragraphs.properties;
 const normalCoreSourceRefs=Object.fromEntries(BASE_TOPICS.map(t=>
  [t,normalTask.topics[t].citableFacts.map(x=>x.id)]));
 truth(BASE_TOPICS.every(t=>Object.hasOwn(slots,t)), 'NORMAL_SLOTS_MISSING');
 // This QA candidate is derived from a REAL captured server prompt.
 // Its deliberate null temperament is the key difference from a truly
 // additive third paragraph. We do not silently equate the two.
 const candidate=await qa(input);
 truth(candidate.providerCalls===0&&candidate.releaseVerdict==='not-approved'&&
  same(candidate.prompt.facts.chart,chart),'QA_CANDIDATE_NOT_IDENTICAL_CHART');
 const qaTask=candidate.payload.task.chapters.saju_core;
 truth(same(idList(qaTask),[...BASE_TOPICS,'natal_depth']),
  'QA_DEPTH_TOPICS_CHANGED');
 const qaChapter=candidate.schema.properties.chapters.properties.saju_core;
 const qaSlots=qaChapter.properties.paragraphs.properties;
 truth(qaSlots.temperament.type==='null'&&
  qaSlots.natal_depth.type==='object'&&
  slots.temperament.type!=='null'&&
  (slots.temperament.anyOf||[]).some(x=>x.type==='null'),
  'HIDDEN_NON_ADDITIVE_SLOT_REPLACEMENT');
 truth(qaSlots.strength.type==='object'&&slots.strength.type==='object'&&
  same(qaChapter.properties.title.enum,normalChapter.properties.title.enum)&&
  same(qaChapter.properties.keyJudgment.enum,
   normalChapter.properties.keyJudgment.enum),
  'MANDATORY_BASELINE_REPLACEMENT');
 const natalRefs=qaTask.topics.natal_depth.citableFacts.map(x=>x.id);
 truth(['natal.year.stem','natal.month.stem','natal.day.stem',
  'natal.hour.stem','facts.stemConnections'].every(id=>natalRefs.includes(id))&&
  natalRefs.every(id=>Object.hasOwn(candidate.payload.source,id))&&
  natalRefs.some(id=>!Object.hasOwn(provider.source,id)),
  'DEPTH_EVIDENCE_NOT_SEPARATED_FROM_PAID');
 const verified=Object.fromEntries(source.build(prompt.facts).map(x=>[x.id,x]));
 truth(natalRefs.filter(id=>id.startsWith('natal.'))
  .every(id=>same(verified[id],candidate.payload.source[id])),
  'DEPTH_ROWS_NOT_CANONICAL');
 // A prototype schema, built by copying the real unmodified paid slots.
 // The added paragraph is explicitly optional (object|null). The current
 // live provider plan and decoder DO NOT consume this prototype.
 const proposed=structuredClone(normalSchema);
 const proposedSlots=proposed.properties.chapters.properties.saju_core
  .properties.paragraphs;
 proposedSlots.properties.natal_depth={
  anyOf:[structuredClone(qaSlots.natal_depth),{type:'null'}]
 };
 proposedSlots.required=[...proposedSlots.required,'natal_depth'];
 const protoProps=proposedSlots.properties;
 truth(same(Object.keys(protoProps),[...BASE_TOPICS,'natal_depth'])&&
  same(Object.keys(slots),BASE_TOPICS)&&
  same(proposedSlots.properties.strength,slots.strength)&&
  same(proposedSlots.properties.temperament,slots.temperament)&&
  same(proposed.properties.chapters.properties.saju_core.properties.title,
   normalChapter.properties.title)&&
  same(proposed.properties.chapters.properties.saju_core.properties.keyJudgment,
   normalChapter.properties.keyJudgment)&&
  same(proposedSlots.required,[...BASE_TOPICS,'natal_depth'])&&
  proposedSlots.properties.natal_depth.anyOf[1].type==='null',
  'PROPOSED_OPTIONAL_LAYOUT_NOT_ADDITIVE');
 const method=pattern.prepare(prompt.facts);
 // Interpretive priority and paid-value proof MUST be independent from
 // transport feasibility; no new customer-facing claim is authorized.
 truth(method.releaseVerdict==='not-approved'&&method.methodApproved===false,
  'UNREVIEWED_METHOD_WAS_APPROVED');
 return {
  kind:'offline-real-first-batch-additive-layout-decision-v1',
  actualChart:{...chart},
  originalFirstBatch:real.requestedSections.slice(),
  existingNormalReaderSlots:BASE_TOPICS.slice(),
  qaReaderSlots:[...BASE_TOPICS,'natal_depth'],
  actualNormalDoesNotExposeDepth:true,
  qaSuppressesExistingTemperament:true,
  additivePrototype:{
   schema:proposed,
   source:'copy-of-normal-strict-schema-plus-optional-qa-depth',
   preservesNormalCoreFields:true,
   preservesNormalCitationEnums:true,
   requiresDepthOutput:false,
   strictlyNoReaderOrProviderIntegration:true
  },
  citations:{
   normalCore:normalCoreSourceRefs,
   qaDepth:natalRefs
  },
  blockingIssues:[
   'current-qa-replaces-optional-temperament-with-null',
   'normal-writer-has-no-depth-topic-or-full-chart-refs',
   'normal-decoder-not-wired-to-natal-depth',
   'method-priority-and-specific-premium-reading-not-approved',
   'no-independent-editorial-premium-value-verification'
  ],
  recommendation:'keep-original-two-slots; optional separate-depth-only-after-evidence-and-method-review',
  abilityToUsePrototypeForCustomer:false,
  estimatedOrObservedReaderValue:'not-validated',
  modelCalls:0,paidApiCalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={inspect};
