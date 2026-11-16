'use strict';
// Compact, deterministic provenance ledger across premium chapters.
// Only source paths that appeared in the model's verified, restored paragraph
// basis are counted. A planned but skipped topic cannot own evidence.
function allowedPaths(task){
 if(!task||task.mode==='state-limits')return [];
 if(Array.isArray(task.allowedSourceRefs))return task.allowedSourceRefs;
 return (task.mode==='use-primary'?[task.primaryEvidencePath]:
  task.mode==='use-verified-fallback'?task.verifiedFallbackPaths||[]:[]).filter(Boolean);
}
function usedPaths(section,topic){
 // The restored evidence can carry more than one verified citation record
 // for the same topic. Reading only .find() silently lost later sources and
 // let the next paid chapter re-sell the missed conclusion.
 const prefix=topic+': ';
 const refs=new Set();
 for(const raw of section?.evidence||[]){
  if(typeof raw!=='string'||!raw.startsWith(prefix)||
     !raw.includes(' / 해석: '))continue;
  const portion=raw.slice(prefix.length).split(' / 해석: ')[0];
  for(const segment of portion.split(/;\s*/)){
   const id=segment.trim().split(/[ (]/,1)[0];
   if(/^(?:natal\.(?:year|month|day|hour)\.(?:stem|hidden\.[^\s;]+)|annual\.(?:stem|hidden\.[^\s;]+)|facts\.[a-zA-Z][\w.]*(?:\.[\w]+)*|fortune\.activeDecade|person\.mbti)$/.test(id))
    refs.add(id);
  }
 }
 return [...refs];
}
// Keep the actual earlier prose, not an editor-generated interpretation.
// For long paid paragraphs, preserve BOTH ends so a final substantive
// distinction is not silently dropped by .slice(0,240).
function priorConclusion(section,index){
 const body=section?.topicConclusions?.[index]||
  section?.body?.[index]||section?.keyJudgment||'';
 const value=String(body).replace(/\s+/g,' ').trim();
 if(value.length<=240)return value;
 return value.slice(0,127).trimEnd()+' … '+value.slice(-110).trimStart();
}
function reusedBefore(nextIds,blueprint,priorSections,packet){
 // When a real fact packet exists, use exactly the provider's permitted
 // sources; a broad plan path may represent one or more positional natal rows.
 const generator=packet?.facts?require('./report-generation-request'):null;
 const relevantIds=[...new Set([...nextIds,...(priorSections||[]).map(s=>s.id)])];
 const compiled=generator?.compile({stage:'body',facts:packet,requestedSections:relevantIds,
  analysisGuidance:{editorialBlueprint:blueprint}})||null;
 const candidates=(id,topic,task)=>{
  const defined=compiled?.task?.chapters?.[id]?.topics?.[topic];
  return defined? [...generator.allowedRefs(compiled,defined,id,topic)] : allowedPaths(task);
 };
 const needed=new Set(nextIds.flatMap(id=>Object.entries(blueprint[id]?.topicTasks||{})
  .flatMap(([topic,task])=>candidates(id,topic,task))));
 const result=[];
 for(const section of priorSections||[]){
  const tasks=blueprint[section.id]?.topicTasks||{};
  for(const [topic,task] of Object.entries(tasks)){
   const index=section.bodyTopics?.indexOf(topic)??-1;
   if(index<0)continue;
   const permitted=new Set(candidates(section.id,topic,task));
   const actual=usedPaths(section,topic);
   for(const path of actual){
    if(!permitted.has(path)||!needed.has(path))continue;
    result.push({path,chapter:section.id,topic,
     previousConclusion:priorConclusion(section,index)});
   }
  }
 }
 return result;
}
module.exports={allowedPaths,usedPaths,reusedBefore};
