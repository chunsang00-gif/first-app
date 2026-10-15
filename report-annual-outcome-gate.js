'use strict';
// High-confidence deterministic assertions about real-world outcomes are not
// justified by Saju or MBTI input. Distinguish them from questions, examples
// and statements explaining the limits of prediction. No API calls.
const scope={
 year_2027_money:'money',
 year_2027_career:'career',
 year_2027_relationship:'relationship'
};
const outcomes={
 money:[
  /(?:연봉|월급|급여|수입|매출|재산|자산|금전|소득|돈)(?:이|가|은|는|을)?\s*(?:(?:반드시|확실히|크게|더|급격히)\s*)?(?:늘어(?:납니다|납니다|날\s*것입니다)|증가(?:합니다|하게\s*됩니다|할\s*것입니다)|오릅니다|올라갑니다|줄어듭니다|감소합니다|불어납니다)/,
  /(?:큰돈|돈|재산|보너스|상여금|성과급)(?:을|이|가)?\s*(?:벌게\s*됩니다|받게\s*됩니다|얻습니다|들어옵니다|생깁니다)/
 ],
 career:[
  /(?:승진|승격|취업|합격|이직|퇴사|전직|독립|창업|보직\s*변경)(?:을|에|이|가)?\s*(?:합니다|됩니다|할\s*것입니다|할\s*겁니다|하게\s*됩니다|하게\s*될\s*것입니다|에\s*성공합니다|이\s*확정됩니다)/,
  /(?:승진|승격|취업|합격|이직|전직)(?:이|가)?\s*(?:확정됩니다|성사됩니다)/
 ],
 relationship:[
  /(?:결혼|약혼|연애|재회|이별|이혼)(?:을|에|이|가)?\s*(?:합니다|됩니다|하게\s*됩니다|하게\s*될\s*것입니다|성사됩니다|확정됩니다)/,
  /(?:새로운\s*(?:인연|연인)|배우자|애인)(?:을|이|가)?\s*(?:만납니다|생깁니다|찾아옵니다)/
 ]
};
const qualified=/(?:단정할\s*수\s*없|예측할\s*수\s*없|확인할\s*수\s*없|알\s*수\s*없|보장하지\s*않|의미하지\s*않|확정할\s*수\s*없|판단할\s*수\s*없|라는\s*뜻은\s*아닙니다|라고\s*말할\s*수\s*없|는\s*것은\s*아닙니다)/;
const explicitYear=/(?:2027\s*년|내년)/;
function sentences(value){
 return String(value||'').split(/[.!?。！？\n]+/).map(x=>x.trim()).filter(Boolean);
}
function check(report){
 const findings=[];
 const sections=[
  ...(report?.sections||[]),
  ...(report?.cover?[{id:'cover',title:report.cover.headline,body:[report.cover.description,...(report.cover.highlights||[]).flatMap(x=>[x.title,x.description])]}]:[]),
  ...(report?.finalJudgment?[{id:'finalJudgment',title:report.finalJudgment.headline,body:[...(report.finalJudgment.body||[]),report.finalJudgment.closingQuestion,...(report.finalJudgment.strengths||[]),...(report.finalJudgment.watchouts||[])]}]:[]),
  // A highlight linked to an annual chapter is itself in yearly scope,
  // even when the short card says "승진합니다" without repeating "2027".
  ...(report?.cover?.highlights||[])
   .filter(card=>scope[card?.sectionId]||card?.sectionId==='year_2027')
   .map(card=>({id:'cover',annualSource:card.sectionId,title:card.title,body:[card.description]}))
 
 ];
 for(const section of sections){
  const domain=scope[section.annualSource||section.id];
  const annual=(section.annualSource||section.id)==='year_2027';
  const summary=section.id==='cover'||section.id==='finalJudgment';
  if(!domain&&!annual&&!summary)continue;
  for(const [field,parts] of [
   ['title',[section.title]],['keyJudgment',[section.keyJudgment]],
   ['body',section.body||[]],['evidence',section.evidence||[]]
  ]){
   for(let i=0;i<parts.length;i++)for(const sentence of sentences(parts[i])){
    if(summary&&!section.annualSource&&!annual&&!explicitYear.test(sentence))continue;
    if(qualified.test(sentence))continue;
    for(const category of domain?[domain]:Object.keys(outcomes)){
     if(!outcomes[category].some(re=>re.test(sentence)))continue;
     findings.push({section:section.id,field,index:i,category,code:'deterministic-2027-outcome'});
    }
   }
  }
 }
 return findings;
}
module.exports={check};
