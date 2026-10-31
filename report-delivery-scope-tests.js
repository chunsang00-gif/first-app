'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const selection=require('./report-chapter-selection');
const guidance=require('./report-analysis-guidance');
const outline=require('./report-outline');
const delivery=require('./report-delivery-scope');
const release=require('./report-release-gate');
const group=[
 ['saju_core','mbti_contradiction'],['decision','stress'],
 ['money','career'],['relationship','integrated_judgment'],
 ['year_2027','year_2027_money'],['year_2027_career','year_2027_relationship']
];
const samples=[
 ['lunar','1982-11-24',9,20],
 ['solar','1994-07-15',10,19],
 ['solar','1994-01-15',10,21],
 ['solar','1994-05-15',11,20]
];
for(const [calendar,birthDate,chapterCount,bound] of samples){
 const packet=facts.build({calendar,birthDate,
  birthTime:birthDate==='1994-05-15'?'20:20':'14:20',
  gender:'male',mbti:'ISFP',leapMonth:false},2027);
 assert.equal(packet.status,'ready');
 const blueprint=guidance.preflight(packet),coverage=selection.select(group,blueprint);
 assert.equal(coverage.plannedIds.length,chapterCount);
 const sections=coverage.plannedIds.map(id=>{
  const anchor=blueprint[id].anchorTopic;
  return {id,bodyTopics:[anchor],bodyLabels:['근거가 확인된 문단'],
   body:['입력 출생 자료에서 확인된 전통적 분류를 설명합니다.'],
   title:id,keyJudgment:'연구용 예시이며 실제 행동을 입증하지 않습니다.',
   evidence:['출생 계산 자료 예시']};
 });
 const report={sections,cover:null,finalJudgment:null};
 const result=delivery.inspect({report,packet,coverage});
 assert.equal(result.status,'verified-structural-counts');
 assert.equal(result.actualDeliveredChapters,chapterCount);
 assert.equal(result.actualDeliveredTopics,chapterCount);
 assert.equal(result.evidenceEligibleTopicUpperBound,bound);
 assert.equal(result.omittedEligibleTopicCount,bound-chapterCount);
 assert.equal(result.saleApproved,false);
 assert.equal(result.independentHumanReviewCompleted,false);
 assert.equal(result.byChapter.reduce((n,r)=>n+r.actualDeliveredTopics,0),
  result.actualDeliveredTopics);
 const releaseResult=release.assess({report,packet,coverage,
  qa:{pass:false,errors:['unreviewed synthetic text']}});
 assert.equal(releaseResult.deliveryScope.actualDeliveredTopics,chapterCount);
 assert.equal(releaseResult.deliveryScope.status,'verified-structural-counts');
 assert.equal(releaseResult.releaseVerdict,'not-approved');
 const second=structuredClone(report);
 const firstOptional=coverage.plannedIds.find(id=>Object.keys(outline.topics[id])
  .filter(x=>blueprint[id].topicTasks[x].mode!=='state-limits').length>1);
 assert(firstOptional);
 const opts=Object.keys(outline.topics[firstOptional]).filter(x=>
  blueprint[firstOptional].topicTasks[x].mode!=='state-limits');
 const section=second.sections.find(x=>x.id===firstOptional);
 section.bodyTopics=Object.keys(outline.topics[firstOptional]).filter(x=>
  opts.includes(x)).slice(0,2);
 section.body=['첫 문단','둘째 문단'];
 section.bodyLabels=['첫 제목','둘째 제목'];
 const richer=delivery.inspect({report:second,packet,coverage});
 assert.equal(richer.status,'verified-structural-counts');
 assert.equal(richer.actualDeliveredTopics,chapterCount+1);
 const impossible=structuredClone(report);
 const money=impossible.sections.find(x=>x.id==='money');
 if(money){
  money.bodyTopics.push('risk');money.body.push('금전 손실을 예언합니다.');
  money.bodyLabels.push('허위 주제');
  const rejected=delivery.inspect({report:impossible,packet,coverage});
  assert.equal(rejected.status,'inconsistent');
  assert(rejected.errors.some(e=>e==='money:unsupported-topic-delivered:risk'));
  const gated=release.assess({report:impossible,packet,coverage,qa:{pass:true}});
  assert(gated.failedTechnicalChecks.includes('inconsistent-delivered-topic-scope'));
  assert.equal(gated.releaseVerdict,'not-approved');
 }
 const removed=structuredClone(report);
 removed.sections.shift();
 assert(delivery.inspect({report:removed,packet,coverage}).errors
  .includes('delivered-chapters-do-not-match-preflight-plan'));
 const noAnchor=structuredClone(report);
 const selected=noAnchor.sections[0],primary=blueprint[selected.id].anchorTopic;
 selected.bodyTopics=[...Object.keys(outline.topics[selected.id]).filter(x=>x!==primary)].slice(0,1);
 assert(delivery.inspect({report:noAnchor,packet,coverage}).errors
  .includes(selected.id+':calculated-anchor-omitted'));
 const duplicates=structuredClone(report);
 duplicates.sections[0].bodyTopics=['strength','strength'];
 duplicates.sections[0].body=['a','b'];
 duplicates.sections[0].bodyLabels=['a','b'];
 assert(delivery.inspect({report:duplicates,packet,coverage}).status==='inconsistent');
 const nonsense=structuredClone(report);
 nonsense.sections[0].body[0]='  ';
 assert(delivery.inspect({report:nonsense,packet,coverage}).errors
  .includes(nonsense.sections[0].id+':retained-paragraph-content-invalid'));
}
assert.equal(delivery.inspect({}).status,'unavailable');
console.log('PASS final user-delivered chapters/paragraphs match actual evidence plan, optional omissions retained, fake risk and invented topics rejected, machine approval still false; no model calls');
