'use strict';
const assert=require('node:assert/strict');
const generation=require('./report-generation-request'),wire=require('./report-wire');
const {generate}=require('./report-server-contract');
const schema=require('./report-schema.json');
(async()=>{
 let prompt;
 await assert.rejects(generate({calendar:'solar',birthDate:'1990-05-15',birthTime:'10:30',gender:'male',mbti:'INTJ'},async p=>{prompt=p;throw Error('OFFLINE');}),/OFFLINE/);
 const payload=generation.compile(prompt);
 assert(!Object.hasOwn(payload,'rules'));
 assert(payload.task.chapters.mbti_contradiction.comparisonEvidence.includes('모두 인용한다'));
 assert(!Object.hasOwn(payload.source,'facts.structuralEvidence'),'wide structural facts must not hide provenance');
 assert(payload.source['facts.structuralEvidence.monthCommand'],'month command must be separately identified');
 assert(payload.task.chapters.saju_core.safety.avoid.includes('상관'),'core interpretation limitation must survive compact compilation');
 assert(payload.task.chapters.mbti_contradiction.safety.avoid.includes('우열'),'MBTI comparison safety must survive compact compilation');
 assert(payload.task.chapters.saju_core.topics.temperament.interpretationBoundary.includes('전통적 해석'),'topic evidence limits must survive compact compilation');
 const scopedIds=['money','year_2027_money'];
 const guidance=require('./report-analysis-guidance');
 const allPlans=guidance.preflight(prompt.facts);
 const moneyRequest=generation.compile({...prompt,requestedSections:scopedIds,analysisGuidance:{
  ...guidance.forRequest(scopedIds,prompt.facts.person?.mbti),
  editorialBlueprint:Object.fromEntries(scopedIds.map(id=>[id,allPlans[id]]))
 }});
 assert(moneyRequest.task.chapters.money.safety.avoid.includes('금전'),'money-specific prohibitions must reach writer');
 assert(moneyRequest.task.chapters.year_2027_money.annualScope,'annual domain evidence gate must remain visible');
 assert(moneyRequest.task.chapters.money.topics.earning.evidenceReuseBoundary?.rule,'prior fact ownership must remain visible to writer');
 assert(!JSON.stringify(payload).includes('coverNaturalnessRule'));
 assert(JSON.stringify(payload).length<JSON.stringify(prompt).length*.65);
 const t=generation.schema(prompt,wire.schemaFor(prompt,schema));
 const chapters={};
 for(const id of prompt.requestedSections){
  const plan=prompt.analysisGuidance.editorialBlueprint[id],anchor=plan.anchorTopic;
  const slots=t.properties.chapters.properties[id].properties.paragraphs.properties;
  assert.deepEqual(Object.keys(slots[anchor].properties),['basis','label','text']);
  assert(!Object.hasOwn(t.properties.chapters.properties[id].properties,'evidence'));
  chapters[id]={title:'검증 제목',keyJudgment:'검증 판단',mood:'reflective',paragraphs:Object.fromEntries(Object.keys(plan.topicTasks).map(topic=>[topic,topic===anchor?{basis:{refs:id==='mbti_contradiction'?['person.mbti','natal.month.stem']:['natal.month.stem'],interpretation:'해당 계산에 관한 전통적 해석',condition:'새 일을 맡는 상황',limit:'실제 행동을 관찰한 자료는 아님'},label:'검증 소제목',text:'뜻과 이유를 충분히 설명하는 검증 문장입니다.'}:null]))};
 }
 const raw={chapters,cover:null,finalJudgment:null};
 const restored=generation.restoreEvidence(raw,prompt);
 assert(restored.chapters.saju_core.evidence[0].includes('월간 辛 겁재'));
 assert.equal(wire.decode(restored,prompt).sections.length,2);
 assert(raw.chapters.saju_core.paragraphs.temperament.basis,'do not mutate private source response');
 for(const modify of [b=>b.refs=[],b=>b.refs=['invented'],b=>b.condition='',b=>delete b.interpretation]){
  const bad=structuredClone(raw);modify(bad.chapters.saju_core.paragraphs.temperament.basis);
  assert.throws(()=>generation.restoreEvidence(bad,prompt),/verified paragraph basis/);
 }
 // A real source elsewhere in the packet cannot replace this topic's evidence.
 const irrelevant=structuredClone(raw);
 irrelevant.chapters.saju_core.paragraphs.temperament.basis.refs=['person.mbti'];
 assert.throws(()=>generation.restoreEvidence(irrelevant,prompt),/unrelated paragraph basis/);
 const mixed=structuredClone(raw);
 mixed.chapters.saju_core.paragraphs.temperament.basis.refs=['natal.month.stem','person.mbti'];
 assert.throws(()=>generation.restoreEvidence(mixed,prompt),/unrelated paragraph basis/);
 const allowed=t.properties.chapters.properties.saju_core.properties.paragraphs.properties.temperament.properties.basis.properties.refs.items.enum;
 assert(allowed.includes('natal.month.stem'));
 assert(!allowed.includes('person.mbti'),'provider should not offer unrelated citations for this topic');
 // MBTI comparison needs two independent inputs; the label alone is not evidence.
 const mbtiOnly=structuredClone(raw);
 mbtiOnly.chapters.mbti_contradiction.paragraphs.agreement.basis.refs=['person.mbti'];
 assert.throws(()=>generation.restoreEvidence(mbtiOnly,prompt),/missing dual MBTI\/Saju evidence/);
 const sajuOnly=structuredClone(raw);
 sajuOnly.chapters.mbti_contradiction.paragraphs.agreement.basis.refs=['natal.month.stem'];
 assert.throws(()=>generation.restoreEvidence(sajuOnly,prompt),/missing dual MBTI\/Saju evidence/);
 const comparisonRefs=t.properties.chapters.properties.mbti_contradiction.properties.paragraphs.properties.agreement.properties.basis.properties.refs.items.enum;
 assert(comparisonRefs.includes('person.mbti')&&comparisonRefs.includes('natal.month.stem'));
 // No-evidence anchors must not cite unrelated facts just to satisfy a required field.
 const limitedPrompt=structuredClone(prompt);
 limitedPrompt.analysisGuidance.editorialBlueprint.saju_core.topicTasks.temperament.mode='state-limits';
 const ungrounded=structuredClone(raw);
 assert.throws(()=>generation.restoreEvidence(ungrounded,limitedPrompt),/fabricated sources for unsupported topic/);
 ungrounded.chapters.saju_core.paragraphs.temperament.basis.refs=[];
 assert.doesNotThrow(()=>generation.restoreEvidence(ungrounded,limitedPrompt));
 const limitedSchema=generation.schema(limitedPrompt,wire.schemaFor(limitedPrompt,schema));
 assert(limitedSchema.properties.chapters.properties.saju_core.properties.paragraphs.properties.temperament.properties.basis.properties.refs.description.includes('빈 배열'));
 const synthesis={...prompt,stage:'synthesis',requestedSections:[],completedReport:{sections:wire.decode(restored,prompt).sections}};
 const summary=generation.compile(synthesis);
 assert.deepEqual(summary.task.completedReport,synthesis.completedReport);
 assert(summary.source['person.mbti']);
 assert.deepEqual(generation.schema(synthesis,t),t);
 // The compact request must preserve missing-MBTI and unknown-hour boundaries.
 let unknownPrompt;
 await assert.rejects(generate({calendar:'solar',birthDate:'1990-05-15',unknownBirthTime:true,gender:'male',mbti:'모름'},async p=>{unknownPrompt=p;throw Error('OFFLINE_UNKNOWN');}),/OFFLINE_UNKNOWN/);
 const unknownPayload=generation.compile(unknownPrompt);
 assert(!Object.hasOwn(unknownPayload.source,'person.mbti'),'unknown MBTI must never create a preference source');
 assert(!Object.keys(unknownPayload.source).some(x=>x.startsWith('natal.hour.')),'unknown hour must not create birth-hour facts');
 assert(unknownPayload.task.chapters.mbti_contradiction.safety.avoid.includes('입력하지 않은 성격'),'saju-only guard must be preserved');
 const oldFetch=global.fetch,oldKey=process.env.OPENAI_API_KEY,oldModel=process.env.REPORT_MODEL;
 let calls=0;
 try{
  process.env.OPENAI_API_KEY='offline-placeholder';process.env.REPORT_MODEL='offline-placeholder';
  global.fetch=async(url,options)=>{
   calls++;const body=JSON.parse(options.body);
   assert.deepEqual(JSON.parse(body.input[1].content),payload);
   assert(body.input[0].content.includes(generation.policy));
   assert(body.text.format.schema.properties.chapters.properties.saju_core.properties.paragraphs.properties.temperament.properties.basis);
   return {ok:true,json:async()=>({output_text:JSON.stringify(raw)})};
  };
  const decoded=await require('./server').callOpenAI(prompt);
  assert.equal(decoded.sections.length,2);assert.equal(calls,1);
  const invalid=structuredClone(raw);delete invalid.chapters.saju_core.paragraphs.temperament.basis;
  let archived;
  global.fetch=async()=>({ok:true,json:async()=>({output_text:JSON.stringify(invalid)})});
  await assert.rejects(require('./server').callOpenAI(prompt,value=>{archived=value;}),/verified paragraph basis/);
  assert.deepEqual(archived,invalid,'failed basis must remain available for private QA');
 }finally{global.fetch=oldFetch;for(const [k,v] of [['OPENAI_API_KEY',oldKey],['REPORT_MODEL',oldModel]])if(v===undefined)delete process.env[k];else process.env[k]=v;}
 console.log('PASS compact provider request, paragraph basis, valid references, unknown references blocked, synthesis, actual mocked provider boundary; no paid calls');
 console.log(JSON.stringify({before:JSON.stringify(prompt).length,after:JSON.stringify(payload).length}));
})().catch(e=>{console.error(e);process.exitCode=1});
