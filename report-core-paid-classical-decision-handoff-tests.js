'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const method=require('./report-core-paid-classical-decision-handoff');
const scenarios=[
 ['lunar','1982-11-24',null,'no-published-textual-case-matches-this-chart'],
 ['solar','1989-02-10','정관','single-secondary-exposure-textual-case-only'],
 ['solar','2024-02-17','정재','main-plus-secondary-exposure-textual-case-only']
];
for(const [calendar,birthDate,first,status] of scenarios){
 const p=facts.build({calendar,birthDate,birthTime:'14:20',
  ...(calendar==='lunar'?{leapMonth:false}:{}),
  gender:'male',mbti:'ISFP'},2027);
 const x=method.build(p);
 assert.equal(x.status,status);
 assert.equal(x.exactTextualDecision?.firstTraditionalCategory||null,first);
 assert.equal(x.expertDecisions.length,5);
 assert(x.expertDecisions.every(d=>d.status==='pending'&&
  d.decision===null&&d.sourceCitation===null));
 assert(x.candidates.every(d=>d.priority==='not-assessed'));
 assert.equal(x.methodApproved,false);
 assert.equal(x.readyForPaidModelProbe,false);
 assert.equal(x.customerReady,false);
 assert.equal(x.providerCalls,0);
 assert.equal(x.releaseVerdict,'not-approved');
 if(first){
  assert.equal(x.exactTextualDecision.fullChartConclusionEstablished,false);
  assert.equal(x.exactTextualDecision.url,
   'https://caipu.donglishuzhai.net/chapter/3723.html');
  assert(x.exactTextualDecision.evidenceRefs.includes('natal.day.stem'));
 }else assert.equal(x.exactTextualDecision,null);
}
for(const birthDate of ['1989-02-10','2024-02-17']){
 const p=facts.build({calendar:'solar',birthDate,birthTime:'20:20',
  gender:'male',mbti:'ISFP'},2027);
 const x=method.build(p);
 assert.equal(x.exactTextualDecision,null);
 assert(x.calculatedScope.competingThirdVisiblePositions.length>0);
}
const bad=facts.build({calendar:'solar',birthDate:'2024-02-17',
 birthTime:'14:20',gender:'male',mbti:'ISFP'},2027);
bad.facts.tenGods.month.stemTenGod='편인';
assert.throws(()=>method.build(bad),/QA_|CORE_/);
console.log('QA_CLASSICAL_METHOD_HANDOFF='+JSON.stringify({
 reviewedCaseTypes:scenarios.length,
 exactTextualExamples:2,
 missingGeneralMethodForAdultSample:1,
 contradictoryHourCasesRejected:2,
 expertDecisionsPending:5,
 providerCalls:0,readyForSale:false}));
