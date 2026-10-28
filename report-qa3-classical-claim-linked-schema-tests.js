'use strict';
// Real provider-shaped output schema, preflight, five-claim annotations and
// actual decoder handoff. All results synthetic & free, never billable.
const assert=require('node:assert/strict');
const {capture}=require('./report-core-paid-full-prompt-capture');
const authored=require('./report-core-v2-authored-first-chapter');
const revised=require('./report-core-1994-dingren-reader-revision');
const thesis=require('./report-core-thesis');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const decoder=require('./report-response-decoder');
const preflight=require('./report-provider-preflight');
const schemaBase=require('./report-schema.json');
const audit=require('./report-qa3-classical-open-prose-audit');
const bridge=require('./report-paid-core-v2-classical-provider-bridge');
const links=require('./report-qa3-classical-claim-linked-schema');
const {prepare}=require('./report-paid-core-v2-billable-readiness');
const flags=['NODE_ENV','RENDER','PAID_CORE_DEPTH_V2',
 'PAID_CORE_V2_CLASSICAL_WRITER','PAID_CORE_V2_CLAIM_LINKS',
 'PAID_CORE_V2_LOCK_REFS','PAID_CORE_V2_CLOSED_CLAIMS',
 'PAID_CORE_V2_SOURCE_BOUND_READER'];
(async()=>{
 const saved=Object.fromEntries(flags.map(x=>[x,process.env[x]]));
 try{
  process.env.NODE_ENV='test';
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  for(const key of flags.filter(x=>!['NODE_ENV','PAID_CORE_DEPTH_V2'].includes(x)))
   delete process.env[key];
  const captured=await capture(authored.INPUT);
  assert.equal(captured.providerCalls,0);
  const prompt=captured.prompt,payload=writer.compile(prompt);
  const sourceData=JSON.stringify(payload);
  const standardSchema=writer.schema(prompt,wire.schemaFor(prompt,schemaBase));
  const standardHash=(await prepare()).requestHash;
  const slot=s=>s.properties.chapters.properties.saju_core.properties
   .paragraphs.properties.temperament.anyOf.find(x=>x.type==='object');
  assert(!slot(standardSchema).properties.basis.properties.claimLinks);
  assert.deepEqual(preflight.inspect(prompt,payload,standardSchema),[]);
  process.env.PAID_CORE_V2_CLASSICAL_WRITER='offline-preview';
  const classicalBaselineHash=(await prepare()).requestHash;
  process.env.PAID_CORE_V2_CLAIM_LINKS='offline-preview';
  assert.equal(links.enabled(prompt),true);
  const brief=bridge.inspect(prompt,payload);
  const extended=writer.schema(prompt,wire.schemaFor(prompt,schemaBase));
  assert.deepEqual(preflight.inspect(prompt,payload,extended),[]);
  const extra=slot(extended).properties.basis;
  assert(extra.required.includes('claimLinks'));
  assert.equal(extra.properties.claimLinks.type,'array');
  assert.equal(extra.properties.claimLinks.items.additionalProperties,false);
  assert.deepEqual(extra.properties.claimLinks.items.properties.claimId.enum,
   brief.permittedClaims.map(x=>x.id));
  assert.deepEqual(extra.properties.claimLinks.items.properties.refs.items.enum,
   brief.requiredEvidenceRefs);
  assert.deepEqual(slot(extended).properties.basis.properties.refs.items.enum,
   slot(standardSchema).properties.basis.properties.refs.items.enum);
  const corrupted=structuredClone(extended);
  delete slot(corrupted).properties.basis.properties.claimLinks;
  assert(preflight.inspect(prompt,payload,corrupted).includes(
   'core-v2-server-contract-not-on-provider-wire'));
  const request=await prepare();
  assert.equal(request.providerCalls,0);
  assert.equal(request.approvalToCharge,false);
  assert.equal(request.releaseVerdict,'not-approved');
  assert.notEqual(request.requestHash,standardHash);
  const sample=revised.make(prompt.facts).candidate;
  const inspected=audit.screen(prompt,sample);
  assert.equal(inspected.mechanicallyEligible,true,
   JSON.stringify(inspected.findings));
  const quoteList=audit.sentences(sample.text);
  const annotated=structuredClone(sample);
  annotated.basis.claimLinks=brief.permittedClaims.map(row=>{
   const match=inspected.claimTrace.claimRows.find(x=>x.claimId===row.id);
   const sentenceIndex=match.candidateNonContradictoryCueIndices[0];
   assert(Number.isInteger(sentenceIndex),'missing eligible sentence for '+row.id);
   return {claimId:row.id,sentenceIndex,
    sentenceQuote:quoteList[sentenceIndex],refs:row.refs.slice()};
  });
  const allowed=writer.allowedRefs(payload,
   payload.task.chapters.saju_core.topics.strength,'saju_core','strength');
  const monthRefs=['natal.month.stem','natal.month.hidden.己',
    'facts.seasonalEvidence','facts.qiEvidence'].filter(id=>allowed.has(id));
  const t=thesis.forPrompt(prompt);
  const raw={
   chapters:{saju_core:{title:t.title,keyJudgment:t.keyJudgment,
    mood:'reflective',paragraphs:{
     temperament:annotated,
     strength:{
      label:'태어난 달의 두 기준',
      text:'태어난 달에는 배우는 문제와 역할을 맡는 문제가 함께 드러납니다. 이 분류를 실제 행동이나 결과로 단정할 수는 없습니다.',
      basis:{refs:monthRefs,
       interpretation:'달 겉글자와 달의 대표 속글자는 서로 다릅니다.',
       condition:'배움과 규칙을 비교하는 가정입니다.',
       limit:'실제 기질과 능력은 증명되지 않았습니다.'}
     }
    }}},cover:null,finalJudgment:null
  };
  const original=JSON.stringify(raw);
  const checked=links.validateAndStrip(prompt,raw);
  assert.equal(JSON.stringify(raw),original,
   'provider output must remain unmutated');
  assert(!Object.hasOwn(checked.value.chapters.saju_core.paragraphs
   .temperament.basis,'claimLinks'));
  assert.equal(checked.review.linkedClaims,5);
  assert.equal(checked.review.newOriginalProseSemanticallyProven,false);
  assert.equal(checked.review.canSell,false);
  assert(decoder.decode(checked.value,prompt).sections?.[0]?.bodyTopics
   .includes('temperament'),'real app decoder must accept stripped clone');
  const mutate=(change,errorPattern)=>{
   const next=structuredClone(raw);
   change(next.chapters.saju_core.paragraphs.temperament);
   assert.throws(()=>links.validateAndStrip(prompt,next),errorPattern);
  };
  mutate(p=>{p.basis.claimLinks[0].refs=['natal.month.hidden.丁']},
   /QA3_CLAIM_LINKS_FACT_OR_QUOTE_MISMATCH/);
  mutate(p=>{p.basis.claimLinks[1].claimId=p.basis.claimLinks[0].claimId},
   /QA3_CLAIM_LINKS_MISSING_DUPLICATE_OR_OUT_OF_ORDER/);
  mutate(p=>{p.basis.claimLinks[2].sentenceQuote='다른 사주에 해당하는 주장'},
   /QA3_CLAIM_LINKS_FACT_OR_QUOTE_MISMATCH/);
  mutate(p=>{p.basis.claimLinks[3].sentenceIndex=0},
   /QA3_CLAIM_LINKS_FACT_OR_QUOTE_MISMATCH/);
  mutate(p=>{p.basis.claimLinks.pop()},
   /QA3_CLAIM_LINKS_MISSING_DUPLICATE_OR_OUT_OF_ORDER/);
  mutate(p=>{p.text+=' 두 글자는 이미 木으로 합화되었습니다.'},
   /QA3_CLAIM_LINKS_UNSAFE_PROSE/);
  mutate(p=>{p.basis.refs=p.basis.refs.slice(2)},
   /QA3_CLAIM_LINKS_UNSAFE_PROSE/);
  assert.equal(JSON.stringify(payload),sourceData);
  delete process.env.PAID_CORE_V2_CLAIM_LINKS;
  assert.equal(links.enabled(prompt),false);
  assert.deepEqual(writer.schema(prompt,wire.schemaFor(prompt,schemaBase)),
   writer.schema(prompt,wire.schemaFor(prompt,schemaBase)));
  assert.equal((await prepare()).requestHash,classicalBaselineHash,
   'classical writing request fingerprint must remain unchanged when link flag is off');
  delete process.env.PAID_CORE_V2_CLASSICAL_WRITER;
  assert.equal((await prepare()).requestHash,standardHash,
   'original QA3 provider fingerprint must remain unchanged');
  process.env.PAID_CORE_V2_CLASSICAL_WRITER='offline-preview';
  process.env.PAID_CORE_V2_CLAIM_LINKS='offline-preview';
  process.env.NODE_ENV='production';
  assert.equal(links.enabled(prompt),false);
  assert.throws(()=>links.validateAndStrip(prompt,raw),
   /QA3_CLAIM_LINKS_OFFLINE_ONLY/);
  process.env.NODE_ENV='test';process.env.RENDER='true';
  assert.equal(links.enabled(prompt),false);
  console.log('QA3_CLAIM_LINKED_PROVIDER_SCHEMA='+JSON.stringify({
   claimEntries:brief.permittedClaims.length,
   canonicalUniqueRefs:brief.requiredEvidenceRefs.length,
   strictSchemaExtraFieldRequired:true,
   providerPreflightRejectsMissingField:true,
   wrongRefsAndQuoteAndIndexAndDuplicatesBlocked:true,
   unsupportedTransformationAndMissingCitationsBlocked:true,
   unmodifiedAppDecoderAcceptsValidatedStrippedClone:true,
   originalPaidProviderHashPreserved:true,
   originalInputsUnchanged:true,
   modelOutputActuallyGenerated:false,
   remoteProviderSchemaAcceptance:'not-tested',
   perSentenceMeaningEstablished:false,
   humanEditorialReviewRequired:true,
   newApiCalls:0,approvedForCustomers:false,
   releaseVerdict:'not-approved'
  }));
 }finally{
  for(const [k,v] of Object.entries(saved))
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
})().catch(err=>{console.error(err);process.exitCode=1});
