'use strict';
// Calculation integrity BEFORE the interpretation plan or a billable request.
// Re-derives the symbolic rows from the canonical chart rather than trusting
// an already-assembled fact packet or the model's interpretation.
const {LunarUtil}=require('lunar-javascript');
const calendar=require('./calendar-provider-node');
const pipeline=require('./production-pipeline-node');
const relations=require('./report-branch-relations');
const names={'比肩':'비견','劫财':'겁재','食神':'식신','伤官':'상관','偏财':'편재','正财':'정재','七杀':'편관','正官':'정관','偏印':'편인','正印':'정인'};
const branches='子丑寅卯辰巳午未申酉戌亥',stems='甲乙丙丁戊己庚辛壬癸';
const hidden={子:['癸'],丑:['己','癸','辛'],寅:['甲','丙','戊'],卯:['乙'],辰:['戊','乙','癸'],巳:['丙','戊','庚'],午:['丁','己'],未:['己','丁','乙'],申:['庚','壬','戊'],酉:['辛'],戌:['戊','辛','丁'],亥:['壬','甲']};
const clashes=[['子','午'],['丑','未'],['寅','申'],['卯','酉'],['辰','戌'],['巳','亥']];
const root={子:'癸',丑:'己',寅:'甲',卯:'乙',辰:'戊',巳:'丙',午:'丁',未:'己',申:'庚',酉:'辛',戌:'戊',亥:'壬'};
const element={甲:'wood',乙:'wood',丙:'fire',丁:'fire',戊:'earth',己:'earth',庚:'metal',辛:'metal',壬:'water',癸:'water'};
const yinYang={甲:'yang',乙:'yin',丙:'yang',丁:'yin',戊:'yang',己:'yin',庚:'yang',辛:'yin',壬:'yang',癸:'yin'};
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
 // The interpretation engine cites structural facts too. Reconstruct all
 // symbolic positions, not merely ten-god labels, before accepting them.
 const structure=facts.structuralEvidence||{},monthBranch=branch(chart.month);
 const expectedMonthRoot=root[monthBranch];
 if(structure.monthCommand?.branch!==monthBranch||
    structure.monthCommand?.mainHiddenStem!==expectedMonthRoot||
    structure.monthCommand?.mainHiddenStemTenGod!==tenGod(day,expectedMonthRoot))
  errors.push('incorrect-month-command');
 const expectedRoots=positions.filter(position=>chart[position]).map(position=>{
  const zhi=branch(chart[position]);
  return {position,branch:zhi,hiddenStems:hidden[zhi],
   sameElementStems:hidden[zhi].filter(stem=>element[stem]===element[day])};
 });
 if(!same(structure.dayMasterRoots,expectedRoots))errors.push('incorrect-day-master-roots');
 const expectedVisible=positions.filter(position=>chart[position]).map(position=>{
  const stem=chart[position][0];
  return {position,stem,element:element[stem],yinYang:yinYang[stem],
   tenGod:position==='day'?'일간':tenGod(day,stem)};
 });
 if(!same(structure.visibleStems,expectedVisible))errors.push('incorrect-visible-stems');
 const expectedSeasonal=require('./report-seasonal-evidence').evaluate(chart);
 if(!same(facts.seasonalEvidence,expectedSeasonal))errors.push('incorrect-monthly-seasonal-evidence');
 // Corrupted solar-term fields can violate the qi-ledger input contract.
 // Return a structured pre-provider QA failure rather than throw/500.
 let expectedQi=null;
 try{expectedQi=require('./report-qi-evidence').build(chart,facts.solarTermTiming)}
 catch{errors.push('incorrect-positional-qi-evidence')}
 if(expectedQi&&!same(facts.qiEvidence,expectedQi))errors.push('incorrect-positional-qi-evidence');
 let expectedMethod=null;
 try{expectedMethod=require('./report-governing-day-method').inspect({
  chart,timing:facts.solarTermTiming,hiddenStems:hidden[branch(chart.month)]
 })}
 catch{errors.push('incorrect-governing-day-diagnostic')}
 if(expectedMethod&&!same(facts.governingDayDiagnostic,expectedMethod))
  errors.push('incorrect-governing-day-diagnostic');
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
 // These fields are additive: existing 충-only consumers remain unchanged.
 // Detect a stale or tampered relation table before the paid provider runs.
 const expectedNatalRelations=relations.natal(chart);
 const expectedYearRelations=relations.annual(chart,actualYear);
 if(!same(facts.natalBranchRelations,expectedNatalRelations))
  errors.push('incorrect-natal-branch-relations');
 if(!same(facts.targetYearBranchRelations,expectedYearRelations))
  errors.push('incorrect-2027-branch-relations');
 const expectedContext=require('./report-branch-context').evaluate(chart,actualYear);
 if(!same(facts.targetYearBranchContext,expectedContext))
  errors.push('incorrect-2027-branch-interpretation-context');
 if(!same(expectedNatalRelations.pairs.filter(x=>x.type==='충').map(x=>({
  type:'충',positions:x.positions,branches:x.branches,
  note:'서로 마주 보는 지지 관계. 갈등이나 사건 발생을 확정하지 않음'
 })),natalClashes))errors.push('branch-table-disagrees-with-natal-clash-calculation');
 if(!same(expectedYearRelations.pairs.filter(x=>x.type==='충').map(x=>({
  type:'충',between:x.between,branches:x.branches
 })),yearlyClashes))errors.push('branch-table-disagrees-with-annual-clash-calculation');
 const decade=packet.fortune||{};
 for(const period of decade.decades||[]){
  if(!valid(period.pillar)||period.stemTenGod!==tenGod(day,period.pillar[0]))
   errors.push('incorrect-decade-ten-gods');
 }
 const matched=(decade.decades||[]).find(p=>p.startYear<=year&&p.endYear>=year)||null;
 if(!same(decade.activeDecade,matched))errors.push('incorrect-active-decade');
 const original=packet.calculationInput||{};
 if(original.unknownBirthTime&&chart.hour)errors.push('fabricated-unknown-birth-hour');
 if(!original.unknownBirthTime&&!chart.hour)errors.push('unjustified-missing-birth-hour');
 if(original.calendar&&original.birthDate){
  try{
   const actual=calendar.calculate(original);
   if(actual.status!=='complete'||!same(actual.chart,chart))errors.push('birth-input-chart-mismatch');
   if(!same(facts.solarTermTiming,actual.solarTermTiming))errors.push('incorrect-birth-solar-term-timing');
  }catch{errors.push('birth-input-calendar-unverifiable');}
 }else errors.push('missing-original-calculation-input');
 return {pass:errors.length===0,errors,version:'calculation-integrity-v1',
  verified:['calendar-source-chart','year-pillar','natal-ten-gods','hidden-stems','year-ten-gods','computed-clashes','pairwise-branch-relations','complete-branch-groups','month-command','seasonal-evidence','day-master-roots','visible-stems','decade-classifications','unknown-hour-policy'],
  limitations:['does-not-certify-all-traditional-schools','does-not-prove-real-world-outcomes']};
}
module.exports={verify};
