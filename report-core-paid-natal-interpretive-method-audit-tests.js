'use strict';
// No provider traffic. An interpretive approval can NEVER be inferred merely
// from verified chart rows or root counts.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const preview=require('./report-core-paid-natal-depth-preview');
const audit=require('./report-core-paid-natal-interpretive-method-audit');
const samples=[
 {calendar:'solar',birthDate:'1982-06-15',birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'1982-03-15',birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'1988-12-15',birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'1994-04-15',birthTime:'14:20',gender:'male',mbti:'ISFP'}
];
const cases=[];
let checked=0;
for(const input of samples){
 const p=preview.prepare(facts.build(input,2027));
 assert(p,'synthetic scope must be eligible for candidate review');
 const result=audit.assess(p.prompt,p.payload);
 assert.equal(result.methodStatus,'unverified-interpretive-bridge');
 assert.equal(result.independentMethodApproved,false);
 assert.equal(result.eligibleForPaidQualityApproval,false);
 assert.equal(result.monthMethodReview.status,'method-priority-not-selected');
 assert.equal(result.monthMethodReview.adoptedMethodId,null);
 assert.equal(result.monthMethodReview.activeHiddenStemId,null);
 assert.equal(result.monthMethodReview.canApproveDeepSajuInterpretation,false);
 assert.equal(result.releaseVerdict,'not-approved');
 assert.equal(result.providerCalls,0);
 assert.equal(result.calculatedObservations.positionsVerified,4);
 const visible=result.traditionalVisibleRelations;
 assert.equal(visible.kind,'qa-three-visible-stem-element-directions-v1');
 assert.equal(visible.pairs.length,3);
 assert.equal(visible.methodAdopted,false);
 assert.equal(visible.symbolicLifeInterpretationVerified,false);
 assert.equal(visible.eligibleForPremiumReaderClaim,false);
 assert(visible.pairs.every(pair=>
  pair.positionalClaimVerified===true&&
  pair.realizedInfluence==='not-assessed'&&
  pair.relativePriority==='not-assessed'&&
  pair.observedPersonality===false));
 if(input.birthDate==='1982-06-15'){
  assert.deepEqual(visible.pairs.map(x=>x.elementalDirection),[
   'left-controls-right','right-generates-left','left-controls-right'
  ],'specific 1982 natal positions have a verified directional contrast');
 }
 assert.equal(result.decisions.length,5);
 assert.equal(result.falsifiableChecks.length,5);
 assert(Object.keys(result.exactStemsByPosition).every(k=>
  ['year','month','day','hour'].includes(k)));
 for(const entry of result.falsifiableChecks){
  assert.equal(typeof entry.observed,'boolean');
  assert(entry.refs.every(id=>id.startsWith('natal.')));
  assert(entry.incorrectOpposite.includes('이 명식에 틀리다'));
 }
 const evidence=result.exactStemsByPosition;
 const flags=Object.fromEntries(result.falsifiableChecks.map(row=>[row.id,row.observed]));
 const date=input.birthDate;
 if(date==='1982-03-15'){
  assert.equal(flags['day-and-hour-visible-same-exact-character'],true,
   'matching visible day/hour chars are a positional observation, not a trait');
  assert(evidence.hour.exactHiddenSourceIds.length>0);
 }else if(date==='1988-12-15'){
  assert(evidence.year.exactHiddenSourceIds.length>0);
  assert.equal(evidence.hour.exactHiddenSourceIds.length,0,
   'absence of exact matching does NOT imply weaker influence');
  assert.equal(evidence.hour.sameElementOtherStemSourceIds.length,0);
 }else if(date==='1994-04-15'){
  assert(evidence.hour.exactHiddenSourceIds.length>=3);
  assert.equal(evidence.year.exactHiddenSourceIds.length,0);
  assert(evidence.year.sameElementOtherStemSourceIds.length>=3);
  assert.equal(flags['year-visible-matched-same-element-different-character'],true);
 }

 assert(result.decisions.some(x=>x.id==='which-connection-changes-interpretive-priority'&&
   x.status==='independent-method-review-required'));
 const wrong=structuredClone(p.payload);
 wrong.task.chapters.saju_core.topics.natal_depth.evidenceFocus.verifiedLinks
  .sameVisibleStems.push({leftId:'natal.year.stem',rightId:'natal.day.stem',
   stem:'NOT_IN_CHART'});
 assert.throws(()=>audit.assess(p.prompt,wrong),
  /QA_METHOD_REVIEW_CALCULATED_LINKAGE_DRIFT/,
  'a false positional match must block before interpreting');
 const wrongStem=structuredClone(p.payload);
 wrongStem.source['natal.year.stem'].stem=
  wrongStem.source['natal.year.stem'].stem==='甲'?'乙':'甲';
 assert.throws(()=>audit.assess(p.prompt,wrongStem),
  /QA_METHOD_REVIEW_TRADITIONAL_ROLE_DRIFT:year/,
  'a source can retain a correct category while hiding the WRONG calendar stem');
 const badRole=structuredClone(p.payload);
 badRole.task.chapters.saju_core.topics.natal_depth.evidenceFocus
  .positions[0].category='조작한 분류';
 assert.throws(()=>audit.assess(p.prompt,badRole),
  /QA_METHOD_REVIEW_TRADITIONAL_ROLE_DRIFT/,
  'ten-god labels cannot be transferred to another chart');
 const absent=structuredClone(p.payload);
 delete absent.source['natal.hour.stem'];
 assert.throws(()=>audit.assess(p.prompt,absent),
  /QA_METHOD_REVIEW_REQUIRED_PROVENANCE_MISSING/);
 const nonQa=structuredClone(p.prompt);delete nonQa.qaNatalDepthPreview;
 assert.throws(()=>audit.assess(nonQa,p.payload),
  /QA_METHOD_REVIEW_OUTSIDE_ISOLATED_DEPTH_SCOPE/);
 cases.push({date:input.birthDate,
  checks:Object.fromEntries(result.falsifiableChecks.map(x=>[x.id,x.observed])),
  yearExact:result.exactStemsByPosition.year.exactHiddenSourceIds.length,
  hourExact:result.exactStemsByPosition.hour.exactHiddenSourceIds.length});
 checked++;
}
assert.equal(new Set(cases.map(x=>JSON.stringify(x.checks))).size>=3,true,
 'real chart-specific stem observations must be distinguishable');
assert.notDeepEqual(cases.find(x=>x.date==='1988-12-15').checks,
 cases.find(x=>x.date==='1994-04-15').checks,
 'a year root and an hour root cannot be interchanged between charts');
console.log('QA_NATAL_FALSIFIABLE_CASES='+JSON.stringify({
 checked,syntheticOnly:true,providerCalls:0,methodApproved:false,cases}));
console.log('PASS independent natal methodology pending across '+checked+
 ' calculated synthetic charts; mutated source refused; provider calls 0');
