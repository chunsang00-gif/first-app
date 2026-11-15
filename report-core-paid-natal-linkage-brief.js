'use strict';
// QA ONLY. A concise, deterministic selection of chart-specific stem
// observations. Not a strength reading, life prediction, or a personality
// inference. Do not force speculative prose from the observations.
const stems=require('./report-stem-connections');
const POSITIONS=['year','month','day','hour'];
function select(packet){
 const chart=packet?.chart,source=packet?.facts?.stemConnections;
 if(!chart?.hour||!source)
  throw Error('QA_DEPTH_LINKAGE_CHART_OR_SOURCE_MISSING');
 const verified=stems.build(chart);
 if(JSON.stringify(verified)!==JSON.stringify(source))
  throw Error('QA_DEPTH_LINKAGE_CALCULATED_SOURCE_DIVERGED');
 if(verified.sourcePolicy.strength!=='not-assessed'||
    verified.sourcePolicy.seasonAndTransformation!=='not-assessed'||
    verified.sourcePolicy.hourPolicy!=='observed-hour'||
    verified.finalStrengthVerdict!=='not-assessed')
  throw Error('QA_DEPTH_LINKAGE_UNSUPPORTED_STRENGTH');
 const visible=POSITIONS.map(position=>{
  const id='natal.'+position+'.stem';
  const stem=chart[position][0];
  const node=verified.rooting.find(r=>r.visibleId===id);
  if(!node||node.visiblePosition!==position||
     node.visibleStem!==stem||
     node.role!==(position==='day'?'day-master':'other-visible-stem'))
   throw Error('QA_DEPTH_LINKAGE_VISIBLE_DIVERGED:'+position);
  return {id,position,stem,
   observedSameElementRoots:node.sameElementRoots.map(r=>({
    hiddenId:r.hiddenId,position:r.position,matchType:r.type,
    layer:r.layer,hiddenStem:r.hiddenStem
   }))};
 });
 const hiddenToVisible=verified.exposure.filter(r=>r.exactExposure)
  .map(r=>({
   hiddenId:r.hiddenId,hiddenPosition:r.position,hiddenStem:r.hiddenStem,
   layer:r.layer,visibleIds:r.exactVisibleMatches.map(v=>v.id)
  }));
 const sameVisibleStems=[];
 for(let i=0;i<visible.length;i++)for(let j=i+1;j<visible.length;j++){
  if(visible[i].stem===visible[j].stem)sameVisibleStems.push({
   leftId:visible[i].id,rightId:visible[j].id,
   stem:visible[i].stem});
 }
 return {
  kind:'natal-visible-hidden-exact-links-v1',
  dataScope:'calculated-position-and-same-element-only',
  visible,hiddenToVisible,sameVisibleStems,
  // Absolutely no inference of dominance, strength, environment, character
  // or outcome based on the presence/number/absence of observed roots.
  interpretationBoundary:'이 자료는 위치별 동일 글자·같은 오행의 연결을 계산한 관찰값이다. 숨은 글자 개수, 연결의 유무만으로 강약·작용의 우선순위·성격·운세를 단정할 수 없다. 전통적 종합 해석이 증명되지 않으면 관계를 작동한다는 말 대신 계산된 일치·차이만 기술하고 편집 검토를 보류한다.',
  measuredStrength:false,observedPersonality:false,
  releaseVerdict:'not-approved'
 };
}
module.exports={select};
