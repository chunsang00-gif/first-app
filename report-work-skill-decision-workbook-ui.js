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
 const live=doc?.getElementById?.('workSkillWorkbookLiveStatus');
 const fields=FIELD_IDS.map(id=>doc?.getElementById?.('wb-'+id));
 if(!scope?.supportsDecision||!workbook?.build||!comparison?.build||!context?.inspect||
    !question||!current||!target||!panel||!result||!live||
    fields.some(x=>!x))return false;
 const node=(tag,text,cssClass)=>{
  const element=doc.createElement(tag);
  if(cssClass)element.className=cssClass;
  element.textContent=text;
  return element;
 };
 let detailsOpen=false;
 const announce=(heading,kind,shortDetail='')=>{
  // Announce only a short STATUS, not a whole multi-page report on
  // every mobile keystroke. The full report is a labelled region.
  const message=heading+(shortDetail?' · '+shortDetail:'');
  if(live.textContent!==message)live.textContent=message;
  live.setAttribute('data-workbook-announcement',kind);
 };
 const show=(heading,text,kind='info')=>{
  result.replaceChildren(node('strong',heading,'workbook-result-heading'),
   node('p',text,'workbook-result-note'));
  result.setAttribute('data-workbook-status',kind);
  // Keep error detail in the short announcement; invalid input is
  // identified without making a screen reader replay the entire report.
  announce(heading,kind,text.slice(0,130));
 };
 const render=()=>{
  const active=scope.supportsDecision(question.value);
  panel.hidden=!active;
  panel.classList?.toggle('hidden',!active);
  if(!active){
   // Any new reader topic erases old personal choices, numbers and output.
   detailsOpen=false;
   for(const item of fields){
    item.value='';
    item.disabled=true;
    item.setAttribute('aria-invalid','false');
   }
   result.replaceChildren();
   result.setAttribute('data-workbook-status','hidden');
   live.textContent='';
   live.setAttribute('data-workbook-announcement','hidden');
   return;
  }
  for(const item of fields){
   item.disabled=false;
   item.setAttribute('aria-invalid','false');
  }
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
   // Empty input is UNKNOWN, not the number zero.
   if(raw!==''){
    if(!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(raw)){
     field.setAttribute('aria-invalid','true');
     field.setAttribute('aria-describedby','workSkillWorkbookLiveStatus');
     show('숫자를 확인해 주세요',
      (field.getAttribute('data-field-label')||'숫자')+
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
  }catch(error){
   // Shared Node validation remains authoritative. Use known public
   // field constraints for user help; do not expose exception contents.
   const prefix='WORKBOOK_CONSTRAINT_INVALID:';
   const key=String(error?.message||'').startsWith(prefix)?
    String(error.message).slice(prefix.length):null;
   const index=FIELD_IDS.indexOf(key);
   if(index>=0){
    fields[index].setAttribute('aria-invalid','true');
    fields[index].setAttribute('aria-describedby','workSkillWorkbookLiveStatus');
   }
   const spec=index>=0?workbook.FIELDS[FIELD_IDS[index]]:null;
   const label=index>=0?fields[index].getAttribute('data-field-label'):null;
   show('입력값을 확인해 주세요',
    spec?(label+': '+spec.min+'~'+spec.max+spec.unit+
     ', '+spec.step+spec.unit+' 단위로 입력해 주세요.'):
     '시간은 0.5시간 단위, 기간은 1~260주, 금액은 0원 이상의 정수로 입력해 주세요.','invalid');
   return;
  }
  const headings={
   'resources-fit-on-entered-estimates':'입력한 시간·교육비 조건 충족',
   'at-least-one-entered-constraint-not-met':'입력한 시간이나 예산에 부족한 부분이 있습니다',
   'additional-customer-facts-required':'입력하지 않은 정보를 확인해 주세요'
  };
  const title=headings[report.status]||'입력값 비교';
  const fmt=x=>Number(x).toLocaleString('ko-KR');
  const nodes=[node('strong',title,'workbook-result-heading')];
  const time=decisionReport.timeSummary;
  const money=decisionReport.budgetSummary;
  const keyFacts=node('div','','workbook-glance');
  const glance=(label,value)=>{
   const cell=node('div','','workbook-glance-cell');
   cell.append(node('span',label,'workbook-glance-label'),
    node('strong',value,'workbook-glance-value'));
   keyFacts.append(cell);
  };
  if(time)glance('목표 기간 내 부족한 학습시간',
   fmt(time.deficitHours)+'시간');
  if(money)glance('추가 교육비 부족분',
   fmt(money.gapKRW)+'원');
  if(time||money)nodes.push(keyFacts);
  if(report.missingFields.length){
   const remaining=report.missingFields.length;
   const missing=report.missingQuestions[0];
   const key=report.missingFields[0],idx=FIELD_IDS.indexOf(key);
   nodes.push(node('p','아직 입력하지 않은 숫자 '+remaining+
    '개. 빈 항목은 0으로 처리하지 않습니다.','workbook-missing-note'));
   if(idx>=0){
    const focusButton=node('button','다음 입력: '+missing,'workbook-missing-focus');
    focusButton.type='button'; // NEVER submit the parent saju wizard.
    focusButton.addEventListener('click',()=>fields[idx].focus?.());
    nodes.push(focusButton);
   }
  }
  // Real decision improvements are immediately visible on narrow phones.
  // Keep the optional long comparison and reading checklist behind a native
  // keyboard-accessible <details> control. Preserve open state on typing.
  if(decisionReport.waysToAdjust.length){
   nodes.push(node('h4','조건을 바꿀 수 있는 방법','workbook-compare-title'));
   const options=node('ul','','workbook-option-list');
   for(const option of decisionReport.waysToAdjust)
    options.append(node('li',option.text));
   nodes.push(options);
  }
  const detail=node('details','','workbook-more');
  detail.open=detailsOpen;
  detail.addEventListener('toggle',()=>{
   if(!result.contains||result.contains(detail))
    detailsOpen=Boolean(detail.open);
  });
  detail.append(node('summary','계산 상세·두 선택·확인사항 펼쳐 보기',
   'workbook-more-summary'));
  const add=(label,value)=>{
   const row=node('p','','workbook-result-line');
   row.append(node('strong',label+': '),doc.createTextNode(value));
   detail.append(row);
  };
  if(time){
   add('목표 기간 내 확보 가능한 학습시간',
    fmt(time.enteredHoursAvailableByTarget)+'시간');
   add('필요한 주당 학습시간',
    fmt(time.minimumHoursPerWeekForTarget)+'시간');
   if(time.weeksOnCurrentEnteredSchedule===null)
    add('현재 일정에서 완료 예상 주수','주당 학습시간 0시간으로 계산 불가');
   else add('현재 일정에서 필요한 주수',
    fmt(time.weeksOnCurrentEnteredSchedule)+'주 (입력한 총시간 기준)');
   add('목표 기간 내 부족한 학습시간',
    fmt(time.deficitHours)+'시간');
  }
  if(money)add('교육비에서 추가로 필요한 금액',
   fmt(money.gapKRW)+'원');
  detail.append(node('h4','두 선택에서 확인할 내용','workbook-compare-title'));
  const cards=node('div','','workbook-choice-grid');
  for(const choice of decisionReport.choices){
   const card=node('section','','workbook-choice-card');
   card.append(node('strong',choice.title),
    node('span',choice.subject,'workbook-choice-subject'),
    node('p',choice.text));
   cards.append(card);
  }
  detail.append(cards);
  detail.append(node('h4','직접 확인할 사항','workbook-compare-title'));
  const checks=node('ul','','workbook-check-list');
  for(const check of decisionReport.nextChecks)
   checks.append(node('li',check));
  detail.append(checks);
  nodes.push(detail);
  nodes.push(node('p',
   '무료 선택 비교입니다. 수치는 고객이 입력한 예상값만 사용합니다. 실제 수료·직장 성과를 보장하거나 사주·MBTI로 판단하지 않으며, 결제·AI 호출·저장은 하지 않습니다.',
   'workbook-result-disclaimer'));
  result.replaceChildren(...nodes);
  result.setAttribute('data-workbook-status',report.status);
  const short=[
   time?'학습시간 부족 '+fmt(time.deficitHours)+'시간':null,
   money?'교육비 부족 '+fmt(money.gapKRW)+'원':null,
   report.missingFields.length?'입력 대기 '+report.missingFields.length+'개':null
  ].filter(Boolean).join(', ');
  announce(title,report.status,short);
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
