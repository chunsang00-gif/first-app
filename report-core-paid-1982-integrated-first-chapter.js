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
const method=require('./report-core-paid-1982-question-scoped-method-decision');
const branches=require('./report-branch-relations');
const BASE=hour.BASE;
const MONTH_LABEL='같은 출생월에서 출발하는 두 뜻';
const MONTH_TEXT="태어난 달의 겉글자는 낯선 내용을 자신만의 방식으로 받아들이는 뜻이고, 달 안쪽에서 기준이 되는 글자는 필요한 물건이나 도움을 마련하는 뜻으로 나뉩니다. 두 뜻을 하나의 성격으로 합치면 무엇을 어떻게 이해하는지와 그 이해에 필요한 것을 어떻게 구하는지가 구별되지 않습니다. 이 차이는 출생월에 적힌 전통적 분류입니다. 따라서 여기까지는 달에서 서로 다른 뜻이 나온다는 사실을 설명할 뿐, 어느 뜻이 앞서는지는 태어난 날과 시간의 구성까지 살펴야 합니다.";
// Chart-scoped integration of an existing calculated month/day/hour contrast.
// These are source-limited research paragraphs, not customer-approved claims.
const HOUR_CONTEXT={
 '14:20':{
  label:'태어난 달의 뜻이 시간에도 반복되는 경우',
  hourRole:'편인',monthHourRelations:['충','형'],
  exposedAt:['natal.month.stem','natal.hour.stem'],
  text:"태어난 시간을 함께 보면 달의 겉글자와 시간의 겉글자에 같은 글자가 나타납니다. 달 안쪽의 다른 숨은 글자 하나가 겉으로 드러난 자리도 달과 시간, 두 곳입니다. 그러나 서로 다른 뜻이 둘 생긴 것은 아닙니다. 달과 날에는 맞서는 관계가 있으며 달과 시간 사이에도 맞서는 관계와 다른 관계가 함께 기록됩니다. 같은 관계표의 이름이 둘 있다고 사건이 두 번 일어난다는 뜻은 아닙니다. 이 시간의 특징은 달에 있던 뜻의 반복과 달·시간 연결이 함께 확인된다는 점입니다."
 },
 '20:20':{
  label:'태어난 달과 시간에 서로 다른 뜻이 나타나는 경우',
  hourRole:'상관',monthHourRelations:['형'],
  exposedAt:['natal.month.stem'],
  text:"태어난 시간을 함께 보면 달의 겉글자와 달리 시간의 겉글자는 생각을 밖으로 표현하는 뜻으로 분류됩니다. 출생월 안쪽의 숨은 글자 가운데 이와 같은 글자가 겉으로 드러난 자리는 달 한 곳이며, 시간에서는 별개의 뜻이 나타납니다. 달과 날 사이의 맞서는 관계는 그대로 있지만 달과 시간 사이에는 같은 맞서는 관계가 없고 별도의 관계 이름만 기록됩니다. 출생시각의 차이는 의미의 종류와 자리 사이 관계를 바꾸지만 태어난 달과 날까지 바꾸지는 않습니다."
 }
};
function calculatedHourContext(packet,rows){
 const spec=HOUR_CONTEXT[packet.calculationInput?.birthTime];
 const choice=method.inspect(packet);
 if(!spec||!choice)return null;
 const hour=rows['natal.hour.stem'],month=rows['natal.month.stem'];
 const hidden=rows['natal.month.hidden.癸'];
 const chartRelations=branches.natal(packet.chart);
 const types=(x,y)=>chartRelations.pairs.filter(p=>
  p.positions.includes(x)&&p.positions.includes(y)).map(p=>p.type);
 if(JSON.stringify(chartRelations)!==
      JSON.stringify(packet.facts?.natalBranchRelations)||
    !types('month','day').includes('충')||
    JSON.stringify(types('month','hour'))!==JSON.stringify(spec.monthHourRelations)||
    month?.stem!=='癸'||month?.tenGod!=='편인'||
    hidden?.stem!=='癸'||hidden?.tenGod!=='편인'||
    hour?.stem!==packet.chart.hour[0]||hour?.tenGod!==spec.hourRole||
    JSON.stringify(choice.candidateExposurePositions)!==JSON.stringify(spec.exposedAt)||
    choice.traditionalFullChartPatternSelected!==false||
    choice.approvedForSale!==false)
  throw Error('QA_INTEGRATED_FIRST_CHAPTER_HOUR_CONTEXT_UNVERIFIED');
 return {kind:'verified-month-day-hour-positional-context',label:spec.label,
  text:spec.text,refs:['natal.month.stem','natal.month.hidden.癸',
   'natal.hour.stem','facts.natalBranchRelations'],
  method:'verified-symbol-and-position-table-only-no-life-outcome'};
}
// The historical passages remain the validated source in the standalone
// reader. This abbreviated editorial copy is restricted to those same exact
// source conditions, never passed to the paid writer or used as a life claim.
const CLASSICAL_COPY={
 '14:20':{
  scope:'exact-day-hour-with-winter-subclause',
  excerpt:'안온한 쪽으로 풀이합니다',
  label:'태어난 날과 시간에 해당하는 고전의 겨울 풀이',
  text:"태어난 날과 시간이 맞는 옛 사주책의 구절에는 겨울에 태어난 경우를 안온한 쪽으로 읽는 설명이 있습니다. 이는 출생월의 분류만으로 고를 수 없고 정확한 날과 시간, 계절 조건이 함께 맞아야 인용할 수 있는 문장입니다. 앞서 확인한 달과 날·시간의 관계까지 어느 순서로 종합할지는 아직 판단되지 않았습니다. 여기서 '안온'은 고전이 붙인 전통적 표현이지, 본인이 실제로 평온한 성격이거나 앞으로 어려움이 없을 거라는 예측이 아닙니다."
 },
 '20:20':{
  scope:'exact-day-hour-with-ambiguous-year-month-clause',
  excerpt:'해에 있는 글자는 그 목록에 있지만',
  label:'해와 달의 조건을 확인해야 하는 고전 풀이',
  text:"태어난 날과 시간에 해당하는 별도의 옛 사주책 구절에는 특정 해와 달의 조건에 따라 높은 지위를 언급하는 대목이 있습니다. 해에 있는 글자는 그 목록에 있지만 달에 있는 글자는 목록에 없습니다. 그 문구가 해와 달의 조건을 어떤 방식으로 묶는지도 아직 해결되지 않아 좋은 결과가 나온다고 읽을 수 없습니다. 앞서 확인한 시간의 다른 분류와 달·시간 관계만으로 그 조건을 채웠다고 할 수도 없습니다. 따라서 이 구절은 해당 출생 기록에서 찾아볼 고전 문장이지, 실제 직업이나 지위, 미래를 예측한 결과가 아닙니다."
 }
};
function verifiedClassicalCopy(packet,extra){
 const spec=CLASSICAL_COPY[packet.calculationInput?.birthTime];
 if(!spec||extra.source.sourceScope!==spec.scope||
    !extra.text.includes(spec.excerpt)||
    extra.humanExpertReviewComplete!==false||
    extra.customerValueValidated!==false||
    extra.includedInPaidWriter!==false||
    extra.saleApproved!==false)
  throw Error('QA_INTEGRATED_FIRST_CHAPTER_CLASSICAL_EDITORIAL_SOURCE_DRIFT');
 return {kind:'exact-day-hour-classical-text',label:spec.label,text:spec.text,
  refs:extra.exactDayHourReferences.slice(),method:extra.source.sourceScope};
}
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
 // The later-hour verse itself has a year/month qualifier. Those cited
 // source positions may overlap the month baseline; the independent
 // DAY+HOUR pair must be NEW, not all possible cited positions.
 if(extra.exactDayHourReferences.some(id=>!id.startsWith('natal.')&&
      !['facts.seasonalEvidence'].includes(id))||
    !extra.exactDayHourReferences.includes('natal.hour.stem')||
    !extra.exactDayHourReferences.includes('natal.day.stem'))
  throw Error('QA_INTEGRATED_FIRST_CHAPTER_NOT_AN_INDEPENDENT_HOUR_SOURCE');
 const hourContext=calculatedHourContext(packet,rows);
 if(!hourContext)throw Error('QA_INTEGRATED_FIRST_CHAPTER_HOUR_CONTEXT_MISSING');
 // Begin with the shared month meaning, then the time-sensitive
 // structure, and conclude with the exact historical source boundary.
 const paragraphs=[
  {kind:'month-basis',label:MONTH_LABEL,text:MONTH_TEXT,
   refs:monthRefs,method:'traditional-symbol-meaning-not-personal-trait'},
  hourContext,
  verifiedClassicalCopy(packet,extra)
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
  kind:'qa-composed-three-paragraph-first-chapter-for-human-review-v1',
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
   a.paragraphs[2].text===z.paragraphs[2].text||
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
  verifiedPositionAndRoleContrastIncluded:true,
  oneSourceScopedEditorialCaveatAtEnd:true,
  differentPersonalityOrFuturePredicted:false,
  normalPaidWriterChanged:false,readyForCustomer:false,
  releaseVerdict:'not-approved',providerCalls:0};
}
function markdown(){
 const c=compare();
 const lines=['# 1982년 동일 생년월일 — 두 출생시간의 사주 첫 장 비교',
  '','**비판매·전문 검수 대기.** 각 원고는 출생월 설명에서 출발해 시간에 따른 관계 차이를 읽고, 해당 날과 시간의 고전 구절로 마무리하는 연구용 첫 장입니다.',
  '','**주의:** 과거 실제 유료 AI 원문이 아닙니다. 기존 정상 유료 요청은 출생월 중심이며 본 문단들을 전달하지 않습니다.'];
 for(const [i,doc] of c.cases.entries()){
  lines.push('','## '+(i===0?'14:20':'20:20')+' / '+doc.chartFingerprint,'');
  for(const p of doc.paragraphs)lines.push('### '+p.label,'',p.text,'');
  lines.push('전통 고전 출전: '+doc.extraTraditionalSource.url+' — '+doc.extraTraditionalSource.chapter,'');
 }
 lines.push('## 별도 품질 판단','',
 '새로운 내용: 실제 출생일과 시간에 맞는 고전 구절의 범위는 출생월 풀이만으로 알 수 없습니다.',
 '아직 부족한 내용: 이 문구가 개인의 실제 삶에서 어떤 판단을 바꾸는지, 다른 출생 위치와 어떤 우선순위로 종합할지는 전문 검토가 필요합니다.',
 '판정: 전통 문헌 적용 범위는 구별됨 / 독립적 유료 품질 미입증 / 출시 불가.');
 return lines.join('\n')+'\n';
}
module.exports={build,compare,markdown};
