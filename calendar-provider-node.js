/* Server-side deterministic calendar provider v0.9.
 * lunar-javascript 1.7.7, MIT. Explicit Y/M/D/H/M construction avoids JS Date timezone ambiguity.
 * App convention: EightChar sect=2 => late Zi hour day pillar remains on civil day.
 */
const {Solar,Lunar}=require('lunar-javascript');
function parts(date,time='12:00'){
 if(typeof date!=='string'||!/^(\d{4})-(\d{2})-(\d{2})$/.test(date))throw Error('invalid birth date format');
 if(typeof time!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw Error('invalid birth time format');
 const [y,m,d]=date.split('-').map(Number),[h,mi]=time.split(':').map(Number);
 if(y<1900||y>2100||m<1||m>12||d<1||d>31)throw Error('birth date out of supported range');
 return {y,m,d,h,mi};
}
function makeSolar(input){
 if(!['solar','lunar'].includes(input.calendar))throw Error('invalid calendar');
 const p=parts(input.birthDate,input.birthTime||'12:00');
 if(input.calendar==='lunar'){
  if(p.d>30)throw Error('invalid lunar day');
  const lunar=Lunar.fromYmdHms(p.y,input.leapMonth?-p.m:p.m,p.d,p.h,p.mi,0);
  if(lunar.getYear()!==p.y||Math.abs(lunar.getMonth())!==p.m||lunar.getDay()!==p.d)throw Error('invalid lunar date');
  return lunar.getSolar();
 }
 const maxDay=new Date(Date.UTC(p.y,p.m,0)).getUTCDate();
 if(p.d>maxDay)throw Error('invalid solar date');
 return Solar.fromYmdHms(p.y,p.m,p.d,p.h,p.mi,0);
}
function calculate(input){const solar=makeSolar(input),lunar=solar.getLunar(),ec=lunar.getEightChar();ec.setSect(2);const chart={year:ec.getYear(),month:ec.getMonth(),day:ec.getDay(),hour:input.unknownBirthTime?null:ec.getTime()};return {status:'complete',source:{library:'lunar-javascript',version:'1.7.7',license:'MIT',construction:'explicit-ymdhms',eightCharSect:2},solarDate:solar.toYmd(),lunarDate:lunar.toString(),chart}}
function fortune(input){if(input.unknownBirthTime)return {status:'unavailable_without_birth_time'};const solar=makeSolar(input),ec=solar.getLunar().getEightChar();ec.setSect(2);const yun=ec.getYun(input.gender==='male'?1:0,1);return {status:'complete',forward:yun.isForward(),decades:yun.getDaYun(12).map(d=>({index:d.getIndex(),pillar:d.getGanZhi(),startAge:d.getStartAge(),endAge:d.getEndAge(),startYear:d.getStartYear(),endYear:d.getEndYear()})).filter(d=>d.index>0&&d.pillar),start:{year:yun.getStartYear(),month:yun.getStartMonth(),day:yun.getStartDay(),hour:yun.getStartHour()},source:{method:'lunar-javascript EightChar.getYun',sect:1,rule:'3 days = 1 year convention'}}}
module.exports={calculate,fortune};