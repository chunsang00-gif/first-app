'use strict';
// Test the actual provider-bound topic payload and strict JSON text slots;
// no provider calls, sales unlock, or invented customer behavior.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const guidance=require('./report-analysis-guidance');
const generator=require('./report-generation-request');
const wire=require('./report-wire');
const schema=require('./report-schema.json');
const sourceLedger=require('./report-source-ledger');
const cases=[
 ['lunar','1982-11-24','14:20'],
 ['solar','1994-07-15','14:20'],
 ['solar','1994-01-15','14:20'],
 ['solar','1994-05-15','20:20']
];
let verified=0,unavailable=0,distinct=0;
const IDS=['money','career','relationship','stress'];
for(const [calendar,birthDate,birthTime] of cases){
 const packet=facts.build({calendar,birthDate,birthTime,
  gender:'male',mbti:'ISFP',leapMonth:false},2027);
 assert.equal(packet.status,'ready');
 const plan=guidance.preflight(packet);
 const prompt={facts:packet,stage:'body',requestedSections:IDS,
  includeFinal:false,includeCover:false,
  analysisGuidance:{...guidance.forRequest(IDS,packet.person.mbti),
   editorialBlueprint:plan},
  rules:{sectionGoals:require('./report-prompt').sectionGoals},
  priorSections:[]};
 const actual=generator.compile(prompt);
 const full=wire.schemaFor(prompt,schema);
 const providerSchema=generator.schema(prompt,full);
 assert.equal(actual.stage,'body');
 for(const chapterId of IDS){
  for(const [topicId,topic] of Object.entries(actual.task.chapters[chapterId].topics)){
   const brief=topic.readerDistinction;
   if(topic.mode==='state-limits'){
    assert.equal(brief,null);
    unavailable++;
    continue;
   }
   assert(brief,chapterId+':'+topicId);
   assert.equal(brief.observedCustomerBehavior,false);
   assert.equal(brief.realWorldOutcomeEstablished,false);
   assert.equal(brief.independentCategoriesPresent,brief.sourceGroups.length>=2);
   assert.deepEqual(brief.sourceRefs,topic.citableFacts.map(x=>x.id));
   assert(brief.sourceRefs.every(x=>Object.hasOwn(actual.source,x)));
   assert(brief.readerQuestion&&brief.hypotheticalContrast);
   assert(brief.differentFromOtherTopics.length>12);
   const slot=providerSchema.properties.chapters.properties[chapterId]
    .properties.paragraphs.properties[topicId];
   const part=slot.anyOf?.find(x=>x.type==='object')||slot;
   assert(part.properties.text.description.includes(brief.readerQuestion),
    'actual strict output schema must carry the unique reader question');
   assert(part.properties.text.description.includes(brief.hypotheticalContrast));
   assert(!part.properties.text.description.includes('실제 고객의 행동이 확인되었다'));
   verified++;
  }
 }
 const money=actual.task.chapters.money.topics;
 if(money.earning.readerDistinction&&money.spending.readerDistinction){
  assert.notEqual(money.earning.readerDistinction.readerQuestion,
   money.spending.readerDistinction.readerQuestion);
  assert.notEqual(money.earning.readerDistinction.hypotheticalContrast,
   money.spending.readerDistinction.hypotheticalContrast);
  distinct++;
 }
 // Only a REAL preceding citation, never merely available source, marks reuse.
 const eligible=Object.values(actual.task.chapters)
  .flatMap(x=>Object.values(x.topics)).find(t=>t.readerDistinction&&
   t.citableFacts?.some(row=>row.id.startsWith('natal.')));
 assert(eligible);
 const known=eligible.citableFacts.find(row=>row.id.startsWith('natal.'));
 const cited={id:'saju_core',bodyTopics:['strength'],
  topicConclusions:['이미 다른 장에서 사용된 계산 위치의 뜻을 검토했습니다.'],
  evidence:['strength: '+known.id+' (전통 분류) / 해석: 실제 계산값 / 조건: 가정 / 한계: 관찰 사실 아님']};
 assert.deepEqual(sourceLedger.usedPaths(cited,'strength'),[known.id]);
 const firstId=Object.entries(actual.task.chapters).find(([,chapter])=>
  Object.values(chapter.topics).some(t=>t.citableFacts?.some(x=>x.id===known.id)))?.[0];
 assert(firstId);
 const next={...prompt,requestedSections:[firstId],priorSections:[cited]};
 const nextTask=generator.compile(next).task.chapters[firstId];
 const overlapped=Object.values(nextTask.topics).find(t=>
  t.readerDistinction?.sourceRefs.includes(known.id));
 assert(overlapped);
 assert(overlapped.readerDistinction.previouslyCitedRefs.includes(known.id),
  'an actual previously cited exact natal source must change the next reader brief');
 const neverCited={...cited,evidence:['선행 장의 일반적인 한국어 설명']};
 const noProvenance=generator.compile({...next,priorSections:[neverCited]})
  .task.chapters[firstId];
 assert(Object.values(noProvenance.topics).every(t=>
  !t.readerDistinction?.previouslyCitedRefs.includes(known.id)));
}
console.log('PASS paid-domain reader contrasts: '+verified+
 ' actual source-backed topic text slots, '+unavailable+
 ' disabled, '+distinct+' distinct money-lens cases, verified previous citation only; 0 paid model calls');
