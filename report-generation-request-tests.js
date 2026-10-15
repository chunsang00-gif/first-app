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
 assert.deepEqual(payload.task.reusedEvidence,prompt.rules.reusedEvidenceWithPriorConclusions||[],
  'the compact writer request must preserve the server reuse ledger');
 const citationReuse={path:'natal.month.stem',chapter:'saju_core',topic:'temperament',
  previousConclusion:'이전에 월간 근거로 설명한 반응'};
 const withReuse=generation.compile({...prompt,rules:{
  ...prompt.rules,reusedEvidenceWithPriorConclusions:[citationReuse]
 }});
 assert.deepEqual(withReuse.task.reusedEvidence,[citationReuse],
  'actual reused calculated source path and previous conclusion must reach the model');
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
 const financialIds=moneyRequest.task.chapters.money.topics.earning.allowedSourceRefs;
 const allowedKinds=new Set(['정재','편재','식신','상관']);
 assert(Array.isArray(financialIds));
 assert(financialIds.every(id=>id.startsWith('natal.')&&allowedKinds.has(moneyRequest.source[id]?.tenGod)),'financial citations must match calculated wealth/output classifications');
 assert.equal(moneyRequest.task.chapters.money.topics.risk.mode,'state-limits','natal clashes are not proof of financial loss');
 const moneyPrompt={...prompt,requestedSections:scopedIds,analysisGuidance:{
  ...guidance.forRequest(scopedIds,prompt.facts.person?.mbti),
  editorialBlueprint:Object.fromEntries(scopedIds.map(id=>[id,allPlans[id]]))
 }};
 const moneySchema=generation.schema(moneyPrompt,wire.schemaFor(moneyPrompt,schema));
 const moneySlots=moneySchema.properties.chapters.properties.money.properties.paragraphs.properties;
 if(financialIds.length){
  assert.equal(moneyRequest.task.chapters.money.topics.earning.mode,'use-primary');
  assert.deepEqual(new Set(moneySlots.earning.properties.basis.properties.refs.items.enum),new Set(financialIds));
 }else assert.equal(moneySlots.earning.type,'null','no financial sources must not create a paid money claim');
 assert.equal(moneySlots.risk.type,'null','unsupported financial-loss prediction must not be offered to the model');
 const financeUnavailable=structuredClone(prompt.facts);
 for(const position of ['year','month','day','hour']){
  const group=financeUnavailable.facts.tenGods[position];if(!group)continue;
  group.stemTenGod='비견';
  for(const hidden of group.hiddenStems||[])hidden.tenGod='비견';
 }
 const noFinancePlan=guidance.preflight(financeUnavailable);
 assert.equal(noFinancePlan.money.hasGroundedTopic,false,'no wealth/output relationship must not be treated as a paid insight');
 assert(Object.values(noFinancePlan.money.topicTasks).every(task=>task.mode==='state-limits'));

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
 assert.throws(()=>generation.restoreEvidence(ungrounded,limitedPrompt),/missing verified paragraph basis/);
 const limitedBasis=ungrounded.chapters.saju_core.paragraphs.temperament.basis;
 limitedBasis.refs=null;limitedBasis.interpretation=null;limitedBasis.condition=null;
 assert.doesNotThrow(()=>generation.restoreEvidence(ungrounded,limitedPrompt));
 const wrongLimit=structuredClone(ungrounded);
 wrongLimit.chapters.saju_core.paragraphs.temperament.basis.refs=['natal.month.stem'];
 assert.throws(()=>generation.restoreEvidence(wrongLimit,limitedPrompt),/missing verified paragraph basis/);
 const limitedSchema=generation.schema(limitedPrompt,wire.schemaFor(limitedPrompt,schema));
 const limitedField=limitedSchema.properties.chapters.properties.saju_core.properties.paragraphs.properties.temperament.properties.basis;
 assert.equal(limitedField.properties.refs.type,'null','not even a valid citation is allowed when evidence is insufficient');
 assert.equal(limitedField.properties.interpretation.type,'null','do not invent an interpretation with missing evidence');
 assert.equal(limitedField.properties.condition.type,'null','do not invent a supporting condition');
 const synthesis={...prompt,stage:'synthesis',requestedSections:[],completedReport:{sections:wire.decode(restored,prompt).sections}};
 const summary=generation.compile(synthesis);
 assert.deepEqual(summary.task.completedReport,synthesis.completedReport);
 assert(summary.source['person.mbti']);
 assert.deepEqual(generation.schema(synthesis,t),t);
 // Two-chapter body fixture is not a valid three-card premium cover.
 const synthesisForCover={...synthesis,includeCover:true,includeFinal:true,
  completedReport:{sections:[...synthesis.completedReport.sections,{id:'decision'}]}};
 const completedIds=synthesisForCover.completedReport.sections.map(section=>section.id);
 const synthesisTransport=wire.schemaFor(synthesisForCover,schema);
 const synthesisSchema=generation.schema(synthesisForCover,synthesisTransport);
 const validHighlightIds=synthesisSchema.properties.cover.properties.highlights.items.properties.sectionId.enum;
 assert.deepEqual(validHighlightIds,completedIds,'paid cover may reference only drafted chapters');
 assert(!validHighlightIds.includes('year_2027'),'missing chapters must never appear in synthesis highlight choices');

 // The compact request must preserve missing-MBTI and unknown-hour boundaries.
 let unknownPrompt;
 await assert.rejects(generate({calendar:'solar',birthDate:'1990-05-15',unknownBirthTime:true,gender:'male',mbti:'모름'},async p=>{unknownPrompt=p;throw Error('OFFLINE_UNKNOWN');}),/OFFLINE_UNKNOWN/);
 const unknownPayload=generation.compile(unknownPrompt);
 assert(!Object.hasOwn(unknownPayload.source,'person.mbti'),'unknown MBTI must never create a preference source');
 assert(!Object.keys(unknownPayload.source).some(x=>x.startsWith('natal.hour.')),'unknown hour must not create birth-hour facts');
 assert(unknownPayload.task.chapters.mbti_contradiction.safety.avoid.includes('입력하지 않은 성격'),'saju-only guard must be preserved');
 const unknownSchema=generation.schema(unknownPrompt,wire.schemaFor(unknownPrompt,schema));
 const noMbtiSlots=unknownSchema.properties.chapters.properties.mbti_contradiction.properties.paragraphs.properties;
 assert.equal(noMbtiSlots.agreement.type,'null','do not manufacture an MBTI agreement without submitted type');
 assert.equal(noMbtiSlots.difference.type,'object','saju-only explanation can use the natal comparison question');
 assert(!noMbtiSlots.difference.properties.basis.properties.refs.items.enum.includes('person.mbti'));
 assert.equal(unknownPayload.task.chapters.mbti_contradiction.comparisonEvidence,null);

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
