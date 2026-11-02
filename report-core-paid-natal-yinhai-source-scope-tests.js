'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const source=require('./report-core-paid-natal-yinhai-source-scope');
const classical=require('./report-core-paid-natal-classical-yin-example');
const create=(date,time='14:20')=>facts.build({
 calendar:'solar',birthDate:date,birthTime:time,
 gender:'male',mbti:'ISFP'
},2027);
const match=create('2024-02-17');
assert.equal(match.status,'ready');
assert.equal(match.chart.month[1],'寅');
assert.equal(match.chart.day[1],'亥');
const v=source.build(match);
assert.equal(v.kind,'source-scoped-adjacent-yinhai-liuhe-v1');
assert.equal(v.originalWork,'命理約言');
assert.equal(v.originalChapter,'支六合論');
assert.equal(v.sourceUrl,source.SOURCE);
assert.equal(v.originalPhrase,'皆須二字緊貼方取');
assert.equal(v.discussedTradition,'bazi-natal-branch-liuhe');
assert.deepEqual(v.positions,['month','day']);
assert.deepEqual(new Set(v.tableLabels),new Set(['육합','파']));
assert.equal(v.tableLabelCount,2);
assert.equal(v.independentContactCount,1);
assert.equal(v.adjacencyVerified,true);
assert.equal(v.liuheTextualConditionSatisfied,true);
assert.equal(v.poLabelPresent,true);
assert.equal(v.poRuleSourcedByThisPassage,false);
assert.equal(v.relativeLiuhePoPriority,'not-established');
assert.equal(v.combinationRealized,false);
assert.equal(v.destructionRealized,false);
assert.equal(v.transformationOrOutcomeConfirmed,false);
assert.equal(v.solePriorityClaimAllowed,false);
assert.equal(v.fullNatalConclusionAllowed,false);
assert.equal(v.humanTraditionalReviewComplete,false);
assert.equal(v.approvedForPaid,false);
assert.equal(v.releaseVerdict,'not-approved');
assert.equal(v.providerCalls,0);
assert.equal(v.methodSourceBoundary.otherSystem,'liu-ren-divination-not-bazi');
assert.equal(v.methodSourceBoundary.otherSourceUrl,source.OTHER_SYSTEM);
assert.equal(v.methodSourceBoundary.itsYinHaiInterpretationAllowedForNatal,false);
assert(!v.readerText.includes('합이 이겼')&&!v.readerText.includes('파가 이겼')&&
 !v.readerText.includes('반드시 불행')&&
 v.readerText.includes('우세한지는 정하지 않습니다'));
const good=classical.offlineReaderCandidate(match);
assert.equal(good.monthDayPairContext.exactClassicalSourceScope.kind,v.kind);
assert.deepEqual(good.monthDayPairContext.exactClassicalSourceScope,v);
assert(good.text.includes(v.readerText));
assert(good.sourceRefs.includes('facts.natalBranchRelations'));
assert(!/(?:직장|직업|소득|장비|납품|결혼|이별)/.test(good.text));
for(const date of ['2024-02-15','2024-03-17','1989-02-10']){
 const p=create(date);
 assert.equal(p.status,'ready');
 assert.equal(source.build(p),null,
  'a different day/month pair cannot inherit the adjacent Yin-Hai clause');
}
const differentHour=create('2024-02-17','20:20');
assert(source.build(differentHour),
 'a branch adjacency fact remains true after the visible hour changes');
assert.equal(classical.offlineReaderCandidate(differentHour),null,
 'an hour exposing third month symbol still prohibits the narrow reader text');
const tampered=structuredClone(match);
tampered.facts.natalBranchRelations.pairs=
 tampered.facts.natalBranchRelations.pairs.filter(x=>
  !(x.positions.includes('month')&&x.positions.includes('day')&&
    x.type==='파'));
assert.throws(()=>source.build(tampered),
 /QA_MONTH_METHOD_CALCULATION_DIVERGED:branch-relations/);
const forged=structuredClone(match);
forged.facts.natalBranchRelations.pairs.push({
 type:'육합',branches:'寅亥',positions:['month','day'],
 evidenceType:'pair-table',transformation:'not-assessed'
});
assert.throws(()=>source.build(forged),
 /QA_MONTH_METHOD_CALCULATION_DIVERGED:branch-relations/);
console.log('PASS adjacent Yin-Hai is textually eligible under Bazi source, two labels remain one contact, no cross-divination priority or paid approval');
