'use strict';
// Synthetic calendar grid only. An OFFLINE chart-by-chart editorial evidence
// probe, not AI writing and not human endorsement of any paid manuscript.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const coverage=require('./report-core-knowledge-coverage');
const preview=require('./report-core-paid-natal-depth-preview');
const assemble=require('./report-core-paid-full-qa-compose').assemble;
const factLock=require('./report-core-paid-natal-depth-fact-lock');
const writer=require('./report-generation-request');
const usage=require('./report-core-paid-natal-editorial-depth-usage');
(async()=>{
 const old=global.fetch,selected=[],rolePairs=new Set();
 let network=0;
 global.fetch=()=>{network++;throw Error('QA_THREE_CHARTS_MUST_NOT_CALL_PROVIDER');};
 try{
  for(const input of coverage.representativeInputs()){
   if(input.calendar!=='solar')continue;
   const chart=facts.build(input,2027);
   const p=preview.prepare(chart);
   if(!p)continue;
   const source=p.payload.source;
   const year=source['natal.year.stem'],hour=source['natal.hour.stem'];
   const pair=year?.tenGod+'/'+hour?.tenGod;
   if(!year?.traditionalMeaning||!hour?.traditionalMeaning||
      !year.tenGod||!hour.tenGod||rolePairs.has(pair))continue;
   // Ensure comparisons represent different birth year/month and are not
   // three equivalent wordings of one classification pair.
   if(selected.some(x=>x.input.birthDate.slice(0,4)===input.birthDate.slice(0,4)||
       x.input.birthDate.slice(5,7)===input.birthDate.slice(5,7)))continue;
   const qa=await assemble(input);
   assert.equal(qa.providerCalls,0);
   assert.equal(qa.releaseVerdict,'not-approved');
   assert.equal(qa.prompt.qaNatalDepthPreview,true);
   assert.deepEqual(qa.payload.source['natal.year.stem'],year);
   assert.deepEqual(qa.payload.source['natal.hour.stem'],hour);
   assert.deepEqual(qa.schema.properties.chapters.properties.saju_core
     .properties.paragraphs.properties.temperament,{type:'null'});
   assert.equal(qa.schema.properties.chapters.properties.saju_core
     .properties.paragraphs.properties.natal_depth.type,'object');
   const expected=writer.compile(qa.prompt);
   const brief=expected.task.chapters.saju_core.topics.natal_depth.evidenceFocus;
   assert.equal(brief.kind,'qa-verified-natal-interpretive-contrast');
   const verifiedLinks=require('./report-core-paid-natal-linkage-brief').select(chart);
   assert.deepEqual(brief.verifiedLinks,verifiedLinks);
   assert.equal(verifiedLinks.dataScope,'calculated-position-and-same-element-only');
   assert.equal(verifiedLinks.measuredStrength,false);
   assert.equal(verifiedLinks.observedPersonality,false);
   assert(verifiedLinks.visible.every(x=>Array.isArray(x.observedSameElementRoots)));
   const guard=require('./report-instruction-audit');
   assert.deepEqual(guard.inspectTransport(qa.prompt,qa.payload),[]);
   const tampered=structuredClone(qa.payload);
   tampered.task.chapters.saju_core.topics.natal_depth.evidenceFocus
    .verifiedLinks.visible[0].observedSameElementRoots=[];
   // If this chart happens to have no year root, alter another position.
   const first=verifiedLinks.visible.findIndex(x=>x.observedSameElementRoots.length>0);
   assert(first>=0,'QA synthetic chart must contain observable links');
   tampered.task.chapters.saju_core.topics.natal_depth.evidenceFocus
    .verifiedLinks.visible[first].observedSameElementRoots=[];
   assert(guard.inspectTransport(qa.prompt,tampered)
    .includes('qa-natal-depth-evidence-brief-drift'),
    'changing computed roots in model instructions must fail before payment');
   assert.deepEqual(brief.positions.map(x=>x.sourceId),
    ['natal.year.stem','natal.month.stem','natal.day.stem','natal.hour.stem']);
   assert.equal(brief.positions[0].traditionalMeaning,year.traditionalMeaning);
   assert.equal(brief.positions[3].traditionalMeaning,hour.traditionalMeaning);
   assert.deepEqual(brief.requiredCitations,
    ['natal.year.stem','natal.day.stem','natal.hour.stem','facts.stemConnections']);
   const lock=factLock.fromPayload(qa.payload);
   rolePairs.add(pair);
   selected.push({input,qa,lock,year,hour,pair});
   if(selected.length===3)break;
  }
  assert.equal(selected.length,3,'need three DIFFERENT eligible synthetic birth-year/month/role pairs');
  assert.equal(rolePairs.size,3);
  assert.equal(new Set(selected.map(x=>x.lock.literal)).size,3);
  for(let i=0;i<selected.length;i++)for(let j=0;j<selected.length;j++){
   if(i===j)continue;
   assert.notEqual(selected[i].lock.literal,selected[j].lock.literal,
     'never recycle a natal fact-lock across birth charts');
   assert.notDeepEqual(selected[i].qa.payload.task.chapters.saju_core.topics.natal_depth
     .evidenceFocus.positions,
     selected[j].qa.payload.task.chapters.saju_core.topics.natal_depth.evidenceFocus.positions,
     'birth-specific interpretive evidence must actually change');
  }

  // These three distinct, human-authored DRAFT passages probe attribution,
  // not quality. They are not templated by the engine or served to users.
  const samples=[
   {date:'1982-03-15',year:'정관',hour:'비견',
    label:'규칙과 개인의 책임을 나누어 보는 선택',
    prose:'팀에서 새로운 업무를 함께 맡는다고 가정해 봅니다. 태어난 해의 계산된 뜻은 정해진 규칙과 맡은 역할을 먼저 살피는 기준입니다. 반면 태어난 시간에 놓인 뜻은 스스로 맡을 일과 동료가 맡을 몫을 구별하는 질문을 보탭니다. 절차가 정해져 있지만 실제 담당자가 분명하지 않은 경우에는 두 기준을 함께 보는 편이 필요합니다. 규칙만 지키면 누가 마지막 일을 책임질지 놓칠 수 있고, 각자의 몫만 주장하면 공통 절차가 흔들릴 수 있다는 식으로 조건을 나눠 읽을 수 있습니다.'},
   {date:'1988-12-15',year:'편재',hour:'정관',
    label:'외부의 선택지와 맡은 역할을 함께 살피는 조건',
    prose:'동네 행사를 준비하면서 여러 협력처 중 어디에 일을 맡길지 결정하는 상황을 가정합니다. 태어난 해에서 읽는 뜻은 여러 곳에서 필요한 자원을 비교해 선택하는 쪽에 가깝습니다. 태어난 시간의 계산된 뜻은 정해진 규칙과 맡은 역할을 지키는 기준을 덧붙입니다. 외부 제안이 많고 선택지가 넓을 때는 더 좋은 자원을 찾는 시각이 도움이 됩니다. 하지만 행사를 운영할 사람이 정해지지 않았다면 조건이 좋은 제안도 실행하기 어려워질 수 있습니다. 반대로 정해진 절차에만 매달리면 바깥의 실용적인 선택지를 놓치기 쉽다는 관점에서 두 기준을 구별합니다.'},
   {date:'1994-04-15',year:'정재',hour:'편재',
    label:'매달의 비용과 외부 자원을 비교하는 선택',
    prose:'작은 매장을 운영한다고 가정해 보겠습니다. 태어난 해의 뜻은 매달 감당할 비용을 따져 재고와 지출을 관리하는 기준에 가깝습니다. 반면 태어난 시간에 담긴 뜻은 필요한 자원을 외부에서 찾아 새로운 거래 기회를 살피는 기준으로 읽습니다. 매달 나가는 비용이 빠듯할 때는 먼저 지출을 관리하는 기준이 도움이 되지만, 그 기준에만 매이면 새로운 공급처를 비교할 기회를 놓칠 수 있습니다. 반대로 외부 자원을 늘리는 일만 생각하면 실제로 감당할 비용을 소홀히 할 수 있으므로, 상황에 따라 두 질문을 구분해 보는 방식입니다.'}
  ];
  assert.deepEqual(selected.map(x=>x.input.birthDate),samples.map(x=>x.date),
   'the handwritten candidates must be tied to THESE fixed synthetic births');
  const validator=require('./report-core-paid-natal-depth-response-gate');
  const decoder=require('./report-response-decoder').decode;
  const thesis=require('./report-core-thesis');
  const responses=[],usageFindings=[];
  for(let i=0;i<selected.length;i++){
   const row=selected[i],draft=samples[i];
   assert.equal(row.year.tenGod,draft.year);
   assert.equal(row.hour.tenGod,draft.hour);
   const month='natal.month.hidden.'+
    row.qa.prompt.facts.facts.structuralEvidence.monthCommand.mainHiddenStem;
   const fixed=thesis.forPrompt(row.qa.prompt);
   const response={chapters:{saju_core:{
    title:fixed.title,keyJudgment:fixed.keyJudgment,mood:'reflective',
    paragraphs:{
     temperament:null,
     strength:{label:'태어난 달의 기본 풀이',
      text:'태어난 달의 서로 다른 계산 위치는 한 가지 선택을 볼 때 서로 다른 조건을 살펴보는 근거입니다. 예를 들어 새로운 일을 시작할 경우 이미 알려진 자료와 준비해야 할 자원을 구별할 수 있습니다.',
      basis:{refs:['natal.month.stem',month],
       interpretation:'월의 두 계산 위치를 별도로 고려한 전통적 의미',
       condition:'새 일을 고르는 가상 상황',limit:'실제 성격이나 이력은 판단하지 않음'}},
     natal_depth:{label:draft.label,text:draft.prose,
      basis:{refs:['natal.year.stem','natal.day.stem',
        'natal.hour.stem','facts.stemConnections'],
       interpretation:row.lock.literal,
       condition:'한 가지 가상 선택 상황에서 이득과 놓칠 조건을 비교',
       limit:'실제 성격과 미래 사건을 알 수 없음'}}
    }}},finalJudgment:null,cover:null};
   const errors=validator.inspect(response,row.qa.prompt);
   assert.deepEqual(errors,[],
    'independent authored passage must match its OWN source categories: '+draft.date);
   const decoded=decoder(response,row.qa.prompt);
   assert.deepEqual(decoded.sections[0].bodyTopics,['strength','natal_depth']);
   assert(decoded.sections[0].body.some(v=>v.includes(draft.prose.slice(0,25))));
   assert.equal(validator.assert(response,row.qa.prompt).releaseVerdict,'not-approved');
   const review=usage.assess(response,row.qa.prompt);
   assert.deepEqual(review.missingDepthPositions,['day'],
    'a technical PASS must not conceal an unexplained day-stem citation: '+draft.date);
   assert.equal(review.readerPositions.year.usedInReader,true);
   assert.equal(review.readerPositions.hour.usedInReader,true);
   assert.equal(review.readerPositions.day.cited,true);
   assert.equal(review.readerPositions.day.usedInReader,false);
   assert.equal(review.customerReleaseApproved,false);
   usageFindings.push({syntheticDate:draft.date,
    missingDepthPositions:review.missingDepthPositions,
    status:review.status});
   responses.push(response);
  }
  let crossChartRejections=0;
  for(let i=0;i<selected.length;i++)for(let j=0;j<selected.length;j++){
   if(i===j)continue;
   // Move ONLY the visible depth prose onto the other valid chart/basis.
   // The provenance citation IDs still LOOK valid; meaning must not pass.
   const switched=structuredClone(responses[j]);
   switched.chapters.saju_core.paragraphs.natal_depth.text=
    responses[i].chapters.saju_core.paragraphs.natal_depth.text;
   const errors=validator.inspect(switched,selected[j].qa.prompt);
   assert(errors.some(e=>e.startsWith('QA_DEPTH_POSITION_MEANING_UNGROUNDED:')||
      e.startsWith('QA_DEPTH_POSITION_CONFLICTING_MEANING:')),
    'same citation IDs may not disguise a foreign-chart interpretation: '+i+' => '+j+
    ': '+errors.join(','));
   assert.throws(()=>decoder(switched,selected[j].qa.prompt),
    /QA_NATAL_DEPTH_RESPONSE_REJECTED/,
    'swapped prose must not reach consumer report');
   crossChartRejections++;
  }
  assert.equal(crossChartRejections,6);
  assert.equal(usageFindings.length,3);
  console.log('QA_THREE_CHART_READER_EVIDENCE_USAGE='+JSON.stringify({
   samples:usageFindings,reviewOnly:true,
   technicallyValidButNotFullDepth:3,paidProviderCalls:0,
   releaseVerdict:'not-approved'}));
  // A citation to facts.stemConnections is not proof that prose used its
  // observed exact-stem exposures / same-element roots. Surface this
  // actual, input-specific graph to the editorial reviewer, with no new
  // fortune-strength or personality claims and no model usage.
  const stemGraph=require('./report-stem-connections');
  const linkages=selected.map(({input,qa})=>{
   const actual=stemGraph.build(qa.prompt.facts.chart);
   const inRequest=qa.payload.source['facts.stemConnections'];
   assert.deepEqual(inRequest,actual,'writer must receive the real computed natal stem graph');
   assert.equal(actual.sourcePolicy.strength,'not-assessed');
   assert.equal(actual.sourcePolicy.seasonAndTransformation,'not-assessed');
   assert.equal(actual.sourcePolicy.hourPolicy,'observed-hour');
   const observation=id=>{
    const r=actual.rooting.find(x=>x.visibleId===id);
    assert(r&&r.visiblePosition,'required natal position must exist in rooted graph');
    return {hasObservedRoot:r.hasObservedRoot,
     roots:r.sameElementRoots.map(x=>({
      id:x.hiddenId,position:x.position,type:x.type}))};
   };
   return {syntheticDate:input.birthDate,
    year:observation('natal.year.stem'),
    day:observation('natal.day.stem'),
    hour:observation('natal.hour.stem'),
    exactExposures:actual.exposure.filter(x=>x.exactExposure)
     .map(x=>({hiddenId:x.hiddenId,
      visibleIds:x.exactVisibleMatches.map(v=>v.id)})),
    assessedStrength:false,assessedPersonality:false};
  });
  assert.equal(linkages.length,3);
  console.log('QA_THREE_CHART_REAL_STEM_LINKS='+JSON.stringify({
   source:'verified natal stem relation graph; not a personality inference',
   checked:3,providerCalls:0,releaseVerdict:'not-approved',linkages}));
  console.log('QA_THREE_CHART_EDITORIAL_PROBES='+JSON.stringify({
   distinctHandAuthoredDrafts:3,crossChartMisattributionRejected:crossChartRejections,
   offlineTechnicalGatesPassed:true,providerCalls:0,
   assessedPremiumReaderValue:false,releaseVerdict:'not-approved'}));

  assert.equal(network,0,'offline chart probes must never call any provider');
  const findings=selected.map(({input,year,hour,qa})=>({
   syntheticDate:input.birthDate,yearRole:year.tenGod,hourRole:hour.tenGod,
   yearMeaning:year.traditionalMeaning,hourMeaning:hour.traditionalMeaning,
   factCount:qa.sourceRefs.length
  }));
  console.log('QA_THREE_CHART_EDITORIAL_EVIDENCE='+JSON.stringify({
   kind:'synthetic-offline-role-difference-only',
   checked:3,distinctRolePairs:rolePairs.size,providerCalls:0,
   userProfileUsed:false,realProseQuality:'not-tested',
   releaseVerdict:'not-approved',findings}));
 }finally{global.fetch=old;}
})().catch(e=>{console.error(e);process.exitCode=1;});
