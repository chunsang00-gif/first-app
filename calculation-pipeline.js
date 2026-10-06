/* Guarded calculation pipeline v0.8 */
const SAJU_PIPELINE=(()=>{
const RULESET={id:'kr-bazi-v0.8',yearBoundary:'lichun',monthBoundary:'solar_terms_jie',dayBoundary:'00:00',solarTime:'none',unknownBirthTime:'allow_partial',status:'development'};
function normalizeUiInput(raw){const cal=raw.calendar==='음력'||raw.calendar==='lunar'?'lunar':'solar';return {gender:raw.gender==='남성'||raw.gender==='male'?'male':'female',calendar:cal,birthDate:raw.birthDate||raw.birth||'',birthTime:raw.birthTime||raw.time||'',birthplace:raw.birthplace||raw.city||'',unknownBirthTime:Boolean(raw.unknownBirthTime),leapMonth:Boolean(raw.leapMonth),mbti:raw.mbti||'모름',name:raw.name||'',hanja:raw.hanja||''}}
function calculate(raw,deps={}){const input=normalizeUiInput(raw),errors=[],warnings=[];
 if(!input.birthDate)errors.push('생년월일을 입력해주세요.');if(!input.birthTime&&!input.unknownBirthTime)errors.push('출생시간을 입력하거나 시간 모름을 선택해주세요.');if(!input.birthplace)errors.push('출생도시를 입력해주세요.');if(errors.length)return {status:'invalid',input,errors,warnings,ruleset:RULESET};
 const time=input.unknownBirthTime?null:SAJU_TIME.normalize(input,{solarTime:RULESET.solarTime});if(time&&time.status!=='ok')errors.push(time.reason);
 let solarDate=input.calendar==='solar'?input.birthDate:null;if(input.calendar==='lunar'&&deps.lunarToSolar){const x=deps.lunarToSolar(input);solarDate=typeof x==='string'?x:x?.solarDate}
 if(!solarDate)errors.push('음력·윤달 공식 변환 데이터 연결이 필요합니다.');if(errors.length)return {status:'blocked',input,errors,warnings,ruleset:RULESET,time};
 const day=SAJU_CALENDAR.dayPillar(solarDate),hour=input.unknownBirthTime?null:SAJU_CALENDAR.hourPillar(day[0],time.calculationTime.time);
 if(!deps.solarTerms?.yearMonthPillars)return {status:'partial',input,errors:['정확한 절기 시각 데이터 연결이 필요합니다.'],warnings,ruleset:RULESET,normalized:{solarDate,time},known:{day,hour}};
 const ym=deps.solarTerms.yearMonthPillars({...input,solarDate,time,ruleset:RULESET});if(!ym?.year||!ym?.month)return {status:'blocked',input,errors:['연주·월주 계산 결과가 완전하지 않습니다.'],warnings,ruleset:RULESET};
 const chart={year:ym.year,month:ym.month,day,hour};return {status:'complete',input,errors,warnings,ruleset:RULESET,normalized:{solarDate,time},chart,enriched:SAJU_ENGINE.enrich(chart)} }
function canGenerateReport(result){return result?.status==='complete'&&result?.chart?.year&&result?.chart?.month&&result?.chart?.day&&(result.chart.hour||result.input?.unknownBirthTime)}
return {RULESET,normalizeUiInput,calculate,canGenerateReport};})();
window.SAJU_PIPELINE=SAJU_PIPELINE;