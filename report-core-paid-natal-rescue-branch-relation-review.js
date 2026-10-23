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
  text:'태어난 달의 규칙을 뜻하는 글자, 이를 제약하는 표현의 글자, 그리고 그 제약을 완화할 수 있는 글자가 겉에 확인됩니다. 여기에 해와 달이 서로 마주보는 관계뿐 아니라, 태어난 날과 달 사이에 별도의 관계도 계산됩니다. 두 관계가 함께 나타나므로 해와 달만 보고 이 고전 사례의 결론을 정해서는 안 됩니다. 예를 들어 기존 작업 지침을 바꿔야 할 때는 개선할 부분을 살피면서도 승인 기준을 확인할 수 있습니다. 이는 상징을 비교하는 가상의 상황이며, 실제 갈등이나 완화의 성공을 뜻하지 않습니다.'
 },
 '壬申':{
  label:'완화 글자가 보여도 해와 달의 관계가 남을 때',
  text:'규칙을 뜻하는 글자, 이를 제약하는 표현의 글자, 그리고 그 제약을 완화할 수 있는 글자가 겉에 함께 확인됩니다. 해와 달 사이에는 서로 마주보는 관계가 기록되지만, 태어난 날과 달 사이에는 같은 관계표의 별도 항목이 확인되지 않습니다. 다른 자리의 관계가 적다고 해서 완화의 효과가 더 강하다고 정할 수는 없습니다. 예를 들어 새로운 작업 방법을 검토할 때는 개선할 점과 지킬 승인 기준을 나란히 놓아 볼 수 있습니다. 이 예시는 전통 상징의 비교이지 실제 판단력이나 성공을 확인한 결과가 아닙니다.'
 },
 '壬午':{
  label:'완화 글자와 서로 다른 자리 관계를 함께 볼 때',
  text:'규칙을 뜻하는 글자, 이를 제약하는 표현의 글자, 그리고 그 제약을 완화할 수 있는 글자가 겉에 함께 확인됩니다. 해와 달은 서로 마주보는 관계인 반면, 태어난 날과 달은 묶이는 관계로 별도 기록됩니다. 두 관계의 이름이 다르다는 사실만으로 어느 쪽이 더 중요하거나 완화의 효과가 커진다고 판단하지 않습니다. 예를 들어 새 작업 방식을 시험한다면 개선할 항목과 그대로 지켜야 할 승인 기준을 구분해 볼 수 있습니다. 실제로 두 관계가 어떤 방식으로 작용하는지와 업무 결과는 이 계산만으로 확인할 수 없습니다.'
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
 const fullSameVisible=packet.chart.year==='辛丑'&&
  packet.chart.month==='乙未'&&packet.chart.hour==='己酉'&&
  ['壬戌','壬申','壬午'].includes(packet.chart.day);
 const draft=fullSameVisible?edited[packet.chart.day]:null;
 if(draft&&(
   existing.match!==true||
   existing.assessment!=='candidate-rescue-condition-visible'||
   existing.observed.independentlyProvenProtectionIds.join()!=='natal.year.stem'||
   monthYear.length!==1||monthYear[0].type!=='충'||
   monthDay.length!==(packet.chart.day==='壬申'?0:1)||
   (packet.chart.day==='壬戌'&&monthDay[0].type!=='형')||
   (packet.chart.day==='壬午'&&monthDay[0].type!=='육합')||
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
  monthContacts:{year:monthYear.length,day:monthDay.length,
   hour:monthHour.length},
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
