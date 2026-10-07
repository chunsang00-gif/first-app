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

run('browser prompt contract parses',()=>{const fs=require('fs'),vm=require('vm');const src=fs.readFileSync('report-prompt.js','utf8');const sandbox={window:{}};vm.runInNewContext(src,sandbox);assert.ok(sandbox.window.REPORT_PROMPT);assert.equal(sandbox.window.REPORT_PROMPT.version,'premium-v1.3')});
const Q=require('./report-quality-node');
const cases=[
 {label:'winter male ENFP',input:{calendar:'solar',birthDate:'1993-01-18',birthTime:'07:30',birthplace:'서울',gender:'male',mbti:'ENFP',name:'테스트'}},
 {label:'summer female ISTJ',input:{calendar:'solar',birthDate:'1988-08-21',birthTime:'22:10',birthplace:'부산',gender:'female',mbti:'ISTJ',name:'테스트'}},
 {label:'unknown birth time INTP',input:{calendar:'solar',birthDate:'2001-11-03',birthTime:'',unknownBirthTime:true,birthplace:'대전',gender:'male',mbti:'INTP',name:'테스트'}},
 {label:'lunar input ISFP',input:{calendar:'lunar',birthDate:'1995-05-12',birthTime:'14:20',birthplace:'광주',gender:'female',mbti:'ISFP',name:'테스트'}}
];
cases.forEach(({label,input})=>run('matrix '+label,()=>{const r=F.build(input);assert.equal(r.status,'ready');assert.ok(r.chart.year&&r.chart.month&&r.chart.day);if(input.unknownBirthTime)assert.equal(r.chart.hour,null);else assert.ok(r.chart.hour);assert.equal(r.calculationInput.mbti,input.mbti);assert.equal(r.constraints.nameAnalysisEnabled,false)}));

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
 return {meta:{name:'',mbti:'모름',chart:{year:'甲子',month:'甲子',day:'甲子',hour:'甲子',calculationStatus:'complete'},targetYear:2027,versions:{ruleset:'test',prompt:'test',schema:'test'}},sections:Q.IDS.map((id,i)=>({id,title:'테스트 '+(i+1),body:[bodies[id],bodies[id]],keyJudgment:judgments[id],evidence:['검증된 계산 사실 '+i]})),finalJudgment:{body:['전체 판단을 종합합니다.'],closingQuestion:'이 판단을 실제 선택에서 어떻게 확인할 것인가?',afterClosingText:''}}}

run('premium quality gate accepts complete distinct report',()=>{const r=Q.validate(mockReport());assert.equal(r.pass,true,JSON.stringify(r.errors))});
run('premium quality gate rejects Hanja in prose',()=>{const x=mockReport();x.sections[0].body[0]+=' 甲';const r=Q.validate(x);assert.equal(r.pass,false);assert.ok(r.errors.some(e=>e.includes('Hanja')))});
run('premium quality gate rejects cliché fortune language',()=>{const x=mockReport();x.sections[1].body[0]+=' 귀인의 도움';const r=Q.validate(x);assert.equal(r.pass,false);assert.ok(r.errors.some(e=>e.includes('generic/cliche')))});
run('premium quality gate rejects banned filler',()=>{const x=mockReport();x.sections[0].body[0]+=' 이 점이 중요합니다';assert.equal(Q.validate(x).pass,false)});
run('premium quality gate rejects text after closing question',()=>{const x=mockReport();x.finalJudgment.afterClosingText='추가 설명';assert.equal(Q.validate(x).pass,false)});
run('premium quality gate requires question ending',()=>{const x=mockReport();x.finalJudgment.closingQuestion='최종 결론입니다.';assert.equal(Q.validate(x).pass,false)});

run('premium quality gate rejects anyone-style wording',()=>{const x=mockReport();x.sections[2].body[0]+=' 균형이 중요합니다.';const r=Q.validate(x);assert.equal(r.pass,false);assert.ok(r.errors.some(e=>e.includes('could-apply-to-anyone')))});
run('premium quality gate rejects vague evidence',()=>{const x=mockReport();x.sections[2].evidence=['근거'];const r=Q.validate(x);assert.equal(r.pass,false);assert.ok(r.errors.some(e=>e.includes('evidence too vague')))});
run('premium quality gate rejects sugarcoating',()=>{const x=mockReport();x.sections[2].body[0]+=' 결국 잘 풀릴 것입니다.';const r=Q.validate(x);assert.equal(r.pass,false);assert.ok(r.errors.some(e=>e.includes('unsupported positive framing')))});
run('premium quality gate rejects overreaching advice',()=>{const x=mockReport();x.sections[2].body[0]+=' 반드시 해야 합니다.';const r=Q.validate(x);assert.equal(r.pass,false);assert.ok(r.errors.some(e=>e.includes('overreaching advice')))});

run('premium quality gate rejects abstract user-facing wording',()=>{const x=mockReport();x.sections[3].keyJudgment='내가 통제할 수 있는 돈에 민감합니다.';const r=Q.validate(x);assert.equal(r.pass,false);assert.ok(r.errors.some(e=>e.includes('abstract wording')))});
run('premium quality gate rejects vague production-style summary',()=>{const x=mockReport();x.sections[0].keyJudgment='새로운 선택지에는 관심을 보이지만, 시간을 쓰기로 약속할 때는 계획과 말을 따져볼 수 있습니다.';const r=Q.validate(x);assert.equal(r.pass,false);assert.ok(r.errors.some(e=>e.includes('vague phrase')||e.includes('abstract wording')))});
run('premium quality gate rejects repeated section analysis',()=>{const x=mockReport();x.sections[4].body=x.sections[3].body.slice();x.sections[4].keyJudgment=x.sections[3].keyJudgment;const r=Q.validate(x);assert.equal(r.pass,false);assert.ok(r.errors.some(e=>e.includes('similar')||e.includes('repeated')))});
run('premium quality gate accepts different evidence by domain',()=>{const x=mockReport();x.sections[3].evidence=['재성 계산값이 금전 판단에 직접 연결됨'];x.sections[4].evidence=['관성 계산값이 역할과 책임 판단에 직접 연결됨'];assert.equal(Q.validate(x).pass,true)});
