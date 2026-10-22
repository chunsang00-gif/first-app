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
let checked=0;
for(const input of samples){
 const p=preview.prepare(facts.build(input,2027));
 assert(p,'synthetic scope must be eligible for candidate review');
 const result=audit.assess(p.prompt,p.payload);
 assert.equal(result.methodStatus,'unverified-interpretive-bridge');
 assert.equal(result.independentMethodApproved,false);
 assert.equal(result.eligibleForPaidQualityApproval,false);
 assert.equal(result.releaseVerdict,'not-approved');
 assert.equal(result.providerCalls,0);
 assert.equal(result.calculatedObservations.positionsVerified,4);
 assert.equal(result.decisions.length,5);
 assert(result.decisions.some(x=>x.id==='which-connection-changes-interpretive-priority'&&
   x.status==='independent-method-review-required'));
 const wrong=structuredClone(p.payload);
 wrong.task.chapters.saju_core.topics.natal_depth.evidenceFocus.verifiedLinks
  .sameVisibleStems.push({leftId:'natal.year.stem',rightId:'natal.day.stem',
   stem:'NOT_IN_CHART'});
 assert.throws(()=>audit.assess(p.prompt,wrong),
  /QA_METHOD_REVIEW_CALCULATED_LINKAGE_DRIFT/,
  'a false positional match must block before interpreting');
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
 checked++;
}
console.log('PASS independent natal methodology pending across '+checked+
 ' calculated synthetic charts; mutated source refused; provider calls 0');
