'use strict';
const assert=require('node:assert/strict');
const {capture}=require('./report-core-paid-full-prompt-capture');
const bridge=require('./report-paid-core-depth-v2');
const specimen=require('./report-core-v2-authored-first-chapter');
const audit=require('./report-paid-core-v2-editorial-triage');
(async()=>{
 const prev={node:process.env.NODE_ENV,flag:process.env.PAID_CORE_DEPTH_V2,
  render:process.env.RENDER};
 try{
  process.env.NODE_ENV='test';
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  delete process.env.RENDER;
  const x=await capture(specimen.INPUT);
  assert.equal(x.providerCalls,0);
  const authored=specimen.make(x.prompt.facts);
  assert.equal(authored.approvalForPaidCustomers,false);
  const ctx=bridge.build(x.prompt.facts);
  const base='태어난 달의 겉글자와 속글자를 나누어 읽습니다. 이에 해당하는 두 전통 분류를 구별합니다.';
  const reviewed=audit.inspect(authored.proposal,base,ctx);
  assert.equal(reviewed.kind,'first-chapter-editorial-triage-v1');
  assert.equal(reviewed.observed.hasScene,true);
  assert.equal(reviewed.observed.hasOpposingCondition,true);
  assert.equal(reviewed.observed.exactNewPositionConnectedToMonth,true);
  assert(reviewed.observed.conditionalDownsideSentences>=2);
  assert.equal(reviewed.independentMethodReviewed,false);
  assert.equal(reviewed.canSell,false);
  const generic=structuredClone(authored.proposal);
  generic.text='태어난 시간의 겉글자가 태어난 달의 다른 숨은 글자와 정확히 일치합니다. '+
   '이것은 여러 가지 가능성을 보여 주는 뜻입니다. 예를 들어 새로운 일을 시작하는 상황을 가정하겠습니다. '+
   '달의 분류와 시간의 분류를 함께 고려하는 것이 중요합니다. '+
   '반대로 두 분류 중 하나만 보아서는 안 됩니다. '+
   '이 내용으로 실제 행동을 단정하지 않습니다. '+
   '태어난 사람의 실제 경험이 확인됐다는 뜻도 아닙니다. '+
   '결정을 앞두었을 때는 차분하게 정리하고 검토하는 것이 좋습니다.';
  const shallow=audit.inspect(generic,base,ctx);
  assert(shallow.findings.includes('missing-two-sided-conditional-downside'));
  assert.equal(shallow.canSell,false);
  const disconnected=structuredClone(authored.proposal);
  disconnected.text=disconnected.text.replace(
   /이 사주의 시간 자리에는 달 속에 숨은 별도의 자원 관리 글자와 정확히 대응하는 글자가 드러나 있으므로/,
   '시간 자리는 별도 항목입니다. 달 속에 숨은 글자가 정확히 대응한다는 설명은 독립된 주장입니다');
  const broken=audit.inspect(disconnected,base,ctx);
  assert(broken.findings.includes('new-birth-position-not-explained-together-with-month'));
  const none=audit.inspect(null,base,ctx);
  assert(none.findings.includes('missing-paid-depth'));
  assert.equal(none.canSell,false);
  console.log('PASS paid first-chapter editorial triage: actual grounded authored example vs generic and disconnected depth; professional validation never automated; API calls 0');
 }finally{
  for(const [k,v] of [['NODE_ENV',prev.node],
   ['PAID_CORE_DEPTH_V2',prev.flag],['RENDER',prev.render]])
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
