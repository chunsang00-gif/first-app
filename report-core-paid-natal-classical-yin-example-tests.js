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
// Second literal clause of the same classical chapter: Xin day in Yin
// month with both Jia and Bing visible gives a textual first/second rank.
const paired=facts.build({calendar:'solar',birthDate:'2024-02-17',
 birthTime:'14:20',gender:'male',mbti:'ISFP'},2027);
assert.equal(paired.status,'ready');
assert.equal(paired.chart.month[1],'寅');
assert.equal(paired.chart.day[0],'辛');
const resultPaired=source.inspect(paired);
assert.equal(resultPaired.dualExposureTextualPriority.scopeMatched,true);
const rows=require('./report-fact-bindings').build(paired);
assert(rows.some(r=>r.id==='natal.year.stem'&&r.tenGod==='정재'));
assert(rows.some(r=>r.id==='natal.month.stem'&&r.tenGod==='정관'));
assert.equal(resultPaired.dualExposureTextualPriority.firstRole,'정재');
assert.equal(resultPaired.dualExposureTextualPriority.notDeterminedByElementGenerationArrow,true);
assert.match(resultPaired.dualExposureTextualPriority.textualPriorityBasis,/main hidden stem of the Yin month/);
assert.match(resultPaired.dualExposureTextualPriority.textualPriorityBasis,/exposed alongside Bing/);
assert.equal(resultPaired.dualExposureTextualPriority.additionalRole,'정관');
assert.equal(resultPaired.dualExposureTextualPriority.finalTraditionalPatternEstablished,false);
assert.equal(resultPaired.dualExposureTextualPriority.observedBehavior,false);
assert.deepEqual(resultPaired.observed.exposedMainStemPositions,['year']);
assert.deepEqual(resultPaired.observed.exposedSecondaryStemPositions,['month']);
// Nearby date shares the same month/visible stems but has another day stem:
// the same literary priority may NEVER be copied just from month+exposures.
const differentDay=facts.build({calendar:'solar',birthDate:'2024-02-15',
 birthTime:'14:20',gender:'male',mbti:'ISFP'},2027);
assert.equal(differentDay.chart.month,paired.chart.month);
const otherRows=require('./report-fact-bindings').build(differentDay);
assert(otherRows.some(r=>r.id==='natal.year.stem'&&r.tenGod==='정관'));
assert(otherRows.some(r=>r.id==='natal.month.stem'&&r.tenGod==='정인'));
assert.equal(source.inspect(differentDay).dualExposureTextualPriority.scopeMatched,false);
assert.equal(source.inspect(differentDay).dualExposureTextualPriority.firstRole,null);
assert.equal(source.inspect(differentDay).dualExposureTextualPriority.textualPriorityBasis,null);
// Another month also invalidates the classical example.
const changedMonth=facts.build({calendar:'solar',birthDate:'2024-03-17',
 birthTime:'14:20',gender:'male',mbti:'ISFP'},2027);
assert.equal(source.inspect(changedMonth).dualExposureTextualPriority.scopeMatched,false);
console.log('QA_CLASSICAL_DUAL_EXPOSURE='+JSON.stringify({
 date:'2024-02-17',chart:paired.chart,
 main:resultPaired.observed.exposedMainStemPositions,
 secondary:resultPaired.observed.exposedSecondaryStemPositions,
 textualFirst:resultPaired.dualExposureTextualPriority.firstRole,
 textualSupplementary:resultPaired.dualExposureTextualPriority.additionalRole,
 fullChartApproved:false,paidCalls:0
}));
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
