'use strict';
// Genuine browser/server shared intake behavior. Offline: no model,
// checkout, merchant, external request or production deployment.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const scope=require('./report-buyer-work-skill-scope');
const application=require('./report-buyer-decision-context-application');
const decision=require('./report-buyer-decision-context');
const good='기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.';
const reversed='지게차를 배울지 현재 일을 유지할지 고민합니다.';
const cases=[
 [good,true],
 ['기존 일을 유지할지, 새로운 기술을 배울지 고민 중입니다.',true],
 ['기존 일을 유지할지,새로운 기술을 배울지 고민 중입니다.',true],
 ['기존 일을 유지할지, 아니면 새로운 기술을 배울지 고민 중입니다.',true],
 ['기존 일을 유지할지 아니면 새로운 기술을 배울지 고민 중입니다.',true],
 [reversed,true],
 ['현재 직장을 계속 다닐지 지게차를 배울지 고민입니다.',true],
 ['현재 일을 유지할지 대출을 상환할지 고민입니다.',false],
 ['적금을 유지할지 새로운 기술을 배울지 고민입니다.',false],
 ['현재 일을 유지할지 다른 회사로 이직할지 고민입니다.',false],
 ['저축할지 코인에 투자할지 고민입니다.',false],
 ['새 기술을 배우고 싶습니다.',false],
 ['',false],
 ['가'.repeat(141),false]
];
for(const [input,enabled] of cases)
 assert.equal(scope.supportsDecision(input),enabled,input);
const details={currentWork:'출하 전 품질 검수',targetSkill:'지게차 실습'};
assert.equal(scope.orderFor(good),'work-first');
assert.equal(scope.orderFor(reversed),'skill-first');
assert.equal(scope.orderFor('저축할지 대출을 갚을지 고민합니다.'),null);
const task=decision.readerTask(details);
assert.deepEqual(application.preflight(task,good),[]);
assert.deepEqual(application.preflight(task,reversed),[]);
for(const question of cases.filter(x=>!x[1]&&x[0]!=='').map(x=>x[0])){
 const issues=application.preflight(task,question);
 assert(issues.length>0,'irrelevant context cannot survive precharge: '+question);
}
for(const q of ['현재 일을 유지할지 대출을 상환할지 고민입니다.',
 '저축할지 코인에 투자할지 고민입니다.']){
 assert(application.preflight(task,q).includes(
  'buyer-context-not-current-work-versus-skill-decision'),
  'unsupported work/skill labels cannot be attached to this customer question');
}
// Exercise DOM state, not just token matching. On change of the actual
// buyer question previously entered personal descriptions must be erased.
const listeners={};
const question={value:'',addEventListener:(name,fn)=>{listeners[name]=fn}};
const wrap={hidden:true,classList:{hidden:true,toggle(name,state){if(name==='hidden')this.hidden=state}}};
const currentWork={value:'',disabled:true};
const targetSkill={value:'',disabled:true};
const nodes={readerDecision:question,workSkillContext:wrap,currentWork,targetSkill};
const document={getElementById:id=>nodes[id]};
assert.equal(scope.bindForm(document),true);
assert.equal(wrap.hidden,true);
assert.equal(currentWork.disabled,true);
question.value=good;listeners.input();
assert.equal(wrap.hidden,false);
assert.equal(wrap.classList.hidden,false);
assert.equal(currentWork.disabled,false);
assert.equal(targetSkill.disabled,false);
currentWork.value=details.currentWork;
targetSkill.value=details.targetSkill;
question.value='저축할지 대출을 갚을지 고민입니다.';
listeners.input();
assert.equal(wrap.hidden,true);
assert.equal(currentWork.disabled,true);
assert.equal(targetSkill.disabled,true);
assert.equal(currentWork.value,'');
assert.equal(targetSkill.value,'');
question.value=reversed;listeners.input();
assert.equal(wrap.hidden,false);
assert.equal(currentWork.value,'');
assert.equal(targetSkill.value,'');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const browser=fs.readFileSync(path.join(__dirname,'live-report-ui.js'),'utf8');
assert(html.includes('id="workSkillContext" class="hidden" hidden'));
const sequence=[
 'report-buyer-work-skill-scope.js','report-buyer-decision-context.js',
 'report-work-skill-decision-workbook.js','report-work-skill-decision-comparison.js',
 'report-work-skill-decision-workbook-ui.js',
 'live-report-ui.js'
];
const positions=sequence.map(src=>html.indexOf('<script src="'+src+'"></script>'));
assert(positions.every(x=>x>=0)&&positions.every((x,i)=>i===0||x>positions[i-1]),
 'existing work/skill scope must load before shared workbook logic, live report after');
assert(html.includes('REPORT_BUYER_WORK_SKILL_SCOPE?.supportsDecision(val(\'readerDecision\'))'));
assert(html.includes("inputError('targetSkill','현재 하는 일과 새로 배우려는 기술은 둘 다 적거나 둘 다 비워 주세요.')"));
assert(html.includes("inputError('currentWork','현재 하는 일과 새로 배우려는 기술은 둘 다 적거나 둘 다 비워 주세요.')"));
assert(browser.includes('REPORT_BUYER_WORK_SKILL_SCOPE?.supportsDecision(value(\'readerDecision\'))'));
console.log('PASS work/skill optional context appears only for real buyer work-versus-learning dilemma and is erased on unrelated questions; backend precharge agrees; provider/merchant calls=0');
