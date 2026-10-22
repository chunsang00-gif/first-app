'use strict';
// QA-only distinction between calculated positions and an independently
// justified traditional interpretation. No provider call, no app release.
// A source link is NEVER evidence that a personal tendency, superior
// influence, or paid reader value has been established.
const linkage=require('./report-core-paid-natal-linkage-brief');
const monthMethod=require('./report-core-paid-natal-month-method-review');
const visibleRelations=require('./report-core-paid-natal-visible-relation-bridge');
const REQUIRED=['natal.year.stem','natal.month.stem','natal.day.stem',
 'natal.hour.stem','facts.stemConnections'];
const POSITIONS=['year','month','day','hour'];
function assess(prompt,provider){
 if(prompt?.qaNatalDepthPreview!==true||
    JSON.stringify(prompt.requestedSections)!=='["saju_core"]')
  throw Error('QA_METHOD_REVIEW_OUTSIDE_ISOLATED_DEPTH_SCOPE');
 const task=provider?.task?.chapters?.saju_core?.topics?.natal_depth;
 const source=provider?.source;
 const focus=task?.evidenceFocus;
 if(!task||!source||!focus||
    focus.kind!=='qa-verified-natal-interpretive-contrast')
  throw Error('QA_METHOD_REVIEW_SOURCE_MISSING');
 const actual=linkage.select(prompt.facts);
 if(JSON.stringify(focus.verifiedLinks)!==JSON.stringify(actual))
  throw Error('QA_METHOD_REVIEW_CALCULATED_LINKAGE_DRIFT');
 const allowed=new Set(task.citableFacts?.map(x=>x.id)||[]);
 if(!REQUIRED.every(x=>allowed.has(x)&&Object.hasOwn(source,x)))
  throw Error('QA_METHOD_REVIEW_REQUIRED_PROVENANCE_MISSING');
 if(!Array.isArray(focus.positions)||focus.positions.length!==4)
  throw Error('QA_METHOD_REVIEW_POSITIONS_MISSING');
 for(const [i,pos] of POSITIONS.entries()){
  const id='natal.'+pos+'.stem',r=source[id],p=focus.positions[i];
  if(!p||p.position!==pos||p.sourceId!==id||
     r?.stem!==prompt.facts.chart[pos]?.[0]||
     p.category!==r?.tenGod||
     p.traditionalMeaning!==(r?.traditionalMeaning||null)||
     p.observedBehavior!==false)
   throw Error('QA_METHOD_REVIEW_TRADITIONAL_ROLE_DRIFT:'+pos);
 }
 // This list is based on WHAT is present in the computed packet, not
 // a model's interpretation. Even if all observations are verified, an
 // additional independent rule is needed to derive a traditional conclusion.
 const observations={
  positionsVerified:POSITIONS.length,
  exactExposureCount:actual.hiddenToVisible.length,
  sameVisibleStemPairs:actual.sameVisibleStems.length,
  visiblePositionsWithSameElementRoots:actual.visible.filter(
   x=>x.observedSameElementRoots.length>0).map(x=>x.position),
  traditionalClassificationRowsVerified:POSITIONS.length
 };
 // Input-specific, falsifiable chart facts for an editor. These do not
 // establish how strongly any traditional symbol operates in real life.
 const exactStemsByPosition=Object.fromEntries(actual.visible.map(row=>[
  row.position,{
   visibleSourceId:row.id,
   exactHiddenSourceIds:row.observedSameElementRoots
    .filter(root=>root.matchType==='exact-stem').map(root=>root.hiddenId),
   sameElementOtherStemSourceIds:row.observedSameElementRoots
    .filter(root=>root.matchType==='same-element-different-stem')
    .map(root=>root.hiddenId)
  }
 ]));
 const sameDayHour=actual.sameVisibleStems.some(pair=>
  [pair.leftId,pair.rightId].includes('natal.day.stem')&&
  [pair.leftId,pair.rightId].includes('natal.hour.stem'));
 const falsifiableChecks=[
  {id:'day-and-hour-visible-same-exact-character',
   observed:sameDayHour,
   refs:['natal.day.stem','natal.hour.stem'],
   incorrectOpposite:sameDayHour?
    '태어난 날과 시간의 겉글자가 다르다는 주장은 이 명식에 틀리다.':
    '태어난 날과 시간의 겉글자가 정확히 같다는 주장은 이 명식에 틀리다.'},
  ...['year','hour'].flatMap(position=>{
   const entry=exactStemsByPosition[position];
   return [
    {id:position+'-visible-matched-exact-hidden-character',
     observed:entry.exactHiddenSourceIds.length>0,
     refs:[entry.visibleSourceId,...entry.exactHiddenSourceIds],
     incorrectOpposite:entry.exactHiddenSourceIds.length?
      '정확히 같은 숨은 글자 대응이 없다는 주장은 이 명식에 틀리다.':
      '정확히 같은 숨은 글자 대응이 있다는 주장은 이 명식에 틀리다.'},
    {id:position+'-visible-matched-same-element-different-character',
     observed:entry.sameElementOtherStemSourceIds.length>0,
     refs:[entry.visibleSourceId,...entry.sameElementOtherStemSourceIds],
     incorrectOpposite:entry.sameElementOtherStemSourceIds.length?
      '같은 기운이지만 다른 글자 대응이 없다는 주장은 이 명식에 틀리다.':
      '같은 기운이지만 다른 글자 대응이 있다는 주장은 이 명식에 틀리다.'}
   ];
  })
 ];
 const traditionalVisibleRelations=visibleRelations.build(prompt.facts,source);
 const monthMethodReview=monthMethod.assess(prompt.facts);
 if(monthMethodReview.canApproveDeepSajuInterpretation!==false||
    monthMethodReview.interpretivePriorityVerified!==false)
  throw Error('QA_METHOD_REVIEW_PREMATURE_MONTH_PRIORITY');
 const decisions=[
  {id:'calculated-position-and-stem-links',status:'verified-by-deterministic-code',
   scope:'position and exact/same-element connections only'},
  {id:'traditional-symbol-labels',status:'verified-against-canonical-chart',
   scope:'classification descriptions, not realized life outcomes'},
  {id:'which-connection-changes-interpretive-priority',
   status:'independent-method-review-required',
   scope:'selected tradition, month command, root conditions, counterexamples'},
  {id:'new-specific-conditional-reading',
   status:'human-editorial-review-required',
   scope:'meaning derived from the chosen method, not parallel definitions or generic advice'},
  {id:'observed-personality-or-future',
   status:'not-established',
   scope:'birth calculations do not observe conduct or guarantee future events'}
 ];
 return {
  kind:'isolated-natal-depth-interpretive-method-audit-v1',
  methodStatus:'unverified-interpretive-bridge',
  calculatedObservations:observations,
  exactStemsByPosition,falsifiableChecks,monthMethodReview,
  traditionalVisibleRelations,
  // Passing these checks only verifies calculated identity/difference.
  // A school-specific interpretation and independent editorial validation
  // remain separate, unresolved gates.
  decisions,
  independentMethodApproved:false,
  eligibleForPaidQualityApproval:false,
  releaseVerdict:'not-approved',
  nextRequirement:'independent traditional-method validation of actual chart-specific claims and counterexamples',
  providerCalls:0
 };
}
module.exports={assess};
