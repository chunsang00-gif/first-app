'use strict';
// Re-check exactly ONE already-paid encrypted first-chapter ORIGINAL.
// No provider call, no text published to public GitHub logs. A lexical
// finding is NOT evidence of editorial quality or expert approval.
const fs=require('node:fs'),path=require('node:path');
const dir=process.argv[2];
const forbid=()=>{throw Error('ARCHIVED_PAID_QA_NETWORK_FORBIDDEN')};
global.fetch=forbid;
function reviewOne(){
 if(!dir||!path.isAbsolute(dir))throw Error('PRIVATE_ARCHIVE_DIRECTORY_REQUIRED');
 const location=path.join(dir,'private-qa-first-chapter-provider-calls.json');
 const original=JSON.parse(fs.readFileSync(location,'utf8'));
 const raw=original?.response;
 const sample=require('./qa-current-core-preflight').SAMPLE;
 const archived=original?.sample;
 if(original?.kind!=='private-first-chapter-original-provider-response'||
    original?.providerCalls!==1||
    JSON.stringify(archived)!==JSON.stringify(sample)||
    original?.requestHash!==
     require('./qa-current-core-one-shot').FROZEN_REQUEST_SHA256||
    original?.model!=='gpt-4.1'||
    raw?.chapters?.saju_core===undefined)
   throw Error('ARCHIVED_ORIGINAL_SOURCE_SCOPE_INCORRECT');
 const packet=require('./report-facts-node').build(sample,2027);
 if(packet.status!=='ready')throw Error('SAMPLE_CHART_NOT_READY');
 const chart=require('./report-chart-contrast').build(packet);
 const categories=[chart.monthTenGodContext.monthStem.tenGod,
  chart.monthTenGodContext.monthMainHidden.tenGod];
 if(JSON.stringify(categories)!=='["편인","편재"]')
   throw Error('ARCHIVED_MONTH_CATEGORY_UNEXPECTED');
 const generated=raw.chapters.saju_core;
 const main=String(generated.paragraphs?.strength?.text||'');
 const other=String(generated.paragraphs?.temperament?.text||'');
 const fixed=require('./report-core-thesis').forPrompt({
  stage:'body',facts:packet,requestedSections:['saju_core']});
 if(!main.trim()||generated.keyJudgment!==fixed.keyJudgment)
  throw Error('ARCHIVED_FIRST_CHAPTER_MANDATORY_TEXT_OR_THESIS_MISSING');
 const section={id:'saju_core',
  title:generated.title,keyJudgment:generated.keyJudgment,
  bodyTopics:other?['temperament','strength']:['strength'],
  bodyLabels:other?[generated.paragraphs.temperament.label,generated.paragraphs.strength.label]:
    [generated.paragraphs.strength.label],
  body:other?[other,main]:[main],evidence:[]};
 const judgement=require('./report-grounding-review').inspect({sections:[section]},packet);
 // Test the exact vocabulary families that the original check requires,
 // and BROADER, review-only alternatives. None automatically overrides
 // the real guard or approves a premium first chapter.
 const wordFamilies={
  편인:/(?:낯선\s*(?:내용|정보|자료)|정보를\s*(?:이해|해석)|자료를\s*해석|배움의\s*방식|자기\s*방식으로\s*(?:이해|읽)|다른\s*관점에서\s*이해|정보\s*이해|(?:새로운\s*)?정보를\s*(?:자기|자신)\s*나름대로\s*(?:해석|이해|파악))/,
  편재:/(?:필요한\s*자원|자원을\s*(?:찾|활용|확보)|자금|돈과\s*재료|재료를\s*마련|여러\s*곳에서|기회와\s*자원|자원\s*활용|여러\s*곳의\s*자원을\s*(?:파악|살피|찾).{0,28}(?:활용|사용|마련))/
 };
 const extraSignals={
  편인:/(?:새로운|낯선|모르는|처음).{0,32}(?:이해|해석|판단|풀어|읽어|익히)|(?:스스로|자기|자신|독자적).{0,35}(?:이해|해석|판단|익히|배우)/,
  편재:/(?:자원|기회|재료|물건|도구|예산|외부|바깥).{0,40}(?:활용|확보|찾|모으|조달|마련|연결)|(?:여러\s*곳|다른\s*곳).{0,30}(?:살피|활용|찾|고르)/
 };
 const tracked=Object.fromEntries(categories.map(key=>[key,{
   strictMain:wordFamilies[key].test(main),
   broadMain:extraSignals[key].test(main),
   strictOther:wordFamilies[key].test(other),
   strictJudgment:wordFamilies[key].test(String(generated.keyJudgment))
 }]));
 const sentences=main.split(/[.!?。！？\n]+/).map(s=>s.trim()).filter(Boolean);
 const clean=s=>String(s).replace(/[\s\p{P}\p{S}]/gu,'');
 const summary={
  kind:'archived-current-core-first-chapter-diagnostic-only',
  archiveRun:42369675176,
  originallyAttemptedModelCalls:1,additionalPaidCalls:0,
  mainCharacters:clean(main).length,mainSentences:sentences.length,
  optionalParagraphPresent:!!other.trim(),
  fixedThesisRepeatedInMain:main.includes(fixed.keyJudgment),
  categories,readerMeaningSignals:tracked,
  historicalPaidBlock:'saju_core:month-pair-meaning-missing-from-main-paragraph',
  currentGroundingBlocked:judgement.blockingErrors,
  oldLexicalFalseNegativeResolved:!judgement.blockingErrors.includes(
   'saju_core:month-pair-meaning-missing-from-main-paragraph'),
  result:'wording-matched-but-editorial-depth-not-approved',
  qualityApproved:false,releaseVerdict:'not-approved'
 };
 if(!summary.oldLexicalFalseNegativeResolved)
  throw Error('ARCHIVED_LEXICAL_FALSE_NEGATIVE_REMAINS');
 if(summary.mainCharacters<20)throw Error('ARCHIVED_FIRST_CHAPTER_TOO_SHORT_FOR_REVIEW');
 return summary;
}
try{
 const result=reviewOne();
 console.log('ARCHIVED_CURRENT_CORE_PAID_REPLAY='+JSON.stringify(result));
}catch(e){
 console.error('ARCHIVED_CURRENT_CORE_OFFLINE_REVIEW_FAILED:'+e.message);
 process.exitCode=1;
}
