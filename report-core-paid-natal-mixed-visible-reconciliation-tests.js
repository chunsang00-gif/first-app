'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const mixed=require('./report-core-paid-natal-mixed-visible-reconciliation');
const conflicts=require('./report-core-paid-natal-conflict-abstention');
const core=require('./report-core-knowledge-engine');
const coverage=require('./report-core-knowledge-coverage');
const policy=require('./report-reader-policy');
const make=(date,time)=>facts.build({calendar:'solar',birthDate:date,
 birthTime:time,gender:'male',mbti:'ISFP'},2027);
const selected=make('2023-07-13','10:20');
assert.deepEqual(selected.chart,{year:'癸卯',month:'己未',
 day:'壬申',hour:'乙巳'});
const r=mixed.review(selected);
assert.equal(r.kind,'qa-three-visible-mixed-elemental-relations-v1');
assert.equal(r.mixed,true);
assert.deepEqual(r.counts,{generating:1,restricting:2,sameElement:0});
assert.equal(r.sourceRefs.length,4);
assert.deepEqual(r.edges.map(x=>x.elementalDirection),[
 'right-controls-left','left-generates-right','right-controls-left']);
assert.deepEqual(r.edges.map(x=>[x.from,x.to]),[
 ['natal.year.stem','natal.month.stem'],
 ['natal.year.stem','natal.hour.stem'],
 ['natal.month.stem','natal.hour.stem']]);
assert(r.edges.every(x=>x.relativePriority==='not-assessed'&&
 x.realizedInfluence==='not-assessed'));
assert.equal(r.matchedRestrictiveClassicalSourceId,
 'ren-wei-yi-ji-output-opposes-authority');
assert.equal(r.noWinnerChosen,true);
assert.equal(r.notOffsettingForces,true);
assert.equal(r.strengthOrPracticalEffectInferred,false);
assert.equal(r.finalTraditionalPattern,null);
assert.equal(r.customerReady,false);
const manuscript=r.combinedReaderDraft;
assert(manuscript);
assert.equal(manuscript.kind,'qa-exact-chart-hand-edited-hypothesis-v1');
assert(manuscript.text.length>=350&&manuscript.text.length<=650);
assert.deepEqual(policy.errors([manuscript.label,manuscript.text]),[]);
assert(manuscript.text.includes('해의 글자는 시간의 글자를 돕는 관계'));
assert(manuscript.text.includes('시간의 글자는 달의 글자를 제약하는 관계'));
assert(manuscript.text.includes('달의 글자도 해의 글자를 제약'));
assert(manuscript.text.includes('서로 상쇄되거나 한쪽이 더 강하다고 판단하지 않습니다'));
assert(manuscript.text.includes('예를 들어'));
assert(manuscript.text.includes('승인 기준과 안전 규정을 확인'));
assert(manuscript.text.includes('성격이나 협업 능력 또는 미래의 업무 성과'));
assert.equal(manuscript.publishedRelationCoversAllThreePairs,false);
assert.equal(manuscript.scenarioIsHypothetical,true);
assert.equal(manuscript.claimOfRealPersonality,false);
assert.equal(manuscript.humanMethodReviewed,false);
assert.equal(manuscript.readerValueValidated,false);
assert.equal(manuscript.releaseVerdict,'not-approved');
assert.equal(manuscript.sourceRefs.length,new Set(manuscript.sourceRefs).size);
assert(manuscript.sourceRefs.includes('facts.natalBranchRelations'));
assert(manuscript.sourceRefs.includes('natal.day.stem'));
const x=conflicts.inspect(selected);
assert.equal(x.conclusion,'abstain-from-full-chart-interpretation');
assert.equal(x.downstreamPaidApproval,false);
assert.equal(x.visibleMixedDirectionReview.mixed,true);
assert.equal(x.visibleMixedDirectionReview.candidateForEditorialReviewOnly,true);
assert.equal(x.visibleMixedDirectionReview.anyPaidCopyApproved,false);
const flagged=x.findings.find(x=>x.id===
 'visible-generating-and-controlling-pairs-coexist');
assert(flagged);
assert.equal(flagged.observed.noDominantArrowCalculated,true);
assert.deepEqual(flagged.sourceRefs,r.sourceRefs);
assert.equal(flagged.observed.individualPairs.length,3);
assert(flagged.observed.individualPairs.every(x=>x.relativePriority==='not-assessed'));
const coreDraft=core.compile(selected);
assert.equal(coreDraft.releaseVerdict,'not-approved');
assert(!JSON.stringify(coreDraft).includes(manuscript.text),
 'offline editorial draft must never become production core content');
const pure=make('2023-08-18','19:20');
const only=mixed.review(pure);
assert.deepEqual(pure.chart,{year:'癸卯',month:'庚申',
 day:'戊申',hour:'壬戌'});
assert.equal(only.mixed,false);
assert.equal(only.counts.restricting,0);
assert.equal(only.combinedReaderDraft,null);
assert.equal(conflicts.inspect(pure).visibleMixedDirectionReview.mixed,false);
const changedTime=make('2023-07-13','14:20');
assert.notEqual(changedTime.chart.hour,selected.chart.hour);
const variant=mixed.review(changedTime);
assert.equal(variant.combinedReaderDraft,null);
assert.notDeepEqual(variant.edges,r.edges);
const forged=structuredClone(selected);
forged.facts.tenGods.hour.stemTenGod='정재';
assert.throws(()=>mixed.review(forged),
 /QA_MIXED_VISIBLE_SOURCE_DRIFT:natal.hour.stem|QA_CLASSICAL_CH11_ROLE_OR_RELATION_DIVERGED/);
const falsified=structuredClone(selected);
falsified.facts.stemConnections.exposure=[];
assert.throws(()=>mixed.review(falsified),
 /QA_MONTH_METHOD_CALCULATION_DIVERGED:stem-connections/);
const summary={total:0,mixed:0,nonmixed:0,withEditorialDraft:0};
for(const input of coverage.representativeInputs()){
 const packet=facts.build(input,2027),result=mixed.review(packet);
 assert.equal(result.releaseVerdict,'not-approved');
 assert.equal(result.customerReady,false);
 assert.equal(result.finalTraditionalPattern,null);
 assert.equal(result.noWinnerChosen,true);
 assert.equal(result.notOffsettingForces,true);
 assert.equal(result.edges.length,3);
 assert.equal(result.counts.generating+result.counts.restricting+
  result.counts.sameElement,3);
 assert.equal(result.mixed,
  result.counts.generating>0&&result.counts.restricting>0);
 assert.equal(result.combinedReaderDraft,null,
  'no editorial narrative for a non-reviewed representative chart');
 const c=conflicts.inspect(packet);
 assert.equal(c.visibleMixedDirectionReview.mixed,result.mixed);
 assert.equal(c.visibleMixedDirectionReview
  .candidateForEditorialReviewOnly,false);
 assert.equal(c.downstreamPaidApproval,false);
 summary.total++;
 summary[result.mixed?'mixed':'nonmixed']++;
}
assert.equal(summary.total,99);
assert(summary.mixed>0&&summary.nonmixed>0);
console.log('QA_SAME_CHART_MIXED_VISIBLE_REVIEW='+JSON.stringify({
 specificChart:selected.chart,
 supportPairs:1,controlPairs:2,reviewedEditorialDraftCount:1,
 hourChangedAndTextWithheld:true,
 separateHomogeneousChart:{...only.counts},
 qaCoverage:summary,forgedTenGodRejected:true,
 forgedStemConnectionRejected:true,
 selectedTraditionalPatterns:0,paidCalls:0
}));
console.log('PASS conditional three-direction reconciliation is correctly source-bound, chart-specific and never sent to the provider');
