'use strict';
// REJECTION-ONLY customer-prose check for the two EXISTING 2027 topics.
// A true citation and locked condition must not make vague advice into
// an interpretation. These broad synonym lists are NOT a traditional
// expert's approval or a claim about the customer's real behavior.
const ROLES=Object.freeze({
 비견:/(?:자기\s*(?:몫|역할|입장)|스스로|동등|같은\s*(?:역할|자리)|함께\s*맡|나의\s*역할)/,
 겁재:/(?:경쟁|협력|분담|각자의\s*몫|함께\s*(?:나누|쓰)|자원\s*(?:분배|배분)|몫을\s*나누)/,
 식신:/(?:완성|제작|만들|생산|결과물|표현|산출물|작업을\s*이어)/,
 상관:/(?:바꾸|개선|제안|표현|다른\s*방법|기존\s*(?:방법|방식|규칙)|새로운\s*방법|틀을\s*깨)/,
 정재:/(?:관리|유지|예산|비용|지출|대가|자원|거래|정기적\s*사용)/,
 편재:/(?:자원|거래|외부\s*(?:기회|물품)|활용|확보|자금|판매|대가|외부\s*활동)/,
 정관:/(?:규칙|규정|책임|절차|역할|원칙|승인|맡은\s*일)/,
 편관:/(?:압박|요구|책임|긴급|예상\s*밖|뜻밖|갑작스러운|대응|정해진\s*기한)/,
 정인:/(?:배우|배움|학습|도움|지원|보호|익히|가르침|지도|설명을\s*듣)/,
 편인:/(?:이해|해석|낯선|다른\s*관점|정보|자료를\s*(?:살피|읽)|나름대로\s*익히)/
});
const NOT_MEANING=/(?:알\s*수\s*없|단정할\s*수\s*없|확정할\s*수\s*없|보장하지\s*않|예측하지\s*않|뜻은\s*아니|증명하지\s*않)/;
const ADVICE=/(?:확인|검토|살펴|점검|정리|계획|비교|고려|준비).{0,22}(?:해야|하세요|필요|중요|바람직|좋습니다|우선입니다|권합니다)/;
const contextYear=/(?:2027\s*년|그해|그\s*해|해당\s*연도|그\s*연도|세운|한\s*해)/;
const contextDay=/(?:태어난\s*날|출생일|일지|날의\s*지지|태어날\s*때의\s*날)/;
const relationMeaning=/(?:관계|마주|부딪|어긋|엇갈|얽히|맞물리|거리|형|파|해)/;
function nonLimit(text){
 return String(text||'').split(/[.!?。！？\n]+/)
  .map(x=>x.trim()).filter(x=>x.length>8&&!NOT_MEANING.test(x)).join(' ');
}
function inspect(paragraph,chapterId,topicId,task){
 if(chapterId!=='year_2027'||!paragraph||typeof paragraph.text!=='string')return null;
 const text=paragraph.text,content=nonLimit(text);
 if(topicId==='change'&&task?.sourceOwnedAnnualIntegratedScope){
  const god=task.sourceOwnedAnnualIntegratedScope.annualGod;
  if(!ROLES[god])throw Error('PAID_ANNUAL_READABLE_ROLE_UNVERIFIED');
  if(!ROLES[god].test(content))
   return 'annual-role-meaning-not-explained-in-reader-prose';
  // Even a correct role noun in one disclaimer cannot rescue text
  // consisting entirely of stock instructions about checking plans.
  const sentences=content.split(/[.!?。！？\n]+/).filter(x=>x.trim().length>=12);
  if(sentences.length>0&&sentences.every(x=>ADVICE.test(x))&&
     !/(?:2027|태어난|출생|겉글자|해당\s*연도|그\s*해)/.test(content))
   return 'only-generic-advice-no-specific-yearly-reading';
 }
 const day=task?.sourceOwnedAnnualDayContext;
 if(topicId==='impact'&&day?.mode==='secondary-table-only'){
  if(!contextYear.test(content)||!contextDay.test(content)||
     !relationMeaning.test(content))
   return 'secondary-day-relation-not-explained-in-reader-prose';
 }
 return null;
}
module.exports={inspect};
