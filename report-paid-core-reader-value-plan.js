'use strict';
// The ACTUAL paid first chapter: replace the recurring adult workplace
// scenario with one verifiable chart-specific symbolic takeaway.
// This is a writer plan, NOT an authored customer paragraph, expert approval,
// claim about observed temperament, or new paid report topic.
const season=require('./report-seasonal-evidence');
const questionFor=require('./report-chart-contrast').monthDecisionQuestion;
const KIND=Object.freeze({
 'same-element':'두 글자의 오행이 같음',
 resource:'달의 중심 글자가 겉글자를 생함',
 output:'달의 겉글자가 중심 글자를 생함',
 'control-on-day':'달의 중심 글자가 겉글자를 극함',
 'day-controls':'달의 겉글자가 중심 글자를 극함'
});
function build(packet,focus,allowed,source){
 const m=focus?.tenGodFocus,reading=focus?.readerReasoning?.readerValuePlan?.traditionalReading;
 const top=m?.monthStem,bottom=m?.monthMainHidden,link=m?.elementLink;
 if(!top||!bottom||!link||!reading?.first||!reading?.second||
    !Array.isArray(allowed)||!source||packet?.status!=='ready')return null;
 const refs=[top.sourceId,bottom.sourceId];
 const packetTop=packet.facts?.tenGods?.month;
 const sourceTop=source[refs[0]],sourceBottom=source[refs[1]];
 if(refs.some(x=>!allowed.includes(x))||
    refs[0]!=='natal.month.stem'||!/^natal\.month\.hidden\.[甲乙丙丁戊己庚辛壬癸]$/.test(refs[1])||
    !sourceTop||!sourceBottom||sourceTop.stem!==top.stem||
    sourceBottom.stem!==bottom.stem||sourceTop.tenGod!==top.tenGod||
    sourceBottom.tenGod!==bottom.tenGod||
    packetTop?.stem!==top.stem||
    packetTop?.hiddenStems?.find(x=>x.stem===bottom.stem)?.tenGod!==bottom.tenGod||
    reading.first.sourceId!==refs[0]||reading.second.sourceId!==refs[1]||
    reading.first.tenGod!==top.tenGod||reading.second.tenGod!==bottom.tenGod||
    !reading.first.reading||!reading.second.reading)
  throw Error('PAID_CORE_READER_PLAN_SOURCE_DRIFT');
 const expected=season.relation(season.ELEMENTS[bottom.stem],season.ELEMENTS[top.stem]);
 if(!KIND[expected]||!KIND[link.kind==='hidden-generates-visible'?'resource':
       link.kind==='visible-generates-hidden'?'output':
       link.kind==='hidden-controls-visible'?'control-on-day':
       link.kind==='visible-controls-hidden'?'day-controls':
       link.kind==='same-element'?'same-element':null]||
    (link.kind==='same-element'?'same-element':
     link.kind==='hidden-generates-visible'?'resource':
     link.kind==='visible-generates-hidden'?'output':
     link.kind==='hidden-controls-visible'?'control-on-day':
     link.kind==='visible-controls-hidden'?'day-controls':null)!==expected)
  throw Error('PAID_CORE_READER_PLAN_RELATION_DRIFT');
 const same=top.tenGod===bottom.tenGod;
 if(same!==m.sameClassification)
  throw Error('PAID_CORE_READER_PLAN_SUBTYPE_DRIFT');
 // The first paid chapter must explain what each REAL month role adds.
 // These are not observations of customer decisions or proof of outcomes.
 const visibleQuestion=questionFor(top.tenGod);
 const centralQuestion=questionFor(bottom.tenGod);
 const twoSidedScope=Object.freeze({
  visibleRole:top.tenGod,mainRole:bottom.tenGod,
  visibleQuestion,centralQuestion,
  ifOnlyVisible:same?
   null:'겉자리의 '+top.tenGod+'만 보면 달 중심의 '+bottom.tenGod+
    '에서 묻는 ‘'+centralQuestion+'’이라는 질문을 빠뜨린다.',
  ifOnlyMain:same?
   null:'달 중심의 '+bottom.tenGod+'만 보면 겉자리의 '+top.tenGod+
    '에서 묻는 ‘'+visibleQuestion+'’이라는 질문을 빠뜨린다.',
  elementDirection:expected,
  sameQuestion:same,
  canAssertObservedBehavior:false,
  canRankWhichRoleDominates:false
 });
 const actualTwoSidedReading=same?
  '두 출생 위치 모두 ‘'+visibleQuestion+'’이라는 한 가지 전통 질문과 연결된다. '+
  '둘을 억지로 대립시켜 다른 두 성격으로 만들지 않는다.':
  '겉자리에서 다룰 질문은 ‘'+visibleQuestion+'’이다. '+
  '달 중심에서 다룰 질문은 ‘'+centralQuestion+'’이다. '+
  '겉자리만 읽으면 달 중심의 질문을 놓치고, 달 중심만 읽으면 겉자리의 질문을 놓친다. '+
  '두 차이가 한 번의 가상 선택에 어떤 서로 다른 확인 항목을 더하는지 설명한다. '+
  '이때 '+KIND[expected]+'이라는 실제 오행 방향은 출처 사이의 상징적 관계이며 '+
  '두 행동이 실제로 일어났거나 어느 역할이 우세하다는 판정이 아니다.';
 return Object.freeze({
  kind:'grounded-paid-core-reader-takeaway-v1',
  topic:'saju_core.strength',
  refs:Object.freeze(refs),
  monthVisibleTraditionalMeaning:reading.first.reading,
  monthMainTraditionalMeaning:reading.second.reading,
  actualElementRelation:KIND[expected],
  sameClassification:same,
  twoSidedScope,
  actualTwoSidedReading,
  notAnAdditionalPaidParagraph:true,
  freePreviewCopyDisallowed:true,
  readerTakeaway:actualTwoSidedReading,
  semanticDifferenceRequired:!same,
  script:
   '본문 첫 부분에 입력 명식의 두 전통적 뜻을 묶어 한 가지 조건부 해석을 쉽고 구체적인 한국어로 제시한다. '+
   '겉글자: '+reading.first.reading+'. 중심 속글자: '+reading.second.reading+
   '. 두 글자의 실제 관계: '+KIND[expected]+'. '+
   '원고에서 답할 서로 다른 질문과 구분할 위치: '+actualTwoSidedReading+' '+
   (same?'동일한 의미를 반대 성향 두 개나 두 배의 영향력으로 나누지 않는다. ':
     '첫 질문만 답하면 무엇이 빠지고 반대로 두 번째 질문만 답하면 무엇이 빠지는지 각각 계산 분류와 연결해 풀이한다. 질문 목록이나 범용 조언으로 끝내지 않고, 입력 명식에 속하는 차이를 한 번의 조건부 상황에서 묶는다. ')+
   '어떤 직장에 다녔는지, 어떤 일을 실제로 수행했는지 출생정보에 없으므로 장비 운영·납품·인수인계·몇 달짜리 사업 같은 고정 가상 사례를 만들지 않는다. '+
   '본문 자체로 비교가 이해되면 가상 상황은 생략한다. 예시가 꼭 필요해도 생활 범주를 임의로 특정하지 않고, 계산한 두 의미가 서로 다른 질문에 답하는 경우에만 짧게 든다. '+
   '오행의 생·극 관계를 실제 능력이나 인격의 우열, 두 의미의 우선순위, 실현된 갈등으로 바꾸지 않는다. '+
   '독자가 새롭게 알 수 있는 것은 이 출생 자료에서 확인된 전통 질문의 차이이며 실제 삶의 관찰이나 미래 사건이 아니다.',
  noInventedHistory:true,noUnverifiedPersonalTrait:true,
  additionalTopic:false,professionalReviewComplete:false
 });
}
module.exports={build};
