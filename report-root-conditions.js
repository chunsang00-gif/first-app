'use strict';
// Root conditions are positional evidence, not root destruction or scoring.
// Keeps innate relationships separate from annual (moving) relationships.
const links=require('./report-stem-connections');
const relations=require('./report-branch-relations');
const season=require('./report-seasonal-evidence');
const ordered=['year','month','day','hour'];
function build(chart,annualPillar){
 if(!chart?.year||!chart?.month||!chart?.day||!annualPillar)
  throw Error('Root review requires chart and annual pillar');
 const graph=links.build(chart),birth=relations.natal(chart),
       moving=relations.annual(chart,annualPillar),month=season.evaluate(chart);
 const cases=[];
 for(const visible of graph.rooting){
  for(const root of visible.sameElementRoots){
   const branch=chart[root.position][1];
   const natalPairs=birth.pairs.filter(x=>x.positions.includes(root.position));
   const annualPairs=moving.pairs.filter(x=>x.between===root.position);
   const oldClash=natalPairs.filter(x=>x.type==='충');
   const newClash=annualPairs.filter(x=>x.type==='충');
   const natalGroups=birth.groups.filter(x=>x.positions.includes(root.position));
   const annualGroups=moving.groups.filter(x=>x.positions.includes(root.position));
   const alternatives=visible.sameElementRoots.filter(x=>x.hiddenId!==root.hiddenId)
    .map(x=>x.hiddenId);
   const seasonalRelation=month.coreSeasonElement?
    season.relation(month.coreSeasonElement,season.ELEMENTS[visible.visibleStem]):
    'transitional-month-unresolved';
   cases.push({
    visibleId:visible.visibleId,visibleStem:visible.visibleStem,
    visiblePosition:visible.visiblePosition,
    rootId:root.hiddenId,rootPosition:root.position,
    rootBranch:branch,rootStem:root.hiddenStem,rootLayer:root.layer,
    matchType:root.type,
    seasonalContext:{monthBranch:month.monthBranch,monthPhase:month.monthPhase,
     dominantElement:month.coreSeasonElement,relationToVisibleStem:seasonalRelation,
     actualRootQiStrength:'not-assessed'},
    natal:{clashes:oldClash,otherPairs:natalPairs.filter(x=>x.type!=='충'),
     completeGroups:natalGroups,hasDirectClash:oldClash.length>0},
    year:{pillar:annualPillar,clashes:newClash,otherPairs:annualPairs.filter(x=>x.type!=='충'),
     completeGroups:annualGroups,hasDirectClash:newClash.length>0},
    alternativeRootIds:alternatives,
    existence:'observed-hidden-stem',
    condition:'interactions-identified-not-quantified',
    remainingRootAvailability:'not-assessed',
    canDeleteRootForClash:false,transformation:'not-assessed'
   });
  }
 }
 const ids=new Set(graph.rooting.map(v=>v.visibleId));
 if(cases.some(c=>!ids.has(c.visibleId)))throw Error('Root source ID not in stem connection graph');
 return {
  version:'root-conditions-v1',annualPillar,
  rootCases:cases,
  dayMasterRootCases:cases.filter(c=>c.visibleId==='natal.day.stem'),
  natalClashedRootCaseIds:cases.filter(c=>c.natal.hasDirectClash).map(c=>c.visibleId+'>'+c.rootId),
  annualClashedRootCaseIds:cases.filter(c=>c.year.hasDirectClash).map(c=>c.visibleId+'>'+c.rootId),
  rootDeletionPolicy:'never-infer-erasure-from-clash-alone',
  monthClashDoesNotRemoveBirthSeason:true,
  unknownBirthHour:chart.hour==null,
  strengthVerdict:'not-assessed',usefulGodVerdict:'not-assessed',
  quantitativeEffect:'not-computed',
  limits:'원국 충과 세운 충, 경쟁하는 다른 합·형·파·해와 대체 뿌리의 위치를 각각 기록한다. 관계표의 존재가 뿌리 소멸이나 강도 감소량을 확정하지 않으며 사령·계절 강약·합화 조건과 학파별 가중치가 검증되기 전에는 신강·신약·용신을 판단하지 않는다.'
 };
}
module.exports={build};
