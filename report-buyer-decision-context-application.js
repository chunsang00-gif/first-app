'use strict';
// STRICT, minimum reader-level validation only when the buyer voluntarily
// entered BOTH a current-work description and a desired skill. These texts
// are customer self-reports, never observed ability or natal evidence.
// A source-correct model paragraph that ignores either user input is rejected
// BEFORE additional billable report chapters are requested.
// This is not an expert assessment, nor commercial approval.
const {alternatives}=require('./report-paid-core-choice-application');
const {readerTask}=require('./report-buyer-decision-context');
const CONDITION=/(?:경우|때|한다면|하면|하려면|라면|때에는|조건)/;
const CHECK=/(?:기준|비용|기간|결과물|완성|개선|기록|수량|납기|방법|절차|검수|도구|예산|금액|검토|확인|점검|범위|시간|계획|안전|연습|과제|실행|준비물|단계)/;
const GENERIC=new Set(['현재','기존','새로운','새로','다른','업무',
 '일을','작업','기술','학습','선택','고민','내용','계획','준비']);
function tokens(text){
 return [...new Set((String(text).match(/[가-힣A-Za-z0-9]{2,}/g)||[])
  .map(s=>s.toLowerCase().replace(
   /(?:에서는|에서|으로|에게|까지|부터|에도|에|을|를|은|는|이|가|도|만|와|과)$/,''))
  .filter(s=>s.length>=2&&!GENERIC.has(s)))];
}
// Validate the INPUT at no cost before a merchant order exists. This is
// the same lexical minimum that the post-provider paragraph gate uses.
// A buyer's personal statements are contextual labels, never natal proof.
function preflight(assignment,question){
 if(!assignment)return [];
 const trusted=readerTask({
  currentWork:assignment.currentWork,targetSkill:assignment.targetSkill
 });
 if(!trusted||JSON.stringify(trusted)!==JSON.stringify(assignment)||
    assignment.kind!=='buyer-self-reported-work-and-study-context-v1'||
    assignment.calculatedNatalFact!==false||
    assignment.observedWorkPerformance!==false||
    assignment.observedLearningSpeed!==false)
  return ['buyer-context-unverified-input'];
 if(!alternatives(question))
  return ['buyer-context-cannot-map-two-choices'];
 const a=tokens(assignment.currentWork),b=tokens(assignment.targetSkill);
 if(!a.some(x=>!b.includes(x))||!b.some(x=>!a.includes(x)))
  return ['buyer-context-not-distinct-enough-for-automatic-review'];
 return [];
}
function inspect(paragraph,assignment,question){
 if(!assignment)return [];
 if(!paragraph||typeof paragraph.text!=='string')
  return ['buyer-context-missing-paid-paragraph'];
 const before=preflight(assignment,question);
 if(before.length)return before;
 const opts=alternatives(question);
 const a=tokens(assignment.currentWork),b=tokens(assignment.targetSkill);
 const work=a.filter(x=>!b.includes(x)),skill=b.filter(x=>!a.includes(x));
 const original=paragraph.text.split(String(question||'').trim()).join(' ');
 // Keep comma-separated conditional clauses independent, not just full stops.
 const clauses=original.split(/[.!?。！？\n;,，；]+|\s+(?:반면|반대로|한편)\s+/)
  .map(s=>s.trim()).filter(s=>s.length>=28);
 const useful=(s,options,anchors)=>CONDITION.test(s)&&CHECK.test(s)&&
  options.some(x=>s.includes(x))&&anchors.some(x=>
   s.toLowerCase().includes(x));
 const first=clauses.map((s,i)=>({s,i})).filter(x=>
  useful(x.s,opts.first,work));
 const second=clauses.map((s,i)=>({s,i})).filter(x=>
  useful(x.s,opts.second,skill));
 const problems=[];
 if(!first.length)problems.push('buyer-context-current-work-not-applied');
 if(!second.length)problems.push('buyer-context-target-skill-not-applied');
 if(first.length&&second.length&&
    !first.some(x=>second.some(y=>x.i!==y.i)))
  problems.push('buyer-context-options-not-independently-applied');
 return problems;
}
module.exports={inspect,preflight,tokens};
