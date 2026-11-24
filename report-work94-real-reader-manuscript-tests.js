'use strict';
// Work94: actual archival, human-authored BUYER first chapter. No new AI,
// merchant or network calls. This is NOT specialist approval or sale content.
// The writer must be able to produce clear multi-sentence option paragraphs,
// not merely sentences engineered to satisfy individual regexes.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const facts=require('./report-facts-node'),bindings=require('./report-fact-bindings');
const hour=require('./report-paid-core-hour-extension');
const pair=require('./report-paid-core-hour-pair-meaning');
const choice=require('./report-paid-core-hour-choice-meaning');
const value=require('./report-paid-core-two-choice-value');
const direction=require('./report-paid-core-hour-pair-reader-gate');
const application=require('./report-paid-core-hour-reader-application');
const server=require('./report-server-contract');
const input={calendar:'solar',birthDate:'1982-07-15',birthTime:'02:20',
 gender:'male',mbti:'ISFP',
 readerDecision:'적금을 유지할지 대출을 상환할지 고민입니다.'};
const packet=facts.build(input,2027);
assert.equal(packet.status,'ready');
const source=Object.fromEntries(bindings.build(packet).map(r=>[r.id,r]));
const verified=hour.build(packet,source);
assert(verified&&verified.wholeNatalCategoryDistinct===true);
const relation=pair.build(packet,source,verified);
assert.equal(relation.elementDirection,'resource');
assert.deepEqual(relation.sourceRefs,verified.sourceRefs);
const md=fs.readFileSync(path.join(__dirname,'qa',
 'work85-authored-first-paid-hour-money-reader-1982-0715-0220-20261124.md'),'utf8');
const original=md.split('### 적금을 그대로 둘까, 대출을 갚을까 — 태어난 시간에서 따로 나오는 질문')[1]
 ?.split('## 내부 출처 확인')[0];
assert(original&&original.length>850,
 'the human-authored example must remain complete; never silently replace it with a passing stub');
const human=original.replace(/\*\*/g,'').replace(/\*/g,'').trim();
assert(/적금을 유지하는 경우/.test(human)&&/대출을 상환하는 경우/.test(human));
assert(/안쪽의 다른 글자/.test(human)&&/책임을 살피는 질문을 뒷받침/.test(human));
assert.deepEqual(choice.inspectParagraph(human,input.readerDecision,verified),[],
 'a coherent genuine 4-paragraph buyer answer must not fail merely because option conditions span two sentences');
assert.deepEqual(value.inspect(human,input.readerDecision),[],
 'a long independently written consequence in the NEXT sentence still belongs to that buyer option');
assert.deepEqual(direction.inspectParagraph(human,relation),[],
 'source ordered ordinary Korean meaning and direction is valid even without rigid 겉글자-안쪽글자 adjacent tokens');
const p={text:human,basis:{refs:verified.sourceRefs}};
assert.deepEqual(application.inspect(p,'이미 무료 공개한 출생월 설명입니다.',verified),[]);
const early=server.earlyPaidCoreHourMeaningProblems(
 [{id:'saju_core',bodyTopics:['temperament'],body:[human]}],packet);
assert.deepEqual(early,[],
 'the same actual early paid batch gate must accept offline editorial prose before another provider call');
// Invalid one-sided report and copied generic response must still fail.
const oneSided=human.split('대출을 상환하는 경우')[0];
assert(choice.inspectParagraph(oneSided,input.readerDecision,verified).some(x=>
 /buyer-second-option/.test(x)));
assert(value.inspect(oneSided,input.readerDecision).includes(
 'buyer-two-options-not-applied-separately'));
const reversed=human+' 출생시간에서는 겉글자가 안쪽 글자를 뒷받침하는 방향입니다.';
assert(direction.inspectParagraph(reversed,relation).includes(
 'hour-pair-element-direction-conflicts-with-calculation'));
console.log('PASS work94 archived human buyer prose accepted across hour role, choice, exact direction and EARLY paid gates; missing option and reverse relation still blocked; zero calls or sale approval');
