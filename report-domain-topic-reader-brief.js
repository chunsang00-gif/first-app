'use strict';
// Actual, source-scoped editorial assignment for every active domain paragraph.
// No future event, real-life trait, or extra natal fact is derived here.
// Unlike a generic "avoid repetition" instruction, these are different
// questions and different hypothetical contrasts for each PAID topic.
const usedPaths=require('./report-source-ledger').usedPaths;
const EDITORIAL=Object.freeze({
 money:Object.freeze({
  earning:['수입 활동에 연결되는 전통 분류가 무엇이고 어떤 활동의 대가인지','직접 무언가를 만들어 대가를 받는 가상 선택과 이미 있는 자원을 활용하는 가상 선택','지출 습관이나 실제 소득을 설명하지 않는다'],
  spending:['자원을 보유하는 상징과 지출을 선택하는 해석은 어떻게 구별되는가','필요한 물건을 지금 사는 가상 선택과 뒤에 쓸 자원을 남기는 가상 선택','돈을 잘 번다, 아낀다는 성격 판정을 되풀이하지 않는다']
 }),
 career:Object.freeze({
  workstyle:['일을 수행하거나 표현·학습하는 상징 중 실제 확인된 것은 무엇인가','새로운 과업의 결과를 보여 주는 단계와 작업 방법을 배우는 단계를 구별하는 가상 상황','실제 업무 속도와 능력을 재단하지 않는다'],
  teamwork:['동료와 같은 일을 맡는 상황에서 역할·규칙과 관련된 전통 분류가 말하는 범위는 무엇인가','역할을 나눠 맡는 가상 상황과 서로의 책임을 조정하는 가상 상황','학습 속도 또는 결과물의 성과를 협업 능력으로 바꿔 말하지 않는다'],
  growth:['배움과 익힘을 상징하는 계산 자료가 어느 출생 위치에 실제 있는가','처음 배우는 작업의 순서를 익히는 가상 상황과 익힌 것을 다시 점검하는 가상 상황','높은 학습 능력이나 승진 가능성을 추정하지 않는다']
 }),
 relationship:Object.freeze({
  closeness:['출생 날의 실제 숨은 글자 분류가 친밀감이라는 질문에 설명할 수 있는 범위는 어디까지인가','처음 서로를 알아가는 가상 대화와 오래 아는 사람에게 기대를 설명하는 가상 대화','실제 연애·결혼 경험이나 상대의 마음을 꾸며내지 않는다'],
  expression:['표현과 관련된 실제 계산 분류는 어떤 상황에서 설명의 출발점이 되는가','마음을 표현하는 가상 상황과 서운한 이유를 설명하는 가상 상황','소득을 만드는 식상의 풀이를 애정 능력의 증거로 바꾸지 않는다']
 }),
 stress:Object.freeze({
  trigger:['규칙·요구·압박과 관련된 전통 분류의 해석 가능 범위는 무엇인가','예상하지 못한 마감 요청을 받는 가상 상황과 평소 역할을 수행하는 가상 상황','실제 스트레스 강도·불안·건강 증상을 추정하지 않는다'],
  response:['배움·보호 관련 전통 분류를 회복이라는 질문에 적용할 수 있는 범위는 무엇인가','낯선 설명을 다시 듣는 가상 상황과 이미 이해한 절차를 반복하는 가상 상황','실제 회복력이나 상담·치료 필요성을 추정하지 않는다']
 })
});
const GROUPS=Object.freeze({
 '정재':'재성','편재':'재성','식신':'식상','상관':'식상',
 '정관':'관성','편관':'관성','정인':'인성','편인':'인성',
 '비견':'비겁','겁재':'비겁'
});
// An editor may suggest a HYPOTHETICAL scene only when that traditional
// ten-god GROUP is actually present in the cited rows for this topic.
// Do not ask the model to illustrate a missing category as personal behavior.
const CATEGORY_SCENES=Object.freeze({
 money:Object.freeze({
  earning:Object.freeze({
   재성:['가상의 물품 거래에서 받을 대가와 투입 자원을 비교한다','같은 거래에서 관리해야 할 비용과 조건을 다시 확인한다'],
   식상:['가상의 주문에서 직접 제작할 결과물과 약속한 범위를 정한다','같은 주문에서 제작 과정과 납품 약속 사이의 기준을 비교한다']
  }),
  spending:Object.freeze({
   재성:['가상의 구매에서 지금 사용할 자원과 남겨 둘 자원을 구분한다','같은 구매에서 보유하는 선택과 사용하는 선택의 조건을 비교한다']
  })
 }),
 career:Object.freeze({
  workstyle:Object.freeze({
   식상:['가상의 업무에서 결과물을 만들고 전달하는 단계에 초점을 둔다','같은 업무에서 바뀐 전달 조건에 맞춰 결과물 설명을 구분한다'],
   인성:['가상의 업무에서 새 방법을 배우고 적용하는 단계에 초점을 둔다','같은 업무에서 배운 절차와 적용 전 확인할 조건을 구분한다']
  }),
  teamwork:Object.freeze({
   비겁:['가상의 공동 작업에서 참여자의 역할을 나누는 질문을 다룬다','같은 공동 작업에서 맡은 역할이 겹칠 때 조정할 조건을 비교한다'],
   관성:['가상의 조직 업무에서 규칙과 승인 책임을 구분한다','같은 조직 업무에서 규칙을 지키는 것과 승인을 맡는 조건을 비교한다']
  }),
  growth:Object.freeze({
   인성:['가상의 교육에서 설명을 이해하고 다시 확인하는 과정을 살핀다','같은 교육에서 익힌 내용을 새 상황에 적용하기 전 조건을 구분한다']
  })
 }),
 relationship:Object.freeze({
  closeness:Object.freeze({
   비겁:['가상의 친밀한 관계에서 함께 맡는 역할을 설명하는 대화를 가정한다','같은 관계에서 상대와 각자의 몫을 다시 합의하는 대화를 가정한다'],
   식상:['가상의 친밀한 관계에서 마음을 전하는 대화를 가정한다','같은 관계에서 전달한 뜻을 서로 확인하는 대화를 가정한다'],
   재성:['가상의 친밀한 관계에서 공동 자원을 다루는 조건을 이야기한다','같은 관계에서 각자의 자원 사용 조건을 확인하는 대화를 가정한다'],
   관성:['가상의 친밀한 관계에서 약속과 책임을 협의하는 대화를 가정한다','같은 관계에서 약속의 범위가 달라질 때 조정을 이야기한다'],
   인성:['가상의 친밀한 관계에서 서로 필요한 도움을 이야기한다','같은 관계에서 지원을 받는 조건과 경계를 확인하는 대화를 가정한다']
  }),
  expression:Object.freeze({
   식상:['가상의 대화에서 자신의 뜻을 표현하는 방식을 설명한다','같은 대화에서 표현한 뜻과 상대가 이해한 뜻을 비교한다']
  })
 }),
 stress:Object.freeze({
  trigger:Object.freeze({
   관성:['가상의 일정에서 외부 규칙과 맡은 책임을 확인하는 상황을 놓는다','같은 일정에서 예상하지 못한 요구가 생겼을 때 범위를 다시 확인한다']
  }),
  response:Object.freeze({
   인성:['가상의 어려운 과제에서 설명과 도움을 구하는 상황을 놓는다','같은 과제에서 익힌 방법을 다시 점검하는 상황과 비교한다']
  })
 })
});
function groundedScene(chapterId,topicId,groups){
 const available=CATEGORY_SCENES[chapterId]?.[topicId]||{};
 const supported=groups.filter(g=>available[g]);
 if(!supported.length)return {
  text:'해당 출처만으로 질문에 맞는 범주별 가상 상황을 만들 근거가 부족하다. 실제 개인 행동을 꾸며 보충하지 않는다.',
  included:[],unavailable:groups,
  categorySupported:false
 };
 const first=supported[0],next=supported[1];
 const pair=next?
  '실제로 확인된 '+first+' 분류를 조건으로 '+available[first][0]+
  '. 다른 확인된 '+next+' 분류의 조건에서는 '+available[next][0]+'.':
  '실제로 확인된 '+first+' 분류의 가상 상황 하나를 비교한다. 조건 A: '+
   available[first][0]+'. 조건 B: '+available[first][1]+'.';
 return {
  text:pair+' 두 상황은 전통 상징을 구별하기 위한 가정이지 이 사람의 실제 행동이나 결과가 아니다.',
  included:supported.slice(0,2),
  unavailable:groups.filter(g=>!supported.slice(0,2).includes(g)),
  categorySupported:true
 };
}
function build({chapterId,topicId,topic,priorSections}={}){
 const spec=EDITORIAL[chapterId]?.[topicId];
 if(!spec||!topic||topic.mode==='state-limits')return null;
 const rows=topic.citableFacts||[];
 const cited=rows.map(x=>x.id);
 if(!cited.length||new Set(cited).size!==cited.length)
  throw Error('DOMAIN_READER_BRIEF_MISSING_EXACT_SOURCE:'+chapterId+':'+topicId);
 // A prior paragraph owns evidence only if its RESTORED reference list
 // actually cited that source, not because its chapter was eligible.
 const previouslyUsed=new Set((priorSections||[]).flatMap(s=>
  (s.bodyTopics||[]).flatMap(id=>usedPaths(s,id))));
 const usedPreviously=cited.filter(id=>previouslyUsed.has(id));
 const groups=[...new Set(rows.map(x=>GROUPS[x.tenGod]).filter(Boolean))];
 const distinctPositions=[...new Set(rows.map(x=>x.position).filter(Boolean))];
 const separateSymbolGroups=groups.length>=2;
 const scene=groundedScene(chapterId,topicId,groups);
 return Object.freeze({
  kind:'per-topic-source-grounded-reader-question-v1',
  readerQuestion:spec[0],hypotheticalContrast:scene.text,
  sourceCategoryBoundScene:scene.categorySupported,
  illustratedSourceGroups:scene.included,
  unillustratedSourceGroups:scene.unavailable,
  differentFromOtherTopics:spec[2],
  sourceRefs:cited,sourceGroups:groups,
  previouslyCitedRefs:usedPreviously,
  distinctPositionCount:distinctPositions.length,
  independentCategoriesPresent:separateSymbolGroups,
  sourceComparison:separateSymbolGroups?
   '서로 다른 전통 분류의 의미는 출처마다 구분한다. 설명용 가상 장면은 실제 출처가 있는 분류에만 허용하고 나머지 분류를 만들어내지 않는다. 분류 사이의 실제 작용·강약은 계산하지 않았다.':
   '전통 분류가 같거나 한 종류뿐이면 없는 다른 종류를 만들어 비교하거나 별도 성격·강도·길흉을 발명하지 않는다.',
  previousSourceConstraint:usedPreviously.length?
   '이미 앞 장에서 인용한 계산 위치가 있다. 그 결론을 분야 이름만 바꾸어 반복하지 않고, 이 질문의 새 근거/차이를 설명할 수 없는 선택 문단은 null로 둔다.':
   '앞 장의 출처 재사용은 확인되지 않았다. 새로운 실제 행동을 관찰했다고 가정하지 않는다.',
  observedCustomerBehavior:false,realWorldOutcomeEstablished:false,
  citationScopeIndependentOfChapterHeading:true
 });
}
module.exports={build,EDITORIAL};
