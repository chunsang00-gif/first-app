'use strict';
// Aggregate offline sampling, NOT an assessment of interpretive quality.
// Never call OpenAI or expose individual birth dates / personally entered data.
const facts=require('./report-facts-node');
const engine=require('./report-core-knowledge-engine');
const knowledge=require('./report-core-knowledge.json');
function representativeInputs(){
 const result=[];
 // Fixed, reproducible, anonymized calendar cases. This is a QA grid,
 // neither real user traffic nor an estimate of customer population.
 for(const year of [1982,1988,1994,2000,2006,2012,2018,2024])
  for(let month=1;month<=12;month++)
   result.push({calendar:'solar',birthDate:year+'-'+String(month).padStart(2,'0')+'-15',
    birthTime:'14:20',gender:'male',mbti:'ISFP'});
 result.push({calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,
  birthTime:'14:20',gender:'male',mbti:'ISFP'});
 result.push({calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,
  birthTime:'20:20',gender:'male',mbti:'ISFP'});
 result.push({calendar:'solar',birthDate:'1994-04-15',
  birthTime:'14:20',gender:'male',mbti:'ISFP'});
 return result;
}
function assess(inputs){
 if(!Array.isArray(inputs)||!inputs.length)throw Error('CORE_COVERAGE_INPUTS_REQUIRED');
 const readers=new Map(),monthContexts=new Set(),coveredContexts=new Set();
 const stats={knowledgeVersion:knowledge.version,kind:'fixed-offline-grid-not-user-traffic',
  inputCount:inputs.length,ready:0,blocked:0,withDraft:0,notCovered:0,
  distinctCharts:0,distinctMonthContexts:0,coveredMonthContexts:0,
  distinctReaderDrafts:0,readerReuseGroups:0,readerReusedAcrossChartCount:0,
  byRule:{},apiCalls:0,releaseVerdict:'not-approved',humanReviewRequired:true};
 const chartKeys=new Set();
 for(const input of inputs){
  const packet=facts.build(input,2027);
  if(packet.status!=='ready'){stats.blocked++;continue}
  const row=engine.compile(packet);
  stats.ready++;
  if(row.apiCalls!==0&&row.status!=='blocked-invalid-calculation')
   throw Error('CORE_COVERAGE_UNEXPECTED_BILLABLE_CALL');
  const chartKey=[packet.chart.year,packet.chart.month,packet.chart.day,
   packet.chart.hour||'hour-not-known'].join('/');
  chartKeys.add(chartKey);
  const context=row.scope&&[row.scope.visibleTenGod,row.scope.hiddenTenGod,
   row.scope.monthBranch,row.scope.seasonalPhase,row.scope.monthElementRelation,
   row.scope.seasonToDayRelation].join('|');
  if(context)monthContexts.add(context);
  if(row.status==='not-covered'){
   stats.notCovered++;if(row.reader!==null)throw Error('CORE_COVERAGE_UNCOVERED_READER');
  }else if(row.status==='draft-for-human-review'){
   stats.withDraft++;
   if(row.releaseVerdict!=='not-approved'||row.review.humanReviewRequired!==true)
    throw Error('CORE_COVERAGE_RELEASE_GATE_BYPASSED');
   if(context)coveredContexts.add(context);
   stats.byRule[row.ruleId]=(stats.byRule[row.ruleId]||0)+1;
   const readKey=JSON.stringify(row.reader);
   if(!readers.has(readKey))readers.set(readKey,new Set());
   readers.get(readKey).add(chartKey);
  }else throw Error('CORE_COVERAGE_UNEXPECTED_OUTPUT_STATUS:'+row.status);
 }
 stats.distinctCharts=chartKeys.size;
 stats.distinctMonthContexts=monthContexts.size;
 stats.coveredMonthContexts=coveredContexts.size;
 stats.distinctReaderDrafts=readers.size;
 stats.readerReuseGroups=[...readers.values()].filter(v=>v.size>1).length;
 stats.readerReusedAcrossChartCount=[...readers.values()]
  .reduce((n,v)=>n+Math.max(0,v.size-1),0);
 stats.draftRate=Number((stats.withDraft/Math.max(1,stats.ready)).toFixed(4));
 stats.contextCoverageRate=Number((coveredContexts.size/Math.max(1,monthContexts.size)).toFixed(4));
 return stats;
}
module.exports={assess,representativeInputs};
