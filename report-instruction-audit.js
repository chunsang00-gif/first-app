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
 const prose=JSON.stringify({rules,planningInstruction:prompt.planningInstruction,editorialTask:prompt.editorialTask,analysisGuidance:prompt.analysisGuidance})||'';
 for(const pattern of forbiddenFixedQuotas)if(pattern.test(prose))errors.push('obsolete forced quota: '+pattern.source);
 if(body){
  if(!Array.isArray(prompt.requestedSections)||!prompt.requestedSections.length)errors.push('no requested chapters');
  if(!/state-limits.{0,60}null/.test(String(prompt.planningInstruction)))errors.push('missing null-topic writing policy');
  if(!/state-limits.{0,70}null/.test(String(rules.paragraphGuide)))errors.push('paragraph instruction overrides null-topic policy');
  if(!/전통 해석/.test(String(rules.tone)))errors.push('missing fact/interpretation tone separation');
  if(!/문단 수를 강요하지 않는다/.test(String(rules.narrativeRule)))errors.push('missing evidence-based paragraph length');
  for(const id of prompt.requestedSections||[]){
   const plan=prompt.analysisGuidance?.editorialBlueprint?.[id];
   if(!plan?.hasGroundedTopic||!plan?.anchorTopic){errors.push('ungrounded chapter: '+id);continue}
   if(!['use-primary','use-verified-fallback'].includes(plan.topicTasks?.[plan.anchorTopic]?.mode))errors.push('ungrounded chapter anchor: '+id);
   const active=new Set(plan.activeTopicKeys||[]);
   for(const [topic,t] of Object.entries(plan.topicTasks||{}))if(t.mode==='state-limits'&&active.has(topic))errors.push('unsupported active topic: '+id+'/'+topic);
   if(/^year_2027_(money|career|relationship)$/.test(id)&&!plan.annualDomainEvidence?.relevant)errors.push('ungrounded annual domain: '+id);
  }
 }
 if(prompt?.stage==='synthesis'){
  if(!prompt.includeFinal||!prompt.includeCover)errors.push('synthesis must generate final and cover');
  const sections=prompt.completedReport?.sections||[];
  if(!sections.length)errors.push('synthesis has no chapters');
  if(/앞의 12개 장/.test(String(rules.finalRule)))errors.push('synthesis presumes 12 chapters');
 }
 return errors;
}
function assert(prompt){const errors=inspect(prompt);if(errors.length){console.error('[Report instruction audit]',{stage:prompt.stage,errors});throw Error('AI report service has contradictory generation instructions')}return prompt}
module.exports={inspect,assert};
