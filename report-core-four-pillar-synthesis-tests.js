'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const core=require('./report-core-knowledge-engine');
const candidate=require('./report-core-four-pillar-synthesis');
const kb=require('./report-core-knowledge.json');
const input={calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,
 gender:'male',mbti:'ISFP'};
assert.deepEqual(candidate.audit(),{fullChartRules:6});
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

// Four additional whole-chart editorial candidates across TWO independent dates.
// Both the 14:20 and 20:20 variants are tested; only the 14:20 versions occur
// in the 99-case fixed benchmark. None of these is a universal reading.
for(const exemplar of [
 {birthDate:'1988-12-15',expected:[
  {time:'14:20',id:'full-1988-12-15-year-day-punishment-hour-duty-v1',
   chart:{year:'戊辰',month:'甲子',day:'甲辰',hour:'辛未'},
   dayRoot:true,hourRoot:true,pair:'형'},
  {time:'20:20',id:'full-1988-12-15-year-hour-clash-peer-v1',
   chart:{year:'戊辰',month:'甲子',day:'甲辰',hour:'甲戌'},
   dayRoot:true,hourRoot:false,pair:'충'}]},
 {birthDate:'1994-08-15',expected:[
  {time:'14:20',id:'full-1994-08-15-month-root-hour-duty-v1',
   chart:{year:'甲戌',month:'壬申',day:'癸酉',hour:'己未'},
   dayRoot:false,hourRoot:false,pair:'해',group:true},
  {time:'20:20',id:'full-1994-08-15-month-root-hour-sharing-v1',
   chart:{year:'甲戌',month:'壬申',day:'癸酉',hour:'壬戌'},
   dayRoot:false,hourRoot:false,pair:'해',group:true}]}
]){
 const texts=new Set();
 for(const x of exemplar.expected){
  const user={calendar:'solar',birthDate:exemplar.birthDate,
   birthTime:x.time,gender:'male',mbti:'ISFP'};
  const p=facts.build(user,2027),out=core.compile(p);
  assert.deepEqual(p.chart,x.chart,'complete calendar chart must match the editorial condition');
  assert.equal(out.status,'draft-for-human-review');
  assert.equal(out.review.fourPillar?.ruleId,x.id);
  assert.equal(out.review.fourPillar.matched.dayRootExpected,x.dayRoot);
  assert.equal(out.review.fourPillar.matched.hourRootExpected,x.hourRoot);
  assert(out.review.fourPillar.matched.natalPairs.some(r=>r.type===x.pair));
  assert.equal(out.review.fourPillar.matched.natalGroups.some(r=>r.type==='방합'),!!x.group);
  assert.equal(out.reader.paragraphs.fourPillar.text,
   kb.fullChartRules.find(z=>z.id===x.id).reader.text);
  assert(out.review.fourPillar.sourceRefs.includes('facts.natalBranchRelations'));
  assert(out.review.fourPillar.sourceRefs.includes('facts.stemConnections'));
  assert.equal(out.review.readerMechanical.mechanicalPass,true);
  assert.equal(out.releaseVerdict,'not-approved');assert.equal(out.apiCalls,0);
  assert.deepEqual(core.compile(facts.build({...user,mbti:'ENTP'},2028)).reader,
   out.reader,'MBTI and target year cannot alter natal facts');
  texts.add(out.reader.paragraphs.fourPillar.text);
  const forgedGraph=structuredClone(out.wholeChartEvidence);
  forgedGraph.natalRelations=[];
  assert.throws(()=>candidate.select(p,forgedGraph,out.ruleId),
   /CORE_FOUR_PILLAR_INTEGRITY_DIVERGED/);
  const forgedPacket=structuredClone(p);
  forgedPacket.facts.natalBranchRelations.pairs=[];
  assert.throws(()=>candidate.select(forgedPacket,out.wholeChartEvidence,out.ruleId),
   /CORE_FOUR_PILLAR_INTEGRITY_DIVERGED/);
 }
 assert.equal(texts.size,2,'two hours must have distinct 4-pillar texts');
 const unknown=core.compile(facts.build({calendar:'solar',
  birthDate:exemplar.birthDate,birthTime:'',unknownBirthTime:true,
  gender:'male',mbti:'ISFP'},2027));
 assert.equal(unknown.reader.paragraphs.fourPillar,null);
}
const corruptGroup=structuredClone(kb);
corruptGroup.fullChartRules[4].natalGroupEvidence[0].positions=['year','month','day'];
assert.throws(()=>candidate.audit(corruptGroup),/CORE_FOUR_PILLAR_RULE_INVALID/);
const corruptDayRoot=structuredClone(kb);
corruptDayRoot.fullChartRules[4].dayRootExpected=true;
assert.throws(()=>candidate.audit(corruptDayRoot),/CORE_FOUR_PILLAR_RULE_INVALID/);
assert.equal(coverage.withDraft,31);
assert.equal(coverage.notCovered,68);
assert.equal(coverage.draftsWithFourPillar,4);
console.log('PASS six source-verified full-four-pillar reader variants, hour and natal-relationship comparisons; paid API 0');
