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
 // Replacing only the option name in identical template sentences does not
 // add distinct value, even though two separate sentences are present.
 if(!first.some(a=>second.some(z=>a.i!==z.i&&
    redacted(a.s)!==redacted(z.s))))
  return ['buyer-two-options-share-one-boilerplate'];
 return [];
}
module.exports={inspect};
