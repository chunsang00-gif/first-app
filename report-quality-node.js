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
    // In annual chapters 연간 can mean "for the year", not the natal year stem.
    // Keep explicit natal claims checked; ambiguous usage is reviewable, not a false rejection.
    if(match[1]==='연간'&&/^year_2027/.test(section.id)&&!/(?:원국|출생|태어난 해|태어난 연도|년주|연주)\s*(?:의\s*)?$/.test(text.slice(Math.max(0,match.index-20),match.index))){
     warnings.push(section.id+': ambiguous 연간; use 세운 or 원국 연간 in internal evidence');
     continue;
    }
    const position=positionKeys[match[1]];
    const calculated=tenGods[position]?.stemTenGod;
    if(calculated&&calculated!==match[2])errors.push(section.id+': '+match[1]+' '+match[2]+' conflicts with calculated '+calculated);
    else if(!calculated){
     // Without a birth hour, an hour ten-god is invented rather than uncertain.
     if(position==='hour')errors.push(section.id+': uncalculated hour-pillar ten-god claim');
     else warnings.push(section.id+': '+match[1]+' position unavailable to verify');
    }
   }
  }
 }
 // Check explicit claims about the natal month main hidden stem against the deterministic evidence.
 const monthEvidence=packet?.facts?.structuralEvidence?.monthCommand;
 if(monthEvidence){
  const stemNames={갑목:'甲',을목:'乙',병화:'丙',정화:'丁',무토:'戊',기토:'己',경금:'庚',신금:'辛',임수:'壬',계수:'癸'};
  const claim=/(?:월지|태어난 달의 지지)(?:의|에|에서|는|은|\s){0,3}(?:본기|중심 지장간)(?:는|은|이|가|으로|\s){0,3}(갑목|을목|병화|정화|무토|기토|경금|신금|임수|계수|[甲乙丙丁戊己庚辛壬癸])/g;
  for(const section of sections)for(const passage of [...(section.evidence||[]),section.title,section.keyJudgment,...(section.body||[])]){
   for(const match of norm(passage).matchAll(claim)){
    const claimed=stemNames[match[1]]||match[1];
    if(claimed!==monthEvidence.mainHiddenStem)errors.push(section.id+': month main hidden stem '+claimed+' conflicts with calculated '+monthEvidence.mainHiddenStem);
   }
  }
 }
 // Verify explicit natal stem names independently of ten-god labels.
 // A correct ten-god name does not excuse an invented stem at that position.
 const natalStems=packet?.facts?.tenGods;
 const stemAliases={갑:'甲',을:'乙',병:'丙',정:'丁',무:'戊',기:'己',경:'庚',신:'辛',임:'壬',계:'癸'};
 const namedStemClaim=/(연간|월간|일간|시간)(?:의|은|에는|에서|에|\\s+){0,3}(갑목|을목|병화|정화|무토|기토|경금|신금|임수|계수|[甲乙丙丁戊己庚辛壬癸])(?:\\s+(?:비견|겁재|식신|상관|편재|정재|편관|정관|편인|정인))?/g;
 for(const section of sections)for(const passage of [...(section.evidence||[]),section.title,section.keyJudgment,...(section.body||[])]){
  for(const match of norm(passage).matchAll(namedStemClaim)){
   const key=positionKeys[match[1]];
   const actual=natalStems?.[key]?.stem;
   const claimed=match[2].length===2?stemAliases[match[2][0]]:match[2];
   if(actual&&actual!==claimed)errors.push(section.id+': '+match[1]+' '+match[2]+' conflicts with calculated stem '+actual);
   else if(!actual&&key==='hour')errors.push(section.id+': uncalculated hour-pillar stem claim');
  }
 }
 // Validate hidden-stem claims in the natural wording used by actual reports.
 // Multiple branch positions and explicit stem + ten-god pairings must agree
 // with the calculated fact packet, not just a generic ten-god dictionary.
 const hiddenKeys={연지:'year',년지:'year',월지:'month',일지:'day',시지:'hour'};
 const stemNames={갑목:'甲',을목:'乙',병화:'丙',정화:'丁',무토:'戊',기토:'己',경금:'庚',신금:'辛',임수:'壬',계수:'癸'};
 const hiddenClaim=new RegExp('((?:(?:연지|년지|월지|일지|시지)(?:\\s*[·,/]\\s*|\\s*(?:와|과|및)\\s*)?){1,4})(?:인\\s*[가-힣]+)?(?:의)?\\s*지장간(?:의|에는|에도|에|에서)?(?:\\s*있는)?\\s*(?:(甲|乙|丙|丁|戊|己|庚|辛|壬|癸|갑목|을목|병화|정화|무토|기토|경금|신금|임수|계수)\\s*)?('+godTerms+')','g');
 for(const section of sections)for(const passage of [...(section.evidence||[]),section.title,section.keyJudgment,...(section.body||[])]){
  for(const match of norm(passage).matchAll(hiddenClaim)){
   const stem=stemNames[match[2]]||match[2];
   for(const position of match[1].match(/연지|년지|월지|일지|시지/g)||[]){
    const key=hiddenKeys[position],known=tenGods[key]?.hiddenStems;
    if(!Array.isArray(known)){
     if(key==='hour')errors.push(section.id+': uncalculated hour-branch hidden-stem claim');
     else warnings.push(section.id+': '+position+' hidden stems unavailable to verify');
     continue;
    }
    if(!known.some(item=>item.tenGod===match[3]&&(!stem||item.stem===stem)))
     errors.push(section.id+': '+position+' 지장간 '+(match[2]?match[2]+' ':'')+match[3]+' conflicts with calculated hidden stems');
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
     // Bind an explicitly dated claim to that period, not automatically to 2027.
     const before=passage.slice(0,match.index).split(/[.!?。]/).pop();
     const period=before.match(/(\d{4})\s*[~〜～–-]\s*(\d{4})년?\s*(?:[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]\s*)?$/);
     if(period){
      const start=Number(period[1]),end=Number(period[2]);
      const dated=fortune.decades.find(d=>d.startYear===start&&d.endYear===end);
      if(!dated)errors.push(section.id+': uncalculated decade period '+start+'-'+end);
      else if(dated.stemTenGod&&dated.stemTenGod!==match[1])errors.push(section.id+': '+start+'-'+end+' decade '+match[1]+' conflicts with calculated '+dated.stemTenGod);
      continue;
     }
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
 // A paid report must be bound to the exact calculation it was generated for.
 // Otherwise a valid-looking report from another customer can pass prose checks.
 if(packet?.status==='ready'){
  if(r.meta?.mbti!==packet.person?.mbti)errors.push('personalization: report MBTI differs from validated input');
  if(r.meta?.name!==packet.person?.name)errors.push('personalization: report display name differs from validated input');
  if(JSON.stringify(r.meta?.chart)!==JSON.stringify(packet.chart))errors.push('personalization: report chart differs from calculated chart');
  if(r.meta?.targetYear!==packet.targetYear?.year)errors.push('personalization: report target year differs from calculated year');
 }
 const readable=[r.cover?.headline,r.cover?.description,...(r.cover?.highlights||[]).flatMap(h=>[h.title,h.description]),...(r.cover?.keywords||[]),...r.sections.flatMap(s=>[s.title,s.keyJudgment,...(s.body||[]),...(s.bodyLabels||[]),...(s.evidence||[])]),...(r.finalJudgment?.body||[]),r.finalJudgment?.headline,...(r.finalJudgment?.strengths||[]),...(r.finalJudgment?.watchouts||[]),...(r.finalJudgment?.routines||[]).flatMap(x=>[x.trigger,x.action,x.reason]),r.finalJudgment?.closingQuestion].filter(Boolean);
 const all=norm(readable.join(' '));
 // Paid-report acceptance requires the reader-facing analysis, not only hidden evidence,
 // to explain why the calculated chart supports the interpretation.
 if(packet?.status==='ready'&&packet?.facts?.tenGods){
  const core=r.sections.find(x=>x.id==='saju_core');
  const coreText=norm((core?.body||[]).join(' '));
  if(!/(?:일간|월지|월간|일지|십성|지장간|비견|겁재|식신|상관|편재|정재|편관|정관|편인|정인)/.test(coreText))
   errors.push('saju_core: reader-facing natal analysis omits calculated Saju terms');
  if(!/[（(][^)）]{3,}[)）]/.test(coreText))
   errors.push('saju_core: reader-facing natal analysis does not explain technical terms');
  const year=r.sections.find(x=>x.id==='year_2027');
  const yearText=norm((year?.body||[]).join(' '));
  if(!/(?:2027|정미|丁未)/.test(yearText)||!/(?:세운|대운|십성|편관|정관|식신|상관|원국)/.test(yearText))
   errors.push('year_2027: reader-facing fortune omits calculated annual context');
 }
 // MBTI-disabled customers must not receive invented personality-type claims.
 // This checks customer-visible prose as well as the synthesis, not just request flags.
 if(packet?.person?.mbti==='모름'){
  const visible=[r.cover?.headline,r.cover?.description,...(r.cover?.highlights||[]).flatMap(x=>[x.title,x.description]),...r.sections.flatMap(x=>[x.title,x.keyJudgment,...(x.body||[]),...(x.bodyLabels||[])]),r.finalJudgment?.headline,...(r.finalJudgment?.body||[]),r.finalJudgment?.closingQuestion].filter(Boolean).join(' ');
  if(/\\b(?:[IE][NS][FT][JP]|MBTI)\\b/i.test(visible))
   errors.push('personalization: unknown MBTI must not appear as a claimed type or analysis');
 }
 // A seasonal annual pillar must never be sold as a January-to-December guarantee.
 // Only reject explicit full-calendar-year claims; ordinary '2027년' wording remains valid.
 if(packet?.calculationPolicy?.annualPillarBoundary==='ipchun-solar-term'){
  const seasonalClaims=[...(r.sections||[]).filter(x=>/^year_2027/.test(x.id)).flatMap(x=>[x.title,x.keyJudgment,...(x.body||[]),...(x.evidence||[])]),...(r.finalJudgment?.body||[])];
  for(const passage of seasonalClaims){
   const t=norm(passage);
   if(/(?:2027년\s*)?(?:1월\s*1일|1월부터|연초부터).{0,45}(?:정미|丁未|세운)/.test(t)
      ||/(?:정미|丁未|세운).{0,45}(?:1월\s*1일부터|1월부터|12월\s*31일까지|양력\s*1년\s*내내)/.test(t))
    errors.push('2027: annual pillar incorrectly applied to full Gregorian year');
  }
 }
 // Claims of location/time correction are forbidden when the calculation did not do it.
 if(packet?.calculationPolicy?.birthplaceUsedForCalculation===false){
  const passages=[...(r.sections||[]).flatMap(x=>[x.title,x.keyJudgment,...(x.body||[]),...(x.evidence||[])]),r.cover?.headline,r.cover?.description,...(r.finalJudgment?.body||[])];
  for(const passage of passages){
   const t=norm(passage);
   if(/(?:출생지|출생도시|경도|진태양시|태양시|지역별\s*시차).{0,30}(?:보정(?:했|하여|한|되어|됐|을\s*적용)|반영(?:했|하여|한|되어|됐))/.test(t)
    && !/(?:않았|않습니다|미적용|하지\s*않|적용하지|반영하지|보정하지)/.test(t))
    errors.push('calculation: unsupported birthplace or solar-time correction claim');
  }
 }
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
 // An individually cautious sentence is legitimate; a paid report dominated by the
 // same broad "cannot know" ending across unrelated chapters is not.
 const broadCaveat=/(?:이|그|해당)\s*자료(?:만으로|로는)|(?:원국|사주)(?:만으로|로는)|(?:정할|알|평가할|확정할|단정할)\s*수\s*(?:는\s*)?없(?:습니다|다)/;
 const caveatChapters=r.sections.filter(s=>(s.body||[]).some(p=>broadCaveat.test(String(p))));
 if(caveatChapters.length>=5)errors.push('repeated generic limitations across '+caveatChapters.length+' chapters; replace with supported analysis rather than repeated disclaimers');
 // Evidence reuse is a stronger sign of chapter padding than shared vocabulary.
 // Ignore short generic anchors; reject a substantive evidence sentence copied
 // into multiple chapters even when the body text is rewritten.
 const evidenceOwners=new Map();
 for(const section of r.sections){
  for(const item of section.evidence||[]){
   const key=norm(item).replace(/[.!?。！？]+$/,'');
   if(key.length<24)continue;
   const previous=evidenceOwners.get(key);
   if(previous&&previous!==section.id)errors.push('reused evidence across chapters: '+previous+' / '+section.id);
   else evidenceOwners.set(key,section.id);
  }
 }
 const seenSentences=new Map();
 for(const section of r.sections){for(const paragraph of section.body||[]){for(const sentence of String(paragraph).split(/(?<=[.!?])\s+/)){const t=norm(sentence);if(t.length<28)continue;const owner=seenSentences.get(t);if(owner)errors.push('repeated body sentence: '+owner+' / '+section.id);else seenSentences.set(t,section.id)}}}

 const prose=norm(r.sections.map(s=>[...(Array.isArray(s.body)?s.body:[s.body]),s.keyJudgment].join(' ')).join(' ')+' '+(r.finalJudgment?.body||[]).join(' ')+' '+(r.finalJudgment?.closingQuestion||''));
 if(/[\u3400-\u4dbf\u4e00-\u9fff]/.test(prose)){const allowed=new Set(['saju_core','year_2027']);for(const section of r.sections){if(allowed.has(section.id))continue;const passage=norm([section.keyJudgment,...(section.body||[])].join(' '));if(/[\u3400-\u4dbf\u4e00-\u9fff]/.test(passage))errors.push(section.id+': unnecessary Hanja in general-audience prose')}if(/[\u3400-\u4dbf\u4e00-\u9fff]/.test(norm([r.finalJudgment?.closingQuestion,...(r.finalJudgment?.body||[])].join(' '))))errors.push('Hanja in final conclusion')}
 banned.forEach(x=>{if(all.includes(x))errors.push(`banned tail/filler: ${x}`)});
 vague.forEach(x=>{if(all.includes(x))errors.push(`vague phrase: ${x}`)}); abstract.forEach(x=>{if(all.includes(x))errors.push(`abstract wording: ${x}`)});
 generic.forEach(x=>{if(all.includes(x))errors.push(`generic/cliche phrase: ${x}`)}); advice.forEach(x=>{if(all.includes(x))warnings.push(`generic advice review: ${x}`)}); sugar.forEach(x=>{if(all.includes(x))errors.push(`unsupported positive framing: ${x}`)}); meddling.forEach(x=>{if(all.includes(x))errors.push(`overreaching advice: ${x}`)}); universal.forEach(x=>{if(all.includes(x))errors.push(`could-apply-to-anyone wording: ${x}`)});
 const sectionTexts=r.sections.filter(Boolean).map(s=>norm((Array.isArray(s.body)?s.body.join(' '):s.body)+' '+s.keyJudgment));
 const tokens=s=>new Set(norm(s).split(/[^가-힣A-Za-z0-9]+/).filter(x=>x.length>=3));
 const similarity=(a,b)=>{const A=tokens(a),B=tokens(b);if(!A.size||!B.size)return 0;const common=[...A].filter(x=>B.has(x)).length;return common/Math.max(1,Math.min(A.size,B.size))};
 for(let i=0;i<sectionTexts.length;i++)for(let j=i+1;j<sectionTexts.length;j++){const sim=similarity(sectionTexts[i],sectionTexts[j]);if(sim>.58)errors.push(`section insight overlap: ${IDS[i]} / ${IDS[j]}`);else if(sim>.45)warnings.push(`section similarity review: ${IDS[i]} / ${IDS[j]}`)}
 const yearIds=new Set(['year_2027','year_2027_money','year_2027_career','year_2027_relationship']);
 r.sections.filter(s=>yearIds.has(s.id)).forEach(s=>{const t=norm((Array.isArray(s.body)?s.body.join(' '):s.body)+' '+s.keyJudgment);if(!/(2027|올해|평소|기존|더 |강해|약해|달라|변화|비교|반복|유지)/.test(t))errors.push(`${s.id}: 2027 comparison missing`);if(/(반드시|확실히|틀림없이).{0,12}(합격|이직|취업|연애|결혼|수입|돈|성공)/.test(t))errors.push(`${s.id}: deterministic event prediction`)});
 // Conservative paraphrase detection: catch near-identical conclusions even when
 // a small set of interchangeable expressions has been substituted.
 const canonicalJudgment=value=>norm(value)
  .replace(/판단을 내리|결정을 내리|결론을 내리/g,'결정하')
  .replace(/검토하|살펴보|확인하/g,'확인하')
  .replace(/책임 범위|책임의 범위|맡는 책임/g,'책임')
  .replace(/정보공유(?:하는)?\s*시점/g,'정보공유시점')
  .replace(/확인해야\s*합니다/g,'확인합니다')
  .replace(/정보 공유|정보를 공유|정보 전달/g,'정보공유')
  .replace(/시간 배분|시간을 배분|시간 분배/g,'시간배분')
  .replace(/\s+/g,'')
  .replace(/[.,!?。！？]/g,'');
 const canonicalOwners=new Map();
 for(const section of r.sections){
  const canonical=canonicalJudgment(section.keyJudgment);
  if(canonical.length<10)continue;
  const previous=canonicalOwners.get(canonical);
  if(previous)errors.push('paraphrased judgment repeated: '+previous+' / '+section.id);
  else canonicalOwners.set(canonical,section.id);
 }
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
 else if(/^(?:이|본) 보고서는|^(?:이|본) 해석은|^전통 사주 해석|^사주와 MBTI는/.test(norm(r.finalJudgment.closingQuestion)))errors.push('final conclusion is disclaimer instead of personal insight');
 if((r.finalJudgment?.afterClosingText||'')!=='')errors.push('text after final conclusion is forbidden');
 return {pass:errors.length===0,errors:[...new Set(errors)],warnings,issues};
}
module.exports={IDS,validate,verifyEvidenceAgainstFacts,forbiddenPhrases:[...new Set([...banned,...vague,...abstract,...generic,...sugar,...meddling,...universal,...editorial.awkwardPhrases])]};


