'use strict';
// Editorial rejection ONLY. Exact source refs and basis.condition can be
// truthful even when the PAID CUSTOMER TEXT is unrelated filler.
// Narrowly require the two ALREADY-VERIFIED role families when a source-owned
// paid money/workstyle comparison exists. Do not demand a stock example,
// keyword "example", fixed word count or forecast an actual person's traits.
// A passed lexical check is NEVER a professional interpretation approval.
const WORDS=Object.freeze({
 '식신':/(?:완성|제작|만들|생산|결과물|산출물|납품|제공|표현한\s*결과)/,
 '상관':/(?:개선|변경|바꾸|달리\s*(?:설명|표현|제안)|새로운?\s*(?:제안|방법)|다른\s*절차|기존\s*방법|방식의?\s*변화)/,
 '정재':/(?:대가|가격|비용|예산|지출|지급|대금|재료비|운영\s*자원|자금|관리할\s*(?:돈|자원)|자원(?:을|의)?\s*(?:관리|운용)|거래\s*조건)/,
 '편재':/(?:대가|거래|외부\s*(?:자원|기회)|확보|투입\s*(?:자금|자원)|필요한\s*자원|자금|매출|판매)/,
 '정인':/(?:배우|익히|학습|지침|교육|조언|지원|설명|안내|절차를\s*이해)/,
 '편인':/(?:이해|해석|낯선\s*(?:방법|자료|과제)|새로운?\s*(?:방법|자료)|비교해\s*배우|다른\s*(?:접근|관점)|원리)/,
});
const CONDITIONAL=/(?:반면|반대로|하지만|그러나|그렇지만|없(?:으면|다면|는\s*경우)|빠지(?:면|기\s*때문)|한쪽|첫\s*번째|둘째|앞의\s*조건|뒤의\s*조건|서로\s*다른|각각|차이|구별|대조|와\s*달리|일\s*때와)/;
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
 if(!CONDITIONAL.test(text))return 'missing-two-sided-reading-difference';
 return null;
}
module.exports={inspect};
