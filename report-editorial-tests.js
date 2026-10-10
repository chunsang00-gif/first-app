'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const quality=require('./report-quality-node'),outline=require('./report-outline');
const fixture=()=>({sections:quality.IDS.map((id,i)=>({id,title:'제목'+i,keyJudgment:'판정'+i,evidence:['계산한 사주 항목의 설명입니다.'],body:['문단'+i]})),finalJudgment:{body:['마지막 설명'],closingQuestion:'꼼꼼하게 확인하느라 결정을 늦출 때는, 오늘 확인할 내용을 먼저 정하는 것이 도움이 됩니다.',afterClosingText:''}});
for(const phrase of require('./report-editorial').awkwardPhrases){const r=fixture();r.sections[0].body=[phrase];assert(quality.validate(r).errors.includes('unnatural Korean: '+phrase));}
const injectors=[
 (r,t)=>r.sections[0].title=t,(r,t)=>r.sections[0].keyJudgment=t,
 (r,t)=>r.sections[0].bodyLabels=[t],(r,t)=>r.sections[0].evidence=[t],
 (r,t)=>r.cover={headline:t},(r,t)=>r.cover={description:t},
 (r,t)=>r.cover={keywords:[t]},(r,t)=>r.cover={highlights:[{title:t,description:t}]},
 (r,t)=>r.finalJudgment.headline=t,(r,t)=>r.finalJudgment.body=[t],
 (r,t)=>r.finalJudgment.strengths=[t],(r,t)=>r.finalJudgment.watchouts=[t],
 (r,t)=>r.finalJudgment.routines=[{trigger:t,action:t,reason:t}],
 (r,t)=>r.finalJudgment.closingQuestion=t
];
for(const set of injectors){const r=fixture();set(r,'핵심  성향');if(r.cover)r.cover={headline:'제목',description:'설명',keywords:['하나','둘','셋'],...r.cover};assert(quality.validate(r).errors.includes('unnatural Korean: 핵심 성향'));}
const editorial=require('./report-editorial');
assert(editorial.wordingErrors(['우선할\n방향']).length);
assert(editorial.wordingErrors(['핵심\u200B성향']).length);
assert.deepEqual(editorial.wordingErrors(['정인(배움과 보호를 뜻하는 십성)을 함께 살펴봅니다.','부탁을 거절하지 못해 자신의 일을 끝내지 못합니다.']),[]);
const repeated=fixture();repeated.sections[0].body=Array.from({length:4},(_,i)=>'사주에서는 서로 다른 설명 '+i);assert(quality.validate(repeated).errors.some(e=>e.includes('repeated interpretation boilerplate')));
const natural=fixture();natural.sections[0].body=['충분히 알아본 뒤 시작하려다 실행이 늦어집니다.'];assert(!quality.validate(natural).errors.some(e=>/unnatural Korean|interpretation boilerplate|abstract headline/.test(e)));
for(const ending of ['어떤 선택을 하시겠습니까?','이제 어떻게 할까요','무엇이 중요합니까？']){const r=fixture();r.finalJudgment.closingQuestion=ending;assert(quality.validate(r).errors.includes('final conclusion must not ask a question'));}
assert(!quality.validate(fixture()).errors.some(e=>e.includes('conclusion')));
const client={window:{addEventListener(){},CHARACTER_ASSETS:{badge(){return ""},hero(){return ""},detail(){return ""}}},document:{body:{classList:{add(){}}},getElementById(){return null}},requestAnimationFrame(){},console};
vm.runInNewContext(fs.readFileSync(require.resolve('./report-validator'),'utf8'),client);
assert(!client.window.REPORT_VALIDATOR.validate(fixture()).errors.some(e=>e.includes('conclusion')));
vm.runInNewContext(fs.readFileSync(require.resolve('./report-renderer'),'utf8'),client);
const target={innerHTML:'',closest(){return {classList:{add(){}}}},querySelectorAll(){return []},querySelector(){return null}};
client.window.REPORT_RENDERER.render({...fixture(),meta:{}},target);
assert(target.innerHTML.includes('종합 총평'));assert(target.innerHTML.includes('가장 중요한 결론'));
assert(target.innerHTML.indexOf('가장 중요한 결론')<target.innerHTML.indexOf(fixture().finalJudgment.closingQuestion));
// Exercise the actual pipeline without an API key, network, or calculation dependency.
const sandbox={module:{exports:{}},require:n=>n==='./report-facts-node'?{build:()=>({status:'ready',person:{mbti:'ISFP'}})}:require(n)};
vm.runInNewContext(fs.readFileSync(require.resolve('./report-server-contract'),'utf8'),sandbox);
(async()=>{
 let calls=0;const seen=[];
 await sandbox.module.exports.generate({mbti:'ISFP'},async p=>{
  calls++;seen.push(p.stage);
  assert(p.rules.plainSentenceRule);assert(p.rules.concreteReviewRule);assert(p.rules.candidRule.includes('단점은 예쁜 말로 바꾸지 않는다'));assert(p.rules.weaknessActionRule.includes('바꿀 행동'));assert(p.rules.avoidPhrases.includes('핵심 성향'));assert(!p.rules.tone.includes('사주에서는 ~로 읽습니다로 구분'));
  if(p.stage==='synthesis'){assert(p.rules.finalRule.includes('격언·감동 문구·질문 없이'));assert(p.rules.finalRule.includes('앞 장의 요약이나 덕담을 나열하지 않는다'));assert.equal(p.completedReport.sections.reduce((n,s)=>n+s.body.length,0),71);return {cover:null,finalJudgment:{body:['마지막 설명'],closingQuestion:'꼼꼼하게 확인하느라 결정을 늦출 때는, 오늘 확인할 내용을 먼저 정하는 것이 도움이 됩니다.',afterClosingText:''}};}
  assert(p.rules.mbtiDepthRule);assert.equal(p.priorSections.length,(calls-1)*2);
  if(calls>1)assert(p.priorSections.every(s=>s.topicConclusions.length===s.bodyLabels.length));
  return {sections:p.requestedSections.map(id=>({id,title:'제목',keyJudgment:'핵심',evidence:['계산한 사주 항목의 설명입니다.'],bodyTopics:Object.keys(outline.topics[id]),bodyLabels:Object.values(outline.topics[id]),body:Object.keys(outline.topics[id]).map((_,i)=>'첫 번째 결론 '+i+'. 이어지는 설명입니다.')}))};
 });
 assert.equal(calls,7);assert.equal(seen.filter(s=>s==='body').length,6);assert.equal(seen[6],'synthesis');
 console.log('PASS editorial phrases, repetitive templates, natural phrasing, active body/summary rules, topic memory, 71 topics and seven calls; no paid API');
})().catch(e=>{console.error(e);process.exitCode=1});
