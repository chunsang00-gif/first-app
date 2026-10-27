'use strict';
// Offline preview response guard on the REAL paid writer's optional first
// chapter slot. Detects unsupported/generic outputs; passing is NOT a
// professional editorial approval or proof of accurate personal insight.
const policy=require('./report-reader-policy');
const {overlap}=require('./report-core-paid-natal-depth-response-gate');
function inspect(p,monthText,extra){
 const errors=[];
 if(p==null)return errors; // existing paid paragraph remains optional
 if(!extra||extra.kind!=='first-chapter-optional-full-chart-source-v1'||
    extra.selectedTraditionalPriority!==false||
    extra.approvedAsPremiumValue!==false||
    extra.allPairingsAreCandidatesOnly!==true||
    !Array.isArray(extra.visiblePairCandidates)||
    !Array.isArray(extra.visibleElementDirections))
  return ['PAID_CORE_V2_READER_UNTRUSTED_EXTRA'];
 const text=String(p.text||''),label=String(p.label||'');
 if(text.length<220||!label.trim())errors.push('PAID_CORE_V2_READER_TRIVIAL');
 if(policy.errors([label,text]).length||
    /[\u3400-\u4dbf\u4e00-\u9fff]/.test(label+text))
  errors.push('PAID_CORE_V2_READER_FORBIDDEN_JARGON');
 // A sourced, additional month-hidden/visible position contrast does
 // not justify forcing a recital of all four pillars into reader prose.
 // Only the genuinely new position is required in that case. Preserve
 // the original strict check when no exact contrast is available.
 const c=extra.readerContrast||extra.readerAlternative;
 const alternative=!extra.readerContrast&&!!extra.readerAlternative;
 // For a chart with neither verified independent source, even a fluent
 // optional paragraph is unsupported. Never sell filler as "deep reading".
 if(!c)errors.push('PAID_CORE_V2_READER_HAS_NO_INDEPENDENT_SOURCE');
 if(c){
  if(!Array.isArray(c.sourceRefs)||!Array.isArray(p.basis?.refs)||
     !c.sourceRefs.every(x=>p.basis.refs.includes(x)))
   errors.push('PAID_CORE_V2_READER_MISSING_EXACT_CONTRAST_BASIS');
  const location=c.visiblePosition==='natal.hour.stem'?/(?:태어난\s*시간|출생\s*시간)/:
   c.visiblePosition==='natal.year.stem'?/(?:태어난\s*해|태어난\s*연도)/:null;
  if(!location||!location.test(text)||!/태어난\s*달|출생월/.test(text))
   errors.push('PAID_CORE_V2_READER_MISSING_ACTUAL_EXPOSED_POSITION');
  if(alternative){
   if(c.linkageKind!=='different-visible-role-not-exact-month-hidden-exposure'||
      !/(?:달의\s*대표|달의\s*숨은|대표\s*속글자)/.test(text)||
      !/(?:서로\s*다른\s*분류|별도\s*분류|별개의\s*분류)/.test(text)||
      /달의\s*다른\s*속글자와\s*정확히\s*일치/.test(text)||
      /(?:태어난\s*(?:해|시간)|출생\s*시간).{0,45}(?:달의\s*(?:다른\s*)?(?:속글자|숨은\s*글자)|달\s*속글자).{0,45}(?:정확히\s*일치|정확히\s*같|같습니다|드러납니다)/.test(text)||
      /달의\s*(?:다른\s*)?(?:속글자|숨은\s*글자).{0,45}(?:태어난\s*(?:해|시간)|출생\s*시간).{0,40}(?:정확히\s*일치|정확히\s*같|같습니다)/.test(text))
    errors.push('PAID_CORE_V2_READER_FALSE_VISIBLE_EXPOSURE');
  }else if(!/(?:달의\s*대표|달\s*속글자|달에\s*있는\s*다른|달\s*안쪽|달\s*속에\s*숨은)/.test(text)||
     !/(?:정확히\s*일치|정확히\s*대응|정확히\s*같|겉으로\s*드러)/.test(text))
   errors.push('PAID_CORE_V2_READER_MISSING_EXACT_EXPOSURE_EXPLANATION');
 }else if(!/(?:태어난\s*해|태어난\s*연도)/.test(text)||
    !/(?:태어난\s*날|태어난\s*날짜)/.test(text)||
    !/(?:태어난\s*시간|출생\s*시간)/.test(text))
  errors.push('PAID_CORE_V2_READER_LACKS_INDEPENDENT_POSITIONS');
 if(!/(?:그러나|하지만|다만|반대로|반면|그렇다고)/.test(text)||
    !/(?:경우|상황|예를\s*들어|가정)/.test(text))
  errors.push('PAID_CORE_V2_READER_NO_CONTRAST_OR_CONDITION');
 if(/(?:반드시|무조건|운명입니다|절대\s*실패하지|부자가\s*됩니다|승진합니다)/.test(text))
  errors.push('PAID_CORE_V2_READER_PERSONAL_CERTAINTY');
 if(String(monthText||'').trim()&&
    overlap(text,monthText)>0.55)
  errors.push('PAID_CORE_V2_READER_REPEATS_MONTH');
 // A combination table lists POSSIBLE pairs, never a realized change.
 // Merely having a pair must not force the AI to invent a personality
 // judgement. But a reader assertion of a specific pair MUST be true
 // for this chart, including after a birth-hour change.
 const pairClaim=/(?:태어난\s*날|태어난\s*날짜|출생\s*날).{0,45}(?:시간|출생\s*시간).{0,125}(?:짝을\s*이루|한\s*쌍|함께\s*묶)/.test(text);
 const dayHour=extra.visiblePairCandidates.some(x=>
  x.tableMatchOnly===true&&x.adjacent===true&&
  ((x.from==='natal.day.stem'&&x.to==='natal.hour.stem')||
   (x.to==='natal.day.stem'&&x.from==='natal.hour.stem')));
 if(pairClaim&&!dayHour)
  errors.push('PAID_CORE_V2_READER_FALSE_DAY_HOUR_PAIR');
 const claimedMonthHourExposure=/(?:태어난\s*시간|출생\s*시간).{0,35}(?:달\s*안쪽|태어난\s*달의\s*안쪽).{0,45}(?:정확히\s*같|똑같)/.test(text);
 if(claimedMonthHourExposure&&!extra.exposures?.some(x=>
   x.visibleRef==='natal.hour.stem'&&x.exactMatchOnly===true))
  errors.push('PAID_CORE_V2_READER_FALSE_MONTH_HOUR_EXPOSURE');
 const arrows=extra.visibleElementDirections;
 const relation=(from,to)=>arrows.find(x=>x.from===from&&x.to===to&&
  x.literalElementRelationOnly===true&&x.realizedEffectVerified===false)?.direction;
 if(/태어난\s*해의\s*글자는.{0,60}(?:시간의|출생\s*시간의).{0,60}돕는\s*방향/.test(text)&&
    relation('natal.year.stem','natal.hour.stem')!=='left-generates-right')
  errors.push('PAID_CORE_V2_READER_FALSE_YEAR_HOUR_SUPPORT');
 if(/태어난\s*날의\s*기준\s*글자는.{0,60}(?:시간의|출생\s*시간의).{0,60}제약하는\s*방향/.test(text)&&
    relation('natal.day.stem','natal.hour.stem')!=='left-controls-right')
  errors.push('PAID_CORE_V2_READER_FALSE_DAY_HOUR_CONTROL');
 // A source may describe only an observed symbol or table pairing.
 // A matching word in a response is NOT proof of a correct reading.
 return errors;
}
module.exports={inspect};