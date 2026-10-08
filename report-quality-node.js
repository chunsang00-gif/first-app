/* Server-side paid-report quality gate v1.0. */
const IDS=['saju_core','mbti_contradiction','decision','money','career','relationship','stress','integrated_judgment','year_2027','year_2027_money','year_2027_career','year_2027_relationship'];
const banned=['두 경우는 완전히 다릅니다','이 점이 중요합니다','기억할 필요가 있습니다','수익의 질','실제로 남는 돈','맹점'];
const vague=['현실적인 선택','흐름이 강하다','가능성이 있습니다','구조가 좋다','결과로 만든다','새로운 선택지','관심을 보이지만','시간을 쓰기로','약속할 때','계획과 말을','따져볼 수 있습니다','허술한 부분','그냥 넘기기','여러 가능성'];
const abstract=['통제할 수 있는 돈','판단 기준','선택 메커니즘','감당 가능한 범위','현실적 구조','작동 방식','통제 범위','흐름이','구조가','구조를','작용이','기운이','에너지가','균형이','메커니즘','선택지','관심을 보','계획과 말','약속할 때','따져볼'];
const generic=['신중한 편입니다','책임감이 강합니다','대화를 많이 해야','안정적으로 관리','좋은 기회가 올','타고난 운명','운이 열립니다','대박 운','귀인의 도움','기운을 받아'];
const advice=['노력해야 합니다','긍정적으로 생각','마음을 열고','균형을 유지','꾸준히 노력','자신을 믿'];
const sugar=['걱정하지 않아도','잘될 것입니다','잘 풀릴','분명 좋은','행복해질','충분히 해낼','결국 잘','좋은 방향으로','희망을 가지'];
const meddling=['반드시 해야','꼭 해야','습관을 들이','주변 사람에게','마음을 내려놓','감사하는 마음','스스로를 사랑'];
const universal=['상황에 따라 다를','사람마다 다를','때로는 적극적','때로는 신중','장단점이 있','균형이 중요','소통이 중요','자기계발','성장할 수'];
const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
function validate(r){
 const errors=[],warnings=[];
 if(!r||!Array.isArray(r.sections))return {pass:false,errors:['sections missing'],warnings};
 if(r.sections.length!==12)errors.push(`sections must be 12, got ${r.sections.length}`);
 r.sections.forEach((s,i)=>{
  if(!s||typeof s!=='object'){errors.push(`section ${i+1} invalid`);return}
  if(s.id!==IDS[i])errors.push(`section ${i+1} id/order mismatch`);
  if(r.meta?.versions?.schema==='depth-v2'){
   const keys=Object.keys(require('./report-outline').topics[s.id]||{});
   if(JSON.stringify(s.bodyTopics)!==JSON.stringify(keys))errors.push(s.id+': required topics missing or reordered');
   if(s.body?.length!==keys.length||s.bodyLabels?.length!==keys.length)errors.push(s.id+': topic explanations incomplete');
  }

  if(s.bodyLabels&&(!Array.isArray(s.bodyLabels)||s.bodyLabels.length!==s.body?.length||s.bodyLabels.some(x=>!norm(x))))errors.push(`${s.id}: paragraph labels incomplete`);
  if(s.mood&&!['confident','reflective','encouraging','cautious'].includes(s.mood))errors.push(`${s.id}: invalid content mood`);
  const body=Array.isArray(s.body)?s.body.join(' '):norm(s.body);
  if(!body)errors.push(`${s.id}: empty body`);
  if(!norm(s.keyJudgment))errors.push(`${s.id}: missing key judgment`);
  if(!Array.isArray(s.evidence)||!s.evidence.length)errors.push(`${s.id}: missing evidence`);
  else if(s.evidence.some(x=>!norm(x)))errors.push(`${s.id}: empty evidence item`); else if(s.evidence.some(x=>norm(x).length<8))errors.push(`${s.id}: evidence too vague`);
 });
 const readable=[r.cover?.headline,r.cover?.description,...(r.cover?.highlights||[]).flatMap(h=>[h.title,h.description]),...(r.cover?.keywords||[]),...r.sections.flatMap(s=>[s.title,s.keyJudgment,...(s.body||[]),...(s.bodyLabels||[]),...(s.evidence||[])]),...(r.finalJudgment?.body||[]),r.finalJudgment?.headline,...(r.finalJudgment?.strengths||[]),...(r.finalJudgment?.watchouts||[]),...(r.finalJudgment?.routines||[]).flatMap(x=>[x.trigger,x.action,x.reason]),r.finalJudgment?.closingQuestion].filter(Boolean);
 const all=norm(readable.join(' '));
 if(readable.some(x=>/(?:[A-Za-z]+_){1,}[A-Za-z]+|undefined|\[object Object\]/.test(x)))errors.push('internal field leaked into prose');
 if(readable.some(x=>/([가-힣]{2,})\s+\1(?=[\s,.!?]|$)/.test(x)))errors.push('duplicated adjacent word');
 if(readable.some(x=>/\uFFFD/.test(x)))errors.push('invalid text encoding');
 const seenSentences=new Map();
 for(const section of r.sections){for(const paragraph of section.body||[]){for(const sentence of String(paragraph).split(/(?<=[.!?])\s+/)){const t=norm(sentence);if(t.length<28)continue;const owner=seenSentences.get(t);if(owner)errors.push('repeated body sentence: '+owner+' / '+section.id);else seenSentences.set(t,section.id)}}}

 const prose=norm(r.sections.map(s=>[...(Array.isArray(s.body)?s.body:[s.body]),s.keyJudgment].join(' ')).join(' ')+' '+(r.finalJudgment?.body||[]).join(' ')+' '+(r.finalJudgment?.closingQuestion||''));
 if(/[\u3400-\u4dbf\u4e00-\u9fff]/.test(prose))errors.push('Hanja is forbidden in report prose');
 banned.forEach(x=>{if(all.includes(x))errors.push(`banned tail/filler: ${x}`)});
 vague.forEach(x=>{if(all.includes(x))errors.push(`vague phrase: ${x}`)}); abstract.forEach(x=>{if(all.includes(x))errors.push(`abstract wording: ${x}`)});
 generic.forEach(x=>{if(all.includes(x))errors.push(`generic/cliche phrase: ${x}`)}); advice.forEach(x=>{if(all.includes(x))warnings.push(`generic advice review: ${x}`)}); sugar.forEach(x=>{if(all.includes(x))errors.push(`unsupported positive framing: ${x}`)}); meddling.forEach(x=>{if(all.includes(x))errors.push(`overreaching advice: ${x}`)}); universal.forEach(x=>{if(all.includes(x))errors.push(`could-apply-to-anyone wording: ${x}`)});
 const sectionTexts=r.sections.filter(Boolean).map(s=>norm((Array.isArray(s.body)?s.body.join(' '):s.body)+' '+s.keyJudgment));
 const tokens=s=>new Set(norm(s).split(/[^가-힣A-Za-z0-9]+/).filter(x=>x.length>=3));
 const similarity=(a,b)=>{const A=tokens(a),B=tokens(b);if(!A.size||!B.size)return 0;const common=[...A].filter(x=>B.has(x)).length;return common/Math.max(1,Math.min(A.size,B.size))};
 for(let i=0;i<sectionTexts.length;i++)for(let j=i+1;j<sectionTexts.length;j++){const sim=similarity(sectionTexts[i],sectionTexts[j]);if(sim>.58)errors.push(`section insight overlap: ${IDS[i]} / ${IDS[j]}`);else if(sim>.45)warnings.push(`section similarity review: ${IDS[i]} / ${IDS[j]}`)}
 const yearIds=new Set(['year_2027','year_2027_money','year_2027_career','year_2027_relationship']);
 r.sections.filter(s=>yearIds.has(s.id)).forEach(s=>{const t=norm((Array.isArray(s.body)?s.body.join(' '):s.body)+' '+s.keyJudgment);if(!/(2027|올해|평소|기존|더 |강해|약해|달라|변화|비교|반복|유지)/.test(t))errors.push(`${s.id}: 2027 comparison missing`);if(/(반드시|확실히|틀림없이).{0,12}(합격|이직|취업|연애|결혼|수입|돈|성공)/.test(t))errors.push(`${s.id}: deterministic event prediction`)});
 const judgments=r.sections.filter(Boolean).map(s=>norm(s.keyJudgment));
 for(let i=0;i<judgments.length;i++)for(let j=i+1;j<judgments.length;j++){
  const a=new Set(judgments[i].split(' ').filter(x=>x.length>2)),b=new Set(judgments[j].split(' ').filter(x=>x.length>2));
  const overlap=[...a].filter(x=>b.has(x)).length/Math.max(1,Math.min(a.size,b.size));
  if(overlap>.72)errors.push(`repeated judgment: ${IDS[i]} / ${IDS[j]}`);
 }
 if(r.meta?.versions?.schema==='depth-v2'&&r.cover){const h=r.cover.highlights;if(!Array.isArray(h)||h.length!==3||new Set(h.map(x=>x.sectionId)).size!==3||h.some(x=>!IDS.includes(x.sectionId)||!norm(x.title)||!norm(x.description)))errors.push('cover selected highlights incomplete');}
 if(r.cover){if(!norm(r.cover.headline)||!norm(r.cover.description)||!Array.isArray(r.cover.keywords)||r.cover.keywords.length<3)errors.push('cover incomplete');if(new Set(r.cover.keywords).size!==r.cover.keywords.length)errors.push('cover keywords repeat');const coverHeadline=norm(r.cover.headline);if(r.sections.some(s=>norm(s.title)===coverHeadline||norm(s.keyJudgment)===coverHeadline))errors.push('cover repeats a card');}
 if(r.finalJudgment?.routines&&r.finalJudgment.routines.some(x=>!norm(x.trigger)||!norm(x.action)||!norm(x.reason)))errors.push('final routine incomplete');
 if(!Array.isArray(r.finalJudgment?.body)||!r.finalJudgment.body.length)errors.push('final body missing');
 if(!norm(r.finalJudgment?.closingQuestion))errors.push('final closing question missing');
 else if(!/[?？]$/.test(norm(r.finalJudgment.closingQuestion)))errors.push('closing line must be a question');
 if((r.finalJudgment?.afterClosingText||'')!=='')errors.push('text after closing question is forbidden');
 return {pass:errors.length===0,errors,warnings};
}
module.exports={IDS,validate,forbiddenPhrases:[...new Set([...banned,...vague,...abstract,...generic,...sugar,...meddling,...universal])]};
