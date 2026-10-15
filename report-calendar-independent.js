'use strict';
// Independent civil-calendar/sexagenary oracle. Does NOT import the primary
// lunar-javascript ephemeris. Anchors and rules:
// 1983-01-07 = 乙未: https://wikidocs.net/249512
// 五虎遁 month stem: https://calcstandard.com/manseryeok/
// 五鼠遁 hour stem: https://sajuclass.com/명리-사전/역법-명식/시두법/
// The natal clock model is the app's documented uncorrected HH:MM, sect=2.
// Longitude/true-solar-time and disputed schools are NOT assessed here.
const STEMS='甲乙丙丁戊己庚辛壬癸';
const BRANCHES='子丑寅卯辰巳午未申酉戌亥';
const MONTH_BRANCHES='寅卯辰巳午未申酉戌亥子丑';
const DAY_ANCHOR=Date.UTC(1983,0,7);
const mod=(x,n)=>((x%n)+n)%n;
function dayNumber(date){
 if(typeof date!=='string'||!/^(\d{4})-(\d{2})-(\d{2})$/.test(date))
  throw Error('Invalid normalized solar date');
 const [y,m,d]=date.split('-').map(Number);
 if(y<1900||y>2100||m<1||m>12||d<1||d>31)
  throw Error('Solar date out of supported range');
 const utc=Date.UTC(y,m-1,d),reconstructed=new Date(utc);
 if(reconstructed.getUTCFullYear()!==y||reconstructed.getUTCMonth()!==m-1||
    reconstructed.getUTCDate()!==d)throw Error('Invalid Gregorian date');
 return Math.floor((utc-DAY_ANCHOR)/86400000);
}
function dayPillar(solarDate){
 const n=dayNumber(solarDate);
 return STEMS[mod(n+1,10)]+BRANCHES[mod(n+7,12)];
}
function annualPillar(year){
 if(!Number.isInteger(year)||year<1900||year>2100)throw Error('Invalid solar year');
 const pos=mod(year-1984,60);
 return STEMS[pos%10]+BRANCHES[pos%12];
}
function calendricalYear(solarDate,monthBranch){
 const year=Number(solarDate.slice(0,4)),month=Number(solarDate.slice(5,7));
 if(!MONTH_BRANCHES.includes(monthBranch))throw Error('Invalid calendar Jie month');
 // The natal year follows 立春 rather than Gregorian January 1.
 if(month===1||(month===2&&monthBranch!=='寅'))return year-1;
 return year;
}
function monthPillar(yearStem,monthBranch){
 const yi=STEMS.indexOf(yearStem),mi=MONTH_BRANCHES.indexOf(monthBranch);
 if(yi<0||mi<0)throw Error('Invalid year stem or month branch');
 const first=mod((yi%5)*2+2,10);
 return STEMS[(first+mi)%10]+monthBranch;
}
function hourPillar(dayStem,birthTime){
 if(typeof birthTime!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(birthTime))
  throw Error('Invalid birth HH:MM');
 const dayIndex=STEMS.indexOf(dayStem);
 if(dayIndex<0)throw Error('Invalid day stem');
 const hour=Number(birthTime.slice(0,2));
 const hourIndex=Math.floor(((hour+1)%24)/2);
 return STEMS[(dayIndex%5*2+hourIndex)%10]+BRANCHES[hourIndex];
}
function verify({solarDate,chart,solarTermTiming,birthTime,unknownBirthTime}){
 const errors=[];
 try{
  if(!chart||!solarDate||!solarTermTiming)throw Error('Missing independent calendar inputs');
  const year=calendricalYear(solarDate,solarTermTiming.monthBranchFromJie);
  const expected={
   year:annualPillar(year),
   month:monthPillar(annualPillar(year)[0],solarTermTiming.monthBranchFromJie),
   day:dayPillar(solarDate),
   hour:unknownBirthTime?null:hourPillar(dayPillar(solarDate)[0],birthTime)
  };
  for(const key of ['year','month','day','hour']){
   if((chart[key]??null)!==(expected[key]??null))errors.push('independent-'+key+'-pillar-mismatch');
  }
  return {pass:errors.length===0,errors,expected,
   version:'gregorian-sexagenary-oracle-v1',scope:'civil-clock-no-true-solar-time'};
 }catch{
  return {pass:false,errors:['independent-calendar-oracle-unverifiable'],
   version:'gregorian-sexagenary-oracle-v1'};
 }
}
module.exports={verify,dayPillar,monthPillar,hourPillar,annualPillar,calendricalYear};
