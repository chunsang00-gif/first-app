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
 return Object.freeze({
  kind:'per-topic-source-grounded-reader-question-v1',
  readerQuestion:spec[0],hypotheticalContrast:spec[1],
  differentFromOtherTopics:spec[2],
  sourceRefs:cited,sourceGroups:groups,
  previouslyCitedRefs:usedPreviously,
  distinctPositionCount:distinctPositions.length,
  independentCategoriesPresent:separateSymbolGroups,
  sourceComparison:separateSymbolGroups?
   '서로 다른 전통 분류의 의미가 각각 해당 질문에 어떤 제한적인 관점을 주는지 구별한다. 그 사이의 실제 작용·강약은 계산하지 않았다.':
   '전통 분류가 같거나 한 종류뿐이면 별도 성격·강도·좋고 나쁨을 만들어내지 않는다.',
  previousSourceConstraint:usedPreviously.length?
   '이미 앞 장에서 인용한 계산 위치가 있다. 그 결론을 분야 이름만 바꾸어 반복하지 않고, 이 질문의 새 근거/차이를 설명할 수 없는 선택 문단은 null로 둔다.':
   '앞 장의 출처 재사용은 확인되지 않았다. 새로운 실제 행동을 관찰했다고 가정하지 않는다.',
  observedCustomerBehavior:false,realWorldOutcomeEstablished:false,
  citationScopeIndependentOfChapterHeading:true
 });
}
module.exports={build,EDITORIAL};
