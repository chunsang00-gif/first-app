'use strict';
// One reviewable, offline method-selection handoff from the EXISTING
// calculation and prior classical research. NEVER a paid writer instruction,
// model request, customer manuscript, or human specialist's approval.
const facts=require('./report-facts-node');
const guidance=require('./report-analysis-guidance');
const writer=require('./report-generation-request');
const month=require('./report-core-paid-natal-month-method-review');
const classical=require('./report-core-paid-natal-classical-method-applicability');
const yin=require('./report-core-paid-natal-classical-yin-example');
const hour1982=require('./report-core-paid-1982-question-scoped-method-decision');
const bindings=require('./report-fact-bindings');
const EXAMPLES=Object.freeze([
 {id:'yi-chou-guiwei-exact-hour',input:{calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,birthTime:'14:20',gender:'male',mbti:'ISFP'}},
 {id:'yi-chou-bingxu-counterfactual-hour',input:{calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,birthTime:'20:20',gender:'male',mbti:'ISFP'}},
 {id:'xin-yin-bing-only-reference',input:{calendar:'solar',birthDate:'1989-02-10',birthTime:'14:20',gender:'male',mbti:'ISFP'}},
 {id:'xin-yin-jia-bing-both-reference',input:{calendar:'solar',birthDate:'2024-02-17',birthTime:'14:20',gender:'male',mbti:'ISFP'}},
 {id:'different-month-hour-additional-role',input:{calendar:'solar',birthDate:'1994-07-15',birthTime:'14:20',gender:'male',mbti:'ISFP'}}
]);
const DECISIONS=Object.freeze([
 {id:'classical-rule-scope',question:'고전 문구의 정확한 출전, 일·시·월 조건과 적용되지 않는 반례가 맞는가?',requires:'원문 대조 및 조건별 인용 승인'},
 {id:'month-method-and-competing-rules',question:'월의 중심 숨은 글자, 다른 겉노출, 다른 관계표가 겹칠 때 어떤 전통적 방법을 적용하며 왜 그런가?',requires:'선택한 학파의 우선순위 근거와 경쟁 규칙 검토'},
 {id:'independent-reader-conclusion',question:'출생월 기본 해석에는 없는 새 전통적 결론을 하나라도 이 사례에서 도출할 수 있는가?',requires:'새 명리 주장·그 주장만의 근거·반례에 따른 문장 변화'},
 {id:'independent-editorial-value',question:'기술 설명이나 가상의 직장 이야기 없이 실제 독자에게 더 구체적이고 중복 없는 해석인가?',requires:'대조 원고 실독과 독립 평가'}
]);
function build(){
 const cases=EXAMPLES.map(item=>{
  const packet=facts.build(item.input,2027);
  if(packet.status!=='ready'||!packet.chart?.hour)
   throw Error('METHOD_HANDOFF_INVALID_EXISTING_FIXTURE:'+item.id);
  const blueprint=guidance.preflight(packet);
  const prompt={stage:'body',facts:packet,requestedSections:['saju_core'],
   analysisGuidance:{...guidance.forRequest(['saju_core'],item.input.mbti),
    editorialBlueprint:{saju_core:blueprint.saju_core}}};
  const paid=writer.compile(prompt);
  const paidTopic=paid.task.chapters.saju_core.topics;
  const paidRefs=[...new Set(Object.values(paidTopic)
   .flatMap(x=>x.citableFacts.map(v=>v.id)))];
  if(paidRefs.some(x=>/^natal\.(?:year|day|hour)\./.test(x))||
     paidTopic.natal_depth||Object.hasOwn(paid.source,'facts.stemConnections'))
   throw Error('METHOD_HANDOFF_PAID_SCOPE_SILENTLY_EXPANDED:'+item.id);
  const m=month.assess(packet);
  const c=classical.evaluate(packet);
  const y=yin.inspect(packet);
  const narrow=hour1982.inspect(packet);
  const source=Object.fromEntries(bindings.build(packet).map(x=>[x.id,x]));
  const allNatal=['year','month','day','hour'].map(pos=>{
   const id='natal.'+pos+'.stem',row=source[id];
   if(!row||row.stem!==packet.chart[pos][0]||!row.tenGod)
    throw Error('METHOD_HANDOFF_NATAL_PROVENANCE_INVALID:'+id);
   return {sourceId:id,position:pos,stem:row.stem,traditionalCategory:row.tenGod};
  });
  const hourRule=narrow?.appliedQuestionOrder?.[0]||null;
  const single=y.singleExposureTextualChange.scopeMatched===true;
  const dual=y.dualExposureTextualPriority.scopeMatched===true;
  if(single&&dual)throw Error('METHOD_HANDOFF_INCOMPATIBLE_EXACT_CLASSICAL_CASES');
  const exactTextualCondition=narrow?hourRule.selectedCitationScope:
   single?'xin-yin-bing-only-not-jia':
   dual?'xin-yin-jia-plus-bing':'no-exact-classical-case';
  const sources=narrow?[narrow.generalHourSymbolicRelation?.sourceUrl||
   'https://zh.wikisource.org/zh-hant/%E4%B8%89%E5%91%BD%E9%80%9A%E6%9C%83/%E5%8D%B7%E5%85%AB',
   c.sourceDocuments[0].url]:
   single||dual?[c.sourceDocuments[0].url]:[];
  if(c.readyForCustomer!==false||c.professionReviewed!==false||
     c.finalPatternSelected!==false||m.canApproveDeepSajuInterpretation!==false||
     narrow?.eligibleForPaidWriter===true)
   throw Error('METHOD_HANDOFF_UNAPPROVED_CLAIM_PROMOTED:'+item.id);
  return {
   id:item.id,chart:[packet.chart.year,packet.chart.month,
    packet.chart.day,packet.chart.hour].join('/'),
   traditionalPositionRows:allNatal,
   livePaidSourceRefs:paidRefs,
   livePaidStillMonthOnly:true,
   monthExposureCategory:m.observed.exactExposureScopeComparison
    .nonDayExposedHiddenStemIds.length===0?'no-non-day-exposed-month-hidden':
    m.observed.exactExposureScopeComparison.nonDayExposedHiddenStemIds.length===1?
     'one-non-day-exposed-month-hidden':'multiple-competing-month-hidden',
   independentMonthCandidates:m.observed.exactExposureScopeComparison
    .nonDayExposedHiddenStemIds.slice(),
   monthMain:m.observed.mainHiddenStemSourceId,
   exactTextualCondition,sourceUrls:[...new Set(sources)],
   cannotApplyOtherHourWinterRule:narrow?.birthTime==='20:20',
   comparableExactTextUnapproved:Boolean(narrow||single||dual),
   methodPrioritySelected:false,readerBenefitIndependentlyApproved:false,
   actualPersonalLifeConclusionsVerified:false,
   paidModelCalls:0,readyForPaidWriter:false
  };
 });
 const earlier=cases[0],later=cases[1],single=cases[2],dual=cases[3];
 if(earlier.chart.split('/').slice(0,3).join('/')!==
    later.chart.split('/').slice(0,3).join('/')||
    earlier.chart===later.chart||
    earlier.exactTextualCondition===later.exactTextualCondition||
    !later.cannotApplyOtherHourWinterRule||
    single.exactTextualCondition!=='xin-yin-bing-only-not-jia'||
    dual.exactTextualCondition!=='xin-yin-jia-plus-bing')
  throw Error('METHOD_HANDOFF_COUNTEREXAMPLES_NOT_DISTINGUISHED');
 return {
  kind:'first-chapter-method-decision-handoff-v1',
  status:'ready-for-expert-method-review-not-ready-for-sale',
  cases,decisionQuestions:DECISIONS,
  oneUnresolvedDecision:'independent, source-supported traditional method before adding full-chart conclusions to paid writing',
  baselineCaseCount:EXAMPLES.length,
  independentMethodApproved:false,readerValueApproved:false,
  canChangeOrdinaryPaidWriter:false,canChangePrice:false,
  canEnableCheckout:false,providerCalls:0,releaseVerdict:'not-approved'
 };
}
function markdown(doc){
 if(doc?.kind!=='first-chapter-method-decision-handoff-v1'||doc.releaseVerdict!=='not-approved'||
    doc.canChangeOrdinaryPaidWriter!==false)
  throw Error('METHOD_HANDOFF_NOT_A_REVIEW_DOC');
 const lines=[
  '# 유료 사주 첫 장 — 전통 해석방법 검토용 인수인계',
  '',
  '**상태: 판매 미승인 / 운영 유료 원고 미변경 / 추가 AI 과금 없음.**',
  '',
  '현재 실제 유료 첫 장은 출생월의 두 계산 위치만 해석합니다. 아래 연·일·시 자료는 고전 조건 적용 가능성을 점검하는 비판매용 검토 대상입니다.',
  '',
  '| 검토 사례 | 원국 네 기둥 | 정확한 문헌 조건 | 기본 장 밖의 자료 |',
  '| --- | --- | --- | --- |',
  ...doc.cases.map(x=>'| '+x.id+' | '+x.chart+' | '+x.exactTextualCondition+
   ' | '+x.monthExposureCategory+' |'),
  '',
  '## 사람의 독립 검토가 필요한 결정',
  ...doc.decisionQuestions.map((x,i)=>(i+1)+'. **'+x.question+'** — 완료 증거: '+x.requires),
  '',
  '## 반례와 필수 경계',
  '- 첫 두 명식은 태어난 해·달·날은 같고 시간만 다릅니다. 乙未日癸未時의 겨울 문구를 丙戌時 원고에 복사할 수 없습니다.',
  '- 辛日寅月에서 丙만 겉에 드러난 경우와 甲·丙이 함께 드러난 경우는 고전의 서로 다른 사례로 대조해야 합니다.',
  '- 정확한 글자 대응은 격국·용신·사령·우선순위 선택이나 실생활 성격·직장·수입·건강·미래에 대한 결론이 아닙니다.',
  '- 실제 과거 유료 첫 장 및 기존 심화 초안의 독자 가치 불합격 판정은 이 자료로 뒤집히지 않습니다.',
  '',
  '## 다음 작업 허용 조건',
  '전통적 방법의 원문 근거·반례·해석 차이와 실제 독자용 문장에 대한 독립 검토가 끝나기 전에는 연·일·시 주장을 일반 유료 생성 코드에 포함하거나 가격·결제·출시 상태를 바꾸지 않습니다.'
 ];
 return lines.join('\n')+'\n';
}
module.exports={build,markdown,EXAMPLES,DECISIONS};
