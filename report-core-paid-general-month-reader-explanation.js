'use strict';
// OFFLINE QA reader-facing explanation from the GENERAL month-method screen.
// This explains exactly which textual conditions matched; it does not infer
// an individual's temperament, career, finances, relationships or future.
// It is NEVER a substitute for a professionally established interpretation.
const screen=require('./report-core-paid-general-month-classical-screen');
const bindings=require('./report-fact-bindings');
const language=require('./report-reader-policy');
const ROLE_MEANING=Object.freeze({
 '비견':'자기주장과 동료 관계','겁재':'경쟁과 나눔',
 '식신':'표현과 생산 활동','상관':'표현과 기존 규칙에 대한 반응',
 '편재':'자원 활용과 대외 활동','정재':'재물 관리와 지속적인 수고',
 '편관':'압박과 대응','정관':'규칙과 역할',
 '편인':'독자적인 이해와 배움','정인':'배움과 보호'
});
const PLACE=Object.freeze({
 'natal.year.stem':'태어난 해','natal.month.stem':'태어난 달',
 'natal.hour.stem':'태어난 시간'
});
function build(packet){
 const audit=screen.inspect(packet);
 if(audit.releaseVerdict!=='not-approved'||audit.providerCalls!==0||
    audit.anyFinalPatternChosen!==false||
    audit.approvedForPaidRequest!==false)
  throw Error('QA_READER_MONTH_METHOD_UNAPPROVED_SOURCE');
 if(!audit.applicable)return {
  kind:'qa-month-method-reader-explanation-v1',status:'out-of-scope',
  chartFingerprint:audit.chartFingerprint,reader:null,
  reason:'해당 출생월에는 이 특정 고전 규칙을 적용하지 않습니다.',
  providerCalls:0,approvedForCustomer:false,releaseVerdict:'not-approved'
 };
 const ledger=Object.fromEntries(bindings.build(packet).map(x=>[x.id,x]));
 const selected=audit.candidates.map(x=>{
  const row=ledger[x.sourceId],meaning=ROLE_MEANING[x.traditionalRole];
  if(!row||!meaning||row.tenGod!==x.traditionalRole||
     row.observedBehavior!==false||
     row.interpretationScope!=='traditional-symbol-only'||
     !packet.facts.tenGodGlossary[x.traditionalRole]?.includes(meaning)||
     !x.exposedAt.length||
     x.exposedAt.some(id=>!PLACE[id]||ledger[id]?.stem!==row.stem))
   throw Error('QA_READER_MONTH_METHOD_LEXICON_OR_PROVENANCE_DRIFT');
  return {sourceRef:x.sourceId,role:x.traditionalRole,meaning,
   positions:x.exposedAt.slice(),sourceRefs:[x.sourceId,...x.exposedAt]};
 });
 if(selected.length!==audit.distinctVisibleCandidateCount||
    (selected.length===1)!==(audit.provisionalMethodCandidate!==null&&
       !audit.completeSanHeGroupMembership.length))
  throw Error('QA_READER_MONTH_METHOD_SELECTION_MISMATCH');
 const observed=selected.map(x=>({
  ...x,positionWords:x.positions.map(p=>PLACE[p])}));
 let explanation;
 if(!observed.length)
  explanation='태어난 달의 안쪽에는 서로 다른 세 글자가 있지만, 해·달·시간의 겉에 그 글자와 정확히 일치하는 것은 없습니다. 이 계산만으로 어느 뜻을 먼저 읽을지 정할 수 없고, 눈에 보이지 않는다는 이유로 해당 뜻이 없다고 판단하지도 않습니다.';
 else if(observed.length===1){
  const x=observed[0];
  explanation='태어난 달의 안쪽에 있는 여러 글자 중 '+x.positionWords.join('과 ')+
   '에 나타난 한 종류가 확인됩니다. 전통적으로 이 글자는 '+x.meaning+
   '을 살피는 항목입니다. 같은 글자가 여러 자리에 나오더라도 서로 다른 뜻이 여러 개 생기거나 그 성향이 더 강하다고 계산하지는 않습니다.';
 }else{
  const labels=observed.map(x=>x.positionWords.join('과 ')+
   '에서 확인되는 '+x.meaning);
  explanation='태어난 달의 안쪽에 있는 글자 가운데 겉으로 드러난 후보가 '+
   observed.length+'종류입니다. '+labels.join(', ')+'이 각각 해당합니다. '+
   '따라서 한 가지 뜻만 골라 이 사람의 기질이나 행동을 확정할 수 없으며, 서로 다른 해석 후보의 우선순위를 추가로 검토해야 합니다.';
 }
 const hasTriad=audit.completeSanHeGroupMembership.length>0;
 const condition=hasTriad?
  '태어난 달이 포함된 세 자리의 글자 조합도 계산상 확인됩니다. 이 조합과 겉으로 드러난 글자 중 무엇을 먼저 살필지는 아직 결정되지 않았습니다.':
  '태어난 달을 포함하는 특정 세 자리 글자 조합은 계산상 완성되지 않았습니다. 조합이 없다는 이유로 앞서 확인한 후보가 더 강하거나 유리하다고 판단할 수는 없습니다.';
 const boundary='여기서 확인한 것은 전통 문헌의 적용 조건이지 실제 성격이나 직업 적성, 앞으로 일어날 사건에 대한 결론이 아닙니다.';
 const text=[explanation,condition,boundary].join(' ');
 const evidenceRefs=[...new Set([...audit.sourceRefs])];
 if(evidenceRefs.some(id=>id.startsWith('natal.')&&!ledger[id])||
    !evidenceRefs.includes('facts.stemConnections')||
    !evidenceRefs.includes('facts.natalBranchRelations')||
    language.errors([text]).length||
    /[\u3400-\u4dbf\u4e00-\u9fff]/.test(text)||
    /[?？]\s*$/.test(text))
  throw Error('QA_READER_MONTH_METHOD_INVALID_READER_COPY');
 return {
  kind:'qa-month-method-reader-explanation-v1',
  status:'source-scoped-explanation-only',chartFingerprint:audit.chartFingerprint,
  reader:{title:'태어난 달에서 확인된 해석의 출발 조건',text,
   sourceSignature:JSON.stringify({
    status:audit.status,positions:observed.map(x=>x.positions),
    roles:observed.map(x=>x.role),triad:audit.completeSanHeGroupMembership.map(x=>x.branches)
   })},
  sourceRefs:evidenceRefs,
  sourceClass:'calculated-classical-applicability-not-personal-meaning',
  candidateRoles:observed.map(x=>x.role),
  disputedPriority:observed.length!==1||hasTriad,
  cannotConcludeLifeFromSingleCandidate:true,
  cannotInferStrengthFromRepeatedPosition:true,
  readerValueBeyondBasicMonthNotVerified:true,
  copyToNormalPaidWriter:false,
  meaningProfessionallyValidated:false,approvedForCustomer:false,
  providerCalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={build};
