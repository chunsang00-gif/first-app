'use strict';
// Work39: source-owned SEASON-versus-visible-month question in the existing
// OPTIONAL normal paid first-chapter paragraph. This is not a new topic,
// a traditional-method verdict, or an observed customer trait.
const calendar=require('./report-seasonal-evidence');
const SEASON=Object.freeze({spring:'봄',summer:'여름',autumn:'가을',winter:'겨울'});
const REL=Object.freeze({
 'same-element':'같은 오행','resource':'태어난 날을 생하는 오행',
 output:'태어난 날에서 생하는 오행','control-on-day':'태어난 날을 극하는 오행',
 'day-controls':'태어난 날에서 극하는 오행'
});
const REQUIRED=['facts.seasonalEvidence','facts.qiEvidence','natal.month.stem'];
function build(packet,allowed,source){
 if(packet?.status!=='ready'||!Array.isArray(allowed)||!source)return null;
 if(REQUIRED.some(id=>!allowed.includes(id)||!Object.hasOwn(source,id)))return null;
 const observed=calendar.evaluate(packet.chart),s=packet.facts?.seasonalEvidence;
 const q=packet.facts?.qiEvidence,paidS=source['facts.seasonalEvidence'];
 const paidQ=source['facts.qiEvidence'],monthRow=source['natal.month.stem'];
 const current=q?.entries?.find(x=>x.id==='natal.month.stem'&&x.layer==='visible');
 const outgoing=paidQ?.entries?.find(x=>x.id==='natal.month.stem'&&x.layer==='visible');
 const fields=['monthBranch','monthSeason','monthPhase','dayStem',
  'dayElement','seasonToDayRelation','coreSeasonElement'];
 if(!s||!q||!current||!outgoing||!paidS||
    fields.some(key=>JSON.stringify(observed[key])!==JSON.stringify(s[key])||
      JSON.stringify(s[key])!==JSON.stringify(paidS[key]))||
    !SEASON[s.monthSeason]||
    !REL[current.relation]||
    !['core','transition'].includes(s.monthPhase)||
    q.strengthVerdict!=='not-assessed'||
    current.position!=='month'||current.stem!==packet.chart.month[0]||
    current.relation!==calendar.relation(calendar.ELEMENTS[current.stem],s.dayElement)||
    JSON.stringify(current)!==JSON.stringify(outgoing)||
    monthRow?.stem!==current.stem||monthRow?.position!=='월간'||
    current.observed!=='calculated-symbol'||
    paidQ?.strengthVerdict!=='not-assessed')
  throw Error('PAID_CORE_SEASONAL_WRITER_SOURCE_DRIFT');
 const transition=s.monthPhase==='transition';
 if((transition&&s.seasonToDayRelation!=='transitional-month-unresolved')||
    (!transition&&!REL[s.seasonToDayRelation]))
  throw Error('PAID_CORE_SEASONAL_PRIORITY_NOT_VERIFIED');
 const distinct=!transition&&s.seasonToDayRelation!==current.relation;
 const seasonalQuestion=transition?
  '태어난 달은 명리상 '+SEASON[s.monthSeason]+'의 전환월입니다. 여기서는 계절의 우세 오행을 확정하지 않았습니다.':
  '태어난 달은 '+SEASON[s.monthSeason]+'의 중심 달로 계산되며, '+ 
   '계절 오행과 태어난 날의 관계는 ‘'+REL[s.seasonToDayRelation]+'’입니다.';
 const visibleQuestion='같은 출생월의 겉글자와 태어난 날의 관계는 ‘'+
   REL[current.relation]+'’로 별도 계산됐습니다.';
 const boundary=transition?
  '계절의 우세가 미확정이므로 계절이 태어난 날을 돕거나 누른다고 해석하지 않습니다. '+
   '겉글자에서 확인된 관계를 계절 전체의 관계인 것처럼 바꾸지 않습니다.':
  distinct?
  '계절과 겉글자는 서로 다른 방향으로 분류됩니다. '+
   '이 차이는 출생 위치별 계산 근거의 차이이며 성격이 두 가지로 갈린다는 뜻이 아닙니다.':
  '계절과 겉글자의 방향이 같지만 서로 독립적인 강도 증거 두 개로 더하지 않습니다.';
 const outcome=transition?'not-resolved-seasonal-contrast':
  distinct?'distinct-season-vs-visible-relationship':'same-relationship-no-extra-effect';
 const readerWritingGoal=seasonalQuestion+' '+visibleQuestion+' '+boundary+
  ' 이 근거가 출생월 두 십성 뜻풀이와 구별되는지 먼저 판단하고, '+
  '다른 설명이 있을 때에만 계절 배경과 겉글자의 관계를 한 문단으로 읽습니다. '+
  '실제 성격·능력·운의 강약·성공을 예측하거나 가짜 대립을 만들지 않습니다. '+
  '새로운 독립 해석이 없으면 선택 문단은 null입니다.';
 return Object.freeze({
  kind:'paid-core-verified-season-vs-visible-question-v1',
  chapter:'saju_core',topic:'temperament',
  refs:Object.freeze(REQUIRED.slice()),
  scope:outcome,monthPhase:s.monthPhase,
  seasonalRelation:s.seasonToDayRelation,
  visibleRelation:current.relation,
  addsDifferentCalculatedQuestion:distinct,
  readerWritingGoal,
  realizedRelationship:false,
  strengthEstablished:false,
  humanInterpretiveMethodApproved:false,
  customerPremiumValueApproved:false,
  extraPaidTopic:false
 });
}
module.exports={build};
