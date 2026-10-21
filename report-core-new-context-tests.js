'use strict';
// Fixed real-calendar tests for ten distinct month source-pair editorial candidates.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const core=require('./report-core-knowledge-engine');
const contrast=require('./report-chart-contrast');
const examples=[
 {date:'1988-12-15',month:'甲子',a:'비견',b:'정인',
  relationship:'hidden-generates-visible',season:'resource',
  rule:'month-pair-bigeon-jeongin-ja-v1'},
 {date:'1982-08-15',month:'戊申',a:'편인',b:'비견',
  relationship:'visible-generates-hidden',season:'same-element',
  rule:'month-pair-pyeonin-bigeon-sin-v1'},
 {date:'1994-09-15',month:'癸酉',a:'정인',b:'정관',
  relationship:'hidden-generates-visible',season:'control-on-day',
  rule:'month-pair-jeongin-jeonggwan-yu-v1'},
 {date:'2000-02-15',month:'戊寅',a:'정관',b:'상관',
  relationship:'hidden-controls-visible',season:'output',
  rule:'month-pair-jeonggwan-sanggwan-in-v1'},
 {"date":"1982-11-15","month":"辛亥","a":"정인","b":"비견","relationship":"visible-generates-hidden","season":"same-element","rule":"month-pair-jeongin-bigeon-hai-v1"},
 {"date":"1982-06-15","month":"丙午","a":"정인","b":"편인","relationship":"same-element","season":"resource","rule":"month-pair-jeongin-pyeonin-o-v1"},
 {"date":"1982-03-15","month":"癸卯","a":"편관","b":"편인","relationship":"visible-generates-hidden","season":"resource","rule":"month-pair-pyeongwan-pyeonin-myo-v1"},
 {"date":"1982-05-15","month":"乙巳","a":"정관","b":"편인","relationship":"visible-generates-hidden","season":"resource","rule":"month-pair-jeonggwan-pyeonin-sa-v1"},
 {"date":"1982-10-15","month":"庚戌","a":"겁재","b":"정인","relationship":"hidden-generates-visible","season":"transitional-month-unresolved","rule":"month-pair-geopjae-jeongin-sul-v1"},
 {"date":"1982-07-15","month":"丁未","a":"편인","b":"비견","relationship":"visible-generates-hidden","season":"transitional-month-unresolved","rule":"month-pair-pyeonin-bigeon-mi-v1"}
];
const readers=new Set();
for(const x of examples){
 const birth={calendar:'solar',birthDate:x.date,birthTime:'14:20',gender:'male',mbti:'ISFP'};
 const packet=facts.build(birth,2027);
 assert.equal(packet.status,'ready');
 assert.equal(packet.chart.month,x.month);
 const result=core.compile(packet);
 assert.equal(result.status,'draft-for-human-review');
 assert.equal(result.ruleId,x.rule);
 assert.deepEqual([result.scope.visibleTenGod,result.scope.hiddenTenGod],[x.a,x.b]);
 assert.equal(result.scope.monthElementRelation,x.relationship);
 assert.equal(result.scope.seasonToDayRelation,x.season);
 assert.equal(contrast.build(packet).monthTenGodContext.elementLink.kind,x.relationship);
 assert.equal(result.review.readerMechanical.mechanicalPass,true);
 assert.deepEqual(result.scope.sourceIds,['natal.month.stem',
  'natal.month.hidden.'+packet.facts.structuralEvidence.monthCommand.mainHiddenStem]);
 assert.equal(result.review.natalContext,null);
 if(x.date==='1988-12-15')
  assert.equal(result.review.hourContext?.ruleId,'hour-ja-jeonggwan-contrast-v1');
 else assert.equal(result.review.hourContext,null);
 assert.equal(result.review.seasonRootContext,null);
 assert.equal(result.compositionPlan.editorialOutline.customerReady,false);
 assert.equal(result.releaseVerdict,'not-approved');
 assert.equal(result.review.humanReviewRequired,true);
 assert.equal(result.apiCalls,0);
 readers.add(JSON.stringify(result.reader));
 const mbtiChange=core.compile(facts.build({...birth,mbti:'INTJ'},2028));
 assert.deepEqual(result.reader,mbtiChange.reader);
}
assert.equal(readers.size,10,'all ten additional month-context manuscripts must differ');
console.log('PASS ten real-calendar source-specific editorial candidates, 6 newly supported month branches, no paid API');
