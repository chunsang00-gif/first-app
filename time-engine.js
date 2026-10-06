/* Birth time normalization v0.4
 * Separates civil time, historical timezone and optional solar-time correction.
 * Production must use verified timezone/ephemeris data; unsupported cases are blocked, never guessed.
 */
const SAJU_TIME=(()=>{
const places={
 '대구':{lat:35.8714,lon:128.6014,tz:'Asia/Seoul'},
 '서울':{lat:37.5665,lon:126.9780,tz:'Asia/Seoul'},
 '부산':{lat:35.1796,lon:129.0756,tz:'Asia/Seoul'},
 '인천':{lat:37.4563,lon:126.7052,tz:'Asia/Seoul'},
 '광주':{lat:35.1595,lon:126.8526,tz:'Asia/Seoul'},
 '대전':{lat:36.3504,lon:127.3845,tz:'Asia/Seoul'},
 '울산':{lat:35.5384,lon:129.3114,tz:'Asia/Seoul'},
 '세종':{lat:36.4800,lon:127.2890,tz:'Asia/Seoul'},
 '수원':{lat:37.2636,lon:127.0286,tz:'Asia/Seoul'},
 '안성':{lat:37.0079,lon:127.2797,tz:'Asia/Seoul'},
 '제주':{lat:33.4996,lon:126.5312,tz:'Asia/Seoul'}
};
function place(name){const key=Object.keys(places).find(k=>(name||'').includes(k));return key?{name:key,...places[key]}:null}
function longitudeMinutes(lon,standardMeridian=135){return (lon-standardMeridian)*4}
function shiftMinutes(date,time,minutes){const [y,m,d]=date.split('-').map(Number),[h,mi]=time.split(':').map(Number);const x=new Date(Date.UTC(y,m-1,d,h,mi));x.setUTCMinutes(x.getUTCMinutes()+minutes);return {date:`${x.getUTCFullYear()}-${String(x.getUTCMonth()+1).padStart(2,'0')}-${String(x.getUTCDate()).padStart(2,'0')}`,time:`${String(x.getUTCHours()).padStart(2,'0')}:${String(x.getUTCMinutes()).padStart(2,'0')}`}}
function normalize(input,rule={solarTime:'none'}){
 const p=place(input.birthplace);if(!p)return {status:'needs_place_data',reason:'출생지 좌표가 등록되지 않음'};
 const base={status:'ok',civil:{date:input.birthDate,time:input.birthTime,tz:p.tz},place:p,method:rule.solarTime||'none'};
 if(rule.solarTime==='none')return {...base,calculationTime:{date:input.birthDate,time:input.birthTime},correctionMinutes:0};
 if(rule.solarTime==='local_mean'){
   const mins=longitudeMinutes(p.lon);return {...base,calculationTime:shiftMinutes(input.birthDate,input.birthTime,mins),correctionMinutes:mins};
 }
 return {status:'blocked',reason:'true/apparent solar time requires verified equation-of-time implementation'};
}
return {places,place,longitudeMinutes,normalize};
})();
window.SAJU_TIME=SAJU_TIME;