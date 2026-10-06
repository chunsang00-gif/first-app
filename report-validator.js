/* Paid-report quality gate v1. Rejects structurally weak or generic output before display. */
const REPORT_VALIDATOR=(()=>{
const IDS=['saju_core','mbti_contradiction','decision','money','career','relationship','stress','integrated_judgment','year_2027','year_2027_money','year_2027_career','year_2027_relationship'];
const banned=['두 경우는 완전히 다릅니다','이 점이 중요합니다','기억할 필요가 있습니다','수익의 질','실제로 남는 돈'];
const vague=['현실적인 선택','흐름이 강하다','가능성이 있습니다','구조가 좋다','결과로 만든다'];
function norm(s){return String(s||'').replace(/\s+/g,' ').trim()}
function validate(r){const errors=[],warnings=[];
 if(!r||!Array.isArray(r.sections)){return {pass:false,errors:['sections missing'],warnings}}
 if(r.sections.length!==12)errors.push(`sections must be 12, got ${r.sections.length}`);
 r.sections.forEach((s,i)=>{if(s.id!==IDS[i])errors.push(`section ${i+1} id/order mismatch`);if(!s.body?.length)errors.push(`${s.id}: empty body`);if(!norm(s.keyJudgment))errors.push(`${s.id}: missing key judgment`);if(!s.evidence?.length)errors.push(`${s.id}: missing evidence`)});
 const all=norm(JSON.stringify(r));banned.forEach(x=>{if(all.includes(x))errors.push(`banned tail/filler: ${x}`)});vague.forEach(x=>{if(all.includes(x))warnings.push(`vague phrase review: ${x}`)});
 const judgments=r.sections.map(s=>norm(s.keyJudgment));for(let i=0;i<judgments.length;i++)for(let j=i+1;j<judgments.length;j++){const a=new Set(judgments[i].split(' ').filter(x=>x.length>2)),b=new Set(judgments[j].split(' ').filter(x=>x.length>2));const overlap=[...a].filter(x=>b.has(x)).length/Math.max(1,Math.min(a.size,b.size));if(overlap>.72)warnings.push(`possible repeated judgment: ${IDS[i]} / ${IDS[j]}`)}
 if(!r.finalJudgment?.closingQuestion)errors.push('final closing question missing');if((r.finalJudgment?.afterClosingText||'')!=='')errors.push('text after closing question is forbidden');
 return {pass:errors.length===0,errors,warnings};}
return {IDS,validate};})();
window.REPORT_VALIDATOR=REPORT_VALIDATOR;