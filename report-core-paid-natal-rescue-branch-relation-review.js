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
  label:'규칙을 바꿔 보고 싶은 마음과 약속을 함께 살필 때',
  text:'이 사주의 달에는 새로운 표현과 정해진 약속을 살피는 뜻이 함께 나타납니다. 해의 글자는 표현의 글자를 제약하는 관계라, 고전에서는 이를 앞선 충돌을 완화할 수 있는 조건으로 다룹니다. 한편 해와 달의 같은 두 자리에도 관계 이름이 두 개 붙습니다. 날과 달의 같은 두 자리에도 다른 관계 이름이 두 개 붙습니다. 이름이 여러 개라고 사건이 여러 번 일어난다는 뜻은 아닙니다. 놀이 규칙을 바꿔 보자는 이야기가 나왔다고 가정하면, 보호자가 아이의 생각을 듣되 안전을 위해 지켜야 할 약속은 분명히 하는 장면으로 비유할 수 있습니다. 새로운 생각을 모두 막는 것도, 약속 없이 바꾸는 것도 이 예시의 목적은 아닙니다. 실제 아이가 규칙을 얼마나 잘 지키는지나 갈등을 겪는지는 이 계산만으로 알 수 없습니다.'
 },
 '壬申':{
  label:'새로운 놀이를 떠올릴 때 지켜야 할 약속',
  text:'태어난 달에는 표현하려는 뜻과 정해진 약속을 살피는 뜻이 함께 계산됩니다. 해의 글자는 표현의 글자를 제약하는 관계여서, 고전에서는 앞선 관계를 완화할 수 있는 조건으로 설명합니다. 해와 달의 같은 두 자리에는 관계 이름이 두 개 붙지만, 날과 달 사이에는 이 관계표의 별도 항목이 확인되지 않습니다. 관계 이름이 적다고 완화가 더 강하다는 뜻은 아닙니다. 예를 들어 아이가 블록 놀이에 새 규칙을 더하자고 한다면 보호자가 제안을 들어 보고, 함께 쓰는 물건을 안전하게 다루는 약속을 확인하는 장면을 떠올릴 수 있습니다. 이는 상징을 이해하기 위한 비유이며, 실제 아이의 성격이나 행동을 확인한 결과는 아닙니다.'
 },
 '壬午':{
  label:'함께 정한 규칙을 바꿔 보는 상황',
  text:'이 사주에는 새로운 표현을 뜻하는 글자와 규칙을 살피는 글자가 함께 나타나며, 태어난 해에는 표현의 글자를 제약하는 뜻도 확인됩니다. 해와 달의 같은 두 자리에는 관계 이름이 두 개 붙고, 날과 달에는 서로 묶이는 관계가 따로 기록됩니다. 이 둘의 이름이 다르다고 어느 쪽이 더 강하다거나 아이가 남들과 더 잘 어울린다고 판단할 수는 없습니다. 놀이 순서를 바꾸자는 아이디어가 나왔다고 가정한다면, 보호자가 새로운 방식을 짧게 시도하되 친구와 미리 정한 안전 약속은 함께 확인하는 상황으로 설명할 수 있습니다. 실제 또래 관계나 놀이 습관을 예측하는 풀이가 아니며, 다른 자리의 관계가 어떻게 작용할지는 아직 검증되지 않았습니다.'
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
 // These three chart-identical samples were authored specifically for
 // young children. A matching natal chart from another 60-year cycle is
 // NOT permission to give an adult an early-childhood reading.
 const birthYear=Number(String(packet.calculationInput?.birthDate||'').slice(0,4));
 const reportYear=packet.targetYear?.year;
 const age=Number.isInteger(birthYear)&&Number.isInteger(reportYear)?
  reportYear-birthYear:null;
 const schoolAgeAppropriate=age!==null&&age>=0&&age<13;
 const draft=fullSameVisible&&schoolAgeAppropriate?edited[packet.chart.day]:null;
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
   audience:'child-and-caregiver',ageAtTargetYear:age,
   ageAppropriateExampleOnly:true,
   professionallyReviewed:false,lifeOutcomePredicted:false,
   approvedForPaid:false
  }:null,
  fullTraditionalPatternConfirmed:false,
  providerCalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={audit};
