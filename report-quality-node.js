/* Server-side paid-report quality gate v1.0. */
const IDS=['saju_core','mbti_contradiction','decision','money','career','relationship','stress','integrated_judgment','year_2027','year_2027_money','year_2027_career','year_2027_relationship'];
const banned=['두 경우는 완전히 다릅니다','이 점이 중요합니다','기억할 필요가 있습니다','수익의 질','실제로 남는 돈','맹점'];
const vague=['현실적인 선택','흐름이 강하다','가능성이 있습니다','구조가 좋다','결과로 만든다'];
const generic=['신중한 편입니다','책임감이 강합니다','대화를 많이 해야','안정적으로 관리','좋은 기회가 올','타고난 운명','운이 열립니다','대박 운','귀인의 도움','기운을 받아'];
const advice=['노력해야 합니다','긍정적으로 생각','마음을 열고','균형을 유지','꾸준히 노력','자신을 믿'];
const sugar=['걱정하지 않아도','잘될 것입니다','잘 풀릴','분명 좋은','행복해질','충분히 해낼','결국 잘','좋은 방향으로','희망을 가지'];
const meddling=['반드시 해야','꼭 해야','습관을 들이','주변 사람에게','마음을 내려놓','감사하는 마음','스스로를 사랑'];
const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
function validate(r){
 const errors=[],warnings=[];
 if(!r||!Array.isArray(r.sections))return {pass:false,errors:['sections missing'],warnings};
 if(r.sections.length!==12)errors.push(`sections must be 12, got ${r.sections.length}`);
 r.sections.forEach((s,i)=>{
  if(!s||typeof s!=='object'){errors.push(`section ${i+1} invalid`);return}
  if(s.id!==IDS[i])errors.push(`section ${i+1} id/order mismatch`);
  const body=Array.isArray(s.body)?s.body.join(' '):norm(s.body);
  if(!body)errors.push(`${s.id}: empty body`);
  if(body.length<120)errors.push(`${s.id}: analysis too thin`);
  if(!norm(s.keyJudgment))errors.push(`${s.id}: missing key judgment`);
  if(!Array.isArray(s.evidence)||!s.evidence.length)errors.push(`${s.id}: missing evidence`);
  else if(s.evidence.some(x=>!norm(x)))errors.push(`${s.id}: empty evidence item`);
 });
 const all=norm(JSON.stringify(r));
 const prose=norm(r.sections.map(s=>[...(Array.isArray(s.body)?s.body:[s.body]),s.keyJudgment].join(' ')).join(' ')+' '+(r.finalJudgment?.body||[]).join(' ')+' '+(r.finalJudgment?.closingQuestion||''));
 if(/[\u3400-\u4dbf\u4e00-\u9fff]/.test(prose))errors.push('Hanja is forbidden in report prose');
 const totalBody=r.sections.reduce((n,s)=>n+norm(Array.isArray(s.body)?s.body.join(' '):s.body).length,0);
 if(totalBody<3000)errors.push('paid report total analysis too thin');
 const shortSections=r.sections.filter(s=>norm(Array.isArray(s.body)?s.body.join(' '):s.body).length<180).length;
 if(shortSections>2)errors.push('too many shallow sections');
 banned.forEach(x=>{if(all.includes(x))errors.push(`banned tail/filler: ${x}`)});
 vague.forEach(x=>{if(all.includes(x))warnings.push(`vague phrase review: ${x}`)});
 generic.forEach(x=>{if(all.includes(x))errors.push(`generic/cliche phrase: ${x}`)}); advice.forEach(x=>{if(all.includes(x))warnings.push(`generic advice review: ${x}`)}); sugar.forEach(x=>{if(all.includes(x))errors.push(`unsupported positive framing: ${x}`)}); meddling.forEach(x=>{if(all.includes(x))errors.push(`overreaching advice: ${x}`)});
 const sectionTexts=r.sections.filter(Boolean).map(s=>norm((Array.isArray(s.body)?s.body.join(' '):s.body)+' '+s.keyJudgment));
 const tokens=s=>new Set(norm(s).split(/[^가-힣A-Za-z0-9]+/).filter(x=>x.length>=3));
 const similarity=(a,b)=>{const A=tokens(a),B=tokens(b);if(!A.size||!B.size)return 0;const common=[...A].filter(x=>B.has(x)).length;return common/Math.max(1,Math.min(A.size,B.size))};
 for(let i=0;i<sectionTexts.length;i++)for(let j=i+1;j<sectionTexts.length;j++){const sim=similarity(sectionTexts[i],sectionTexts[j]);if(sim>.58)errors.push(`section insight overlap: ${IDS[i]} / ${IDS[j]}`);else if(sim>.45)warnings.push(`section similarity review: ${IDS[i]} / ${IDS[j]}`)}
 const judgments=r.sections.filter(Boolean).map(s=>norm(s.keyJudgment));
 for(let i=0;i<judgments.length;i++)for(let j=i+1;j<judgments.length;j++){
  const a=new Set(judgments[i].split(' ').filter(x=>x.length>2)),b=new Set(judgments[j].split(' ').filter(x=>x.length>2));
  const overlap=[...a].filter(x=>b.has(x)).length/Math.max(1,Math.min(a.size,b.size));
  if(overlap>.72)errors.push(`repeated judgment: ${IDS[i]} / ${IDS[j]}`);
 }
 if(!Array.isArray(r.finalJudgment?.body)||!r.finalJudgment.body.length)errors.push('final body missing');
 if(!norm(r.finalJudgment?.closingQuestion))errors.push('final closing question missing');
 else if(!/[?？]$/.test(norm(r.finalJudgment.closingQuestion)))errors.push('closing line must be a question');
 if((r.finalJudgment?.afterClosingText||'')!=='')errors.push('text after closing question is forbidden');
 return {pass:errors.length===0,errors,warnings};
}
module.exports={IDS,validate};
