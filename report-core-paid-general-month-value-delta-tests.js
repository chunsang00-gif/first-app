'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const coverage=require('./report-core-knowledge-coverage');
const audit=require('./report-core-paid-general-month-value-delta');
const screen=require('./report-core-paid-general-month-classical-screen');
const input={calendar:'lunar',birthDate:'1982-11-24',
 leapMonth:false,gender:'male',mbti:'ISFP'};
const early=audit.inspect(facts.build({...input,birthTime:'14:20'},2027));
const late=audit.inspect(facts.build({...input,birthTime:'20:20'},2027));
assert.equal(early.valueClass,'same-category-new-position-only');
assert.equal(late.valueClass,'month-symbol-already-in-core');
assert.deepEqual(early.novelTraditionalRoleNamesBeyondMonthCore,[]);
assert.deepEqual(late.novelTraditionalRoleNamesBeyondMonthCore,[]);
assert.deepEqual(early.newlyMentionedOtherPillarRefs,['natal.hour.stem']);
assert.deepEqual(late.newlyMentionedOtherPillarRefs,[]);
assert.equal(early.verifiedNewPersonalizedConclusion,false);
assert.equal(late.paidValueApproved,false);
const novelCases=[];
const totals={tested:0,notApplicable:0,applicable:0,classes:{},
 textBaselineAvailable:0,structuralProvenanceImproved:0,paidReady:0};
for(const item of coverage.representativeInputs()){
 const packet=facts.build(item,2027);
 assert.equal(packet.status,'ready');
 const a=audit.inspect(packet);
 totals.tested++;
 assert.equal(a.providerCalls,0);
 assert.equal(a.releaseVerdict,'not-approved');
 assert.equal(a.paidValueApproved,false);
 assert.equal(a.estimatedValue,false);
 assert.equal(a.additionalSourceBasedInsight,false);
 assert.equal(a.comparedWithActualFreeTier,false);
 if(a.status==='outside-chapter16'){
  totals.notApplicable++;
  continue;
 }
 totals.applicable++;
 totals.classes[a.valueClass]=(totals.classes[a.valueClass]||0)+1;
 if(a.curatedMonthBaselineTextAvailable)totals.textBaselineAvailable++;
 if(a.explanatoryProvenanceImproved)totals.structuralProvenanceImproved++;
 if(a.paidValueApproved)totals.paidReady++;
 if(a.valueClass==='new-symbol-category-and-independent-position')
  novelCases.push({input:item,chart:packet.chart,roles:a.novelTraditionalRoleNamesBeyondMonthCore,
   baseline:a.baselineTraditionalRoles,positions:a.newlyMentionedOtherPillarRefs,
   refs:a.shownCandidateSourceIds});

 assert.equal(a.paidWriterFirstChapterWholeChartGrounded,false);
 assert.equal(a.verifiedNewPersonalizedConclusion,false);
 assert.equal(a.changedReaderDecisionVersusBaseline,false);
 assert.equal(a.independentTraditionalMethodApproved,false);
 assert.equal(a.professionalEditorialReviewComplete,false);
 assert.equal(a.testedAgainstPayingCustomers,false);
 for(const id of a.newlyMentionedOtherPillarRefs)
  assert(['natal.year.stem','natal.hour.stem'].includes(id));
 for(const role of a.novelTraditionalRoleNamesBeyondMonthCore)
  assert(!a.baselineTraditionalRoles.includes(role));
}
assert.equal(totals.tested,99);
assert.equal(totals.applicable,35);
assert.equal(totals.notApplicable,64);
assert.equal(totals.paidReady,0);
assert(totals.structuralProvenanceImproved>0);
assert(totals.textBaselineAvailable>0);
assert(totals.classes['month-symbol-already-in-core']>0);
let combined=null;
for(let d=8;d<=31&&!combined;d++)for(const hour of
 ['02:20','08:20','14:20','20:20']){
 const packet=facts.build({calendar:'solar',
  birthDate:'2019-07-'+String(d).padStart(2,'0'),
  birthTime:hour,gender:'male',mbti:'ISFP'},2027);
 if(packet.status!=='ready')continue;
 const candidate=screen.inspect(packet);
 if(candidate.applicable&&
    candidate.completeSanHeGroupMembership.length&&
    candidate.distinctVisibleCandidateCount===1){combined=packet;break;}
}
assert(combined,'missing calendar-verified three-branch condition');
const mixed=audit.inspect(combined);
assert.equal(mixed.valueClass,'three-branch-group-and-candidates-unresolved');
assert.equal(mixed.newThreeBranchGroupMemberships.length>0,true);
assert.equal(mixed.paidValueApproved,false);
const tampered=facts.build({...input,birthTime:'14:20'},2027);
tampered.facts.stemConnections.exposure=[];
assert.throws(()=>audit.inspect(tampered),/CALCULATION_DIVERGED/);
console.log('QA_MONTH_NEW_ROLE_FIXTURES='+JSON.stringify(novelCases));
console.log('QA_MONTH_READER_VALUE_DELTA='+JSON.stringify(totals));
console.log('PASS reading categories, novel positions, and structural-only changes cannot masquerade as verified paid value');