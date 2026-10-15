'use strict';
// Calculation integrity BEFORE the interpretation plan or a billable request.
// Re-derives the symbolic rows from the canonical chart rather than trusting
// an already-assembled fact packet or the model's interpretation.
const {LunarUtil}=require('lunar-javascript');
const calendar=require('./calendar-provider-node');
const pipeline=require('./production-pipeline-node');
const names={'比肩':'비견','劫财':'겁재','食神':'식신','伤官':'상관','偏财':'편재','正财':'정재','七杀':'편관','正官':'정관','偏印':'편인','正印':'정인'};
const branches='子丑寅卯辰巳午未申酉戌亥',stems='甲乙丙丁戊己庚辛壬癸';
const hidden={子:['癸'],丑:['己','癸','辛'],寅:['甲','丙','戊'],卯:['乙'],辰:['戊','乙','癸'],巳:['丙','戊','庚'],午:['丁','己'],未:['己','丁','乙'],申:['庚','壬','戊'],酉:['辛'],戌:['戊','辛','丁'],亥:['壬','甲']};
const clashes=[['子','午'],['丑','未'],['寅','申'],['卯','酉'],['辰','戌'],['巳','亥']];
const valid=p=>typeof p==='string'&&p.length===2&&stems.includes(p[0])&&branches.includes(p[1]);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const tenGod=(day,other)=>names[LunarUtil.SHI_SHEN[day+other]]||null;
const branch=p=>p?.[1];
const positions=['year','month','day','hour'];
function expectedFor(pillar,day,position){
 const zhi=branch(pillar);
 return {stem:pillar[0],stemTenGod:position==='day'?'일간':tenGod(day,pillar[0]),
  hiddenStems:hidden[zhi].map(stem=>({stem,tenGod:tenGod(day,stem)}))};
}
function verify(packet){
 const errors=[];
 const chart=packet?.chart,year=packet?.targetYear?.year;
 if(packet?.status!=='ready'||!chart||!valid(chart.day)||!valid(chart.month)||!valid(chart.year)||
    (chart.hour!==null&&chart.hour!==undefined&&!valid(chart.hour))||
    !Number.isInteger(year)||year<1900||year>2100)
  return {pass:false,errors:['invalid-chart-or-target-year'],version:'calculation-integrity-v1'};
 const actualYear=pipeline.annualPillar(year);
 if(packet.targetYear.pillar!==actualYear)errors.push('wrong-target-year-pillar');
 if(packet.facts?.dayMaster!==chart.day[0])errors.push('wrong-day-master');
 if(packet.facts?.monthBranch!==branch(chart.month))errors.push('wrong-month-branch');
 const facts=packet.facts||{},day=chart.day[0];
 for(const position of positions){
  const pillar=chart[position],actual=facts.tenGods?.[position];
  if(!pillar){
   if(actual!==undefined)errors.push('fabricated-unknown-position:'+position);
   continue;
  }
  const expected=expectedFor(pillar,day,position);
  if(!same(actual,expected))errors.push('incorrect-ten-god-position:'+position);
  if(!same(facts.hiddenStems?.[position],hidden[branch(pillar)]))
   errors.push('incorrect-hidden-stems:'+position);
 }
 const expectedAnnual=expectedFor(actualYear,day,'annual');
 if(!same(facts.annualTenGods,expectedAnnual))errors.push('incorrect-annual-ten-gods');
 const yearlyClashes=[];
 for(const position of positions){
  const pillar=chart[position];if(!pillar)continue;
  const a=branch(pillar),b=branch(actualYear);
  if(a!==b&&clashes.some(pair=>pair.includes(a)&&pair.includes(b)))
   yearlyClashes.push({type:'충',between:position,branches:a+b});
 }
 if(!same(facts.targetYearRelations,yearlyClashes))errors.push('incorrect-2027-clash-relations');
 const natalClashes=[];
 for(let i=0;i<positions.length;i++)for(let j=i+1;j<positions.length;j++){
  const left=positions[i],right=positions[j],p=chart[left],q=chart[right];
  if(!p||!q)continue;
  const a=branch(p),b=branch(q);
  if(a!==b&&clashes.some(pair=>pair.includes(a)&&pair.includes(b)))
   natalClashes.push({type:'충',positions:[left,right],branches:a+b,
    note:'서로 마주 보는 지지 관계. 갈등이나 사건 발생을 확정하지 않음'});
 }
 if(!same(facts.natalClashes,natalClashes))errors.push('incorrect-natal-clashes');
 const original=packet.calculationInput||{};
 if(original.unknownBirthTime&&chart.hour)errors.push('fabricated-unknown-birth-hour');
 if(!original.unknownBirthTime&&!chart.hour)errors.push('unjustified-missing-birth-hour');
 if(original.calendar&&original.birthDate){
  try{
   const actual=calendar.calculate(original);
   if(!same(actual.chart,chart))errors.push('birth-input-chart-mismatch');
  }catch{errors.push('birth-input-calendar-unverifiable');}
 }else errors.push('missing-original-calculation-input');
 return {pass:errors.length===0,errors,version:'calculation-integrity-v1',
  verified:['calendar-source-chart','year-pillar','natal-ten-gods','hidden-stems','year-ten-gods','computed-clashes','unknown-hour-policy'],
  limitations:['does-not-certify-all-traditional-schools','does-not-prove-real-world-outcomes']};
}
module.exports={verify};
