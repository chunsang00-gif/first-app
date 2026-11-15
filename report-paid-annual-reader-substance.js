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
// Annual money/career premium paragraphs are not a second generic yearly
// summary. Only an independently sourced DIFFERENT subtype can be sold;
// this checks that both meanings and the difference reach reader prose.
const SUBTYPES=Object.freeze({
 '정재':/(?:꾸준히\s*관리|반복(?:되는)?\s*비용|예산|지출|유지할\s*비용)/,
 '편재':/(?:외부\s*(?:자원|기회|거래)|여러\s*곳|확보|거래|자원을\s*활용)/,
 '식신':/(?:결과물|완성|만들|제작|생산|표현한\s*결과)/,
 '상관':/(?:바꾸|개선|제안|다른\s*(?:방법|절차)|기존\s*(?:방식|규칙))/,
 '정관':/(?:규칙|규정|정해진\s*(?:역할|절차)|승인|맡은\s*역할)/,
 '편관':/(?:압박|긴급|갑작스러운\s*요구|예상\s*밖|외부\s*요구)/,
 '정인':/(?:배우|배움|학습|조언|도움|지원|가르침)/,
 '편인':/(?:낯선\s*(?:정보|내용|자료|방법)|자기\s*방식으로\s*이해|스스로\s*이해|다른\s*관점)/
});
const NATAL_CONTEXT=/(?:태어난|출생|당시|기존|이전|원래)/;
const COMPARISON=/(?:다르|차이|비교|구별|달리|반면|반대로|한편|이에\s*비해)/;
function inspect(paragraph,chapterId,topicId,task){
 if(!paragraph||typeof paragraph.text!=='string')return null;
 if(['year_2027_money','year_2027_career'].includes(chapterId)&&
    topicId==='change'&&task?.sourceOwnedAnnualReading){
  const owned=task.sourceOwnedAnnualReading;
  if(owned.kind!=='source-owned-annual-domain-reading-v1'||
     owned.chapter!==chapterId||owned.topic!==topicId||
     owned.noEventPrediction!==true||
     owned.relativeStrengthAssessed!==false||
     owned.annualSource?.tenGod===owned.natalSource?.tenGod||
     !SUBTYPES[owned.annualSource?.tenGod]||
     !SUBTYPES[owned.natalSource?.tenGod])
   throw Error('PAID_ANNUAL_SUBTYPE_SOURCE_UNVERIFIED');
  const content=nonLimit(paragraph.text);
  if(!SUBTYPES[owned.annualSource.tenGod].test(content)||
     !SUBTYPES[owned.natalSource.tenGod].test(content))
   return 'annual-vs-birth-role-meanings-missing-from-paid-reader';
  if(!contextYear.test(content)||!NATAL_CONTEXT.test(content)||
     !COMPARISON.test(content))
   return 'annual-vs-birth-subtype-difference-not-explained';
  return null;
 }
 if(chapterId!=='year_2027')return null;
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
