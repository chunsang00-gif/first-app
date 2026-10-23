'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const candidate=require('./report-core-paid-natal-month-first-screen');
const preview=require('./report-core-paid-natal-depth-preview');
const transport=require('./report-instruction-audit');
const cases=[
 {date:'1982-06-15',calendar:'solar',n:0,dayOnly:1,category:'no-independent-visible-month-exposure'},
 {date:'1982-03-15',calendar:'solar',n:0,dayOnly:0,category:'no-independent-visible-month-exposure'},
 {date:'1988-12-15',calendar:'solar',n:0,dayOnly:0,category:'no-independent-visible-month-exposure'},
 {date:'1994-04-15',calendar:'solar',n:2,dayOnly:0,category:'competing-visible-month-candidates'},
 {date:'1982-11-24',calendar:'lunar',n:1,dayOnly:0,category:'one-visible-month-candidate-needs-method-review'}
];
const diagnostic=[];
for(const row of cases){
 const input={calendar:row.calendar,birthDate:row.date,birthTime:'14:20',
  gender:'male',mbti:'ISFP'};
 if(row.calendar==='lunar')input.leapMonth=false;
 const packet=facts.build(input,2027);
 assert.equal(packet.status,'ready');
 const audit=candidate.build(packet);
 assert.equal(audit.kind,'qa-month-first-symbolic-applicability-screen-v1');
 assert.equal(audit.monthMethodCandidate,row.category);
 assert.equal(audit.conditions[1].nonDayExactCandidateCount,row.n);
 assert.equal(audit.conditions[1].dayMasterOnlyMatches,row.dayOnly);
 assert.equal(audit.conditions[4].status,'not-determined');
 assert.equal(audit.validPremiumInterpretationEstablished,false);
 assert.equal(audit.methodAdopted,false);
 assert.equal(audit.humanTraditionalReviewRequired,true);
 assert.equal(audit.providerCalls,0);
 assert(audit.disallowedWithoutIndependentReview.includes(
  'real-personality-career-relationships-or-events'));
 const qa=preview.prepare(packet);
 // Even if the offline core has no coverage, method diagnostic remains usable.
 if(qa){
  const focus=qa.payload.task.chapters.saju_core.topics.natal_depth.evidenceFocus;
  assert.deepEqual(focus.monthFirstApplicability,audit,
   'the actual provider must receive month-led limits, not a chart-independent slogan');
  assert.deepEqual(transport.inspectTransport(qa.prompt,qa.payload),[]);
  const wrong=structuredClone(qa.payload);
  wrong.task.chapters.saju_core.topics.natal_depth.evidenceFocus
   .monthFirstApplicability.validPremiumInterpretationEstablished=true;
  assert(transport.inspectTransport(qa.prompt,wrong).includes(
   'qa-natal-depth-evidence-brief-drift'),'bogus method approval must fail before sending');
 }
 diagnostic.push({date:row.date,kind:row.category,nonDayCount:row.n,
  dayMasterOnly:row.dayOnly,monthOverlaps:audit.conditions[3].observedCount,
  transition:audit.conditions[2].status,approved:false});
}
assert.equal(diagnostic.length,5);
assert(new Set(diagnostic.map(x=>x.kind)).size===3,
 'test matrix must contain absent, one, and competing month-exposure candidates');
console.log('QA_MONTH_FIRST_APPLICABILITY='+JSON.stringify({
 diagnostics:diagnostic,providerCalls:0,releaseVerdict:'not-approved'
}));
console.log('PASS month-led candidate cannot be promoted to a personal inference; no provider calls');
