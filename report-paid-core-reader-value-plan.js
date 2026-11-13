'use strict';
// The ACTUAL paid first chapter: replace the recurring adult workplace
// scenario with one verifiable chart-specific symbolic takeaway.
// This is a writer plan, NOT an authored customer paragraph, expert approval,
// claim about observed temperament, or new paid report topic.
const season=require('./report-seasonal-evidence');
const contrast=require('./report-chart-contrast');
const questionFor=contrast.monthDecisionQuestion;
const KIND=Object.freeze({
 'same-element':'두 글자의 오행이 같음',
 resource:'달의 중심 글자가 겉글자를 생함',
 output:'달의 겉글자가 중심 글자를 생함',
 'control-on-day':'달의 중심 글자가 겉글자를 극함',
 'day-controls':'달의 겉글자가 중심 글자를 극함'
});
// A calculated Five Element arrow is not a realized cause, observed
// reaction, seasonal strength or a license to select a governing pattern.
// Give the paid writer ONE source-specific conditional question. Different
// arrows must not collapse into the old generic "consider both" advice.
function directionalQuestion(direction,visibleQuestion,centralQuestion){
 const outside='‘'+visibleQuestion+'’',inside='‘'+centralQuestion+'’';
 switch(direction){
  case 'resource':
   return '달의 중심 쪽 '+inside+'라는 조건을 가정했을 때 겉쪽 '+
    outside+'이라는 질문을 어떻게 뒷받침한다고 풀이할 수 있는가? '+
    '중심 조건이 성립하지 않는 가정에서는 무엇을 더 이상 해석할 수 없는가?';
  case 'output':
   return '겉쪽 '+outside+'라는 조건을 가정했을 때 달의 중심 쪽 '+
    inside+'이라는 질문을 어떻게 뒷받침한다고 풀이할 수 있는가? '+
    '겉쪽 조건이 성립하지 않는 가정에서는 무엇을 더 이상 해석할 수 없는가?';
  case 'control-on-day':
   return '달 중심의 '+inside+'가 겉의 '+outside+
    '에 제약을 주는 경우를 가정하면, 겉의 의미만 따로 읽을 때 놓치는 것은 무엇인가? '+
    '그 제약이 실제 발생했다고 단정할 근거는 무엇이 부족한가?';
  case 'day-controls':
   return '달 겉의 '+outside+'가 중심의 '+inside+
    '에 제약을 주는 경우를 가정하면, 중심의 의미만 따로 읽을 때 놓치는 것은 무엇인가? '+
    '그 제약이 실제 발생했다고 단정할 근거는 무엇이 부족한가?';
  case 'same-element':
   return '두 위치의 오행이 같을 때 '+outside+'와 '+inside+
    '가 같은 질문인지 다른 질문인지부터 구별한다. '+
    '계산되지 않은 상호 도움·제약이나 두 배의 영향력을 가정하지 않고 어떤 의미까지만 읽을 수 있는가?';
  default:throw Error('PAID_CORE_UNKNOWN_VERIFIED_ELEMENT_RELATION');
 }
}
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
 const directionalReadingQuestion=directionalQuestion(expected,visibleQuestion,centralQuestion);
 // The previous writer prompt manufactured two mirror sentences: "if only
 // visible you miss hidden" and vice versa. The archived paid first chapter
 // reproduced those sentences without a case-specific reader insight.
 // The actual calculated direction is one asymmetric interpretive QUESTION;
 // it never proves an observed temperament, conflict or material outcome.
 const directed={
  resource:'달의 중심 글자가 나타내는 ‘'+centralQuestion+
   '’이 겉글자의 ‘'+visibleQuestion+
   '’을 뒷받침하는 오행 방향으로 연결된다. 도움을 실제로 받았거나 두 능력이 발휘됐다는 뜻은 아니다.',
  output:'겉글자의 ‘'+visibleQuestion+
   '’에서 달 중심의 ‘'+centralQuestion+
   '’으로 이어지는 오행 방향을 읽는다. 실제 행동이 이어졌다는 뜻은 아니다.',
  'control-on-day':'달 중심의 ‘'+centralQuestion+
   '’이 겉글자의 ‘'+visibleQuestion+
   '’을 제약하는 오행 방향이 확인된다. 두 성격이 실제로 충돌했다는 뜻은 아니다.',
  'day-controls':'겉글자의 ‘'+visibleQuestion+
   '’이 달 중심의 ‘'+centralQuestion+
   '’을 제약하는 오행 방향이 확인된다. 실제 행동이나 손해가 일어났다는 뜻은 아니다.',
  'same-element':'두 출생 위치에서 ‘'+visibleQuestion+
   '’과 ‘'+centralQuestion+
   '’이 같은 오행에 속한다. 도움·제약 방향이나 두 배의 성향을 새로 만들 수는 없다.'
 };
 const actualTwoSidedReading=directed[expected];
 if(!actualTwoSidedReading)throw Error('PAID_CORE_READER_DIRECTION_MISSING');
 // Optional, source-specific example for the actual consumer writer.
 // Neither the scenario nor the choices are an observed customer history.
 const visibleScene=contrast.TEN_GOD_SCENE[top.tenGod];
 if(!visibleScene)throw Error('PAID_CORE_READER_SCENE_UNVERIFIED');
 const illustrativeScene=same?
  '가상 예시: '+visibleScene+' 때 ‘'+visibleQuestion+
  '’이라는 한 가지 질문으로 읽는다. 두 위치를 별개의 성격으로 나누지 않는다.':
  '가상 예시: '+visibleScene+' 때 ‘'+visibleQuestion+
  '’을 묻는 상황에 ‘'+centralQuestion+
  '’이라는 별도 질문을 연결한다. 이 질문의 관계는 계산된 오행 방향만 허용하며, '+
  '선택의 실익이나 고객의 실제 행동을 주장하지 않는다.';
 const twoSidedScope=Object.freeze({
  visibleRole:top.tenGod,mainRole:bottom.tenGod,
  directionalReadingQuestion,visibleQuestion,centralQuestion,
  elementDirection:expected,sameQuestion:same,
  mirrorAdviceRequired:false,notObservedBehavior:true,
  canAssertObservedBehavior:false,canRankWhichRoleDominates:false
 });
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
  directionalReadingQuestion,
  actualElementRelationIsSymbolicOnly:true,
  conditionalScenarioNotObserved:true,
  notAnAdditionalPaidParagraph:true,
  freePreviewCopyDisallowed:true,
  readerTakeaway:actualTwoSidedReading,
  illustrativeScene,
  illustrativeSceneIsCustomerHistory:false,
  semanticDifferenceRequired:!same,
  script:
   '유료 첫 장은 두 분류 이름을 나열하거나 양쪽 모두 중요하다는 말로 끝내지 않는다. '+
   '먼저 이 명식에서 계산된 오행 방향이 독자에게 어떤 서로 다른 전통적 질문을 허용하는지 하나의 이해 가능한 문장으로 쓴다. '+
   '이 명식의 실제 질문: '+actualTwoSidedReading+' '+
   '겉에 드러난 분류의 뜻: '+reading.first.reading+
   '. 달 중심 숨은 글자의 뜻: '+reading.second.reading+'. '+
   '이 둘이 같거나 다른 이유는 실제 출생 위치와 위에서 검증한 관계만으로 설명한다. '+
   '두 의미가 단순 사전 나열로 남는다면 이 명식별 짧은 가정을 선택적으로 사용할 수 있다: '+
   illustrativeScene+' 두 뜻이 자연스럽게 연결되지 않는다면 예시는 생략한다. '+
   '무료 화면에 이미 제공된 겉·안쪽 두 질문을 복사해 유료 문단을 채우지 않는다. '+
   '유료 본문은 오행의 정확한 계산 방향이 그 해석을 어떤 범위에서 허용하는지 더 풀어 쓴다. '+
   '계산된 상징의 도움·표현·제약을 실제 고객의 능력, 손해, 내면 갈등, 직업이나 인생 사건으로 바꾸지 않는다. '+
   '한쪽만 보면 놓치고 반대로 다른 쪽만 보면 놓친다는 대칭 문장을 두 개 나열하지 않는다. '+
   '추가 해석이 불가능하면 장점·약점·예시를 발명하지 않으며 내부 근거와 한계를 설명하되 고객에게 기술 목록을 읽히지 않는다. '+
   '실제 고객의 일·사업·학교·소득을 가정해서 지어내지 않고, 꼭 필요하지 않으면 고정된 가상 장면도 만들지 않는다. '+
   '같은 말의 재요약과 작성 과정 해설을 붙이지 않는다. 이 관계의 원인과 결과가 실제 삶에서 성립한 것처럼 말하지 않는다.',
  noInventedHistory:true,noUnverifiedPersonalTrait:true,
  additionalTopic:false,professionalReviewComplete:false
 });
}
module.exports={build,directionalQuestion};
