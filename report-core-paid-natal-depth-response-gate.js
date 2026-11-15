'use strict';
// QA-only semantic/provenance guard for an optional natal-depth response.
// All conclusions remain human-review candidates. This is deliberately not
// enabled in normal paid responses.
const generation=require('./report-generation-request');
const reader=require('./report-reader-policy');
const MIN=['natal.year.stem','natal.day.stem','natal.hour.stem','facts.stemConnections'];
const READER_CLAIMS=/(?:타고난|반드시|틀림없이|무조건|항상|분명히\s*(?:성공|좋)|성격(?:이|은)\s*(?:강|약)|능력(?:이|은)\s*(?:뛰어|우수|높)|승진(?:할|합니다|한다)|합격(?:할|합니다|한다)|이별(?:할|합니다|한다)|결혼(?:할|합니다|한다)|돈을\s*많이\s*(?:벌|모으)|당신은\s*원래)/;
const CONDITIONAL=/(?:경우|상황|조건(?:에서|이라면|에|일\s*때)|때(?:에는|라면|\s)|예를\s*들어|가정)/;
const COMPARISON=/(?:다르|구별|반면|한편|비교|따로|연결|반대로|반면에|그에\s*비해|하지만)/;
// Generic "시간" can mean elapsed time, not a birth pillar. Likewise
// 연간/일간 must never be classified as the hour pillar.
const POSITION_RULES={
 year:/(?:태어난\s*해|해에서|해의|연간)/,
 day:/(?:태어난\s*날|날에는|날의|일간)/,
 hour:/(?:태어난\s*시간|시간에는|시간에서|시간의|시간\s*겉글자)/
};
function referencedPositions(text){
 return Object.entries(POSITION_RULES)
  .filter(([,pattern])=>pattern.test(String(text||'')))
  .map(([position])=>position);
}
const VOID_OUTPUT=/(?:알\s*수\s*없습니다|확인할\s*수\s*없습니다|판단할\s*수\s*없습니다|평가가\s*아니|판정하지\s*않|뜻이\s*아니|증거가\s*아니)/;
const simple=s=>String(s||'').replace(/\s+/g,' ').trim();
function overlap(a,b){
 const clean=s=>simple(s).replace(/[^가-힣a-z0-9]/gi,'');
 const grams=s=>{
  const x=new Set(),v=clean(s);
  for(let i=0;i<=v.length-8;i++)x.add(v.slice(i,i+8));
  return x;
 };
 const x=grams(a),y=grams(b);
 if(!x.size||!y.size)return 0;
 let common=0;for(const z of x)if(y.has(z))common++;
 return common/Math.min(x.size,y.size);
}
function inspect(value,prompt){
 const errors=[];
 if(prompt?.qaNatalDepthPreview!==true)return errors;
 const fail=e=>errors.push(e);
 // Two intentionally distinct QA contracts share this verifier:
 // one-shot diagnostic requires depth and suppresses temperament;
 // additive trial preserves temperament and omits unsupported depth.
 const additive=prompt.qaAdditiveDepthPreview===true;
 if(prompt.stage!=='body'||JSON.stringify(prompt.requestedSections)!=='["saju_core"]'||
    !prompt.facts?.chart?.hour)
  return ['QA_DEPTH_INVALID_OR_UNKNOWN_NATAL_SCOPE'];
 const payload=generation.compile(prompt);
 const depthTask=payload?.task?.chapters?.saju_core?.topics?.natal_depth;
 const allowed=new Set(depthTask?.citableFacts?.map(x=>x.id)||[]);
 if(!depthTask||!MIN.every(x=>allowed.has(x))||depthTask.allowedSourceRefs?.some(x=>!allowed.has(x)))
  fail('QA_DEPTH_UNVERIFIED_TASK');
 const core=value?.chapters?.saju_core;
 const parts=core?.paragraphs;
 if(!parts||!Object.hasOwn(parts,'natal_depth')||!Object.hasOwn(parts,'strength'))
  return [...errors,'QA_DEPTH_MISSING_RESPONSE_FIELDS'];
 const standard=parts.strength,depth=parts.natal_depth;
 if(!standard||typeof standard.text!=='string'||!standard.text.trim())
  fail('QA_DEPTH_MISSING_CORE_ANCHOR');
 // The 2026-10-22 paid response had natal_depth:null. After qualifying
 // this one QA input in advance, absence of the ONLY depth under review is
 // a failed sample, never a technical pass. Preserve the original response
 // in the existing encrypted rejected-archive path; do not retry the model.
 // The ordinary paid schema/decoder is unaffected by this QA-only gate.
 if(depth===null){
  // A nullable slot is useful only if the complete original two-topic
  // response can still be decoded. The actual reader/strict evidence
  // validation follows in report-response-decoder.
  return additive?[...new Set(errors)]:
   [...new Set([...errors,'QA_DEPTH_REQUIRED_READING_MISSING'])];
 }
 if(!depth||typeof depth!=='object'||Array.isArray(depth))
  return [...errors,'QA_DEPTH_WRONG_PARAGRAPH_TYPE'];
 if(!additive&&parts.temperament!==null)
  fail('QA_DEPTH_SEASONAL_SLOT_NOT_NULL');
 const basis=depth.basis;
 if(!basis||!Array.isArray(basis.refs)||
    basis.refs.some(id=>typeof id!=='string'||!allowed.has(id))||
    basis.refs.length!==new Set(basis.refs).size)
  fail('QA_DEPTH_INVALID_EVIDENCE_REFS');
 else{
  for(const id of MIN)if(!basis.refs.includes(id))
   fail('QA_DEPTH_MISSING_REQUIRED_POSITION:'+id);
  if(basis.refs.some(id=>id.startsWith('annual.')||id.startsWith('fortune.')||
    id.startsWith('person.')))fail('QA_DEPTH_FOREIGN_SOURCE');
 }
 if(!['interpretation','condition','limit'].every(k=>
  typeof basis?.[k]==='string'&&basis[k].trim()))
  fail('QA_DEPTH_MISSING_REASON_OR_LIMIT');
 // Nonempty boilerplate is not a real boundary. Require a hypothetical
 // condition and an explicit limitation; these remain internal evidence.
 if(typeof basis?.condition==='string'&&basis.condition.trim()&&
    !/(?:가상|예시|경우|상황|조건|가정|할 때|이라면)/.test(basis.condition))
  fail('QA_DEPTH_BASIS_HAS_NO_CONDITION');
 if(typeof basis?.limit==='string'&&basis.limit.trim()&&
    !/(?:실제|확인|알 수|단정|보장|미판정|판정하지|증명|근거가 없)/.test(basis.limit))
  fail('QA_DEPTH_BASIS_HAS_NO_LIMIT');
 if(basis?.interpretation!==
    require('./report-core-paid-natal-depth-fact-lock').fromPayload(payload).literal)
  fail('QA_DEPTH_FACT_LOCK_DIVERGED');
 const title=simple(depth.label),text=simple(depth.text);
 // Only the OFFLINE editorial envelope has these independent historical
 // references. They must never silently become claims about lived outcomes.
 const classical=depthTask?.qaOfflineEditorialResearch?.exactWinterClassicalScope;
 if(classical){
  const scope=classical.sourceScope;
  if(classical.kind!=='qa-exact-winter-source-scope-editorial-only-v1'||
     classical.releaseVerdict!=='not-approved'||
     classical.approvedForCustomer!==false||
     classical.paidWriterAuthorized!==false||
     scope?.paidWriterAuthorized!==false||
     scope?.automaticLifeOutcome!==false||
     scope?.whichMethodDominates!=='unresolved'||
     scope?.exactDayHour?.sourceUnit!=='exact-day-hour-winter-subcase'||
     scope?.seasonalMonth?.compoundConditionMatched!==false||
     !scope?.historicalClauseDoesNotOverrideSeasonalConditions||
     !scope?.seasonalConditionsDoNotNegateHistoricalClause)
   fail('QA_DEPTH_CLASSICAL_SOURCE_SCOPE_INVALID');
  // Inspect independent clauses, so adding a disclaimer AFTER an unsupported
  // conclusion will not make the initial claim appear valid.
  const clauses=text.split(/[.!?。！？\n,，;；]+|(?:하지만|그러나|다만|그렇지만)/)
   .map(simple).filter(Boolean);
  for(const clause of clauses){
   // A clear negation/limitation is not an asserted personal outcome.
   if(/(?:아닙니다|않습니다|없습니다|보류해야|확정할 수 없|판단할 수 없|증거는 아니|단정할 수 없)/.test(clause))
    continue;
   if(/(?:고전|옛 책|겨울 평가|겨울 구절).{0,85}(?:취소됩|무효입|뒤집힙|취소된다|무효가 됩니다)/.test(clause))
    fail('QA_DEPTH_CLASSICAL_VERSE_FALSELY_CANCELLED');
   if(/(?:겨울|따뜻함|계절|조건|글자).{0,85}(?:없으므로|없기 때문에|맞지 않으므로|충족되지 않아).{0,85}(?:운(?:은|이)?\s*(?:나쁘|나쁩|나쁜)|불운|실패할|흉한 운)/.test(clause))
    fail('QA_DEPTH_CLASSICAL_MISSING_CONDITION_TO_BAD_FORTUNE');
   if(/(?:고전|옛 책|겨울 구절|겨울 평가).{0,85}(?:실제(?:로)?\s*(?:평온|편안)|평온한 성격|좋은 운이 확정|인생이 편안)/.test(clause))
    fail('QA_DEPTH_CLASSICAL_TEXT_TO_PERSONAL_CERTAINTY');
  }
 }

 const strengthText=simple(standard.text),visible=title+' '+text;
 if(title.length<5||text.length<100)fail('QA_DEPTH_EMPTY_OR_TRIVIAL_READER_TEXT');
 if(reader.errors([title,text]).length)fail('QA_DEPTH_READER_JARGON');
 if(/[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]/.test(visible))
  fail('QA_DEPTH_READER_CHINESE_SYMBOL');
 if(/(?:궁금하지\s*않으세요|어떨까요|어떤가요|하시겠습니까)\s*[?？]?\s*$/.test(text)||
    /[?？]\s*$/.test(text))
  fail('QA_DEPTH_ENDING_QUESTION');
 // A disclaimer tacked onto an asserted prediction in the same sentence
 // must NOT excuse the prediction. Inspect each independent clause, not
 // just the whole sentence, while still allowing an explicit denial.
 for(const clause of text.split(/[.!?。！？\\n,，;；]+|(?:하지만|그러나|다만|그렇지만)/)
  .map(simple).filter(Boolean)){
  if(READER_CLAIMS.test(clause)&&!VOID_OUTPUT.test(clause))
   fail('QA_DEPTH_UNSUPPORTED_PERSONAL_OUTCOME');
 }
 // A link to exact/same-element natal roots does not establish a real
 // personality trait, personal skill or future event. Separate from the
 // general fabricated-outcome check because a causal graph claim can
 // masquerade as an otherwise conditional interpretation.
 errors.push(...require('./report-core-paid-natal-root-claim-guard').inspect(text));
 // The provider now receives the VERIFIED directional element worksheet.
 // If the reader text explicitly reverses a computed generating/controlling
 // relation, reject it. No such assertion is required or auto-invented.
 errors.push(...require('./report-core-paid-natal-direction-claim-gate')
  .inspect(text,prompt.facts,payload.source));
 if(!CONDITIONAL.test(text))fail('QA_DEPTH_NO_CONDITIONAL_INTERPRETATION');
 if(!COMPARISON.test(text))fail('QA_DEPTH_NO_PILLAR_CONTRAST');
 const positions=new Set(referencedPositions(text));
 if(positions.size<2)fail('QA_DEPTH_NO_DISTINCT_NATAL_POSITIONS');
 // Independently verify that everyday descriptions attributed to year/hour
 // match those positions' computed symbolic classifications. This is a
 // conservative QA filter, not an approval of a full interpretive narrative.
 errors.push(...require('./report-core-paid-natal-depth-role-check')
  .inspect(text,payload.source));
 // A paid-depth addition must differ from BOTH existing core paragraphs.
 // Previously only strength was compared, so copying temperament or padding
 // the new paragraph with its own repeated sentences could pass QA.
 const sentences=s=>String(s||'').split(/[.!?。！？\n]+/)
  .map(simple).filter(x=>x.length>18);
 const depthSentences=sentences(text);
 for(const [prior,code] of [
  [parts.strength,'QA_DEPTH_REPEATS_MONTH_CORE'],
  [parts.temperament,'QA_DEPTH_REPEATS_TEMPERAMENT_CORE']
 ]){
  if(!prior||typeof prior.text!=='string'||!prior.text.trim())continue;
  const earlier=simple(prior.text);
  if(overlap(earlier,text)>0.55||earlier===text)
   fail(code);
  if(depthSentences.some(s=>sentences(earlier).includes(s)))
   fail('QA_DEPTH_REPEATS_EXACT_SENTENCE');
 }
 // Length alone is not premium depth. Catch identical and minimally reworded
 // sentence padding INSIDE the new paragraph, without judging all prose.
 for(let i=0;i<depthSentences.length;i++){
  for(let j=i+1;j<depthSentences.length;j++){
   if(depthSentences[i]===depthSentences[j]||
      (depthSentences[i].length>=36&&depthSentences[j].length>=36&&
       overlap(depthSentences[i],depthSentences[j])>0.80))
    fail('QA_DEPTH_SELF_REPEATED_SENTENCE');
  }
 }
 return [...new Set(errors)];
}
function assert(value,prompt){
 const errors=inspect(value,prompt);
 if(errors.length)throw Error('QA_NATAL_DEPTH_RESPONSE_REJECTED:'+errors.join('|'));
 return {pass:true,releaseVerdict:'not-approved',
  verifiedTopic:'natal_depth',proseProfessionallyReviewed:false,
  apiCalls:0};
}
module.exports={inspect,assert,overlap,referencedPositions};
