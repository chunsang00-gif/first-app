'use strict';
// Actual normal first-chapter CANDIDATE from an independently verified
// YEAR visible stem; the customer question is context, never natal proof.
// Deliberately narrower than the DEV V2 exploration: no combination, exact
// exposure, classical priority, day/hour trait or predicted outcome claims.
const selectedDomain=require('./report-paid-core-hour-extension');
const context=require('./report-paid-core-depth-v2');
const direction=require('./report-core-paid-natal-visible-relation-bridge');
function build(packet,source){
 if(packet?.status!=='ready'||packet.calculationInput?.unknownBirthTime===true||
    !packet.chart?.hour)return null;
 const choice=selectedDomain.domainFor(packet.person?.readerDecision);
 if(!choice)return null;
 const [readerDomain,domain]=choice;
 const verified=context.build(packet);
 // Never take a year candidate over a separately qualified exact exposure
 // or a scoped classical clause. No unsupported priority decision.
 if(verified.readerContrast||verified.readerClassicalScope||
    verified.readerAlternative?.visiblePosition!=='natal.year.stem')return null;
 const a=verified.readerAlternative;
 if(a.kind!=='verified-distinct-visible-category-conditional-comparison-v1'||
    a.linkageKind!=='different-visible-role-not-exact-month-hidden-exposure'||
    a.exactMonthHiddenExposure!==false||
    a.independentMethodPriorityVerified!==false||
    a.realizedDirectionEffectVerified!==false||
    a.prioritizationVerified!==false||a.approvedForSale!==false||
    !domain.roles.includes(a.otherRole))return null;
 const ids=a.sourceRefs;
 const main=a.mainMonthId;
 const expected=['natal.month.stem',main,'natal.year.stem','facts.stemConnections'];
 const rows=source||{};
 const year=rows['natal.year.stem'],primary=rows[main];
 if(JSON.stringify(ids)!==JSON.stringify(expected)||
    !ids.every(id=>Object.hasOwn(rows,id))||
    year?.position!=='연간'||year.stem!==packet.chart.year[0]||
    year.tenGod!==a.otherRole||!year.traditionalMeaning||
    year.observedBehavior!==false||primary?.tenGod!==a.mainRole||
    primary?.observedBehavior!==false||
    a.monthMainToExposedElementDirection!==direction.direction(primary.stem,year.stem)||
    a.readerWritingPlan?.approvedForSale!==false)
  throw Error('CORE_YEAR_VISIBLE_EXTENSION_SOURCE_DRIFT');
 // The input question can provide a setting for a comparison, but not
 // independent evidence of actual temperament, financial success or stress.
 return Object.freeze({
  kind:'buyer-question-year-visible-role-addition-v1',readerDomain,
  sourceRefs:Object.freeze(ids.slice()),yearSourceId:'natal.year.stem',
  mainMonthId:main,yearRole:year.tenGod,mainRole:primary.tenGod,
  elementDirection:a.monthMainToExposedElementDirection,
  distinctFromFreeMonth:true,exactHiddenExposureClaimed:false,
  priorityEstablished:false,realLifeObserved:false,
  actualOutcomePredicted:false,professionalApproved:false,
  premiumValueApproved:false,extraPaidTopic:false,
  readerGoal:'태어난 해 겉글자의 다른 전통 분류 '+year.tenGod+
   '는 '+domain.meanings[year.tenGod]+'과 관련됩니다. '+
   '출생월 기본 풀이에서 다룬 '+primary.tenGod+
   '와 다른 뜻이며 해의 겉글자가 달의 속글자로 드러난 동일 글자라고 주장하지 않습니다. '+
   '고객이 직접 적은 '+domain.label+' 고민에 맞춰 '+domain.compare+' '+
   '서로 다른 선택 조건 두 개를 쉬운 한국어로 구별하되 실제 선택이나 결과를 예언하지 않습니다. '+
   '원문에는 출생 해의 위치와 해당 의미를 설명하고 출생월의 두 뜻을 다시 요약하지 않습니다. '+
   '계산 근거는 '+ids.join(' / ')+'에만 한정합니다. '+
   '격국·용신·신강약·실제 성격·우열이나 어느 쪽이 지배적인지는 판단하지 않습니다.'
 });
}
module.exports={build};
