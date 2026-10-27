'use strict';
// Analyze an ALREADY PAID, privately decrypted first-chapter V2 response.
// Safe aggregate/diagnostic codes only. NEVER print birth data, names,
// original evidence values, report prose, secrets, or JSON response.
const fs=require('node:fs'),path=require('node:path');
const readiness=require('./report-paid-core-v2-billable-readiness');
const writer=require('./report-generation-request');
const reader=require('./report-reader-policy');
const review=require('./report-paid-core-depth-v2-reader-review');
const grounding=require('./report-grounding-review');
const {overlap}=require('./report-core-paid-natal-depth-response-gate');
const HASH='32d17dbc7377d751f91adfe2de2a85d502d450e32897e9728b43a3b1e0ce442e';
const OUTPUT='private-qa-first-chapter.json';
const PROVIDER='private-qa-first-chapter-provider-calls.json';
const CHECKPOINT='private-qa-first-chapter-validated-first-chapter.json';
const get=(dir,name)=>JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'));
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
const count=(s,pattern)=>[...String(s||'').matchAll(pattern)].length;
function sentences(s){return String(s||'').split(/[.!?。！？\n]+/).map(clean).filter(Boolean);}
async function inspect(dir){
 const current=await readiness.prepare({includePrompt:true});
 if(current.requestHash!==HASH||current.prompt?.paidCoreDepthV2!==true)
  throw Error('ARCHIVED_V2_FROZEN_PROMPT_DIFFERENT_NO_INSPECTION');
 const summary=get(dir,OUTPUT),record=get(dir,PROVIDER),checkpoint=get(dir,CHECKPOINT);
 if(record.kind!=='core-v2-one-shot'||record.providerCalls!==1||
    record.requestHash!==HASH||summary.requestHash!==HASH||
    checkpoint.requestHash!==HASH||summary.providerCalls!==1||
    checkpoint.providerCalls!==1||summary.releaseVerdict!=='not-approved')
  throw Error('ARCHIVED_V2_PROVIDER_OR_CHECKPOINT_INTEGRITY');
 const original=record.response;
 const core=original?.chapters?.saju_core,paragraphs=core?.paragraphs;
 if(!paragraphs||!Object.hasOwn(paragraphs,'strength')||
    !Object.hasOwn(paragraphs,'temperament')||
    original?.chapters&&Object.keys(original.chapters).length!==1)
  throw Error('ARCHIVED_V2_FIRST_CHAPTER_SHAPE_UNEXPECTED');
 const topicKeys=Object.keys(paragraphs);
 if(JSON.stringify(topicKeys)!=='["temperament","strength"]')
  throw Error('ARCHIVED_V2_WRONG_RESPONSE_SLOTS');
 const extra=paragraphs.temperament,strength=paragraphs.strength;
 const prompt=current.prompt;
 const spec=writer.compile(prompt);
 const extraScope=spec.task.chapters.saju_core.topics.temperament.paidCoreDepthV2;
 const body=checkpoint.sections?.[0];
 if(checkpoint.sections.length!==1||body.id!=='saju_core')
  throw Error('ARCHIVED_V2_READER_CHECKPOINT_INVALID');
 const expectedTitles=body.bodyTopics||[];
 const extraShown=!!extra;
 if(extraShown!==expectedTitles.includes('temperament')||
    summary.extraReaderParagraph!==extraShown||
    checkpoint.hasAdditionalReaderParagraph!==extraShown)
  throw Error('ARCHIVED_V2_MODEL_AND_READER_DISAGREE');
 const validRefs=(topic,p)=>{
  const citations=p?.basis?.refs||[];
  const allowed=new Set(spec.task.chapters.saju_core.topics[topic]?.citableFacts.map(x=>x.id));
  return {count:citations.length,unknown:citations.filter(x=>!allowed.has(x)).length};
 };
 const mainCitations=validRefs('strength',strength);
 const extraCitations=extra?validRefs('temperament',extra):{count:0,unknown:0};
 const jargon=reader.errors([core.title,core.keyJudgment,
  strength?.label,strength?.text,extra?.label,extra?.text]);
 const extraGuard=review.inspect(extra,strength?.text,extraScope);
 const reviewResult=grounding.inspect({sections:checkpoint.sections},prompt.facts);
 const extraSentences=sentences(extra?.text),mainSentences=sentences(strength?.text);
 const disclaimers=/(?:알\s*수\s*없|확인할\s*수\s*없|단정(?:하|할)|보장하지|입증(?:되|하지)|확정(?:하|할))/;
 let duplicates=0;
 for(let i=0;i<extraSentences.length;i++)
  for(let j=i+1;j<extraSentences.length;j++)
   if(extraSentences[i].length>=26&&
      extraSentences[j].length>=26&&
      overlap(extraSentences[i],extraSentences[j])>=0.8)duplicates++;
 const result={
  kind:'already-paid-v2-first-chapter-offline-text-quality-diagnostic',
  originalRun:40454885372,providerCallsInOriginalRun:1,
  newProviderCalls:0,storedFirstChapter:true,
  requiredParagraphCount:strength?1:0,
  optionalDepthPresent:extraShown,
  visibleParagraphCount:expectedTitles.length,
  monthCoreChars:String(strength?.text||'').length,
  optionalDepthChars:String(extra?.text||'').length,
  optionalDepthSentences:extraSentences.length,
  optionalDepthPositionMentions:{
   year:/(?:태어난\s*해|태어난\s*연도)/.test(extra?.text||''),
   day:/(?:태어난\s*날|태어난\s*날짜)/.test(extra?.text||''),
   hour:/(?:태어난\s*시간|출생\s*시간)/.test(extra?.text||'')},
  mainEvidence:mainCitations,extraEvidence:extraCitations,
  detectedJargonCount:jargon.length,
  optionalDepthInternalNearDuplicates:duplicates,
  caveatSentenceCount:extraSentences.filter(s=>disclaimers.test(s)).length,
  genericChecklistPhrases:count(extra?.text,/(?:체크리스트|정리해야|살펴봐야|확인해야|준비해야)/g),
  generatedFirstChapterBodyOnly:true,
  extraMonthCoreTextOverlap:extra?Number(overlap(extra.text,strength?.text).toFixed(3)):null,
  readerGuardCodes:extraGuard,
  groundingBlockingCodes:reviewResult.blockingErrors,
  groundingFindingCodes:reviewResult.findings.map(x=>
    typeof x==='string'?x:x?.code||x?.id||'other'),
  // Passing machine checks cannot determine whether this is worth money.
  humanEditorialValueValidated:false,
  remainingHumanReview:'pending',
  releaseVerdict:'not-approved'
 };
 if(result.mainEvidence.unknown||result.extraEvidence.unknown||
    result.readerGuardCodes.length||result.detectedJargonCount||
    result.groundingBlockingCodes.length)
  result.technicalQualityFlagsPresent=true;
 else result.technicalQualityFlagsPresent=false;
 return result;
}
if(require.main===module){
 inspect(process.argv[2]).then(x=>console.log('ARCHIVED_V2_PAID_FIRST_CHAPTER_QUALITY='+JSON.stringify(x)))
 .catch(e=>{console.error('ARCHIVED_V2_DIAGNOSTIC_FAILED:'+e.message);process.exitCode=1;});
}
module.exports={inspect};