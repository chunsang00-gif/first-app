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
 assert(!JSON.stringify(payload).includes('coverNaturalnessRule'));
 assert(JSON.stringify(payload).length<JSON.stringify(prompt).length*.65);
 const t=generation.schema(prompt,wire.schemaFor(prompt,schema));
 const chapters={};
 for(const id of prompt.requestedSections){
  const plan=prompt.analysisGuidance.editorialBlueprint[id],anchor=plan.anchorTopic;
  const slots=t.properties.chapters.properties[id].properties.paragraphs.properties;
  assert.deepEqual(Object.keys(slots[anchor].properties),['basis','label','text']);
  assert(!Object.hasOwn(t.properties.chapters.properties[id].properties,'evidence'));
  chapters[id]={title:'검증 제목',keyJudgment:'검증 판단',mood:'reflective',paragraphs:Object.fromEntries(Object.keys(plan.topicTasks).map(topic=>[topic,topic===anchor?{basis:{refs:[id==='mbti_contradiction'?'person.mbti':'natal.month.stem'],interpretation:'해당 계산에 관한 전통적 해석',condition:'새 일을 맡는 상황',limit:'실제 행동을 관찰한 자료는 아님'},label:'검증 소제목',text:'뜻과 이유를 충분히 설명하는 검증 문장입니다.'}:null]))};
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
 const synthesis={...prompt,stage:'synthesis',requestedSections:[],completedReport:{sections:wire.decode(restored,prompt).sections}};
 const summary=generation.compile(synthesis);
 assert.deepEqual(summary.task.completedReport,synthesis.completedReport);
 assert(summary.source['person.mbti']);
 assert.deepEqual(generation.schema(synthesis,t),t);
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
