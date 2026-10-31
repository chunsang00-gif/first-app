'use strict';
const assert=require('node:assert/strict');
const coverage=require('./report-product-coverage');
const qa12=require('./report-qa12-chapter-topic-evidence-matrix');
const facts=require('./report-facts-node');
const cases=[
 ['1982-11-24','14:20','lunar',9,20],
 ['1994-07-15','14:20','solar',10,19],
 ['1994-01-15','14:20','solar',10,21],
 ['1994-05-15','20:20','solar',11,20]
];
const names=['NODE_ENV','RENDER','PAID_CORE_DEPTH_V2',
 'PAID_CORE_V2_CLASSICAL_WRITER','PAID_CORE_V2_CLAIM_LINKS',
 'PAID_CORE_V2_REQUIRED_RESEARCH_SLOT'];
(async()=>{
 const saved=Object.fromEntries(names.map(k=>[k,process.env[k]]));
 try{
  process.env.NODE_ENV='test';delete process.env.RENDER;
  for(const k of names.slice(2))delete process.env[k];
  const checked=[];
  for(const [birthDate,birthTime,calendar,chapters,eligible] of cases){
   const input={calendar,birthDate,birthTime,gender:'male',
    mbti:'ISFP',name:'TEST_DO_NOT_EXPOSE',birthplace:'TEST_ADDRESS_DO_NOT_EXPOSE',
    ...(calendar==='lunar'?{leapMonth:false}:{})};
   const before=JSON.stringify(input);
   const result=coverage.calculate(input);
   assert.equal(JSON.stringify(input),before,'never rewrite caller birth data');
   assert.equal(result.status,'ready');
   assert.equal(result.kind,'prepurchase-report-scope-v1');
   assert.equal(result.readingSample.kind,'free-calculated-meaning-preview-v1');
   assert.equal(result.readingSample.status,'calculated-example');
   assert.equal(result.readingSample.modelCalls,0);
   assert.equal(result.readingSample.completedPremiumParagraphs,0);
   assert.equal(result.readingSample.humanEditorialApproved,false);
   assert([3,4].includes(result.readingSample.cards.length),
    'known-hour chart may add a fourth card only for a verified month-to-visible-stem link');
   assert(result.readingSample.cards[0].text.includes('태어난 달'));
   assert(result.readingSample.cards.at(-1).text.includes('2027년'));
   assert(!/TEST_DO_NOT_EXPOSE|TEST_ADDRESS_DO_NOT_EXPOSE/.test(JSON.stringify(result.readingSample)));
   assert(!/(?:natal\\.|annual\\.|facts\\.)/.test(JSON.stringify(result.readingSample)),
    'actual source identifiers belong in internal audit, not public copy');

   assert.equal(result.catalog.chapterDefinitions,12);
   assert.equal(result.catalog.topicDefinitions,28);
   assert.equal(result.catalog.originallyPlannedTopics,35);
   assert.equal(result.estimate.plannedChapters,chapters);
   assert.equal(result.estimate.evidenceEligibleTopicUpperBound,eligible);
   assert.equal(result.estimate.chapters.length,12);
   assert.equal(result.estimate.chapters.filter(x=>x.includedInPlan).length,chapters);
   assert.equal(result.estimate.chapters.reduce((n,x)=>n+x.eligibleTopicUpperBound,0),eligible);
   assert.equal(result.estimate.chapters.reduce((n,x)=>n+x.eligibleTopics.length,0),eligible,
    'the sum of actually displayed topic questions must equal the verified preflight upper bound');
   const blueprint=require('./report-analysis-guidance').preflight(facts.build(input,2027));
   const outline=require('./report-outline').topics;
   for(const chapter of result.estimate.chapters){
    const allowed=chapter.includedInPlan?Object.keys(outline[chapter.id]).filter(topic=>
     blueprint[chapter.id].topicTasks[topic]?.mode!=='state-limits'):[];
    assert.deepEqual(chapter.eligibleTopics.map(t=>t.id),allowed,
     'question list must match the same source plan as the paid writer');
    assert(chapter.eligibleTopics.every(t=>t.title.length>8&&
     !/^(?:natal\\.|facts\\.|person\\.)/.test(t.title)),
     'visible questions must be readable without disclosing calculated raw references');
    if(!chapter.includedInPlan)assert.deepEqual(chapter.eligibleTopics,[]);
   }
   assert.equal(result.purchaseEnabled,false);
   assert.equal(result.paymentVerificationAvailable,false);
   assert.equal(result.premiumReportCompleted,false);
   assert.equal(result.customerSaleApproved,false);
   assert.equal(result.modelCalls,0);
   assert.equal(JSON.stringify(result).includes('TEST_DO_NOT_EXPOSE'),false);
   assert.equal(JSON.stringify(result).includes('TEST_ADDRESS_DO_NOT_EXPOSE'),false);
   assert.equal(JSON.stringify(result).includes(birthDate),false);
   assert(result.estimate.selectedDefinedTopicUpperBound>=eligible);
   assert(result.estimate.canAttemptGeneration);
   for(const chapter of result.estimate.chapters){
    assert(chapter.name.length>=2);
    if(!chapter.includedInPlan){
     assert(chapter.omittedReason);
     assert.equal(chapter.eligibleTopicUpperBound,0);
    }
   }
   checked.push({birthDate,plannedChapters:chapters,upperBound:eligible});
  }
  const chartWithHour=coverage.calculate({calendar:'solar',
   birthDate:'1994-07-15',birthTime:'14:20',gender:'male',mbti:'ISFP'});
  const directLink=chartWithHour.readingSample.cards.find(x=>x.id==='month-visible-link');
  assert(directLink&&directLink.text.includes('태어난 시간'),
   'the exact verified 丁 month-hidden to 丁 birth-hour visible relationship should be explained');
  assert(directLink.text.includes('정확히 같은 글자'));
  assert(!directLink.text.includes('辛')&&!directLink.text.includes('壬'),
   'reader copy should not become an unexplained character ledger');
  const alteredHour=coverage.calculate({calendar:'solar',
   birthDate:'1994-07-15',birthTime:'20:20',gender:'male',mbti:'ISFP'});
  assert(!alteredHour.readingSample.cards.some(x=>x.id==='month-visible-link'&&
   x.text.includes('태어난 시간')),
   'an altered birth hour must never inherit an old month-to-hour link');
  const unknownTime=coverage.calculate({calendar:'solar',birthDate:'2001-11-03',
   unknownBirthTime:true,birthTime:'12:00',gender:'male',mbti:'모름'});
  assert.equal(unknownTime.status,'ready');
  assert(!unknownTime.readingSample.cards.some(x=>x.id==='year-hour'||(
   x.id==='month-visible-link'&&x.text.includes('태어난 시간'))),
   'unknown birth time must never include an hour-derived traditional interpretation');
  assert(unknownTime.readingSample.note.includes('잠정 계산'),
   'unknown birth hour must disclose the boundary limitation to readers');
  const independent=cases.map(([birthDate,birthTime,calendar])=>coverage.calculate({
   calendar,birthDate,birthTime,gender:'male',mbti:'ISFP',
   ...(calendar==='lunar'?{leapMonth:false}:{})
  }).readingSample.cards.map(c=>c.text).join(' / '));
  assert(new Set(independent).size>=3,
   'the free explanation must change with actually computed natal symbols across charts');
  // Source scope rather than a hardcoded four-chart lookup:
  // a different MBTI field cannot fabricate a new natal ten-god relation.
  const input={calendar:'solar',birthDate:'1994-07-15',birthTime:'14:20',
   gender:'male',mbti:'모름'};
  const noMBTI=coverage.calculate(input);
  assert.equal(noMBTI.catalog.topicDefinitions,28);
  assert.equal(noMBTI.customerSaleApproved,false);
  const fake={...input,chart:{year:'甲子',month:'甲子',day:'甲子',hour:'甲子'},
   facts:{tenGods:{year:{stemTenGod:'정재'}}},purchaseEnabled:true};
  const actual=coverage.calculate(fake);
  assert.equal(JSON.stringify(actual),JSON.stringify(noMBTI),
   'forged caller chart or purchaseEnabled may not control server report scope');
  // Stage-independent source ownership: a single wealth subtype, even
  // when repeated in several positions, does not support selling earning
  // and spending as two independent personal interpretations.
  const base=facts.build({calendar:'solar',birthDate:'1994-07-15',
   birthTime:'14:20',gender:'male',mbti:'ISFP'},2027);
  assert.equal(base.status,'ready');
  function symbolicProfile(rows){
   const packet=structuredClone(base);
   for(const position of ['year','month','day','hour']){
    packet.facts.tenGods[position].stemTenGod='비견';
    packet.facts.tenGods[position].hiddenStems=[];
   }
   for(const [position,tenGod] of rows)
    packet.facts.tenGods[position].stemTenGod=tenGod;
   const plan=require('./report-analysis-guidance').preflight(packet);
   return plan.money.topicTasks;
  }
  const oneWealth=symbolicProfile([['year','정재']]);
  assert.equal(oneWealth.earning.mode,'use-primary');
  assert.equal(oneWealth.spending.mode,'state-limits',
   'one wealth subtype alone must not create both paid financial topics');
  assert.deepEqual(oneWealth.spending.allowedSourceRefs,[]);
  const repeatedWealth=symbolicProfile([['year','정재'],['month','정재']]);
  assert.equal(repeatedWealth.spending.mode,'state-limits',
   'two positions with the same traditional subtype are not automatically two different claims');
  const distinctWealth=symbolicProfile([['year','정재'],['month','편재']]);
  assert.equal(distinctWealth.spending.mode,'use-primary',
   'different genuine wealth subtypes can support distinct questions, subject to final review');
  const wealthAndOutput=symbolicProfile([['year','정재'],['month','식신']]);
  assert.equal(wealthAndOutput.spending.mode,'use-primary',
   'an independent production/output meaning can separate earning from wealth stewardship');
  const onlyOutput=symbolicProfile([['year','식신']]);
  assert.equal(onlyOutput.earning.mode,'use-primary');
  assert.equal(onlyOutput.spending.mode,'state-limits');
  assert.deepEqual(onlyOutput.spending.allowedSourceRefs,[]);
  console.log('PRODUCT_COVERAGE='+JSON.stringify({
   samples:checked.length,definedChapters:12,definedTopics:28,
   actualProviderCalls:0,purchaseStillDisabled:true,
   clientSuppliedChartIgnored:true,personalInputNotEchoed:true,
   results:checked
  }));
 }finally{
  for(const [k,v] of Object.entries(saved))
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
