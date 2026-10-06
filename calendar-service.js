/* Server-side calendar service boundary v0.6
 * Browser calls our backend; backend calls KASI with DATA_GO_KR_SERVICE_KEY.
 * This file defines validation/cache/fallback behavior independent of hosting platform.
 */
const CALENDAR_SERVICE=(()=>{
 function validDate(s){return /^\d{4}-\d{2}-\d{2}$/.test(s)}
 function cacheKey(input){return ['calendar-v1',input.calendar,input.birthDate,input.isLeapMonth?'leap':'normal'].join(':')}
 function prepare(input){
  if(!['solar','lunar'].includes(input.calendar))throw Error('calendar must be solar or lunar');
  if(!validDate(input.birthDate))throw Error('birthDate must be YYYY-MM-DD');
  if(input.calendar==='solar')return KASI_ADAPTER.solarRequest(input.birthDate);
  const [year,month,day]=input.birthDate.split('-').map(Number);
  return KASI_ADAPTER.lunarRequest({year,month,day,isLeapMonth:!!input.isLeapMonth});
 }
 function normalize(input,item){return input.calendar==='solar'?KASI_ADAPTER.normalizeSolarResponse(item):KASI_ADAPTER.normalizeLunarResponse(item)}
 function result(input,item){const data=normalize(input,item);return {status:'verified-calendar-source',cacheKey:cacheKey(input),input:{calendar:input.calendar,birthDate:input.birthDate,isLeapMonth:!!input.isLeapMonth},data,source:{provider:'한국천문연구원',service:'음양력 정보',adapter:'kasi-adapter-v0.6'}}}
 return {validDate,cacheKey,prepare,normalize,result};
})();
window.CALENDAR_SERVICE=CALENDAR_SERVICE;