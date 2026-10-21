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
 const readers=new Map(),plans=new Map(),monthContexts=new Set(),coveredContexts=new Set();
 const stats={knowledgeVersion:knowledge.version,kind:'fixed-offline-grid-not-user-traffic',
  inputCount:inputs.length,ready:0,blocked:0,withDraft:0,notCovered:0,
  draftsWithNatalContext:0,draftsWithHourContext:0,draftsWithSeasonRootContext:0,
  withEvidencePlan:0,plansWithoutReaderDraft:0,distinctPlans:0,
  reusedPlanAcrossCharts:0,
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
  const plan=row.compositionPlan;
  if(!plan||plan.status!=='evidence-plan-for-editorial-review'||
     plan.releaseVerdict!=='not-approved'||plan.personalizedTextAvailable!==false||
     plan.apiCalls!==0||!Array.isArray(plan.steps)||plan.steps.length<2)
   throw Error('CORE_COVERAGE_MISSING_VERIFIED_COMPOSITION_PLAN');
  stats.withEvidencePlan++;
  if(row.status==='not-covered')stats.plansWithoutReaderDraft++;
  const planKey=JSON.stringify({steps:plan.steps,unknownBirthHour:plan.unknownBirthHour});
  if(!plans.has(planKey))plans.set(planKey,new Set());
  plans.get(planKey).add(chartKey);
  const context=row.scope&&[row.scope.visibleTenGod,row.scope.hiddenTenGod,
   row.scope.monthBranch,row.scope.seasonalPhase,row.scope.monthElementRelation,
   row.scope.seasonToDayRelation].join('|');
  if(context)monthContexts.add(context);
  if(row.status==='not-covered'){
   stats.notCovered++;if(row.reader!==null)throw Error('CORE_COVERAGE_UNCOVERED_READER');
  }else if(row.status==='draft-for-human-review'){
   stats.withDraft++;
   const natt=row.review?.natalContext;
   if(natt){
    stats.draftsWithNatalContext++;
    if(row.reader?.paragraphs?.context?.text==null||
       natt.sourceRefs?.[0]!=='facts.natalBranchRelations'||
       !row.wholeChartEvidence?.natalRelations.some(r=>
        r.type===natt.matched.relation&&r.positions.includes('month')&&
        r.positions.includes('day')&&r.branches===
        natt.matched.monthBranch+natt.matched.dayBranch))
     throw Error('CORE_COVERAGE_UNVERIFIED_NATAL_CONTEXT_TEXT');
   }
   const hour=row.review?.hourContext;
   if(hour){
    stats.draftsWithHourContext++;
    const matched=row.wholeChartEvidence?.otherVisible?.find(r=>r.position==='hour');
    if(!row.reader?.paragraphs?.hour?.text||
       hour.sourceRefs?.join('|')!=='natal.hour.stem|natal.month.stem'||
       hour.matched.hourTenGod!==matched?.tenGod||
       hour.matched.relativeToMonth!==matched?.relativeToMonth||
       row.wholeChartEvidence.unknownBirthHour)
     throw Error('CORE_COVERAGE_UNVERIFIED_HOUR_CONTEXT_TEXT');
   }
   const root=row.review?.seasonRootContext;
   if(root){
    stats.draftsWithSeasonRootContext++;
    if(!row.reader?.paragraphs?.seasonRoot?.text||
       !root.sourceRefs?.includes('facts.seasonalEvidence')||
       !root.sourceRefs?.includes('facts.qiEvidence')||
       !root.sourceRefs?.includes('facts.stemConnections')||
       !root.sourceRefs?.includes(root.matched.dayRootRef)||
       !row.wholeChartEvidence?.dayMasterRoots?.some(
        r=>r.id===root.matched.dayRootRef&&r.position==='day')||
       root.matched.hourRootRefs.some(ref=>
        !row.wholeChartEvidence.dayMasterRoots.some(
         r=>r.id===ref&&r.position==='hour')))
     throw Error('CORE_COVERAGE_SEASON_ROOT_UNVERIFIED');
   }
   if(row.releaseVerdict!=='not-approved'||row.review.humanReviewRequired!==true)
    throw Error('CORE_COVERAGE_RELEASE_GATE_BYPASSED');
   if(context)coveredContexts.add(context);
   stats.byRule[row.ruleId]=(stats.byRule[row.ruleId]||0)+1;
   const readKey=JSON.stringify(row.reader);
   if(!readers.has(readKey))readers.set(readKey,new Set());
   readers.get(readKey).add(chartKey);
  }else throw Error('CORE_COVERAGE_UNEXPECTED_OUTPUT_STATUS:'+row.status);
 }
 stats.distinctPlans=plans.size;
 stats.reusedPlanAcrossCharts=[...plans.values()]
  .reduce((n,rows)=>n+Math.max(0,rows.size-1),0);
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
