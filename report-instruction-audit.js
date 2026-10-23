'use strict';
// Final, composed payload audit. Executed before spending provider tokens.
// Keep semantic rules centralized here rather than adding scattered prompt patches.
const forbiddenFixedQuotas=[
 /12개 장과 29개 항목을 모두/,
 /각 12개 장은/,
 /12개 장은 같은 성향을/,
 /각 장은 3~4개의 의미가 다른 문단/,
 /목차에 지정된 항목마다 독립적인 문단/
];
function inspect(prompt){
 const errors=[];
 const body=prompt?.stage==='body';
 const rules=prompt?.rules||{};
 for(const [name,value] of Object.entries(rules))if(value==null)errors.push('missing rule: '+name);
 if(rules.hanjaPolicy!==require('./report-reader-policy').instruction)errors.push('reader language policy replaced or missing');
 const prose=JSON.stringify({rules,planningInstruction:prompt.planningInstruction,editorialTask:prompt.editorialTask,analysisGuidance:prompt.analysisGuidance})||'';
 for(const phrase of ['2027년 분석 네 장에서는','한 가지 뜻은 한 번만 쓰며 제목·핵심 판정·본문·총평에서','무엇을 얼마나 꼼꼼하게·빠르게·끈기 있게'])
  if(prose.includes(phrase))errors.push('obsolete scope or unsupported precision instruction: '+phrase);
 // Inspect the actual chapter plan as well as general rules: neutral rules
 // cannot cancel a task that presupposes opposite conclusions.
 const comparisonTasks=JSON.stringify({topicPlan:rules.topicPlan,chapterPlan:rules.chapterOwnershipPlan,analysisGuidance:prompt.analysisGuidance})||'';
 for(const phrase of ['같은 선택에서 서로 다른 결론을 제시하는 조건','사주와 MBTI가 다른 판단을 낳는 구체적인 경계'])
  if(comparisonTasks.includes(phrase))errors.push('forced contrast in writing plan');
 for(const pattern of [/명리 용어를 지우지 말고/,/핵심 명리 용어를 본문에/,/십성 이름·위치를 본문에서도/,/명리 용어를 괄호로 풀어/,/명리 용어와 짧은 뜻을 본문에/])if(pattern.test(prose))errors.push('conflicting visible jargon instruction');
 for(const pattern of forbiddenFixedQuotas)if(pattern.test(prose))errors.push('obsolete forced quota: '+pattern.source);
 if(body){
  // Compare only independent interpretation contracts to the input type,
  // never to inferred personality. An omitted or overwritten comparison
  // contract would silently re-enable unsupported MBTI/Saju contradictions.
  if(prompt?.facts?.person&&prompt?.facts?.facts?.tenGods){
   const expected=require('./report-analysis-guidance')
    .forRequest(prompt.requestedSections||[],prompt.facts.person.mbti).comparisonContract;
   if(JSON.stringify(prompt.analysisGuidance?.comparisonContract)!==JSON.stringify(expected))
    errors.push('missing or altered independent MBTI-Saju comparison contract');
  }
  const bindings=require('./report-fact-bindings');
  if(prompt.facts?.facts?.tenGods){
   if(JSON.stringify(prompt.factBindings)!==JSON.stringify(bindings.build(prompt.facts)))errors.push('missing or altered positional fact bindings');
   if(prompt.factBindingRule!==bindings.instruction)errors.push('missing positional fact writing policy');
  }
  if(!Array.isArray(prompt.requestedSections)||!prompt.requestedSections.length)errors.push('no requested chapters');
  if(!/state-limits.{0,60}null/.test(String(prompt.planningInstruction)))errors.push('missing null-topic writing policy');
  if(!/state-limits.{0,70}null/.test(String(rules.paragraphGuide)))errors.push('paragraph instruction overrides null-topic policy');
  if(!/전통 해석/.test(String(rules.tone)))errors.push('missing fact/interpretation tone separation');
  if(!/문단 수를 강요하지 않는다/.test(String(rules.narrativeRule)))errors.push('missing evidence-based paragraph length');
  const hasCalculatedChart=!!(prompt.facts?.facts?.tenGods&&prompt.facts?.facts?.structuralEvidence);
  for(const id of hasCalculatedChart?prompt.requestedSections||[]:[]){
   const plan=prompt.analysisGuidance?.editorialBlueprint?.[id];
   if(!plan?.hasGroundedTopic||!plan?.anchorTopic){errors.push('ungrounded chapter: '+id);continue}
   if(!['use-primary','use-verified-fallback'].includes(plan.topicTasks?.[plan.anchorTopic]?.mode))errors.push('ungrounded chapter anchor: '+id);
   // The final model question map must be compatible with the chapter's
   // validated topic IDs. A mismatched prompt can waste a call even if the
   // transport schema and evidence blueprint are individually valid.
   const writingTopics=rules.topicPlan?.[id];
   if(!writingTopics||typeof writingTopics!=='object')errors.push('missing model topic plan: '+id);
   else {
    const validTopicIds=Object.keys(require('./report-outline').topics[id]||{});
    if(prompt.qaNatalDepthPreview===true&&id==='saju_core')
     validTopicIds.push('natal_depth');
    for(const topic of Object.keys(writingTopics))if(!validTopicIds.includes(topic))errors.push('model topic not in transport schema: '+id+'/'+topic);
    for(const topic of validTopicIds)if(!Object.hasOwn(writingTopics,topic))errors.push('transport topic missing from model prompt: '+id+'/'+topic);
   }
   const active=new Set(plan.activeTopicKeys||[]);
   // Fail closed if the actual provider schema cannot represent the planned output.
   const reportSchema=require('./report-schema.json');
   const wire=require('./report-wire');
   let transport;
   // Reconstruct the SAME source- and stage-bound writing schema used by
   // the billable provider. The older audit silently omitted facts/stage,
   // so it missed locked core conclusions and identical-category branches.
   const schemaPrompt={...prompt,requestedSections:[id],includeFinal:false,includeCover:false,
    analysisGuidance:{...prompt.analysisGuidance,editorialBlueprint:{[id]:plan}}};
   try{transport=wire.schemaFor(schemaPrompt,reportSchema)}
   catch(err){errors.push('invalid transport plan: '+id+': '+err.message);continue}
   const slots=transport.properties.chapters.properties[id].properties.paragraphs.properties;
   if(id==='saju_core'&&prompt.facts?.status==='ready'){
    const thesis=require('./report-core-thesis').forPrompt(schemaPrompt);
    const month=require('./report-chart-contrast').build(prompt.facts)?.monthTenGodContext;
    const text=slots.strength?.properties?.text?.description||'';
    const chapterSchema=transport.properties.chapters.properties.saju_core.properties;
    if(!thesis||JSON.stringify(chapterSchema.title?.enum)!==JSON.stringify([thesis.title])||
       JSON.stringify(chapterSchema.keyJudgment?.enum)!==JSON.stringify([thesis.keyJudgment]))
     errors.push('core-fixed-thesis-missing-from-audited-schema');
    if(!month?.monthStem?.sourceId||!month?.monthMainHidden?.sourceId||
       !text.includes(thesis?.keyJudgment||'__missing_locked_thesis__')||
       (month.sameClassification?
        !text.includes('두 출생 위치의 십성 분류와 전통적 뜻이 같으므로')||
         text.includes('두 출처의 서로 다른 뜻'):
        !text.includes('두 의미를 별도 질문 두 개나 누구에게나 해당하는 준비 조언으로 바꾸지 않는다')))
     errors.push('core-month-pair-writing-branch-disagrees-with-facts');
   }
   for(const [topic,task] of Object.entries(plan.topicTasks||{})){
    const slot=slots[topic];
    if(!slot){errors.push('missing transport slot: '+id+'/'+topic);continue}
    if(topic===plan.anchorTopic&&slot.type!=='object')errors.push('nullable mandatory anchor: '+id+'/'+topic);
    if(task.mode==='state-limits'&&topic!==plan.anchorTopic&&slot.type!=='null')errors.push('unsupported topic writable: '+id+'/'+topic);
    // QA-only natal-depth is a deliberate evidence-qualified writing
    // diagnostic; null would leave the ONLY requested depth unwritten.
    // All ordinary/production optional report topics remain nullable.
    const requiredQaDepth=prompt.qaNatalDepthPreview===true&&
      id==='saju_core'&&topic==='natal_depth'&&task.mode==='use-primary';
    if(requiredQaDepth){
     if(slot.type!=='object'||slot.anyOf)
      errors.push('qa-required-depth-not-structurally-present: '+id+'/'+topic);
    }else if(task.mode!=='state-limits'&&topic!==plan.anchorTopic&&
      !slot.anyOf?.some(v=>v.type==='null'))
     errors.push('supported optional topic cannot be omitted: '+id+'/'+topic);
   }
   for(const [topic,t] of Object.entries(plan.topicTasks||{}))if(t.mode==='state-limits'&&active.has(topic))errors.push('unsupported active topic: '+id+'/'+topic);
   if(/^year_2027_(money|career|relationship)$/.test(id)&&!plan.annualDomainEvidence?.relevant)errors.push('ungrounded annual domain: '+id);
   // Compare the complete writing plan with the exact strict transport schema.
   // This catches disagreements before a paid provider can return an empty chapter.
   if(plan.anchorTopic&&plan.topicTasks){
    const expectedTopics=Object.keys(require('./report-outline').topics[id]||{});
    if(prompt.qaNatalDepthPreview===true&&id==='saju_core')
     expectedTopics.push('natal_depth');
    const taskTopics=Object.keys(plan.topicTasks);
    if(JSON.stringify(expectedTopics)!==JSON.stringify(taskTopics))errors.push('plan/outline topic mismatch: '+id);
    const activeExpected=taskTopics.filter(topic=>plan.topicTasks[topic].mode!=='state-limits');
    if(JSON.stringify(activeExpected)!==JSON.stringify(plan.activeTopicKeys))errors.push('active topic/order mismatch: '+id);
    const primary=taskTopics.find(t=>plan.topicTasks[t].mode==='use-primary');
    const fallback=taskTopics.find(t=>plan.topicTasks[t].mode==='use-verified-fallback');
    // In the paid Saju core, the positional month ten-god reading is the
    // substantive anchor; the seasonal/visible observation is optional.
    const mandated=id==='saju_core'&&plan.topicTasks.strength?.mode==='use-primary'
     ?'strength':primary||fallback||null;
    if(plan.anchorTopic!==mandated)errors.push('noncanonical anchor selection: '+id);
   }
  }
 }
 if(prompt?.stage==='synthesis'){
  if(!prompt.includeFinal||!prompt.includeCover)errors.push('synthesis must generate final and cover');
  const sections=prompt.completedReport?.sections||[];
  if(!sections.length)errors.push('synthesis has no chapters');
  const ids=sections.map(ch=>ch?.id);
  const expected=require('./report-quality-node').IDS;
  if(new Set(ids).size!==ids.length)errors.push('synthesis duplicates chapter');
  if(JSON.stringify(ids)!==JSON.stringify(expected.filter(id=>ids.includes(id))))errors.push('synthesis chapter order mismatch');
  if(!ids.includes('saju_core')||!ids.includes('year_2027'))errors.push('synthesis missing required chapters');
  if(/앞의 12개 장/.test(String(rules.finalRule)))errors.push('synthesis presumes 12 chapters');
 }
 return errors;
}
// A full server prompt can be correct while the much smaller JSON sent to
// the provider has silently lost the instructions. Audit THAT actual boundary
// before any paid API request. A future edit to compile() must not reintroduce
// the same "rules were written, but the model never received them" failure.
function inspectTransport(prompt,actual){
 const errors=[];
 if(!actual||actual.version!=='evidence-first-v1'||actual.stage!==prompt?.stage)
  return ['missing-or-invalid-paid-provider-payload'];
 const task=actual.task||{};
 if(prompt.stage==='body'){
  const expectedBrief=require('./report-generation-request').editorialGoalFor(prompt);
  if(task.editorialGoal!==expectedBrief)
   errors.push('body-editorial-brief-dropped');
  if(JSON.stringify(task.previousSections)!==JSON.stringify(prompt.priorSections||[]))
   errors.push('previous-report-conclusions-dropped');
  const expectedReusable=(prompt.rules?.reusedEvidenceWithPriorConclusions||[]);
  if(JSON.stringify(task.reusedEvidence)!==JSON.stringify(expectedReusable.map(
   ({path,chapter,topic,previousConclusion})=>({path,chapter,topic,previousConclusion}))))
   errors.push('verified-prior-evidence-dropped');
  for(const id of prompt.requestedSections||[]){
   const upstream=prompt.analysisGuidance?.chapterTasks?.[id]||{};
   const chapter=task.chapters?.[id];
   if(!chapter){errors.push('provider-chapter-missing:'+id);continue}
   if(chapter.analysisGoal!==(prompt.rules?.sectionGoals?.[id]||null))
    errors.push('chapter-depth-goal-dropped:'+id);
   if(chapter.analysisFocus!==(upstream.focus||null))
    errors.push('chapter-focus-dropped:'+id);
   if(chapter.safety?.avoid!==(upstream.avoid||''))
    errors.push('chapter-safety-dropped:'+id);
   const plan=prompt.analysisGuidance?.editorialBlueprint?.[id];
   if(chapter.anchor!==plan?.anchorTopic||
     JSON.stringify(Object.keys(chapter.topics||{}))!==JSON.stringify(Object.keys(plan?.topicTasks||{})))
    errors.push('grounded-topic-plan-dropped:'+id);
   // Verify the actual evidence/meaning table before an API call. Without
   // this, a topic can describe an unrelated symbol despite strict response
   // IDs, or a future compiler edit can silently discard the chart meaning.
   const writer=require('./report-generation-request');
   for(const [topicId,topic] of Object.entries(chapter.topics||{})){
    const permitted=[...writer.allowedRefs(actual,topic,id,topicId)];
    const candidates=topic.citableFacts;
    if(!Array.isArray(candidates)||
       JSON.stringify(candidates.map(x=>x.id))!==JSON.stringify(permitted)){
     errors.push('topic-citable-sources-drift:'+id+'/'+topicId);
     continue;
    }
    // Reconstruct BOTH the reader-facing question and the source audit from
    // validated original calculations. A source list alone cannot prove the
    // paid writer received the right interpretation goal.
    if(id==='saju_core'){
     if(topicId==='natal_depth'){
      const correct=prompt.qaNatalDepthPreview===true&&
       ['natal.year.stem','natal.month.stem','natal.day.stem',
        'natal.hour.stem','facts.stemConnections'].every(x=>permitted.includes(x));
      const independent=['year','month','day','hour'].map(position=>{
       const sourceId='natal.'+position+'.stem';
       const truth=actual.source?.[sourceId]||{};
       return {position,sourceId,category:truth.tenGod,
        traditionalMeaning:truth.traditionalMeaning||null,
        observedBehavior:false};
      });
      const expected={kind:'qa-verified-natal-interpretive-contrast',
       sourceRefs:permitted.slice(),positions:independent,
       verifiedLinks:require('./report-core-paid-natal-linkage-brief').select(prompt.facts),
       verifiedElementDirections:require('./report-core-paid-natal-visible-relation-bridge').build(prompt.facts,actual.source),
       readerScope:'distinct-from-month-pair-core',
       writingQuestion:'기본 월 풀이를 되풀이하거나 해와 시간의 분류 뜻을 두 줄로 병렬 나열해 심화인 척하지 않는다. positions와 verifiedLinks를 사용해 실제 계산 위치를 구별하고, verifiedElementDirections의 해·달·시간 오행 관계 방향이 이 명식에서 어떻게 다른지도 검토한다. 오행의 생극 방향은 계산된 상징 관계일 뿐 실제 성격·관계·직업에 적용된 작용, 우선순위, 성공을 증명하지 않는다. 근거와 채택된 전통 해석 방법 없이 생극 방향을 개인 행동·예측으로 바꾸거나 상투적 생활 조언으로 대신하지 않는다. 이런 의미 연결이 불확실하면 더 깊은 결론을 억지로 만들어 내지 말고 인간 편집 검수 대상으로 남긴다.',
       requiredCitations:['natal.year.stem','natal.day.stem','natal.hour.stem','facts.stemConnections']};
      if(!correct||independent.some(x=>!x.category)||
         !independent[0].traditionalMeaning||!independent[3].traditionalMeaning||
         JSON.stringify(topic.evidenceFocus)!==JSON.stringify(expected))
       errors.push('qa-natal-depth-evidence-brief-drift');
     }else{
      const contrast=require('./report-chart-contrast');
      const original=contrast.build(prompt.facts);
      const expected=original&&contrast.forProvider(original,topicId,permitted);
      if(!expected||JSON.stringify(topic.evidenceFocus)!==JSON.stringify(expected))
       errors.push('core-reader-evidence-brief-drift:'+id+'/'+topicId);
     }
    }
    for(const candidate of candidates){
     const truth=actual.source?.[candidate.id]||{};
     if(candidate.position!==(truth.position||undefined)||
        candidate.layer!==(truth.layer||undefined)||
        candidate.tenGod!==(truth.tenGod||undefined)||
        candidate.traditionalMeaning!==(truth.traditionalMeaning||undefined)||
        (candidate.id==='person.mbti'&&candidate.inputType!==truth.type)){
      errors.push('topic-citable-meaning-drift:'+id+'/'+topicId);
      break;
     }
    }
   }
  }
  const mbti=prompt.analysisGuidance?.mbtiReference;
  const coreOnly=Array.isArray(prompt.requestedSections)&&
   prompt.requestedSections.length===1&&prompt.requestedSections[0]==='saju_core';
  if(coreOnly){
   // A source-scoped Saju core must NOT import the input MBTI into its
   // first chapter. Later MBTI chapters still require source preservation.
   if(Object.hasOwn(actual.source||{},'person.mbti')||task.mbti!=null)
    errors.push('saju-core-request-leaked-mbti-source');
  }else if(Boolean(actual.source?.['person.mbti'])!==Boolean(mbti))
   errors.push('mbti-input-source-dropped-or-invented');
  if(coreOnly){
   if(task.comparisonContract!=null)
    errors.push('saju-core-request-leaked-comparison-contract');
  }else if(JSON.stringify(task.comparisonContract)!==
      JSON.stringify(prompt.analysisGuidance?.comparisonContract||null))
   errors.push('independent-framework-contract-dropped');
 }else if(prompt.stage==='synthesis'){
  if(task.editorialGoal!==(prompt.rules?.finalEditingTask||null))
   errors.push('final-editorial-brief-dropped');
  if(JSON.stringify(task.completedReport)!==JSON.stringify(prompt.completedReport))
   errors.push('validated-chapters-dropped-from-synthesis');
 }
 return errors;
}
function assertTransport(prompt,actual){
 const errors=inspectTransport(prompt,actual);
 if(errors.length){
  console.error('[Paid provider transport audit]',{stage:prompt?.stage,errors});
  throw Error('AI report service lost verified writing instructions before provider request');
 }
 return actual;
}
function assert(prompt){const errors=inspect(prompt);if(errors.length){console.error('[Report instruction audit]',{stage:prompt.stage,errors});throw Error('AI report service has contradictory generation instructions')}return prompt}
module.exports={inspect,assert,inspectTransport,assertTransport};
