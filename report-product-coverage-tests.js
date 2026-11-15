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
  for(const [birthDate,birthTime,calendar,chapters,baselineEligible] of cases){
   const input={calendar,birthDate,birthTime,gender:'male',
    mbti:'ISFP',name:'TEST_DO_NOT_EXPOSE',birthplace:'TEST_ADDRESS_DO_NOT_EXPOSE',
    ...(calendar==='lunar'?{leapMonth:false}:{})};
   const before=JSON.stringify(input);
   const result=coverage.calculate(input);
   const decade=require('./report-paid-career-decade-reading')
    .candidate(facts.build(input,2027));
   const careerSelected=result.estimate.chapters.find(row=>row.id==='career')?.includedInPlan;
   const harmony=require('./report-paid-natal-day-harmony').candidate(facts.build(input,2027));
   const relationSelected=result.estimate.chapters.find(row=>row.id==='relationship')?.includedInPlan;
   const annualTriad=require('./report-paid-annual-triad').candidate(facts.build(input,2027));
   const annualSelected=result.estimate.chapters.find(row=>row.id==='year_2027')?.includedInPlan;
   const rootContrast=require('./report-paid-annual-root-contrast').candidate(facts.build(input,2027));
   const eligible=baselineEligible+4+Number(Boolean(decade&&careerSelected))+
    Number(Boolean(harmony&&relationSelected))+
    Number(Boolean(annualTriad&&annualSelected))+
    Number(Boolean(rootContrast&&annualSelected));
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
   assert(!result.readingSample.cards[0].text.includes('반대로 안쪽'),
    'the free intro must not use the old mirror-condition boilerplate');
   assert(!result.readingSample.cards[0].text.includes('둘 다 중요합니다'));
   assert(result.readingSample.cards.at(-1).text.includes('2027년'));
   assert(!/TEST_DO_NOT_EXPOSE|TEST_ADDRESS_DO_NOT_EXPOSE/.test(JSON.stringify(result.readingSample)));
   assert(Array.isArray(result.interpretivePreviews));
   assert(result.interpretivePreviews.length<=2);
   assert(result.interpretivePreviews.every(row=>
    ['money.earning','career.workstyle'].includes(row.id)&&
    row.title&&row.text.length>=130));
   assert(!/TEST_DO_NOT_EXPOSE|TEST_ADDRESS_DO_NOT_EXPOSE/.test(
    JSON.stringify(result.interpretivePreviews)),
    'never return private name or location in substantive mini-readings');
   assert(!/(?:natal\\.|annual\\.|facts\\.|person\\.)/.test(
    JSON.stringify(result.interpretivePreviews)),
    'displayed preview must not expose internal source identifiers');

   assert(!/(?:natal\\.|annual\\.|facts\\.)/.test(JSON.stringify(result.readingSample)),
    'actual source identifiers belong in internal audit, not public copy');

   assert.equal(result.catalog.chapterDefinitions,12);
   assert.equal(result.catalog.topicDefinitions,35);
   assert.equal(result.catalog.originallyPlannedTopics,35);
   assert.equal(result.catalog.historicalDefinitionShortfall,0);
   const selectedCoverage=result.estimate.chapters.filter(x=>x.includedInPlan);
   const unselectedCoverage=result.estimate.chapters.filter(x=>!x.includedInPlan);
   const omittedWithin=selectedCoverage.reduce((n,x)=>n+x.excludedTopics.length,0);
   const excludedChapters=unselectedCoverage.reduce((n,x)=>n+x.definedTopicSlots,0);
   assert.equal(result.estimate.excludedDefinedTopicsWithinPlannedChapters,
    omittedWithin);
   assert.equal(result.estimate.topicsUnavailableBecauseChaptersOmitted,
    excludedChapters);
   assert.equal(result.estimate.totalDefinedTopicsNotEligible,
    omittedWithin+excludedChapters);
   assert.equal(35,eligible+omittedWithin+excludedChapters);
   assert.equal(35-eligible,omittedWithin+excludedChapters);
   for(const c of result.estimate.chapters){
    assert(Array.isArray(c.excludedTopics));
    if(!c.includedInPlan){assert.deepEqual(c.excludedTopics,[]);continue;}
    assert.equal(c.eligibleTopicUpperBound+c.excludedTopics.length,c.definedTopicSlots);
    const present=new Set(c.eligibleTopics.map(x=>x.id));
    const missing=new Set(c.excludedTopics.map(x=>x.id));
    assert.equal(present.size+missing.size,c.definedTopicSlots);
    assert([...missing].every(id=>!present.has(id)));
    assert(c.excludedTopics.every(t=>t.title&&t.reason&&
     !/natal\\.|person\\.|facts\\.|TEST_DO_NOT_EXPOSE/.test(t.reason)));
   }
   assert.equal(result.estimate.plannedChapters,chapters);
   assert.equal(result.estimate.evidenceEligibleTopicUpperBound,eligible);
   assert.equal(result.estimate.targetChapterCount,12);
   assert.equal(result.estimate.targetTopicCount,35);
   assert.equal(result.estimate.chaptersNotSelected,12-chapters);
   assert.equal(result.estimate.topicUpperBoundGapToTarget,35-eligible);
   assert.equal(result.estimate.advertised12x35NotDeliverable,true);
   const proposal=result.productProposal;
   assert.equal(proposal.kind,'chart-specific-evidence-scoped-product-proposal-v1');
   assert.equal(proposal.status,'draft-not-for-sale');
   assert.equal(proposal.plannedChapterCount,chapters);
   assert.equal(proposal.topicCandidateUpperBound,eligible);
   assert.equal(proposal.mainChapterCount+proposal.conditionalChapterCount,chapters);
   assert.equal(proposal.mainTopicCandidateUpperBound+
    proposal.conditionalTopicCandidateUpperBound,eligible);
   assert.equal(proposal.fixed12ChaptersPromised,false);
   assert.equal(proposal.fixed35TopicsPromised,false);
   assert.equal(proposal.pricingDecided,false);
   assert.equal(proposal.paymentEnabled,false);
   assert.equal(proposal.humanEditorialApproved,false);
   assert(result.notice.includes('기본 해석 '+proposal.mainChapterCount+'개 장'));
   assert(result.notice.includes('조건부 2027년 분야별 해석 '+proposal.conditionalChapterCount+'개 장'));
   assert(result.notice.includes('최대 '+eligible+'개가 작성 후보'));
   assert(result.notice.includes('실제 완성·품질 승인된 문단 수는 아닙니다'));
   assert(!/TEST_DO_NOT_EXPOSE|TEST_ADDRESS_DO_NOT_EXPOSE/.test(result.notice),
    'customer notice cannot echo sensitive input');
   assert.equal(result.estimate.chapters.length,12);
   assert.equal(result.estimate.chapters.filter(x=>x.includedInPlan).length,chapters);
   assert.equal(result.estimate.chapters.reduce((n,x)=>n+x.eligibleTopicUpperBound,0),eligible);
   assert.equal(result.estimate.chapters.reduce((n,x)=>n+x.eligibleTopics.length,0),eligible,
    'the sum of actually displayed topic questions must equal the verified preflight upper bound');
   assert.deepEqual([...result.productProposal.mainChapterIds,
    ...result.productProposal.conditional2027ChapterIds].sort(),
    result.estimate.chapters.filter(x=>x.includedInPlan).map(x=>x.id).sort(),
    'the product proposal may never contain a section not selected by the actual paid writer');
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
  const income=chartWithHour.interpretivePreviews.find(x=>x.id==='money.earning');
  const career=chartWithHour.interpretivePreviews.find(x=>x.id==='career.workstyle');
  assert(income&&career,'the real natal chart must expose both independently supported domains');
  assert(income.text.includes('대가를 정하는 가상 상황'));
  assert(career.text.includes('새로운 작업 방식을 적용하는 가상 상황'));
  assert.notEqual(income.text,career.text,
   'career interpretation cannot be the same money paragraph with different heading');
  assert(income.text.includes('첫 번째 조건만')&&income.text.includes('반대로'));
  assert(career.text.includes('앞의 조건만')&&career.text.includes('뒤의 조건만'));
  assert(!/(?:실제 소득이나|실제 업무 능력이나)/.test(income.text.slice(0,30)),
   'the reader explanation should lead with the traditional difference');
  const directLink=chartWithHour.readingSample.cards.find(x=>x.id==='month-visible-link');
  assert(directLink&&directLink.text.includes('태어난 시간'),
   'the exact verified 丁 month-hidden to 丁 birth-hour visible relationship should be explained');
  assert(directLink.title.includes('다른 출생 자리에서 확인한 연결'),
   'the free preview must say source linkage, not promise a new personality interpretation');
  assert(directLink.text.includes('정확히 같은 글자로 확인됩니다'));
  assert(directLink.text.includes('역할과 승인·검수의 기준')&&
   directLink.text.includes('반복해서 들어갈 비용과 관리 자원'),
   'the actual 1994 chart exposes distinct authority and recurring-cost questions');
  assert(directLink.text.includes('출생월의 중심 글자 하나만 읽으면')&&
   directLink.text.includes('되풀이되는 별도 분류를 놓치게 됩니다'),
   'the chart-specific distinction must show exactly what the natal month baseline omitted');
  assert(!/(?:여섯 달|운영하는 가상의 상황|첫 번째 조건만|반대로 두 번째 조건만|장비|납품)/.test(directLink.text),
   'rejected reusable adult-workplace examples may not return to the real customer preview');
  assert(directLink.text.includes('두 글자 사이에는')&&directLink.text.includes('도와주는 방향'),
   'the actual Ding/己 elements must determine their verified direction, not a fixed template');
  assert(directLink.text.includes('실제 성격')&&directLink.text.includes('판정한 결과는 아닙니다'),
   'explicit source scope must not be mistaken for real behavior');
  assert(!/(?:실제로 성실한 사람|돈을 잘 번다|재물운이 강하다)/.test(directLink.text),
   'a chart-specific hypothetical cannot become a verified personal trait');
  assert(!directLink.text.includes('辛')&&!directLink.text.includes('壬'),
   'reader copy should not become an unexplained character ledger');
  // A 2018 birth is still a minor for the 2027 preview. Do not smuggle
  // the rejected adult factory/job story into the free personalized card.
  const youngerDates=['2018-02-15','2018-05-15','2018-07-15','2018-10-15'];
  for(const birthDate of youngerDates){
   const younger=coverage.calculate({calendar:'solar',birthDate,birthTime:'14:20',
    gender:'female',mbti:'ISFP'});
   assert.equal(younger.status,'ready');
   const text=younger.readingSample.cards.map(x=>x.text).join(' / ');
   assert(!/(?:여섯 달간 운영|회사에서|납품 일정|장비 운영|업무 인수인계)/.test(text),
    'free personal preview cannot assume a child runs an adult workplace: '+birthDate);
   assert.deepEqual(younger.interpretivePreviews,[],
    'adult income and workstyle mini-readings must not appear to child users');
   const link=younger.readingSample.cards.find(x=>x.id==='month-visible-link');
   if(link){
    assert(!/(?:운영하는 가상의 상황|월급|회사|직장|납품)/.test(link.text));
    assert(link.text.includes('정확히 같은 글자로 확인됩니다'));
   }
  }
  const alteredHour=coverage.calculate({calendar:'solar',
   birthDate:'1994-07-15',birthTime:'20:20',gender:'male',mbti:'ISFP'});
  assert(!alteredHour.readingSample.cards.some(x=>x.id==='month-visible-link'&&
   x.text.includes('태어난 시간')),
   'an altered birth hour must never inherit an old month-to-hour link');
  const alternateYear=coverage.calculate({calendar:'solar',
   birthDate:'1994-01-15',birthTime:'14:20',gender:'male',mbti:'ISFP'});
  const yearLink=alternateYear.readingSample.cards.find(x=>x.id==='month-visible-link');
  assert(yearLink&&yearLink.text.includes('태어난 해'),
   'a genuine year exposure must be about the year rather than a generic hour case');
  assert.notEqual(yearLink.text,directLink.text,
   'the independent chart must produce a different role-grounded conditional reading');
  const unknownTime=coverage.calculate({calendar:'solar',birthDate:'2001-11-03',
   unknownBirthTime:true,birthTime:'12:00',gender:'male',mbti:'모름'});
  assert.equal(unknownTime.status,'ready');
  assert(!unknownTime.readingSample.cards.some(x=>x.id==='year-hour'||(
   x.id==='month-visible-link'&&x.text.includes('태어난 시간'))),
   'unknown birth time must never include an hour-derived traditional interpretation');
  assert(unknownTime.readingSample.note.includes('잠정 계산'),
   'unknown birth hour must disclose the boundary limitation to readers');
  assert.deepEqual(unknownTime.interpretivePreviews,[],
   'unknown birth hour is not an adult paid-source cross-domain sample');
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
  assert.equal(noMBTI.catalog.topicDefinitions,35);
  assert.equal(noMBTI.catalog.historicalDefinitionShortfall,0);
  const mbti=noMBTI.estimate.chapters.find(x=>x.id==='mbti_contradiction');
  assert(mbti.excludedTopics.some(x=>x.id==='information'&&x.reason.includes('MBTI')));
  assert(mbti.excludedTopics.some(x=>x.id==='judgment'&&x.reason.includes('MBTI')));
  assert(mbti.excludedTopics.some(x=>x.id==='energy'&&x.reason.includes('MBTI')));
  assert(mbti.excludedTopics.some(x=>x.id==='planning'&&x.reason.includes('MBTI')));
  const visibleUI=require('node:fs').readFileSync(
   require('node:path').join(__dirname,'live-report-ui.js'),'utf8');
  assert(visibleUI.includes('선택된 장에서 작성하지 않는 질문'));
  assert(visibleUI.includes('excludedHtml'));
  assert(visibleUI.includes('historicalDefinitionShortfall'));
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
   samples:checked.length,
   definedChapters:Object.keys(require('./report-outline').topics).length,
   definedTopics:Object.values(require('./report-outline').topics)
    .reduce((sum,topics)=>sum+Object.keys(topics).length,0),
   actualProviderCalls:0,purchaseStillDisabled:true,
   clientSuppliedChartIgnored:true,personalInputNotEchoed:true,
   results:checked
  }));
 }finally{
  for(const [k,v] of Object.entries(saved))
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
