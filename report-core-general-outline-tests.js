'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const core=require('./report-core-knowledge-engine');
const coverage=require('./report-core-knowledge-coverage');
const lunar={calendar:'lunar',birthDate:'1982-11-24',birthTime:'14:20',
 gender:'male',mbti:'ISFP'};
const packet=facts.build(lunar,2027),a=core.compile(packet);
function get(row){
 const outline=row.compositionPlan?.editorialOutline;
 assert(outline&&outline.version==='core-general-editorial-outline-v1');
 assert.equal(outline.status,'internal-editorial-outline-only');
 assert.equal(outline.releaseVerdict,'not-approved');
 assert.equal(outline.customerReady,false);
 assert.equal(outline.apiCalls,0);
 assert.equal(outline.humanReviewRequired,true);
 assert(!outline.sourceRefs.some(x=>x.startsWith('annual.')||x.startsWith('person.')));
 assert(outline.blocks.every(x=>x.sourceRefs.length>0&&x.editorialQuestion.length>=20));
 const allowed=new Set([...row.compositionPlan.sourceRefs,
  'facts.seasonalEvidence','facts.stemConnections']);
 assert(outline.sourceRefs.every(x=>allowed.has(x)),
  'every editorial source must be a validated composition or seasonal fact');
 return outline;
}
const early=get(a);
assert.equal(early.monthBridge.status,'internal-editorial-relationship-only');
assert.equal(early.monthBridge.classification.kind,'hidden-controls-visible');
assert.equal(early.monthBridge.classification.arrow,'hidden-to-visible');
assert(early.blocks[0].factualStatement.includes(
 '대표 속글자 오행이 겉글자 오행을 극하는 방향'));
assert(early.monthBridge.limits.includes('no-paid-output'));
assert(early.blocks.some(x=>x.id==='month-two-positions'&&
 x.sourceRefs.join('|')==='natal.month.stem|natal.month.hidden.己'));
assert(early.blocks.some(x=>x.id==='seasonal-month'&&
 x.factualStatement.includes('전환월')));
assert(early.blocks.some(x=>x.id==='compared-hour'&&
 x.factualStatement.includes('편인')));
assert(early.blocks.some(x=>x.id.startsWith('natal-relation-')&&
 x.factualStatement.includes('충 관계')));
assert(early.blocks.some(x=>x.id==='same-element-hidden-locations'&&
 x.sourceRefs.includes('natal.day.hidden.乙')&&
 x.sourceRefs.includes('natal.hour.hidden.乙')));
const evening=get(core.compile(facts.build({...lunar,birthTime:'20:20'},2027)));
assert.notDeepEqual(evening,early);
assert(evening.blocks.find(x=>x.id==='compared-hour')
 .factualStatement.includes('상관'));
assert(!evening.sourceRefs.includes('natal.hour.hidden.乙'));
const unknown=get(core.compile(facts.build({...lunar,
 unknownBirthTime:true,birthTime:''},2027)));
assert.equal(unknown.unknownBirthHour,true);
assert(!unknown.blocks.some(x=>x.id==='compared-hour'));
assert(!unknown.sourceRefs.some(x=>x.startsWith('natal.hour.')));
const other=core.compile(facts.build({calendar:'solar',birthDate:'1990-05-15',
 birthTime:'14:20',gender:'male',mbti:'INTJ'},2027));
assert.equal(other.status,'not-covered');
assert.equal(other.reader,null,'an editorial outline is not a paying-user draft');
const outline=get(other);
assert(outline.blocks.some(x=>x.id==='month-two-positions'));
assert(outline.blocks.some(x=>x.id==='seasonal-month'));
assert.notDeepEqual(outline,early);
const switched=core.compile(facts.build({...lunar,mbti:'INTJ'},2028));
assert.deepEqual(get(switched),early,'MBTI and annual target must not change the natal-only outline');
const lunarSolar=get(core.compile(facts.build({calendar:'solar',
 birthDate:'1983-01-07',birthTime:'14:20',gender:'male',mbti:'ISFP'},2027)));
assert.deepEqual(lunarSolar,early,'equivalent calendar instants must make identical outlines');
const altered=structuredClone(packet);
altered.facts.qiEvidence.entries[0].category='authority';
assert.throws(()=>core.compile(altered),/CORE_GRAPH_CALCULATED_EVIDENCE_DIVERGED/);
const stats=coverage.assess(coverage.representativeInputs());
assert.equal(stats.ready,99);
assert.equal(stats.withEditorialOutline,99);
assert.equal(stats.withDirectionalBridge,99);
assert.deepEqual(Object.keys(stats.bridgeKinds).sort(),[
 'hidden-controls-visible','hidden-generates-visible','same-element',
 'visible-controls-hidden','visible-generates-hidden'].sort());
assert.equal(stats.outlinesWithoutReaderDraft,stats.notCovered);
assert(stats.notCovered<=85,'six previously uncovered calendar contexts must have reader drafts');
assert(stats.distinctEditorialOutlines>=90,
 'factorized outlines must differ across substantially different source charts');
assert(stats.distinctEditorialOutlines<=stats.distinctCharts);
assert(stats.withDraft>=14,'additional curated prose must come from new matching month rules');
assert.equal(stats.releaseVerdict,'not-approved');
assert.equal(stats.apiCalls,0);
console.log('PASS chart-wide source-backed editorial outlines for 99 fixed samples; '+
 'distinct='+stats.distinctEditorialOutlines+', published drafts unchanged; no paid calls');
