'use strict';
// QA6 editorial VALUE comparison — zero-cost synthetic specimen only.
// Do not confuse technically valid citations with a good paid interpretation.
// Findings are evidence-based editorial prompts, not a semantic truth model.
const qa6=require('./report-qa6-required-research-slot');
const writer=require('./report-generation-request');
const method=require('./report-qa3-classical-open-prose-audit');
const reader=require('./report-reader-policy');
const {overlap}=require('./report-core-paid-natal-depth-response-gate');
function describe(paragraph,monthText=''){
 const text=String(paragraph?.text||'');
 const label=String(paragraph?.label||'');
 const lines=method.sentences(text);
 const contains=(re)=>re.test(text);
 const concreteIllustration=contains(/(?:예를 들어|상황을 가정|선택을 생각)/)&&
   contains(/(?:장비|부품|재고|검수|납품|예산|승인|시간과 인력|취미\\s*수업|정기\\s*수업|정기\\s*구독)/);
 const classicalSourceContext=contains(/(?:삼명통회|三命通會)/)&&
   contains(/(?:자평진전|子平真詮)/);
 const changedHourCounterexample=contains(/(?:오후 8시 20분|20:20)/)&&
   contains(/(?:바뀌|달라)/)&&contains(/(?:적용할 수 없|짝을 더는|짝을 적용할 수 없)/);
 const chartHourAndMonth=contains(/(?:태어난 시간|출생시간|시간의 윗글자)/)&&
   contains(/(?:태어난 달|출생월|달 속)/);
 const limitations=lines.filter(x=>
   /(?:단정할 수 없|확인할 수 없|검증된 상태는 아니|아직 결정할 수 없|아닙니다|것은 아닙니다|실제로 바뀐 것은 아니|확정할 수 없|확정하지)/.test(x)).length;
 const statements=lines.filter(x=>
   /(?:전통|고전|문헌|윗글자|한 쌍|분류|계산|규칙|출생정보|이 기록)/.test(x)).length;
 return {
  textCharacters:text.length,numberOfSentences:lines.length,
  groundingChartSpecific:chartHourAndMonth,
  twoClassicalSourcesDiscussed:classicalSourceContext,
  changedHourCounterexample,
  containsConcreteIllustration:concreteIllustration,
  illustrationIsVerifiedPersonalBehavior:false,
  limitationSentenceCount:limitations,
  techniqueSentenceCount:statements,
  techniqueSentenceShare:lines.length?Number((statements/lines.length).toFixed(3)):0,
  monthTextOverlap:Number(overlap(text,monthText).toFixed(3)),
  visibleReaderJargonCount:reader.errors([label,text]).length,
  independentMeaningProven:false,
  individualLifePatternProven:false
 };
}
function compare(prompt,oldParagraph,newParagraph,monthText=''){
 if(!qa6.enabled(prompt))throw Error('QA6_READER_VALUE_OFFLINE_ONLY');
 const payload=writer.compile(prompt);
 qa6.requireVerified(prompt,payload);
 const previous=describe(oldParagraph,monthText);
 const revised=describe(newParagraph,monthText);
 const findings=[];
 // Fixed, narrow lexical cues are *triage*, never reliable quality scores.
 if(!revised.groundingChartSpecific)
  findings.push('QA6_VALUE_NEW_BIRTH_POSITION_UNCLEAR');
 if(!revised.twoClassicalSourcesDiscussed)
  findings.push('QA6_VALUE_CLASSICAL_SCOPE_UNCLEAR');
 if(!revised.changedHourCounterexample)
  findings.push('QA6_VALUE_CHANGED_HOUR_SCOPE_UNCLEAR');
 if(!revised.containsConcreteIllustration)
  findings.push('QA6_VALUE_NO_READER_APPLIED_EXAMPLE');
 if(revised.techniqueSentenceShare>=0.6)
  findings.push('QA6_VALUE_MOSTLY_METHODOLOGY_NOT_READER_INTERPRETATION');
 if(revised.limitationSentenceCount>=3)
  findings.push('QA6_VALUE_MANY_LIMITATIONS_REQUIRE_EDITORIAL_BALANCE');
 if(revised.visibleReaderJargonCount>0)
  findings.push('QA6_VALUE_EXPLICIT_READER_JARGON');
 if(!newParagraph?.text?.trim()||newParagraph.text.trim().length<220)
  findings.push('QA6_VALUE_TRIVIAL_OR_EMPTY_TEXT');
 const changes={
  narrowerHistoricalSourceScope:!previous.twoClassicalSourcesDiscussed&&
   revised.twoClassicalSourcesDiscussed,
  distinctBirthHourCounterexample:!previous.changedHourCounterexample&&
   revised.changedHourCounterexample,
  removedConcreteApplication:previous.containsConcreteIllustration&&
   !revised.containsConcreteIllustration,
  lifeInterpretationStillNotEstablished:true
 };
 // Even an illustrated, grammatically clean sample does not prove life value
 // or authentic traditional interpretation. Expert/human release gates stand.
 return {
  kind:'qa6-synthetic-first-chapter-reader-value-comparison-v1',
  prior:previous,revision:revised,
  changes,editorialFindings:findings,
  editorialQuestionsForHumanReview:[
   '어떤 새 출생 근거가 기존 월 중심 풀이에 없던 판단을 추가하는가?',
   '고전의 계산 사실과 실제 삶에 대한 가정은 어디서 분리되는가?',
   '독자가 얻는 구체적이고 차별적인 판단은 단순 계산 설명을 넘는가?',
   '예시가 사주에서 검증되지 않은 특정 직업·행동을 지어내지는 않는가?',
   '금전·직업·성격의 새 해석이 독립 근거와 실제 논리로 연결되는가?',
   '선택한 고전 방법의 우선순위와 출생시간 변경 반례가 명확한가?'
  ],
  lexicalHeuristicsAreNotSemanticProof:true,
  chartSpecificEvidenceDoesNotEstablishIndividualBehaviour:true,
  independentClassicalMethodApproved:false,
  readerValueHumanApproved:false,
  providerCalls:0,customerReady:false,canSell:false,
  releaseVerdict:'not-approved'
 };
}
module.exports={describe,compare};
