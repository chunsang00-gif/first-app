'use strict';
// Offline human-review candidates for FULL verified natal four-pillar patterns.
// No generic four-pillar interpolation, personality score or event prediction.
const kb=require('./report-core-knowledge.json');
const season=require('./report-seasonal-evidence');
const binding=require('./report-fact-bindings');
const branch=require('./report-branch-relations');
const methodReview=require('./report-core-paid-natal-month-method-review');
const {LunarUtil}=require('lunar-javascript');
const GOD={'比肩':'비견','劫财':'겁재','食神':'식신','伤官':'상관',
 '偏财':'편재','正财':'정재','七杀':'편관','正官':'정관',
 '偏印':'편인','正印':'정인'};
const god=(d,x)=>GOD[LunarUtil.SHI_SHEN[d+x]];
const P=['year','month','day','hour'];
function natalAssertions(rule,chart){
 const natal=branch.natal(chart);
 const legacy=rule.natalEvidence==null;
 const pairs=legacy?[{type:'충',positions:['month','day'],
  branches:chart.month[1]+chart.day[1]}]:rule.natalEvidence;
 const groups=rule.natalGroupEvidence||[];
 const identity=row=>[row.type,row.positions.join('|'),row.branches].join(':');
 const observedPairs=new Set(natal.pairs.map(identity));
 const observedGroups=new Set(natal.groups.map(identity));
 if(!Array.isArray(pairs)||pairs.length<1||
    !Array.isArray(groups)||groups.some(x=>!Array.isArray(x.positions)||x.positions.length!==3||
      new Set(x.positions).size!==3)||
    pairs.some(x=>!Array.isArray(x.positions)||x.positions.length!==2||
      new Set(x.positions).size!==2||!observedPairs.has(identity(x)))||
    groups.some(x=>!observedGroups.has(identity(x)))||
    new Set(pairs.map(identity)).size!==pairs.length||
    new Set(groups.map(identity)).size!==groups.length)
  return null;
 return {pairs,groups,natal};
}
const FORBIDDEN=/(?:반드시 성공|승진이 보장|재산이 증가|성격이 강하다|기운이 약하다는 사실)/;
const READER_POSITIONS=['year','month','monthHidden','hour'];
function attributionValid(rule,actualRows=null){
 const entry=rule.readerAttribution,chart=rule.chart;
 const main=season.HIDDEN[chart.month[1]][0];
 const expected=[
  ['natal.year.stem',god(chart.day[0],chart.year[0])],
  ['natal.month.stem',god(chart.day[0],chart.month[0])],
  ['natal.month.hidden.'+main,god(chart.day[0],main)],
  ['natal.hour.stem',god(chart.day[0],chart.hour[0])]
 ];
 if(entry?.kind!=='qa-reader-attribution-ledger-v1'||
    entry.sourceClaims?.length!==4||
    entry.priority!=='not-approved-for-full-chart-causal-order'||
    entry.observedPersonality!==false||entry.paidReaderValueApproved!==false||
    entry.example?.class!=='hypothetical-editorial-application'||
    entry.example.verifiedUserSituation!==false||
    entry.example.computedConsequence!==false||
    entry.example.domainFitEstablished!==false||
    typeof entry.example.readerSpan!=='string'||
    entry.example.readerSpan.length<16||
    !/(?:가정|상황|라면|다면)/.test(entry.example.readerSpan)||
    !rule.reader.text.includes(entry.example.readerSpan))return false;
 for(let i=0;i<expected.length;i++){
  const row=entry.sourceClaims[i],id=expected[i][0],role=expected[i][1];
  if(!row||row.sourceId!==id||row.calculatedRole!==role||
     typeof row.readerSpan!=='string'||row.readerSpan.length<14||
     !rule.reader.text.includes(row.readerSpan))return false;
  if(actualRows){
   const actual=actualRows[id];
   if(!actual||actual.tenGod!==row.calculatedRole||
      actual.observedBehavior!==false||
      actual.interpretationScope!=='traditional-symbol-only'||
      !actual.traditionalMeaning)return false;
  }
 }
 // A shared phrase is permissible ONLY for the same category in the
 // month/hour pair and it must explicitly identify both natal positions.
 const monthClaim=entry.sourceClaims[1],hourClaim=entry.sourceClaims[3];
 if(monthClaim.readerSpan===hourClaim.readerSpan&&
    (monthClaim.calculatedRole!==hourClaim.calculatedRole||
     !/(?:달과 시간|달과 시간의|달과 시간에는|달과 시간에|태어난 달과 시간)/.test(monthClaim.readerSpan)))
  return false;
 return true;
}
function audit(data=kb){
 const bases=[...data.pairRules,...require('./report-core-rule-families').expand(data)];
 const ids=new Set(),contexts=new Set();
 for(const r of data.fullChartRules||[]){
  const chart=r.chart,base=bases.find(x=>x.id===r.coreRuleId);
  const key=P.map(p=>chart?.[p]).join('|');
  const valid=base&&r.status==='editorial-candidate'&&
   P.every(p=>typeof chart?.[p]==='string'&&chart[p].length===2&&
    season.ELEMENTS[chart[p][0]]&&season.HIDDEN[chart[p][1]])&&
   chart.month[1]===base.when.monthBranch&&
   god(chart.day[0],chart.month[0])===base.visible&&
   god(chart.day[0],season.HIDDEN[chart.month[1]][0])===base.hidden&&
   r.yearGod===god(chart.day[0],chart.year[0])&&
   r.monthGod===base.visible&&r.hiddenGod===base.hidden&&
   r.hourGod===god(chart.day[0],chart.hour[0])&&
   (r.natalEvidence?
    r.dayBranchRelation==='table-only':
    r.dayBranchRelation==='충')&&
   natalAssertions(r,chart)&&
   (r.dayRootExpected??true)===season.HIDDEN[chart.day[1]].some(x=>
    season.ELEMENTS[x]===season.ELEMENTS[chart.day[0]])&&
   r.hourRootExpected===season.HIDDEN[chart.hour[1]].some(x=>
    season.ELEMENTS[x]===season.ELEMENTS[chart.day[0]])&&
   r.monthPhase===season.MONTH[chart.month[1]].status&&
   r.monthSeason===season.MONTH[chart.month[1]].season&&
   r.evidenceRole==='exact-four-pillar-canonical-plus-month-day-table-and-same-element-root-positions'&&
   r.readerScope==='verified-four-position-symbolic-comparison-only'&&
   ['no-strength-inference','no-clash-root-destruction','no-behavior-observation','no-event-prediction']
    .every(x=>r.limits?.includes(x))&&
   typeof r.reader?.label==='string'&&r.reader.label.length>=12&&
   typeof r.reader?.text==='string'&&r.reader.text.length>=250&&
   !FORBIDDEN.test(r.reader.text)&&attributionValid(r);
  if(!r.id||ids.has(r.id)||contexts.has(key)||!valid)
   throw Error('CORE_FOUR_PILLAR_RULE_INVALID:'+r.id);
  ids.add(r.id);contexts.add(key);
 }
 return {fullChartRules:ids.size};
}
function select(packet,graph,coreId){
 const chart=packet?.chart;
 if(!chart||!graph)return null;
 const candidates=(kb.fullChartRules||[]).filter(r=>r.coreRuleId===coreId&&
  P.every(p=>chart[p]===r.chart[p]));
 if(candidates.length>1)throw Error('CORE_FOUR_PILLAR_AMBIGUOUS');
 const r=candidates[0];
 if(!r)return null;
 const sourceRows=Object.fromEntries(binding.build(packet).map(x=>[x.id,x]));
 const hidden=season.HIDDEN[chart.month[1]][0];
 const roots=graph.dayMasterRoots||[];
 const dayRoots=roots.filter(x=>x.position==='day');
 const hourRoots=roots.filter(x=>x.position==='hour');
 const rel=natalAssertions(r,chart);
 const matchedRelation=rel&&rel.pairs.every(candidate=>
  graph.natalRelations?.some(x=>x.type===candidate.type&&
   JSON.stringify(x.positions)===JSON.stringify(candidate.positions)&&
   x.branches===candidate.branches&&x.verdict==='table-membership-only'&&
   x.transformation==='not-assessed'&&
   JSON.stringify(x.sourceIds)==='["facts.natalBranchRelations"]'));
 const official=branch.natal(chart);
 const packetRelations=packet.facts?.natalBranchRelations;
 const originalRelations=JSON.stringify(packetRelations?.pairs)===
  JSON.stringify(official.pairs)&&
  JSON.stringify(packetRelations?.groups)===JSON.stringify(official.groups);
 const refs=['natal.year.stem','natal.month.stem','natal.month.hidden.'+hidden,
  'natal.hour.stem','facts.natalBranchRelations','facts.seasonalEvidence',
  'facts.stemConnections','facts.qiEvidence',...dayRoots.map(x=>x.id),
  ...hourRoots.map(x=>x.id)];
 const s=season.evaluate(chart),provided=packet.facts?.seasonalEvidence;
 const valid=graph.measuredStrength===false&&graph.usedAnnualFacts===false&&
  graph.unknownBirthHour===false&&rel&&matchedRelation&&originalRelations&&
  s.monthPhase===r.monthPhase&&s.monthSeason===r.monthSeason&&
  provided?.monthBranch===s.monthBranch&&provided?.monthPhase===s.monthPhase&&
  provided?.monthSeason===s.monthSeason&&
  packet.facts?.tenGods?.year?.stemTenGod===r.yearGod&&
  packet.facts?.tenGods?.month?.stemTenGod===r.monthGod&&
  packet.facts?.tenGods?.hour?.stemTenGod===r.hourGod&&
  packet.facts?.structuralEvidence?.monthCommand?.mainHiddenStem===hidden&&
  packet.facts?.structuralEvidence?.monthCommand?.mainHiddenStemTenGod===r.hiddenGod&&
  graph.monthVisible?.tenGod===r.monthGod&&
  graph.otherVisible?.find(x=>x.position==='year')?.tenGod===r.yearGod&&
  graph.otherVisible?.find(x=>x.position==='hour')?.tenGod===r.hourGod&&
  Boolean(dayRoots.length)===(r.dayRootExpected??true)&&
  Boolean(hourRoots.length)===r.hourRootExpected&&
  roots.every(x=>x.effectStrength==='not-assessed')&&
  [ ['natal.year.stem',r.yearGod,chart.year[0]],
    ['natal.month.stem',r.monthGod,chart.month[0]],
    ['natal.month.hidden.'+hidden,r.hiddenGod,hidden],
    ['natal.hour.stem',r.hourGod,chart.hour[0]]]
   .every(([id,name,stem])=>sourceRows[id]?.tenGod===name&&
     sourceRows[id]?.stem===stem)&&
  [...dayRoots,...hourRoots].every(x=>sourceRows[x.id]?.stem);
 if(!valid)throw Error('CORE_FOUR_PILLAR_INTEGRITY_DIVERGED');
 if(!attributionValid(r,sourceRows))
  throw Error('CORE_FOUR_PILLAR_READER_ATTRIBUTION_DIVERGED');
 // The month-main hidden stem is a computable structural reference,
 // NOT an adopted active-qi, school, pattern or interpretive priority.
 // Explicitly compare all three existing screens before describing any
 // ordering as anything more than a hypothetical workplace procedure.
 const review=methodReview.assess(packet);
 const scope=review.observed.exactExposureScopeComparison;
 const contact=review.observed.natalRelationsTouchingMonth.relationshipCardinality;
 if(review.status!=='method-priority-not-selected'||
    review.interpretivePriorityVerified!==false||
    review.adoptedMethodId!==null||review.activeHiddenStemId!==null||
    review.canApproveDeepSajuInterpretation!==false||
    review.methodCandidates.length!==3||
    review.methodCandidates.some(x=>x.interpretivePriority!=='not-assessed')||
    scope.selectionRuleAdopted!==false||
    scope.traditionalMeaningAndPriorityVerified!==false||
    review.observed.mainHiddenStemSourceId!=='natal.month.hidden.'+hidden||
    contact.whichLabelPrevails!=='not-assessed'||
    contact.realizedCombinationOrBreakage!=='not-assessed')
  throw Error('CORE_FOUR_PILLAR_UNRESOLVED_METHOD_PRIORITY_DIVERGED');
 const methodPriorityReview={
  kind:'qa-unselected-natal-method-priority-v1',
  priorityVerdict:'not-established',
  selectedTraditionalMethod:null,activeQiVerified:false,
  currentMonthMainSourceId:review.observed.mainHiddenStemSourceId,
  alternativeCandidateRefs:review.methodCandidates.map(m=>({
   id:m.id,sourceIds:m.rowIds.slice(),status:m.status,
   priority:m.interpretivePriority
  })),
  dayMasterOnlyExposedHiddenStemIds:
   scope.dayMasterOnlyExposedHiddenStemIds.slice(),
  nonDayExposedHiddenStemIds:scope.nonDayExposedHiddenStemIds.slice(),
  independentMonthBranchContacts:contact.independentPairContactCount,
  monthBranchTableEntries:contact.pairTableEntryCount,
  monthBranchGroupEntries:contact.completeGroupEntryCount,
  branchRelationPriority:'not-assessed',
  scenarioOrderingStatus:'hypothetical-workflow-not-deduced-from-chart',
  professionalTraditionalMethodApproved:false,
  possibleReaderBenefitVerified:false,
  releaseVerdict:'not-approved'
 };
 return {ruleId:r.id,reader:{...r.reader},sourceRefs:refs,
  methodPriorityReview,
  readerAttribution:structuredClone(r.readerAttribution),
  matched:{chart:{...r.chart},yearTenGod:r.yearGod,monthTenGod:r.monthGod,
   hiddenTenGod:r.hiddenGod,hourTenGod:r.hourGod,
   relation:r.dayBranchRelation,natalPairs:rel.pairs.map(x=>({...x,positions:x.positions.slice()})),
   natalGroups:rel.groups.map(x=>({...x,positions:x.positions.slice()})),
   dayRootRefs:dayRoots.map(x=>x.id),dayRootExpected:r.dayRootExpected??true,
   hourRootRefs:hourRoots.map(x=>x.id),hourRootExpected:r.hourRootExpected,
   monthPhase:r.monthPhase,monthSeason:r.monthSeason},
  evidenceRole:r.evidenceRole,readerScope:r.readerScope,
  limits:r.limits.slice(),releaseVerdict:'not-approved',humanReviewRequired:true};
}
audit();
module.exports={audit,select};
