'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const core=require('./report-core-knowledge-engine');
const candidate=require('./report-core-four-pillar-synthesis');
const kb=require('./report-core-knowledge.json');
const input={calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,
 gender:'male',mbti:'ISFP'};
assert.deepEqual(candidate.audit(),{fullChartRules:2});
const seen=new Set();
for(const [time,rule,pillar,root] of [
 ['14:20','full-four-pillars-chukmi-day-hour-roots-v1','癸未',true],
 ['20:20','full-four-pillars-chukmi-day-root-hour-expression-v1','丙戌',false]
]){
 const p=facts.build({...input,birthTime:time},2027);
 const out=core.compile(p);
 assert.equal(out.status,'draft-for-human-review');
 assert.equal(out.ruleId,'month-pair-pyeonin-pyeonjae-v1');
 assert.deepEqual(p.chart,kb.fullChartRules.find(x=>x.id===rule).chart,
  'the stored full four-pillar candidate must match the actual lunar calendar');
 assert.equal(out.review.fourPillar?.ruleId,rule);
 assert.equal(out.review.fourPillar.matched.chart.hour,pillar);
 assert.equal(out.review.fourPillar.matched.hourRootExpected,root);
 assert.equal(Boolean(out.review.fourPillar.matched.hourRootRefs.length),root);
 assert(out.review.fourPillar.sourceRefs.includes('natal.year.stem'));
 assert(out.review.fourPillar.sourceRefs.includes('natal.month.hidden.己'));
 assert(out.review.fourPillar.sourceRefs.includes('facts.natalBranchRelations'));
 assert(out.review.fourPillar.sourceRefs.includes('facts.stemConnections'));
 assert(out.review.fourPillar.sourceRefs.includes('facts.seasonalEvidence'));
 assert.equal(out.reader.paragraphs.fourPillar.text,
  kb.fullChartRules.find(x=>x.id===rule).reader.text);
 assert(out.reader.paragraphs.fourPillar.text.length>250);
 assert.equal(out.review.readerMechanical.mechanicalPass,true);
 assert.equal(out.releaseVerdict,'not-approved');
 assert.equal(out.apiCalls,0);
 seen.add(out.reader.paragraphs.fourPillar.text);
 const next=core.compile(facts.build({...input,birthTime:time,mbti:'INTJ'},2028));
 assert.deepEqual(next.reader,out.reader);
 const tampered=structuredClone(p);
 tampered.facts.tenGods.hour.stemTenGod='비견';
 assert.throws(()=>candidate.select(tampered,out.wholeChartEvidence,out.ruleId),
  /CORE_FOUR_PILLAR_INTEGRITY_DIVERGED/);
 const rootWrong=structuredClone(out.wholeChartEvidence);
 rootWrong.dayMasterRoots=[];
 assert.throws(()=>candidate.select(p,rootWrong,out.ruleId),
  /CORE_FOUR_PILLAR_INTEGRITY_DIVERGED/);
}
assert.equal(seen.size,2);
const unknown=core.compile(facts.build({...input,unknownBirthTime:true,birthTime:''},2027));
assert.equal(unknown.reader.paragraphs.fourPillar,null);
assert.equal(unknown.review.fourPillar,null);
const sample=facts.build({...input,birthTime:'14:20'},2027);
const original=core.compile(sample);
const fake=structuredClone(original.wholeChartEvidence);
fake.natalRelations=[];
assert.throws(()=>candidate.select(sample,fake,original.ruleId),
 /CORE_FOUR_PILLAR_INTEGRITY_DIVERGED/);
const bad=structuredClone(kb);
bad.fullChartRules[1].hourRootExpected=true;
assert.throws(()=>candidate.audit(bad),/CORE_FOUR_PILLAR_RULE_INVALID/);
const badGod=structuredClone(kb);
badGod.fullChartRules[0].hourGod='정재';
assert.throws(()=>candidate.audit(badGod),/CORE_FOUR_PILLAR_RULE_INVALID/);
const unsupported=core.compile(facts.build({calendar:'solar',birthDate:'1990-05-15',
 birthTime:'14:20',gender:'male',mbti:'ISFP'},2027));
assert.equal(unsupported.status,'not-covered');
assert.equal(unsupported.reader,null);
assert.equal(unsupported.review?.fourPillar,undefined);
const coverage=require('./report-core-knowledge-coverage')
 .assess(require('./report-core-knowledge-coverage').representativeInputs());
assert.equal(coverage.withDraft,31);
assert.equal(coverage.notCovered,68);
assert.equal(coverage.draftsWithFourPillar,2);
console.log('PASS two source-verified full-four-pillar reader variants, hour comparison and forged evidence rejection; paid API 0');
