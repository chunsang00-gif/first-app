'use strict';
// Browser VM execution of the ACTUAL four entry scripts in their real order.
// No jsdom dependency, network, user storage, real customers or payments.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const serverWorkbook=require('./report-work-skill-decision-workbook');
const serverContext=require('./report-buyer-decision-context');
const source=file=>fs.readFileSync(path.join(__dirname,file),'utf8');
const html=source('index.html');
const files=[
 'report-buyer-work-skill-scope.js',
 'report-buyer-decision-context.js',
 'report-work-skill-decision-workbook.js',
 'report-work-skill-decision-comparison.js',
 'report-work-skill-decision-workbook-ui.js'
];
for(const name of files)assert(html.includes('<script src="'+name+'"></script>'));
for(const id of [
 'workSkillWorkbook','workSkillWorkbookResult','readerDecision',
 'currentWork','targetSkill',
 'wb-weeklyStudyHours','wb-requiredStudyHours','wb-targetWeeks',
 'wb-trainingCostKRW','wb-availableBudgetKRW'
])assert(html.includes('id="'+id+'"'),'real wizard input missing: '+id);
assert(html.includes('<link rel="stylesheet" href="report-work-skill-decision-workbook.css">'));
assert(html.includes('aria-live="polite"')&&html.includes('무료 미리보기'));
assert(!source('live-report-ui.js').includes('wb-weeklyStudyHours'));
assert(!source('live-report-ui.js').includes('wb-trainingCostKRW'));
class FakeNode{
 constructor(id=''){
  this.id=id;this.value='';this.hidden=true;this.disabled=true;
  this.attrs={};this.tagName='div';this.childNodes=[];this.listeners={};
  this.className='';this._textContent='';
  this.classList={hidden:true,toggle:(name,state)=>{
   if(name==='hidden')this.classList.hidden=state;
  }};
 }
 addEventListener(event,fn){(this.listeners[event]??=[]).push(fn)}
 emit(event='input'){for(const fn of this.listeners[event]||[])fn()}
 get textContent(){return this._textContent+this.childNodes.map(c=>c.textContent||'').join('')}
 set textContent(value){this.childNodes=[];this._textContent=String(value??'')}
 replaceChildren(...items){this.childNodes=items;this._textContent=''}
 append(...items){this.childNodes.push(...items)}
 setAttribute(name,value){this.attrs[name]=String(value)}
 getAttribute(name){return this.attrs[name]??null}
}
const ids=[
 'readerDecision','workSkillContext','currentWork','targetSkill',
 'workSkillWorkbook','workSkillWorkbookResult',
 'wb-weeklyStudyHours','wb-requiredStudyHours','wb-targetWeeks',
 'wb-trainingCostKRW','wb-availableBudgetKRW'
];
const nodes=Object.fromEntries(ids.map(id=>[id,new FakeNode(id)]));
for(const id of ids.filter(x=>x.startsWith('wb-'))){
 nodes[id].setAttribute('data-field-label',id.replace(/^wb-/,''));
}
const docs={DOMContentLoaded:[]};
const document={
 readyState:'loading',
 getElementById:id=>nodes[id]||null,
 addEventListener:(kind,fn)=>{(docs[kind]??=[]).push(fn)},
 createElement:tag=>{const n=new FakeNode();n.tagName=tag;return n},
 createTextNode:content=>({textContent:String(content)})
};
const window={document};
const sandbox={window,document,console};
let fetchCalls=0;
sandbox.fetch=()=>{fetchCalls++;throw Error('WORKBOOK_PREVIEW_MUST_NOT_FETCH')};
sandbox.sessionStorage={setItem(){throw Error('NO_STORE')},getItem(){throw Error('NO_STORE')}};
sandbox.localStorage=sandbox.sessionStorage;
for(const file of files)vm.runInNewContext(source(file),sandbox,{filename:file});
assert.equal(docs.DOMContentLoaded.length,2,'shared scope and preview must both mount');
for(const fn of docs.DOMContentLoaded)fn();
const n=id=>nodes[id];
const status=()=>n('workSkillWorkbookResult').getAttribute('data-workbook-status');
const shown=()=>n('workSkillWorkbookResult').textContent;
assert.equal(n('workSkillWorkbook').hidden,true);
assert.equal(n('wb-weeklyStudyHours').disabled,true);
assert.equal(status(),'hidden');
n('readerDecision').value='기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.';
n('readerDecision').emit();
assert.equal(n('workSkillContext').hidden,false);
assert.equal(n('workSkillWorkbook').hidden,false);
assert.equal(n('wb-weeklyStudyHours').disabled,false);
assert(shown().includes('현재 하는 일과 배우려는 기술을 모두 적으면'));
n('currentWork').value='물류 재고 확인';
n('currentWork').emit();
n('targetSkill').value='엑셀 자동화';
n('targetSkill').emit();
assert.equal(status(),'additional-customer-facts-required');
assert(shown().includes('일주일에 실제로 확보할 수 있는 학습시간'));
const fill=(entries)=>{
 for(const [id,v] of Object.entries(entries)){
  n('wb-'+id).value=String(v);
  n('wb-'+id).emit();
 }
};
fill({weeklyStudyHours:8,requiredStudyHours:60,targetWeeks:8,
 trainingCostKRW:150000,availableBudgetKRW:200000});
assert.equal(status(),'resources-fit-on-entered-estimates');
assert(shown().includes('64시간'));
assert(shown().includes('8주'));
assert(shown().includes('0원'));
assert(shown().includes('두 선택에서 확인할 내용'));
assert(shown().includes('현재 일을 유지하는 경우'));
assert(shown().includes('새 기술을 배우거나 병행하는 경우'));
assert(shown().includes('실제 근무표와 수업 시간대'));
assert(!shown().includes('부족한 조건을 바꾸는 계산상 방법'));
assert(shown().includes('사주·MBTI로 판단하지 않으며'));
const args={readerDecision:n('readerDecision').value,
 decisionContext:{currentWork:n('currentWork').value,targetSkill:n('targetSkill').value},
 constraints:{weeklyStudyHours:8,requiredStudyHours:60,targetWeeks:8,
  trainingCostKRW:150000,availableBudgetKRW:200000}};
const browserResult=window.REPORT_WORK_SKILL_DECISION_WORKBOOK.build(args);
const nodeResult=serverWorkbook.build(args);
assert.deepEqual(JSON.parse(JSON.stringify(browserResult)),JSON.parse(JSON.stringify(nodeResult)),
 'browser and Node must be the SAME algorithm with no source drift');
assert.equal(window.REPORT_BUYER_DECISION_CONTEXT.inspect(args.decisionContext).valid,
 serverContext.inspect(args.decisionContext).valid);
fill({weeklyStudyHours:3,trainingCostKRW:300000,availableBudgetKRW:100000});
assert.equal(status(),'at-least-one-entered-constraint-not-met');
assert(shown().includes('24시간'));
assert(shown().includes('36시간'));
assert(shown().includes('20주'));
assert(shown().includes('200,000원'));
assert(shown().includes('부족한 조건을 바꾸는 계산상 방법'));
assert(shown().includes('주당 학습시간을 4.5시간 더 확보'));
assert(shown().includes('12주 연장'));
assert(shown().includes('교육비 부족분 200,000원'));
assert(shown().includes('현재 업무의 근무시간·소득·안정성'));
assert(!shown().includes('이직해야 합니다'));
n('wb-availableBudgetKRW').value='';
n('wb-availableBudgetKRW').emit();
assert.equal(status(),'additional-customer-facts-required');
assert(shown().includes('배움에 쓸 수 있는 예산'));
assert(!shown().includes('교육비 부족분 200,000원'));
assert(shown().includes('주당 학습시간을 4.5시간 더 확보'));
n('wb-trainingCostKRW').value='-50';
n('wb-trainingCostKRW').emit();
assert.equal(status(),'invalid');
assert(shown().includes('숫자로 입력해 주세요'));
n('wb-trainingCostKRW').value='0';
n('wb-trainingCostKRW').emit();
n('wb-availableBudgetKRW').value='0';
n('wb-availableBudgetKRW').emit();
assert.equal(status(),'at-least-one-entered-constraint-not-met');
assert(shown().includes('0원'));
n('wb-weeklyStudyHours').value='0';
n('wb-weeklyStudyHours').emit();
assert(shown().includes('완료 예상 주수'));
assert(shown().includes('계산 불가'));
assert(shown().includes('주당 학습시간을 7.5시간 더 확보'));
assert(!shown().includes('목표를 12주 연장'));
// Changing topic clears prior numbers and previously entered personal text,
// and never keeps the stale workbook/answer visible for unrelated dilemmas.
n('readerDecision').value='저축할지 대출을 상환할지 고민입니다.';
n('readerDecision').emit();
assert.equal(n('workSkillContext').hidden,true);
assert.equal(n('workSkillWorkbook').hidden,true);
assert.equal(n('currentWork').value,'');
assert.equal(n('targetSkill').value,'');
assert.equal(n('wb-weeklyStudyHours').value,'');
assert.equal(n('wb-trainingCostKRW').value,'');
assert.equal(status(),'hidden');
assert.equal(shown(),'');
n('readerDecision').value='기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.';
n('readerDecision').emit();
assert.equal(n('workSkillWorkbook').hidden,false);
assert.equal(n('wb-weeklyStudyHours').value,'');
assert.equal(status(),'info'); // the reactivated preview must request work/skill anew
assert(shown().includes('현재 하는 일과 배우려는 기술을 모두 적으면'));
assert.equal(fetchCalls,0);
console.log('PASS REAL STEP-01 WORKBOOK BROWSER/Node: live self-report, partial numbers, invalid, 0h, privacy reset and zero network/paid calls');
