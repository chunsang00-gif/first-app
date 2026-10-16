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
function inspect(report,packet=null){
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
  // Root/clash evidence is required internally; avoid technical-first headings.
  // A paid core chapter must not become a technical glossary in its BODY,
  // even when the title is customer-friendly. Internal evidence is separately
  // preserved and validated; only the displayed paragraphs are inspected.
  // A technical word mentioned once in a real interpretation is allowed.
  // Avoid matching ordinary Korean '충돌', '충분', or '충전'.
  const technicalTerm=/(?:뿌리|통근|지장간|월지|일지|시지|천간|오행|충(?!돌|분|전))/g;
  for(const body of section.body||[]){
   const sentences=String(body).split(/(?<=[.!?。])\s*|\n+/)
    .map(x=>x.trim()).filter(x=>x.length>=12);
   const mentions=[...String(body).matchAll(technicalTerm)].length;
   if(sentences.length>=3&&mentions>=6&&mentions>=sentences.length+2){
    blockingErrors.push('saju_core:technical-lecture-instead-of-reader-interpretation');
    break;
   }
  }
  // Earlier paid drafts transformed TWO recorded hidden-stem positions
  // into "two centers of the mind" and a transitional month into
  // adaptability. Neither psychological conclusion was calculated.
  // This is a scoped false-inference guard, not a blacklist of metaphors.
  const deniesPsychologicalInference=sentence=>
   /(?:뜻은\s*아니|의미하지\s*않|증명하지\s*않|근거(?:가|는)\s*없|단정할\s*수\s*없|판단할\s*수\s*없|확정할\s*수\s*없)/.test(sentence);
  const coreSentences=body=>String(body).split(/(?<=[.!?。])\s*|\n+/)
   .map(x=>x.trim()).filter(Boolean);
  for(const paragraph of section.body||[]){
   const full=String(paragraph);
   const hasPositionalCount=/(?:뿌리|같은\s*기운|비슷한\s*힘|같은\s*오행).{0,65}(?:두\s*(?:곳|자리|부분)|2\s*곳)/.test(full)||
    /(?:두\s*(?:곳|자리|부분)|2\s*곳).{0,55}(?:뿌리|같은\s*기운|비슷한\s*힘)/.test(full);
   const mindClaim=coreSentences(full).some(sentence=>
    !deniesPsychologicalInference(sentence)&&
    /(?:마음.{0,70}두\s*부분.{0,25}균형|행동의?\s*원천.{0,75}두\s*부분.{0,25}균형|두\s*중심.{0,55}다르게\s*반응)/.test(sentence));
   if(hasPositionalCount&&mindClaim){
    blockingErrors.push('saju_core:root-count-to-psychology-overreach');
    break;
   }
  }
  if((section.body||[]).some(body=>coreSentences(body).some(sentence=>
   !deniesPsychologicalInference(sentence)&&
   /(?:이\s*시기에\s*태어난다는\s*것은|전환월에\s*태어난다는\s*것은).{0,110}(?:고정되지\s*않|외부로부터\s*영향|변화에\s*(?:잘\s*)?적응)/.test(sentence))))
   blockingErrors.push('saju_core:season-transition-to-personality-overreach');
  const headings=[section.title,...(section.bodyLabels||[])].filter(x=>typeof x==='string');
  if(headings.some(x=>/(?:뿌리|통근|지장간|원국|월지|일지|시지|천간|오행|충\\s*관계)/.test(x)))
   blockingErrors.push('saju_core:technical-evidence-used-as-reader-headline');
  // A claimed natal clash must name its actual two positions. Two roots
  // can clash separately with the MONTH without clashing with each other.
  const natalPairs=packet?.facts?.natalClashes||[];
  const actualPair=(left,right)=>natalPairs.some(row=>row.type==='충'&&
   Array.isArray(row.positions)&&row.positions.includes(left)&&row.positions.includes(right));
  const roots=packet?.facts?.stemConnections?.dayMasterRooting?.sameElementRoots||[];
  const twoRoots=roots.some(x=>x.position==='day')&&roots.some(x=>x.position==='hour');
  const falseDayHourClaim=fields.some(field=>String(field).split(/(?<=[.!?。])\s*|\n+/).some(sentence=>{
   if(actualPair('day','hour'))return false;
   // Clearly negated claims, including reader-friendly explanations of
   // why two rooted positions do not clash, must not fail.
   if(/(?:서로\s*충|충돌).{0,28}(?:뜻은\s*아니|의미하지\s*않|단정할\s*수\s*없|아닙니다|아니다)/.test(sentence))
    return false;
   const implicit=twoRoots&&/(?:이\s*두\s*자리|두\s*자리\s*모두).{0,22}서로\s*충/.test(sentence)&&
    !/(?:달|월지|월의\s*자리|태어난\s*달)/.test(sentence);
   const explicit=/(?:태어난\s*날|날의\s*자리|일지).{0,30}(?:태어난\s*시간|시간의\s*자리|시지).{0,30}서로\s*충/.test(sentence)||
    /(?:태어난\s*시간|시간의\s*자리|시지).{0,30}(?:태어난\s*날|날의\s*자리|일지).{0,30}서로\s*충/.test(sentence);
   return implicit||explicit;
  }));
  if(packet?.status==='ready'&&falseDayHourClaim)
   blockingErrors.push('saju_core:invented-day-hour-clash-from-separate-month-pairs');
  // The transition month is a calendar classification, not a measured
  // personality, life-event change or adaptability trait.
  if(fields.some(s=>/계절의\s*성격.{0,65}변화의\s*흐름/.test(s)||
    /전환월.{0,60}(?:일상의\s*변화에\s*잘\s*적응|변화에\s*유연하게\s*대응)/.test(s)))
   blockingErrors.push('saju_core:unmeasured-seasonal-adaptability');
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
