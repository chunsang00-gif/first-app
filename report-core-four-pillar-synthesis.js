'use strict';
// Offline human-review candidates for FULL verified natal four-pillar patterns.
// No generic four-pillar interpolation, personality score or event prediction.
const kb=require('./report-core-knowledge.json');
const season=require('./report-seasonal-evidence');
const binding=require('./report-fact-bindings');
const branch=require('./report-branch-relations');
const {LunarUtil}=require('lunar-javascript');
const GOD={'比肩':'비견','劫财':'겁재','食神':'식신','伤官':'상관',
 '偏财':'편재','正财':'정재','七杀':'편관','正官':'정관',
 '偏印':'편인','正印':'정인'};
const god=(d,x)=>GOD[LunarUtil.SHI_SHEN[d+x]];
const P=['year','month','day','hour'];
const FORBIDDEN=/(?:반드시 성공|승진이 보장|재산이 증가|성격이 강하다|기운이 약하다는 사실)/;
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
   r.dayBranchRelation==='충'&&
   branch.pairRelations(chart.month[1],chart.day[1]).includes('충')&&
   season.HIDDEN[chart.day[1]].some(x=>
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
   !FORBIDDEN.test(r.reader.text);
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
 const rel=graph.natalRelations?.find(x=>x.type==='충'&&
  JSON.stringify(x.positions)==='["month","day"]'&&
  x.branches===chart.month[1]+chart.day[1]&&
  x.transformation==='not-assessed'&&
  JSON.stringify(x.sourceIds)==='["facts.natalBranchRelations"]');
 const refs=['natal.year.stem','natal.month.stem','natal.month.hidden.'+hidden,
  'natal.hour.stem','facts.natalBranchRelations','facts.seasonalEvidence',
  'facts.stemConnections','facts.qiEvidence',...dayRoots.map(x=>x.id),
  ...hourRoots.map(x=>x.id)];
 const s=season.evaluate(chart),provided=packet.facts?.seasonalEvidence;
 const valid=graph.measuredStrength===false&&graph.usedAnnualFacts===false&&
  graph.unknownBirthHour===false&&rel&&
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
  dayRoots.some(x=>x.id==='natal.day.hidden.'+chart.day[0])&&
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
 return {ruleId:r.id,reader:{...r.reader},sourceRefs:refs,
  matched:{chart:{...r.chart},yearTenGod:r.yearGod,monthTenGod:r.monthGod,
   hiddenTenGod:r.hiddenGod,hourTenGod:r.hourGod,
   relation:'충',dayRootRefs:dayRoots.map(x=>x.id),
   hourRootRefs:hourRoots.map(x=>x.id),hourRootExpected:r.hourRootExpected,
   monthPhase:r.monthPhase,monthSeason:r.monthSeason},
  evidenceRole:r.evidenceRole,readerScope:r.readerScope,
  limits:r.limits.slice(),releaseVerdict:'not-approved',humanReviewRequired:true};
}
audit();
module.exports={audit,select};
