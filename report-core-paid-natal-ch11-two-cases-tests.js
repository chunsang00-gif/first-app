'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const qa=require('./report-core-paid-natal-ch11-two-cases');
const month=require('./report-core-paid-natal-month-method-review');
const engine=require('./report-core-knowledge-engine');
const policy=require('./report-reader-policy');
function packet(date,time='19:20'){
 return facts.build({calendar:'solar',birthDate:date,birthTime:time,
  gender:'male',mbti:'ISFP'},2027);
}
const fixtures=[
 {date:'2023-08-18',time:'19:20',day:'戊',month:'申',
  id:'wu-shen-geng-ren-food-generates-wealth',
  main:'庚',second:'壬',direction:'creative-symbol-generates-resource-symbol'},
 {date:'2023-07-13',time:'10:20',day:'壬',month:'未',
  id:'ren-wei-yi-ji-output-opposes-authority',
  main:'己',second:'乙',direction:'expression-symbol-controls-duty-symbol'}
];
const observed=[];
for(const x of fixtures){
 const p=packet(x.date,x.time);
 assert.equal(p.status,'ready');
 assert.equal(p.chart.day[0],x.day,'actual computed day stem must match');
 assert.equal(p.chart.month[1],x.month,'actual computed month must match');
 const result=qa.evaluate(p);
 assert.equal(result.sourceMatched,true);
 assert.equal(result.examples.length,1);
 assert.equal(result.clientReleaseAllowed,false);
 assert.equal(result.fullChartVerdict,'not-assessed');
 assert.equal(result.releaseVerdict,'not-approved');
 assert.equal(result.providerCalls,0);
 const ex=result.examples[0];
 assert.equal(ex.id,x.id);
 assert.equal(ex.monthMainSourceId,'natal.month.hidden.'+x.main);
 assert.equal(ex.secondMonthSourceId,'natal.month.hidden.'+x.second);
 assert.equal(ex.sourceTextualRelation,x.direction);
 assert(ex.exactExposedReferences.every(o=>o.visibleSourceIds.length>0));
 assert(ex.sourceRefs.includes('natal.day.stem'));
 assert(ex.sourceRefs.includes('facts.stemConnections'));
 assert(ex.sourceRefs.includes('facts.natalBranchRelations'));
 assert(ex.sourceRefs.includes('natal.month.hidden.'+x.main));
 assert(ex.sourceRefs.includes('natal.month.hidden.'+x.second));
 assert.equal(ex.traditionalSchoolAdopted,false);
 assert.equal(ex.finalPatternConfirmed,false);
 assert.equal(ex.favourableOrUnfavourableDestinyInferred,false);
 assert.equal(ex.personalityOrCareerOutcomeInferred,false);
 assert.equal(ex.conflictWithOtherRulesNotResolved,true);
 assert.equal(ex.writerDraft.clientApproved,false);
 assert.equal(ex.writerDraft.professionalReviewComplete,false);
 assert(ex.writerDraft.text.length>=250&&ex.writerDraft.text.length<650);
 assert.deepEqual(policy.errors([ex.writerDraft.label,ex.writerDraft.text]),[]);
 assert(!/[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]/.test(
  ex.writerDraft.label+ex.writerDraft.text));
 assert(!/[?？]\s*$/.test(ex.writerDraft.text));
 assert.equal(ex.providerCalls,0);
 const m=month.assess(p);
 assert.equal(m.adoptedMethodId,null);
 assert.equal(m.interpretivePriorityVerified,false);
 const offline=engine.compile(p);
 assert.equal(offline.releaseVerdict,'not-approved');
 // Matches the classical statement but never appears in the paid/core reader
 // merely because an offline fact matcher recognizes a pair of stems.
 assert(!JSON.stringify(offline).includes(ex.writerDraft.text));
 observed.push({date:x.date,chart:p.chart,
  id:ex.id,readerChars:ex.writerDraft.text.length,
  refs:ex.exactExposedReferences});
}
assert.equal(new Set(observed.map(x=>x.id)).size,2);
const first=qa.evaluate(packet(fixtures[0].date,fixtures[0].time)).examples[0];
const second=qa.evaluate(packet(fixtures[1].date,fixtures[1].time)).examples[0];
assert.notEqual(first.sourceTextualRelation,second.sourceTextualRelation);
assert.notEqual(first.writerDraft.text,second.writerDraft.text);
const near=[
 ['2023-08-18','14:20'],
 ['2023-07-13','14:20'],
 ['2023-08-19','19:20'],
 ['2023-07-14','10:20'],
 ['2023-09-18','19:20'],
 ['2023-06-13','10:20']
];
for(const [date,time] of near){
 const r=qa.evaluate(packet(date,time));
 assert.equal(r.examples.length,0,
  'changing an actual clock/date/month must not reuse a narrow chapter-11 case');
 assert.equal(r.sourceMatched,false);
 assert.equal(r.clientReleaseAllowed,false);
}
const forged=packet('2023-08-18','19:20');
forged.facts.stemConnections.exposure=[];
assert.throws(()=>qa.evaluate(forged),
 /QA_MONTH_METHOD_CALCULATION_DIVERGED:stem-connections/);
const altered=packet('2023-07-13','10:20');
altered.facts.tenGods.month.stemTenGod='편재';
assert.throws(()=>qa.evaluate(altered),
 /QA_CLASSICAL_CH11_ROLE_OR_RELATION_DIVERGED|QA_MONTH_METHOD_CALCULATION_DIVERGED|QA_CORE|./);
console.log('QA_CLASSICAL_CH11_NEW_TWO_CASES='+JSON.stringify({
 exactComputedFixtures:observed,
 positiveSymbolRelationExamples:1,restrictiveSymbolRelationExamples:1,
 nearMissesRejected:near.length,forgedGraphRejected:true,
 approvedFullCharts:0,billableCalls:0,productionChanged:false
}));
console.log('PASS two different classical chapter-11 evidence relations are verified on real calendar dates and never promoted to paid content');
