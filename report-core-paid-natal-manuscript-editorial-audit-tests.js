'use strict';
// Report on actual existing offline manuscripts; no text or private samples
// exported, no HTTP, no billable API, no release approval.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const audit=require('./report-core-paid-natal-manuscript-editorial-audit');
const inputs=[
 ['solar','1982-06-15','14:20'],
 ['solar','1982-06-15','20:20'],
 ['solar','1982-03-15','14:20'],
 ['solar','1988-12-15','14:20'],
 ['solar','1994-04-15','14:20'],
 ['lunar','1982-11-24','14:20'],
 ['solar','1989-02-10','14:20'],
 ['solar','2024-02-17','14:20']
];
const cases=inputs.map(([calendar,birthDate,birthTime])=>{
 const packet=facts.build({calendar,birthDate,birthTime,
  ...(calendar==='lunar'?{leapMonth:false}:{}),
  gender:'male',mbti:'ISFP'},2027);
 assert.equal(packet.status,'ready');
 const result=audit.inspect(packet);
 assert.deepEqual(audit.inspect(packet),result,'triage must be deterministic');
 assert.equal(result.eligibleForPaidRelease,false);
 assert.equal(result.independentMethodApproved,false);
 assert.equal(result.provedIndividualInsight,false);
 assert.equal(result.providerCalls,0);
 assert.equal(result.releaseVerdict,'not-approved');
 assert.equal(result.humanReview.status,'pending');
 assert.equal(result.humanReview.criteria.length,7);
 assert(result.findings.length>0);
 assert(!result.findings.some(x=>x.id==='premium-approved'));
 if(result.readerPresent){
  assert.equal(result.status,'candidate-needs-editorial-review');
  assert(result.sourceRefs.length>=3);
  assert(result.findings.some(x=>
   x.id==='traditional-causal-bridge-not-independently-reviewed'));
  assert(result.findings.some(x=>x.id==='paid-reader-value-not-tested'));
  assert(result.diagnostics.textChars>=100);
 }else{
  assert.equal(result.status,'missing-curated-coverage');
  assert(result.findings.some(x=>x.id==='no-chart-specific-manuscript'));
 }
 return {readerPresent:result.readerPresent,reviewType:result.reviewType,
  flags:result.findings.map(x=>x.id),
  sourceCount:result.sourceRefs.length};
});
const present=cases.filter(x=>x.readerPresent);
const missing=cases.filter(x=>!x.readerPresent);
assert.equal(present.length,6,'baseline: six of eight have an offline candidate');
assert.equal(missing.length,2,'baseline: two of eight lack a curated candidate');
assert(present.every(x=>!x.flags.includes('visible-jargon-needs-editor')),
 'all six real offline manuscripts must now meet reader-language policy');
const machineDrafts=present.filter(x=>x.reviewType==='chartSynthesis');
assert.equal(machineDrafts.length,4);
assert(machineDrafts.every(x=>
 !x.flags.includes('multiple-symbolic-questions-not-personal-conclusion')&&
 !x.flags.includes('visible-jargon-needs-editor')&&
 !x.flags.includes('position-description-over-reader-insight')),
 'the four revised machine drafts must not regress to jargon or question lists');
assert(machineDrafts.every(x=>x.flags.includes(
 'traditional-causal-bridge-not-independently-reviewed')),
 'plain language never implies an approved traditional reading');
const tampered=facts.build({calendar:'solar',birthDate:'1982-06-15',
 birthTime:'14:20',gender:'male',mbti:'ISFP'},2027);
tampered.facts.tenGods.year.stemTenGod='정인';
assert.throws(()=>audit.inspect(tampered),
 /QA_COUNTERFACTUAL_SOURCE_ROLE_DRIFT:year/);
const missingHour=facts.build({calendar:'solar',birthDate:'1982-06-15',
 unknownBirthTime:true,gender:'male',mbti:'ISFP'},2027);
assert.throws(()=>audit.inspect(missingHour),
 /QA_COUNTERFACTUAL_REQUIRES_FULL_VALID_CHART/);
console.log('QA_ACTUAL_MANUSCRIPT_READER_VALUE_GAPS='+JSON.stringify({
 samples:cases.length,manuscriptsPresent:present.length,
 missingCoverage:missing.length,
 questionLedManuscripts:present.filter(x=>x.flags.includes(
  'multiple-symbolic-questions-not-personal-conclusion')).length,
 jargonCandidates:present.filter(x=>x.flags.includes(
  'visible-jargon-needs-editor')).length,
 repeatedCaveatCandidates:present.filter(x=>x.flags.includes(
  'repeated-disclaimers-reduce-reader-value')).length,
 types:present.reduce((a,x)=>(a[x.reviewType]=(a[x.reviewType]||0)+1,a),{}),
 examples:cases.map((c,index)=>({case:index+1,status:c.readerPresent?'draft':'missing',
  reviewType:c.reviewType,flags:c.flags,sourceCount:c.sourceCount})),
 professionalMethodApproved:false,readyForSale:false,providerCalls:0
}));
console.log('PASS reader-value triage isolates missing coverage and unresolved method without authorizing paid release');
