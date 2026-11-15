'use strict';
// OFFLINE editorial diagnostic: do the consequences of a hypothetical
// choice visibly connect to the VERIFIED category of BOTH cited positions?
// Lexical corroboration is weak evidence. This cannot approve paid writing,
// infer human behaviour, or choose any traditional interpretive priority.
const TERMS=Object.freeze({
 '비견':/(?:각자|자기|스스로|개인|담당|몫|동료)/,
 '겁재':/(?:함께|공동|공유|나누|경쟁|협력)/,
 '식신':/(?:결과물|생산|만들|완성|꾸준|산출)/,
 '상관':/(?:새로운\s*제안|다른\s*방식|바꾸|표현|개선)/,
 '정재':/(?:매달|비용|지출|예산|재고|정기|관리)/,
 '편재':/(?:외부|자원|공급처|거래|선택지|협력처|바깥|제안)/,
 '정관':/(?:규칙|절차|규정|역할|정해진|책임|담당)/,
 '편관':/(?:긴급|갑작|예상치|압박|책임\s*범위|대응)/,
 '정인':/(?:배운|익숙|설명|지식|조언|알려진|학습)/,
 '편인':/(?:낯선|정보|이해|처음\s*접|새로운\s*설명)/
});
const CONDITION=/(?:경우|때(?:는|에는|도)?|[가-힣]+면|다면|라면)/;
const CONSEQUENCE=/(?:도움|놓치|흔들|소홀|어렵|불리|빠뜨|기회|위험|좋아|유리|손해)/;
const split=text=>String(text||'').split(/[.!?。！？\n]+/)
 .map(x=>x.trim()).filter(Boolean);
function inspect({prompt,payload,response}={}){
 if(prompt?.qaNatalDepthPreview!==true||
  JSON.stringify(prompt.requestedSections)!=='["saju_core"]')
  throw Error('QA_ROLE_CONSEQUENCE_INVALID_SCOPE');
 const topic=payload?.task?.chapters?.saju_core?.topics?.natal_depth;
 const body=response?.chapters?.saju_core?.paragraphs?.natal_depth;
 if(!topic||!body||typeof body.text!=='string'||
    !Array.isArray(body.basis?.refs))
  throw Error('QA_ROLE_CONSEQUENCE_MISSING_SCOPED_TEXT');
 const factIds=new Set(topic.citableFacts?.map(r=>r.id));
 const sentences=split(body.text);
 const actionable=sentences.filter(line=>CONDITION.test(line)&&CONSEQUENCE.test(line));
 const roles={};
 const problems=[];
 for(const position of ['year','hour']){
  const id='natal.'+position+'.stem';
  const row=payload.source?.[id];
  const expected=prompt.facts?.facts?.tenGods?.[position]?.stemTenGod;
  if(!factIds.has(id)||!body.basis.refs.includes(id)||
   !row?.traditionalMeaning||row.tenGod!==expected||
   row.observedBehavior!==false||row.interpretationScope!=='traditional-symbol-only'||
   !TERMS[row.tenGod])
   throw Error('QA_ROLE_CONSEQUENCE_UNVERIFIED_FACT:'+position);
  // Mere dictionary definitions at the beginning are not enough.
  const supported=actionable.filter(s=>TERMS[row.tenGod].test(s));
  roles[position]={sourceRef:id,calculatedCategory:row.tenGod,
   conditionalConsequenceSentences:supported.length,
   sourceMentionIsNotReaderProof:true};
  if(!supported.length)problems.push('conditional-consequence-not-linked:'+position);
 }
 const categoryDiffers=roles.year.calculatedCategory!==roles.hour.calculatedCategory;
 return {
  kind:'qa-natal-conditional-source-consequence-audit-v1',
  roleConditions:roles,conditionalSentenceCount:actionable.length,
  differentSourceCategories:categoryDiffers,
  claimsOfPersonalityEstablished:false,interpretivePriorityValidated:false,
  warnings:problems,
  result:problems.length?'missing-visible-source-to-consequence-link':
   'role-terms-visible-in-conditional-prose-needs-expert-review',
  methodApproved:false,readerPaidValueVerified:false,
  humanReviewRequired:true,customerReleaseApproved:false,
  providerCalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={inspect};
