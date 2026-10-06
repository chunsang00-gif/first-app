/* Production calculation boundary v1.0 */
const calendar=require('./calendar-provider-node');
const stems=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'],branches=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const cycle=Array.from({length:60},(_,i)=>stems[i%10]+branches[i%12]);
const mod=(n,m)=>((n%m)+m)%m;
function annualPillar(year){return cycle[mod(year-1984,60)]}
function calculate(input,targetYear=2027){const base=calendar.calculate(input);if(base.status!=='complete')return base;const fortune=calendar.fortune(input);return {status:'complete',ruleset:'kr-bazi-production-v1',input:{...input},normalized:{solarDate:base.solarDate,lunarDate:base.lunarDate},chart:base.chart,targetYear:{year:targetYear,pillar:annualPillar(targetYear)},fortune,provenance:{year:base.source,month:base.source,day:base.source,hour:input.unknownBirthTime?{status:'unknown-by-user'}:base.source,annual:{method:'sexagenary-cycle',anchor:'1984=甲子'}}}}
function canAnalyze(x){return x?.status==='complete'&&x.chart?.year&&x.chart?.month&&x.chart?.day&&(x.chart.hour||x.input?.unknownBirthTime)&&x.targetYear?.pillar}
module.exports={calculate,canAnalyze,annualPillar};