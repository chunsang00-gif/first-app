const assert=require('assert');const C=require('./calendar-provider-node'),P=require('./production-pipeline-node'),F=require('./report-facts-node'),N=require('./name-analysis');
function run(name,fn){try{fn();console.log('PASS',name)}catch(e){console.error('FAIL',name,e.message);process.exitCode=1}}
const sample={calendar:'solar',birthDate:'1983-01-07',birthTime:'14:20',birthplace:'대구',gender:'male',mbti:'ISFP',name:'박준민'};
run('solar sample calculates four pillars',()=>{const r=C.calculate(sample);assert.equal(r.status,'complete');assert.equal(r.solarDate,'1983-01-07');assert.ok(r.chart.year&&r.chart.month&&r.chart.day&&r.chart.hour)});
run('lunar conversion round trip',()=>{const r=C.calculate({...sample,calendar:'lunar',birthDate:'1982-11-24',leapMonth:false});assert.equal(r.solarDate,'1983-01-07')});
run('unknown time suppresses hour pillar',()=>{const r=C.calculate({...sample,birthTime:'',unknownBirthTime:true});assert.equal(r.chart.hour,null)});
run('Daewoon convention returns onset fields',()=>{const r=C.fortune(sample);assert.equal(r.status,'complete');assert.equal(typeof r.forward,'boolean');assert.ok(Number.isInteger(r.start.year))});
run('2027 annual pillar is 丁未',()=>{assert.equal(P.annualPillar(2027),'丁未')});
run('production result carries provenance',()=>{const r=P.calculate(sample);assert.equal(P.canAnalyze(r),true);assert.equal(r.targetYear.pillar,'丁未');assert.ok(r.provenance.year&&r.provenance.day)});
run('report packet is facts-only and ready',()=>{const r=F.build(sample);assert.equal(r.status,'ready');assert.equal(r.targetYear.pillar,'丁未');assert.equal(r.constraints.factsOnly,true);assert.equal(r.constraints.nameAnalysisEnabled,false)});
run('report handoff preserves canonical input',()=>{const r=F.build(sample);assert.equal(r.calculationInput.birthDate,'1983-01-07');assert.equal(r.calculationInput.birthTime,'14:20')});
run('verified current/former name comparison is ready',()=>{const r=N.compare({currentName:'박준민',currentHanja:'朴峻慜',oldName:'박창우',oldHanja:'朴昶祐',renameDate:'2010-01-08'});assert.equal(r.status,'ready');assert.equal(r.current.characters[1].reading,'준');assert.equal(r.former.characters[1].reading,'창')});
run('unknown hanja is blocked from interpretation',()=>{const r=N.analyze('테스트','朴未知');assert.equal(r.status,'needs_verified_dictionary');assert.ok(r.unknown.length)});
run('name facts attach only when verified',()=>{const r=F.build({...sample,hanja:'朴峻慜',oldName:'박창우',oldHanja:'朴昶祐',renameDate:'2010-01-08'});assert.equal(r.nameAnalysis.status,'ready');assert.equal(r.constraints.nameAnalysisEnabled,true)});