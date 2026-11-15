'use strict';
// Reader-facing reason why a separately billable 2027 domain chapter is
// absent. No inference about real-life income, profession or relationships.
// Do not imply that the natal (non-annual) domain is uninterpretable.
const core=require('./report-interpretation-core');
function explain(packet,chapter){
 if(!['year_2027_money','year_2027_career','year_2027_relationship'].includes(chapter))
  return null;
 if(!packet?.facts||packet?.targetYear?.year!==2027)return null;
 if(chapter==='year_2027_relationship'){
  const day=packet.facts.targetYearBranchContext?.annualContext?.day;
  if(!day||day.eligibleForLimitedDescription===true)return null;
  return '2027년 지지와 태어난 날의 지지 사이에 별도의 관계 장을 뒷받침할 직접 충·육합 쌍이 확인되지 않았습니다. 다른 지지 관계나 실제 만남·이별의 가능성이 없다는 뜻은 아닙니다.';
 }
 const domain=chapter==='year_2027_money'?'money':'career';
 const reader=domain==='money'?'금전':'직업·배움';
 const proof=core.plan(packet,domain);
 if(proof.relevant)return null;
 const annual=packet.facts.annualTenGods;
 const isClass=core.eligibleAnnualStemGods(domain).includes(annual?.stemTenGod);
 return isClass?
  '2027년 겉글자의 '+reader+' 관련 분류는 확인되지만, 출생 당시와 별도로 설명할 같은 분류군의 세부 종류 차이가 성립하지 않아 '+reader+'의 2027년 독립 장을 제공하지 않습니다. 기존 출생 사주의 '+reader+' 풀이가 불가능하다는 뜻은 아닙니다.':
  '2027년 겉글자가 '+reader+'의 독립 해석에 필요한 분류에 속하지 않아, 출생 당시 근거와 비교하는 별도 2027년 장을 제공하지 않습니다. 숨은 글자의 의미나 기존 출생 사주의 '+reader+' 풀이가 없다는 뜻은 아닙니다.';
}
module.exports={explain};
