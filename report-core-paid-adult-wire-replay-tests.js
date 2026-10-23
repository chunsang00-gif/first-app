'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const replay=require('./report-core-paid-adult-wire-replay');
const responseDecode=require('./report-response-decoder').decode;
const gate=require('./report-core-paid-natal-depth-response-gate');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const schema=require('./report-schema.json');
const audit=require('./report-instruction-audit');
const preview=require('./report-core-paid-natal-depth-preview');
const expected=require('./report-core-paid-one-adult-complete-first-chapter');
function validateStrict(node,data,path='$'){
 if(node.anyOf)return node.anyOf.some(x=>validateStrict(x,data,path).length===0)?
  []:['SCHEMA_ANY_OF:'+path];
 const errors=[];
 if(node.enum&&!node.enum.includes(data))errors.push('SCHEMA_ENUM:'+path);
 if(node.type==='null'&&data!==null)errors.push('SCHEMA_NULL:'+path);
 if(node.type==='string'&&typeof data!=='string')errors.push('SCHEMA_STRING:'+path);
 if(node.type==='array'){
  if(!Array.isArray(data))errors.push('SCHEMA_ARRAY:'+path);
  else data.forEach((x,i)=>errors.push(...validateStrict(node.items,x,path+'['+i+']')));
 }
 if(node.type==='object'){
  if(!data||typeof data!=='object'||Array.isArray(data))
   errors.push('SCHEMA_OBJECT:'+path);
  else{
   for(const key of node.required||[])
    if(!Object.hasOwn(data,key))errors.push('SCHEMA_REQUIRED:'+path+'.'+key);
   if(node.additionalProperties===false)
    for(const key of Object.keys(data))
     if(!Object.hasOwn(node.properties||{},key))
      errors.push('SCHEMA_EXTRA:'+path+'.'+key);
   for(const [k,value] of Object.entries(data))
    if(node.properties?.[k])
     errors.push(...validateStrict(node.properties[k],value,path+'.'+k));
  }
 }
 return errors;
}
const input={calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,
 birthTime:'14:20',gender:'male',mbti:'ISFP'};
const packet=facts.build(input,2027),built=replay.build(packet);
assert(built);
const authored=expected.build(packet);
assert.equal(built.status,'synthetic-qa-response-only');
assert.equal(built.approvedForCustomer,false);
assert.equal(built.billableProviderCalls,0);
assert.equal(built.response.chapters.saju_core.paragraphs.natal_depth.text,
 authored.text);
const topic=built.payload.task.chapters.saju_core.topics.natal_depth;
assert.equal(topic.qaOfflineEditorialResearch
 .fullFirstChapterResearch.text,authored.text);
assert(built.payload.task.editorialGoal.includes(
 'qaOfflineEditorialResearch.fullFirstChapterResearch'),
 'the QA research benchmark must be referenced by the actual model-facing editorial brief');
assert(built.payload.task.editorialGoal.includes('품질 비교용 초안'));
assert(built.payload.task.editorialGoal.includes('검수 미완료'));
assert.equal(built.payload.task.editorialGoal,writer.editorialGoalFor(built.prompt));
assert.deepEqual(audit.inspectTransport(built.prompt,built.payload),[]);
const strict=writer.schema(built.prompt,wire.schemaFor(built.prompt,schema));
assert.deepEqual(validateStrict(strict,built.response),[],
 'the complete adult editorial model fixture must obey actual generated provider JSON schema');
const errors=gate.inspect(built.response,built.prompt);
assert.deepEqual(errors,[],
 'complete adult manuscript must pass real QA depth semantic/provenance gate');
const rendered=responseDecode(built.response,built.prompt);
assert.equal(rendered.sections.length,1);
assert.deepEqual(rendered.sections[0].bodyTopics,['strength','natal_depth']);
assert.deepEqual(rendered.sections[0].body[1],authored.text);
assert.equal(rendered.sections[0].bodyLabels[1],authored.label);
assert.equal(rendered.sections[0].evidence.some(s=>s.includes('natal.year.stem')
 &&s.includes('natal.hour.stem')),true);
assert.equal(gate.assert(built.response,built.prompt).releaseVerdict,'not-approved');
const ordinary=preview.prepare(packet);
assert(ordinary);
assert(!ordinary.payload.task.editorialGoal.includes(
 'qaOfflineEditorialResearch.fullFirstChapterResearch'),
 'previously authorized paid QA must remain unchanged');
assert(!Object.hasOwn(ordinary.payload.task.chapters.saju_core.topics.natal_depth,
 'qaOfflineEditorialResearch'));
assert.deepEqual(writer.compile({...built.prompt,
 qaOfflineEditorialResearchPreview:false}),ordinary.payload,
 'the offline comparison must be the only source of new model-facing guidance');
const replacedGoal=structuredClone(built.payload);
replacedGoal.task.editorialGoal=ordinary.payload.task.editorialGoal;
assert(audit.inspectTransport(built.prompt,replacedGoal).includes(
 'body-editorial-brief-dropped'),
 'transport audits must reject a dropped offline editorial benchmark');
assert.throws(()=>writer.compile({...built.prompt,qaNatalDepthPreview:false}),
 /QA_EDITORIAL_OFFLINE_SCOPE_REQUIRED/);
const oldPayload=writer.compile(ordinary.prompt);
assert(!Object.hasOwn(oldPayload.task.chapters.saju_core.topics.natal_depth,
 'qaOfflineEditorialResearch'));
assert.deepEqual(oldPayload,ordinary.payload);
const unsafe=structuredClone(built.response);
unsafe.chapters.saju_core.paragraphs.natal_depth.basis.refs.push('person.mbti');
assert(validateStrict(strict,unsafe).some(x=>x.includes('SCHEMA_ENUM')));
assert(gate.inspect(unsafe,built.prompt).includes('QA_DEPTH_INVALID_EVIDENCE_REFS'));
assert.throws(()=>responseDecode(unsafe,built.prompt),
 /QA_NATAL_DEPTH_RESPONSE_REJECTED|unverified source|basis/);
const wrongLock=structuredClone(built.response);
wrongLock.chapters.saju_core.paragraphs.natal_depth.basis.interpretation=
 '직접 계산한 근거가 없는 출력';
assert(validateStrict(strict,wrongLock).some(x=>x.includes('SCHEMA_ENUM')));
assert(gate.inspect(wrongLock,built.prompt).includes('QA_DEPTH_FACT_LOCK_DIVERGED'));
assert.throws(()=>responseDecode(wrongLock,built.prompt),/QA_NATAL_DEPTH_FACT_LOCK_DIVERGED/);
const missed=structuredClone(built.response);
missed.chapters.saju_core.paragraphs.natal_depth=null;
assert(validateStrict(strict,missed).length>0);
assert(gate.inspect(missed,built.prompt).includes('QA_DEPTH_REQUIRED_READING_MISSING'));
const duplicated=structuredClone(built.response);
duplicated.chapters.saju_core.paragraphs.natal_depth.text=
 duplicated.chapters.saju_core.paragraphs.strength.text;
assert(gate.inspect(duplicated,built.prompt).includes('QA_DEPTH_REPEATS_MONTH_CORE'));
const replaced=structuredClone(built.response);
replaced.chapters.saju_core.paragraphs.natal_depth.text=
 '태어난 해에서는 정해진 규칙을 지킵니다. 태어난 시간에는 돈을 벌어 성공합니다.';
assert(gate.inspect(replaced,built.prompt).length>0);
const changed=facts.build({...input,birthTime:'20:20'},2027);
assert.equal(replay.build(changed),null,'changed birth hour must withhold authored manuscript');
const incorrect=facts.build({...input,birthDate:'1982-11-23'},2027);
assert.equal(replay.build(incorrect),null,'changed birth date must withhold authored manuscript');
assert.equal(replay.build(facts.build({...input,gender:'female'},2027)),null,
 'different gender must not receive the frozen QA response');
assert.equal(replay.build(facts.build({...input,mbti:'ENTJ'},2027)),null,
 'different MBTI must not receive the frozen QA response');
assert.equal(replay.build(facts.build(input,2028)),null,
 'different target year must not reuse the 2027 response fixture');
console.log('QA_ADULT_ACTUAL_WIRE_REPLAY='+JSON.stringify({
 chart:packet.chart,readerChars:authored.text.length,
 schemaShape:'provider-real-strict-JSON',
 approvedPaidSnapshotUnchanged:true,
 schemaPassed:true,decoderPassed:true,
 semanticAndCitationGatePassed:true,
 newAdultTextVsPaidMonth:'different-verifiable-source-locations',
 blockedCases:['wrong-citation','wrong-basis-lock','missing-depth',
  'month-copy','invented-position-outcome','changed-hour','changed-day'],
 modelActuallyGeneratedThis:false,humanInterpretationValidated:false,
 paidApiCalls:0,readyForSale:false
}));
console.log('PASS actual strict model response shape and real decoder accept audited adult draft without altering approved paid wire');
