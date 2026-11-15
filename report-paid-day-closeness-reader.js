'use strict';
// The selected two ORIGINAL day-branch hidden roles support two distinct
// questions in ONE hypothetical personal conversation. No partner is
// observed, and no kind of relationship outcome is computed here.
const CHECK=Object.freeze({
 비견:['함께 참여할 일과 각자의 몫','누가 어디까지 함께하기로 했는가'],
 겁재:['함께 사용할 자원과 나눌 몫','함께 쓰는 물품이나 시간을 어떻게 나누는가'],
 식신:['전하고자 하는 생각을 구체적으로 표현하는 일','상대에게 구체적으로 무엇을 말하려는가'],
 상관:['이미 정한 방식을 바꾸자는 제안','기존 약속에서 무엇을 바꾸자고 이야기할 것인가'],
 정재:['계속 관리할 공동 자원과 비용','공동 자원과 반복 비용을 어떻게 정할 것인가'],
 편재:['필요한 도움이나 물품을 외부에서 마련하는 경로','필요한 자원을 어디에서 어떤 조건으로 마련할 것인가'],
 정관:['서로 합의한 약속과 책임의 경계','기존 약속에서 누가 어떤 책임을 맡기로 했는가'],
 편관:['뜻밖의 부탁을 받아들일 책임의 범위','새로 생긴 부탁을 어디까지 맡을 수 있는가'],
 정인:['서로 필요한 조언과 설명','결정 전에 어떤 설명이나 조언을 더 들어야 하는가'],
 편인:['낯선 말을 이해하고 해석할 내용','익숙하지 않은 말의 어떤 뜻을 먼저 확인할 것인가']
});
const FAMILY=Object.freeze({
 비견:'peers',겁재:'peers',식신:'output',상관:'output',
 정재:'wealth',편재:'wealth',정관:'rules',편관:'rules',
 정인:'learning',편인:'learning'
});
const SITUATIONS=Object.freeze({
 'peers|rules':'두 사람이 앞으로 함께할 일과 약속을 정하는 가상 상황',
 'output|learning':'가까운 사람과 새 계획의 내용을 의논하는 가상 대화',
 'wealth|rules':'함께 쓰는 물품과 지킬 약속을 정하는 가상 상황',
 'peers|output':'함께 맡을 일과 의견을 나누는 가상 대화',
 'wealth|learning':'가까운 사람과 준비물과 필요한 도움을 의논하는 가상 상황',
 'output|wealth':'함께할 활동에 필요한 자원과 의견을 나누는 가상 상황'
});
function build(a,b,relation){
 const rows=[a,b];
 if(rows.some(row=>!row?.id?.startsWith('natal.day.hidden.')||
   !row.layer||!row.position||!row.stem||!CHECK[row.tenGod])||
   a.id===b.id)throw Error('PAID_CLOSENESS_DAY_SOURCE_UNVERIFIED');
 if(relation?.refs?.[0]!==a.id||relation?.refs?.[1]!==b.id||
   relation.realizedEffect!==false||relation.predictedIncomeOrBehavior!==false)
  throw Error('PAID_CLOSENESS_ELEMENT_SOURCE_DRIFT');
 const scene=SITUATIONS[FAMILY[a.tenGod]+'|'+FAMILY[b.tenGod]];
 if(!scene||FAMILY[a.tenGod]===FAMILY[b.tenGod])
  throw Error('PAID_CLOSENESS_PAIR_UNSUPPORTED');
 const [firstFocus,firstQuestion]=CHECK[a.tenGod];
 const [secondFocus,secondQuestion]=CHECK[b.tenGod];
 const computedCondition=a.position+' '+a.layer+' '+a.stem+'('+a.tenGod+') / '+
  b.position+' '+b.layer+' '+b.stem+'('+b.tenGod+')가 출생일의 서로 다른 숨은 글자에 확인된다. '+
  relation.computedRelation+'. '+scene+'에서 한쪽은 '+firstFocus+
  '를, 다른 쪽은 '+secondFocus+'를 묻는다. '+
  '실제 성격·상대방 반응·관계의 성패는 확인되지 않았다.';
 return Object.freeze({
  kind:'verified-day-closeness-two-question-reading-v1',
  sourceRefs:Object.freeze([a.id,b.id]),
  categories:Object.freeze([a.tenGod,b.tenGod]),
  sourceStems:Object.freeze([a.stem,b.stem]),
  scene,firstFocus,secondFocus,firstQuestion,secondQuestion,
  relation:relation.elementalDirection,computedCondition,
  readerWritingGoal:scene+'에서 '+firstQuestion+'와 '+secondQuestion+
   '를 서로 다른 확인 조건으로 설명한다. 한 질문에만 답했을 때 '+
   '아직 남는 다른 질문이 무엇인지 한 문장으로 구별한다. '+
   '동료·자원·표현·규칙·배움 가운데 이 명식의 두 분류에 해당하지 않는 '+
   '제3의 의미나 상대의 실제 감정을 끌어오지 않는다. '+
   '돈·일 장의 거래·성과 판단을 관계 장에서 다시 쓰지 않는다.',
  realRelationshipObserved:false,partnerMindKnown:false,
  relationshipOutcomePredicted:false,traditionalPrioritySelected:false
 });
}
module.exports={build};
