'use strict';
// Editorial review leads, not proof of semantic correctness. No model calls.
// This module never changes a report or turns an uncertain judgment into a pass.
const domains=new Set(['money','career','relationship','stress','year_2027_money','year_2027_career','year_2027_relationship']);
const annualDomains=new Set(['year_2027_money','year_2027_career','year_2027_relationship']);
const limited=/단정(?:할|하지)|확정(?:할|하지)|증명(?:할|되지)|알 수 없|판단할 수 없|확인할 수 없|예측(?:할|하지)|보장(?:할|하지)|(?:아니|않)(?:라|습니다)|가정(?:하면|에서|이)/;
const predictedEvent=/(?:수입|매출|연봉|재산|돈|자산).{0,18}(?:늘어|증가|오릅|늘어납|불어납|줄어듭|감소)|(?:승진|합격|이직|퇴사|결혼|이별|이혼|취업|당첨)(?:하(?:게\s*됩니다|게\s*될|겠습니다|게\s*돼|는\s*해)|됩|할\s*것|하게\s*될)/;
const observedRecord=/(?:항상|매번|절대|누구보다|반드시).{0,45}(?:합니다|됩니다|해왔습니다|해\s*왔습니다|해요|합니다)|(?:실제로\s*(?:직장|일|투자|돈|가족|연인|상대|사람)).{0,45}(?:합니다|해왔|됩니다)/;
const annualShared=/정관|편관|정인|편인|정재|편재|비견|겁재|식신|상관/;
const domainTitle=/수입|소비|지출|돈|보상|금전|일|직업|업무|승진|관계|가족|친밀|연애/;
const crossThesis=[{code:'recycled-domain-thesis-review',pattern:/(?:기준|근거|논리|규칙|책임|계획)/,second:/(?:확인|검토|판단|따져|지키|따르|비교)/}];
const splitSentences=text=>String(text||'').split(/(?<=[.!?。])\s*|\n+/).map(x=>x.trim()).filter(Boolean);
const claimFields=s=>[
 {field:'keyJudgment',text:s?.keyJudgment},
 ...(Array.isArray(s?.body)?s.body.map((text,index)=>({field:'body',index,text})):[])
];
function review(report){
 const findings=[],repeated=[],thesisLocations=[],annualSharedLabels=new Map();
 for(const section of report?.sections||[]){
  if(!section||typeof section!=='object')continue;
  const id=section.id||'unknown';
  (section.body||[]).forEach((text,index)=>{
   const location={section:id,field:'body',index};
   if(/(?:자기|자신|기준)/.test(text)&&/(?:주변|환경|상황|규칙)/.test(text)&&/(?:기준|판단|논리)/.test(text))repeated.push(location);
  });
  const primary=String(section.keyJudgment||'');
  if(domains.has(id)&&crossThesis.some(x=>x.pattern.test(primary)&&x.second.test(primary)))thesisLocations.push({section:id,field:'keyJudgment'});
  for(const field of claimFields(section)){
   for(const sentence of splitSentences(field.text)){
    const location={section:id,field:field.field,...(field.index===undefined?{}:{index:field.index})};
    if(/(?:INTJ|MBTI|판단형|J유형)/i.test(sentence)&&/(?:결정[을은]?\s*바꾸지|타협[을]?\s*(?:하지|거부)|원칙적으로)/.test(sentence))
     findings.push({...location,code:'mbti-rigidity-review',excerpt:sentence});
    if(/(?:신뢰를\s*받|인정[을]?\s*받|관찰할\s*수\s*있)/.test(sentence))
     findings.push({...location,code:'unobserved-reputation-review',excerpt:sentence});
    if(annualDomains.has(id)&&predictedEvent.test(sentence)&&!limited.test(sentence))
     findings.push({...location,code:'annual-event-certainty-review',excerpt:sentence});
    if(domains.has(id)&&observedRecord.test(sentence)&&!limited.test(sentence))
     findings.push({...location,code:'unobserved-behavior-review',excerpt:sentence});
    if(/\b(쉽게|다시|계속|바로|항상|매번|같이)\s+\1\b/.test(sentence))
     findings.push({...location,code:'adjacent-word-review',excerpt:sentence});
   }
  }
  if(annualDomains.has(id)){
   // Only a lead: the same label may be legitimately shared if the chapter
   // also carries separate direct evidence. A reviewer must inspect that.
   const labels=new Set((section.evidence||[]).flatMap(text=>
    [...String(text).matchAll(/정관|편관|정인|편인|정재|편재|비견|겁재|식신|상관/g)].map(m=>m[0])));
   for(const label of labels){if(!annualSharedLabels.has(label))annualSharedLabels.set(label,[]);annualSharedLabels.get(label).push(id)}
  }
 }
 if(repeated.length>=3&&new Set(repeated.map(x=>x.section)).size>=2)
  findings.push({code:'repeated-standards-context-review',locations:repeated});
 if(new Set(thesisLocations.map(x=>x.section)).size>=3)
  findings.push({code:'recycled-domain-thesis-review',locations:thesisLocations});
 for(const [label,ids] of annualSharedLabels){
  if(ids.length>=2)findings.push({code:'shared-annual-label-review',label,sections:ids});
 }
 return {releaseVerdict:'not-assessed',requiresHumanReview:true,findings,
  limitation:'검토할 문장을 찾는 보조 검사다. 부정·조건부·전통 해석 문장도 표시될 수 있으며, 표시가 없어도 자동 합격은 아니다.'};
}
module.exports={review};
