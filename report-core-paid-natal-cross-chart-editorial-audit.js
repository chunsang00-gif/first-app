'use strict';
// OFFLINE multi-chart editorial reuse audit, never customer-facing.
// Compare reader text, not just schema IDs: two different calculated role
// pairs may have valid citations while receiving the SAME canned advice.
// This is only a lexical editorial signal, NOT proof of interpretive depth.
const {overlap}=require('./report-core-paid-natal-depth-response-gate');
const normalize=s=>String(s||'').normalize('NFKC')
 .replace(/[^가-힣a-zA-Z0-9]/g,'').toLowerCase();
const sentences=s=>String(s||'').split(/[.!?。！？\n]+/)
 .map(x=>x.trim()).filter(x=>normalize(x).length>=24);
const sceneNeutral=s=>normalize(s).replace(
 /(작업|업무|행사|매장|학교|직장|가게|프로젝트|동네)(?:을|를|은|는|에|의|에서)?/g,'');
function inspect(items){
 if(!Array.isArray(items)||items.length<2)
  throw Error('QA_CROSS_CHART_EDITORIAL_REQUIRES_MULTIPLE_CHARTS');
 const cases=items.map((item,index)=>{
  const {prompt,payload,response}=item||{};
  if(prompt?.qaNatalDepthPreview!==true||
     JSON.stringify(prompt.requestedSections)!=='["saju_core"]'||
     !prompt.facts?.chart?.hour||
     !payload?.task?.chapters?.saju_core?.topics?.natal_depth||
     typeof response?.chapters?.saju_core?.paragraphs?.natal_depth?.text!=='string')
   throw Error('QA_CROSS_CHART_EDITORIAL_INVALID_PREVIEW:'+index);
  const chart=['year','month','day','hour'].map(k=>prompt.facts.chart[k]).join('/');
  const year=payload.source?.['natal.year.stem']?.tenGod;
  const hour=payload.source?.['natal.hour.stem']?.tenGod;
  const depth=response.chapters.saju_core.paragraphs.natal_depth;
  if(!year||!hour||!Array.isArray(depth.basis?.refs)||
     !['natal.year.stem','natal.hour.stem'].every(id=>depth.basis.refs.includes(id)))
   throw Error('QA_CROSS_CHART_EDITORIAL_UNCITABLE:'+index);
  return {chart,rolePair:year+'/'+hour,text:depth.text};
 });
 if(new Set(cases.map(x=>x.chart)).size!==cases.length)
  throw Error('QA_CROSS_CHART_EDITORIAL_DUPLICATE_CHART');
 const comparisons=[];
 for(let i=0;i<cases.length;i++)for(let j=i+1;j<cases.length;j++){
  const left=cases[i],right=cases[j];
  const a=sentences(left.text),b=sentences(right.text);
  const bSet=new Set(b.map(normalize));
  const repeatedLongSentences=a.filter(x=>bSet.has(normalize(x)))
   .map(x=>({characterCount:normalize(x).length}));
  const lastA=a[a.length-1],lastB=b[b.length-1];
  // Strip only superficial scene names from the closing line. Changing
  // "work" to "event" must not count as a different personal insight.
  const sceneSwappedClosingAdvice=!!lastA&&!!lastB&&
   sceneNeutral(lastA).length>=26&&
   sceneNeutral(lastA)===sceneNeutral(lastB);
  const textOverlap8gram=overlap(left.text,right.text);
  const differenceSupportedByRoles=left.rolePair!==right.rolePair;
  const warnings=[
   ...(repeatedLongSentences.length?['reused-long-reader-sentences']:[]),
   ...(sceneSwappedClosingAdvice?['reused-closing-advice-scene-swap']:[]),
   ...(differenceSupportedByRoles&&textOverlap8gram>=0.50?
    ['near-duplicate-reading-across-distinct-role-pairs']:[])
  ];
  comparisons.push({leftIndex:i,rightIndex:j,
   rolePairsDifferent:differenceSupportedByRoles,
   repeatedLongSentenceCount:repeatedLongSentences.length,
   sceneSwappedClosingAdvice,
   textOverlap8gram:Math.round(textOverlap8gram*1000)/1000,
   warnings});
 }
 return {
  kind:'qa-cross-chart-editorial-reuse-v1',
  inspectedCharts:cases.length,pairs:comparisons.length,
  comparisons,needsHumanEditorialReview:comparisons.some(x=>x.warnings.length>0),
  comparisonOnly:true,semanticMeaningProven:false,
  professionallyApproved:false,readyForPaidRelease:false,
  providerCalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={inspect};
