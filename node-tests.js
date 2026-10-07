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
const Q=require('./report-quality-node');
const cases=[
 {label:'winter male ENFP',input:{calendar:'solar',birthDate:'1993-01-18',birthTime:'07:30',birthplace:'서울',gender:'male',mbti:'ENFP',name:'테스트'}},
 {label:'summer female ISTJ',input:{calendar:'solar',birthDate:'1988-08-21',birthTime:'22:10',birthplace:'부산',gender:'female',mbti:'ISTJ',name:'테스트'}},
 {label:'unknown birth time INTP',input:{calendar:'solar',birthDate:'2001-11-03',birthTime:'',unknownBirthTime:true,birthplace:'대전',gender:'male',mbti:'INTP',name:'테스트'}},
 {label:'lunar input ISFP',input:{calendar:'lunar',birthDate:'1995-05-12',birthTime:'14:20',birthplace:'광주',gender:'female',mbti:'ISFP',name:'테스트'}}
];
cases.forEach(({label,input})=>run('matrix '+label,()=>{const r=F.build(input);assert.equal(r.status,'ready');assert.ok(r.chart.year&&r.chart.month&&r.chart.day);if(input.unknownBirthTime)assert.equal(r.chart.hour,null);else assert.ok(r.chart.hour);assert.equal(r.calculationInput.mbti,input.mbti);assert.equal(r.constraints.nameAnalysisEnabled,false)}));

function mockReport(){return {meta:{name:'',mbti:'모름',chart:{year:'甲子',month:'甲子',day:'甲子',hour:'甲子',calculationStatus:'complete'},targetYear:2027,versions:{ruleset:'test',prompt:'test',schema:'test'}},sections:Q.IDS.map((id,i)=>({id,title:'테스트 '+(i+1),body:[('근거와 작동 원리를 설명하는 테스트 문장입니다. 서로 다른 영역의 판단을 검증하기 위한 내용이며 반복되는 일반 조언이 아니라 입력된 계산 사실을 바탕으로 분석이 충분한 깊이를 갖는지 확인합니다. ').repeat(5)+i],keyJudgment:['주도권과 속도 사이의 균형이 핵심입니다.','내적 기준과 외부 반응의 간격을 읽어야 합니다.','결정 전 검토와 결정 후 실행을 분리하는 편이 유리합니다.','수입보다 비용과 책임의 증가폭을 함께 봐야 합니다.','숙련보다 판단 권한이 커지는 일을 구분해야 합니다.','표현 방식보다 정보 공유 시점의 차이를 관리해야 합니다.','과부하 초기에는 설명을 줄이고 결론만 찾는 경향을 점검해야 합니다.','상반된 성향은 상황별 역할을 나누면 보완 관계가 됩니다.','연간 변화는 평생 성향과 분리해 해석해야 합니다.','연간 금전 판단은 최대 손실과 반복 가능성을 함께 확인해야 합니다.','연간 직업 판단은 책임과 보상의 비대칭을 먼저 확인해야 합니다.','연간 관계 변화는 역할과 시간 배분의 재협상 여부를 봐야 합니다.'][i],evidence:['검증된 계산 사실 '+i]})),finalJudgment:{body:['전체 판단을 종합합니다.'],closingQuestion:'이 판단을 실제 선택에서 어떻게 확인할 것인가?',afterClosingText:''}}}
run('premium quality gate accepts complete distinct report',()=>{const r=Q.validate(mockReport());assert.equal(r.pass,true)});
run('premium quality gate rejects thin section',()=>{const x=mockReport();x.sections[3].body=['짧음'];const r=Q.validate(x);assert.equal(r.pass,false);assert.ok(r.errors.some(e=>e.includes('analysis too thin')))});
run('premium quality gate rejects Hanja in prose',()=>{const x=mockReport();x.sections[0].body[0]+=' 甲';const r=Q.validate(x);assert.equal(r.pass,false);assert.ok(r.errors.some(e=>e.includes('Hanja')))});
run('premium quality gate rejects cliché fortune language',()=>{const x=mockReport();x.sections[1].body[0]+=' 귀인의 도움';const r=Q.validate(x);assert.equal(r.pass,false);assert.ok(r.errors.some(e=>e.includes('generic/cliche')))});
run('premium quality gate rejects insufficient total depth',()=>{const x=mockReport();x.sections.forEach((s,i)=>s.body=[('서로 다른 근거를 실제 행동과 연결해 설명하는 문장입니다. '+i+' ').repeat(4)]);const r=Q.validate(x);assert.equal(r.pass,false);assert.ok(r.errors.some(e=>e.includes('total analysis too thin')))});
run('premium quality gate rejects banned filler',()=>{const x=mockReport();x.sections[0].body[0]+=' 이 점이 중요합니다';assert.equal(Q.validate(x).pass,false)});
run('premium quality gate rejects text after closing question',()=>{const x=mockReport();x.finalJudgment.afterClosingText='추가 설명';assert.equal(Q.validate(x).pass,false)});
run('premium quality gate requires question ending',()=>{const x=mockReport();x.finalJudgment.closingQuestion='최종 결론입니다.';assert.equal(Q.validate(x).pass,false)});
