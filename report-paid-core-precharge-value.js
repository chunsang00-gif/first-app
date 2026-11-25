'use strict';
// NO money or model call. Before reserving an adaptive paid order,
// prove that the real first-chapter writer has at least one independently
// citable, non-month reading that FREE month interpretation does not cover.
// This is a *minimum*, never a promise of manuscript quality or sale approval.
const facts=require('./report-facts-node');
const integrity=require('./report-calculation-integrity');
const guidance=require('./report-analysis-guidance');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const schema=require('./report-schema.json');
function inspect(input){
 const packet=facts.build(input,2027);
 if(packet?.status!=='ready'||!integrity.verify(packet).pass)
  return Object.freeze({eligible:false,reason:'calculation-unverified',modelCalls:0});
 // Use the EXACT ordinary paid body task and strict writer schema. No
 // development-only V2, frozen QA call, or unrelated report chapter can
 // create eligibility for the customer-facing first chapter.
 const blueprint=guidance.preflight(packet);
 const ids=['saju_core'];
 const prompt={stage:'body',facts:packet,requestedSections:ids,
  analysisGuidance:{...guidance.forRequest(ids,packet.person?.mbti),
   editorialBlueprint:blueprint}};
 const compiled=writer.compile(prompt);
 const t=compiled?.task?.chapters?.saju_core?.topics?.temperament;
 const hour=t?.sourceOwnedHourExtension;
 const year=t?.sourceOwnedYearVisibleExtension;
 const strict=writer.schema(prompt,wire.schemaFor(prompt,schema));
 const slot=strict?.properties?.chapters?.properties?.saju_core
  ?.properties?.paragraphs?.properties?.temperament;
 const refs=hour?.sourceRefs||[];
 const source=compiled?.source||{};
 const onlyIndependentHour=hour?.kind==='buyer-choice-hour-symbolic-extension-v1'&&
  hour.distinctFromMonth===true&&hour.distinctFromFreeVisibleNatal===true&&
  hour.realAbilityObserved===false&&hour.premiumValueApproved===false&&
  hour.realOutcomePredicted===false&&hour.classicalPriorityApproved===false&&
  refs.length===2&&refs.every(x=>x.startsWith('natal.hour.')&&
   Object.hasOwn(source,x)&&t.citableFacts?.some(f=>f.id===x))&&
  !slot?.anyOf?.some(s=>s.type==='null')&&
  (slot?.anyOf?.some(s=>s.type==='object')||slot?.type==='object');
 // 'Different from the FREE year/hour card' is not proof of an
 // independent symbolic category across the WHOLE chart. This is not a
 // judgment that repeating a stem forbids all positional interpretation;
 // no validated position-specific paid method exists yet. Block BEFORE
 // reserving payment or calling a model, not after a failed paid response.
 const natalRoleAudit=onlyIndependentHour?
  require('./report-paid-core-hour-cross-pillar-audit').inspect(packet):null;
 const sameStemAlreadyInNatal=Boolean(onlyIndependentHour&&
  natalRoleAudit?.status==='same-exact-hour-symbol-already-in-other-natal-position'&&
  natalRoleAudit.sameExactStemOtherNatalPositions.length>0);
 const wholeNatalDistinct=Boolean(onlyIndependentHour&&
  natalRoleAudit?.status==='not-exactly-repeated-across-other-natal-positions'&&
  natalRoleAudit.wholeNatalCategoryIsNew===true);
 // An hour pair can be distinct within the chart yet already explained
 // together in the full free report. Compare calculated refs, not wording.
 const pairAlreadyFree=wholeNatalDistinct&&require('./report-product-coverage')
  .alreadyPublicDomainReadings(packet,{includeSourceRefs:true})
  .some(reading=>refs.every(ref=>reading.sourceRefs.includes(ref)));
 const yearRefs=year?.sourceRefs||[];
 const onlyIndependentYear=!hour&&
  year?.kind==='buyer-question-year-visible-role-addition-v1'&&
  year.distinctFromFreeMonth===true&&year.exactHiddenExposureClaimed===false&&
  year.priorityEstablished===false&&year.realLifeObserved===false&&
  year.actualOutcomePredicted===false&&
  year.professionalApproved===false&&year.premiumValueApproved===false&&
  yearRefs.length===4&&
  yearRefs.includes('natal.year.stem')&&
  yearRefs.includes('natal.month.stem')&&
  yearRefs.includes(year.mainMonthId)&&
  yearRefs.includes('facts.stemConnections')&&
  yearRefs.every(x=>Object.hasOwn(source,x)&&
   t.citableFacts?.some(f=>f.id===x))&&
  !slot?.anyOf?.some(s=>s.type==='null')&&
  (slot?.anyOf?.some(s=>s.type==='object')||slot?.type==='object');
 // When a buyer voluntarily supplies work and skill, the post-provider
 // evidence restorer requires a parseable two-way question and distinct
 // self-reported labels. Reject this input BEFORE a payment can be reserved
 // instead of charging for a chapter the writer will necessarily reject.
 // A missing optional context has no effect on existing eligible requests.
 const declared=packet.person?.decisionContext;
 const contextProblems=declared?require('./report-buyer-decision-context-application')
  .preflight(require('./report-buyer-decision-context').readerTask(declared),
   packet.person?.readerDecision):[];
 // Prior to this check, the model could be paid for a perfectly calculated
 // hour role but the post-model quality gate would ALWAYS reject a vague
 // single concern or an unparseable "A or B" dilemma. A client should
 // never reserve an order under a contract that cannot accept its question.
 const readerProblems=onlyIndependentHour?
  require('./report-paid-core-hour-choice-meaning')
   .preflightReaderQuestion(packet.person?.readerDecision,hour):[];
 // The reader's FREE "year-hour" card already describes the YEAR
 // visible category. A novel source compared with the MONTH is NOT a
 // novel paid finding compared with the FULL free report. Keep this path
 // as an editorial draft, but NEVER authorize a paid order solely for it.
 return Object.freeze({
  kind:'adaptive-first-chapter-precharge-unique-evidence-v1',
  eligible:Boolean(onlyIndependentHour&&wholeNatalDistinct&&!pairAlreadyFree)&&
   contextProblems.length===0&&readerProblems.length===0,
  reason:onlyIndependentHour&&contextProblems.length?
   'buyer-context-unusable-for-two-option-paid-explanation':
   onlyIndependentHour&&readerProblems.length?
   'buyer-question-cannot-pass-first-chapter-reader-gate':
   sameStemAlreadyInNatal?
   'hour-role-already-in-other-natal-pillar-unreviewed-positional-meaning':
   onlyIndependentHour&&!wholeNatalDistinct?
   'hour-whole-natal-category-audit-unverified':
   pairAlreadyFree?'hour-pair-already-explained-in-free-domain-reading':
   onlyIndependentHour?'verified-hour-addition-awaits-human-review':
   onlyIndependentYear?'year-visible-meaning-already-in-free-preview':
   'no-guaranteed-independent-first-chapter-paragraph',
  wholeNatalHourRoleNotRepeated:wholeNatalDistinct,
  independentPositionSpecificMeaningApproved:false,
  existingModelCalls:0,additionalModelCalls:0,
  modelQualityValidated:false,customerSaleApproved:false
 });
}
module.exports={inspect};
