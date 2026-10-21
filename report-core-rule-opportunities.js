'use strict';
// Deterministic, non-personal coverage planning. Not an estimate of real users.
const facts=require('./report-facts-node');
const core=require('./report-core-knowledge-engine');
const coverage=require('./report-core-knowledge-coverage');
const month=require('./report-seasonal-evidence');
function survey(inputs=coverage.representativeInputs()){
 const cases=[],families=new Map(),sampleByBranch=new Map();
 for(const input of inputs){
  const packet=facts.build(input,2027);
  if(packet.status!=='ready')continue;
  const output=core.compile(packet);
  if(output.status!=='not-covered')continue;
  const s=output.scope,branch=s.monthBranch;
  const family=[s.seasonalPhase,s.monthElementRelation,
   s.visibleTenGod,s.hiddenTenGod].join('|');
  const row={
   date:input.birthDate,calendar:input.calendar,branch,
   dayStem:packet.chart.day[0],monthPillar:packet.chart.month,
   visible:s.visibleTenGod,hidden:s.hiddenTenGod,
   phase:s.seasonalPhase,relation:s.monthElementRelation,
   seasonToDay:s.seasonToDayRelation,hasOutline:!!output.compositionPlan?.editorialOutline
  };
  if(!row.hasOutline)throw Error('OPPORTUNITY_MISSING_EDITORIAL_OUTLINE');
  cases.push(row);
  if(!families.has(family))families.set(family,{key:family,count:0,branches:new Set(),examples:[]});
  const f=families.get(family);f.count++;f.branches.add(branch);
  if(f.examples.length<2)f.examples.push(row);
  if(!sampleByBranch.has(branch))sampleByBranch.set(branch,row);
 }
 const sorted=[...families.values()].map(f=>({key:f.key,count:f.count,
  branches:[...f.branches].sort(),examples:f.examples}))
   .sort((a,b)=>b.count-a.count||a.key.localeCompare(b.key));
 return {kind:'synthetic-fixed-qa-grid-not-traffic',
  missingCases:cases.length,distinctFamilyKeys:sorted.length,
  topFamilies:sorted.slice(0,12),
  branchExamples:[...sampleByBranch.values()].sort((a,b)=>a.branch.localeCompare(b.branch))};
}
module.exports={survey};
