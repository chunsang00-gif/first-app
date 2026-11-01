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
let verified=0,unavailable=0,distinct=0,substantiveTheses=0,singleTheses=0;
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
   if(chapterId==='relationship'&&topicId==='conflict'){
    // A branch-table relation is not a ten-god category and must never
    // inherit the glossary-based source-role scene requirement.
    assert.equal(brief??null,null);
    const reading=topic.sourceOwnedNatalDayClash;
    assert(reading,'day-specific conflict topic requires direct natal pair evidence');
    assert.equal(reading.actualConflictObserved,false);
    assert.equal(reading.actualRelationshipOutcomePredicted,false);
    assert(topic.citableFacts.some(x=>x.id===reading.sourceRef));
    const slot=providerSchema.properties.chapters.properties[chapterId]
     .properties.paragraphs.properties[topicId];
    const part=slot.anyOf?.find(x=>x.type==='object')||slot;
    assert(part.properties.text.description.includes(reading.independentQuestion),
     'day-pair reading must reach strict actual writer text instead of a generic reader brief');
    verified++;continue;
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
    assert(part.properties.text.description.includes('사전적 뜻을 각각 나열하는 답변은 불충분하다'),
     'real paid writer must request a domain-specific interpretation, not two symbol definitions');
    assert(thesis.sourceRoles.every(row=>
     part.properties.basis.properties.refs.description.includes(row.ref)),
     'strict provider must explicitly request both actual interpretation sources');
    if(thesis.exactStemBridge){
     const link=thesis.exactStemBridge;
     assert.deepEqual(link.refs.map(id=>topic.citableFacts.some(row=>row.id===id)),
      [true,true],'a matching stem cannot borrow a non-citable source');
     assert.equal(actual.source[link.refs[0]].stem,actual.source[link.refs[1]].stem);
     assert(part.properties.text.description.includes('세 번째 사실'),
      'verified original hidden-to-visible link must reach the paid writer');
    }
   }
   const single=topic.sourceOwnedSingleReading;
   if(single){
    singleTheses++;
    assert.equal(thesis,undefined,'one source cannot be sold as a two-source interpretation');
    assert.equal(single.kind,'paid-single-source-reader-thesis-v1');
    assert.equal(single.topic,chapterId+'.'+topicId);
    assert.equal(single.uniqueSubtypeCount,1);
    assert.equal(single.claimedRealWorldOutcome,false);
    assert.equal(single.traditionalPriorityAssessed,false);
    assert.equal(single.missingCounterpartInferred,false);
    const original=topic.citableFacts.find(row=>row.id===single.source.ref);
    assert(original,'single source must be a real permitted natal reference');
    assert.equal(single.source.tenGod,original.tenGod);
    assert.equal(single.source.traditionalMeaning,original.traditionalMeaning);
    assert.equal(actual.source[single.source.ref].stem,single.source.stem);
    assert(part.properties.text.description.includes(single.question));
    assert(part.properties.text.description.includes(single.explanation));
    assert(!part.properties.text.description.includes('출처 2:'));
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
 const editorial=require('./report-domain-topic-reader-brief');
 const actualPrior=editorial.priorComparisons(overlapped.readerDistinction,[cited]);
 assert.deepEqual(actualPrior.map(x=>x.sourceRef),[known.id],
  'reused conclusions must belong to an actual previously cited source');
 assert.equal(actualPrior[0].previousConclusion,cited.topicConclusions[0]);
 const overlapId=Object.entries(nextTask.topics).find(([,topic])=>
  topic===overlapped)?.[0];
 assert(overlapId);
 const schemaWithPrior=generator.schema(next,wire.schemaFor(next,schema));
 const rawTopic=schemaWithPrior.properties.chapters.properties[firstId]
  .properties.paragraphs.properties[overlapId];
 const actualLeaf=rawTopic.anyOf?.find(x=>x.type==='object')||rawTopic;
 assert(actualLeaf.properties.text.description.includes(
  JSON.stringify(cited.topicConclusions[0])),
  'the exact actual prior reading must reach this topic strict text field');
 assert(actualLeaf.properties.text.description.includes(overlapped.readerDistinction.readerQuestion));
 assert(actualLeaf.properties.text.description.includes('인용된 출력 데이터'),
  'prior paid model output must be treated as reference data, not fresh instructions');
 const unavailablePrior={...cited,topicConclusions:[]};
 assert.deepEqual(editorial.priorComparisons(overlapped.readerDistinction,[unavailablePrior]),[],
  'no prior customer sentence means no fabricated earlier interpretation');
 const neverCited={...cited,evidence:['선행 장의 일반적인 한국어 설명']};
 const noProvenance=generator.compile({...next,priorSections:[neverCited]})
  .task.chapters[firstId];
 assert(Object.values(noProvenance.topics).every(t=>
  !t.readerDistinction?.previouslyCitedRefs.includes(known.id)));
 assert.deepEqual(editorial.priorComparisons(overlapped.readerDistinction,[neverCited]),[],
  'an eligible source not actually cited must not become a prior paid conclusion');
 const absentSchema=generator.schema({...next,priorSections:[neverCited]},
  wire.schemaFor({...next,priorSections:[neverCited]},schema));
 const absentLeaf=absentSchema.properties.chapters.properties[firstId]
  .properties.paragraphs.properties[overlapId];
 const absentObject=absentLeaf.anyOf?.find(x=>x.type==='object')||absentLeaf;
 assert(!absentObject.properties.text.description.includes(
  JSON.stringify(cited.topicConclusions[0])),
  'uncited previous text must never leak into the next scoped writer prompt');
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
const relation=earning.sourceOwnedInterpretiveThesis.sourceElementRelation;
assert.deepEqual(relation.stems,['甲','丁'],
 'the 1994 verified earning example must use original year output and month/hour wealth stems');
assert.equal(relation.elementalDirection,'resource',
 'the actual chart year 甲 wood generates 丁 fire; this is not a wealth prediction');
assert.deepEqual(relation.refs,earning.sourceOwnedInterpretiveThesis.sourceRoles.map(x=>x.ref));
assert.equal(relation.realizedEffect,false);
const sourceTradeoff=earning.sourceOwnedInterpretiveThesis.sourceDecisionContrast;
assert.equal(sourceTradeoff.direction,'resource');
assert.equal(sourceTradeoff.directionalOwner,'first');
assert.deepEqual([sourceTradeoff.firstSourceRef,sourceTradeoff.secondSourceRef],relation.refs);
assert(sourceTradeoff.firstOnlyQuestion.includes('식신'));
assert(sourceTradeoff.secondOnlyQuestion.includes('정재'));
assert.equal(sourceTradeoff.observedCustomerChoice,false);
assert.equal(sourceTradeoff.realizedInfluence,false);
const sourceOnly=generator.compile(moneyPrompt);
assert(relation.refs.every(id=>sourceOnly.source[id]?.stem&&
 sourceOnly.source[id].stem==='甲'||sourceOnly.source[id]?.stem==='丁'));
const relationSchema=generator.schema(moneyPrompt,wire.schemaFor(moneyPrompt,schema))
 .properties.chapters.properties.money.properties.paragraphs.properties.earning
 .properties.text.description;
assert(relationSchema.includes('첫 번째 글자의 오행이 두 번째 글자의 오행을 생합니다'),
 'the real provider text field receives the computed original-stem relationship');
assert(relationSchema.includes('실제 성과·성격·수입이나 명리적 우선순위'),
 'a verified element direction cannot be sold as a personal prediction');
assert(relationSchema.includes('식신생재(食神生財) 관계 후보'),
 'the actual paid writer must receive a named classical interpretive relation');
assert(relationSchema.includes('두 출생 위치 사이의 다른 글자를 생략하거나 식신생재격 성립을 확정하지 말라'),
 'a non-adjacent source pair must not become an unverified fortune pattern');
assert(relationSchema.includes(sourceTradeoff.sourceSpecificQuestion));
assert(relationSchema.includes(sourceTradeoff.firstOnlyQuestion));
assert(relationSchema.includes(sourceTradeoff.secondOnlyQuestion));
assert(relationSchema.includes('가상의 선택 장면을 붙이는 것만으로 독립된 풀이가 되는 것은 아니다'),
 'actual paid output instruction must demand source-specific differences');
const foodWealth=earning.sourceOwnedInterpretiveThesis.classicalOutputWealthCandidate;
assert(foodWealth,'the verified output-to-wealth pair should carry a named classical question');
assert.equal(foodWealth.phrase,'식신생재(食神生財) 관계 후보');
assert.deepEqual(foodWealth.sourceRefs,relation.refs);
assert.deepEqual(foodWealth.betweenPillars,['month','day'],
 'year-to-hour output/wealth symbols must not be sold as a proven direct flow');
assert.equal(foodWealth.adjacentVisibleStems,false);
assert.equal(foodWealth.actualFlowEstablished,false);
assert.equal(foodWealth.monthPatternChosen,false);
assert.equal(foodWealth.dayMasterStrengthVerified,false);
assert.equal(foodWealth.financialOutcomeVerified,false);
const classical=earning.sourceOwnedInterpretiveThesis.classicalMonthQuestion;
assert(classical,'a verified mixed-month single exposed candidate must reach the real paid domain');
assert.equal(classical.monthBranch,'未');
assert.equal(classical.stem,'丁');
assert.equal(classical.isMainMonthHidden,false,
 'a secondary month-hidden wealth source is not the month main governing qi');
assert.equal(classical.numberOfDistinctVisibleCandidates,1);
assert.equal(classical.completeMonthTriadCount,0);
assert.equal(classical.chosenPattern,false);
assert.equal(classical.chosenUsefulGod,false);
assert.equal(classical.adoptedSchoolMethod,false);
assert.equal(classical.sourceUrl,'https://www.donglishuzhai.net/chapter/3729.html');
const exactLink=earning.sourceOwnedInterpretiveThesis.exactStemBridge;
assert.deepEqual(exactLink?.refs,['natal.month.hidden.丁','natal.hour.stem'],
 'actual paid earning paragraph should distinguish same month-hidden/hour-visible 丁');
const paidMoneySlot=generator.schema(moneyPrompt,wire.schemaFor(moneyPrompt,schema))
 .properties.chapters.properties.money.properties.paragraphs.properties.earning;
assert(paidMoneySlot.properties.text.description.includes('세 번째 사실'),
 'a real exposed third chart position must inform the paid text, not a glossary');
assert(paidMoneySlot.properties.text.description.includes('이 명식에서만 추가로 확인된 고전의 독립된 질문'),
 'the verified classical rule must change the paid writing question, not a QA-only sample');
assert(paidMoneySlot.properties.text.description.includes('달의 대표 숨은 글자가 아닌 별도 글자'),
 'the customer interpretation must distinguish exposed secondary stem from month main');
assert(paidMoneySlot.properties.text.description.includes('격국이나 우선순위가 확정되었다고 주장하지 않는다'),
 'a classical exposed candidate may never be promoted to an adopted pattern');
const moneyRequired=[...new Set([
 ...earning.sourceOwnedInterpretiveThesis.sourceRoles.map(x=>x.ref),
 ...earning.sourceOwnedInterpretiveThesis.exactStemBridge.refs
])];
assert.equal(moneyRequired.length,3,
 'this chart links a third true position to its two-category thesis');
assert(moneyRequired.every(ref=>paidMoneySlot.properties.basis.properties.refs.description.includes(ref)),
 'all three actual positions must reach the strict provider citation instructions');
 // Verify the real paid response -> citation restoration boundary, not just
 // the request text. An author cannot claim two distinct meanings while
 // omitting one of the referenced original calculated positions.
 const pair=earning.sourceOwnedInterpretiveThesis.sourceRoles.map(x=>x.ref);
 const moneyParagraph={label:'검증용 금전 풀이',text:'두 전통 분류가 서로 다른 질문에 답하는 가상의 상황입니다.',
  basis:{refs:moneyRequired.slice(),interpretation:'두 실제 계산 분류의 서로 다른 뜻',
   condition:'가상으로 결과를 만들고 대가를 비교하는 경우',
   limit:'실제 수입이나 개인 소비 행동을 확인한 것은 아닙니다.'}};
 const makePaidResponse=p=>({chapters:{money:{paragraphs:{earning:p}}}});
 assert.doesNotThrow(()=>generator.restoreEvidence(makePaidResponse(moneyParagraph),moneyPrompt),
  'two original source references make the composite thesis traceable');
 for(const missing of pair){
  const altered=structuredClone(moneyParagraph);
  altered.basis.refs=moneyRequired.filter(x=>x!==missing);
  assert.throws(()=>generator.restoreEvidence(makePaidResponse(altered),moneyPrompt),
   /paired domain thesis citations missing: money:earning/,
   'a single related source must not authorize two-source interpretation');
 }
 assert.deepEqual(moneyParagraph.basis.refs,moneyRequired,'the source model record must remain untouched');
 const extra=moneyRequired.find(ref=>!pair.includes(ref));
 assert(extra,'the original two-role contract must now carry a distinct third source');
 const dropExposure=structuredClone(moneyParagraph);
 dropExposure.basis.refs=moneyRequired.filter(ref=>ref!==extra);
 assert.throws(()=>generator.restoreEvidence(makePaidResponse(dropExposure),moneyPrompt),
  /exact paid domain stem exposure citations missing: money:earning/,
  'an apparently fluent paid interpretation cannot invent a source-owned exposure');
 // The actual paid decoder used to accept references to BOTH real sources
 // even when the customer paragraph explained only what symbols "mean".
 // That is a glossary, not a distinct interpretation worth purchasing.
 const definitions=structuredClone(moneyParagraph);
 definitions.text='첫 번째 출생 글자는 전통적인 식신 분류의 의미를 나타냅니다. '+
  '두 번째 출생 글자는 전통적인 정재 분류의 뜻을 나타냅니다. '+
  '이 두 글자는 서로 다른 십성의 분류로 기록됩니다.';
 const domainReader=require('./report-domain-topic-reader-brief');
 assert.equal(domainReader.emptyReaderInterpretation(definitions,earning),true);
 assert.throws(()=>generator.restoreEvidence(makePaidResponse(definitions),moneyPrompt),
  /paid domain interpretation is only symbol definitions: money:earning/,
  'two correct citations must not justify a customer-facing dictionary');
 const worked=structuredClone(definitions);
 worked.text+=' 예를 들어 가상의 작업에서 결과물을 전달하는 상황에서는 '+
  '자원을 관리하는 결정과 결과를 설명하는 선택을 서로 다른 질문으로 구분합니다.';
 assert.equal(domainReader.emptyReaderInterpretation(worked,earning),false,
  'a genuine applied difference is not a dictionary-only draft');
 assert.doesNotThrow(()=>generator.restoreEvidence(makePaidResponse(worked),moneyPrompt),
  'rejection lint must not insist on canned wording or fabricate outcomes');
 assert.equal(domainReader.emptyReaderInterpretation(definitions,{
  sourceOwnedSingleReading:{source:{ref:pair[0]}}}),false,
  'a single-source topic cannot silently inherit the two-role prose gate');

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
assert(!changedEarning.sourceOwnedInterpretiveThesis?.classicalMonthQuestion,
 'an alternate hour with no matching month-hidden exposure cannot inherit a classical candidate');
assert(substantiveTheses>0,'at least one real domain task must have a source-owned substantive thesis');
assert(singleTheses>0,'real charts must send single subtype interpretation into paid writer');

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
 assert.equal(thesis.sourceElementRelation.elementalDirection,'same-element',
  'different ten-god names do not imply a new element relation when both stems are wood');
 const different=paidBridge.exactElementRelation(
  {id:'natal.year.stem',stem:'辛'},
  {id:'natal.hour.stem',stem:'丁'});
 assert.equal(different.elementalDirection,'day-controls',
  'fire 丁 controls metal 辛, reverse of the original source order');
 assert.equal(different.realizedEffect,false);
 const syntheticFood=paidBridge.classicalOutputWealthCandidate('money.earning',
  {id:'natal.year.stem',stem:'甲',tenGod:'식신'},
  {id:'natal.hour.stem',stem:'丁',tenGod:'정재'},
  paidBridge.exactElementRelation(
   {id:'natal.year.stem',stem:'甲'},
   {id:'natal.hour.stem',stem:'丁'}),
  {chart:{year:'甲戌',month:'辛未',day:'壬寅',hour:'庚戌'}});
 assert.equal(syntheticFood,null,
  'a changed real birth-hour stem must not inherit the old 食神生財 relation');
 const missing=paidBridge.build({chapterId,topicId,
  topic:{mode:'use-primary',citableFacts:[pair[0]]}});
 assert.equal(missing,null,'one source alone must not produce two-role prose');
 assert.equal(paidBridge.build({chapterId,topicId,
  topic:{mode:'state-limits',citableFacts:pair}}),null);
}
// This REAL reader decision is sensitive to the exact computed arrow,
// not a fixed 'two kinds are different' instruction shared by every chart.
for(const [a,b,expected,owner] of [
 ['甲','丁','resource','first'],
 ['丁','甲','output','second'],
 ['戊','癸','control-on-day','first'],
 ['癸','戊','day-controls','second'],
 ['甲','乙','same-element','neither']
]){
 const left={id:'natal.year.stem',position:'연간',stem:a,tenGod:'식신'};
 const right={id:'natal.hour.stem',position:'시간',stem:b,tenGod:'정재'};
 const link=paidBridge.exactElementRelation(left,right);
 const decision=paidBridge.sourceDecisionContrast(left,right,link,
  '검증용 첫 번째/두 번째 범주의 실제 차이는 무엇인가?');
 assert.equal(link.elementalDirection,expected);
 assert.equal(decision.direction,expected);
 assert.equal(decision.directionalOwner,owner);
 assert.deepEqual([decision.firstSourceRef,decision.secondSourceRef],link.refs);
 assert(decision.firstOnlyQuestion.includes('연간'));
 assert(decision.secondOnlyQuestion.includes('시간'));
 assert.equal(decision.observedCustomerChoice,false);
 assert.equal(decision.traditionalPriorityChosen,false);
}
const originalArrow=paidBridge.sourceDecisionContrast(
 {id:'natal.year.stem',position:'연간',stem:'甲',tenGod:'식신'},
 {id:'natal.hour.stem',position:'시간',stem:'丁',tenGod:'정재'},
 paidBridge.exactElementRelation(
  {id:'natal.year.stem',stem:'甲'},
  {id:'natal.hour.stem',stem:'丁'}),'같은 질문');
const reverseArrow=paidBridge.sourceDecisionContrast(
 {id:'natal.year.stem',position:'연간',stem:'丁',tenGod:'식신'},
 {id:'natal.hour.stem',position:'시간',stem:'甲',tenGod:'정재'},
 paidBridge.exactElementRelation(
  {id:'natal.year.stem',stem:'丁'},
  {id:'natal.hour.stem',stem:'甲'}),'같은 질문');
assert.notEqual(originalArrow.sourceSpecificQuestion,reverseArrow.sourceSpecificQuestion,
 'opposite natal arrows must produce different source-owned reader questions');

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
// Unlike optional two-source contrasts, this question is about ONE
// genuinely calculated subtype; different true categories get different
// customer questions without fabricated second traits or predictions.
const singleBridge=require('./report-paid-interpretive-bridge');
const loneRow=(id,position,tenGod)=>({id,position,layer:'천간',
 stem:id.endsWith('hour.stem')?'丁':'甲',tenGod,
 traditionalMeaning:'원국에서 계산된 '+tenGod+' 뜻'});
let singleVariants=0;
for(const [chapterId,topicId,roles] of [
 ['money','earning',['식신','상관','정재','편재']],
 ['money','spending',['정재','편재']],
 ['career','workstyle',['정인','편인','식신','상관']],
 ['career','teamwork',['비견','겁재','정관','편관']],
 ['career','growth',['정인','편인']],
 ['relationship','expression',['식신','상관']],
 ['stress','trigger',['정관','편관']],
 ['stress','response',['정인','편인']]
]){
 const questions=[];
 for(const god of roles){
  const row=loneRow('natal.year.stem','연간',god);
  const value=singleBridge.buildSingle({chapterId,topicId,
   topic:{mode:'use-primary',citableFacts:[row]}});
  assert(value,chapterId+'.'+topicId+' must explain '+god+' with only real source');
  assert.equal(value.source.ref,row.id);
  assert.equal(value.source.tenGod,god);
  assert.equal(value.claimedRealWorldOutcome,false);
  questions.push(value.question);singleVariants++;
  // A repeated category across distinct positions is not another source
  // of an independent new interpretation.
  const duplicate=singleBridge.buildSingle({chapterId,topicId,
   topic:{mode:'use-primary',citableFacts:[
    row,loneRow('natal.hour.stem','시간',god)]}});
  assert.equal(duplicate.uniqueSubtypeCount,1);
 }
 assert.equal(new Set(questions).size,roles.length);
 const ineligible=singleBridge.buildSingle({chapterId,topicId,
  topic:{mode:'state-limits',citableFacts:[
   loneRow('natal.year.stem','연간',roles[0])]}});
 assert.equal(ineligible,null);
 const multiple=singleBridge.buildSingle({chapterId,topicId,
  topic:{mode:'use-primary',citableFacts:[
   loneRow('natal.year.stem','연간',roles[0]),
   loneRow('natal.hour.stem','시간',roles[1])]}});
 assert.equal(multiple,null,'two subtypes must not be silently collapsed');
}
assert(singleVariants>=20);
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

console.log('PASS '+singleVariants+' single-role questions and '+singleTheses+' real paid writer fields, no API calls');
console.log('PASS paid-domain reader contrasts: '+verified+
 ' actual source-backed topic text slots, '+unavailable+
 ' disabled, '+distinct+' distinct money-lens cases, verified previous citation only; 0 paid model calls');
