'use strict';
// One actual two-source birth-HOUR contrast for the ordinary paid writer.
// This is a computed Five-Element direction between HOUR positions, NOT
// an asserted lifetime temperament, a governing-school decision, or approval.
// Do not give this to profiles that repeat the exact hour symbol elsewhere.
const seasonal=require('./report-seasonal-evidence');
const question=require('./report-chart-contrast').monthDecisionQuestion;
const PHRASES=Object.freeze({
 resource:'안쪽 글자가 겉글자를 뒷받침하는 방향',
 output:'겉글자가 안쪽 글자를 뒷받침하는 방향',
 'control-on-day':'안쪽 글자가 겉글자를 제약하는 방향',
 'day-controls':'겉글자가 안쪽 글자를 제약하는 방향',
 'same-element':'겉글자와 안쪽 글자가 전통 분류에서 같은 성질을 가진 관계'
});
// Consumer first-chapter interpretation must explain one ASYMMETRIC
// calculated source relation rather than two glossary meanings plus
// generic checklists. Neither a birth-chart symbol nor a Five-Element
// arrow proves that an actual life event happened.
const INSTRUCTIONS=Object.freeze({
 resource:'두 질문을 나란히 적는 대신, 시간 안쪽의 질문을 해석상 출발점으로 놓았을 때 겉의 질문을 뒷받침한다는 방향이 왜 필요한지 밝힌다. 같은 출생시간에서 겉글자만 봤다면 답하지 못하는 조건을 한 개 특정한다. 이것은 현실에서 도움을 받았다는 판단이 아니다.',
 output:'겉글자의 질문에서 안쪽의 별도 질문으로 이어진다는 계산 방향을 설명한다. 안쪽 질문을 지웠을 때 사라지는 해석을 한 개 특정하고, 실제로 어떤 결과물이 완성됐다는 말은 하지 않는다.',
 'control-on-day':'시간 안쪽의 질문이 겉의 질문을 제약하는 계산 방향이다. 겉의 뜻만 읽으면 놓치는 제한 조건을 한 개 특정한다. 두 역할이 실제 마음속에서 싸운다거나 현실의 실패로 이어졌다고 해석하지 않는다.',
 'day-controls':'시간 겉글자의 질문이 안쪽의 질문을 제약하는 계산 방향이다. 안쪽의 뜻만 읽으면 놓치는 제한 조건을 한 개 특정한다. 실제 행동을 막았거나 특정 선택을 금지한다고 단정하지 않는다.',
 'same-element':'두 질문은 서로 다른 계산 자리에서 제기되지만 전통 분류상 같은 성질에 속한다. 새로운 도움·제약 방향을 만들지 않는다. 분류가 반복된다는 사실과 질문 자체가 서로 다른 사실을 한 가지 사례로 구별한다.'
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
  '’, 안쪽 글자의 질문은 ‘'+inside+'’입니다. 두 글자의 전통적 관계는 '+
  PHRASES[direction]+'입니다.';
 return Object.freeze({
  kind:'source-owned-hour-visible-hidden-element-contrast-v1',
  sourceRefs:Object.freeze(proof.sourceRefs.slice()),
  hourVisibleStem:outer.stem,hourHiddenStem:inner.stem,
  hourVisibleRole:outer.tenGod,hourHiddenRole:inner.tenGod,
  elementDirection:direction,
  symbolicQuestion,
  writerInstruction:symbolicQuestion+' '+INSTRUCTIONS[direction]+' '+
   '본문 작성 순서: 첫째, 두 출생시간 글자의 차이와 계산 방향을 독자용 한 문장으로 밝힌다. '+
   '둘째, 고객이 직접 적은 고민에서 그 관계가 추가하는 해석상 질문을 고른다. '+
   '셋째, 고객이 두 선택을 적었다면 각각 다른 문장에 실제 선택을 이름 붙이고, '+
   '앞서 계산한 같은 관계가 각 경우에서 어떤 조건을 다르게 묻게 하는지 설명한다. '+
   '선택 순서를 바꾸어도 계산 방향은 바뀌지 않으며 첫 번째 선택을 기존 일·이미 가진 재산이라고 상상하지 않는다. '+
   '넷째, 무료의 태어난 달 풀이에는 없던 판단의 경계를 한 문장으로 정리한다. '+
   '실제 사건·성격·수입·능력·결과의 우열을 출생정보로 확정하지 않는다. '+
   '출처·계산 방법·주의사항만 반복해서 분량을 채우거나 일반적인 조언 두 문장으로 끝내면 실패다. '+
   '검증된 두 출처 외에 고전 적용 우선순위를 새로 주장하지 않는다.',
  strictlySymbolic:true,
  independentClassicalMethodChosen:false,
  observedPersonalBehavior:false,
  saleApproved:false
 });
}
// Editorially reviewed applications indexed by the calculated role pair and
// direction. A matching direction alone cannot select either paragraph.
const APPLICATIONS=Object.freeze({
 'day-controls:정인:식신':{
  label:'도움을 받아 결과를 만드는 조건',
  roles:'태어난 시간의 겉글자는 안내를 받아 배우는 뜻입니다. 태어난 시간의 안쪽 글자는 배운 것을 결과물로 만드는 뜻입니다.',
  condition:'배운 방법으로 결과물을 만들려는데 막힌 부분을 물어볼 곳이 없다면, 정해진 제출 순서만 따라서는 그 부분을 끝내기 어렵다는 풀이입니다.'
 },
 'same-element:상관:식신':{
  label:'변경 제안과 결과물의 차이',
  roles:'태어난 시간의 겉글자는 기존 방식에 다른 방법을 제안하는 뜻입니다. 태어난 시간의 안쪽 글자는 결과물을 만들어 보여주는 뜻입니다.',
  condition:'작업 순서를 바꾸자고 제안했더라도, 바꾼 순서로 만든 결과물이 있어야 제안이 실제 작업에 어떤 차이를 냈는지 비교할 수 있다는 풀이입니다.'
 },
 'resource:편관:편재':{
  label:'갑작스러운 책임의 조건',
  roles:'태어난 시간의 안쪽 글자는 필요한 돈이나 물품을 마련하는 뜻입니다. 겉글자는 갑자기 생긴 요구와 책임을 살피는 뜻입니다.',
  condition:'갑작스러운 요구를 맡을 때 쓸 돈이나 물품을 마련할 길이 있는지가 책임을 감당하는 조건입니다.'
 },
 'day-controls:편인:식신':{
  label:'결과를 보여주기 전의 조건',
  roles:'태어난 시간의 겉글자는 새 정보를 이해하는 방식, 안쪽 글자는 결과물을 준비하는 순서를 가리킵니다.',
  condition:'이해가 덜 됐다면 결과물을 보여줄 순서부터 정해도 무엇을 보여줄지 기준이 비기 쉽다는 풀이입니다.'
 }
});

function composeReaderParagraph(pair,opening){
 if(!pair||!opening)return null;
 const key=[pair.elementDirection,pair.hourVisibleRole,pair.hourHiddenRole].join(':');
 if(!Object.hasOwn(APPLICATIONS,key))return null;
 const reading=APPLICATIONS[key];
 return {
  label:reading.label,
  text:[opening.text,reading.roles,reading.condition].join(' '),
  basis:{
   refs:pair.sourceRefs.slice(),
   interpretation:opening.text+' '+reading.roles,
   condition:reading.condition,
   limit:'출생시간의 두 글자를 대조한 전통 풀이의 범위이며 실제 행동이나 결과는 확인되지 않습니다.'
  }
 };
}

module.exports={build,PHRASES,INSTRUCTIONS,composeReaderParagraph};
