'use strict';
// Independent natal day-branch relation. A computed pair never proves a
// quarrel, breakup, personality or any real past/future relationship.
const relations=require('./report-branch-relations');
const POS=Object.freeze({year:'태어난 해',month:'태어난 달',hour:'태어난 시간'});
function matching(chart,clashes){
 if(!chart?.day||!chart?.month||!Array.isArray(clashes))return [];
 const expected=relations.natal(chart).pairs.filter(x=>x.type==='충'&&x.positions.includes('day'));
 const verified=expected.filter(pair=>clashes.some(row=>row.type==='충'&&
  row.branches===pair.branches&&Array.isArray(row.positions)&&
  JSON.stringify(row.positions)===JSON.stringify(pair.positions)));
 const dayRows=clashes.filter(row=>Array.isArray(row?.positions)&&
  row.positions.includes('day'));
 // No partial day evidence, or extra fabricated pairs, may enable a
 // premium reading. A natal clash on other positions is allowed.
 return verified.length===expected.length&&dayRows.length===expected.length?
  verified:[];
}
function build({chapterId,topicId,topic,source,chart}={}){
 const ref='facts.natalClashes';
 if(chapterId!=='relationship'||topicId!=='conflict'||
    topic?.mode!=='use-primary'||!topic.citableFacts?.some(x=>x.id===ref))
  return null;
 const clashes=source?.[ref],actual=matching(chart,clashes);
 if(!actual.length)return null;
 const daySource=clashes.filter(x=>Array.isArray(x?.positions)&&x.positions.includes('day'));
 if(daySource.length!==actual.length||daySource.some(x=>
   !actual.some(y=>y.branches===x.branches&&
    JSON.stringify(y.positions)===JSON.stringify(x.positions))))return null;
 const direct=actual.map(row=>{
  const other=row.positions.find(x=>x!=='day');
  return Object.freeze({between:row.positions,branches:row.branches,
   natalDayBranch:chart.day[1],otherPosition:other,
   otherBranch:chart[other][1],otherReaderPosition:POS[other]});
 });
 if(direct.some(x=>!x.otherReaderPosition))return null;
 return Object.freeze({
  kind:'paid-natal-day-branch-clash-reader-v1',
  chapter:chapterId,topic:topicId,sourceRef:ref,
  directPairs:Object.freeze(direct),
  priorityAssessed:false,actualConflictObserved:false,
  actualRelationshipOutcomePredicted:false,
  independentQuestion:'출생일을 나타내는 자리와 '+direct.map(x=>
   x.otherReaderPosition).join('·')+
   ' 자리 사이에 충이라는 전통 관계표의 마주 보는 배치가 계산되었다. '+
   '이는 실제로 누구와 다투었거나 다투게 된다는 뜻이 아니다. '+
   '서로 다른 요구를 동시에 받는 가상의 관계 상황에서 각각의 조건을 구별하는 질문으로만 설명한다. '+
   '출생일의 숨은 글자로 이미 설명한 친밀감이나 표현 방식의 결과를 재사용하지 않는다. '+
   '여러 관계가 겹치면 어느 쪽이 강하거나 먼저 일어나는지 확정하지 않는다.'
 });
}
module.exports={build,matching};
