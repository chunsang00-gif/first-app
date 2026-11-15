'use strict';
// Deterministic Jie (절입) timing, NOT a hidden-stem command or Qi-strength
// algorithm. Uses the same pinned lunar-javascript ephemeris as four pillars.
// Solar objects are interpreted in the library's entered local clock frame:
// no timezone, longitude or apparent-solar-time correction is inferred.
const {Solar}=require('lunar-javascript');
const BRANCH_BY_JIE={
 '立春':'寅','惊蛰':'卯','驚蟄':'卯','清明':'辰',
 '立夏':'巳','芒种':'午','芒種':'午','小暑':'未',
 '立秋':'申','白露':'酉','寒露':'戌',
 '立冬':'亥','大雪':'子','小寒':'丑'
};
function millis(s){
 if(!s||typeof s.getYear!=='function')throw Error('Invalid solar object for Jie timing');
 return Date.UTC(s.getYear(),s.getMonth()-1,s.getDay(),s.getHour(),s.getMinute(),s.getSecond());
}
function label(obj){
 if(!obj||typeof obj.getName!=='function'||!obj.getSolar())throw Error('Missing dated solar term');
 return {name:obj.getName(),localClock:obj.getSolar().toYmdHms()};
}
function inspect(solar){
 const lunar=solar.getLunar(),prev=lunar.getPrevJie(),next=lunar.getNextJie();
 if(!prev||!next)throw Error('Jie calendar boundary missing');
 const begin=prev.getSolar(),end=next.getSolar();
 const date=millis(solar),from=millis(begin),to=millis(end);
 if(!(from<=date&&date<to))throw Error('Jie timing is not chronologically bounded');
 const previous=label(prev),upcoming=label(next);
 const branch=BRANCH_BY_JIE[previous.name];
 if(!branch)throw Error('Unknown preceding Jie '+previous.name);
 return {
  version:'exact-jie-timing-v1',status:'resolved',birthSolarLocal:solar.toYmdHms(),
  previousJie:previous,nextJie:upcoming,
  elapsedSecondsSinceJie:(date-from)/1000,
  remainingSecondsUntilNextJie:(to-date)/1000,
  monthBranchFromJie:branch,
  clockFrame:'entered-clock-time-no-longitude-correction',
  governingHiddenStem:'unresolved',
  governingDayAllocationRule:'not-selected',
  note:'절입 경과시간은 역법 라이브러리 기준의 계산 결과이며 사령 지장간·신강·용신의 확정 근거가 아님'
 };
}
function exactDateRange(year,month,day){
 const beginning=Solar.fromYmdHms(year,month,day,0,0,0);
 const end=Solar.fromYmdHms(year,month,day,23,59,59);
 return {beginning,ending:end};
}
module.exports={inspect,exactDateRange,BRANCH_BY_JIE};
