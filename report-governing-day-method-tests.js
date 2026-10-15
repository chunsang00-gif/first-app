'use strict';
const assert=require('node:assert/strict');
const model=require('./report-governing-day-method');
const season=require('./report-seasonal-evidence');
const qi=require('./report-qi-evidence');
const facts=require('./report-facts-node');
const integrity=require('./report-calculation-integrity');
const D=86400;
for(const [branch,table] of Object.entries(model.MONTHS)){
 assert.equal(table.reduce((n,row)=>n+row[1],0),30,'published approximate day table must retain its original thirty days: '+branch);
 const available=season.HIDDEN[branch];
 const actual=model.inspect({chart:{month:'甲'+branch},
   hiddenStems:available,timing:{status:'resolved',monthBranchFromJie:branch,elapsedSecondsSinceJie:20*D}});
 assert.deepEqual(actual.sourceRows.map(x=>x.stem),table.map(x=>x[0]));
 assert.equal(actual.method.status,'diagnostic-not-adopted');
 assert.equal(actual.method.id,'asklingxi-renyuan-siling-approx30-v1');
 assert.equal(actual.activeHiddenStemId,null);
 assert.equal(actual.activeQiDetermined,false);
 assert.equal(actual.canUseAsRootEvidence,false);
 assert.equal(actual.canUseForPremiumInterpretation,false);
 assert.equal(actual.approximateStageCandidate.stem,table.at(-1)[0],
  'later month allocation is the published main stage');
 const guess=model.inspect({chart:{month:'甲'+branch},
  hiddenStems:available,timing:{status:'resolved',monthBranchFromJie:branch,elapsedSecondsSinceJie:1*D}});
 assert.equal(guess.approximateStageCandidate.stem,table[0][0]);
 assert.equal(guess.approximateStageCandidate.natalHiddenStemPresent,available.includes(table[0][0]));
 if(!available.includes(table[0][0]))
  assert.equal(guess.status,'external-residual-not-natal-hidden');
}
for(const [branch,stem] of [['卯','甲'],['午','丙'],['酉','庚'],['亥','戊'],['子','壬']]){
 const found=model.inspect({chart:{month:'甲'+branch},hiddenStems:season.HIDDEN[branch],
  timing:{status:'resolved',monthBranchFromJie:branch,elapsedSecondsSinceJie:2*D}});
 assert(found.publishedStemsOutsideNatalHidden.includes(stem),
  'published lingering qi must not become a false natal hidden stem');
 assert.equal(found.approximateStageCandidate.natalSourceId,null);
}
const boundary=model.inspect({chart:{month:'甲寅'},hiddenStems:season.HIDDEN.寅,
 timing:{status:'resolved',monthBranchFromJie:'寅',elapsedSecondsSinceJie:7*D}});
assert.equal(boundary.status,'approximate-stage-boundary');
assert.equal(boundary.withinOneDayOfPublishedBoundary,true);
assert.equal(boundary.activeHiddenStemId,null);
assert.equal(model.inspect({chart:{month:'甲寅'},hiddenStems:season.HIDDEN.寅,
 timing:{status:'birth-clock-unknown'}}).status,'unknown-birth-clock');
assert.throws(()=>model.inspect({chart:{month:'甲寅'},hiddenStems:season.HIDDEN.寅,
 timing:{status:'resolved',monthBranchFromJie:'卯',elapsedSecondsSinceJie:D}}),/mismatch/);
assert.throws(()=>model.inspect({chart:{month:'甲寅'},hiddenStems:season.HIDDEN.寅,
 timing:{status:'resolved',monthBranchFromJie:'寅',elapsedSecondsSinceJie:-1}}),/Negative/);
const synthetic=qi.build({year:'甲寅',month:'乙亥',day:'甲子',hour:'壬午'},
 {status:'resolved',monthBranchFromJie:'亥',elapsedSecondsSinceJie:2*D});
assert.equal(synthetic.governance.publishedMethodExploration.approximateStageCandidate.stem,'戊');
assert.equal(synthetic.governance.publishedMethodExploration.status,'external-residual-not-natal-hidden');
assert(!synthetic.entries.some(x=>x.id==='natal.month.hidden.戊'),
 'external prior-season residue must never get added to the natal fact ledger');
assert.equal(synthetic.governance.activeHiddenStemId,null);
for(const input of [
 {calendar:'solar',birthDate:'1982-11-24',birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'2001-11-03',unknownBirthTime:true,gender:'male',mbti:'모름'},
 {calendar:'lunar',birthDate:'1995-05-12',birthTime:'14:20',gender:'female',mbti:'INTJ'},
 {calendar:'solar',birthDate:'1990-05-15',birthTime:'10:30',gender:'male',mbti:'ISTJ'}
]){
 const p=facts.build(input,2027);
 assert.equal(p.status,'ready',input.birthDate);
 const governance=p.facts.qiEvidence.governance;
 assert.equal(governance.activeHiddenStemId,null);
 assert.equal(governance.publishedMethodExploration.canUseForPremiumInterpretation,false);
 assert.equal(governance.publishedMethodExploration.activeQiDetermined,false);
 assert.equal(integrity.verify(p).pass,true,input.birthDate);
 const fake=structuredClone(p);
 fake.facts.qiEvidence.governance.publishedMethodExploration.activeHiddenStemId=
  'natal.month.hidden.'+fake.chart.month[0];
 assert(integrity.verify(fake).errors.includes('incorrect-positional-qi-evidence'));
}
console.log('PASS all 12 published approximate stages, external residual vs natal hidden distinctions and fail-closed paid interpretation policy; no API calls');
