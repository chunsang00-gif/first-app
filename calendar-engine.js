/* Calendar core v0.7. Regression sample is provisional, not independent verification. */
const SAJU_CALENDAR=(()=>{
const stems=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const branches=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const cycle=Array.from({length:60},(_,i)=>stems[i%10]+branches[i%12]);
const mod=(n,m)=>((n%m)+m)%m;
function julianDay(y,m,d){if(m<=2){y--;m+=12}const A=Math.floor(y/100),B=2-A+Math.floor(A/4);return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5}
const fixtureJd=julianDay(1983,1,7),fixtureIndex=31;
function dayPillar(date){const [y,m,d]=date.split('-').map(Number);return cycle[mod(fixtureIndex+Math.round(julianDay(y,m,d)-fixtureJd),60)]}
function hourBranch(time){const [h,min]=time.split(':').map(Number),mins=h*60+min;if(mins>=1380||mins<60)return '子';return branches[Math.floor((mins+60)/120)%12]}
function hourPillar(dayStem,time){const b=hourBranch(time),bi=branches.indexOf(b),di=stems.indexOf(dayStem);if(di<0)throw Error('invalid day stem');return stems[mod((di%5)*2+bi,10)]+b}
function yearPillarByLiChun(date,time,liChunIso,offset='+09:00'){const [y]=date.split('-').map(Number);const birth=new Date(`${date}T${time}:00${offset}`),lc=new Date(liChunIso);if(Number.isNaN(birth.valueOf())||Number.isNaN(lc.valueOf()))throw Error('invalid datetime');return cycle[mod((birth<lc?y-1:y)-1984,60)]}
function monthStemFor(yearStem,branch){const bi=['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'].indexOf(branch),ys=stems.indexOf(yearStem);if(bi<0||ys<0)throw Error('invalid pillar input');return stems[mod([2,4,6,8,0][ys%5]+bi,10)]+branch}
function validateGoldenFixture(){const day=dayPillar('1983-01-07'),hour=hourPillar(day[0],'14:20');return {status:'provisional',pass:day==='乙未'&&hour==='癸未',day,hour}}
return {version:'0.7',stems,branches,cycle,dayPillar,hourBranch,hourPillar,yearPillarByLiChun,monthStemFor,validateGoldenFixture};})();
window.SAJU_CALENDAR=SAJU_CALENDAR;