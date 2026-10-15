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
 const prefix=topic+': ';
 const raw=(section?.evidence||[]).find(s=>typeof s==='string'&&s.startsWith(prefix));
 if(!raw||!raw.includes(' / 해석: '))return [];
 const portion=raw.slice(prefix.length).split(' / 해석: ')[0];
 return [...new Set(portion.split('; ').map(segment=>segment.trim().split(/[ (]/,1)[0])
  .filter(x=>/^(?:natal\.(?:year|month|day|hour)\.(?:stem|hidden\.[^\s;]+)|facts\.[a-zA-Z][\w.]*(?:\.[\w]+)*|fortune\.activeDecade|person\.mbti)$/.test(x)))];
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
     previousConclusion:String(section.topicConclusions?.[index]||section.keyJudgment||'').slice(0,240)});
   }
  }
 }
 return result;
}
module.exports={allowedPaths,usedPaths,reusedBefore};
