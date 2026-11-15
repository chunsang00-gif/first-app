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
const twoHourManuscript=require('./report-core-paid-adult-two-hour-contrast');
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
 // Calculated labels, valid citations, and fluent generic prose are NOT
 // sufficient for a saleable personal claim. Reject until independently
 // reviewed method, actual NEW reader decision, and human editorial approval.
 ensure(context.editorialReview?.eligibleForAdditiveReading===true&&
  context.editorialReview?.traditionallyReviewed===true&&
  context.editorialReview?.newCustomerDecisionVerified===true&&
  context.editorialReview?.approvedByIndependentHumanEditor===true,
  'EDITORIAL_VALUE_NOT_APPROVED');
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
  proposed:schema.additivePrototype.schema,
  editorialReview:{
   eligibleForAdditiveReading:false,traditionallyReviewed:false,
   newCustomerDecisionVerified:false,approvedByIndependentHumanEditor:false
  }};
 const empty=attachOfflineOnly(decoded,null,context);
 ensure(same(empty.report,decoded),'NULL_CHANGED_REAL_READER_OUTPUT');
 // No newly invented "high-end" prose. Replay the existing chart-checked
 // handwritten candidate, and reject the candidate when the hour repeats
 // the month role. A different hour category is a REVIEW opportunity, not
 // an automatic assertion of extra customer value.
 const pair=twoHourManuscript.build();
 const isBefore=same(prompt.facts.chart,pair.charts.before);
 const isAfter=same(prompt.facts.chart,pair.charts.after);
 ensure(isBefore!==isAfter&&pair.providerCalls===0&&
  pair.incrementalPremiumValueEstablished===false&&
  pair.interpretation.methodApproved===false&&
  pair.unchangedFreeMonthCore.actualTextEqual===true&&
  pair.changed.sameMonthAndHourSymbolBefore===true&&
  pair.changed.sameMonthAndHourSymbolAfter===false,
  'TWO_HOUR_EDITORIAL_SOURCE_NOT_VERIFIED');
 const rejectedForRepetition=isBefore;
 const sourceManuscript=isAfter?pair.editorialAlternative.after:null;
 const scene=sourceManuscript?.paragraphs.find(x=>
  x.kind==='hypothetical-choice');
 if(isAfter)ensure(scene?.text&&sourceManuscript
   .manuscriptProfessionallyValidated===false&&
   sourceManuscript.readerPaidValueTested===false&&
   sourceManuscript.releaseVerdict==='not-approved'&&
   sourceManuscript.sourceRefs.includes('natal.hour.stem')&&
   scene.text.includes('달의 뜻')&&
   scene.text.includes('시간의 뜻')&&
   !scene.text.includes('실제로 말을 잘')&&
   !reader.errors([scene.text]).length,
  'UNVERIFIED_OR_NON_DISTINCT_EDITORIAL_SCENE');
 // The new 20:20 hour classification is CALCULATED, not a life claim.
 // The drafted takeaway that understanding and explaining are distinct
 // work steps is a generic true sentence, not a new birth-chart-dependent
 // decision. Preserve the draft only for internal editorial review.
 const candidateFixture=isAfter?{
  label:'이해한 내용을 다른 사람에게 전달하는 상황',
  text:scene.text,
  basis:{refs:schema.citations.qaDepth.slice(),
   interpretation:locked.literal,
   condition:'새로운 작업 절차를 동료에게 설명하는 가정 상황',
   limit:'서로 다른 전통 분류의 비유일 뿐 실제 전달 능력과 방법 우선순위는 미판정'}
 }:null;
 if(isAfter)ensure(
  pair.changed.priorHourCategory==='편인'&&
  pair.changed.changedHourCategory==='상관'&&
  same(pair.unchangedFreeMonthCore.sourceRefs,
   ['natal.month.stem','natal.month.hidden.己'])&&
  scene.text.includes('달의 뜻을 낯선 내용을 이해하는 단계에')&&
  scene.text.includes('시간의 뜻을 그 내용을 말이나 문서로 풀어내는 단계에')&&
  scene.text.includes('혼자 변경 이유를 이해하는 것과 다른 사람이 그대로 따라 할 수 있게 순서를 설명하는 것은 서로 다른 일입니다.')&&
  scene.text.includes('실제 인계 능력을 평가한 결과는 아닙니다.'),
  'CANDIDATE_NOT_SUPPORTED_BY_RECALCULATED_HOUR_DIFFERENCE');
 const incrementalValue={
  kind:'qa-manual-first-chapter-premium-delta-rejection-v1',
  freeMonthSourceRefs:pair.unchangedFreeMonthCore.sourceRefs.slice(),
  freeMonthTextIdenticalAcrossTimes:true,
  independentHourClassification:isAfter?'상관':'편인',
  candidateComparedAgainstFree:Boolean(candidateFixture),
  findings:isBefore?[
   {id:'month-hour-category-repeated',category:'computed-repeat',
    contributesIndependentCustomerDecision:false}
  ]:[
   {id:'month-understanding',category:'already-covered-by-free-month',
    refs:['natal.month.stem'],contributesIndependentCustomerDecision:false},
   {id:'hour-expression',category:'new-traditional-symbol-classification',
    refs:['natal.hour.stem'],contributesIndependentCustomerDecision:false},
   {id:'understanding-versus-explaining',
    category:'generic-example-not-chart-specific-conclusion',
    refs:[],contributesIndependentCustomerDecision:false},
   {id:'personal-performance-not-inferred',
    category:'necessary-interpretive-limit',
    refs:[],contributesIndependentCustomerDecision:false}
  ],
  newVerifiedChartClassification:isAfter,
  genericLifeIllustrationDoesNotProvePersonalDifference:true,
  independentPersonalDecisionSupported:false,
  chosenClassicalMethodApproved:false,
  humanReaderValueApproved:false,
  eligibleForAdditiveReading:false,
  status:isBefore?'reject-repeated-month-role-prose':
   'reject-different-role-but-generic-life-advice',
  reviewOnly:true,paidApiCalls:0,releaseVerdict:'not-approved'
 };
 // Neither existing candidate contains approved extra reader value.
 const extra=null;
 const joined=attachOfflineOnly(decoded,extra,context);
 const expectedTopics=['temperament','strength'];
 ensure(same(joined.report.sections[0].bodyTopics,expectedTopics)&&
  joined.report.sections[0].body.length===expectedTopics.length&&
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
  candidateFixture,
  incrementalValue,
  editorialDecision:{
   kind:'qa-optional-third-paragraph-specificity-review-v1',
   omittedWhenHourRepeatsMonthRole:rejectedForRepetition,
   originalMonthInterpretationUnchanged:true,
   source:'preexisting-chart-verified-manual-manuscript',
   chartHourCategory:isBefore?'편인':'상관',
   originalManualSceneReused:false,
   chartVerifiedDraftRetainedForReview:Boolean(candidateFixture),
   premiumBenefitEstablished:false,customerReady:false,
   decision:isBefore?'omit-duplicate-month-hour-meaning':
    'omit-generic-choice-example-no-additional-personal-judgment'
  },
  projectionContext:context,
  originalFirstBatch:captured.requestedSections.slice(),
  proof:{
   originalTwoReaderParagraphsVerified:true,
   nullThirdSlotPreservesOriginalBytes:true,
   thirdParagraphUsesIndependentVerifiedNatalRefs:false,
   duplicateRoleDoesNotForceThirdParagraph:true,
   genericHourContrastDoesNotForceThirdParagraph:true,
   strictDepthFactLockUnchanged:true,
   extraDoesNotChangeOriginalTitleJudgmentOrEvidence:true,
   productionSchemaWriterDecoderUnchanged:true,
   prototypeIsNotHumanReviewed:true,
   customerReady:false
  },apiCalls:0,releaseVerdict:'not-approved'};
}
module.exports={inspect,attachOfflineOnly};
