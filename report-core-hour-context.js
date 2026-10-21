'use strict';
// A narrow offline-only candidate: distinguish verified hour stem from month
// stem. NEVER infer personal traits, future events, or strength from symbols.
// Only author-reviewed exact chart contexts are eligible.
const knowledge=require('./report-core-knowledge.json');
const families=require('./report-core-rule-families');
const {LunarUtil}=require('lunar-javascript');
const NAMES={'比肩':'비견','劫财':'겁재','食神':'식신','伤官':'상관',
 '偏财':'편재','正财':'정재','七杀':'편관','正官':'정관',
 '偏印':'편인','正印':'정인'};
const CATEGORIES={
 비견:'peer',겁재:'peer',식신:'output',상관:'output',
 정재:'wealth',편재:'wealth',정관:'authority',편관:'authority',
 정인:'resource',편인:'resource'
};
const STEMS='甲乙丙丁戊己庚辛壬癸',BRANCHES='子丑寅卯辰巳午未申酉戌亥';
function god(day,other){return NAMES[LunarUtil.SHI_SHEN[day+other]]}
function audit(kb=knowledge){
 const seen=new Set(),matches=new Set();
 for(const r of kb.hourContextRules||[]){
  const w=r.when,base=[...(kb.pairRules||[]),...families.expand(kb)]
   .find(x=>x.id===w?.coreRuleId);
  const relation=w?.monthTenGod===w?.hourTenGod?
   'same-category-same-subtype':
   CATEGORIES[w?.monthTenGod]===CATEGORIES[w?.hourTenGod]?
    'same-category-different-subtype':'different-category';
  const signature=[w?.coreRuleId,w?.dayStem,w?.monthStem,w?.hourPillar].join('|');
  if(!base||r.status!=='editorial-candidate'||!r.id||seen.has(r.id)||
     matches.has(signature)||!w||
     !STEMS.includes(w.dayStem)||!STEMS.includes(w.monthStem)||
     typeof w.hourPillar!=='string'||w.hourPillar.length!==2||
     !STEMS.includes(w.hourPillar[0])||!BRANCHES.includes(w.hourPillar[1])||
     god(w.dayStem,w.monthStem)!==base.visible||
     god(w.dayStem,w.hourPillar[0])!==w.hourTenGod||
     w.monthTenGod!==base.visible||w.relativeToMonth!==relation||
     r.readerScope!=='verified-hour-month-symbol-comparison-only'||
     r.evidenceRole!=='exact-natal-hour-and-month-visible-ten-god-pair-only'||
     JSON.stringify(r.sourceRefs)!=='["natal.hour.stem","natal.month.stem"]'||
     !Array.isArray(r.limits)||!r.limits.includes('no-event-prediction')||
     !r.limits.includes('no-strength-multiplier')||
     typeof r.reader?.label!=='string'||r.reader.label.length<10||
     typeof r.reader?.text!=='string'||r.reader.text.length<180)
   throw Error('CORE_HOUR_CONTEXT_INVALID_OR_UNSUPPORTED:'+r.id);
  seen.add(r.id);matches.add(signature);
 }
 return {hourContextRules:seen.size};
}
function select(packet,graph,coreRuleId){
 const chart=packet?.chart;
 if(!chart?.hour){
  if(graph?.unknownBirthHour!==true||
     graph?.otherVisible?.some(x=>x.position==='hour'))
   throw Error('CORE_HOUR_CONTEXT_UNKNOWN_TIME_DIVERGED');
  return null;
 }
 const hour=graph?.otherVisible?.find(x=>x.position==='hour');
 const month=graph?.monthVisible;
 const hourFact=packet?.facts?.tenGods?.hour;
 const monthFact=packet?.facts?.tenGods?.month;
 if(graph.unknownBirthHour!==false||!hour||!month||
    hour.id!=='natal.hour.stem'||month.id!=='natal.month.stem'||
    hourFact?.stem!==chart.hour[0]||monthFact?.stem!==chart.month?.[0]||
    hourFact?.stemTenGod!==hour.tenGod||
    monthFact?.stemTenGod!==month.tenGod||
    god(chart.day?.[0],chart.hour[0])!==hour.tenGod||
    god(chart.day?.[0],chart.month[0])!==month.tenGod)
  throw Error('CORE_HOUR_CONTEXT_VERIFIED_SOURCE_MISMATCH');
 const matching=(knowledge.hourContextRules||[]).filter(r=>{
  const w=r.when;
  return w.coreRuleId===coreRuleId&&w.dayStem===chart.day[0]&&
   w.monthStem===chart.month[0]&&w.hourPillar===chart.hour&&
   w.hourTenGod===hour.tenGod&&w.monthTenGod===month.tenGod&&
   w.relativeToMonth===hour.relativeToMonth;
 });
 if(matching.length>1)throw Error('CORE_HOUR_CONTEXT_AMBIGUOUS_RULE');
 const r=matching[0];if(!r)return null;
 return {ruleId:r.id,reader:{...r.reader},sourceRefs:r.sourceRefs.slice(),
  matched:{hourPillar:chart.hour,dayStem:chart.day[0],monthStem:chart.month[0],
   hourTenGod:hour.tenGod,monthTenGod:month.tenGod,
   relativeToMonth:hour.relativeToMonth},
  evidenceRole:r.evidenceRole,readerScope:r.readerScope,limits:r.limits.slice(),
  humanReviewRequired:true,releaseVerdict:'not-approved'};
}
audit();
module.exports={audit,select};
