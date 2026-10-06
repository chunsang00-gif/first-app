/* Korean name analysis v0.3.
 * Only dictionary-verified character meaning is eligible for paid-report facts.
 * Stroke/numerology, phonetic five-elements and resource five-elements remain blocked
 * until their reference datasets and conventions are independently audited.
 */
const NR=require('./name-ruleset');
const HANJA=NR.VERIFIED;
function chars(s=''){return [...String(s).trim()]}
function analyze(name,hanja){
  const ns=chars(name),hs=chars(hanja);
  if(!ns.length||!hs.length)return {status:'missing'};
  if(ns.length!==hs.length)return {status:'name_hanja_length_mismatch',nameLength:ns.length,hanjaLength:hs.length};
  const unknown=hs.filter(c=>!HANJA[c]||!HANJA[c].meaning);
  if(unknown.length)return {status:'needs_verified_dictionary',unknown};
  const numeric=NR.calculate(hanja);
  return {
    status:'ready',name,hanja,ruleset:NR.RULESET.id,
    characters:hs.map((c,i)=>({korean:ns[i],char:c,reading:HANJA[c].reading||null,meaning:HANJA[c].meaning})),
    meaningSummary:hs.map(c=>HANJA[c].meaning),
    numeric:numeric.status==='ready'?numeric:{status:'blocked',reason:numeric.status,missing:numeric.missing||[]},
    disabled:{phoneticFiveElements:true,resourceFiveElements:true}
  };
}
function compare({currentName,currentHanja,oldName,oldHanja,renameDate}){
  const current=analyze(currentName,currentHanja);
  if(current.status!=='ready')return {status:'blocked',current};
  if(!oldName&&!oldHanja)return {status:'ready',ruleset:NR.RULESET.id,current,former:null,renameDate:renameDate||null,comparison:{currentThemes:current.meaningSummary},limits:['이름의 한자 의미는 상징적 해석 자료로만 사용','획수 수리·발음오행·자원오행은 검증 전 출력 금지','이름이 사주·성격·사건을 바꿨다고 인과 추론하지 않음']};
  if(!oldName||!oldHanja)return {status:'blocked',current,former:{status:'incomplete_former_name'}};
  const former=analyze(oldName,oldHanja);
  if(former.status!=='ready')return {status:'blocked',current,former};
  return {status:'ready',ruleset:NR.RULESET.id,current,former,renameDate:renameDate||null,comparison:{currentThemes:current.meaningSummary,formerThemes:former.meaningSummary},limits:['개명 전후 차이는 검증된 한자 의미의 상징적 비교로만 제시','개명 때문에 운명·성격·사건이 바뀌었다고 인과 추론하지 않음','획수 수리·발음오행·자원오행은 검증 전 출력 금지']};
}
module.exports={HANJA,analyze,compare};