/* Name-analysis ruleset v0.3
 * No user-specific names or Hanja are stored in source code.
 * Character data must come from a separately verified dictionary dataset.
 */
const RULESET={id:'kr-name-v0.3',strokeConvention:'dictionary-record-required',yinYang:'odd=양, even=음',numerology:'four-grid surname+given-name convention',phoneticFiveElements:'disabled-until-pronunciation-table-audit',resourceFiveElements:'disabled-until-character-table-audit'};
const VERIFIED={};
function parity(n){return n%2?'양':'음'}
function grids(strokes){if(strokes.length!==3)return null;const [s,a,b]=strokes;return {원격:a+b,형격:s+a,이격:s+b,정격:s+a+b}}
function calculate(hanja=''){const cs=[...hanja.trim()];if(cs.length!==3)return {status:'unsupported_name_length'};const missing=cs.filter(c=>!VERIFIED[c]||!Number.isInteger(VERIFIED[c].strokes));if(missing.length)return {status:'needs_verified_strokes',missing};const strokes=cs.map(c=>VERIFIED[c].strokes);return {status:'ready',ruleset:RULESET.id,characters:cs.map((c,i)=>({char:c,...VERIFIED[c],yinYang:parity(strokes[i])})),strokes,yinYang:strokes.map(parity),grids:grids(strokes),disabled:{phoneticFiveElements:true,resourceFiveElements:true}}}
module.exports={RULESET,VERIFIED,calculate,parity,grids};