'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const guidance=require('./report-analysis-guidance');
const bridge=require('./report-paid-annual-day-context');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const schema=require('./report-schema.json');
const relations=require('./report-branch-relations');
const coverage=require('./report-product-coverage');
const groups={ 'separate-chapter':0,'secondary-table-only':0,'no-direct-day-table':0 };
let checked=0,verifiedSecondary=null;
for(const year of [1978,1982,1986,1990,1994,1998,2002,2006])
for(const month of [2,5,8,11])for(const day of [7,21])
for(const hour of ['08:20','20:20']){
 const input={calendar:'solar',
  birthDate:year+'-'+String(month).padStart(2,'0')+'-'+String(day).padStart(2,'0'),
  birthTime:hour,gender:'female',mbti:'ENTJ'};
 const packet=facts.build(input,2027);
 assert.equal(packet.status,'ready');
 const p=bridge.build(packet);
 assert(p);
 const expected=relations.pairRelations(packet.chart.day[1],packet.targetYear.pillar[1]);
 assert.deepEqual([...p.primary,...p.secondary].sort(),expected.sort());
 assert.equal(p.dayBranch,packet.chart.day[1]);
 assert.equal(p.yearBranch,packet.targetYear.pillar[1]);
 assert.equal(p.additionalPaidTopic,false);
 assert.equal(p.personalRelationshipOutcomeObserved,false);
 groups[p.mode]++;
 const preview=coverage.calculate(input);
 const relationChapter=preview.estimate.chapters.find(x=>x.id==='year_2027_relationship');
 assert.equal(relationChapter.includedInPlan,p.mode==='separate-chapter',
  'any pair requiring a separate annual relationship chapter cannot be sold again as a general interpretation');
 const plan=guidance.preflight(packet);
 const prompt={stage:'body',facts:packet,requestedSections:['year_2027'],
  analysisGuidance:{...guidance.forRequest(['year_2027'],packet.person.mbti),
   editorialBlueprint:plan},
  rules:{sectionGoals:require('./report-prompt').sectionGoals},priorSections:[]};
 const payload=writer.compile(prompt);
 assert.deepEqual(payload.task.chapters.year_2027.topics.impact.sourceOwnedAnnualDayContext,p);
 const strict=writer.schema(prompt,wire.schemaFor(prompt,schema));
 const slot=strict.properties.chapters.properties.year_2027
  .properties.paragraphs.properties.impact;
 const obj=slot.anyOf?.find(x=>x.type==='object')||slot;
 assert(obj.properties.text.description.includes(p.readerBoundary));
 const refs=obj.properties.basis.properties.refs.items.enum;
 if(p.mode==='secondary-table-only'){
  assert.equal(p.sourceRef,'facts.targetYearBranchContext.annualContext.day');
  assert(refs.includes(p.sourceRef));
  assert.deepEqual(obj.properties.basis.properties.condition.enum,[p.computedCondition]);
  if(!verifiedSecondary)verifiedSecondary={prompt,proof:p};
 }else{
  assert.equal(p.sourceRef,null);
  assert(!refs.includes('facts.targetYearBranchContext.annualContext.day'),
   'a separately priced direct pair or nonexistent pair must never leak as a new annual general topic');
 }
 checked++;
}
assert.equal(checked,128);
assert(Object.values(groups).every(n=>n>0),'all three calculated day-pair states must be exercised');
const {prompt,proof}=verifiedSecondary;
const good={label:'2027년의 출생일 관계표',text:
 '2027년 지지와 태어난 날의 지지에서 부수적인 관계표 한 쌍이 계산됩니다. 이는 실제 인간관계의 갈등이나 결혼의 변화를 예측하는 결과가 아닙니다.',
 basis:{refs:['facts.targetYearBranchContext.annualContext.day'],
  interpretation:'같은 출생일과 2027년 지지 사이에 부수 관계가 존재합니다.',
  condition:proof.computedCondition,
  limit:'충·육합이나 실제 인물 사이 사건을 측정하지 않았습니다.'}};
const reply=x=>({chapters:{year_2027:{paragraphs:{impact:x}}}});
const restored=writer.restoreEvidence(reply(good),prompt);
assert.deepEqual(require('./report-source-ledger').usedPaths({
 evidence:restored.chapters.year_2027.evidence},'impact'),
 ['facts.targetYearBranchContext.annualContext.day'],
 'actual paid response must retain positional source provenance');
const noRef=structuredClone(good);noRef.basis.refs=['facts.annualTenGods'];
assert.throws(()=>writer.restoreEvidence(reply(noRef),prompt),
 /general day relation lacks verified scope/);
const fakeCondition=structuredClone(good);fakeCondition.basis.condition='인간관계가 잘 풀립니다.';
assert.throws(()=>writer.restoreEvidence(reply(fakeCondition),prompt),
 /general day relation lacks verified scope/);
const tampered=structuredClone(prompt);
tampered.facts.facts.targetYearBranchContext.annualContext.day.directTypes=['육합'];
assert.throws(()=>bridge.build(tampered.facts),
 /PAID_ANNUAL_DAY_CONTEXT_NOT_RECALCULATED/);
assert.deepEqual(good.basis.refs,['facts.targetYearBranchContext.annualContext.day']);
console.log('PASS QA18 real annual day-pair integration: '+checked+
 ' real charts; '+JSON.stringify(groups)+
 ', restored exact source and server-locked condition; no extra chapter, API or payment');
