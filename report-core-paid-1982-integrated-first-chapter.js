'use strict';
// Two COMPLETE, human-readable first-chapter EDITORIAL candidates, each
// assembled from the same source-verified month baseline and a DISTINCT
// historical exact-day-hour clause. No paid-provider output is copied, no
// generic whole-chart claim is made, and nothing here unlocks production.
const facts=require('./report-facts-node');
const core=require('./report-core-knowledge-engine');
const gap=require('./report-core-paid-depth-gap-audit');
const hour=require('./report-core-paid-1982-standalone-day-hour-reader');
const evidence=require('./report-fact-bindings');
const policy=require('./report-reader-policy');
const BASE=hour.BASE;
const MONTH_LABEL='출생월에서 먼저 확인되는 두 가지 뜻';
const MONTH_TEXT='태어난 달의 겉글자는 낯선 정보를 자기 방식으로 이해하는 뜻으로, 달 안쪽의 대표 글자는 필요한 자원을 찾아 활용하는 뜻으로 읽힙니다. 두 자리에 적힌 뜻은 서로 다릅니다. 새로운 정보를 이해하는 것과 필요한 자원을 확보하는 것을 같은 능력으로 묶거나 둘 중 하나가 더 강하다고 단정할 수 없습니다. 지금까지의 풀이는 달의 두 위치가 각각 무엇을 상징하는지까지만 설명합니다. 실제로 어떤 능력이 뛰어나거나 어떤 일을 겪었는지를 관찰한 결과가 아닙니다.';
function build(packet){
 const extra=hour.build(packet);
 if(!extra)return null;
 const primary=core.compile(packet),paid=gap.reportOne(packet);
 const rows=Object.fromEntries(evidence.build(packet).map(x=>[x.id,x]));
 const main='natal.month.hidden.己';
 if(primary.status!=='draft-for-human-review'||
    primary.ruleId!=='month-pair-pyeonin-pyeonjae-v1'||
    primary.releaseVerdict!=='not-approved'||
    JSON.stringify(primary.scope.sourceIds)!==
      JSON.stringify(['natal.month.stem',main])||
    primary.scope.visibleTenGod!=='편인'||
    primary.scope.hiddenTenGod!=='편재'||
    rows['natal.month.stem']?.tenGod!=='편인'||
    rows[main]?.tenGod!=='편재'||
    rows['natal.month.stem']?.observedBehavior!==false||
    rows[main]?.observedBehavior!==false||
    paid.paidWholeChartGrounded!==false||
    paid.paidReceivesOfflineSynthesis!==false||
    !paid.paidCitableRefs.includes('natal.month.stem')||
    !paid.paidCitableRefs.includes(main)||
    extra.includedInPaidWriter!==false||extra.customerValueValidated!==false||
    extra.humanExpertReviewComplete!==false||extra.saleApproved!==false)
  throw Error('QA_INTEGRATED_FIRST_CHAPTER_SOURCE_OR_PAID_BOUNDARY_DRIFT');
 const monthRefs=['natal.month.stem',main];
 if(extra.exactDayHourReferences.some(id=>monthRefs.includes(id))||
    extra.exactDayHourReferences.some(id=>!id.startsWith('natal.')&&
      !['facts.seasonalEvidence'].includes(id))||
    !extra.exactDayHourReferences.includes('natal.hour.stem')||
    !extra.exactDayHourReferences.includes('natal.day.stem'))
  throw Error('QA_INTEGRATED_FIRST_CHAPTER_NOT_AN_INDEPENDENT_HOUR_SOURCE');
 const paragraphs=[
  {kind:'month-basis',label:MONTH_LABEL,text:MONTH_TEXT,
   refs:monthRefs,method:'traditional-symbol-meaning-not-personal-trait'},
  {kind:'exact-day-hour-classical-text',label:extra.label,text:extra.text,
   refs:extra.exactDayHourReferences.slice(),method:extra.source.sourceScope}
 ];
 const display=paragraphs.map(p=>p.label+'\n'+p.text).join('\n\n');
 if(policy.errors(paragraphs.flatMap(p=>[p.label,p.text])).length||
    /[\u3400-\u4dbf\u4e00-\u9fff]/.test(display)||
    /(?:동료|납품|준비물|기계 조작|새 프로젝트|가정해 보)/.test(display)||
    paragraphs.some(p=>p.text.length<200))
  throw Error('QA_INTEGRATED_FIRST_CHAPTER_NON_READER_TEXT');
 const allRefs=[...new Set(paragraphs.flatMap(p=>p.refs))];
 const chart=[packet.chart.year,packet.chart.month,
   packet.chart.day,packet.chart.hour].join('/');
 if(chart!==extra.chartFingerprint||
    allRefs.some(id=>id.startsWith('natal.')&&!rows[id]||
     id==='facts.seasonalEvidence'&&!packet.facts.seasonalEvidence))
  throw Error('QA_INTEGRATED_FIRST_CHAPTER_PROVENANCE_DRIFT');
 return {
  kind:'qa-composed-two-paragraph-first-chapter-for-human-review-v1',
  chartFingerprint:chart,sourceScope:extra.source.sourceScope,
  paragraphs,readerText:display,
  baseChapterMonthEvidence:monthRefs,
  actualPaidMonthEvidence:paid.paidCitableRefs.slice(),
  newlyIntroducedExactDayHourRefs:extra.exactDayHourReferences.slice(),
  extraTraditionalSource:{...extra.source},
  personalConclusionValidated:false,
  genre:'classical-textual-applicability-only',
  humanReviewDecisionsPending:['how-classical-source-fits-all-four-pillars',
   'whether-original-paid-first-chapter-repetition-is-reduced',
   'whether-reader-learns-meaningful-individual-interpretation'],
  comparedAgainstPrivateActualPaidOutput:false,
  readerValueApproved:false,methodProfessionallyApproved:false,
  normalPaidWriterUnchanged:true,checkoutEnabled:false,
  providerCalls:0,releaseVerdict:'not-approved'
 };
}
function compare(){
 const a=build(facts.build({...BASE,birthTime:'14:20'},2027));
 const z=build(facts.build({...BASE,birthTime:'20:20'},2027));
 if(!a||!z||
   JSON.stringify(a.paragraphs[0])!==JSON.stringify(z.paragraphs[0])||
   a.paragraphs[1].text===z.paragraphs[1].text||
   a.sourceScope===z.sourceScope||
   a.readerText===z.readerText||
   a.newlyIntroducedExactDayHourRefs.join('|')===
     a.baseChapterMonthEvidence.join('|')||
   z.readerText.includes('안온한 쪽으로')||
   a.readerText.includes('높은 지위를 언급합니다'))
  throw Error('QA_INTEGRATED_FIRST_CHAPTER_HOUR_COUNTERFACTUAL_COLLAPSE');
 return {kind:'qa-two-complete-first-chapters-source-limited-v1',
  cases:[a,z],sharedMonthParagraphVerified:true,
  separateDayHourHistoricalInterpretationVerified:true,
  differentPersonalityOrFuturePredicted:false,
  normalPaidWriterChanged:false,readyForCustomer:false,
  releaseVerdict:'not-approved',providerCalls:0};
}
function markdown(){
 const c=compare();
 const lines=['# 1982년 동일 생년월일 — 두 출생시간의 사주 첫 장 비교',
  '','**비판매·전문 검수 대기.** 각 원고는 출생월의 동일한 설명과 출생 일·시에 맞는 서로 다른 고전 문구를 연결한 연구용 첫 장입니다.',
  '','**주의:** 과거 실제 유료 AI 원문이 아닙니다. 기존 정상 유료 요청은 출생월 중심이며 본 문단들을 전달하지 않습니다.'];
 for(const [i,doc] of c.cases.entries()){
  lines.push('','## '+(i===0?'14:20':'20:20')+' / '+doc.chartFingerprint,'');
  for(const p of doc.paragraphs)lines.push('### '+p.label,'',p.text,'');
  lines.push('전통 고전 출전: '+doc.extraTraditionalSource.url+' — '+doc.extraTraditionalSource.chapter,'');
 }
 lines.push('## 별도 품질 판단','',
 '새로운 내용: 실제 출생일과 시간에 맞는 고전 구절의 범위는 출생월 풀이만으로 알 수 없습니다.',
 '아직 부족한 내용: 이 문구가 개인의 실제 삶에서 어떤 판단을 바꾸는지, 다른 출생 위치와 어떤 우선순위로 종합할지는 전문 검토가 필요합니다.',
 '판정: 전통 문헌 적용 범위는 구별됨 / 독립적 유료 품질 미입증 / 출시는 불가.');
 return lines.join('\n')+'\n';
}
module.exports={build,compare,markdown};
