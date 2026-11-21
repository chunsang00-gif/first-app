'use strict';
// OFFLINE. Reconcile claims of "a new paid hour category" with the full
// natal chart, NOT just the four roles shown in FREE. No model/merchant IO.
const assert=require('node:assert/strict');
const core=require('./report-facts-node');
const audit=require('./report-paid-core-hour-cross-pillar-audit');
const precharge=require('./report-paid-core-precharge-value');
const qualified=require('./report-adaptive-v1-offline-cost-plan').qualifiedSample;
const topics={
 skill:'기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.',
 money:'적금을 유지할지 대출을 상환할지 고민입니다.',
 pressure:'업무 압박 때문에 마감 일정을 조정할지 업무 요청을 거절할지 고민입니다.'
};
const source=core.build(qualified,2027);
assert.equal(source.status,'ready');
assert.deepEqual(source.chart,{year:'壬戌',month:'癸丑',day:'乙未',hour:'癸未'});
const review=audit.inspect(source);
assert.equal(review.status,'same-exact-hour-symbol-already-in-other-natal-position');
assert.equal(review.selectedRef,'natal.hour.hidden.丁');
assert.equal(review.stem,'丁');
assert.equal(review.role,'식신');
assert.equal(review.wholeNatalCategoryIsNew,false);
assert.deepEqual(review.sameExactStemOtherNatalPositions.map(x=>x.sourceId),[
 'natal.year.hidden.丁','natal.day.hidden.丁'
]);
assert.equal(review.salesApproved,false);
assert.equal(review.separatePaidValueEstablished,false);
assert.equal(review.locationSpecificClassicalPriorityProved,false);
assert.equal(precharge.inspect(qualified).eligible,true,
 'old precharge is technically FREE-visible novelty only; review must not relabel it as full-natal uniqueness');
let total=0,hourCandidates=0,otherNatalRepeat=0,notExactRepeat=0,technicalQualified=0;
for(const year of [1982,1994,2006,2018])
 for(const month of [1,4,7,10])
  for(const birthTime of ['02:20','14:20'])
   for(const [domain,readerDecision] of Object.entries(topics)){
    const packet=core.build({calendar:'solar',
     birthDate:year+'-'+String(month).padStart(2,'0')+'-15',
     gender:'male',mbti:'ISFP',birthTime,readerDecision},2027);
    assert.equal(packet.status,'ready');
    const found=audit.inspect(packet);
    total++;
    assert.equal(found.salesApproved,false);
    assert.equal(found.modelCalls,0);
    if(found.status==='no-hour-candidate')continue;
    hourCandidates++;
    const repeated=found.sameExactStemOtherNatalPositions.length>0;
    if(repeated)otherNatalRepeat++;else notExactRepeat++;
    assert.equal(found.wholeNatalCategoryIsNew,!repeated);
    assert.equal(found.eligibleForNewPaidRoleClaim,!repeated);
    assert(found.sameExactStemOtherNatalPositions.every(row=>
      row.stem===found.stem&&row.tenGod===found.role&&
      row.sourceId!==found.selectedRef));
    // The audit is not licensing a sale even for genuinely novel symbols.
    assert.equal(found.separatePaidValueEstablished,false);
   }
assert.equal(total,96);
assert.equal(hourCandidates,otherNatalRepeat+notExactRepeat);
assert(hourCandidates>0&&otherNatalRepeat>0&&notExactRepeat>0);
assert.equal(technicalQualified,0); // no revenue or model approval derived here
console.log('HOUR_ALL_NATAL_SYMBOL_AUDIT='+JSON.stringify({
 totalSyntheticQuestions:total,sourceHourCandidates:hourCandidates,
 exactSymbolRepeatedInOtherNatalPillar:otherNatalRepeat,
 noOtherExactStemFound:notExactRepeat,
 legacy1982SkillFirstChapter:{sameStemAt:[
 'natal.year.hidden.丁','natal.day.hidden.丁'],
 technicalPrechargePassButNoNewNATALCategory:true},
 actualPaidManuscriptsValidated:0,modelCalls:0,
 merchantCalls:0,newSaleApproved:false
}));
