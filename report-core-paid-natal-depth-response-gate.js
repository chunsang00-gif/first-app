'use strict';
// QA-only semantic/provenance guard for an optional natal-depth response.
// All conclusions remain human-review candidates. This is deliberately not
// enabled in normal paid responses.
const generation=require('./report-generation-request');
const reader=require('./report-reader-policy');
const MIN=['natal.year.stem','natal.day.stem','natal.hour.stem','facts.stemConnections'];
const READER_CLAIMS=/(?:타고난|반드시|틀림없이|무조건|항상|분명히\s*(?:성공|좋)|성격(?:이|은)\s*(?:강|약)|능력(?:이|은)\s*(?:뛰어|우수|높)|승진(?:할|합니다|한다)|합격(?:할|합니다|한다)|이별(?:할|합니다|한다)|결혼(?:할|합니다|한다)|돈을\s*많이\s*(?:벌|모으)|당신은\s*원래)/;
const CONDITIONAL=/(?:경우|상황|조건|때(?:에는|라면|에는|에는|\s)|예를\s*들어|가정)/;
const COMPARISON=/(?:다르|구별|반면|한편|비교|따로|연결|반대로|반면에|그에\s*비해|하지만)/;
const POSITION=/(?:태어난\s*해|태어난\s*날|태어난\s*시간|해에서|날에는|시간에는|해의|날의|시간의|연간|일간|시간)/g;
const VOID_OUTPUT=/(?:알\s*수\s*없습니다|확인할\s*수\s*없습니다|판단할\s*수\s*없습니다)/;
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
 if(prompt.stage!=='body'||JSON.stringify(prompt.requestedSections)!=='["saju_core"]'||
    !prompt.facts?.chart?.hour)
  return ['QA_DEPTH_INVALID_OR_UNKNOWN_NATAL_SCOPE'];
 const payload=generation.compile(prompt);
 const depthTask=payload?.task?.chapters?.saju_core?.topics?.natal_depth;
 const allowed=new Set(depthTask?.citableFacts?.map(x=>x.id)||[]);
 if(!depthTask||!MIN.every(x=>allowed.has(x))||!depthTask.allowedSourceRefs?.every(x=>allowed.has(x)))
  fail('QA_DEPTH_UNVERIFIED_TASK');
 const core=value?.chapters?.saju_core;
 const parts=core?.paragraphs;
 if(!parts||!Object.hasOwn(parts,'natal_depth')||!Object.hasOwn(parts,'strength'))
  return [...errors,'QA_DEPTH_MISSING_RESPONSE_FIELDS'];
 const standard=parts.strength,depth=parts.natal_depth;
 if(!standard||typeof standard.text!=='string'||!standard.text.trim())
  fail('QA_DEPTH_MISSING_CORE_ANCHOR');
 // Valid nullable expansion. Not enough editorial differentiation to
 // warrant a third chapter: explicitly omit the optional response.
 if(depth===null)return [...new Set(errors)];
 if(!depth||typeof depth!=='object'||Array.isArray(depth))
  return [...errors,'QA_DEPTH_WRONG_PARAGRAPH_TYPE'];
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
 const title=simple(depth.label),text=simple(depth.text);
 const strengthText=simple(standard.text),visible=title+' '+text;
 if(title.length<5||text.length<100)fail('QA_DEPTH_EMPTY_OR_TRIVIAL_READER_TEXT');
 if(reader.errors([title,text]).length)fail('QA_DEPTH_READER_JARGON');
 if(/[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]/.test(visible))
  fail('QA_DEPTH_READER_CHINESE_SYMBOL');
 if(/(?:궁금하지\s*않으세요|어떨까요|어떤가요|하시겠습니까)\s*[?？]?\s*$/.test(text)||
    /[?？]\s*$/.test(text))
  fail('QA_DEPTH_ENDING_QUESTION');
 if(READER_CLAIMS.test(text)&&!VOID_OUTPUT.test(text))
  fail('QA_DEPTH_UNSUPPORTED_PERSONAL_OUTCOME');
 if(!CONDITIONAL.test(text))fail('QA_DEPTH_NO_CONDITIONAL_INTERPRETATION');
 if(!COMPARISON.test(text))fail('QA_DEPTH_NO_PILLAR_CONTRAST');
 const positions=new Set([...text.matchAll(POS)].map(x=>x[0].includes('해')?'year':
  x[0].includes('날')?'day':'hour'));
 if(positions.size<2)fail('QA_DEPTH_NO_DISTINCT_NATAL_POSITIONS');
 if(overlap(strengthText,text)>0.55||
    simple(text)===simple(strengthText))
  fail('QA_DEPTH_REPEATS_MONTH_CORE');
 const a=String(strengthText).split(/[.!?。！？\n]+/).map(simple).filter(x=>x.length>18);
 const b=String(text).split(/[.!?。！？\n]+/).map(simple).filter(x=>x.length>18);
 if(b.some(s=>a.includes(s)))fail('QA_DEPTH_REPEATS_EXACT_SENTENCE');
 return [...new Set(errors)];
}
function assert(value,prompt){
 const errors=inspect(value,prompt);
 if(errors.length)throw Error('QA_NATAL_DEPTH_RESPONSE_REJECTED:'+errors.join('|'));
 return {pass:true,releaseVerdict:'not-approved',
  verifiedTopic:'natal_depth',proseProfessionallyReviewed:false,
  apiCalls:0};
}
module.exports={inspect,assert,overlap};
