'use strict';
// Offline-only review of already generated first-chapter QA evidence.
// Never print names, birth details, source text or provider responses.
// No network access or model requests.
const fs=require('node:fs');
const reader=require('./report-reader-policy');
const factAudit=require('./report-first-chapter-fact-consistency').audit;
const file=process.argv[2];
if(!file){console.error('Usage: node review-existing-first-chapter.js <private-qa-first-chapter-validated-first-chapter.json>');process.exit(2)}
let evidence;
try{evidence=JSON.parse(fs.readFileSync(file,'utf8'))}catch(e){console.error('Unable to read checkpoint:',e.code||'INVALID_JSON');process.exit(2)}
if(!Array.isArray(evidence.batches)||evidence.batches.length!==1){console.error('INVALID_CHECKPOINT_BATCH_COUNT');process.exit(1)}
const batch=evidence.batches[0];
if(JSON.stringify(batch.ids)!==JSON.stringify(['saju_core'])||batch.completedSections!==1||batch.sections?.length!==1||batch.sections[0]?.id!=='saju_core'){
 console.error('INVALID_FIRST_CHAPTER_SCOPE');process.exit(1)
}
const section=batch.sections[0];
if(!Array.isArray(section.body)||!section.body.length||section.body.some(x=>typeof x!=='string'||!x.trim())){console.error('INVALID_FIRST_CHAPTER_BODY');process.exit(1)}
if(section.bodyLabels!=null&&(!Array.isArray(section.bodyLabels)||section.bodyLabels.length!==section.body.length)){console.error('INVALID_FIRST_CHAPTER_LABELS');process.exit(1)}
const strings=[section.title,section.keyJudgment,...(section.bodyLabels||[]),...section.body].filter(x=>typeof x==='string'&&x.trim());
const normalized=section.body.map(s=>s.replace(/\s+/g,' ').trim());
const duplicates=[...new Set(normalized.filter((x,i)=>normalized.indexOf(x)<i))];
const detected=reader.errors(strings).map(t=>t.replace(/^reader jargon:\s*/,''));
if(strings.some(s=>/뿌리\s*충/.test(s)))detected.push('뿌리 충');
const jargon=Object.fromEntries([...new Set(detected)].sort().map(term=>[term,strings.filter(field=>reader.errors([field]).some(x=>x.endsWith(term))||(term==='뿌리 충'&&/뿌리\s*충/.test(field))).length]));
const overhedge=normalized.filter(s=>(s.match(/수 있습니다|일 수 있습니다|일지도 모릅니다/g)||[]).length>=3).length;
const factual=factAudit(evidence);
const result={scope:'saju_core',offline:true,additionalApiCalls:0,releaseApproved:false,
 detectedReaderTextFields:strings.length,readerTextCharacters:strings.join('').length,
 exactDuplicateParagraphs:duplicates.length,jargonMentions:jargon,highHedgeParagraphs:overhedge,
 calendarFactPass:factual.calendarFactPass,calendarContradictionCount:factual.contradictionCount,
 calendarContradictionLocations:factual.contradictions,
 ambiguousMonthReferences:factual.ambiguousMonthReferences,
 needsManualDepthReview:factual.readerValueReviewFlags.manualDepthAssessmentRequired,
 calculationOnlyHeadline:factual.readerValueReviewFlags.calculationOnlyHeadline,
 limitations:'Structure and heuristic checks only. Human prose and factual audit still required.'};
console.log(JSON.stringify(result,null,2));
if(!strings.length)process.exitCode=3;
else if(duplicates.length||Object.keys(jargon).length||overhedge||!factual.calendarFactPass)process.exitCode=1;
