/* Framework-neutral server report contract v1.2. */
const facts=require('./report-facts-node');
const quality=require('./report-quality-node');
const analysisGuidance=require('./report-analysis-guidance');
const IDS=quality.IDS;
async function mapLimited(items,worker){const results=[];for(let i=0;i<items.length;i++)results.push(await worker(items[i],i));return results}

function validateShape(r){const errors=[];if(!r||!r.meta)errors.push('meta required');if(!r||!Array.isArray(r.sections)||r.sections.length!==12)errors.push('12 sections required');else r.sections.forEach((s,i)=>{if(!s||s.id!==IDS[i])errors.push(`section order ${i+1}`);if(!s?.title||!Array.isArray(s?.body)||!s.body.length||!s?.keyJudgment||!Array.isArray(s?.evidence)||!s.evidence.length)errors.push(`${s?.id||i}: incomplete`)});if(!Array.isArray(r?.finalJudgment?.body)||!r.finalJudgment.body.length)errors.push('final body required');if(!r?.finalJudgment?.closingQuestion)errors.push('closing conclusion required');if((r?.finalJudgment?.afterClosingText||'')!=='')errors.push('text after closing conclusion forbidden');if(!r?.cover)errors.push('cover required');if(r?.cover){if(!r.cover.headline||!r.cover.description||!Array.isArray(r.cover.keywords)||r.cover.keywords.length<3)errors.push('cover incomplete')}for(const s of r?.sections||[]){if(s.bodyLabels&&s.bodyLabels.length!==s.body.length)errors.push(s.id+': paragraph labels mismatch');if(s.mood&&!['confident','reflective','encouraging','cautious'].includes(s.mood))errors.push(s.id+': invalid mood')}return {pass:!errors.length,errors}}
function buildPrompt(packet){return {role:'유료 사주×MBTI 분석가',promptVersion:'premium-v1.6',facts:packet,rules:{globalPlainLanguageRule:'사용자에게 보이는 모든 문장에 쉬운 일상 한국어를 쓴다. 제목, 요약, 핵심 판정, 근거, 본문, 2027 분석, 최종 정리, 결론까지 모두 적용한다. 추상적인 말로 얼버무리지 말고 실제 행동이나 상황이 떠오르게 쓴다.',factsOnly:true,noPersonalHistoryInference:true,noDeterministicPrediction:true,year2027Rule:'2027 분석은 평생 성향을 다시 설명하지 않는다. 제공된 2027 세운과 원국의 관계, 그리고 제공된 경우 현재 대운을 근거로 평소와 비교해 무엇이 더 강조되거나 충돌하는지 먼저 밝힌다. 이어 돈·일·관계에서 실제 생각이 달라지는 점이 어떻게 달라질 수 있는지를 구체적으로 설명한다. 사건 발생, 합격, 이직, 연애, 수입 증가처럼 계산 사실로 확정할 수 없는 결과를 예언하지 않는다.',year2027ComparisonRule:'2027 관련 네 장은 반드시 평소와 달라지는 점 또는 평소 성향이 더 강해지는 점을 한 가지 이상 명시한다. 변화가 뚜렷하지 않으면 억지로 만들지 말고 변화 근거가 약하다고 적는다.',year2027DomainRule:'2027 돈·일·관계는 각각 해당 원국·세운·대운에서 그 분야와 연결할 근거를 선택한다. 모든 사람에게 비용·책임·연락 감소라는 정해진 결론을 적용하지 않는다. 차이를 설명할 근거가 약하면 억지로 변화를 만들지 않는다.',sections:IDS,eachSectionNewInsight:true,sectionSeparationRule:'12개 장은 같은 성향을 분야명만 바꿔 반복하지 않는다. 성향은 기본 성향, 결정은 결정을 내리는 순서, 돈은 손실·비용·반복성, 일은 역할·책임·판단권, 관계는 정보 공유와 조정, 스트레스는 압박 시 변화, 2027은 평생 성향과 다른 그해에 달라지는 모습으로 각각 분리한다. 앞 장의 결론이 필요하면 한 문장 이하로만 연결하고 반드시 새로운 결론을 추가한다.',crossBatchRule:'보고서를 여러 묶음으로 나누어 생성하더라도 각 장의 title·body·keyJudgment는 다른 장과 결론과 표현을 중복하지 않도록 한다.',integrateMbti:packet?.person?.mbti!=='모름',mbtiOptionalRule:'MBTI가 모름이면 MBTI를 추정하거나 언급하지 않는다. 사주만으로 모든 섹션을 작성하고, MBTI 반전 섹션은 사주에서 겉으로 보이는 반응과 실제 생각이 달라지는 점의 차이를 설명한다. 종합 분석도 사주 종합 분석으로 작성한다.',plainKoreanFirst:true,hanjaPolicy:'사주 원국 표의 천간·지지 표기 외에는 한자를 쓰지 말고, 명리 용어도 가능한 한 쉬운 한국어로 풀어 쓸 것',strongEnding:true,noTextAfterFinalConclusion:true,minSectionDepth:'글자 수를 맞추지 않는다. 계산 근거가 충분하면 필요한 만큼 깊게 설명하고, 근거가 적으면 짧더라도 정확하게 끝낸다. 분량을 늘리기 위한 반복, 추상어, 상투어, 불필요한 예시는 금지한다. 짧은 결론 여러 개를 붙이지 말고 하나의 분석을 끝까지 풀어 쓴다.',paragraphGuide:'각 장은 목차에 지정된 항목마다 독립적인 문단을 작성한다. 문단 수를 일률적으로 2~3개로 제한하지 않는다. 1문단은 계산 근거가 무엇을 뜻하는지, 2문단은 그래서 생각·선택·행동에서 어떻게 나타날 수 있는지, 필요할 때만 3문단에서 그 장에서만 새롭게 드러나는 충돌이나 주의점을 설명한다. 핵심 판정만 읽어도 의미가 완결되어야 한다.',avoidPhrases:['두 경우는 완전히 다릅니다','이 점이 중요합니다','기억할 필요가 있습니다','수익의 질','실제로 남는 돈','맹점','신중한 편입니다','책임감이 강합니다','대화를 많이 해야','안정적으로 관리','좋은 기회가 올','타고난 운명','운이 열립니다','대박 운','귀인의 도움','기운을 받아'],tone:'20~30대가 모바일에서 바로 이해하는 직설적인 한국어. 근거가 강한 단점은 완곡하게 숨기지 말고 날카롭고 선명하게 말한다. 예를 들어 고집이 강하고 반대 의견을 잘 받아들이지 않는 근거가 충분하다면 독단적으로 보일 수 있고 혼자 밀어붙인다는 말을 들을 수 있다는 수준까지 구체적으로 쓴다. 반대로 근거가 강한 장점은 소극적으로 축소하지 말고 무엇을 매우 잘할 수 있는지 자신감 있게 표현한다. 단, 장점과 단점 모두 계산 사실과 MBTI 근거의 강도를 넘어서 과장하거나 실제 과거 경험을 사실처럼 단정하지 않는다. 점집 말투, 고어체, 훈계조, AI식 상투어 금지',interpretationChainRule:'모든 장은 반드시 계산 사실 → 쉬운 뜻 → 실제 행동의 순서로 이어진다. 계산 사실만 나열하거나 해석만 단정하지 않는다. 실제 행동은 사용자의 과거를 지어내지 말고 선택 상황의 예시로 설명한다. 예: 결정을 빨리 내린다가 아니라 비교할 항목이 적으면 바로 고르지만 손해 가능성이 보이면 다시 확인하는 식으로 쓴다.',easyKoreanRule:'중학생도 바로 이해할 수 있는 일상 한국어만 쓴다. 추상적인 표현을 쉬운 말처럼 포장하지 않는다. 예를 들어 통제할 수 있는 돈, 판단 기준, 선택 메커니즘, 감당 가능한 범위, 현실적 구조, 작동 방식 같은 표현은 금지한다. 돈은 아끼는지 쓰는지, 계획해서 쓰는지 충동적으로 쓰는지처럼 바로 떠올릴 수 있는 행동으로 말한다. 일·관계·감정도 같은 원칙을 적용한다.',evidenceRule:'각 장의 결론은 반드시 제공된 사주 계산 사실 또는 MBTI 정보와 연결되어야 한다. evidence에는 사용자가 읽고 납득할 수 있는 핵심 근거만 1~3개 작성한다. 사주 근거인지 MBTI 근거인지 문장 자체에서 구분되게 쓰고, 내부 필드명·JSON 경로·프롬프트 용어는 노출하지 않는다. 근거 없이 성격·상황·미래를 만들어내지 않는다.',improvementRule:'개선 방향은 해당 장의 분석에서 직접 도출될 때만 1~2문장으로 제시한다. 해야 한다 식의 훈계, 생활습관·인간관계에 대한 과도한 조언, 근거 없는 긍정과 위로는 금지한다.',neutralityRule:'긍정적인 결론을 만들기 위해 단점을 완화하거나 장점을 억지로 추가하지 않는다. 장점과 약점의 비율을 인위적으로 맞추지 않는다. 근거가 강한 단점은 불편할 정도로 선명하게, 근거가 강한 장점은 능력이 어디까지 발휘될 수 있는지 강하게 표현하되 근거의 범위를 절대 넘지 않는다.',factStrengthRule:'모든 강한 표현에는 바로 확인 가능한 계산 사실 또는 사용자가 입력한 MBTI 근거가 있어야 한다. 근거가 약하거나 서로 엇갈리면 단정형을 쓰지 말고 무엇 때문에 판단이 갈리는지 그대로 밝힌다. 사용자의 실제 평판, 과거 사건, 직업 성과, 인간관계 경험을 입력받지 않았다면 들었다·겪었다·해왔다고 사실처럼 쓰지 않는다.',proofreadingRule:'최종 출력 전 한국어 맞춤법, 띄어쓰기, 조사 호응, 문장 종결, 오탈자, 중복어, 어색한 번역투를 반드시 자체 점검하고 수정한다. 제목·핵심 판정·본문·최종 결론까지 모두 적용한다. 의미를 바꾸지 말고 문장 품질만 교정한다.',noGenericAdvice:true,noRepeatedJudgment:true,keyJudgmentRule:'각 핵심 판정은 일반 사용자가 한 번 읽고 바로 뜻을 이해할 수 있는 생활 한국어 한 문장으로 작성한다. 명리 구조를 설명하는 문장이 아니라 그래서 나는 어떤 사람인가를 답한다. 예: 부탁을 바로 받아들이기보다 내 기준에 맞는지 한 번 더 확인하는 편입니다. 추상어(구조, 기준을 통과, 조건 검토, 작동, 범위 변경, 수용 후 재검토)를 핵심 판정에 쓰지 않는다. 다른 장과 같은 결론을 반복하지 않는다.',summaryRule:'첫 화면에 노출될 saju_core, mbti_contradiction, integrated_judgment의 keyJudgment는 각각 기본 성향, 겉으로 보이는 MBTI와 실제 반응의 차이, 두 분석을 합친 최종 성향을 한 번에 이해되는 행동 문장으로 쓴다. 관심이 있다, 가능성을 본다, 기준을 따진다, 계획을 세운다, 약속을 지킨다처럼 머릿속 상태만 요약하지 않는다. 대신 남이 정한 답을 바로 따르지 않고 직접 확인한 뒤 결정한다처럼 사용자가 실제로 무엇을 하는지가 보이게 쓴다. 실제 과거 사건은 지어내지 않는다. 근거 설명은 evidence와 본문에 두고 요약 문장에는 전문적인 추론 과정을 넣지 않는다.',noAbstractStandaloneRule:'사용자에게 보이는 해석 문장에서는 흐름, 구조, 작용, 기운, 에너지, 균형, 메커니즘, 작동 방식, 현실적 구조 같은 추상어를 쓰지 않는다. 강하다, 약하다, 성향, 충돌 같은 말도 그것만으로 설명하지 말고 반드시 바로 관찰 가능한 생각·말·선택·행동으로 바꿔 쓴다.',domainUniquenessRule:'돈 장은 지출·손실·반복구매·가격 비교, 일 장은 역할·책임·속도·재작업·판단권, 관계 장은 연락·표현·거리 조절·갈등 대응, 스트레스 장은 압박받을 때 말·결정·집중이 어떻게 바뀌는지를 다룬다. 다른 장의 결론을 가져와 분야 단어만 바꾸는 것은 금지한다.',namePolicy:'display-only-never-analyze'},output:{jsonOnly:true,sectionBody:'array of paragraphs',finalBody:'array of paragraphs',afterClosingText:''}}}
// Catch actual repeated topic paragraphs, rather than broad vocabulary overlap.
function findRepeatedTopicContent(sections){
 const seen=new Map(),errors=[];
 for(const section of sections)for(let i=0;i<(section.body||[]).length;i++){
  const text=String(section.body[i]||'').normalize('NFKC').replace(/[\s.,!?。！？"'“”‘’·:;()[\]]/g,'');
  if(text.length<55)continue;
  const owner=seen.get(text),id=section.id+':'+(section.bodyTopics?.[i]||i);
  if(owner&&owner!==id)errors.push('repeated topic paragraph: '+owner+' / '+id);
  else seen.set(text,id);
 }
 return errors;
}
// Compare substantive interpretations across different topics, not merely shared words.
function findParaphrasedTopicContent(sections){
 const entries=[];
 const stop=new Set(['그리고','하지만','그래서','때문에','경우에','합니다','있습니다','없습니다','것입니다','대해서','2027년','사람은','본인은','자신의','계산된','사주에서','해석은','중요합니다']);
 const tokens=s=>[...new Set(String(s||'').normalize('NFKC').match(/[가-힣]{2,}/g)||[])].filter(w=>w.length>=3&&!stop.has(w));
 for(const s of sections)for(let i=0;i<(s.body||[]).length;i++){
  const content=String(s.body[i]||''),words=tokens(content);
  if(content.length<75||words.length<9)continue;
  entries.push({owner:s.id+':'+(s.bodyTopics?.[i]||i),words:new Set(words)});
 }
 const errors=[];
 for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){
  const a=entries[i],b=entries[j];if(a.owner.split(':')[0]===b.owner.split(':')[0])continue;
  const shared=[...a.words].filter(w=>b.words.has(w)).length;
  const score=shared/Math.max(a.words.size,b.words.size);
  if(shared>=9&&score>=0.78)errors.push('high lexical topic overlap: '+a.owner+' / '+b.owner);
 }
 return errors;
}
function findRecycledThemes(sections){
 const themes=[
  {name:'logic-and-proof',a:/논리|근거|이유|설명/,b:/납득|확인|검토|질문/},
  {name:'responsibility-and-rules',a:/책임|규칙|절차|기준/,b:/확인|설명|납득|검토/}
 ];
 const annualDomainIds=['year_2027_money','year_2027_career','year_2027_relationship'];
 const annualSections=sections.filter(s=>annualDomainIds.includes(s.id));
 const formalResponsibilityRepetition=annualSections.length===3&&annualSections.every(s=>{
  const judgment=String(s.keyJudgment||'');
  return /책임|공식|역할|사회적/.test(judgment)&&/기준|규칙|확인|관리|분배/.test(judgment);
 });
 const annualErrors=formalResponsibilityRepetition?
  ['2027 domain chapters repeat formal responsibility instead of distinct money, career and relationship analysis']:[];
 return [...annualErrors,...themes.flatMap(theme=>{
  // Count the repeated thesis only when BOTH motifs appear in the chapter's
  // own main conclusion. Shared technical vocabulary in long body sections
  // cannot, by itself, convict a genuinely different chapter.
  const owners=sections.filter(s=>{
   const thesis=String(s.keyJudgment||'');
   return theme.a.test(thesis)&&theme.b.test(thesis);
  }).map(s=>s.id);
  return owners.length>=5?['cross-chapter recycled thesis ('+theme.name+'): '+owners.join(' / ')]:[];
 })];
}
async function generate(input,callModel,onProgress=()=>{}){const packet=facts.build(input,2027);if(packet.status!=='ready')return {status:'blocked',packet};const base=buildPrompt(packet);
 Object.assign(base.rules,{profileScoreRule:'profileBalance는 계산된 오행 분포와 MBTI에 정해진 가중치를 더한 화면용 상대 지표다. 관찰한 행동 빈도, 심리검사 결과, 능력, 성공률을 나타내지 않는다. 본문과 evidence에서 이 점수 자체를 성격 결론의 근거로 사용하거나 숫자로 심리 특성을 입증하지 않는다. 원래 사주 계산값과 입력 MBTI를 직접 검토한다.',confidenceStyleRule:'사주와 MBTI가 실제 개인의 행동이나 미래를 확정하지 않는다는 안내는 종합 또는 최종 정리에 한 번 명확히 둔다. 각 문단에서 같은 한계 문장을 반복해 통찰을 흐리지 않는다. 예시는 예를 들어라는 표현으로 구분하고, 근거가 있는 해석은 구체적 행동으로 명확히 쓴다. 실제 사건 예언·재산·건강은 단정하지 않는다. 근거 부족이 특정 판단에 중요한 경우만 그 이유를 한 문장으로 밝힌다.',paragraphGuide:'각 장은 report-outline의 질문마다 본문 문단 하나와 bodyLabel 하나를 작성한다. 분량을 채우기 위해 불필요한 문단을 추가하지 않는다.',tone:'명확하고 구체적인 한국어. 근거 있는 강점은 선명하게 강조하고 주의점은 실제 손해와 행동 변화로 설명한다. 사람을 비난하거나 훈계하지 않는다. 과장과 미래 단정 금지.',titleRule:'title은 한국어로 작성한다. 10~30자 내외의 구체적이고 기억에 남는 제목으로 결론의 핵심을 보여준다. 제목은 본문에서 근거와 행동 예시로 설명하며 자극적인 단정이나 근거 없는 찬사를 금지한다.', narrativeRule:'본문은 목차에 지정된 질문에만 답한다. 사주 원국 장은 확인된 명리 용어·위치·쉬운 뜻을 본문에 설명한 뒤 장단점을 구체화한다. MBTI 장은 유형 네 글자를 나열하는 대신 정보 탐색·결정·외부 생활 선호의 상호작용을 별도로 분석한 뒤 사주와 비교한다. 다른 장은 원국 해석을 다시 설명하지 않고 해당 영역만의 새로운 조건·행동·불리함을 제시한다. 모든 장에 기계적으로 장점·단점·조언을 하나씩 강요하지 않는다. bodyLabels는 body와 개수가 같고 각각 내용을 정확히 요약한 짧은 한국어 소제목이다. 내부 필드명을 쓰지 않는다.', moodRule:'mood는 본문의 핵심 정서에 맞춰 confident(명확한 실행), reflective(이해·성찰), encouraging(근거 있는 강점·회복), cautious(주의·손실)을 선택한다. 분야 이름에 고정하지 않는다.', coverRule:'includeCover일 때 cover를 작성한다. 메인은 평생의 기본 성향과 MBTI 통합을 요약하고 2027년의 배움·책임 같은 연간 해석을 메인 성격으로 대신 쓰지 않는다. headline은 사주와 입력 MBTI를 함께 검토한 그 사람의 핵심을 12~30자 내외로 드러내는 기억에 남는 한국어 문구다. description은 그 핵심이 실제 어떤 행동으로 드러나는지 1~2문장으로 설명한다. cover 문구와 saju_core·mbti_contradiction·integrated_judgment의 title 및 keyJudgment가 서로 같거나 바꿔쓰기만 되지 않도록 한다. 세 카드가 각각 기본 반응·의외의 차이·통합 활용법을 담게 한다. keywords는 입력 사실과 해석에 근거한 구체적인 특징 3~5개, 각 2~9자, # 없이 작성. 기본성향 같은 섹션명 금지. includeCover가 아니면 cover는 null.', finalRule:'finalJudgment는 핵심을 압축한 headline, 근거가 있는 strengths와 watchouts, 구체적 routines를 포함한다. routines 각 항목은 trigger(어떤 상황에서), action(어떤 행동을), reason(왜 도움이 되는지)을 적는다. 본인의 선호를 지우거나 고치라는 훈계가 아니라 강점을 살리고 손해를 줄이는 작은 실험으로 제안한다. 일반적인 긍정적 생각·자신을 믿으라는 말 금지. closingQuestion에는 질문이 아닌 최종 결론을 작성하고 그 뒤에는 텍스트가 없다.'});
 Object.assign(base.rules,{
  // Domain-exclusive interpretation ledger: disallow one personality thesis in twelve disguises.
  domainBoundaryRule:'작성 전 각 장에서 이미 사용한 핵심 반응(예: 논리·근거·납득·확인)을 별도의 해석 성과로 다시 세지 않는다. 새 장은 이전 장과 다른 질문, 다른 계산 근거 또는 MBTI 선호, 다른 조건부 행동을 제시해야 한다. 돈은 벌이/반복 지출/손실 부담의 구체적 선택, 일은 수행하는 과업과 학습·협업 조건, 관계는 친밀감의 형성과 표현·갈등의 실제 상호작용, 스트레스는 압박 전후 행동 변화, 결정은 선택지를 줄이거나 결정을 바꾸는 계기를 구별한다. 같은 주장을 분야의 명사만 바꾸어 반복하면 해당 문단을 작성하지 않는다. 억지로 새 성격을 꾸며내지 않으며 근거가 부족한 항목은 분석의 한계를 명확하게 짧게 쓴다.',
  integrationContrastRule:'MBTI를 사주 결론의 검증이나 증거로 쓰지 않는다. 먼저 사주 계산값과 그 전통적 의미, 다음으로 입력 MBTI의 독립적인 선호 설명, 마지막으로 같은 상황에서 두 해석이 겹치거나 갈라지는 조건을 구분한다. 두 체계가 모두 논리적·신중하다는 식의 같은 형용사 결론으로 끝내지 않는다. 충돌이 없으면 충돌을 창작하지 말고 두 해석의 설명 범위 차이 또는 판단할 수 없는 부분을 명확히 알린다.',
  readerProofRule:'한자와 명리 용어는 내부 evidence에서 정확하게 유지하되, 독자에게 보이는 표제·본문·최종 정리·카드에서는 불필요한 한자를 사용하지 않는다. 사주 기본 장에서 일간·월지·십성 등 첫 등장 전문 용어는 그 자리에서 쉬운 말로 설명한다. 의미 없이 구조·흐름·작용·실행으로 연결 같은 추상어로 마무리하지 말고 누가 어떤 상황에서 무엇을 달리 하는지 자연스러운 문장으로 완성한다.',
  annualDeltaRule:'2027년 네 장에서 평생 성향을 네 번 재설명하지 않는다. 계산된 그해의 기둥과 실제 제공된 대운·충 관계가 해당 주제에 추가하는 해석만 따로 서술한다. 2027년 돈·일·관계에서 동일한 책임·규칙·확인 이야기를 반복할 수 없다. 식상·재성·관성 등 특정 십성이 적거나 드러나지 않는다는 설명만으로 새 수입이 적다거나 저축·지출 통제가 늘어난다고 결론짓지 않는다. 계산된 충이 없다는 사실만으로 관계 갈등이나 큰 변화가 없다고 결론짓지 않는다. 계산한 관계가 충뿐이라면 다른 합·형·해를 검토하지 않았음을 고려한다. 분야별로 서로 다른 계산 근거가 없으면 변화가 확인되지 않는다고 명시하고 임의의 사건을 예측하지 않는다.',
  liveQaCorrections:'이전 실전 검증에서 반복 발견된 오류를 재발시키지 않는다. 독자에게 보이는 모든 장에서 庚·丙·丁·乙酉처럼 한자를 괄호로 병기하지 않는다(원국 표는 예외). 내부 evidence에는 한자와 실제 위치를 보존한다. 기본 사주 장에서는 일간·월지·십성이 무엇을 뜻하는지 각 용어가 처음 등장한 문장에서 설명하며, 경금(庚)처럼 한자만 덧붙이는 행위는 뜻풀이가 아니다. 2027년에는 연간이라는 모호한 표현 대신 출생 연도와 혼동하지 않게 2027년의 하늘 글자라고 풀어 쓰고, 내부 evidence는 2027년 세운 천간으로 구분한다. 구조가·구조를·실행으로 연결 등 AI식 추상어를 쓰지 말고 실제 어떤 선택과 행동을 뜻하는지 평범한 한국어로 적는다. 동일한 규칙·책임·근거 확인을 네 개 운세 장에 반복해서 2027년 금전운·직업운·관계운을 채우지 않는다.',
  editorialVersion:'reader-v3',
  keyJudgmentRule:'핵심 판정은 이 사람의 구체적인 반응을 짧은 합니다체 한 문장으로 표현한다. ~쪽으로 읽습니다·살펴봅니다·무게를 둡니다·판단해 볼 수 있습니다처럼 분석 작업을 설명하며 끝내지 않는다. 예: 직접 써 본 뒤 마음에 드는지 결정합니다. 본문에서 사주 해석임을 구분하고 근거와 해당 상황을 설명한다. 실제 과거·미래를 단정하지 않는다.',
  coverEditingRule:'상단 headline과 세 카드 제목은 설명문이나 ~하기라는 과제명이 아니라 사람의 특징이 바로 떠오르는 짧은 결론이다. description에서 무게를 둡니다·선택을 살펴봅니다 같은 분석가의 작업 설명을 빼고 그 사람이 무엇을 하는지 말한다. 강한 문구를 위해 사실을 과장하지 않는다.',
  factCoverageRule:'facts.tenGods에는 원국의 천간·지장간 십성, natalClashes에는 원국 지지 충, annualTenGods에는 해당 연도 십성이 계산되어 있다. glossary는 전통적 뜻이지 관찰된 성격이 아니다. 원국 전체를 읽고 각 분야에 맞는 근거를 선택한다. 기토 같은 일간 하나나 MBTI만 반복하지 않는다. 연간 지지 충 목록이 비었다고 연간 해석 자료 전체가 없다고 쓰지 않는다. 출생시간 미상일 때는 시주와 대운만 제외하며 이미 계산된 연간 십성과 원국 관계는 해석할 수 있다. 일·돈·관계에서 서로 다른 계산 항목을 선택하되 없는 항목을 만들지 않는다. 판단 불가 안내를 12장에 반복하지 말고 실제로 부족한 판단만 짧게 제한한다.',
  hanjaPolicy:'한자는 원국 표에서만 쓴다. 명리 용어를 지우지 말고 처음 등장할 때 뜻을 괄호로 설명한다. 예: 식신(생각을 말이나 결과물로 표현하는 성질). 오행 개수만으로 신강·신약·용신을 판정하거나 계산에 없는 합충·십성을 만들지 않는다.',
  tone:'해석의 결론은 짧고 분명한 합니다체로 쓴다. 편입니다·수 있습니다·보입니다를 연달아 붙이지 않는다. 계산 사실은 사실로, 전통 해석은 사주에서는 ~로 읽습니다로 구분한 뒤 실제 행동을 구체적으로 설명한다. 명확한 어조를 위해 미래나 실제 성격을 확정하거나 과장하지 않는다.',
  narrativeRule:'각 장은 3~4개의 의미가 다른 문단으로 깊이 있게 설명한다. 모든 장을 강점→단점→조언이라는 동일한 틀로 찍어내지 않는다. 첫 문단에서 제목의 질문에 답하고 계산 근거의 뜻을 풀어준다. 나머지는 해당 분야의 서로 다른 상황·대조·원인을 설명한다. 조언은 해당 장에서 꼭 필요할 때만 쓰고, 행동 루틴은 최종 정리에 집중한다. 문단별 bodyLabels는 실제 내용을 요약하고 몸통 내용과 수가 같아야 한다.',
  diversityRule:'아래 분야별 질문 중 계산 근거가 뒷받침하는 것을 골라 답한다. 모든 사람에게 같은 결론을 주거나, 모든 장을 확인·기준·책임·비용 이야기로 귀결하지 않는다. 같은 근거를 다시 쓸 때도 새로운 명리 관계나 다른 행동 원인이 있어야 한다. 근거가 없다면 새로운 특징을 꾸미지 않고 해석의 한계를 간결히 밝힌다.',
  sectionQuestions:{saju_core:'자연스럽게 힘을 쓰는 일과 유독 쉽게 지치는 일은 무엇이며 왜 다른가?',mbti_contradiction:'입력 MBTI의 선호와 사주 해석이 일치하는 점과 다른 점은 무엇인가? 차이를 억지로 만들지 말 것.',decision:'모르는 일을 결정할 때 무엇을 먼저 보고, 결정을 바꾸게 하는 것은 무엇인가?',money:'돈을 쓰고 싶어지는 이유, 만족이 오래가는 소비, 남에게 돈을 쓸 때의 차이는?',career:'배우는 방식, 혼자 일할 때와 협업할 때, 성과를 인정받는 방식은 어떻게 다른가?',relationship:'친해지는 속도, 애정 표현, 서운할 때의 반응은 어떻게 이어지는가?',stress:'평소와 달리 압박받을 때 말·집중·행동의 무엇이 먼저 바뀌는가?',integrated_judgment:'사주와 MBTI를 함께 보아야 설명되는 장점과 그 장점이 약점으로 바뀌는 경계는?',year_2027:'해당 연도의 천간·지지가 원국과 맺는 계산된 관계는 무엇이고 평소와 해석이 어떻게 다른가?',year_2027_money:'그해의 계산 근거로 평소 소비·저축·금전 약속 중 어느 부분을 달리 읽는가?',year_2027_career:'그해의 계산 근거로 학습·역할 변화·협업 중 무엇을 다르게 읽는가?',year_2027_relationship:'그해의 계산 근거로 만남의 태도·연락·갈등 대응 중 무엇을 다르게 읽는가?'},
  proofreadingRule:'출력 전 제목·근거·본문·요약 전체를 한국어 편집자 관점으로 교정한다. 조사와 서술어 호응, 중복 구절, 오타, 번역투, 뜻 없는 합성어를 바로잡는다. 쉬운 단어를 이상하게 조합한 추상 문장도 고친다. 예: 관계의 비용을 조정한다 → 부담스러운 부탁은 맡을 수 있는 일만 답한다. 전문적인 깊이는 계산 근거와 인과 설명에서 확보하고 어려운 문장으로 흉내내지 않는다.'
 });

 const outline=require('./report-outline');
 const premiumGoals=require('./report-prompt').sectionGoals;
 Object.assign(base.rules,{
  depthVersion:outline.version,topicPlan:outline.topics,sectionGoals:premiumGoals,
  paragraphGuide:'각 장의 topicPlan 질문에 각각 답한다. 합쳐진 질문을 다시 세분화하지 않는다. bodyTopics와 bodyLabels 순서를 유지하고 주제당 문장 수를 고정하지 않는다. 특히 성격을 설명하는 장은 계산된 근거를 내부에서 확인하고 실제 생각과 행동을 충분히 설명한다. 사주 원국 장에는 실제 계산된 주요 명리 용어와 짧은 뜻을 본문에 포함한다. 다른 장에서는 꼭 필요한 명리 용어만 쉽게 풀어 쓴다. 다른 장도 주장에 필요한 이유와 조건을 생략하지 않되, 설명을 마친 뒤 같은 결론이나 교훈으로 분량을 늘리지 않는다. evidence에는 계산 위치와 해석의 연결 근거를 자세히 쓰며, 원국 본문에도 독자가 확인해야 할 핵심 근거를 명시한다. 본문은 같은 행동의 이유와 결과가 자연스럽게 이어지게 쓴다.',
  narrativeRule:'각 본문은 해당 질문에 대한 해석을 바로 설명한다. 180~300자 분량 목표를 없앤다. 계산된 사실을 내부에서 확인하되 사용자에게 계산 순서나 해석 과정 자체를 장황하게 보여주지 않는다. 앞선 항목과 같은 이야기라면 핵심 차이만 남긴다. 해석이 부족하면 꾸며서 채우지 않는다.',
  domainUniquenessRule:'돈은 벌기·쓰기·모으기·함께 쓰기, 직업은 배움·업무 적합성·조직·협업·진로, 관계는 우정·연애·애정·결혼생활·가족을 각각 별도로 분석한다. 모든 분야를 작업·수정·요청·비용 이야기로 바꾸지 않는다. 알려지지 않은 현재 직업·연애 여부·가족사를 지어내지 말고 해당 상황일 때의 해석으로 쓴다.',
  confidenceStyleRule:'사주 해석의 한계는 최종 정리에 한 번 명확히 밝힌다. 문단마다 단정하지 않습니다·알 수 없습니다로 끝내지 않는다. 특정 근거가 없는 판단은 그 판단만 짧게 제한하고, 계산된 다른 근거로 답할 수 있는 내용을 설명한다. 과거 사실·건강 진단·성공률·사건 발생·계산하지 않은 월별 시기를 만들지 않는다.',
  evidenceRule:'evidence 필드는 내부 검증용으로 유지하되 사용자 본문에 사주의 근거라는 별도 설명을 반복하지 않는다. 계산된 여러 요소를 종합해 해석하고 계산하지 않은 강약·용신은 판정하지 않는다. 명리 용어 설명은 결과를 이해하는 데 꼭 필요할 때만 본문에 짧게 넣는다.',
  coverRule:'본문 단계에서는 cover와 finalJudgment를 null로 반환한다. 최종 선별 단계에서는 교정이 끝난 전체 본문만을 근거로 cover와 finalJudgment를 작성한다. 메인은 연간 운세만으로 평생 성격을 요약하지 않는다. highlights는 12장 전체에서 서로 다른 세 장을 고른다. 기본 성향·의외의 차이·종합이라는 고정 틀 대신 그 사람에게 중요한 실제 특징 세 개를 고른다. sectionId는 원문 장의 id, title과 description은 해당 본문에 근거한 간결한 결론이다. 다른 특징 세 개를 선별하고 상단 headline을 되풀이하지 않는다.',
  finalRule:'전체 본문에서 중요한 강점·주의점·행동 루틴을 우선순위대로 선별한다. 앞 장을 하나씩 요약하는 나열이나 연간 운세 중심 결론을 피한다. 서로 다른 분야의 행동을 고르고 실제 상황·행동·이유를 연결한다. closingQuestion 뒤에는 텍스트를 넣지 않는다.'
 });
 Object.assign(base.rules,require('./report-editorial').rules);
 base.promptVersion='reader-depth-v2';
 // Keep one authoritative instruction per concern. Repeating old policies inflates every request.
 const ruleKeys=['sectionGoals','integrateMbti','factsOnly','noPersonalHistoryInference','noDeterministicPrediction','mbtiOptionalRule','hanjaPolicy','tone','titleRule','keyJudgmentRule','narrativeRule','paragraphGuide','domainUniquenessRule','evidenceRule','confidenceStyleRule','profileScoreRule','factCoverageRule','proofreadingRule','moodRule','namePolicy','avoidPhrases','depthVersion','diversityRule','coverEditingRule','year2027Rule','year2027ComparisonRule','year2027DomainRule','mbtiDepthRule','plainSentenceRule','concreteReviewRule','candidRule','weaknessActionRule','naturalKoreanRule','coverNaturalnessRule','decisiveSentenceRule','actionableMoneyRule','idiomaticWritingRule','everydayWordChoiceRule','coherenceRule','expressionPolicyRule','depthAndEvidenceRule','yearAndDecadeIntegrationRule','domainBoundaryRule','integrationContrastRule','readerProofRule','annualDeltaRule','liveQaCorrections','editorialVersion'];
 const summaryRules={integrateMbti:base.rules.integrateMbti,factsOnly:true,noPersonalHistoryInference:true,noDeterministicPrediction:true,namePolicy:base.rules.namePolicy,mbtiOptionalRule:base.rules.mbtiOptionalRule,tone:base.rules.tone,hanjaPolicy:base.rules.hanjaPolicy,coverRule:base.rules.coverRule,finalRule:base.rules.finalRule,confidenceStyleRule:base.rules.confidenceStyleRule,proofreadingRule:base.rules.proofreadingRule,coverEditingRule:base.rules.coverEditingRule,plainSentenceRule:base.rules.plainSentenceRule,concreteReviewRule:base.rules.concreteReviewRule,candidRule:base.rules.candidRule,weaknessActionRule:base.rules.weaknessActionRule,naturalKoreanRule:base.rules.naturalKoreanRule,coverNaturalnessRule:base.rules.coverNaturalnessRule,decisiveSentenceRule:base.rules.decisiveSentenceRule,actionableMoneyRule:base.rules.actionableMoneyRule,idiomaticWritingRule:base.rules.idiomaticWritingRule,everydayWordChoiceRule:base.rules.everydayWordChoiceRule,coherenceRule:base.rules.coherenceRule,expressionPolicyRule:base.rules.expressionPolicyRule,depthAndEvidenceRule:base.rules.depthAndEvidenceRule,yearAndDecadeIntegrationRule:base.rules.yearAndDecadeIntegrationRule};
 const retiredRules=new Set(['decisiveSentenceRule','actionableMoneyRule','idiomaticWritingRule','everydayWordChoiceRule','expressionPolicyRule']);
 const activeRuleKeys=ruleKeys.filter(key=>!retiredRules.has(key));
 for(const key of retiredRules)delete summaryRules[key];
 for(const key of ['domainBoundaryRule','integrationContrastRule','readerProofRule','annualDeltaRule','liveQaCorrections'])summaryRules[key]=base.rules[key];
 const reviewKeys=['topicOwnershipRule','interpretationFirstRule','readerLanguageRule','internalEvidenceScopeRule'];
 for(const key of reviewKeys)summaryRules[key]=base.rules[key];
 base.rules=Object.fromEntries([...activeRuleKeys,...reviewKeys].map(key=>[key,base.rules[key]]));
 base.rules.avoidPhrases=quality.forbiddenPhrases;summaryRules.avoidPhrases=quality.forbiddenPhrases;
 const editorialBlueprint=analysisGuidance.preflight(packet);
 const groups=[['saju_core','mbti_contradiction'],['decision','year_2027'],['money','year_2027_money'],['career','year_2027_career'],['relationship','year_2027_relationship'],['stress','integrated_judgment']];
 // Evidence-limited annual domains keep their chapters for compatibility, but
 // must not manufacture two lengthy predictions to fill the topic slots.
 for(const id of ['year_2027_money','year_2027_career','year_2027_relationship']){
  const annual=editorialBlueprint[id]?.annualDomainEvidence;
  if(!annual?.relevant){
   editorialBlueprint[id].generationMode='evidence-limit-only';
   editorialBlueprint[id].contentPolicy='두 세부 항목은 각각 다른 계산 정보의 부재를 명확히 설명한다. 기존 성격·책임·기준 설명을 다른 표현으로 채우지 않고, 2027년의 금전·직업·관계 사건을 암시하지 않는다. 근거를 만들어 긴 해석을 하지 않는다.';
  }else editorialBlueprint[id].generationMode='evidence-grounded';
 }
 const noMbti=packet.person?.mbti==='모름';
 const unknownMbtiGoals={
  mbti_contradiction:'성격유형 정보가 입력되지 않았다. 유형을 추정하거나 입력되지 않은 유형을 분석하지 않는다. 대신 원국의 서로 다른 두 위치와 십성 근거를 대조해 겉으로 보이는 반응과 혼자 결정할 때의 반응이 달라질 수 있는 조건을 설명한다. 차이를 만들 근거가 없으면 같다고 설명한다.',
  integrated_judgment:'성격유형 정보가 입력되지 않았다. 입력되지 않은 성격 선호를 가정하지 않는다. 원국에서 실제 확인된 서로 다른 위치·십성의 관계를 하나의 선택 상황에 적용해 강점과 약점이 바뀌는 경계를 종합한다. 앞 장의 결론을 단순 반복하지 않는다.'
 };
 const noMbtiSectionGoals={
  ...Object.fromEntries(Object.entries(premiumGoals).map(([id,goal])=>[id,goal])),
  ...unknownMbtiGoals,
  decision:'사주 원국에서 실제 계산된 식상·인성·관성의 위치를 확인하고 정보를 얻는 순서, 결정을 내리는 기준, 판단을 바꾸는 상황을 서로 구분한다. 계산에 없는 십성을 만들지 않고 실제 경험을 단정하지 않는다.',
  money:'원국의 재성·식상·관성 중 실제 계산된 위치를 확인해 벌기·쓰기·모으기·함께 쓰기의 해석을 분리한다. 입력되지 않은 소비 이력이나 성격 특성을 단정하지 않는다.',
  career:'원국에서 확인된 관성·인성·식상의 위치와 천간·지장간 차이를 살펴 규칙·학습·결과 표현·협업의 조건을 구분한다. 실제 직업·성과는 추정하지 않는다.',
  relationship:'원국 일지와 실제 계산된 십성·지지 관계를 바탕으로 친밀감·표현·갈등·거절의 서로 다른 상황을 해석한다. 입력되지 않은 성격 유형이나 실제 연애·가족사를 추정하지 않는다.',
  stress:'원국의 실제 십성 위치와 월지의 계절 조건, 확인된 지지 관계를 각각 살펴 평소 유리한 반응과 압박 상황에서 불리해질 수 있는 반응을 구분한다. 촉박한 결정, 갑작스러운 일정 변경, 의견 충돌을 같은 반응으로 취급하지 않고 근거가 있는 상황만 선택한다. 건강 증상이나 실제 경험을 만들어내지 않는다.'
 };
 const sajuOnlyTopics={
  mbti_contradiction:{
   agreement:'원국에서 밖으로 드러나기 쉬운 반응을 뒷받침하는 계산 근거',
   difference:'같은 원국에서 혼자 판단할 때 달라질 수 있는 반응과 그 조건'
  },
  integrated_judgment:{
   insight:'원국의 서로 다른 두 근거를 함께 읽을 때 드러나는 새로운 선택 조건',
   tradeoff:'같은 강점이 불리해지는 상황과 실제로 구분해 볼 행동'
  }
 };
 const scopedGoals=(ids)=>Object.fromEntries(ids.map(id=>[id,noMbti?noMbtiSectionGoals[id]:premiumGoals[id]]));
 const validateBatch=(result,ids)=>{
  const fail=(reason,info={})=>{console.error('[Report batch incomplete]',{reason,requestedIds:ids,...info});throw Error('AI report service returned invalid report structure')};
  if(!Array.isArray(result?.sections))fail('sections not array');
  const actualIds=result.sections.map(s=>s?.id);
  if(JSON.stringify(actualIds)!==JSON.stringify(ids))fail('section order/count mismatch',{actualIds});
  for(const section of result.sections){
   const topics=Object.keys(outline.topics[section.id]);
   const actualTopics=section.bodyTopics;
   if(JSON.stringify(actualTopics)!==JSON.stringify(topics))fail('topic keys mismatch',{sectionId:section.id,expectedTopics:topics,actualTopics});
   if(!Array.isArray(section.body)||!Array.isArray(section.bodyLabels)||section.body.length!==topics.length||section.bodyLabels.length!==topics.length)
    fail('paragraph/label count mismatch',{sectionId:section.id,expected:topics.length,paragraphCount:section.body?.length??null,labelCount:section.bodyLabels?.length??null});
   if(section.body.some(p=>typeof p!=='string'||!p.trim())||section.bodyLabels.some(p=>typeof p!=='string'||!p.trim()))
    fail('empty paragraph/label',{sectionId:section.id});
  }
  return result;
 };
 const request=(ids,extra={})=>({...base,...extra,analysisGuidance:{...analysisGuidance.forRequest(ids,packet.person?.mbti),editorialBlueprint:Object.fromEntries(ids.map(id=>[id,editorialBlueprint[id]]))},requestedSections:ids,includeFinal:false,includeCover:false,rules:{...base.rules,...extra.rules,sections:ids,sectionGoals:scopedGoals(ids),topicPlan:Object.fromEntries(ids.map(id=>[id,noMbti&&sajuOnlyTopics[id]?sajuOnlyTopics[id]:outline.topics[id]])),returnOnlyRequestedSections:true},output:{...base.output,requestedSections:ids,cover:'null',finalJudgment:'null'}});
 let done=0;onProgress({stage:'body',completed:0,total:12});
 // Preserve complete earlier paragraphs: later sentences can contain the repeated
 // consequence or advice. No extra model call is used to summarize or rewrite them.
 const priorSections=[];
 const drafts=await mapLimited(groups,async ids=>{
  const result=validateBatch(await callModel(request(ids,{
   stage:'body',priorSections:priorSections.slice(),
   planningInstruction:'각 장은 editorialBlueprint의 서로 다른 질문을 먼저 해결한다. 특히 editorialBlueprint[id].topicTasks의 세부 항목마다 서로 다른 질문·primaryEvidencePath·mode를 먼저 확인한다. mode가 use-verified-fallback이면 verifiedFallbackPaths의 실제 계산 근거만 제한적으로 해석한다. mode가 state-limits이면 장황한 일반론으로 채우지 말고 해석할 수 없는 부분을 분명하게 알린다. 2027년 금전·일·관계 장은 editorialBlueprint[id].annualDomainEvidence.relevant를 반드시 확인한다. generationMode가 evidence-limit-only이면 두 세부 항목을 예언이나 성격 일반론으로 채우지 말고 독립 계산 정보의 부족과 분야별로 확인할 수 없는 범위를 각각 짧고 명확하게 설명한다. false면 근거 없는 금전 기회·승진·결혼 예측이나 공통 책임 성향을 꾸며 쓰지 않고 직접 근거가 없는 이유를 설명한다. 같은 명리 계산값을 여러 항목에서 사용해도 같은 행동 결론을 재생산하면 안 된다. 근거가 약한 항목은 장황한 성격 반복이 아니라 해당 질문에서 알 수 없는 범위를 명확히 쓴다. primary 근거가 없더라도 fallbackEvidencePaths에 실제 존재하는 계산 항목이 있으면 그것만 사용하여 제한적으로 풀이한다. negativeEvidence는 해당 충 관계가 계산되지 않았다는 뜻이지 모든 인간관계·연운의 변화가 없다는 뜻이 아니다. 대체 근거도 없으면 requiredMode에 따라 부족한 부분을 밝혀라. 근거가 없다고 성격이나 사건을 꾸며내지 않는다. 다른 장의 질문을 답하거나 논리·근거·책임 같은 표현을 분야만 바꾸어 반복하지 않는다.',
   editorialTask:'이 응답은 결제 고객에게 제공할 최종 본문 원고다. 각 topicPlan 질문에 계산된 근거가 실제로 답할 수 있는 부분을 먼저 선정하고, 해석의 이유·서로 다른 근거의 충돌·불리한 부분까지 읽는 사람이 이해할 수 있도록 완결된 문장으로 설명한다. 사주 원국 장에서는 일간·월지·십성의 실제 값과 위치를 본문에서 밝히고 처음 나오는 명리 용어를 괄호로 풀어 쓴다. MBTI 장에서는 정보를 받아들이는 선호와 판단 선호가 만나는 조건을 분석하고 실제 성격을 측정했다고 주장하지 않는다. 돈은 수입·지출·위험, 직업은 역할·학습·조직, 관계는 친밀감·표현·갈등으로 서로 다른 질문에 답한다. 2027년은 계산된 세운과 대운을 해당 분야에 연결할 수 있을 때만 평소와 다른 점을 밝힌다. priorSections와 같은 반응이나 조언을 직업·돈·관계라는 명사만 바꾸어 반복하지 않는다. 유효한 새 해석이 없으면 지어내지 말고 그 질문에 답할 수 있는 근거만 정확히 제시한다. 일반적 계약서 확인이나 소통하라는 상투적 조언, 사용자 과거 경험의 창작은 금지한다. 필수 bodyTopics 순서를 지키되 한 줄짜리 요약으로 분석을 대체하지 않고 한국어 문맥과 조사·서술어 호응을 점검한다. 별도 유료 재작성 호출은 하지 않는다.'
  })),ids);
  // Reject incomplete or unsupported model output before spending another provider call.
  // The final full-report editorial gate still runs after synthesis.
  const preliminary=quality.verifyEvidenceAgainstFacts({sections:result.sections},packet);
  if(preliminary.errors.length){console.error('[Report batch factual mismatch]',{requestedIds:ids,errors:preliminary.errors});throw Error('AI report service returned factually inconsistent report data')}
  // Reject reader-visible defects from the first paid QA before buying more chapters.
  // Internal evidence keeps original Hanja; only reader-facing prose is checked.
  const earlyEditorial=[];
  const editable=require('./report-editorial');
  for(const s of result.sections){
   const displayed=[s.title,s.keyJudgment,...(s.bodyLabels||[]),...(s.body||[])];
   for(const problem of editable.wordingErrors(displayed))
    earlyEditorial.push(s.id+': '+problem);
   if(/[\u3400-\u4dbf\u4e00-\u9fff]/.test(displayed.join(' ')))
    earlyEditorial.push(s.id+': unnecessary Hanja in general-audience prose');
  }
  if(earlyEditorial.length){
   console.error('[Report batch reader quality mismatch]',{requestedIds:ids,errors:earlyEditorial});
   throw Error('AI report service returned reader-facing editorial defects');
  }
  // Reusing a substantive evidence sentence across chapters is report padding.
  // Catch it before buying the next batch instead of waiting for final QA.
  const priorEvidence=new Map();
  for(const section of priorSections)for(const item of section.evidence||[]){
   const key=String(item||'').replace(/\s+/g,' ').trim().replace(/[.!?。！？]+$/,'');
   if(key.length>=24)priorEvidence.set(key,section.id);
  }
  for(const section of result.sections)for(const item of section.evidence||[]){
   const key=String(item||'').replace(/\s+/g,' ').trim().replace(/[.!?。！？]+$/,'');
   if(key.length<24)continue;
   const owner=priorEvidence.get(key);
   if(owner&&owner!==section.id)throw Error('AI report service returned repeated chapter evidence');
   priorEvidence.set(key,section.id);
  }
  const topicDuplicates=findRepeatedTopicContent([...priorSections.map(s=>({id:s.id,body:s.topicConclusions,bodyTopics:s.bodyTopics})),...result.sections]);
  if(topicDuplicates.length){
   console.error('[Report batch repeated topics]',{requestedIds:ids,errors:topicDuplicates});
   throw Error('AI report service returned duplicated topic explanations');
  }
  const earlyThemeErrors=findRecycledThemes([...priorSections.map(s=>({id:s.id,keyJudgment:s.keyJudgment,body:s.topicConclusions})),...result.sections]);
  if(earlyThemeErrors.length){
   console.error('[Report repeated thesis before next provider call]',{requestedIds:ids,errors:earlyThemeErrors});
   throw Error('AI report service returned cross-chapter recycled thesis');
  }
  priorSections.push(...result.sections.map(s=>({id:s.id,keyJudgment:s.keyJudgment,bodyLabels:s.bodyLabels,bodyTopics:s.bodyTopics,topicConclusions:s.body.slice(),evidence:s.evidence.slice()})));
  onProgress({stage:'body',completed:done+=ids.length,total:12});return result;
 });
 const meta={calculationNote:'입력한 출생 시각을 그대로 사용하며 출생지에 따른 시간 차이는 보정하지 않습니다. 밤 11시대도 입력한 날짜로 계산합니다. 2027년 풀이는 전통적인 사주 계산에 따른 참고 해석이며, 실제 사건을 예측한 결과는 아닙니다. 여러 해에 걸친 변화는 연도별로 비교하며 바뀌는 정확한 날짜까지 구분하지 않습니다.',characterGender:input.gender||'male',name:input.name||'',mbti:input.mbti||'모름',chart:packet.chart,profileBalance:packet.profileBalance,targetYear:2027,versions:{ruleset:'premium-v2',prompt:'reader-depth-v2',schema:outline.version}};
 const drafted=new Map(drafts.flatMap(p=>p.sections||[]).map(section=>[section.id,section]));
 const sections=IDS.map(id=>drafted.get(id));
 // Select the cover only after all 12 complete chapters. The final local quality
 // gate below remains mandatory; no automatic paid rewrite or retry is issued.
 // Stop before paying for synthesis when chapters already recycle the same thesis.
 // No extra model call, and the rejected draft remains available for operator QA.
 const repeatedErrors=[...findRecycledThemes(sections),...findParaphrasedTopicContent(sections)];
 if(repeatedErrors.length){
  const report={meta,sections,cover:null,finalJudgment:null};
  return {status:'rejected',report,qa:{pass:false,errors:repeatedErrors,warnings:[]},headingRepairs:[],stoppedBeforeSynthesis:true};
 }
 const summaryPrompt={...base,stage:'synthesis',requestedSections:[],includeFinal:true,includeCover:true,completedReport:{meta,sections},rules:{...summaryRules,sections:[],returnOnlyRequestedSections:true,finalEditingTask:'완성된 12개 장에서 가장 중요한 장점과 손해를 줄 수 있는 행동을 연결해 총평을 쓴다. 새로운 성격을 만들어내거나 장별 요약을 나열하지 않는다. 한계 안내는 총평 본문에 한 번만 쓰고 closingQuestion은 반드시 사람에 대한 결론으로 끝낸다. 같은 결론으로 도입·요약·마지막 문장을 세 번 쓰지 않는다. 실질적인 새 조언이 없으면 routines는 빈 배열로 반환한다. 억지로 교훈을 붙이지 않는다.'},output:{...base.output,requestedSections:[],cover:'required',finalJudgment:'required'}};
 onProgress({stage:'synthesis',completed:0,total:1});
 let summary=await callModel(summaryPrompt);
 let report={meta,sections,cover:summary.cover,finalJudgment:summary.finalJudgment};
 const headingRepairs=require('./report-heading-review').repair(report);
 let shape=validateShape(report),qa=shape.pass?quality.validate(report,packet):shape;

 return qa.pass?{status:'ready',report,qa,headingRepairs}:{status:'rejected',report,qa,headingRepairs};
}
module.exports={IDS,validateShape,buildPrompt,generate,findRepeatedTopicContent,findRecycledThemes,findParaphrasedTopicContent};


