'use strict';
const assert=require('node:assert/strict');
const core=require('./report-interpretation-core');
const readiness=require('./report-commercial-readiness');
const omission=require('./report-annual-domain-omission');
const facts=require('./report-facts-node');
const guidance=require('./report-analysis-guidance');
const coverage=require('./report-product-coverage');
const outcome=readiness.assess();
const money=core.eligibleAnnualStemGods('money');
const career=core.eligibleAnnualStemGods('career');
assert(money.length>0&&career.length>0);
assert.deepEqual(money.filter(x=>career.includes(x)),[],
 'visible annual stem categories for money and career MUST be disjoint');
assert.equal(outcome.fixedTwelveChapterPromisePossible,false);
assert.equal(outcome.annualChapterCompatibility.both2027MoneyAndCareerPossible,false);
assert(outcome.blockers.includes('twelve-chapters-impossible-under-exclusive-annual-stem-domains'));
assert.equal(outcome.canAcceptNewPayment,false);
// Robust future sales regression: EVEN IF developers introduce enough new
// topic definitions to pass the numerical 35-eligible gate, this fixed
// twelve-chapter promise must remain blocked. Isolated in this test process.
const outline=require('./report-outline');
const chapter=outline.topics.year_2027;
const extras=Array.from({length:8},(_,i)=>'qa16_synthetic_extra_'+i);
try{
 for(const [i,id] of extras.entries())chapter[id]='Synthetic counterexample only '+i;
 const hypothetical=readiness.assess();
 assert(hypothetical.definedTopics>=35);
 assert(hypothetical.structuralUpperBound>=35);
 assert(!hypothetical.blockers.includes('fewer-than-35-defined-topic-slots'));
 assert(!hypothetical.blockers.includes('fewer-than-35-evidence-eligible-topic-slots'));
 assert.equal(hypothetical.canAcceptNewPayment,false,
  '35 available slots CANNOT override mathematically incompatible annual domains');
 assert(hypothetical.blockers.includes('twelve-chapters-impossible-under-exclusive-annual-stem-domains'));
}finally{for(const id of extras)delete chapter[id]}
assert.equal(readiness.assess().definedTopics,33);
const ALL=['비견','겁재','식신','상관','편재','정재','편관','정관','편인','정인'];
for(const god of ALL){
 const natalRows=ALL.filter(x=>x!==god).map((x,i)=>({stem:'甲',tenGod:x}));
 const packet={facts:{
  annualTenGods:{stem:'丁',stemTenGod:god,hiddenStems:[]},
  tenGods:{year:{stem:'甲',stemTenGod:'비견',hiddenStems:natalRows}}
 }};
 const a=core.all(packet);
 assert(!(a.money.relevant&&a.career.relevant),
  'no individual annual stem subtype can enable both chapters: '+god);
}
let eligibleMoney=0,eligibleCareer=0,eligibleRelationship=0,missingWithSpecificExplanation=0;
for(const year of [1982,1990,1998,2006])for(const month of [2,5,8,11])
for(const day of [7,21])for(const hour of ['08:20','20:20']){
 const input={calendar:'solar',
  birthDate:year+'-'+String(month).padStart(2,'0')+'-'+String(day).padStart(2,'0'),
  birthTime:hour,gender:(year/2+month+day)%2?'male':'female',mbti:'ISFP'};
 const packet=facts.build(input,2027);
 assert.equal(packet.status,'ready');
 const plan=guidance.preflight(packet),preview=coverage.calculate(input);
 assert.equal(preview.purchaseEnabled,false);
 const annualMoney=plan.year_2027_money.annualDomainEvidence.relevant;
 const annualCareer=plan.year_2027_career.annualDomainEvidence.relevant;
 assert(!(annualMoney&&annualCareer));
 eligibleMoney+=Number(annualMoney);
 eligibleCareer+=Number(annualCareer);
 eligibleRelationship+=Number(plan.year_2027_relationship.annualDomainEvidence.relevant);
 for(const [domain,chapterId] of [['money','year_2027_money'],['career','year_2027_career'],['relationship','year_2027_relationship']]){
  const row=preview.estimate.chapters.find(x=>x.id===chapterId);
  const eligible=plan[chapterId].annualDomainEvidence.relevant;
  assert.equal(row.includedInPlan,eligible);
  const reason=omission.explain(packet,chapterId);
  if(eligible){assert.equal(reason,null);assert.equal(row.omittedReason,null)}
  else{
   assert(reason&&reason.length>90,domain+' requires a grounded, useful reason');
   assert.equal(row.omittedReason,reason);
   assert(!/(?:natal\\.|facts\\.|person\\.|internal|qa16_)/.test(reason));
   assert(!reason.includes(input.birthDate)&&!reason.includes(hour));
   assert(/뜻은 아닙니다/.test(reason),'absence must not deny unrelated real chart evidence');
   missingWithSpecificExplanation++;
  }
 }
}
assert(eligibleMoney>0&&eligibleCareer>0&&eligibleRelationship>0,
 'real annual domain branches must have positive and negative examples');
assert(missingWithSpecificExplanation>80);
console.log('PASS annual domain mutual exclusion & customer scope honesty: 64 real charts, '+
 'money='+eligibleMoney+' career='+eligibleCareer+' relationship='+eligibleRelationship+
 ' omission explanations='+missingWithSpecificExplanation+
 ' even 41 defined topics cannot open checkout; zero provider calls or payments');
