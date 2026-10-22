'use strict';
// QA-only immovable calculated interpretation basis. The AI is NOT allowed
// to rewrite the four positional classifications in the evidence field.
// The separate reader text still requires independent editorial review.
const REQUIRED=[
 ['natal.year.stem','연간','연간'],
 ['natal.month.stem','월간','월간'],
 ['natal.day.stem','일간','일간'],
 ['natal.hour.stem','시간','시간']
];
function fromPayload(payload){
 const source=payload?.source,topic=payload?.task?.chapters?.saju_core?.topics?.natal_depth;
 const permitted=new Set(topic?.citableFacts?.map(x=>x.id)||[]);
 if(!source||!topic||!permitted.has('facts.stemConnections'))
  throw Error('QA_DEPTH_FACT_LOCK_SOURCE_MISSING');
 const rows=[];
 for(const [id,label,position] of REQUIRED){
  const r=source[id];
  if(!permitted.has(id)||!r||r.id!==id||r.position!==position||
     r.layer!=='천간'||typeof r.stem!=='string'||r.stem.length!==1||
     typeof r.tenGod!=='string'||!r.tenGod||
     r.interpretationScope!=='traditional-symbol-only'||
     r.observedBehavior!==false||
     (id==='natal.day.stem'&&r.tenGod!=='일간'))
   throw Error('QA_DEPTH_FACT_LOCK_UNVERIFIED:'+id);
  rows.push({id,stem:r.stem,tenGod:r.tenGod,label});
 }
 const literal='검증된 출생 글자: '+rows.map(r=>
  r.label+' '+r.stem+'('+r.tenGod+')').join(' · ')+
  '. 네 출생 위치는 각각 다른 계산 출처이고, 관찰된 성격이나 미래 사건이 아닙니다.';
 return {literal,rows,sourceRefs:rows.map(r=>r.id)};
}
module.exports={fromPayload};
