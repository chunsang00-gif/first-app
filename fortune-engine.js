/* Daewoon / annual-flow core v0.5
 * Direction and onset are ruleset-dependent. This module exposes evidence and does not hide conventions.
 */
const SAJU_FORTUNE=(()=>{
const stems=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const branches=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const cycle=Array.from({length:60},(_,i)=>stems[i%10]+branches[i%12]);
const yang=new Set(['甲','丙','戊','庚','壬']);
const mod=(n,m)=>((n%m)+m)%m;
function direction(gender,yearStem){const isYang=yang.has(yearStem);return ((gender==='male'&&isYang)||(gender==='female'&&!isYang))?'forward':'backward'}
function nextPillars(monthPillar,dir,count=10){const idx=cycle.indexOf(monthPillar);if(idx<0)throw Error('invalid month pillar');const step=dir==='forward'?1:-1;return Array.from({length:count},(_,i)=>cycle[mod(idx+step*(i+1),60)])}
function onsetFromTermDistance(days,method='3days_1year'){if(method!=='3days_1year')return {status:'unsupported'};const years=days/3;const whole=Math.floor(years);const months=Math.round((years-whole)*12);return {status:'ok',decimalYears:years,years:whole,months:months===12?0:months,carryYears:months===12?1:0,method}}
function annualPillar(year){return cycle[mod(year-1984,60)]}
function build({gender,yearPillar,monthPillar,birthDate,nextRelevantTermDate,prevRelevantTermDate,targetYear=2027}){
 const dir=direction(gender,yearPillar[0]);
 const termDate=dir==='forward'?nextRelevantTermDate:prevRelevantTermDate;
 let onset={status:'needs_solar_term_timestamp'};
 if(termDate){const a=new Date(birthDate),b=new Date(termDate),days=Math.abs(b-a)/86400000;onset=onsetFromTermDistance(days)}
 return {direction:dir,onset,sequence:nextPillars(monthPillar,dir),annual:{year:targetYear,pillar:annualPillar(targetYear)},rules:{direction:'양년남·음년녀 순행 / 음년남·양년녀 역행',onset:'선택된 절기까지 거리 3일=1년'}};
}
return {direction,nextPillars,onsetFromTermDistance,annualPillar,build};
})();
window.SAJU_FORTUNE=SAJU_FORTUNE;