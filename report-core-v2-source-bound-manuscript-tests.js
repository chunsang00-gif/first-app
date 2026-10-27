'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const bridge=require('./report-paid-core-depth-v2');
const {capture}=require('./report-core-paid-full-prompt-capture');
const writer=require('./report-generation-request');
const decoder=require('./report-response-decoder');
const planner=require('./report-core-v2-source-bound-manuscript');
const thesis=require('./report-core-thesis');
const one={calendar:'solar',birthDate:'1994-07-15',birthTime:'14:20',gender:'male',mbti:'ISFP'};
const perms=['PAID_CORE_DEPTH_V2','PAID_CORE_V2_SOURCE_BOUND_READER','NODE_ENV','RENDER'];
const old=Object.fromEntries(perms.map(k=>[k,process.env[k]]));
function restore(){for(const [key,val] of Object.entries(old)){
 if(val===undefined)delete process.env[key];else process.env[key]=val;
}}
function response(prompt){
 const fixed=thesis.forPrompt(prompt);
 const hidden='natal.month.hidden.'+
   prompt.facts.facts.structuralEvidence.monthCommand.mainHiddenStem;
 return {chapters:{saju_core:{title:fixed.title,
  keyJudgment:fixed.keyJudgment,mood:'reflective',paragraphs:{
  temperament:null,
  strength:{
   label:'태어난 달에서 보는 두 기준',
   text:'태어난 달의 겉글자와 대표 속글자를 함께 읽을 때 무엇을 먼저 살피고 어떤 기준을 놓치지 말아야 할지 전통적 관점에서 구분할 수 있습니다. 실제 개인의 성격이나 경험을 관찰한 자료는 아닙니다.',
   basis:{refs:['natal.month.stem',hidden],
    interpretation:'출생월의 실제 두 위치에 관한 서로 다른 전통 분류입니다.',
    condition:'같은 선택에서 서로 다른 기준을 살피는 상황입니다.',
    limit:'실제 행동과 기질을 직접 확인한 것은 아닙니다.'}
  }}
 }},cover:null,finalJudgment:null};
}
async function run(){
 try{
 process.env.NODE_ENV='test';delete process.env.RENDER;
 process.env.PAID_CORE_DEPTH_V2='offline-preview';
 delete process.env.PAID_CORE_V2_SOURCE_BOUND_READER;
 let checked=0;
 const qa=await capture(one);
 assert.equal(qa.providerCalls,0);
 const saved=response(qa.prompt),frozen=JSON.stringify(saved);
 assert.equal(bridge.build(qa.prompt.facts).readerContrast?.otherRole,'정재');
 const before=decoder.decode(saved,qa.prompt);
 assert.deepEqual(before.sections[0].bodyTopics,['strength']);
 assert.equal(JSON.stringify(saved),frozen);
 process.env.PAID_CORE_V2_SOURCE_BOUND_READER='offline-preview';
 const after=decoder.decode(saved,qa.prompt);
 assert.deepEqual(after.sections[0].bodyTopics,['temperament','strength']);
 assert(after.sections[0].body[0].length>350);
 assert.equal(after.sections[0].body[1],before.sections[0].body[0]);
 assert.equal(JSON.stringify(saved),frozen,'AI model result is never overwritten');
 const a=planner.build(qa.prompt,saved);
 assert(a&&!a.approvedForSale);
 assert(a.proposal.text.includes('여섯 달')===false);
 assert(a.context.sourcePosition==='natal.hour.stem');
 assert(a.proposal.basis.refs.includes(a.context.exactHiddenSource));
 checked++;
 // Cross-chart: pick one other verified candidate from the already-used
 // regression grid and test the EXACT production-shaped writer+decoder.
 const eligible=[];
 for(const yr of [1982,2006,2018])for(let m=1;m<=12;m++){
  const date=yr+'-'+String(m).padStart(2,'0')+'-15';
  for(const hour of ['14:20','20:20']){
   const x={calendar:'solar',birthDate:date,birthTime:hour,
    gender:'male',mbti:'ISFP'};
   const candidate=bridge.build(facts.build(x,2027)).readerContrast;
   if(candidate&&candidate.otherRole!=='정재')
    eligible.push({input:x,novel:candidate});
  }
 }
 assert(eligible.length>0,'need a second, differing chart-specific condition');
 const other=eligible[0];
 const z=await capture(other.input);
 assert.equal(z.providerCalls,0);
 const second=response(z.prompt);
 const s2=decoder.decode(second,z.prompt);
 const proposed=planner.build(z.prompt,second);
 assert(proposed);
 assert.equal(s2.sections[0].bodyTopics[0],'temperament');
 assert.notEqual(s2.sections[0].body[0],after.sections[0].body[0]);
 assert(s2.sections[0].body[0].includes(other.novel.visiblePosition==='natal.year.stem'?
    '태어난 해':'태어난 시간'));
 assert(s2.sections[0].body[0].includes('가정'));
 assert(s2.sections[0].body[0].length>=350);
 checked++;
 const shifted=await capture({...one,birthTime:'20:20'});
 assert.equal(shifted.providerCalls,0);
 const missing=response(shifted.prompt);
 assert(!bridge.build(shifted.prompt.facts).readerContrast||
    bridge.build(shifted.prompt.facts).readerContrast.extraHiddenId!==
     bridge.build(qa.prompt.facts).readerContrast.extraHiddenId);
 const noFabrication=decoder.decode(missing,shifted.prompt);
 const shiftProposal=planner.build(shifted.prompt,missing);
 assert.equal(noFabrication.sections[0].bodyTopics.includes('temperament'),!!shiftProposal);
 if(shiftProposal)
  assert.notEqual(shiftProposal.proposal.text,a.proposal.text);
 checked++;
 // Explicit flags and deployment boundaries remain fail-closed.
 process.env.NODE_ENV='production';
 assert.deepEqual(decoder.decode(saved,qa.prompt).sections[0].bodyTopics,['strength']);
 process.env.NODE_ENV='test';process.env.RENDER='true';
 assert.deepEqual(decoder.decode(saved,qa.prompt).sections[0].bodyTopics,['strength']);
 delete process.env.RENDER;
 process.env.PAID_CORE_V2_SOURCE_BOUND_READER='disabled';
 assert.deepEqual(decoder.decode(saved,qa.prompt).sections[0].bodyTopics,['strength']);
 assert.equal(JSON.stringify(saved),frozen);
 console.log('CORE_V2_SOURCE_BOUND_READER_ON_REAL_DECODER='+JSON.stringify({
  actualDecoderUsed:true,distinctInputCases:checked,
  qualifiedDepthShownTwice:true,changedHourCannotReuseOldProse:true,
  AIOriginalUntouched:true,explicitOfflineOptInOnly:true,
  productionAndRenderDisabled:true,liveProviderCalls:0,
  editorialValueUnapproved:true,releaseVerdict:'not-approved'
 }));
 }finally{restore()}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
