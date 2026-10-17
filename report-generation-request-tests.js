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
 // Audit the ACTUAL transport object rather than trusting the original
 // server prompt. These regressions must fail even if the full prompt is fine.
 const transportAudit=require('./report-instruction-audit');
 assert.deepEqual(transportAudit.inspectTransport(prompt,payload),[]);
 const assertDropped=(change,code)=>{
  const altered=structuredClone(payload);change(altered);
  assert(transportAudit.inspectTransport(prompt,altered).includes(code),
   'provider audit must identify '+code);
  assert.throws(()=>transportAudit.assertTransport(prompt,altered),
   /lost verified writing instructions/);
 };
 assertDropped(p=>{p.task.editorialGoal=null},'body-editorial-brief-dropped');
 assertDropped(p=>{p.task.chapters.saju_core.analysisGoal=null},'chapter-depth-goal-dropped:saju_core');
 assertDropped(p=>{p.task.chapters.saju_core.analysisFocus=null},'chapter-focus-dropped:saju_core');
 assertDropped(p=>{p.task.chapters.mbti_contradiction.safety.avoid=''},'chapter-safety-dropped:mbti_contradiction');
 assertDropped(p=>{delete p.source['person.mbti']},'mbti-input-source-dropped-or-invented');
 assertDropped(p=>{p.task.comparisonContract=null},'independent-framework-contract-dropped');
 assertDropped(p=>{p.task.chapters.saju_core.topics.temperament.evidenceFocus.readerQuestion='뿌리 개수만 설명한다'},
  'core-reader-evidence-brief-drift:saju_core/temperament');
 assertDropped(p=>{p.task.chapters.saju_core.topics.strength.evidenceFocus.readerReasoning.hypotheticalQuestion='기술 용어만 반복한다'},
  'core-reader-evidence-brief-drift:saju_core/strength');
 assertDropped(p=>{p.task.chapters.saju_core.topics.strength.evidenceFocus.sourceAudit='충 관계 없음'},
  'core-reader-evidence-brief-drift:saju_core/strength');
 assertDropped(p=>{delete p.task.chapters.saju_core.topics.strength.evidenceFocus.points[0].sourceAuditCheck},
  'core-reader-evidence-brief-drift:saju_core/strength');
 assertDropped(p=>{p.task.chapters.saju_core.topics.strength.evidenceFocus.points[0].sourceRefs=[]},
  'core-reader-evidence-brief-drift:saju_core/strength');
 assertDropped(p=>{p.task.chapters.saju_core.topics.temperament.citableFacts=[]},
  'topic-citable-sources-drift:saju_core/temperament');
 assertDropped(p=>{p.task.chapters.saju_core.topics.temperament.citableFacts
  .find(x=>x.id==='natal.month.stem').tenGod='정관'},
  'topic-citable-meaning-drift:saju_core/temperament');


 assert.equal(payload.task.editorialGoal,prompt.editorialTask,
  'actual body editorial instructions must survive the provider boundary');
 assert(payload.task.editorialGoal.includes('최종 본문 원고'),
  'the provider must see the substantive customer-facing depth brief');
 assert(!Object.hasOwn(payload.task,'planningInstruction')&&
  !Object.hasOwn(payload.task,'crossChapterNoveltyRule'),
  'legacy overlapping long rules must not re-enter the compact request');
 assert(generation.policy.includes('task.editorialGoal'),
  'provider system message must explicitly use the customer-depth brief');

 assert(generation.policy.includes('readerReasoning.hypotheticalQuestion'),
  'premium first chapter must require a grounded reader example, not only source names');
 assert(generation.policy.includes('basis.limit에 기록하고'),
  'reader-facing first chapter must avoid repeated unsupported disclaimer prose');
 assert(generation.policy.includes('task.chapters[id].analysisGoal'),
  'provider system instructions must use the transported per-section depth goal');
 assert(generation.policy.includes('task.editorialGoal'),
  'provider system instructions must use the transported final editorial goal');

 assert.deepEqual(payload.task.reusedEvidence,prompt.rules.reusedEvidenceWithPriorConclusions||[],
  'the compact writer request must preserve the server reuse ledger');
 const citationReuse={path:'natal.month.stem',chapter:'saju_core',topic:'temperament',
  previousConclusion:'이전에 월간 근거로 설명한 반응'};
 const goalOverride={...prompt,editorialTask:'다른 장과 구별되는 계산 근거를 설명하고 실제 관찰하지 않은 고객 경험을 쓰지 않는다.'};
 assert.equal(generation.compile(goalOverride).task.editorialGoal,goalOverride.editorialTask);
 const withReuse=generation.compile({...prompt,rules:{
  ...prompt.rules,reusedEvidenceWithPriorConclusions:[citationReuse]
 }});
 for(const chapter of Object.values(payload.task.chapters))
  for(const topic of Object.values(chapter.topics||{}))
   assert(!Object.hasOwn(topic,'evidenceReuseBoundary'),
    'future optional topics are not facts that someone already wrote about');
 assert.deepEqual(withReuse.task.reusedEvidence,[citationReuse],
  'actual reused calculated source path and previous conclusion must reach the model');
 // The upstream premium depth brief must reach the actual provider JSON.
 // Otherwise the writer sees only topic titles despite the validated rules.
 for(const [id,chapter] of Object.entries(payload.task.chapters)){
  assert.equal(chapter.analysisGoal,prompt.rules.sectionGoals[id],
   'premium depth guidance lost in provider compression: '+id);
  assert(chapter.analysisGoal.length>70,'missing substantive guidance: '+id);
 }
 assert(payload.task.chapters.saju_core.analysisGoal.includes('태어난 달 겉글자')&&
  payload.task.chapters.saju_core.analysisGoal.includes('중심 숨은 글자의 서로 다른 십성'),
  'the actual transported depth goal must prioritize both calculated month ten-god meanings');
 assert(!payload.task.chapters.saju_core.analysisGoal.includes('둘째는 같은 오행의 실제 뿌리'),
  'obsolete root-first depth instruction must not override the evidence plan');
 assert(payload.task.chapters.saju_core.topics.temperament.question.includes('기질'),
  'first topic must explain basic disposition to a reader');
 assert(payload.task.chapters.saju_core.topics.strength.question.includes('기질'),
  'second topic must explain a qualifying condition, not a root glossary');
 assert(payload.task.chapters.saju_core.topics.strength.evidenceFocus.internalEvidenceRole.includes('충'),
  'accurate natal-clash provenance must remain in provider task');
 assert(payload.task.chapters.saju_core.topics.strength.evidenceFocus.sourceAudit.includes('natal.month'),
  'the paid focus must audit the two month sources rather than demand root exposition');
 assert.deepEqual(payload.task.chapters.saju_core.topics.strength.requiredSourceKinds,['month-ten-god']);
 assert(generation.policy.includes('를 모두 기록한다'),
  'paid writer policy must require both calculated month sources, not one');
 assert(!generation.policy.includes('또는 natal.month.hidden.* 중 한 항목'),
  'old one-source citation policy must never silently override paired evidence');
 assert(generation.policy.includes('기본 성향의 두 문단에서 근거로 인용하지 않는다'),
  'core writer may not cite extra root/clash evidence for the paid first chapter');
 assert.equal(payload.task.chapters.saju_core.topics.strength.sourcePath,'facts.tenGods.month');
 assert.equal(payload.task.chapters.saju_core.topics.strength.evidenceFocus.tenGodFocus.monthStem.tenGod,
  payload.source['natal.month.stem'].tenGod);
 const main=payload.task.chapters.saju_core.topics.strength.evidenceFocus.tenGodFocus.monthMainHidden;
 assert.equal(payload.source[main.sourceId].tenGod,main.tenGod);
 assert(!/(?:월지|일지|시지)/.test(payload.task.chapters.saju_core.topics.strength.evidenceFocus.readerReasoning.hypotheticalQuestion),
  'customer-facing example must be concept-first, not branch-location-first');
 assert(generation.policy.includes('명리학 용어 설명 교재가 아니다'),
  'paid writing must not teach calculations instead of explaining reader concerns');
 assert(payload.task.chapters.mbti_contradiction.analysisGoal.includes('MBTI'),
  'independent MBTI reasoning must reach the writer');
 assert(payload.task.chapters.mbti_contradiction.comparisonEvidence.includes('함께 인용한다'));
 assert(!Object.hasOwn(payload.task.chapters.mbti_contradiction,'domainMbtiLens'),
  'MBTI comparison chapter keeps independent evidence rather than a global domain shortcut');
 assert(payload.task.chapters.mbti_contradiction.comparisonEvidence.includes('인과 관계가 아니다'));

 assert(!Object.hasOwn(payload.source,'facts.structuralEvidence'),'wide structural facts must not hide provenance');
 assert(payload.source['facts.structuralEvidence.monthCommand'],'month command must be separately identified');
 assert(payload.task.chapters.saju_core.safety.avoid.includes('상관'),'core interpretation limitation must survive compact compilation');
 assert(payload.task.chapters.mbti_contradiction.safety.avoid.includes('우열'),'MBTI comparison safety must survive compact compilation');
 assert(payload.task.chapters.saju_core.topics.temperament.interpretationBoundary.includes('전통적 해석'),'topic evidence limits must survive compact compilation');
 const scopedIds=['money','year_2027_money'];
 const guidance=require('./report-analysis-guidance');
 const allPlans=guidance.preflight(prompt.facts);
 // The old PAID QA fabricated INTJ rigidity and opposite Saju behavior.
 // Neither a correct MBTI label nor two citations prove agreement/conflict.
 const joinedIds=['mbti_contradiction','integrated_judgment'];
 const joinedPrompt={...prompt,requestedSections:joinedIds,
  rules:{...prompt.rules,sectionGoals:Object.fromEntries(joinedIds.map(id=>
   [id,require('./report-prompt').sectionGoals[id]]))},
  analysisGuidance:{...guidance.forRequest(joinedIds,prompt.facts.person?.mbti),
   editorialBlueprint:Object.fromEntries(joinedIds.map(id=>[id,allPlans[id]]))}
 };
 const joined=generation.compile(joinedPrompt);
 const letters=(id,topic)=>joined.task.chapters[id].topics[topic].mbtiFocus?.preferences.map(p=>p.code);
 assert.deepEqual(letters('mbti_contradiction','agreement'),['N','T'],
  'INTJ first comparison must use submitted N/T meanings, not generic type adjectives');
 assert.deepEqual(letters('mbti_contradiction','difference'),['I','J'],
  'optional second comparison must not repeat the information-and-decision paragraph');
 assert.deepEqual(letters('integrated_judgment','insight'),['I','J'],
  'integrated chapter must apply its OWN interactive/scheduling question, not force a reversal');
 for(const [id,chapter] of Object.entries(joined.task.chapters)){
  assert(!/일치·충돌·판단 불가 중 어느 쪽인지 근거를 들어 판별|사주 해석과 MBTI 선호가 동시에 설명하는 부분, 서로 다른 이유/.test(chapter.analysisGoal),
   'no section goal may force a measured match or fabricated opposite: '+id);
  assert(!/강화·충돌·보완 또는 근거 부족을 구분/.test(chapter.analysisFocus),
   'preflight focus cannot contradict the calculation-free comparison contract: '+id);
  for(const [topic,task] of Object.entries(chapter.topics)){
   if(task.mode==='state-limits')continue;
   assert.equal(task.mbtiFocus?.sourceRef,'person.mbti');
   assert.equal(task.mbtiFocus?.verdict,'not-computed');
   assert.equal(task.mbtiFocus?.sharedBehavior,'unobserved');
   assert.equal(task.mbtiFocus?.sajuRelation,'traditional-interpretation-only');
   assert(task.citableFacts.some(x=>x.id==='person.mbti')&&
    task.citableFacts.some(x=>x.id.startsWith('natal.')),
    'paired source facts must reach the REAL provider: '+id+'/'+topic);
  }
 }
 assert.deepEqual(require('./report-instruction-audit').inspectTransport(joinedPrompt,joined),[],
  'topic-level MBTI comparison and integrated plans must reach provider unchanged');
 const joinedSchema=generation.schema(joinedPrompt,wire.schemaFor(joinedPrompt,schema));
 for(const id of joinedIds){
  const topic=joined.task.chapters[id].anchor;
  const leaf=joinedSchema.properties.chapters.properties[id].properties.paragraphs.properties[topic];
  const cited=leaf.properties.basis.properties.refs.items.enum;
  assert(cited.includes('person.mbti')&&cited.some(x=>x.startsWith('natal.')),
   'actual comparison JSON response must allow both independent sources');
 }

 // Historical paid QA repeated a common 2027 ten-god label as if money,
 // work and relationship events all changed in intensity. Check the ACTUAL
 // compact provider payload, not unused legacy rules or isolated test data.
 const annualIds=['year_2027','year_2027_money','year_2027_career','year_2027_relationship'];
 const annualPrompt={...prompt,requestedSections:annualIds,
  // The real request() only transports sectionGoals for the current batch.
  // Reproduce that scope instead of recycling the FIRST captured batch goals.
  rules:{...prompt.rules,sectionGoals:Object.fromEntries(annualIds.map(id=>
   [id,require('./report-prompt').sectionGoals[id]]))},analysisGuidance:{
  ...guidance.forRequest(annualIds,prompt.facts.person?.mbti),
  editorialBlueprint:Object.fromEntries(annualIds.map(id=>[id,allPlans[id]]))
 }};
 const actualAnnual=generation.compile(annualPrompt);
 assert.deepEqual(transportAudit.inspectTransport(annualPrompt,actualAnnual),[],
  'correct 2027 analysis plan must be transported unchanged before paid calls');
 const annualGoals=actualAnnual.task.chapters;
 assert(annualGoals.year_2027.analysisGoal.includes('삶의 변화 크기는 추정하지')&&
  annualGoals.year_2027.analysisFocus.includes('실제 변화 정도는 계산하지 않았'),
  'generic 2027 analysis must not equate symbolic appearance with strong or weak effects');
 assert(annualGoals.year_2027_money.analysisGoal.includes('같은 분류군')&&
  annualGoals.year_2027_money.analysisGoal.includes('수입·지출의 강약 변화를 판정하지')&&
  annualGoals.year_2027_money.analysisFocus.includes('소득·지출의 강도 변화가 아니'),
  '2027 money must ground its own pair rather than claim rising or falling wealth intensity');
 assert(annualGoals.year_2027_career.analysisGoal.includes('두 위치')&&
  annualGoals.year_2027_career.analysisGoal.includes('책임이 늘어난다는 주장으로 반복하지')&&
  annualGoals.year_2027_career.analysisFocus.includes('공통 2027년 장'),
  '2027 career must not repackage general 2027 duty and rules into a promotion story');
 assert(annualGoals.year_2027_relationship.analysisGoal.includes('facts.targetYearBranchContext.annualContext.day')&&
  annualGoals.year_2027_relationship.analysisGoal.includes('경쟁 후보')&&
  !annualGoals.year_2027_relationship.analysisGoal.includes('합·형·파·해는 계산 결과에 없'),
  'annual relationship goal must recognize calculated candidate interactions without declaring transformation');
 for(const id of annualIds){
  const chapter=annualGoals[id];
  assert(!/계산상 변화가 약하면 약하다|강조되거나 약해지는 관계/.test(chapter.analysisGoal||''),
   'outdated unsupported yearly strength language must never reach provider: '+id);
 }
 for(const id of ['year_2027_money','year_2027_career']){
  const scope=annualGoals[id].annualScope;
  const source=actualAnnual.source;
  assert(scope&&scope.comparisons.every(pair=>
   source[pair.annualId]&&source[pair.natalId]),
   'every allowed annual domain comparison must contain actual yearly and natal references: '+id);
  assert(scope.guaranteesRealWorldOutcome===false);
 }

 const moneyRequest=generation.compile({...prompt,requestedSections:scopedIds,analysisGuidance:{
  ...guidance.forRequest(scopedIds,prompt.facts.person?.mbti),
  editorialBlueprint:Object.fromEntries(scopedIds.map(id=>[id,allPlans[id]]))
 }});
 const moneyTopics=moneyRequest.task.chapters.money.topics;
 assert.equal(Object.hasOwn(moneyRequest.task.chapters.money,'domainMbtiLens'),false,
  'MBTI preference must not be repeated at the whole-chapter level');
 for(const [topic,code] of [['earning','N'],['spending','T']]){
  if(moneyTopics[topic].mode!=='state-limits'){
   assert.deepEqual(moneyTopics[topic].mbtiFocus?.preferences?.map(p=>p.code),[code],
    'the writer must receive only the related input preference: money/'+topic);
  }else assert.equal(moneyTopics[topic].mbtiFocus,null);
 }
 assert(generation.policy.includes('topics[topicId].mbtiFocus'),
  'the paid provider must use topic-specific MBTI questions and not the full type');
 for(const topic of Object.values(moneyRequest.task.chapters.year_2027_money.topics))
  assert.equal(topic.mbtiFocus,null,
   'annual fortune symbols must not be mixed with a personal MBTI behavior claim');
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
 checkCitable(moneyRequest,moneyPrompt);
 const moneySchema=generation.schema(moneyPrompt,wire.schemaFor(moneyPrompt,schema));
 const moneySlots=moneySchema.properties.chapters.properties.money.properties.paragraphs.properties;
 if(financialIds.length){
  assert.equal(moneyRequest.task.chapters.money.topics.earning.mode,'use-primary');
  assert.deepEqual(new Set(moneySlots.earning.properties.basis.properties.refs.items.enum),new Set([...financialIds,'person.mbti']));
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
 // The writer now receives per-topic source facts, not merely an opaque
 // source path. They must be identical to the actual strict output schema.
 function checkCitable(compiled,scopedPrompt){
  const transport=generation.schema(scopedPrompt,wire.schemaFor(scopedPrompt,schema));
  for(const [chapterId,chapter] of Object.entries(compiled.task.chapters)){
   for(const [topicId,topic] of Object.entries(chapter.topics)){
    const slot=transport.properties.chapters.properties[chapterId]
     .properties.paragraphs.properties[topicId];
    const selected=slot.anyOf?.find(x=>x.type==='object')||slot;
    const ids=topic.citableFacts.map(x=>x.id);
    const refSchema=selected.properties?.basis?.properties?.refs;
    if(selected.type==='null'||refSchema?.type==='null'){
     assert.deepEqual(ids,[],'unsupported topic must not create source rows');
     if(selected.type!=='null')assert.equal(refSchema.type,'null',
      'required chapter placeholder cannot cite invented symbol');
     continue;
    }
    assert.deepEqual(ids,refSchema.items.enum,
     chapterId+':'+topicId+' writer sources differ from provider schema');
    for(const fact of topic.citableFacts){
     assert(Object.hasOwn(compiled.source,fact.id));
     const source=compiled.source[fact.id];
     if(fact.id.startsWith('natal.')){
      assert.equal(fact.position,source.position);
      assert.equal(fact.layer,source.layer);
      assert.equal(fact.tenGod,source.tenGod);
      assert.equal(fact.traditionalMeaning||null,source.traditionalMeaning||null);
      assert.equal(fact.traditionalMeaning||null,scopedPrompt.facts.facts.tenGodGlossary[source.tenGod]||null);
     }
    }
   }
  }
 }
 checkCitable(payload,prompt);
 assert(payload.task.chapters.saju_core.topics.temperament.citableFacts.some(
  x=>x.id==='natal.month.stem'&&x.position==='월간'),
  'exact month-position ten-god must be surfaced where the writer needs it');
 assert(generation.policy.includes('citableFacts'),
  'system message must use the actual per-topic source/meaning table');
 const t=generation.schema(prompt,wire.schemaFor(prompt,schema));
 const chapters={};
 for(const id of prompt.requestedSections){
  const plan=prompt.analysisGuidance.editorialBlueprint[id],anchor=plan.anchorTopic;
  const slots=t.properties.chapters.properties[id].properties.paragraphs.properties;
  assert.deepEqual(Object.keys(slots[anchor].properties),['basis','label','text']);
  assert(!Object.hasOwn(t.properties.chapters.properties[id].properties,'evidence'));
  const fields=t.properties.chapters.properties[id].properties;
  const main=payload.source['facts.structuralEvidence.monthCommand']?.mainHiddenStem;
  chapters[id]={title:fields.title.enum?.[0]||'검증 제목',keyJudgment:fields.keyJudgment.enum?.[0]||'검증 판단',mood:'reflective',paragraphs:Object.fromEntries(Object.keys(plan.topicTasks).map(topic=>[topic,topic===anchor||(id==='saju_core'&&topic==='temperament')?{basis:{refs:id==='mbti_contradiction'?['person.mbti','natal.month.stem']:id==='saju_core'?(topic==='strength'?['natal.month.stem','natal.month.hidden.'+main]:['facts.seasonalEvidence','facts.qiEvidence','natal.month.stem']):['natal.month.stem'],interpretation:'해당 계산에 관한 전통적 해석',condition:'새 일을 맡는 상황',limit:'실제 행동을 관찰한 자료는 아님'},label:'검증 소제목',text:'뜻과 이유를 충분히 설명하는 검증 문장입니다.'}:null]))};
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
 const optionalSeason=t.properties.chapters.properties.saju_core.properties.paragraphs.properties.temperament.anyOf.find(s=>s.type==='object');
 const allowed=optionalSeason.properties.basis.properties.refs.items.enum;
 // The paid first-chapter question is the MONTH'S actual ten-god pair.
 // The previous provider response cited facts.stemConnections without all
 // matching roots; the optional data was irrelevant to this reader question.
 const monthTopic=payload.task.chapters.saju_core.topics.strength;
 const monthRefs=[...generation.allowedRefs(payload,monthTopic,'saju_core','strength')];
 const monthSource=payload.source['facts.structuralEvidence.monthCommand'];
 const mainMonth='natal.month.hidden.'+monthSource.mainHiddenStem;
 assert(monthRefs.includes('natal.month.stem')&&monthRefs.includes(mainMonth));
 for(const ref of ['facts.stemConnections','facts.rootConditions',
  'facts.structuralEvidence.dayMasterRoots']){
  assert(!monthRefs.includes(ref),
   'root summaries cannot distract from paid first chapter: '+ref);
 }
 assert(allowed.includes('natal.month.stem'));
 assert(allowed.includes('facts.seasonalEvidence'),'core month interpretation requires seasonal fact source');
 assert(allowed.includes('facts.qiEvidence'),'core month interpretation requires positional qi source');
 assert(!allowed.includes('facts.stemConnections')&&!allowed.includes('facts.rootConditions'),
  'core seasonal paragraph must also exclude optional rooting ledger');
 const noQi=structuredClone(raw);
 noQi.chapters.saju_core.paragraphs.temperament.basis.refs=['facts.seasonalEvidence','natal.month.stem'];
 assert.throws(()=>generation.restoreEvidence(noQi,prompt),/missing required positional qi evidence/);
 // Regression from exactly ONE real paid 2026-10-16 attempt: the model
 // inserted incomplete optional root citations into strength. This must be
 // impossible in strict provider schema, and an archived response using
 // those refs must be rejected WITHOUT weakening the citation audit.
 const monthOnly=structuredClone(raw);
 monthOnly.chapters.saju_core.paragraphs.strength={
  basis:{refs:['natal.month.stem',mainMonth,'facts.structuralEvidence.monthCommand'],
   interpretation:'실제 달의 두 전통적 의미',
   condition:'서로 다른 새 학습·자원 마련 질문',
   limit:'실제 학습 능력·재산은 미측정'},
  label:'같은 달의 두 다른 물음',
  text:'배움의 전통적인 의미와 자원 마련의 의미를 구분해 보게 됩니다.'
 };
 assert.doesNotThrow(()=>generation.restoreEvidence(monthOnly,prompt),
  'the two authentic month ten-god sources must suffice without roots');
 const captured=structuredClone(monthOnly);
 captured.chapters.saju_core.paragraphs.strength.basis.refs.push(
  'facts.structuralEvidence.dayMasterRoots','facts.stemConnections');
 assert.throws(()=>generation.restoreEvidence(captured,prompt),
  /unrelated paragraph basis/,
  'actual paid incomplete optional-root provenance must be rejected');
 const wrongRoot=structuredClone(monthOnly);
 wrongRoot.chapters.saju_core.paragraphs.strength.basis.refs.push('facts.rootConditions');
 assert.throws(()=>generation.restoreEvidence(wrongRoot,prompt),
  /unrelated paragraph basis/,
  'the mere presence of a root-condition source must never justify reuse');
 const oneMonthOnly=structuredClone(monthOnly);
 oneMonthOnly.chapters.saju_core.paragraphs.strength.basis.refs=['natal.month.stem'];
 assert.throws(()=>generation.restoreEvidence(oneMonthOnly,prompt),
  /missing paired month ten-god citations/);
 const noMain=structuredClone(monthOnly);
 noMain.chapters.saju_core.paragraphs.strength.basis.refs=
  noMain.chapters.saju_core.paragraphs.strength.basis.refs.filter(id=>id!==mainMonth);
 assert.throws(()=>generation.restoreEvidence(noMain,prompt),
  /missing paired month ten-god citations/);
 const missingSeason=structuredClone(raw);
 missingSeason.chapters.saju_core.paragraphs.temperament.basis.refs=['natal.month.stem'];
 assert.throws(()=>generation.restoreEvidence(missingSeason,prompt),/missing required month seasonal source/);
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
 const omitted=structuredClone(raw);
 omitted.chapters.saju_core.paragraphs.temperament=null;
 assert.doesNotThrow(()=>generation.restoreEvidence(omitted,limitedPrompt));
 assert.deepEqual(wire.decode(generation.restoreEvidence(omitted,limitedPrompt),limitedPrompt)
  .sections.find(x=>x.id==='saju_core').bodyTopics,['strength']);
 const limitedSchema=generation.schema(limitedPrompt,wire.schemaFor(limitedPrompt,schema));
 const limitedField=limitedSchema.properties.chapters.properties.saju_core.properties.paragraphs.properties.temperament;
 assert.equal(limitedField.type,'null','optional seasonal topic must be null without independent evidence');
 assert.equal(limitedSchema.properties.chapters.properties.saju_core.properties.paragraphs.properties.strength.type,'object',
  'core traditional ten-god interpretation stays mandatory');
 const synthesis={...prompt,stage:'synthesis',requestedSections:[],
  completedReport:{sections:wire.decode(restored,prompt).sections},
  rules:{...prompt.rules,finalEditingTask:'본문의 실제 근거에서 중복 없는 결론을 선별하고 사용자의 과거를 창작하지 않는다.'}};
 const summary=generation.compile(synthesis);
 assert.deepEqual(summary.task.completedReport,synthesis.completedReport);
 assert.deepEqual(transportAudit.inspectTransport(synthesis,summary),[]);
 const invalidSummary=structuredClone(summary);
 invalidSummary.task.editorialGoal=null;
 assert(transportAudit.inspectTransport(synthesis,invalidSummary).includes('final-editorial-brief-dropped'));
 assert.equal(summary.task.editorialGoal,synthesis.rules.finalEditingTask,
  'final editorial goal must reach provider even when legacy rules are compressed');
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

 // Run the ACTUAL lunar input used by first-chapter QA through both
 // independent MBTI chapters; labels must change with user input, while
 // symbolic sources never become a measured agreement/opposition.
 {
  const sample={calendar:'lunar',leapMonth:false,birthDate:'1982-11-24',
   birthTime:'14:20',gender:'male',mbti:'ISFP',name:'검증용'};
  const real=require('./report-facts-node').build(sample,2027);
  const scopes=['mbti_contradiction','integrated_judgment'];
  const plan=guidance.preflight(real);
  const realPrompt={stage:'body',facts:real,requestedSections:scopes,
   rules:{sectionGoals:Object.fromEntries(scopes.map(id=>[id,require('./report-prompt').sectionGoals[id]]))},
   analysisGuidance:{...guidance.forRequest(scopes,real.person?.mbti),
    editorialBlueprint:Object.fromEntries(scopes.map(id=>[id,plan[id]]))}};
  const actual=generation.compile(realPrompt);
  const focus=(id,topic)=>actual.task.chapters[id].topics[topic].mbtiFocus;
  assert.deepEqual(focus('mbti_contradiction','agreement').preferences.map(x=>x.code),['S','F']);
  assert.deepEqual(focus('mbti_contradiction','difference').preferences.map(x=>x.code),['I','P']);
  assert.deepEqual(focus('integrated_judgment','insight').preferences.map(x=>x.code),['I','P']);
  assert.equal(actual.task.comparisonContract.calculatedAgreement,false);
  assert.equal(actual.task.comparisonContract.calculatedContradiction,false);
  assert.equal(focus('mbti_contradiction','agreement').verdict,'not-computed');
  assert(focus('mbti_contradiction','agreement').preferences.every(p=>p.meaning&&p.notEvidenceOf),
   'real paid MBTI analysis must contain actual independent preference meanings, not just letters');
  const noInput={...sample,mbti:'모름'};
  const missing=require('./report-facts-node').build(noInput,2027);
  const noPlan=guidance.preflight(missing);
  const noPrompt={stage:'body',facts:missing,requestedSections:scopes,
   rules:realPrompt.rules,
   analysisGuidance:{...guidance.forRequest(scopes,missing.person?.mbti),
    editorialBlueprint:Object.fromEntries(scopes.map(id=>[id,noPlan[id]]))}};
  const noCompiled=generation.compile(noPrompt);
  assert(!Object.hasOwn(noCompiled.source,'person.mbti'));
  for(const chapter of Object.values(noCompiled.task.chapters))
   for(const topic of Object.values(chapter.topics))
    assert.equal(topic.mbtiFocus,null,'missing MBTI must not generate an assumed preference or comparison');
 }
 // The compact request must preserve missing-MBTI and unknown-hour boundaries.

 // The integrated chapter previously could cite only Saju data.
 // A paid MBTI+Saju interpretation must actually cite both inputs.
 const integratedId='integrated_judgment';
 const integratedPrompt={...prompt,requestedSections:[integratedId],
  analysisGuidance:{...guidance.forRequest([integratedId],prompt.facts.person.mbti),
   editorialBlueprint:{[integratedId]:allPlans[integratedId]}}};
 const integratedPayload=generation.compile(integratedPrompt);
 assert(integratedPayload.task.chapters[integratedId].comparisonEvidence.includes('MBTI'));
 const integratedSchema=generation.schema(integratedPrompt,wire.schemaFor(integratedPrompt,schema));
 const integrationAnchor=allPlans[integratedId].anchorTopic;
 assert(integrationAnchor);
 const integrationRefs=integratedSchema.properties.chapters.properties[integratedId].properties.paragraphs.properties[integrationAnchor].properties.basis.properties.refs.items.enum;
 assert(integrationRefs.includes('person.mbti')&&integrationRefs.includes('natal.month.stem'),
  'model schema must permit MBTI and actual natal source together');
 const integrationRaw={chapters:{[integratedId]:{
  title:'선택의 두 설명',keyJudgment:'각 관점의 서로 다른 질문을 구분합니다.',mood:'reflective',
  paragraphs:Object.fromEntries(Object.keys(allPlans[integratedId].topicTasks).map(topic=>
   [topic,topic===integrationAnchor?{
    label:'입력한 선호와 계산한 위치',
    text:'성격 선호와 계산된 출생 위치를 서로 다른 해석의 관점으로 읽습니다.',
    basis:{refs:['person.mbti','natal.month.stem'],
     interpretation:'입력 선호와 계산 위치의 해석 범위를 따로 확인했습니다.',
     condition:'가정한 업무 선택 상황',
     limit:'실제 행동을 확인한 것은 아닙니다.'}
   }:null]))}},cover:null,finalJudgment:null};
 assert.doesNotThrow(()=>generation.restoreEvidence(integrationRaw,integratedPrompt));
 for(const only of [['person.mbti'],['natal.month.stem']]){
  const invalid=structuredClone(integrationRaw);
  invalid.chapters[integratedId].paragraphs[integrationAnchor].basis.refs=only;
  assert.throws(()=>generation.restoreEvidence(invalid,integratedPrompt),
   /missing dual MBTI\/Saju evidence/,'integration cannot cite only one framework');
 }
 let unknownPrompt;
 await assert.rejects(generate({calendar:'solar',birthDate:'1990-05-15',unknownBirthTime:true,gender:'male',mbti:'모름'},async p=>{unknownPrompt=p;throw Error('OFFLINE_UNKNOWN');}),/OFFLINE_UNKNOWN/);
 const unknownPayload=generation.compile(unknownPrompt);
 checkCitable(unknownPayload,unknownPrompt);
 assert.deepEqual(transportAudit.inspectTransport(unknownPrompt,unknownPayload),[]);
 assert(!Object.hasOwn(unknownPayload.source,'person.mbti'),'unknown MBTI must never create a preference source');
 assert(!Object.keys(unknownPayload.source).some(x=>x.startsWith('natal.hour.')),'unknown hour must not create birth-hour facts');
 assert(unknownPayload.task.chapters.mbti_contradiction.safety.avoid.includes('입력하지 않은 성격'),'saju-only guard must be preserved');
 const unknownSchema=generation.schema(unknownPrompt,wire.schemaFor(unknownPrompt,schema));
 const noMbtiSlots=unknownSchema.properties.chapters.properties.mbti_contradiction.properties.paragraphs.properties;
 assert.equal(noMbtiSlots.agreement.type,'null','do not manufacture an MBTI agreement without submitted type');
 assert.equal(noMbtiSlots.difference.type,'object','saju-only explanation can use the natal comparison question');
 assert(!noMbtiSlots.difference.properties.basis.properties.refs.items.enum.includes('person.mbti'));
 assert.equal(unknownPayload.task.chapters.mbti_contradiction.comparisonEvidence,null);
 const unknownPlans=guidance.preflight(unknownPrompt.facts);
 const unknownIntegrated={...unknownPrompt,requestedSections:[integratedId],
  analysisGuidance:{...guidance.forRequest([integratedId],'모름'),
   editorialBlueprint:{[integratedId]:unknownPlans[integratedId]}}};
 const unknownIntegratedPayload=generation.compile(unknownIntegrated);
 assert.equal(unknownIntegratedPayload.task.chapters[integratedId].comparisonEvidence,null,
  'unknown MBTI must not create a joint-analysis claim');
 const unknownIntegratedSchema=generation.schema(unknownIntegrated,wire.schemaFor(unknownIntegrated,schema));
 const unknownAnchor=unknownPlans[integratedId].anchorTopic;
 assert(unknownAnchor);
 const unknownRefs=unknownIntegratedSchema.properties.chapters.properties[integratedId].properties.paragraphs.properties[unknownAnchor].properties.basis.properties.refs.items.enum;
 assert(!unknownRefs.includes('person.mbti'),
  'no MBTI should still allow a Saju-only integration');


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
