'use strict';
// Offline-only review of already generated first-chapter QA evidence.
// Never print names, birth details, source text or provider responses.
// No network access or model requests.
const fs=require('node:fs');
const file=process.argv[2];
if(!file){console.error('Usage: node review-existing-first-chapter.js <private-qa-first-chapter-validated-first-chapter.json>');process.exit(2)}
let evidence;
try{evidence=JSON.parse(fs.readFileSync(file,'utf8'))}catch(e){console.error('Unable to read checkpoint:',e.code||'INVALID_JSON');process.exit(2)}
if(!Array.isArray(evidence.batches)||evidence.batches.length!==1){console.error('INVALID_CHECKPOINT_BATCH_COUNT');process.exit(1)}
const batch=evidence.batches[0];
if(JSON.stringify(batch.ids)!==JSON.stringify(['saju_core'])||batch.sections?.length!==1){
 console.error('INVALID_FIRST_CHAPTER_SCOPE');process.exit(1)
}
const section=batch.sections[0];
const seen=new WeakSet();
function collect(x,out=[]){
 if(typeof x==='string'){if(x.trim().length>=25)out.push(x.trim());return out}
 if(!x||typeof x!=='object'||seen.has(x))return out;
 seen.add(x);
 for(const [k,v] of Object.entries(x)){
  // Only reader-facing, body-like fields; skip source/metadata/trace contents.
  if(/^(body|content|text|paragraphs|description|summary|interpretation|items|subsections|sections)$/i.test(k))collect(v,out);
  else if(Array.isArray(v)&&/^(paragraphs|items|subsections)$/i.test(k))collect(v,out);
 }
 return out;
}
const strings=collect(section);
const normalized=strings.map(s=>s.replace(/\s+/g,' ').trim());
const duplicates=[...new Set(normalized.filter((x,i)=>normalized.indexOf(x)<i))];
const terms=['원국','상관','편관','정관','식신','뿌리 충','지장간'];
const jargon=Object.fromEntries(terms.map(t=>[t,normalized.filter(s=>s.includes(t)).length]).filter(([,n])=>n));
const overhedge=normalized.filter(s=>(s.match(/수 있습니다|일 수 있습니다|일지도 모릅니다/g)||[]).length>=3).length;
const result={scope:'saju_core',offline:true,additionalApiCalls:0,releaseApproved:false,
 detectedReaderTextFields:strings.length,readerTextCharacters:strings.join('').length,
 exactDuplicateParagraphs:duplicates.length,jargonMentions:jargon,highHedgeParagraphs:overhedge,
 limitations:'Structure and heuristic checks only. Human prose and factual audit still required.'};
console.log(JSON.stringify(result,null,2));
if(!strings.length)process.exitCode=3;
