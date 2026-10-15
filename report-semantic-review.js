'use strict';
// Review leads, NOT semantic proof or a new provider rejection gate.
// Keep excerpts in private QA artifacts; never log the customer's prose.
function review(report){
 const findings=[],repeated=[];
 for(const section of report?.sections||[]){
  (section.body||[]).forEach((text,index)=>{
   const location={section:section.id,field:'body',index};
   if(/(?:자기|자신|기준)/.test(text)&&/(?:주변|환경|상황|규칙)/.test(text)&&/(?:기준|판단|논리)/.test(text))repeated.push(location);
   for(const sentence of String(text).split(/(?<=[.!?。])\s*/)){
    if(/(?:INTJ|MBTI|판단형|J유형)/i.test(sentence)&&/(?:결정[을은]?\s*바꾸지|타협[을]?\s*(?:하지|거부)|원칙적으로)/.test(sentence))
     findings.push({...location,code:'mbti-rigidity-review',excerpt:sentence});
    if(/(?:신뢰를\s*받|인정[을]?\s*받|관찰할\s*수\s*있)/.test(sentence))
     findings.push({...location,code:'unobserved-reputation-review',excerpt:sentence});
   }
  });
 }
 if(repeated.length>=3&&new Set(repeated.map(x=>x.section)).size>=2)
  findings.push({code:'repeated-standards-context-review',locations:repeated});
 return {releaseVerdict:'not-assessed',requiresHumanReview:true,findings,
  limitation:'확인할 문장을 찾는 보조 검사다. 부정문과 정당한 비교도 표시될 수 있으며, 표시가 없어도 합격이 아니다.'};
}
module.exports={review};
