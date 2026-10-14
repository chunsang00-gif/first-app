const assert=require('assert');const C=require('./calendar-provider-node'),P=require('./production-pipeline-node'),F=require('./report-facts-node'),N=require('./name-analysis'),NR=require('./name-ruleset');
function run(name,fn){try{fn();console.log('PASS',name)}catch(e){console.error('FAIL',name,e.message);process.exitCode=1}}
const sample={calendar:'solar',birthDate:'2000-06-15',birthTime:'12:00',birthplace:'서울',gender:'female',mbti:'모름',name:''};
run('generic solar input calculates four pillars',()=>{const r=C.calculate(sample);assert.equal(r.status,'complete');assert.ok(r.chart.year&&r.chart.month&&r.chart.day&&r.chart.hour)});
run('unknown time suppresses hour pillar',()=>{const r=C.calculate({...sample,birthTime:'',unknownBirthTime:true});assert.equal(r.chart.hour,null)});
run('Daewoon convention returns onset fields',()=>{const r=C.fortune(sample);assert.equal(r.status,'complete');assert.equal(typeof r.forward,'boolean');assert.ok(Number.isInteger(r.start.year))});
run('2027 annual pillar is deterministic',()=>{assert.equal(P.annualPillar(2027),'丁未')});
run('production result carries provenance',()=>{const r=P.calculate(sample);assert.ok(P.canAnalyze(r));assert.ok(r.provenance.year&&r.provenance.day)});
run('report packet is facts-only and ready',()=>{const r=F.build(sample);assert.equal(r.status,'ready');assert.equal(r.constraints.factsOnly,true);assert.equal(r.constraints.nameAnalysisEnabled,false)});
run('report handoff preserves generic input',()=>{const r=F.build(sample);assert.equal(r.calculationInput.birthDate,sample.birthDate);assert.equal(r.calculationInput.birthTime,sample.birthTime)});
run('unverified hanja is blocked',()=>{const r=N.analyze('테스트','天地人');assert.equal(r.status,'needs_verified_dictionary')});
run('name ruleset contains no embedded user dictionary',()=>{assert.deepEqual(NR.VERIFIED,{})});

run('browser prompt contract parses',()=>{const fs=require('fs'),vm=require('vm');const src=fs.readFileSync('report-prompt.js','utf8');const sandbox={window:{}};vm.runInNewContext(src,sandbox);assert.ok(sandbox.window.REPORT_PROMPT);assert.equal(sandbox.window.REPORT_PROMPT.version,'premium-v1.8')});
const Q=require('./report-quality-node');
const cases=[
 {label:'winter male ENFP',input:{calendar:'solar',birthDate:'1993-01-18',birthTime:'07:30',birthplace:'서울',gender:'male',mbti:'ENFP',name:'테스트'}},
 {label:'summer female ISTJ',input:{calendar:'solar',birthDate:'1988-08-21',birthTime:'22:10',birthplace:'부산',gender:'female',mbti:'ISTJ',name:'테스트'}},
 {label:'unknown birth time INTP',input:{calendar:'solar',birthDate:'2001-11-03',birthTime:'',unknownBirthTime:true,birthplace:'대전',gender:'male',mbti:'INTP',name:'테스트'}},
 {label:'lunar input ISFP',input:{calendar:'lunar',birthDate:'1995-05-12',birthTime:'14:20',birthplace:'광주',gender:'female',mbti:'ISFP',name:'테스트'}}
];
cases.forEach(({label,input})=>run('matrix '+label,()=>{const r=F.build(input);assert.equal(r.status,'ready');assert.ok(r.chart.year&&r.chart.month&&r.chart.day);if(input.unknownBirthTime)assert.equal(r.chart.hour,null);else assert.ok(r.chart.hour);assert.equal(r.calculationInput.mbti,input.mbti);assert.equal(r.constraints.nameAnalysisEnabled,false)}));


run('all 16 MBTI types and unknown type across 4 birth conditions',()=>{
 const types=['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISTP','ESTJ','ESTP','ISFJ','ISFP','ESFJ','ESFP','모름'];
 const profiles=[sample,{...sample,gender:'male',birthDate:'1990-05-15',birthTime:'10:30'},{...sample,calendar:'lunar',birthDate:'1995-05-12',birthTime:'14:20'},{...sample,birthTime:'',unknownBirthTime:true}];
 const guide=require('./report-analysis-guidance');
 const ids=Q.IDS;
 for(const profile of profiles)for(const mbti of types){
  const input={...profile,mbti},result=F.build(input);
  assert.equal(result.status,'ready',JSON.stringify(input));
  assert.equal(Boolean(result.chart.hour),!input.unknownBirthTime);
  const g=guide.forRequest(ids,mbti);
  assert.equal(Boolean(g.mbtiReference),mbti!=='모름');
  assert.equal(Object.keys(g.chapterTasks).length,12);
 }
});

function mockReport(){
 const bodies={
  saju_core:'원국의 중심축과 오행 분포를 기준으로 기본 반응의 방향을 설명합니다. 일간의 성질과 월지의 계절 조건이 어떤 긴장을 만드는지 계산 사실을 중심으로 풀어냅니다. 강약을 좋고 나쁨으로 단정하지 않고 반복해서 나타나는 반응 구조와 우선순위를 구분합니다.',
  mbti_contradiction:'MBTI 선호에서 기대되는 외부 표현과 사주 계산에서 읽히는 내부 반응이 같은 방향인지 비교합니다. 서로 어긋나는 지점에서는 한쪽을 정답으로 두지 않고 어떤 조건에서 표현 차이가 커지는지 분석합니다. 두 체계를 단순 대응하지 않는 것이 이 장의 핵심입니다.',
  decision:'선택 상황에서는 정보를 모으는 단계와 결론을 내리는 단계를 나누어 봅니다. 계산 근거가 가리키는 속도와 MBTI의 판단 선호가 실제 의사결정에서 어느 순서로 작동하는지 설명합니다. 결정을 미루는 경우와 빠르게 확정하는 경우의 조건 차이도 구분합니다.',
  money:'금전 영역은 수입 자체보다 비용 확대와 손실 허용 범위 그리고 같은 선택을 반복할 수 있는지를 중심으로 분석합니다. 사주 계산 근거와 성향 선호가 소비나 위험 판단에 어떤 기준을 더하는지 연결합니다. 다른 장의 성격 설명을 재사용하지 않습니다.',
  career:'일에서는 숙련도와 역할 범위 그리고 판단 권한을 따로 봅니다. 어떤 업무 구조에서 책임이 커지고 어떤 조건에서 자율성이 필요한지를 계산 근거와 성향 정보로 설명합니다. 직업명을 예언하지 않고 역할과 보상의 비대칭을 구분해 판단합니다.',
  relationship:'관계에서는 친밀도 자체보다 정보 공유 시점과 역할 조정 방식을 봅니다. 갈등이 생길 때 설명을 먼저 하는지 결론을 먼저 내리는지, 상대와 기대치를 언제 맞추는지가 핵심입니다. 사주와 MBTI가 관계 반응을 강화하거나 엇갈리게 하는 조건을 분리합니다.',
  stress:'압박이 커질 때 평소 반응에서 무엇이 먼저 변하는지 분석합니다. 판단 속도와 표현량 그리고 직접 챙기려는 일이 얼마나 늘어나는지를 근거에 연결합니다. 스트레스 해소법을 일반 조언으로 제시하지 않고 과부하 시 나타날 수 있는 변화만 다룹니다.',
  integrated_judgment:'앞 장의 결론을 합산하지 않고 두 체계를 함께 볼 때만 드러나는 함께 볼 때 새로 보이는 점을 정리합니다. 사주에서 강한 반응과 MBTI 선호가 동시에 작동할 때 무엇이 강화되고 무엇이 상쇄되는지를 구분합니다. 모순을 없애지 않고 조건별 역할 차이로 해석합니다.',
  year_2027:'2027년은 평생 성향과 분리해 연간 작동만 비교합니다. 원국과 해당 연도를 비교해 평소보다 더 자주 드러날 반응과 덜 드러날 반응이 있는지 확인합니다. 변화 근거가 약하면 변화가 크다고 만들지 않고 기존 패턴이 유지되는 쪽으로 판정합니다.',
  year_2027_money:'2027년 금전 판단은 평소 비용 기준과 비교해 손실 허용 범위와 반복 가능한 지출의 변화 여부를 봅니다. 해당 연도의 계산값이 책임이나 비용 부담을 더 키우는지 확인하고 근거가 약하면 기존 기준 유지로 설명합니다. 수입 증가 같은 사건은 확정하지 않습니다.',
  year_2027_career:'2027년 일에서는 평소 역할과 비교해 책임 범위와 판단권의 변화 가능성을 살핍니다. 연간 계산 근거가 기존 직업 성향을 더 강하게 만드는지 또는 다른 우선순위를 요구하는지 구분합니다. 이직이나 합격 같은 사건을 예측하지 않습니다.',
  year_2027_relationship:'2027년 관계는 평소 정보 공유와 역할 배분 방식에 연간 변화가 더해지는지를 봅니다. 시간 배분과 기대치 조정의 압력이 기존보다 강해지는지 비교하고 근거가 약하면 유지로 판정합니다. 특정 만남이나 결혼 같은 사건은 확정하지 않습니다.'
 };
 const judgments={
  saju_core:'기본 반응의 중심은 원국의 계절 조건과 일간 관계에서 판정합니다.',
  mbti_contradiction:'외부 표현과 내부 반응의 간격이 두 체계의 핵심 차이입니다.',
  decision:'결정 전 정보 수집과 결정 후 실행 속도를 분리해서 봐야 합니다.',
  money:'금전 판단은 비용 확대와 손실 허용 범위를 우선 확인합니다.',
  career:'일의 적합성은 역할 범위와 판단 권한의 조합으로 구분합니다.',
  relationship:'관계의 변수는 정보 공유 시점과 역할 기대의 차이입니다.',
  stress:'압박 시에는 표현량과 챙기려는 일이 얼마나 늘어나는지가 먼저 드러납니다.',
  integrated_judgment:'두 체계의 충돌은 조건별 작동 차이로 통합해 해석합니다.',
  year_2027:'2027년 변화는 평소 패턴과 비교해 연간 근거가 있는 부분만 반영합니다.',
  year_2027_money:'2027년 돈은 평소보다 비용과 반복 가능성의 변화 여부를 봅니다.',
  year_2027_career:'2027년 일은 평소 역할에서 책임과 판단권이 달라지는지를 비교합니다.',
  year_2027_relationship:'2027년 관계는 기존 정보 공유와 시간 배분의 변화를 비교합니다.'
 };
 return {meta:{name:'',mbti:'모름',chart:{year:'甲子',month:'甲子',day:'甲子',hour:'甲子',calculationStatus:'complete'},targetYear:2027,versions:{ruleset:'test',prompt:'test',schema:'test'}},sections:Q.IDS.map((id,i)=>({id,title:'테스트 '+(i+1),body:[bodies[id]],keyJudgment:judgments[id],evidence:['검증된 계산 사실 '+i]})),finalJudgment:{body:['전체 판단을 종합합니다.'],closingQuestion:'꼼꼼하게 확인하느라 결정을 늦출 때는, 오늘 확인할 내용을 먼저 정하는 것이 도움이 됩니다.',afterClosingText:''}}}

run('premium quality gate accepts complete distinct report',()=>{const r=Q.validate(mockReport());assert.equal(r.pass,true,JSON.stringify(r.errors))});
run('premium quality gate keeps chart Hanja but rejects Hanja in all reader prose',()=>{const x=mockReport();x.meta.chart.day='甲子';assert.equal(Q.validate(x).pass,true,JSON.stringify(Q.validate(x).errors));for(const index of [0,2,8]){const y=mockReport();y.sections[index].body[0]+=' 원국의 일간 甲을 풀이합니다.';const r=Q.validate(y);assert.equal(r.pass,false);assert.ok(r.errors.some(e=>e.includes('Hanja')))}});
run('premium quality gate rejects cliché fortune language',()=>{const x=mockReport();x.sections[1].body[0]+=' 귀인의 도움';const r=Q.validate(x);assert.equal(r.pass,false);assert.ok(r.errors.some(e=>e.includes('generic/cliche')))});
run('premium quality gate rejects banned filler',()=>{const x=mockReport();x.sections[0].body[0]+=' 이 점이 중요합니다';assert.equal(Q.validate(x).pass,false)});
run('premium quality gate rejects text after final conclusion',()=>{const x=mockReport();x.finalJudgment.afterClosingText='추가 설명';assert.equal(Q.validate(x).pass,false)});
run('premium quality gate rejects question ending',()=>{const x=mockReport();x.finalJudgment.closingQuestion='어떤 선택을 하시겠습니까?';assert.equal(Q.validate(x).pass,false)});

run('premium quality gate rejects anyone-style wording',()=>{const x=mockReport();x.sections[2].body[0]+=' 균형이 중요합니다.';const r=Q.validate(x);assert.equal(r.pass,false);assert.ok(r.errors.some(e=>e.includes('could-apply-to-anyone')))});
run('premium quality gate rejects vague evidence',()=>{const x=mockReport();x.sections[2].evidence=['근거'];const r=Q.validate(x);assert.equal(r.pass,false);assert.ok(r.errors.some(e=>e.includes('evidence too vague')))});
run('premium quality gate rejects sugarcoating',()=>{const x=mockReport();x.sections[2].body[0]+=' 결국 잘 풀릴 것입니다.';const r=Q.validate(x);assert.equal(r.pass,false);assert.ok(r.errors.some(e=>e.includes('unsupported positive framing')))});
run('premium quality gate rejects overreaching advice',()=>{const x=mockReport();x.sections[2].body[0]+=' 반드시 해야 합니다.';const r=Q.validate(x);assert.equal(r.pass,false);assert.ok(r.errors.some(e=>e.includes('overreaching advice')))});

run('premium quality gate rejects abstract user-facing wording',()=>{const x=mockReport();x.sections[3].keyJudgment='내가 통제할 수 있는 돈에 민감합니다.';const r=Q.validate(x);assert.equal(r.pass,false);assert.ok(r.errors.some(e=>e.includes('abstract wording')))});
run('premium quality gate rejects vague production-style summary',()=>{const x=mockReport();x.sections[0].keyJudgment='새로운 선택지에는 관심을 보이지만, 시간을 쓰기로 약속할 때는 계획과 말을 따져볼 수 있습니다.';const r=Q.validate(x);assert.equal(r.pass,false);assert.ok(r.errors.some(e=>e.includes('vague phrase')||e.includes('abstract wording')))});
run('premium quality gate rejects repeated section analysis',()=>{const x=mockReport();x.sections[4].body=x.sections[3].body.slice();x.sections[4].keyJudgment=x.sections[3].keyJudgment;const r=Q.validate(x);assert.equal(r.pass,false);assert.ok(r.errors.some(e=>e.includes('similar')||e.includes('repeated')))});
run('premium quality gate accepts different evidence by domain',()=>{const x=mockReport();x.sections[3].evidence=['재성 계산값이 금전 판단에 직접 연결됨'];x.sections[4].evidence=['관성 계산값이 역할과 책임 판단에 직접 연결됨'];assert.equal(Q.validate(x).pass,true)});

run('rejects repeated paragraphs within a section',()=>{const x=mockReport();x.sections[0].body.push(x.sections[0].body[0]);assert.ok(Q.validate(x).errors.some(e=>e.includes('repeated body sentence')))});
run('rejects leaked fields and duplicated words',()=>{const x=mockReport();x.sections[0].body.push('profileBalance_score 때문에 결정을 결정을 미룹니다.');const q=Q.validate(x);assert.ok(q.errors.some(e=>e.includes('internal field')));assert.ok(q.errors.some(e=>e.includes('adjacent word')))});

run('ten-god facts use chart stems and preserve unknown-time limitations',()=>{const p=F.build({calendar:'solar',birthDate:'1999-09-24',unknownBirthTime:true,gender:'female',mbti:'ISFP'});assert.equal(p.facts.tenGods.month.stemTenGod,'편재');assert.equal(p.facts.annualTenGods.stemTenGod,'편인');assert.equal(p.facts.tenGods.year.hiddenStems[0].tenGod,'편관');assert.equal(p.facts.tenGods.hour,undefined);assert.equal(p.facts.natalClashes.length,2);assert.equal(p.fortune.status,'unavailable_without_birth_time')});
run('same branch is never mislabeled as a clash',()=>{const p=F.build({...sample,birthDate:'1991-06-15'});assert(!p.facts.targetYearRelations.some(r=>r.between==='year'));for(const relation of p.facts.natalClashes)assert.notEqual(relation.branches[0],relation.branches[1])});
run('expanded reports reject missing topic metadata and unmatched paragraphs',()=>{const r=mockReport();r.meta.versions.schema='depth-v2';const q=Q.validate(r);assert(q.errors.some(x=>x.includes('topics unknown or reordered')));assert(q.errors.some(x=>x.includes('topic explanations incomplete')))});

run('curated cover copy goes through the same language checks',()=>{const r=mockReport();r.cover={headline:'핵심 제목',description:'핵심 설명',keywords:['하나','둘','셋'],highlights:[{sectionId:'money',title:'돈의 특징',description:'귀인의 도움으로 돈이 늘어납니다.'}]};assert(Q.validate(r).errors.some(e=>e.includes('generic/cliche')))});


run('structural evidence matches known pillars and month root',()=>{
 const p=F.build({calendar:'solar',birthDate:'1990-05-15',birthTime:'10:30',birthplace:'서울',gender:'male',mbti:'INTJ',name:'테스트'});
 assert.equal(p.status,'ready');
 const e=p.facts.structuralEvidence;
 assert.ok(e&&e.monthCommand&&Array.isArray(e.dayMasterRoots));
 assert.equal(e.monthCommand.branch,p.chart.month.slice(-1));
 const root=e.monthCommand.mainHiddenStem;
 assert.ok(p.facts.hiddenStems.month.includes(root));
 assert.equal(e.dayMasterRoots.length,4);
 for(const x of e.dayMasterRoots){
  assert.deepEqual(x.hiddenStems,p.facts.hiddenStems[x.position]);
  for(const stem of x.sameElementStems)assert.ok(x.hiddenStems.includes(stem));
 }
 assert.equal(e.visibleStems.length,4);
 assert.ok(e.interpretationLimits.some(x=>x.includes('신강')));
});
run('unknown birth time structural evidence excludes hour',()=>{
 const p=F.build({...sample,birthTime:'',unknownBirthTime:true});
 assert.equal(p.status,'ready');
 assert.equal(p.chart.hour,null);
 assert.equal(p.facts.structuralEvidence.dayMasterRoots.length,3);
 assert.equal(p.facts.structuralEvidence.visibleStems.length,3);
 assert.ok(!p.facts.structuralEvidence.dayMasterRoots.some(x=>x.position==='hour'));
});
run('structural evidence is consistent across varied inputs',()=>{
 for(const {input} of cases){
  const p=F.build(input),e=p.facts.structuralEvidence;
  assert.equal(p.status,'ready');
  assert.equal(e.monthCommand.branch,p.chart.month.slice(-1));
  assert.equal(e.visibleStems.length,Object.values(p.chart).filter(Boolean).length);
  for(const x of e.dayMasterRoots)assert.deepEqual(x.hiddenStems,p.facts.hiddenStems[x.position]);
 }
});

run('rejects invented month main hidden stem in report evidence',()=>{
 const packet=F.build({calendar:'solar',birthDate:'1990-05-15',birthTime:'10:30',birthplace:'서울',gender:'male',mbti:'INTJ'});
 const actual=packet.facts.structuralEvidence.monthCommand.mainHiddenStem;
 const wrong=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'].find(x=>x!==actual);
 const report=mockReport();
 report.sections[0].evidence=['월지의 본기는 '+wrong+'입니다.'];
 const check=Q.verifyEvidenceAgainstFacts(report,packet);
 assert.ok(check.errors.some(x=>x.includes('month main hidden stem')),JSON.stringify(check));
 report.sections[0].evidence=['월지의 본기는 '+actual+'입니다.'];
 assert.ok(!Q.verifyEvidenceAgainstFacts(report,packet).errors.some(x=>x.includes('month main hidden stem')));
});

run('quality gate rejects paraphrased duplicate conclusions',()=>{
 const r=mockReport();
 r.sections[2].keyJudgment='정보 공유 시점과 책임 범위를 확인해야 합니다.';
 r.sections[5].keyJudgment='정보를 공유 시점과 책임의 범위를 확인해야 합니다.';
 const q=Q.validate(r);
 assert.ok(q.errors.some(x=>x.includes('paraphrased judgment repeated')),JSON.stringify(q.errors));
});

run('paraphrase normalization catches whitespace and punctuation variants',()=>{
 const r=mockReport();
 r.sections[2].keyJudgment='정보 공유 시점과 책임 범위를 확인해야 합니다.';
 r.sections[5].keyJudgment='정보를 공유 시점과 책임의 범위를 확인해야 합니다!';
 const q=Q.validate(r);
 assert.ok(q.errors.some(x=>x.includes('paraphrased judgment repeated')),JSON.stringify(q.errors));
});
run('distinct conclusions are not flagged as paraphrases',()=>{
 const r=mockReport();
 const q=Q.validate(r);
 assert.ok(!q.errors.some(x=>x.includes('paraphrased judgment repeated')),JSON.stringify(q.errors));
});

run('paid quality gate rejects substantive evidence copied across chapters',()=>{
 const r=mockReport();
 const copied='월지 본기와 일간의 관계를 함께 확인하여 해석의 전제를 세웠습니다.';
 r.sections[2].evidence=[copied];
 r.sections[5].evidence=[copied+'!'];
 const q=Q.validate(r);
 assert.ok(q.errors.some(x=>x.includes('reused evidence across chapters')),JSON.stringify(q.errors));
});
run('paid quality gate permits distinct chapter evidence',()=>{
 const r=mockReport();
 r.sections[2].evidence=['월지 본기를 근거로 판단 시점의 차이를 살펴보았습니다.'];
 r.sections[5].evidence=['일지 지장간을 근거로 관계 표현의 조건을 따로 검토했습니다.'];
 const q=Q.validate(r);
 assert.ok(!q.errors.some(x=>x.includes('reused evidence across chapters')),JSON.stringify(q.errors));
});

run('MBTI paid chapter must visibly compare MBTI preference and calculated saju',()=>{
 const packet=F.build({calendar:'solar',birthDate:'1990-05-15',birthTime:'10:30',birthplace:'서울',gender:'male',mbti:'INTJ'});
 const report=mockReport();
 const section=report.sections.find(x=>x.id==='mbti_contradiction');
 section.keyJudgment='상황에 따라 결정을 바꾸는 방식을 설명합니다.';
 section.body=['같은 일을 선택할 때 이유를 꼼꼼히 살핍니다.'];
 const missing=Q.validate(report,packet).errors;
 assert(missing.includes('mbti comparison: visible MBTI preference interpretation missing'));
 assert(missing.includes('mbti comparison: visible calculated saju comparison missing'));
 section.body=['MBTI에서 사고형과 판단형은 정보를 비교하고 결론을 정하는 선호를 설명합니다. 사주에서 월지와 일간은 전통적으로 다른 질문에 답합니다.'];
 section.body=['MBTI 사고형은 판단 이유를 따지는 선호입니다. 사주 월지는 태어난 계절의 조건을 뜻합니다.'];
 assert(Q.validate(report,packet).errors.includes('mbti comparison: no explicit relation between the two interpretations'),'naming both systems without comparing them must fail');
 section.body=['MBTI 사고형의 판단 선호를 설명합니다.', '사주 월지의 해석을 설명합니다.', '이 두 설명을 비교해야 합니다.'];
 assert(Q.validate(report,packet).errors.includes('mbti comparison: no explicit relation between the two interpretations'),'disconnected mentions and stray comparison must fail');
 section.body=['MBTI 사고형의 판단 선호와 사주 월지의 해석은 같은 선택 상황을 서로 다른 관점에서 설명합니다.'];
 const checked=Q.validate(report,packet).errors;
 assert(!checked.some(x=>x.startsWith('mbti comparison:')));
});
run('reference case locks four pillars and 2027 annual stem relationships',()=>{
 const p=F.build({calendar:'solar',birthDate:'1990-05-15',birthTime:'10:30',birthplace:'서울',gender:'male',mbti:'INTJ'});
 assert.equal(p.status,'ready');
 assert.deepEqual(p.chart,{year:'庚午',month:'辛巳',day:'庚辰',hour:'辛巳'});
 assert.equal(p.targetYear.pillar,'丁未');
 assert.equal(p.facts.dayMaster,'庚');
 assert.equal(p.facts.structuralEvidence.monthCommand.mainHiddenStem,'丙');
 assert.equal(p.facts.structuralEvidence.monthCommand.mainHiddenStemTenGod,'편관');
 assert.equal(p.facts.annualTenGods.stemTenGod,'정관');
 assert.equal(p.facts.targetYearRelations.length,0);
 assert.equal(p.facts.natalClashes.length,0);
});
run('2027 year-branch clash is restricted to actual opposing natal branches',()=>{
 const p=F.build({calendar:'solar',birthDate:'1991-06-15',birthTime:'12:00',birthplace:'서울',gender:'female',mbti:'ISTJ'});
 assert.equal(p.status,'ready');
 assert.equal(p.targetYear.pillar,'丁未');
 for(const relation of p.facts.targetYearRelations){
  assert.equal(relation.type,'충');
  assert.equal(relation.branches.slice(-1),'未');
  assert.equal(relation.branches[0],'丑');
 }
});

run('calendar rejects impossible solar dates and malformed times',()=>{
 for(const date of ['2001-02-29','2026-04-31','2026-13-01','2026-00-10','2026-01-00','2026/01/01']){
  assert.throws(()=>C.calculate({...sample,birthDate:date}),/invalid|range/);
 }
 for(const time of ['24:00','12:60','7:30','bad']){
  assert.throws(()=>C.calculate({...sample,birthTime:time}),/invalid/);
 }
});
run('calendar accepts leap day and sect-2 late zi boundary',()=>{
 const leap=C.calculate({...sample,birthDate:'2000-02-29',birthTime:'23:30'});
 assert.equal(leap.status,'complete');
 const early=C.calculate({...sample,birthDate:'2000-02-29',birthTime:'00:30'});
 assert.equal(leap.chart.day,early.chart.day);
 assert.equal(leap.chart.hour.slice(-1),'子');
});
run('unknown birth hour is excluded regardless of placeholder time',()=>{
 const a=F.build({...sample,birthDate:'2000-06-15',birthTime:'',unknownBirthTime:true});
 const b=F.build({...sample,birthDate:'2000-06-15',birthTime:'12:00',unknownBirthTime:true});
 assert.equal(a.chart.hour,null);
 assert.equal(b.chart.hour,null);
 assert.deepEqual(a.chart,b.chart);
 assert.equal(a.fortune.status,'unavailable_without_birth_time');
});

run('solar-lunar conversion roundtrip preserves four pillars',()=>{
 const {Solar}=require('lunar-javascript');
 for(const [date,time] of [['1990-05-15','10:30'],['2000-02-29','23:30'],['2024-02-10','12:00'],['2024-09-17','08:15']]){
  const solar=C.calculate({...sample,calendar:'solar',birthDate:date,birthTime:time});
  const [y,m,d]=date.split('-').map(Number);
  const lunar=Solar.fromYmdHms(y,m,d,...time.split(':').map(Number),0).getLunar();
  const viaLunar=C.calculate({...sample,calendar:'lunar',birthDate:[lunar.getYear(),String(Math.abs(lunar.getMonth())).padStart(2,'0'),String(lunar.getDay()).padStart(2,'0')].join('-'),leapMonth:lunar.getMonth()<0,birthTime:time});
  assert.equal(viaLunar.solarDate,date);
  assert.deepEqual(viaLunar.chart,solar.chart);
 }
});
run('seasonal boundary changes month pillar across early February',()=>{
 const before=C.calculate({...sample,birthDate:'2024-02-03',birthTime:'12:00'});
 const after=C.calculate({...sample,birthDate:'2024-02-05',birthTime:'12:00'});
 assert.notEqual(before.chart.month,after.chart.month);
 assert.notEqual(before.chart.year,after.chart.year);
});
run('decade fortune sequence is ordered and direction differs by gender',()=>{
 const male=C.fortune({...sample,birthDate:'1990-05-15',birthTime:'10:30',gender:'male'});
 const female=C.fortune({...sample,birthDate:'1990-05-15',birthTime:'10:30',gender:'female'});
 assert.equal(male.status,'complete');assert.equal(female.status,'complete');
 assert.notEqual(male.forward,female.forward);
 for(const f of [male,female]){
  assert.ok(f.decades.length>=8);
  for(let i=1;i<f.decades.length;i++){
   assert.ok(f.decades[i].startYear>=f.decades[i-1].startYear);
   assert.ok(f.decades[i].startAge>=f.decades[i-1].startAge);
  }
 }
});
run('invalid lunar leap month cannot silently become an ordinary month',()=>{
 assert.throws(()=>C.calculate({...sample,calendar:'lunar',birthDate:'2024-05-12',leapMonth:true}),/invalid|leap|month|range|not found/i);
});

run('public API input validation rejects impossible lunar leap month',()=>{
 const validate=require('./input-validation').validateInput;
 const invalid={...sample,calendar:'lunar',birthDate:'2024-05-12',leapMonth:true};
 assert.ok(validate(invalid).length>0);
 const solarInvalid={...sample,calendar:'solar',leapMonth:true};
 assert.ok(validate(solarInvalid).some(x=>x.includes('윤달')));
 const valid={...sample,calendar:'solar',birthDate:'2024-02-29',leapMonth:false};
 assert.deepEqual(validate(valid),[]);
});

run('fact packet discloses absent birthplace and true-solar-time correction',()=>{
 const p=F.build({...sample,birthplace:'부산'});
 assert.equal(p.status,'ready');
 assert.equal(p.calculationPolicy.birthplaceUsedForCalculation,false);
 assert.equal(p.calculationPolicy.trueSolarTime,false);
 assert.equal(p.calculationPolicy.timezoneConversion,false);
 assert.equal(p.calculationPolicy.lateZiDayBoundary,'civil-day-sect-2');
 const q=F.build({...sample,birthplace:'서울'});
 assert.deepEqual(p.chart,q.chart);
});
run('premium prompt forbids claims of unperformed solar-time conversion',()=>{
 const fs=require('fs');
 const prompt=fs.readFileSync('report-prompt.js','utf8');
 assert.ok(prompt.includes('진태양시'));
 assert.ok(prompt.includes('calculationPolicy'));
});

run('birthplace limitation is disclosed at entry before report purchase',()=>{
 const html=require('fs').readFileSync('index.html','utf8');
 assert.ok(html.includes('출생지는 기록용이며 시차·태양시 보정에는 사용하지 않습니다.'));
 const p=F.build({...sample,birthplace:'서울'});
 assert.equal(p.calculationPolicy.birthplaceUsedForCalculation,false);
});
run('birth time near 2-hour pillar boundaries is not silently corrected by birthplace',()=>{
 const base={...sample,birthDate:'2000-06-15',calendar:'solar'};
 for(const time of ['00:59','01:00','22:59','23:00']){
  const seoul=F.build({...base,birthTime:time,birthplace:'서울'});
  const busan=F.build({...base,birthTime:time,birthplace:'부산'});
  assert.equal(seoul.status,'ready');
  assert.deepEqual(seoul.chart,busan.chart);
 }
});

run('annual 2027 fortune is explicitly bounded by Ipchun convention',()=>{
 const packet=F.build({...sample,targetYear:2027},2027);
 assert.equal(packet.targetYear.pillar,'丁未');
 assert.equal(packet.calculationPolicy.annualPillarBoundary,'ipchun-solar-term');
 const prompt=require('fs').readFileSync('report-prompt.js','utf8');
 assert.ok(prompt.includes('입춘 기준'));
 assert.ok(prompt.includes('1월 1일'));
});

run('2027 Gregorian January remains prior seasonal year until Ipchun',()=>{
 const january=C.calculate({...sample,birthDate:'2027-01-15',birthTime:'12:00'});
 const february=C.calculate({...sample,birthDate:'2027-02-10',birthTime:'12:00'});
 assert.equal(january.chart.year,'丙午');
 assert.equal(february.chart.year,'丁未');
 assert.notEqual(january.chart.month,february.chart.month);
 assert.equal(P.annualPillar(2027),'丁未');
});
