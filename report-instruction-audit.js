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
    for(const topic of Object.keys(writingTopics))if(!validTopicIds.includes(topic))errors.push('model topic not in transport schema: '+id+'/'+topic);
    for(const topic of validTopicIds)if(!Object.hasOwn(writingTopics,topic))errors.push('transport topic missing from model prompt: '+id+'/'+topic);
   }
   const active=new Set(plan.activeTopicKeys||[]);
   // Fail closed if the actual provider schema cannot represent the planned output.
   const reportSchema=require('./report-schema.json');
   const wire=require('./report-wire');
   let transport;
   try{transport=wire.schemaFor({requestedSections:[id],includeFinal:false,includeCover:false,analysisGuidance:{editorialBlueprint:{[id]:plan}}},reportSchema)}
   catch(err){errors.push('invalid transport plan: '+id+': '+err.message);continue}
   const slots=transport.properties.chapters.properties[id].properties.paragraphs.properties;
   for(const [topic,task] of Object.entries(plan.topicTasks||{})){
    const slot=slots[topic];
    if(!slot){errors.push('missing transport slot: '+id+'/'+topic);continue}
    if(topic===plan.anchorTopic&&slot.type!=='object')errors.push('nullable mandatory anchor: '+id+'/'+topic);
    if(task.mode==='state-limits'&&topic!==plan.anchorTopic&&slot.type!=='null')errors.push('unsupported topic writable: '+id+'/'+topic);
    if(task.mode!=='state-limits'&&topic!==plan.anchorTopic&&!slot.anyOf?.some(v=>v.type==='null'))errors.push('supported optional topic cannot be omitted: '+id+'/'+topic);
   }
   for(const [topic,t] of Object.entries(plan.topicTasks||{}))if(t.mode==='state-limits'&&active.has(topic))errors.push('unsupported active topic: '+id+'/'+topic);
   if(/^year_2027_(money|career|relationship)$/.test(id)&&!plan.annualDomainEvidence?.relevant)errors.push('ungrounded annual domain: '+id);
   // Compare the complete writing plan with the exact strict transport schema.
   // This catches disagreements before a paid provider can return an empty chapter.
   if(plan.anchorTopic&&plan.topicTasks){
    const expectedTopics=Object.keys(require('./report-outline').topics[id]||{});
    const taskTopics=Object.keys(plan.topicTasks);
    if(JSON.stringify(expectedTopics)!==JSON.stringify(taskTopics))errors.push('plan/outline topic mismatch: '+id);
    const activeExpected=taskTopics.filter(topic=>plan.topicTasks[topic].mode!=='state-limits');
    if(JSON.stringify(activeExpected)!==JSON.stringify(plan.activeTopicKeys))errors.push('active topic/order mismatch: '+id);
    const primary=taskTopics.find(t=>plan.topicTasks[t].mode==='use-primary');
    const fallback=taskTopics.find(t=>plan.topicTasks[t].mode==='use-verified-fallback');
    if(plan.anchorTopic!==(primary||fallback||null))errors.push('noncanonical anchor selection: '+id);
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
function assert(prompt){const errors=inspect(prompt);if(errors.length){console.error('[Report instruction audit]',{stage:prompt.stage,errors});throw Error('AI report service has contradictory generation instructions')}return prompt}
module.exports={inspect,assert};
