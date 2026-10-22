'use strict';
// QA-only high-precision check: positions and same-element roots are
// observational facts, NOT evidence of observable personality, skills,
// wealth, or future outcomes. This is a small safety tripwire, not a
// substitute for expert traditional interpretation or human editing.
const rootSource=/(?:뿌리|숨은\s*글자|같은\s*오행|글자(?:가|의|를)?\s*연결|연결된\s*글자|일치한\s*글자|같은\s*글자)/;
const causal=/(?:때문에|덕분에|따라서|그러므로|그러니|이므로|많아서|없으니|많으니|있으니|이어서|바탕으로)/;
// A verified matching/exposed stem does not establish priority or effective
// influence between interpretations. This is an invalid leap even if no
// wealth, personality or future prediction is stated explicitly.
const unsupportedPriority=/(?:더\s*(?:중요|우세|유리|불리|강하게\s*작용|크게\s*작용)|(?:우위|우세)\s*(?:하|이|에|를|가)|작용력\s*(?:이|은|도)?\s*(?:더\s*)?(?:강|높|크)|(?:해석|의미|뜻)(?:의)?\s*무게(?:가|는|도)?\s*(?:더\s*)?(?:크|무겁|다르)|(?:먼저|우선)\s*(?:작용|드러나|적용))/;
const outcome=/(?:성격(?:이|은|도|을)?|능력(?:이|은|을)?|실행력|성공|수입|재물|돈을|승진|합격|결혼|이혼|인생|더\s*(?:강|약)|기운이\s*(?:강|약)|부자가|부유해)/;
const disclaim=/(?:단정(?:할\s*수\s*없|하지\s*않|할\s*근거(?:가)?\s*없)|보장(?:하지\s*않|할\s*수\s*없)|의미(?:하지\s*않|하는\s*것은\s*아니)|알\s*수\s*없|판단(?:할\s*수\s*없|하지\s*않)|증명(?:하지\s*않|되지\s*않)|근거(?:가)?\s*아니|말할\s*수\s*없|예측(?:할\s*수\s*없|하지\s*않)|무리(?:입니다|다)|사실이\s*아니)/;
function inspect(text){
 const issues=[];
 const sentences=String(text||'').split(/[.!?。！？\n]+/).map(s=>s.trim()).filter(Boolean);
 for(const sentence of sentences){
  if(!rootSource.test(sentence)||!causal.test(sentence)||
    (!outcome.test(sentence)&&!unsupportedPriority.test(sentence)))continue;
  // An explicit denial of inference is allowed, but a positive assertion
  // followed by a disclaimer in the same sentence must not be laundered.
  // The positive portion before the denial is checked independently.
  const denial=sentence.search(disclaim);
  const asserted=denial>=0?sentence.slice(0,denial):sentence;
  if(rootSource.test(asserted)&&causal.test(asserted)&&outcome.test(asserted))
   issues.push('QA_DEPTH_ROOT_TO_PERSONAL_OUTCOME');
  // Root counts and matching positions cannot rank competing traditional
  // meanings, even when the prose avoids a direct personal-life prediction.
  if(rootSource.test(asserted)&&causal.test(asserted)&&
     unsupportedPriority.test(asserted))
   issues.push('QA_DEPTH_ROOT_TO_UNVERIFIED_PRIORITY');
 }
 return [...new Set(issues)];
}
module.exports={inspect};
