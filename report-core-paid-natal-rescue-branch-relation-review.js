'use strict';
// QA-only, strictly bounded Chapter 9 "seal appearing to protect officer"
// conditional. Branch pair/group TABLE membership is an additional unresolved
// condition; it never establishes a realised combination, a broken pattern,
// life outcome, or that protection succeeded/failed.
const rescue=require('./report-core-paid-natal-classical-rescue-priority');
const branch=require('./report-branch-relations');
const reader=require('./report-reader-policy');
const P=['year','month','day','hour'];
const sourceUrl='https://donglishuzhai.net/chapter/3722.html';
const edited={
 '壬戌':{
  label:'같은 완화 조건에도 다른 자리의 관계가 겹칠 때',
  text:'태어난 달의 규칙을 뜻하는 글자, 이를 제약하는 표현의 글자, 그리고 그 제약을 완화할 수 있는 글자가 겉에 확인됩니다. 해와 달의 같은 두 자리에도 관계 이름이 두 개 붙으며, 태어난 날과 달의 같은 두 자리에도 다른 관계 이름이 두 개 붙습니다. 하나의 자리 쌍에 여러 이름이 붙었다고 사건이 여러 개 발생한다는 뜻은 아닙니다. 따라서 고전의 완화 조건이 실제로 어떻게 작용할지는 여기서 결정하지 않습니다. 예를 들어 기존 작업 지침을 바꿔야 할 때는 개선할 부분을 살피면서도 승인 기준을 확인할 수 있습니다. 이는 상징을 비교하는 가상의 상황이며, 실제 갈등이나 완화의 성공을 뜻하지 않습니다.'
 },
 '壬申':{
  label:'완화 글자가 보여도 해와 달의 관계가 남을 때',
  text:'규칙을 뜻하는 글자, 이를 제약하는 표현의 글자, 그리고 그 제약을 완화할 수 있는 글자가 겉에 함께 확인됩니다. 해와 달 사이에는 두 개의 관계 이름이 기록되지만, 태어난 날과 달 사이에는 같은 관계표의 별도 항목이 확인되지 않습니다. 다른 자리의 관계가 적다고 해서 완화의 효과가 더 강하다고 정할 수는 없습니다. 예를 들어 새로운 작업 방법을 검토할 때는 개선할 점과 지킬 승인 기준을 나란히 놓아 볼 수 있습니다. 이 예시는 전통 상징의 비교이지 실제 판단력이나 성공을 확인한 결과가 아닙니다.'
 },
 '壬午':{
  label:'완화 글자와 서로 다른 자리 관계를 함께 볼 때',
  text:'규칙을 뜻하는 글자, 이를 제약하는 표현의 글자, 그리고 그 제약을 완화할 수 있는 글자가 겉에 함께 확인됩니다. 해와 달 사이에는 두 관계 이름이 기록되며, 태어난 날과 달은 묶이는 관계로 별도 기록됩니다. 두 관계의 이름이 다르다는 사실만으로 어느 쪽이 더 중요하거나 완화의 효과가 커진다고 판단하지 않습니다. 예를 들어 새 작업 방식을 시험한다면 개선할 항목과 그대로 지켜야 할 승인 기준을 구분해 볼 수 있습니다. 실제로 두 관계가 어떤 방식으로 작용하는지와 업무 결과는 이 계산만으로 확인할 수 없습니다.'
 }
};
function audit(packet){
 if(packet?.status!=='ready'||!packet.chart?.hour)
  throw Error('QA_RESCUE_BRANCH_COMPLETE_CHART_REQUIRED');
 const existing=rescue.evaluate(packet);
 const pairs=branch.natal(packet.chart);
 if(JSON.stringify(pairs)!==JSON.stringify(packet.facts?.natalBranchRelations))
  throw Error('QA_RESCUE_BRANCH_RELATION_SOURCE_DIVERGED');
 const contact=pairs.pairs.filter(row=>
  row.positions.includes('month')).map(row=>({
   type:row.type,positions:row.positions.slice(),branches:row.branches,
   sourceRef:'facts.natalBranchRelations',tableOnly:true,
   realisedEffect:'not-assessed'
  }));
 const groups=pairs.groups.filter(row=>row.positions.includes('month'))
  .map(row=>({type:row.type,positions:row.positions.slice(),
   branches:row.branches,sourceRef:'facts.natalBranchRelations',
   membershipOnly:true,transformation:'not-assessed'}));
 const monthYear=contact.filter(x=>x.positions.includes('year'));
 const monthDay=contact.filter(x=>x.positions.includes('day'));
 const monthHour=contact.filter(x=>x.positions.includes('hour'));
 const monthRelationLabelCounts={
  year:monthYear.length,day:monthDay.length,hour:monthHour.length
 };
 // A pair with multiple traditional TABLE labels is one positional
 // observation, never two separate contacts or real-world incidents.
 const monthContacts={
  year:Number(monthYear.length>0),
  day:Number(monthDay.length>0),
  hour:Number(monthHour.length>0)
 };
 const uniqueMonthContactPairs=Object.values(monthContacts)
  .reduce((count,present)=>count+present,0);
 if(uniqueMonthContactPairs!==new Set(contact.map(x=>
    x.positions.slice().sort().join('/'))).size)
  throw Error('QA_RESCUE_BRANCH_DUPLICATE_POSITIONAL_CONTACT_DRIFT');
 const fullSameVisible=packet.chart.year==='辛丑'&&
  packet.chart.month==='乙未'&&packet.chart.hour==='己酉'&&
  ['壬戌','壬申','壬午'].includes(packet.chart.day);
 const draft=fullSameVisible?edited[packet.chart.day]:null;
 if(draft&&(
   existing.match!==true||
   existing.assessment!=='candidate-rescue-condition-visible'||
   existing.observed.independentlyProvenProtectionIds.join()!=='natal.year.stem'||
   JSON.stringify(monthYear.map(x=>x.type))!==JSON.stringify(['충','형'])||
   JSON.stringify(monthDay.map(row=>row.type))!==JSON.stringify(
    packet.chart.day==='壬戌'?['형','파']:
    packet.chart.day==='壬午'?['육합']:[])||
   monthHour.length!==0||groups.length!==0))
  throw Error('QA_RESCUE_BRANCH_EDITORIAL_CHART_CONDITION_DRIFT');
 if(draft&&(reader.errors([draft.label,draft.text]).length||
    /[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]/.test(
      draft.label+draft.text)||/[?？]\s*$/.test(draft.text)))
  throw Error('QA_RESCUE_BRANCH_EDITORIAL_LANGUAGE_DRIFT');
 return {
  kind:'qa-chapter9-rescue-branch-relation-comparison-v1',
  chartFingerprint:P.map(p=>packet.chart[p]).join('/'),
  rescueVisible:existing.match&&
   existing.assessment==='candidate-rescue-condition-visible',
  rescueEvidence:existing.match?{
   assessment:existing.assessment,
   protectionIds:existing.observed.independentlyProvenProtectionIds.slice(),
   sourceUrl:existing.source.url}:null,
  monthBranchPairs:contact,monthBranchGroups:groups,
  monthContacts,monthRelationLabelCounts,uniqueMonthContactPairs,
  overlappingLabelsAreNotSeparateIncidents:true,
  // The source gives table membership, not active combinations, relative
  // strength or whether protection prevails over a branch relation.
  conditionalDecisionPath:{
   kind:'qa-chapter9-review-order-no-automatic-verdict-v1',
   checks:[
    {stage:'monthly-role-and-obstruction',result:existing.match?
      'literal-condition-present':'literal-condition-not-matched',
     refs:['natal.month.hidden.己','natal.month.stem','natal.hour.stem',
      'facts.stemConnections']},
    {stage:'visible-counteracting-role',
     result:existing.match?existing.assessment:'not-assessed',
     refs:existing.match?['natal.year.stem','facts.stemConnections']:[]},
    {stage:'month-linked-branch-table',
     result:uniqueMonthContactPairs?
      'distinct-position-pairs-found-effects-undetermined':
      'no-pair-found-not-evidence-of-success',
     uniquePositionalPairs:uniqueMonthContactPairs,
     relationTableLabels:contact.length,
     refs:['facts.natalBranchRelations']},
    {stage:'traditional-priority-and-actual-effect',
     result:'unverified-requires-independent-method-review',
     refs:['facts.natalBranchRelations','facts.stemConnections']}
   ],
   methodPrioritySelected:false,
   inferredProtectionSuccess:false,
   inferredDestinyOrPersonality:false,
   paidReaderApproval:false,
   fullChartVerdict:'blocked-pending-method-review'
  },
  textualMethodScope:'officer-output-seal-example-only',
  branchPairsAreOnlyTableMembership:true,
  branchCombinationRealised:false,
  rescueEffectVerified:false,
  anyPairDominant:false,
  changedBranchesMayChangeReviewButNotProveOutcome:true,
  readerDraft:draft?{
   kind:'qa-case-specific-branch-sensitive-rescue-editorial-v1',
   label:draft.label,text:draft.text,
   sourceRefs:['natal.year.stem','natal.month.stem','natal.day.stem',
    'natal.hour.stem','natal.month.hidden.己',
    'facts.stemConnections','facts.natalBranchRelations'],
   sourceUrl,
   professionallyReviewed:false,lifeOutcomePredicted:false,
   approvedForPaid:false
  }:null,
  fullTraditionalPatternConfirmed:false,
  providerCalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={audit};
