'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const integrity=require('./report-calculation-integrity');
const input={calendar:'solar',birthDate:'1990-05-15',birthTime:'10:30',gender:'male',mbti:'INTJ'};
const cases=[
 input,
 {...input,birthDate:'1988-08-21',birthTime:'22:10',gender:'female'},
 {...input,birthDate:'2000-02-29',birthTime:'23:30'},
 {...input,calendar:'lunar',birthDate:'1995-05-12',birthTime:'14:20'},
 {...input,birthDate:'2001-11-03',birthTime:undefined,unknownBirthTime:true,mbti:'모름'}
];
for(const item of cases){
 const p=facts.build(item);
 assert.equal(p.status,'ready');
 const check=integrity.verify(p);
 assert.deepEqual(check.errors,[],JSON.stringify(item)+': '+check.errors.join(','));
 assert.equal(check.pass,true);
}
const original=facts.build(input);
function altered(mutate,expected){
 const p=structuredClone(original);
 mutate(p);
 const check=integrity.verify(p);
 assert(check.errors.includes(expected),expected+' missing from '+check.errors.join(','));
}
altered(p=>{p.facts.tenGods.month.stemTenGod='정관'},'incorrect-ten-god-position:month');
altered(p=>{p.facts.tenGods.month.hiddenStems[0].tenGod='식신'},'incorrect-ten-god-position:month');
altered(p=>{p.facts.hiddenStems.month=['甲']},'incorrect-hidden-stems:month');
altered(p=>{p.facts.annualTenGods.stemTenGod='겁재'},'incorrect-annual-ten-gods');
altered(p=>{p.targetYear.pillar='甲子'},'wrong-target-year-pillar');
altered(p=>{p.facts.structuralEvidence.monthCommand.mainHiddenStem='乙'},'incorrect-month-command');
altered(p=>{p.facts.structuralEvidence.dayMasterRoots[0].sameElementStems=['甲']},'incorrect-day-master-roots');
altered(p=>{p.facts.structuralEvidence.visibleStems[0].element='fire'},'incorrect-visible-stems');
const tamperedDecade=structuredClone(original);
if(tamperedDecade.fortune.decades?.length){
 tamperedDecade.fortune.decades[0].stemTenGod='잘못된 십성';
 assert(integrity.verify(tamperedDecade).errors.includes('incorrect-decade-ten-gods'));
}
const changedActive=structuredClone(original);
changedActive.fortune.activeDecade={pillar:'甲子',startYear:2025,endYear:2035};
assert(integrity.verify(changedActive).errors.includes('incorrect-active-decade'));
altered(p=>{p.facts.targetYearRelations=[{type:'충',between:'day',branches:'子午'}]},'incorrect-2027-clash-relations');
altered(p=>{p.facts.targetYearBranchRelations.pairs.push({
 type:'육합',branches:'午未',between:'day',evidenceType:'pair-table',transformation:'not-assessed'
})},'incorrect-2027-branch-relations');
altered(p=>{p.facts.natalBranchRelations.groups=[{
 type:'삼합',branches:'亥卯未',positions:['year','month','day'],
 evidenceType:'complete-group-membership',transformation:'not-assessed'
}]},'incorrect-natal-branch-relations');
altered(p=>{p.facts.natalClashes=[];p.facts.natalClashes.push({type:'충',positions:['day','hour'],branches:'子午'})},'incorrect-natal-clashes');
altered(p=>{p.chart.month='甲子'},'birth-input-chart-mismatch');
altered(p=>{p.calculationInput.birthDate='1990-05-16'},'birth-input-chart-mismatch');
const unknown=facts.build({...input,unknownBirthTime:true,birthTime:undefined});
altered(p=>{p.chart.hour=null},'unjustified-missing-birth-hour');
assert(integrity.verify({...unknown,chart:{...unknown.chart,hour:'壬子'}}).errors.includes('fabricated-unknown-birth-hour'));
assert.equal(integrity.verify({status:'ready',chart:{year:'not',month:'invalid'}}).pass,false);

// The live paid entry must not spend a single token if symbolic facts drift.
const contract=require('./report-server-contract');
const oldBuild=facts.build;
(async()=>{
 let providerCalls=0;
 try{
  facts.build=()=>{const p=structuredClone(original);p.facts.tenGods.month.stemTenGod='정관';return p};
  const response=await contract.generate(input,async()=>{providerCalls++;throw Error('illegal provider call')});
  assert.equal(response.status,'blocked');
  assert.equal(providerCalls,0);
  assert(response.calculationIntegrity.errors.includes('incorrect-ten-god-position:month'));
 }finally{facts.build=oldBuild}
 console.log('PASS calculation provenance, mutating fact tests and pre-provider financial guard; zero API');
})().catch(e=>{console.error(e);process.exitCode=1});
