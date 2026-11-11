'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const life=require('./report-reader-age-boundary');
const facts=require('./report-facts-node'),guidance=require('./report-analysis-guidance');
const writer=require('./report-generation-request'),wire=require('./report-wire');
const schema=require('./report-schema.json');
const packet=date=>facts.build({calendar:'solar',birthDate:date,
 birthTime:'14:20',gender:'male',mbti:'ISFP'},2027);
function prompt(p,stage='body'){
 const ids=['saju_core'];
 return {stage,facts:p,requestedSections:stage==='body'?ids:[],
  includeFinal:stage==='synthesis',includeCover:stage==='synthesis',
  ...(stage==='body'?{analysisGuidance:{...guidance.forRequest(ids,p.person.mbti),
   editorialBlueprint:{saju_core:guidance.preflight(p).saju_core}}}:
   {completedReport:{meta:{},sections:[{id:'saju_core'},{id:'decision'},{id:'year_2027'}]}})};
}
const child=prompt(packet('2018-07-15'));
const young=prompt(packet('2008-12-29'));
const adult=prompt(packet('1994-07-15'));
assert.equal(life.forPrompt(child).yearDifference,9);
assert.equal(life.forPrompt(young).yearDifference,19);
assert.equal(life.forPrompt(adult),null);
assert.equal(life.forPrompt(prompt(facts.build({calendar:'lunar',
 birthDate:'1982-11-24',birthTime:'14:20',gender:'male',mbti:'ISFP'},2027))),null);
assert.equal(life.forPrompt({stage:'body',facts:{}}),null);
const schemaFor=p=>writer.schema(p,wire.schemaFor(p,schema));
const paragraph=p=>{
 const slot=schemaFor(p).properties.chapters.properties.saju_core
  .properties.paragraphs.properties.strength;
 return slot.anyOf?.find(x=>x.type==='object')||slot;
};
assert(paragraph(child).properties.text.description.includes('연봉·투자 경험'));
assert(!paragraph(adult).properties.text.description.includes('출생연도 기준 대상 연도'));
const summary=prompt(packet('2018-07-15'),'synthesis');
assert(schemaFor(summary).properties.finalJudgment.properties.body.description.includes('출생연도 기준 대상 연도'));
assert(!schemaFor(prompt(packet('1994-07-15'),'synthesis'))
 .properties.finalJudgment.properties.body.description.includes('출생연도 기준 대상 연도'));
for(const text of ['당신은 현재 회사에서 일하고 있습니다.',
 '당신은 이미 결혼했고 배우자와 살고 있습니다.',
 '본인은 지금 연봉을 협상하고 있습니다.'])
 assert.deepEqual(life.inspect(text,child),['PAID_READER_INVENTED_ADULT_HISTORY']);
for(const text of ['만약 나중에 회사에서 일한다면 규칙을 살펴볼 수 있습니다.',
 '당신은 현재 회사에서 일한다고 단정할 수 없습니다.',
 '결혼 경험이 있는지는 출생정보로 알 수 없습니다.',
 '달의 전통적 뜻을 가상의 상황으로 설명합니다.'])
 assert.deepEqual(life.inspect(text,child),[]);
assert.deepEqual(life.inspect('당신은 현재 회사에서 일하고 있습니다.',adult),[]);
assert(fs.readFileSync('report-generation-request.js','utf8')
 .includes("require('./report-reader-age-boundary').inspect(p?.text,prompt)"),
 'live paid decoder must fail before another model batch');
console.log('PASS real paid young-reader writer, summary and early response rejection: no adult history assumptions, no extra AI calls');
