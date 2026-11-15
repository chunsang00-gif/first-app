'use strict';
// OFFLINE cross-chart editorial audit, for any complete natal chart. No model,
// behavior inference, traditional method approval, or production wiring.
// Different birth facts must not be "personalized" by swapping names/dates
// while leaving the same explanation of cited changed facts.
const monthly=require('./report-core-paid-natal-month-method-review');
const linkage=require('./report-core-paid-natal-linkage-brief');
const bindings=require('./report-fact-bindings');
const {LunarUtil}=require('lunar-javascript');
const POS=['year','month','day','hour'];
const TEN_GOD={'比肩':'비견','劫财':'겁재','食神':'식신','伤官':'상관',
 '偏财':'편재','正财':'정재','七杀':'편관','正官':'정관',
 '偏印':'편인','正印':'정인'};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function snapshot(packet){
 if(packet?.status!=='ready'||!packet.chart?.hour||!packet.facts)
  throw Error('QA_COUNTERFACTUAL_REQUIRES_FULL_VALID_CHART');
 // Recomputed sources are necessary: a stale provider packet is not a
 // reliable baseline even when its emitted labels sound plausible.
 const review=monthly.assess(packet);
 const links=linkage.select(packet);
 const rows=Object.fromEntries(bindings.build(packet).map(x=>[x.id,x]));
 const day=packet.chart.day[0];
 const positions=Object.fromEntries(POS.map(position=>{
  const pillar=packet.chart[position],id='natal.'+position+'.stem';
  const row=rows[id];
  const calculated=position==='day'?'일간':TEN_GOD[LunarUtil.SHI_SHEN[day+pillar[0]]];
  if(!calculated||!row||row.stem!==pillar[0]||
     row.tenGod!==calculated||row.interpretationScope!=='traditional-symbol-only'||
     row.observedBehavior!==false)
   throw Error('QA_COUNTERFACTUAL_SOURCE_ROLE_DRIFT:'+position);
  return [position,{sourceId:id,stem:pillar[0],branch:pillar[1],
   tenGod:calculated}];
 }));
 const main=review.observed.mainHiddenStemSourceId;
 if(rows[main]?.stem!==main.split('.').at(-1)||
    rows[main]?.tenGod!==TEN_GOD[LunarUtil.SHI_SHEN[day+rows[main].stem]])
  throw Error('QA_COUNTERFACTUAL_MONTH_MAIN_ROLE_DRIFT');
 return {
  kind:'qa-calculated-natal-comparison-snapshot-v1',
  positions,monthMain:{sourceId:main,stem:rows[main].stem,tenGod:rows[main].tenGod},
  monthPhase:review.observed.monthPhase,
  exactNonDayMonthExposures:review.observed.exactExposureScopeComparison
   .nonDayExposedHiddenStemIds.slice().sort(),
  observedHiddenVisibleLinks:links.hiddenToVisible,
  monthPairTable:review.observed.natalRelationsTouchingMonth.pairs,
  monthGroupTable:review.observed.natalRelationsTouchingMonth.groups,
  interpretationStatus:'unverified',releaseVerdict:'not-approved',
  providerCalls:0
 };
}
function differences(left,right){
 if(left?.kind!=='qa-calculated-natal-comparison-snapshot-v1'||
    right?.kind!==left.kind)
  throw Error('QA_COUNTERFACTUAL_SNAPSHOTS_REQUIRED');
 const changed=[];
 const add=(key,sourceRefs,a,b)=>{
  if(!same(a,b))changed.push({key,sourceRefs,before:a,after:b,
   observedOnly:true,lifeConclusionEstablished:false});
 };
 for(const position of POS){
  const l=left.positions[position],r=right.positions[position];
  add(position+'-stem-and-role',[l.sourceId],{stem:l.stem,tenGod:l.tenGod},
   {stem:r.stem,tenGod:r.tenGod});
  add(position+'-branch',['chart.'+position],l.branch,r.branch);
 }
 add('month-main-symbol',[left.monthMain.sourceId,right.monthMain.sourceId],
  left.monthMain,right.monthMain);
 add('month-phase',['facts.seasonalEvidence'],left.monthPhase,right.monthPhase);
 add('month-nonday-exposure',['facts.stemConnections'],
  left.exactNonDayMonthExposures,right.exactNonDayMonthExposures);
 add('hidden-visible-linkage',['facts.stemConnections'],
  left.observedHiddenVisibleLinks,right.observedHiddenVisibleLinks);
 add('month-branch-pair-table',['facts.natalBranchRelations'],
  left.monthPairTable,right.monthPairTable);
 add('month-branch-group-table',['facts.natalBranchRelations'],
  left.monthGroupTable,right.monthGroupTable);
 return changed;
}
function normalizedText(value){
 return value.normalize('NFKC')
  .replace(/[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]/g,'*')
  .replace(/\d+(?:[-/.]\d+)*/g,'#')
  .replace(/\s+/g,' ').trim();
}
function readerCompare(leftPacket,rightPacket,leftDraft,rightDraft){
 const a=snapshot(leftPacket),b=snapshot(rightPacket);
 const changed=differences(a,b);
 let status='draft-not-supplied',affected=[];
 if(leftDraft||rightDraft){
  if(!leftDraft||!rightDraft||
     ![leftDraft,rightDraft].every(d=>typeof d.text==='string'&&
      d.text.trim().length>0&&Array.isArray(d.sourceRefs)&&
      d.sourceRefs.every(id=>typeof id==='string')))
   throw Error('QA_COUNTERFACTUAL_INCOMPLETE_DRAFT');
  const aRefs=new Set(leftDraft.sourceRefs);
  const bRefs=new Set(rightDraft.sourceRefs);
  affected=changed.filter(x=>x.sourceRefs.some(ref=>aRefs.has(ref)&&bRefs.has(ref)))
   .map(x=>x.key);
  status=affected.length===0?'no-shared-cited-fact-changed':
   normalizedText(leftDraft.text)===normalizedText(rightDraft.text)?
    'copied-reader-reasoning-needs-editor-review':
    'different-reader-language-method-still-unverified';
 }
 return {
  kind:'qa-two-chart-editorial-counterfactual-v1',
  changedFacts:changed,changedFactCount:changed.length,
  changedSharedCitedFacts:affected,
  status,
  individualTraditionalMeaningValidated:false,
  manuscriptApproved:false,eligibleForRelease:false,
  modelCallsRequiredForThisAudit:false,providerCalls:0,
  releaseVerdict:'not-approved'
 };
}
module.exports={snapshot,differences,readerCompare};
