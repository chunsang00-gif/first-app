'use strict';
// Two further LITERAL Chapter 11 situations from Zi Ping Zhen Quan:
// 戊生申月, 庚壬並透 (食生財), and 壬生未月, 乙己並透 (傷官剋官).
// QA-only: these are comparisons of computed symbolic roles, not full
// traditional pattern assignments or psychological/career predictions.
const month=require('./report-core-paid-natal-month-method-review');
const binding=require('./report-fact-bindings');
const {direction}=require('./report-core-paid-natal-visible-relation-bridge');
const policy=require('./report-reader-policy');
const SOURCE='https://libokang.com/zh-hant/classics/bazi/%E5%AD%90%E5%B9%B3%E7%9C%9F%E8%A9%AE%E5%8E%9F%E6%96%87/';
const RULES=[
 {
  id:'wu-shen-geng-ren-food-generates-wealth',
  day:'戊',month:'申',main:'庚',other:'壬',otherHidden:'戊',
  mainRole:'식신',otherRole:'편재',
  expectedDirection:'left-generates-right',
  relation:'creative-symbol-generates-resource-symbol',
  label:'새로운 결과를 만드는 일과 자원을 살피는 일',
  paragraph:'이 사주에서 태어난 달의 안쪽에는 결과를 만들어 밖으로 내놓는 뜻과 자원을 관리하는 뜻이 함께 있습니다. 두 글자가 태어난 달과 시간의 겉에 각각 드러나는 조건을 확인했습니다. 고전의 이 사례에서는 앞의 뜻이 뒤의 뜻을 돕는 관계로 설명됩니다. 이를 실제 상황에 빗대면 새로운 결과물을 준비할 때 사용할 사람과 도구를 함께 검토하는 장면이 됩니다. 다만 이런 계산 관계로 실제 창의력이나 수입을 평가할 수는 없습니다. 두 글자 가운데 하나가 겉에서 확인되지 않거나 달이 다르면 지금의 설명을 적용하지 않습니다. 출생 자리 사이의 다른 관계가 이 해석에 어떤 영향을 주는지도 아직 검증되지 않았습니다.'
 },
 {
  id:'ren-wei-yi-ji-output-opposes-authority',
  day:'壬',month:'未',main:'己',other:'乙',otherHidden:'丁',
  mainRole:'정관',otherRole:'상관',
  expectedDirection:'left-controls-right',
  relation:'expression-symbol-controls-duty-symbol',
  label:'새로운 제안과 기존 기준의 관계',
  paragraph:'이 사주에서는 태어난 달 안쪽의 규칙을 지키는 뜻과 밖으로 표현하는 뜻이 각각 달과 시간의 겉에 드러납니다. 고전의 이 사례는 두 글자가 서로 제약하는 관계라고 설명합니다. 이를 실제 상황에 빗대면 익숙한 작업 기준에 새로운 방식을 제안할 때 무엇을 바꾸고 무엇을 유지할지 비교하는 장면이 됩니다. 새로운 제안이 무조건 충돌을 일으킨다거나 규칙에 반발하는 사람이라는 뜻은 아닙니다. 한 글자라도 겉에 드러나지 않거나 태어난 달이 달라지면 이 고전 사례의 조건은 성립하지 않습니다. 다른 출생 자리까지 합쳐 실제로 어느 쪽이 더 중요해지는지는 별도 검토가 필요합니다.'
 }
];
function evaluate(packet){
 const review=month.assess(packet);
 const matched=[];
 const {chart}=packet;
 const sources=Object.fromEntries(binding.build(packet).map(x=>[x.id,x]));
 const candidates=review.observed.exactExposureScopeComparison
   .nonDayExposedHiddenStemIds;
 const monthStems=review.observed.hiddenStemSourceIds;
 for(const r of RULES){
  if(chart.day[0]!==r.day||chart.month[1]!==r.month)continue;
  const main='natal.month.hidden.'+r.main;
  const other='natal.month.hidden.'+r.other;
  const third='natal.month.hidden.'+r.otherHidden;
  if(review.observed.mainHiddenStemSourceId!==main||
     !monthStems.includes(main)||!monthStems.includes(other)||
     !monthStems.includes(third))
   throw Error('QA_CLASSICAL_CH11_STEM_ORDER_DIVERGED');
  // Only consider exposure through year, month or hour, never day master.
  // A competing third exposed stem makes this narrow example unsuitable.
  if(!candidates.includes(main)||!candidates.includes(other)||
     candidates.some(id=>id!==main&&id!==other))continue;
  const visible=packet.facts.stemConnections.exposure;
  const detail=[main,other].map(id=>visible.find(x=>x.hiddenId===id));
  if(detail.some(x=>!x||x.exactExposure!==true||
      !x.exactVisibleMatches?.some(v=>v.id!=='natal.day.stem')))
   throw Error('QA_CLASSICAL_CH11_EXPOSURE_MISMATCH');
  const usedRefs=[...new Set(['natal.day.stem',main,other,
   ...detail.flatMap(x=>x.exactVisibleMatches
    .filter(v=>v.id!=='natal.day.stem').map(v=>v.id)),
   'facts.stemConnections','facts.natalBranchRelations'])];
  if(sources[main]?.tenGod!==r.mainRole||
     sources[other]?.tenGod!==r.otherRole||
     sources[main]?.stem!==r.main||sources[other]?.stem!==r.other||
     direction(r.id.startsWith('wu-')?r.main:r.other,
      r.id.startsWith('wu-')?r.other:r.main)!==r.expectedDirection)
   throw Error('QA_CLASSICAL_CH11_ROLE_OR_RELATION_DIVERGED');
  if(policy.errors([r.label,r.paragraph]).length)
   throw Error('QA_CLASSICAL_CH11_VISIBLE_COPY_INVALID');
  matched.push({
   id:r.id,kind:'qa-chapter11-exact-symbolic-relation-v1',
   sourceWork:'子平真詮',sourceChapter:'十一、論用神純雜',
   sourceUrl:SOURCE,
   matchedDayStem:r.day,matchedMonthBranch:r.month,
   monthMainSourceId:main,secondMonthSourceId:other,
   exactExposedReferences:detail.map(x=>({
    hiddenSourceId:x.hiddenId,
    visibleSourceIds:x.exactVisibleMatches.filter(v=>v.id!=='natal.day.stem')
     .map(v=>v.id)
   })),
   sourceRefs:usedRefs,sourceTextualRelation:r.relation,
   sourceExampleOnly:true,finalPatternConfirmed:false,
   favourableOrUnfavourableDestinyInferred:false,
   personalityOrCareerOutcomeInferred:false,
   conflictWithOtherRulesNotResolved:true,
   writerDraft:{label:r.label,text:r.paragraph,
    clientApproved:false,professionalReviewComplete:false},
   traditionalSchoolAdopted:false,providerCalls:0,releaseVerdict:'not-approved'
  });
 }
 if(matched.length>1)throw Error('QA_CLASSICAL_CH11_OVERLAPPING_EXAMPLES');
 return {
  kind:'qa-extra-chapter11-source-examples-v1',
  examples:matched,
  sourceMatched:matched.length===1,
  fullChartVerdict:'not-assessed',
  humanSpecialistReviewRequired:true,
  clientReleaseAllowed:false,
  productionRulesChanged:false,
  providerCalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={evaluate};
