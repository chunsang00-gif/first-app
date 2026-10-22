'use strict';
// Editorial comparison fixture only. No report-generation or release wiring.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const base={calendar:'solar',birthDate:'1982-06-15',gender:'male',mbti:'ISFP'};
const ledger=require('./report-fact-bindings');
const results=[];
for(const [time,hourStem,hourGod] of [['14:20','辛','식신'],['20:20','甲','정관']]){
 const packet=facts.build({...base,birthTime:time},2027);
 assert.equal(packet.status,'ready');
 const rows=Object.fromEntries(ledger.build(packet).map(r=>[r.id,r]));
 assert.equal(packet.chart.year[0],'壬');
 assert.equal(packet.chart.month[0],'丙');
 assert.equal(packet.chart.day[0],'己');
 assert.equal(packet.chart.hour[0],hourStem);
 assert.equal(rows['natal.year.stem'].tenGod,'정재');
 assert.equal(rows['natal.month.stem'].tenGod,'정인');
 assert.equal(rows['natal.day.stem'].tenGod,'일간');
 assert.equal(rows['natal.hour.stem'].tenGod,hourGod);
 assert.equal(rows['natal.month.hidden.丁'].tenGod,'편인');
 const preview=require('./report-core-paid-natal-depth-preview').prepare(packet);
 assert(preview&&preview.releaseVerdict==='not-approved');
 assert(preview.payload.task.chapters.saju_core.topics.natal_depth);
 assert.equal(preview.paidApiCalls,0);
 results.push({time,dayStem:packet.chart.day[0],
  yearTenGod:rows['natal.year.stem'].tenGod,
  monthTenGod:rows['natal.month.stem'].tenGod,
  hiddenTenGod:rows['natal.month.hidden.丁'].tenGod,
  hourStem,hourTenGod:hourGod,
  qaOnly:true,releaseVerdict:'not-approved'});
}
assert.notEqual(results[0].hourTenGod,results[1].hourTenGod);
console.log('EDITORIAL_HOUR_COMPARISON='+JSON.stringify(results));
console.log('PASS editorial two-hour evidence verified and kept out of live paid outputs, no API calls');
