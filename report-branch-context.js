'use strict';
// Position-first branch interpretation. Calculated pair/group membership is
// NOT a transformed element, settled favorable/unfavorable priority or proof
// of personal outcomes. Unresolved competing relations must remain visible.
const relations=require('./report-branch-relations');
const positions=['year','month','day','hour'];
const PRIMARY_PAIR_TYPES=new Set(['충','육합']);
const SECONDARY_PAIR_TYPES=new Set(['형','파','해']);
const directPairs=annual=>annual.pairs.filter(row=>row.between==='day');
function evaluate(chart,annualPillar){
 if(!chart?.month||!chart?.day||!annualPillar)
  throw Error('Birth month, birth day and yearly pillar required to review branch relations');
 const natal=relations.natal(chart);
 const yearly=relations.annual(chart,annualPillar);
 const monthBranch=chart.month[1],dayBranch=chart.day[1],yearBranch=annualPillar[1];
 const competingByPosition=Object.fromEntries(positions.filter(p=>chart[p]).map(position=>{
  const branch=chart[position][1];
  const contenders=[
   ...natal.pairs.filter(x=>x.positions.includes(position)).map(x=>({origin:'natal',type:x.type,branches:x.branches,positions:x.positions})),
   ...yearly.pairs.filter(x=>x.between===position).map(x=>({origin:'annual',type:x.type,branches:x.branches,positions:[position,'annual']})),
   ...natal.groups.filter(x=>x.positions.includes(position)).map(x=>({origin:'natal',type:x.type,branches:x.branches,positions:x.positions})),
   ...yearly.groups.filter(x=>x.positions.includes(position)).map(x=>({origin:'annual',type:x.type,branches:x.branches,positions:x.positions}))
  ];
  return [position,{branch,contenders,competing:contenders.length>1,
   priority:'unresolved',transformation:'not-assessed'}];
 }));
 const day=competingByPosition.day;
 const annualDay=directPairs(yearly);
 const main=annualDay.filter(r=>PRIMARY_PAIR_TYPES.has(r.type));
 const secondary=annualDay.filter(r=>SECONDARY_PAIR_TYPES.has(r.type));
 const dayCompeting=day.contenders.filter(c=>
   !(c.origin==='annual'&&c.positions.length===2&&
      annualDay.some(row=>row.type===c.type&&row.branches===c.branches)));
 const relevant=main.length>0;
 const comparison={
  dayBranch,annualBranch:yearBranch,
  directTypes:annualDay.map(p=>p.type),
  directPairs:annualDay,
  primaryEvidence:main,
  secondaryCandidates:secondary,
  otherRelationsTouchingDay:dayCompeting,
  hasCompetingClaims:annualDay.length>1||dayCompeting.length>0,
  eligibleForLimitedDescription:relevant,
  meaningStrength:'not-assessed',favorableOrUnfavorable:'not-assessed',
  realWorldRelationshipOutcome:'not-assessable',
  rule:relevant?
    '2027년의 지지와 태어난 날의 지지가 해당 전통 관계표에서 직접 연결된다. 지지 이름과 종류, 겹치는 다른 관계를 그대로 표시한다. 강약·합화·우선 작용은 확정하지 않고 결혼·이별·상대의 감정을 예측하지 않는다.':
    '태어난 날의 지지와 2027년 지지에서 충·육합이 직접 검출되지 않았다. 다른 관계가 없거나 인간관계가 좋거나 나쁘다는 뜻은 아니다.'
 };
 const stages=[
  {stage:'direct-position-and-branch',reviewed:true,assessed:'exact-branch-membership'},
  {stage:'month-branch-context',reviewed:true,monthBranch,assessed:'month-branch-only-no-seasonal-strength'},
  {stage:'natal-and-annual-group-completion',reviewed:true,
   natalCount:natal.groups.length,annualCount:yearly.groups.length,
   newlyCompletedByAnnual:yearly.groups.filter(g=>g.newlyCompletedByAnnual).map(g=>g.type+':'+g.branches),
   assessed:'exact-group-membership-only'},
  {stage:'overlapping-relations',reviewed:true,
   contestedPositions:positions.filter(p=>competingByPosition[p]?.competing),
   assessed:'coexistence-not-cancellation'},
  {stage:'transformation-strength-and-final-priority',reviewed:false,
   assessed:'not-computed-no-school-independent-automatic-winner'}
 ];
 return {
  version:'position-context-v1',
  natalBranchRelations:natal,targetYearBranchRelations:yearly,
  monthlyContext:{monthBranch,seasonalStrength:'not-assessed',stemExposure:'not-assessed'},
  annualContext:{annualBranch:yearBranch,positions:competingByPosition,day:comparison},
  interpretationPriority:'unresolved',transformation:'not-assessed',
  reviewStages:stages,
  guarantee:'relation-table-observation-only',
  licensedClaims:['computed-branch-pair','exact-position','coexisting-relations','complete-group-membership'],
  prohibitedClaims:['settled-harmony-transformation','winner-of-clash-and-harmony','assured-marriage-or-breakup','luck-quality']
 };
}
module.exports={evaluate,PRIMARY_PAIR_TYPES,SECONDARY_PAIR_TYPES};
