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
// Real-world checking points for a hypothetical ONE-scene explanation.
// The labels come only from the verified traditional role, never a customer's
// observed past or promised outcome.
const SCENE_CHECK=Object.freeze({
 비견:'함께할 사람 사이에서 직접 맡을 일의 범위',
 겁재:'공동 자원과 물품을 나눌 몫',
 식신:'완성해서 전달할 결과물과 그 순서',
 상관:'기존 방식에서 바꾸어 제안할 부분',
 정재:'반복해서 들어갈 비용과 관리할 범위',
 편재:'필요한 물건이나 도움을 얻을 경로',
 정관:'따라야 할 절차와 맡을 역할의 범위',
 편관:'갑작스러운 요구에 답할 책임의 범위',
 정인:'누구에게 무엇을 배우고 어떤 도움을 받을지',
 편인:'낯선 자료의 어떤 뜻을 어떻게 이해할지'
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
 const visibleCheck=SCENE_CHECK[top.tenGod],centralCheck=SCENE_CHECK[bottom.tenGod];
 if(!visibleScene||!visibleCheck||!centralCheck)
  throw Error('PAID_CORE_READER_SCENE_UNVERIFIED');
 const directionInScene={
  resource:'안쪽의 ‘'+centralQuestion+'’이라는 관점이 겉의 ‘'+visibleQuestion+
   '’을 뒷받침하는 전통적 방향으로만 연결한다.',
  output:'겉의 ‘'+visibleQuestion+'’이라는 관점이 안쪽의 ‘'+centralQuestion+
   '’을 뒷받침하는 전통적 방향으로만 연결한다.',
  'control-on-day':'안쪽의 ‘'+centralQuestion+'’이라는 관점이 겉의 ‘'+visibleQuestion+
   '’을 제약하는 전통적 방향으로만 연결한다.',
  'day-controls':'겉의 ‘'+visibleQuestion+'’이라는 관점이 안쪽의 ‘'+centralQuestion+
   '’을 제약하는 전통적 방향으로만 연결한다.',
  'same-element':'겉의 ‘'+visibleQuestion+'’과 안쪽의 ‘'+centralQuestion+
   '’이 같은 기운에 속하지만 질문의 뜻은 구별한다.'
 };
 const illustrativeScene=same?
  '가상 예시: '+visibleScene+' 때 살필 것은 ‘'+visibleCheck+
  '’이라는 한 가지 질문이다. 같은 분류가 두 위치에 있어도 이를 서로 다른 성격이나 두 배의 영향력으로 나누지 않는다.':
  '가상 예시: '+visibleScene+' 때 겉에서 읽는 뜻은 ‘'+visibleCheck+
  '’를 묻고, 안쪽에서 읽는 뜻은 ‘'+centralCheck+
  '’를 묻는다. '+directionInScene[expected]+
  ' 두 질문은 실제 선택의 원인·성공이나 고객이 겪은 일을 확인한 결과가 아니라, 계산된 전통 분류를 이해하기 위한 가정일 뿐이다.';
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
  sceneMeaningChecks:Object.freeze(same?[visibleCheck]:[visibleCheck,centralCheck]),
  illustrativeSceneIsCustomerHistory:false,
  semanticDifferenceRequired:!same,
  script:
   // The actual paid writer receives this compact chart-owned reasoning
   // once. More safety disclaimers or restated definitions are NOT depth.
   '고정된 핵심 판단은 이미 첫 장의 큰 글씨에 있으니 그 관계를 동의어로 다시 시작하지 않는다. '+
   '독자가 새롭게 알 내용은 두 출생월 위치가 각자 다루는 질문과 실제 계산한 오행 방향의 차이이다. '+
   '겉글자의 전통적 뜻: '+reading.first.reading+
   '. 중심 숨은 글자의 전통적 뜻: '+reading.second.reading+'. '+
   '이 명식의 실제 질문: '+actualTwoSidedReading+' '+
   '이 관계가 실제 성격, 능력, 손해 또는 성공을 입증한 것처럼 쓰지 않는다. '+
   '한쪽만 보면 놓치고 반대로 다른 쪽만 보면 놓친다는 대칭 문장을 두 개 나열하지 않는다. '+
   '양쪽 모두 중요하다는 말로 끝내지 않는다. 두 역할을 구별한 뒤 독자가 추가로 알게 되는 조건 하나를 설명한다. '+
   '독자에게 실제로 새 뜻을 전하지 못하는 경우에는 분량을 늘리거나 계산법·작성 순서를 강의하지 않는다. '+
   '일상 예시가 독자의 이해에 꼭 도움될 때만 다음 가정을 짧게 참고한다: '+
   illustrativeScene+
   ' 이는 실제 고객의 경험이 아니라 설명을 위한 가정이다. '+
   '무료 화면에 이미 제공된 겉·안쪽 두 질문을 복사해 유료 문단을 채우지 않는다. '+
   '실제 고객의 일·사업·학교·소득을 지어내지 않으며, 추가 우선순위나 결과가 계산되지 않았으면 그것을 발명하지 않는다. '+
   '근거와 한계는 내부 출처에 남기고 독자용 문장을 같은 말의 재요약으로 끝내지 않는다.',
  noInventedHistory:true,noUnverifiedPersonalTrait:true,
  additionalTopic:false,professionalReviewComplete:false
 });
}
// Reader application for one reviewed interpretation of the calculated
// month pair. A shared element direction by itself is insufficient.
function composeReaderParagraph(task,source){
 const focus=task?.evidenceFocus?.tenGodFocus;
 const visible=focus?.monthStem;
 const central=focus?.monthMainHidden;
 if(task?.calculatedOpening&&visible?.tenGod==='정인'&&central?.tenGod==='정재'&&
    focus.elementLink?.kind==='hidden-controls-visible'&&
    source?.[visible.sourceId]?.tenGod===visible.tenGod&&
    source?.[central.sourceId]?.tenGod===central.tenGod){
  const opening=task.calculatedOpening;
  const roles='태어난 달의 겉글자는 도움을 받아 배우는 뜻이고, 안쪽 글자는 반복해서 드는 비용을 살피는 뜻입니다. 계산에서는 달의 안쪽 글자가 겉글자를 제약합니다.';
  const condition='가령 매달 수강료를 내며 새 기술을 배운다면, 설명을 들을 수 있어도 혼자 해볼 단계까지 그 비용을 낼 수 있는지가 배울 기간을 가릅니다.';
  return {
   label:'배움이 이어지는 데 필요한 비용',
   text:[opening.text,roles,condition].join(' '),
   basis:{
    refs:[...new Set([visible.sourceId,central.sourceId,...opening.refs])],
    interpretation:roles,
    condition,
    limit:'달의 두 글자에 관한 전통 풀이이며 실제 지출이나 학습 결과는 확인되지 않습니다.'
   }
  };
 }
 if(!task?.calculatedOpening||visible?.tenGod!=='겁재'||central?.tenGod!=='정인'||
    focus.elementLink?.kind!=='hidden-generates-visible')
  return null;
 const opening=task.calculatedOpening;
 const refs=['facts.structuralEvidence.monthCommand',visible.sourceId,central.sourceId,...opening.refs];
 const roles='달의 겉은 공동 자원의 몫, 달의 안은 배움과 도움을 살핍니다.';
 const condition='공동 장비를 나눠 쓸 때는 쓰는 법을 배울 길이 있어야 나눈 몫을 쓸 수 있다는 풀이입니다.';
 const withYear=task.wholeNatalSupplementRefs?.includes('natal.year.stem')&&
  source['natal.year.stem']?.tenGod==='상관';
 const year='태어난 해에서 읽는 새 방식은 기존 규칙을 어떻게 바꿀지에 대한 별도의 판단입니다.';
 return {
  label:'몫을 나누기 전에 필요한 것',
  text:[opening.text,roles,condition,...(withYear?[year]:[])].join(' '),
  basis:{
   refs:[...new Set([...refs,...(withYear?['natal.year.stem']:[])])],
   interpretation:'달 안쪽의 배움과 도움이 겉의 자원 배분을 뒷받침하는 방향을 읽습니다. '+opening.text+(withYear?' '+year:''),
   condition,
   limit:'두 역할의 전통적 해석이며 어느 글자가 실제로 주도하는지나 구체적 사건은 확인되지 않습니다.'
  }
 };
}

module.exports={build,directionalQuestion,composeReaderParagraph};
