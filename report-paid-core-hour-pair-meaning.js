'use strict';
// One actual two-source birth-HOUR contrast for the ordinary paid writer.
// This is a computed Five-Element direction between HOUR positions, NOT
// an asserted lifetime temperament, a governing-school decision, or approval.
// Do not give this to profiles that repeat the exact hour symbol elsewhere.
const seasonal=require('./report-seasonal-evidence');
const question=require('./report-chart-contrast').monthDecisionQuestion;
const PHRASES=Object.freeze({
 resource:'안쪽 글자가 겉글자를 낳는 방향',
 output:'겉글자가 안쪽 글자를 낳는 방향',
 'control-on-day':'안쪽 글자가 겉글자를 제약하는 방향',
 'day-controls':'겉글자가 안쪽 글자를 제약하는 방향',
 'same-element':'두 글자가 같은 오행인 관계'
});
const INSTRUCTIONS=Object.freeze({
 resource:'안쪽의 질문을 검토하지 않으면 겉에서 말하는 질문을 뒷받침하는 조건이 빠진다는 상징적 순서를 설명한다.',
 output:'겉의 질문과 안쪽에서 새로 제기되는 질문을 순서대로 구별한다. 실제로 무언가가 완성됐다는 말은 하지 않는다.',
 'control-on-day':'안쪽에서 읽는 질문이 겉의 질문을 제한한다고 가정하면 각각 무엇을 달리 확인해야 하는지 설명한다.',
 'day-controls':'겉의 질문이 안쪽에서 새로 제기되는 질문을 제한한다고 가정하면 각각 무엇을 달리 확인해야 하는지 설명한다.',
 'same-element':'두 분류의 질문은 구별하되 같은 오행이라는 이유로 영향이 두 배이거나 서로 돕고 막는다고 만들지 않는다.'
});
function build(packet,source,proof){
 if(!proof)return null;
 if(proof.kind!=='buyer-choice-hour-symbolic-extension-v1'||
    proof.wholeNatalCategoryDistinct!==true||
    !Array.isArray(proof.repeatedExactStemNatalRefs)||
    proof.repeatedExactStemNatalRefs.length!==0||
    proof.classicalPriorityApproved!==false||
    proof.premiumValueApproved!==false||
    proof.realAbilityObserved!==false||
    !Array.isArray(proof.sourceRefs)||proof.sourceRefs.length!==2||
    proof.sourceRefs[0]!=='natal.hour.stem'||
    !/^natal\.hour\.hidden\.[甲乙丙丁戊己庚辛壬癸]$/.test(proof.sourceRefs[1]))
  return null;
 const [outerId,innerId]=proof.sourceRefs;
 const outer=source?.[outerId],inner=source?.[innerId];
 const hourStem=packet?.chart?.hour?.[0],hourBranch=packet?.chart?.hour?.[1];
 if(packet?.status!=='ready'||!outer||!inner||
    outer.stem!==hourStem||inner.stem!==innerId.split('.').at(-1)||
    inner.position!=='시지'||outer.position!=='시간'||
    outer.tenGod!==proof.hourVisibleRole||
    inner.tenGod!==proof.hourHiddenRole||
    !seasonal.HIDDEN[hourBranch]?.includes(inner.stem)||
    !seasonal.ELEMENTS[outer.stem]||!seasonal.ELEMENTS[inner.stem])
  throw Error('PAID_HOUR_PAIR_SOURCE_NOT_VERIFIED');
 // relation(a,b) asks how A relates to B. The first is the INNER
 // symbol, the second OUTER. Reversing the arguments reverses generation
 // and control and would produce a false interpretive direction.
 const direction=seasonal.relation(
  seasonal.ELEMENTS[inner.stem],seasonal.ELEMENTS[outer.stem]);
 if(!PHRASES[direction]||!INSTRUCTIONS[direction])
  throw Error('PAID_HOUR_PAIR_DIRECTION_NOT_SUPPORTED');
 const outside=question(outer.tenGod),inside=question(inner.tenGod);
 if(!outside||!inside)throw Error('PAID_HOUR_PAIR_MEANING_MISSING');
 const symbolicQuestion='출생시간 겉글자의 전통적 질문은 ‘'+outside+
  '’, 안쪽 글자의 질문은 ‘'+inside+'’입니다. 두 글자의 오행 관계는 '+
  PHRASES[direction]+'입니다.';
 return Object.freeze({
  kind:'source-owned-hour-visible-hidden-element-contrast-v1',
  sourceRefs:Object.freeze(proof.sourceRefs.slice()),
  hourVisibleStem:outer.stem,hourHiddenStem:inner.stem,
  hourVisibleRole:outer.tenGod,hourHiddenRole:inner.tenGod,
  elementDirection:direction,
  symbolicQuestion,
  writerInstruction:symbolicQuestion+' '+INSTRUCTIONS[direction]+' '+
   '이 두 분류를 말만 바꾸어 반복하지 말고 고객이 실제 적은 한 고민에 적용한다. '+
   '명리의 계산 관계를 개인의 실제 능력이나 두 선택의 결과라고 단정하지 않는다. '+
   '검증된 두 출처 외에 사주 우선순위나 고전 적용을 새로 주장하지 않는다.',
  strictlySymbolic:true,
  independentClassicalMethodChosen:false,
  observedPersonalBehavior:false,
  saleApproved:false
 });
}
module.exports={build,PHRASES,INSTRUCTIONS};
