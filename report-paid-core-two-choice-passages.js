'use strict';
// A reader may name one choice in a short opening sentence and explain
// its calculated meaning in the NEXT sentence. This owner-scoped window
// is an editorial convenience, NOT evidence of model quality or truth.
// Never carry content over a subsequent alternative, and never assign a
// single compound A+B sentence to both sides.
const parse=require('./report-paid-core-choice-application').alternatives;
const WHEN=/(?:경우|때|라면|한다면|하면|하려면|했을|조건|선택하면)/;
const PIVOT=/\s+(?:반면|반대로|한편|이에\s*비해|그에\s*비해)\s+/;
function owned(text,question){
 const alternatives=parse(question);
 if(!alternatives)return null;
 const original=String(text||'').split(String(question||'').trim()).join(' ');
 const parts=original.split(/[.!?。！？\n]+|\s+(?:반면|반대로|한편|이에\s*비해|그에\s*비해)\s+/)
  .map(s=>s.trim()).filter(s=>s.length>=12);
 const matches=(s,words)=>words.some(w=>w.length>=2&&s.includes(w));
 const owners=parts.map((s,i)=>{
  if(!WHEN.test(s))return null;
  const a=matches(s,alternatives.first),b=matches(s,alternatives.second);
  return a!==b?(a?'first':'second'):null;
 });
 const entries={first:[],second:[]};
 for(let i=0;i<parts.length;i++){
  const side=owners[i];
  if(!side)continue;
  let text=parts[i];
  // Only the two immediately following sentences MAY complete this
  // option; another conditional option is an absolute boundary.
  for(let j=i+1;j<parts.length&&j<=i+2;j++){
   if(owners[j])break;
   if(text.length+parts[j].length>420)break;
   text+=' '+parts[j];
  }
  entries[side].push({s:text,i});
 }
 return entries;
}
module.exports={owned};
