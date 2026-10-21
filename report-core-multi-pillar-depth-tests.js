'use strict';
// Diverse natal examples, verified data and metamorphic birth-hour tests.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const core=require('./report-core-knowledge-engine');
const hour=require('./report-core-hour-context');
const years=require('./report-core-year-link');
const kb=require('./report-core-knowledge.json');
const base={calendar:'solar',birthTime:'14:20',gender:'male',mbti:'ISFP'};
const ruleExpect=[
 ['1982-12-15','yearlink-1982-ja-personal-shared-repeat-v1'],
 ['2018-06-15','yearlink-2018-o-learning-own-role-v1'],
 ['2018-05-15','yearlink-2018-sa-expression-peer-v1'],
 ['2024-09-15','yearlink-2024-yu-sharing-resource-output-v1'],
 ['1994-06-15','yearlink-1994-o-recurring-preparation-v1']
];
assert.equal(years.audit().yearLinkRules,10);
assert.equal(hour.audit().hourContextRules,6);
for(const [birthDate,id] of ruleExpect){
 const p=facts.build({...base,birthDate},2027),r=core.compile(p);
 assert.equal(r.status,'draft-for-human-review');
 assert.equal(r.review.yearLink?.ruleId,id);
 assert(r.reader.paragraphs.yearLink.text.length>=190);
 assert(r.review.readerMechanical.mechanicalPass);
 assert.deepEqual(r.review.yearLink.sourceRefs,['natal.year.stem',
  'natal.month.stem','natal.month.hidden.'+p.facts.structuralEvidence.monthCommand.mainHiddenStem]);
 assert.equal(r.releaseVerdict,'not-approved');
 assert.equal(r.apiCalls,0);
 assert.deepEqual(core.compile(facts.build({...base,birthDate,mbti:'INTJ'},2028)).reader,r.reader);
}
const pairs=[
 {birthDate:'1988-12-15',early:'hour-ja-jeonggwan-contrast-v1',
  late:'hour-ja-bigeon-repeat-v1',earlyPillar:'辛未',latePillar:'甲戌'},
 {birthDate:'1994-08-15',early:'hour-sin-pyeongwan-responsibility-v1',
  late:'hour-sin-geopjae-repeat-v1',earlyPillar:'己未',latePillar:'壬戌'}
];
for(const x of pairs){
 const earlyPacket=facts.build({...base,birthDate:x.birthDate},2027);
 const latePacket=facts.build({...base,birthDate:x.birthDate,birthTime:'20:20'},2027);
 const a=core.compile(earlyPacket),b=core.compile(latePacket);
 assert.equal(earlyPacket.chart.hour,x.earlyPillar);
 assert.equal(latePacket.chart.hour,x.latePillar);
 assert.equal(a.review.hourContext?.ruleId,x.early);
 assert.equal(b.review.hourContext?.ruleId,x.late);
 assert.notDeepEqual(a.reader.paragraphs.hour,b.reader.paragraphs.hour);
 assert.deepEqual(a.reader.paragraphs.strength,b.reader.paragraphs.strength,
  'the month interpretation cannot change when only the time changes');
 assert.deepEqual(a.reader.paragraphs.yearLink,b.reader.paragraphs.yearLink,
  'the year/month/hidden interpretation cannot change when only time changes');
 assert.equal(a.review.hourContext.matched.hourPillar,x.earlyPillar);
 assert.equal(b.review.hourContext.matched.hourPillar,x.latePillar);
 assert.equal(a.review.readerMechanical.mechanicalPass,true);
 assert.equal(b.review.readerMechanical.mechanicalPass,true);
 assert.equal(a.releaseVerdict,'not-approved');
 assert.equal(b.releaseVerdict,'not-approved');
 const absent=core.compile(facts.build({...base,birthDate:x.birthDate,
  unknownBirthTime:true,birthTime:''},2027));
 assert.equal(absent.review.hourContext,null);
 assert.equal(absent.reader.paragraphs.hour,null);
 assert.deepEqual(absent.reader.paragraphs.strength,a.reader.paragraphs.strength);
 const wrong=structuredClone(earlyPacket);
 wrong.facts.tenGods.hour.stemTenGod='invalid';
 assert.throws(()=>hour.select(wrong,a.wholeChartEvidence,a.ruleId),
  /CORE_HOUR_CONTEXT_VERIFIED_SOURCE_MISMATCH/);
}
const illegalFamily=structuredClone(kb);
illegalFamily.hourContextRules[4].when.monthTenGod='식신';
assert.throws(()=>hour.audit(illegalFamily),
 /CORE_HOUR_CONTEXT_INVALID_OR_UNSUPPORTED/);
const illegalYear=structuredClone(kb);
illegalYear.yearLinkRules[9].when.hiddenTenGod='편관';
assert.throws(()=>years.audit(illegalYear),/CORE_YEAR_LINK_RULE_INVALID/);
const coverage=require('./report-core-knowledge-coverage');
const c=coverage.assess(coverage.representativeInputs());
assert.equal(c.withDraft,31); assert.equal(c.notCovered,68);
assert.equal(c.draftsWithYearLink,10);
assert.equal(c.draftsWithHourContext,4);
assert.equal(c.apiCalls,0);
console.log('PASS ten year/month/hidden manuscripts and two contrasting known-hour chart pairs; no paid API or production edits');
