'use strict';
// Reject categorical traditional branch interactions the calculation engine
// does not resolve. Does not claim to judge all schools or free-form prose.
const assertedTransformation=/(?:합화|합국).{0,24}(?:확정|성립|완성|이루어|발생|변하|됩니다|되었)/;
const assertedWinner=/(?:충|육합|삼합|방합|형|파|해).{0,28}(?:우선(?:합니다|한다|적용)|무효화|깨뜨립|깨버립|상쇄|반드시\s*이김|이깁|더\s*강(?:하|합|해)|자동으로\s*해소)/;
const qualified=/(?:단정할\s*수\s*없|판단할\s*수\s*없|알\s*수\s*없|확정할\s*수\s*없|성립하지\s*않|이루어지지\s*않|무효화되지\s*않|해소되지\s*않|결정할\s*수\s*없|확인할\s*수\s*없|미확정|미판정|판정하지\s*않|증명되지\s*않|는\s*것은\s*(?:아니|아닙|아닌)|여부|조건을\s*따져)/;
const position={연지:'year',월지:'month',일지:'day',시지:'hour'};
const plainPosition={해:'year',달:'month',날:'day',시간:'hour'};
const plainClash=/(?:태어난|출생한)\s*(해|달|날|시간)\s*(?:과|와)\s*(?:(?:태어난|출생한)\s*)?(해|달|날|시간)(?:\s*의)?\s*(?:(?:아랫글자|아래\s*글자|지지)(?:끼리|가|는|이|은)?\s*)?(?:사이(?:에|에는)?\s*)?(?:서로\s*)?(맞섬|맞서는\s*관계)/g;
function sentences(value){
 return String(value||'').split(/[.!?。！？\n]+/).map(x=>x.trim()).filter(Boolean);
}
function check(report,packet){
 const errors=[],actual=packet?.facts?.targetYearBranchRelations?.pairs||null;
 const natal=packet?.facts?.natalBranchRelations?.pairs;
 const sections=[...(report?.sections||[])];
 if(report?.cover)sections.push({id:'cover',title:report.cover.headline,body:[report.cover.description,
  ...(report.cover.highlights||[]).flatMap(x=>[x.title,x.description])]});
 if(report?.finalJudgment)sections.push({id:'finalJudgment',title:report.finalJudgment.headline,
  body:[...(report.finalJudgment.body||[]),...(report.finalJudgment.strengths||[]),
   ...(report.finalJudgment.watchouts||[]),report.finalJudgment.closingQuestion]});
 for(const section of sections){
  const fields=[section.title,section.keyJudgment,...(section.body||[]),...(section.evidence||[])];
  for(const sentence of fields.flatMap(sentences)){
   if(!qualified.test(sentence)&&(assertedTransformation.test(sentence)||assertedWinner.test(sentence)))
    errors.push(section.id+': unsupported settled branch transformation or precedence');
   // Check these explicit position pairs even when another clause limits
   // the strength inference. A limitation does not make the pair real.
   if(Array.isArray(natal)&&!/(?:2027년|세운|연운)/.test(sentence)){
    for(const match of sentence.matchAll(plainClash)){
     const tail=sentence.slice(match.index+match[0].length);
     if(/^\s*(?:가|이|는|은)?\s*(?:없|아닙|아니다|성립하지\s*않)/.test(tail))continue;
     const left=plainPosition[match[1]],right=plainPosition[match[2]];
     if(left===right||!natal.some(row=>row.type==='충'&&
       row.positions?.includes(left)&&row.positions?.includes(right)))
      errors.push(section.id+': invented natal clash between '+left+' and '+right);
    }
   }
   // Only check a precise year-to-position claim if the source position is
   // explicit. Text outside the calculated scope is not licensed by analogy.
   if(!actual||(!/^year_2027/.test(section.id)&&section.id!=='cover'&&section.id!=='finalJudgment'))continue;
   const plainAnnual=/(?:2027년|세운|연운)(?:의)?\s*(?:아랫글자|아래\s*글자|지지)\s*(?:와|과|는|은|가|이)?\s*(?:태어난|출생한)\s*(해|달|날|시간)의\s*(?:아랫글자|아래\s*글자|지지)\s*(?:와|과|가|는|에)?\s*(?:사이(?:에|에는)?\s*)?(?:서로\s*)?(충|육합|형|파|해)\s*관계/g;
   for(const match of sentence.matchAll(plainAnnual)){
    const tail=sentence.slice(match.index+match[0].length);
    if(/^\s*(?:가|이|는|은)?\s*(?:없|아닙|아니다|성립하지\s*않)/.test(tail))continue;
    const actualPosition=plainPosition[match[1]];
    if(!actual.some(row=>row.between===actualPosition&&row.type===match[2]))
     errors.push(section.id+': invented annual '+match[2]+' relation with '+actualPosition);
   }
   const relationship=/(?:2027년|세운|연운).{0,35}?(연지|월지|일지|시지).{0,19}?(충|육합|형|파|해)\s*(?:관계|입니다|이라고|이다|이|을|를|가|는|은)?/g;
   for(const match of sentence.matchAll(relationship)){
    if(qualified.test(sentence)||/(?:없|아니|성립하지\s*않)/.test(sentence.slice(match.index+match[0].length,match.index+match[0].length+15)))continue;
    if(!actual.some(row=>row.between===position[match[1]]&&row.type===match[2]))
     errors.push(section.id+': invented annual '+match[2]+' relation with '+position[match[1]]);
   }
  }
 }
 return [...new Set(errors)];
}
module.exports={check};
