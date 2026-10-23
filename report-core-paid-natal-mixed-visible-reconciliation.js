'use strict';
// Offline editorial QA only. Three visible stems can have simultaneous
// generating and controlling elemental arrows. Neither an arrow count nor a
// closed loop measures an active traditional influence or a personality trait.
const bindings=require('./report-fact-bindings');
const visible=require('./report-core-paid-natal-visible-relation-bridge');
const season=require('./report-seasonal-evidence');
const classical=require('./report-core-paid-natal-ch11-two-cases');
const readerPolicy=require('./report-reader-policy');
const positions=['year','month','hour'];
const kinds=new Set(['left-generates-right','right-generates-left',
 'left-controls-right','right-controls-left','same-element']);
const SUPPORT=new Set(['left-generates-right','right-generates-left']);
const RESTRICT=new Set(['left-controls-right','right-controls-left']);
const expectedChart={
 year:'癸卯',month:'己未',day:'壬申',hour:'乙巳'
};
const readerDraft={
 label:'새로운 제안과 기존 기준을 함께 읽을 때',
 text:'태어난 해의 글자는 함께 나누는 몫을 살피는 뜻, 달의 글자는 정해진 기준과 책임을 살피는 뜻, 시간의 글자는 기존 방식을 바꿔 표현하는 뜻으로 분류됩니다. 해의 글자는 시간의 글자를 돕는 관계이며, 시간의 글자는 달의 글자를 제약하는 관계입니다. 달의 글자도 해의 글자를 제약합니다. 이 세 관계가 함께 계산됐다고 서로 상쇄되거나 한쪽이 더 강하다고 판단하지 않습니다. 예를 들어 팀이 기존 점검 순서를 바꿔 보자고 제안하는 상황을 가정해 보겠습니다. 필요한 인력과 시간을 확보하면 제안을 검토하는 데 도움이 될 수 있지만, 실제 승인 기준과 안전 규정을 확인하지 않고 변경할 수는 없습니다. 시험할 범위와 승인할 사람을 구분해 보는 방법은 가능합니다. 이 장면은 계산된 상징을 이해하기 위한 예시이며, 실제 성격이나 협업 능력 또는 미래의 업무 성과를 확인한 결과는 아닙니다.'
};
function review(packet){
 if(packet?.status!=='ready'||!packet.chart?.hour||!packet.facts)
  throw Error('QA_MIXED_VISIBLE_COMPLETE_CALCULATION_REQUIRED');
 const ledger=Object.fromEntries(bindings.build(packet).map(x=>[x.id,x]));
 const diagram=visible.build(packet,ledger);
 const sources=positions.map(p=>{
  const id='natal.'+p+'.stem',row=ledger[id];
  if(!row||row.stem!==packet.chart[p][0]||
     row.observedBehavior!==false||
     row.interpretationScope!=='traditional-symbol-only'||
     !row.traditionalMeaning)
   throw Error('QA_MIXED_VISIBLE_SOURCE_DRIFT:'+id);
  return {id,position:p,stem:row.stem,tenGod:row.tenGod};
 });
 if(diagram.pairs.length!==3||diagram.nodes.length!==3||
    diagram.eligibleForPremiumReaderClaim!==false)
  throw Error('QA_MIXED_VISIBLE_DIAGRAM_NOT_LIMITED');
 const independentDirection=(left,right)=>{
  const a=season.ELEMENTS[left],b=season.ELEMENTS[right];
  if(!a||!b)throw Error('QA_MIXED_VISIBLE_STEM_INVALID');
  if(a===b)return 'same-element';
  const generating={wood:'fire',fire:'earth',earth:'metal',metal:'water',water:'wood'};
  const controls={wood:'earth',earth:'water',water:'fire',fire:'metal',metal:'wood'};
  if(generating[a]===b)return 'left-generates-right';
  if(generating[b]===a)return 'right-generates-left';
  if(controls[a]===b)return 'left-controls-right';
  if(controls[b]===a)return 'right-controls-left';
  throw Error('QA_MIXED_VISIBLE_UNCLASSIFIED');
 };
 const edges=diagram.pairs.map(p=>{
  const from=sources.find(x=>x.id===p.from),to=sources.find(x=>x.id===p.to);
  if(!from||!to||!kinds.has(p.elementalDirection)||
     p.fromCategory!==from.tenGod||p.toCategory!==to.tenGod||
     p.elementalDirection!==independentDirection(from.stem,to.stem)||
     p.positionalClaimVerified!==true||
     p.realizedInfluence!=='not-assessed'||
     p.relativePriority!=='not-assessed')
   throw Error('QA_MIXED_VISIBLE_UNVERIFIED_EDGE');
  return {from:p.from,to:p.to,fromCategory:p.fromCategory,
   toCategory:p.toCategory,elementalDirection:p.elementalDirection,
   class:SUPPORT.has(p.elementalDirection)?'generates':
    RESTRICT.has(p.elementalDirection)?'controls':'same-element',
   realizedInfluence:'not-assessed',relativePriority:'not-assessed'};
 });
 const generating=edges.filter(x=>x.class==='generates');
 const restricting=edges.filter(x=>x.class==='controls');
 const mixed=generating.length>0&&restricting.length>0;
 const exact=positions.concat('day').every(p=>packet.chart[p]===expectedChart[p]);
 const classic=classical.evaluate(packet);
 const example=classic.examples.find(x=>x.id==='ren-wei-yi-ji-output-opposes-authority')||null;
 if(exact&&(example?.sourceTextualRelation!=='expression-symbol-controls-duty-symbol'||
    !mixed||generating.length!==1||restricting.length!==2||
    edges.find(x=>x.from==='natal.year.stem'&&x.to==='natal.hour.stem')
     ?.elementalDirection!=='left-generates-right'||
    edges.find(x=>x.from==='natal.month.stem'&&x.to==='natal.hour.stem')
     ?.elementalDirection!=='right-controls-left'||
    edges.find(x=>x.from==='natal.year.stem'&&x.to==='natal.month.stem')
     ?.elementalDirection!=='right-controls-left'||
    sources.find(x=>x.position==='year')?.tenGod!=='겁재'||
    sources.find(x=>x.position==='month')?.tenGod!=='정관'||
    sources.find(x=>x.position==='hour')?.tenGod!=='상관'))
  throw Error('QA_MIXED_VISIBLE_EXACT_EDITORIAL_SCOPE_DRIFT');
 if(readerPolicy.errors([readerDraft.label,readerDraft.text]).length||
    /[?？]\s*$/.test(readerDraft.text))
  throw Error('QA_MIXED_VISIBLE_LANGUAGE_REJECTED');
 return {
  kind:'qa-three-visible-mixed-elemental-relations-v1',
  calculatedChart:{...packet.chart},
  sourceRefs:[...sources.map(x=>x.id),'facts.stemConnections'],
  edges,counts:{generating:generating.length,restricting:restricting.length,
   sameElement:edges.filter(x=>x.class==='same-element').length},
  mixed,
  // The classical match covers the MONTH+HOUR restrictive pair only.
  // The YEAR+HOUR supportive pair is a separate elemental observation.
  matchedRestrictiveClassicalSourceId:example?.id||null,
  combinedReaderDraft:exact?{
   kind:'qa-exact-chart-hand-edited-hypothesis-v1',
   label:readerDraft.label,text:readerDraft.text,
   observedYearMonthHourOnly:true,
   publishedRelationCoversAllThreePairs:false,
   scenarioIsHypothetical:true,claimOfRealPersonality:false,
   sourceRefs:[...sources.map(x=>x.id),'facts.stemConnections',
    ...example.sourceRefs],
   humanMethodReviewed:false,readerValueValidated:false,
   releaseVerdict:'not-approved'
  }:null,
  noWinnerChosen:true,notOffsettingForces:true,
  strengthOrPracticalEffectInferred:false,
  finalTraditionalPattern:null,
  customerReady:false,providerCalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={review};
