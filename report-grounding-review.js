'use strict';
// Rejection-only heuristic for generic paid prose, never a release certificate.
// Inspect only customer-facing interpretations, not internal symbolic evidence.
const patterns=[
 /(?:다양한|여러|여러\s*가지).{0,36}(?:공존|병존|함께\s*(?:작용|나타나|드러)|특징이\s*함께)/,
 /(?:서로\s*다른|여러).{0,22}방향.{0,18}(?:공존|병존)/,
 /상황에\s*따라.{0,55}(?:다양한|조정|균형|달라질|두드러지|필요)/,
 /(?:다양한|여러).{0,30}(?:판단|대처|적응|상황).{0,30}(?:필요|균형)/,
 /(?:균형|조화|조정).{0,22}(?:필요|중요)/
];
function inspect(report){
 const blockingErrors=[],findings=[];
 for(const section of report?.sections||[]){
  if(section?.id!=='saju_core')continue;
  const sentences=[section.keyJudgment,...(section.body||[])].join(' ').split(/(?<=[.!?。])\s*|\n+/)
   .map(x=>x.trim()).filter(x=>x.length>=15);
  const generic=sentences.filter(s=>patterns.some(p=>p.test(s)));
  const fraction=sentences.length?generic.length/sentences.length:0;
  if(generic.length)findings.push({code:'nonspecific-saju-interpretation',section:'saju_core',
   genericCount:generic.length,sentenceCount:sentences.length});
  if(generic.length>=3&&fraction>=0.25)
   blockingErrors.push('saju_core:generalities-instead-of-grounded-interpretation');
  // These are reader-facing claims: we calculate an actual clash pair,
  // never the magnitude of a clash. Correct denials are not overclaims.
  const fields=[section.title,section.keyJudgment,...(section.bodyLabels||[]),...(section.body||[])]
   .filter(x=>typeof x==='string');
  for(const field of fields){
   for(const sentence of field.split(/(?<=[.!?。])\s*|\n+/)){
    const claims=/(?:강한|심한|거센)\s*(?:지지\s*)?충|(?:충|충돌)(?:이|은|가)?\s*(?:매우\s*)?(?:강하|거세|심하)/.test(sentence);
    const denied=/(?:강한|심한|거센)\s*(?:지지\s*)?충.{0,35}(?:단정할\s*수\s*없|확정할\s*수\s*없|아니|증명하지\s*않)/.test(sentence);
    if(claims&&!denied){
     blockingErrors.push('saju_core:unmeasured-clash-strength-assertion');
     break;
    }
   }
  }
  if(fields.some(x=>/주인공(?:과|의|에게|은|이)/.test(x)))
   blockingErrors.push('saju_core:unnatural-protagonist-address');
  // Repeated 'cannot tell' sentences may be correct individually but cannot
  // substitute for the paid chapter's source-grounded interpretation.
  const limitation=/(?:단정(?:할\s*수\s*없|하지)|확정(?:할\s*수\s*없|하지)|보장하지|판정할\s*수\s*없|판단할\s*수\s*없|말할\s*수\s*없|알\s*수\s*없|정해지지\s*않|볼\s*근거(?:는|가)?\s*없)/;
  for(const paragraph of section.body||[]){
   const pieces=String(paragraph).split(/(?<=[.!?。])\s*|\n+/)
    .map(x=>x.trim()).filter(x=>x.length>=12);
   const disclaimers=pieces.filter(x=>limitation.test(x)).length;
   if(disclaimers>=3&&disclaimers/pieces.length>=0.4){
    blockingErrors.push('saju_core:repeated-limitations-displace-interpretation');
    break;
   }
  }
 }
 return {blockingErrors,findings,requiresHumanReview:true,verdict:'not-assessed'};
}
module.exports={inspect};
