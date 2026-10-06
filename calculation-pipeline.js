/* Guarded calculation pipeline v0.4
 * A report can only be generated when all required calculation facts have verified sources.
 */
const SAJU_PIPELINE=(()=>{
const RULESET={id:'kr-bazi-v0.4',yearBoundary:'lichun',monthBoundary:'solar_terms_jie',dayBoundary:'00:00',solarTime:'none',unknownBirthTime:'allow_partial',status:'development'};
function calculate(input,deps={}){
 const errors=[],warnings=[];
 if(!input.birthDate)errors.push('birthDate required');
 if(!input.birthTime&&!input.unknownBirthTime)errors.push('birthTime required or unknownBirthTime=true');
 if(!input.birthplace)errors.push('birthplace required');
 if(errors.length)return {status:'invalid',errors,warnings,ruleset:RULESET};
 const time=input.unknownBirthTime?null:SAJU_TIME.normalize(input,{solarTime:RULESET.solarTime});
 if(time&&time.status!=='ok')errors.push(time.reason);
 const solarDate=input.calendar==='solar'?input.birthDate:(deps.lunarToSolar?deps.lunarToSolar(input):null);
 if(!solarDate)errors.push('검증된 음양력 변환 모듈이 아직 필요함');
 if(errors.length)return {status:'blocked',errors,warnings,ruleset:RULESET,time};
 const day=SAJU_CALENDAR.dayPillar(solarDate);
 const hour=input.unknownBirthTime?null:SAJU_CALENDAR.hourPillar(day[0],time.calculationTime.time);
 if(!deps.solarTerms)errors.push('검증된 절기 시각 데이터가 필요함');
 if(errors.length)return {status:'partial',errors,warnings,ruleset:RULESET,normalized:{solarDate,time},known:{day,hour}};
 const ym=deps.solarTerms.yearMonthPillars({...input,solarDate,time,ruleset:RULESET});
 const chart={year:ym.year,month:ym.month,day,hour};
 return {status:'complete',errors,warnings,ruleset:RULESET,normalized:{solarDate,time},chart,enriched:SAJU_ENGINE.enrich(chart)};
}
return {RULESET,calculate};
})();
window.SAJU_PIPELINE=SAJU_PIPELINE;