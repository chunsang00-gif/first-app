'use strict';
// Free, LOCAL browser-only preview. All numbers are processed by the same
// report-work-skill-decision-workbook.js shared with Node. Never fetches,
// persists, charges, or adds fields to the existing horoscope submission.
(function(root){
const FIELD_IDS=Object.freeze([
 'weeklyStudyHours','requiredStudyHours','targetWeeks',
 'trainingCostKRW','availableBudgetKRW'
]);
function bindForm(doc,apis={}){
 const scope=apis.scope||root?.REPORT_BUYER_WORK_SKILL_SCOPE;
 const workbook=apis.workbook||root?.REPORT_WORK_SKILL_DECISION_WORKBOOK;
 const comparison=apis.comparison||root?.REPORT_WORK_SKILL_DECISION_COMPARISON;
 const context=apis.context||root?.REPORT_BUYER_DECISION_CONTEXT;
 const question=doc?.getElementById?.('readerDecision');
 const current=doc?.getElementById?.('currentWork');
 const target=doc?.getElementById?.('targetSkill');
 const panel=doc?.getElementById?.('workSkillWorkbook');
 const result=doc?.getElementById?.('workSkillWorkbookResult');
 const fields=FIELD_IDS.map(id=>doc?.getElementById?.('wb-'+id));
 if(!scope?.supportsDecision||!workbook?.build||!comparison?.build||!context?.inspect||
    !question||!current||!target||!panel||!result||
    fields.some(x=>!x))return false;
 const node=(tag,text,cssClass)=>{
  const element=doc.createElement(tag);
  if(cssClass)element.className=cssClass;
  element.textContent=text;
  return element;
 };
 const show=(heading,text,kind='info')=>{
  result.replaceChildren(node('strong',heading,'workbook-result-heading'),
   node('p',text,'workbook-result-note'));
  result.setAttribute('data-workbook-status',kind);
 };
 const render=()=>{
  const active=scope.supportsDecision(question.value);
  panel.hidden=!active;
  panel.classList?.toggle('hidden',!active);
  if(!active){
   // The question may now be about an entirely different concern:
   // don't retain old work-specific figures or a previous diagnosis.
   for(const item of fields)item.value='';
   for(const item of fields)item.disabled=true;
   result.replaceChildren();
   result.setAttribute('data-workbook-status','hidden');
   return;
  }
  for(const item of fields)item.disabled=false;
  const submitted={currentWork:current.value.trim(),targetSkill:target.value.trim()};
  if(!submitted.currentWork||!submitted.targetSkill){
   show('무료 시간·예산 비교',
    '현재 하는 일과 배우려는 기술을 모두 적으면 시간·비용 조건을 비교할 수 있습니다. 아래 수치는 선택 입력입니다.');
   return;
  }
  const validated=context.inspect(submitted);
  if(!validated.valid||validated.status!=='ready'||
     submitted.currentWork===submitted.targetSkill){
   show('현재 일과 기술 입력을 확인해 주세요',
    '서로 다른 두 내용을 각각 2~80자로 입력해 주세요. 연락처·링크는 사용하지 않습니다.','invalid');
   return;
  }
  const constraints={};
  for(let i=0;i<FIELD_IDS.length;i++){
   const field=fields[i],raw=String(field.value||'').trim();
   // Only explicit numbers count. Empty input must NOT silently be 0.
   if(raw!==''){
    if(!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(raw)){
     show('숫자를 확인해 주세요',field.getAttribute('data-field-label')+
      ': 음수가 아닌 숫자로 입력해 주세요.','invalid');
     return;
    }
    constraints[FIELD_IDS[i]]=Number(raw);
   }
  }
  let report,decisionReport;
  try{
   report=workbook.build({
    readerDecision:question.value,decisionContext:submitted,constraints
   });
   decisionReport=comparison.build(report);
  }catch(e){
   // Never display arbitrary exception detail or purchaser input as HTML.
   // Native field bounds and the SAME Node validator remain authoritative.
   show('입력값을 확인해 주세요',
    '시간은 0.5시간 단위, 기간은 1~260주, 금액은 0원 이상의 정수로 입력해 주세요.','invalid');
   return;
  }
  const missing=report.missingQuestions;
  const headings={
   'resources-fit-on-entered-estimates':'입력한 시간·교육비 조건 충족',
   'at-least-one-entered-constraint-not-met':'입력한 시간이나 예산에 부족한 부분이 있습니다',
   'additional-customer-facts-required':'입력하지 않은 정보를 확인해 주세요'
  };
  const nodes=[node('strong',headings[report.status]||'입력값 비교','workbook-result-heading')];
  const add=(label,value)=>{
   const row=node('p','', 'workbook-result-line');
   const emphasis=node('strong',label+': ');
   row.append(emphasis,doc.createTextNode(value));
   nodes.push(row);
  };
  if(missing.length)add('아직 필요한 입력',missing.join(' · '));
  const fmt=x=>Number(x).toLocaleString('ko-KR');
  if(report.time.state!=='unknown'){
   add('목표 기간 내 확보 가능한 학습시간',
    fmt(report.time.totalHoursByTarget)+'시간');
   add('필요한 주당 학습시간',
    fmt(report.time.hoursNeededPerWeek)+'시간');
   if(report.time.earliestWholeWeeksOnEnteredSchedule===null)
    add('현재 일정에서 완료 예상 주수','주당 학습시간 0시간으로 계산 불가');
   else add('현재 일정에서 필요한 주수',
    fmt(report.time.earliestWholeWeeksOnEnteredSchedule)+'주 (입력한 총시간 기준)');
   add('목표 기간 내 부족한 학습시간',
    fmt(report.time.hoursShortByTarget)+'시간');
  }
  if(report.budget.state!=='unknown'){
   add('교육비에서 추가로 필요한 금액',
    fmt(report.budget.additionalKRWNeeded)+'원');
  }
  // The separate source-bound comparison makes visible which option
  // has numeric inputs and which cannot yet be assessed. Do not imply an
  // astrology-based verdict or claim a new career recommendation.
  nodes.push(node('h4','두 선택에서 확인할 내용','workbook-compare-title'));
  const cards=node('div','','workbook-choice-grid');
  for(const choice of decisionReport.choices){
   const card=node('section','','workbook-choice-card');
   card.append(node('strong',choice.title),
    node('p',choice.text));
   cards.append(card);
  }
  nodes.push(cards);
  if(decisionReport.waysToAdjust.length){
   nodes.push(node('h4','부족한 조건을 바꾸는 계산상 방법','workbook-compare-title'));
   const options=node('ul','','workbook-option-list');
   for(const option of decisionReport.waysToAdjust)
    options.append(node('li',option.text));
   nodes.push(options);
  }
  nodes.push(node('h4','직접 확인할 사항','workbook-compare-title'));
  const checks=node('ul','','workbook-check-list');
  for(const check of decisionReport.nextChecks)
   checks.append(node('li',check));
  nodes.push(checks);
  nodes.push(node('p',
   '무료 선택 비교입니다. 모든 수치는 직접 입력한 예상값을 사용합니다. 실제 수료·직장 성과를 보장하거나 사주·MBTI로 판단하지 않으며, 결제·AI 호출·저장은 하지 않습니다.',
   'workbook-result-disclaimer'));
  result.replaceChildren(...nodes);
  result.setAttribute('data-workbook-status',report.status);
 };
 // Scope's question listener is bound first in the real entry page.
 // Still clear the old work fields and computed result in this module
 // even if called standalone without the scope's DOM-binding helper.
 let lastActive=scope.supportsDecision(question.value);
 question.addEventListener('input',()=>{
  const active=scope.supportsDecision(question.value);
  if(!active&&lastActive){current.value='';target.value='';}
  lastActive=active;
  render();
 });
 for(const field of [current,target,...fields])
  field.addEventListener('input',render);
 render();
 return true;
}
const api=Object.freeze({bindForm,FIELD_IDS});
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(root?.document){
 root.REPORT_WORK_SKILL_DECISION_WORKBOOK_UI=api;
 if(root.document.readyState==='loading')
  root.document.addEventListener('DOMContentLoaded',()=>bindForm(root.document));
 else bindForm(root.document);
}
})(typeof window!=='undefined'?window:null);
