'use strict';
// Deterministic checks for first-chapter claims against the ORIGINAL
// calendar type/date; not a new fortune method, prompt, or model call.
// Keep customer wording and birth details out of public CI logs.
function audit(checkpoint) {
  const sample=checkpoint?.sample;
  if(!sample || !['solar','lunar'].includes(sample.calendar) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(sample.birthDate||'')) {
    throw Error('MISSING_OR_INVALID_SOURCE_BIRTH_DATE');
  }
  const batch=checkpoint?.batches?.[0];
  const chapter=batch?.sections?.[0];
  if(checkpoint.batches.length!==1 || batch?.completedSections!==1 ||
      JSON.stringify(batch?.ids)!=='["saju_core"]' ||
      chapter?.id!=='saju_core' || !Array.isArray(chapter.body)) {
    throw Error('NOT_THE_VERIFIED_FIRST_CHAPTER');
  }
  const claims=[
    ['title',chapter.title],
    ['keyJudgment',chapter.keyJudgment],
    ...(chapter.bodyLabels||[]).map((s,i)=>['bodyLabels.'+i,s]),
    ...chapter.body.map((s,i)=>['body.'+i,s]),
    ...(chapter.evidence||[]).map((s,i)=>['evidence.'+i,s])
  ].filter(([,s])=>typeof s==='string');
  const expectedBirthMonth=Number(sample.birthDate.slice(5,7));
  const contradictions=[],ambiguous=[];
  for(const [field,value] of claims) {
    // Split to avoid treating negation several sentences later as a denial.
    for(const sentence of value.split(/[.!?。！？\n]+/)) {
      for(const m of sentence.matchAll(/음력\s*(\d{1,2})\s*월/g)) {
        const observed=Number(m[1]);
        if(observed<1||observed>12||sample.calendar!=='lunar') continue;
        if(observed===expectedBirthMonth) continue;
        const left=sentence.slice(Math.max(0,m.index-45),m.index);
        const right=sentence.slice(m.index+m[0].length,m.index+m[0].length+42);
        const birthContext=/(?:태어난|출생|생일|생월|출생월|생년월일)/.test(left+right);
        const denied=/(?:아니라|아닙니다|아니고|아닌|잘못|틀린|일치하지\s*않|다르다|다릅니다|그것이\s*아니)/.test(right);
        if(birthContext&&!denied)
          contradictions.push({field,kind:'LUNAR_BIRTH_MONTH_MISMATCH'});
        else if(!denied)
          ambiguous.push({field,kind:'UNSCOPED_LUNAR_MONTH_REFERENCE'});
      }
    }
  }
  const headline=String(chapter.keyJudgment||'').trim();
  const computationOnlyHeadline=/^(?:이\s*사주는|태어난\s*달(?:은|이|에서|의)|출생\s*월(?:은|이|에서|의))/.test(headline);
  return {calendarFactPass:contradictions.length===0,
    contradictionCount:contradictions.length,contradictions,
    ambiguousMonthReferences:ambiguous.length,
    readerValueReviewFlags:{
      calculationOnlyHeadline:computationOnlyHeadline,
      manualDepthAssessmentRequired:true
    },
    releaseApproved:false,extraPaidCalls:0};
}
module.exports={audit};
