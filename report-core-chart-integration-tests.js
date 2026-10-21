'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const engine=require('./report-core-knowledge-engine');
const merge=require('./report-core-chart-integration');
const coverage=require('./report-core-knowledge-coverage');
const all=coverage.representativeInputs();
let machine=0,human=0,missing=0;
const texts=new Set();
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
const sums=coverage.assess(all);
assert.equal(sums.withDraft,31);
assert.equal(sums.notCovered,68);
assert.equal(sums.draftsWithFourPillar,4);
assert.equal(sums.draftsWithChartSynthesis,27);
assert.equal(sums.apiCalls,0);
console.log('PASS 27 reviewed-only verified natal integration paragraphs, hour variance, fabricated evidence rejected; no API');
