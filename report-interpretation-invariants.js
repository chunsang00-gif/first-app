'use strict';
// One deterministic fail-closed check between calculation, interpretation
// planning, canonical reference IDs and the paid AI transport.
// A passing check proves provenance consistency, not that fortune-telling
// predicts real behavior or outcomes.
const core=require('./report-interpretation-core');
const bindings=require('./report-fact-bindings');
const annualIds={money:'year_2027_money',career:'year_2027_career'};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function verify(packet,plan){
 const errors=[];
 if(!packet?.facts?.tenGods||!packet.facts.annualTenGods||!plan)
  return {pass:false,errors:['missing-calculation-or-interpretation-plan']};
 const rows=bindings.build(packet);
 const ids=new Set(rows.map(row=>row.id));
 if(ids.size!==rows.length)errors.push('duplicate-position-bound-calculation-id');
 const expected=core.all(packet);
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
 for(const [chapterId,chapter] of Object.entries(plan)){
  for(const [topic,task] of Object.entries(chapter?.topicTasks||{})){
   if(task.mode==='state-limits'){
    if(task.evidencePresent)errors.push('unsupported-topic-has-evidence:'+chapterId+':'+topic);
    if(task.evidenceReuseBoundary)errors.push('blocked-topic-owns-calculation-source:'+chapterId+':'+topic);
   }
   if(Array.isArray(task.allowedSourceRefs)){
    const missing=task.allowedSourceRefs.filter(id=>!ids.has(id));
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
