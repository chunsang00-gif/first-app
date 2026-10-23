'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const source=require('./report-core-paid-natal-classical-yin-example');
const cases=[],dates=[];
for(const year of [1982,1988,1994,2000,2006,2012,2018,2024]){
 for(const clock of ['02:20','08:20','14:20','20:20']){
  const date=year+'-02-15';
  const input={calendar:'solar',birthDate:date,birthTime:clock,
   gender:'male',mbti:'ISFP'};
  const packet=facts.build(input,2027);
  assert.equal(packet.status,'ready');
  const result=source.inspect(packet);
  assert.equal(result.natalMonthBranch,'寅');
  assert.equal(result.observed.applicableMonth,true);
  assert.equal(result.classicalReference.traditionChosenForCommercialInterpretation,false);
  assert.equal(result.canAutomateFinalTraditionalPattern,false);
  assert.equal(result.actualPersonalityOrCareerNotEstablished,true);
  assert.equal(result.providerCalls,0);
  assert.equal(result.releaseVerdict,'not-approved');
  const visible=['year','month','hour'].map(p=>packet.chart[p][0]);
  assert.deepEqual(result.observed.exposedMainStemPositions,
   ['year','month','hour'].filter(p=>packet.chart[p][0]==='甲'));
  assert.deepEqual(result.observed.exposedSecondaryStemPositions,
   ['year','month','hour'].filter(p=>packet.chart[p][0]==='丙'));
  assert.equal(result.observed.exactTextualExampleConditionsMet,
   !visible.includes('甲')&&visible.includes('丙'));
  const row={date,time:clock,year:packet.chart.year,month:packet.chart.month,
   day:packet.chart.day,hour:packet.chart.hour,
   status:result.candidate,main:result.observed.exposedMainStemPositions,
   secondary:result.observed.exposedSecondaryStemPositions,
   alternative:result.alternativeExposuresNeedReview};
  cases.push(row);
  if(!dates.some(x=>x.status===row.status))dates.push(row);
  const tampered=structuredClone(packet);
  tampered.facts.seasonalEvidence.monthMainQiStem='壬';
  assert.throws(()=>source.inspect(tampered),
   /QA_CLASSICAL_MONTH_EXAMPLE_SEASONAL_DRIFT/);
 }
}
const names=new Set(cases.map(x=>x.status));
assert(names.has('documented-textual-example-match'),
 'the grid must include at least one literal Yin month A-absent/B-present chart');
assert(names.has('textual-condition-fails-main-is-exposed'),
 'contrast: month main appears elsewhere, so never assume absence');
assert(names.has('textual-condition-fails-secondary-not-exposed'),
 'contrast: no secondary exposed, so never borrow the classical example');
const other=facts.build({calendar:'solar',birthDate:'1982-06-15',
 birthTime:'14:20',gender:'male',mbti:'ISFP'},2027);
assert.equal(source.inspect(other).candidate,'out-of-example-scope');
const unknown=facts.build({calendar:'solar',birthDate:'1982-02-15',
 unknownBirthTime:true,gender:'male',mbti:'모름'},2027);
assert.throws(()=>source.inspect(unknown),/QA_CLASSICAL_MONTH_EXAMPLE_INCOMPLETE/);
console.log('QA_CLASSICAL_YIN_EXAMPLE_CASES='+JSON.stringify({
 total:cases.length,representatives:dates,verifiedMatchCount:cases.filter(x=>
 x.status==='documented-textual-example-match').length,
 providerCalls:0,releaseVerdict:'not-approved'}));
console.log('PASS literal classical conditions and opposite conditions checked across computed synthetic charts');
