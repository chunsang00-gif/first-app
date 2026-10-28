'use strict';
const assert=require('node:assert/strict');
const {capture}=require('./report-core-paid-full-prompt-capture');
const facts=require('./report-facts-node');
const writer=require('./report-generation-request');
const decoder=require('./report-response-decoder');
const editorial=require('./report-paid-core-v2-editorial-triage');
const thesis=require('./report-core-thesis');
const specimen=require('./report-qa3-multichart-source-owned-editorial');
const cases=[
 ['1982-08-15','14:20'],['1994-01-15','14:20'],
 ['1994-04-15','14:20'],['1994-05-15','20:20'],
 ['1994-07-15','14:20'],['1994-06-15','14:20'],
 ['2006-08-15','14:20'],['2018-07-15','14:20']
];
(async()=>{
 const keys=['NODE_ENV','PAID_CORE_DEPTH_V2','RENDER'];
 const before=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 try{
  process.env.NODE_ENV='test';process.env.PAID_CORE_DEPTH_V2='offline-preview';
  delete process.env.RENDER;
  let accepted=0;const outcomes=[],texts=new Set(),scenes=new Set();
  let exact=0,alternative=0;
  for(const [birthDate,birthTime] of cases){
   const input={calendar:'solar',birthDate,birthTime,gender:'male',mbti:'ISFP'};
   const {prompt,providerCalls}=await capture(input);
   assert.equal(providerCalls,0);
   const plan=writer.compile(prompt);
   const core=plan.task.chapters.saju_core;
   const c=specimen.build(prompt);
   assert(c,'eligible chart must have independently calculated contract');
   assert.equal(c.approvedForCustomer,false);
   assert.equal(c.releaseVerdict,'not-approved');
   assert.deepEqual(c.candidate.basis.refs,c.citedServerRefs);
   assert(c.candidate.text.includes(core.topics.temperament
    .serverOwnedWritingContract.outline.example));
   if(c.contractKind==='server-owned-first-chapter-evidence-and-claim-contract-v1')
    exact++;
   else alternative++;
   const thumb=thesis.forPrompt(prompt);
   const monthStem=prompt.facts.facts.structuralEvidence.monthCommand.mainHiddenStem;
   const mainId='natal.month.hidden.'+monthStem;
   const report={chapters:{saju_core:{
    title:thumb.title,keyJudgment:thumb.keyJudgment,mood:'reflective',
    paragraphs:{
     strength:{label:'태어난 달의 두 전통 분류',
      text:'태어난 달의 겉글자와 대표 속글자는 서로 다른 의미를 가집니다. '+
       '그 뜻만으로 한 사람의 실제 능력이나 앞으로 벌어질 사건을 판단하지 않습니다.',
      basis:{refs:['natal.month.stem',mainId,
       'facts.seasonalEvidence','facts.qiEvidence'],
       interpretation:'달의 두 계산 위치와 계절의 상징을 분리합니다.',
       condition:'기본 출생월의 뜻만 비교합니다.',
       limit:'개인의 실제 행동을 관찰하지 않았습니다.'}},
     temperament:structuredClone(c.candidate)
    }
   }},cover:null,finalJudgment:null};
   const frozen=JSON.stringify(report);
   let decoded,problems,decodeError=null;
   try{decoded=decoder.decode(report,prompt)}
   catch(e){decodeError=String(e.message||e)}
   problems=editorial.inspect(c.candidate,report.chapters.saju_core.paragraphs.strength.text,
     core.topics.temperament.paidCoreDepthV2).findings;
   assert.equal(JSON.stringify(report),frozen,'never change input response');
   const ok=!!decoded?.sections?.[0]?.bodyTopics?.includes('temperament');
   outcomes.push({caseId:birthDate+'_'+birthTime,scene:c.sceneId,
    contract:c.contractKind,pass:ok,
    decoderError:decodeError,issues:problems});
   if(ok)accepted++;
   if(!ok||problems.length)
    throw Error('MULTICHART_QA_REJECTED:'+JSON.stringify(outcomes.at(-1)));
   assert(!texts.has(c.candidate.text),'different charts cannot share whole prose');
   texts.add(c.candidate.text);scenes.add(c.sceneId);
  }
  assert.equal(accepted,8);
  assert(exact>=4&&alternative>=2);
  assert(scenes.size>=6);
  // No independently verified source: abstain without inventing filler.
  let noSource=null;
  for(let month=1;month<=12&&!noSource;month++){
   const input={calendar:'solar',birthDate:'1982-'+String(month).padStart(2,'0')+'-15',
    birthTime:'20:20',gender:'male',mbti:'ISFP'};
   const {prompt}=await capture(input);
   if(!writer.compile(prompt).task.chapters.saju_core.topics.temperament
      .serverOwnedWritingContract)noSource=prompt;
  }
  assert(noSource,'need a verified ineligible chart');
  assert.equal(specimen.build(noSource),null);
  process.env.NODE_ENV='production';
  assert.throws(()=>specimen.build(noSource),/OFFLINE_ONLY/);
  process.env.NODE_ENV='test';process.env.RENDER='true';
  assert.throws(()=>specimen.build(noSource),/OFFLINE_ONLY/);
  console.log('QA3_MULTICHART_OFFLINE_SOURCE_OWNED='+JSON.stringify({
   cases:accepted,exact,alternative,uniqueScenes:scenes.size,
   actualFirstChapterDecoder:true,editorialFindings:0,
   unsupportedAbstention:true,productionDisabled:true,
   modelCalls:0,humanQualityApproved:false,releaseVerdict:'not-approved',
   outcomes:outcomes.map(x=>({caseId:x.caseId,scene:x.scene}))
  }));
 }finally{
  for(const [k,v] of Object.entries(before))
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
