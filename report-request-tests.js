'use strict';
const assert=require('node:assert/strict');
const {createQueue,retryDelay,rateLimitKind}=require('./report-request-control');
(async()=>{
 assert.equal(rateLimitKind('Rate limit reached on requests per day (RPD).','rate_limit_exceeded'),'daily rate limit');
 assert.equal(rateLimitKind('tokens per min: Limit 10,000, Used 0, Requested 12,300','rate_limit_exceeded'),'request exceeds token limit');
 assert.equal(rateLimitKind('tokens per min: Limit 30,000, Used 29,000, Requested 2,000','rate_limit_exceeded'),'token rate limit');
 assert.equal(rateLimitKind('', 'insufficient_quota'),'quota exhausted');
 const mbtiGuidance=require('./report-analysis-guidance').forRequest(['mbti_contradiction','integrated_judgment'],'ISFP').mbtiReference;
 assert.equal(mbtiGuidance.type,'ISFP');
 assert(mbtiGuidance.application.includes('구체적인 선택 상황'));
 assert(mbtiGuidance.application.includes('실제 계산된 사주 항목'));
 assert(mbtiGuidance.application.includes('비교 한계'));
 assert.equal(require('./report-analysis-guidance').forRequest(['mbti_contradiction'],'모름').mbtiReference,null);
 const wire=require('./report-wire');
 const outlineForWire=require('./report-outline').topics;
 const sampleWireSchema={properties:{sections:{items:{properties:{title:{type:'string'},keyJudgment:{type:'string'},evidence:{type:'array',items:{type:'string'}},mood:{type:'string'}}}},finalJudgment:{type:'object'},cover:{type:'object'}}};
 const wirePrompt={requestedSections:['saju_core'],includeFinal:false,includeCover:false};
 const generatedWireSchema=wire.schemaFor(wirePrompt,sampleWireSchema);
 assert.deepEqual(generatedWireSchema.properties.chapters.properties.saju_core.properties.paragraphs.required,Object.keys(outlineForWire.saju_core));
 const oneTopic=Object.keys(outlineForWire.saju_core)[0];
 const optionalParagraph=generatedWireSchema.properties.chapters.properties.saju_core.properties.paragraphs.properties[oneTopic];
 assert.equal(optionalParagraph.type,'object','one anchor paragraph must not be nullable');
 const nextTopic=Object.keys(outlineForWire.saju_core)[1];
 assert(generatedWireSchema.properties.chapters.properties.saju_core.properties.paragraphs.properties[nextTopic].anyOf.some(x=>x.type==='null'),'non-anchor topic can still be null');
 const stressWire=wire.schemaFor({requestedSections:['stress'],includeFinal:false,includeCover:false,analysisGuidance:{editorialBlueprint:{stress:{topicTasks:{trigger:{mode:'state-limits'},response:{mode:'use-primary'}}}}}},sampleWireSchema);
 const stressFields=stressWire.properties.chapters.properties.stress.properties.paragraphs.properties;
 assert(stressFields.trigger.anyOf.some(x=>x.type==='null'),'unsupported stress trigger may be skipped');
 assert.equal(stressFields.response.type,'object','the actually supported stress response must anchor the chapter');
 const decoded=wire.decode({chapters:{saju_core:{title:'기본 성향',keyJudgment:'판단을 확인합니다',evidence:['일간'],mood:'reflective',paragraphs:Object.fromEntries(Object.keys(outlineForWire.saju_core).map(t=>[t,t===oneTopic?{label:'핵심',text:'계산된 근거를 설명합니다'}:null]))}},cover:null,finalJudgment:null},wirePrompt);
 assert.deepEqual(decoded.sections[0].bodyTopics,[oneTopic],'null topics are omitted');
 assert.equal(decoded.sections[0].body.length,1,'one grounded explanation remains');
 assert.throws(()=>wire.decode({chapters:{saju_core:{paragraphs:Object.fromEntries(Object.keys(outlineForWire.saju_core).map(t=>[t,null]))}}},wirePrompt),/empty chapter/,'fully empty chapters are rejected');
 const queue=createQueue();let active=0,maxActive=0;const order=[];
 const results=await Promise.allSettled([0,1,2].map(i=>queue(async()=>{maxActive=Math.max(maxActive,++active);order.push(i);await new Promise(r=>setTimeout(r,2));active--;if(i===1)throw Error('provider rejected');return i})));
 assert.equal(maxActive,1);assert.deepEqual(order,[0,1,2]);assert.equal(results[2].value,2);
 assert.equal(retryDelay(new Headers({'retry-after':'90'}),0),90000);
 assert.equal(retryDelay(new Headers({'retry-after':new Date(120000).toUTCString()}),0,0),120000);
 assert.equal(retryDelay(new Headers(),1),40000);
 const promptModule=require('./report-prompt');assert(promptModule.sectionGoals.money.includes('재성'));assert.equal(typeof promptModule.build,'function');const allChapterIds=require('./report-quality-node').IDS;assert.deepEqual(Object.keys(promptModule.sectionGoals),allChapterIds,'every paid chapter must have an explicit premium goal');for(const id of allChapterIds){assert(promptModule.sectionGoals[id].length>=100,id+': chapter-specific interpretation goal too thin');assert(!/실제 사건.*단정/.test(promptModule.sectionGoals[id])||promptModule.sectionGoals[id].includes('않'),id+': unqualified event prediction');}
 const contract=require('./report-server-contract'),outline=require('./report-outline');const noCover={meta:{},sections:require('./report-quality-node').IDS.map(id=>({id,title:id,keyJudgment:'해석',body:['풀이'],evidence:['근거']})),finalJudgment:{body:['종합'],closingQuestion:'전체적으로 주의를 기울입니다.',afterClosingText:''},cover:null};assert(contract.validateShape(noCover).errors.includes('cover required'));for(const ending of ['참고 자료로만 활용하시기 바랍니다.','실제 미래 사건을 예측한 결과는 아닙니다.']){
  const probe={...noCover,finalJudgment:{...noCover.finalJudgment,closingQuestion:ending}};
  assert(require('./report-quality-node').validate(probe,{}).errors.includes('final conclusion is disclaimer instead of personal insight'),'disclaimer conclusion must fail quality gate: '+ending);
 }
 assert.deepEqual(contract.narrativeMotifLedger([{id:'money',keyJudgment:'책임을 확인하고 기준을 검토한다'},{id:'career',keyJudgment:'책임과 기준을 확인하고 설명한다'}]),[{motif:'rules-and-responsibility',chapters:['money','career']}],'later requests must identify repeated causal theses');
 // 2027 money/career/relationship must not all claim the same annual ten-god.
 const annualSample=require('./report-facts-node').build({calendar:'solar',birthDate:'1990-05-15',birthTime:'10:30',gender:'male',mbti:'INTJ'},2027);
 const annualPlan=require('./report-analysis-guidance').preflight(annualSample);
 const sharedMoney=annualPlan.money.topicTasks.earning.evidenceReuseBoundary;
 assert(sharedMoney&&sharedMoney.priorOwners.some(x=>x.chapter==='mbti_contradiction'),'reused natal evidence must identify its first owner before drafting');
 assert(sharedMoney.distinctQuestion===annualPlan.money.topicTasks.earning.question,'reused evidence must carry a distinct question');
 assert.equal(annualPlan.saju_core.topicTasks.temperament.evidenceReuseBoundary,null,'original evidence owner must not claim prior reuse');
 const noAnnualSignal={...annualSample,facts:{...annualSample.facts,annualTenGods:{stemTenGod:'알수없음',hiddenStems:[]},targetYearRelations:[]}};
 const limitedPlan=require('./report-analysis-guidance').preflight(noAnnualSignal);
 for(const id of ['year_2027_money','year_2027_career','year_2027_relationship']){
  assert.equal(limitedPlan[id].annualDomainEvidence.relevant,false,id+': no direct annual domain evidence');
  assert(Object.values(limitedPlan[id].topicTasks).every(t=>t.mode==='state-limits'),id+': natal fallback must not turn missing annual evidence into predictions');
 }
 // A shared annual stem alone must not create a separate career fortune.
 const stemOnly={...annualSample,facts:{...annualSample.facts,annualTenGods:{stemTenGod:'정관',hiddenStems:[]},targetYearRelations:[]}};
 const stemOnlyPlan=require('./report-analysis-guidance').preflight(stemOnly);
 assert.equal(stemOnlyPlan.year_2027_career.annualDomainEvidence.relevant,false,'single shared annual stem must remain in the annual overview');
 const extraCareer={...annualSample,facts:{...annualSample.facts,annualTenGods:{stemTenGod:'정관',hiddenStems:[{tenGod:'편인'}]},targetYearRelations:[]}};
 assert.equal(require('./report-analysis-guidance').preflight(extraCareer).year_2027_career.annualDomainEvidence.relevant,false,'annual hidden-stem labels alone are shared context, not independent career forecasts');
 const relationshipEvidence=annualPlan.year_2027_relationship.annualDomainEvidence;
 assert(!relationshipEvidence.matchedTenGods.some(x=>/정관|편관|정재|편재/.test(x)),'official and wealth ten-gods alone cannot be used to invent annual relationship events');
 for(const [id,pattern] of [['year_2027_money',/^(?:재성|식상|정재|편재|식신|상관)$/],['year_2027_career',/^(?:관성|인성|정관|편관|정인|편인)$/]]){
  const info=annualPlan[id].annualDomainEvidence;
  assert(info.matchedTenGods.every(x=>pattern.test(x)),id+': annual evidence must be specific to that domain');
 }
 assert(contract.findRecycledThemes([
  {id:'money',keyJudgment:'책임의 기준을 검토하고 확인한다'},
  {id:'career',keyJudgment:'책임과 규칙을 확인하고 설명한다'},
  {id:'relationship',keyJudgment:'기준과 책임을 검토한 뒤 확인한다'}
 ]).some(x=>x.includes('responsibility-and-rules')),'three domains must reject recycled cause-and-effect before the next paid call');
 assert.equal(contract.findRecycledThemes([
  {id:'money',keyJudgment:'돈을 저축할 시점을 고른다'},
  {id:'career',keyJudgment:'새 작업을 배우는 순서를 정한다'},
  {id:'relationship',keyJudgment:'서운한 마음을 말로 전한다'}
 ]).length,0,'distinct domain judgments must not be penalized');
 assert(contract.findReusedEvidenceConclusions([
  {id:'money',keyJudgment:'가격을 비교하고 지출을 결정합니다.',evidence:['월간에 계산된 같은 명리 관계의 설명입니다.']},
  {id:'career',keyJudgment:'가격을 비교하고 지출을 결정합니다.',evidence:['월간에 계산된 같은 명리 관계의 설명입니다.']}
 ]).length===1,'same evidence and conclusion must be rejected across chapters');
 assert.equal(contract.findReusedEvidenceConclusions([
  {id:'money',keyJudgment:'가격을 비교하고 지출을 결정합니다.',evidence:['월간에 계산된 같은 명리 관계의 설명입니다.']},
  {id:'career',keyJudgment:'동료와 맡은 작업을 구분해서 처리합니다.',evidence:['월간에 계산된 같은 명리 관계의 설명입니다.']}
 ]).length,0,'shared calculation with distinct conclusion remains permitted');
 const limitedResponse={sections:[{id:'year_2027_relationship',title:'2027년에 책임과 규칙이 중요해집니다',keyJudgment:'정관 기운 때문에 관계의 역할을 확인합니다',bodyTopics:['change','action'],bodyLabels:['역할','규칙'],body:['상대에게 규칙을 요구합니다','관계의 책임을 분배합니다'],evidence:['정관'],mood:'reflective'}]};
 const normalized=contract.enforceAnnualEvidenceLimits(limitedResponse,{year_2027_relationship:{generationMode:'evidence-limit-only'}});
 const grounded=contract.enforceAnnualEvidenceLimits(limitedResponse,{year_2027_relationship:{generationMode:'evidence-limit-only',annualDomainEvidence:{source:'none'}}},{facts:{annualTenGods:{stemTenGod:'정관'}}});
 assert(grounded.sections[0].body[0].includes('정관으로 분류됩니다'),'limited annual chapter must explain calculated personal evidence');
 assert(grounded.sections[0].body[0].includes('관계 분야의 사건이나 변화가 확인되는 것은 아닙니다.'),'natal ten-god must not imply relationship event');
 assert(!grounded.sections[0].body[0].includes('관계의 역할을 확인합니다'),'unsupported original model predictions must be replaced');
 assert(!normalized.sections[0].body.join(' ').includes('정관'),'unsupported 2027 relationship predictions must not survive generation');
 assert(normalized.sections[0].body[0].includes('충이 없다는 사실만으로'),'no-clash calculation is not proof of relationship stability');
 assert.deepEqual(normalized.sections[0].bodyTopics,['change'],'fallback preserves only the grounded topic');
 assert.equal(normalized.sections[0].body.length,1,'fallback should not create a filler paragraph');
 assert.equal(normalized.sections[0].bodyLabels.length,1,'fallback label must match its paragraph');
 assert.equal(contract.enforceAnnualEvidenceLimits(limitedResponse,{year_2027_relationship:{generationMode:'evidence-grounded'}}).sections[0].keyJudgment,limitedResponse.sections[0].keyJudgment,'supported annual chapter must retain model interpretation');
 const sampleInput={calendar:'solar',birthDate:'1990-06-15',unknownBirthTime:true,gender:'male',mbti:'INFP'};
 const blueprint=require('./report-analysis-guidance').preflight(require('./report-facts-node').build(sampleInput,2027));
 const originalBatches=[['saju_core','mbti_contradiction'],['decision','stress'],['money','career'],['relationship','integrated_judgment'],['year_2027','year_2027_money'],['year_2027_career','year_2027_relationship']];
 const expectedBatches=originalBatches.map(ids=>ids.filter(id=>!['year_2027_money','year_2027_career','year_2027_relationship'].includes(id)||blueprint[id]?.annualDomainEvidence?.relevant)).filter(ids=>ids.length);
 const expectedCount=expectedBatches.flat().length;
 const stages=[];const checkpoints=[];let calls=0;
 const mockedReport=await contract.generate({calendar:'solar',birthDate:'1990-06-15',unknownBirthTime:true,gender:'male',mbti:'INFP'},async p=>{calls++;if(p.stage==='body'){assert(p.rules.sectionGoals,'actual model request must include premium section goals');assert.deepEqual(Object.keys(p.rules.chapterOwnershipPlan),p.requestedSections,'each paid chapter must have its own preassigned interpretation scope');assert(Array.isArray(p.rules.reusedEvidenceWithPriorConclusions),'each body request must carry the evidence-reuse ledger');assert(p.rules.reusedEvidenceWithPriorConclusions.every(x=>x.path&&x.chapter&&x.topic&&x.previousConclusion),'evidence reuse must include earlier chapter conclusions');assert(p.rules.reusedEvidenceWithPriorConclusions.every(x=>{const t=blueprint[x.chapter]?.topicTasks?.[x.topic];return t&&(t.mode==='use-primary'?x.path===t.primaryEvidencePath:t.mode==='use-verified-fallback'?t.verifiedFallbackPaths.includes(x.path):false)}),'reuse ledger must not credit missing facts to earlier chapter');for(const id of p.requestedSections)assert(p.rules.chapterOwnershipPlan[id].owns&&p.rules.chapterOwnershipPlan[id].excludes.length,'chapter must have unique ownership and exclusions');assert(p.rules.depthContract.includes('근거가 부족하면'),'actual model request must include depth contract');assert(p.rules.domainUniquenessRule.includes('친밀해지는 속도')&&p.rules.domainUniquenessRule.includes('항목을 생략'),'model must not invent observed domain behaviors to fill slots');assert(p.planningInstruction.includes('장 전체를 null로 반환하지 않는다')&&p.planningInstruction.includes('최소 하나'),'each paid batch must require supported nonempty chapter output');
  assert(p.rules.narrativeRule.includes('전통적 의미')&&p.rules.narrativeRule.includes('관찰된 과거')&&p.rules.narrativeRule.includes('새롭고 독립된 설명'),'body payload must demand depth and protect against invented history and repetitions');assert.deepEqual(Object.keys(p.rules.sectionGoals),p.requestedSections,'do not spend provider tokens on unrelated chapter goals');for(const id of p.requestedSections)assert.equal(p.rules.sectionGoals[id],require('./report-prompt').sectionGoals[id]);}if(p.stage==='synthesis'){assert(p.rules.finalRule.includes('그 사람의 장점과 주의점을 한 문장으로 연결한 최종 결론'),'final synthesis must require a personalized ending');assert(p.rules.finalRule.includes('면책 안내'),'final synthesis must forbid generic disclaimer ending');assert.equal(p.rules.integrateMbti,true,'known MBTI must stay enabled during final synthesis');assert.equal(stages.filter(x=>x.stage==='body'&&x.completed===expectedCount).length,1);assert(p.completedReport.sections.every(s=>s.body.length>=1),'every chapter retains at least one grounded topic');assert(p.completedReport.sections.reduce((n,s)=>n+s.body.length,0)<=28,'optional topics must not add filler paragraphs');return {sections:[],cover:null,finalJudgment:{body:['전체 풀이 검증'],closingQuestion:'꼼꼼하게 확인하느라 결정을 늦출 때는, 오늘 확인할 내용을 먼저 정하는 것이 도움이 됩니다.',afterClosingText:''}}}
 assert.equal(p.stage,'body');assert.equal(p.priorSections.length,expectedBatches.slice(0,calls-1).flat().length);assert.deepEqual(p.requestedSections,expectedBatches[calls-1]);assert(p.editorialTask.includes('최종 본문'));assert.deepEqual(Object.keys(p.rules.topicPlan),p.requestedSections);assert(!('summaryRule' in p.rules));return {sections:p.requestedSections.map(id=>({id,title:id,keyJudgment:id,bodyTopics:Object.keys(outline.topics[id]),bodyLabels:Object.values(outline.topics[id]),body:Object.keys(outline.topics[id]).map(t=>`${id} ${t}에 대한 모의 설명(일반인을 위한 쉬운 뜻풀이)으로 이 문단은 실제 계산된 해석을 담고 있지 않습니다. 독자의 행동과 판단을 설명하는 충분한 근거가 없는 문장입니다.`),evidence:[id+'의 원국과 십성 관계를 구분해 확인하는 모의 분석 자료입니다.']}))}},p=>stages.push(p),batch=>checkpoints.push(batch));
 assert.equal(checkpoints.length,expectedBatches.length,'each verified body batch must be checkpointed once');
 assert.deepEqual(checkpoints.map(x=>x.completedSections),expectedBatches.map((_,i)=>expectedBatches.slice(0,i+1).flat().length));
 assert.deepEqual(checkpoints.flatMap(x=>x.ids),expectedBatches.flat(),'checkpoints follow generation order, not display order');
 assert(checkpoints.every((x,i)=>x.sections.length===expectedBatches[i].length),'checkpoint contains exactly its validated sections');
 // Resume five already validated batches: only the sixth body batch and synthesis
 // may call the mock provider. Never spend calls on the cached ten chapters.
 const resumeStages=[];const resumeCalls=[];
 const resumed=await contract.generate({calendar:'solar',birthDate:'1990-06-15',unknownBirthTime:true,gender:'male',mbti:'INFP'},async p=>{
  resumeCalls.push(p.stage==='body'?p.requestedSections.join(','):'synthesis');
  if(p.stage==='body'){
   assert.deepEqual(p.requestedSections,expectedBatches.at(-1));
   assert.equal(p.priorSections.length,expectedBatches.slice(0,-1).flat().length,'resume must preserve ten earlier chapters');
   return {sections:checkpoints.at(-1).sections};
  }
  assert.equal(p.stage,'synthesis');
  assert.equal(p.completedReport.sections.length,expectedCount);
  return {sections:[],cover:null,finalJudgment:{body:['전체 풀이 검증'],closingQuestion:'꼼꼼하게 확인하느라 결정을 늦출 때는, 오늘 확인할 내용을 먼저 정하는 것이 도움이 됩니다.',afterClosingText:''}};
 },p=>resumeStages.push(p),()=>{},checkpoints.slice(0,-1));
 assert.deepEqual(resumeCalls,[expectedBatches.at(-1).join(','),'synthesis'],'resume must skip five provider body calls');
 assert.equal(resumed.status,'rejected','resume does not bypass final quality gate');
 await assert.rejects(contract.generate({calendar:'solar',birthDate:'1990-06-15',unknownBirthTime:true,gender:'male',mbti:'INFP'},async()=>{throw Error('provider must not be called')},()=>{},()=>{},[checkpoints[1]]),/order mismatch/,'non-prefix checkpoint must fail closed');
 // Tampered checkpoints must fail before any paid provider call.
 const duplicateCheckpoints=JSON.parse(JSON.stringify(checkpoints.slice(0,2)));
 duplicateCheckpoints[1].sections[0].body=duplicateCheckpoints[0].sections[0].body.slice();
 await assert.rejects(contract.generate({calendar:'solar',birthDate:'1990-06-15',unknownBirthTime:true,gender:'male',mbti:'INFP'},async()=>{throw Error('provider must not be called')},()=>{},()=>{},duplicateCheckpoints),/QA resume repeated topic explanations|QA resume recycled chapter thesis/,'reused duplicate chapter text must be rejected before spending');
 assert.equal(mockedReport.status,'rejected','placeholder prose must never be accepted as a paid report');
 assert(mockedReport.qa.errors.length>0,'placeholder report should produce concrete quality failures');
 // A report created for one person must be rejected when checked against another.
 const qualityGate=require('./report-quality-node');
 const inputA={calendar:'solar',birthDate:'1990-05-15',birthTime:'10:30',gender:'male',mbti:'INTJ',name:'검증가'};
 const inputB={calendar:'solar',birthDate:'1994-11-09',birthTime:'18:20',gender:'female',mbti:'ENFP',name:'검증나'};
 const factsA=require('./report-facts-node').build(inputA,2027),factsB=require('./report-facts-node').build(inputB,2027);
 const swapped={...mockedReport.report,meta:{...mockedReport.report.meta,chart:factsA.chart,mbti:'INTJ',name:'검증가',targetYear:2027}};
 const crossUserErrors=qualityGate.validate(swapped,factsB).errors;
 assert(crossUserErrors.some(x=>x.includes('report chart differs')),'swapped Saju chart must be rejected');
 assert(crossUserErrors.some(x=>x.includes('report MBTI differs')),'swapped MBTI must be rejected');
 assert(crossUserErrors.some(x=>x.includes('report display name differs')),'swapped display name must be rejected');
 const wrongYear={...swapped,meta:{...swapped.meta,targetYear:2028}};
 assert(qualityGate.validate(wrongYear,factsA).errors.some(x=>x.includes('target year differs')),'wrong report year must be rejected');
 assert.equal(calls,expectedBatches.length+1);assert(!stages.some(x=>x.stage==='edit'));assert(stages.some(x=>x.stage==='body'&&x.completed===expectedCount));
 let failedCalls=0;await assert.rejects(contract.generate({calendar:'solar',birthDate:'1990-06-15',unknownBirthTime:true,gender:'male',mbti:'INFP'},async()=>{failedCalls++;throw Error('AI report service token rate limit')}));assert.equal(failedCalls,1);
 // Compare the exact first paid-generation payloads across distinct inputs.
 // Names are display-only: they must not change calculated chart evidence.
 const captured=[];
 const samples=[
  {calendar:'solar',birthDate:'1990-05-15',birthTime:'10:30',gender:'male',mbti:'INTJ',name:'검증가'},
  {calendar:'solar',birthDate:'1990-05-15',birthTime:'10:30',gender:'male',mbti:'ENFP',name:'검증나'},
  {calendar:'solar',birthDate:'1994-11-09',birthTime:'18:20',gender:'female',mbti:'INTJ',name:'검증다'},
  {calendar:'solar',birthDate:'1994-11-09',birthTime:'18:20',gender:'female',mbti:'모름',name:'검증라'}
 ];
 for(const sample of samples){
  let first=null;
  await assert.rejects(contract.generate(sample,async prompt=>{first=prompt;throw Error('offline personalization capture');}),/offline personalization capture/);
  assert(first&&first.stage==='body','first model request must be capturable without provider calls');
  assert.deepEqual(first.requestedSections,['saju_core','mbti_contradiction']);
  assert.equal(first.facts.person.mbti,sample.mbti);
  assert.equal(first.analysisGuidance.mbtiReference?.type||'모름',sample.mbti);
  captured.push(first);
 }
 // Paid requests must preserve the same birth facts while changing only the MBTI reference.
 // This offline comparison inspects actual model payloads, not invented sample prose.
 for(const prompt of captured){
  assert.deepEqual(Object.keys(prompt.rules.sectionGoals),prompt.requestedSections,'batch should receive only its own chapter goals');
  assert.deepEqual(Object.keys(prompt.rules.topicPlan),prompt.requestedSections,'batch topic plan must match requested chapters');
  assert(prompt.facts.facts.tenGods,'the model must receive computed ten-god evidence');
  assert(prompt.facts.facts.structuralEvidence,'the model must receive computed structural Saju evidence');
  assert(prompt.facts.facts.annualTenGods,'the model must receive computed annual ten-god evidence');
 }
 assert.equal(captured[0].facts.facts.tenGods.day.stem,captured[1].facts.facts.tenGods.day.stem,'MBTI must not change the day stem');
 assert.notDeepEqual(captured[0].analysisGuidance.mbtiReference,captured[1].analysisGuidance.mbtiReference,'different MBTI must change the model reference');
 assert.notDeepEqual(captured[0].facts.facts.tenGods,captured[2].facts.facts.tenGods,'different birth charts must change computed ten-god evidence');
 assert.equal(captured[3].rules.mbtiOptionalRule.includes('MBTI가 모름이면'),true,'unknown MBTI must follow the explicit no-inference policy');assert.equal(captured[3].rules.integrateMbti,false,'unknown MBTI must explicitly disable MBTI integration');for(const prompt of captured.slice(0,3))assert.equal(prompt.rules.integrateMbti,true,'known MBTI must explicitly enable integration');
 assert.deepEqual(captured[0].facts.chart,captured[1].facts.chart,'MBTI alone must not alter the birth chart');
 assert.notDeepEqual(captured[0].analysisGuidance.mbtiReference.preferences,captured[1].analysisGuidance.mbtiReference.preferences,'different MBTI must produce different interpretation guidance');
 assert.notDeepEqual(captured[0].facts.chart,captured[2].facts.chart,'different birth information must change chart evidence');
 assert.equal(captured[3].analysisGuidance.mbtiReference,null,'unknown MBTI must not be inferred');
 assert.equal(captured[3].rules.integrateMbti,false,'unknown MBTI must explicitly disable integration at first paid call');
 // Also inspect the synthesis payload for a no-MBTI customer without contacting the provider.
 let unknownSynthesisCalls=0,unknownSynthesisSeen=false;
 const unknownResult=await contract.generate({calendar:'solar',birthDate:'1994-11-09',birthTime:'18:20',gender:'female',mbti:'모름',name:'검증라'},async prompt=>{
  unknownSynthesisCalls++;
  assert.equal(prompt.rules.integrateMbti,false,'unknown MBTI must remain disabled at every paid stage');
  if(prompt.stage==='body'){
   for(const id of prompt.requestedSections){
    if(id==='mbti_contradiction'||id==='integrated_judgment'){
     const questions=Object.values(prompt.rules.topicPlan[id]).join(' ');
     assert(!/MBTI/.test(questions),'unknown MBTI must use Saju-only reader questions: '+id);
     assert(!/MBTI/.test(prompt.analysisGuidance.chapterTasks[id].focus),'unknown MBTI must use Saju-only analysis tasks: '+id);
    }
   }
  }
  if(prompt.stage==='body'){
   for(const [id,goal] of Object.entries(prompt.rules.sectionGoals)){
    assert(goal.length>=80,'unknown MBTI must retain detailed chapter goal for '+id);
    assert(!/MBTI|심리유형/.test(goal),'unknown MBTI chapter goal must not ask for personality-type interpretation: '+id);
   }
  }
  if(prompt.stage==='synthesis'){
   unknownSynthesisSeen=true;
   assert.equal(prompt.facts.person.mbti,'모름');
   return {cover:null,finalJudgment:{body:['검증용 결론'],closingQuestion:'검증용 최종 결론입니다.',afterClosingText:''}};
  }
  return {sections:prompt.requestedSections.map(id=>({
   id,title:id,keyJudgment:id,bodyTopics:Object.keys(outline.topics[id]),
   bodyLabels:Object.values(outline.topics[id]),
   body:Object.keys(outline.topics[id]).map(topic=>id+' '+topic+'에 관한 검증용 모의 문장(일반인용 용어 풀이 포함)입니다.'),
   evidence:[id+'의 명리학 계산 근거를 검증하는 모의 데이터입니다.']
  }))};
 });
 assert(unknownSynthesisCalls>=2&&unknownSynthesisCalls<=7,'unknown MBTI must reach evidence-backed body batches and synthesis');
 assert(unknownSynthesisSeen,'unknown MBTI synthesis payload must be inspected');
 assert.equal(unknownResult.status,'rejected','mock narrative must never be accepted as a paid report');


 assert.equal(captured[0].facts.person.name,'검증가');
 let mismatchCalls=0;
 await assert.rejects(contract.generate({calendar:'solar',birthDate:'1990-06-15',unknownBirthTime:true,gender:'male',mbti:'INFP'},async prompt=>{
  mismatchCalls++;
  return {sections:prompt.requestedSections.map(id=>({id,title:'계산값 검증',keyJudgment:'월간의 정관이 확인됩니다.',bodyTopics:Object.keys(outline.topics[id]),bodyLabels:Object.values(outline.topics[id]),body:Object.keys(outline.topics[id]).map(()=> '월간의 정관이 확인됩니다.'),evidence:['월간의 정관'] }))};
 }),/factually inconsistent report data/);
 assert.equal(mismatchCalls,1,'factually incorrect first batch must not trigger six additional paid calls');
 assert.equal(require('./report-diagnostics').failureCode('AI report service returned factually inconsistent report data'),'REPORT_FACT_MISMATCH');
 let duplicatedEvidenceCalls=0;
 await assert.rejects(contract.generate({calendar:'solar',birthDate:'1990-06-15',unknownBirthTime:true,gender:'male',mbti:'INFP'},async prompt=>{
  duplicatedEvidenceCalls++;
  return {sections:prompt.requestedSections.map(id=>({id,title:'본문 증거 검증',keyJudgment:'설명한 내용을 검토합니다.',bodyTopics:Object.keys(outline.topics[id]),bodyLabels:Object.values(outline.topics[id]),body:Object.keys(outline.topics[id]).map(()=> '서로 다른 질문에 답하는 검증 문장입니다.'),evidence:['사주 계산값을 살펴보고 명리학의 위치를 확인한 검증용 근거 문장입니다.']}))};
 }),/repeated chapter evidence/);
 assert.equal(duplicatedEvidenceCalls,1,'duplicate evidence in first batch must not incur further provider calls');
 let emptyCalls=0;await assert.rejects(contract.generate({calendar:'solar',birthDate:'1990-06-15',unknownBirthTime:true,gender:'male',mbti:'INFP'},async()=>{emptyCalls++;return {sections:[]}}));assert.equal(emptyCalls,1);
 const originalFetch=global.fetch,originalKey=process.env.OPENAI_API_KEY,originalModel=process.env.REPORT_MODEL;let providerCalls=0;
 try{process.env.OPENAI_API_KEY='local-test-placeholder';process.env.REPORT_MODEL='local-test-model';global.fetch=async()=>{providerCalls++;return {ok:false,status:429,json:async()=>({error:{code:'rate_limit_exceeded',message:'tokens per min'}})}};await assert.rejects(require('./server').callOpenAI({}),/token rate limit/);assert.equal(providerCalls,1)}finally{global.fetch=originalFetch;for(const [key,value] of [['OPENAI_API_KEY',originalKey],['REPORT_MODEL',originalModel]])if(value===undefined)delete process.env[key];else process.env[key]=value}
 // Responses API may split valid JSON across multiple output_text content blocks.
 const beforeSplitFetch=global.fetch,beforeSplitKey=process.env.OPENAI_API_KEY,beforeSplitModel=process.env.REPORT_MODEL;
 try{
  process.env.OPENAI_API_KEY='local-test-placeholder';process.env.REPORT_MODEL='local-test-model';
  global.fetch=async()=>({ok:true,json:async()=>({output:[{content:[{type:'output_text',text:'{\"ok\":'},{type:'output_text',text:'true}'}]}]})});
  assert.deepEqual(await require('./server').callOpenAI({}),{ok:true});
 }finally{
  global.fetch=beforeSplitFetch;
  for(const [key,value] of [['OPENAI_API_KEY',beforeSplitKey],['REPORT_MODEL',beforeSplitModel]])if(value===undefined)delete process.env[key];else process.env[key]=value;
 }
 // Verify that actual OpenAI requests contain no unsupported JSON Schema bounds.
 let sentSchema=null;
 const savedFetch=global.fetch,savedKey=process.env.OPENAI_API_KEY,savedModel=process.env.REPORT_MODEL;
 try{
  process.env.OPENAI_API_KEY='local-test-placeholder';process.env.REPORT_MODEL='local-test-model';
  global.fetch=async(_url,opts)=>{sentSchema=JSON.parse(opts.body).text.format.schema;return {ok:true,json:async()=>({output_text:JSON.stringify({chapters:{saju_core:{paragraphs:Object.fromEntries(Object.keys(outline.topics.saju_core).map(t=>[t,{label:t,text:t}]))}},cover:null,finalJudgment:null})})}};
  await require('./server').callOpenAI({requestedSections:['saju_core'],includeFinal:false,includeCover:false});
  const walk=x=>{if(!x||typeof x!=='object')return;for(const [k,v] of Object.entries(x)){assert(!['minItems','maxItems','minLength','maxLength','$schema'].includes(k),'unsupported strict schema keyword '+k);walk(v)}};
  walk(sentSchema);assert.deepEqual(sentSchema.properties.chapters.required,['saju_core']);const chapter=sentSchema.properties.chapters.properties.saju_core;assert(chapter.properties.title);assert(chapter.required.includes('title'));assert.deepEqual(chapter.properties.paragraphs.required,Object.keys(outline.topics.saju_core));
 }finally{global.fetch=savedFetch;for(const [key,value] of [['OPENAI_API_KEY',savedKey],['REPORT_MODEL',savedModel]])if(value===undefined)delete process.env[key];else process.env[key]=value}
 assert.equal(require('./report-schema.json').properties.finalJudgment.properties.routines.minItems,0);
 assert.equal(require('./report-schema.json').properties.sections.items.properties.body.minItems,1);
 console.log('PASS no automatic provider retry, no follow-up batches after failure, no continuation after missing topics');
 console.log('PASS shared request queue, failure recovery, Retry-After seconds/date, all 29 topics, 7 model calls, no full rewrite, synthesis after all chapters');
})().catch(e=>{console.error(e);process.exitCode=1});


