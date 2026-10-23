'use strict';
// No requests, no provider. Test the actual QA writer's STRUCTURED OUTPUT
// contract, evidence restoration and reader-facing semantic gate with the
// final 826-character curated adult manuscript, not the superseded draft.
// Passing these structural checks is NOT professional or paid approval.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const preview=require('./report-core-paid-natal-depth-preview');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const decoder=require('./report-response-decoder');
const guard=require('./report-core-paid-natal-depth-response-gate');
const preflight=require('./report-provider-preflight');
const audit=require('./report-instruction-audit');
const lock=require('./report-core-paid-natal-depth-fact-lock');
const manuscript=require('./report-core-paid-one-adult-complete-first-chapter');
const core=require('./report-core-knowledge-engine');
const reader=require('./report-reader-policy');
const schemaSource=require('./report-schema.json');
const input={calendar:'lunar',birthDate:'1982-11-24',
 leapMonth:false,birthTime:'14:20',gender:'male',mbti:'ISFP'};
const packet=facts.build(input,2027);
const draft=manuscript.build(packet),built=preview.prepare(packet);
assert(draft&&built);
assert.equal(draft.text.length,826);
assert.equal(built.prompt.qaNatalDepthPreview,true);
const offlinePrompt={...built.prompt,qaOfflineEditorialResearchPreview:true};
const offlinePayload=writer.compile(offlinePrompt);
const research=offlinePayload.task.chapters.saju_core.topics.natal_depth
 .qaOfflineEditorialResearch.fullFirstChapterResearch;
assert(research);
assert.equal(research.text,draft.text);
assert.equal(research.sourceInApprovedPaidRequest,false);
assert.deepEqual(audit.inspectTransport(offlinePrompt,offlinePayload),[]);
assert.deepEqual(audit.inspectTransport(built.prompt,built.payload),[]);
const original=built.payload.task.chapters.saju_core.topics.natal_depth;
assert.equal(original.qaOfflineEditorialResearch,undefined);
const strictBase=JSON.parse(JSON.stringify(schemaSource));
const clean=x=>{
 if(Array.isArray(x))return x.map(clean);
 if(x===null||typeof x!=='object')return x;
 return Object.fromEntries(Object.entries(x).filter(([k,v])=>
   !['$schema','minLength','maxLength','minItems','maxItems','minimum','maximum',
     'pattern','format'].includes(k)&&!(k==='title'&&typeof v==='string'))
  .map(([k,v])=>[k,clean(v)]));
};
const schema=writer.schema(built.prompt,wire.schemaFor(built.prompt,clean(strictBase)));
assert.deepEqual(preflight.inspect(built.prompt,built.payload,schema),[]);
const chapter=schema.properties.chapters.properties.saju_core;
const topics=chapter.properties.paragraphs.properties;
assert.deepEqual(Object.keys(topics),['temperament','strength','natal_depth']);
assert.deepEqual(topics.temperament,{type:'null'});
assert.deepEqual(chapter.required,['title','keyJudgment','mood','paragraphs']);
const strengthRefs=topics.strength.properties.basis.properties.refs.items.enum;
const extraRefs=topics.natal_depth.properties.basis.properties.refs.items.enum;
assert(extraRefs.includes('natal.year.stem'));
assert(extraRefs.includes('natal.hour.stem'));
assert(extraRefs.includes('natal.day.stem'));
assert(extraRefs.includes('facts.natalBranchRelations'));
assert(draft.sourceRefs.every(id=>extraRefs.includes(id)));
assert(!strengthRefs.includes('natal.year.stem'));
assert(!strengthRefs.includes('natal.hour.stem'));
assert(!strengthRefs.includes('facts.natalBranchRelations'));
assert.equal(topics.natal_depth.properties.basis.properties.interpretation.enum[0],
 lock.fromPayload(built.payload).literal);
const canonical=require('./report-core-thesis').forPrompt(built.prompt);
const month=core.compile(packet).reader.paragraphs.strength;
const mainId='natal.month.hidden.'+
 packet.facts.structuralEvidence.monthCommand.mainHiddenStem;
assert(strengthRefs.includes(mainId)&&strengthRefs.includes('natal.month.stem'));
const output={
 chapters:{saju_core:{
  title:canonical.title,keyJudgment:canonical.keyJudgment,mood:'reflective',
  paragraphs:{
   temperament:null,
   strength:{
    label:month.label,text:month.text,
    basis:{
     refs:['natal.month.stem',mainId],
     interpretation:'태어난 달의 두 출처를 구분한 전통 풀이입니다.',
     condition:'하나의 선택 상황을 가정한 월 중심 해석',
     limit:'실제 행동이나 성격을 확인한 결과는 아닙니다.'
    }
   },
   natal_depth:{
    label:draft.label,text:draft.text,
    basis:{
     refs:draft.sourceRefs.slice(),
     interpretation:lock.fromPayload(built.payload).literal,
     condition:'기존 작업 절차를 바꾸자는 제안을 가정한 예시',
     limit:'실제 업무 능력이나 행동은 확인하지 못했으며 전통적 우선순위도 검증되지 않았습니다.'
    }
   }
  }
 }},finalJudgment:null,cover:null
};
// Check the complete JSON output against the actual reduced strict schema.
// The schema is not an article template: 4 editorial paragraphs live inside
// ONE natal_depth.text; adding four new topic IDs would break paid transport.
function strict(node,value,path='$'){
 if(Array.isArray(node.type)?node.type.includes(typeof value):false){} // no-op
 if(node.anyOf){
  const errs=node.anyOf.map((n,i)=>{try{strict(n,value,path);return null;}catch(e){return e.message;}});
  if(errs.every(Boolean))throw Error(path+':no matching anyOf '+errs.join(','));
  return;
 }
 if(node.type==='null'){assert.equal(value,null,path);return;}
 if(node.type==='string'){
  assert.equal(typeof value,'string',path);
  if(node.enum)assert(node.enum.includes(value),path+':outside enum');
  return;
 }
 if(node.type==='array'){
  assert(Array.isArray(value),path);
  for(const [i,v] of value.entries())strict(node.items,v,path+'['+i+']');
  return;
 }
 if(node.type==='object'){
  assert(value&&typeof value==='object'&&!Array.isArray(value),path);
  const actualKeys=Object.keys(value);
  for(const id of node.required||[])assert(Object.hasOwn(value,id),path+':missing '+id);
  if(node.additionalProperties===false)
   assert(actualKeys.every(k=>Object.hasOwn(node.properties||{},k)),
    path+':unknown '+actualKeys.filter(k=>!Object.hasOwn(node.properties||{},k)).join(','));
  for(const [k,v] of Object.entries(value))
   if(node.properties?.[k])strict(node.properties[k],v,path+'.'+k);
  return;
 }
 throw Error('UNKNOWN_SCHEMA_NODE:'+path+'/'+node.type);
}
strict(schema,output);
assert.deepEqual(guard.inspect(output,built.prompt),[],
 'the exact final adult reader draft must survive semantic gate with canonical citations');
const restored=decoder.decode(output,built.prompt);
assert.deepEqual(restored.sections.map(s=>s.id),['saju_core']);
assert.deepEqual(restored.sections[0].bodyTopics,['strength','natal_depth']);
assert.deepEqual(restored.sections[0].bodyLabels,[month.label,draft.label]);
assert.deepEqual(restored.sections[0].body,[month.text,draft.text]);
assert(restored.sections[0].evidence.some(x=>
 x.includes('natal.year.stem')&&x.includes('natal.hour.stem')));
assert.deepEqual(reader.errors(reader.visibleFields(restored)),[]);
assert.equal(draft.readyForSale,false);
assert.equal(research.customerPaidValueProven,false);
assert.equal(research.professionalReaderReviewComplete,false);
function failures(modifier){
 const value=structuredClone(output);
 modifier(value);
 return guard.inspect(value,built.prompt);
}
assert(failures(v=>v.chapters.saju_core.paragraphs.natal_depth=null)
 .includes('QA_DEPTH_REQUIRED_READING_MISSING'));
assert(failures(v=>v.chapters.saju_core.paragraphs.natal_depth.basis.refs
 .push('annual.notVerified')).includes('QA_DEPTH_INVALID_EVIDENCE_REFS'));
assert(failures(v=>v.chapters.saju_core.paragraphs.natal_depth.basis.interpretation=
 '임의의 계산 근거').includes('QA_DEPTH_FACT_LOCK_DIVERGED'));
assert(failures(v=>v.chapters.saju_core.paragraphs.natal_depth.text=
 '승진할 운명입니다.').includes('QA_DEPTH_UNSUPPORTED_PERSONAL_OUTCOME'));
assert(failures(v=>v.chapters.saju_core.paragraphs.natal_depth.text=
 month.text).includes('QA_DEPTH_REPEATS_MONTH_CORE'));
assert.throws(()=>decoder.decode({...output,
 chapters:{saju_core:{...output.chapters.saju_core,title:'임의 제목'}}},built.prompt),
 /first-chapter title\/judgment contract/);
assert.throws(()=>decoder.decode({...output,chapters:{
 saju_core:{...output.chapters.saju_core,paragraphs:{
 ...output.chapters.saju_core.paragraphs,natal_depth:{
 ...output.chapters.saju_core.paragraphs.natal_depth,basis:{
 ...output.chapters.saju_core.paragraphs.natal_depth.basis,
 refs:['natal.year.stem','annual.unverified']
 }}}}}},built.prompt));
const live=require('./report-analysis-guidance').preflight(packet).saju_core;
const realPrompt={stage:'body',facts:packet,requestedSections:['saju_core'],
 analysisGuidance:{...require('./report-analysis-guidance').forRequest(['saju_core'],'ISFP'),
  editorialBlueprint:{saju_core:live}}};
const realSchema=writer.schema(realPrompt,wire.schemaFor(realPrompt,clean(schemaSource)));
assert.deepEqual(Object.keys(realSchema.properties.chapters.properties.saju_core
 .properties.paragraphs.properties),['temperament','strength']);
assert(!Object.hasOwn(writer.compile(realPrompt).task.chapters.saju_core.topics,
 'natal_depth'));
console.log('QA_FULL_ADULT_CHAPTER_OUTPUT_COMPATIBILITY='+JSON.stringify({
 sourceChart:draft.sourceChart,chars:draft.text.length,
 strictSchemaTopicCount:3,flattenedDepthIntoOneReaderTopic:true,
 retainedAdultPassageCount:draft.paragraphs.length,
 internalCitationCount:draft.sourceRefs.length,
 semanticGatePassed:true,responseDecoderPassed:true,
 mutationScenariosRejected:6,professionalApproval:false,
 approvedPaidPayloadUnchanged:true,realApiCalls:0,releaseVerdict:'not-approved'
}));
console.log('PASS actual QA output JSON and reader gate accept exact edited adult first chapter; live paid stays month-only');
