'use strict';
// QA6 FUTURE CANDIDATE ONLY. QA5's consumed provider request remains frozen.
// Hardens ONE independently source-verified first-chapter research slot, never
// relaxes the decoder or authorizes a provider call.
const FLAG='offline-preview';
const refs=require('./report-qa3-classical-claim-linked-schema');
const classical=require('./report-paid-core-v2-classical-provider-bridge');
function requested(env=process.env){
 return env.PAID_CORE_V2_REQUIRED_RESEARCH_SLOT===FLAG;
}
function enabled(prompt,env=process.env){
 return requested(env)&&env.NODE_ENV==='test'&&env.RENDER!=='true'&&
  env.PAID_CORE_DEPTH_V2===FLAG&&
  env.PAID_CORE_V2_CLASSICAL_WRITER===FLAG&&
  env.PAID_CORE_V2_CLAIM_LINKS===FLAG&&
  env.PAID_CORE_V2_LOCK_REFS!==FLAG&&
  env.PAID_CORE_V2_CLOSED_CLAIMS!==FLAG&&
  refs.enabled(prompt,env)&&classical.enabled(prompt,env);
}
const INSTRUCTION='이 실험의 추가 사주풀이 항목은 검증된 5개 주장과 실제 출처가 있는 경우에만 작성한다. '+
 '태어난 달의 필수 해석과 중복하지 않으며, 출생 시간의 차이와 두 고전 자료의 적용 한계를 쉬운 한국어로 구별한다. '+
 '검증된 계산 관계와 문헌의 적용 가능성만 설명하고 실제 성격·성공·재물·합화 성립을 단정하지 않는다. '+
 '다섯 주장 각각의 근거 연결을 제시하되 근거 없는 설명으로 빈칸을 채우지 않는다. '+
 '이 연구용 필수 문단은 null이 허용되지 않는다. 설명할 수 없는 경우는 품질 검증 실패이며 판매할 수 없다.';
function requireVerified(prompt,payload){
 if(!enabled(prompt))throw Error('QA6_REQUIRES_EXACT_OFFLINE_RESEARCH_FLAGS');
 const brief=refs.contract(prompt,payload);
 if(!brief||brief.permittedClaims?.length!==5||
    brief.requiredEvidenceRefs?.length!==9||
    !Array.isArray(brief.reviewedClassicalSources)||
    brief.reviewedClassicalSources.length<2)
  throw Error('QA6_RESEARCH_SOURCE_SET_NOT_VERIFIED');
 const claims=brief.permittedClaims;
 if(new Set(claims.map(x=>x.id)).size!==5||
    !claims.every(x=>Array.isArray(x.refs)&&x.refs.length>0&&
      x.refs.every(id=>brief.requiredEvidenceRefs.includes(id)&&
        Object.hasOwn(payload.source,id))))
  throw Error('QA6_CLAIMS_NOT_GROUNDED_IN_SOURCE_SET');
 return brief;
}
function harden(prompt,payload,slot){
 if(!requested())return false;
 const brief=requireVerified(prompt,payload);
 if(!slot||!Array.isArray(slot.anyOf)||slot.anyOf.length!==2||
    slot.anyOf[0]?.type!=='object'||slot.anyOf[1]?.type!=='null')
  throw Error('QA6_OPTIONAL_SLOT_SHAPE_CHANGED');
 const item=slot.anyOf[0],basis=item.properties?.basis;
 if(!basis||!basis.required?.includes('claimLinks')||
    basis.properties?.claimLinks?.type!=='array'||!item.properties?.text||
    !item.properties?.label||!basis.properties?.refs)
  throw Error('QA6_CLAIM_LINKED_OUTPUT_CONTRACT_REQUIRED');
 const enumIds=basis.properties.claimLinks.items?.properties?.claimId?.enum;
 if(JSON.stringify(enumIds)!==JSON.stringify(brief.permittedClaims.map(x=>x.id)))
  throw Error('QA6_OUTPUT_CLAIM_SET_MISMATCH');
 // Remove only the null alternative, on a CLONED experimental JSON schema.
 // Preserve source-specific basis.refs and exact five-claim validation.
 const fixed=structuredClone(item);
 delete slot.anyOf;
 Object.assign(slot,fixed);
 slot.description='연구 전용 필수 사주 추가 해석. 5개 검증 주장과 문장별 근거를 모두 연결한다. 근거 없는 내용은 실패 처리한다.';
 slot.properties.label.description='검증된 출생 시각 조건을 설명하는 짧고 쉬운 제목만 작성한다. 임의의 기질·미래 결과는 금지한다.';
 slot.properties.text.description=INSTRUCTION+' '+classical.schemaText(prompt,payload)
  .replace(/근거를 설명할 수 없으면 null로 둔다\./g,'근거가 없다면 검증을 통과할 수 없다.')
  .replace(/문단 전체를 null로 둔다\./g,'실험은 실패로 판정한다.');
 return true;
}
module.exports={requested,enabled,requireVerified,harden,INSTRUCTION};
