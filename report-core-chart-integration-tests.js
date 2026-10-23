'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const engine=require('./report-core-knowledge-engine');
const merge=require('./report-core-chart-integration');
const coverage=require('./report-core-knowledge-coverage');
const all=coverage.representativeInputs();
let machine=0,human=0,missing=0;
const texts=new Set();
const focusKinds=new Set();
let categoryBoundSeparateScenes=0;
const exposureKinds=new Set();
for(const input of all){
 const p=facts.build(input,2027),out=engine.compile(p);
 if(out.status==='not-covered'){
  missing++;assert.equal(out.reader,null);continue;
 }
 if(out.review.fourPillar){
  human++;assert.equal(out.review.chartSynthesis,null);
  assert.equal(out.reader.paragraphs.chartSynthesis,null);continue;
 }
 machine++;
 assert.equal(out.status,'draft-for-human-review');
 assert.equal(out.review.chartSynthesis.editorialStatus,'machine-composed-review-only');
 assert.equal(out.review.chartSynthesis.releaseVerdict,'not-approved');
 assert.equal(out.review.chartSynthesis.apiCalls,0);
 assert.equal(out.review.chartSynthesis.humanReviewRequired,true);
 assert(out.review.chartSynthesis.sourceRefs.includes('natal.year.stem'));
 assert(out.review.chartSynthesis.sourceRefs.includes('natal.hour.stem'));
 assert.deepEqual(out.review.chartSynthesis.evidence.chart,p.chart);
 const relationFacts=p.facts.natalBranchRelations;
 const relationEvidence=out.review.chartSynthesis.evidence;
 const summary=relationEvidence.relationSummary;
 assert.equal(summary.kind,'unranked-calculated-branch-table-contacts-v1');
 assert.equal(summary.adoptedPriority,'none');
 assert.equal(summary.inferredLifeEvents,false);
 assert.equal(summary.measuredInteractionStrength,false);
 assert.deepEqual(relationEvidence.relationPairs,relationFacts.pairs,
  'all branch table labels must be preserved without priority/truncation');
 assert.deepEqual(relationEvidence.relationGroups,relationFacts.groups);
 assert.equal(summary.pairTableEntries,relationFacts.pairs.length);
 const observedKeys=new Set(relationFacts.pairs.map(r=>
  r.positions.slice().sort().join('/')));
 assert.equal(summary.independentContacts.length,observedKeys.size,
  'multiple labels for a single pair are one structural contact');
 assert(summary.independentContacts.every(x=>x.tableLabels.length>0));
 assert.equal(summary.sameContactWithMultipleLabels.length,
  summary.independentContacts.filter(x=>x.tableLabels.length>1).length);
 if(relationFacts.pairs.length){
  assert(out.reader.paragraphs.chartSynthesis.text.includes(
   summary.displayedReaderReason));
 }

 assert.equal(out.review.chartSynthesis.evidence.yearTenGod,
  out.wholeChartEvidence.otherVisible.find(x=>x.position==='year').tenGod);
 assert.equal(out.review.chartSynthesis.evidence.hourTenGod,
  out.wholeChartEvidence.otherVisible.find(x=>x.position==='hour').tenGod);
 assert.deepEqual(out.review.chartSynthesis.evidence.rootRefs,
  out.wholeChartEvidence.dayMasterRoots.map(x=>x.id));
 const exposure=out.review.chartSynthesis.evidence.exposureEvidence;
 assert.equal(exposure.kind,'month-hidden-to-nonday-visible-observation-v1');
 assert.equal(exposure.mainSourceId,
  out.review.chartSynthesis.sourceRefs.find(x=>x.startsWith('natal.month.hidden.')));
 assert.equal(exposure.monthPatternPriority,'not-assessed');
 assert.equal(exposure.strengthVerified,false);
 assert.equal(exposure.personalBehaviorObserved,false);
 assert(out.review.chartSynthesis.sourceRefs.includes('facts.stemConnections'));
 assert(out.reader.paragraphs.chartSynthesis.text.includes(exposure.displayedReaderReason));
 const symbolic={
  비견:'함께 맡는 역할과 몫',겁재:'함께 맡는 역할과 몫',
  식신:'생각을 밖으로 표현하고 결과로 남기는 일',상관:'생각을 밖으로 표현하고 결과로 남기는 일',
  정재:'필요한 자원과 비용의 관리',편재:'필요한 자원과 비용의 관리',
  정관:'맡은 책임과 지켜야 할 기준',편관:'맡은 책임과 지켜야 할 기준',
  정인:'정보와 도움을 받아 배우는 과정',편인:'정보와 도움을 받아 배우는 과정'
 };
 const mainStem=exposure.mainSourceId.split('.').at(-1);
 const mainRole=p.facts.tenGods.month.hiddenStems.find(x=>x.stem===mainStem).tenGod;
 assert(exposure.displayedReaderReason.includes(symbolic[mainRole]),
  'reader needs a human-readable meaning of its central calculated month symbol');
 for(const hiddenId of new Set(exposure.otherMatches.map(x=>x.hiddenId))){
  const stem=hiddenId.split('.').at(-1);
  const role=p.facts.tenGods.month.hiddenStems.find(x=>x.stem===stem).tenGod;
  assert(exposure.displayedReaderReason.includes(symbolic[role]),
   'other exposed source must also add a distinct grounded meaning');
 }
 assert(exposure.sourceRefs.every(id=>out.review.chartSynthesis.sourceRefs.includes(id)));
 for(const hiddenId of new Set(exposure.otherMatches.map(x=>x.hiddenId))){
  assert(exposure.sourceRefs.includes(hiddenId),
   'each secondary exposed stem needs its own cited source record');
  assert(out.review.chartSynthesis.sourceRefs.includes(hiddenId),
   'a secondary hidden-stem claim must be traceable from the final paragraph');
 }
 const computed=require('./report-stem-connections').build(p.chart);
 const mainRow=computed.exposure.find(row=>row.hiddenId===exposure.mainSourceId);
 assert(mainRow);
 assert.deepEqual(exposure.mainVisiblePositions,mainRow.exactVisibleMatches
  .filter(v=>v.position!=='day').map(v=>v.position));
 assert.deepEqual(exposure.otherMatches,computed.exposure.filter(
  row=>row.position==='month'&&row.layer!=='main').flatMap(row=>
   row.exactVisibleMatches.filter(v=>v.position!=='day').map(v=>({
    hiddenId:row.hiddenId,sourceId:v.id,position:v.position
   }))));
 exposureKinds.add(exposure.status);
 const q=out.review.chartSynthesis.evidence.roleQuestions;
 assert.deepEqual(q.map(x=>x.position),['year','month','hour'],
  'every source-specific question is bound to its own natal position');
 assert.deepEqual(q.map(x=>x.tenGod),[
  out.wholeChartEvidence.otherVisible.find(x=>x.position==='year').tenGod,
  out.wholeChartEvidence.monthVisible.tenGod,
  out.wholeChartEvidence.otherVisible.find(x=>x.position==='hour').tenGod]);
 assert(q.every(x=>x.question.length>=10));
 const focused=out.review.chartSynthesis.evidence.interpretiveFocus;
 assert(focused&&focused.kind&&focused.premise.length>=25,
  'judgment must state a meaningful difference, not fill a length quota');
 assert(focused.premise.includes('태어난'),
  'the new reader must explain the difference in ordinary Korean');
 assert(focused.conditionalReading.length>=50);
 assert(focused.conditionalReading.includes('예를 들어'));
 assert(!focused.conditionalReading.includes('확인할 질문은'));
 assert.deepEqual(require('./report-reader-policy').errors(
  [focused.premise,focused.conditionalReading]),[],
  'traditional labels belong in internal evidence rather than reader copy');
 assert.equal(focused.verdict,'review-only');
 assert.equal(focused.observedPersonality,false);
 assert.equal(focused.determinedStrength,false);
 assert.equal(focused.eventPrediction,false);
 assert.deepEqual(focused.sourceRefs,['natal.year.stem',
  out.review.chartSynthesis.sourceRefs.find(x=>x.startsWith('natal.month.hidden.')),
  'natal.hour.stem']);
 assert.deepEqual(focused.tenGods,{
  year:q[0].tenGod,monthHidden:out.review.chartSynthesis.evidence.hiddenTenGod,
  hour:q[2].tenGod});
 assert(out.reader.paragraphs.chartSynthesis.text.includes(focused.premise));
 assert(out.reader.paragraphs.chartSynthesis.text.includes(focused.conditionalReading));
 const y=focused.categories.year,h=focused.categories.hour,m=focused.categories.monthHidden;
 const expectedFocus=y===m&&h===m?'month-hidden-links-year-and-hour':
  y===m?'month-hidden-links-year':
  h===m?'month-hidden-links-hour':
  q[0].tenGod===q[2].tenGod?'year-hour-same-ten-god':
  y===h?'year-hour-same-category':'three-separate-functions';
 assert.equal(focused.kind,expectedFocus,
  'judgment emphasis must arise from independently checked natal category comparisons');
 focusKinds.add(focused.kind);
 if(focused.kind==='three-separate-functions'){
  categoryBoundSeparateScenes++;
  const task={
   peer:'함께 맡을 일과 몫을 구분하는 일',
   output:'생각을 결과물로 정리하는 일',
   wealth:'준비할 자원과 비용을 확인하는 일',
   authority:'맡을 책임과 따라야 할 기준을 정하는 일',
   resource:'참고할 설명과 자료를 확인하는 일'
  };
  const cats=focused.categories;
  assert(focused.conditionalReading.includes('해에서는 '+task[cats.year]),
   'year case must track its own calculated category');
  assert(focused.conditionalReading.includes('달의 안쪽에서는 '+task[cats.monthHidden]),
   'month hidden case must track the independently calculated category');
  assert(focused.conditionalReading.includes('시간에서는 '+task[cats.hour]),
   'hour case must track its own calculated category');
  assert(!focused.conditionalReading.includes('각각 분담, 준비 조건, 결과'),
   'arbitrary fixed sequence cannot substitute for a chart-derived comparison');
 }
 assert(!out.reader.paragraphs.chartSynthesis.text.includes('확인할 질문은'),
  'do not sell a three-question glossary as individual depth');
 assert.deepEqual(require('./report-reader-policy').errors(
  [out.reader.paragraphs.chartSynthesis.label,
   out.reader.paragraphs.chartSynthesis.text]),[],
  'visible chart synthesis must be free of traditional jargon');
 assert(!out.reader.paragraphs.chartSynthesis.text.includes('전통적 관점'),
  'avoid repeating dictionary-like full ten-god definitions');
 assert(!out.reader.paragraphs.chartSynthesis.text.includes('입니다 출생'),
  'independent position statements must be separated into complete sentences');
 assert(!out.reader.paragraphs.chartSynthesis.text.includes('그 뜻은 두 배'),
  'do not amplify repeated ten-god symbols');
 assert(out.reader.paragraphs.chartSynthesis.text.length>350);
 assert.equal(out.review.readerMechanical.mechanicalPass,true);
 assert.equal(out.releaseVerdict,'not-approved');
 assert.equal(out.apiCalls,0);
 texts.add(out.reader.paragraphs.chartSynthesis.text);
 assert.deepEqual(engine.compile(facts.build({...input,mbti:'ENTP'},2028)).reader,out.reader);
}
assert.equal(missing,68);
assert.equal(human,4);
assert.equal(machine,27);
assert(texts.size>=26);
assert(focusKinds.size>=3, 'multiple genuinely distinct judgment types must be exercised');
assert(categoryBoundSeparateScenes>0,
 'the 99 real calculation examples must exercise bound, non-generic three-role reader prose');
assert(exposureKinds.size>=3,
 'the real 99-chart grid must cover at least three different month exposure patterns');
for(const birthDate of ['1982-03-15','1982-06-15']){
 const input={calendar:'solar',birthDate,birthTime:'14:20',gender:'male',mbti:'ISFP'};
 const p=facts.build(input,2027),o=engine.compile(p);
 assert(o.review.chartSynthesis);
 const changed=engine.compile(facts.build({...input,birthTime:'20:20'},2027));
 assert(changed.review.chartSynthesis);
 assert.notEqual(changed.reader.paragraphs.chartSynthesis.text,
  o.reader.paragraphs.chartSynthesis.text);
 assert.deepEqual(changed.reader.paragraphs.strength,o.reader.paragraphs.strength);
 const unknown=engine.compile(facts.build({...input,birthTime:'',unknownBirthTime:true},2027));
 assert.equal(unknown.reader.paragraphs.chartSynthesis,null);
 assert.equal(unknown.review.chartSynthesis,null);
 const badGraph=structuredClone(o.wholeChartEvidence);
 badGraph.dayMasterRoots=[];
 if(o.wholeChartEvidence.dayMasterRoots.length)
  assert.throws(()=>merge.select(p,badGraph),/CORE_CHART_SYNTHESIS_ROOT_DIVERGED/);
 const badSeason=structuredClone(p);
 badSeason.facts.seasonalEvidence.monthPhase='corrupted';
 assert.throws(()=>merge.select(badSeason,o.wholeChartEvidence),/CORE_CHART_SYNTHESIS_SEASON_DIVERGED/);
 const hiddenSecondary=require('./report-seasonal-evidence').HIDDEN[p.chart.month[1]][1];
 if(hiddenSecondary){
  const brokenRole=structuredClone(p);
  const row=brokenRole.facts.tenGods.month.hiddenStems.find(x=>x.stem===hiddenSecondary);
  if(row){
   row.tenGod=row.tenGod==='정재'?'편재':'정재';
   if(require('./report-stem-connections').build(p.chart).exposure.some(x=>
    x.hiddenId==='natal.month.hidden.'+hiddenSecondary&&
    x.exactVisibleMatches.some(v=>v.position!=='day')))
    assert.throws(()=>merge.select(brokenRole,o.wholeChartEvidence),
     /CORE_CHART_SYNTHESIS_SECONDARY_EXPOSURE_SOURCE_DIVERGED/,
     'a corrupted secondary role must fail even with unchanged source IDs');
  }
 }
 const badExposed=structuredClone(p);
 badExposed.facts.stemConnections.exposure[0].hiddenStem='invented';
 assert.throws(()=>merge.select(badExposed,o.wholeChartEvidence),
  /CORE_CHART_SYNTHESIS_STEM_EXPOSURE_SOURCE_DIVERGED/,
  'a stale source graph must never justify month-to-visible prose');
 const badVisible=structuredClone(o.wholeChartEvidence);
 badVisible.otherVisible.find(x=>x.position==='year').tenGod='corrupted';
 assert.throws(()=>merge.select(p,badVisible),/CORE_CHART_SYNTHESIS_VISIBLE_DIVERGED/);
 const brokenRelation=structuredClone(o.wholeChartEvidence);
 brokenRelation.natalRelations=[];
 if(o.wholeChartEvidence.natalRelations.length)
  assert.throws(()=>merge.select(p,brokenRelation),/CORE_CHART_SYNTHESIS_RELATION_DIVERGED/);
}
const unsupported=engine.compile(facts.build({calendar:'solar',birthDate:'1990-05-15',
 birthTime:'14:20',gender:'male',mbti:'ISFP'},2027));
assert.equal(unsupported.status,'not-covered');assert.equal(unsupported.reader,null);
// General-purpose fact composition is exercised over ALL 99 calendar
// fixtures, but unsupported contexts must still be blocked by the reader gate.
const evidenceGraph=require('./report-core-evidence-graph');
let verifiedFactCombos=0;
for(const input of all){
 const packet=facts.build(input,2027);
 const graph=evidenceGraph.build(packet);
 const joined=merge.select(packet,graph);
 assert(joined);
 assert.deepEqual(joined.evidence.chart,packet.chart);
 assert.deepEqual(joined.evidence.relationPairs,
  packet.facts.natalBranchRelations.pairs,
  'every calendar fixture must preserve the complete pair relation table');
 assert.equal(joined.evidence.relationSummary.adoptedPriority,'none');
 assert.equal(joined.evidence.relationSummary.measuredInteractionStrength,false);
 assert.equal(joined.evidence.relationSummary.independentContacts.length,
  new Set(packet.facts.natalBranchRelations.pairs.map(x=>
   x.positions.slice().sort().join('/'))).size);
 assert.equal(joined.editorialStatus,'machine-composed-review-only');
 assert.equal(joined.releaseVerdict,'not-approved');
 assert.equal(joined.apiCalls,0);
 assert.equal(joined.evidence.roleQuestions.length,3);
 assert(joined.evidence.interpretiveFocus?.kind);
 assert(joined.reader.text.includes(joined.evidence.interpretiveFocus.premise));
 assert(joined.reader.text.includes(joined.evidence.interpretiveFocus.conditionalReading));
 assert(joined.reader.text.includes(joined.evidence.exposureEvidence.displayedReaderReason));
 assert.equal(joined.evidence.exposureEvidence.monthPatternPriority,'not-assessed');
 assert(/(?:태어난 해|해에|해에서는|해와)/.test(joined.reader.text));
 assert(/(?:태어난 달|달의|달과)/.test(joined.reader.text));
 assert(/(?:태어난 시간|시간에|시간에서는|시간에는|시간의)/.test(joined.reader.text));
 assert.deepEqual(require('./report-reader-policy').errors(
  [joined.reader.label,joined.reader.text]),[]);
 assert(!joined.reader.text.includes('전통적 관점'));
 assert(!joined.reader.text.includes('입니다 출생'));
 const sentences=(joined.reader.text.match(/[^.!?。！？]+[.!?。！？]/g)||[])
  .map(x=>x.trim());
 assert.equal(new Set(sentences).size,sentences.length,
  'machine editor cannot repeat an identical sentence within one paragraph');
 if(engine.compile(packet).status==='not-covered')assert.equal(
  engine.compile(packet).reader,null,'verified facts alone must not bypass the curated reader gate');
 verifiedFactCombos++;
}
assert.equal(verifiedFactCombos,99);
const sums=coverage.assess(all);
assert.equal(sums.withDraft,31);
assert.equal(sums.notCovered,68);
assert.equal(sums.draftsWithFourPillar,4);
assert.equal(sums.draftsWithChartSynthesis,27);
assert.equal(sums.apiCalls,0);
console.log('PASS 27 reviewed-only verified natal integration paragraphs, hour variance, fabricated evidence rejected; no API');
