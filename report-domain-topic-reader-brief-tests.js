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
let verified=0,unavailable=0,distinct=0,substantiveTheses=0;
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
    assert.equal(brief??null,null);
    unavailable++;
    continue;
   }
   assert(brief,chapterId+':'+topicId);
   assert.equal(brief.observedCustomerBehavior,false);
   assert.equal(brief.realWorldOutcomeEstablished,false);
   assert.equal(brief.independentCategoriesPresent,brief.sourceGroups.length>=2);
   assert.equal(brief.sourceCategoryBoundScene,true);
   assert(brief.illustratedSourceGroups.length>=1);
   assert(brief.illustratedSourceGroups.every(g=>brief.sourceGroups.includes(g)));
   assert(brief.hypotheticalContrast.includes('실제로 확인된'));
   if(!brief.sourceGroups.includes('식상')&&chapterId==='money'&&topicId==='earning')
    assert(!brief.hypotheticalContrast.includes('직접 제작'),
     'wealth-only calculation must not smuggle in the absent output symbol');
   if(!brief.sourceGroups.includes('재성')&&chapterId==='money'&&topicId==='earning')
    assert(!brief.hypotheticalContrast.includes('물품 거래'),
     'output-only calculation must not import a wealth explanation');
   assert.deepEqual(brief.sourceRefs,topic.citableFacts.map(x=>x.id));
   assert(brief.sourceRefs.every(x=>Object.hasOwn(actual.source,x)));
   assert(brief.exactRoleLens);
   assert.equal(brief.exactRoleLens.illustratedGroupRolesAligned,true);
   assert(brief.exactRoleLens.sourceRoles.every(role=>
    brief.illustratedSourceGroups.includes(role.group)));
   if(brief.illustratedSourceGroups.length===2&&
      brief.illustratedSourceGroups.every(group=>topic.citableFacts.some(row=>
       row.id.startsWith('natal.')&&row.traditionalMeaning&&
       (row.tenGod==='정재'||row.tenGod==='편재'?'재성':
        row.tenGod==='식신'||row.tenGod==='상관'?'식상':
        row.tenGod==='정관'||row.tenGod==='편관'?'관성':
        row.tenGod==='정인'||row.tenGod==='편인'?'인성':
        row.tenGod==='비견'||row.tenGod==='겁재'?'비겁':null)===group))){
    assert.deepEqual(brief.exactRoleLens.contrastedGroups,
     brief.illustratedSourceGroups,
     'a mixed-source example must cite an actual role from BOTH described categories');
   }
   const citedCategory=require('./report-domain-topic-reader-brief').citedRoleCoverage;
   const categories=topic.citableFacts.filter(row=>row.tenGod).map(row=>row.id);
   assert(categories.some(ref=>citedCategory(brief,[ref],actual.source).pass),
    'some truly available source must substantiate the displayed domain category');
   assert.equal(citedCategory(brief,['person.mbti'],actual.source).pass,false,
    'a broad MBTI input cannot substitute for a cited role in domain interpretation');
   assert.equal(citedCategory(brief,[],actual.source).pass,false,
    'an empty citation list must not produce a grounded premium topic');
   assert.equal(brief.exactRoleLens.independentLifeProof,false);
   assert.equal(brief.exactRoleLens.priorityAssessed,false);
   assert(brief.exactRoleLens.sourceRoles.length<=2);
   for(const role of brief.exactRoleLens.sourceRoles){
    const exact=topic.citableFacts.find(x=>x.id===role.sourceId);
    assert(exact,'role must be a citation-eligible source');
    assert.equal(exact.tenGod,role.tenGod);
    assert.equal(exact.traditionalMeaning,role.traditionalMeaning);
    assert.equal(exact.position,role.sourcePosition);
    assert.equal(exact.layer,role.sourceLayer);
    assert.equal(exact.stem,role.observedStem);
    assert.equal(role.observedLifeExperience,false);
    assert.equal(role.traditionalPrioritySelected,false);
   }
   assert(brief.readerQuestion&&brief.hypotheticalContrast);
   assert(brief.differentFromOtherTopics.length>12);
   const slot=providerSchema.properties.chapters.properties[chapterId]
    .properties.paragraphs.properties[topicId];
   const part=slot.anyOf?.find(x=>x.type==='object')||slot;
   assert(part.properties.text.description.includes(brief.readerQuestion),
    'actual strict output schema must carry the unique reader question');
   assert(part.properties.text.description.includes(brief.hypotheticalContrast));
   // The real paid provider text slot, not a discarded top-level brief,
   // must receive a distinct, chart-owned traditional interpretation when
   // TWO eligible subtypes or categories exist. No fabricated secondary role.
   const thesis=topic.sourceOwnedInterpretiveThesis;
   if(thesis){
    substantiveTheses++;
    assert.equal(thesis.kind,'paid-source-owned-interpretive-thesis-v1');
    assert.equal(thesis.topic,chapterId+'.'+topicId);
    assert.equal(thesis.claimedRealWorldOutcome,false);
    assert.equal(thesis.traditionalPriorityAssessed,false);
    assert.equal(thesis.sourceRoles.length,2);
    for(const role of thesis.sourceRoles){
     const original=topic.citableFacts.find(row=>row.id===role.ref);
     assert(original,'both thesis roles must be in this actual paid topic');
     assert.equal(role.stem,original.stem);
     assert.equal(role.tenGod,original.tenGod);
     assert.equal(role.traditionalMeaning,original.traditionalMeaning);
    }
    assert(part.properties.text.description.includes(thesis.question),
     'strict provider JSON must require the calculated topic-specific question');
    assert(part.properties.text.description.includes(thesis.explanation),
     'actual paid writer must see a substantive contrast, not just technical names');
    if(thesis.exactStemBridge){
     const link=thesis.exactStemBridge;
     assert.deepEqual(link.refs.map(id=>topic.citableFacts.some(row=>row.id===id)),
      [true,true],'a matching stem cannot borrow a non-citable source');
     assert.equal(actual.source[link.refs[0]].stem,actual.source[link.refs[1]].stem);
     assert(part.properties.text.description.includes('별도 실제 관계'),
      'verified original hidden-to-visible link must reach the paid writer');
    }
   }
   const packagedProse=brief.hypotheticalContrast+' '+part.properties.text.description;
   assert(!/(?:가상의 물품 거래에서|가상의 주문에서|가상의 업무에서|가상의 구매에서|가상의 모둠 활동에서|가상의 친밀한 관계에서|장비 인수인계|직접 제작할 결과물)/.test(packagedProse),
    'actual paid-provider topic must not receive recycled stock scenes');
   assert(part.properties.text.description.includes('고정 예시나 고객의 실제 생활 이력은 제공되지 않았다'),
    'provider text must prioritize calculated meaning over unverified fictional biography');
   const internal=part.properties.basis.properties.interpretation.description;
   const visible=part.properties.text.description;
   assert(internal.includes(brief.exactRoleLens.internalWritingContrast),
    'actual strict JSON internal basis must carry exact source positions and role meanings');
   const crossCategory=brief.contrastMode==='two-verified-categories'&&
    brief.exactRoleLens.contrastedGroups.length===2;
   const withinCategory=brief.contrastMode==='single-grounded-category'&&
    brief.exactRoleLens.sameTraditionalGroupDifferentRoles;
   if(crossCategory){
    assert(visible.includes('서로 다른 두 출처가 실제로 답할 수 있는 질문을 구별한다'),
     'only two verified categories may request a source-to-source contrast');
   }else if(withinCategory){
    assert(visible.includes('같은 분류 안의 두 세부 의미'),
     'two independently verified subroles can be compared within their category');
   }else{
    assert(visible.includes('억지 대비·조건 A/B·양면성을 만들어내지 않는다'),
     'single verified source must not mandate a fabricated second personality');
    assert(!visible.includes('실제 출생 근거로 설명 가능한 두 조건의 차이를'),
     'old universal A/B paid text instruction must not return');
   }
   assert(visible.includes('출처 ID·전문 분류 이름·검증 절차'),
    'technical ledger must remain separated from public reader prose');
   assert(!visible.includes(brief.exactRoleLens.internalWritingContrast),
    'customer text instruction must not dump internal technical source ledger');
   for(const role of brief.exactRoleLens.sourceRoles){
    assert(internal.includes(role.sourceId));
    assert(!visible.includes(role.sourceId),
     'customer text prompt must not contain exact source reference IDs');
   }
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

// Controlled "prior/general promise" vs CURRENT real-source scenario:
// these synthetic inputs are category facts, NOT fabricated people.
const editor=require('./report-domain-topic-reader-brief');
const row=(id,position,tenGod)=>({id,position,tenGod});
// Same synthetic natal chart previously had an offline research reading
// for month hidden 丁 and the visible birth-hour 丁. That EXACT relation
// must now inform the REAL money earning provider paragraph when citable,
// not remain trapped in an offline sample or free-preview component.
const thisChart=facts.build({calendar:'solar',birthDate:'1994-07-15',
 birthTime:'14:20',gender:'male',mbti:'ISFP'},2027);
const thisPlan=guidance.preflight(thisChart);
const moneyPrompt={facts:thisChart,stage:'body',requestedSections:['money'],
 analysisGuidance:{...guidance.forRequest(['money'],thisChart.person.mbti),
  editorialBlueprint:thisPlan},
 rules:{sectionGoals:require('./report-prompt').sectionGoals},priorSections:[]};
const earning=generator.compile(moneyPrompt).task.chapters.money.topics.earning;
assert.equal(earning.sourceOwnedInterpretiveThesis?.topic,'money.earning',
 'the real paid money chapter must have the verified output-to-wealth thesis');
const exactLink=earning.sourceOwnedInterpretiveThesis.exactStemBridge;
assert.deepEqual(exactLink?.refs,['natal.month.hidden.丁','natal.hour.stem'],
 'actual paid earning paragraph should distinguish same month-hidden/hour-visible 丁');
const paidMoneySlot=generator.schema(moneyPrompt,wire.schemaFor(moneyPrompt,schema))
 .properties.chapters.properties.money.properties.paragraphs.properties.earning;
assert(paidMoneySlot.properties.text.description.includes('별도 실제 관계'));
const spendingThesis=generator.compile(moneyPrompt)
 .task.chapters.money.topics.spending.sourceOwnedInterpretiveThesis;
if(spendingThesis){
 assert.deepEqual(spendingThesis.sourceRoles.map(x=>x.tenGod),['정재','편재'],
  'a spending contrast is separate only when both wealth subtypes really exist');
 assert(spendingThesis.question.includes('꾸준히 관리하는 자원'),
  'spending interpretation must answer a different paid reader question');
}
const changedChart=facts.build({calendar:'solar',birthDate:'1994-07-15',
 birthTime:'20:20',gender:'male',mbti:'ISFP'},2027);
const changedPrompt={...moneyPrompt,facts:changedChart,analysisGuidance:{
 ...guidance.forRequest(['money'],changedChart.person.mbti),
 editorialBlueprint:guidance.preflight(changedChart)}};
const changedEarning=generator.compile(changedPrompt).task.chapters.money.topics.earning;
assert(!changedEarning.sourceOwnedInterpretiveThesis?.exactStemBridge,
 'an altered birth hour must not inherit the old same-stem linkage');
assert(substantiveTheses>0,'at least one real domain task must have a source-owned substantive thesis');

// A full category pair is not the only genuine two-source traditional
// contrast. These different-subtype pairs reach the ACTUAL paid text schema
// through sourceOwnedInterpretiveThesis; never invent a missing second role.
const paidBridge=require('./report-paid-interpretive-bridge');
function paidRole(position,stem,tenGod){
 const id='natal.'+position+'.stem';
 return {id,position:position==='year'?'연간':position==='month'?'월간':'시간',
  layer:'천간',stem,tenGod,traditionalMeaning:'실제 계산 사전의 '+tenGod+' 뜻'};
}
for(const [chapterId,topicId,first,second,expected] of [
 ['career','workstyle','식신','상관','차근차근'],
 ['career','teamwork','비견','겁재','서로의 몫'],
 ['career','teamwork','정관','편관','예상치 못한 요구']
]){
 const pair=[paidRole('year','甲',first),paidRole('month','乙',second)];
 const thesis=paidBridge.build({chapterId,topicId,
  topic:{mode:'use-primary',citableFacts:pair}});
 assert(thesis,chapterId+'.'+topicId+' must retain its genuine two-subtype contrast');
 assert.equal(thesis.sourceRoles.length,2);
 assert.deepEqual(thesis.sourceRoles.map(x=>x.tenGod),[first,second]);
 assert(thesis.question.includes(expected),thesis.question);
 assert.equal(thesis.claimedRealWorldOutcome,false);
 assert.equal(thesis.traditionalPriorityAssessed,false);
 const missing=paidBridge.build({chapterId,topicId,
  topic:{mode:'use-primary',citableFacts:[pair[0]]}});
 assert.equal(missing,null,'one source alone must not produce two-role prose');
 assert.equal(paidBridge.build({chapterId,topicId,
  topic:{mode:'state-limits',citableFacts:pair}}),null);
}
// In the REAL paid relationship chapter, distinct roles are read only
// from the day branch, not a convenient matching year/month/hour symbol.
function dayHidden(stem,tenGod){
 return {id:'natal.day.hidden.'+stem,position:'일지',layer:'지장간',
  stem,tenGod,traditionalMeaning:tenGod+'의 검증용 전통적 의미'};
}
const dayPair=[dayHidden('甲','비견'),dayHidden('丁','정관')];
const intimacy=paidBridge.build({chapterId:'relationship',topicId:'closeness',
 topic:{mode:'use-primary',citableFacts:dayPair}});
assert(intimacy,'independent day-branch roles must support a distinct intimacy question');
assert.equal(intimacy.topic,'relationship.closeness');
assert.deepEqual(intimacy.sourceRoles.map(x=>x.ref),
 ['natal.day.hidden.甲','natal.day.hidden.丁']);
assert(intimacy.question.includes('약속·책임'));
assert.equal(intimacy.claimedRealWorldOutcome,false);
assert.equal(intimacy.traditionalPriorityAssessed,false);
assert.equal(paidBridge.build({chapterId:'relationship',topicId:'closeness',
 topic:{mode:'use-primary',citableFacts:[dayPair[0]]}}),null,
 'one day-branch role is not a two-role relationship story');
assert.equal(paidBridge.build({chapterId:'relationship',topicId:'closeness',
 topic:{mode:'use-primary',citableFacts:[
 dayPair[0],paidRole('year','丁','정관')]}}),null,
 'a different natal position cannot be borrowed to fabricate a day-branch contrast');
assert.equal(paidBridge.build({chapterId:'relationship',topicId:'closeness',
 topic:{mode:'state-limits',citableFacts:dayPair}}),null);
// This also has to flow through the actual writer JSON text field;
// an offline research-only explanation is not paid manuscript content.
let paidDayReadings=0;
for(const [calendar,date,time] of cases){
 const packet=facts.build({calendar,birthDate:date,birthTime:time,
  gender:'male',mbti:'ISFP',leapMonth:false},2027);
 const ids=['relationship'];
 const prompt={facts:packet,stage:'body',requestedSections:ids,
  analysisGuidance:{...guidance.forRequest(ids,packet.person.mbti),
   editorialBlueprint:guidance.preflight(packet)},
  rules:{sectionGoals:require('./report-prompt').sectionGoals},priorSections:[]};
 const actual=generator.compile(prompt);
 const topic=actual.task.chapters.relationship.topics.closeness;
 const reading=topic.sourceOwnedInterpretiveThesis;
 if(!reading)continue;
 paidDayReadings++;
 assert(reading.sourceRoles.every(x=>x.ref.startsWith('natal.day.hidden.')));
 assert.equal(new Set(reading.sourceRoles.map(x=>x.tenGod)).size,2,
  'independent day-branch subtypes, not a repeated label');
 const slot=generator.schema(prompt,wire.schemaFor(prompt,schema))
  .properties.chapters.properties.relationship.properties.paragraphs.properties.closeness;
 const body=slot.anyOf?.find(x=>x.type==='object')||slot;
 assert(body.properties.text.description.includes(reading.question),
  'the actual paid relationship paragraph must explain the chart-owned difference');
 assert(reading.sourceRoles.every(x=>body.properties.basis.properties.refs.items.enum.includes(x.ref)));
}
assert(paidDayReadings>=2,
 'at least two real verified natal charts should receive distinct day-branch relationship readings');
// Relationship.expression already had the exact 식신/상관 contrast.
// Do not add an alternative with identical source roles and another label.
const existingExpression=paidBridge.build({chapterId:'relationship',
 topicId:'expression',topic:{mode:'use-primary',citableFacts:[
  paidRole('year','甲','식신'),paidRole('month','乙','상관')]}});
assert(existingExpression);
assert(existingExpression.question.includes('자신의 뜻을 표현하는 질문'));
// A broader primary category comparison wins when both source groups exist;
// otherwise the new same-group question would erase a stronger distinction.
const primary=paidBridge.build({chapterId:'career',topicId:'teamwork',
 topic:{mode:'use-primary',citableFacts:[
  paidRole('year','甲','비견'),paidRole('month','乙','겁재'),
  paidRole('hour','丙','정관')]}});
assert.equal(primary.sourceRoles[0].tenGod,'비견');
assert.equal(primary.sourceRoles[1].tenGod,'정관');
const wealthOnly=editor.build({chapterId:'money',topicId:'earning',
 topic:{mode:'use-primary',citableFacts:[
  row('natal.month.stem','월간','정재')]}});
const outputOnly=editor.build({chapterId:'money',topicId:'earning',
 topic:{mode:'use-primary',citableFacts:[
  row('natal.hour.stem','시간','식신')]}});
const mixed=editor.build({chapterId:'money',topicId:'earning',
 topic:{mode:'use-primary',citableFacts:[
  row('natal.month.stem','월간','정재'),
  row('natal.hour.stem','시간','식신')]}});
assert.deepEqual(wealthOnly.illustratedSourceGroups,['재성']);
assert.deepEqual(outputOnly.illustratedSourceGroups,['식상']);
assert.deepEqual(mixed.illustratedSourceGroups,['재성','식상']);
assert.equal(wealthOnly.contrastMode,'single-grounded-category');
assert.equal(outputOnly.contrastMode,'single-grounded-category');
assert.equal(mixed.contrastMode,'two-verified-categories');
assert(!wealthOnly.hypotheticalContrast.includes('조건 A:'));
assert(!wealthOnly.hypotheticalContrast.includes('조건 B:'));
assert(!outputOnly.hypotheticalContrast.includes('조건 A:'));
assert(mixed.hypotheticalContrast.includes('별도로 확인된'),
 'different verified source categories may be discussed without mandatory stock scenes');

assert(!wealthOnly.hypotheticalContrast.includes('직접 제작'),
 'baseline stock wording must no longer invent an uncited output category');
assert(!outputOnly.hypotheticalContrast.includes('물품 거래'),
 'baseline stock wording must no longer invent an uncited wealth category');
assert(!/(?:물품 거래|직접 제작|가상의 주문|장비 인수인계|납품)/.test(mixed.hypotheticalContrast),
 'two source groups must still avoid a canned scenario that is the same for everyone');
const learningOnly=editor.build({chapterId:'career',topicId:'workstyle',
 topic:{mode:'use-primary',citableFacts:[
  row('natal.year.stem','연간','정인')]}});
assert.deepEqual(learningOnly.illustratedSourceGroups,['인성']);
assert(!learningOnly.hypotheticalContrast.includes('조건 B:'));

assert(!learningOnly.hypotheticalContrast.includes('결과물을 만들고'),
 'learning-only workstyle must not imply a missing output category');
assert.equal(editor.build({chapterId:'career',topicId:'change',
 topic:{mode:'state-limits',citableFacts:[]}}),null);
const noClassification=editor.build({chapterId:'money',topicId:'earning',
 topic:{mode:'use-primary',citableFacts:[
  {id:'person.mbti',position:'입력 선호'}]}});
assert.equal(noClassification.sourceCategoryBoundScene,false);
assert.equal(editor.citedRoleCoverage(noClassification,['person.mbti'],
 {'person.mbti':{type:'ISFP'}}).required,false);
assert.equal(editor.citedRoleCoverage(noClassification,['person.mbti'],
 {'person.mbti':{type:'ISFP'}}).pass,true);
assert.equal(noClassification.contrastMode,'no-grounded-category');
assert.deepEqual(noClassification.illustratedSourceGroups,[]);
assert(!noClassification.hypotheticalContrast.includes('거래'));
assert(wealthOnly.hypotheticalContrast.includes('가상'));

// Difference WITHIN the same source group is not evidence for two people:
// 정재 and 편재 have distinct verified traditional meanings. Keep both
// source IDs, positions, layers, and meanings without asserting behavior.
const words=require('./report-facts-node').build({
 calendar:'solar',birthDate:'1994-04-15',birthTime:'14:20',
 gender:'male',mbti:'ISFP'},2027).facts.tenGodGlossary;
const exactRow=(id,position,layer,stem,tenGod)=>({
 id,position,layer,stem,tenGod,traditionalMeaning:words[tenGod]});
const sameGroup=editor.build({chapterId:'money',topicId:'spending',
 topic:{mode:'use-primary',citableFacts:[
  exactRow('natal.month.stem','월간','천간','己','정재'),
  exactRow('natal.hour.hidden.戊','시지','지장간','戊','편재')]}});
assert.equal(editor.citedRoleCoverage(sameGroup,
 ['natal.year.stem'],{'natal.year.stem':{tenGod:'식신'}}).pass,false,
 'a real cited source from the wrong category cannot back a wealth paragraph');
assert.equal(editor.citedRoleCoverage(sameGroup,
 ['natal.month.stem'],{'natal.month.stem':{tenGod:'정재'}}).pass,true);
assert.equal(sameGroup.exactRoleLens.hasTwoDifferentRoles,true);
assert.equal(sameGroup.exactRoleLens.sameTraditionalGroupDifferentRoles,true);
assert.deepEqual(sameGroup.exactRoleLens.sourceRoles.map(r=>r.tenGod),['정재','편재']);
assert(sameGroup.exactRoleLens.internalWritingContrast.includes(words['정재']));
assert(sameGroup.exactRoleLens.internalWritingContrast.includes(words['편재']));
assert(sameGroup.exactRoleLens.internalWritingContrast.includes('natal.month.stem'));
assert(sameGroup.exactRoleLens.internalWritingContrast.includes('natal.hour.hidden.戊'));
const exactOne=editor.build({chapterId:'money',topicId:'spending',
 topic:{mode:'use-primary',citableFacts:[
  exactRow('natal.month.stem','월간','천간','己','정재'),
  exactRow('natal.year.hidden.己','연지','지장간','己','정재')]}});

// Regression: when the first two source rows are both wealth symbols,
// the second DISTINCT source category (output) must NOT be lost.
const mixedThree=editor.build({chapterId:'money',topicId:'earning',
 topic:{mode:'use-primary',citableFacts:[
  exactRow('natal.year.stem','연간','천간','己','정재'),
  exactRow('natal.month.hidden.戊','월지','지장간','戊','편재'),
  exactRow('natal.hour.stem','시간','천간','丁','식신')]}});
assert.deepEqual(mixedThree.illustratedSourceGroups,['재성','식상']);
assert.deepEqual(mixedThree.exactRoleLens.sourceRoles.map(r=>r.sourceId),
 ['natal.year.stem','natal.hour.stem']);
assert.deepEqual(mixedThree.exactRoleLens.contrastedGroups,['재성','식상']);
assert.equal(mixedThree.exactRoleLens.sameTraditionalGroupDifferentRoles,false);
assert(mixedThree.exactRoleLens.internalWritingContrast.includes(words['식신']));
assert(!mixedThree.exactRoleLens.internalWritingContrast.includes(words['편재']),
 'third source is not a selected independent role and must not be falsely treated as the contrasted example');
// If a second category is present but lacks a canonical traditional meaning,
// do not fill the missing role with another unrelated classification.
const missingGlossary=structuredClone(mixedThree);
const noMeaning=editor.build({chapterId:'money',topicId:'earning',
 topic:{mode:'use-primary',citableFacts:[
  exactRow('natal.year.stem','연간','천간','己','정재'),
  {id:'natal.hour.stem',position:'시간',layer:'천간',stem:'丁',tenGod:'식신'}]}});
assert.deepEqual(noMeaning.exactRoleLens.contrastedGroups,['재성']);
assert(noMeaning.exactRoleLens.sourceRoles.every(x=>x.observedLifeExperience===false));
assert.equal(noMeaning.exactRoleLens.priorityAssessed,false);

assert.equal(exactOne.exactRoleLens.sourceRoles.length,1);
assert.equal(exactOne.exactRoleLens.hasTwoDifferentRoles,false);
assert(!exactOne.exactRoleLens.internalWritingContrast.includes('편재'));
assert.equal(noClassification.exactRoleLens.sourceRoles.length,0);
assert.equal(sameGroup.exactRoleLens.sourceRoles.every(x=>x.observedLifeExperience===false),true);
console.log('PASS exact-role contrast: 정재 and 편재 remain distinct when really cited; absent classification and same-role duplicates do not fabricate another role');

assert(wealthOnly.observedCustomerBehavior===false);
console.log('PASS actual cited-role scenes: wealth only, output only, both, learning only, and unsupported category abstention');
// A previous eight-sample reading audit rejected an adult workplace
// example for a 2018-born child. Test the REAL provider task and schema,
 // not just an isolated helper or a pretend reader manuscript.
const minor=facts.build({calendar:'solar',birthDate:'2018-07-15',
 birthTime:'14:20',gender:'male',mbti:'ISFP'},2027);
const adult=facts.build({calendar:'solar',birthDate:'2006-08-15',
 birthTime:'14:20',gender:'male',mbti:'ISFP'},2027);
assert.equal(editor.readerAgeBand(minor),'minor');
assert.equal(editor.readerAgeBand(adult),'adult');
assert.equal(editor.readerAgeBand(facts.build({calendar:'solar',
 birthDate:'2009-05-15',birthTime:'14:20',gender:'male',mbti:'ISFP'},2027)),
 'minor','birthday boundary must conservatively use youth examples');
assert.equal(editor.readerAgeBand({targetYear:{year:2027},
 calculationInput:{birthDate:'not-a-date'}}),'unknown');
const minorPlan=guidance.preflight(minor);
const minorPrompt={facts:minor,stage:'body',requestedSections:IDS,
 includeFinal:false,includeCover:false,
 analysisGuidance:{...guidance.forRequest(IDS,minor.person.mbti),
  editorialBlueprint:minorPlan},
 rules:{sectionGoals:require('./report-prompt').sectionGoals},
 priorSections:[]};
const minorProvider=generator.compile(minorPrompt);
const minorSchema=generator.schema(minorPrompt,wire.schemaFor(minorPrompt,schema));
let checkedChildren=0;
for(const chapterId of IDS){
 for(const [topicId,topic] of Object.entries(minorProvider.task.chapters[chapterId].topics)){
  const brief=topic.readerDistinction;
  if(!brief)continue;
  checkedChildren++;
  assert.equal(brief.readerAgeWritingBand,'minor');
  assert(!/(?:직장|납품|매출|채용|승진|계약직|연애 상대|결혼 상대)/.test(brief.hypotheticalContrast),
   'minor examples must not assume adult careers, earnings or dating');
  assert(!/(?:승진할|취업할|연봉이|결혼할)/.test(brief.readerQuestion));
  const slot=minorSchema.properties.chapters.properties[chapterId]
   .properties.paragraphs.properties[topicId];
  const part=slot.anyOf?.find(x=>x.type==='object')||slot;
  assert(part.properties.text.description.includes(brief.hypotheticalContrast));
  assert(part.properties.text.description.includes(brief.readerQuestion));
 }
}
assert(checkedChildren>=5,'minor context must actually reach multiple domain topics');
console.log('PASS youth context: '+checkedChildren+
 ' real provider-bound topic briefs contain no assumed adult workplace or marriage story; frozen natal QA unchanged');

console.log('PASS paid-domain reader contrasts: '+verified+
 ' actual source-backed topic text slots, '+unavailable+
 ' disabled, '+distinct+' distinct money-lens cases, verified previous citation only; 0 paid model calls');
