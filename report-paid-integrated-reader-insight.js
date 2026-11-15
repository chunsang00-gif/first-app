'use strict';
// Integrate ONE observed natal DAY-hidden traditional question with TWO
// separately user-reported MBTI preferences. Neither framework validates
// the other, and this creates no new personality/ability assessment.
const NATAL_QUESTIONS=Object.freeze({
 비견:'어떤 일은 함께하고 어떤 일은 각자 맡기로 할 것인가',
 겁재:'같이 사용할 시간이나 물건의 몫을 어떻게 정할 것인가',
 식신:'결정하려면 어떤 결과나 생각을 구체적으로 설명해야 하는가',
 상관:'원래 정한 방식에서 무엇을 바꾸자고 제안할 것인가',
 정재:'계속 관리해야 할 준비물이나 비용은 무엇인가',
 편재:'필요한 물건이나 도움을 어디에서 어떤 조건으로 마련할 것인가',
 정관:'이미 정한 약속과 맡은 책임은 무엇인가',
 편관:'예상 밖의 요청이 생긴다면 어디까지 맡을 것인가',
 정인:'결정 전에 어떤 설명이나 도움을 먼저 확인해야 하는가',
 편인:'낯선 내용의 뜻 가운데 무엇을 다시 이해해야 하는가'
});
const DAY=/^natal\.day\.hidden\.[甲乙丙丁戊己庚辛壬癸]$/;
function build({chapterId,topicId,topic,source}={}){
 if(chapterId!=='integrated_judgment'||topicId!=='insight'||
  !topic||topic.mode==='state-limits')return null;
 const type=source?.['person.mbti']?.type;
 if(typeof type!=='string'||!/^[EI][SN][FT][JP]$/.test(type)||
    !(topic.citableFacts||[]).some(x=>x.id==='person.mbti'))return null;
 const dimensions=require('./report-paid-mbti-dimension');
 const thought=dimensions.build(type,'energy');
 const closing=dimensions.build(type,'planning');
 if(!thought||!closing||thought.actualBehaviorObserved!==false||
  closing.actualBehaviorObserved!==false)
  throw Error('INTEGRATED_SELF_REPORTED_PREFERENCES_NOT_VERIFIED');
 // Use a real DAY-hidden classification, not the month pair already used
 // in the paid opening. Source order is a deterministic reference choice,
 // not a statement of which traditional symbol is dominant.
 const row=(topic.citableFacts||[]).find(x=>DAY.test(x.id)&&
  NATAL_QUESTIONS[x.tenGod]&&x.stem&&x.position&&x.layer&&
  typeof x.traditionalMeaning==='string'&&x.traditionalMeaning.trim()&&
  source?.[x.id]?.stem===x.stem&&
  source?.[x.id]?.tenGod===x.tenGod&&
  source?.[x.id]?.traditionalMeaning===x.traditionalMeaning);
 if(!row)return null;
 const question=NATAL_QUESTIONS[row.tenGod];
 const refs=Object.freeze(['person.mbti',row.id]);
 const condition='태어난 날의 '+row.position+' '+row.layer+' '+row.stem+
  '('+row.tenGod+')는 "'+question+'"라는 전통적 질문을 남긴다. '+
  '사용자가 입력한 '+type+'의 '+thought.selectedCode+'는 "'+
  thought.interpretedPreference+'"의 선호, '+closing.selectedCode+
  '는 "'+closing.interpretedPreference+'"의 선호를 뜻한다. '+
  '두 체계가 같은 실제 행동이나 우세한 성격을 증명하는 것은 아니다.';
 return Object.freeze({
  kind:'integrated-day-question-and-independent-input-preferences-v1',
  topic:'integrated_judgment.insight',sourceRefs:refs,
  daySourceRef:row.id,dayStem:row.stem,dayRole:row.tenGod,
  traditionalMeaning:row.traditionalMeaning,
  mbti:type,preparationCode:thought.selectedCode,
  commitmentCode:closing.selectedCode,
  preparationPreference:thought.interpretedPreference,
  commitmentPreference:closing.interpretedPreference,
  natalQuestion:question,computedCondition:condition,
  writingGoal:'가상으로 다른 사람과 하나의 계획을 정한다고 하자. '+
   '먼저 이 출생일의 전통적 분류는 "'+question+
   '"를 확인하라고 묻는다. 실제 입력한 '+thought.selectedCode+
   ' 선호는 생각을 혼자 정리할지 다른 사람과 정리할지의 출발점을, '+
   closing.selectedCode+' 선호는 언제 결정을 확정하거나 열어둘지의 출발점을 제시한다. '+
   '이 세 가지는 서로의 정답이 아니며 서로 다른 결정을 위한 질문이다. '+
   '사주만 읽으면 생각 정리·일정에 관한 사용자 입력 선호를 알 수 없고, '+
   'MBTI만 읽으면 출생일 전통 분류가 제기하는 이 질문을 설명할 수 없다. '+
   '한 상황에서 두 분석을 함께 읽어도 확인되지 않은 실제 결과가 무엇인지 구분하되, '+
   'MBTI 비교 장의 일반적인 일치·불일치 이야기나 앞 장 내용을 다시 요약하지 않는다.',
  observedBehavior:false,verifiedAgreement:false,
  predictionKnown:false,salesApproved:false
 });
}
module.exports={build,NATAL_QUESTIONS};
