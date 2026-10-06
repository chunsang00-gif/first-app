const assert=require('assert');const C=require('./calendar-provider-node'),P=require('./production-pipeline-node'),F=require('./report-facts-node'),N=require('./name-analysis'),NR=require('./name-ruleset');
function run(name,fn){try{fn();console.log('PASS',name)}catch(e){console.error('FAIL',name,e.message);process.exitCode=1}}
const sample={calendar:'solar',birthDate:'2000-06-15',birthTime:'12:00',birthplace:'서울',gender:'female',mbti:'모름',name:''};
run('generic solar input calculates four pillars',()=>{const r=C.calculate(sample);assert.equal(r.status,'complete');assert.ok(r.chart.year&&r.chart.month&&r.chart.day&&r.chart.hour)});
run('unknown time suppresses hour pillar',()=>{const r=C.calculate({...sample,birthTime:'',unknownBirthTime:true});assert.equal(r.chart.hour,null)});
run('Daewoon convention returns onset fields',()=>{const r=C.fortune(sample);assert.equal(r.status,'complete');assert.equal(typeof r.forward,'boolean');assert.ok(Number.isInteger(r.start.year))});
run('2027 annual pillar is deterministic',()=>{assert.equal(P.annualPillar(2027),'丁未')});
run('production result carries provenance',()=>{const r=P.calculate(sample);assert.equal(P.canAnalyze(r),true);assert.ok(r.provenance.year&&r.provenance.day)});
run('report packet is facts-only and ready',()=>{const r=F.build(sample);assert.equal(r.status,'ready');assert.equal(r.constraints.factsOnly,true);assert.equal(r.constraints.nameAnalysisEnabled,false)});
run('report handoff preserves generic input',()=>{const r=F.build(sample);assert.equal(r.calculationInput.birthDate,sample.birthDate);assert.equal(r.calculationInput.birthTime,sample.birthTime)});
run('unverified hanja is blocked',()=>{const r=N.analyze('테스트','天地人');assert.equal(r.status,'needs_verified_dictionary')});
run('name ruleset contains no embedded user dictionary',()=>{assert.deepEqual(NR.VERIFIED,{})});