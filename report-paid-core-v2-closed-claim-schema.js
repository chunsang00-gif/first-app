'use strict';
// Source-owned FIRST CHAPTER claim closure for isolated, no-provider QA.
// A model cannot invent natal facts when the entire optional paragraph is
// selected from a verified deterministic chart-specific candidate. This
// intentionally removes free-form prose: not a model quality improvement,
// not a sellable report and never active in production.
const lockRefs=require('./report-paid-core-v2-locked-reference-schema');
function enabled(prompt,env=process.env){
 return env.PAID_CORE_V2_CLOSED_CLAIMS==='offline-preview'&&
  lockRefs.enabled(prompt,env);
}
function apply(prompt,topic,paragraphSchema,basis,env=process.env){
 if(env.PAID_CORE_V2_CLOSED_CLAIMS!=='offline-preview')return null;
 if(!enabled(prompt,env))throw Error('QA3_CLOSED_CLAIMS_DISABLED_CONTEXT');
 const contract=topic?.serverOwnedWritingContract;
 if(!contract)return null; // unsupported chart: no asserted new claim
 if(contract.modelRole!=='Korean-prose-rendering-only'||
    contract.humanEditorialApproval!==false||
    contract.releaseVerdict!=='not-approved'||
    contract.onlyFor!=='saju_core/temperament'||
    !Array.isArray(contract.evidenceRefs))
  throw Error('QA3_CLOSED_CLAIMS_UNTRUSTED_CONTRACT');
 const candidate=require('./report-qa3-multichart-source-owned-editorial')
  .build(prompt)?.candidate;
 if(!candidate||!candidate.text||!candidate.label||
    JSON.stringify(candidate.basis?.refs)!==
      JSON.stringify(contract.evidenceRefs))
  throw Error('QA3_CLOSED_CLAIMS_NO_VERIFIED_MANUSCRIPT');
 const schemaProps=paragraphSchema?.properties||{};
 for(const name of ['text','label']){
  if(schemaProps[name]?.type!=='string')
   throw Error('QA3_CLOSED_CLAIMS_OUTPUT_SHAPE_INVALID:'+name);
  schemaProps[name].enum=[candidate[name]];
 }
 const fields=['interpretation','condition','limit'];
 for(const name of fields){
  if(basis?.properties?.[name]?.type!=='string')
   throw Error('QA3_CLOSED_CLAIMS_EVIDENCE_SHAPE_INVALID:'+name);
  basis.properties[name].enum=[candidate.basis[name]];
 }
 const refs=basis?.properties?.refs;
 if(JSON.stringify(refs?.enum)!==
    JSON.stringify([contract.evidenceRefs])||
    refs.minItems!==contract.evidenceRefs.length||
    refs.maxItems!==contract.evidenceRefs.length)
  throw Error('QA3_CLOSED_CLAIMS_REFERENCES_MUST_BE_SERVER_LOCKED');
 // This closed proposal is no longer authored by an AI, even if selected
 // from a JSON schema. The deterministic text still needs human review.
 return {kind:'offline-server-owned-closed-claim-selection-v1',
  claimTextCharacters:candidate.text.length,
  evidenceIds:contract.evidenceRefs.length,
  humanEditorialApproval:false,releaseVerdict:'not-approved'};
}
function assertClosed(prompt,topic,paragraph,env=process.env){
 if(!enabled(prompt,env)||!topic?.serverOwnedWritingContract||
    paragraph===null)return false;
 const expected=require('./report-qa3-multichart-source-owned-editorial')
  .build(prompt)?.candidate;
 if(!expected||typeof paragraph!=='object'||Array.isArray(paragraph))
  throw Error('QA3_CLOSED_CLAIMS_UNEXPECTED_NON_NULL_RESPONSE');
 for(const name of ['label','text'])
  if(paragraph[name]!==expected[name])
   throw Error('QA3_CLOSED_CLAIMS_TEXT_DRIFT:'+name);
 for(const name of ['refs','interpretation','condition','limit'])
  if(JSON.stringify(paragraph.basis?.[name])!==
     JSON.stringify(expected.basis[name]))
   throw Error('QA3_CLOSED_CLAIMS_BASIS_DRIFT:'+name);
 return true;
}
module.exports={enabled,apply,assertClosed};
