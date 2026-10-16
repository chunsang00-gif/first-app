'use strict';
// One deterministic fail-closed check between calculation, interpretation
// planning, canonical reference IDs and the paid AI transport.
// A passing check proves provenance consistency, not that fortune-telling
// predicts real behavior or outcomes.
const core=require('./report-interpretation-core');
const bindings=require('./report-fact-bindings');
const annualIds={money:'year_2027_money',career:'year_2027_career'};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
// Independent domain oracle. The publisher's blueprint is NOT the authority
// for whether a cited natal source belongs to a money/work/relationship/stress
// question: reconstruct membership from the original calculated ten-god rows.
// Keep the allowed categories explicit here to catch a drift in the planner.
const domainKindChecks={
 money:{
  earning:row=>['정재','편재','식신','상관'].includes(row.tenGod),
  spending:row=>['정재','편재'].includes(row.tenGod),
  risk:()=>false
 },
 career:{
  workstyle:row=>['식신','상관','정인','편인'].includes(row.tenGod),
  teamwork:row=>['비견','겁재','정관','편관'].includes(row.tenGod),
  growth:row=>['정인','편인'].includes(row.tenGod),
  change:()=>false
 },
 relationship:{
  closeness:row=>/^natal\\.day\\.hidden\\./.test(row.id),
  expression:row=>['식신','상관'].includes(row.tenGod),
  conflict:()=>false
 },
 stress:{
  trigger:row=>['정관','편관'].includes(row.tenGod),
  response:row=>['정인','편인'].includes(row.tenGod)
 }
};
function checkDomainSources(rows,plan){
 const errors=[];
 const natal=rows.filter(row=>row.id.startsWith('natal.'));
 for(const [chapterId,topics] of Object.entries(domainKindChecks)){
  for(const [topic,accept] of Object.entries(topics)){
   const actual=plan?.[chapterId]?.topicTasks?.[topic];
   const expected=natal.filter(accept).map(row=>row.id);
   const supported=expected.length>0;
   if(!actual||!same(actual.allowedSourceRefs,expected)||
      actual.mode!==(supported?'use-primary':'state-limits')||
      actual.evidencePresent!==supported||
      !same(actual.verifiedFallbackPaths,[]))
    errors.push('domain-topic-source-mismatch:'+chapterId+':'+topic);
  }
 }
 return errors;
}

function verify(packet,plan){
 const errors=[];
 if(!packet?.facts?.tenGods||!packet.facts.annualTenGods||!plan)
  return {pass:false,errors:['missing-calculation-or-interpretation-plan']};
 const rows=bindings.build(packet);
 const ids=new Set(rows.map(row=>row.id));
 errors.push(...checkDomainSources(rows,plan));
 if(ids.size!==rows.length)errors.push('duplicate-position-bound-calculation-id');
 const expected=core.all(packet);
 if(packet.facts?.seasonalEvidence){
  if(!packet.chart||
     !same(packet.facts.seasonalEvidence,require('./report-seasonal-evidence').evaluate(packet.chart)))
   errors.push('calculated-seasonal-context-mismatch');
  if(packet.facts.qiEvidence&&!same(packet.facts.qiEvidence,require('./report-qi-evidence').build(packet.chart,packet.facts.solarTermTiming)))
   errors.push('calculated-positional-qi-context-mismatch');
  if(packet.facts.stemConnections&&(!packet.chart||
     !same(packet.facts.stemConnections,require('./report-stem-connections').build(packet.chart))))
   errors.push('calculated-stem-connection-mismatch');
  if(packet.facts.rootConditions&&(!packet.chart||!packet.targetYear?.pillar||
    !same(packet.facts.rootConditions,require('./report-root-conditions').build(packet.chart,packet.targetYear.pillar))))
   errors.push('calculated-root-condition-mismatch');
  const topic=plan.saju_core?.topicTasks?.temperament;
  if(topic?.mode!=='state-limits'&&
     !topic?.requiredSourceKinds?.includes('seasonal'))
   errors.push('missing-canonical-seasonal-topic-requirement');
  if(packet.facts.qiEvidence&&topic?.mode!=='state-limits'&&
     !topic?.requiredSourceKinds?.includes('qi-ledger'))
   errors.push('missing-canonical-qi-ledger-topic-requirement');
  if(packet.facts.qiEvidence&&topic?.mode!=='state-limits'&&
     !topic?.requiredSourceKinds?.includes('natal-month-position'))
   errors.push('missing-canonical-month-position-topic-requirement');
  // Root/clash ledgers remain mathematically checked above, but cannot be
  // the REQUIRED interpretive basis of a paid temperament paragraph.
  const second=plan.saju_core?.topicTasks?.strength;
  if(second?.mode!=='state-limits'&&(
      second?.primaryEvidencePath!=='facts.tenGods.month'||
      !second?.requiredSourceKinds?.includes('month-ten-god')))
   errors.push('missing-canonical-month-ten-god-topic-requirement');
  if(second?.requiredSourceKinds?.some(k=>k==='stem-linkage'||k==='root-condition'))
   errors.push('optional-roots-incorrectly-mandated-for-personality');
  if(topic?.requiredSourceKinds?.some(k=>k==='stem-linkage'||k==='root-condition'))
   errors.push('root-evidence-misassigned-to-seasonal-topic');
 }
 for(const [domain,id] of Object.entries(annualIds)){
  const chapter=plan[id];
  const actual=chapter?.annualDomainEvidence;
  const truth=expected[domain];
  if(!actual||actual.relevant!==truth.relevant||
    !same(actual.sourceIds||[],truth.sourceIds)||
    !same(actual.comparisons||[],truth.comparisons))
   errors.push('year-domain-calculation-proof-mismatch:'+id);
  const change=chapter?.topicTasks?.change;
  const action=chapter?.topicTasks?.action;
  if(!change||!action)errors.push('missing-year-domain-topics:'+id);
  else if(truth.relevant){
   if(change.mode!=='use-primary'||!change.evidencePresent||
      !same(change.allowedSourceRefs||[],truth.sourceIds)||
      !same(change.requiredSourceKinds||[],['annual','natal']))
    errors.push('year-domain-source-mismatch:'+id);
   if(action.mode!=='state-limits'||action.evidencePresent)
    errors.push('duplicate-year-domain-topic:'+id);
  }else if([change,action].some(task=>task.mode!=='state-limits'||task.evidencePresent))
   errors.push('unsupported-year-domain-scope:'+id);
 }
 const dayContext=packet.facts?.targetYearBranchContext?.annualContext?.day;
 if(dayContext){
  const chapter=plan.year_2027_relationship;
  const relevant=dayContext.eligibleForLimitedDescription;
  if(!chapter?.annualDomainEvidence||
     chapter.annualDomainEvidence.relevant!==relevant||
     !same(chapter.annualDomainEvidence.directRelationTypes||[],dayContext.directTypes)||
     chapter.annualDomainEvidence.priority!=='unresolved'||
     chapter.annualDomainEvidence.transformation!=='not-assessed')
   errors.push('year-relationship-branch-context-mismatch');
  const change=chapter?.topicTasks?.change,action=chapter?.topicTasks?.action;
  if(relevant){
   if(change?.mode!=='use-primary'||!change.evidencePresent||
      change.primaryEvidencePath!=='facts.targetYearBranchContext.annualContext.day'||
      !same(change.allowedSourceRefs||[],['facts.targetYearBranchContext.annualContext.day'])||
      action?.mode!=='state-limits'||action?.evidencePresent)
    errors.push('year-relationship-source-mismatch');
  }else if([change,action].some(t=>t?.mode!=='state-limits'||t?.evidencePresent))
   errors.push('unsupported-year-relationship-interpretation');
 }
  for(const [chapterId,chapter] of Object.entries(plan)){
  const enabled=Object.values(chapter.topicTasks||{}).filter(task=>task.mode!=='state-limits');
  if(Boolean(enabled.length)!==Boolean(chapter.evidencePresent))
   errors.push('chapter-evidence-status-drift:'+chapterId);
  const anchor=chapter.topicTasks?.[chapter.anchorTopic];
  const expectedMode=!anchor?'state-insufficient-evidence':
   anchor.mode==='use-verified-fallback'?'use-fallback-with-limits':'explain-with-limits';
  if(chapter.requiredMode!==expectedMode)
   errors.push('chapter-required-mode-drift:'+chapterId);
  const fallbacks=[...new Set(enabled.filter(t=>t.mode==='use-verified-fallback').flatMap(t=>t.verifiedFallbackPaths||[]))];
  if(!same(chapter.fallbackEvidencePaths||[],fallbacks))
   errors.push('chapter-fallback-drift:'+chapterId);
  for(const [topic,task] of Object.entries(chapter?.topicTasks||{})){
   if(task.mode==='state-limits'){
    if(task.evidencePresent)errors.push('unsupported-topic-has-evidence:'+chapterId+':'+topic);
    if(task.evidenceReuseBoundary)errors.push('blocked-topic-owns-calculation-source:'+chapterId+':'+topic);
   }
   if(Array.isArray(task.allowedSourceRefs)){
    const permitted=new Set([...ids,'facts.targetYearBranchContext.annualContext.day']);
    const missing=task.allowedSourceRefs.filter(id=>!permitted.has(id)||
      (id==='facts.targetYearBranchContext.annualContext.day'&&!dayContext));
    if(missing.length)errors.push('unresolved-source-ids:'+chapterId+':'+topic);
   }
  }
  if(Boolean(chapter?.hasGroundedTopic)!==Boolean(chapter?.anchorTopic))
   errors.push('inconsistent-topic-anchor:'+chapterId);
 }
 return {pass:errors.length===0,errors:[...new Set(errors)],
  version:'calculation-to-interpretation-contract-v1',supportedDomains:Object.fromEntries(
   Object.entries(expected).map(([domain,proof])=>[domain,proof.relevant]))};
}
module.exports={verify};
