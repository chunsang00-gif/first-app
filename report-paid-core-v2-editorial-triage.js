'use strict';
// No generated chart interpretation, no provider request and no sale approval.
// Flags reader-value problems that mechanical citation/JSON checks alone miss.
// Scoring or machine passes do NOT replace traditional-method expert review.
const reader=require('./report-paid-core-depth-v2-reader-review');
const {overlap}=require('./report-core-paid-natal-depth-response-gate');
const split=text=>String(text||'').split(/[.!?。！？\n]+/)
 .map(s=>s.trim()).filter(Boolean);
function inspect(paragraph,monthText,extra){
 if(!paragraph)return {kind:'first-chapter-editorial-triage-v1',
  findings:['missing-paid-depth'],canSell:false,manualReview:'required'};
 const text=String(paragraph.text||''),sentences=split(text);
 const readerCodes=reader.inspect(paragraph,monthText,extra);
 const findings=[...new Set(readerCodes)];
 const add=code=>{if(!findings.includes(code))findings.push(code)};
 const contrast=extra?.readerClassicalScope||extra?.readerContrast||
  extra?.readerAlternative;
 // A reader must understand what the EXTRA birth position adds to the
 // baseline, not just see a glossary or a list of allowed citation IDs.
 const location=contrast?.visiblePosition==='natal.hour.stem'?
  /(?:태어난\s*시간|출생\s*시간|시간의\s*겉글자|시간\s*자리)/:
  contrast?.visiblePosition==='natal.year.stem'?
   /(?:태어난\s*해|태어난\s*연도)/:null;
 const specific=location&&sentences.some(x=>
  location.test(x)&&/(?:태어난\s*달|출생월|달의|달\s*안쪽|달\s*속에)/.test(x)&&
  /(?:정확히\s*(?:일치|같|대응)|숨은\s*글자|속글자)/.test(x));
 if(!specific)add('new-birth-position-not-explained-together-with-month');
 const scene=/(?:예를\s*들어|상황을\s*가정|상황을\s*생각|선택을\s*생각)/.test(text);
 if(!scene)add('no-concrete-hypothetical-scene');
 // Materially distinct counter-conditions, not a generic "both matter".
 const failures=sentences.filter(s=>
  /(?:없다면|없으면|않으면|빠지면|부족하면|모자라면|계속\s*못|놓치면)/.test(s));
 const opposing=/(?:반대로|반면|한편|다른\s*경우)/.test(text);
 if(failures.length<2||!opposing)add('missing-two-sided-conditional-downside');
 const near=Number(overlap(text,String(monthText||'')).toFixed(3));
 if(near>0.55)add('depth-duplicates-month-core');
 const disclaimers=sentences.filter(s=>
  /(?:단정(?:할|하지|할\s*수\s*없)|확정(?:할|하지)|입증|실제\s*성격|관찰한\s*결과|실제\s*삶)/.test(s)).length;
 if(disclaimers>=3)add('repeated-disclaimers-replace-reader-value');
 const abstractAdvice=(text.match(
  /(?:확인해야|정리해야|준비해야|점검해야|살펴볼\s*필요|기준을\s*세워야)/g)||[]).length;
 if(abstractAdvice>=3)add('checklist-advice-replaces-reading');
 return {
  kind:'first-chapter-editorial-triage-v1',
  observed:{paragraphCharacters:text.length,conditionalDownsideSentences:failures.length,
   hasScene:scene,hasOpposingCondition:opposing,
   exactNewPositionConnectedToMonth:!!specific,
   overlapWithPaidCore:near,disclaimerSentences:disclaimers,
   abstractAdvicePhraseCount:abstractAdvice},
  findings,mechanicalTriageClear:findings.length===0,
  independentMethodReviewed:false,
  humanReaderValueVerified:false,
  releaseVerdict:'not-approved',canSell:false,
  manualReview:'traditional-interpretation-and-paid-reader-value-required'
 };
}
module.exports={inspect};
