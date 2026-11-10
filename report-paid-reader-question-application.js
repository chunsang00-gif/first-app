'use strict';
// Reader-facing check for ONE verified buyer-domain writing assignment.
// A cited symbolic fact and a user question do not establish a real outcome.
// This deliberately checks only high-confidence omissions: not expert prose.
const GROUPS=Object.freeze({
 career:[
  {q:/기술|배우|배울|배운|공부|학습|익히|자격|훈련|교육/,p:/기술|배우|배운|배울|익히|공부|학습|교육|훈련|자격|새\s*방법/},
  {q:/유지|현재\s*일|기존\s*일|계속|직장/,p:/유지|계속|기존\s*(?:일|업무)|현재\s*(?:일|업무)|직장|근무|맡은\s*일/},
  {q:/이직|퇴사|취업|입사|새로운\s*일|새\s*직장/,p:/이직|퇴사|취업|입사|새\s*(?:일|직장|업무)|직업을\s*바꾸/},
  {q:/업무|직무|직종|회사|부서/,p:/업무|직무|직종|회사|부서|맡은\s*일/}
 ],
 money:[
  {q:/저축|적금|모으|남겨|보유/,p:/저축|적금|모으|남겨|남길|보유|남겨\s*두/},
  {q:/주식|투자|코인|매매/,p:/주식|투자|코인|매매|시장에\s*넣/},
  {q:/지출|소비|쓰고|쓸지|구매/,p:/지출|소비|쓰|구매|지불|사용/},
  {q:/대출|빚|채무|부채/,p:/대출|빚|채무|부채|갚|상환/},
  {q:/수입|소득|월급|연봉|급여/,p:/수입|소득|월급|연봉|급여|받는\s*돈/}
 ],
 relationship:[
  {q:/친구|가족|부부|연인|배우자/,p:/친구|가족|부부|연인|배우자|가까운\s*사람|상대/},
  {q:/서운|갈등|싸우|다툼|화해/,p:/서운|갈등|싸우|다투|화해|마음이\s*상/},
  {q:/말할|대화|표현|소통/,p:/말하|말할|표현|대화|소통|전달|이야기/},
  {q:/넘길|참을|그냥\s*넘|거리/,p:/넘기|지나가|참|거리|말하지\s*않/},
  {q:/결혼|이혼|연애|이별|헤어지/,p:/결혼|이혼|연애|이별|헤어지|관계를\s*계속/}
 ],
 stress:[
  {q:/스트레스|압박|불안|긴장|부담/,p:/스트레스|압박|불안|긴장|부담|요구|마감/},
  {q:/쉬|휴식|휴가|회복|풀고|해소/,p:/쉬|휴식|휴가|회복|멈추|잠시\s*중단|해소|쉬어/},
  {q:/계속|참고|견딜|버티|진행/,p:/계속|참|견디|버티|진행|끝까지\s*하/},
  {q:/피로|지치|과로|번아웃/,p:/피로|지치|과로|번아웃|쉬|휴식/}
 ]
});
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
