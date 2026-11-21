'use strict';
// Work58. Optional user-initiated action, never a submission or analytics.
// Works on the REAL app screen and in the one-file offline mobile trial.
(function(root){
const IDS=Object.freeze([
 'weeklyStudyHours','requiredStudyHours','targetWeeks',
 'trainingCostKRW','availableBudgetKRW'
]);
function bindForm(doc,apis={}){
 const scope=apis.scope||root?.REPORT_BUYER_WORK_SKILL_SCOPE;
 const workbook=apis.workbook||root?.REPORT_WORK_SKILL_DECISION_WORKBOOK;
 const exporter=apis.exporter||root?.REPORT_WORK_SKILL_DECISION_PRIVATE_EXPORT;
 const question=doc?.getElementById?.('readerDecision');
 const section=doc?.getElementById?.('workSkillExport');
 const create=doc?.getElementById?.('workSkillExportPrepare');
 const copy=doc?.getElementById?.('workSkillExportCopy');
 const save=doc?.getElementById?.('workSkillExportSave');
 const output=doc?.getElementById?.('workSkillExportText');
 const status=doc?.getElementById?.('workSkillExportStatus');
 const names=['currentWork','targetSkill'].map(id=>doc?.getElementById?.(id));
 const numbers=IDS.map(k=>doc?.getElementById?.('wb-'+k));
 if(!scope?.supportsDecision||!workbook?.quickPreview||!exporter?.compose||
    !question||!section||!create||!copy||!save||!output||!status||
    numbers.some(x=>!x)||names.some(x=>!x))return false;
 const inform=s=>{status.textContent=s};
 let latest=null;
 const clear=()=>{
  latest=null;
  output.value='';
  output.hidden=true;
  copy.disabled=true;save.disabled=true;
  inform('');
 };
 const snapshot=()=>{
  if(!scope.supportsDecision(question.value))return null;
  const constraints={};
  for(let i=0;i<numbers.length;i++){
   const raw=String(numbers[i].value??'').trim();
   if(raw==='')continue;
   if(!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(raw))return null;
   constraints[IDS[i]]=Number(raw);
  }
  try{
   const value=workbook.quickPreview({
    readerDecision:question.value,constraints
   });
   if(!value.capacityKnown&&!value.requiredWeeklyKnown&&!value.moneyKnown)
    return null;
   return value;
  }catch{return null}
 };
 const sync=()=>{
  clear(); // A result from a different set of customer inputs is NEVER kept.
  const valid=snapshot()!==null;
  section.hidden=!valid;
  create.disabled=!valid;
 };
 create.addEventListener('click',()=>{
  const data=snapshot();
  if(!data){sync();return}
  try{
   latest=exporter.compose({preview:data});
   output.value=latest.content;
   output.hidden=false;
   copy.disabled=false;save.disabled=false;
   inform('개인정보를 확인한 뒤 직접 복사하거나 저장하세요. 입력 숫자는 포함됩니다.');
  }catch{
   clear();
   inform('현재 입력에서는 요약을 만들 수 없습니다. 숫자와 범위를 확인해 주세요.');
  }
 });
 copy.addEventListener('click',()=>{
  if(!latest||output.hidden||output.value!==latest.content)return;
  // file:// and some mobile browsers deny clipboard writes. Always provide
  // manual select/copy as a graceful fallback; never claim success early.
  const select=()=>{
   output.focus?.();output.select?.();
   inform('텍스트가 선택됐습니다. 복사 메뉴로 직접 복사할 수 있습니다.');
  };
  const write=root?.navigator?.clipboard?.writeText;
  if(typeof write!=='function'){select();return}
  try{
   Promise.resolve(write.call(root.navigator.clipboard,latest.content))
    .then(()=>inform('요약 텍스트를 복사했습니다. 공유 전 숫자를 확인하세요.'))
    .catch(select);
  }catch{select()}
 });
 save.addEventListener('click',()=>{
  if(!latest||output.hidden||output.value!==latest.content)return;
  const BlobType=root?.Blob;
  const urls=root?.URL;
  if(typeof BlobType!=='function'||typeof urls?.createObjectURL!=='function'){
   inform('이 브라우저는 파일 저장을 지원하지 않습니다. 텍스트를 직접 복사해 주세요.');
   return;
  }
  let uri=null;
  try{
   uri=urls.createObjectURL(new BlobType([latest.content],{
    type:'text/plain;charset=utf-8'
   }));
   const anchor=doc.createElement('a');
   anchor.href=uri;anchor.download=latest.filename;
   doc.body?.appendChild(anchor);
   anchor.click();
   anchor.remove?.();
   inform('기기에서 파일 저장 여부를 확인해 주세요. 저장한 숫자도 공유 전 확인하세요.');
  }catch{
   inform('이 기기에서 저장을 시작하지 못했습니다. 텍스트를 직접 복사해 주세요.');
  }finally{
   if(uri&&typeof urls?.revokeObjectURL==='function'){
    // Downloads may be asynchronous; don't revoke immediately after click.
    if(typeof root?.setTimeout==='function')
     root.setTimeout(()=>urls.revokeObjectURL(uri),30000);
   }
  }
 });
 for(const field of [question,...names,...numbers])
  field.addEventListener('input',sync);
 sync();
 return true;
}
const api=Object.freeze({bindForm,IDS});
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(root?.document){
 root.REPORT_WORK_SKILL_DECISION_PRIVATE_EXPORT_UI=api;
 if(root.document.readyState==='loading')
  root.document.addEventListener('DOMContentLoaded',()=>bindForm(root.document));
 else bindForm(root.document);
}
})(typeof window!=='undefined'?window:null);
