'use strict';
// QA-only traditional *symbol relation* worksheet. The visible stems have
// independently computed ten-god classifications; five-element directions
// are fixed by their elements. A relation is NOT evidence that its effects
// are realized, dominant, psychologically observed, or worth paying for.
const season=require('./report-seasonal-evidence');
const POS=['year','month','hour'];
function direction(left,right){
 const a=season.ELEMENTS[left],b=season.ELEMENTS[right];
 if(!a||!b)throw Error('QA_VISIBLE_RELATION_UNKNOWN_STEM');
 if(a===b)return 'same-element';
 if(season.GENERATES[a]===b)return 'left-generates-right';
 if(season.GENERATES[b]===a)return 'right-generates-left';
 if(season.CONTROLS[a]===b)return 'left-controls-right';
 if(season.CONTROLS[b]===a)return 'right-controls-left';
 throw Error('QA_VISIBLE_RELATION_UNCLASSIFIED');
}
function build(packet,source){
 if(packet?.status!=='ready'||!packet?.chart?.hour||!source)
  throw Error('QA_VISIBLE_RELATION_INCOMPLETE_NATAL_SCOPE');
 const nodes=POS.map(position=>{
  const sourceId='natal.'+position+'.stem';
  const calculatedStem=packet.chart[position]?.[0],row=source[sourceId];
  if(!row||row.id!==sourceId||row.stem!==calculatedStem||
    !row.tenGod||!row.traditionalMeaning)
   throw Error('QA_VISIBLE_RELATION_SOURCE_DIVERGED:'+position);
  return {position,sourceId,stem:calculatedStem,
   traditionalCategory:row.tenGod,
   traditionalMeaning:row.traditionalMeaning};
 });
 const pairs=[];
 for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
  pairs.push({
   from:nodes[i].sourceId,to:nodes[j].sourceId,
   fromCategory:nodes[i].traditionalCategory,
   toCategory:nodes[j].traditionalCategory,
   elementalDirection:direction(nodes[i].stem,nodes[j].stem),
   positionalClaimVerified:true,
   realizedInfluence:'not-assessed',
   relativePriority:'not-assessed',
   observedPersonality:false
  });
 }
 return {
  kind:'qa-three-visible-stem-element-directions-v1',
  scope:'calculated-generating-controlling-direction-only',
  nodes,pairs,methodAdopted:false,
  symbolicLifeInterpretationVerified:false,
  eligibleForPremiumReaderClaim:false,
  releaseVerdict:'not-approved'
 };
}
module.exports={build,direction};
