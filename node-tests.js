const assert=require('assert');const C=require('./calendar-provider-node'),P=require('./production-pipeline-node'),F=require('./report-facts-node');
function run(name,fn){try{fn();console.log('PASS',name)}catch(e){console.error('FAIL',name,e.message);process.exitCode=1}}
const sample={calendar:'solar',birthDate:'1983-01-07',birthTime:'14:20',birthplace:'대구',gender:'male',mbti:'ISFP',name:'박준민'};
run('solar sample calculates four pillars',()=>{const r=C.calculate(sample);assert.equal(r.status,'complete');assert.equal(r.solarDate,'1983-01-07');assert.ok(r.chart.year&&r.chart.month&&r.chart.day&&r.chart.hour)});
run('lunar conversion round trip',()=>{const r=C.calculate({...sample,calendar:'lunar',birthDate:'1982-11-24',leapMonth:false});assert.equal(r.solarDate,'1983-01-07')});
run('unknown time suppresses hour pillar',()=>{const r=C.calculate({...sample,birthTime:'',unknownBirthTime:true});assert.equal(r.chart.hour,null)});
run('Daewoon convention returns onset fields',()=>{const r=C.fortune(sample);assert.equal(r.status,'complete');assert.equal(typeof r.forward,'boolean');assert.ok(Number.isInteger(r.start.year))});
run('2027 annual pillar is 丁未',()=>{assert.equal(P.annualPillar(2027),'丁未')});
run('production result carries provenance',()=>{const r=P.calculate(sample);assert.equal(P.canAnalyze(r),true);assert.equal(r.targetYear.pillar,'丁未');assert.ok(r.provenance.year&&r.provenance.day)});
run('report packet is facts-only and ready',()=>{const r=F.build(sample);assert.equal(r.status,'ready');assert.equal(r.targetYear.pillar,'丁未');assert.equal(r.constraints.factsOnly,true);assert.equal(r.constraints.nameAnalysisEnabled,false)});