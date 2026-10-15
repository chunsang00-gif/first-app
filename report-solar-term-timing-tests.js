'use strict';
const assert=require('node:assert/strict');
const {Solar}=require('lunar-javascript');
const term=require('./report-solar-term-timing');
const calendar=require('./calendar-provider-node');
const facts=require('./report-facts-node');
const integrity=require('./report-calculation-integrity');
function shift(clock,minutes){
 const [ymd,hms]=clock.split(' '),[y,m,d]=ymd.split('-').map(Number);
 const [h,mi,s]=hms.split(':').map(Number);
 const t=new Date(Date.UTC(y,m-1,d,h,mi,s)+minutes*60000);
 return {birthDate:t.toISOString().slice(0,10),birthTime:t.toISOString().slice(11,16)};
}
function input(dayTime){return {calendar:'solar',birthDate:dayTime.birthDate,
 birthTime:dayTime.birthTime,gender:'male',mbti:'ISFP'};}
const baseline=term.inspect(Solar.fromYmdHms(1990,5,15,10,30,0));
assert.equal(baseline.status,'resolved');
assert.equal(baseline.monthBranchFromJie,'巳');
assert.equal(baseline.governingHiddenStem,'unresolved');
assert.equal(baseline.governingDayAllocationRule,'not-selected');
assert(baseline.elapsedSecondsSinceJie>=0);
assert(baseline.remainingSecondsUntilNextJie>0);
assert(!Object.hasOwn(baseline,'calculatedStrength'));
const regular=calendar.calculate(input({birthDate:'1990-05-15',birthTime:'10:30'}));
assert.equal(regular.status,'complete');
assert.equal(regular.solarTermTiming.monthBranchFromJie,regular.chart.month[1]);

// Check real precision on BOTH sides of a solar-term change, not merely a
// hand-crafted month branch. The dynamic date comes from lunar-javascript.
const anchor=Solar.fromYmdHms(1990,1,31,12,0,0).getLunar().getNextJie();
assert(anchor&&anchor.getSolar());
const boundary=anchor.getSolar().toYmdHms();
assert.equal(term.BRANCH_BY_JIE[anchor.getName()],'寅','the tested term must be Start of Spring');
// Minutes and solar-term seconds are not the same precision: a birth in
// this same displayed HH:MM could fall on either side of the Jie instant.
const boundaryMinute=input({birthDate:boundary.slice(0,10),
 birthTime:boundary.slice(11,16)});
const minuteAmbiguity=calendar.calculate(boundaryMinute);
assert.equal(minuteAmbiguity.status,'blocked_birth_minute_solar_term_boundary',
 'cannot claim the right birth month from an unknown second in the same minute');
const before=shift(boundary,-2),after=shift(boundary,2);
const resultBefore=calendar.calculate(input(before));
const resultAfter=calendar.calculate(input(after));
assert.equal(resultBefore.status,'complete',JSON.stringify(resultBefore));
assert.equal(resultAfter.status,'complete',JSON.stringify(resultAfter));
assert.notEqual(resultBefore.chart.month,resultAfter.chart.month);
assert.notEqual(resultBefore.chart.year,resultAfter.chart.year,'year pillar should cross LiChun');
assert(resultBefore.solarTermTiming.remainingSecondsUntilNextJie>0);
assert(resultAfter.solarTermTiming.elapsedSecondsSinceJie>=0);
assert.equal(resultAfter.solarTermTiming.previousJie.name,anchor.getName());
assert.equal(resultAfter.solarTermTiming.monthBranchFromJie,'寅');

// Unknown clock time cannot silently choose the noon side of a Jie boundary.
const cutoffDate=boundary.slice(0,10);
const unknownBoundary=calendar.calculate({calendar:'solar',birthDate:cutoffDate,
 unknownBirthTime:true,gender:'male'});
assert.equal(unknownBoundary.status,'blocked_birth_time_solar_term_boundary',
 'an unknown clock time crossing LiChun must not choose a false natal year/month');
const unknownSafe=calendar.calculate({calendar:'solar',birthDate:'1990-05-15',
 unknownBirthTime:true,gender:'male'});
assert.equal(unknownSafe.status,'complete');
assert.equal(unknownSafe.chart.hour,null);
assert.equal(unknownSafe.solarTermTiming.status,'birth-clock-unknown');
assert.equal(unknownSafe.solarTermTiming.elapsedSecondsSinceJie,null);
assert.equal(unknownSafe.solarTermTiming.birthSolarLocal,null);

// 12 seasonal-entry transitions across a calendar cycle are checked against
// the same positional month pillar used by the paid interpretation engine.
for(const month of [1,2,3,4,5,6,7,8,9,10,11,12]){
 const solar=Solar.fromYmdHms(1999,month,15,12,0,0);
 const check=term.inspect(solar);
 assert.equal(calendar.calculate(input({birthDate:solar.toYmd(),
  birthTime:'12:00'})).chart.month[1],check.monthBranchFromJie,
  'the nearest preceding Jie must agree with the natal month pillar');
}
for(const birth of [
 {calendar:'solar',birthDate:'1982-11-24',birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'1990-05-15',birthTime:'10:30',gender:'male',mbti:'INTJ'},
 {calendar:'lunar',birthDate:'1995-05-12',birthTime:'14:20',gender:'female',mbti:'ISFP'},
 {calendar:'solar',birthDate:'2001-11-03',unknownBirthTime:true,gender:'male',mbti:'모름'}
]){
 const packet=facts.build(birth,2027);
 assert.equal(packet.status,'ready',birth.birthDate);
 assert(packet.facts.solarTermTiming);
 const seasonalQi=packet.facts.qiEvidence.governance;
 assert.equal(seasonalQi.activeHiddenStemId,null,
  'elapsed Jie time must not manufacture a governing hidden stem');
 assert.equal(seasonalQi.hiddenStemGoverningDaysRule,'not-selected');
 if(birth.unknownBirthTime){
  assert.equal(seasonalQi.preciseSolarTermElapsedTime,'birth-clock-unknown');
  assert.equal(seasonalQi.solarTermTimingEvidence,'birth-clock-unknown');
 }else{
  assert.equal(seasonalQi.preciseSolarTermElapsedTime.elapsedSeconds,
   packet.facts.solarTermTiming.elapsedSecondsSinceJie);
  assert.deepEqual(seasonalQi.preciseSolarTermElapsedTime.previousJie,
   packet.facts.solarTermTiming.previousJie);
  assert.equal(seasonalQi.solarTermTimingEvidence,'resolved');
 }
 assert.equal(integrity.verify(packet).pass,true,birth.birthDate);
 const damaged=structuredClone(packet);
 damaged.facts.solarTermTiming.monthBranchFromJie='invalid';
 assert(integrity.verify(damaged).errors.includes('incorrect-birth-solar-term-timing'));
 const changedQi=structuredClone(packet);
 changedQi.facts.qiEvidence.governance.activeHiddenStemId='natal.month.hidden.甲';
 assert(integrity.verify(changedQi).errors.includes('incorrect-positional-qi-evidence'));
}
console.log('PASS exact Jie boundary seconds, LiChun year/month flips, noon-substitution prevention and original-input provenance; no paid API');
