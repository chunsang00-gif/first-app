'use strict';
// Work88: verify that a first-chapter reader sentence reports the direction
// calculated from the two actual birth-HOUR stems, including source-ordered
// plain Korean paraphrases of birth-hour roles. Opposite directions remain
// a hard veto. This is a lexical safety
// floor, not evidence that traditional symbolism predicts real behavior.
const PHRASES=require('./report-paid-core-hour-pair-meaning').PHRASES;
const DIRECTIONS=Object.freeze({
 resource:Object.freeze([
  /안쪽\s*(?:글자|의\s*글자)?(?:가|에서)?\s*겉\s*(?:글자|의\s*글자)?(?:를|이|가)?\s*(?:낳|생겨|생성|만들)/,
  /안쪽\s*글자(?:의)?\s*(?:기운|오행)?(?:이|가)?\s*겉\s*글자(?:를)?\s*(?:생|낳)/,
  /안쪽\s*(?:글자|의\s*글자)?(?:가|에서)?\s*겉\s*(?:글자|의\s*글자)?(?:를|이|가)?\s*(?:뒷받침|받쳐|도와|힘을\s*보태)/,
  /안쪽에서\s*읽는\s*[^.!?。\n]{2,36}?질문(?:이|은)\s*겉에서\s*읽는\s*[^.!?。\n]{2,36}?질문(?:을|에)\s*(?:뒷받침|받쳐|도와)/
 ]),
 output:Object.freeze([
  /겉\s*(?:글자|의\s*글자)?(?:가|에서)?\s*안쪽\s*(?:글자|의\s*글자)?(?:를|이|가)?\s*(?:낳|생겨|생성|만들)/,
  /겉\s*글자(?:의)?\s*(?:기운|오행)?(?:이|가)?\s*안쪽\s*글자(?:를)?\s*(?:생|낳)/,
  /겉\s*(?:글자|의\s*글자)?(?:가|에서)?\s*안쪽\s*(?:글자|의\s*글자)?(?:를|이|가)?\s*(?:뒷받침|받쳐|도와|힘을\s*보태)/,
  /겉에서\s*읽는\s*[^.!?。\n]{2,36}?질문(?:이|은)\s*안쪽에서\s*읽는\s*[^.!?。\n]{2,36}?질문(?:을|에)\s*(?:뒷받침|받쳐|도와)/
 ]),
 'control-on-day':Object.freeze([
  /안쪽\s*(?:글자|의\s*글자)?(?:가|에서)?\s*겉\s*(?:글자|의\s*글자)?(?:를|이|가)?\s*(?:제약|억제|누르|제어|통제)/,
  /안쪽\s*(?:글자|의\s*글자)?(?:가|에서)?\s*겉\s*(?:글자|의\s*글자)?(?:를|에)?\s*(?:제동|제한|막)/
 ]),
 'day-controls':Object.freeze([
  /겉\s*(?:글자|의\s*글자)?(?:가|에서)?\s*안쪽\s*(?:글자|의\s*글자)?(?:를|이|가)?\s*(?:제약|억제|누르|제어|통제)/,
  /겉\s*(?:글자|의\s*글자)?(?:가|에서)?\s*안쪽\s*(?:글자|의\s*글자)?(?:를|에)?\s*(?:제동|제한|막)/
 ]),
 'same-element':Object.freeze([
  /(?:겉\s*글자.{0,24}안쪽\s*글자|안쪽\s*글자.{0,24}겉\s*글자).{0,40}(?:같은\s*(?:오행|성질|분류|종류)|동일한\s*(?:오행|성질|분류))/
 ])
});
// A natural reader paragraph can identify the two calculated HOUR roles
// in one sentence, then describe their relation by meaning in the next.
// Keep positional provenance and directional verb mandatory; NEVER accept
// "the two questions support each other" as a verified arrow.
const ROLE_WORDS=Object.freeze({
 비견:/(?:자기\s*몫|스스로\s*맡|직접\s*맡)/,
 겁재:/(?:공동\s*자원|나눌\s*몫|함께\s*쓰)/,
 식신:/(?:결과물|완성|만들어|산출)/,
 상관:/(?:새\s*방식|개선|바꾸|제안)/,
 정재:/(?:반복\s*비용|정해진\s*금액|유지\s*비용|꾸준한\s*관리)/,
 편재:/(?:자원|돈|도움|마련|조달|확보)/,
 정관:/(?:규칙|절차|정해진\s*책임|맡은\s*역할)/,
 편관:/(?:책임|요구|갑작|예외)/,
 정인:/(?:배움|조언|배운\s*내용)/,
 편인:/(?:정보|낯선\s*내용|이해)/
});
function roleMeaningRelation(text,meaning){
 const outer=ROLE_WORDS[meaning.hourVisibleRole];
 const inner=ROLE_WORDS[meaning.hourHiddenRole];
 const relation=meaning.elementDirection;
 if(!outer||!inner||relation==='same-element')return null;
 const lines=text.split(/[.!?。！？\n]+/).map(x=>x.trim()).filter(Boolean);
 const position=new RegExp('(?:겉에\\s*드러난\\s*글자|겉글자)[^.!?]{0,130}'+outer.source+
  '[^.!?]{0,130}(?:안쪽의\\s*다른\\s*글자|안쪽\\s*글자)[^.!?]{0,130}'+inner.source);
 if(!lines.some(x=>position.test(x)))return null;
 const innerFirst=relation==='resource'||relation==='control-on-day';
 const from=innerFirst?inner:outer,to=innerFirst?outer:inner;
 const verb=relation==='resource'||relation==='output'?
  '(?:뒷받침|받쳐\\s*주|힘을\\s*보태)':'(?:제약|억제|제한|제동)';
 const correct=new RegExp(from.source+'[^.!?]{0,85}'+to.source+'[^.!?]{0,60}'+verb);
 const reverse=new RegExp(to.source+'[^.!?]{0,85}'+from.source+'[^.!?]{0,60}'+verb);
 const linesWithRelation=lines.filter(x=>/(?:질문|뜻|관계|방향)/.test(x));
 if(linesWithRelation.some(x=>reverse.test(x)))return 'conflict';
 return linesWithRelation.some(x=>correct.test(x))?'correct':null;
}

function inspectParagraph(text,meaning){
 if(!meaning)return [];
 if(meaning.kind!=='source-owned-hour-visible-hidden-element-contrast-v1'||
    meaning.strictlySymbolic!==true||meaning.saleApproved!==false||
    meaning.sourceRefs?.length!==2||
    meaning.sourceRefs[0]!=='natal.hour.stem'||
    !/^natal\.hour\.hidden\.[甲乙丙丁戊己庚辛壬癸]$/.test(meaning.sourceRefs[1])||
    !Object.hasOwn(PHRASES,meaning.elementDirection))
  throw Error('PAID_HOUR_PAIR_READER_PROOF_DRIFT');
 if(typeof text!=='string'||!text.trim())return ['hour-pair-relation-not-explained'];
 const normalized=text.replace(/\s+/g,' ').trim();
 const directions=Object.entries(DIRECTIONS).filter(([,patterns])=>
  patterns.some(regex=>regex.test(normalized))).map(([direction])=>direction);
 const natural=roleMeaningRelation(normalized,meaning);
 // A relation that is numerically correct but omitted from the text is not
 // a reader explanation. A conflicting directional claim is even worse.
 if(directions.some(d=>d!==meaning.elementDirection)||natural==='conflict')
  return ['hour-pair-element-direction-conflicts-with-calculation'];
 if((!directions.includes(meaning.elementDirection)&&natural!=='correct')||
    !/(?:태어난\s*시간|출생\s*시간|출생시간|시각)/.test(normalized))
  return ['hour-pair-relation-not-explained'];
 return [];
}
module.exports={inspectParagraph,DIRECTIONS};
