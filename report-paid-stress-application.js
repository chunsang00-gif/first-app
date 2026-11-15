'use strict';
// Paid stress prompts must answer questions about WHAT is required or
// HOW to verify information, rather than asserting actual stress or recovery.
const ROLES=Object.freeze({
 trigger:Object.freeze({
  정관:['기존 약속과 맡은 책임','이미 정해진 역할과 지켜야 할 규칙은 무엇인가?'],
  편관:['예상하지 못한 새로운 요구','추가된 요구는 기존 의무와 어떻게 다른가?']
 }),
 response:Object.freeze({
  정인:['도움을 받아 검토할 설명','어떤 설명을 다시 듣거나 누구에게 물어볼 것인가?'],
  편인:['낯선 내용의 뜻을 다시 이해하는 과정','어느 부분이 이해되지 않으며 다른 설명과 어떻게 비교할 것인가?']
 })
});
const SCENES=Object.freeze({
 trigger:'이미 맡은 일에 별도의 요청이 더해졌다는 가상의 상황',
 response:'익숙하지 않은 설명을 받아 방법을 결정해야 한다는 가상의 상황'
});
function build(chapterId,topicId,topic){
 if(chapterId!=='stress'||!ROLES[topicId]||topic?.mode==='state-limits')return null;
 const owned=topic?.sourceOwnedInterpretiveThesis;
 const single=topic?.sourceOwnedSingleReading;
 if(Boolean(owned)===Boolean(single))return null;
 const rows=owned?owned.sourceRoles:[single.source];
 const roles=rows.map(row=>{
  const original=(topic.citableFacts||[]).find(x=>x.id===row.ref);
  if(!/^natal\.(year|month|day|hour)\.(?:stem|hidden\.[甲乙丙丁戊己庚辛壬癸])$/.test(row.ref)||
     !original||!ROLES[topicId][row.tenGod]||
     original.stem!==row.stem||original.tenGod!==row.tenGod||
     original.position!==row.position||original.layer!==row.layer||
     original.traditionalMeaning!==row.traditionalMeaning)
   throw Error('PAID_STRESS_READING_UNVERIFIED_SOURCE');
  return ROLES[topicId][row.tenGod];
 });
 if(rows.length<1||rows.length>2||new Set(rows.map(r=>r.ref)).size!==rows.length)
  throw Error('PAID_STRESS_READING_UNVERIFIED_ROLE_COUNT');
 const pair=rows.length===2;
 if(pair&&(new Set(rows.map(r=>r.tenGod)).size!==2||
   owned.claimedRealWorldOutcome!==false||
   owned.traditionalPriorityAssessed!==false))
  throw Error('PAID_STRESS_READING_UNVERIFIED_TWO_CATEGORIES');
 if(!pair&&(single.uniqueSubtypeCount!==1||single.missingCounterpartInferred!==false))
  throw Error('PAID_STRESS_READING_UNVERIFIED_SINGLE_CATEGORY');
 const relation=pair?require('./report-paid-interpretive-bridge')
  .exactElementRelation(...rows.map(x=>({id:x.ref,stem:x.stem}))):null;
 if(pair&&JSON.stringify(relation)!==JSON.stringify(owned.sourceElementRelation))
  throw Error('PAID_STRESS_READING_ELEMENT_DRIFT');
 const questions=roles.map(x=>x[1]);
 const computedCondition=rows.map((r,i)=>
  r.position+' '+r.layer+' '+r.stem+'('+r.tenGod+')의 질문: '+roles[i][0]).join(' / ')+
  (pair?' / 실제 오행 관계: '+relation.computedRelation:
   ' / 이 항목에서 한 전통 분류만 확인됨')+
  '. 실제 스트레스나 성격·건강·회복 결과를 측정하지 않았다.';
 const guidance=pair?
  SCENES[topicId]+'에서 '+questions[0]+'와 '+questions[1]+
  '를 다른 두 판단 조건으로 나누어 하나의 문단에서 설명한다. 첫 조건만 살필 때 '+
  '둘째 질문은 아직 답하지 못한다. 분류를 두 성격의 갈등이나 강약으로 바꾸지 않는다.':
  SCENES[topicId]+'에서 '+questions[0]+
  '라는 한 가지 질문에 답할 범위만 설명한다. 근거가 없는 반대 의미나 '+
  '실제 감정 반응을 덧붙이지 않는다.';
 return Object.freeze({
  kind:'source-owned-stress-reading-v1',topic:chapterId+'.'+topicId,
  sourceRefs:Object.freeze(rows.map(x=>x.ref)),
  roleTypes:Object.freeze(rows.map(x=>x.tenGod)),
  readerQuestions:Object.freeze(questions),computedCondition,
  mode:pair?'paired':'single',scene:SCENES[topicId],
  writerGoal:guidance+' 압박(trigger)은 원래 의무와 새 요구의 경계를, '+
   '대처(response)는 확인할 설명과 도움의 방법을 다룬다. '+
   '금전·직업·기본 성향에서 이미 설명한 자원·정보·성과 풀이를 되풀이하지 않는다. '+
   '심리 진단, 실제 스트레스 경험, 회복 속도, 성공을 단정하지 않는다.',
  observedStress:false,diagnosedHealth:false,predictedRecovery:false
 });
}
module.exports={build};
