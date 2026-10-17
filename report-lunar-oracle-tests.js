'use strict';
// Independent calendar oracle regression for the SAME birth instant supplied
// as lunar vs solar. Dates/sexagenary pillars are public calendar facts;
// not personal identity. Sources:
// https://wikidocs.net/249512 (1983-01-07: 壬戌 癸丑 乙未)
// https://datedb.net/tool/conversion/solar_to_lunar/19830107/
// Independent oracle fixes an off-by-one-day chart error that older tests
// (using 1982-11-24 SOLAR) were incapable of detecting.
const assert=require('node:assert/strict');
const calendar=require('./calendar-provider-node');
const pipeline=require('./production-pipeline-node');
const facts=require('./report-facts-node');
const integrity=require('./report-calculation-integrity');
const guidance=require('./report-analysis-guidance');
const invariants=require('./report-interpretation-invariants');
const provider=require('./report-generation-request');
const schema=require('./report-schema.json');
const wire=require('./report-wire');

const common={birthTime:'14:20',gender:'male',mbti:'ISFP'};
const lunar={...common,calendar:'lunar',birthDate:'1982-11-24',leapMonth:false};
const solar={...common,calendar:'solar',birthDate:'1983-01-07',leapMonth:false};
const wrongDay={...common,calendar:'solar',birthDate:'1983-01-08',leapMonth:false};
const wrongCalendar={...common,calendar:'solar',birthDate:'1982-11-24',leapMonth:false};
const cLunar=calendar.calculate(lunar);
const cSolar=calendar.calculate(solar);
const cWrong=calendar.calculate(wrongDay);
const cWrongCalendar=calendar.calculate(wrongCalendar);
for(const [label,record] of Object.entries({cLunar,cSolar,cWrong,cWrongCalendar}))
 assert.equal(record.status,'complete',label+': '+JSON.stringify(record));
assert.equal(cLunar.solarDate,'1983-01-07','1982 lunar 11/24 must NOT resolve to Jan 8');
assert.equal(cSolar.solarDate,'1983-01-07');
assert.deepEqual(cLunar.chart,cSolar.chart,'calendar modes for same instant must match');
assert.deepEqual(cLunar.chart,{
 year:'壬戌',month:'癸丑',day:'乙未',hour:'癸未'
},'absolute external pillar oracle: Jie month is 丑, not the lunar-month 干支');
assert.equal(cWrong.solarDate,'1983-01-08');
assert.equal(cWrong.chart.day,'丙申');
assert.notEqual(cLunar.chart.day,cWrong.chart.day,'one day must not silently use the other day-master');
assert.notDeepEqual(cLunar.chart,cWrongCalendar.chart,
 'old solar 1982-11-24 is not equivalent to lunar 1982-11-24');
assert.notEqual(cLunar.chart.day,cWrongCalendar.chart.day);

for(const [label,birth] of Object.entries({lunar,solar})){
 const base=pipeline.calculate(birth,2027);
 assert.equal(base.status,'complete',label);
 assert.equal(base.normalized.solarDate,'1983-01-07');
 assert.deepEqual(base.chart,cLunar.chart);
 assert.equal(base.targetYear.pillar,'丁未');
 const packet=facts.build(birth,2027);
 assert.equal(packet.status,'ready');
 assert.equal(packet.calculationInput.calendar,birth.calendar);
 assert.equal(packet.calculationInput.birthDate,birth.birthDate);
 assert.equal(packet.calculationInput.leapMonth,false);
 assert.deepEqual(packet.chart,cLunar.chart);
 assert.equal(packet.facts.dayMaster,'乙');
 assert.deepEqual(integrity.verify(packet).errors,[],label+' independent chart verification');
 const plan=guidance.preflight(packet);
 assert.equal(invariants.verify(packet,plan).pass,true,label+' interpretation provenance');
 const prompt={stage:'body',facts:packet,requestedSections:['saju_core'],
  analysisGuidance:{...guidance.forRequest(['saju_core'],packet.person.mbti),
   editorialBlueprint:{saju_core:plan.saju_core}}};
 const compiled=provider.compile(prompt);
 assert(compiled&&compiled.source['natal.day.stem']);
 assert.equal(compiled.source['natal.day.stem'].stem,'乙');
 assert(compiled.source['facts.seasonalEvidence']);
 assert(compiled.source['facts.qiEvidence']);
 assert(compiled.source['facts.stemConnections']);
 assert(compiled.source['facts.rootConditions']);
 const valid=provider.schema(prompt,wire.schemaFor(prompt,schema));
 const topics=valid.properties.chapters.properties.saju_core.properties.paragraphs.properties;
 const seasonalSlot=topics.temperament.anyOf?.find(x=>x.type==='object')||topics.temperament;
 assert.equal(plan.saju_core.anchorTopic,'strength');
 assert.equal(topics.strength.type,'object');
 const month=seasonalSlot.properties.basis.properties.refs.items.enum;
 const strength=topics.strength.anyOf?.find(x=>x.type==='object')?.properties?.basis?.properties?.refs?.items?.enum||
  topics.strength.properties.basis.properties.refs.items.enum;
 for(const required of ['facts.seasonalEvidence','facts.qiEvidence','natal.month.stem'])
  assert(month.includes(required),label+' missing month/visible source '+required);
 for(const required of ['facts.stemConnections','facts.rootConditions','facts.structuralEvidence.dayMasterRoots'])
  assert(!strength.includes(required),label+' core month-ten-god interpretation must not cite unrelated roots '+required);
 const mainId='natal.month.hidden.'+compiled.source['facts.structuralEvidence.monthCommand'].mainHiddenStem;
 for(const required of ['natal.month.stem',mainId])
  assert(strength.includes(required),label+' missing measured month-ten-god source '+required);
 assert(!month.includes('facts.stemConnections')&&!month.includes('facts.rootConditions'),
  label+' core seasonal paragraph must not claim root/clash provenance');
}
// The adjacent lunar day is a *different* birth instant. It must never
// inherit the historical sample's day pillar or calculated evidence.
const adjacent=facts.build({...lunar,birthDate:'1982-11-25'},2027);
assert.equal(adjacent.status,'ready');
assert.equal(calendar.calculate({...lunar,birthDate:'1982-11-25'}).solarDate,'1983-01-08');
assert.equal(adjacent.facts.dayMaster,'丙');
assert.notDeepEqual(adjacent.chart,cLunar.chart);

console.log('PASS external lunar-to-solar day/month/year/hour oracle and end-to-end fact->interpretation->paid model source provenance; no paid calls');
