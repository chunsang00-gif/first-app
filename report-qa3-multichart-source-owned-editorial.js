'use strict';
// Free, QA-only deterministic reader specimen from independently checked
// chart-specific server contracts. NEVER a paid model result or approved prose.
// No production, provider, request schema or decoder modification.
const writer=require('./report-generation-request');
const reader=require('./report-reader-policy');
const exact=require('./report-paid-core-v2-server-contract');
const alternative=require('./report-paid-core-v2-separate-visible-contract');
function build(prompt){
 if(process.env.NODE_ENV!=='test'||process.env.RENDER==='true'||
    process.env.PAID_CORE_DEPTH_V2!=='offline-preview'||
    prompt?.paidCoreDepthV2!==true||prompt.stage!=='body'||
    JSON.stringify(prompt.requestedSections)!=='["saju_core"]')
  throw Error('QA3_MULTI_CHART_EDITORIAL_OFFLINE_ONLY');
 const payload=writer.compile(prompt);
 const topic=payload?.task?.chapters?.saju_core?.topics?.temperament;
 const contract=topic?.serverOwnedWritingContract;
 if(!contract)return null; // no verified new question: never invent depth
 const kind=contract.kind;
 const engine=kind==='server-owned-first-chapter-evidence-and-claim-contract-v1'?
  exact:kind==='server-owned-first-chapter-separate-visible-contract-v1'?
  alternative:null;
 if(!engine||JSON.stringify(engine.build(payload.source,topic))!==
    JSON.stringify(contract)||contract.humanEditorialApproval!==false||
    contract.releaseVerdict!=='not-approved'||
    !contract.evidenceRefs?.every(ref=>Object.hasOwn(payload.source,ref)&&
      topic.citableFacts.some(row=>row.id===ref)))
  throw Error('QA3_MULTI_CHART_EDITORIAL_CONTRACT_NOT_VERIFIED');
 const o=contract.outline;
 if(!o||['proof','comparedRoles','example','originalOnly','additionalOnly',
    'direction','limitation'].some(key=>typeof o[key]!=='string'||!o[key]))
  throw Error('QA3_MULTI_CHART_EDITORIAL_MISSING_CONDITIONS');
 if(o.originalOnly===o.additionalOnly)
  throw Error('QA3_MULTI_CHART_EDITORIAL_UNDIFFERENTIATED_CASE');
 const place=contract.sourcePosition==='natal.hour.stem'?'태어난 시간':
  contract.sourcePosition==='natal.year.stem'?'태어난 해':null;
 if(!place)throw Error('QA3_MULTI_CHART_EDITORIAL_UNSUPPORTED_POSITION');
 const same=engine===exact;
 const evidenceSentence=same?
  place+'의 겉글자는 태어난 달의 다른 속글자와 정확히 일치합니다. ':
  place+'의 겉글자는 태어난 달의 대표 속글자와 서로 다른 분류입니다. '+
  '달에 숨은 다른 글자가 그 위치에 겉으로 드러났다는 뜻은 아닙니다. ';
 const contrast=same?
  '달의 대표 속글자만 읽으면 이 정확한 연결 관계를 설명할 수 없습니다. ':
  '달에 없는 정확한 연결 관계를 지어내지 않고 별도 분류만 비교합니다. ';
 const clean=s=>String(s).replaceAll('오행','기운')
  .replaceAll('실제 성격·직업 능력·성과','실제 성격이나 능력 또는 결과');
 const text=[
  evidenceSentence+contrast+'두 전통 분류가 왜 서로 다른 질문인지 '+clean(o.comparedRoles)+'을 기준으로 살핍니다.',
  '예를 들어 '+clean(o.example)+'을 가정해 보겠습니다. '+
    '첫 조건만 준비한 경우 '+clean(o.originalOnly)+'. '+
    '반대로 두 번째 조건만 준비한 경우 '+clean(o.additionalOnly)+'.',
  '두 관계가 가리키는 전통적인 방향은 '+clean(o.direction)+
    '입니다. 이는 계산된 상징의 비교이며, '+clean(o.limitation)+
    '. 특정 개인의 실제 습관이나 결과를 예측하지 않습니다.'
 ].join('\n\n');
 const candidate={
  label:same?'출생월과 '+place+'의 정확한 연결에서 보는 두 조건':
   '출생월과 '+place+'의 별도 분류가 보여 주는 선택의 차이',
  text,basis:{
   refs:contract.evidenceRefs.slice(),
   interpretation:'이 명식에서 확인한 출생월 및 '+place+
    '의 서로 다른 전통 분류를 연결해 설명합니다.',
   condition:'가상 사례인 '+o.example+'에서 두 누락 조건을 구별합니다.',
   limit:'자료의 상징적 적용은 실제 성격이나 결과에 관한 관찰 증거가 아닙니다.'
  }
 };
 if(reader.errors([candidate.label,candidate.text]).length)
  throw Error('QA3_MULTI_CHART_EDITORIAL_READER_POLICY');
 return {
  kind:'qa3-offline-source-owned-reader-specimen-v1',
  candidate,
  sceneId:contract.sceneId||topic.sourceQualifiedWritingDecision.readerScene?.sceneId,
  contractKind:kind,
  sourcePosition:contract.sourcePosition,
  chartFingerprint:[prompt.facts.chart.year,prompt.facts.chart.month,
    prompt.facts.chart.day,prompt.facts.chart.hour].join('/'),
  citedServerRefs:contract.evidenceRefs.slice(),
  reviewedByHuman:false,approvedForCustomer:false,providerCalls:0,
  releaseVerdict:'not-approved'
 };
}
module.exports={build};
