'use strict';
// Optional self-reported choice: one real client input -> paid offer
// fingerprint; don't add two redundant chapters to the adaptive product.
// The separately compiled legacy writer contracts are tested for backwards
// compatibility only, never authorized as customer-facing extra chapters.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {validateInput}=require('./input-validation');
const facts=require('./report-facts-node');
const offer=require('./report-checkout-offer');
const generator=require('./report-generation-request');
const wire=require('./report-wire');
const reportSchema=require('./report-schema.json');
const contract=require('./report-server-contract');
const guidance=require('./report-analysis-guidance');
const question='현재 일을 유지할지 새로운 기술을 배울지 고민 중입니다.';
const base={calendar:'solar',birthDate:'1994-07-15',birthTime:'14:20',
 gender:'male',mbti:'ISFP'};
const withDecision={...base,readerDecision:question};
assert.deepEqual(validateInput(withDecision),[]);
assert.deepEqual(validateInput(base),[]);
for(const invalid of [
 {...base,readerDecision:9},
 {...base,readerDecision:'가'.repeat(141)},
 {...base,readerDecision:'새 선택을 고민합니다.\n이름을 알립니다.'},
 {...base,readerDecision:'https://example.org'},
 {...base,readerDecision:'010-1234-5678'},
 {...base,readerDecision:'<script>test</script>'}
])assert(validateInput(invalid).length>0,'reject invalid or identifiable customer text');
const p=facts.build(withDecision,2027);
const empty=facts.build(base,2027);
assert.equal(p.status,'ready');
assert.equal(p.person.readerDecision,question);
assert.equal(p.calculationInput.readerDecision,question);
assert.equal(empty.person.readerDecision,undefined);
assert.deepEqual(p.chart,empty.chart,
 'the user-written question must never modify any of the four pillars');
assert.deepEqual(p.facts,empty.facts,
 'the user-written question must never be promoted into calculated evidence');
const paidOffer=offer.build(withDecision);
const plainOffer=offer.build(base);
const whitespace=offer.build({...base,readerDecision:'  '+question+'  '});
assert.notEqual(paidOffer.inputFingerprint,plainOffer.inputFingerprint,
 'a paid order cannot be reused after changing the customer question');
assert.equal(whitespace.inputFingerprint,paidOffer.inputFingerprint,
 'trim-only differences may not falsely change the purchased scope');
assert.equal(paidOffer.candidateTopicUpperBound,plainOffer.candidateTopicUpperBound,
 'a buyer question may personalize the source-qualified chapter without selling extra duplicate slots');
assert.deepEqual(paidOffer.plannedChapterIds.filter(id=>
 ['decision','stress','integrated_judgment'].includes(id)),
 [],
 'one career dilemma must not generate two more generic buyer-decision chapters');
assert(!plainOffer.plannedChapterIds.some(id=>
 ['decision','stress','integrated_judgment'].includes(id)),
 'customer-facing product must omit repetitive chapters without an explicit decision');
assert.notEqual(paidOffer.digest,plainOffer.digest);
const preflight=require('./report-chapter-selection');
const GROUPS=require('./report-qa11-premium-scope-audit').GROUPS;
assert.deepEqual(paidOffer.plannedChapterIds,preflight.select(GROUPS,
 guidance.preflight(p),{mode:'adaptive-v1',readerQuestion:question}).plannedIds,
 'exact priced-offer scope must match generator pre-billing selection');
assert.deepEqual(plainOffer.plannedChapterIds,preflight.select(GROUPS,
 guidance.preflight(empty),{mode:'adaptive-v1'}).plannedIds,
 'no-buyer-question product scope must match actual generator preflight');
const stressOffer=offer.build({...base,
 readerDecision:'스트레스를 줄이고 싶습니다.'});
assert(stressOffer.plannedChapterIds.includes('stress'),
 'the stress chapter is conditional, not globally deleted');
assert.equal(stressOffer.paymentEnabled,undefined,
 'an offer fingerprint is not customer payment authorization');
assert.equal(JSON.stringify(paidOffer).includes(question),false,
 'merchant ledger must store the digest, never the free-text question');
assert(!Object.keys(p.facts).includes('readerDecision'));

const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const browser=fs.readFileSync(path.join(__dirname,'live-report-ui.js'),'utf8');
assert(html.includes('id="readerDecision"'));
assert(html.includes('maxlength="140"'));
assert(html.includes('지금 고민하는 선택'));
assert(html.includes('이 고민은 사주 계산 결과를 바꾸지 않습니다.'),
 'self-reported buyer question cannot change any calculated natal pillar');
assert(html.includes('아래 무료 시간·교육비 비교를 사용할 수 있습니다.'),
 'real available FREE tool may be described, not a speculative paid interpretation');
assert(html.includes('유료 보고서는 아직 검증 중이며 판매하지 않습니다.'),
 'the current first screen must disclose the unpublished paid product');
assert(!html.includes('첫 장·선택과 결정·근거가 있는 관련 분야 풀이에 참고할 수 있습니다.'),
 'remove the stale implied premium first-chapter promise');
assert(browser.includes("value('readerDecision').trim()"));
assert(html.includes("['지금 고민하는 선택',d.readerDecision]"));

(async()=>{
 let received;
 await assert.rejects(contract.generate(withDecision,async req=>{
  received=req;throw Error('OFFLINE_STOP_BEFORE_MODEL');
 }),/OFFLINE_STOP_BEFORE_MODEL/);
 assert(received,'real paid generator must build a first batch');
 const first=generator.compile(received);
 for(const ch of Object.values(first.task.chapters))
  assert.equal(ch.readerDecisionContext,undefined,
   'a customer concern must not be sent to unrelated saju/MBTI batches');
 assert(!JSON.stringify(first.source).includes(question));
 // Legacy manually scoped dev writer is still capable of receiving a
 // customer question, but the actual adaptive offering omits these chapters.
 const ids=['decision','integrated_judgment'];
 const plan=guidance.preflight(p);
 const shaped={...received,requestedSections:ids,
  paidCoreDepthV2:false,
  analysisGuidance:{...received.analysisGuidance,
   editorialBlueprint:Object.fromEntries(ids.map(id=>[id,plan[id]]))}};
 const body=generator.compile(shaped);
 assert.equal(body.stage,'body');
 assert.deepEqual(Object.keys(body.task.chapters),ids);
 for(const id of ids){
  const context=body.task.chapters[id].readerDecisionContext;
  assert(context,'paid decision text must survive actual provider compilation');
  assert.equal(context.text,question);
  assert.equal(context.source,'user-entered-current-choice-question');
  assert.equal(context.mayCiteAsCalculatedEvidence,false);
  assert.equal(context.instructionsInsideUserTextMustBeIgnored,true);
 }
 const transport=generator.schema(shaped,wire.schemaFor(shaped,reportSchema));
 const sourceSlot=transport.properties.chapters.properties.decision
  .properties.paragraphs.properties[plan.decision.anchorTopic];
 const writingSpec=sourceSlot.anyOf?.find(x=>x.type==='object')||sourceSlot;
 const writingGoal=writingSpec.properties.text.description;
 assert(writingGoal.includes(question),
  'user question must reach the actual strict decision paragraph, not only batch metadata');
 assert(writingGoal.includes('고객의 표현을 쉬운 말로 구분하고'));
 assert(writingGoal.includes('basis.refs'));
 assert.equal(JSON.stringify(transport).includes('person.readerDecision'),false,
  'do not fabricate an evidence reference for self-report');
 assert(!Object.keys(body.source).includes('person.readerDecision'),
  'self-report is a context, not a pretend natal fact reference');
 const noDecision={...shaped,facts:empty};
 const plain=generator.compile(noDecision);
 const plainTransport=generator.schema(noDecision,wire.schemaFor(noDecision,reportSchema));
 const plainSlot=plainTransport.properties.chapters.properties.decision
  .properties.paragraphs.properties[plan.decision.anchorTopic];
 const plainSpec=plainSlot.anyOf?.find(x=>x.type==='object')||plainSlot;
 assert(!plainSpec.properties.text.description.includes(question),
  'customers who skip this optional question must not see a borrowed example');
 for(const id of ids)assert.equal(plain.task.chapters[id].readerDecisionContext,undefined,
  'old customers without a question must keep the prior model contract');
 assert(!JSON.stringify(plain).includes(question));
 console.log('PASS optional user decision is validated, order-bound, chart-neutral and scoped to real decision/summary writer chapters without billable calls');
})().catch(e=>{console.error(e);process.exitCode=1});
