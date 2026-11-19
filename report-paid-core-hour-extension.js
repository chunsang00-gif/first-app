'use strict';
// Actual paid first chapter: optional chart-specific HOUR meaning for an
// an explicitly submitted *single-domain* reader concern. Different from
// FREE birth-month facts. Traditional-symbol comparison only; NO prediction,
// verified life trait or professional/editorial approval.
const HIDDEN=require('./report-seasonal-evidence').HIDDEN;
const DOMAINS=Object.freeze({
 skill:Object.freeze({
  query:/(배우|익히|공부|기술|교육|자격|훈련|학습|수업|연습|제작|만들|창작)/,
  roles:Object.freeze(['식신','상관']),label:'배움·기술',
  meanings:Object.freeze({
   식신:'배운 것을 눈에 보이는 결과로 마무리하는 질문',
   상관:'기존의 규칙과 새로운 표현·개선 방식을 구분하는 질문'
  }),
  compare:'배우거나 익힌 내용을 실제로 만들어 보여 줄 경우와 기존 방식을 바꾸어 제안할 경우에 무엇을 따로 살펴야 하는지 가정으로 구별한다.'
 }),
 money:Object.freeze({
  query:/(저축|적금|투자|주식|코인|지출|소비|대출|상환|자금|월급|연봉|수입|소득|급여|금전|돈을|돈이|돈은|돈과|돈보다)/,
  roles:Object.freeze(['정재','편재']),label:'돈·자원',
  meanings:Object.freeze({
   정재:'정해진 금액과 반복해서 필요한 자원을 살펴보는 질문',
   편재:'필요한 자원을 여러 경로에서 마련하는 질문'
  }),
  compare:'매번 들어가는 비용을 따져볼 경우와 새로운 자원을 찾아 마련할 경우에 필요한 확인 조건을 나누어 설명한다.'
 }),
 pressure:Object.freeze({
  query:/(스트레스|압박|부담|긴장|과로|급한\s*요구|업무\s*요구|마감\s*압력)/,
  roles:Object.freeze(['정관','편관']),label:'규칙·외부 요구',
  meanings:Object.freeze({
   정관:'정해진 규칙과 맡은 책임의 범위를 살펴보는 질문',
   편관:'예상하지 못한 요구와 책임 경계를 살펴보는 질문'
  }),
  compare:'평소에 정해진 절차로 대응하는 경우와 갑자기 새로운 요구가 들어오는 경우의 확인 조건을 나누어 설명한다.'
 })
});
function domainFor(question){
 if(typeof question!=='string'||!question.trim()||question.length>140)return null;
 const found=Object.entries(DOMAINS).filter(([,v])=>v.query.test(question));
 return found.length===1?found[0]:null;
}
// In the FREE preview's "year-hour" card, buyers ALREADY see the
// traditional category of BOTH visible birth-year and visible birth-hour
// stems. A birth-hour HIDDEN stem with that SAME category is a different
// physical source, but is NOT a novel traditional category for the reader.
// Do not monetize that duplicated meaning as an "independent" first chapter.
// The month card also exposes both month stem and month main hidden role.
// Secondary-month linkage in the FREE preview only appears when it matches
// one of the visible year/hour roles, which this also excludes.
function alreadyPublicNatalRoles(packet){
 const ten=packet?.facts?.tenGods;
 const month=ten?.month;
 const mainStem=packet?.facts?.structuralEvidence?.monthCommand?.mainHiddenStem;
 const mainRole=month?.hiddenStems?.find(row=>row.stem===mainStem)?.tenGod;
 if(!month?.stemTenGod||!mainRole||!ten?.year?.stemTenGod||
    !ten?.hour?.stemTenGod||packet?.calculationInput?.unknownBirthTime===true)
  throw Error('CORE_HOUR_PUBLIC_NATAL_ROLES_UNVERIFIED');
 return new Set([month.stemTenGod,mainRole,
  ten.year.stemTenGod,ten.hour.stemTenGod]);
}
function build(packet,source){
 if(packet?.status!=='ready'||packet.calculationInput?.unknownBirthTime===true||
    !packet.calculationInput?.birthTime||!packet.chart?.hour)return null;
 const q=packet.person?.readerDecision;
 const selected=domainFor(q);
 if(!selected)return null;
 const [readerDomain,domain]=selected;
 const kinds=new Set(domain.roles);
 const month=packet.facts?.tenGods?.month,hour=packet.facts?.tenGods?.hour;
 const main=packet.facts?.structuralEvidence?.monthCommand?.mainHiddenStem;
 if(!month?.stemTenGod||!main||!hour?.stemTenGod)throw Error('CORE_HOUR_MONTH_OR_HOUR_MISSING');
 const mainRow=month.hiddenStems?.find(x=>x.stem===main);
 if(!mainRow?.tenGod)throw Error('CORE_HOUR_MONTH_MAIN_MISSING');
 const already=alreadyPublicNatalRoles(packet);
 const found=(hour.hiddenStems||[]).filter(x=>
  kinds.has(x.tenGod)&&!already.has(x.tenGod));
 if(found.length!==1)return null;
 const h=found[0],a='natal.hour.stem',b='natal.hour.hidden.'+h.stem;
 const outer=source?.[a],inner=source?.[b];
 if(!outer||!inner||outer.stem!==hour.stem||outer.tenGod!==hour.stemTenGod||
    inner.stem!==h.stem||inner.tenGod!==h.tenGod||
    inner.position!=='시지'||outer.position!=='시간'||
    inner.observedBehavior!==false||outer.observedBehavior!==false||
    !inner.traditionalMeaning||!outer.traditionalMeaning||
    !HIDDEN[packet.chart.hour[1]]?.includes(h.stem)||
    source?.['natal.month.stem']?.tenGod!==month.stemTenGod||
    source?.['natal.month.hidden.'+main]?.tenGod!==mainRow.tenGod)
  throw Error('CORE_HOUR_ADDITION_SOURCE_DRIFT');
 const meaning=domain.meanings[h.tenGod];
 if(!meaning)throw Error('CORE_HOUR_DOMAIN_ROLE_NOT_VERIFIED');
 // After the real one-shot Terra review, this specific dilemma exposed a
 // missing distinction: both alternatives were phrased as "make/show an
 // output". Model prompts must assign DIFFERENT conditional checks instead
 // of just restating the same output verb. These are reader examples, not
 // new natal calculations or claims about the actual customer's work.
 const distinctChoiceGoal=readerDomain==='skill'&&
   /(?:유지할지|이어\s*갈지|계속할지)/.test(q)&&
   /(?:배울지|익힐지|학습할지)/.test(q)?
   '독자가 선택한 두 경우를 각각 이름 붙인 독립된 문장으로 쓴다. '+
   '현재 일을 유지하는 가정에서는 기존 결과물이나 기존 방식 중 무엇을 평가하고 어떤 변경 기준을 확인할지 질문한다. '+
   '새 기술을 배우는 가정에서는 작은 연습 결과물의 완성 조건과 확인할 기간·자원을 구별해 묻는다. '+
   '양쪽을 똑같이 무엇을 만들어 보여 줄지만 묻거나, 같은 행동을 단어만 바꿔 반복하면 실패다. '+
   '이 점검 항목은 일반적 선택 사례이며 명식으로 확인한 개인 성향·필연적 결과가 아니다. ':'';
 return Object.freeze({
  kind:'buyer-choice-hour-symbolic-extension-v1',
  sourceRefs:Object.freeze([a,b]),hourVisibleRole:hour.stemTenGod,
  hourHiddenRole:h.tenGod,hiddenRef:b,readerDomain,
  distinctFromMonth:true,distinctFromFreeVisibleNatal:true,
  chosenHiddenStemIsGoverning:false,
  realAbilityObserved:false,realOutcomePredicted:false,
  classicalPriorityApproved:false,premiumValueApproved:false,
  extraPaidTopic:false,optionalOnly:true,
  readerGoal:'이 출생시간의 숨은 글자에서만 새롭게 확인되는 ‘'+meaning+
   '’라는 전통적 질문을, 고객이 직접 입력한 '+domain.label+' 고민에 조건부로 연결한다. '+
   '출생월의 겉글자와 중심 글자의 뜻풀이를 반복하지 말고 시간의 별도 분류가 더하는 질문을 설명한다. '+
   domain.compare+' '+distinctChoiceGoal+
   '고객이 두 선택지를 적었다면 두 경우의 차이를 독립된 문장으로 설명한다. '+
   '이 글자는 실제 출생시간의 근거 '+b+'에 해당하며 시간 겉글자의 분류는 '+hour.stemTenGod+
   '이다. 인용은 '+a+'과 '+b+'만 허용하며, 출생월을 뜻만 바꿔 나열하지 않는다. '+
   '숨은 글자 한 개를 골랐다는 이유로 사령·강약·격국·성격·재산·능력·건강·성취·미래를 확정하지 않는다. '+
   '질문에 답할 근거가 없으면 지어내지 않고 품질 검사에서 실패한다. '+
   '고객의 고민은 실제 행동을 관찰한 증거가 아니라 본인이 제공한 질문이다.'
 });
}
module.exports={build,domainFor,DOMAINS,alreadyPublicNatalRoles};
