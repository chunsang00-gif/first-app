/* Browser regression tests. Load calendar-engine.js then engine.js then this file. */
(()=>{
const results=[];function test(name,fn){try{fn();results.push({name,pass:true})}catch(e){results.push({name,pass:false,error:e.message})}}
function eq(a,b){if(JSON.stringify(a)!==JSON.stringify(b))throw Error(`${JSON.stringify(a)} !== ${JSON.stringify(b)}`)}
test('1983-01-07 day/hour fixture',()=>{const r=SAJU_CALENDAR.validateFixture();eq(r.pass,true)});
test('hour boundaries',()=>{eq(SAJU_CALENDAR.hourBranch('00:59'),'子');eq(SAJU_CALENDAR.hourBranch('01:00'),'丑');eq(SAJU_CALENDAR.hourBranch('14:59'),'未');eq(SAJU_CALENDAR.hourBranch('15:00'),'申');eq(SAJU_CALENDAR.hourBranch('23:00'),'子')});
test('乙 ten gods',()=>{eq(SAJU_ENGINE.tenGod('乙','壬'),'正印');eq(SAJU_ENGINE.tenGod('乙','癸'),'偏印');eq(SAJU_ENGINE.tenGod('乙','丁'),'食神');eq(SAJU_ENGINE.tenGod('乙','己'),'偏財')});
test('fixture roots and clashes',()=>{const x=SAJU_ENGINE.enrich({year:'壬戌',month:'癸丑',day:'乙未',hour:'癸未'});eq(x.roots.length,2);eq(x.relations.filter(r=>r.type==='충').length,2)});
window.SAJU_TEST_RESULTS=results;console.table(results);
})();