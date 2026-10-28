'use strict';
// OFFLINE: compare WHAT THE READER WOULD READ from independently calculated
// first-chapter source contracts. These are deterministic EDITORIAL SPECIMENS,
// NOT OpenAI-written results, not customer-facing launch content.
// A mere switch of birth date or role label cannot pass this comparison.
const assert=require('node:assert/strict');
const {capture}=require('./report-core-paid-full-prompt-capture');
const writer=require('./report-generation-request');
const policy=require('./report-reader-policy');
const cases=[
 ['1982-08-15','14:20'],
 ['1994-01-15','14:20'],
 ['1994-04-15','14:20'],
 ['1994-05-15','20:20'],
 ['1994-07-15','14:20'],
 ['1994-06-15','14:20'],
 ['2006-08-15','14:20'],
 ['2018-07-15','14:20']
];
const readerFriendly=s=>String(s).replaceAll('오행','기운').replaceAll('실제 성격·직업 능력·성과','현실의 성격과 능력 또는 결과');
function render(contract){
 const o=contract.outline;
 const exact=contract.kind==='server-owned-first-chapter-evidence-and-claim-contract-v1';
 const place=contract.sourcePosition==='natal.year.stem'?'태어난 해':'태어난 시간';
 const premise=exact?
  '이 출생 기록에서 '+o.comparedRoles+'을 구별하는 이유는 '+place+
  '의 겉글자가 태어난 달의 다른 속글자와 정확히 일치하기 때문입니다. ':
  '이번 출생 정보에서 '+o.comparedRoles+'은 서로 다른 위치에 있습니다. '+
  '태어난 달의 대표 속글자와 '+place+
  '의 겉글자는 별도 분류이며 달의 다른 숨은 글자가 '+place+
  '에 정확히 드러났다는 뜻은 아닙니다. ';
 const intro=premise;
 const body='예를 들어 '+o.example+'을 생각해 보겠습니다. '+
  '먼저 한쪽 조건만 준비한 경우에는 '+o.originalOnly+'. '+
  '반대로 다른 조건만 준비한 경우에는 '+o.additionalOnly+'.';
 const conclusion='두 글자의 기운 관계를 계산하면 '+readerFriendly(o.direction)+
  '입니다. 다만 '+readerFriendly(o.limitation)+'.';
 return [intro,body,conclusion].join('\n\n');
}
const sentences=x=>String(x).split(/[.!?。！？\n]+/).map(s=>s.trim())
 .filter(s=>s.length>=28);
async function run(){
 const saved={node:process.env.NODE_ENV,v2:process.env.PAID_CORE_DEPTH_V2,
  render:process.env.RENDER};
 try{
  process.env.NODE_ENV='test';
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  delete process.env.RENDER;
  const texts=[],scenes=new Set(),kinds=new Set(),observed=[];
  for(const [date,time] of cases){
   const input={calendar:'solar',birthDate:date,birthTime:time,
    gender:'male',mbti:'ISFP'};
   const c=await capture(input);
   assert.equal(c.providerCalls,0);
   const payload=writer.compile(c.prompt);
   const topic=payload.task.chapters.saju_core.topics.temperament;
   const contract=topic.serverOwnedWritingContract;
   assert(contract,'chosen chart must support a server-owned reader comparison');
   const expected=(contract.kind==='server-owned-first-chapter-separate-visible-contract-v1'?
    require('./report-paid-core-v2-separate-visible-contract'):
    require('./report-paid-core-v2-server-contract')).build(payload.source,topic);
   assert.deepEqual(contract,expected);
   assert(contract.evidenceRefs.every(id=>Object.hasOwn(payload.source,id)));
   assert.equal(contract.humanEditorialApproval,false);
   const text=render(contract);
   assert(text.length>=350);
   assert.deepEqual(policy.errors([text]),[]);
   assert(text.includes(contract.outline.example));
   assert(text.includes(contract.outline.originalOnly));
   assert(text.includes(contract.outline.additionalOnly));
   assert(text.includes(readerFriendly(contract.outline.direction)));
   assert(/예를 들어/.test(text)&&/반대로/.test(text));
   assert(contract.outline.originalOnly!==contract.outline.additionalOnly);
   const exact=contract.kind==='server-owned-first-chapter-evidence-and-claim-contract-v1';
   if(exact){
    assert(text.includes('정확히 일치'));
    assert.equal(contract.verifiedSourceIds.length,5);
   }else{
    assert(text.includes('드러났다는 뜻은 아닙니다'));
    assert.equal(contract.verifiedSourceIds.length,4);
    assert(!text.includes('겉글자는 태어난 달의 다른 속글자와 정확히 일치'));
   }
   const sceneId=contract.sceneId||topic.sourceQualifiedWritingDecision.readerScene?.sceneId;
   assert(sceneId);
   scenes.add(sceneId);kinds.add(contract.kind);
   texts.push({text,sceneId,date,time,kind:contract.kind,
    role:topic.paidCoreDepthV2.readerContrast?.mainRole+'/' +
      topic.paidCoreDepthV2.readerContrast?.otherRole||
      topic.paidCoreDepthV2.readerAlternative?.mainRole+'/'+
      topic.paidCoreDepthV2.readerAlternative?.otherRole});
   observed.push({sceneId,kind:exact?'exact-exposure':'separate-visible',
    chars:text.length,sourceCount:contract.evidenceRefs.length,
    caseId:date+'_'+time});
  }
  assert.equal(texts.length,cases.length);
  assert.equal(texts.length,new Set(texts.map(x=>x.text)).size);
  assert(scenes.size>=6,'different chart categories must not collapse to one generic scene');
  assert.equal(kinds.size,2,'both exact exposure and separate source forms must appear');
  const reusedSpecific=[];
  const genericSentenceFrequency=new Map();
  for(let i=0;i<texts.length;i++)for(let j=i+1;j<texts.length;j++){
   if(texts[i].sceneId===texts[j].sceneId)continue;
   const l=sentences(texts[i].text),r=new Set(sentences(texts[j].text));
   const repeated=l.filter(x=>r.has(x));
   for(const x of repeated){
    genericSentenceFrequency.set(x,(genericSentenceFrequency.get(x)||0)+1);
    if(/(?:예를 들어|준비|담당|예산|분류|속글자|태어난 해|태어난 시간)/.test(x))
     reusedSpecific.push({left:i,right:j,text:x});
   }
  }
  // Mechanically different names are NOT enough: full scenario-bearing
  // sentences need to be distinct across independent role categories.
  assert.deepEqual(reusedSpecific,[],
   'source-specific explanation was copied verbatim between unrelated natal scenes');
  const stamp={
   kind:'offline-first-chapter-human-readable-editorial-comparison-v1',
   charts:observed.length,uniqueScenes:scenes.size,contractKinds:[...kinds].sort(),
   sceneSpecificSentenceReuse:reusedSpecific.length,
   sharedStockSentences:[...genericSentenceFrequency].length,
   result:'editorial-specimens-only-not-live-ai-report',
   futureRequirement:'compare actual billable model output after separate consent',
   sampleStats:observed,
   newPaidCalls:0,productionDeployed:false,humanQualityApproved:false
  };
  console.log('CORE_V2_READER_CROSS_CHART_COMPARISON='+JSON.stringify(stamp));
 }finally{
  for(const [k,v] of [['NODE_ENV',saved.node],['PAID_CORE_DEPTH_V2',saved.v2],
   ['RENDER',saved.render]])
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
}
run().catch(e=>{console.error(e);process.exitCode=1});
