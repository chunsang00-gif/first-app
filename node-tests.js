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
function mockReport(){return {meta:{name:'',mbti:'모름',chart:{year:'甲子',month:'甲子',day:'甲子',hour:'甲子',calculationStatus:'complete'},targetYear:2027,versions:{ruleset:'test',prompt:'test',schema:'test'}},sections:Q.IDS.map((id,i)=>({id,title:'테스트 '+(i+1),body:[('근거와 작동 원리를 설명하는 테스트 문장입니다. 서로 다른 영역의 판단을 검증하기 위한 내용이며 반복되는 일반 조언이 아니라 입력된 계산 사실을 바탕으로 분석이 충분한 깊이를 갖는지 확인합니다. ').repeat(2)+i],keyJudgment:'영역 '+(i+1)+'의 고유한 판정 문장입니다.',evidence:['검증된 계산 사실 '+i]})),finalJudgment:{body:['전체 판단을 종합합니다.'],closingQuestion:'이 판단을 실제 선택에서 어떻게 확인할 것인가?',afterClosingText:''}}}
run('premium quality gate accepts complete distinct report',()=>{const r=Q.validate(mockReport());assert.equal(r.pass,true)});
run('premium quality gate rejects thin section',()=>{const x=mockReport();x.sections[3].body=['짧음'];const r=Q.validate(x);assert.equal(r.pass,false);assert.ok(r.errors.some(e=>e.includes('analysis too thin')))});
run('premium quality gate rejects banned filler',()=>{const x=mockReport();x.sections[0].body[0]+=' 이 점이 중요합니다';assert.equal(Q.validate(x).pass,false)});
run('premium quality gate rejects text after closing question',()=>{const x=mockReport();x.finalJudgment.afterClosingText='추가 설명';assert.equal(Q.validate(x).pass,false)});
run('premium quality gate requires question ending',()=>{const x=mockReport();x.finalJudgment.closingQuestion='최종 결론입니다.';assert.equal(Q.validate(x).pass,false)});
