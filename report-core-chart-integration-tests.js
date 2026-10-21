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
 assert.equal(out.review.chartSynthesis.evidence.yearTenGod,
  out.wholeChartEvidence.otherVisible.find(x=>x.position==='year').tenGod);
 assert.equal(out.review.chartSynthesis.evidence.hourTenGod,
  out.wholeChartEvidence.otherVisible.find(x=>x.position==='hour').tenGod);
 assert.deepEqual(out.review.chartSynthesis.evidence.rootRefs,
  out.wholeChartEvidence.dayMasterRoots.map(x=>x.id));
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
 assert(focused.premise.includes(focused.tenGods.year));
 assert(focused.premise.includes(focused.tenGods.monthHidden));
 assert(focused.premise.includes(focused.tenGods.hour));
 assert(focused.conditionalReading.length>=50);
 assert(focused.conditionalReading.includes(q[0].question));
 assert(focused.conditionalReading.includes(q[2].question));
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
 assert(q.every(x=>out.reader.paragraphs.chartSynthesis.text.includes(
  x.position==='year'?'출생 해의 '+x.tenGod+'에서 확인할 질문은 '+x.question:
   x.position==='month'?'출생 달의 '+x.tenGod+'에서 확인할 질문은 '+x.question:
   '출생 시간의 '+x.tenGod+'에서 확인할 질문은 '+x.question)),
  'reader must contain each grounded question under the matching pillar');
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
 assert.equal(joined.editorialStatus,'machine-composed-review-only');
 assert.equal(joined.releaseVerdict,'not-approved');
 assert.equal(joined.apiCalls,0);
 assert.equal(joined.evidence.roleQuestions.length,3);
 assert(joined.evidence.interpretiveFocus?.kind);
 assert(joined.reader.text.includes(joined.evidence.interpretiveFocus.premise));
 assert(joined.reader.text.includes(joined.evidence.interpretiveFocus.conditionalReading));
 assert(joined.reader.text.includes('출생 해의'));
 assert(joined.reader.text.includes('출생 달의'));
 assert(joined.reader.text.includes('출생 시간의'));
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
