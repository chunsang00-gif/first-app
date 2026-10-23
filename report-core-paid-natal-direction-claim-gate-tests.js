'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const preview=require('./report-core-paid-natal-depth-preview');
const guard=require('./report-core-paid-natal-direction-claim-gate');
const toK={year:'해',month:'달',hour:'시간'};
const samples=['1982-06-15','1982-03-15','1988-12-15','1994-04-15'];
let checked=0,rejected=0;
for(const date of samples){
 const packet=facts.build({calendar:'solar',birthDate:date,birthTime:'14:20',
  gender:'male',mbti:'ISFP'},2027);
 const provider=preview.prepare(packet);
 assert(provider&&provider.releaseVerdict==='not-approved');
 const source=provider.payload.source;
 const links=provider.payload.task.chapters.saju_core.topics.natal_depth
  .evidenceFocus.verifiedElementDirections;
 assert.equal(links.methodAdopted,false);
 assert.equal(links.pairs.length,3);
 for(const p of links.pairs){
  const left=p.from.split('.')[1],right=p.to.split('.')[1];
  const leftK=toK[left],rightK=toK[right],dir=p.elementalDirection;
  const claim=(a,b,verb)=>'태어난 '+a+'의 글자가 태어난 '+b+'의 글자를 '+verb+'습니다.';
  const equivalent=(a,b)=>'태어난 '+a+'의 글자가 태어난 '+b+'의 글자와 같은 오행입니다.';
  const correct=dir==='same-element'?equivalent(leftK,rightK):
   dir==='left-generates-right'?claim(leftK,rightK,'돕'):
   dir==='right-generates-left'?claim(rightK,leftK,'돕'):
   dir==='left-controls-right'?claim(leftK,rightK,'제약합'):
   claim(rightK,leftK,'제약합');
  // Korean active predicate of a restriction: '제약합니다', not '제약합습니다'.
  const good=correct.replace('제약합습니다','제약합니다');
  assert.deepEqual(guard.inspect(good,packet,source),[],date+':'+dir);
  const wrong=dir==='same-element'?claim(leftK,rightK,'돕'):
   dir==='left-generates-right'?claim(leftK,rightK,'제약합'):
   dir==='right-generates-left'?claim(rightK,leftK,'제약합'):
   dir==='left-controls-right'?claim(leftK,rightK,'돕'):
   claim(rightK,leftK,'돕');
  const bad=wrong.replace('제약합습니다','제약합니다');
  assert(guard.inspect(bad,packet,source).some(x=>
   x.startsWith('QA_DEPTH_FALSE_NATAL_ELEMENT_DIRECTION:')),
   'wrong chart-specific direction must be rejected: '+date+':'+dir);
  assert.deepEqual(guard.inspect(
   bad.replace('돕습니다','돕지 않습니다').replace('제약합니다','제약하지 않습니다'),
   packet,source),[],
   'denied/unverified statements should not be falsely classified as affirmations');
  checked++;rejected++;
 }
}
assert.equal(checked,12);
console.log('QA_NATAL_DIRECTION_ASSERTIONS='+JSON.stringify({
 syntheticCharts:4,directionalStatementsChecked:checked,
 intentionallyWrongAssertionsRejected:rejected,providerCalls:0,
 traditionalMethodApproved:false,releaseVerdict:'not-approved'
}));
