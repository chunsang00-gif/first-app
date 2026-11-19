'use strict';
// Optional CUSTOMER-REPORTED decision context, NOT natal calculation evidence.
// Missing context is legal; partial/unsafe context must be rejected. This
// avoids suggesting a personal career answer from date/time alone.
const FIELDS=Object.freeze(['currentWork','targetSkill']);
const DISCLAIMER='고객이 직접 입력한 상황입니다. 사주 계산 사실이나 실제 업무 성과·학습 능력이 확인된 자료가 아닙니다.';
const unsafe=v=>/[<>\r\n\u0000-\u001f\u007f]/.test(v)||
 /(?:https?:\/\/|www\.|@|(?:\b01[016789][- ]?\d{3,4}[- ]?\d{4}\b))/i.test(v)||
 /(?:\b(?:system|assistant|developer)\s*:|ignore\s+(?:all\s+)?(?:previous|instructions)|프롬프트\s*(?:무시|변경))/i.test(v);
function inspect(input){
 if(input===undefined||input===null)return {status:'not-provided',valid:true};
 if(!input||typeof input!=='object'||Array.isArray(input)||
    Object.keys(input).some(k=>!FIELDS.includes(k)))
  return {status:'invalid',valid:false,code:'BUYER_DECISION_CONTEXT_FORMAT'};
 const a=input.currentWork,b=input.targetSkill;
 if(typeof a!=='string'||typeof b!=='string'||
    [a,b].some(x=>x.trim().length<2||x.trim().length>80||unsafe(x)))
  return {status:'invalid',valid:false,code:'BUYER_DECISION_CONTEXT_INCOMPLETE_OR_UNSAFE'};
 return {status:'ready',valid:true,
  data:Object.freeze({currentWork:a.trim(),targetSkill:b.trim()})};
}
function checked(input){
 const v=inspect(input);
 if(!v.valid)throw Error(v.code);
 return v.status==='ready'?v.data:null;
}
function readerTask(input){
 const data=checked(input);
 if(!data)return null;
 return Object.freeze({
  kind:'buyer-self-reported-work-and-study-context-v1',
  currentWork:data.currentWork,targetSkill:data.targetSkill,
  evidenceKind:'user-entered-context',calculatedNatalFact:false,
  observedWorkPerformance:false,observedLearningSpeed:false,
  userProvidedTextMayBeWrong:true,jobOutcomePredicted:false,
  interpretationLimits:DISCLAIMER,
  writerGoal:'고객이 직접 적은 현재 일과 배우려는 기술의 내용이 다를 때만 두 선택의 구체적인 확인 조건에 반영한다. '+
   '현재 일에서는 그 일의 기존 결과물·검토 기준을 가정으로 묻고, 배우려는 기술에서는 그 기술로 처음 완성할 연습 결과물·시간·준비물을 가정으로 묻는다. '+
   '입력한 상황을 실제 경험·성격·능력·합격·성공의 사주 증거로 인용하지 않는다. 기존 무료 풀이를 새 설명인 것처럼 재사용하지 않는다.'
 });
}
module.exports={inspect,checked,readerTask,FIELDS,DISCLAIMER};
