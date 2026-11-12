'use strict';
// A buyer's optional two-way decision is not personalized if the model
// merely parrots the question and gives a generic month interpretation.
// Only straightforward "-할지 ... -할지" dilemmas are mechanically assessed;
// for other phrasings leave the substantive judgment to human reviewers.
// No private input, text, dates, or generated prose are logged here.
const skip=new Set(['현재','지금','기존','새로운','새로','다른','그냥','계속',
 '고민','생각','경우','선택','하는','것을','것이','관련','여러','이런',
 '저런','중입니다','합니다','싶은','나중','먼저']);
function tokens(s){
 return [...new Set((String(s).match(/[가-힣]{2,}/g)||[])
  .map(v=>v.replace(/(?:에서는|에서|으로|에게|까지|부터|에도|에|을|를|은|는|이|가|도|만)$/,''))
  .filter(v=>v.length>=2&&!skip.has(v)))];
}
function alternatives(question){
 if(typeof question!=='string'||question.length>140)return null;
 const m=question.match(/(.{2,70}?)([가-힣]지)\s+(.{2,70}?)([가-힣]지)/);
 if(!m)return null;
 // Korean alternatives include 유지할지, 배울지, 고를지, 이직할지.
 // Reattach the end of verbs other than auxiliary '할지'.
 const restore=(stem,suffix)=>stem+(suffix==='할지'?'':suffix.slice(0,-1));
 const a=tokens(restore(m[1],m[2])),b=tokens(restore(m[3],m[4]));
 const first=a.filter(v=>!b.includes(v)),second=b.filter(v=>!a.includes(v));
 return first.length&&second.length?{first,second}:null;
}
function inspect(sections,question){
 if(!question||!String(question).trim())return [];
 const options=alternatives(question);
 if(!options)return []; // Do not overclaim a mechanical review
 const core=(sections||[]).find(s=>s?.id==='saju_core');
 if(!core)return [];
 const i=Array.isArray(core.bodyTopics)?core.bodyTopics.indexOf('strength'):-1;
 if(i<0||!Array.isArray(core.body))
  return ['saju_core:buyer-choice-strength-paragraph-missing'];
 const original=String(core.body[i]||'');
 const authored=original.split(String(question).trim()).join(' ');
 const sentences=authored.split(/[.!?。！？\n]+/)
  .map(s=>s.trim()).filter(s=>s.length>=24);
 const meaning=/(?:배우|익히|이해|정보|자원|마련|비용|도구|준비|지원|조건|선택|검토|의미|분류|설명|방법|활용|필요)/;
 const applies=keywords=>sentences.some(s=>meaning.test(s)&&
  keywords.some(word=>s.includes(word)));
 if(!applies(options.first)||!applies(options.second))
  return ['saju_core:buyer-choice-not-applied-to-both-options'];
 // Two buyer alternatives in ONE vague sentence are not two explanations.
 // Check independently written conditional clauses rather than merely
 // finding the option words beside a generic "information/choice" gloss.
 // Commas, semicolons, sentence endings and explicit comparison pivots may
 // separate equally valid Korean prose. Never claim to judge semantic truth.
 const passages=authored.split(/[.!?。！？\n;,，；]+|\s+(?:반면|반대로|한편|이에\s*비해|그에\s*비해)\s+/)
  .map(s=>s.trim()).filter(Boolean);
 const evidence=/(?:익힌|익히|배운|배우|이해|정보|설명|원리|방법|자원|마련|비용|도구|준비|지원|확보|관리|기준|조건|검토)/;
 const conditional=/(?:한다면|한다|하면|경우|할\s*때|라면|때는|하려면|위해서|때에는|때라면|달리|따로|구별)/;
 const anchored=keywords=>passages.map((text,i)=>({text,i})).filter(p=>
  p.text.length>=26&&conditional.test(p.text)&&evidence.test(p.text)&&
  keywords.some(word=>p.text.includes(word)));
 const first=anchored(options.first),second=anchored(options.second);
 // A genuinely contrasted passage for each option is required. A single
 // compound sentence with two alternatives but no distinguishable clauses
 // remains a HUMAN-review problem and must not silently pass a paid gate.
 if(!first.some(a=>second.some(b=>a.i!==b.i)))
  return ['saju_core:buyer-choice-both-options-not-independently-explained'];
 return [];
}
module.exports={inspect,alternatives};
