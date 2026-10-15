'use strict';
const assert=require('node:assert/strict');
const oracle=require('./report-calendar-independent');
const calendar=require('./calendar-provider-node');
const facts=require('./report-facts-node');
const integrity=require('./report-calculation-integrity');

// Anchored to an independently published Gregorian almanac, not to the
// lunar-javascript output under test:
// https://wikidocs.net/249512
const fixed={
 solarDate:'1983-01-07',calendar:'lunar',lunarDate:'1982-11-24',
 hour:'14:20',year:'壬戌',month:'癸丑',day:'乙未',hourPillar:'癸未'
};
assert.equal(oracle.dayPillar(fixed.solarDate),fixed.day);
assert.equal(oracle.dayPillar('1983-01-06'),'甲午');
assert.equal(oracle.dayPillar('1983-01-08'),'丙申');
assert.equal(oracle.monthPillar('壬','丑'),fixed.month);
assert.equal(oracle.hourPillar('乙','14:20'),fixed.hourPillar);
assert.equal(oracle.annualPillar(1982),fixed.year);
assert.equal(oracle.annualPillar(2027),'丁未');
assert.equal(oracle.calendricalYear('1983-01-07','丑'),1982);
assert.equal(oracle.calendricalYear('1983-02-03','丑'),1982);
assert.equal(oracle.calendricalYear('1983-02-05','寅'),1983);
assert.equal(oracle.dayPillar('1984-02-29').length,2);
assert.equal(oracle.dayPillar('2000-02-29').length,2);
assert.throws(()=>oracle.dayPillar('2000-02-30'),/Invalid Gregorian date/);
assert.throws(()=>oracle.dayPillar('1983-13-01'),/range/);
assert.throws(()=>oracle.hourPillar('乙','24:00'),/Invalid birth/);

const dayHour=oracle.hourPillar('乙','23:30');
assert.equal(dayHour,'丙子','civil-day Sect 2 late 子 hour keeps the Gregorian day stem');
for(const year of [1905,1951,1982,1983,1990,2000,2024,2032])
 for(const month of [1,2,3,4,6,8,10,12]){
  const input={calendar:'solar',
   birthDate:year+'-'+String(month).padStart(2,'0')+'-15',
   birthTime:'14:20',gender:'male',mbti:'ISFP'};
  const calculated=calendar.calculate(input);
  assert.equal(calculated.status,'complete',input.birthDate);
  const independently=oracle.verify({
   chart:calculated.chart,solarDate:calculated.solarDate,
   solarTermTiming:calculated.solarTermTiming,
   birthTime:input.birthTime,unknownBirthTime:false
  });
  assert.deepEqual(independently.errors,[],
   input.birthDate+': '+independently.errors.join(','));
  const packet=facts.build(input,2027);
  assert.equal(packet.status,'ready');
  assert.equal(integrity.verify(packet).pass,true,
   'pre-provider oracle integrity: '+input.birthDate);
 }
for(const input of [
 {calendar:'lunar',birthDate:fixed.lunarDate,birthTime:fixed.hour,
  gender:'male',mbti:'ISFP',leapMonth:false},
 {calendar:'lunar',birthDate:'1995-05-12',birthTime:'14:20',gender:'female'},
 {calendar:'solar',birthDate:'2001-11-03',unknownBirthTime:true,gender:'male'}
]){
 const record=calendar.calculate(input);
 assert.equal(record.status,'complete');
 const expected=oracle.verify({solarDate:record.solarDate,chart:record.chart,
  solarTermTiming:record.solarTermTiming,
  birthTime:input.birthTime,unknownBirthTime:Boolean(input.unknownBirthTime)});
 assert.deepEqual(expected.errors,[]);
 if(input.birthDate===fixed.lunarDate)assert.deepEqual(record.chart,
  {year:fixed.year,month:fixed.month,day:fixed.day,hour:fixed.hourPillar});
 if(input.unknownBirthTime)assert.equal(record.chart.hour,null);
 const packet=facts.build(input,2027);
 assert.deepEqual(integrity.verify(packet).errors,[]);
 const shifted=structuredClone(packet);
 shifted.chart.day=oracle.dayPillar('1983-01-08');
 assert(integrity.verify(shifted).errors.includes('independent-day-pillar-mismatch'),
  'the external day-cycle check must catch changed natal day even when other chart values are consistent');
}
const source=facts.build({calendar:'lunar',birthDate:'1982-11-24',
 birthTime:'14:20',gender:'male',mbti:'ISFP',leapMonth:false},2027);
assert.equal(source.status,'ready');
const falseMonth=structuredClone(source);
falseMonth.chart.month='壬子';
assert(integrity.verify(falseMonth).errors.includes('independent-month-pillar-mismatch'),
 'a lunar monthly stem must never replace the Jie-defined month stem');
const falseTime=structuredClone(source);
falseTime.chart.hour='辛未';
assert(integrity.verify(falseTime).errors.includes('independent-hour-pillar-mismatch'));
const falseYear=structuredClone(source);
falseYear.chart.year='癸亥';
assert(integrity.verify(falseYear).errors.includes('independent-year-pillar-mismatch'));
console.log('PASS independent Gregorian sexagenary oracle: external lunar sample, 64 civil dates, four-pillar tampering, leap days, unknown time; no paid API');
