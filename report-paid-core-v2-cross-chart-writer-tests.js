'use strict';
// Regression of ACTUAL first-chapter source bridge across distinct calendars
// and hours. Never pays, dispatches, or asserts that a symbolic comparison is
// a proven trait or a saleable manuscript.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const bridge=require('./report-paid-core-depth-v2');
const writer=require('./report-generation-request');
const manuscript=require('./report-core-v2-source-bound-manuscript');
const direction=require('./report-core-paid-natal-visible-relation-bridge').direction;
const {capture}=require('./report-core-paid-full-prompt-capture');
const cases=[];
for(const year of [1982,1994,2006,2018]){
 for(let month=1;month<=12;month++){
  for(const birthTime of ['14:20','20:20']){
   cases.push({calendar:'solar',birthDate:year+'-'+
    String(month).padStart(2,'0')+'-15',birthTime,
    gender:'male',mbti:'ISFP'});
  }
 }
}
async function run(){
 let qualified=0,unqualified=0,hour=0,year=0;
 const readerHeadings=new Set(),readerScenes=new Set(),
  readerContexts=new Set(),readerSamples=[];
 const examples=new Set(),hourDrift=new Map(),
  directionalHeadings=new Set(),directions=new Set(),decisionQuestions=new Set();
 for(const fixture of cases){
  const packet=facts.build(fixture,2027);
  assert.equal(packet.status,'ready');
  const x=bridge.build(packet);
  assert.equal(x.approvedAsPremiumValue,false);
  assert.equal(x.customerQualityValidated,false);
  assert.equal(x.selectedTraditionalPriority,false);
  assert.equal(x.observedPersonality,false);
  const c=x.readerContrast;
  const id=fixture.birthDate;
  if(!hourDrift.has(id))hourDrift.set(id,[]);
  hourDrift.get(id).push({hour:fixture.birthTime,
   contrast:c?JSON.stringify([c.extraHiddenId,c.visiblePosition]):null});
  if(!c){unqualified++;continue}
  qualified++;examples.add(id+' '+fixture.birthTime);
  assert.equal(c.kind,'verified-other-month-hidden-visible-role-conditional-reading-v1');
  assert.equal(c.prioritizationVerified,false);
  assert.equal(c.realizedInfluenceVerified,false);
  assert.equal(c.approvedForSale,false);
  assert(c.otherRole!==c.mainRole);
  assert(['natal.year.stem','natal.hour.stem'].includes(c.visiblePosition));
  if(c.visiblePosition==='natal.year.stem')year++;else hour++;
  assert(x.sourceRefs.includes(c.mainMonthId));
  assert(x.sourceRefs.includes(c.extraHiddenId));
  assert(x.sourceRefs.includes(c.visiblePosition));
  assert(x.exposures.some(a=>a.hiddenRef===c.extraHiddenId&&
   a.visibleRef===c.visiblePosition&&a.exactMatchOnly));
  const stem=c.extraHiddenId.slice('natal.month.hidden.'.length);
  assert.equal(packet.chart[c.visiblePosition.split('.')[1]][0],stem);
  assert(c.comparisonQuestion.includes('태어난 달'));
  assert(c.conditionIfMissingMain!==c.conditionIfMissingNew);
  const monthMain=packet.facts.structuralEvidence.monthCommand.mainHiddenStem;
  const exposed=c.extraHiddenId.slice('natal.month.hidden.'.length);
  const independentlyComputed=direction(monthMain,exposed);
  assert.equal(c.monthMainToExposedElementDirection,independentlyComputed);
  assert.equal(c.visiblePositionRelationVerified,true);
  assert.equal(c.realizedDirectionEffectVerified,false);
  const scopedPrompt={paidCoreDepthV2:true,stage:'body',
   requestedSections:['saju_core'],facts:packet};
  const unchangedSource={chapters:{saju_core:{paragraphs:{
   temperament:null,strength:{text:'태어난 달의 중심 기준과 확인할 역할을 살펴봅니다.'}
  }}}};
  const prose=manuscript.build(scopedPrompt,unchangedSource);
  assert(prose&&prose.origin==='deterministic-editorial-template-not-model-output');
  assert.equal(prose.approvedForSale,false);
  assert(prose.proposal.text.length>=350);
  assert(prose.proposal.text.includes('예를 들어'));
  assert(prose.proposal.text.includes('반대로'));
  assert(!prose.proposal.text.includes('태어난 해·날·시간은 각각 다른 계산 위치'));
  assert(c.sourceRefs.every(ref=>prose.proposal.basis.refs.includes(ref)));
  assert(prose.proposal.basis.refs.includes('facts.seasonalEvidence'));
  assert(prose.proposal.basis.refs.includes('facts.qiEvidence'));
  assert(!prose.proposal.basis.refs.includes('natal.day.stem'));
  const unrelated=c.visiblePosition==='natal.hour.stem'?
   'natal.year.stem':'natal.hour.stem';
  assert(!prose.proposal.basis.refs.includes(unrelated),
   'unrelated extra pillar must not be cited to pad prose');
  assert.equal(prose.context.chartSpecific,true);
  assert.equal(prose.context.symbolicDirection,independentlyComputed);
  assert(prose.context.decisionQuestion.length>14);
  assert(prose.proposal.text.includes(prose.context.decisionQuestion),
   'the computed direction must change the READER conclusion, not metadata');
  assert(prose.proposal.text.includes('방향으로 계산')||
   prose.proposal.text.includes('같은 성질의 기운'));
  assert(!prose.proposal.text.includes('당신은 반드시'));
  directionalHeadings.add(independentlyComputed+'|'+prose.proposal.label);
  decisionQuestions.add(prose.context.decisionQuestion);
  directions.add(independentlyComputed);
  readerHeadings.add(prose.proposal.label);
  readerScenes.add(c.otherRole);
  readerContexts.add(c.mainRole+'|'+c.otherRole+'|'+c.visiblePosition);
  if(readerSamples.length<2&&!readerSamples.some(x=>x.role===c.otherRole))
   readerSamples.push({role:c.otherRole,visible:c.visiblePosition,
    title:prose.proposal.label,example:prose.proposal.text.slice(0,145)});

 }
 assert(qualified>2,'Source-general bridge should not be a one-chart template');
 assert(unqualified>2,'Unqualified cases must remain optional, not fabricated');
 assert(readerHeadings.size>=2,'new first-chapter headings must differ by source roles');
 assert(readerScenes.size>=2,'different confirmed roles need different grounded scenes');
 assert(readerContexts.size>=2,'two distinct chart roles must not collapse');
 assert(readerSamples.length===2);
 assert(directions.size>=2,'more than one independent elemental reading must be exercised');
 assert(decisionQuestions.size>=2,'symbolic relationship must change the decision question');
 assert(directionalHeadings.size>=2);
 assert.equal(qualified+unqualified,cases.length);
 // Verify independently compiled real first-chapter provider task, not a
 // mock-only helper or merely a source enumeration.
 const original={
  calendar:'solar',birthDate:'1994-07-15',birthTime:'14:20',
  gender:'male',mbti:'ISFP'};
 const saved={flag:process.env.PAID_CORE_DEPTH_V2,
  node:process.env.NODE_ENV,render:process.env.RENDER};
 try{
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  process.env.NODE_ENV='test';delete process.env.RENDER;
  const a=await capture(original);
  const old=writer.compile(a.prompt);
  const appendix=old.task.chapters.saju_core.topics.temperament.paidCoreDepthV2;
  assert(appendix.readerContrast);
  assert.equal(appendix.readerContrast.otherRole,'정재');
  const exact=appendix.readerContrast.sourceRefs;
  assert(exact.includes('natal.month.hidden.丁'));
  assert(exact.every(x=>old.task.chapters.saju_core.topics.temperament
   .citableFacts.some(row=>row.id===x)));
  assert(!old.task.chapters.saju_core.topics.strength.citableFacts.some(
   x=>x.id==='natal.month.hidden.丁'));
  const shifted=await capture({...original,birthTime:'20:20'});
  const next=writer.compile(shifted.prompt);
  const changed=next.task.chapters.saju_core.topics.temperament.paidCoreDepthV2;
  assert(!changed.readerContrast||changed.readerContrast.extraHiddenId!=='natal.month.hidden.丁');
  assert.equal(a.providerCalls,0);assert.equal(shifted.providerCalls,0);
 }finally{
  for(const [k,v] of [['PAID_CORE_DEPTH_V2',saved.flag],
   ['NODE_ENV',saved.node],['RENDER',saved.render]]){
   if(v===undefined)delete process.env[k];else process.env[k]=v;
  }
 }
 console.log('CROSS_CHART_ACTUAL_FIRST_CHAPTER_CONTRAST='+JSON.stringify({
  charts:cases.length,eligibleWithDistinctExactSource:qualified,
  sourceBoundDraftsConstructed:qualified,distinctReaderHeadings:readerHeadings.size,
  distinctOtherRoleScenes:readerScenes.size,distinctRoleAndPositionContexts:readerContexts.size,
  distinctElementDirections:directions.size,distinctCausalQuestions:decisionQuestions.size,
  directionsObserved:[...directions].sort(),
  sampleIntroductions:readerSamples,
  unqualifiedNotInvented:unqualified,yearExposures:year,hourExposures:hour,
  actualWriterGroundingVerified:true,
  oldPaidRunnerApprovalReused:false,providerCalls:0,
  customerQualityApproved:false,releaseVerdict:'not-approved'
 }));
}
run().catch(e=>{console.error(e);process.exitCode=1;});
