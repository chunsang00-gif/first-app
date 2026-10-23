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
const readerCandidate=source.offlineReaderCandidate(paired);
assert.equal(readerCandidate.kind,'qa-classical-natal-reader-candidate-v1');
assert.equal(readerCandidate.audience,'child-and-caregiver');
assert.equal(readerCandidate.ageAtTargetYear,3);
assert.equal(readerCandidate.hypotheticalExampleNotObservedBehavior,true);
assert(readerCandidate.text.includes('새로운 놀이'));
assert(!/(?:직장|직책|급여|직업을 바라보는 초점|업무 성과|재물 능력)/.test(readerCandidate.label+' '+readerCandidate.text));
assert.equal(readerCandidate.releaseVerdict,'not-approved');
assert.equal(readerCandidate.readyForPaidModelProbe,false);
assert.equal(readerCandidate.providerCalls,0);
assert.equal(readerCandidate.individualPersonalityOrCareerVerified,false);
assert.equal(readerCandidate.cause,'month-main-Jia-and-additional-Bing-visible-not-element-arrow');
assert.deepEqual(readerCandidate.sourceRefs,[
 'natal.day.stem','natal.year.stem','natal.month.stem','natal.month.hidden.甲']);
assert.equal(require('./report-reader-policy').errors(
 [readerCandidate.label,readerCandidate.text]).length,0,
 'a reader-facing draft must not expose calculation jargon');
assert(readerCandidate.text.includes('가장 기본이 되는 글자'));
assert(readerCandidate.text.includes('자원에 관한 뜻을 중심에 두고 책임에 관한 뜻을 곁들입니다'));
assert(!readerCandidate.text.includes('생하는 관계라'));
assert(!readerCandidate.text.includes('실제로 돈을 잘 모읍니다'));
assert(readerCandidate.text.length>200);
assert.equal(resultPaired.dualExposureTextualPriority.scopeMatched,true);
assert.equal(resultPaired.singleExposureTextualChange.scopeMatched,false);
assert.equal(resultPaired.singleExposureTextualChange.firstRole,null);
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
// The original classical chapter contrasts this with the same Xin day in
// the same Yin month when Bing is exposed WITHOUT Jia. This is a changed
// textual category, not the 'Jia first, Bing supplementary' case above.
const onlyBing=facts.build({calendar:'solar',birthDate:'1989-02-10',
 birthTime:'14:20',gender:'male',mbti:'ISFP'},2027);
assert.equal(onlyBing.status,'ready');
assert.equal(onlyBing.chart.day[0],'辛');
assert.equal(onlyBing.chart.month[1],'寅');
const single=source.inspect(onlyBing);
assert.deepEqual(single.observed.exposedMainStemPositions,[]);
assert(single.observed.exposedSecondaryStemPositions.length>0);
assert.equal(single.singleExposureTextualChange.scopeMatched,true);
assert.equal(single.singleExposureTextualChange.firstRole,'정관');
assert.equal(single.singleExposureTextualChange.finalTraditionalPatternEstablished,false);
assert.equal(single.dualExposureTextualPriority.scopeMatched,false);
assert.equal(single.dualExposureTextualPriority.firstRole,null);
assert.equal(source.offlineReaderCandidate(onlyBing),null,
 'never reuse the Jia+Bing reader draft in the Bing-only classical case');
const singleReader=source.offlineSingleReaderCandidate(onlyBing);
assert.equal(singleReader.kind,'qa-classical-natal-single-reader-candidate-v1');
assert.equal(singleReader.audience,'adult');
assert.equal(singleReader.ageAtTargetYear,38);
assert.equal(singleReader.releaseVerdict,'not-approved');
assert.equal(singleReader.readyForPaidModelProbe,false);
assert.equal(singleReader.providerCalls,0);
assert.equal(singleReader.individualPersonalityOrCareerVerified,false);
assert.deepEqual(singleReader.sourceRefs,[
 'natal.day.stem','natal.year.stem','natal.month.stem',
 'natal.hour.stem','natal.month.hidden.甲','natal.month.hidden.丙']);
assert.deepEqual(require('./report-reader-policy').errors(
 [singleReader.label,singleReader.text]),[]);
assert(singleReader.text.includes('해석의 출발점을 바꿉니다'));
assert(singleReader.text.includes('실제로 책임감이 강하거나 높은 직책을 맡는다는 뜻은 아닙니다'));
assert(!singleReader.text.includes('자원을 중심에 두고 책임에 관한 뜻을 곁들입니다'));
assert(singleReader.text.length>200);
assert.notEqual(singleReader.label,readerCandidate.label);
assert.notEqual(singleReader.text,readerCandidate.text,
 'different classical applicability must not recycle one reader paragraph');
assert.notDeepEqual(singleReader.sourceRefs,readerCandidate.sourceRefs);
assert.equal(source.offlineSingleReaderCandidate(paired),null,
 'the single-exposure text cannot be reused when Jia is exposed');
// Exposing the third Yin-month hidden stem introduces another competing
// condition. Neither narrow text example authorizes a reader conclusion.
for(const [input,which] of [
 [{calendar:'solar',birthDate:'1989-02-10',birthTime:'20:20',
   gender:'male',mbti:'ISFP'},'single'],
 [{calendar:'solar',birthDate:'2024-02-17',birthTime:'20:20',
   gender:'male',mbti:'ISFP'},'dual']
]){
 const competing=facts.build(input,2027);
 assert.equal(competing.status,'ready');
 const result=source.inspect(competing);
 assert(result.observed.exposedOtherHiddenStemPositions.includes('hour'),
  'synthetic changed-hour sample must expose the third hidden-month stem');
 assert.equal(result.singleExposureTextualChange.scopeMatched,false);
 assert.equal(result.dualExposureTextualPriority.scopeMatched,false);
 assert.equal(source.offlineSingleReaderCandidate(competing),null);
 assert.equal(source.offlineReaderCandidate(competing),null);
 assert.equal(result.alternativeExposuresNeedReview,true);
 assert.equal(result.releaseVerdict,'not-approved');
 console.log('QA_CLASSICAL_COMPETING_EXPOSURE='+JSON.stringify({
  which,day:competing.chart.day,month:competing.chart.month,
  addedStemPositions:result.observed.exposedOtherHiddenStemPositions,
  readerAllowed:false,paidCalls:0
 }));
}
console.log('QA_CLASSICAL_SINGLE_EXPOSURE='+JSON.stringify({
 day:onlyBing.chart.day,month:onlyBing.chart.month,
 primary:single.observed.exposedMainStemPositions,
 secondary:single.observed.exposedSecondaryStemPositions,
 textualFirst:single.singleExposureTextualChange.firstRole,
 fullChartApproved:false,providerCalls:0
}));
// Nearby date shares the same month/visible stems but has another day stem:
// the same literary priority may NEVER be copied just from month+exposures.
const differentDay=facts.build({calendar:'solar',birthDate:'2024-02-15',
 birthTime:'14:20',gender:'male',mbti:'ISFP'},2027);
assert.equal(differentDay.chart.month,paired.chart.month);
const otherRows=require('./report-fact-bindings').build(differentDay);
assert(otherRows.some(r=>r.id==='natal.year.stem'&&r.tenGod==='정관'));
assert(otherRows.some(r=>r.id==='natal.month.stem'&&r.tenGod==='정인'));
assert.equal(source.inspect(differentDay).dualExposureTextualPriority.scopeMatched,false);
assert.equal(source.offlineReaderCandidate(differentDay),null,
 'no copied reader conclusion for different day master');
assert.equal(source.offlineSingleReaderCandidate(differentDay),null);
assert.equal(source.inspect(differentDay).dualExposureTextualPriority.firstRole,null);
assert.equal(source.inspect(differentDay).dualExposureTextualPriority.textualPriorityBasis,null);
// Another month also invalidates the classical example.
const changedMonth=facts.build({calendar:'solar',birthDate:'2024-03-17',
 birthTime:'14:20',gender:'male',mbti:'ISFP'},2027);
assert.equal(source.inspect(changedMonth).dualExposureTextualPriority.scopeMatched,false);
assert.equal(source.offlineReaderCandidate(changedMonth),null,
 'no copied conclusion for out-of-scope month');
assert.equal(source.offlineSingleReaderCandidate(changedMonth),null);
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
assert.equal(source.offlineReaderCandidate(other),null,
 'unrelated natal samples cannot receive the classical reader passage');
assert.equal(source.offlineSingleReaderCandidate(other),null);
const unknown=facts.build({calendar:'solar',birthDate:'1982-02-15',
 unknownBirthTime:true,gender:'male',mbti:'모름'},2027);
assert.throws(()=>source.inspect(unknown),/QA_CLASSICAL_MONTH_EXAMPLE_INCOMPLETE/);
console.log('QA_CLASSICAL_YIN_EXAMPLE_CASES='+JSON.stringify({
 total:cases.length,representatives:dates,verifiedMatchCount:cases.filter(x=>
 x.status==='documented-textual-example-match').length,
 providerCalls:0,releaseVerdict:'not-approved'}));
console.log('PASS literal classical conditions and opposite conditions checked across computed synthetic charts');
