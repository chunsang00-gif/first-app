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
    extra.allPairingsAreCandidatesOnly!==true)
  return ['PAID_CORE_V2_READER_UNTRUSTED_EXTRA'];
 const text=String(p.text||''),label=String(p.label||'');
 if(text.length<220||!label.trim())errors.push('PAID_CORE_V2_READER_TRIVIAL');
 if(policy.errors([label,text]).length||
    /[\u3400-\u4dbf\u4e00-\u9fff]/.test(label+text))
  errors.push('PAID_CORE_V2_READER_FORBIDDEN_JARGON');
 if(!/(?:태어난\s*해|태어난\s*연도)/.test(text)||
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
 const dayHour=extra.visiblePairCandidates?.some(x=>
  x.tableMatchOnly===true&&
  x.adjacent===true&&
  ((x.from==='natal.day.stem'&&x.to==='natal.hour.stem')||
   (x.to==='natal.day.stem'&&x.from==='natal.hour.stem')));
 if(dayHour&&!/(?:태어난\s*날|태어난\s*날짜).{0,42}(?:시간|출생\s*시간).{0,80}(?:짝|함께\s*묶)/.test(text))
  errors.push('PAID_CORE_V2_READER_OMITS_VERIFIED_DAY_HOUR_PAIR');
 // A source may describe only an observed symbol or table pairing.
 // A matching word in a response is NOT proof of a correct reading.
 return errors;
}
module.exports={inspect};