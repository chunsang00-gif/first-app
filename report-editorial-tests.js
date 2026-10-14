'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const quality=require('./report-quality-node'),outline=require('./report-outline');
const offlineReplay=require('./report-qa-replay').replay;
const offlineFixture={status:'rejected',qa:{errors:['historic rejection']},report:{sections:[{id:'money',keyJudgment:'금전 기준을 확인합니다.',body:['돈은 관리합니다.']},{id:'career',keyJudgment:'역할 기준을 확인합니다.',body:['업무를 확인합니다.']}]}};
const offlineResult=offlineReplay(offlineFixture);
assert.equal(offlineResult.chapterCount,2);
assert.equal(offlineResult.topicCount,2);
assert(offlineResult.originalErrors.includes('historic rejection'));
assert.throws(()=>offlineReplay({report:{sections:null}}),/report.sections/);

const hanjaFindings=require('./inspect-paid-qa').inspect({calls:[{number:6,response:{sections:[{id:'year_2027_career',title:'직업운',keyJudgment:'丁未년 직업 판단',body:['한글 문장'],bodyLabels:['관계']}]}}]});
assert.equal(hanjaFindings.length,2);
assert(hanjaFindings.every(x=>x.section==='year_2027_career'&&x.field==='keyJudgment'));
assert.deepEqual(require('./inspect-paid-qa').inspect({calls:[{number:1,response:{sections:[{id:'career',body:['일반적인 문장']} ]}}]}),[]);
assert.throws(()=>require('./inspect-paid-qa').inspect({}),/raw-calls/);
const fixture=()=>({sections:quality.IDS.map((id,i)=>({id,title:'제목'+i,keyJudgment:'판정'+i,evidence:['계산한 사주 항목의 설명입니다.'],body:['문단'+i]})),finalJudgment:{body:['마지막 설명'],closingQuestion:'꼼꼼하게 확인하느라 결정을 늦출 때는, 오늘 확인할 내용을 먼저 정하는 것이 도움이 됩니다.',afterClosingText:''}});
for(const phrase of require('./report-editorial').awkwardPhrases){const r=fixture();r.sections[0].body=[phrase];assert(quality.validate(r).errors.includes('unnatural Korean: '+phrase));}
for(const field of ['title','keyJudgment','bodyLabels','body']){
 const report=fixture();report.sections[0][field]=field==='bodyLabels'||field==='body'?['丁未년 설명']:'丁未년 설명';
 assert(quality.validate(report).errors.includes('saju_core: unnecessary Hanja in general-audience prose'),field+': Hanja must fail reader quality gate');
}
const injectors=[
 (r,t)=>r.sections[0].title=t,(r,t)=>r.sections[0].keyJudgment=t,
 (r,t)=>r.sections[0].bodyLabels=[t],(r,t)=>r.sections[0].evidence=[t],
 (r,t)=>r.cover={headline:t},(r,t)=>r.cover={description:t},
 (r,t)=>r.cover={keywords:[t]},(r,t)=>r.cover={highlights:[{title:t,description:t}]},
 (r,t)=>r.finalJudgment.headline=t,(r,t)=>r.finalJudgment.body=[t],
 (r,t)=>r.finalJudgment.strengths=[t],(r,t)=>r.finalJudgment.watchouts=[t],
 (r,t)=>r.finalJudgment.routines=[{trigger:t,action:t,reason:t}],
 (r,t)=>r.finalJudgment.closingQuestion=t
];
for(const set of injectors){const r=fixture();set(r,'핵심  성향');if(r.cover)r.cover={headline:'제목',description:'설명',keywords:['하나','둘','셋'],...r.cover};assert(quality.validate(r).errors.includes('unnatural Korean: 핵심 성향'));}
// Regression: repeated causal thesis across five unrelated chapters is rejected.
const recycled=fixture();
for(let i=0;i<5;i++)recycled.sections[i].body=['이유와 논리를 먼저 확인하고 설명을 납득해야 결정합니다.'];
assert(quality.validate(recycled).errors.some(x=>x.startsWith('cross-chapter recycled thesis (logic-and-proof)')));
const notRecycled=fixture();
for(let i=0;i<3;i++)notRecycled.sections[i].body=['이유와 논리를 먼저 확인하고 설명을 납득해야 결정합니다.'];
assert(!quality.validate(notRecycled).errors.some(x=>x.startsWith('cross-chapter recycled thesis')));
// Reproduces the paid QA rejection pattern without publishing customer report data.
// A single thesis reworded for every chapter must fail even when sentences differ.
const domainRepetition=fixture();
const sameThesis=[
 '논리적인 이유를 스스로 확인하고 설명을 납득해야 다음 단계로 갑니다.',
 '주어진 근거를 확인하고 그 이유가 납득되는지 검토합니다.',
 '선택에 따르는 책임의 이유와 설명이 충분한지 확인합니다.',
 '지출에 따르는 책임과 기준의 근거를 확인하고 결정합니다.',
 '일의 논리와 근거를 확인한 뒤 설명을 받아들입니다.',
 '상대가 한 설명의 이유를 확인하고 납득하려고 합니다.',
 '압박을 받으면 논리와 이유를 반복해서 확인합니다.',
 '중요한 선택에서도 근거와 설명을 검토해 납득합니다.',
 '2027년에는 규칙과 책임의 근거를 확인합니다.',
 '2027년 돈에서는 책임과 규칙을 검토합니다.',
 '2027년 업무에서는 책임과 기준을 확인합니다.',
 '2027년 관계에서는 규칙과 책임의 설명을 확인합니다.'
];
domainRepetition.sections.forEach((s,i)=>s.body=[sameThesis[i]]);
const repetitionErrors=quality.validate(domainRepetition).errors;
assert(repetitionErrors.some(x=>x.startsWith('cross-chapter recycled thesis (logic-and-proof)')));
assert(repetitionErrors.some(x=>x.startsWith('cross-chapter recycled thesis (responsibility-and-rules)')));
const annualOverreach=fixture();
annualOverreach.sections[9].body=['원국의 식상이 두드러지지 않으므로, 이 해에는 돈을 새롭게 벌기보다 현재 가진 자원 관리와 지출 통제에 관심이 쏠릴 수 있습니다.'];
assert(quality.validate(annualOverreach).errors.includes('year_2027_money: unsupported earnings inference from food-god presence'));
// Plain-language rule applies to every chapter, including natal and yearly overview.
for(const id of ['saju_core','year_2027']){
 const sample=fixture();
 sample.sections.find(s=>s.id===id).body=['경금(庚)을 검토합니다.'];
 assert(quality.validate(sample).errors.includes(id+': unnecessary Hanja in general-audience prose'));
}
const editorial=require('./report-editorial');
assert(editorial.wordingErrors(['우선할\n방향']).length);
assert(editorial.wordingErrors(['핵심\u200B성향']).length);
assert.deepEqual(editorial.wordingErrors(['정인(배움과 보호를 뜻하는 십성)을 함께 살펴봅니다.','부탁을 거절하지 못해 자신의 일을 끝내지 못합니다.']),[]);
// Concise reports must still contain every planned topic in its exact order.
const concise=fixture();
concise.meta={versions:{schema:'concise-v3'}};
for(const section of concise.sections){
 const keys=Object.keys(outline.topics[section.id]);
 section.bodyTopics=keys;
 section.body=keys.map((_,i)=>'서로 다른 설명 '+i);
 section.bodyLabels=keys.map((_,i)=>'문단 '+i);
}
assert(!quality.validate(concise).errors.some(e=>e.includes('required topics')||e.includes('topic explanations incomplete')));
// A structurally complete, non-repetitive report should pass the server quality gate.
const passing=structuredClone(concise);
passing.cover={headline:'서로 다른 상황을 차근차근 살펴봅니다',description:'계산 자료를 바탕으로 각 주제의 차이를 설명합니다.',keywords:['사주 풀이','성향 분석','연간 변화'],highlights:[{sectionId:'saju_core',title:'타고난 반응',description:'사주 원국에서 드러나는 차이를 설명합니다.'},{sectionId:'career',title:'일하는 환경',description:'직장에서 나타날 수 있는 반응을 설명합니다.'},{sectionId:'year_2027',title:'2027년 해석',description:'세운과 원국의 관계를 설명합니다.'}]};
const topicsSample=['원국의 일간과 월지를 비교해 성향의 차이를 풀이합니다.','월지에 나타난 기운과 다른 자리의 관계를 함께 설명합니다.','십성의 위치에 따라 해석의 범위를 구분합니다.','실제 계산된 항목을 확인한 후 해당 주제를 풀이합니다.'];
for(const [i,section] of passing.sections.entries()){
 section.title=['타고난 기질과 반응','사주와 성격 선호의 차이','결정할 때 살피는 점','돈을 사용할 때의 특징','일하는 환경과 역할','가까운 관계에서의 반응','압박을 받았을 때','사주와 성격의 종합','2027년 세운과 원국','2027년 돈 관련 해석','2027년 일 관련 해석','2027년 관계 관련 해석'][i];
 section.keyJudgment=['감정을 표현하는 방식에 차이가 있습니다.','성향을 설명하는 두 관점은 같지 않습니다.','결정은 여러 조건을 비교해 이루어집니다.','지출과 관리 방식은 나누어 살펴야 합니다.','담당하는 역할에 따라 일하는 방식이 달라집니다.','가까운 사이에서 표현 방식이 달라집니다.','압박을 받는 상황을 구분해 살펴봅니다.','서로 다른 설명이 만나는 부분을 확인합니다.','2027년에는 평소와 다른 부분을 비교합니다.','2027년 돈에 관한 차이를 비교합니다.','2027년에는 직장 업무의 변화가 나타나는 이유를 살핍니다.','2027년에는 가족 및 지인과 만나는 방식을 따집니다.'][i];
 section.evidence=['월지와 일간의 관계를 바탕으로 '+section.title+' 주제의 전통적인 의미를 살펴봅니다.'];
 section.body=section.bodyTopics.map((_,j)=>{
  const domains=[
   ['마음속 기질을 이해하는 사례','혼자 있을 때의 감정 반응','자신의 습관을 돌아보는 모습','서로 다른 기질의 의미'],
   ['검사를 답하는 태도','낯선 모임에서의 표정','익숙한 사이의 소통','겉으로 드러난 행동'],
   ['자료를 확보하는 순서','위험을 따지는 판단','결정을 번복하는 계기','갈림길에서의 선택'],
   ['지갑을 여는 이유','통장을 관리하는 방법','계약금을 비교하는 상황','물건 값을 가늠하는 경험'],
   ['작업 현장에서 맡는 역할','회의를 준비하는 습관','동료와 일을 나누는 과정','직무를 익히는 속도'],
   ['친구에게 다가가는 태도','가족을 챙기는 마음','서운함을 전하는 장면','연인과 다투는 상황'],
   ['긴장할 때 숨을 고르는 모습','휴식이 필요한 순간','피로를 느끼는 환경','스스로 진정하는 과정'],
   ['두 관점을 나란히 살피는 방법','상반된 신호가 나타나는 이유','복잡한 해석을 정돈하는 순서','전체를 관통하는 특징'],
   ['세운의 간지를 해석하는 과정','연간 십성의 의미','원국과 달라지는 요소','이듬해를 바라보는 관점'],
   ['한 해 지출을 바라보는 관점','예산을 설정하는 순간','재정 계획을 바꾸는 이유','목돈을 고려하는 시기'],
   ['연간 직무 변화를 검토하는 일','동료와 책임을 나누는 경험','경력에 도움 되는 업무','새로운 일터를 알아보는 때'],
   ['오래된 인연을 만나는 상황','새로운 친구와 대화하는 장면','가까운 가족과 보내는 시간','함께하는 사람의 고민']
  ];
  const endings=['의 특징을 명리학의 전통적인 뜻과 비교해 풀이합니다.','이 다른 상황에서 어떻게 달라지는지 구분해 설명합니다.','이 가진 구체적인 의미를 본문에서 차근차근 설명합니다.','을 놓고 단정할 수 없는 부분도 분명하게 밝힙니다.'];
  return domains[i][j]+' — '+[
  ['음양의 기질을 설명하는 근본 특징입니다','감정 표현을 다룬 고유한 모습입니다','동기가 드러나는 자리입니다','성질을 구별하는 지표입니다'],
  ['외향 선호 검사와 연결됩니다','직관 선호의 조건을 따집니다','사고와 감정의 차이입니다','판단과 인식의 대비입니다'],
  ['확인할 자료를 고릅니다','손실 가능성을 계산합니다','선택한 이유를 기억합니다','우선순위를 비교합니다'],
  ['예산 한도를 생각합니다','청구 내역을 확인합니다','저축액을 정합니다','결제 기한을 검토합니다'],
  ['작업 순서를 나눕니다','직책에 따른 책임을 따집니다','장비 조작을 점검합니다','고용 조건을 비교합니다'],
  ['애정의 깊이를 드러냅니다','서운한 감정을 표현합니다','친밀감을 나누는 방법입니다','갈등을 푸는 모습입니다'],
  ['신체 긴장을 경험합니다','수면과 휴식이 필요합니다','불안을 유발하는 장소입니다','진정을 돕는 일과입니다'],
  ['양쪽 자료를 대조합니다','차이가 생긴 근본 이유입니다','서로 모순된 부분을 밝힙니다','독립된 관찰 기준입니다'],
  ['정미 세운의 구성입니다','화토 요소를 구분합니다','생극의 관계를 살핍니다','십간 관계를 확인합니다'],
  ['연간 지출 계획을 점검합니다','금전 계약의 조건입니다','현금 보유량을 따집니다','재산 운용의 한계를 밝힙니다'],
  ['업무 변경을 고려합니다','승진이나 전환의 조건입니다','기술 개발에 관심을 둡니다','채용 일정을 확인합니다'],
  ['인연의 변화를 설명합니다','만남의 계기를 비교합니다','가족 사이 대화를 다룹니다','서로에게 바라는 점입니다']
 ][i][j];
 });
}
passing.finalJudgment={body:['각 분야의 차이를 살펴본 결과를 바탕으로 중요한 부분을 정리합니다.'],closingQuestion:'계산 근거를 확인한 범위 안에서 판단하는 것이 좋습니다.',afterClosingText:''};
const passingQA=quality.validate(passing);
assert.equal(passingQA.pass,true,'complete report rejected: '+passingQA.errors.join(' | '));
const brokenPassing=structuredClone(passing);
brokenPassing.sections[0].body.pop();
assert.equal(quality.validate(brokenPassing).pass,false);
const incomplete=structuredClone(concise);
incomplete.sections[0].bodyTopics[0]='invalid_topic_key';
assert(quality.validate(incomplete).errors.includes('saju_core: topics unknown or reordered'));
const shorter=structuredClone(concise);
shorter.sections[0].body.pop();
assert(quality.validate(shorter).errors.includes('saju_core: topic explanations incomplete'));
const repeated=fixture();repeated.sections[0].body=Array.from({length:4},(_,i)=>'사주에서는 서로 다른 설명 '+i);assert(quality.validate(repeated).errors.some(e=>e.includes('repeated interpretation boilerplate')));
const genericEvidence=fixture();
assert(quality.validate(genericEvidence).errors.includes('saju_core: evidence is generic placeholder'));
const specificEvidence=fixture();specificEvidence.sections[0].evidence=['월지의 정인 관계가 전통적으로 배움과 보호를 뜻하는 항목입니다.'];
assert(!quality.validate(specificEvidence).warnings.some(x=>x.startsWith('saju_core: evidence')));
const calculatedFacts={facts:{tenGods:{year:{stemTenGod:'정관'},month:{stemTenGod:'정재'},day:{stemTenGod:'일간'},hour:{stemTenGod:'편인'}}}};
const badGod=fixture();badGod.sections[0].evidence=['월간의 편재는 사업에서 돈을 버는 방식으로 설명합니다.'];
assert(quality.validate(badGod,calculatedFacts).errors.includes('saju_core: 월간 편재 conflicts with calculated 정재'));
const badGodInBody=fixture();badGodInBody.sections[0].body=['월간의 편재가 일하는 모습에 영향을 준다는 해석입니다.'];assert(quality.validate(badGodInBody,calculatedFacts).errors.includes('saju_core: 월간 편재 conflicts with calculated 정재'));
const goodGod=fixture();goodGod.sections[0].evidence=['월간의 정재는 전통적으로 재물 관리에 관련된 십성입니다.'];
assert(!quality.validate(goodGod,calculatedFacts).errors.some(e=>e.includes('conflicts with calculated')));
const unstatedGod=fixture();unstatedGod.sections[0].evidence=['사주에서 편재를 어떻게 이해할 수 있는지 설명합니다.'];
assert(!quality.validate(unstatedGod,calculatedFacts).errors.some(e=>e.includes('conflicts with calculated')));
const yearFacts={facts:{tenGods:{},annualTenGods:{stemTenGod:'정재'},targetYearRelations:[{type:'충',between:'month',branches:'午子'}]}};
const wrongYear=fixture();wrongYear.sections[8].evidence=['2027년 세운은 편재이므로 소비가 늘어납니다.'];
assert(quality.validate(wrongYear,yearFacts).errors.includes('year_2027: 2027 편재 conflicts with calculated 정재'));
const correctYear=fixture();correctYear.sections[8].evidence=['2027년 세운은 정재로 나타납니다.'];
assert(!quality.validate(correctYear,yearFacts).errors.some(x=>x.includes('2027')&&x.includes('conflicts with calculated')));
const unsupportedClash=fixture();unsupportedClash.sections[8].evidence=['2027년 일지와 충돌하는 관계가 있습니다.'];
assert(quality.validate(unsupportedClash,yearFacts).errors.includes('year_2027: unsupported 2027 clash with 일지'));
const supportedClash=fixture();supportedClash.sections[8].evidence=['2027년 월지와 충돌하는 관계가 있습니다.'];
assert(!quality.validate(supportedClash,yearFacts).errors.some(x=>x.includes('unsupported 2027 clash')));
const uncalculatedFacts={facts:{tenGods:{},limits:['신강·신약·용신은 이 계산에서 판정하지 않음']}};
const unsupportedStrength=fixture();unsupportedStrength.sections[8].body=['2027년에는 신강으로 판정되므로 독립하기 좋습니다.'];
assert(quality.validate(unsupportedStrength,uncalculatedFacts).errors.includes('year_2027: unsupported strength or favorable-element classification'));
const unsupportedYongshin=fixture();unsupportedYongshin.sections[8].evidence=['2027년 용신은 목이라서 운이 좋아집니다.'];
assert(quality.validate(unsupportedYongshin,uncalculatedFacts).errors.includes('year_2027: unsupported strength or favorable-element classification'));
const limitedEvidence=fixture();limitedEvidence.sections[8].body=['이 계산만으로 신강인지 신약인지 판단하지 않습니다.'];
assert(!quality.validate(limitedEvidence,uncalculatedFacts).errors.some(x=>x.includes('unsupported strength')));
const decadeOnly={fortune:{status:'complete',forward:true,start:{year:3,month:0,day:0,hour:0}},facts:{tenGods:{}}};
const inventedDecade=fixture();inventedDecade.sections[8].evidence=['2027년 대운은 편재이므로 사업으로 돈을 벌게 됩니다.'];
assert(quality.validate(inventedDecade,decadeOnly).errors.includes('year_2027: unsupported decade-fortune pillar or ten-god claim'));
const acceptableDecade=fixture();acceptableDecade.sections[8].evidence=['대운의 십성은 현재 계산에서 제공되지 않아 단정할 수 없습니다.'];
assert(!quality.validate(acceptableDecade,decadeOnly).errors.some(x=>x.includes('unsupported decade-fortune')));
const computedDecade={fortune:{status:'complete',decades:[{pillar:'甲子',stemTenGod:'비견',startYear:2022,endYear:2031}],activeDecade:{pillar:'甲子',stemTenGod:'비견',startYear:2022,endYear:2031}},facts:{tenGods:{}}};
const falseDecadeGod=fixture();falseDecadeGod.sections[8].evidence=['2027년 대운은 편재로 나타납니다.'];
assert(quality.validate(falseDecadeGod,computedDecade).errors.includes('year_2027: 2027 decade 편재 conflicts with calculated 비견'));
const trueDecadeGod=fixture();trueDecadeGod.sections[8].evidence=['2027년 대운은 비견으로 나타납니다.'];
assert(!quality.validate(trueDecadeGod,computedDecade).errors.some(x=>x.includes('decade')&&x.includes('conflicts')));
const computedCalendar=require('./calendar-provider-node').fortune({calendar:'solar',birthDate:'1990-06-15',birthTime:'12:00',gender:'male'});
const packet2027=require('./report-facts-node').build({calendar:'solar',birthDate:'1990-06-15',birthTime:'12:00',gender:'male',mbti:'ISFP'},2027);
assert.equal(packet2027.status,'ready');
assert(packet2027.fortune.activeDecade?.pillar);
assert(packet2027.fortune.activeDecade?.stemTenGod);
assert.equal(packet2027.targetYear.year,2027);
assert(packet2027.facts.annualTenGods.stemTenGod);
const unknownTimePacket=require('./report-facts-node').build({calendar:'solar',birthDate:'1990-06-15',unknownBirthTime:true,gender:'male',mbti:'ISFP'},2027);
assert.equal(unknownTimePacket.status,'ready');
assert.equal(unknownTimePacket.chart.hour,null);
assert.equal(unknownTimePacket.fortune.status,'unavailable_without_birth_time');
assert.equal(unknownTimePacket.fortune.activeDecade,null);
assert.equal(unknownTimePacket.fortune.decades.length,0);
const unknownTimeMockReport=fixture();
unknownTimeMockReport.sections[8].evidence=['2027년 대운은 편재이므로 사업으로 돈을 벌게 됩니다.'];
assert(quality.validate(unknownTimeMockReport,unknownTimePacket).errors.includes('year_2027: unsupported decade-fortune pillar or ten-god claim'));


assert(Array.isArray(computedCalendar.decades)&&computedCalendar.decades.length>0);
assert(computedCalendar.decades.some(d=>d.pillar&&Number.isInteger(d.startYear)&&Number.isInteger(d.endYear)));
const contradiction=fixture();contradiction.sections[3].title='불필요한 지출은 하지 않습니다';contradiction.sections[3].body=['마음에 드는 물건에는 예산보다 많은 돈을 쓸 수 있습니다.'];assert(quality.validate(contradiction).errors.includes('money: categorical money headline conflicts with spending exception'));
const conditional=fixture();conditional.sections[3].title='평소에는 돈을 아끼지만 좋아하는 물건에는 지출합니다';conditional.sections[3].body=['마음에 드는 물건에는 예산보다 많은 돈을 쓸 수 있습니다.'];assert(!quality.validate(conditional).errors.some(x=>x.includes('categorical money headline')));
const natural=fixture();natural.sections[0].body=['충분히 알아본 뒤 시작하려다 실행이 늦어집니다.'];assert(!quality.validate(natural).errors.some(e=>/unnatural Korean|interpretation boilerplate|abstract headline/.test(e)));
const emptyEnding=fixture();emptyEnding.finalJudgment.closingQuestion='이 보고서는 전통 사주 해석과 입력된 MBTI를 비교한 참고 자료입니다.';assert(quality.validate(emptyEnding).errors.includes('final conclusion is disclaimer instead of personal insight'));
for(const ending of ['어떤 선택을 하시겠습니까?','이제 어떻게 할까요','무엇이 중요합니까？']){const r=fixture();r.finalJudgment.closingQuestion=ending;assert(quality.validate(r).errors.includes('final conclusion must not ask a question'));}
assert(!quality.validate(fixture()).errors.some(e=>e.includes('conclusion')));
const client={window:{addEventListener(){},CHARACTER_ASSETS:{badge(){return ""},hero(){return ""},detail(){return ""}}},document:{body:{classList:{add(){}}},getElementById(){return null}},requestAnimationFrame(){},console};
vm.runInNewContext(fs.readFileSync(require.resolve('./report-validator'),'utf8'),client);
assert(!client.window.REPORT_VALIDATOR.validate(fixture()).errors.some(e=>e.includes('conclusion')));
const browserConcise=structuredClone(concise);assert(!client.window.REPORT_VALIDATOR.validate(browserConcise).errors.some(e=>e.includes('concise topics incomplete')));browserConcise.sections[0].body.pop();assert(client.window.REPORT_VALIDATOR.validate(browserConcise).errors.includes('saju_core: concise topics incomplete'));
vm.runInNewContext(fs.readFileSync(require.resolve('./report-renderer'),'utf8'),client);
const target={innerHTML:'',closest(){return {classList:{add(){}}}},querySelectorAll(){return []},querySelector(){return null}};
client.window.REPORT_RENDERER.render({...fixture(),meta:{}},target);
assert(target.innerHTML.includes('종합 총평'));assert(target.innerHTML.includes('가장 중요한 결론'));
assert(target.innerHTML.indexOf('가장 중요한 결론')<target.innerHTML.indexOf(fixture().finalJudgment.closingQuestion));
// Exercise the actual pipeline without an API key, network, or calculation dependency.
const sandbox={module:{exports:{}},process:{env:{}},require:n=>n==='./report-facts-node'?{build:()=>({status:'ready',person:{mbti:'ISFP'}})}:require(n)};
vm.runInNewContext(fs.readFileSync(require.resolve('./report-server-contract'),'utf8'),sandbox);
const repeatedTopics=sandbox.module.exports.findRepeatedTopicContent;
const paraphrases=sandbox.module.exports.findParaphrasedTopicContent;
const adviceAudit=sandbox.module.exports.findRepeatedAdvice;
const recurring=[
 {id:'money',body:['돈을 쓰기 전에 기준을 확인하고 결정을 내립니다.']},
 {id:'career',body:['직업을 선택할 때 근거를 검토한 다음 판단합니다.']},
 {id:'relationship',body:['관계에서 선택하기 전에 서로 확인하는 것이 중요합니다.']}
];
assert(adviceAudit(recurring).some(x=>x.includes('verify-before-deciding')));
assert.equal(adviceAudit([{id:'money',body:['지출을 기록합니다.']},{id:'career',body:['업무 일정을 계획합니다.']},{id:'relationship',body:['상대의 말을 듣습니다.']}]).length,0);

const overlapA='생각을 충분히 정리하고 자료를 확인한 뒤에 결정하는 방식이 반복됩니다. 상대방의 설명을 듣고 책임지는 범위를 구별한 다음 다시 검토하는 행동이 나타납니다.';
const overlapB='자료를 확인하고 생각을 충분히 정리한 뒤에 결정하는 방식이 나타납니다. 다시 검토하는 행동이 반복되며 상대방의 설명을 듣고 책임지는 범위를 구별합니다.';
const distinct='2027년 계절에 해당하는 월별 지지의 충합은 실제로 계산되지 않았으며 예측할 수 없는 미래 사건과 구별해야 합니다. 그 대신 입력 시각에 따른 한계를 정확히 밝힙니다.';
assert(paraphrases([{id:'money',bodyTopics:['spending'],body:[overlapA]},{id:'career',bodyTopics:['workstyle'],body:[overlapB]}]).length>0);
assert.equal(paraphrases([{id:'money',bodyTopics:['spending'],body:[overlapA]},{id:'career',bodyTopics:['workstyle'],body:[distinct]}]).length,0);

const themeAudit=sandbox.module.exports.findRecycledThemes;
const patterned=(id)=>({id,keyJudgment:'책임과 기준에 따라 다시 확인합니다.',body:['업무를 맡을 때 기존 규칙을 설명하고 검토합니다.']});
assert.equal(themeAudit(['a','b','c','d'].map(patterned)).length,0);
assert(themeAudit(['a','b','c','d','e'].map(patterned)).some(x=>x.includes('responsibility-and-rules')));
const distinctJudgments=['사주의 월지와 일간이 나타내는 계산값을 설명합니다.','입력된 성격 선호의 한계를 비교합니다.','변경할 선택 조건을 구분합니다.','지출과 보유에 관한 해석을 나눕니다.','실제 맡은 업무는 추정하지 않습니다.'];
const vocabularyHeavy='논리와 근거를 설명하고 책임과 규칙을 확인하지만 이 말은 일반적인 배경 설명일 뿐입니다.';
assert.equal(themeAudit(distinctJudgments.map((keyJudgment,i)=>({id:'chapter'+i,keyJudgment,body:[vocabularyHeavy]}))).length,0,'Shared body vocabulary must not be treated as repeated chapter conclusions');
const annualRepeated=[
 {id:'year_2027_money',keyJudgment:'2027년에는 공식적 책임과 관리 기준이 중요해집니다.'},
 {id:'year_2027_career',keyJudgment:'2027년에는 사회적 역할과 규칙을 중시합니다.'},
 {id:'year_2027_relationship',keyJudgment:'2027년 관계에서는 책임 분배와 관리가 강조됩니다.'}
];
assert(themeAudit(annualRepeated).some(x=>x.includes('2027 domain chapters repeat')));
assert.equal(themeAudit([annualRepeated[0],{id:'year_2027_career',keyJudgment:'2027년 업무에서 새로 계산된 십성을 확인합니다.'},{id:'year_2027_relationship',keyJudgment:'해당 연간 지지와 원국에 충이 계산되지 않았습니다.'}]).length,0);



const shared='시간을 충분히 들여 여러 선택지의 장단점을 비교하며 결정을 고른 뒤에는 주변 상황과 필요한 절차를 다시 검토한다. 이 과정을 마치면 다른 사람에게도 선택의 이유를 충분히 설명하려고 한다.';
assert(repeatedTopics([{id:'decision',bodyTopics:['approach'],body:[shared]},{id:'career',bodyTopics:['workstyle'],body:[shared]}]).some(x=>x.includes('repeated topic paragraph')));
assert.equal(repeatedTopics([{id:'decision',bodyTopics:['approach'],body:[shared]},{id:'career',bodyTopics:['workstyle'],body:['새로운 과업을 배우는 과정에서는 이미 정해진 역할을 먼저 이해한 다음 실제 결과를 확인한다.']}]).length,0);
const unsupportedAnnualPacket={facts:{tenGods:{},annualTenGods:{stemTenGod:'비견',hiddenStems:[]},targetYearRelations:[]}};
const unsupportedAnnualReport={sections:[{id:'year_2027_money',keyJudgment:'2027년 수입이 늘어납니다.',body:[]}]};
assert(quality.verifyEvidenceAgainstFacts(unsupportedAnnualReport,unsupportedAnnualPacket).errors.some(x=>x.includes('unsupported 2027 domain outcome prediction')));
const supportedButNotGuaranteed={facts:{tenGods:{},annualTenGods:{stemTenGod:'정재',hiddenStems:[]},targetYearRelations:[]}};
assert(quality.verifyEvidenceAgainstFacts({sections:[{id:'year_2027_money',title:'2027년 수입이 늘어납니다.',keyJudgment:'계산 근거를 설명합니다.',body:[]}]},supportedButNotGuaranteed).errors.some(x=>x.includes('categorical 2027 domain outcome prediction')));
assert(quality.verifyEvidenceAgainstFacts({sections:[{id:'year_2027_money',title:'금전 해석',keyJudgment:'계산 근거를 설명합니다.',body:[],evidence:['2027년 수입이 늘어납니다.']}]},supportedButNotGuaranteed).errors.some(x=>x.includes('categorical 2027 domain outcome prediction')));

assert(quality.verifyEvidenceAgainstFacts({sections:[{id:'year_2027_money',keyJudgment:'2027년 수입이 늘어납니다.',body:[]}]},supportedButNotGuaranteed).errors.some(x=>x.includes('categorical 2027 domain outcome prediction')));
assert(quality.verifyEvidenceAgainstFacts({sections:[{id:'year_2027_money',keyJudgment:'2027년 수입이 늘어납니다. 하지만 예측할 수 없습니다.',body:[]}]},supportedButNotGuaranteed).errors.some(x=>x.includes('categorical 2027 domain outcome prediction')));
unsupportedAnnualReport.sections[0].keyJudgment='2027년 수입이 늘어난다고 단정할 수 없습니다.';
assert(!quality.verifyEvidenceAgainstFacts(unsupportedAnnualReport,unsupportedAnnualPacket).errors.some(x=>x.includes('unsupported 2027 domain outcome prediction')));
const guidance=require('./report-analysis-guidance');
const blueprint=guidance.preflight({person:{mbti:'ISFP'},facts:{structuralEvidence:{monthCommand:{branch:'子'},visibleStems:[{stem:'甲'}]},tenGods:{day:{stem:'甲',hiddenStems:[]},month:{stem:'乙'}},natalClashes:[],annualTenGods:{stem:'丁',hiddenStems:[]},targetYearRelations:[]},fortune:{activeDecade:null}});
assert.equal(Object.keys(blueprint).length,12);
assert.equal(Object.values(blueprint).reduce((count,chapter)=>count+Object.keys(chapter.topicTasks).length,0),28);
assert.equal(blueprint.money.topicTasks.earning.primaryEvidencePath,'facts.tenGods.month');
for(const id of ['decision','money','relationship','stress'])for(const topic of Object.values(blueprint[id].topicTasks))if(topic.primaryEvidencePath==='facts.natalClashes'){
 assert.equal(topic.mode,'state-limits','no calculated clash must not become inferred real-life conflict');
 assert.equal(topic.evidenceReuseBoundary,null,'missing clash must not be assigned a phantom evidence owner');
}

assert.equal(blueprint.year_2027_relationship.topicTasks.change.evidencePresent,false);
assert.equal(blueprint.year_2027_relationship.topicTasks.change.mode,'state-limits');
assert(blueprint.year_2027_relationship.topicTasks.change.verifiedFallbackPaths.includes('facts.annualTenGods'));
assert.equal(blueprint.year_2027_career.topicTasks.change.mode,'state-limits');
assert.equal(blueprint.year_2027_relationship.topicTasks.action.mode,'state-limits');
assert.equal(blueprint.year_2027_relationship.topicTasks.action.evidencePresent,true);
assert.equal(new Set(Object.values(blueprint).map(x=>x.question)).size,12);
assert.equal(blueprint.year_2027_relationship.requiredMode,'use-fallback-with-limits');
assert(blueprint.year_2027_relationship.negativeEvidence);
assert(blueprint.year_2027_relationship.fallbackEvidencePaths.includes('facts.annualTenGods'));
assert.equal(blueprint.year_2027_career.requiredMode,'use-fallback-with-limits');
assert.equal(blueprint.year_2027.requiredMode,'explain-with-limits');
assert.equal(blueprint.year_2027_money.annualDomainEvidence.relevant,false);
assert.equal(blueprint.year_2027_career.annualDomainEvidence.relevant,false);
assert.equal(blueprint.year_2027_relationship.annualDomainEvidence.relevant,false);
const special=guidance.preflight({person:{mbti:'ISFP'},facts:{annualTenGods:{stemTenGod:'정재',hiddenStems:[]},targetYearRelations:[{between:'day',type:'충'}]}});
assert.equal(special.year_2027_money.annualDomainEvidence.relevant,false);
assert.equal(special.year_2027_career.annualDomainEvidence.relevant,false);
assert.equal(special.year_2027_relationship.annualDomainEvidence.relevant,true);

assert.equal(guidance.forRequest(['saju_core'],'모름').mbtiReference,null);
assert.equal(guidance.forRequest(['saju_core'],'INVALID').mbtiReference,null);
for(const a of ['I','E'])for(const b of ['S','N'])for(const c of ['T','F'])for(const d of ['J','P']){const type=a+b+c+d; const ref=guidance.forRequest(['decision'],type).mbtiReference; assert.equal(ref.preferences.map(x=>x.code).join(''),type);assert.equal(ref.preferences.length,4);}
(async()=>{
 let calls=0;const seen=[];
 const dryRun=await sandbox.module.exports.generate({mbti:'ISFP'},async p=>{
  calls++;seen.push(p.stage);
  for(const key of ['plainSentenceRule','coherenceRule','depthAndEvidenceRule','yearAndDecadeIntegrationRule','hanjaPolicy','concreteReviewRule','topicOwnershipRule','interpretationFirstRule','readerLanguageRule','internalEvidenceScopeRule'])assert(p.rules[key],key);
  for(const key of ['decisiveSentenceRule','actionableMoneyRule','idiomaticWritingRule','everydayWordChoiceRule','expressionPolicyRule'])assert.equal(p.rules[key],undefined);
  assert(p.rules.topicOwnershipRule.includes('중복 금지 자료'));
  assert(p.rules.hanjaPolicy.includes('괄호'));
  if(p.stage==='synthesis'){assert(p.rules.finalEditingTask.includes('routines는 빈 배열'));assert(p.rules.coverNaturalnessRule.includes('반복 비용이라는 말을 자동으로 넣지 않는다'));assert(p.rules.naturalKoreanRule.includes('한 가지 뜻은 한 번만'));assert(p.rules.finalRule.includes('교훈이나 감동 문구를 억지로 붙이지 않는다'));assert(p.rules.finalRule.includes('앞의 12개 장을 다시 요약하지 않는다'));assert(p.completedReport.sections.every(s=>s.body.length>=1),'each chapter must retain a grounded paragraph');assert(p.completedReport.sections.reduce((n,s)=>n+s.body.length,0)<=28,'unused topic slots must be omitted');return {cover:null,finalJudgment:{body:['마지막 설명'],closingQuestion:'꼼꼼하게 확인하느라 결정을 늦출 때는, 오늘 확인할 내용을 먼저 정하는 것이 도움이 됩니다.',afterClosingText:''}};}
  assert(p.rules.domainBoundaryRule.includes('분야의 명사만 바꾸어 반복'));
  assert(p.rules.integrationContrastRule.includes('MBTI를 사주 결론의 검증이나 증거로 쓰지 않는다'));
  assert(p.rules.readerProofRule.includes('불필요한 한자'));
  assert(p.rules.annualDeltaRule.includes('변화가 확인되지 않는다고'));
  assert.equal(Object.keys(p.analysisGuidance.editorialBlueprint).length,p.requestedSections.length);
  assert(p.crossChapterNoveltyRule.includes('이전 장과 하나씩 대조'));
  assert.equal(p.priorChapterConclusions.length,(calls-1)*2);
  assert.equal(JSON.stringify(p.priorChapterConclusions.map(s=>s.chapterId)),JSON.stringify(p.priorSections.map(s=>s.id)));
  for(const chapter of p.priorChapterConclusions){
   assert.equal(typeof chapter.judgment,'string');
   assert.equal(chapter.topicConclusions.length,p.priorSections.find(s=>s.id===chapter.chapterId).topicConclusions.length);
  }

  const annualIds=['year_2027_money','year_2027_career','year_2027_relationship'];
  const expectedAnnual=p.requestedSections.filter(id=>annualIds.includes(id));
  assert.equal(JSON.stringify(Object.keys(p.rules.annualDomainScopes)),JSON.stringify(expectedAnnual));
  for(const id of expectedAnnual){
   const scope=p.rules.annualDomainScopes[id];
   assert(scope.length>30);
   assert(scope.includes(id==='year_2027_money'?'수입':id==='year_2027_career'?'업무':'친밀감'));
  }

   assert(p.analysisGuidance.editorialBlueprint[p.requestedSections[0]].question);
   assert(p.rules.mbtiDepthRule);assert.equal(p.priorSections.length,(calls-1)*2);
  if(calls>1){assert(p.priorSections.every(s=>s.topicConclusions.length===s.bodyLabels.length)); assert(p.priorSections.every(s=>s.topicConclusions.every(t=>typeof t==='string'&&t.length>0)),'previous chapter text must be preserved after domain-evidence enforcement');}
  assert.deepEqual(Object.keys(p.analysisGuidance.chapterTasks),Array.from(p.requestedSections));
  assert.equal(p.analysisGuidance.mbtiReference.type,'ISFP');
  assert.equal(p.analysisGuidance.mbtiReference.preferences.map(x=>x.code).join(''),'ISFP');
  return {sections:p.requestedSections.map(id=>({id,title:'제목',keyJudgment:'핵심',evidence:['계산한 사주 항목의 설명입니다.'],bodyTopics:Object.keys(outline.topics[id]),bodyLabels:Object.values(outline.topics[id]),body:Object.keys(outline.topics[id]).map((_,i)=>'첫 번째 결론 '+i+'. 이어지는 설명입니다.')}))};
 });
 // The mock intentionally contains placeholder evidence and no cover.
 // Never mistake completed provider calls for a publishable report.
 assert.equal(dryRun.status,'rejected');
 assert.equal(dryRun.qa.pass,false);
 assert(dryRun.qa.errors.length>0);
 assert(dryRun.report.sections.every(section=>section.body.length>=1),'all chapters retain a meaningful topic');assert(dryRun.report.sections.reduce((count,section)=>count+section.body.length,0)<=28,'optional report topics do not add filler');
 assert.equal(calls,seen.length);assert(seen.filter(stage=>stage==='body').length>=1);assert.equal(seen.at(-1),'synthesis');
 // Detect a known live-QA phrase before any subsequent provider request.
 let earlyCalls=0;
 await assert.rejects(
  sandbox.module.exports.generate({mbti:'ISFP'},async p=>{
   earlyCalls++;
   return {sections:p.requestedSections.map(id=>({
    id,title:'제목',keyJudgment:'직접 실행으로 연결합니다.',
    evidence:['계산한 사주 항목의 설명입니다.'],bodyTopics:Object.keys(outline.topics[id]),
    bodyLabels:Object.values(outline.topics[id]),
    body:Object.keys(outline.topics[id]).map(()=>'문장입니다.')
   }))};
  }),
  /reader-facing editorial defects/
 );
 assert.equal(earlyCalls,1);
 // A repetitive full draft must be rejected before the seventh paid synthesis call.
 let preflightCalls=0;
 await assert.rejects(sandbox.module.exports.generate({mbti:'ISFP'},async p=>{
  preflightCalls++;
  if(p.stage==='synthesis')throw Error('Synthesis must be skipped for repetitive draft');
  return {sections:p.requestedSections.map(id=>({
   id,title:'서로 다른 제목 '+id,keyJudgment:'논리적인 근거를 확인하고 설명을 납득해야 결정합니다.',
   evidence:['원국의 일간 계산 근거 '+id],bodyTopics:Object.keys(outline.topics[id]),
   bodyLabels:Object.values(outline.topics[id]),
   body:Object.keys(outline.topics[id]).map((_,i)=>'서로 다른 주제 '+id+i+'에서 논리와 근거를 확인하고 설명에 납득해야 합니다.')
  }))};
 }),/cross-chapter recycled thesis/);
 assert.equal(preflightCalls,3);
 console.log('PASS editorial phrases, repetitive templates, natural phrasing, active body/summary rules, topic memory, 29 topics and seven calls; no paid API');
})().catch(e=>{console.error(e);process.exitCode=1});

const seasonalPacket={status:'ready',calculationPolicy:{annualPillarBoundary:'ipchun-solar-term'},facts:{tenGods:{}}};
const seasonalBad=fixture();seasonalBad.sections[8].body=['2027년 1월부터 정미 세운이 시작됩니다.'];
assert(quality.validate(seasonalBad,seasonalPacket).errors.includes('2027: annual pillar incorrectly applied to full Gregorian year'));
const seasonalBadReverse=fixture();seasonalBadReverse.sections[8].body=['정미 세운은 양력 1년 내내 적용됩니다.'];
assert(quality.validate(seasonalBadReverse,seasonalPacket).errors.includes('2027: annual pillar incorrectly applied to full Gregorian year'));
const seasonalCorrect=fixture();seasonalCorrect.sections[8].body=['2027년 정미 세운은 입춘을 기준으로 해석합니다.'];
assert(!quality.validate(seasonalCorrect,seasonalPacket).errors.includes('2027: annual pillar incorrectly applied to full Gregorian year'));

const locationPacket={status:'ready',calculationPolicy:{birthplaceUsedForCalculation:false},facts:{tenGods:{}}};
const locationBad=fixture();locationBad.sections[0].body=['출생지 경도를 보정하여 시주를 산출했습니다.'];
assert(quality.validate(locationBad,locationPacket).errors.includes('calculation: unsupported birthplace or solar-time correction claim'));
const locationBadSolar=fixture();locationBadSolar.sections[0].body=['진태양시를 반영한 정밀한 사주입니다.'];
assert(quality.validate(locationBadSolar,locationPacket).errors.includes('calculation: unsupported birthplace or solar-time correction claim'));
const locationGood=fixture();locationGood.sections[0].body=['출생지에 따른 진태양시 보정은 적용하지 않았습니다.'];
assert(!quality.validate(locationGood,locationPacket).errors.includes('calculation: unsupported birthplace or solar-time correction claim'));

const revisedTopics=require('./report-outline').topics;
for(const id of ['integrated_judgment','year_2027_money','year_2027_career','year_2027_relationship']){
 const items=Object.values(revisedTopics[id]);
 assert.equal(items.length,2);
 assert.notEqual(items[0],items[1]);
 assert.ok(items.some(x=>/근거|관점|세운|원국|사주|MBTI/.test(x)));
}
assert(revisedTopics.year_2027_money.action.includes('단정하지'));
assert(revisedTopics.year_2027_career.action.includes('예언하지'));
assert(revisedTopics.year_2027_relationship.action.includes('예언하지'));
