'use strict';
// OFFLINE preview only. A server-verified V2 first-chapter contract fixes
// the *entire* source-ID array before prose generation. This is a genuine
// transport-schema change, not a text-only instruction asking the model to
// copy seven citations. Strict schema enum-of-array provider compatibility
// still requires separately authorized verification: NEVER bill here.
const ENVS={NODE_ENV:'test',PAID_CORE_DEPTH_V2:'offline-preview',
 PAID_CORE_V2_LOCK_REFS:'offline-preview'};
function enabled(prompt,env=process.env){
 return Object.entries(ENVS).every(([key,value])=>env[key]===value)&&
  env.RENDER!=='true'&&
  prompt?.paidCoreDepthV2===true&&prompt.stage==='body'&&
  JSON.stringify(prompt.requestedSections)==='["saju_core"]';
}
function lock(prompt,topic,permitted,basis,env=process.env){
 if(!enabled(prompt,env))return false;
 const contract=topic?.serverOwnedWritingContract;
 if(!contract)return false; // unsupported chart must not acquire fake refs
 if(![
   'server-owned-first-chapter-evidence-and-claim-contract-v1',
   'server-owned-first-chapter-separate-visible-contract-v1'
  ].includes(contract.kind)||
  contract.onlyFor!=='saju_core/temperament'||
  contract.modelRole!=='Korean-prose-rendering-only'||
  contract.releaseVerdict!=='not-approved'||
  contract.humanEditorialApproval!==false)
  throw Error('QA3_LOCKED_REF_UNTRUSTED_SERVER_CONTRACT');
 const ids=contract.evidenceRefs;
 const available=basis?.properties?.refs?.items?.enum;
 if(!Array.isArray(ids)||ids.length<4||
    new Set(ids).size!==ids.length||
    !Array.isArray(available)||!Array.isArray(permitted)||
    !ids.every(id=>typeof id==='string'&&
      permitted.includes(id)&&available.includes(id)&&
      topic.citableFacts.some(row=>row.id===id)))
  throw Error('QA3_LOCKED_REF_INVALID_SOURCE_IDS');
 const refs=basis.properties.refs;
 if(refs.type!=='array'||refs.items.type!=='string')
  throw Error('QA3_LOCKED_REF_BAD_TRANSPORT_SCHEMA');
 // JSON Schema enum applies to the full array, not to individual members.
 // Existing items.enum remains in force; exact order and coverage are fixed.
 refs.enum=[ids.slice()];
 refs.minItems=ids.length;
 refs.maxItems=ids.length;
 refs.description='근거 ID는 서버가 고정했으며 AI가 선택하거나 생략하지 않는다. '+
   '전체 고정 배열 그대로 출력한다. 출력할 근거가 되는 문장을 쓰지 못한다면 temperament 문단 전체를 null로 둔다.';
 return true;
}
function rejectEmptyClaims(prompt,paragraph,monthText,extra,env=process.env){
 if(!enabled(prompt,env)||paragraph==null)return [];
 // Exact citations alone must never rehabilitate generic advice. Keep the
 // original decoder's reader checks and add the separate offline editorial
 // check for both-sided missing conditions and concrete scene specificity.
 const findings=require('./report-paid-core-v2-editorial-triage')
  .inspect(paragraph,monthText,extra).findings;
 if(findings.length)
  throw Error('QA3_LOCKED_REF_PROSE_REJECTED:'+findings.join('|'));
 return findings;
}
module.exports={enabled,lock,rejectEmptyClaims};
