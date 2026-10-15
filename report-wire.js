'use strict';
// Required object keys make the 35 topics structural requirements. Parallel
// arrays cannot guarantee equal lengths or the association of text and topic.
const {topics}=require('./report-outline');
const reader=require('./report-reader-policy');
const visible=s=>reader.describe(s,reader.readerField);
const paragraph=(question,optional=false)=>{
 const schema=object({label:visible({type:'string'}),text:visible({type:'string'})});
 schema.properties.text.description+=' 이 문단의 질문: '+question+' 상황과 선택을 먼저 설명하고 그 이유를 연결한다. 앞 문단의 결론을 표현만 바꾸어 반복하지 않는다. 유형의 선호를 실제 행동이나 능력으로 바꾸어 단정하지 않는다.';
 if(optional)schema.description='독립된 설명이 있을 때만 작성한다. 같은 응답 안에서 이미 답한 내용이면 이유와 상황을 첫 문단에 충분히 남기고 이 항목은 null로 반환한다. 차이나 반전을 만들어 채우지 않는다.';
 return schema;
};
const object=properties=>({type:'object',additionalProperties:false,required:Object.keys(properties),properties});
function schemaFor(prompt,reportSchema){
 if(!Array.isArray(prompt?.requestedSections))return reportSchema;
 const section=reportSchema.properties.sections.items.properties;
 const chapters=Object.fromEntries(prompt.requestedSections.map(id=>{
  if(!topics[id])throw Error('unknown report section');
  const plan=prompt.analysisGuidance?.editorialBlueprint?.[id]?.topicTasks||{};
  const keys=Object.keys(topics[id]);
  const plannedAnchor=prompt.analysisGuidance?.editorialBlueprint?.[id]?.anchorTopic;
  const anchor=plannedAnchor||keys.find(k=>plan[k]?.mode==='use-primary')||keys.find(k=>plan[k]?.mode==='use-verified-fallback')||keys[0];
  if(plannedAnchor&&!keys.includes(plannedAnchor))throw Error('Invalid report chapter writing plan');
  // A paid chapter cannot consist entirely of null topics. When no interpretive
  // basis exists, the anchor must explain the specific limit, not invent behavior.
  return [id,object({title:visible(section.title),keyJudgment:visible(section.keyJudgment),evidence:reader.describe(section.evidence,reader.evidenceField),mood:section.mood,
   paragraphs:object(Object.fromEntries(keys.map(topic=>[topic,topic===anchor?paragraph(plan[topic]?.question||topics[id][topic]):plan[topic]?.mode==='state-limits'?{type:'null'}:{anyOf:[paragraph(plan[topic]?.question||topics[id][topic],true),{type:'null'}]}])))})];
 }));
 return object({chapters:object(chapters),finalJudgment:prompt.includeFinal?visible(reportSchema.properties.finalJudgment):{type:'null'},cover:prompt.includeCover?visible(reportSchema.properties.cover):{type:'null'}});
}
function decode(value,prompt){
 if(!Array.isArray(prompt?.requestedSections))return value;
 if(!value?.chapters||typeof value.chapters!=='object')throw Error('AI report service returned invalid report structure');
 const sections=prompt.requestedSections.map(id=>{
  const s=value.chapters[id];if(!s?.paragraphs)throw Error('AI report service returned invalid report structure');
  const plan=prompt.analysisGuidance?.editorialBlueprint?.[id];
  const anchor=plan?.anchorTopic;
  if(anchor&&(!s.paragraphs[anchor]||typeof s.paragraphs[anchor].text!=='string'||!s.paragraphs[anchor].text.trim()||typeof s.paragraphs[anchor].label!=='string'||!s.paragraphs[anchor].label.trim()))throw Error('AI report service missing planned evidence anchor: '+id+':'+anchor);
  for(const [topic,task] of Object.entries(plan?.topicTasks||{}))if(task.mode==='state-limits'&&topic!==anchor&&s.paragraphs[topic]!==null)throw Error('AI report service generated unsupported topic: '+id+':'+topic);
  const bodyTopics=Object.keys(topics[id]).filter(t=>s.paragraphs[t]&&typeof s.paragraphs[t].text==='string'&&s.paragraphs[t].text.trim()&&typeof s.paragraphs[t].label==='string'&&s.paragraphs[t].label.trim());
  if(!bodyTopics.length){console.error('[Report empty chapter diagnostic]',{chapterId:id,requestedSections:prompt.requestedSections,topics:Object.fromEntries(Object.keys(topics[id]).map(t=>[t,s.paragraphs[t]===null?'null':typeof s.paragraphs[t]?.text==='string'?'blank-or-incomplete':'missing']))});throw Error('AI report service returned an empty chapter');}
  return {id,title:s.title,keyJudgment:s.keyJudgment,evidence:s.evidence,mood:s.mood,bodyTopics,
   bodyLabels:bodyTopics.map(t=>s.paragraphs[t]?.label),body:bodyTopics.map(t=>s.paragraphs[t]?.text)};
 });
 return {sections,finalJudgment:value.finalJudgment,cover:value.cover};
}
const instruction='The JSON schema is the authoritative transport format: return chapters keyed by requested section ID, with paragraphs keyed by every topicPlan key. For each topic return either an object with label and text when supported by distinct calculated evidence, or null when it would repeat another topic or lack direct grounds. The schema requires one evidence-selected anchor paragraph per chapter; explain a specific evidence limit there if needed, without inventing traits. Topics marked state-limits by the canonical analysis plan MUST be null (except the mandatory anchor, which must explain the specific limit without inventing traits); other topics may be null. Never invent interpretations to fill slots. Do not return sections/body/bodyLabels/bodyTopics arrays; the server reconstructs those arrays. For synthesis, chapters must be an empty object. All editorial and factual rules still apply.';
module.exports={schemaFor,decode,instruction};
