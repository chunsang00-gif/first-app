'use strict';

// The canonical payload and schema have already passed provider preflight.
// Keep every source referenced by the instructions or output contract. A
// topic can refer to an existing source by ID instead of copying its row.
function project(prompt,payload,schema){
 const ids=prompt?.requestedSections;
 if(prompt?.paidCompactDomainContext!==true||prompt.stage!=='body'||
    !Array.isArray(ids)||!ids.length||!ids.every(id=>id==='money'||id==='career'||id==='relationship'))
  return payload;
 const task=structuredClone(payload.task);
 const referenced=JSON.stringify([task,schema]);
 const source=Object.fromEntries(Object.entries(payload.source)
  .filter(([id])=>referenced.includes(id)));
 for(const id of ids){
  for(const topic of Object.values(task.chapters[id].topics)){
   if(!Array.isArray(topic.citableFacts)||
      topic.citableFacts.some(ref=>!Object.hasOwn(source,ref.id)))
    throw Error('PAID_DOMAIN_COMPACT_CITATION_NOT_FOUND');
   topic.citableFacts=topic.citableFacts.map(({id})=>({id}));
  }
 }
 return {...payload,source,task,
  sourceLookup:'문단에서 사용할 수 있는 출처는 해당 문단의 citableFacts에 있는 ID로 제한한다. 글자의 위치와 뜻은 source에서 같은 ID로 한 번만 찾아 읽는다.'};
}

module.exports={project};
