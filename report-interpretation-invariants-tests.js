'use strict';
const assert=require('node:assert/strict');
const guidance=require('./report-analysis-guidance');
const invariant=require('./report-interpretation-invariants');
const facts=require('./report-facts-node');
const core=require('./report-interpretation-core');

const base={person:{mbti:'ISFP'},targetYear:2027,fortune:{},
 facts:{tenGods:{
   year:{stem:'辛',stemTenGod:'정재',hiddenStems:[]},
   month:{stem:'甲',stemTenGod:'편관',hiddenStems:[]},
   day:{stem:'庚',stemTenGod:'일간',hiddenStems:[{stem:'戊',tenGod:'정인'}]}
  },annualTenGods:{stem:'丁',stemTenGod:'정관',hiddenStems:[{stem:'己',tenGod:'편인'}]},
  targetYearRelations:[],natalClashes:[],
  structuralEvidence:{monthCommand:{branch:'申'},visibleStems:[{stem:'甲'}],dayMasterRoots:[]}
 }};
const canonical=guidance.preflight(base);
assert.equal(invariant.verify(base,canonical).pass,true);
assert.equal(invariant.verify(base,canonical).supportedDomains.money,false);
assert.equal(invariant.verify(base,canonical).supportedDomains.career,true);
const outdated=structuredClone(canonical);
outdated.year_2027_career.annualDomainEvidence.relevant=false;
assert(invariant.verify(base,outdated).errors.includes('year-domain-calculation-proof-mismatch:year_2027_career'));
const wrongSource=structuredClone(canonical);
wrongSource.year_2027_career.topicTasks.change.allowedSourceRefs=['natal.missing.stem'];
assert(invariant.verify(base,wrongSource).errors.some(e=>e.startsWith('year-domain-source-mismatch:')));
assert(invariant.verify(base,wrongSource).errors.some(e=>e.startsWith('unresolved-source-ids:')));
const stale=structuredClone(canonical);
stale.year_2027_money.requiredMode='use-fallback-with-limits';
stale.year_2027_money.fallbackEvidencePaths=['facts.annualTenGods'];
stale.year_2027_money.evidencePresent=true;
const staleErrors=invariant.verify(base,stale).errors;
for(const prefix of ['chapter-evidence-status-drift','chapter-required-mode-drift','chapter-fallback-drift'])
 assert(staleErrors.some(e=>e.startsWith(prefix+':year_2027_money')),prefix+' must prevent paid call');
const phantom=structuredClone(canonical);
phantom.year_2027_money.topicTasks.action.evidencePresent=true;
phantom.year_2027_money.topicTasks.action.evidenceReuseBoundary={rule:'unearned'};
assert(invariant.verify(base,phantom).errors.some(e=>e.startsWith('unsupported-topic-has-evidence:')));
assert(invariant.verify(base,phantom).errors.some(e=>e.startsWith('blocked-topic-owns-calculation-source:')));
const noMoney=structuredClone(base);
noMoney.facts.annualTenGods={stem:'庚',stemTenGod:'비견',hiddenStems:[]};
assert.equal(core.plan(noMoney,'money').relevant,false);
assert.equal(core.plan(noMoney,'career').relevant,false);
assert.equal(invariant.verify(noMoney,guidance.preflight(noMoney)).pass,true);
const inputCases=[
 {calendar:'solar',birthDate:'1990-05-15',birthTime:'10:30',gender:'male',mbti:'INTJ'},
 {calendar:'solar',birthDate:'1988-08-21',birthTime:'22:10',gender:'female',mbti:'ISTJ'},
 {calendar:'solar',birthDate:'2001-11-03',unknownBirthTime:true,gender:'male',mbti:'모름'},
 {calendar:'lunar',birthDate:'1995-05-12',birthTime:'14:20',gender:'female',mbti:'ISFP'}
];
for(const input of inputCases){
 const p=facts.build(input,2027);
 assert.equal(p.status,'ready','calculation should be ready for regression input');
 const actual=invariant.verify(p,guidance.preflight(p));
 assert.deepEqual(actual.errors,[],input.birthDate+': '+actual.errors.join('; '));
 assert.equal(actual.pass,true);
 assert(!core.natalRows(p).some(row=>row.position==='hour'&&input.unknownBirthTime));
}
// Prevent the previous structural regression where every 2027 money and
// career chapter was disabled regardless of the person's actual chart.
const positive={money:0,career:0};
for(const year of [1985,1991,2003])for(const month of [1,3,5,7,9,11]){
 const birth=facts.build({calendar:'solar',birthDate:year+'-'+String(month).padStart(2,'0')+'-15',
  birthTime:'12:00',gender:'male',mbti:'ISFP'},2027);
 assert.equal(birth.status,'ready');
 const preflight=guidance.preflight(birth);
 const integrity=invariant.verify(birth,preflight);
 assert.equal(integrity.pass,true,'calculated chart must satisfy the interpretation contract: '+year+'-'+month+' / '+integrity.errors.join(','));
 for(const id of Object.keys(positive))if(preflight['year_2027_'+id].annualDomainEvidence.relevant)positive[id]++;
}
assert(positive.money>0,'fatal regression: no real chart supports an independent annual money comparison');
assert(positive.career>0,'fatal regression: no real chart supports an independent annual career comparison');
console.log('PASS final interpretation invariants over real solar/lunar/unknown-time packets and tampered plans, no paid API');
