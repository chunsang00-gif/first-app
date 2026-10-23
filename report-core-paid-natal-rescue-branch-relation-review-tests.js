'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const rescued=require('./report-core-paid-natal-classical-rescue-priority');
const branch=require('./report-core-paid-natal-rescue-branch-relation-review');
const conflicts=require('./report-core-paid-natal-conflict-abstention');
const core=require('./report-core-knowledge-engine');
const policy=require('./report-reader-policy');
const {readerCompare}=require('./report-core-paid-natal-counterfactual-audit');
const make=date=>facts.build({calendar:'solar',birthDate:date,
 birthTime:'18:20',gender:'male',mbti:'ISFP'},2027);
const cases=[
 {date:'2021-07-13',day:'壬戌',other:['형','파'],contacts:4,pairs:2,
  title:'규칙을 바꿔 보고 싶은 마음과 약속을 함께 살필 때'},
 {date:'2021-07-23',day:'壬申',other:[],contacts:2,pairs:1,
  title:'새로운 놀이를 떠올릴 때 지켜야 할 약속'},
 {date:'2021-08-02',day:'壬午',other:['육합'],contacts:3,pairs:2,
  title:'함께 정한 규칙을 바꿔 보는 상황'}
];
const snapshots=[];
for(const x of cases){
 const p=make(x.date);
 assert.equal(p.status,'ready');
 assert.deepEqual(p.chart,{year:'辛丑',month:'乙未',
  day:x.day,hour:'己酉'});
 const rescue=rescued.evaluate(p);
 assert.equal(rescue.match,true);
 assert.equal(rescue.assessment,'candidate-rescue-condition-visible');
 assert.deepEqual(rescue.observed.independentlyProvenProtectionIds,
  ['natal.year.stem']);
 const q=branch.audit(p);
 assert.equal(q.kind,'qa-chapter9-rescue-branch-relation-comparison-v1');
 assert.equal(q.rescueVisible,true);
 assert.equal(q.monthBranchPairs.length,x.contacts);
 assert.deepEqual(q.monthBranchPairs.filter(v=>v.positions.includes('year'))
  .map(v=>v.type),['충','형']);
 assert.deepEqual(q.monthBranchPairs.filter(v=>v.positions.includes('day'))
  .map(v=>v.type),x.other);
 assert.equal(q.monthContacts.day,Number(x.other.length>0));
 assert.equal(q.monthContacts.year,1);
 assert.deepEqual(q.monthRelationLabelCounts,{
  year:2,day:x.other.length,hour:0
 });
 assert.equal(q.monthContacts.hour,0);
 assert.equal(q.uniqueMonthContactPairs,x.pairs);
 assert.equal(q.overlappingLabelsAreNotSeparateIncidents,true);
 const decision=q.conditionalDecisionPath;
 assert.equal(decision.kind,'qa-chapter9-review-order-no-automatic-verdict-v1');
 assert.equal(decision.checks.length,4);
 assert.deepEqual(decision.checks.map(x=>x.stage),[
  'monthly-role-and-obstruction',
  'visible-counteracting-role',
  'month-linked-branch-table',
  'traditional-priority-and-actual-effect'
 ]);
 assert.equal(decision.checks[0].result,'literal-condition-present');
 assert.equal(decision.checks[1].result,'candidate-rescue-condition-visible');
 assert.equal(decision.checks[2].uniquePositionalPairs,x.pairs);
 assert.equal(decision.checks[2].relationTableLabels,x.contacts);
 assert.equal(decision.checks[2].result,
  'distinct-position-pairs-found-effects-undetermined');
 assert.equal(decision.checks[3].result,
  'unverified-requires-independent-method-review');
 assert.equal(decision.methodPrioritySelected,false);
 assert.equal(decision.inferredProtectionSuccess,false);
 assert.equal(decision.inferredDestinyOrPersonality,false);
 assert.equal(decision.paidReaderApproval,false);
 assert.equal(decision.fullChartVerdict,'blocked-pending-method-review');
 assert(decision.checks.every(x=>Array.isArray(x.refs)&&x.refs.length>0));
 assert.equal(q.monthBranchGroups.length,0);
 assert(q.monthBranchPairs.every(y=>y.tableOnly===true&&
  y.realisedEffect==='not-assessed'&&
  y.sourceRef==='facts.natalBranchRelations'));
 assert.equal(q.branchPairsAreOnlyTableMembership,true);
 if(x.day==='壬戌'){
  assert.equal(new Set(q.monthBranchPairs.filter(v=>v.positions.includes('day'))
   .map(v=>v.positions.join('/'))).size,1,
   'two labels on same month/day pair must not count as two separate life events');
  assert(q.readerDraft.text.includes('관계 이름이 두 개 붙습니다'));
 }
 assert.equal(q.branchCombinationRealised,false);
 assert.equal(q.rescueEffectVerified,false);
 assert.equal(q.anyPairDominant,false);
 assert.equal(q.changedBranchesMayChangeReviewButNotProveOutcome,true);
 assert.equal(q.fullTraditionalPatternConfirmed,false);
 assert.equal(q.providerCalls,0);
 assert.equal(q.releaseVerdict,'not-approved');
 const draft=q.readerDraft;
 assert(draft);
 assert.equal(draft.kind,
  'qa-case-specific-branch-sensitive-rescue-editorial-v1');
 assert.equal(draft.label,x.title);
 assert(draft.text.length>190&&draft.text.length<600);
 assert.deepEqual(policy.errors([draft.label,draft.text]),[]);
 assert.equal(draft.audience,'child-and-caregiver');
 assert.equal(draft.ageAtTargetYear,6);
 assert.equal(draft.ageAppropriateExampleOnly,true);
 assert(/아이|보호자|놀이/.test(draft.text));
 assert(!/회사|직장|업무|직책|급여|인사평가|작업 지침/.test(draft.text));
 assert.equal(draft.professionallyReviewed,false);
 assert.equal(draft.approvedForPaid,false);
 assert.equal(draft.lifeOutcomePredicted,false);
 assert(draft.sourceRefs.includes('facts.natalBranchRelations'));
 assert(draft.sourceRefs.includes('facts.stemConnections'));
 assert(draft.text.includes('실제')||draft.text.includes('가상'));
 const conflict=conflicts.inspect(p);
 assert.deepEqual(conflict.rescueBranchContext.monthContacts,q.monthContacts);
 assert.deepEqual(conflict.rescueBranchContext.monthRelationLabelCounts,
  q.monthRelationLabelCounts);
 assert.equal(conflict.rescueBranchContext.uniqueMonthContactPairs,x.pairs);
 assert.deepEqual(conflict.rescueBranchContext.conditionalDecisionPath,
  q.conditionalDecisionPath);
 const unresolved=conflict.findings.find(y=>y.id===
  'visible-rescue-and-unresolved-month-branch-relations-coexist');
 assert(unresolved);
 assert.equal(unresolved.observed.observedMonthPairCount,x.pairs);
 assert.equal(unresolved.observed.observedMonthRelationLabels,x.contacts);
 assert.equal(unresolved.observed.monthDayContacts,Number(x.other.length>0));
 assert.equal(unresolved.observed.monthDayTableLabels,x.other.length);
 assert.equal(conflict.rescueBranchContext
  .independentlyEditedExampleAvailable,true);
 assert.equal(conflict.rescueBranchContext.rescueEffectVerified,false);
 assert.equal(conflict.rescueBranchContext.anyDominantEffectChosen,false);
 assert.equal(conflict.rescueBranchContext.approvedForPaid,false);
 assert(conflict.findings.some(y=>y.id===
  'visible-rescue-and-unresolved-month-branch-relations-coexist'));
 assert.equal(conflict.downstreamPaidApproval,false);
 assert.equal(conflict.finalTraditionalPattern,null);
 const offline=core.compile(p);
 assert.equal(offline.releaseVerdict,'not-approved');
 assert(!JSON.stringify(offline).includes(draft.text));
 snapshots.push({packet:p,review:q,day:p.chart.day,
  monthTypes:q.monthBranchPairs.map(v=>v.type)});
}
const [first,second,third]=snapshots;
assert.equal(new Set(snapshots.map(x=>x.review.readerDraft.text)).size,3);
assert.deepEqual(snapshots.map(x=>x.monthTypes),[
 ['충','형','형','파'],['충','형'],['충','형','육합']]);
for(let i=0;i<snapshots.length;i++)
 for(let j=i+1;j<snapshots.length;j++){
  const a=snapshots[i],b=snapshots[j];
  assert.deepEqual(['year','month','hour'].map(p=>a.packet.chart[p]),
   ['year','month','hour'].map(p=>b.packet.chart[p]));
  assert.equal(a.packet.chart.day[0],b.packet.chart.day[0]);
  assert.notEqual(a.packet.chart.day[1],b.packet.chart.day[1]);
  assert.notDeepEqual(a.review.monthBranchPairs,b.review.monthBranchPairs);
  assert.notEqual(a.review.readerDraft.text,b.review.readerDraft.text);
  const comparison=readerCompare(a.packet,b.packet,
   a.review.readerDraft,b.review.readerDraft);
  assert(comparison.changedFacts.some(x=>x.key==='day-branch'));
  assert(comparison.changedFacts.some(x=>x.key==='month-branch-pair-table'));
  assert.equal(comparison.manuscriptApproved,false);
  assert.equal(comparison.eligibleForRelease,false);
 }
const changedHour=facts.build({calendar:'solar',birthDate:'2021-07-13',
 birthTime:'10:20',gender:'male',mbti:'ISFP'},2027);
const alt=branch.audit(changedHour);
assert.equal(alt.readerDraft,null);
const spoofedAdult=structuredClone(first.packet);
spoofedAdult.calculationInput.birthDate='1961-07-13';
assert.equal(branch.audit(spoofedAdult).readerDraft,null,
 'a matching 60-year-cycle chart must not receive a young child example');
const unsupportedTarget=structuredClone(first.packet);
unsupportedTarget.targetYear={year:2040,pillar:first.packet.targetYear.pillar};
assert.equal(branch.audit(unsupportedTarget).readerDraft,null,
 'a grown-up at the target year cannot receive a childhood example');
assert.equal(alt.providerCalls,0);
const tampered=structuredClone(first.packet);
tampered.facts.natalBranchRelations.pairs=[];
assert.throws(()=>branch.audit(tampered),
 /QA_MONTH_METHOD_CALCULATION_DIVERGED:branch-relations|QA_RESCUE_BRANCH_RELATION_SOURCE_DIVERGED/);
const badStem=structuredClone(first.packet);
badStem.facts.tenGods.year.stemTenGod='편재';
assert.throws(()=>branch.audit(badStem),
 /QA_CLASSICAL_RESCUE_VISIBLE_PROVENANCE:natal.year.stem/);
const other=facts.build({calendar:'solar',birthDate:'2023-07-13',
 birthTime:'10:20',gender:'male',mbti:'ISFP'},2027);
const notProtected=branch.audit(other);
assert.equal(notProtected.rescueVisible,false);
assert.equal(notProtected.readerDraft,null);
assert.equal(conflicts.inspect(other).rescueBranchContext,null);
console.log('QA_RESCUE_BRANCH_COUNTERFACTUAL='+JSON.stringify({
 sameVisibleYearMonthHour:true,
 sameVisibleTraditionalRescue:true,
 changedDayBranches:snapshots.map(x=>x.day),
 distinctMonthRelationTables:snapshots.map(x=>x.monthTypes),
 individualConditionalReaderDrafts:3,
 changedHourNoDraft:true,invalidBranchGraphRejected:true,
 forgedGodRejected:true,comparisonCount:3,
 realizedCombinations:0,approvedCharts:0,providerCalls:0}));
console.log('PASS same classical rescue stems with distinct day-branch tables yield distinct noncommercial editorial caution');
