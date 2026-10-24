'use strict';
// Offline, synthetic, QA-ONLY proof of the proposed third paragraph surviving
// the reader output boundary. This module never runs inside paid generation.
// Crucially, it decodes the TWO existing paragraphs using their ACTUAL
// production evidence validation before considering the optional third one.
const layout=require('./report-core-paid-additive-layout-decision');
const capture=require('./report-core-paid-full-prompt-capture').capture;
const qa=require('./report-core-paid-full-qa-compose').assemble;
const generation=require('./report-generation-request');
const wire=require('./report-wire');
const thesis=require('./report-core-thesis');
const lock=require('./report-core-paid-natal-depth-fact-lock');
const reader=require('./report-reader-policy');
const REQUIRED=['natal.year.stem','natal.month.stem','natal.day.stem',
 'natal.hour.stem','facts.stemConnections'];
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const ensure=(ok,why)=>{if(!ok)throw Error('QA_ADDITIVE_READER_'+why)};
function syntheticCore(prompt,payload){
 const core=payload.task.chapters.saju_core;
 const allowed=name=>new Set(core.topics[name].citableFacts.map(x=>x.id));
 const monthMain=payload.source['facts.structuralEvidence.monthCommand']?.mainHiddenStem;
 ensure(monthMain,'MISSING_MONTH_MAIN');
 const seasonal=['facts.seasonalEvidence','facts.qiEvidence','natal.month.stem'];
 const corePair=['natal.month.stem','natal.month.hidden.'+monthMain];
 ensure(seasonal.every(id=>allowed('temperament').has(id))&&
  corePair.every(id=>allowed('strength').has(id)),'INVALID_ORIGINAL_PAID_REFS');
 const para=(refs,label,text)=>({
  label,text,basis:{refs,
   interpretation:'계산한 출생 위치의 전통 분류를 한 가지 가정에 적용한 검증용 문장',
   condition:'새로운 일을 배우는 가상의 상황',
   limit:'개인의 실제 행동이나 미래를 확인한 자료가 아님'}
 });
 const fixed=thesis.forPrompt(prompt);
 ensure(Boolean(fixed)&&fixed.sourceIds.join('|')===corePair.join('|'),
  'ORIGINAL_CORE_THESIS_CHANGED');
 return {chapters:{saju_core:{
  title:fixed.title,keyJudgment:fixed.keyJudgment,mood:'reflective',
  paragraphs:{
   temperament:para(seasonal,'태어난 시기의 조건',
    '새로운 일을 배우는 장면을 가정하면, 태어난 시기와 겉으로 드러난 관계는 주변에서 받을 수 있는 도움의 조건을 살펴보는 참고 자료입니다.'),
   strength:para(corePair,'새로운 정보를 받아들이는 방식',
    '낯선 업무를 이해하는 상황을 가정하면, 태어난 달의 두 자리에서 계산된 전통 분류를 하나의 선택에 함께 적용하는 풀이를 시험할 수 있습니다.')
  }}},cover:null,finalJudgment:null};
}
function attachOfflineOnly(base,extra,context){
 const {allowed,factLock,source,proposed}=context;
 const result=structuredClone(base);
 const first=result.sections?.[0];
 ensure(result.sections?.length===1&&first.id==='saju_core'&&
  same(first.bodyTopics,['temperament','strength'])&&
  same(first.bodyLabels.length,2)&&first.body.length===2,
  'ORIGINAL_TWO_READER_PARAGRAPHS_CHANGED');
 ensure(proposed.properties.chapters.properties.saju_core.properties.paragraphs
  .properties.natal_depth.anyOf.some(x=>x.type==='null'),
  'OPTIONAL_DEPTH_SCHEMA_WAS_REPLACED');
 if(extra===null)return {previewOnly:true,customerReady:false,
  releaseVerdict:'not-approved',report:result,extraStatus:'null-preserves-original'};
 const basis=extra?.basis;
 const citations=Array.isArray(basis?.refs)?basis.refs:[];
 ensure(extra&&typeof extra.label==='string'&&extra.label.trim()&&
  typeof extra.text==='string'&&extra.text.trim()&&basis&&
  citations.length===new Set(citations).size&&
  citations.every(x=>typeof x==='string'&&allowed.has(x)&&
   Object.hasOwn(source,x))&&REQUIRED.every(x=>citations.includes(x)),
  'DEPTH_SOURCES_NOT_CANONICAL');
 ensure(basis.interpretation===factLock.literal&&
  typeof basis.condition==='string'&&basis.condition.trim()&&
  typeof basis.limit==='string'&&basis.limit.trim(),
  'DEPTH_LOCK_OR_BOUNDARY_FAILED');
 ensure(!reader.errors([extra.label,extra.text]).length&&
  !/[\u3400-\u4dbf\u4e00-\u9fff]/.test(extra.label+' '+extra.text),
  'DEPTH_READER_CONTAINS_TECHNICAL_HANJA');
 ensure(!/(?:반드시 성공|원래 성격|타고난 능력|돈을 많이 벌|미래에 반드시)/.test(extra.text),
  'UNSUPPORTED_REAL_LIFE_PROMISE');
 // A projection of how a distinct third topic would appear in the output
 // section. It is NEVER passed into wire.decode() in actual paid generation.
 first.bodyTopics.push('natal_depth');
 first.bodyLabels.push(extra.label);
 first.body.push(extra.text);
 first.evidence.push('natal_depth: '+citations.join('; ')+
  ' / QA 한계: '+basis.limit);
 return {previewOnly:true,customerReady:false,releaseVerdict:'not-approved',
  report:result,extraStatus:'offline-qa-depth-projection'};
}
async function inspect(input){
 const schema=await layout.inspect(input);
 const captured=await capture(input);
 const candidate=await qa(input);
 ensure(schema.actualNormalDoesNotExposeDepth&&
  schema.additivePrototype.strictlyNoReaderOrProviderIntegration&&
  candidate.providerCalls===0&&captured.providerCalls===0&&
  same(candidate.prompt.facts.chart,captured.prompt.facts.chart),
  'UNAPPROVED_OR_DIFFERENT_CHART');
 const prompt=structuredClone(captured.prompt);
 prompt.requestedSections=['saju_core'];
 prompt.analysisGuidance.editorialBlueprint={
  saju_core:captured.prompt.analysisGuidance.editorialBlueprint.saju_core
 };
 const payload=generation.compile(prompt);
 ensure(same(Object.keys(payload.task.chapters.saju_core.topics),
  ['temperament','strength']),'BASELINE_PLAN_CHANGED');
 const actual=syntheticCore(prompt,payload);
 const decoded=wire.decode(generation.restoreEvidence(actual,prompt),prompt);
 ensure(same(decoded.sections[0].bodyTopics,['temperament','strength'])&&
  decoded.sections[0].evidence.length===2,
  'NORMAL_READER_DECODER_DID_NOT_RETURN_BOTH');
 const allowed=new Set(schema.citations.qaDepth);
 const locked=lock.fromPayload(candidate.payload);
 const leaf=schema.additivePrototype.schema.properties.chapters.properties
  .saju_core.properties.paragraphs.properties.natal_depth.anyOf[0];
 ensure(same(leaf.properties.basis.properties.refs.items.enum,
  schema.citations.qaDepth)&&
  same(leaf.properties.basis.properties.interpretation.enum,[locked.literal])&&
  REQUIRED.every(id=>allowed.has(id)&&
   Object.hasOwn(candidate.payload.source,id)),
  'STRICT_OPTIONAL_SOURCE_SCHEMA_MISMATCH');
 const context={allowed,factLock:locked,source:candidate.payload.source,
  proposed:schema.additivePrototype.schema};
 const empty=attachOfflineOnly(decoded,null,context);
 ensure(same(empty.report,decoded),'NULL_CHANGED_REAL_READER_OUTPUT');
 const refList=schema.citations.qaDepth.slice();
 const extra={
  label:'태어난 해와 시간에서 달라지는 해석 단서',
  text:'새로운 일을 동료에게 설명하는 상황을 가정하면, 태어난 해에서 계산된 분류는 이미 아는 내용을 참고하는 방식에, 시간의 분류는 생각을 표현하는 방식에 각각 비유할 수 있습니다. 두 분류 중 무엇이 실제 행동을 더 잘 설명하는지는 확인되지 않았습니다.',
  basis:{refs:refList,interpretation:locked.literal,
   condition:'새 일을 동료에게 설명하는 가상의 상황',
   limit:'전통적 분류의 관찰된 성격·성과 및 방법 우선순위는 미판정'}
 };
 const joined=attachOfflineOnly(decoded,extra,context);
 ensure(same(joined.report.sections[0].bodyTopics,
  ['temperament','strength','natal_depth'])&&
  joined.report.sections[0].body.length===3&&
  same(joined.report.sections[0].body.slice(0,2),
   decoded.sections[0].body)&&
  same(joined.report.sections[0].evidence.slice(0,2),
   decoded.sections[0].evidence),
  'ADDITIVE_DEPTH_REWROTE_ORIGINAL_READER_CONTENT');
 return {kind:'qa-only-additive-reader-boundary-replay-v1',
  chart:{...captured.prompt.facts.chart},
  normalReader:decoded,nullableReader:empty.report,
  additiveReader:joined.report,
  extraFixture:extra,
  projectionContext:context,
  originalFirstBatch:captured.requestedSections.slice(),
  proof:{
   originalTwoReaderParagraphsVerified:true,
   nullThirdSlotPreservesOriginalBytes:true,
   thirdParagraphUsesIndependentVerifiedNatalRefs:true,
   strictDepthFactLockUnchanged:true,
   extraDoesNotChangeOriginalTitleJudgmentOrEvidence:true,
   productionSchemaWriterDecoderUnchanged:true,
   prototypeIsNotHumanReviewed:true,
   customerReady:false
  },apiCalls:0,releaseVerdict:'not-approved'};
}
module.exports={inspect,attachOfflineOnly};
