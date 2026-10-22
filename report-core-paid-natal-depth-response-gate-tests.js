'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const preview=require('./report-core-paid-natal-depth-preview');
const validator=require('./report-core-paid-natal-depth-response-gate');
const decode=require('./report-response-decoder').decode;
const packet=facts.build({calendar:'solar',birthDate:'1982-06-15',
 birthTime:'14:20',gender:'male',mbti:'ISFP'},2027);
const p=preview.prepare(packet);
assert(p);
const fixed=require('./report-core-thesis').forPrompt(p.prompt);
const month='natal.month.hidden.'+packet.facts.structuralEvidence.monthCommand.mainHiddenStem;
const anchor='태어난 달에 놓인 서로 다른 뜻은 한 가지 선택을 설명할 때 함께 살펴볼 수 있습니다. 예를 들어 새 과정을 시작하는 상황이라면 알려진 설명을 이해하는 일과 실제로 고를 자원을 별개로 생각할 수 있습니다.';
const quality='태어난 해에서는 반복되는 비용과 맡은 일을 꾸준히 관리하는 뜻이 확인됩니다. 반면 태어난 시간에는 생각을 차근차근 결과물로 만들어 남기는 뜻이 계산됩니다. 새로운 일을 함께 준비해야 하는 상황이라면 비용을 꾸준히 관리하는 선택과 어떤 결과물로 남길지 정하는 선택을 구별해 볼 수 있습니다. 이는 실제로 일을 잘한다는 평가가 아니라 출생 위치마다 비교할 질문이 다르다는 뜻입니다.';
assert.equal(p.payload.source['natal.year.stem'].tenGod,'정재');
assert.equal(p.payload.source['natal.hour.stem'].tenGod,'식신');
function response(){
 return {chapters:{saju_core:{
  title:fixed.title,keyJudgment:fixed.keyJudgment,mood:'reflective',
  paragraphs:{
   temperament:null,
   strength:{label:'두 뜻을 함께 살피는 선택',text:anchor,
    basis:{refs:['natal.month.stem',month],
     interpretation:'월간과 본기의 서로 다른 전통 분류를 비교',
     condition:'가상의 선택 상황에서만 풀이',limit:'실제 성격을 알 수 없음'}},
   natal_depth:{label:'해와 시간을 다르게 살피는 기준',text:quality,
    basis:{refs:['natal.year.stem','natal.day.stem','natal.hour.stem','facts.stemConnections'],
     interpretation:require('./report-core-paid-natal-depth-fact-lock').fromPayload(p.payload).literal,
     condition:'새로운 설명을 준비하는 가상 조건',limit:'실제 행동이나 성공을 판단하지 않음'}}
  }
 }},finalJudgment:null,cover:null};
}
assert.deepEqual(validator.inspect(response(),p.prompt),[]);
const decoded=decode(response(),p.prompt);
assert.deepEqual(decoded.sections[0].bodyTopics,['strength','natal_depth']);
assert.deepEqual(decoded.sections[0].body,[anchor,quality]);
assert(decoded.sections[0].evidence.some(x=>x.startsWith('natal_depth:')&&
 x.includes('natal.year.stem')&&x.includes('natal.hour.stem')));
assert.equal(validator.assert(response(),p.prompt).releaseVerdict,'not-approved');
// Position names are not interchangeable: 연간 is year, 일간 is day;
// elapsed time is not the birth-hour pillar.
assert.deepEqual(validator.referencedPositions('연간과 일간을 비교합니다.'),
 ['year','day']);
assert.deepEqual(validator.referencedPositions('검토 시간은 두 시간입니다.'),[]);
assert.deepEqual(validator.referencedPositions('시간에는 결과물을 남기는 뜻이 있습니다.'),
 ['hour']);
assert.deepEqual(validator.referencedPositions('태어난 해와 태어난 시간은 다릅니다.'),
 ['year','hour']);
let cases=0;
function refuse(label,mutate,match){
 const value=response();mutate(value);
 const errors=validator.inspect(value,p.prompt);
 assert(errors.some(x=>x.includes(match)),label+': '+JSON.stringify(errors));
 assert.throws(()=>decode(value,p.prompt),/QA_NATAL_DEPTH_RESPONSE_REJECTED|QA_NATAL_DEPTH_FACT_LOCK_DIVERGED|verified paragraph basis|missing required grounded stem connection evidence/,
  label+' must fail before becoming a report section');
 cases++;
}
refuse('uncited year stem',v=>v.chapters.saju_core.paragraphs.natal_depth.basis.refs=
 ['natal.day.stem','natal.hour.stem','facts.stemConnections'],
 'QA_DEPTH_MISSING_REQUIRED_POSITION:natal.year.stem');
refuse('uncited day stem',v=>v.chapters.saju_core.paragraphs.natal_depth.basis.refs=
 ['natal.year.stem','natal.hour.stem','facts.stemConnections'],
 'QA_DEPTH_MISSING_REQUIRED_POSITION:natal.day.stem');
refuse('uncited hour stem',v=>v.chapters.saju_core.paragraphs.natal_depth.basis.refs=
 ['natal.year.stem','natal.day.stem','facts.stemConnections'],
 'QA_DEPTH_MISSING_REQUIRED_POSITION:natal.hour.stem');
refuse('uncited actual root position',v=>v.chapters.saju_core.paragraphs.natal_depth.basis.refs=
 ['natal.year.stem','natal.day.stem','natal.hour.stem'],
 'QA_DEPTH_MISSING_REQUIRED_POSITION:facts.stemConnections');
refuse('misplaced source',v=>v.chapters.saju_core.paragraphs.natal_depth.basis.refs.push('person.mbti'),
 'QA_DEPTH_INVALID_EVIDENCE_REFS');
refuse('duplicate citations',v=>v.chapters.saju_core.paragraphs.natal_depth.basis.refs.push('natal.year.stem'),
 'QA_DEPTH_INVALID_EVIDENCE_REFS');
refuse('missing interpretation',v=>v.chapters.saju_core.paragraphs.natal_depth.basis.interpretation='',
 'QA_DEPTH_MISSING_REASON_OR_LIMIT');
refuse('invented position facts despite correct citation IDs',v=>
 v.chapters.saju_core.paragraphs.natal_depth.basis.interpretation=
  v.chapters.saju_core.paragraphs.natal_depth.basis.interpretation.replace(
   p.payload.source['natal.year.stem'].tenGod,'비교적 다른 분류'),
 'QA_DEPTH_FACT_LOCK_DIVERGED');
refuse('jargon in reader',v=>v.chapters.saju_core.paragraphs.natal_depth.text+=' 이 원국은 월지의 지장간을 확인한 것입니다.',
 'QA_DEPTH_READER_JARGON');
refuse('Chinese symbol',v=>v.chapters.saju_core.paragraphs.natal_depth.text+=' 甲이라는 글자가 있습니다.',
 'QA_DEPTH_READER_CHINESE_SYMBOL');
refuse('wrong year meaning despite correct citations',v=>
 v.chapters.saju_core.paragraphs.natal_depth.text=
  quality.replace('반복되는 비용과 맡은 일을 꾸준히 관리하는','배운 내용과 주변 조언을 참고하는'),
 'QA_DEPTH_POSITION_MEANING_UNGROUNDED:year');
refuse('wrong hour meaning despite correct citations',v=>
 v.chapters.saju_core.paragraphs.natal_depth.text=
  quality.replace('생각을 차근차근 결과물로 만들어 남기는','익숙한 방식에 새로운 제안을 하는'),
 'QA_DEPTH_POSITION_MEANING_UNGROUNDED:hour');
refuse('wrong year attribution disguised by a correct phrase',v=>
 v.chapters.saju_core.paragraphs.natal_depth.text=
  quality.replace('태어난 해에서는 반복되는 비용과',
   '태어난 해에서는 배운 내용과 주변 조언을 먼저 따르고 반복되는 비용과'),
 'QA_DEPTH_POSITION_CONFLICTING_MEANING:year');
refuse('wrong hour attribution disguised by a correct phrase',v=>
 v.chapters.saju_core.paragraphs.natal_depth.text=
  quality.replace('태어난 시간에는 생각을',
   '태어난 시간에는 새로운 제안을 해야 한다고 주장하며 생각을'),
 'QA_DEPTH_POSITION_CONFLICTING_MEANING:hour');
refuse('empty meaning behind a nonempty condition',v=>
 v.chapters.saju_core.paragraphs.natal_depth.basis.condition=
  '종합적으로 참고한다',
 'QA_DEPTH_BASIS_HAS_NO_CONDITION');
refuse('limit disguised as nonempty filler',v=>
 v.chapters.saju_core.paragraphs.natal_depth.basis.limit=
  '좋게 생각하면 좋습니다',
 'QA_DEPTH_BASIS_HAS_NO_LIMIT');
refuse('prediction hidden behind a later disclaimer in the SAME sentence',v=>
 v.chapters.saju_core.paragraphs.natal_depth.text=
  quality+' 이 사주의 사람은 반드시 승진합니다, 하지만 실제 승진을 예측할 수 없다는 뜻입니다.',
 'QA_DEPTH_UNSUPPORTED_PERSONAL_OUTCOME');
refuse('invented certainty qualified by another claim in same sentence',v=>
 v.chapters.saju_core.paragraphs.natal_depth.text=
  quality+' 이 사람은 무조건 합격합니다만, 실제로 보장되는 결과는 아닙니다.',
 'QA_DEPTH_UNSUPPORTED_PERSONAL_OUTCOME');
refuse('actual lifetime claim',v=>v.chapters.saju_core.paragraphs.natal_depth.text+=' 타고난 성격을 반드시 성공으로 이끌 것입니다.',
 'QA_DEPTH_UNSUPPORTED_PERSONAL_OUTCOME');
refuse('no contextual scenario',v=>v.chapters.saju_core.paragraphs.natal_depth.text=
 '태어난 해에서는 자료를 참고하는 뜻이 계산됩니다. 태어난 시간에는 표현 방식의 뜻이 계산됩니다. 두 출생 위치의 의미를 분리해 다르게 설명할 수 있습니다. 그러나 각각의 상징은 실제 관찰된 행동을 보여 주지 않습니다. 해와 시간의 뜻이 같지 않다는 것은 계산된 분류의 차이입니다.',
 'QA_DEPTH_NO_CONDITIONAL_INTERPRETATION');
refuse('no pillar contrast',v=>v.chapters.saju_core.paragraphs.natal_depth.text=
 '태어난 해에는 안내가 있습니다. 태어난 시간에도 자료가 있습니다. 예를 들어 두 자료가 있는 상황이라면 정리해 볼 수 있습니다. 출생한 날의 의미가 확인됐습니다. 이 결과는 실제 성격을 증명하지 않는다는 제한을 덧붙입니다.',
 'QA_DEPTH_NO_PILLAR_CONTRAST');
refuse('no independent source positions',v=>v.chapters.saju_core.paragraphs.natal_depth.text=
 '태어난 해에 해당하는 정보가 확인됩니다. 예를 들어 해에서 배운 내용을 살피는 경우라도 구별하는 질문을 만들 수 있습니다. 해에서 얻은 조언과 자료를 각기 비교해 볼 수 있습니다. 다만 자료 자체로 실제 행동을 단정할 수는 없습니다.',
 'QA_DEPTH_NO_DISTINCT_NATAL_POSITIONS');
refuse('copy existing paid month paragraph',v=>v.chapters.saju_core.paragraphs.natal_depth.text=
 anchor+' '+anchor,
 'QA_DEPTH_REPEATS_MONTH_CORE');
refuse('inappropriate ending question',v=>v.chapters.saju_core.paragraphs.natal_depth.text=
 quality+' 궁금하지 않으세요?',
 'QA_DEPTH_ENDING_QUESTION');
// Existing first-paragraph content was not previously compared against the
// optional paid expansion. A long recycled paragraph is still not new value.
refuse('copy the first core paragraph instead of adding paid depth',v=>{
 v.chapters.saju_core.paragraphs.temperament={
  label:'첫 번째 기본 풀이',text:quality,
  basis:{refs:p.payload.task.chapters.saju_core.topics.temperament.citableFacts.map(x=>x.id),interpretation:'기본 풀이',
   condition:'가상 상황',limit:'실제 성격은 알 수 없음'}
 };
},'QA_DEPTH_REPEATS_TEMPERAMENT_CORE');
refuse('pad the deep paragraph with exactly repeated sentences',v=>{
 v.chapters.saju_core.paragraphs.natal_depth.text=quality+' '+quality;
},'QA_DEPTH_SELF_REPEATED_SENTENCE');
const repeatedChoice='새로운 일을 함께 준비해야 하는 상황이라면 비용을 꾸준히 관리하는 선택과 어떤 결과물로 남길지 정하는 선택을 구별해 볼 수 있습니다.';
refuse('pad length by lightly rewording the same choice',v=>{
 v.chapters.saju_core.paragraphs.natal_depth.text=quality+' '+
  repeatedChoice.replace('어떤 결과물','무슨 결과물');
},'QA_DEPTH_SELF_REPEATED_SENTENCE');
// A DISTINCT additional core explanation is not rejected merely for existing.
const distinctCore=response();
distinctCore.chapters.saju_core.paragraphs.temperament={
 label:'기본 풀이의 독립적인 상황',
 text:'태어난 계절을 구분하는 자료는 보통 언제 달의 기준이 바뀌는지를 설명합니다. 이를 개인의 실제 능력이나 성취에 대한 기록으로 바꾸지 않습니다.',
 basis:{refs:p.payload.task.chapters.saju_core.topics.temperament.citableFacts.map(x=>x.id),interpretation:'계산 근거',
  condition:'가상의 일상 장면',limit:'실제 능력은 알 수 없음'}
};
assert(!validator.inspect(distinctCore,p.prompt).some(x=>
 x.startsWith('QA_DEPTH_REPEATS_')||x==='QA_DEPTH_SELF_REPEATED_SENTENCE'),
 'different core prose must remain eligible for later human review');

// Optional slot may legitimately be null when no separate depth exists.
const suppressed=response();
suppressed.chapters.saju_core.paragraphs.natal_depth=null;
assert.deepEqual(validator.inspect(suppressed,p.prompt),[]);
assert.deepEqual(decode(suppressed,p.prompt).sections[0].bodyTopics,['strength']);
const incorrectScope=structuredClone(p.prompt);
incorrectScope.facts.chart.hour=null;
assert(validator.inspect(response(),incorrectScope).includes(
 'QA_DEPTH_INVALID_OR_UNKNOWN_NATAL_SCOPE'));
const normalPrompt=structuredClone(p.prompt);
delete normalPrompt.qaNatalDepthPreview;
assert.deepEqual(validator.inspect(response(),normalPrompt),[],
 'QA gate cannot alter the default paid first chapter');
console.log('QA_NATAL_DEPTH_RESPONSE_GATE='+JSON.stringify({
 validReviewedCandidate:1,rejectedMutations:cases,optionalNull:1,
 savedVisibleTopics:['strength','natal_depth'],
 paidApiCalls:0,releaseVerdict:'not-approved',
 productionEnabled:false}));
console.log('PASS QA-only natal depth decoder rejects fabricated basis, reader jargon, outcome claims and duplicated month prose');
