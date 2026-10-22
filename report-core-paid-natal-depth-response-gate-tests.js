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
const quality='태어난 해에서는 이미 알고 있는 자료를 참고하는 뜻이 확인되지만, 태어난 시간에는 다른 방식으로 내용을 표현하는 뜻이 계산됩니다. 새로운 일을 함께 설명해야 하는 상황이라면 해에서 가져온 자료만 정리하는 경우와 시간의 표현 방식을 따로 살피는 경우를 구별해 볼 수 있습니다. 이는 어떤 능력이 뛰어나다는 평가가 아니라 두 출생 위치에서 서로 다른 질문을 만들 수 있다는 조건부 풀이입니다.';
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
     interpretation:'연간과 시간의 서로 다른 전통 분류를 비교',
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
let cases=0;
function refuse(label,mutate,match){
 const value=response();mutate(value);
 const errors=validator.inspect(value,p.prompt);
 assert(errors.some(x=>x.includes(match)),label+': '+JSON.stringify(errors));
 assert.throws(()=>decode(value,p.prompt),/QA_NATAL_DEPTH_RESPONSE_REJECTED|verified paragraph basis|missing required grounded stem connection evidence/,
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
refuse('jargon in reader',v=>v.chapters.saju_core.paragraphs.natal_depth.text+=' 이 원국은 월지의 지장간을 확인한 것입니다.',
 'QA_DEPTH_READER_JARGON');
refuse('Chinese symbol',v=>v.chapters.saju_core.paragraphs.natal_depth.text+=' 甲이라는 글자가 있습니다.',
 'QA_DEPTH_READER_CHINESE_SYMBOL');
refuse('actual lifetime claim',v=>v.chapters.saju_core.paragraphs.natal_depth.text+=' 타고난 성격을 반드시 성공으로 이끌 것입니다.',
 'QA_DEPTH_UNSUPPORTED_PERSONAL_OUTCOME');
refuse('no contextual scenario',v=>v.chapters.saju_core.paragraphs.natal_depth.text=
 quality.replace('새로운 일을 함께 설명해야 하는 상황이라면','새로운 내용을 정리하면서'),
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
