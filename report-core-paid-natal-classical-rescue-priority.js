'use strict';
// QA-only, source-constrained Chapter 9 example, 官逢傷而透印以解之.
// A literal classical conditional sequence, not a scored hierarchy of
// personality/strength, and not an automatic final formation assessment.
const month=require('./report-core-paid-natal-month-method-review');
const bindings=require('./report-fact-bindings');
const relation=require('./report-core-paid-natal-visible-relation-bridge');
const reader=require('./report-reader-policy');
const {LunarUtil}=require('lunar-javascript');
const GOD={'比肩':'비견','劫财':'겁재','食神':'식신','伤官':'상관',
 '偏财':'편재','正财':'정재','七杀':'편관','正官':'정관',
 '偏印':'편인','正印':'정인'};
const SOURCE='https://www.donglishuzhai.net/chapter/3722.html';
const texts={
 present:{
  label:'새로운 제안과 기존 기준을 함께 살필 때',
  text:'태어난 달의 중심에는 규칙과 책임을 뜻하는 글자가 있으며, 그 기준을 제약하는 표현의 글자도 겉에 나타납니다. 여기에 태어난 해의 글자는 표현의 글자를 다시 제약하는 관계입니다. 고전에서는 이러한 조건을 앞의 충돌을 완화할 수 있는 사례로 설명합니다. 예를 들어 기존 작업 기준을 개선하려는 제안을 검토한다면, 새 제안의 장점을 확인하면서도 기존 승인 절차가 지키려는 조건을 함께 볼 수 있습니다. 반대로 겉으로 드러난 관계만으로 실제 협업 능력이나 성과가 좋아진다고 판단해서는 안 됩니다. 태어난 달과 다른 자리의 관계가 어떻게 작용하는지, 여러 조건 중 무엇이 더 중요한지는 아직 확인되지 않았습니다.'
 },
 absent:{
  label:'표현과 기존 기준의 관계를 살필 때',
  text:'태어난 달에는 규칙과 책임을 뜻하는 글자가 있고, 겉에는 이를 제약하는 표현의 글자가 나타납니다. 지금 확인한 해·달·시간의 세 윗글자 안에서는 고전이 설명하는 완화 조건을 찾지 못했습니다. 그렇다고 실제로 규칙과 충돌하는 사람이라고 판단할 수는 없습니다. 예를 들어 새 작업 방식이 기존 승인 기준과 다른 상황을 가정하면, 바꾸려는 이유와 지켜야 할 조건을 비교하는 설명이 가능합니다. 하지만 어느 관계가 더 강한지, 다른 출생 자리의 조건이 영향을 줄지는 이 두 글자만으로 결론낼 수 없습니다. 고전의 완화 조건이 이 자리에서 확인되지 않는다는 사실은 실제 성격이나 미래 결과에 대한 증거가 아닙니다.'
 }
};
function independentlyVerifiedGod(day,stem){
 const name=GOD[LunarUtil.SHI_SHEN[day+stem]];
 if(!name)throw Error('QA_CLASSICAL_RESCUE_UNKNOWN_ROLE');
 return name;
}
function evaluate(packet){
 const review=month.assess(packet),chart=packet.chart;
 const rows=Object.fromEntries(bindings.build(packet).map(x=>[x.id,x]));
 for(const place of ['year','month','hour']){
  const id='natal.'+place+'.stem',row=rows[id];
  if(!row||row.stem!==chart[place][0]||
    row.tenGod!==independentlyVerifiedGod(chart.day[0],row.stem)||
    row.observedBehavior!==false||
    row.interpretationScope!=='traditional-symbol-only')
   throw Error('QA_CLASSICAL_RESCUE_VISIBLE_PROVENANCE:'+id);
 }
 const hidden=review.observed.hiddenStemSourceIds;
 for(const id of hidden){
  const row=rows[id];
  if(!row||row.tenGod!==independentlyVerifiedGod(chart.day[0],row.stem))
   throw Error('QA_CLASSICAL_RESCUE_HIDDEN_PROVENANCE:'+id);
 }
 const main=review.observed.mainHiddenStemSourceId;
 const positions=['year','month','hour'].map(place=>({
  id:'natal.'+place+'.stem',place,stem:chart[place][0],
  role:rows['natal.'+place+'.stem'].tenGod
 }));
 const mainRow=rows[main];
 const officer=positions.filter(x=>x.role==='정관');
 const output=positions.filter(x=>x.role==='상관');
 const shield=positions.filter(x=>x.role==='정인'||x.role==='편인');
 const correctMonth=chart.day[0]==='壬'&&chart.month[1]==='未'&&
  main==='natal.month.hidden.己'&&mainRow?.tenGod==='정관';
 const visibleOfficer=officer.some(x=>x.stem==='己');
 const visibleOutput=output.some(x=>x.stem==='乙');
 const onlyOfficial=correctMonth&&visibleOfficer&&visibleOutput&&
  review.observed.exactExposureScopeComparison
   .nonDayExposedHiddenStemIds.includes(main)&&
  review.observed.exactExposureScopeComparison
   .nonDayExposedHiddenStemIds.includes('natal.month.hidden.乙');
 if(!onlyOfficial)return {
  kind:'qa-chapter9-source-exact-rescue-evidence-v1',
  match:false,reason:'not-the-literal-month-officer-plus-output-case',
  readerDraft:null,assessment:null,approved:false,
  providerCalls:0,releaseVerdict:'not-approved'
 };
 if(relation.direction('乙','己')!=='left-controls-right')
  throw Error('QA_CLASSICAL_RESCUE_INCORRECT_OBSTRUCTION_DIRECTION');
 const protection=shield.filter(x=>
  relation.direction(x.stem,'乙')==='left-controls-right');
 // Require correct independent directional control, not simply a term
 // matching a printed Korean label.
 if(protection.length!==shield.length)
  throw Error('QA_CLASSICAL_RESCUE_INVALID_SHIELD_ROLE_DIRECTION');
 // This source explicitly provides 官逢傷而透印以解之 as an example,
 // but it does not warrant full chart 成格 or protection being realized.
 const state=protection.length?'present':'absent';
 const draft=texts[state];
 if(reader.errors([draft.label,draft.text]).length)
  throw Error('QA_CLASSICAL_RESCUE_READER_TERMINOLOGY');
 return {
  kind:'qa-chapter9-source-exact-rescue-evidence-v1',
  match:true,scope:'officer-output-and-visible-seal-conditional-only',
  source:{work:'子平真詮',chapter:'九、論用神成敗救應',
   url:SOURCE,rule:'官逢傷而透印以解之'},
  observed:{
   monthMainSourceId:main,officerVisibleIds:officer.map(x=>x.id),
   outputVisibleIds:output.map(x=>x.id),
   independentlyProvenProtectionIds:protection.map(x=>x.id),
   obstructionDirection:'expression-controls-officer',
   potentialProtectionDirection:state==='present'?
    'seal-controls-expression':'not-seen-in-three-visible-stems',
   consideredVisibleIds:positions.map(x=>x.id)
  },
  assessment:state==='present'?'candidate-rescue-condition-visible':
   'candidate-rescue-condition-not-visible',
  // This is a school/textually bounded source check, not a certificate
  // that the rescue works, nor a robustly computed chart-wide ranking.
  restorationEffectVerified:false,
  fullPatternAssigned:false,dayMasterStrengthAssessed:false,
  observedConflictInRealLife:false,
  cannotGeneralizeToOtherChartTypes:true,
  readerDraft:{label:draft.label,text:draft.text,
   hypotheticalScenario:true,professionallyReviewed:false,
   approvedForPaid:false},
  approved:false,providerCalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={evaluate};
