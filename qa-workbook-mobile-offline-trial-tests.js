'use strict';
// Work57: test the ACTUAL self-contained GitHub HTML, not a mock design.
// No customer inputs, analytics, account connection, network or API calls.
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=__dirname;
const html=fs.readFileSync(path.join(root,'workbook-mobile-offline-trial.html'),'utf8');
const scripts=[
 'report-buyer-work-skill-scope.js',
 'report-buyer-decision-context.js',
 'report-work-skill-decision-workbook.js',
 'report-work-skill-decision-comparison.js',
 'report-work-skill-decision-workbook-ui.js'
];
assert(html.startsWith('<!doctype html>'));
assert(html.includes('<meta name="viewport" content="width=device-width,initial-scale=1">'));
assert(html.includes("default-src 'none'"));
assert(html.includes("connect-src 'none'"));
assert(html.includes("form-action 'none'"));
assert(html.includes("script-src 'unsafe-inline'"));
assert(html.includes("style-src 'unsafe-inline'"));
assert(!/<script[^>]+\bsrc\s*=/i.test(html),'network-dep scripts forbidden');
assert(!/<(?:link|iframe|img|form)[\s>]/i.test(html),'no external or submission-capable HTML elements');
assert(!/<a\b[^>]*\bhref/i.test(html),'no surprise navigation links');
const startCSS=fs.readFileSync(path.join(root,'report-work-skill-decision-workbook.css'),'utf8');
assert(html.includes('\n'+startCSS+'\n</style>'),'source CSS must be exact and current');
const matches=[...html.matchAll(/<script data-original-module="([^"]+)">\n([\s\S]*?)\n<\/script>/g)];
assert.deepEqual(matches.map(m=>m[1]),[...scripts,'trial-offline-local-controls']);
for(let i=0;i<scripts.length;i++){
 const source=fs.readFileSync(path.join(root,scripts[i]),'utf8');
 assert.equal(matches[i][2],source,'OFFLINE_TRIAL_STALE_BROWSER_MODULE:'+scripts[i]);
}
const ids=[
 'readerDecision','workSkillContext','currentWork','targetSkill',
 'workSkillWorkbook','workSkillWorkbookResult','workSkillWorkbookLiveStatus',
 'workSkillBudgetOption',
 'wb-weeklyStudyHours','wb-requiredStudyHours','wb-targetWeeks',
 'wb-trainingCostKRW','wb-availableBudgetKRW',
 'trialExample','trialClear','trialUnderstanding','trialDifficulty',
 'trialFeedbackCompose','trialFeedbackSummary'
];
for(const id of ids){
 const count=(html.match(new RegExp('id="'+id+'"','g'))||[]).length;
 assert.equal(count,1,'must have exactly one true offline DOM id: '+id);
}
assert(html.includes('합성 예시 자동 입력'));
assert(html.includes('피드백 문구 만들기'));
assert(html.includes('실제 유료 보고서나 출시 버전이 아닙니다'));
assert(!html.includes('OPENAI_API_KEY'));
assert(!html.includes('REPORT_QA_CONFIRM'));
assert(!html.includes('api/checkout/start'));
assert(!html.includes('api/calculate'));
assert(!html.includes('sendBeacon('));
assert(!html.includes('localStorage.'));
assert(!html.includes('sessionStorage.'));
class FakeNode{
 constructor(id=''){
  this.id=id;this.tagName='div';this.value='';
  this.hidden=id!=='readerDecision';this.disabled=id.startsWith('wb-');
  this.text='',this.open=false,this.attrs={};this.childNodes=[];
  this._textContent='';this.className='';this.listeners={};
  this.classList={toggle(){}};
 }
 set textContent(s){this._textContent=String(s??'');this.childNodes=[]}
 get textContent(){return this._textContent+this.childNodes.map(x=>x.textContent||'').join('')}
 addEventListener(event,fn){(this.listeners[event]??=[]).push(fn)}
 emit(event='input'){for(const fn of this.listeners[event]||[])fn()}
 setAttribute(k,v){this.attrs[k]=String(v)}
 getAttribute(k){return this.attrs[k]??null}
 removeAttribute(k){delete this.attrs[k]}
 replaceChildren(...items){this._textContent='';this.childNodes=items}
 append(...items){this.childNodes.push(...items)}
 focus(){this.focused=true}
 scrollIntoView(){}
 contains(node){return this.childNodes.includes(node)}
}
const nodes=Object.fromEntries(ids.map(id=>[id,new FakeNode(id)]));
nodes.readerDecision.value='기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.';
nodes.trialUnderstanding.value='not-tested';
nodes.trialDifficulty.value='not-tested';
for(const id of ids.filter(x=>x.startsWith('wb-')))
 nodes[id].setAttribute('data-field-label',id.slice(3));
const events={DOMContentLoaded:[]};
const document={
 readyState:'loading',
 getElementById:id=>nodes[id]||null,
 addEventListener:(event,fn)=>{(events[event]??=[]).push(fn)},
 createElement:tag=>{let n=new FakeNode();n.tagName=tag;return n},
 createTextNode:text=>({textContent:String(text)})
};
const window={document};
let calls=0;
const block=()=>{calls++;throw Error('OFFLINE_TRIAL_FORBIDS_NETWORK_AND_STORAGE')};
const sandbox={window,document,console,
 Event:class Event{constructor(type){this.type=type}},
 fetch:block,XMLHttpRequest:block,WebSocket:block,EventSource:block,
 localStorage:{setItem:block,getItem:block},
 sessionStorage:{setItem:block,getItem:block},
 navigator:{sendBeacon:block}};
for(const script of matches)
 vm.runInNewContext(script[2],sandbox,{filename:script[1],timeout:3000});
assert.equal(events.DOMContentLoaded.length,2,'same original app pair of scope + preview handlers');
for(const fn of events.DOMContentLoaded)fn();
const view=()=>nodes.workSkillWorkbookResult.textContent;
const status=()=>nodes.workSkillWorkbookResult.getAttribute('data-workbook-status');
assert.equal(nodes.workSkillWorkbook.hidden,false);
assert.equal(nodes['wb-weeklyStudyHours'].disabled,false);
assert.equal(status(),'info');
nodes['wb-weeklyStudyHours'].value='8';
nodes['wb-weeklyStudyHours'].emit();
nodes['wb-targetWeeks'].value='8';
nodes['wb-targetWeeks'].emit();
assert.equal(status(),'partial-capacity-preview');
assert(view().includes('64시간'));
assert(!view().includes('36시간 부족'));
nodes.trialExample.emit('click');
assert.equal(nodes.currentWork.value,'물류 재고 확인');
assert.equal(nodes.targetSkill.value,'엑셀 자동화');
assert.equal(nodes['wb-weeklyStudyHours'].value,'3');
assert.equal(nodes['wb-requiredStudyHours'].value,'60');
assert.equal(nodes['wb-targetWeeks'].value,'8');
assert.equal(nodes['wb-trainingCostKRW'].value,'300000');
assert.equal(nodes['wb-availableBudgetKRW'].value,'100000');
assert.equal(nodes.workSkillBudgetOption.open,true);
assert.equal(status(),'at-least-one-entered-constraint-not-met');
assert(view().includes('36시간'));
assert(view().includes('200,000원'));
assert(view().includes('주당 학습시간을 4.5시간 더 확보'));
assert(view().includes('12주 연장'));
nodes.trialUnderstanding.value='partly';
nodes.trialDifficulty.value='adjust';
nodes.trialFeedbackCompose.emit('click');
assert(nodes.trialFeedbackSummary.value.includes('일부만 이해함'));
assert(nodes.trialFeedbackSummary.value.includes('실행 계획 해석'));
assert(!nodes.trialFeedbackSummary.value.includes('물류 재고 확인'));
assert(!nodes.trialFeedbackSummary.value.includes('300000'));
assert(!nodes.trialFeedbackSummary.value.includes('1982'));
nodes.trialClear.emit('click');
assert.equal(nodes.currentWork.value,'');
assert.equal(nodes.targetSkill.value,'');
assert.equal(nodes['wb-weeklyStudyHours'].value,'');
assert.equal(nodes['wb-trainingCostKRW'].value,'');
assert.equal(nodes.workSkillBudgetOption.open,false);
assert.equal(nodes.trialFeedbackSummary.value,'');
assert.equal(status(),'info');
assert.equal(calls,0);
console.log('PASS WORK57 SINGLE-FILE OFFLINE MOBILE TRIAL '+JSON.stringify({
 originalModulesCompared:scripts.length,
 offlineCharacters:html.length,
 initialPreview:'capacity-only-64h',
 realSyntheticScenario:'36h-short-and-200000KRW-short',
 feedback:'optional-manual-copy-no-personal-inputs',
 modelCalls:0,merchantCalls:0,externalCalls:calls,productionDeployed:false,
 realHumanTesters:0,paidProductApproved:false
}));
