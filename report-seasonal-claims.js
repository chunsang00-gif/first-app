'use strict';
// Only explicit, high-confidence seasonal/strength claims. Heuristic Korean
// review cannot replace an expert semantic review.
const LABELS={spring:'봄',summer:'여름',autumn:'가을',winter:'겨울'};
const categoricalStrength=/(?:신강|신약|극신강|극신약)(?:\s*(?:입니다|이다|으로\s*(?:확정|판정|분류)|이라고\s*(?:확정|판정)|에\s*해당|한\s*사주))/;
const categoricalUse=/(?:용신|기신)\s*(?:은|는|이|가|으로|으로는)\s*(?:목|화|토|금|수|갑|을|병|정|무|기|경|신|임|계|[甲乙丙丁戊己庚辛壬癸])(?:\s|입니다|이다|로|을|를|이|가|$)/;
const fullDeuk=/(?:득령|득지|득세)(?:을\s*)?(?:했습니다|합니다|이다|입니다|으로\s*확정|으로\s*판정)/;
const negate=/(?:단정할\s*수\s*없|판정할\s*수\s*없|확정할\s*수\s*없|판단할\s*수\s*없|알\s*수\s*없|단정하지\s*않|판정하지\s*않|확정하지\s*않|판단하지\s*않|미판정|검증되지\s*않|아닙니다|아니다|는\s*뜻은\s*아니)/;
const explicitSeason=/(?:태어난\s*달|출생\s*월지|월지|월령)(?:의|가|는|은|이|에는|에서|\s){0,5}(봄|여름|가을|겨울)/g;
function sentences(text){return String(text||'').split(/[.!?。！？\n]+/).map(s=>s.trim()).filter(Boolean)}
function check(report,packet){
 const errors=[],source=packet?.facts?.seasonalEvidence;
 const parts=[...(report?.sections||[])];
 if(report?.cover)parts.push({id:'cover',title:report.cover.headline,
  body:[report.cover.description,...(report.cover.highlights||[]).flatMap(x=>[x.title,x.description])]});
 if(report?.finalJudgment)parts.push({id:'finalJudgment',title:report.finalJudgment.headline,
  body:[...(report.finalJudgment.body||[]),...(report.finalJudgment.strengths||[]),...(report.finalJudgment.watchouts||[])]});
 for(const section of parts)for(const sentence of [
  section.title,section.keyJudgment,...(section.body||[]),...(section.evidence||[])
 ].flatMap(sentences)){
  if(negate.test(sentence))continue;
  if(categoricalStrength.test(sentence)||categoricalUse.test(sentence)||fullDeuk.test(sentence))
   errors.push(section.id+': unsupported final Day Master strength or useful-god verdict');
  if(!source)continue;
  for(const match of sentence.matchAll(explicitSeason)){
   if(match[1]!==LABELS[source.monthSeason])
    errors.push(section.id+': birth month season conflicts with calculated month branch');
  }
 }
 return [...new Set(errors)];
}
module.exports={check};
