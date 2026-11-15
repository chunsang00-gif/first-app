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
const decode=require('./report-response-decoder').decode;
const baseFinal={chapters:{},cover:{headline:'일상에 관한 전통 풀이',description:'자원을 바라보는 질문',
 highlights:[]},finalJudgment:{headline:'종합 정리',
 body:['출생 정보만으로 실제 선택이나 재산은 확인할 수 없습니다.'],
 closingQuestion:'전통적 두 의미를 구별해 읽습니다.',strengths:[],watchouts:[],routines:[]}};
assert.equal(decode(baseFinal,summary).sections.length,0);
assert.equal(decode(baseFinal,prompt(packet('1994-07-15'),'synthesis')).sections.length,0);
for(const [where,text] of [
 ['cover','당신은 현재 회사에서 일하고 있습니다.'],
 ['final','당신은 이미 결혼했고 배우자와 살고 있습니다.'],
 ['closing','본인은 지금 연봉을 협상하고 있습니다.']
]){
 const value=structuredClone(baseFinal);
 if(where==='cover')value.cover.description=text;
 else if(where==='final')value.finalJudgment.body[0]=text;
 else value.finalJudgment.closingQuestion=text;
 assert.throws(()=>decode(value,summary),
  /underage adult-history assumption: synthesis/,
  'final synthesis should never reintroduce adult life after clean paid body: '+where);
 assert.doesNotThrow(()=>decode(value,prompt(packet('1994-07-15'),'synthesis')),
  'existing adult manuscripts are unaffected');
}
console.log('PASS real paid young-reader writer, body+final decoder safeguards and offline regression; no paid API calls');
