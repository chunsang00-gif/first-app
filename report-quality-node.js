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
const editorial=require('./report-editorial');
const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
// Only verify explicit stem-ten-god claims that can be matched to computed positions.
// More nuanced traditional interpretations still require human review.
const positionKeys={연간:'year',월간:'month',일간:'day',시간:'hour'};
const godTerms='비견|겁재|식신|상관|편재|정재|편관|정관|편인|정인';
function verifyEvidenceAgainstFacts(report,packet){
 const errors=[],warnings=[];
 const tenGods=packet?.facts?.tenGods;
 const extraSections=[{id:'cover',title:report.cover?.headline,body:[report.cover?.description,...(report.cover?.highlights||[]).flatMap(h=>[h.title,h.description])]},{id:'finalJudgment',title:report.finalJudgment?.headline,body:[...(report.finalJudgment?.body||[]),report.finalJudgment?.closingQuestion,...(report.finalJudgment?.strengths||[]),...(report.finalJudgment?.watchouts||[]),...(report.finalJudgment?.routines||[]).flatMap(r=>[r.trigger,r.action,r.reason])]}];
 const sections=[...(report.sections||[]),...extraSections];
 if(!tenGods)return {errors,warnings};
 for(const section of sections){
  for(const evidence of [...(section.evidence||[]),section.title,section.keyJudgment,...(section.body||[])]){
   const text=norm(evidence);
   const re=new RegExp('(연간|월간|일간|시간)(?:의|에|은|에는|에서|\\s+){0,3}('+godTerms+')','g');
   for(const match of text.matchAll(re)){
    const position=positionKeys[match[1]];
    const calculated=tenGods[position]?.stemTenGod;
    if(calculated&&calculated!==match[2])errors.push(section.id+': '+match[1]+' '+match[2]+' conflicts with calculated '+calculated);
    else if(!calculated)warnings.push(section.id+': '+match[1]+' position unavailable to verify');
   }
  }
 }
 // Check only explicit 2027 claims against facts actually calculated for that year.
 // These classifications are expressly NOT calculated by the current fact packet.
 // A statement about missing data is valid; a positive classification is not.
 const limits=packet?.facts?.limits||[];
 const noStrength=limits.some(x=>x.includes('신강·신약·용신은 이 계산에서 판정하지 않음'));
 if(noStrength)for(const section of sections){
  const passages=[section.title,section.keyJudgment,...(section.body||[]),...(section.evidence||[])].map(norm);
  for(const passage of passages){
   const asserted=/(?:신강|신약|용신)(?:으로|이라|이라고|이다|입니다|에 해당|에 속|이기 때문에|이라서|으로 판정|으로 확정|이 뚜렷|이 강하|이 약하)/.test(passage)
    ||/(?:용신|신강|신약)(?:은|는|이|가)\s*(?:확실|분명|뚜렷|강하|약하|목|화|토|금|수|[甲乙丙丁戊己庚辛壬癸])/.test(passage);
   if(asserted&&!/(?:판정하지|계산하지|확인할 수 없|알 수 없|단정할 수 없|판단하지)/.test(passage))
    errors.push(section.id+': unsupported strength or favorable-element classification');
  }
 }
 // fortune currently provides direction/start only, not decade pillars or their ten gods.
 const fortune=packet?.fortune;
 const hasDecadePillars=Array.isArray(fortune?.decades)&&fortune.decades.length>0;
 if(fortune&&!hasDecadePillars)for(const section of sections){
  const passages=[section.title,section.keyJudgment,...(section.body||[]),...(section.evidence||[])].map(norm);
  for(const passage of passages){
   if(/(?:대운(?:이|은|에는|에서|상|의|과|으로)?).{0,16}(?:정재|편재|정관|편관|정인|편인|식신|상관|비견|겁재|[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]|목운|화운|토운|금운|수운)/.test(passage)
     && !/(?:계산하지|제공되지|확인할 수 없|알 수 없|판정할 수 없|단정할 수 없)/.test(passage))
    errors.push(section.id+': unsupported decade-fortune pillar or ten-god claim');
   if(/(?:대운(?:의|이|은|에서|으로|이므로|때문에)?).{0,15}(?:바뀌어|바뀝니다|시작되어|끝나서|들어와서|겹쳐서|충돌해서|상승하|하락하)/.test(passage)
     && !/(?:계산하지|제공되지|확인할 수 없|알 수 없|단정할 수 없)/.test(passage))
    warnings.push(section.id+': decade-fortune event needs independently calculated period');
  }
 }
 if(hasDecadePillars){
  const active=fortune.activeDecade;
  for(const section of sections){
   if(!/^year_2027/.test(section.id)&&!['cover','finalJudgment'].includes(section.id))continue;
   const passages=[section.title,section.keyJudgment,...(section.body||[]),...(section.evidence||[])].map(norm);
   for(const passage of passages){
    const godMatches=passage.matchAll(/(?:2027년(?:의|에|의\s*)?\s*)?(?:현재\s*)?대운(?:은|이|에는|의|에서|\s+){0,2}(비견|겁재|식신|상관|편재|정재|편관|정관|편인|정인)/g);
    for(const match of godMatches){
     if(!active)warnings.push(section.id+': active decade not calculated for 2027');
     else if(active.stemTenGod&&match[1]!==active.stemTenGod)
      errors.push(section.id+': 2027 decade '+match[1]+' conflicts with calculated '+active.stemTenGod);
    }
   }
  }
 }
 const annualGod=packet?.facts?.annualTenGods?.stemTenGod;
 const relations=packet?.facts?.targetYearRelations;
 const branchPosition={연지:'year',월지:'month',일지:'day',시지:'hour'};
 for(const section of sections){
  if(!/^year_2027/.test(section.id)&&!['cover','finalJudgment'].includes(section.id))continue;
  const passages=[section.title,section.keyJudgment,...(section.body||[]),...(section.evidence||[])].map(norm);
  for(const passage of passages){
   if(annualGod){
    const yearlyGod=/(?:2027년(?:의|\s*세운|\s*연운)?|세운|연운)(?:의|에|은|에는|에서|\s+){0,3}(비견|겁재|식신|상관|편재|정재|편관|정관|편인|정인)/g;
    for(const match of passage.matchAll(yearlyGod))if(match[1]!==annualGod)errors.push(section.id+': 2027 '+match[1]+' conflicts with calculated '+annualGod);
   }
   if(Array.isArray(relations)){
    const yearlyClash=/(?:2027년|2027년의|세운|연운).{0,30}(연지|월지|일지|시지)(?:와|과|에|에서|가|는|의|\s){0,5}(?:충돌|충이|충을|충으로|충합니다|충 관계)/g;
    for(const match of passage.matchAll(yearlyClash)){
     const pos=branchPosition[match[1]];
     const following=passage.slice(match.index+match[0].length).match(/^[^.!?。]{0,12}/)?.[0]||'';
     const denied=/^\s*(?:없|아니|발생하지|성립하지)/.test(following);
     const exists=relations.some(rel=>rel.type==='충'&&rel.between===pos);
     if(!denied&&!exists)errors.push(section.id+': unsupported 2027 clash with '+match[1]);
     if(denied&&exists)errors.push(section.id+': denied calculated 2027 clash with '+match[1]);
    }
   }
  }
 }
 return {errors:[...new Set(errors)],warnings:[...new Set(warnings)]};
}
function validate(r,packet){
 const errors=[],warnings=[];
 if(!r||!Array.isArray(r.sections))return {pass:false,errors:['sections missing'],warnings};
 if(r.sections.length!==12)errors.push(`sections must be 12, got ${r.sections.length}`);
 r.sections.forEach((s,i)=>{
  if(!s||typeof s!=='object'){errors.push(`section ${i+1} invalid`);return}
  if(s.id!==IDS[i])errors.push(`section ${i+1} id/order mismatch`);
  if(['depth-v2','concise-v1','concise-v2'].includes(r.meta?.versions?.schema)){
   const keys=Object.keys(require('./report-outline').topics[s.id]||{});
   if(JSON.stringify(s.bodyTopics)!==JSON.stringify(keys))errors.push(s.id+': required topics missing or reordered');
   if(s.body?.length!==keys.length||s.bodyLabels?.length!==keys.length)errors.push(s.id+': topic explanations incomplete');
  }

  // High-confidence editorial conflict: categorical thrift claim versus overspending.
  // Avoid guessing broader psychological contradictions from isolated keywords.
  if(s.id==='money'||s.id==='year_2027_money'){
   const claim=norm([s.title,s.keyJudgment,...(s.bodyLabels||[])].join(' '));
   const bodyText=norm((Array.isArray(s.body)?s.body:[]).join(' '));
   const absoluteThrift=/불필요한\s*지출(?:은|을)?\s*(?:하지\s*않|안\s*하)|(?:절대|전혀)\s*(?:충동구매|과소비)(?:를|는|는\s*)?\s*(?:하지\s*않|안\s*하)/.test(claim);
   const exceedingBudget=/(?:예산|계획|생각|예상)(?:보다|을\s*넘어|을\s*초과).{0,25}(?:많은\s*돈|큰돈|더\s*쓰|지출|구매|소비|쓸\s*수)|(?:충동구매|과소비)(?:를)?\s*(?:하|할\s*수|잦)/.test(bodyText);
   if(absoluteThrift&&exceedingBudget)errors.push(s.id+': categorical money headline conflicts with spending exception');
  }
  if(s.bodyLabels&&(!Array.isArray(s.bodyLabels)||s.bodyLabels.length!==s.body?.length||s.bodyLabels.some(x=>!norm(x))))errors.push(`${s.id}: paragraph labels incomplete`);
  if(s.mood&&!['confident','reflective','encouraging','cautious'].includes(s.mood))errors.push(`${s.id}: invalid content mood`);
  const body=Array.isArray(s.body)?s.body.join(' '):norm(s.body);
  if(!body)errors.push(`${s.id}: empty body`);
  if(!norm(s.keyJudgment))errors.push(`${s.id}: missing key judgment`);
  if(!Array.isArray(s.evidence)||!s.evidence.length)errors.push(`${s.id}: missing evidence`);
  else if(s.evidence.some(x=>!norm(x)))errors.push(`${s.id}: empty evidence item`); else if(s.evidence.some(x=>norm(x).length<8))errors.push(`${s.id}: evidence too vague`);
  // A long generic sentence is not a concrete traditional saju explanation.
  // Flag it for editorial review; don't reject legitimate free-form evidence solely
  // because it uses unfamiliar wording.
  if(Array.isArray(s.evidence)&&s.evidence.some(x=>/^(?:계산한\s*사주\s*항목의\s*설명|사주\s*근거를\s*확인|명리학적으로\s*해석)(?:입니다|했습니다|합니다)?[.!]?\s*$/.test(norm(x))))
   errors.push(s.id+': evidence is generic placeholder');
  if(Array.isArray(s.evidence)&&s.evidence.every(x=>!/(?:일간|월지|연지|일지|시지|천간|지지|십성|비견|겁재|식신|상관|편재|정재|편관|정관|편인|정인|지장간|세운|충|목|화|토|금|수|甲|乙|丙|丁|戊|己|庚|辛|壬|癸|子|丑|寅|卯|辰|巳|午|未|申|酉|戌|亥)/.test(norm(x))))
   warnings.push(s.id+': evidence has no identifiable saju element');

 });
 const readable=[r.cover?.headline,r.cover?.description,...(r.cover?.highlights||[]).flatMap(h=>[h.title,h.description]),...(r.cover?.keywords||[]),...r.sections.flatMap(s=>[s.title,s.keyJudgment,...(s.body||[]),...(s.bodyLabels||[]),...(s.evidence||[])]),...(r.finalJudgment?.body||[]),r.finalJudgment?.headline,...(r.finalJudgment?.strengths||[]),...(r.finalJudgment?.watchouts||[]),...(r.finalJudgment?.routines||[]).flatMap(x=>[x.trigger,x.action,x.reason]),r.finalJudgment?.closingQuestion].filter(Boolean);
 const all=norm(readable.join(' '));
 const factCheck=verifyEvidenceAgainstFacts(r,packet);errors.push(...factCheck.errors);warnings.push(...factCheck.warnings);
 errors.push(...editorial.wordingErrors(readable));
 for(const section of r.sections){
  const paragraphs=section.body||[];
  const boilerplate=paragraphs.filter(p=>/사주에서는|모습으로 읽습니다|과정으로 읽습니다/.test(p)).length;
  if(boilerplate>=4)errors.push(section.id+': repeated interpretation boilerplate');
 }
 const issues=require('./report-heading-review').issues(r);
 for(const issue of issues)if(issue.reason==='abstract headline without concrete meaning')errors.push(issue.reason);
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
 if(['depth-v2','concise-v1','concise-v2'].includes(r.meta?.versions?.schema)&&r.cover){const h=r.cover.highlights;if(!Array.isArray(h)||h.length!==3||new Set(h.map(x=>x.sectionId)).size!==3||h.some(x=>!IDS.includes(x.sectionId)||!norm(x.title)||!norm(x.description)))errors.push('cover selected highlights incomplete');}
 if(r.cover){if(!norm(r.cover.headline)||!norm(r.cover.description)||!Array.isArray(r.cover.keywords)||r.cover.keywords.length<3)errors.push('cover incomplete');if(new Set(r.cover.keywords).size!==r.cover.keywords.length)errors.push('cover keywords repeat');const coverHeadline=norm(r.cover.headline);if(r.sections.some(s=>norm(s.title)===coverHeadline||norm(s.keyJudgment)===coverHeadline))errors.push('cover repeats a card');}
 if(r.finalJudgment?.routines&&r.finalJudgment.routines.some(x=>!norm(x.trigger)||!norm(x.action)||!norm(x.reason)))errors.push('final routine incomplete');
 if(!Array.isArray(r.finalJudgment?.body)||!r.finalJudgment.body.length)errors.push('final body missing');
 if(!norm(r.finalJudgment?.closingQuestion))errors.push('final conclusion missing');
 else if(/[?？]|(?:까요|습니까|무엇인가|어떠한가)\s*[.!。]?\s*$/.test(norm(r.finalJudgment.closingQuestion)))errors.push('final conclusion must not ask a question');
 if((r.finalJudgment?.afterClosingText||'')!=='')errors.push('text after final conclusion is forbidden');
 return {pass:errors.length===0,errors:[...new Set(errors)],warnings,issues};
}
module.exports={IDS,validate,verifyEvidenceAgainstFacts,forbiddenPhrases:[...new Set([...banned,...vague,...abstract,...generic,...sugar,...meddling,...universal,...editorial.awkwardPhrases])]};


