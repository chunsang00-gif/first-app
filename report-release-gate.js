'use strict';
// Release gate for a premium written interpretation. Machine quality is only
// technical eligibility; never treat it as proof of traditional/MBTI meaning,
// natural Korean prose or user-observed behavior.
const chapterSelection=require('./report-chapter-selection');
const sources=require('./report-interpretation-overlap');
function assess({report,qa,packet,coverage}={}){
 const sections=Array.isArray(report?.sections)?report.sections:[];
 const ids=sections.map(s=>s?.id).filter(Boolean);
 const evidenceCoverage=sources.coverage(sections);
 const reasons=[];
 const hasFinal=Array.isArray(report?.finalJudgment?.body)&&report.finalJudgment.body.length>0;
 const hasCover=Array.isArray(report?.cover?.highlights)&&report.cover.highlights.length>=3;
 if(!hasFinal||!hasCover)reasons.push('incomplete-final-report');
 if(!ids.includes('saju_core')||!ids.includes('year_2027')||ids.length<chapterSelection.MINIMUM_CHAPTERS)
  reasons.push('insufficient-premium-scope');
 if(qa?.pass!==true)reasons.push('automated-quality-not-passed');
 if(!packet?.facts?.tenGods||!packet?.facts?.annualTenGods)
  reasons.push('calculation-packet-not-verified');
 if(evidenceCoverage.status!=='canonical-source-data')
  reasons.push('paragraph-citation-coverage-incomplete');
 if(!coverage?.canGenerate||!Array.isArray(coverage.plannedIds)||
    JSON.stringify(coverage.plannedIds)!==JSON.stringify(ids))
  reasons.push('chapter-scope-not-confirmed');
 const technicalPass=reasons.length===0;
 return {
  releaseVerdict:'not-approved',
  technicalChecks:technicalPass?'passed':'incomplete',
  humanReviewRequired:true,
  manualChecks:[
   'calculation-to-interpretation-meaning',
   'distinct-interpretations-across-chapters',
   'natural-Korean-and-jargon',
   'depth-worth-paying-for',
   '2027-limits-and-non-deterministic-events'
  ],
  failedTechnicalChecks:[...new Set(reasons)],
  sourceCoverage:evidenceCoverage,
  message:'자동 품질 검사는 유료 출시 승인이 아닙니다. 원문과 계산 근거를 대조한 사람의 독립적 심사가 필요합니다.'
 };
}
module.exports={assess};
