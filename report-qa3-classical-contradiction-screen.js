'use strict';
// A narrow, fail-closed adversarial assertion filter for the ONE verified
// synthetic chart. This detects known false assertions; it never establishes
// semantic truth from keywords. Do not permit this to run in production.
const split=(s)=>String(s||'').split(/(?<=[,;，；])\s*|(?:\s+|,\s*)(?=하지만|다만|그러나|반면|그렇지만)/u)
 .flatMap(x=>x.split(/(?<=[.!?。！？])\s+/u)).map(x=>x.trim()).filter(Boolean);
const add=(out,id)=>{if(!out.includes(id))out.push(id)};
function contradiction(s){
 const errors=[];
 // Check the relevant assertion's LOCAL clause. A different caveat like
 // "다만 내일 일은 단정할 수 없습니다" cannot excuse an earlier claim
 // that 木 actually formed. Negative existence is no proof of truth either.
 for(const clause of split(s)){
  const context=clause.replace(/\s+/g,' ');
  const negatesTransformation=/(?:木|목).{0,35}(?:변한|합화된|바뀐)\s*것은?\s*(?:아니|아닙|않)|(?:실제|합화|변화).{0,22}(?:성립하지|확정되지|확인되지|않았|없었|아닙니다)|(?:木|목).{0,35}(?:변하지|바뀌지|합화하지)|(?:변했는지|바뀌었는지|합화되었는지|변했다거나|바뀌었다거나).{0,45}(?:알 수 없|판단할 수 없|확인할 수 없|단정할 수 없|확정할 수 없|판단할 수는 없)/.test(context);
  const actualTransformation=/(?:이미|실제로|분명히|확실히|반드시|완전히).{0,45}(?:木|목)(?:으로)?.{0,17}(?:변했|바뀌었|합화됐|합화되었|합화되어|변합니다|바뀝니다|합화됩니다|변하였)/.test(context)||
   /(?:木|목)(?:으로)?.{0,15}(?:변했습니다|바뀌었습니다|합화되었습니다|합화됐습니다|합화됩니다|확정되었습니다)/.test(context)||
   /(?:합화목|木으로 합화).{0,20}(?:확정|성립|완성|확실)/.test(context);
  if(actualTransformation&&!negatesTransformation)
   add(errors,'QA3_UNPROVEN_ACTUAL_TRANSFORMATION');
  // For each specific classically verified relation, an explicitly
  // opposite claim is forbidden, regardless of correct citations nearby.
  if(/(?:태어난 달|출생월|달의).{0,55}(?:숨은|속|안에).{0,60}(?:시간|시주).{0,35}(?:다른 글자|일치하지 않|같지 않|서로 다르)|(?:시간|시주).{0,60}(?:달|출생월).{0,55}(?:숨은|속).{0,35}(?:서로 다르|일치하지 않)/.test(context))
   add(errors,'QA3_FALSE_MONTH_HOUR_EXPOSURE');
  if(/(?:태어난 날|출생일|일간|날의).{0,55}(?:시간|시주).{0,55}(?:짝이 아니|한 쌍이 아니|합 후보가 아니|인접하지 않|짝이 없)/.test(context))
   add(errors,'QA3_FALSE_DAY_HOUR_PAIR');
  if(/(?:삼명통회|三命通會|未월|미월|출생월).{0,85}(?:未월|미월|출생월|달|월).{0,40}(?:조건에서 제외|조건에 해당하지 않|목록에 없|달의 범위에 들어가지 않)/.test(context))
   add(errors,'QA3_FALSE_LISTED_MONTH_ELIGIBILITY');
  if(/(?:태어난 해|해의 글자).{0,65}(?:시간|시주).{0,45}(?:제약|제어|누르|극하)/.test(context)||
     /(?:태어난 날|날의 글자).{0,65}(?:시간|시주).{0,45}(?:돕|생해|생하)/.test(context))
   add(errors,'QA3_REVERSED_ELEMENT_DIRECTIONS');
  if(/(?:오후 8시 20분|20:20|20시 20분).{0,100}(?:같은 짝이 유지|똑같은 합|날.시간의 짝은 그대로|같은 짝을 그대로|달라지지 않|변하지 않)/.test(context)||
     /(?:오후 8시 20분|20:20|20시 20분).{0,100}그대로 적용할 수 있습니다/.test(context))
   add(errors,'QA3_FALSE_HOUR_COUNTERFACTUAL');
  if(/(?:혈압|심장병|암|당뇨|건강|질병).{0,80}(?:높아집니다|생깁니다|발병|진단|걸리게|위험이 높)/.test(context)&&
     !/(?:확인되지|단정할 수 없|진단할 수 없|예측할 수 없|아닙니다)/.test(context))
   add(errors,'QA3_UNSUPPORTED_HEALTH_PROGNOSIS');
 }
 return errors;
}
module.exports={contradiction,split};
