'use strict';
// Offline editorial-only: independently verified month season and exact
// same-element hidden-stem source positions. No strength/fortune inference.
const knowledge=require('./report-core-knowledge.json');
const seasonal=require('./report-seasonal-evidence');
const {LunarUtil}=require('lunar-javascript');
const NAMES={'比肩':'비견','劫财':'겁재','食神':'식신','伤官':'상관',
 '偏财':'편재','正财':'정재','七杀':'편관','正官':'정관',
 '偏印':'편인','正印':'정인'};
const STEMS='甲乙丙丁戊己庚辛壬癸';
const BRANCHES='子丑寅卯辰巳午未申酉戌亥';
const DOMAINS=/(?:직장|회사|이직|승진|돈|금전|수입|가족|배우자|결혼|연애|질병|건강|당첨|대박)/;
function verifiedGod(day,other){return NAMES[LunarUtil.SHI_SHEN[day+other]]}
function expectedRoot(branch,dayStem){
 return seasonal.HIDDEN[branch].some(stem=>
  seasonal.ELEMENTS[stem]===seasonal.ELEMENTS[dayStem]);
}
function audit(kb=knowledge){
 const ids=new Set(),keys=new Set();let variants=0;
 for(const r of kb.seasonRootRules||[]){
  const w=r.when,base=kb.pairRules?.find(x=>x.id===w?.coreRuleId);
  const prefix=[w?.coreRuleId,w?.monthBranch,w?.dayStem,w?.dayBranch].join('|');
  if(!r.id||ids.has(r.id)||keys.has(prefix)||
     r.status!=='editorial-candidate'||!w||!base||
     !STEMS.includes(w.dayStem)||!BRANCHES.includes(w.monthBranch)||
     !BRANCHES.includes(w.dayBranch)||
     w.monthPhase!==seasonal.MONTH[w.monthBranch].status||
     w.monthSeason!==seasonal.MONTH[w.monthBranch].season||
     w.dayRootRef!=='natal.day.hidden.'+w.dayStem||
     !seasonal.HIDDEN[w.dayBranch].includes(w.dayStem)||
     ![...STEMS].some(monthStem=>verifiedGod(w.dayStem,monthStem)===base.visible)||
     r.readerScope!=='verified-seasonal-and-same-element-root-locations-only'||
     r.evidenceRole!=='seasonal-classification-plus-recalculated-root-position-membership'||
     JSON.stringify(r.sourceRefs)!==JSON.stringify([
      'facts.seasonalEvidence','facts.qiEvidence',
      'facts.stemConnections',w.dayRootRef])||
     !Array.isArray(r.limits)||!r.limits.includes('no-strength-estimate')||
     !r.limits.includes('no-clash-root-destruction')||
     !Array.isArray(r.variants)||r.variants.length===0)
   throw Error('CORE_SEASON_ROOT_RULE_INVALID:'+r.id);
  const variantKeys=new Set();
  for(const v of r.variants){
   if(!v.id||!v.hourPillar||v.hourPillar.length!==2||
      !STEMS.includes(v.hourPillar[0])||
      !BRANCHES.includes(v.hourPillar[1])||
      variantKeys.has(v.hourPillar)||
      typeof v.hourRootExpected!=='boolean'||
      v.hourRootExpected!==expectedRoot(v.hourPillar[1],w.dayStem)||
      typeof v.reader?.label!=='string'||v.reader.label.length<10||
      typeof v.reader?.text!=='string'||v.reader.text.length<180||
      DOMAINS.test([v.reader.label,v.reader.text].join(' ')))
    throw Error('CORE_SEASON_ROOT_VARIANT_INVALID:'+v.id);
   variantKeys.add(v.hourPillar);variants++;
  }
  ids.add(r.id);keys.add(prefix);
 }
 return {seasonRootRules:ids.size,seasonRootVariants:variants};
}
function select(packet,graph,coreRuleId){
 const chart=packet?.chart;
 if(!chart?.hour)return null; // Cannot assert absence without recorded time.
 const wMonth=chart.month?.[1],wDay=chart.day?.[0],wDayBranch=chart.day?.[1];
 const rootGraph=graph?.dayMasterRoots;
 if(!Array.isArray(rootGraph))throw Error('CORE_SEASON_ROOT_GRAPH_REQUIRED');
 const candidates=(knowledge.seasonRootRules||[]).filter(r=>{
  const w=r.when;
  return w.coreRuleId===coreRuleId&&w.monthBranch===wMonth&&
   w.dayStem===wDay&&w.dayBranch===wDayBranch&&
   r.variants.some(v=>v.hourPillar===chart.hour);
 });
 if(candidates.length>1)throw Error('CORE_SEASON_ROOT_AMBIGUOUS_RULE');
 const r=candidates[0];if(!r)return null;
 const w=r.when,variant=r.variants.find(v=>v.hourPillar===chart.hour);
 const expected=seasonal.evaluate(chart);
 const s=packet.facts?.seasonalEvidence;
 if(s?.monthBranch!==expected.monthBranch||
    s?.monthPhase!==expected.monthPhase||
    s?.monthSeason!==expected.monthSeason||
    s?.dayStem!==expected.dayStem||
    w.monthPhase!==expected.monthPhase||
    w.monthSeason!==expected.monthSeason)
  throw Error('CORE_SEASON_ROOT_SEASON_MISMATCH');
 const dayRoot=rootGraph.find(x=>x.id===w.dayRootRef&&x.position==='day');
 const hourRoots=rootGraph.filter(x=>x.position==='hour');
 const expectedHour=seasonal.HIDDEN[chart.hour[1]].filter(stem=>
  seasonal.ELEMENTS[stem]===seasonal.ELEMENTS[wDay]);
 if(!dayRoot||dayRoot.effectStrength!=='not-assessed'||
    expectedHour.length!==hourRoots.length||
    hourRoots.some(x=>!expectedHour.some(s=>x.id==='natal.hour.hidden.'+s))||
    variant.hourRootExpected!==Boolean(hourRoots.length)||
    graph.measuredStrength!==false)
  throw Error('CORE_SEASON_ROOT_POSITION_MISMATCH');
 const sourceRefs=[...r.sourceRefs];
 if(variant.hourRootExpected){
  sourceRefs.push(...hourRoots.map(x=>x.id));
 }else{
  sourceRefs.push('natal.hour.stem'); // chart.hour records the known hour.
 }
 return {ruleId:r.id,variantId:variant.id,reader:{...variant.reader},
  sourceRefs,readerScope:r.readerScope,evidenceRole:r.evidenceRole,
  matched:{monthBranch:wMonth,monthPhase:expected.monthPhase,
   monthSeason:expected.monthSeason,dayStem:wDay,dayBranch:wDayBranch,
   hourPillar:chart.hour,dayRootRef:w.dayRootRef,
   hourRootRefs:hourRoots.map(x=>x.id)},
  limits:r.limits.slice(),humanReviewRequired:true,releaseVerdict:'not-approved'};
}
audit();
module.exports={audit,select};
