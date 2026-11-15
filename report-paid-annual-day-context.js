'use strict';
// Only a source-owned, limited calendar-table observation in the EXISTING
// year_2027.impact paragraph. Never invent a paid relationship chapter.
const relations=require('./report-branch-relations');
const BRANCHES='子丑寅卯辰巳午未申酉戌亥';
const MAIN=new Set(['충','육합']),MINOR=new Set(['형','파','해']);
function build(packet){
 const chart=packet?.chart,annual=packet?.targetYear?.pillar;
 const original=packet?.facts?.targetYearBranchContext?.annualContext?.day;
 if(packet?.targetYear?.year!==2027||!chart?.day||!annual||!original)
  return null;
 const day=chart.day[1],year=annual[1];
 if(!BRANCHES.includes(day)||!BRANCHES.includes(year)||
    day.length!==1||year.length!==1)throw Error('PAID_ANNUAL_DAY_INVALID_POSITION');
 const rebuilt=require('./report-branch-context').evaluate(chart,annual).annualContext.day;
 if(JSON.stringify(original)!==JSON.stringify(rebuilt))
  throw Error('PAID_ANNUAL_DAY_CONTEXT_NOT_RECALCULATED');
 const types=relations.pairRelations(day,year);
 if(JSON.stringify(types)!==JSON.stringify(original.directTypes))
  throw Error('PAID_ANNUAL_DAY_PAIR_NOT_RECALCULATED');
 const primary=types.filter(x=>MAIN.has(x));
 const secondary=types.filter(x=>MINOR.has(x));
 const mode=primary.length?'separate-chapter':
  secondary.length?'secondary-table-only':'no-direct-day-table';
 const sourceRef='facts.targetYearBranchContext.annualContext.day';
 const exactCondition='2027년 '+year+'와 출생일 '+day+
  '의 직접 관계표에서 '+(secondary.length?secondary.join('·'):'부수 관계가 없음')+
  '이 확인되었습니다. 충·육합의 독립적 관계를 뜻하지 않으며 실제 사람 사이의 사건은 계산하지 않습니다.';
 const question=mode==='separate-chapter'?
  '2027년과 출생일의 충·육합 관계는 별도의 관계 장에서만 상세히 다룬다. 기본 2027년 장에서 같은 근거를 다시 풀거나 실제 만남·이별을 예측하지 않는다.':
  mode==='secondary-table-only'?
  '2027년과 출생일의 정확한 '+secondary.join('·')+
  ' 관계표 후보를 연도 풀이의 한계로만 한 번 짧게 설명한다. 충·육합과 구별하며 전통적 우선순위·합화·관계 사건은 계산하지 않았으므로 실제 인간관계의 득실·변화를 주장하지 않는다.':
  '2027년과 출생일에서 계산된 직접 충·육합 또는 형·파·해 쌍이 없다는 것은 관계 운이 안전하거나 인간관계가 좋다는 뜻이 아니다. 빠진 관계 장을 추측으로 채우지 않는다.';
 return Object.freeze({
  kind:'verified-general-annual-day-context-scope-v1',
  chapter:'year_2027',topic:'impact',
  mode,sourceRef:mode==='secondary-table-only'?sourceRef:null,
  yearBranch:year,dayBranch:day,
  primary:Object.freeze(primary),secondary:Object.freeze(secondary),
  computedCondition:mode==='secondary-table-only'?exactCondition:null,
  readerBoundary:question,
  relationStrengthAssessed:false,transformationAssessed:false,
  personalRelationshipOutcomeObserved:false,
  independentPaidRelationshipChapter:mode==='separate-chapter',
  additionalPaidTopic:false
 });
}
module.exports={build};
