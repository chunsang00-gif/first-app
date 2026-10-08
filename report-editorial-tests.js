'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const quality=require('./report-quality-node'),outline=require('./report-outline');
const fixture=()=>({sections:quality.IDS.map((id,i)=>({id,title:'제목'+i,keyJudgment:'판정'+i,evidence:['계산한 사주 항목의 설명입니다.'],body:['문단'+i]})),finalJudgment:{body:['마지막 설명'],closingQuestion:'어떻게 생각하십니까?',afterClosingText:''}});
for(const phrase of require('./report-editorial').awkwardPhrases){const r=fixture();r.sections[0].body=[phrase];assert(quality.validate(r).errors.includes('unnatural Korean: '+phrase));}
const repeated=fixture();repeated.sections[0].body=Array.from({length:4},(_,i)=>'사주에서는 서로 다른 설명 '+i);assert(quality.validate(repeated).errors.some(e=>e.includes('repeated interpretation boilerplate')));
const natural=fixture();natural.sections[0].body=['충분히 알아본 뒤 시작하려다 실행이 늦어집니다.'];assert(!quality.validate(natural).errors.some(e=>/unnatural Korean|interpretation boilerplate|abstract headline/.test(e)));
// Exercise the actual pipeline without an API key, network, or calculation dependency.
const sandbox={module:{exports:{}},require:n=>n==='./report-facts-node'?{build:()=>({status:'ready',person:{mbti:'ISFP'}})}:require(n)};
vm.runInNewContext(fs.readFileSync(require.resolve('./report-server-contract'),'utf8'),sandbox);
(async()=>{
 let calls=0;const seen=[];
 await sandbox.module.exports.generate({mbti:'ISFP'},async p=>{
  calls++;seen.push(p.stage);
  assert(p.rules.plainSentenceRule);assert(!p.rules.tone.includes('사주에서는 ~로 읽습니다로 구분'));
  if(p.stage==='synthesis'){assert.equal(p.completedReport.sections.reduce((n,s)=>n+s.body.length,0),71);return {cover:null,finalJudgment:{body:['마지막 설명'],closingQuestion:'무엇입니까?',afterClosingText:''}};}
  assert(p.rules.mbtiDepthRule);assert.equal(p.priorSections.length,(calls-1)*2);
  if(calls>1)assert(p.priorSections.every(s=>s.topicConclusions.length===s.bodyLabels.length));
  return {sections:p.requestedSections.map(id=>({id,title:'제목',keyJudgment:'핵심',evidence:['계산한 사주 항목의 설명입니다.'],bodyTopics:Object.keys(outline.topics[id]),bodyLabels:Object.values(outline.topics[id]),body:Object.keys(outline.topics[id]).map((_,i)=>'첫 번째 결론 '+i+'. 이어지는 설명입니다.')}))};
 });
 assert.equal(calls,7);assert.equal(seen.filter(s=>s==='body').length,6);assert.equal(seen[6],'synthesis');
 console.log('PASS editorial phrases, repetitive templates, natural phrasing, active body/summary rules, topic memory, 71 topics and seven calls; no paid API');
})().catch(e=>{console.error(e);process.exitCode=1});
