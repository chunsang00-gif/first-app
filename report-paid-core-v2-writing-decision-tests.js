'use strict';
const assert=require('node:assert/strict');
const {capture}=require('./report-core-paid-full-prompt-capture');
const writer=require('./report-generation-request');
const chooser=require('./report-paid-core-v2-writing-decision');
const modern={calendar:'solar',birthDate:'1994-07-15',
 birthTime:'14:20',gender:'male',mbti:'ISFP'};
const winter={calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,
 birthTime:'14:20',gender:'male',mbti:'ISFP'};
async function run(){
 const prior={flag:process.env.PAID_CORE_DEPTH_V2,
  node:process.env.NODE_ENV,render:process.env.RENDER};
 try{
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  process.env.NODE_ENV='test';delete process.env.RENDER;
  for(const [input,expected] of [
   [modern,'verified-month-hidden-exposure'],
   [winter,'verified-exact-hour-classical-symbols']]){
   const captured=await capture(input);
   assert.equal(captured.status,'captured-full-paid-composition');
   assert.equal(captured.providerCalls,0);
   assert.equal(captured.prompt.paidCoreDepthV2,true);
   const out=writer.compile(captured.prompt);
   const chapter=out.task.chapters.saju_core;
   const target=chapter.topics.temperament;
   const choice=target.sourceQualifiedWritingDecision;
   assert.equal(choice.kind,'source-scoped-core-v2-editorial-decision-v1');
   assert.equal(choice.selectedScope,expected);
   assert.equal(choice.decision,'attempt-one-distinct-conditional-symbolic-reading');
   assert.equal(choice.eligibleForRealLifeJudgment,false);
   assert.equal(choice.humanEditorialReviewRequired,true);
   assert.equal(choice.approvedForSale,false);
   assert(choice.readerInstruction.includes('이번에는 이 조건부 풀이를 우선 시도한다'));
   assert(choice.readerInstruction.includes('temperament는 null로 둔다'));
   if(expected==='verified-month-hidden-exposure'){
    const scene=choice.readerScene;
    assert.equal(scene.kind,
     'v2-verified-classifications-conditional-editorial-scene-v1');
    assert.equal(scene.approvedForSale,false);
    assert.equal(scene.realPersonObservation,false);
    assert.equal(scene.traditionOnly,true);
    assert.deepEqual(scene.rolePair,['정관','정재']);
    assert.deepEqual(scene.sourceRefs,choice.sourceRefs);
    assert(scene.openingQuestion.includes('부품비')||
     scene.openingQuestion.includes('정기 점검'));
    assert(scene.whenOnlyOriginal.includes('점검 시간'));
    assert(scene.whenOnlyAdditional.includes('승인 권한'));
    assert(choice.readerInstruction.includes(scene.writerInstruction));
   }else{
    assert.equal(choice.readerScene,null);
   }

   const contract=target.serverOwnedWritingContract||null;
   if(expected==='verified-month-hidden-exposure'){
    assert.equal(contract?.kind,
     'server-owned-first-chapter-evidence-and-claim-contract-v1');
    assert.equal(contract.modelRole,'Korean-prose-rendering-only');
    assert.equal(contract.humanEditorialApproval,false);
    assert.equal(contract.releaseVerdict,'not-approved');
    assert.deepEqual(contract.verifiedSourceIds,choice.requiredCitationIds);
    assert(contract.evidenceRefs.includes('facts.seasonalEvidence'));
    assert(contract.evidenceRefs.includes('facts.qiEvidence'));
    assert(chapter.coreV2ConditionalReadingBrief.includes(contract.textContract));
    assert(!chapter.coreV2ConditionalReadingBrief.includes(choice.readerInstruction),
     'do not send duplicative prose instructions when facts are server-owned');
   }else{
    assert.equal(contract,null);
    assert(chapter.coreV2ConditionalReadingBrief.includes(choice.readerInstruction));
   }
   assert(choice.sourceRefs.every(id=>Object.hasOwn(out.source,id)&&
    target.citableFacts.some(x=>x.id===id)));
   assert.deepEqual(choice.requiredCitationIds,choice.sourceRefs);
   if(expected==='verified-month-hidden-exposure'){
    assert(choice.readerFactAnchor.includes('태어난 시간'));
    assert(choice.readerFactAnchor.includes('태어난 달의 다른 속글자와 정확히 일치'));
    assert(choice.readerInstruction.includes(choice.readerFactAnchor));
   }else assert.equal(choice.readerFactAnchor,null);

   assert(choice.requiredCitationIds.every(id=>
    choice.readerInstruction.includes(id)));
   const responseSchema=writer.schema(captured.prompt,
    require('./report-wire').schemaFor(captured.prompt,
     require('./report-schema.json')));
   const refs=responseSchema.properties.chapters.properties.saju_core
    .properties.paragraphs.properties.temperament.anyOf
    .find(x=>x.type==='object').properties.basis.properties.refs;
   assert(choice.requiredCitationIds.every(id=>
    refs.description.includes(id)&&refs.items.enum.includes(id)));
   const textSpec=responseSchema.properties.chapters.properties.saju_core
    .properties.paragraphs.properties.temperament.anyOf
    .find(x=>x.type==='object').properties.text.description;
   if(contract){
    assert(textSpec.includes(contract.textContract));
    assert(textSpec.includes(contract.outline.originalOnly));
    assert(textSpec.includes(contract.outline.additionalOnly));
    assert(!textSpec.includes(choice.readerFactAnchor),
     'no repeated word-for-word old instructions in schema');
   }else if(choice.readerFactAnchor)
    assert(textSpec.includes(choice.readerFactAnchor));
   else assert(!textSpec.includes('태어난 달의 다른 속글자와 정확히 일치합니다'));
   if(choice.readerScene){
    assert(textSpec.includes(contract.outline.example),
     'verified two-sided example must be in real model output field');
    assert(textSpec.includes('부품비')&&textSpec.includes('승인'));
   }else assert(!textSpec.includes('공용 장비 한 대'));
   assert(!refs.description.includes('추가 출처를 임의로 지어낸다'));

   assert(!chapter.topics.strength.sourceQualifiedWritingDecision);
   const ordinary=writer.compile({...captured.prompt,paidCoreDepthV2:false});
   assert(!ordinary.task.chapters.saju_core.topics.temperament.sourceQualifiedWritingDecision);
   assert.equal(ordinary.task.chapters.saju_core.coreV2ConditionalReadingBrief,undefined);
   assert(!Object.hasOwn(ordinary.source,'natal.hour.hidden.丁'));
   // This selected source is a symbolic relationship, not a proven life trait.
   assert(!choice.readerInstruction.includes('실제 행동이 확인됐다'));
  }
  const later=await capture({...winter,birthTime:'20:20'});
  const laterExtra=writer.compile(later.prompt).task.chapters.saju_core
   .topics.temperament;
  assert.notEqual(laterExtra.sourceQualifiedWritingDecision.selectedScope,
   'verified-exact-hour-classical-symbols');
  assert.equal(laterExtra.paidCoreDepthV2.readerClassicalScope,null);
  const direct=writer.compile((await capture(modern)).prompt);
  const topic=direct.task.chapters.saju_core.topics.temperament;
  const allowed=topic.citableFacts.map(x=>x.id);
  const bogus=structuredClone(topic.paidCoreDepthV2);
  bogus.readerContrast.sourceRefs.push('natal.fake.unverified');
  assert.throws(()=>chooser.build(bogus,direct.source,allowed),
   /CORE_V2_WRITING_DECISION_UNCITABLE_OR_UNAPPROVED/);
  const forged=structuredClone(topic.paidCoreDepthV2);
  forged.exposures=forged.exposures.filter(x=>x.hiddenRef!==
   forged.readerContrast.extraHiddenId||x.visibleRef!==
   forged.readerContrast.visiblePosition);
  assert.throws(()=>chooser.build(forged,direct.source,allowed),
   /CORE_V2_WRITER_EXACT_EXPOSURE_RELATION_UNVERIFIED/,
   'never hand an invented month/hour equality to the model');
  const badScene=structuredClone(topic.paidCoreDepthV2);
  badScene.readerContrast.mainRole='식신';
  assert.throws(()=>chooser.build(badScene,direct.source,allowed),
   /CORE_V2_EDITORIAL_SCENE_SOURCE_MISMATCH/,
   'a fabricated role cannot receive the real-month/real-hour scene');
  const noSpecificScene=require('./report-paid-core-v2-grounded-scene')
   .forContrast({...topic.paidCoreDepthV2.readerContrast,
    monthMainToExposedElementDirection:'same-element'},direct.source);
  assert.equal(noSpecificScene,null,
   'symbolic direction drift must not reuse the equipment scenario');
  const badPlan=structuredClone(topic.paidCoreDepthV2);
  badPlan.readerContrast.readerWritingPlan=null;
  assert.throws(()=>chooser.build(badPlan,direct.source,allowed),
   /CORE_V2_WRITING_DECISION_MISSING_TWO_WAY_PLAN/);
  const empty=structuredClone(topic.paidCoreDepthV2);
  empty.readerContrast=null;empty.readerAlternative=null;empty.readerClassicalScope=null;
  const abstain=chooser.build(empty,direct.source,allowed);
  assert.equal(abstain.decision,'abstain-no-independent-source');
  assert.equal(abstain.approvedForSale,false);
  assert(abstain.readerInstruction.includes('temperament는 null'));
  process.env.NODE_ENV='production';
  const live=await capture(modern);
  assert.equal(live.prompt.paidCoreDepthV2,false);
  assert(!writer.compile(live.prompt).task.chapters.saju_core
   .topics.temperament.sourceQualifiedWritingDecision);
  console.log('PASS DEV-only V2 source-qualified narrative choice: 1994 exposed-role, 1982 exact-hour, changed-hour exclusion, no-citation rejection, real paid disabled; no API');
 }finally{
  for(const [k,v] of [['PAID_CORE_DEPTH_V2',prior.flag],
   ['NODE_ENV',prior.node],['RENDER',prior.render]])
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
}
run().catch(e=>{console.error(e);process.exitCode=1;});
