'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const subject=require('./report-first-chapter-expert-local-review');
const doc=subject.build();
assert.equal(doc.kind,'offline-two-hour-expert-manuscript-review-v1');
assert.equal(doc.saleApproved,false);
assert.equal(doc.hasExpertDecision,false);
assert.equal(doc.providerCalls,0);
assert.deepEqual(doc.comparedHourPillars,['癸未','丙戌']);
assert.deepEqual(doc.items.map(x=>x.volumeSixMatchedPositions),
 [['month','hour'],['month']]);
assert(doc.items[0].paragraphs[2].text.includes('안온한 쪽으로'));
assert(doc.items[1].paragraphs[2].text.includes('해에 있는 글자는 그 목록에 있지만'));
assert(doc.items.every(x=>x.sourceUrls.length===2));
const html=subject.render(doc);
assert(html.startsWith('<!doctype html>'));
assert(html.includes('connect-src &#39;none&#39;'));
assert(html.includes('data-hash="'+doc.chartBinding+'"'));
assert(html.includes('data-hour-a="癸未"'));
assert(html.includes('data-hour-b="丙戌"'));
assert.equal((html.match(/data-question="/g)||[]).length,5);
assert.equal((html.match(/data-field="counterexample"/g)||[]).length,5);
assert(!/\bfetch\s*\(/.test(html));
assert(!/<form\b/i.test(html));
assert.throws(()=>subject.render({...doc,saleApproved:true}),/UNTRUSTED_RENDER/);
const answers=doc.questions.map((q,i)=>({
 id:q.id,
 conclusion:'질문 '+i+'에 대해서 고전의 실제 출처와 적용 조건을 확인하고 비교한 결과를 아직 전문적으로 채택하지 않습니다.',
 citationUrl:'https://zh.wikisource.org/zh-hant/三命通會/卷八',
 applicationRule:'적용 근거 '+q.id+'의 해당 출생시간과 달의 글자를 분리하여 구체적인 대조를 실시합니다.',
 counterexample:'반례 '+q.id+'에서는 다른 출생시간의 겨울 구절을 그대로 사용하지 않고 예외 조건을 확인합니다.'
}));
const submission={kind:'qa-proposed-method-decisions-v1',
 chartBinding:doc.chartBinding,comparedHourPillars:doc.comparedHourPillars.slice(),
 authorizesSale:false,authorizesPaidWriter:false,
 reusableForOtherBirthCharts:false,answers};
const outcome=subject.check(submission);
assert.equal(outcome.status,'format-complete-independent-expert-review-required');
assert.deepEqual(outcome.errors,[]);
assert.equal(outcome.saleApproved,false);
assert.equal(subject.check({...submission,chartBinding:'other'}).status,
 'incomplete-or-contradictory');
const copied=structuredClone(submission);
copied.answers[1]={...copied.answers[0],id:copied.answers[1].id};
assert(subject.check(copied).errors.includes('recycled-answer-across-questions:resolve-month'));
const root=fs.mkdtempSync(path.join(os.tmpdir(),'saju-expert-'));
try{
 const p=path.join(root,'review.html');
 subject.main(['--write',p]);
 assert.equal(fs.readFileSync(p,'utf8'),html);
 assert.equal(fs.statSync(p).mode&0o777,0o600);
 assert.throws(()=>subject.main(['--write',p]),/EEXIST/);
 const input=path.join(root,'answers.json');
 fs.writeFileSync(input,JSON.stringify(submission));
 subject.main(['--check',input]);
}finally{fs.rmSync(root,{recursive:true,force:true});}
console.log('PASS offline HTML expert manuscript review and answer handoff, existing human research drafts reused, zero paid calls or sale approvals');
