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
 // The enum locks the thesis; ensure the required body receives that exact
 // thesis rather than two unrelated dictionary hints.
 const lockedJudgment=focus&&prompt?.stage==='body'?
  require('./report-core-thesis').forPrompt(prompt)?.keyJudgment:null;
 const firstParagraphBoundary=seasonal?.readerValuePlan?.distinctFromMonthPair||null;
 // Identical traditional categories at different month positions do NOT
 // license a second meaning or a fabricated personality contradiction.
 const sameMonthlyMeaning=month?.sameClassification===true;
 const roles={
  temperament:{
   label:'핵심 사주풀이에 더할 독립적인 계절·겉글자 조건이 실제로 확인될 때만 짧게 소제목을 쓴다. 기본 기질의 결론이나 월간·월지의 필수 핵심 해석을 되풀이한다면 이 항목 전체를 null로 반환한다.'+
    (firstParagraphBoundary?' 이 입력에서는 외부에서 받을 수 있는 도움의 조건을 첫 문단 제목으로 구별한다.':''),
   text:'이 항목은 필수 기질 풀이의 도입이나 계산 설명을 늘리는 자리가 아니다. 계절·겉글자 관계가 필수 월간·월지 해석과 다른 생활 조건을 독립적으로 설명할 때만 그 조건이 실제 선택에 주는 의미를 짧게 쓴다. 다른 결론이 없거나 상징 소개만 남으면 소제목과 본문을 모두 null로 반환한다. 계절 분류나 출생 글자의 뜻만 나열한 기술 강의와 필수 핵심 기질 해석의 반복은 작성하지 않는다. 근거가 분명한 경우에만 가상 장면 하나에 연결한다. '+
    (seasonal?.hypotheticalQuestion?'이 입력에서 확인된 관계에 맞춘 가상의 장면: '+seasonal.hypotheticalQuestion+' ':'')+
    (firstParagraphBoundary?'이 입력의 서로 다른 문단 역할: '+firstParagraphBoundary+' ':'')+
    claimBrief(firstClaim)+
    '독자용 소제목과 본문에서 첫 문단·다음 문단·이 항목 등 편집 순서를 말하지 않는다. 실제 행동을 관찰한 것은 아니라는 공통 면책 안내를 여러 문단에서 반복하지 않고, 구체적인 한계는 내부 basis.limit에 기록한다. 예시는 실제 생활 이력이나 관찰된 성격이 아니다. 계절 분류의 전환월을 양력·음력 새해 또는 실제 계절이 끝나는 날짜로 바꾸지 않는다. 계절 변화만으로 적응력이나 학습 능력을 판정하지 않으며 뜻을 설명했습니다 같은 작성 과정 문장으로 끝내지 않는다.'
  },
  strength:{
   label:'이 장의 필수 핵심 풀이이며 고정된 keyJudgment의 실제 두 출처를 풀이한다. 태어난 달의 겉글자와 중심 숨은 글자에서 확인된 두 의미를 결합해 독자에게 필요한 결론을 소제목으로 짧게 나타낸다. 선택적인 계절·외부 지원 조건을 반복하지 않는다. 뿌리·충·강약처럼 이 문단에 없는 계산 주제를 제목에 붙이지 않는다.',
   text:'이 문단은 첫 장의 필수 유료 기질 풀이이다. 첫머리부터 고정된 keyJudgment가 생활에서 어떤 선택 경향을 뜻하는지 한 가지 조건부 기질 해석으로 풀어 쓴다. 독자에게 필요한 것은 두 글자의 정의가 아니라, 한 가지 상황에서 왜 그런 선택 관점이 나오고 언제 이롭거나 불리한가이다. 그 판단을 먼저 설명한 다음 실제 태어난 달의 두 출처와 전통적 뜻을 이유로 짧게 뒷받침한다. 각 글자의 사전적 정의를 차례로 소개하거나 출처 개수를 늘어놓지 않는다. 가상 상황 하나에서 이 해석이 유리한 점과 한쪽만 보면 놓치기 쉬운 점을 구체적으로 비교한다. 두 의미를 별도 질문 두 개나 누구에게나 해당하는 준비 조언으로 바꾸지 않는다. 같은 장면에서 한 의미만 따르면 놓치는 실제 선택 조건을, 다른 의미를 함께 고려할 때 어떻게 달리 판단하게 되는지 전통적 해석의 차이로 설명한다. 준비물을 확인하라·자료를 검토하라 같은 보편적 조언이 아니라 그 사주의 두 분류가 서로 보완하는 선택 이유를 말한다. 계산 근거로 정할 수 없는 선택의 성공이나 실제 고객 성격·경험은 단정하지 않는다.'+
    (lockedJudgment?' 이 입력에서 이미 고정된 핵심 판단: '+lockedJudgment+
     ' 이 문장을 그대로 다시 적지 말고 두 선택의 뜻이 한 상황에 연결되는 이유를 설명한다. 고정 판단의 어느 쪽도 본문에서 부정하거나 반대 성향으로 바꾸지 않는다.':'')+
    (reading?' 실제 계산한 두 출처의 해석 단서: '+reading.first.reading+' / '+reading.second.reading+'. 두 뜻을 서로 다른 실제 성격 두 개로 단정하지 않는다. 사전적 정의 두 문장 다음에 일반적인 준비·확인 조언 한 문장을 덧붙이는 것으로 해석을 끝내지 않는다. 독자용 본문에서는 계산된 두 뜻이 같은 가상 상황의 선택에 어떤 차이를 만드는지 출처와 조건을 연결해 설명한다. 이유와 사례가 결론을 충분히 보여줬다면 정리 문장이나 반복되는 해석 한계 문장을 보태지 않고 끝낸다. ':'')+
    claimBrief(secondClaim)+
    ' 문단 연결을 설명하겠다·다음 문단에서 다룬다 등 작성 과정 문장을 독자용 텍스트에 쓰지 않는다. 앞 문단과 같은 공통 면책 문구를 반복하지 않고, 필요한 출처별 한계는 basis.limit에 기록한다. 출생 상징의 사전적 의미나 내부 질문을 고객용 글로 나열하지 않는다. 실제 계산된 월간과 중심 숨은 글자의 뜻을 내부에서 먼저 한 가지 조건부 기질 해석으로 연결한 뒤 독자에게는 그 연결로 달라지는 선택을 풀어 쓰고, 계산 위치에 관한 설명은 꼭 필요한 이유 한 번으로 제한한다. 모든 사주에 새 일을 준비하는 같은 예시를 쓰지 않는다. 실제 계산된 월지 중심 십성에 맞춘 가상의 한 선택 상황에서 그 풀이가 유리해지는 조건과 한쪽의 의미만 보면 놓칠 조건을 구분해 설명한다. 실제 성격의 모순·갈등이나 능력의 증거로 바꾸지 않는다. 첫 문단의 계절 설명을 반복하지 않는다. 한 문단의 끝을 이는 전통적 해석의 출발점입니다 같은 해설로 마무리하지 않는다.'
  }
 };
 if(sameMonthlyMeaning){
  // Preserve the existing, already tested different-category provider brief.
  // Only this real calculated same-category case needs a distinct contract.
  roles.strength.label='이 장의 필수 핵심 풀이이다. 서로 다른 두 출생 위치에 같은 전통 분류가 계산되었으므로 하나의 기질 해석만 소제목에 나타낸다. 두 가지 성향이나 강도 증폭을 만들어내지 않는다. 선택적 계절 설명과 겹치지 않는다.';
  roles.strength.text='이 문단은 하나의 계산된 전통 분류를 풀이하는 필수 본문이다. 서로 다른 두 글자의 설명을 나열하기 전에 그 분류가 한 가지 생활 선택에서 뜻하는 기질을 쉬운 말로 풀고 구체적인 이유를 설명한다. 두 출생 위치의 십성 분류와 전통적 뜻이 같으므로 거짓 차이, 반대되는 기질, 성격의 강약을 만들지 않는다. 실제 두 위치가 같은 전통 분류를 뒷받침한다는 근거를 짧게 밝히고, 고정된 핵심 판단을 한 가지 가상 선택에 적용한다. 그 해석이 도움이 되는 조건과 실제로 확인할 수 없는 조건을 구분해 일상 한국어로 설명한다. 일반적인 준비 조언이나 같은 뜻의 반복으로 채우지 않는다. 사전적 의미나 내부 질문을 고객용 글로 나열하지 않는다. 확인된 뜻을 한 가지 조건부 기질 해석으로 연결한다. 가상의 한 선택 상황에서 실제로 확인된 의미가 적용되는 조건을 설명한다. 실제 성격의 모순·갈등이나 능력의 증거로 바꾸지 않는다. '+
   (lockedJudgment?'이미 고정된 핵심 판단: '+lockedJudgment+' 이 문장을 그대로 다시 적지 말고 하나의 가상 선택에서 어떻게 풀이되는지 근거를 연결한다. ':'')+
   (reading?'같은 전통 분류의 해석 단서: '+reading.first.reading+'. 두 계산 출처는 내부 basis.refs에 모두 남기되 독자에게 두 개의 다른 뜻으로 소개하지 않는다. ':'')+
   claimBrief(secondClaim)+
   '독자용 문장에서 문단 작성 순서를 설명하거나 앞 문단의 일반적 면책 안내를 반복하지 않는다. 관련 한계는 basis.limit에 기록한다. 실제 성격·능력·과거 행동을 관찰한 것으로 단정하지 않는다. 명리 계산만으로 두 배로 강한 기질, 양면성 또는 성공을 보장하지 않는다. 계절에 관한 선택적 첫 문단의 해석은 반복하지 않는다.';
 }
 return roles;
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
  if(roles&&prompt.stage==='body'){
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
  if(id==='saju_core'&&prompt.stage==='body')require('./report-core-thesis').assertDecoded(s,prompt);
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
