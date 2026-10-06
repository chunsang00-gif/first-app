/* KASI official calendar adapter v0.6
 * Source of truth for Korean solar/lunar conversion: Korea Astronomy and Space Science Institute
 * Public Data Portal service: LrsrCldInfoService.
 * API key must live on server/edge, never in browser source.
 */
const KASI_ADAPTER=(()=>{
 const BASE='https://apis.data.go.kr/B090041/openapi/service/LrsrCldInfoService';
 function pad(n){return String(n).padStart(2,'0')}
 function solarRequest(date){const [y,m,d]=date.split('-').map(Number);return {endpoint:`${BASE}/getLunCalInfo`,params:{solYear:String(y),solMonth:pad(m),solDay:pad(d)}}}
 function lunarRequest({year,month,day,isLeapMonth=false}){return {endpoint:`${BASE}/getSolCalInfo`,params:{lunYear:String(year),lunMonth:pad(month),lunDay:pad(day),lunLeapmonth:isLeapMonth?'윤':'평'}}}
 function normalizeSolarResponse(item){if(!item)throw Error('KASI response item missing');return {solarDate:`${item.solYear}-${pad(item.solMonth)}-${pad(item.solDay)}`,lunarDate:`${item.lunYear}-${pad(item.lunMonth)}-${pad(item.lunDay)}`,isLeapMonth:item.lunLeapmonth==='윤',dayGanzhi:item.lunIljin||null,yearGanzhi:item.lunSecha||null,julianDay:item.solJd?Number(item.solJd):null,source:'KASI_LrsrCldInfoService'} }
 function normalizeLunarResponse(item){if(!item)throw Error('KASI response item missing');return {solarDate:`${item.solYear}-${pad(item.solMonth)}-${pad(item.solDay)}`,lunarDate:`${item.lunYear}-${pad(item.lunMonth)}-${pad(item.lunDay)}`,isLeapMonth:item.lunLeapmonth==='윤',source:'KASI_LrsrCldInfoService'} }
 return {BASE,solarRequest,lunarRequest,normalizeSolarResponse,normalizeLunarResponse};
})();
window.KASI_ADAPTER=KASI_ADAPTER;