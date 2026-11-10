'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync(require('node:path').join(__dirname,'index.html'),'utf8');
const ui=fs.readFileSync(require('node:path').join(__dirname,'live-report-ui.js'),'utf8');
const validate=require('./input-validation').validateInput;
const facts=require('./report-facts-node');
const birthDays=require('./birth-day-options');
const lunarCalendar=require('lunar-javascript');
for(const key of ["calendar:choice('calendar')","leapMonth:$('#leapMonth').checked","birthDate","unknownBirthTime"]){
 assert(html.includes(key),'visible input flow must preserve '+key);
}
assert(html.includes("fetch('/api/calculate'"),'step one must be checked with free server calculation');
assert(html.includes("checked.status!=='ready'"),'invalid or ambiguous calendar results must block navigation');
assert(html.includes("if(!response.ok||checked.status!=='ready')"),'HTTP failures must not enter report flow');
assert(html.includes("['calendar','birthDate','birthTime','leapMonth','unknownBirthTime','readerDecision']"),
 'changes to calendar or customer decision during calculation must force revalidation');
assert(html.includes('step=2;show();return;'),'navigate only after the free calculation succeeded');
assert(ui.includes("calendar:calendar==='lunar'||calendar==='음력'?'lunar':'solar'"));
assert(ui.includes('catalog.chapterDefinitions')&&ui.includes('catalog.topicDefinitions'),'visible scope count must use verified server catalog, not stale promises');
assert(!ui.includes('12개 장을 작성한 뒤'),'free scope loading must not pretend a paid report is being generated');
assert(ui.includes('showScopeError(e)')&&ui.includes('returnFromCoverageError'),'scope query failures must offer recovery');
assert(ui.includes("leapMonth:Boolean($('#leapMonth')?.checked)"),
 'premium request input must preserve the checked leap-month field');
// A real lunar 2/30 must be selectable even when civil February has only
// 28 or 29 days. The exact 29/30-day length is checked on the free server.
assert.equal(birthDays.maxDays('lunar',1982,2),30);
assert.equal(birthDays.maxDays('lunar',2024,2),30);
assert.equal(birthDays.maxDays('solar',2024,2),29);
assert.equal(birthDays.maxDays('solar',2025,2),28);
assert.equal(birthDays.maxDays('solar',2026,4),30);
assert.equal(birthDays.maxDays('solar',2026,1),31);
assert.equal(birthDays.maxDays('solar',0,2),31);
assert(html.includes('<script src="birth-day-options.js"></script>'));
assert(html.includes("BIRTH_DAY_OPTIONS.maxDays(choice('calendar'),yy,mm)"));
assert(html.includes('refreshBirthDays()}});'),
 'switching solar/lunar must rebuild day options without a reload');
const fullSecondMonth=Array.from({length:35},(_,i)=>1980+i)
 .find(year=>lunarCalendar.LunarMonth.fromYm(year,2).getDayCount()===30);
assert(fullSecondMonth,'oracle: at least one observed lunar February with 30 days');
const fullLunarFeb30=String(fullSecondMonth)+'-02-30';
assert.equal(require('./input-validation').validateInput({
 calendar:'lunar',birthDate:fullLunarFeb30,leapMonth:false,
 gender:'male',birthTime:'14:20',mbti:'ISFP'
}).length,0,'actual lunar February 30 must remain allowed by backend');

const base={calendar:'lunar',leapMonth:false,birthDate:'1982-11-24',
 birthTime:'14:20',birthplace:'서울',gender:'male',mbti:'ISFP',name:'검증용'};
assert.deepEqual(validate(base),[]);
const ready=facts.build(base,2027);
assert.equal(ready.status,'ready');
assert.equal(ready.calculationInput.calendar,'lunar');
assert.equal(ready.calculationInput.leapMonth,false);
assert.equal(ready.calculationInput.birthDate,'1982-11-24');
assert.equal(ready.calculationInput.birthTime,'14:20');
assert.equal(ready.facts.solarTermTiming.monthBranchFromJie,ready.chart.month[1]);
for(const bad of [
 {...base,calendar:'solar',leapMonth:true},
 {...base,calendar:'lunar',birthDate:'1982-13-24'},
 {...base,calendar:'lunar',birthDate:'1982-11-31'},
 {...base,unknownBirthTime:'false'}
])assert(validate(bad).length>0,'invalid date/calendar must be rejected by calculate endpoint');
console.log('PASS UI->free birth calendar validation->report input provenance, correct lunar date and invalid leap/date refusal; 0 paid calls');
