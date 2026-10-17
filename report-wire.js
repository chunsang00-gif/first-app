'use strict';
// Required object keys make the 35 topics structural requirements. Parallel
// arrays cannot guarantee equal lengths or the association of text and topic.
const {topics}=require('./report-outline');
const reader=require('./report-reader-policy');
const visible=s=>reader.describe(s,reader.readerField);
const paragraph=(question,optional=false,readerRole=null)=>{
 const schema=object({label:visible({type:'string'}),text:visible({type:'string'})});
 schema.properties.text.description+=' 이 문단의 질문: '+question+' 상황과 선택을 먼저 설명하고 그 이유를 연결한다. 앞 문단의 결론을 표현만 바꾸어 반복하지 않는다. 유형의 선호를 실제 행동이나 능력으로 바꾸어 단정하지 않는다.';
 // Descriptions are passed to the ACTUAL provider JSON schema. Server-side
 // editorial rules alone were not enough: most are removed by compile().
 if(readerRole){
  schema.properties.label.description+=' '+readerRole.label;
  schema.properties.text.description+=' '+readerRole.text;
 }
 if(optional)schema.description='독립된 설명이 있을 때만 작성한다. 같은 응답 안에서 이미 답한 내용이면 이유와 상황을 첫 문단에 충분히 남기고 이 항목은 null로 반환한다. 차이나 반전을 만들어 채우지 않는다.';
 return schema;
};
// A deterministic writing brief for the two paid core paragraphs; NO new
// traits, no observable personality claims, and no new JSON output fields.
function coreReaderRoles(prompt){
 const contrast=require('./report-chart-contrast').build(prompt?.facts);
 const month=contrast?.monthTenGodContext;
 const coreContrast=require('./report-chart-contrast');
 const first=contrast&&coreContrast.forTopic(contrast,'temperament',[]);
 const second=contrast&&coreContrast.forTopic(contrast,'strength',[]);
 const seasonal=first?.readerReasoning;
 const focus=second?.readerReasoning?.readerValuePlan;
 const firstClaim=first?.claimOwnership,secondClaim=second?.claimOwnership;
 const claimBrief=claim=>claim?
  ' 이 문단만 담당하는 해석: '+claim.readerConclusion+
  ' 다른 문단으로 넘길 해석: '+claim.reservedForOtherParagraph+
  ' 한 근거를 두 문단이 인용하더라도 같은 성향 결론을 두 번 쓰지 않는다.': '';
 const reading=focus?.traditionalReading;
 const firstParagraphBoundary=seasonal?.readerValuePlan?.distinctFromMonthPair||null;
 return {
  temperament:{
   label:'태어난 계절과 겉에 확인된 오행의 관계를 이 문단에서 실제 설명한 생활 질문으로 짧게 나타낸다. 두 번째 문단의 배움·돈·재료 질문을 소제목으로 빼앗지 않는다.'+
    (firstParagraphBoundary?' 이 입력에서는 외부에서 받을 수 있는 도움의 조건을 첫 문단 제목으로 구별한다.':''),
   text:'출생 시기의 특징이나 글자의 뜻을 세 문장 이상 나열해 기술 강의로 만들지 않는다. 핵심 풀이를 먼저 말하고 계산된 출생 계절·겉글자의 전통적 의미를 짧게 연결한 다음 실제로 이해되는 가상 장면 하나에서 무엇을 고려하는지 풀어 쓴다. '+
    (seasonal?.hypotheticalQuestion?'이 입력에서 확인된 관계에 맞춘 가상의 장면: '+seasonal.hypotheticalQuestion+' ':'')+
    (firstParagraphBoundary?'이 입력의 서로 다른 문단 역할: '+firstParagraphBoundary+' ':'')+
    claimBrief(firstClaim)+
    '예시는 실제 생활 이력이나 관찰된 성격이 아니다. 계절 변화만으로 적응력이나 학습 능력을 판정하지 않으며 뜻을 설명했습니다 같은 작성 과정 문장으로 끝내지 않는다.'
  },
  strength:{
   label:'태어난 달의 겉글자와 중심 숨은 글자에서 실제 확인된 두 의미를 함께 풀이한 결론을 소제목으로 짧게 나타낸다. 첫 문단의 계절·외부 지원 조건을 반복하지 않는다. 뿌리·충·강약처럼 이 문단에 없는 계산 주제를 제목에 붙이지 않는다.',
   text:'이 문단은 태어난 달의 겉글자와 중심 숨은 글자에 기록된 두 전통적 의미만 풀이한다.'+
    (reading?' 이 사주에서 계산한 두 전통 해석의 관점: '+reading.tentativeThesis+' 작성 목적: '+reading.editorialDuty+' 해석의 범위: '+reading.evidenceLimit+' ':'')+
    claimBrief(secondClaim)+
    ' 출생 상징의 사전적 의미나 내부 질문을 고객용 글로 나열하지 않는다. 실제 계산된 월간 십성과 중심 숨은 글자 십성의 서로 다른 뜻을 한 가지 조건부 기질 해석으로 연결하고 그 이유를 근거에 따라 밝힌다. 새 일을 준비하는 가상의 한 선택 상황에서는 그 풀이가 유리해지는 조건과 한쪽의 의미만 보면 놓칠 조건을 구분해 설명한다. 실제 성격의 모순·갈등이나 능력의 증거로 바꾸지 않는다. 첫 문단의 계절 설명을 반복하지 않는다. 한 문단의 끝을 이는 전통적 해석의 출발점입니다 같은 해설로 마무리하지 않는다.'
  }
 };
}
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
  const title=visible(section.title),judgment=visible(section.keyJudgment);
  const roles=id==='saju_core'?coreReaderRoles(prompt):null;
  if(roles){
   const fixed=require('./report-core-thesis').forPrompt(prompt);
   if(!fixed)throw Error('Missing verifiable core thesis for provider schema');
   // A one-value enum is supported by strict JSON Schema. Unlike prose
   // directives, it structurally prevents a second/third sentence and
   // glossary headlines BEFORE a billable model response is accepted.
   title.enum=[fixed.title];
   judgment.enum=[fixed.keyJudgment];
   title.description+=' 첫 장 제목은 두 문단의 근거에 따라 제시한 한 가지 조건부 기질 해석의 핵심을 가리킨다. 출생 구조·기질의 조건·계산 근거라는 교재 제목이나, 본문에서 검증하지 않은 인물 평가를 피한다.';
   judgment.description+=' 첫 장 핵심 판단은 제목의 조건부 기질 해석을 자연스러운 한국어 한 문장으로 제시한다. 먼저 검증된 두 출생 위치가 뒷받침하는 전통적 기질 해석을 조건부로 말하고, 생활 조언이나 자료 분석 계획만으로 대체하지 않는다. 계산 과정·근거 목록·검토하겠다는 작성 계획이 아니다. 본문 두 문단의 조건부 전통 해석을 넘어 실제 성격·과거 행동을 확인했다고 단정하지 않는다.';
  }
  return [id,object({title,keyJudgment:judgment,evidence:reader.describe(section.evidence,reader.evidenceField),mood:section.mood,
   paragraphs:object(Object.fromEntries(keys.map(topic=>[topic,topic===anchor?paragraph(plan[topic]?.question||topics[id][topic],false,roles?.[topic]):plan[topic]?.mode==='state-limits'?{type:'null'}:{anyOf:[paragraph(plan[topic]?.question||topics[id][topic],true,roles?.[topic]),{type:'null'}]}])))})];
 }));
 return object({chapters:object(chapters),finalJudgment:prompt.includeFinal?visible(reportSchema.properties.finalJudgment):{type:'null'},cover:prompt.includeCover?visible(reportSchema.properties.cover):{type:'null'}});
}
function decode(value,prompt){
 if(!Array.isArray(prompt?.requestedSections))return value;
 if(!value?.chapters||typeof value.chapters!=='object')throw Error('AI report service returned invalid report structure');
 const sections=prompt.requestedSections.map(id=>{
  const s=value.chapters[id];if(!s?.paragraphs)throw Error('AI report service returned invalid report structure');
  if(id==='saju_core')require('./report-core-thesis').assertDecoded(s,prompt);
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
