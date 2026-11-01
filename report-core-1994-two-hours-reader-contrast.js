'use strict';
// TWO fully written reader passages, not an abstract 20:20 null check.
// QA-only: exact 1994 chart and a genuinely recalculated alternate hour.
// No provider calls, no deployment, no new paid topic or release approval.
const facts=require('./report-facts-node');
const ledger=require('./report-fact-bindings');
const pairs=require('./report-core-paid-natal-visible-stem-pair-screen');
const published=require('./report-core-1994-dingren-reader-revision');
const reader=require('./report-reader-policy');
const INPUT=Object.freeze({calendar:'solar',birthDate:'1994-07-15',
 birthTime:'14:20',gender:'male',mbti:'ISFP'});
const LATER='20:20';
const EXPECTED=Object.freeze({
 early:Object.freeze({year:'甲戌',month:'辛未',day:'壬寅',hour:'丁未'}),
 later:Object.freeze({year:'甲戌',month:'辛未',day:'壬寅',hour:'庚戌'})
});
const LATER_PARAGRAPHS=Object.freeze([
 '같은 날 오후 8시 20분으로 출생시간을 바꾸면 태어난 해·달·날의 글자는 그대로지만 시간의 글자는 달라집니다. 태어난 달의 겉글자는 이미 배운 설명이나 도움을 적용하는 문제와 연결됩니다. 이번에 바뀐 시간의 겉글자는 익숙하지 않은 자료를 다른 방식으로 이해하는 문제와 연결됩니다. 둘 다 배움과 관계된 전통 분류지만, 기존의 도움을 받아들이는 질문과 낯선 정보를 읽는 질문은 같지 않습니다.',
 '오후 2시 20분 명식에서는 시간의 겉글자가 출생월 안쪽의 자원 관리 글자와 정확히 같고, 태어난 날의 글자와 전통적인 짝 관계 후보도 있었습니다. 그러나 오후 8시 20분에서는 시간의 겉글자가 달라져 두 가지 근거가 모두 사라집니다. 따라서 앞선 시간의 자원 관리 풀이를 이 시간에 그대로 옮기면 안 됩니다. 반대로 태어난 달에서 확인한 배움과 규칙 관련 기본 질문까지 사라진 것은 아닙니다. 시간에 따라 달라지는 해석과 바뀌지 않는 출발점을 분리해야 합니다.',
 '이 시간에 추가로 읽을 수 있는 것은 낯선 정보를 이해하는 쪽의 전통 분류가 시간에 나타난다는 사실과, 달의 배움 관련 분류와 세부 질문이 다르다는 점입니다. 그렇다고 이 사람이 공부를 더 잘하거나 새로운 일을 빨리 익힌다는 결론은 나오지 않습니다. 오후 2시 20분에 해당하던 두 글자의 짝이 사라졌다는 이유만으로 시간의 새 분류가 더 우세해진다는 판단도 할 수 없습니다. 정확한 출생시간이 확인되지 않으면 두 설명 중 하나를 그 사람의 성격처럼 선택해서는 안 됩니다.'
]);
const refsEarly=Object.freeze([
 'natal.month.stem','natal.month.hidden.己','natal.month.hidden.丁',
 'natal.day.stem','natal.hour.stem','natal.year.stem',
 'facts.stemConnections','facts.seasonalEvidence','facts.qiEvidence'
]);
const refsLater=Object.freeze([
 'natal.month.stem','natal.month.hidden.己','natal.month.hidden.丁',
 'natal.day.stem','natal.hour.stem','natal.year.stem',
 'facts.stemConnections'
]);
function make(input=INPUT){
 // Never turn a free-form input into an accidentally personalized reading.
 if(process.env.NODE_ENV!=='test'||process.env.RENDER==='true'||
    process.env.PAID_CORE_DEPTH_V2!=='offline-preview')
  throw Error('QA_1994_TWO_HOURS_RESEARCH_ONLY');
 if(Object.keys(INPUT).some(k=>input?.[k]!==INPUT[k]))return null;
 const first=facts.build(input,2027),second=facts.build({...input,birthTime:LATER},2027);
 if(first.status!=='ready'||second.status!=='ready'||
    Object.keys(EXPECTED.early).some(k=>first.chart[k]!==EXPECTED.early[k]||
      second.chart[k]!==EXPECTED.later[k]))
  throw Error('QA_1994_TWO_HOURS_CALCULATION_DRIFT');
 const before=published.make(first);
 if(!before||before.releaseVerdict!=='not-approved'||
    before.approvedForCustomer!==false)return null;
 const sourceEarly=Object.fromEntries(ledger.build(first).map(x=>[x.id,x]));
 const sourceLater=Object.fromEntries(ledger.build(second).map(x=>[x.id,x]));
 function check(row,id,stem,god){
  if(row[id]?.stem!==stem||row[id]?.tenGod!==god||
     row[id]?.observedBehavior!==false)
   throw Error('QA_1994_TWO_HOURS_TEN_GOD_DRIFT:'+id);
 }
 check(sourceEarly,'natal.hour.stem','丁','정재');
 check(sourceLater,'natal.hour.stem','庚','편인');
 check(sourceEarly,'natal.month.stem','辛','정인');
 check(sourceLater,'natal.month.stem','辛','정인');
 check(sourceEarly,'natal.month.hidden.丁','丁','정재');
 check(sourceLater,'natal.month.hidden.丁','丁','정재');
 for(const id of refsEarly)if(!id.startsWith('facts.')&&!sourceEarly[id])
  throw Error('QA_1994_TWO_HOURS_EARLY_SOURCE_MISSING:'+id);
 for(const id of refsLater)if(!id.startsWith('facts.')&&!sourceLater[id])
  throw Error('QA_1994_TWO_HOURS_LATE_SOURCE_MISSING:'+id);
 const originalPair=pairs.inspect(first).matches.some(p=>
  p.combination==='丁壬'&&p.from==='natal.day.stem'&&
  p.to==='natal.hour.stem'&&p.adjacent===true);
 const laterPair=pairs.inspect(second).matches.some(p=>
  p.from==='natal.day.stem'&&p.to==='natal.hour.stem');
 const oldExposure=first.facts.stemConnections.exposure.some(x=>
  x.hiddenId==='natal.month.hidden.丁'&&x.position==='month'&&
  x.exactVisibleMatches.some(y=>y.id==='natal.hour.stem'&&y.position==='hour'));
 const newExposure=second.facts.stemConnections.exposure.some(x=>
  x.hiddenId==='natal.month.hidden.丁'&&x.position==='month'&&
  x.exactVisibleMatches.some(y=>y.id==='natal.hour.stem'&&y.position==='hour'));
 if(!originalPair||laterPair||!oldExposure||newExposure)
  throw Error('QA_1994_TWO_HOURS_PAIR_OR_EXPOSURE_DRIFT');
 const laterText=LATER_PARAGRAPHS.join('\n\n');
 if(reader.errors(['같은 생일, 다른 시간에 달라지는 해석',
   laterText]).length||/[\u3400-\u9fff]/.test(laterText)||
   /(?:장비를 도입|봉투.{0,10}포장|여섯 달|실제로.{0,15}잘하는 사람)/.test(laterText))
  throw Error('QA_1994_TWO_HOURS_READER_COPY_NOT_APPROPRIATE');
 const early=Object.freeze({birthTime:'14:20',chart:{...first.chart},
  label:before.candidate.label,text:before.candidate.text,
  sourceRefs:refsEarly.slice()});
 const later=Object.freeze({birthTime:LATER,chart:{...second.chart},
  label:'같은 생일, 다른 시간에 달라지는 해석',text:laterText,
  sourceRefs:refsLater.slice()});
 if(early.text===later.text||later.text.length<500||
    !later.text.includes('둘 다 배움과 관계된 전통 분류')||
    !later.text.includes('두 가지 근거가 모두 사라집니다')||
    !later.text.includes('그대로 옮기면 안 됩니다'))
  throw Error('QA_1994_TWO_HOURS_EDITORIAL_VALUE_MISSING');
 return {
  kind:'two-full-authored-hour-contrasts-for-exact-1994-chart-v1',
  early,later,paragraphsPerVariant:3,
  verifiedChange:{
   birthYearMonthDayUnchanged:true,
   hourStemFrom:'丁',hourStemTo:'庚',
   hourRoleFrom:'정재',hourRoleTo:'편인',
   visibleWealthExposureAtEarlyHour:true,visibleWealthExposureAtLateHour:false,
   adjacentDayHourPairAtEarlyHour:true,adjacentDayHourPairAtLateHour:false,
   sameMonthMainMeaningRemains:true,
   relativeTraditionalPriority:'not-assessed',
   observedPersonalityOrIncome:false
  },
  paidWriterChanged:false,providerCalls:0,
  professionalReview:false,customerQualityApproved:false,
  releaseVerdict:'not-approved'
 };
}
module.exports={make,INPUT,EXPECTED,LATER_PARAGRAPHS};
