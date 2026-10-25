'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const builder=require('./report-core-paid-natal-depth-preview');
const wire=require('./report-wire');
const writer=require('./report-generation-request');
const preflight=require('./report-provider-preflight');
const coverage=require('./report-core-knowledge-coverage');
const schema=require('./report-schema.json');
let allowed=0,missing=0,authored=0,machine=0,authoredReferences=0,machineOnlyHypotheses=0;
const samples=coverage.representativeInputs();
for(const user of samples){
 const packet=facts.build(user,2027);
 const preview=builder.prepare(packet);
 if(!preview){
  missing++;
  const scope=writer.compile({
   stage:'body',facts:packet,requestedSections:['saju_core'],
   analysisGuidance:{...require('./report-analysis-guidance').forRequest(['saju_core'],user.mbti),
    editorialBlueprint:{saju_core:require('./report-analysis-guidance').preflight(packet).saju_core}}
  });
  assert(!scope.task.chapters.saju_core.topics.natal_depth);
  continue;
 }
 allowed++;
 if(preview.reviewKind==='human-authored-candidate')authored++;
 else machine++;
 assert.equal(preview.prompt.qaNatalDepthPreview,true);
 assert.equal(preview.releaseVerdict,'not-approved');
 assert.equal(preview.paidApiCalls,0);
 const topics=preview.payload.task.chapters.saju_core.topics;
 assert.deepEqual(Object.keys(topics),['temperament','strength','natal_depth']);
 const permissible=topics.natal_depth.citableFacts.map(r=>r.id);
 assert(permissible.includes('natal.year.stem'));
 assert(permissible.includes('natal.day.stem'));
 assert(permissible.includes('natal.hour.stem'));
 assert(permissible.includes('facts.stemConnections'));
 assert(!permissible.some(x=>x.startsWith('annual.')||x.startsWith('person.')));
 assert.equal(preview.payload.task.mbti,null);
 assert(!Object.hasOwn(topics.natal_depth,'qaOfflineEditorialResearch'),
  'the one-shot approved QA envelope must remain unchanged');
 const offlinePrompt={...preview.prompt,qaOfflineEditorialResearchPreview:true};
 const offlinePayload=writer.compile(offlinePrompt);
 const offlineTopics=offlinePayload.task.chapters.saju_core.topics;
 const brief=offlineTopics.natal_depth.qaOfflineEditorialResearch;
 assert.deepEqual(offlineTopics.natal_depth.citableFacts,topics.natal_depth.citableFacts,
  'offline writer may add a reference but never change source permissions');
 assert.deepEqual(preflight.inspect(offlinePrompt,offlinePayload,
  writer.schema(offlinePrompt,wire.schemaFor(offlinePrompt,schema))),[]);

 assert(brief,'QA outgoing request must include the genuinely curated offline research');
 assert.equal(brief.kind,'qa-offline-saju-research-bridge-v1');
 assert.equal(brief.releaseVerdict,'not-approved');
 assert.equal(brief.customerReady,false);
 assert.equal(brief.methodProfessionallyReviewed,false);
 assert.equal(brief.readerValueApproved,false);
 assert.equal(brief.paidApiCalls,0);
 assert.deepEqual(brief.sourceRefs.filter(id=>!permissible.includes(id)),[],
  'a manuscript must never cite a source unavailable to the same strict schema');
 assert(brief.chartFingerprint.split('/').length===4);
 if(brief.fullFirstChapterResearch!==null){
  const full=brief.fullFirstChapterResearch;
  assert.equal(full.kind,'qa-complete-adult-first-chapter-edit-v1');
  assert.equal(brief.sourceClass,'authored-specific-four-pillar-candidate');
  assert.equal(full.releaseVerdict,'not-approved');
  assert.equal(full.sourceInApprovedPaidRequest,false);
  assert.equal(full.separateFromMonthOnlyWriter,true);
  assert.equal(full.independentTraditionalMethodVerified,false);
  assert.equal(full.professionalReaderReviewComplete,false);
  assert.equal(full.customerPaidValueProven,false);
  assert.equal(full.copyAsCustomerFact,false);
  assert.deepEqual(full.sourceRefs.filter(id=>!permissible.includes(id)),[],
   'the complete first chapter must cite only the actual provider-schema allowed refs');
  assert.equal(full.text,full.paragraphs.map(x=>x.text).join('\n\n'));
 }
 if(preview.reviewKind==='human-authored-candidate'){
  authoredReferences++;
  assert.equal(brief.sourceClass,'authored-specific-four-pillar-candidate');
  assert.equal(brief.computedContrast,null);
  assert(brief.editorialReference?.text?.length>=350);
  assert.equal(brief.editorialReference?.copyAsCustomerFact,false);
  assert.equal(brief.editorialReference.scope,'exact-chart-editorial-hypothesis-only');
  const method=brief.editorialReference.methodPriorityReview;
  assert.equal(method.kind,'qa-unselected-natal-method-priority-v1');
  assert.equal(method.priorityVerdict,'not-established');
  assert.equal(method.selectedTraditionalMethod,null);
  assert.equal(method.professionalTraditionalMethodApproved,false);
  assert.equal(method.branchRelationPriority,'not-assessed');
  assert.equal(method.scenarioOrderingStatus,
   'hypothetical-workflow-not-deduced-from-chart');
  assert.equal(method.alternativeCandidateRefs.length,3);
  assert(method.alternativeCandidateRefs.every(x=>x.priority==='not-assessed'));
 }else{
  machineOnlyHypotheses++;
  assert.equal(brief.sourceClass,'machine-structural-comparison-only');
  assert.equal(brief.editorialReference,null,
   'machine review prose must not be exported as an approved customer manuscript');
  assert.equal(brief.methodPriorityReview,undefined);
  assert(brief.computedContrast?.premise);
  assert.equal(brief.computedContrast.status,
   'symbolic-editorial-hypothesis-not-validated');
  assert(brief.computedContrast.sourceRefs.every(id=>permissible.includes(id)));
 }
 assert.deepEqual(Object.keys(preview.payload.source).sort(),
  [...new Set(Object.values(topics).flatMap(topic=>
   topic.citableFacts.map(r=>r.id)))].sort());
 const jsonSchema=writer.schema(preview.prompt,wire.schemaFor(preview.prompt,schema));
 assert.deepEqual(preflight.inspect(preview.prompt,preview.payload,jsonSchema),[]);
 const paragraphs=jsonSchema.properties.chapters.properties.saju_core.properties.paragraphs.properties;
 assert.deepEqual(Object.keys(paragraphs),['temperament','strength','natal_depth']);
 assert.deepEqual(paragraphs.temperament,{type:'null'},'QA-only seasonal duplicate must not be generated');
 const depth=paragraphs.natal_depth;
 assert(depth);
 assert.deepEqual(depth.properties.basis.properties.refs.items.enum,permissible);
 const verifiedLock=require('./report-core-paid-natal-depth-fact-lock').fromPayload(preview.payload);
 assert.deepEqual(depth.properties.basis.properties.interpretation.enum,
  [verifiedLock.literal]);
 assert(verifiedLock.literal.includes(preview.payload.source['natal.year.stem'].tenGod));
 assert(verifiedLock.literal.includes(preview.payload.source['natal.hour.stem'].tenGod));
 const strength=paragraphs.strength;
 const monthRefs=strength.properties.basis.properties.refs.items.enum;
 assert(monthRefs.includes('natal.month.stem'));
 assert(!monthRefs.includes('natal.year.stem'));
 assert(!monthRefs.includes('natal.hour.stem'));
 assert(!monthRefs.includes('facts.stemConnections'));
 assert(jsonSchema.properties.chapters.properties.saju_core.properties.keyJudgment.enum.length===1);
}
assert.equal(allowed,31);
assert.equal(missing,68);
assert.equal(authored,4);
assert.equal(machine,27);
assert.equal(authoredReferences,4);
assert.equal(machineOnlyHypotheses,27);
const unknown=facts.build({calendar:'solar',birthDate:'1990-11-15',
 unknownBirthTime:true,birthTime:'',gender:'male',mbti:'ISFP'},2027);
assert.equal(builder.prepare(unknown),null);
const sameUser={calendar:'solar',birthDate:'1982-06-15',birthTime:'14:20',
 gender:'male',mbti:'ISFP'};
const early=builder.prepare(facts.build(sameUser,2027));
const late=builder.prepare(facts.build({...sameUser,birthTime:'20:20'},2027));
assert(early&&late);
assert.notDeepEqual(early.payload.task.chapters.saju_core.topics.natal_depth.citableFacts,
 late.payload.task.chapters.saju_core.topics.natal_depth.citableFacts);
assert.notEqual(require('./report-core-paid-natal-depth-fact-lock').fromPayload(early.payload).literal,
 require('./report-core-paid-natal-depth-fact-lock').fromPayload(late.payload).literal,
 'the deterministic provider evidence lock must change with the hour');
// Exercise a four-position handwritten candidate for the exact source scope.
const authoredInput={calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,
 birthTime:'14:20',gender:'male',mbti:'ISFP'};
const handwritten=builder.prepare(facts.build(authoredInput,2027));
assert(handwritten);
const handwrittenOfflinePrompt={...handwritten.prompt,qaOfflineEditorialResearchPreview:true};
const handwrittenOfflinePayload=writer.compile(handwrittenOfflinePrompt);
const handwrittenResearch=handwrittenOfflinePayload.task.chapters.saju_core
 .topics.natal_depth.qaOfflineEditorialResearch;
const complete=handwrittenResearch.fullFirstChapterResearch;
const standalone=require('./report-core-paid-one-adult-complete-first-chapter')
 .build(facts.build(authoredInput,2027));
assert(complete,'latest adult full chapter must travel with the provider-ready offline brief');
assert(standalone);
assert.equal(complete.text,standalone.text);
assert.equal(complete.label,standalone.label);
assert.deepEqual(complete.paragraphs,standalone.paragraphs);
assert.deepEqual(complete.sourceRefs,standalone.sourceRefs);
assert(complete.text.length>=720&&complete.text.length<=900);
assert.notEqual(complete.text,handwrittenResearch.editorialReference.text,
 'the offline writer must not silently use the superseded four-pillar excerpt');
assert.equal(complete.sourceInApprovedPaidRequest,false);
assert.equal(handwritten.payload.task.chapters.saju_core.topics.natal_depth
 .qaOfflineEditorialResearch,undefined,
 'the frozen approved and billable QA request remains unchanged');
assert.equal(handwrittenResearch.sourceClass,'authored-specific-four-pillar-candidate');
assert(handwrittenResearch.editorialReference.text.includes('기존 작업 지침'));
assert.equal(handwrittenResearch.chartFingerprint,'壬戌/癸丑/乙未/癸未');
const winter=handwrittenResearch.exactWinterClassicalScope;
assert(winter,'exact 14:20 winter research should reach QA model-facing task');
assert.equal(winter.kind,'qa-exact-winter-source-scope-editorial-only-v1');
assert.equal(winter.sourceScope.whichMethodDominates,'unresolved');
assert.equal(winter.sourceScope.paidWriterAuthorized,false);
assert.equal(winter.sourceScope.automaticLifeOutcome,false);
assert.equal(winter.paragraphs.length,2);
assert.equal(winter.additionalFactsComparedWithMonthOnly.length,4);
assert(winter.paragraphs.flatMap(x=>x.sourceRefs).every(ref=>
 handwrittenOfflinePayload.source[ref]!==undefined));
assert.equal(winter.approvedForCustomer,false);
assert.equal(winter.paidWriterAuthorized,false);
assert.equal(winter.providerCalls,0);
assert.equal(winter.releaseVerdict,'not-approved');
assert(handwrittenOfflinePayload.task.editorialGoal.includes(
 'qaOfflineEditorialResearch.exactWinterClassicalScope'));
assert.equal(handwritten.payload.task.chapters.saju_core.topics.natal_depth
 .qaOfflineEditorialResearch,undefined,
 'exact winter research must never reach frozen approved QA');
const contrastHour=builder.prepare(facts.build({...authoredInput,birthTime:'20:20'},2027));
assert(contrastHour);
assert.notEqual(handwrittenResearch.chartFingerprint,
 writer.compile({...contrastHour.prompt,qaOfflineEditorialResearchPreview:true})
  .task.chapters.saju_core.topics.natal_depth
  .qaOfflineEditorialResearch.chartFingerprint);
assert.equal(writer.compile({...contrastHour.prompt,
 qaOfflineEditorialResearchPreview:true}).task.chapters.saju_core.topics.natal_depth
 .qaOfflineEditorialResearch.fullFirstChapterResearch,null,
 'changed birth hour must not reuse the complete adult first chapter');
assert.equal(writer.compile({...contrastHour.prompt,
 qaOfflineEditorialResearchPreview:true}).task.chapters.saju_core.topics.natal_depth
 .qaOfflineEditorialResearch.exactWinterClassicalScope,null,
 'changed hour must never inherit the exact 14:20 classical source review');
assert.notEqual(handwrittenResearch.editorialReference.text,
 writer.compile({...contrastHour.prompt,qaOfflineEditorialResearchPreview:true})
  .task.chapters.saju_core.topics.natal_depth
  .qaOfflineEditorialResearch.editorialReference.text);
const base=require('./report-analysis-guidance');
const p=facts.build(sameUser,2027),plan=base.preflight(p).saju_core;
const defaultPrompt={stage:'body',facts:p,requestedSections:['saju_core'],
 analysisGuidance:{...base.forRequest(['saju_core'],sameUser.mbti),
  editorialBlueprint:{saju_core:plan}}};
const locked=require('./report-core-thesis').forPrompt(early.prompt);
const mockOutput={chapters:{saju_core:{
 title:locked.title,keyJudgment:locked.keyJudgment,
 paragraphs:{
  temperament:null,
  strength:{label:'태어난 달의 검증된 두 가지 뜻',text:'월간과 대표 속글자의 실제 계산을 구별한 가상의 선택에 대한 풀이입니다.'},
  natal_depth:{label:'연·일·시의 차이를 구별한 추가 해석',text:'출생 해와 날과 시간의 다른 계산 위치를 별도로 설명한 검토용 문단입니다.'}
 }}},finalJudgment:null,cover:null};
const rebuilt=wire.decode(mockOutput,early.prompt);
assert.deepEqual(rebuilt.sections[0].bodyTopics,['strength','natal_depth'],
 'the QA-only depth paragraph must survive the ACTUAL provider response decoder');
assert.equal(rebuilt.sections[0].body.length,2);
const auditTransport=require('./report-instruction-audit');
assert.deepEqual(auditTransport.inspectTransport(early.prompt,early.payload),[],
 'actual QA compact request must preserve both the established facts and separate editorial reference');
const offlineEarly={...early.prompt,qaOfflineEditorialResearchPreview:true};
const offlineEarlyPayload=writer.compile(offlineEarly);
assert.deepEqual(auditTransport.inspectTransport(offlineEarly,offlineEarlyPayload),[],
 'separate offline preview must preserve canonical QA sources and verified research');
assert(!Object.hasOwn(early.payload.task.chapters.saju_core.topics.natal_depth,
 'qaOfflineEditorialResearch'));
const leaked=structuredClone(early.payload);
leaked.task.chapters.saju_core.topics.natal_depth.qaOfflineEditorialResearch=
 offlineEarlyPayload.task.chapters.saju_core.topics.natal_depth.qaOfflineEditorialResearch;
assert(auditTransport.inspectTransport(early.prompt,leaked)
 .includes('qa-offline-reference-leaked-into-billable-envelope'),
 'the previously approved billed QA task must never acquire unapproved offline prose');
const forged=structuredClone(early.payload);
forged.task.chapters.saju_core.topics.natal_depth.evidenceFocus.sourceRefs=
 ['natal.month.stem'];
assert(auditTransport.inspectTransport(early.prompt,forged)
 .includes('qa-natal-depth-evidence-brief-drift'),
 'tampering with contextual provenance must fail the paid transport audit');
const alteredComplete=structuredClone(handwrittenOfflinePayload);
alteredComplete.task.chapters.saju_core.topics.natal_depth
 .qaOfflineEditorialResearch.fullFirstChapterResearch.paragraphs[1].text=
 'FORGED READABLE CONTENT';
assert(require('./report-instruction-audit')
 .inspectTransport(handwrittenOfflinePrompt,alteredComplete)
 .includes('qa-natal-depth-editorial-reference-drift'),
 'a changed full-chapter paragraph must fail the provider-payload audit');
const addedCitation=structuredClone(handwrittenOfflinePayload);
addedCitation.task.chapters.saju_core.topics.natal_depth
 .qaOfflineEditorialResearch.fullFirstChapterResearch.sourceRefs.push('annual.fake');
assert(require('./report-instruction-audit')
 .inspectTransport(handwrittenOfflinePrompt,addedCitation)
 .includes('qa-natal-depth-editorial-reference-drift'),
 'invented provider citations must fail the exact source check');
const alteredEditorial=structuredClone(handwrittenOfflinePayload);
alteredEditorial.task.chapters.saju_core.topics.natal_depth
 .qaOfflineEditorialResearch.editorialReference.text=
 'NO VALIDATED INTERPRETATION';
assert(auditTransport.inspectTransport(handwrittenOfflinePrompt,alteredEditorial)
 .includes('qa-natal-depth-editorial-reference-drift'),
 'an editorial excerpt changed after source verification must be rejected');
const alteredMachine=structuredClone(offlineEarlyPayload);
alteredMachine.task.chapters.saju_core.topics.natal_depth
 .qaOfflineEditorialResearch.computedContrast.premise=
 'INVALID MACHINE CLAIM';
assert(auditTransport.inspectTransport(offlineEarly,alteredMachine)
 .includes('qa-natal-depth-editorial-reference-drift'),
 'a forged machine contrast must be rejected before any provider call');
const forgedSource=structuredClone(early.payload);
delete forgedSource.source['natal.year.stem'];
assert(preflight.inspect(early.prompt,forgedSource,
 writer.schema(early.prompt,wire.schemaFor(early.prompt,schema))).length>0,
 'wrong outgoing sources may not satisfy the optional depth topic');
const defaultWire=wire.schemaFor(defaultPrompt,schema);
assert.deepEqual(Object.keys(defaultWire.properties.chapters.properties.saju_core.properties.paragraphs.properties),
 ['temperament','strength']);
assert.deepEqual(Object.keys(writer.compile(defaultPrompt).task.chapters.saju_core.topics),
 ['temperament','strength']);
// Verify the SAME actual OpenAI request machinery under intercepted fetch.
(async()=>{
 const oldFetch=global.fetch,oldKey=process.env.OPENAI_API_KEY;
 const oldModel=process.env.REPORT_MODEL,oldURL=process.env.REPORT_MODEL_URL;
 let count=0;
 try{
  process.env.OPENAI_API_KEY='QA_INTERCEPTED_NO_NETWORK';
  process.env.REPORT_MODEL='gpt-4.1';delete process.env.REPORT_MODEL_URL;
  global.fetch=async(url,opts)=>{
   count++;
   assert.equal(url,'https://api.openai.com/v1/responses');
   const payload=JSON.parse(opts.body);
   const sent=JSON.parse(payload.input[1].content);
   assert.equal(payload.text.format.strict,true);
   assert(sent.task.chapters.saju_core.topics.natal_depth);
   assert(!Object.hasOwn(sent.task.chapters.saju_core.topics.natal_depth,
    'qaOfflineEditorialResearch'),
    'the frozen approved QA request must never include an unapproved editorial excerpt');
   assert.deepEqual(sent.task.chapters.saju_core.topics.natal_depth.citableFacts.map(x=>x.id),
    early.payload.task.chapters.saju_core.topics.natal_depth.citableFacts.map(x=>x.id));
   assert.deepEqual(
    payload.text.format.schema.properties.chapters.properties.saju_core.properties.paragraphs
     .properties.natal_depth.anyOf.find(x=>x.type==='object').properties.basis.properties.refs.items.enum,
    early.payload.task.chapters.saju_core.topics.natal_depth.citableFacts.map(x=>x.id));
   throw Error('STOP_BEFORE_NETWORK');
  };
  await assert.rejects(require('./server').callOpenAI(early.prompt),/STOP_BEFORE_NETWORK|AI report service request failed/);
  assert.equal(count,1);
  await assert.rejects(require('./server').callOpenAI(offlineEarly),
   /QA_OFFLINE_EDITORIAL_REFERENCE_NEVER_BILLABLE/,
   'new editorial preview must fail before even an intercepted provider fetch');
  assert.equal(count,1,'offline reference must not cause a second or billable fetch');
 }finally{
  global.fetch=oldFetch;
  if(oldKey===undefined)delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY=oldKey;
  if(oldModel===undefined)delete process.env.REPORT_MODEL;
  else process.env.REPORT_MODEL=oldModel;
  if(oldURL===undefined)delete process.env.REPORT_MODEL_URL;
  else process.env.REPORT_MODEL_URL=oldURL;
 }
 console.log('QA_NATAL_DEPTH_PREVIEW='+JSON.stringify({eligible:allowed,blocked:missing,authored,
  machine,authoredReferences,machineOnlyHypotheses,
  editedAdultFirstChapterInOfflinePayload:true,
  approvedPaidRequestFrozen:true,completeDraftProviderCalls:0,
  transportIntercepted:count,apiCalls:0,productionEnabled:false}));
 console.log('PASS QA-only verified natal-depth strict provider request, exact citation enum, default live-core unchanged');
})().catch(e=>{console.error(e);process.exitCode=1});
