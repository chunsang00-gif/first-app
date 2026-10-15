'use strict';
// Deterministic 透干 (exact hidden-to-visible stem) and 通根 (same-element
// visible-to-hidden rooting) source graph. Both are chart observations, not
// strength, pattern, personality, or an adopted school-specific priority.
const season=require('./report-seasonal-evidence');
const P=['year','month','day','hour'];
function build(chart){
 if(!chart?.year||!chart?.month||!chart?.day)throw Error('Birth year month and day pillars required for stem connections');
 const missingHour=chart.hour==null;
 const visible=[],hidden=[];
 for(const position of P){
  const pillar=chart[position];
  if(!pillar)continue;
  const stem=pillar[0],branch=pillar[1];
  if(pillar.length!==2||!season.ELEMENTS[stem]||!season.HIDDEN[branch])
   throw Error('Invalid natal pillar in stem connections: '+position);
  visible.push({id:'natal.'+position+'.stem',position,stem,
   element:season.ELEMENTS[stem],role:position==='day'?'day-master':'other-visible-stem'});
  for(const [index,underlying] of season.HIDDEN[branch].entries()){
   hidden.push({id:'natal.'+position+'.hidden.'+underlying,
    position,branch,stem:underlying,element:season.ELEMENTS[underlying],
    layer:index===0?'main':index===1?'secondary':'residual'});
  }
 }
 const exposure=hidden.map(x=>{
  const matching=visible.filter(v=>v.stem===x.stem).map(v=>({
   id:v.id,position:v.position,samePillar:v.position===x.position,
   role:v.role
  }));
  const sameElementOtherStem=visible.filter(v=>v.element===x.element&&v.stem!==x.stem)
   .map(v=>v.id);
  return {hiddenId:x.id,hiddenStem:x.stem,position:x.position,layer:x.layer,
   exactVisibleMatches:matching,sameElementDifferentStemVisibleIds:sameElementOtherStem,
   exactExposure:matching.length>0,
   exposureStatus:matching.length?'exact-stem-observed':missingHour?'unobserved-hour-not-excluded':'not-found-in-known-stems'};
 });
 const rooting=visible.map(v=>{
  const sources=hidden.filter(x=>x.element===v.element).map(x=>({
   hiddenId:x.id,position:x.position,layer:x.layer,
   hiddenStem:x.stem,
   type:x.stem===v.stem?'exact-stem':'same-element-different-stem',
   samePillar:x.position===v.position
  }));
  return {visibleId:v.id,visibleStem:v.stem,visiblePosition:v.position,role:v.role,
   sameElementRoots:sources,hasObservedRoot:sources.length>0,
   rootObservationStatus:sources.length?'same-element-hidden-stem-observed':
    missingHour?'unobserved-hour-not-excluded':'not-found-in-known-branches',
   exactStemRootIds:sources.filter(x=>x.type==='exact-stem').map(x=>x.hiddenId),
   sameElementOtherStemRootIds:sources.filter(x=>x.type==='same-element-different-stem').map(x=>x.hiddenId)
  };
 });
 const dayMaster=rooting.find(x=>x.role==='day-master');
 const ids=[...visible.map(x=>x.id),...hidden.map(x=>x.id)];
 if(new Set(ids).size!==ids.length)throw Error('Duplicate stem-link positional source');
 return {
  version:'stem-visibility-and-roots-v1',
  sourcePolicy:{exposure:'exact-heavenly-stem-match-only',rooting:'same-element-with-exact-stem-distinction',
   hourPolicy:missingHour?'unknown-hour-limits-negative-findings':'observed-hour',
   seasonAndTransformation:'not-assessed',strength:'not-assessed',usefulGod:'not-assessed'},
  dayMasterRooting:dayMaster,exposure,rooting,
  hiddenHourMayChangeFindings:missingHour,
  finalStrengthVerdict:'not-assessed',
  interpretationRule:'지장간이 겉천간과 글자까지 정확히 같을 때만 투간의 명시적 대응으로 기록한다. 통근은 같은 오행의 뿌리 여부를 검토하되 동일 글자와 음양이 다른 글자를 분리한다. 위치·본기/중기/여기는 관찰값이며 실제 사령, 강도, 성격, 용신 또는 현실 사건을 판정하지 않는다.'
 };
}
module.exports={build};
