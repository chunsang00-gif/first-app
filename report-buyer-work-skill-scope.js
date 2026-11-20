'use strict';
// Shared server/browser eligibility for the OPTIONAL self-reported current
// work + target skill fields. Those two details are meaningful only when
// the customer's OWN question is whether to keep their work or learn a
// skill. They are never Saju evidence, and never authorize a sale.
(function(root){
 const TWO_OPTIONS=/(.{2,70}?)([가-힣]지)\s+(.{2,70}?)([가-힣]지)(?=\s|[,.!?。！？]|$)/;
 const WORK=/(?:일|업무|직장|직무|회사|현직|재직|고용)/;
 const KEEP=/(?:유지할지|계속할지|이어갈지|다닐지|남을지|버틸지)/;
 const LEARNING=/(?:기술|자격|교육|훈련|실습|연습|학습|공부|배우|익히|수업|지게차|엑셀)/;
 const LEARN_ACTION=/(?:배울지|익힐지|학습할지|공부할지|취득할지|실습할지|연습할지|훈련할지|수강할지)/;
 function supportsDecision(question){
  if(typeof question!=='string'||!question.trim()||question.length>140)return false;
  const match=question.match(TWO_OPTIONS);
  if(!match)return false;
  const first=match[1]+match[2],second=match[3]+match[4];
  const keep=text=>WORK.test(text)&&KEEP.test(text);
  const learn=text=>LEARNING.test(text)&&LEARN_ACTION.test(text);
  return keep(first)&&learn(second)||learn(first)&&keep(second);
 }
 function bindForm(document){
  const question=document?.getElementById?.('readerDecision');
  const wrap=document?.getElementById?.('workSkillContext');
  const fields=['currentWork','targetSkill'].map(id=>document?.getElementById?.(id));
  if(!question||!wrap||fields.some(x=>!x))return false;
  const sync=()=>{
   const enabled=supportsDecision(question.value);
   wrap.hidden=!enabled;
   wrap.classList?.toggle('hidden',!enabled);
   for(const field of fields){
    field.disabled=!enabled;
    // Never leave irrelevant self-report attached to a different concern.
    // No data is submitted for a hidden section, even on legacy form paths.
    if(!enabled)field.value='';
   }
  };
  question.addEventListener('input',sync);
  sync();
  return true;
 }
 const api=Object.freeze({supportsDecision,bindForm});
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root?.document){
  root.REPORT_BUYER_WORK_SKILL_SCOPE=api;
  if(root.document.readyState==='loading')
   root.document.addEventListener('DOMContentLoaded',()=>bindForm(root.document));
  else bindForm(root.document);
 }
})(typeof window!=='undefined'?window:null);
