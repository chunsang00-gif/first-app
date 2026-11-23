'use strict';
// Work82: A buyer's first option is not necessarily an existing job, an
// existing budget, or a formal approval path. Catch fabricated A/B narratives
// in the REAL first-chapter provider request, using two different natal charts.
// This is offline prompt fidelity, not actual AI prose or human release approval.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const bindings=require('./report-fact-bindings');
const hour=require('./report-paid-core-hour-extension');
const brief=require('./report-paid-core-hour-editorial-brief');
const guidance=require('./report-analysis-guidance');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const schema=require('./report-schema.json');
const pair=require('./report-paid-core-hour-pair-meaning');
const precharge=require('./report-paid-core-precharge-value');
const cases=[
 {base:{calendar:'solar',birthDate:'1982-07-15',birthTime:'02:20',
   gender:'male',mbti:'ISFP'},domain:'money',direction:'resource',
  questions:[
   '적금을 유지할지 대출을 상환할지 고민입니다.',
   '대출을 상환할지 적금을 유지할지 고민입니다.'
  ]},
 {base:{calendar:'solar',birthDate:'1982-10-15',birthTime:'02:20',
   gender:'male',mbti:'ISFP'},domain:'skill',direction:'day-controls',
  questions:[
   '기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.',
   '자격증을 취득할지 기술 실습을 진행할지 고민 중입니다.'
  ]}
];
const forbiddenAssumption=/(?:이미 끝낸 작업|아직 완성하지 않은 작은 결과물|첫 선택 뒤 매달 이어질|첫 선택에서 이미 확보|첫 선택에서 지금 추가되는|첫 선택에서 따라야 할 승인 절차|첫 선택에서는 기존 절차)/;
let count=0,paidCalls=0;
const oldFetch=global.fetch;
global.fetch=()=>{paidCalls++;throw Error('WORK82_NETWORK_FORBIDDEN');};
try{
 // Check all six SOURCE roles, not only those exercised by the two cases:
 // an invented dilemma is wrong in finance, pressure and skill equally.
 for(const [domain,roles] of Object.entries(brief.READER_ANGLE)){
  for(const [role,value] of Object.entries(roles)){
   assert(value.two.length>35,domain+':'+role);
   assert(!forbiddenAssumption.test(value.two),
    'do not prescribe fictional first/second-option situation: '+domain+':'+role);
   assert(/(?:각각|첫째와 둘째|두 선택)/.test(value.two),
    'compare BOTH actual buyer options: '+domain+':'+role);
  }
 }
 for(const c of cases){
  for(const readerDecision of c.questions){
   const input={...c.base,readerDecision};
   const packet=facts.build(input,2027);
   assert.equal(packet.status,'ready');
   const src=Object.fromEntries(bindings.build(packet).map(v=>[v.id,v]));
   const proof=hour.build(packet,src);
   assert.equal(proof.readerDomain,c.domain);
   assert.equal(proof.wholeNatalCategoryDistinct,true);
   const meaning=pair.build(packet,src,proof);
   assert.equal(meaning.elementDirection,c.direction);
   const contract=brief.build(proof,readerDecision);
   assert.equal(contract.twoBuyerChoices,true);
   assert(!forbiddenAssumption.test(contract.verifiedRoleReaderContrast));
   assert.equal(contract.actualBuyerBehaviorObserved,false);
   const p={stage:'body',facts:packet,requestedSections:['saju_core'],
    analysisGuidance:{...guidance.forRequest(['saju_core'],packet.person.mbti),
     editorialBlueprint:guidance.preflight(packet)}};
   const compiled=writer.compile(p);
   const first=compiled.task.chapters.saju_core;
   assert.equal(first.coreReaderChoiceContext.text,readerDecision);
   assert(first.coreReaderChoiceContext.writerBoundary
    .includes(contract.verifiedRoleReaderContrast),
    'actual model must see the revised fact-only buyer question');
   assert(first.coreReaderChoiceContext.writerBoundary
    .includes(meaning.symbolicQuestion),
    'actual model must see chart-dependent hour-to-hour relation');
   const strict=writer.schema(p,wire.schemaFor(p,schema));
   const slot=strict.properties.chapters.properties.saju_core
    .properties.paragraphs.properties.temperament.anyOf[0];
   assert(slot.properties.text.description.includes(meaning.symbolicQuestion));
   assert.deepEqual(slot.properties.basis.properties.refs.items.enum,proof.sourceRefs);
   assert.equal(precharge.inspect(input).customerSaleApproved,false);
   count++;
  }
 }
 assert.equal(count,4);
 assert.equal(paidCalls,0);
 console.log('PASS work82 six verified-role editorial instructions and four actual normal-paid buyer requests avoid invented A/B facts; release HOLD; 0 paid calls');
}finally{global.fetch=oldFetch;}
