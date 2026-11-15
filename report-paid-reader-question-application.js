'use strict';
// Reader-facing check for ONE verified buyer-domain writing assignment.
// A cited symbolic fact and a user question do not establish a real outcome.
// This deliberately checks only high-confidence omissions: not expert prose.
const {GROUPS}=require('./report-paid-reader-question-domain');
const CONDITIONAL=/(?:때|경우|하면|한다면|라면|에서는|하려면|선택할|선택하면|이어질|달라지|비교하|구별하|어떤\s*상황)/;
const ACTION=Object.freeze({
 career:/(?:배우|익히|준비|맡|일하|업무|학습|훈련|직장|교육|기술|실습|적용|과제|직무|바꿀)/,
 money:/(?:남겨|남길|모으|저축|투자|사용|지출|지불|구매|비교|자원|돈을\s*쓰|갚|상환|수입)/,
 relationship:/(?:말하|대화|표현|전달|묻|확인|약속|관계|상대|친구|합의|서운|거리를\s*두)/,
 stress:/(?:쉬|휴식|회복|대응|압박|요구|조정|도움|마감|수행|멈추|변경|긴장|부담)/
});
function inspect(paragraph,assignment){
 if(!assignment)return [];
 if(assignment.kind!=='buyer-current-question-grounded-domain-v1'||
    !GROUPS[assignment.chapterId]||
    typeof assignment.question!=='string'||!assignment.question.trim())
  return ['invalid-buyer-domain-editorial-assignment'];
 if(paragraph==null)return []; // optional source-backed topic may be omitted
 const refs=paragraph.basis?.refs;
 if(!Array.isArray(refs)||!assignment.sourceRefs.every(ref=>refs.includes(ref)))
  return ['buyer-domain-source-reference-not-cited'];
 const text=typeof paragraph.text==='string'?paragraph.text.trim():'';
 const own=text.split(assignment.question.trim()).join(' ').trim();
 if(own.length<45)return ['buyer-domain-question-echo-without-explanation'];
 const groups=GROUPS[assignment.chapterId].filter(g=>g.q.test(assignment.question));
 // When a buyer has TWO independently identifiable decision aspects, a
 // paragraph that mentions only one while copying the whole question fails.
 // One vague or syntactically ambiguous focus remains a human-review matter.
 if(groups.length>=2&&groups.filter(g=>g.p.test(own)).length<2)
  return ['buyer-domain-customer-alternatives-not-distinguished'];
 if(groups.length===1&&!groups[0].p.test(own))
  return ['buyer-domain-customer-topic-not-applied'];
 const sentences=own.split(/[.!?。！？\n]+/).map(x=>x.trim());
 if(!sentences.some(s=>s.length>=30&&CONDITIONAL.test(s)&&
     ACTION[assignment.chapterId].test(s)))
  return ['buyer-domain-no-concrete-conditional-application'];
 return [];
}
module.exports={inspect,GROUPS};
