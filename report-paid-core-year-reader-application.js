'use strict';
// Minimum mechanical editorial audit of the NORMAL first-chapter added
// year-visible role. Evidence/citation correctness is verified separately.
// Passing is NOT a traditional-method or customer-value approval.
const ROLE=Object.freeze({
 식신:/(?:완성|결과물|만들|제작|생산|산출)/,
 상관:/(?:기존\s*방식|바꾸|다른\s*방법|개선|제안|표현)/,
 정재:/(?:반복|정기|정해진|고정|비용|지출|유지)/,
 편재:/(?:여러\s*경로|외부|자원|자금|마련|확보|조달)/,
 정관:/(?:정해진|규칙|절차|승인|역할|책임)/,
 편관:/(?:갑작|돌발|긴급|예상하지\s*못한|책임\s*범위|새로운\s*요구)/
});
const DOMAIN=Object.freeze({
 skill:/(?:배우|배운|익히|기술|새\s*방법|학습|공부|교육|연습)/,
 money:/(?:저축|지출|수입|투자|소비|돈|비용|자금|자원|월급|연봉)/,
 pressure:/(?:압박|부담|요구|책임|규칙|마감|절차|긴장|업무)/
});
const CONDITION=/(?:때|경우|라면|다면|하면|한다면|하려면|반면|반대로|조건)/;
const YEAR=/(?:태어난\s*해|출생\s*해|출생연도|해의\s*겉글자|한\s*해의\s*자리|연간)/;
const MONTH=/(?:태어난\s*달|출생월|달의\s*(?:겉글자|속글자|기본|중심)|월간|월지)/;
const normalize=s=>String(s||'').normalize('NFKC').replace(/[\s.,!?。！？]+/g,'');
function inspect(p,monthText,proof){
 if(!proof)return [];
 if(!p||typeof p.text!=='string'||!Array.isArray(p.basis?.refs))
  return ['missing-year-paragraph'];
 const errors=[],refs=proof.sourceRefs||[];
 if(proof.kind!=='buyer-question-year-visible-role-addition-v1'||
    refs.length!==4||!refs.every(ref=>p.basis.refs.includes(ref))||
    proof.yearSourceId!=='natal.year.stem')
  errors.push('missing-year-comparison-citations');
 const sentences=p.text.split(/[.!?。！？\n]+/)
  .map(x=>x.trim()).filter(x=>x.length>=22);
 const role=ROLE[proof.yearRole],domain=DOMAIN[proof.readerDomain];
 if(!role||!sentences.some(s=>YEAR.test(s)&&role.test(s)))
  errors.push('missing-distinct-year-meaning');
 if(!sentences.some(s=>MONTH.test(s)&&/(?:다른|차이|구분|비교|새로운|별도|달라)/.test(s)))
  errors.push('month-year-comparison-not-visible');
 const applied=sentences.filter(s=>domain?.test(s)&&role?.test(s)&&CONDITION.test(s));
 if(applied.length<2)
  errors.push('missing-two-independent-reader-conditions');
 if(normalize(p.text)===normalize(monthText)||
    !sentences.some(s=>!normalize(monthText).includes(normalize(s))))
  errors.push('repeated-free-month-paragraph');
 return errors;
}
module.exports={inspect};
