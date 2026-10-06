/* Converts deterministic calculations into the only facts the analysis model may use. */
const SAJU_ANALYSIS_INPUT=(()=>{
function build({person,calculation,fortune,mbti,targetYear=2027}){
 if(!calculation||calculation.status!=='complete')return {status:'blocked',reason:'명식 계산이 완성되지 않아 분석 생성 금지'};
 const facts=[];const add=(id,type,value)=>facts.push({id,type,value});
 Object.entries(calculation.chart).forEach(([k,v])=>add(`chart.${k}`,'pillar',v));
 (calculation.enriched?.roots||[]).forEach((v,i)=>add(`root.${i}`,'root',v));
 (calculation.enriched?.relations||[]).forEach((v,i)=>add(`relation.${i}`,'relation',v));
 Object.entries(calculation.enriched?.tenGods||{}).forEach(([k,v])=>add(`tengod.${k}`,'ten_god',v));
 if(fortune){add('fortune.direction','daewoon_direction',fortune.direction);add('fortune.onset','daewoon_onset',fortune.onset);add('fortune.sequence','daewoon_sequence',fortune.sequence);add(`annual.${targetYear}`,'annual_pillar',fortune.annual)}
 add('mbti.type','mbti',mbti);
 return {status:'ready',versions:{calculationRuleset:calculation.ruleset?.id||'unknown',analysisPrompt:'premium-v1',reportSchema:'v1'},person:{displayName:person?.name||'',gender:person?.gender||''},targetYear,mbti,facts,instructions:{factsOnly:true,noMissingFactInference:true,noPersonalHistoryInference:true,nameAnalysisEnabled:false}};
}
return {build};
})();
window.SAJU_ANALYSIS_INPUT=SAJU_ANALYSIS_INPUT;