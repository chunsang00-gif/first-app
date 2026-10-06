/* Server-side deterministic calendar provider v0.9.
 * lunar-javascript 1.7.7, MIT. Explicit Y/M/D/H/M construction avoids JS Date timezone ambiguity.
 * App convention: EightChar sect=2 => late Zi hour day pillar remains on civil day.
 */
const {Solar,Lunar}=require('lunar-javascript');
function parts(date,time='12:00'){const [y,m,d]=date.split('-').map(Number),[h,mi]=time.split(':').map(Number);return {y,m,d,h,mi}}
function makeSolar(input){const p=parts(input.birthDate,input.birthTime||'12:00');if(input.calendar==='lunar'){const lunar=Lunar.fromYmdHms(p.y,input.leapMonth?-p.m:p.m,p.d,p.h,p.mi,0);return lunar.getSolar()}return Solar.fromYmdHms(p.y,p.m,p.d,p.h,p.mi,0)}
function calculate(input){const solar=makeSolar(input),lunar=solar.getLunar(),ec=lunar.getEightChar();ec.setSect(2);const chart={year:ec.getYear(),month:ec.getMonth(),day:ec.getDay(),hour:input.unknownBirthTime?null:ec.getTime()};return {status:'complete',source:{library:'lunar-javascript',version:'1.7.7',license:'MIT',construction:'explicit-ymdhms',eightCharSect:2},solarDate:solar.toYmd(),lunarDate:lunar.toString(),chart}}
function fortune(input){if(input.unknownBirthTime)return {status:'unavailable_without_birth_time'};const solar=makeSolar(input),ec=solar.getLunar().getEightChar();ec.setSect(2);const yun=ec.getYun(input.gender==='male'?1:0,1);return {status:'complete',forward:yun.isForward(),start:{year:yun.getStartYear(),month:yun.getStartMonth(),day:yun.getStartDay(),hour:yun.getStartHour()},source:{method:'lunar-javascript EightChar.getYun',sect:1,rule:'3 days = 1 year convention'}}}
module.exports={calculate,fortune};