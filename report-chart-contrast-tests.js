'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const contrasts=require('./report-chart-contrast');
const guidance=require('./report-analysis-guidance');
const generation=require('./report-generation-request');
const binding=require('./report-fact-bindings');

const common={birthTime:'14:20',gender:'male',mbti:'ISFP'};
const cases=[
 {...common,calendar:'lunar',birthDate:'1982-11-24',leapMonth:false},
 {...common,calendar:'solar',birthDate:'1982-11-24',leapMonth:false},
 {...common,calendar:'solar',birthDate:'1990-05-15',leapMonth:false},
 {...common,calendar:'solar',birthDate:'1990-11-15',leapMonth:false},
 {...common,calendar:'solar',birthDate:'2001-11-03',unknownBirthTime:true,birthTime:undefined,leapMonth:false}
];
// Every ordered month category combination must produce a source-specific,
// plausible everyday scenario rather than the previous universal job story.
// These are offline input-contract tests, not evidence of editorial quality.
const allKinds=Object.keys(contrasts.TEN_GOD_SCENE);
assert.equal(allKinds.length,10);
assert.equal(new Set(Object.values(contrasts.TEN_GOD_SCENE)).size,10,
 'ten calculated categories must not collapse into one example situation');
for(const first of allKinds)for(const main of allKinds){
 const scenario=contrasts.monthHypothetical(first,main,first===main);
 assert(scenario.startsWith('가상의 상황: '+contrasts.TEN_GOD_SCENE[main]+' 때'),
  'every ordered pair must use its verified principal-month category');
 assert(!scenario.includes('새로운 일을 준비하면서')&&!scenario.includes('undefined')&&
  !scenario.includes('natal.month')&&!scenario.includes('십성'));
 assert.equal(scenario.includes('같은 분류가 두 계산 위치'),first===main,
  'same-classification scenarios must never invent an opposite trait');
 if(first!==main){
  assert(scenario.includes('같은 한 번의 선택')&&
   scenario.includes('첫 의미만 고려할 때')&&
   scenario.includes('두 의미를 함께 고려할 때')&&
   scenario.includes('준비 요령·체크리스트'),
   'all 90 distinct source pairs must provide one meaning-linked scene, not a question list');
 }
 assert(!/(?:실제 성격은|실제로 그랬|반드시|성공하게 된다)/.test(scenario),
  'imagined scenes are not personal history or predictions');
}
assert.throws(()=>contrasts.monthHypothetical('UNKNOWN','편인',false),
 /Missing verified month ten-god everyday question/);
assert.throws(()=>contrasts.monthHypothetical('편인','UNKNOWN',false),
 /Missing verified month ten-god everyday question/);
const seasonalGroups=require('./report-seasonal-evidence').MONTH;
for(const branch of ['辰','未','戌','丑'])
 assert.equal(seasonalGroups[branch].status,'transition');
// Hard-coded source-specific generation arrows: water -> wood; earth -> metal.
for(const example of [
 {date:'1988-12-15',month:'甲子',visible:'wood',hidden:'water',kind:'hidden-generates-visible'},
 {date:'1982-08-15',month:'戊申',visible:'earth',hidden:'metal',kind:'visible-generates-hidden'}
]){
 const packet=facts.build({...common,calendar:'solar',birthDate:example.date},2027);
 assert.equal(packet.status,'ready');
 assert.equal(packet.chart.month,example.month);
 const link=contrasts.build(packet).monthTenGodContext.elementLink;
 assert.equal(link.visibleElement,example.visible);
 assert.equal(link.hiddenElement,example.hidden);
 assert.equal(link.kind,example.kind,'generating arrow cannot reverse');
 assert(link.explanation.includes(
  example.kind==='hidden-generates-visible'?'본기의 오행이 겉글자의 오행을 생하는':
    '겉글자의 오행이 본기 오행을 생하는'));
}
const results=[];
for(const input of cases){
 const packet=facts.build(input,2027);
 assert.equal(packet.status,'ready',input.birthDate);
 const contrast=contrasts.build(packet);
 assert(contrast,'real source packet must produce core distinctions');
 assert.equal(contrast.version,'chart-evidence-contrast-v1');
 assert.equal(contrast.chartSignature,[packet.chart.year,packet.chart.month,packet.chart.day,
  packet.chart.hour||'hour-unknown'].join('/'));
 assert.equal(contrast.monthAndDay.monthBranch,packet.chart.month[1]);
 assert.equal(contrast.monthAndDay.dayElement,packet.facts.seasonalEvidence.dayElement);
 assert.equal(contrast.monthAndDay.phase,packet.facts.seasonalEvidence.monthPhase);
 assert.equal(contrast.monthAndDay.direction,packet.facts.seasonalEvidence.seasonToDayRelation);
 assert.equal(contrast.monthAndDay.transitionUnresolved,
  packet.facts.seasonalEvidence.monthPhase==='transition');
 const seasonalPlan=contrasts.forTopic(contrast,'temperament',[]);
 const seasonalReading=seasonalPlan.points.find(p=>p.kind==='month-vs-day').calculatedExplanation;
 if(contrast.monthAndDay.phase==='transition'){
  assert(seasonalReading.includes('명리 분류')&&seasonalReading.includes('실제 계절 종료일'),
   'a transition group does not calculate the end date of a season');
  assert(seasonalPlan.readerReasoning.reasoningTask.includes('명리상 전환월')&&
   seasonalPlan.readerReasoning.reasoningTask.includes('양력·음력 새해')&&
   seasonalPlan.readerReasoning.reasoningTask.includes('절입 직전·직후'),
   'provider brief must not confuse month branch and calendar transitions');
 }else{
  assert(!seasonalReading.includes('실제 계절 종료일')&&
   !seasonalPlan.readerReasoning.reasoningTask.includes('절입 직전·직후'),
   'ordinary month must not gain a made-up transition');
 }
 assert.equal(contrast.factsOnly,true);
 assert(contrast.cannotInfer.includes('day-master-strength'));
 const month=packet.facts.tenGods.month,mc=packet.facts.structuralEvidence.monthCommand;
 assert.equal(contrast.monthTenGodContext.monthStem.tenGod,month.stemTenGod);
 assert.equal(contrast.monthTenGodContext.monthMainHidden.stem,mc.mainHiddenStem);
 assert.equal(contrast.monthTenGodContext.monthMainHidden.tenGod,mc.mainHiddenStemTenGod);
 assert.equal(contrast.monthTenGodContext.sameClassification,month.stemTenGod===mc.mainHiddenStemTenGod);
// The element link is computed from the TWO source-bound stems. It is not
// a resolved 财克印, a psychological tension or a seasonal-qi verdict.
 const link=contrast.monthTenGodContext.elementLink;
 const qi=packet.facts.qiEvidence.entries;
 const visibleQi=qi.find(x=>x.id==='natal.month.stem');
 const hiddenQi=qi.find(x=>x.id==='natal.month.hidden.'+mc.mainHiddenStem);
 assert(visibleQi&&hiddenQi,'both ends of the month interpretation must exist as exact qi rows');
 assert.equal(link.visibleSourceId,visibleQi.id);
 assert.equal(link.hiddenSourceId,hiddenQi.id);
 assert.equal(link.visibleElement,visibleQi.element);
 assert.equal(link.hiddenElement,hiddenQi.element);
 const elements=require('./report-seasonal-evidence');
 const relation=elements.relation(hiddenQi.element,visibleQi.element);
 const expectedKinds={
  'same-element':'same-element',resource:'hidden-generates-visible',
  output:'visible-generates-hidden','control-on-day':'hidden-controls-visible',
  'day-controls':'visible-controls-hidden'
 };
 assert.equal(link.kind,expectedKinds[relation]);
 assert.equal(link.inference,'element-relation-only');
 assert.equal(link.governingHiddenStem,'unresolved');
 assert.equal(link.realizedInteraction,'not-assessed');
 assert.equal(link.characterTrait,'not-measured');
 assert(link.explanation.length>30&&/오행/.test(link.explanation));
 if(input.calendar==='lunar'&&input.birthDate==='1982-11-24'){
  // This is the actual lunar chart, NOT 1982-11-24 solar.
  assert.equal(packet.chart.day,'乙未');
  assert.equal(packet.chart.month,'癸丑');
  assert.equal(contrast.monthTenGodContext.monthStem.stem,'癸');
  assert.equal(contrast.monthTenGodContext.monthStem.tenGod,'편인');
  assert.equal(contrast.monthTenGodContext.monthMainHidden.stem,'己');
  assert.equal(contrast.monthTenGodContext.monthMainHidden.tenGod,'편재');
  assert.equal(link.kind,'hidden-controls-visible');
  assert.equal(link.hiddenElement,'earth');
  assert.equal(link.visibleElement,'water');
 }

 for(const point of contrast.contrastPoints){
  assert.equal(typeof point.calculatedExplanation,'string');
  assert(point.calculatedExplanation.length>=35,
   'chart-specific editor must receive an actual sourced comparison, not a label: '+point.kind);
  assert(!/(승진|이직|연애운이|결혼|수입이|재산이)/.test(point.calculatedExplanation),
   'computed explanations cannot fabricate personal results');
 }
 assert(contrast.contrastPoints[0].calculatedExplanation.includes(packet.chart.month[1]),
  'reader explanation must mention actual month branch, not generic season prose');
 assert(contrast.contrastPoints[2].calculatedExplanation.includes('강약')||
   contrast.contrastPoints[2].calculatedExplanation.includes('신약'),
  'root observation must explicitly remain distinct from verified strength');
 assert.deepEqual(contrast.contrastPoints.map(x=>x.kind),[
  'month-vs-day','visible-support-vs-counter','actual-day-master-roots','root-relation-overlap']);
 const sourceIDs=new Set(binding.build(packet).map(x=>x.id));
 const support=contrast.contrastPoints[1].evidence;
 for(const row of [...support.support,...support.counter]){
  assert(sourceIDs.has(row.sourceId),'exact visible qi stem must exist '+row.sourceId);
  const original=packet.facts.qiEvidence.entries.find(x=>x.id===row.sourceId);
  assert.equal(original?.category,row.category);
  assert.equal(original?.direction,row.direction);
 }
 const root=contrast.contrastPoints[2].evidence;
 const observed=packet.facts.stemConnections.dayMasterRooting.sameElementRoots;
 assert.equal(root.observedRootCount,observed.length);
 for(const row of root.rootLocations){
  assert(sourceIDs.has(row.sourceId),'root must reference an actual natal hidden stem');
  assert(observed.some(x=>x.hiddenId===row.sourceId&&x.type===row.matchType));
  assert(!row.sourceId.startsWith('natal.hour.')||packet.chart.hour,
   'unknown birth hour must never generate an hour source');
 }
 const rootClashes=contrast.contrastPoints[3].evidence.collisions;
 assert.equal(rootClashes.length,(packet.facts.rootConditions.dayMasterRootCases||[])
  .reduce((n,x)=>n+(x.natal?.clashes||[]).length,0));
 for(const c of rootClashes){
  assert(c.positions.includes(c.location)&&c.positions.includes(c.counterpart)&&
   c.counterpart!==c.location,'both actual clash endpoints must reach the writer');
  assert(packet.facts.natalClashes.some(row=>
   row.positions.every(p=>c.positions.includes(p))&&c.positions.length===2),
   'only actually computed natal-clash pairs may be described');
 }
 assert(rootClashes.every(x=>x.natalClash===true&&!Object.hasOwn(x,'annualClash')),
  'the core natal chapter must not recycle 2027 branch conclusions');
 const blueprint=guidance.preflight(packet);
 const p={stage:'body',facts:packet,requestedSections:['saju_core'],
  analysisGuidance:{...guidance.forRequest(['saju_core'],input.mbti),
   editorialBlueprint:{saju_core:blueprint.saju_core}}};
 const request=generation.compile(p);
 const transportGuard=require('./report-instruction-audit');
 assert.deepEqual(transportGuard.inspectTransport(p,request),[],
  'actual first-chapter brief must match this birth chart before any paid call');
 // The real provider receives JSON-schema descriptions, not the full
 // server-only editorial rule set. Verify that month-source distinctions
 // survive without turning the model response into an internal FAQ.
 const wire=require('./report-wire');
 const outputSchema=wire.schemaFor(p,require('./report-schema.json'));
 const chapterSchema=outputSchema.properties.chapters.properties.saju_core.properties;
 const paragraphs=chapterSchema.paragraphs.properties;
 const fixedThesis=require('./report-core-thesis').forPrompt(p);
 assert.equal(typeof fixedThesis.title,'string');
 assert.equal(typeof fixedThesis.keyJudgment,'string');
 assert.equal(fixedThesis.status,'traditional-reading-not-observed-trait');
 assert.deepEqual(chapterSchema.title.enum,[fixedThesis.title]);
 assert.deepEqual(chapterSchema.keyJudgment.enum,[fixedThesis.keyJudgment]);
 assert.deepEqual(fixedThesis.sourceIds,['natal.month.stem',
  'natal.month.hidden.'+mc.mainHiddenStem]);
 assert(fixedThesis.title!== '기본 기질의 전통적 풀이와 해석의 조건');
 assert(!/(?:겉글자|십성|원국|뿌리|월지|편인|정재|편재)/.test(
  fixedThesis.title+' '+fixedThesis.keyJudgment));
 assert.doesNotThrow(()=>require('./report-core-thesis').assertDecoded({
  title:fixedThesis.title,keyJudgment:fixedThesis.keyJudgment},p));
 assert.throws(()=>require('./report-core-thesis').assertDecoded({
  title:fixedThesis.title,keyJudgment:fixedThesis.keyJudgment+' 분석이 필요합니다.'},p),
  /violated grounded first-chapter/);

 assert.equal(blueprint.saju_core.anchorTopic,'strength',
  'actual month position interpretation must anchor the paid first chapter');
 assert.equal(paragraphs.strength.type,'object',
  'month ten-god interpretation must not be nullable');
 assert(paragraphs.temperament.anyOf?.some(x=>x.type==='null'),
  'seasonal background must be omitted when it adds no independent insight');
 const season=paragraphs.temperament.anyOf.find(x=>x.type==='object');
 const seasonText=season.properties.text.description;
 const paired=paragraphs.strength;
 const pairedText=paired.properties.text.description;
 assert(chapterSchema.title.description.includes('조건부 기질 해석의 핵심'));
 assert(chapterSchema.keyJudgment.description.includes('자연스러운 한국어 한 문장'));
 assert(season.properties.label.description.includes('독립적인 계절·겉글자 조건'));
 assert(paired.properties.label.description.includes('필수 핵심 풀이')&&
  paired.properties.label.description.includes(month.stemTenGod===mc.mainHiddenStemTenGod?'같은 전통 분류':'두 의미를 결합'));
 assert(seasonText.includes('기술 강의')&&
  seasonText.includes('가상 장면')&&
  seasonText.includes('null로 반환한다')&&
  !seasonText.includes('출생월의 본기만으로 실제 적응력이'));
 const scenarioFromFacts=contrasts.forTopic(contrast,'temperament',[])?.readerReasoning?.hypotheticalQuestion;
 assert(seasonText.includes(scenarioFromFacts),
  'actual first paragraph provider output field must include a chart-specific hypothetical, not generic instructions');
 assert(!pairedText.includes('첫 출처의 실제 질문은')&&
  !pairedText.includes('둘째 출처의 실제 질문은')&&
  !pairedText.includes('두 질문에 각각 답해야 하는 이유'),
  'actual provider output schema must not override claim ownership by printing internal questions');
 assert(pairedText.includes('사전적 의미나 내부 질문을 고객용 글로 나열하지 않는다')&&
  pairedText.includes('가상의 한 선택 상황'),
  'paid writer must treat symbol names as brief supporting evidence, never as final value');

 const moonPlan=contrasts.forTopic(contrast,'strength',[])?.readerReasoning?.readerValuePlan;
 assert(pairedText.includes(moonPlan.traditionalReading.first.reading)&&
  pairedText.includes(moonPlan.traditionalReading.second.reading)&&
  !pairedText.includes(moonPlan.first.question)&&
  !pairedText.includes(moonPlan.second.question),
  'real first-chapter schema must use THIS chart meanings, not internal two-question prompts');
 assert(!pairedText.includes('실제로 학습 능력이 높')&&
  pairedText.includes('실제 성격의 모순·갈등이나 능력의 증거로 바꾸지 않는다'));
 assert.deepEqual(Object.keys(chapterSchema),['title','keyJudgment','evidence','mood','paragraphs'],
  'quality instructions must not alter the provider JSON field contract');
 if(input.calendar==='lunar'&&input.birthDate==='1982-11-24'){
  assert(pairedText.includes(moonPlan.traditionalReading.first.reading)&&
   pairedText.includes(moonPlan.traditionalReading.second.reading));
  assert(!pairedText.includes('처음 접하는 정보를 자기 방식으로 어떻게 이해할지')&&
   !pairedText.includes('필요한 돈과 재료를 어디서 마련하고 어떻게 쓸지'),
   'response field must not tell the AI to print two selection questions');
  assert(!pairedText.includes('반복해서 드는 비용을 어떻게 감당할지'));
 }
 const changedReader=structuredClone(request);
 changedReader.task.chapters.saju_core.topics.temperament.evidenceFocus.readerQuestion='근거 없는 성격 설명';
 assert(transportGuard.inspectTransport(p,changedReader).includes(
  'core-reader-evidence-brief-drift:saju_core/temperament'),
  'replacing customer question must be stopped before model billing');
 const changedAudit=structuredClone(request);
 changedAudit.task.chapters.saju_core.topics.strength.evidenceFocus.sourceAudit='충과 뿌리의 실제 확인 없음';
 assert(transportGuard.inspectTransport(p,changedAudit).includes(
  'core-reader-evidence-brief-drift:saju_core/strength'),
  'changed natal source audit must be stopped before model billing');
 const core=request.task.chapters.saju_core;
 assert.equal(Object.hasOwn(core,'chartContrast'),false,
  'do not send four unassigned comparisons in a wide chapter blob');
 const temperament=core.topics.temperament.evidenceFocus;
 const strength=core.topics.strength.evidenceFocus;
 // Validate the real provider's STRUCTURED paragraph-claim ownership:
 // sharing a verifiable month-stem source must not share the conclusion.
 const ownFirst=temperament.claimOwnership,ownSecond=strength.claimOwnership;
 assert.equal(ownFirst.version,'core-reader-claim-ownership-v1');
 assert.equal(ownSecond.version,'core-reader-claim-ownership-v1');
 assert.equal(ownFirst.sharedFactId,'natal.month.stem');
 assert.equal(ownSecond.sharedFactId,'natal.month.stem');
 assert(ownFirst.claimIds.length&&ownSecond.claimIds.length&&
  ownFirst.claimIds.every(id=>!ownSecond.claimIds.includes(id)),
  'first chapter paragraph claims must be disjoint despite shared citations');
 assert(ownFirst.readerConclusion&&ownSecond.readerConclusion);
 assert.notEqual(ownFirst.readerConclusion,ownSecond.readerConclusion);
 assert.deepEqual(ownFirst,contrasts.firstChapterClaimOwnership(contrast,'temperament'));
 assert.deepEqual(ownSecond,contrasts.firstChapterClaimOwnership(contrast,'strength'));
 assert.equal(ownFirst.overlappingMonthLearning,ownSecond.overlappingMonthLearning);
 const actualMonth=strength.tenGodFocus;
 const meaning=require('./report-chart-contrast').forTopic(contrast,'strength',[]);
 assert.deepEqual(ownSecond,meaning.claimOwnership);
 // The old prompt always asked EVERY chart to discuss 'learning + resource
 // use' even when neither had actually been calculated. This is a real
 // source-to-interpretation bug, not a cosmetic change.
 const realFirst=actualMonth.monthStem.tenGod,realSecond=actualMonth.monthMainHidden.tenGod;
 const resourcePair=['정인','편인'].includes(realFirst)&&['정재','편재'].includes(realSecond);
 if(!resourcePair){
  assert(!ownFirst.reservedForOtherParagraph.includes('월지 본기의 자원 활용 의미'));
  assert(!ownSecond.readerConclusion.includes('겉글자의 정보 이해·배움 의미와 중심 숨은 글자의 자원 활용 의미'));
 }
 if(realFirst===realSecond){
  assert(ownSecond.readerConclusion.includes('같은 뜻이 두 곳에 있다고'));
  assert(!ownSecond.readerConclusion.includes('서로 다른'));
 }else{
  assert(ownSecond.readerConclusion.includes('한 가지 조건부 기질 풀이로 연결'));
 }
 assert(!ownFirst.reservedForOtherParagraph.includes('월지 본기의 자원 활용 의미'));
 if(ownFirst.overlappingMonthLearning){
  assert(ownFirst.readerConclusion.includes('외부에서 지원을 받을 수 있는 조건'));
  assert(!ownFirst.readerConclusion.includes('정보 이해·배움 의미'));
  assert(ownSecond.readerConclusion.includes('외부 지원 조건을 다시 설명하지 않는다'));
  assert(ownSecond.readerConclusion.includes(strength.tenGodFocus.monthStem.meaning)||
   ownSecond.readerConclusion.includes('새로운 정보를 자기 방식으로 해석하고 이해하는 태도'));
 }
 const strictOwn=wire.schemaFor(p,require('./report-schema.json'))
  .properties.chapters.properties.saju_core.properties.paragraphs.properties;
 const firstSlot=strictOwn.temperament.anyOf.find(x=>x.type==='object');
 const secondSlot=strictOwn.strength;
 assert(firstSlot.properties.text.description.includes(ownFirst.readerConclusion));
 assert(secondSlot.properties.text.description.includes(ownSecond.readerConclusion));
 assert(!firstSlot.properties.text.description.includes(ownSecond.readerConclusion));
 assert(!secondSlot.properties.text.description.includes(ownFirst.readerConclusion));
 const corrupted=structuredClone(request);
 corrupted.task.chapters.saju_core.topics.temperament.evidenceFocus.claimOwnership=
  structuredClone(ownSecond);
 assert(transportGuard.inspectTransport(p,corrupted)
  .includes('core-reader-evidence-brief-drift:saju_core/temperament'),
  'AI input must reject drift to the other paragraph claim before billing');
 // The full chart may expose many hidden stems, but the first paid
 // paragraph owns seasonal + visible positions, while the second owns
 // ONLY the month stem and verified principal hidden stem.
 const firstAllowed=core.topics.temperament.citableFacts.map(x=>x.id);
 const secondAllowed=core.topics.strength.citableFacts.map(x=>x.id);
 const mainMonthId='natal.month.hidden.'+mc.mainHiddenStem;
 assert(firstAllowed.includes('facts.seasonalEvidence')&&
  firstAllowed.includes('facts.qiEvidence')&&
  firstAllowed.includes('natal.month.stem'));
 assert(!firstAllowed.some(x=>x.startsWith('natal.month.hidden.')),
  'first paragraph must not cite a hidden-stem interpretation owned by second');
 assert(secondAllowed.includes('natal.month.stem')&&
  secondAllowed.includes(mainMonthId));
 assert.deepEqual(secondAllowed.filter(x=>x.startsWith('natal.month.hidden.')),
  [mainMonthId], 'second paragraph must not borrow secondary hidden-stem meanings');
 assert(!firstAllowed.some(x=>x.startsWith('facts.rootConditions')||
  x.startsWith('facts.stemConnections')));
 assert(!secondAllowed.some(x=>x.startsWith('facts.rootConditions')||
  x.startsWith('facts.stemConnections')));
 assert.deepEqual(temperament.points.map(x=>x.kind),
  ['month-vs-day','visible-support-vs-counter']);
 assert.deepEqual(strength.points.map(x=>x.kind),
  ['month-ten-god-pair']);
 assert.equal(strength.tenGodFocus.monthStem.tenGod,month.stemTenGod);
 assert.equal(strength.tenGodFocus.monthMainHidden.tenGod,mc.mainHiddenStemTenGod);
 assert.deepEqual(strength.tenGodFocus.elementLink,link);
 assert(strength.readerReasoning.reasoningTask.includes(link.explanation),
  'provider must see a grounded positional relationship, not only two dictionary definitions');
 assert(strength.points[0].calculatedExplanation.includes(link.explanation),
  'the exact source-paired five-element relation must reach the paid provider');
 assert(!/(?:실제 갈등이 생기|재산이 늘|돈을 잘 벌|내적 충돌이 확정)/.test(strength.readerReasoning.reasoningTask),
  'element relationships do not resolve real psychological events');
 assert(!temperament.policy.includes('tenGodFocus'),
  'first paragraph must not request the second paragraph month ten-god contrast');
 assert(strength.policy.includes('tenGodFocus.monthStem')&&strength.policy.includes('tenGodFocus.monthMainHidden'),
  'second paragraph must explain only the computed monthly ten-god pair');
 assert(temperament.policy.includes('월의 계절')&&temperament.policy.includes('겉글자'),
  'first paragraph must retain its separate traditional question');
 assert(strength.tenGodFocus.monthStem.meaning&&strength.tenGodFocus.monthMainHidden.meaning);
 for(const item of [strength.tenGodFocus.monthStem,strength.tenGodFocus.monthMainHidden]){
  assert(strength.readerReasoning.reasoningTask.includes(item.tenGod));
  assert(strength.readerReasoning.reasoningTask.includes(item.meaning));
  assert(!strength.readerReasoning.hypotheticalQuestion.includes(item.tenGod),
   'internal ten-god labels must not be inserted into customer scenario');
  assert(!strength.readerReasoning.hypotheticalQuestion.includes(item.meaning),
   'raw technical glossary must remain in private evidence, not the imagined scene');
 }
 // It must use real customer-specific traditional categories to ask
 // something understandable. This is an imagined decision, not an asserted
 // biography, an inner conflict or a generic list of abstract nouns.
 // Customer-value editing MUST come from the ACTUAL month pair, not a
 // type-agnostic word list. This is a scenario, not observed personality.
 // This is the missing step between a chart dictionary and a payable
 // reading. The provider gets two authentic traditional perspectives and
 // a tentative synthesis, without claiming observed behavior.
 const traditional=strength.readerReasoning.readerValuePlan.traditionalReading;
 assert.equal(traditional.status,'conditional-traditional-reading-not-observed-personality');
 assert.equal(traditional.first.sourceId,'natal.month.stem');
 assert.equal(traditional.first.tenGod,month.stemTenGod);
 assert.equal(traditional.second.sourceId,'natal.month.hidden.'+mc.mainHiddenStem);
 assert.equal(traditional.second.tenGod,mc.mainHiddenStemTenGod);
 assert(traditional.first.reading&&traditional.second.reading);
 // Keep real provenance, but exclude duplicated draft headlines and meta-prose.
 for(const field of ['tentativeThesis','editorialDuty','evidenceLimit'])
  assert(!Object.hasOwn(traditional,field),'paid provider received redundant editorial prose: '+field);
 const coreWire=require('./report-wire').schemaFor(p,require('./report-schema.json'));
 const writtenStrength=coreWire.properties.chapters.properties.saju_core.properties.paragraphs
  .properties.strength;
 const coreStrength=(writtenStrength.anyOf||[writtenStrength]).find(x=>x.type==='object');
 assert([traditional.first.reading,traditional.second.reading].every(
  meaning=>coreStrength.properties.text.description.includes(meaning)),
  'billable writer must receive both REAL month-position readings');
 assert(!/작성 목적:|해석의 범위:/.test(coreStrength.properties.text.description),
  'response schema must not include a draft editorial plan or repeated disclaimer');
 assert(coreWire.properties.chapters.properties.saju_core.properties.keyJudgment.description
  .includes('생활 조언이나 자료 분석 계획만으로 대체하지 않는다'));
 assert(coreWire.properties.chapters.properties.saju_core.properties.keyJudgment.description
  .includes('자연스러운 한국어 한 문장'));
 assert(!coreWire.properties.chapters.properties.saju_core.properties.title.description
  .includes('하나의 생활 질문'));
 assert(p.analysisGuidance.chapterTasks.saju_core.focus.includes('조건부 기질 해석을 제시한다'));
 assert(p.analysisGuidance.editorialBlueprint.saju_core.topicTasks.strength.interpretationBoundary
  .includes('질문 목록으로 전환하지 않는다'));
 assert(request.task.chapters.saju_core.topics.strength.evidenceFocus.readerReasoning.readerValuePlan.customerSequence
  .includes('한 가지 조건부 기질 해석'));
 assert(!request.task.chapters.saju_core.topics.strength.evidenceFocus.readerReasoning.readerValuePlan.customerSequence
  .includes('첫 질문과 둘째 질문을 각각 적용'));
 const paidSystem=require('./report-generation-request').policy;
 assert(paidSystem.includes('내부 first/second 편집 질문이나 검증용 문답을 고객용 문장으로 복사하지 않는다'));
 assert(!paidSystem.includes('어떤 질문을 빠뜨리면 불리한지'));
 assert(!request.task.chapters.saju_core.topics.strength.evidenceFocus.readerReasoning.hypotheticalQuestion
  .includes('두 질문의 의미를 서로 다른 계산 위치에 연결'));
 // Validate both the actual compact task AND the exact provider schema:
 // a returned text paragraph is an interpretation, not two editorial answers.
 assert(pairedText.includes('한 가지 조건부 기질 해석으로 연결'));
 assert(!pairedText.includes('두 질문에 각각 답해야 하는 이유'));
 assert(chapterSchema.keyJudgment.description.includes('자연스러운 한국어 한 문장'));
 if(input.calendar==='lunar'&&input.birthDate==='1982-11-24'){
  assert.equal(traditional.first.tenGod,'편인');
  assert.equal(traditional.second.tenGod,'편재');
  assert(traditional.first.reading==='새로운 정보를 자기 방식으로 해석하고 이해하는 태도'&&
   traditional.second.reading==='여러 곳의 자원을 살피고 필요한 곳에 활용하는 태도',
   'paid fixture must receive BOTH individually source-grounded readings without an invented combined draft');
 }
 // Keep the two separate source-meaning questions only in the private
 // editorial plan. Their absence in the provider plan is intentional.
 const monthReaderPlan=meaning.readerReasoning.readerValuePlan;
 // Verify the outgoing brief asks for conditional meanings, not a checklist.
 assert(monthReaderPlan.advantageQuestion.includes('가상 선택')&&
   monthReaderPlan.advantageQuestion.includes('유리하게')&&
   monthReaderPlan.riskQuestion.includes('가상')&&
   monthReaderPlan.riskQuestion.includes('놓치'),
   'month reading must explain conditional advantages and disadvantages');
 assert(!/확인할 수 있는 전통적 질문은|왜 오류인가|어떤 주의할 조건이 빠지는가/.test(
   monthReaderPlan.advantageQuestion+' '+monthReaderPlan.riskQuestion),
   'outdated glossary and audit wording must not reach paid writing');
 assert.equal(monthReaderPlan.first.tenGod,month.stemTenGod);
 assert.equal(monthReaderPlan.first.sourceId,'natal.month.stem');
 assert.equal(monthReaderPlan.second.tenGod,mc.mainHiddenStemTenGod);
 assert.equal(monthReaderPlan.second.sourceId,'natal.month.hidden.'+mc.mainHiddenStem);
 assert(monthReaderPlan.first.question&&monthReaderPlan.second.question,
  'both computed ten gods must produce plain-language decision questions');
 assert(monthReaderPlan.customerSequence.includes('가상의')||monthReaderPlan.customerSequence.includes('가상'),
  'a traditional symbol must be applied to an explicitly hypothetical decision');
 assert(/(?:무엇|어떤)/.test(monthReaderPlan.advantageQuestion)&&
  /(?:무엇|어떤|왜)/.test(monthReaderPlan.riskQuestion),
  'reader must receive TWO separate upside/downside decision questions rather than a technical dictionary');
 assert(!/(?:당신은 항상|실제로 갈등이|능력이 뛰어나|돈을 많이 벌)/.test(
  JSON.stringify(monthReaderPlan)),'customer value plan must not invent a measured personal behavior');
 const seasonReaderPlan=temperament.readerReasoning.readerValuePlan;
 assert(seasonReaderPlan.advantageQuestion&&seasonReaderPlan.riskQuestion);
 assert(seasonReaderPlan.prohibitedShortcut.includes('계절 전환')&&
  seasonReaderPlan.prohibitedShortcut.includes('적응력'));
 // The user lunar sample and other charts can have resource on visible
 // stems plus 印星 at the birth-month surface. Do not sell the SAME
 // information-processing conclusion twice in one paid first chapter.
 const visibleFamilies=new Set([...support.support,...support.counter].map(x=>x.relation));
 const sourceOverlaps=visibleFamilies.has('resource')&&
  ['편인','정인'].includes(month.stemTenGod);
 if(sourceOverlaps){
  assert(seasonReaderPlan.distinctFromMonthPair?.includes('같은 학습 결론을 두 번 쓰지 않는다'),
   'duplicate resource/learning conclusion must be separated BEFORE paid generation');
  assert(temperament.readerReasoning.hypotheticalQuestion.includes('어떤 지원이 가능한지'));
  assert(!/정보를 자기 방식으로 어떻게 이해|돈과 재료를 어디서 마련/.test(
   temperament.readerReasoning.hypotheticalQuestion),
   'first paragraph should not preempt the paired second question');
  const focusedSchema=require('./report-wire').schemaFor(p,require('./report-schema.json'));
  const optional=focusedSchema.properties.chapters.properties.saju_core.properties.paragraphs.properties.temperament;
  const first=optional.anyOf.find(x=>x.type==='object');
  assert(optional.anyOf.some(x=>x.type==='null'));
  assert(first.properties.text.description.includes(seasonReaderPlan.distinctFromMonthPair),
   'the real provider schema must actually receive the meaning-separation directive');
  assert(first.properties.label.description.includes('도움의 조건'));
 }
 if(input.calendar==='lunar'&&input.birthDate==='1982-11-24')
  assert(sourceOverlaps,'the lunar paid QA sample must exercise this overlap regression');
 const transmittedPlan=request.task.chapters.saju_core.topics.strength.evidenceFocus.readerReasoning.readerValuePlan;
 const expectedTransmitted=structuredClone(monthReaderPlan);
 delete expectedTransmitted.first.question;
 delete expectedTransmitted.second.question;
 assert.deepEqual(transmittedPlan,expectedTransmitted,
  'provider must preserve source-grounded meaning and tradeoffs without duplicate internal FAQ prompts');
 assert(monthReaderPlan.first.question&&monthReaderPlan.second.question&&
  !Object.hasOwn(transmittedPlan.first,'question')&&!Object.hasOwn(transmittedPlan.second,'question'),
  'internal QA may keep both questions but the customer prose writer must not receive them');
 assert.equal(transmittedPlan.first.sourceId,'natal.month.stem');
 assert.equal(transmittedPlan.second.sourceId,'natal.month.hidden.'+mc.mainHiddenStem);
 const scenario=strength.readerReasoning.hypotheticalQuestion;
 const mainKind=strength.tenGodFocus.monthMainHidden.tenGod;
 assert(scenario.includes('가상의 상황')&&
  scenario.includes(contrasts.TEN_GOD_SCENE[mainKind]+' 때'),
  'first-chapter situation must be selected from its actual main monthly category');
 assert(!scenario.includes('새로운 일을 준비하면서'),
  'one stock job-preparation scenario must not overwrite distinct computed categories');
 assert(!/(?:내부 출처|natal\\.|basis\\.|지장간|십성|편인|정인|정재|편재|비견|겁재|식신|상관|정관|편관)/.test(scenario),
  'plain Korean scene must not carry technical source-audit text');
 assert(strength.tenGodFocus.monthStem.tenGod&&strength.tenGodFocus.monthMainHidden.tenGod,
  'both exact symbolic labels must stay in verified private data');
 assert(!/(?:당신은 실제로|늘 그랬|이미 겪었|갈등이 생깁니다|성격이 충돌합니다)/.test(scenario),
  'calculated categories must not become asserted biography or psychological conflict');
 if(input.calendar==='lunar'&&input.birthDate==='1982-11-24'){
  assert(scenario.includes('처음 접하는 정보를 자기 방식으로 어떻게 이해할지'),
   'real lunar sample must give a concrete learning-related scene for 癸 편인');
  assert(scenario.includes('필요한 돈과 재료를 어디서 마련하고 어떻게 쓸지'),
   'real lunar sample must give a different resource-related scene for 己 편재');
  assert(!scenario.includes('반복해서 드는 비용을 어떻게 감당할지'),
   'actual 편재 must not be swapped with the invented 정재 decision');
  assert(monthReaderPlan.first.question.includes('처음 접하는 정보를 자기 방식으로 어떻게 이해할지'));
  assert(monthReaderPlan.second.question.includes('필요한 돈과 재료를 어디서 마련하고 어떻게 쓸지'));
  assert(!monthReaderPlan.customerSequence.includes('무조건 두 성격이 충돌'),
   '편인 / 편재 is not a measured personality opposition');
 }
 const changedScenario=structuredClone(request);
 changedScenario.task.chapters.saju_core.topics.strength.evidenceFocus.readerReasoning.hypotheticalQuestion=
  '항상 당신은 혼자 결정합니다.';
 assert(transportGuard.inspectTransport(p,changedScenario).includes(
  'core-reader-evidence-brief-drift:saju_core/strength'),
  'a generic or unsourced customer scenario must not replace the verified one before billing');
 assert(!strength.readerReasoning.hypotheticalQuestion.includes('배움·표현·규칙·자원 중'),
  'only calculated ten-god themes may shape a paid reader example');
 assert.equal(strength.tenGodFocus.sameClassification,
  strength.tenGodFocus.monthStem.tenGod===strength.tenGodFocus.monthMainHidden.tenGod);
 for(const item of [...temperament.points,...strength.points]){
  assert(!Object.hasOwn(item,'question'),
   'internal source verification must not be sent as a customer interpretation question');
  assert(typeof item.sourceAuditCheck==='string'&&item.sourceAuditCheck.length>30,
   'exact calculated source audit criterion must remain available');
  assert(Array.isArray(item.sourceRefs),
   'citation bindings must remain unchanged');
 }
 // Root/clash positions remain verified in the raw contrast, but are
 // no longer the source-first writing task shown to the paid model.
 if(rootClashes.length){
  const verifiedClashes=contrast.contrastPoints[3].calculatedExplanation;
  for(const pair of rootClashes){
   const lhs=({year:'연',month:'월',day:'일',hour:'시'})[pair.counterpart];
   const rhs=({year:'연',month:'월',day:'일',hour:'시'})[pair.location];
   assert(verifiedClashes.includes(lhs+'지 ↔ '+rhs+'지'),
    'private calculation audit must preserve both actual clash endpoints');
  }
 }
 assert(!strength.points.some(p=>/root|clash/.test(p.kind)),
  'root and clash diagnostics must not be compulsory paid prose prompts');
 assert(strength.points[0].calculatedExplanation.includes(month.stemTenGod));
 assert(strength.points[0].calculatedExplanation.includes(mc.mainHiddenStemTenGod));
 assert.deepEqual(strength.points[0].sourceRefs,
  ['natal.month.stem','natal.month.hidden.'+mc.mainHiddenStem]);
 if(input.calendar==='lunar'&&input.birthDate==='1982-11-24'){
  assert.deepEqual(rootClashes.map(c=>c.positions.join(',')),['month,day','month,hour']);
  assert(!strength.sourceAudit.includes('일지와 시지의 충'),
   'day-hour relationship must not be invented from two separate month clashes');
 }
 for(const [topic,focus] of [['temperament',temperament],['strength',strength]]){
  assert(focus.readerReasoning.contrastQuestion.includes('?'),
   topic+' must answer a reader-level difference question');
  assert(focus.readerReasoning.reasoningTask.length>75,
   topic+' must contain a substantive interpretive bridge, not more boilerplate');
  assert(focus.readerReasoning.hypotheticalQuestion.includes('가상'),
   topic+' must not make the user scenario sound observed');
  assert(focus.readerReasoning.interpretivePayoff.length>30,
   topic+' must identify what the paying reader should understand');
  assert(!/(?:왜\s*증명|왜\s*확인되지\s*않|판단할\s*수\s*없는\s*강도)/.test(focus.readerReasoning.hypotheticalQuestion),
   topic+' should ask about traditional reading, not repeat internal epistemic caveats');
  assert(focus.readerReasoning.interpretivePayoff.includes('이해'),
   topic+' should define reader benefit, not an endless disclaimer');
  assert(focus.policy.includes('basis.limit'),
   topic+' must keep limits internally and focus the customer-facing prose');
  assert(focus.readerQuestion.includes('기질'),
   topic+' must address what the reader actually wants to know');
  assert(!/(?:뿌리|통근|충\\s*관계|지장간)/.test(focus.readerQuestion),
   topic+' customer-facing question must not teach chart calculation terms');
  assert(focus.internalEvidenceRole.length>30,
   topic+' must retain grounded technical source purpose');
  assert(!/(?:뿌리\s*\d+곳|충\s*관계\s*\d+건|월지와\s*일지의\s*충)/.test(focus.readerReasoning.hypotheticalQuestion),
   topic+' reader-facing example must not repeat technical audit counts');
 }
 assert.notEqual(temperament.readerReasoning.hypotheticalQuestion,
   strength.readerReasoning.hypotheticalQuestion,
   'the two paragraphs must not recycle a single generic imaginary example');
 // Strong provenance constraints: generalization must not invent a specific
 // resource/metal/water symbol, roots or clashes that were not calculated.
 const visibleRelations=new Set([...support.support,...support.counter].map(x=>x.relation));
 const firstReason=temperament.readerReasoning;
 assert(firstReason.reasoningTask.includes(contrast.monthAndDay.phase==='transition'?'전환월':'중심 계절'));
 for(const [relation,marker] of [['resource','배움·보호'],['control-on-day','규칙·역할·압박'],['output','표현·생산']]){
  if(!visibleRelations.has(relation))assert(!firstReason.reasoningTask.includes(marker),
   'unobserved visible classification must never appear as a paid explanation: '+relation);
 }
 if(!visibleRelations.has('resource'))assert(!firstReason.hypotheticalQuestion.includes('나를 돕는 전통 분류'),
  'another chart must not inherit the paid ISFP fixture resource example');
 assert(strength.sourceAudit.includes('natal.month.stem')&&
  strength.sourceAudit.includes('natal.month.hidden.'+mc.mainHiddenStem),
  'provider-facing audit must check the two actual month positions');
 assert(!/(?:뿌리.{0,15}[0-9]+곳|충 관계 [0-9]+건|일지와 시지의 충)/.test(strength.sourceAudit),
  'paid provider should not receive the raw rooting and clash counts');
 const firstRefs=new Set(core.topics.temperament.citableFacts.map(x=>x.id));
 const secondRefs=new Set(core.topics.strength.citableFacts.map(x=>x.id));
 assert(firstRefs.has('facts.seasonalEvidence')&&firstRefs.has('facts.qiEvidence'),
  'core first paragraph must cite season and visible-element observation');
 assert(!firstRefs.has('facts.stemConnections')&&!firstRefs.has('facts.rootConditions'),
  'root and clash evidence may not leak into the month/visible qi explanation');
 assert(!secondRefs.has('facts.stemConnections')&&!secondRefs.has('facts.rootConditions')&&
  !secondRefs.has('facts.structuralEvidence.dayMasterRoots'),
  'optional roots remain available to internal calculation, not customer month-ten-god paragraph');
 assert(secondRefs.has('natal.month.stem')&&secondRefs.has('natal.month.hidden.'+mc.mainHiddenStem),
  'month stem and month main hidden ten-god sources must both reach the writer');
 assert.deepEqual(blueprint.saju_core.topicTasks.temperament.requiredSourceKinds,
  ['seasonal','qi-ledger','natal-month-position']);
 assert.deepEqual(blueprint.saju_core.topicTasks.strength.requiredSourceKinds,['month-ten-god']);
 assert.equal(blueprint.saju_core.topicTasks.strength.primaryEvidencePath,'facts.tenGods.month');
 assert(!generation.policy.includes('temperament는 facts.seasonalEvidence, facts.qiEvidence, facts.stemConnections를 모두 인용'),
  'conflicting legacy instruction must not override paragraph evidence ownership');
 assert.deepEqual(temperament.points.map(x=>x.calculatedExplanation),
  contrast.contrastPoints.slice(0,2).map(x=>x.calculatedExplanation),
  'season and visible relations must remain separately grounded');
 assert(strength.points[0].calculatedExplanation.includes(strength.tenGodFocus.monthStem.meaning)&&
  strength.points[0].calculatedExplanation.includes(strength.tenGodFocus.monthMainHidden.meaning),
  'only the exact month ten-god meanings should shape the second paid paragraph');
 for(const [topicId,focus] of [['temperament',temperament],['strength',strength]]){
  const permitted=new Set(core.topics[topicId].citableFacts.map(x=>x.id));
  for(const point of focus.points){
   assert(point.sourceRefs.length>0,'calculated focus must have actual source: '+point.kind);
   for(const ref of point.sourceRefs)assert(permitted.has(ref),
    'topic evidence may not cite another topic\'s references: '+topicId+'/'+ref);
   assert(!/능력이 뛰어|실제로 성실|성공한다/.test(point.calculatedExplanation),
    'deterministic facts must never become observed personal traits');
  }
 }
 // All contrast points must exist in the original calculated packet.
 // Only the two customer paragraphs' permitted subset reaches the model.
 const allRows=new Set(require('./report-fact-bindings').build(packet).map(x=>x.id));
 for(const point of contrast.contrastPoints)for(const ref of point.refs){
  const exists=ref.startsWith('natal.')?allRows.has(ref):
   ref.startsWith('facts.')?ref.split('.').slice(1).reduce((v,k)=>v?.[k],packet.facts)!=null:false;
  assert(exists,'contrast references unknown original calculation '+ref);
 }
 const visibleRefs=new Set([...temperament.points,...strength.points]
  .flatMap(point=>point.sourceRefs));
 for(const ref of visibleRefs){
  assert(Object.hasOwn(request.source,ref),
   'customer-facing core paragraph lost a citable fact '+ref);
 }
 assert(!JSON.stringify(contrast).includes('percentStrength'));
 assert(!JSON.stringify(contrast).includes('predictedMarriage'));
 results.push({signature:contrast.chartSignature,season:contrast.monthAndDay.season,
  monthBranch:contrast.monthAndDay.monthBranch,
  direction:contrast.monthAndDay.direction,
  natalRoots:root.observedRootCount,
  supportVisible:support.support.length,counterVisible:support.counter.length,
  natalRootClashes:rootClashes.length});
}
assert.notEqual(results[0].signature,results[1].signature,
 'same date string in lunar and solar must have distinct chart identity');
assert.notEqual(contrasts.build(facts.build(cases[0],2027)).contrastPoints[0].calculatedExplanation,
 contrasts.build(facts.build(cases[1],2027)).contrastPoints[0].calculatedExplanation,
 'the actual editorial seed must change between lunar and solar readings of the same birth string');
assert.notEqual(results[2].monthBranch,results[3].monthBranch,
 'spring/summer and winter seasonal contrasts should not collapse');
assert(new Set(results.map(x=>JSON.stringify(x))).size>=4,
 'at least four materially different calculated contrasts are required');
const sameChartNewMbti=facts.build({...cases[0],mbti:'INTJ'},2027);
assert.deepEqual(contrasts.build(sameChartNewMbti),contrasts.build(facts.build(cases[0],2027)),
 'MBTI label cannot silently change a deterministic Saju contrast');
const withFacts=contrasts.build(facts.build(cases[0],2027));
const emptyRoot=structuredClone(withFacts);
emptyRoot.contrastPoints[2].evidence.rootLocations=[];
emptyRoot.contrastPoints[2].evidence.observedRootCount=0;
emptyRoot.contrastPoints[3].evidence.collisions=[];
const zeroRootFocus=contrasts.forTopic(emptyRoot,'strength',[]);
assert.equal(zeroRootFocus.readerReasoning.contrastQuestion,
 contrasts.forTopic(withFacts,'strength',[]).readerReasoning.contrastQuestion,
 'absence of a root cannot erase a separately calculated month ten-god interpretation');
assert.equal(zeroRootFocus.tenGodFocus.monthStem.tenGod,withFacts.monthTenGodContext.monthStem.tenGod);
assert(!/뿌리|충 관계/.test(zeroRootFocus.readerReasoning.hypotheticalQuestion),
 'reader-facing month ten-god example must not revert to roots and clashes');
const noSupport=structuredClone(withFacts);
noSupport.contrastPoints[1].evidence.support=[];
noSupport.contrastPoints[1].evidence.counter=[];
const emptyVisible=contrasts.forTopic(noSupport,'temperament',[]);
assert(!emptyVisible.readerReasoning.reasoningTask.includes('배움·보호'),
 'zero visible stems must never manufacture supportive resources');
assert(!emptyVisible.readerReasoning.hypotheticalQuestion.includes('나를 돕는 전통 분류'),
 'zero visible stems must not receive a resource-based example');
assert.equal(contrasts.build({}),null,'missing calculated facts cannot create chart-specific personality claims');
console.log('PASS real multi-chart contrast reaches paid writer without invented traits or annual spillover');
console.log('CHART_CONTRAST_AUDIT '+JSON.stringify(results));
