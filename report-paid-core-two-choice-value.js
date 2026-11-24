'use strict';
// Narrow paid-core editorial gate for an explicitly recognizable TWO-WAY
// customer question. Mere citation or adding two role labels is not enough.
// For unparseable free text, return no machine judgment; separate HUMAN
// review remains required and no sale is authorized here.
const parse=require('./report-paid-core-choice-application').alternatives;
const WHEN=/(?:경우|때|라면|한다면|하면|하려면|했을|한다면|조건)/;
const CHECK=/(?:금액|비용|한도|수량|기간|마감|담당|책임|승인|검수|방법|방식|결과물|산출|완성|일정|범위|절차|자원|자금|기준|계획|납기|소요|점검|확보|배정|계약|실행|유지|학습|연습)/;
const norm=s=>String(s||'').normalize('NFKC').toLowerCase()
 .replace(/[^가-힣a-z0-9]/g,'');
function inspect(text,question){
 if(typeof text!=='string'||!text.trim())
  return ['missing-buyer-choice-additional-paragraph'];
 const alternatives=parse(question);
 if(!alternatives)return []; // Not a machine "PASS"; operator must review.
 const cleaned=text.replace(String(question).trim(),' ');
 // A pair of conditions in a single generic sentence does not count.
 const segments=cleaned.split(/[.!?。！？\n;,，；]+|\s+(?:반면|반대로|한편|이에\s*비해)\s+/)
  .map(s=>s.trim()).filter(s=>s.length>=24);
 const qualifies=(s,words)=>WHEN.test(s)&&CHECK.test(s)&&
  words.some(word=>word.length>=2&&s.includes(word));
 const first=segments.map((s,i)=>({s,i})).filter(x=>qualifies(x.s,alternatives.first));
 const second=segments.map((s,i)=>({s,i})).filter(x=>qualifies(x.s,alternatives.second));
 if(!first.some(a=>second.some(z=>a.i!==z.i)))
  return ['buyer-two-options-not-applied-separately'];
 const redacted=s=>{
  // The option description often contains particles and generic prefixes
  // not returned by the keyword parser ("현재 일을", "새"). Remove the
  // entire IF-clause before comparing the CONSEQUENCE of each choice.
  const outcome=s.replace(/^.*?(?:경우|때|라면|한다면|하면)/,'').trim();
  return norm(outcome);
 };
 // A model can evade an exact-template veto by swapping just "납기" for
 // "연습" while keeping the same conclusion. Compare normalized TRIGRAMS
 // of the actual consequences (never the buyer option names). Very short
 // consequences are left to the existing checks and human editorial review.
 const nearClone=(first,second)=>{
  const a=redacted(first),b=redacted(second);
  if(a.length<18||b.length<18||
     Math.min(a.length,b.length)/Math.max(a.length,b.length)<0.75)return false;
  const grams=s=>Array.from({length:s.length-2},(_,i)=>s.slice(i,i+3));
  const A=grams(a),B=grams(b),freq=new Map();
  for(const g of A)freq.set(g,(freq.get(g)||0)+1);
  let shared=0;
  for(const g of B)if(freq.get(g)>0){
   shared++;freq.set(g,freq.get(g)-1);
  }
  return (2*shared)/(A.length+B.length)>=0.77;
 };
 // Replacing only the option name in identical template sentences does not
 // add distinct value, even though two separate sentences are present.
 const independentlyDifferent=(filter)=>first.some(a=>second.some(z=>
  a.i!==z.i&&filter(a.s,z.s)));
 if(!independentlyDifferent((a,b)=>redacted(a)!==redacted(b)))
  return ['buyer-two-options-share-one-boilerplate'];
 // A cosmetic replacement of a single check word is not the separate
 // decision explanation promised to a paying buyer, even when distinct
 // broad topic categories ("납기" versus "연습") are superficially present.
 if(!independentlyDifferent((a,b)=>!nearClone(a,b)))
  return ['buyer-two-options-near-duplicate-consequence'];
 return [];
}
module.exports={inspect};
