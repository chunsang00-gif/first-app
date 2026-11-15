'use strict';
// QA-ONLY source attribution for the Earth three-punishment grouping.
// This is NOT part of the production branch-relation table. Pair matches
// and later-commentary group membership are distinct editorial facts.
const branch=require('./report-branch-relations');
const POS=['year','month','day','hour'];
const MEMBERS=['丑','戌','未'];
const originalUrl='https://www.donglishuzhai.net/chapter/3720.html';
const commentaryUrl='https://www.mastervt.com/books/zipingzhenquanpingzhu/juan-1/chapter-009';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function inspect(packet){
 if(packet?.status!=='ready'||!packet.chart?.hour||
    !POS.every(pos=>typeof packet.chart[pos]==='string'&&packet.chart[pos].length===2))
  throw Error('QA_THREE_PUNISHMENT_FULL_CHART_REQUIRED');
 const actual=branch.natal(packet.chart);
 if(!same(actual,packet.facts?.natalBranchRelations))
  throw Error('QA_THREE_PUNISHMENT_BRANCH_LEDGER_DRIFT');
 const positionsByCharacter=Object.fromEntries(MEMBERS.map(s=>[s,POS.filter(p=>
  packet.chart[p][1]===s)]));
 const present=MEMBERS.every(x=>positionsByCharacter[x].length>0);
 const representatives=present?MEMBERS.map(s=>({
  branch:s,position:positionsByCharacter[s][0]})):[];
 const chosen=new Set(representatives.map(x=>x.position));
 const relevant=present?actual.pairs.filter(row=>
  row.positions.every(pos=>chosen.has(pos))).map(row=>({
   type:row.type,positions:row.positions.slice(),branches:row.branches})):[];
 const contacts=new Set(relevant.map(x=>x.positions.join('/')));
 if(present&&(chosen.size!==3||contacts.size!==3||relevant.length!==5||
    !relevant.some(x=>x.type==='형'&&x.branches.split('').sort().join('')==='丑未')||
    !relevant.some(x=>x.type==='충'&&x.branches.split('').sort().join('')==='丑未')||
    !relevant.some(x=>x.type==='파'&&x.branches.split('').sort().join('')==='戌未')))
  throw Error('QA_THREE_PUNISHMENT_UNVERIFIED_GROUP_CALCULATION');
 return {
  kind:'qa-xu-commentary-three-punishment-candidate-v1',
  chartHasAllThreeEarthBranches:present,
  calculatedPositionsByBranch:positionsByCharacter,
  representativePositions:representatives,
  observedPairTableRows:relevant,
  independentPairContacts:contacts.size,
  tableRelationLabels:relevant.length,
  attribution:{
   original:{work:'子平真詮',chapter:'七、論刑沖會合解法',
    url:originalUrl,
    explicitlyNamesThisExactEarthTriad:false,
    saysThreePunishmentMeaningIsDisputed:true},
   laterCommentary:{work:'子平真詮評注',commentator:'徐樂吾',
    url:commentaryUrl,
    explicitlyListsEarthTriad:true,
    status:'traditional-commentary-configuration-not-verified-effect'}
  },
  mayDescribeTraditionalLabel:present,
  isUniquePersonalityOrFateConclusion:false,
  groupStrengthOrActivationVerified:false,
  pairLabelsNotIndependentLifeEvents:true,
  traditionalPriorityChosen:false,
  humanReviewed:false,customerReady:false,
  providerCalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={inspect};
