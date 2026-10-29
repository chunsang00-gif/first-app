'use strict';
// QA13: prove whether a natal WEALTH SYMBOL is situated at the endpoint
// of a VERIFIED natal branch clash. This is a candidate relation, never
// proof of money loss, borrowing, investment risk, an event or a life trait.
// No customer-facing prose or provider schema is altered by this module.
const calculated=require('./report-branch-relations');
const facts=require('./report-fact-bindings');
const guidance=require('./report-analysis-guidance');
const WEALTH=new Set(['정재','편재']);
const POSITIONS=new Set(['year','month','day','hour']);
const LABELS=Object.freeze({
 year:'태어난 해',month:'태어난 달',day:'태어난 날',hour:'태어난 시간'
});
function signature(row){
 return String(row.type)+':'+(row.positions||[]).slice().sort().join('/')+
  ':'+[...(row.branches||'')].sort().join('');
}
function inspect(packet){
 if(process.env.NODE_ENV!=='test'||process.env.RENDER==='true')
  throw Error('QA13_OFFLINE_SOURCE_INSPECTION_ONLY');
 if(!packet||packet.status!=='ready'||!packet.chart||!packet.facts)
  throw Error('QA13_CALCULATED_PACKET_REQUIRED');
 const policy=guidance.preflight(packet).money?.topicTasks?.risk;
 if(!policy||policy.mode!=='state-limits'||policy.evidencePresent!==false||
    (policy.allowedSourceRefs||[]).length!==0)
  throw Error('QA13_MONEY_RISK_POLICY_UNEXPECTEDLY_ACTIVE');
 const table=calculated.natal(packet.chart);
 const expected=table.pairs.filter(x=>x.type==='충');
 const actual=packet.facts.natalClashes||[];
 if(JSON.stringify(expected.map(signature).sort())!==
    JSON.stringify(actual.map(signature).sort()))
  throw Error('QA13_NATAL_BRANCH_CLASH_LEDGER_MISMATCH');
 const hidden=Object.fromEntries(facts.build(packet).filter(row=>
  row.id.startsWith('natal.')&&
  row.id.includes('.hidden.')&&
  POSITIONS.has(row.id.split('.')[1])).map(row=>[row.id,row]));
 const related=[];
 for(const clash of actual){
  if(clash.type!=='충'||clash.positions?.length!==2)continue;
  const [first,second]=clash.positions;
  if(!POSITIONS.has(first)||!POSITIONS.has(second)||
     first===second||!packet.chart[first]||!packet.chart[second])
   throw Error('QA13_INVALID_CLASH_POSITIONS');
  const chartPair=packet.chart[first][1]+packet.chart[second][1];
  if(chartPair!==clash.branches)
   throw Error('QA13_CLASH_BRANCHES_NOT_ON_CHART');
  for(const touched of [first,second]){
   const opposite=touched===first?second:first;
   const rows=Object.values(hidden).filter(x=>
    x.id.startsWith('natal.'+touched+'.hidden.')&&WEALTH.has(x.tenGod));
   for(const source of rows){
    if(source.observedBehavior!==false||
       source.interpretationScope!=='traditional-symbol-only'||
       !source.traditionalMeaning)
     throw Error('QA13_UNVERIFIED_WEALTH_SOURCE');
    related.push(Object.freeze({
     wealthSourceId:source.id,wealthCategory:source.tenGod,
     wealthStem:source.stem,wealthBranchPosition:touched,
     otherBranchPosition:opposite,relation:'충',
     branchPair:clash.branches,
     pairedPositions:clash.positions.slice(),
     relationSourceId:'facts.natalClashes',
     unselectedClassicalPriority:true,
     realizedLifeEvent:false
    }));
   }
  }
 }
 const matches=related.sort((a,b)=>a.wealthSourceId.localeCompare(b.wealthSourceId)||
  a.otherBranchPosition.localeCompare(b.otherBranchPosition));
 const selected=matches[0]||null;
 const question=selected?
  LABELS[selected.wealthBranchPosition]+' 안에서 계산한 재물 관련 전통 분류와 '+
  LABELS[selected.otherBranchPosition]+' 사이에 지지 충 관계가 함께 확인됩니다. '+
  '이 둘의 전통적인 해석에서 어떤 비교가 가능한지는 별도 문헌 검증이 필요합니다.':
  '출생 사주에서 금전 위험을 따로 풀이할 직접적인 독립 관계가 확인되지 않았습니다.';
 return Object.freeze({
  kind:'qa13-money-wealth-clash-source-feasibility-v1',
  scopeStatus:selected?'natal-wealth-endpoint-clash-candidate-only':
   actual.length?'no-wealth-at-verified-clash-endpoint':'no-natal-clash',
  natalClashCount:actual.length,
  wealthAtClashEndpointCount:matches.length,
  candidates:matches,selectedCandidate:selected,
  editorialResearchQuestion:question,
  referencesAreSeparateFactsNotCausalProof:true,
  moneyEarningAndSpendingMeaningNotReplaced:true,
  actualMoneyRiskMeasured:false,
  realLossPredicted:false,
  rolePriorityResolved:false,
  methodTextuallyVerified:false,
  paidRiskTopicModeUnchanged:'state-limits',
  safeToAutoWriteCustomerRisk:false,
  requiresIndependentClassicalAndEditorialReview:true,
  customerReleaseApproved:false,canSell:false,providerCalls:0
 });
}
module.exports={inspect};
