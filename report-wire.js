'use strict';
// Required object keys make the 35 topics structural requirements. Parallel
// arrays cannot guarantee equal lengths or the association of text and topic.
const {topics}=require('./report-outline');
const object=properties=>({type:'object',additionalProperties:false,required:Object.keys(properties),properties});
function schemaFor(prompt,reportSchema){
 if(!Array.isArray(prompt?.requestedSections))return reportSchema;
 const section=reportSchema.properties.sections.items.properties;
 const chapters=Object.fromEntries(prompt.requestedSections.map(id=>{
  if(!topics[id])throw Error('unknown report section');
  return [id,object({title:section.title,keyJudgment:section.keyJudgment,evidence:section.evidence,mood:section.mood,
   paragraphs:object(Object.fromEntries(Object.keys(topics[id]).map(topic=>[topic,{anyOf:[object({label:{type:'string'},text:{type:'string'}}),{type:'null'}]}])))})];
 }));
 return object({chapters:object(chapters),finalJudgment:prompt.includeFinal?reportSchema.properties.finalJudgment:{type:'null'},cover:prompt.includeCover?reportSchema.properties.cover:{type:'null'}});
}
function decode(value,prompt){
 if(!Array.isArray(prompt?.requestedSections))return value;
 if(!value?.chapters||typeof value.chapters!=='object')throw Error('AI report service returned invalid report structure');
 const sections=prompt.requestedSections.map(id=>{
  const s=value.chapters[id];if(!s?.paragraphs)throw Error('AI report service returned invalid report structure');
  const bodyTopics=Object.keys(topics[id]).filter(t=>s.paragraphs[t]&&typeof s.paragraphs[t].text==='string'&&s.paragraphs[t].text.trim()&&typeof s.paragraphs[t].label==='string'&&s.paragraphs[t].label.trim());
  if(!bodyTopics.length)throw Error('AI report service returned an empty chapter');
  return {id,title:s.title,keyJudgment:s.keyJudgment,evidence:s.evidence,mood:s.mood,bodyTopics,
   bodyLabels:bodyTopics.map(t=>s.paragraphs[t]?.label),body:bodyTopics.map(t=>s.paragraphs[t]?.text)};
 });
 return {sections,finalJudgment:value.finalJudgment,cover:value.cover};
}
const instruction='The JSON schema is the authoritative transport format: return chapters keyed by requested section ID, with paragraphs keyed by every topicPlan key. For each topic return either an object with label and text when supported by distinct calculated evidence, or null when it would repeat another topic or lack direct grounds. At least one non-null topic is required in every chapter. Never invent interpretations to fill slots. Do not return sections/body/bodyLabels/bodyTopics arrays; the server reconstructs those arrays. For synthesis, chapters must be an empty object. All editorial and factual rules still apply.';
module.exports={schemaFor,decode,instruction};
