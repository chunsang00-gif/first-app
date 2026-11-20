'use strict';
// Production FREE reader regression for Hangul 받침-dependent object particles
// and an actual three-domain reader-edited manuscript. Do NOT mistake this
// mechanical spelling screen for literary or paid-value approval.
const assert=require('node:assert/strict');
const reader=require('./report-reading-sample');
const facts=require('./report-facts-node');
const grid=require('./report-core-knowledge-coverage');
const manual=require('./qa-first-chapter-cross-domain-editorial-pack');
const examples={
 '근거':'를','경로':'를','범위':'를','문제':'를','방법':'을',
 '기준':'을','조건':'을','몫':'을','역할':'을','결과물':'을'
};
for(const [word,particle] of Object.entries(examples)){
 assert.equal(reader.objectParticle(word),particle,'받침 조사 for '+word);
 assert.equal(reader.objectPhrase(word),'‘'+word+'’'+particle);
}
const conditions=Object.values(reader.CONDITIONS);
for(const {focus} of conditions){
 const correct=reader.objectPhrase(focus);
 const wrong=reader.objectParticle(focus)==='을'?'를':'을';
 assert(!correct.endsWith('’'+wrong));
}
const badPairs=[/근거’을/,/경로’을/,/범위’을/,/문제’을/,/기준’를/,/조건’를/,
 /근거을/,/경로을/,/범위을/,/문제을/,/기준를/,/조건를/];
let ready=0,link=0;
for(const input of grid.representativeInputs()){
 const p=facts.build(input,2027);
 if(p.status!=='ready')continue;
 const preview=reader.build(p);
 ready++;
 assert(preview.cards.length>=2&&preview.cards.length<=4);
 for(const c of preview.cards){
  assert(!badPairs.some(re=>re.test(c.text)),
   'grammar regression in '+c.id);
  assert(!c.text.includes('연간 기호'),
   'technical annual glossary must be translated in FREE preview');
  if(c.id==='month-visible-link')link++;
 }
}
assert(ready>90&&link>0,'test must cover real monthly linkage cases');
const review=manual.build();
assert.equal(review.rows.length,3);
assert.deepEqual(review.rows.map(x=>x.domain),['skill','money','pressure']);
for(const row of review.rows){
 assert(row.draft.length>300);
 assert(!/(?:근거을|경로을|검수 결과물을 완성한 것으로 볼지|변경 승인 절차|이미 처리한 결과물의 검수 기준)/.test(row.draft),
  'remove previously verified odd or unsupported buyer-facing phrases');
 assert(!/사주로 정해진다는 뜻은 아닙니다.*사주로 정해진다는 뜻은 아닙니다/.test(row.draft));
 assert.deepEqual(row.automatedChecks,{hour:[],reader:[],freeCopy:[]});
}
assert(!review.manuscriptsAreModelGenerated);
assert(!review.customerSaleApproved);
assert.equal(review.boughtAdditionalProviderCalls,0);
console.log('PASS actual FREE reading Korean particles across '+ready+
 ' computed charts, linked free cards='+link+
 '; three manually revised first-chapter buyer drafts; $0 provider/merchant, not sale-approved');
