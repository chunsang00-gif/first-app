'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const capture=require('./report-core-paid-full-prompt-capture').capture;
const boundary=require('./report-qa13-money-risk-independent-source');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const sourceSchema=require('./report-schema.json');
const guidance=require('./report-analysis-guidance');
const cases=[
 ['1982-11-24','14:20','lunar'],['1994-07-15','14:20','solar'],
 ['1994-01-15','14:20','solar'],['1994-05-15','20:20','solar'],
 ['1982-08-15','14:20','solar'],['1994-04-15','14:20','solar'],
 ['1994-06-15','14:20','solar'],['2006-08-15','14:20','solar'],
 ['2018-07-15','14:20','solar'],['1994-05-15','14:20','solar']
];
const keys=['NODE_ENV','RENDER','PAID_CORE_DEPTH_V2',
 'PAID_CORE_V2_CLASSICAL_WRITER','PAID_CORE_V2_CLAIM_LINKS',
 'PAID_CORE_V2_REQUIRED_RESEARCH_SLOT'];
async function run(){
 const prior=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 try{
  process.env.NODE_ENV='test';delete process.env.RENDER;
  for(const k of keys.slice(2))delete process.env[k];
  const results=[],detected=new Set();
  let lastPacket=null;
  for(const [birthDate,birthTime,calendar] of cases){
   const input={calendar,birthDate,birthTime,gender:'male',
    mbti:'ISFP',...(calendar==='lunar'?{leapMonth:false}:{})};
   const packet=facts.build(input,2027);
   assert.equal(packet.status,'ready');
   const snap=JSON.stringify(packet);
   const reviewed=boundary.inspect(packet);
   assert.equal(JSON.stringify(packet),snap);
   const verifiedClassical=require('./report-paid-money-clash-reading').candidate(packet);
   assert.equal(reviewed.paidRiskTopicMode,
    verifiedClassical?'use-primary':'state-limits');
   assert.equal(reviewed.classicalScopeProven,Boolean(verifiedClassical));
   if(verifiedClassical){
    assert(verifiedClassical.monthBranch==='辰'||verifiedClassical.monthBranch==='戌'||
     verifiedClassical.monthBranch==='丑'||verifiedClassical.monthBranch==='未');
    assert.equal(verifiedClassical.promisedGain,false);
    assert.equal(verifiedClassical.promisedLoss,false);
    assert.equal(verifiedClassical.usefulGodChosen,false);
   }
   assert.equal(reviewed.realLossPredicted,false);
   assert.equal(reviewed.methodTextuallyVerified,false);
   assert.equal(reviewed.safeToAutoWriteCustomerRisk,false);
   assert.equal(reviewed.canSell,false);
   assert.equal(reviewed.providerCalls,0);
   detected.add(reviewed.scopeStatus);
   for(const row of reviewed.candidates){
    assert(['정재','편재'].includes(row.wealthCategory));
    assert(row.wealthSourceId.startsWith('natal.'+row.wealthBranchPosition+'.hidden.'));
    assert(row.pairedPositions.includes(row.wealthBranchPosition));
    assert(row.pairedPositions.includes(row.otherBranchPosition));
    assert.equal(row.relation,'충');
    assert.equal(row.realizedLifeEvent,false);
    const exact=packet.facts.tenGods[row.wealthBranchPosition].hiddenStems
     .find(x=>'natal.'+row.wealthBranchPosition+'.hidden.'+x.stem===
      row.wealthSourceId);
    assert.equal(exact.tenGod,row.wealthCategory);
    assert(packet.facts.natalClashes.some(x=>x.positions.join('/')===
     row.pairedPositions.join('/')&&x.branches===row.branchPair));
   }
   if(reviewed.candidates.length)
    assert.equal(reviewed.scopeStatus,'natal-wealth-endpoint-clash-candidate-only');
   if(reviewed.natalClashCount===0)
    assert.equal(reviewed.scopeStatus,'no-natal-clash');
   if(reviewed.natalClashCount&&reviewed.candidates.length===0)
    assert.equal(reviewed.scopeStatus,'no-wealth-at-verified-clash-endpoint');
   results.push({date:birthDate,calendar,clashes:reviewed.natalClashCount,
    directWealthEndpointMatches:reviewed.wealthAtClashEndpointCount,
    status:reviewed.scopeStatus});
   lastPacket=packet;
  }
  assert(detected.has('no-natal-clash'));
  assert(detected.has('natal-wealth-endpoint-clash-candidate-only'),
   'must inspect an independently verified direct wealth-position candidate');
  const probe=cases[0],input={calendar:probe[2],birthDate:probe[0],
   birthTime:probe[1],gender:'male',mbti:'ISFP',leapMonth:false};
  const intercepted=await capture(input);
  assert.equal(intercepted.providerCalls,0);
  const packet=facts.build(input,2027);
  const draft={...intercepted.prompt,requestedSections:['money'],
   analysisGuidance:{
    ...intercepted.prompt.analysisGuidance,
    editorialBlueprint:{money:guidance.preflight(packet).money}
   }};
  const payload=writer.compile(draft);
  const classical=require('./report-paid-money-clash-reading').candidate(packet);
  const risk=payload.task.chapters.money.topics.risk;
  assert.equal(risk.mode,classical?'use-primary':'state-limits');
  assert.deepEqual(risk.citableFacts.map(x=>x.id).filter(id=>id!=='person.mbti'),
   classical?.sourceRefs||[],
   'the optional self-reported MBTI metadata cannot replace the two verified natal sources');
  const schema=wire.schemaFor(draft,sourceSchema);
  const slot=schema.properties.chapters.properties.money.properties.paragraphs.properties.risk;
  if(classical){
   assert(slot.anyOf,'qualified historical question stays optional in paid manuscript');
   const exact=writer.schema(draft,schema).properties.chapters.properties.money
    .properties.paragraphs.properties.risk.anyOf.find(x=>x.type==='object');
   assert.deepEqual(exact.properties.basis.properties.condition.enum,
    [classical.computedCondition]);
   const grounded={label:'월지의 숨은 재성과 묘고 충의 한계',
    text:'이 출생월 안에는 실제로 계산된 재성 분류가 있습니다. 해당 월지와 다른 출생 자리 사이에 실제 진술 또는 축미 충이 확인된 경우에도 이를 곧바로 재물 창고가 열린다거나 손실을 본다는 뜻으로 읽지 않습니다. 서로 다른 출생 위치에서 확인한 근거와 전체 해석이 필요한 지점을 구분합니다.',
    basis:{refs:classical.sourceRefs.slice(),
     interpretation:'확인된 월지 재성 분류와 서로 다른 지지의 충 관계만 연결합니다.',
     condition:classical.computedCondition,
     limit:'손익, 투기, 채무, 미래 사건이나 격국의 완성은 검증하지 않았습니다.'}};
   const response=p=>({chapters:{money:{paragraphs:{risk:p}}}});
   assert.doesNotThrow(()=>writer.restoreEvidence(response(grounded),draft));
   const missingClash=structuredClone(grounded);
   missingClash.basis.refs=classical.sourceRefs.filter(x=>x!=='facts.natalClashes');
   assert.throws(()=>writer.restoreEvidence(response(missingClash),draft),
    /money storage clash grounded condition missing: money:risk/,
    'an uncited clash must fail before accepting premium text');
   const moneyOnly=structuredClone(grounded);
   moneyOnly.basis.refs=classical.sourceRefs.filter(x=>x!==classical.wealthRef);
   assert.throws(()=>writer.restoreEvidence(response(moneyOnly),draft),
    /money storage clash grounded condition missing: money:risk/,
    'a wealth interpretation requires the exact month-hidden wealth row');
   const wrongOutcome=structuredClone(grounded);
   wrongOutcome.basis.condition='재물 창고의 충으로 실제 금전 손실이 발생합니다.';
   assert.throws(()=>writer.restoreEvidence(response(wrongOutcome),draft),
    /money storage clash grounded condition missing: money:risk/,
    'a predicted financial loss cannot replace the historically grounded condition');

  }else assert.equal(slot.type,'null','unsupported risk still cannot be published');
  const broken=structuredClone(lastPacket);
  broken.facts.tenGods.year.hiddenStems[0].tenGod='편재';
  assert.throws(()=>boundary.inspect(broken),/QA13_CALCULATION_INTEGRITY_INVALID/);
  const corrupted=structuredClone(lastPacket);
  corrupted.facts.natalClashes.push({type:'충',positions:['year','hour'],
   branches:'卯酉',note:'forged'});
  assert.throws(()=>boundary.inspect(corrupted),/QA13_CALCULATION_INTEGRITY_INVALID/);
  process.env.NODE_ENV='production';
  assert.throws(()=>boundary.inspect(lastPacket),/QA13_OFFLINE_SOURCE_INSPECTION_ONLY/);
  process.env.NODE_ENV='test';process.env.RENDER='true';
  assert.throws(()=>boundary.inspect(lastPacket),/QA13_OFFLINE_SOURCE_INSPECTION_ONLY/);
  console.log('QA13_MONEY_RISK_SOURCE='+JSON.stringify({
   casesChecked:results.length,observedStatuses:[...detected],
   distinctVerifiedWealthClashCandidates:results.filter(x=>
    x.directWealthEndpointMatches>0).length,
   actualMoneyLossForecasts:0,providerCalls:0,
   realPaidRiskSchemaStillNullForUnsupportedCharts:true,customerRelease:false,
   semanticClassicalMethodUnverified:true,results
  }));
 }finally{
  for(const [k,v] of Object.entries(prior))
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
}
run().catch(e=>{console.error(e);process.exitCode=1});
