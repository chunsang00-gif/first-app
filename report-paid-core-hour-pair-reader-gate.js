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
 // A relation that is numerically correct but omitted from the text is not
 // a reader explanation. A conflicting directional claim is even worse.
 if(directions.some(d=>d!==meaning.elementDirection))
  return ['hour-pair-element-direction-conflicts-with-calculation'];
 if(!directions.includes(meaning.elementDirection)||
    !/(?:태어난\s*시간|출생\s*시간|출생시간|시각)/.test(normalized))
  return ['hour-pair-relation-not-explained'];
 return [];
}
module.exports={inspectParagraph,DIRECTIONS};
