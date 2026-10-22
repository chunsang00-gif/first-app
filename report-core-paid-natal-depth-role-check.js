'use strict';
// Conservative QA-only lexical grounding signals, not a linguistic or
// professional Saju truth evaluator. Only checks that a stated natal position
// has at least one plausible everyday description of its VERIFIED ten-god.
// False negatives must remain blocked for manual review, not auto-corrected.
const cues={
 '비견':/(?:자기\s*몫|스스로\s*맡|개인\s*담당|동료와\s*구분)/,
 '겁재':/(?:공동\s*자원|함께\s*쓰|함께\s*나누|공유할\s*몫|경쟁)/,
 '식신':/(?:결과물|차근차근\s*만들|생산|꾸준히\s*만들|내용을\s*완성)/,
 '상관':/(?:다른\s*표현|달리\s*표현|새로운\s*제안|익숙한\s*방식.*다르|방식을\s*바꾸)/,
 '정재':/(?:반복되\w*\s*비용|꾸준히\s*관리|예산|정기적\s*관리|지출을\s*관리|비용과\s*일.*관리)/,
 '편재':/(?:필요한\s*자원|여러\s*곳.*자원|자원을\s*골|자원.*활용|외부\s*자원)/,
 '정관':/(?:정해진\s*규칙|규칙과\s*역할|맡은\s*역할|규칙.*적용|역할의\s*경계)/,
 '편관':/(?:갑작스러운\s*요구|예상치\s*못한\s*책임|예상\s*밖.*요청|책임\s*범위|긴급.*대응)/,
 '정인':/(?:배운\s*내용|주변\s*조언|알려진\s*설명|익숙한\s*안내|지식.*참고)/,
 '편인':/(?:낯선\s*정보|자기\s*방식.*이해|익숙하지\s*않.*이해|처음\s*접한\s*설명|새로운\s*정보.*이해)/
};
// Only highly distinctive attribution phrases are used for a contradiction
// audit. A correct cue anywhere in the clause must not hide a wrong cue.
// Mixed clauses that mention both natal positions remain manual-review cases.
const conflicting={
 '비견':/스스로\s*맡을\s*일/,
 '겁재':/함께\s*쓰는\s*몫/,
 '식신':/차근차근\s*결과물|결과물로\s*만들/,
 '상관':/새로운\s*제안/,
 '정재':/반복되는\s*비용/,
 '편재':/여러\s*곳(?:에서)?\s*필요한\s*자원/,
 '정관':/정해진\s*규칙/,
 '편관':/갑작스러운\s*요구/,
 '정인':/배운\s*내용과\s*주변\s*조언/,
 '편인':/낯선\s*정보를\s*자기\s*방식/
};
const roles=[
 {pos:'year',source:'natal.year.stem',re:/(?:태어난\s*해|해에서|해의|연간)/},
 {pos:'hour',source:'natal.hour.stem',re:/(?:태어난\s*시간|시간에는|시간에서|시간의|시간\s*겉)/}
];
function inspect(text,source){
 const errors=[];
 const clauses=String(text||'').split(/[.!?。！？\n]+/).map(x=>x.trim()).filter(Boolean);
 for(const {pos,re,source:id} of roles){
  const god=source?.[id]?.tenGod;
  if(!god||!cues[god]){errors.push('QA_DEPTH_ROLE_NOT_VERIFIED:'+pos);continue;}
  // A clause must identify the source POSITION as well as carry the meaning.
  const candidates=clauses.filter(x=>re.test(x));
  if(!candidates.length){errors.push('QA_DEPTH_POSITION_NOT_EXPLAINED:'+pos);continue;}
  if(!candidates.some(x=>cues[god].test(x)))
   errors.push('QA_DEPTH_POSITION_MEANING_UNGROUNDED:'+pos);
  // A misleading role claim and a correct claim in the SAME clause must
  // not count as grounded merely because the expected word is present.
  for(const clause of candidates){
   // When a sentence explicitly compares year and hour, lexical proximity
   // alone cannot identify attribution; leave nuanced cases to human QA.
   if(roles.some(other=>other.pos!==pos&&other.re.test(clause)))continue;
   const contradictory=Object.entries(conflicting)
    .filter(([otherGod,regex])=>otherGod!==god&&regex.test(clause));
   if(contradictory.length){
    errors.push('QA_DEPTH_POSITION_CONFLICTING_MEANING:'+pos);
    break;
   }
  }
 }
 return errors;
}
module.exports={inspect};
