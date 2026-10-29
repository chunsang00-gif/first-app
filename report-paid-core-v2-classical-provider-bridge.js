'use strict';
// A source-frozen PROPOSED writing brief for one exact synthetic birth chart.
// Feature flag controls the SAME compiler -> transport projection -> strict
// schema path as the provider, but no live generation, charge or sale approval.
// This is NOT a replacement for the real decoder's existing safety gates.
const audit=require('./report-core-1994-dingren-classical-rule-audit');
const revised=require('./report-core-1994-dingren-reader-revision');
const scope=require('./report-paid-core-v2-scope');
const MODE='offline-preview';
function enabled(prompt,env=process.env){
 return env.NODE_ENV==='test'&&env.RENDER!=='true'&&
  env.PAID_CORE_DEPTH_V2===MODE&&
  env.PAID_CORE_V2_CLASSICAL_WRITER===MODE&&
  env.PAID_CORE_V2_LOCK_REFS!==MODE&&
  env.PAID_CORE_V2_CLOSED_CLAIMS!==MODE&&
  prompt?.paidCoreDepthV2===true&&
  JSON.stringify(prompt.requestedSections)==='["saju_core"]'&&
  scope.valid(prompt);
}
function inspect(prompt,payload,env=process.env){
 if(!enabled(prompt,env))return null;
 const original=payload?.task?.chapters?.saju_core?.topics?.temperament;
 const published=original?.serverOwnedWritingContract;
 if(!published||
    published.kind!=='server-owned-first-chapter-evidence-and-claim-contract-v1'||
    published.humanEditorialApproval!==false||
    published.releaseVerdict!=='not-approved'||
    original.paidCoreDepthV2?.approvedAsPremiumValue!==false)
  throw Error('QA3_CLASSICAL_PROVIDER_NO_CANONICAL_SOURCE_CONTRACT');
 const verified=audit.inspect(prompt.facts);
 const manuscript=revised.make(prompt.facts);
 if(!verified||!manuscript||
    verified.fullClassicalExpertReview!==false||
    manuscript.approvedForPaidWriter!==false||
    manuscript.approvedForCustomer!==false||
    manuscript.releaseVerdict!=='not-approved'||
    verified.unresolved.transformationToWood!=='not-established'||
    verified.unresolved.schoolPriority!=='not-established'||
    verified.verified.pair!=='丁壬'||
    verified.verified.monthBranch!=='未'||
    verified.verified.alternateHasDingRenDayHourPair!==false)
  throw Error('QA3_CLASSICAL_PROVIDER_UNVERIFIED_METHOD_SCOPE');
 const refs=manuscript.evidenceRefs;
 if(!refs.length||!published.evidenceRefs.every(id=>refs.includes(id))||
    !refs.every(id=>Object.hasOwn(payload.source,id)&&
      original.citableFacts.some(row=>row.id===id))||
    payload.source['natal.hour.stem']?.stem!=='丁'||
    payload.source['natal.day.stem']?.stem!=='壬'||
    payload.source['natal.month.hidden.丁']?.stem!=='丁')
  throw Error('QA3_CLASSICAL_PROVIDER_SOURCE_DIVERGENCE');
 // Do not send the long human-written specimen to the model as a hidden
 // answer key. Instead supply a narrow set of claims and forbidden inferences.
 const brief={
  kind:'qa3-1994-classical-verified-writing-brief-v1',
  scope:'saju_core/temperament-only',
  exactChart:verified.exactChart,
  comparisonAgainst:'month-only-strength-paragraph',
  requiredEvidenceRefs:refs.slice(),
  reviewedClassicalSources:verified.sourceUnits.map(row=>({
   title:row.title,sourceUnit:row.unit,url:row.url,
   matchingFullChartExample:false
  })),
  permittedClaims:[
   {id:'hidden-and-visible',statement:'태어난 달에 숨은 丁과 태어난 시간 겉의 丁은 정확히 같은 글자다.',
    refs:['natal.month.hidden.丁','natal.hour.stem','facts.stemConnections']},
   {id:'day-hour-pair',statement:'출생일의 壬과 시간의 丁은 인접한 짝 관계 후보이며 실제 변화 성립까지 확인된 것은 아니다.',
    refs:['natal.day.stem','natal.hour.stem','facts.stemConnections']},
   {id:'listed-month',statement:'출생월 未는 『삼명통회』에서 丁壬의 변화 가능성을 논할 때 거론하는 월의 범위에 해당한다. 월의 일치만으로 변화가 성립했다고 볼 수 없다.',
    refs:['natal.month.hidden.丁','facts.seasonalEvidence','natal.day.stem','natal.hour.stem']},
   {id:'contrasting-directions',statement:'해의 글자가 시간 글자를 돕는 계산 방향과 날의 글자가 시간 글자를 제약하는 계산 방향이 함께 존재하며 어느 쪽이 우선하는지는 결정되지 않았다.',
    refs:['natal.year.stem','natal.day.stem','natal.hour.stem']},
   {id:'hour-counterexample',statement:'같은 날짜 오후 8시 20분으로 출생시각을 변경하면 시주가 달라져 위 丁壬 날·시간의 짝을 그대로 적용할 수 없다.',
    refs:['natal.day.stem','natal.hour.stem']}
  ],
  writingOrder:['월 중심 기본 해석과 새 시간 자리의 차이를 먼저 밝힌다',
   '한 쌍인 것과 실제 변화한 것을 구별한다',
   '서로 다른 문헌의 적용 범위와 다른 오행 방향을 혼동하지 않는다',
   '출생시간 변경 반례가 가리키는 적용 한계를 쉬운 말로 설명한다'],
  prohibited:['합화가 실제 木으로 확정되었다고 쓰지 않는다',
   '丁 또는 원래의 재물 분류가 사라졌다고 단정하지 않는다',
   '어느 고전 방법이 사주 전체에서 최우선인지 선택하지 않는다',
   '금전운·성격·직업 적성·성공·건강·사건을 만들어 내지 않는다',
   '가상의 장비 관리·준비물·재고 업무 장면을 채워 넣지 않는다',
   '고전 원문이나 근거 ID를 독자 본문에 한자·명리 전문어로 나열하지 않는다'],
  textInstruction:'위에서 확인한 명식의 좁은 추가 해석만 독자용 쉬운 한국어로 설명한다. 기존 월 중심 풀이를 반복하지 않는다. 두 고전의 월 조건과 실제 변화 미확정을 구별한다. 어떤 점이 출생시간 때문에 새롭게 검토되는지 설명하고, 앞의 조건을 충족하지 못하면 temperament 문단 전체를 null로 둔다.',
  expectedOutput:'natural-language-proposal-not-preapproved-answer',
  existingDecoderStillApplies:true,
  humanEditorialApproval:false,
  customerAuthorized:false,
  modelCallsAllowed:0,
  releaseVerdict:'not-approved'
 };
 return brief;
}
function previewTransport(prompt,payload,projected){
 const brief=inspect(prompt,payload);
 if(!brief)return projected;
 if(projected===payload||!projected?.task?.chapters?.saju_core)
  throw Error('QA3_CLASSICAL_PROVIDER_NO_REAL_PROJECTED_TASK');
 const copy=structuredClone(projected);
 const source=payload.task.chapters.saju_core;
 const target=copy.task.chapters.saju_core;
 const topic=target.topics.temperament;
 if(!topic.serverOwnedWritingContract||
    !source.topics.temperament.serverOwnedWritingContract||
    JSON.stringify(topic.serverOwnedWritingContract)!==
      JSON.stringify(source.topics.temperament.serverOwnedWritingContract))
  throw Error('QA3_CLASSICAL_PROVIDER_CANONICAL_CONTRACT_LOST');
 // The canonical generic workplace contract is kept in the ORIGINAL server
 // payload, but not sent as a competing command to the model in this preview.
 delete topic.serverOwnedWritingContract;
 topic.qaClassicalWritingBrief=brief;
 // New offline QA6 only: five verified research claims have a required slot,
 // so the model-facing task cannot simultaneously instruct it to emit null.
 if(require('./report-qa6-required-research-slot').enabled(prompt))
  topic.qaClassicalWritingBrief.textInstruction=
   require('./report-qa6-required-research-slot').INSTRUCTION;
 // The ordinary contrast reference list contains five IDs and describes a
 // workplace scene. Do not send that as a competing source decision beside
 // this nine-reference published-rule research assignment.
 topic.sourceQualifiedWritingDecision={
  kind:'qa3-classical-source-scoped-writing-decision-v1',
  decision:'render-verified-classical-claims-only',
  requiredCitationIds:brief.requiredEvidenceRefs.slice(),
  approvedForSale:false
 };
 topic.paidCoreDepthV2={
  kind:'first-chapter-optional-full-chart-source-v1',
  comparisonScope:'verified-exact-day-hour-classical-research-only',
  readerContrast:null,readerAlternative:null,readerClassicalScope:null,
  approvedAsPremiumValue:false,customerQualityValidated:false
 };
 target.coreV2ConditionalReadingBrief=
  '이 QA에서 temperament의 유일한 작성 자료는 qaClassicalWritingBrief이다. '+
  '기존 가상 업무/두 누락 조건 템플릿은 이 명식의 고전 적용 범위 설명에 해당하지 않는다. '+
  (require('./report-qa6-required-research-slot').enabled(prompt)?
   '이미 검증된 5개 주장에 연결된 이 연구용 문단은 필수다. 자료가 부족하면 검증 실패로 중단하며 내용을 만들어 채우지 않는다. ':
   '실제 금전·성격 결과를 단정할 수 없으면 이 선택 문단은 null로 둔다. ')+
  'strength와 다른 장의 내용·출처는 그대로 유지한다.';
 if(JSON.stringify(copy.source)!==JSON.stringify(payload.source)||
    JSON.stringify(target.topics.strength)!==
      JSON.stringify(source.topics.strength)||
    JSON.stringify(Object.keys(copy.task.chapters))!==
      JSON.stringify(Object.keys(payload.task.chapters))||
    brief.requiredEvidenceRefs.some(id=>!Object.hasOwn(copy.source,id)))
  throw Error('QA3_CLASSICAL_PROVIDER_PROTECTED_PAYLOAD_DRIFT');
 return copy;
}
function schemaText(prompt,payload){
 const brief=inspect(prompt,payload);
 if(!brief)return null;
 return 'QA 연구용 고전 해석: '+brief.textInstruction+' '+
  brief.permittedClaims.map(x=>x.statement).join(' ')+
  ' 검토한 고전 자료: '+brief.reviewedClassicalSources.map(x=>
   (x.title==='三命通會'?'삼명통회':x.title==='子平真詮'?'자평진전':x.title)+
   '('+x.sourceUnit+')').join(', ')+
  ' 금지: '+brief.prohibited.join(' ')+
  ' 내부 근거는 반드시 다음 IDs에 연결: '+
  brief.requiredEvidenceRefs.join(', ')+
  '. 스스로 검증하지 못한 새 결론은 추가하지 않는다.';
}
module.exports={enabled,inspect,previewTransport,schemaText};
