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
  hour.distinctFromMonth===true&&
  hour.realAbilityObserved===false&&hour.premiumValueApproved===false&&
  hour.realOutcomePredicted===false&&hour.classicalPriorityApproved===false&&
  refs.length===2&&refs.every(x=>x.startsWith('natal.hour.')&&
   Object.hasOwn(source,x)&&t.citableFacts?.some(f=>f.id===x))&&
  !slot?.anyOf?.some(s=>s.type==='null')&&
  (slot?.anyOf?.some(s=>s.type==='object')||slot?.type==='object');
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
 // The reader's FREE "year-hour" card already describes the YEAR
 // visible category. A novel source compared with the MONTH is NOT a
 // novel paid finding compared with the FULL free report. Keep this path
 // as an editorial draft, but NEVER authorize a paid order solely for it.
 return Object.freeze({
  kind:'adaptive-first-chapter-precharge-unique-evidence-v1',
  eligible:Boolean(onlyIndependentHour),
  reason:onlyIndependentHour?'verified-hour-addition-awaits-human-review':
   onlyIndependentYear?'year-visible-meaning-already-in-free-preview':
   'no-guaranteed-independent-first-chapter-paragraph',
  existingModelCalls:0,additionalModelCalls:0,
  modelQualityValidated:false,customerSaleApproved:false
 });
}
module.exports={inspect};
