'use strict';
// Editorial rejection ONLY. Exact source refs and basis.condition can be
// truthful even when the PAID CUSTOMER TEXT is unrelated filler.
// Narrowly require the two ALREADY-VERIFIED role families when a source-owned
// paid money/workstyle comparison exists. Do not demand a stock example,
// keyword "example", fixed word count or forecast an actual person's traits.
// A passed lexical check is NEVER a professional interpretation approval.
const WORDS=Object.freeze({
 '식신':/(?:완성|제작|만들|생산|결과물|산출물|납품|제공|표현한\s*결과)/,
 '상관':/(?:개선|변경|바꾸|기존\s*(?:절차|방식|방법)(?:를|을)\s*바꿀|달리\s*(?:설명|표현|제안)|새로운?\s*(?:제안|방법)|새\s+방법|제안한\s+방법|다른\s*절차|기존\s*방법|방식의?\s*변화)/,
 '정재':/(?:대가|가격|비용|예산|지출|지급|대금|재료비|운영\s*자원|자금|관리할\s*(?:돈|자원)|자원(?:을|의)?\s*(?:관리|운용)|거래\s*조건)/,
 '편재':/(?:대가|거래|외부\s*(?:자원|기회)|확보|투입\s*(?:자금|자원)|필요한\s*자원|자금|매출|판매)/,
 '정인':/(?:배우|익히|학습|지침|교육|조언|지원|설명|안내|절차를\s*이해)/,
 '편인':/(?:이해|해석|낯선\s*(?:방법|자료|과제)|새로운?\s*(?:방법|자료)|비교해\s*배우|다른\s*(?:접근|관점)|원리)/,
});
const CONDITIONAL=/(?:반면|반대로|하지만|그러나|그렇지만|없(?:으면|다면|는\s*경우)|빠지(?:면|기\s*때문)|머물면[^.!?\n]{0,70}비고|한쪽|첫\s*번째|둘째|앞의\s*조건|뒤의\s*조건|서로\s*다른|같은\s*질문이\s*아닙니다|각각|차이|구별|대조|와\s*달리|일\s*때와)/;
const SUPPORTED=Object.freeze({
 'money.earning':'earnedValueConditionalReading',
 'career.workstyle':'careerWorkstyleCondition'
});
function inspect(paragraph,chapterId,topicId,thesis){
 const key=chapterId+'.'+topicId,owner=SUPPORTED[key];
 const evidence=owner&&thesis?.[owner];
 if(!evidence)return null;
 const text=String(paragraph?.text||'');
 const categories=evidence.categories;
 if(!Array.isArray(categories)||categories.length!==2||
    categories.some(k=>!WORDS[k]))
  throw Error('PAID_SOURCE_MEANING_FAMILY_UNVERIFIED:'+key);
 const [a,b]=categories.map(k=>WORDS[k].test(text));
 if(!a||!b)return 'missing-chart-specific-role-meanings';
 const pairedOmission=/만\s*보면[^.!?。！？\n]{0,65}빠(?:지|질)[^.!?。！？\n]{0,50}만\s*보면/;
 if(!CONDITIONAL.test(text)&&!pairedOmission.test(text))
  return 'missing-two-sided-reading-difference';
 return null;
}
function composeRecurringCostReading(thesis,refs){
 const pair=thesis?.sourceRoles;
 const relation=thesis?.sourceElementRelation;
 if(!Array.isArray(pair)||pair.length!==2||!Array.isArray(refs)||refs.length!==2||
    pair[0].ref!=='natal.day.hidden.壬'||pair[0].tenGod!=='상관'||
    pair[1].ref!=='natal.month.hidden.甲'||pair[1].tenGod!=='정재'||
    relation?.elementalDirection!=='resource'||relation.realizedEffect!==false||
    relation.predictedIncomeOrBehavior!==false||
    !pair.every((role,i)=>relation.refs?.[i]===role.ref&&refs.includes(role.ref)))
  return null;
 const reasoning='태어난 날의 안쪽 글자는 기존 제품을 개선해 다른 결과물을 내놓는 뜻이고, 달의 안쪽 글자는 반복해서 드는 비용을 다루는 뜻입니다. 계산에서는 날의 안쪽 글자가 달의 안쪽 글자를 돕습니다.';
 const condition='새 제품을 계속 납품한다면 한 번 납품할 수 있는지만으로는 부족합니다. 받은 대가에서 다음 물량을 만들 재료비와 제작비가 남는지 봅니다. 반면 비용만 맞춰 놓고 기존 제품과 달라진 점이 없다면 새 납품 단가를 설명할 근거가 약하다는 풀이입니다.';
 return {label:'첫 납품과 반복 납품의 차이',text:reasoning+' '+condition,interpretation:reasoning};
}

function composeWorkMethodReading(thesis,refs){
 const pair=thesis?.sourceRoles, relation=thesis?.sourceElementRelation;
 if(!Array.isArray(pair)||pair.length!==2||!Array.isArray(refs)||refs.length!==2||
    pair[0].ref!=='natal.year.hidden.己'||pair[0].tenGod!=='편인'||
    pair[1].ref!=='natal.day.hidden.壬'||pair[1].tenGod!=='상관'||
    relation?.elementalDirection!=='control-on-day'||relation.realizedEffect!==false||
    relation.predictedIncomeOrBehavior!==false||
    !pair.every((role,i)=>relation.refs?.[i]===role.ref&&refs.includes(role.ref)))
  return null;
 const reasoning='태어난 해의 안쪽 글자는 낯선 방법의 원리를 이해하는 뜻이고, 날의 안쪽 글자는 기존 방식을 바꾸는 뜻입니다. 계산에서는 해의 안쪽 글자가 날의 안쪽 글자를 제약합니다.';
 const condition='작업 순서를 바꾼다면, 기존 순서가 어떤 오류를 막으려 했는지 알아야 새 방법을 시험할 기준이 생깁니다. 반면 이유만 이해하고 바꾼 순서로 작업한 결과를 비교하지 않으면 실제로 달라진 점을 판단하기 어렵다는 풀이입니다.';
 return {label:'새 작업 방법을 시험할 조건',text:reasoning+' '+condition,interpretation:reasoning};
}
module.exports={inspect,composeRecurringCostReading,composeWorkMethodReading};
