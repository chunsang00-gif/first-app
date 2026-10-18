'use strict';
// Rejection-only heuristic for generic paid prose, never a release certificate.
// Inspect only customer-facing interpretations, not internal symbolic evidence.
// Only the VERIFIED month ten-god pair owns the mandatory paid-core reading.
// These are permissive *meaning families* (not word-for-word model templates);
// absence of a whole calculated meaning is a source-to-prose omission, not an
// aesthetic score or evidence of the user's observed personality.
const coreMonthMeaningWords={
 비견:/(?:스스로|자기\s*몫|자신의\s*몫|독립|주도|직접\s*맡|내\s*역할)/,
 겁재:/(?:공동|함께\s*쓰|나누|배분|경쟁|협력|몫을\s*구분|자원.*분담)/,
 식신:/(?:결과물|만들|완성|생산|표현|작업을\s*이어|꾸준히\s*해)/,
 상관:/(?:다른\s*방법|새로운\s*제안|익숙한\s*방식|틀을\s*바꾸|표현|변형)/,
 정재:/(?:꾸준히\s*관리|지출|반복되는\s*비용|예산|안정적\s*관리|계획적\s*사용|유지할\s*비용)/,
 편재:/(?:필요한\s*자원|자원을\s*(?:찾|활용|확보)|자금|돈과\s*재료|재료를\s*마련|여러\s*곳에서|기회와\s*자원|자원\s*활용)/,
 정관:/(?:규칙|규정|역할|책임|원칙|절차|맡은\s*자리)/,
 편관:/(?:급한\s*요구|갑작스러운\s*요구|압박|긴급|책임\s*범위|예상\s*밖의\s*요구)/,
 정인:/(?:배움|배우|조언|도움|지원|보호|가르침|배운\s*내용)/,
 편인:/(?:낯선\s*(?:내용|정보|자료)|정보를\s*(?:이해|해석)|자료를\s*해석|배움의\s*방식|자기\s*방식으로\s*(?:이해|읽)|다른\s*관점에서\s*이해|정보\s*이해)/
};
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
  // Two REAL paid first-chapter outputs reached the successful automation
  // gate with long, two-sentence 'key judgments' explaining the symbols
  // rather than giving readers a single understandable interpretation.
  // Keep the actual reason/evidence in the body and private citation ledger.
  // A schema-correct answer can still contain a generic story unrelated to
  // either computed month meaning. Check the actual mandatory 'strength'
  // paragraph, never the title, canned thesis, citations or optional season.
  // A lexical family is necessarily incomplete: human editorial approval
  // remains required even when both lenses are present.
  const strengthIndex=Array.isArray(section.bodyTopics)?
   section.bodyTopics.indexOf('strength'):-1;
  if(packet?.status==='ready'&&strengthIndex>=0&&Array.isArray(section.body)){
   const mainText=String(section.body[strengthIndex]||'');
   const verified=require('./report-chart-contrast').build(packet)?.monthTenGodContext;
   const kinds=[verified?.monthStem?.tenGod,verified?.monthMainHidden?.tenGod];
   if(kinds.some(k=>!coreMonthMeaningWords[k]))
    blockingErrors.push('saju_core:month-pair-meaning-source-unavailable');
   else if([...new Set(kinds)].some(k=>!coreMonthMeaningWords[k].test(mainText)))
    blockingErrors.push('saju_core:month-pair-meaning-missing-from-main-paragraph');
   // Literal category words alone do not prove agreement with the locked
   // thesis. Catch only categorical negations of the same verified reading.
   // A hypothetical warning or denial of observed real-life behavior is OK.
   const categoricalDenial=/(?:하지\s*않|하지\s*못|거부하).{0,15}(?:기질|성향|태도)/;
   const notARealLifeClaim=/(?:뜻(?:은|이)?\s*아니|의미하지\s*않|단정할\s*수\s*없|단정하지\s*않|증명하지\s*않|실제\s*성격을\s*확정)/;
   const statementParts=mainText.split(/[.!?。！？\n]+/).map(x=>x.trim()).filter(Boolean);
   const explicitReversal=statementParts.some(sentence=>{
    if(notARealLifeClaim.test(sentence))return false;
    return [...new Set(kinds)].some(kind=>{
     const match=coreMonthMeaningWords[kind]?.exec(sentence);
     if(!match)return false;
     return categoricalDenial.test(sentence.slice(match.index+match[0].length,
      match.index+match[0].length+48));
    });
   });
   if(explicitReversal)
    blockingErrors.push('saju_core:main-paragraph-explicitly-reverses-locked-judgment');
   // A chart with the SAME verified ten-god in two month positions does
   // not encode two opposing personalities or a doubled trait. The source
   // and the claim must appear in the same sentence; this deliberately
   // avoids broad word bans and doesn't apply to different ten-god pairs.
   if(verified?.sameClassification){
    const sourcePair=/(?:두\s*(?:출생\s*)?(?:위치|출처|글자|자리)|같은\s*(?:십성|전통\s*분류|분류|뜻)|(?:월간|겉글자).{0,45}(?:월지|숨은\s*글자))/;
    const inventedOpposition=/(?:서로\s*(?:반대|상반|충돌|다른\s*(?:성격|기질|성향))|(?:반대|상반)되는?\s*(?:성격|기질|성향)|두\s*가지\s*(?:상반된|반대되는)\s*(?:성격|기질|성향))/;
    const inventedAmplification=/(?:두\s*배|2\s*배).{0,25}(?:강하|강해|강한|커지|증폭|뚜렷|높아)|(?:성격|기질|성향|능력|힘).{0,20}(?:두\s*배|2\s*배)/;
    const denial=/(?:아니(?:다|라는|라고|라|므로|며|고|란)|아닙니다|아닌|않(?:는다|습니다|는|다고|으므로)|없(?:다|습니다|는|으며)|못한다|금지|단정할\s*수\s*없|확정할\s*수\s*없|지어내지|만들지\s*않)/;
    if(statementParts.some(s=>sourcePair.test(s)&&
       (inventedOpposition.test(s)||inventedAmplification.test(s))&&!denial.test(s)))
     blockingErrors.push('saju_core:invented-opposition-or-amplification-from-identical-month-classification');
   }
   // A copied, locked key judgment is not an independently reasoned body.
   // Check the remainder after removing exact repetitions of that sentence.
   const summary=String(section.keyJudgment||'').trim();
   if(summary.length>=25&&mainText.includes(summary)){
    const remainder=mainText.split(summary).join(' ').trim();
    const separateMeanings=[...new Set(kinds)].every(k=>
     coreMonthMeaningWords[k]&&coreMonthMeaningWords[k].test(remainder));
    const independentLength=remainder.replace(/[\s\p{P}\p{S}]/gu,'').length;
    if(independentLength<65||!separateMeanings)
     blockingErrors.push('saju_core:main-paragraph-merely-repeats-locked-judgment');
   }
  }
  // The optional seasonal paragraph owns external-support CONDITIONS,
  // not the person's way of processing information. Past paid drafts
  // repeated this learning conclusion despite correct prompt ownership.
  // Trigger only for the chart-derived overlap (visible resource AND
  // month-stem 正/偏印), and only for self-processing phrases. Receiving
  // outside help, advice or information remains permitted.
  if(packet?.status==='ready'&&Array.isArray(section.bodyTopics)&&
     Array.isArray(section.body)){
   const firstIndex=section.bodyTopics.indexOf('temperament');
   if(firstIndex>=0){
    const contrast=require('./report-chart-contrast').build(packet);
    const observed=contrast?.contrastPoints?.find(p=>
     p.kind==='visible-support-vs-counter')?.evidence;
    const resourceVisible=[...(observed?.support||[]),...(observed?.counter||[])]
     .some(row=>row.relation==='resource');
    const monthGod=contrast?.monthTenGodContext?.monthStem?.tenGod;
    if(resourceVisible&&['편인','정인'].includes(monthGod)){
     const firstText=String(section.body[firstIndex]||'');
     const ownLearning=/(?:정보|자료|낯선\s*내용|새로운\s*내용).{0,42}(?:자기|자신|스스로).{0,25}(?:방식|해석|이해|정리|받아들이)|(?:자기|자신|스스로).{0,24}(?:방식|관점).{0,24}(?:정보|자료|낯선\s*내용|새로운\s*내용)/;
     if(ownLearning.test(firstText))
      blockingErrors.push('saju_core:season-paragraph-repeats-month-learning');
    }
   }
  }
  const judgment=String(section.keyJudgment||'').trim();
  const judgmentSentences=judgment.split(/(?<=[.!?。！？])\s+|\n+/)
   .map(x=>x.trim()).filter(Boolean);
  if(judgmentSentences.length>1)
   blockingErrors.push('saju_core:key-judgment-not-one-sentence');
  // This is NOT a word ban. Fail only a self-contained definition of
  // a calculated SYMBOL, with no customer-facing inference in the sentence.
  // Naming 'calculation' in a meaningful interpretation remains permitted.
  if(/(?:출생\s*위치|계산된\s*(?:근거|글자|관계)|달\s*아래\s*숨은\s*글자|겉에\s*드러난\s*글자)/.test(judgment)&&
     /(?:상징으로\s*구별|상징으로\s*분류|근거일\s*뿐|분류되는\s*근거)/.test(judgment))
   blockingErrors.push('saju_core:key-judgment-is-symbol-lecture');
  // Paid QA 38902253029: each paragraph was mostly a glossary of
  // "symbols / traditional meanings / starting point", with no worked
  // choice the reader could understand. This scoped check looks for a
  // COMBINATION of repeated chart-definition sentences AND missing
  // application, not for banned words or a compulsory paragraph length.
  // A short factual introduction before an actual example is welcome.
  const sentencePieces=value=>String(value||'').split(/(?<=[.!?。！？])\s*|\n+/)
   .map(x=>x.trim()).filter(Boolean);
  const chartDefinition=/(?:사주|글자|출생월|태어난\s*달|계절|전통|위치|기운|월의)/;
  const describesSymbol=/(?:상징|분류|풀이|해석|의미|가리키|근거|관계|방향|특징|뜻|기초)/;
  const sceneContext=/(?:예를\s*들|가령|만약|가정|경우|상황에서|때에는|할\s*때|한다면|된다면|준비한다면)/;
  const concreteChoice=/(?:새로운\s*일|업무|작업|자료|정보|배우|준비|돈|비용|재료|자원|선택|결정|협업|동료|의견|역할|계획|문제|지출|맡은\s*일|과제)/;
  const application=sentences=>sentences.some(x=>
   sceneContext.test(x)&&concreteChoice.test(x));
  if(/(?:기본\s*(?:기질|성향)을\s*바라보는|전통적\s*(?:기준|분류|근거)|출생\s*사주\s*구조)/.test(String(section.title||'')))
   blockingErrors.push('saju_core:editorial-title-instead-of-interpretation');
  for(const body of section.body||[]){
   const parts=sentencePieces(body).filter(x=>x.length>=15);
   if(parts.length<3)continue;
   const definitionCount=parts.filter(x=>chartDefinition.test(x)&&describesSymbol.test(x)).length;
   if(definitionCount>=3&&definitionCount/parts.length>=0.6&&!application(parts)){
    blockingErrors.push('saju_core:symbol-definitions-without-applied-interpretation');
    break;
   }
  }
  // A model can cite both month categories while only giving their
  // dictionary meanings. This is NOT an applied, condition-specific
  // interpretation. Reject only an unmistakably definition-only main
  // paragraph; two genuine explanations plus an applied scenario stay valid.
  if(strengthIndex>=0&&Array.isArray(section.body)){
   const mainSentences=sentencePieces(section.body[strengthIndex]).filter(x=>x.length>=12);
   const monthPosition=/(?:월간|월지|본기|겉글자|숨은\s*글자|태어난\s*달)/;
   const dictionaryMeaning=/(?:뜻|의미|상징|분류|가리키|나타내|풀이|해석)/;
   const bareDefinitions=mainSentences.filter(x=>
    monthPosition.test(x)&&dictionaryMeaning.test(x)).length;
   if(mainSentences.length>=2&&bareDefinitions>=2&&
      bareDefinitions/mainSentences.length>=0.5&&!application(mainSentences))
    blockingErrors.push('saju_core:month-pair-dictionary-only-without-application');
   // A stock "for example" sentence with generic advice is not the
   // source-specific applied interpretation requested by the paid reader.
   // This HIGH-CONFIDENCE guard requires two glossary definitions AND
   // a generic recommendation as every purported application. It does
   // not require a prescribed length, wording or artificial tradeoff.
   const applied=mainSentences.filter(x=>sceneContext.test(x)&&concreteChoice.test(x));
   const genericActionAdvice=/(?:확인|검토|점검|준비|정리|살펴|따져).{0,38}(?:좋(?:습니다|겠)|필요(?:합니다|하겠)|중요(?:합니다|하겠)|권합니다|해야\s*합니다)/;
   const tiedInterpretiveDifference=/(?:유리|불리|놓치|위험|반면|반대로|그러나|한쪽|동시에|두\s*(?:뜻|의미|관점)|함께\s*(?:고려|살피|읽)|과\s*달리)/;
   if(bareDefinitions>=2&&applied.length>0&&
      applied.every(x=>genericActionAdvice.test(x)&&!tiedInterpretiveDifference.test(x)))
    blockingErrors.push('saju_core:dictionary-plus-generic-advice-masquerading-as-reading');
  }
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
  // Historical paid prose sometimes explained the next paragraph instead of
  // the reader's Saju interpretation. Read only public fields, never evidence.
  const leakedOutline=/(?:다음|앞|이전|첫째|둘째|첫|두\s*번째)\s*(?:문단|항목|소제목|장)\s*(?:에서(?:는)?|에선|에|의)|이\s*문단(?:에서(?:는)?|은)/;
  if(fields.some(x=>leakedOutline.test(x)))
   blockingErrors.push('saju_core:editorial-outline-leaked-to-reader');
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
  // A transitional Earth-storage month (e.g. 丑 / late winter) does NOT
  // certify a Gregorian/Lunar New Year transition, the end of winter on
  // that birth date, or the beginning of spring. This precise failure was
  // present in the ACTUAL 2026-10-17 third paid QA output.
  const seasonal=packet?.facts?.seasonalEvidence;
  if(seasonal?.monthSeason==='winter'&&seasonal.monthPhase==='transition'&&
    fields.some(s=>/(?:겨울.{0,18}끝나.{0,35}(?:새해|전환|넘어)|새해.{0,20}넘어가.{0,30}전환기)/.test(String(s))))
   blockingErrors.push('saju_core:winter-transition-misrepresented-as-new-year');
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
  // Do not spend multiple separate core paragraphs on the same generic
  // "unobserved personality" disclaimer. A distinct source-specific limit
  // (e.g., calculated season does not measure adaptability) is still valid.
  const genericObservedLimit=/(?:실제\s*(?:성격|행동|습관|성향|경험|능력)|실제로\s*(?:어떻게\s*)?행동|개인의\s*(?:성격|행동|경험))/;
  const limitationAct=/(?:단정할\s*수\s*없|단정하지\s*않|확정할\s*수\s*없|확정하지\s*않|알\s*수\s*없|입증(?:할\s*수\s*없|하지\s*않)|측정(?:할\s*수\s*없|하지\s*않)|증명(?:할\s*수\s*없|하지\s*않))/;
  const genericLimitParagraphs=(section.body||[]).filter(p=>
   String(p).split(/[.!?。！？\n]+/).some(sentence=>
    genericObservedLimit.test(sentence)&&limitationAct.test(sentence))).length;
  if(genericLimitParagraphs>=2)
   blockingErrors.push('saju_core:repeated-generic-observation-disclaimer');
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
