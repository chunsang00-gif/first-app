'use strict';
// REGRESSION: previous paid batches are retained as topicConclusions, not
// as body. The next provider batch uses body. All checks must see both
// BEFORE any additional model call, including resuming cached batches.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const contract=require('./report-server-contract');
const section=(id,topic,text,prior=false)=>({
 id,title:'독립 가상 장 '+id,
 keyJudgment:'이 장의 핵심 판단은 서로 다른 계산 조건을 검토합니다.',
 bodyTopics:[topic],
 ...(prior?{topicConclusions:[text]}:{body:[text]}),
 evidence:[],bodyLabels:['검토할 질문']
});
const sameSentence='어떤 일을 맡을지 선택하는 경우에는 검토해야 할 자료를 한 장에 정리한 뒤 그 자료를 확인할 사람과 최종 결정할 시점을 구분해서 기록합니다';
const previous=section('decision','process',
 '처음 확인한 조건은 다음과 같습니다. '+sameSentence+'. 이미 적어 둔 다른 결과는 여기에 포함하지 않습니다.',true);
const next=section('career','workstyle',
 '새로운 분야에서 점검하는 다른 기준이 있습니다. '+sameSentence+'. 이어서 별개의 설명도 덧붙입니다.');
const result=contract.earlySubstantiveDuplicateErrors([previous,next]);
assert(result.some(x=>x.includes('reused substantive sentence across chapters')),
 'stored prior topicConclusions and newly generated body share an exact substantive sentence');
const whollyDifferent=section('career','workstyle',
 '새로운 기술을 연습할 경우에는 하루에 끝낼 수 있는 실습을 하나 고릅니다. 완료된 연습 기록과 안전 점검 내역을 따로 확인합니다.');
assert.deepEqual(contract.earlySubstantiveDuplicateErrors([previous,whollyDifferent]),[],
 'different applications to different customer questions may reuse ordinary vocabulary');
const nearOriginal='지출 항목을 나누고 기간마다 같은 금액을 기록하여 실제 변경 가능한 계획이 있는지 확인합니다. 재료 준비와 예상 작업시간을 비교해 우선순위를 정합니다.';
const nearParaphrase='지출 항목을 나누고 기간마다 같은 금액을 기록하여 실제 변경 가능한 계획이 있는지 확인해야 합니다. 재료 준비와 예상 작업시간을 비교해 우선순위를 정합니다.';
const nearPair=[
 section('money','risk',nearOriginal,true),
 section('career','workstyle',nearParaphrase)
];
assert.deepEqual(contract.earlySubstantiveDuplicateErrors(nearPair),[],
 'broad lexical similarity must not trigger a premature billable-stage rejection');
const close=contract.preSynthesisDuplicateErrors(nearPair);
assert(close.some(x=>x.includes('high lexical topic overlap')),
 'prior stored prose and close paraphrase must be rejected before paid synthesis');
const code=fs.readFileSync(path.join(__dirname,'report-server-contract.js'),'utf8');
const resume=code.indexOf('QA resume repeated substantive paid content');
const fresh=code.indexOf('const substantiveDuplicates=earlySubstantiveDuplicateErrors([...priorSections,...result.sections])');
const spending=code.indexOf('await onValidatedBatch({ids:ids.slice()');
assert(resume>0&&fresh>resume&&spending>fresh,
 'the strict check must be used for both resumed and fresh batches BEFORE announcing/purchasing subsequent batches');
assert.equal(typeof contract.generate,'function');
console.log('PASS paid report novelty timing: early exact repeated substantive sentences fail including resume, near-paraphrases checked pre-synthesis, provider calls=0');
