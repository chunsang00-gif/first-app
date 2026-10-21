'use strict';
// First conditional natal-branch interpretation candidate. Table membership
// is NOT a predicted event, psychological fact or measured strength.
const knowledge=require('./report-core-knowledge.json');
const branches=require('./report-branch-relations');
function audit(kb=knowledge){
 const ids=new Set();
 for(const rule of kb.natalContextRules||[]){
  const w=rule.when;
  if(rule.status!=='editorial-candidate'||ids.has(rule.id)||
     !kb.pairRules?.some(p=>p.id===w?.coreRuleId)||
     !w||JSON.stringify(w.positions)!=='["month","day"]'||
     typeof w.monthBranch!=='string'||typeof w.dayBranch!=='string'||
     !branches.pairRelations(w.monthBranch,w.dayBranch).includes(w.relation)||
     !['충','육합','형','파','해'].includes(w.relation)||
     rule.evidenceRole!=='verified-natal-month-day-pair-table-only'||
     JSON.stringify(rule.sourceRefs)!=='["facts.natalBranchRelations"]'||
     !Array.isArray(rule.limits)||
     !rule.limits.includes('no-event-prediction')||
     typeof rule.reader?.label!=='string'||rule.reader.label.length<10||
     typeof rule.reader?.text!=='string'||rule.reader.text.length<180)
   throw Error('CORE_NATAL_RULE_INVALID_OR_UNSUPPORTED:'+rule.id);
  ids.add(rule.id);
 }
 return {natalContextRules:ids.size};
}
function select(packet,graph,coreRuleId){
 const monthBranch=packet?.chart?.month?.[1],dayBranch=packet?.chart?.day?.[1];
 if(!monthBranch||!dayBranch||!Array.isArray(graph?.natalRelations))
  throw Error('CORE_NATAL_MISSING_VERIFIED_SOURCES');
 const matching=(knowledge.natalContextRules||[]).filter(x=>
  x.when.coreRuleId===coreRuleId&&x.when.monthBranch===monthBranch&&
  x.when.dayBranch===dayBranch&&graph.natalRelations.some(r=>
   r.type===x.when.relation&&r.positions.length===2&&
   r.positions.includes('month')&&r.positions.includes('day')&&
   r.branches===monthBranch+dayBranch&&
   r.sourceIds.length===1&&r.sourceIds[0]==='facts.natalBranchRelations'&&
   r.transformation==='not-assessed'));
 if(matching.length>1)throw Error('CORE_NATAL_AMBIGUOUS_CONTEXT_RULE');
 const r=matching[0];
 if(!r)return null;
 return {ruleId:r.id,reader:{...r.reader},sourceRefs:r.sourceRefs.slice(),
  matched:{monthBranch,dayBranch,relation:r.when.relation,
   positions:r.when.positions.slice()},evidenceRole:r.evidenceRole,
  limits:r.limits.slice(),humanReviewRequired:true,releaseVerdict:'not-approved'};
}
audit();
module.exports={audit,select};
