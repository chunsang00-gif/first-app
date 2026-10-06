/* Name-analysis ruleset v0.2
 * V1 product convention. Values are used only when a character record is explicitly verified.
 * Numerology is presented as a traditional naming-system interpretation, not a causal fact.
 */
const RULESET={id:'kr-name-v0.2',strokeConvention:'dictionary-record-required',yinYang:'odd=양, even=음',numerology:'four-grid surname+given-name convention',phoneticFiveElements:'disabled-until-pronunciation-table-audit',resourceFiveElements:'disabled-until-character-table-audit'};
const VERIFIED={
 '朴':{reading:'박',meaning:'성씨 박',strokes:6},
 '峻':{reading:'준',meaning:'높고 준엄함, 기준이 분명함',strokes:10},
 '慜':{reading:'민',meaning:'총명하고 민첩하게 살핌',strokes:15},
 '昶':{reading:'창',meaning:'밝고 길게 뻗음',strokes:9},
 '祐':{reading:'우',meaning:'도움과 복을 보탬',strokes:9}
};
function parity(n){return n%2?'양':'음'}
function grids(strokes){if(strokes.length!==3)return null;const [s,a,b]=strokes;return {원격:a+b,형격:s+a,이격:s+b,정격:s+a+b}}
function calculate(hanja=''){const cs=[...hanja.trim()];if(cs.length!==3)return {status:'unsupported_name_length'};const missing=cs.filter(c=>!VERIFIED[c]||!Number.isInteger(VERIFIED[c].strokes));if(missing.length)return {status:'needs_verified_strokes',missing};const strokes=cs.map(c=>VERIFIED[c].strokes);return {status:'ready',ruleset:RULESET.id,characters:cs.map((c,i)=>({char:c,...VERIFIED[c],yinYang:parity(strokes[i])})),strokes,yinYang:strokes.map(parity),grids:grids(strokes),disabled:{phoneticFiveElements:true,resourceFiveElements:true}}}
module.exports={RULESET,VERIFIED,calculate,parity,grids};