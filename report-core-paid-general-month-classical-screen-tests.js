'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const samples=require('./report-core-knowledge-coverage');
const screen=require('./report-core-paid-general-month-classical-screen');
const actual=require('./report-core-paid-month-ch16-application');
const base={calendar:'lunar',birthDate:'1982-11-24',
 leapMonth:false,gender:'male',mbti:'ISFP'};
const a=facts.build({...base,birthTime:'14:20'},2027);
const b=facts.build({...base,birthTime:'20:20'},2027);
const left=screen.inspect(a),right=screen.inspect(b);
assert.equal(left.status,'one-visible-candidate-needs-review');
assert.equal(right.status,'one-visible-candidate-needs-review');
assert.equal(left.provisionalMethodCandidate,'natal.month.hidden.癸');
assert.equal(left.provisionalMethodCandidate,right.provisionalMethodCandidate);
assert.deepEqual(left.candidates[0].exposedAt,
 ['natal.month.stem','natal.hour.stem']);
assert.deepEqual(right.candidates[0].exposedAt,['natal.month.stem']);
assert.equal(left.distinctVisibleCandidateCount,1);
assert.equal(right.distinctVisibleCandidateCount,1);
for(const v of [left,right]){
 assert.equal(v.completeSanHeGroupMembership.length,0);
 assert.equal(v.noMonthQiPriorityDetermined,true);
 assert.equal(v.anyFinalPatternChosen,false);
 assert.equal(v.observedLifeOutcome,false);
 assert.equal(v.approvedForPaidRequest,false);
 assert.equal(v.providerCalls,0);
 assert.equal(v.originalRule,'一透則一用');
 assert.equal(v.originalUrl,actual.inspect(v===left?a:b).source.url);
}
const totals={size:0,storage:0,otherMonths:0,classes:{}};
for(const input of samples.representativeInputs()){
 const packet=facts.build(input,2027);
 assert.equal(packet.status,'ready');
 const result=screen.inspect(packet);
 totals.size++;
 if(!result.applicable){
  totals.otherMonths++;
  assert.equal(result.reason,'chapter16-storage-month-only');
  assert.equal(result.provisionalMethodCandidate,null);
  continue;
 }
 totals.storage++;
 totals.classes[result.status]=(totals.classes[result.status]||0)+1;
 assert(['辰','戌','丑','未'].includes(result.monthBranch));
 assert.equal(result.monthHiddenStemSourceIds.length,3);
 assert(result.candidates.every(c=>c.exposedAt.length>0));
 assert.equal(new Set(result.candidates.map(c=>c.sourceId)).size,
  result.distinctVisibleCandidateCount);
 assert(result.candidates.every(c=>
  result.monthHiddenStemSourceIds.includes(c.sourceId)));
 if(result.provisionalMethodCandidate!==null){
  assert.equal(result.candidates.length,1);
  assert.equal(result.completeSanHeGroupMembership.length,0);
 }
 assert.equal(result.noTransformationProved,true);
 assert.equal(result.anyFinalPatternChosen,false);
 assert.equal(result.approvedForPaidRequest,false);
 assert.equal(result.providerCalls,0);
}
assert.equal(totals.size,samples.representativeInputs().length);
assert(totals.storage>0&&totals.otherMonths>0);
const corrupt=structuredClone(a);
corrupt.facts.stemConnections.exposure=[];
assert.throws(()=>screen.inspect(corrupt),/CALCULATION_DIVERGED/);
console.log('QA_GENERAL_MONTH_CLASSICAL_COVERAGE='+JSON.stringify(totals));
console.log('PASS general storage-month classical candidate method, including non-storage and real chart contrasts, no release');