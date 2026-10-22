'use strict';
// QA-only distinction between calculated positions and an independently
// justified traditional interpretation. No provider call, no app release.
// A source link is NEVER evidence that a personal tendency, superior
// influence, or paid reader value has been established.
const linkage=require('./report-core-paid-natal-linkage-brief');
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
  decisions,
  independentMethodApproved:false,
  eligibleForPaidQualityApproval:false,
  releaseVerdict:'not-approved',
  nextRequirement:'independent traditional-method validation of actual chart-specific claims and counterexamples',
  providerCalls:0
 };
}
module.exports={assess};
