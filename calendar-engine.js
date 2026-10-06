/* Calendar core v0.3 — deterministic pillar primitives.
   Production rule: astronomical solar-term timestamps and lunar conversion must be verified
   against authoritative test vectors before paid release. No AI calculation is allowed here. */
const SAJU_CALENDAR=(()=>{
const stems=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const branches=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const cycle=Array.from({length:60},(_,i)=>stems[i%10]+branches[i%12]);
const hourBranches=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
function mod(n,m){return ((n%m)+m)%m}
function parseLocal(date,time='12:00'){const [y,m,d]=date.split('-').map(Number),[hh,mm]=time.split(':').map(Number);return {y,m,d,hh,mm}}
function julianDay(y,m,d){if(m<=2){y--;m+=12}const A=Math.floor(y/100),B=2-A+Math.floor(A/4);return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5}
/* Calibrated to verified fixture: 1983-01-07 = 乙未. This arithmetic is independently testable. */
const fixtureJd=julianDay(1983,1,7),fixtureIndex=31; // 乙未 is cycle index 31 (0-based)
function dayPillar(date){const {y,m,d}=parseLocal(date);const delta=Math.round(julianDay(y,m,d)-fixtureJd);return cycle[mod(fixtureIndex+delta,60)]}
function hourBranch(time){const [h,min]=time.split(':').map(Number),mins=h*60+min;if(mins>=1380||mins<60)return '子';return hourBranches[Math.floor((mins+60)/120)%12]}
function hourPillar(dayStem,time){const b=hourBranch(time),bi=branches.indexOf(b),di=stems.indexOf(dayStem);if(di<0)throw Error('invalid day stem');const ziStemIndex=mod((di%5)*2,10);return stems[mod(ziStemIndex+bi,10)]+b}
function yearPillarByLiChun(date,liChunIso){const p=parseLocal(date),birth=new Date(`${date}T${String(p.hh||0).padStart(2,'0')}:00:00+09:00`);const lc=new Date(liChunIso);let y=p.y;if(birth<lc)y--;return cycle[mod(y-1984,60)]} // 1984 甲子
function monthStemFor(yearStem,branch){const bi=['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'].indexOf(branch);if(bi<0)throw Error('invalid month branch');const ys=stems.indexOf(yearStem);const yinStart=[2,4,6,8,0][ys%5];return stems[mod(yinStart+bi,10)]+branch}
function validateFixture(){const day=dayPillar('1983-01-07');const hour=hourPillar(day[0],'14:20');return {pass:day==='乙未'&&hour==='癸未',day,hour,expected:{day:'乙未',hour:'癸未'}}}
return {stems,branches,cycle,dayPillar,hourBranch,hourPillar,yearPillarByLiChun,monthStemFor,validateFixture};
})();
window.SAJU_CALENDAR=SAJU_CALENDAR;