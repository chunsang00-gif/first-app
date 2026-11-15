'use strict';
// Reader candidate: independently confirmed natal year stem, month stem and
// month principal hidden stem. No behavior, strength or event inference.
const kb=require('./report-core-knowledge.json');
const families=require('./report-core-rule-families');
const season=require('./report-seasonal-evidence');
const bindings=require('./report-fact-bindings');
const {LunarUtil}=require('lunar-javascript');
const GOD={'比肩':'비견','劫财':'겁재','食神':'식신','伤官':'상관',
 '偏财':'편재','正财':'정재','七杀':'편관','正官':'정관',
 '偏印':'편인','正印':'정인'};
const CAT={비견:'peer',겁재:'peer',식신:'output',상관:'output',
 정재:'wealth',편재:'wealth',정관:'authority',편관:'authority',
 정인:'resource',편인:'resource'};
const STEMS=Object.keys(season.ELEMENTS);
const god=(day,other)=>GOD[LunarUtil.SHI_SHEN[day+other]];
const related=(a,b)=>CAT[a]===CAT[b]?
 (a===b?'same-category-same-subtype':'same-category-different-subtype'):'different-category';
function audit(data=kb){
 const rules=[...data.pairRules,...families.expand(data)];
 const seen=new Set(),contexts=new Set();
 for(const rule of data.yearLinkRules||[]){
  const w=rule.when,core=rules.find(r=>r.id===rule.coreRuleId);
  const key=[rule.coreRuleId,w?.yearTenGod,w?.monthBranch].join('|');
  const possible=core&&w&&season.HIDDEN[w.monthBranch]&&
   STEMS.some(day=>god(day,season.HIDDEN[w.monthBranch][0])===w.hiddenTenGod&&
    STEMS.some(month=>god(day,month)===w.monthTenGod&&
     STEMS.some(year=>god(day,year)===w.yearTenGod)));
  if(!rule.id||seen.has(rule.id)||contexts.has(key)||!core||!possible||
     rule.status!=='editorial-candidate'||w.monthBranch!==core.when.monthBranch||
     w.monthTenGod!==core.visible||w.hiddenTenGod!==core.hidden||
     !CAT[w.yearTenGod]||related(w.yearTenGod,w.monthTenGod)!==w.relativeToMonth||
     rule.readerScope!=='verified-three-natal-positions-only'||
     rule.evidenceRole!=='year-visible-month-visible-month-main-hidden-only'||
     !rule.limits?.includes('no-event-prediction')||
     !rule.limits?.includes('no-strength-multiplier')||
     typeof rule.reader?.label!=='string'||rule.reader.label.length<10||
     typeof rule.reader?.text!=='string'||rule.reader.text.length<190||
     /(?:연봉|승진|당첨|질병|반드시 성공)/.test(rule.reader.text))
   throw Error('CORE_YEAR_LINK_RULE_INVALID:'+rule.id);
  seen.add(rule.id);contexts.add(key);
 }
 return {yearLinkRules:seen.size};
}
function select(packet,graph,coreId){
 const chart=packet?.chart,year=graph?.otherVisible?.find(r=>r.position==='year');
 const month=graph?.monthVisible;
 if(!chart?.year||!chart?.month||!chart?.day||!year||!month)
  throw Error('CORE_YEAR_LINK_REQUIRED_SOURCES_MISSING');
 const hidden=season.HIDDEN[chart.month[1]]?.[0];
 const name=god(chart.day[0],hidden),fact=packet.facts?.tenGods?.month,
  command=packet.facts?.structuralEvidence?.monthCommand;
 const rows=Object.fromEntries(bindings.build(packet).map(x=>[x.id,x]));
 if(year.id!=='natal.year.stem'||month.id!=='natal.month.stem'||
    year.tenGod!==god(chart.day[0],chart.year[0])||
    month.tenGod!==god(chart.day[0],chart.month[0])||
    year.category!==CAT[year.tenGod]||month.category!==CAT[month.tenGod]||
    year.relativeToMonth!==related(year.tenGod,month.tenGod)||
    command?.mainHiddenStem!==hidden||command.mainHiddenStemTenGod!==name||
    fact?.stemTenGod!==month.tenGod||
    !fact.hiddenStems?.some(x=>x.stem===hidden&&x.tenGod===name)||
    rows[year.id]?.tenGod!==year.tenGod||
    rows[month.id]?.tenGod!==month.tenGod||
    rows['natal.month.hidden.'+hidden]?.tenGod!==name)
  throw Error('CORE_YEAR_LINK_SOURCE_MISMATCH');
 const options=(kb.yearLinkRules||[]).filter(r=>r.coreRuleId===coreId&&
  r.when.monthBranch===chart.month[1]&&r.when.yearTenGod===year.tenGod&&
  r.when.monthTenGod===month.tenGod&&r.when.hiddenTenGod===name&&
  r.when.relativeToMonth===year.relativeToMonth);
 if(options.length>1)throw Error('CORE_YEAR_LINK_AMBIGUOUS');
 if(!options.length)return null;
 const r=options[0];
 return {ruleId:r.id,reader:{...r.reader},
  sourceRefs:['natal.year.stem','natal.month.stem','natal.month.hidden.'+hidden],
  matched:{yearTenGod:year.tenGod,monthTenGod:month.tenGod,
   hiddenTenGod:name,relativeToMonth:year.relativeToMonth,
   monthBranch:chart.month[1],yearStem:chart.year[0]},
  evidenceRole:r.evidenceRole,readerScope:r.readerScope,limits:r.limits.slice(),
  humanReviewRequired:true,releaseVerdict:'not-approved'};
}
audit();
module.exports={audit,select};
