'use strict';
// Read-only deterministic internal coverage audit. Do not equate a same-family
// comparison with a separately meaningful annual premium interpretation.
const facts=require('./report-facts-node');
const core=require('./report-interpretation-core');
const guidance=require('./report-analysis-guidance');
const grid=require('./report-core-knowledge-coverage').representativeInputs();
const result={kind:'fixed-99-offline-annual-domain-evidence-audit',
 cases:0,calendarReady:0,moneyEligible:0,careerEligible:0,bothEligible:0,
 moneyOnlyVisibility:0,careerOnlyVisibility:0,
 moneyAnyAnnualVisible:0,careerAnyAnnualVisible:0,
 moneyMatchedAnnualHiddenOnly:0,careerMatchedAnnualHiddenOnly:0,
 moneySubtyped:0,careerSubtyped:0,
 relevantWithoutUniqueAnnualEvidence:0,paidApiCalls:0};
for(const input of grid){
 const packet=facts.build(input,2027);result.cases++;
 if(packet.status!=='ready')continue;
 result.calendarReady++;
 const parts=core.all(packet);
 const plan=guidance.preflight(packet);
 for(const [domain,proof] of Object.entries(parts)){
  const eligible=proof.comparisons;
  if(proof.relevant!==Boolean(eligible.length)||
     eligible.some(c=>c.annualLayer!=='visible-stem'||
      !['subtype','subtype-and-visibility'].includes(c.contrast))||
     eligible.some(c=>!proof.sourceIds.includes(c.annualId)||
      !proof.sourceIds.includes(c.natalId))||
     (!proof.relevant&&proof.sourceIds.length)||
     proof.editorialThreshold!=='annual-visible-stem-and-verified-subtype-difference')
   throw Error('ANNUAL_PREMIUM_SOURCE_THRESHOLD_BYPASS:'+domain);
 }
 if(parts.money.relevant){
  result.moneyEligible++;
  if(parts.money.comparisons.every(x=>x.contrast==='visibility'))
   result.moneyOnlyVisibility++;
  if(parts.money.comparisons.some(x=>x.annualLayer==='visible-stem'))
   result.moneyAnyAnnualVisible++;
  else result.moneyMatchedAnnualHiddenOnly++;
  if(parts.money.comparisons.some(x=>x.contrast.includes('subtype')))
   result.moneySubtyped++;
 }
 if(parts.career.relevant){
  result.careerEligible++;
  if(parts.career.comparisons.every(x=>x.contrast==='visibility'))
   result.careerOnlyVisibility++;
  if(parts.career.comparisons.some(x=>x.annualLayer==='visible-stem'))
   result.careerAnyAnnualVisible++;
  else result.careerMatchedAnnualHiddenOnly++;
  if(parts.career.comparisons.some(x=>x.contrast.includes('subtype')))
   result.careerSubtyped++;
 }
 if(parts.money.relevant&&parts.career.relevant)result.bothEligible++;
 if(parts.money.relevant!==plan.year_2027_money.annualDomainEvidence.relevant||
    parts.career.relevant!==plan.year_2027_career.annualDomainEvidence.relevant)
  throw Error('AUDIT_ANNUAL_PREVIEW_DIVERGED_FROM_CORE');
 const money=parts.money.sourceIds,career=parts.career.sourceIds;
 if(parts.money.relevant&&parts.career.relevant&&money.some(id=>career.includes(id)))
  result.relevantWithoutUniqueAnnualEvidence++;
}
if(result.cases!==99||result.calendarReady!==99)
 throw Error('EXPECTED_99_CALCULABLE_FIXED_INPUTS');
if(result.moneyMatchedAnnualHiddenOnly!==0||
   result.careerMatchedAnnualHiddenOnly!==0||
   result.moneyOnlyVisibility!==0||
   result.careerOnlyVisibility!==0)
 throw Error('ANNUAL_DOMAIN_PREMIUM_WITH_WEAK_SOURCE');
if(result.moneyEligible>=result.cases||
   result.careerEligible>=result.cases)
 throw Error('ALL_ANNUAL_DOMAINS_FORCED_INTO_PAID_SCOPE');
console.log('ANNUAL_SCOPE_AUDIT='+JSON.stringify(result));
module.exports={result};
